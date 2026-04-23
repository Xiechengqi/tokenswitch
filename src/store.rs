use std::fmt::Write as _;
use std::sync::{Arc, Mutex};

use chrono::{DateTime, Duration, Utc};
use rand::Rng;
use resend_rs::types::CreateEmailBaseOptions;
use resend_rs::Resend;
use rusqlite::{params, Connection, OptionalExtension};
use sha2::{Digest, Sha256};
use uuid::Uuid;

use crate::config::Config;
use crate::error::{AppError, AppResult};
use crate::models::{
    SendVerificationEmailRequest, SendVerificationEmailResponse, VerifyEmailCodeRequest,
    VerifyEmailCodeResponse,
};

#[derive(Clone)]
pub struct AppStore {
    conn: Arc<Mutex<Connection>>,
}

struct EmailChallenge {
    id: String,
    code_hash: String,
    attempt_count: i64,
}

impl AppStore {
    pub fn new(config: &Config) -> AppResult<Self> {
        config
            .ensure_storage()
            .map_err(|err| AppError::Internal(format!("prepare storage failed: {err}")))?;
        let conn = Connection::open(&config.db_path)
            .map_err(|err| AppError::Internal(format!("open sqlite failed: {err}")))?;
        conn.execute_batch(
            "PRAGMA journal_mode = WAL;
             PRAGMA foreign_keys = ON;
             CREATE TABLE IF NOT EXISTS email_verification_challenges (
                 id TEXT PRIMARY KEY,
                 email_normalized TEXT NOT NULL,
                 purpose TEXT NOT NULL,
                 code_hash TEXT NOT NULL,
                 expires_at TEXT NOT NULL,
                 consumed_at TEXT,
                 attempt_count INTEGER NOT NULL DEFAULT 0,
                 resend_available_at TEXT NOT NULL,
                 created_ip TEXT,
                 created_at TEXT NOT NULL
             );
             CREATE INDEX IF NOT EXISTS idx_email_verification_lookup
                 ON email_verification_challenges(email_normalized, purpose, created_at DESC);
             CREATE INDEX IF NOT EXISTS idx_email_verification_created_at
                 ON email_verification_challenges(created_at DESC);
             CREATE TABLE IF NOT EXISTS email_send_logs (
                 id TEXT PRIMARY KEY,
                 email_type TEXT NOT NULL,
                 to_email TEXT NOT NULL,
                 purpose TEXT NOT NULL,
                 provider_message_id TEXT,
                 status TEXT NOT NULL,
                 error_message TEXT,
                 created_at TEXT NOT NULL
             );
             CREATE INDEX IF NOT EXISTS idx_email_send_logs_created_at
                 ON email_send_logs(created_at DESC);",
        )
        .map_err(|err| AppError::Internal(format!("init sqlite schema failed: {err}")))?;

        Ok(Self {
            conn: Arc::new(Mutex::new(conn)),
        })
    }

    pub async fn send_verification_email(
        &self,
        config: &Config,
        resend: Option<&Resend>,
        input: SendVerificationEmailRequest,
        client_ip: Option<String>,
    ) -> AppResult<SendVerificationEmailResponse> {
        let email = normalize_email(&input.email)?;
        let purpose = normalize_purpose(&input.purpose)?;
        let now = Utc::now();
        {
            let conn = self
                .conn
                .lock()
                .map_err(|_| AppError::Internal("sqlite mutex poisoned".into()))?;
            enforce_send_limits(&conn, config, &email, &purpose, client_ip.as_deref(), now)?;
        }

        let resend = resend.ok_or_else(|| AppError::Internal("resend is not configured".into()))?;
        let code = generate_numeric_code(6);
        let message_id = match send_code_email(resend, config, &email, &purpose, &code).await {
            Ok(message_id) => message_id,
            Err(err) => {
                self.insert_send_log(&email, &purpose, None, "failed", Some(err.to_string()), now)?;
                return Err(err);
            }
        };

        let expires_at = now + Duration::seconds(config.verify_code_ttl_secs);
        let resend_available_at = now + Duration::seconds(config.verify_code_cooldown_secs);
        let code_hash = hash_token(&format!("{email}:{purpose}:{code}"));
        let conn = self
            .conn
            .lock()
            .map_err(|_| AppError::Internal("sqlite mutex poisoned".into()))?;
        conn.execute(
            "UPDATE email_verification_challenges
             SET consumed_at = ?3
             WHERE email_normalized = ?1
               AND purpose = ?2
               AND consumed_at IS NULL",
            params![email, purpose, now.to_rfc3339()],
        )
        .map_err(|err| AppError::Internal(format!("expire old challenges failed: {err}")))?;
        conn.execute(
            "INSERT INTO email_verification_challenges (
                id, email_normalized, purpose, code_hash, expires_at, consumed_at,
                attempt_count, resend_available_at, created_ip, created_at
            ) VALUES (?1, ?2, ?3, ?4, ?5, NULL, 0, ?6, ?7, ?8)",
            params![
                Uuid::new_v4().to_string(),
                email,
                purpose,
                code_hash,
                expires_at.to_rfc3339(),
                resend_available_at.to_rfc3339(),
                client_ip,
                now.to_rfc3339(),
            ],
        )
        .map_err(|err| AppError::Internal(format!("insert email challenge failed: {err}")))?;
        drop(conn);
        self.insert_send_log(&email, &purpose, message_id, "sent", None, now)?;

        Ok(SendVerificationEmailResponse {
            ok: true,
            cooldown_secs: config.verify_code_cooldown_secs,
            expires_in_secs: config.verify_code_ttl_secs,
            masked_destination: mask_email(&email),
        })
    }

    pub async fn verify_email_code(
        &self,
        config: &Config,
        input: VerifyEmailCodeRequest,
    ) -> AppResult<VerifyEmailCodeResponse> {
        let email = normalize_email(&input.email)?;
        let purpose = normalize_purpose(&input.purpose)?;
        let code = normalize_code(&input.code)?;
        let now = Utc::now();

        let conn = self
            .conn
            .lock()
            .map_err(|_| AppError::Internal("sqlite mutex poisoned".into()))?;
        let challenge =
            get_latest_active_challenge(&conn, &email, &purpose, now)?.ok_or_else(|| {
                AppError::Unauthorized("verification code expired or not found".into())
            })?;

        if challenge.attempt_count >= config.verify_max_attempts {
            return Err(AppError::TooManyRequests(
                "too many invalid verification attempts".into(),
            ));
        }

        let expected_hash = hash_token(&format!("{email}:{purpose}:{code}"));
        if challenge.code_hash != expected_hash {
            conn.execute(
                "UPDATE email_verification_challenges
                 SET attempt_count = attempt_count + 1
                 WHERE id = ?1",
                params![challenge.id],
            )
            .map_err(|err| AppError::Internal(format!("increment attempt count failed: {err}")))?;
            return Err(AppError::Unauthorized("invalid verification code".into()));
        }

        conn.execute(
            "UPDATE email_verification_challenges
             SET consumed_at = ?2
             WHERE id = ?1",
            params![challenge.id, now.to_rfc3339()],
        )
        .map_err(|err| AppError::Internal(format!("consume challenge failed: {err}")))?;

        Ok(VerifyEmailCodeResponse {
            ok: true,
            verified: true,
            email,
            purpose,
        })
    }

    fn insert_send_log(
        &self,
        email: &str,
        purpose: &str,
        provider_message_id: Option<String>,
        status: &str,
        error_message: Option<String>,
        now: DateTime<Utc>,
    ) -> AppResult<()> {
        let conn = self
            .conn
            .lock()
            .map_err(|_| AppError::Internal("sqlite mutex poisoned".into()))?;
        conn.execute(
            "INSERT INTO email_send_logs (
                id, email_type, to_email, purpose, provider_message_id, status, error_message, created_at
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            params![
                Uuid::new_v4().to_string(),
                "verification_code",
                email,
                purpose,
                provider_message_id,
                status,
                error_message,
                now.to_rfc3339(),
            ],
        )
        .map_err(|err| AppError::Internal(format!("insert email send log failed: {err}")))?;
        Ok(())
    }
}

async fn send_code_email(
    resend: &Resend,
    config: &Config,
    email: &str,
    purpose: &str,
    code: &str,
) -> AppResult<Option<String>> {
    let from = config
        .resend_from
        .as_deref()
        .ok_or_else(|| AppError::Internal("resend from address is not configured".into()))?;
    let html = format!(
        "<div style=\"font-family:Arial,sans-serif\"><p>Your verification code for <strong>{purpose}</strong> is:</p><p style=\"font-size:28px;font-weight:700;letter-spacing:6px\">{code}</p><p>This code expires in {} minutes.</p><p>If you did not request this code, you can ignore this email.</p></div>",
        (config.verify_code_ttl_secs / 60).max(1)
    );
    let mut message =
        CreateEmailBaseOptions::new(from, [email], "Your TokenSwitch verification code")
            .with_html(&html);
    if let Some(reply_to) = config.resend_reply_to.as_deref() {
        message = message.with_reply(reply_to);
    }
    let response = resend
        .emails
        .send(message)
        .await
        .map_err(|err| AppError::Internal(format!("send verification email failed: {err}")))?;
    Ok(Some(response.id.to_string()))
}

fn enforce_send_limits(
    conn: &Connection,
    config: &Config,
    email: &str,
    purpose: &str,
    client_ip: Option<&str>,
    now: DateTime<Utc>,
) -> AppResult<()> {
    let hour_cutoff = (now - Duration::hours(1)).to_rfc3339();
    if let Some(next_allowed_at) = latest_cooldown(conn, email, purpose)? {
        if next_allowed_at > now {
            return Err(AppError::TooManyRequests(format!(
                "verification email cooldown active, retry in {}s",
                (next_allowed_at - now).num_seconds().max(1)
            )));
        }
    }

    let email_count: i64 = conn
        .query_row(
            "SELECT COUNT(*) FROM email_verification_challenges
             WHERE email_normalized = ?1 AND created_at >= ?2",
            params![email, hour_cutoff],
            |row| row.get(0),
        )
        .map_err(|err| AppError::Internal(format!("count email verifications failed: {err}")))?;
    if email_count >= config.verify_email_hourly_limit {
        return Err(AppError::TooManyRequests(
            "email verification rate limit exceeded".into(),
        ));
    }

    if let Some(ip) = client_ip {
        let ip_count: i64 = conn
            .query_row(
                "SELECT COUNT(*) FROM email_verification_challenges
                 WHERE created_ip = ?1 AND created_at >= ?2",
                params![ip, hour_cutoff],
                |row| row.get(0),
            )
            .map_err(|err| AppError::Internal(format!("count ip verifications failed: {err}")))?;
        if ip_count >= config.verify_ip_hourly_limit {
            return Err(AppError::TooManyRequests(
                "ip verification rate limit exceeded".into(),
            ));
        }
    }

    Ok(())
}

fn latest_cooldown(
    conn: &Connection,
    email: &str,
    purpose: &str,
) -> AppResult<Option<DateTime<Utc>>> {
    conn.query_row(
        "SELECT resend_available_at
         FROM email_verification_challenges
         WHERE email_normalized = ?1
           AND purpose = ?2
         ORDER BY created_at DESC
         LIMIT 1",
        params![email, purpose],
        |row| row.get::<_, String>(0),
    )
    .optional()
    .map_err(|err| AppError::Internal(format!("query cooldown failed: {err}")))?
    .map(|value| parse_dt_sql(&value))
    .transpose()
}

fn get_latest_active_challenge(
    conn: &Connection,
    email: &str,
    purpose: &str,
    now: DateTime<Utc>,
) -> AppResult<Option<EmailChallenge>> {
    conn.query_row(
        "SELECT id, code_hash, attempt_count
         FROM email_verification_challenges
         WHERE email_normalized = ?1
           AND purpose = ?2
           AND consumed_at IS NULL
           AND expires_at >= ?3
         ORDER BY created_at DESC
         LIMIT 1",
        params![email, purpose, now.to_rfc3339()],
        |row| {
            Ok(EmailChallenge {
                id: row.get(0)?,
                code_hash: row.get(1)?,
                attempt_count: row.get(2)?,
            })
        },
    )
    .optional()
    .map_err(|err| AppError::Internal(format!("query active challenge failed: {err}")))
}

fn normalize_email(value: &str) -> AppResult<String> {
    let email = value.trim().to_ascii_lowercase();
    let Some((local, domain)) = email.split_once('@') else {
        return Err(AppError::BadRequest("invalid email".into()));
    };
    if local.is_empty() || domain.is_empty() || !domain.contains('.') || email.len() > 254 {
        return Err(AppError::BadRequest("invalid email".into()));
    }
    Ok(email)
}

fn normalize_purpose(value: &str) -> AppResult<String> {
    let purpose = value.trim().to_ascii_lowercase();
    if purpose.is_empty() || purpose.len() > 64 {
        return Err(AppError::BadRequest("invalid purpose".into()));
    }
    if !purpose
        .chars()
        .all(|ch| ch.is_ascii_alphanumeric() || ch == '_' || ch == '-')
    {
        return Err(AppError::BadRequest("invalid purpose".into()));
    }
    Ok(purpose)
}

fn normalize_code(value: &str) -> AppResult<String> {
    let code = value.trim().to_string();
    if code.len() != 6 || !code.chars().all(|ch| ch.is_ascii_digit()) {
        return Err(AppError::BadRequest(
            "invalid verification code format".into(),
        ));
    }
    Ok(code)
}

fn generate_numeric_code(digits: usize) -> String {
    let mut rng = rand::thread_rng();
    (0..digits)
        .map(|_| char::from(b'0' + rng.gen_range(0..10) as u8))
        .collect()
}

fn hash_token(value: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(value.as_bytes());
    let digest = hasher.finalize();
    let mut output = String::with_capacity(digest.len() * 2);
    for byte in digest {
        let _ = write!(&mut output, "{byte:02x}");
    }
    output
}

fn parse_dt_sql(value: &str) -> AppResult<DateTime<Utc>> {
    DateTime::parse_from_rfc3339(value)
        .map(|dt| dt.with_timezone(&Utc))
        .map_err(|err| AppError::Internal(format!("parse datetime failed: {err}")))
}

fn mask_email(email: &str) -> String {
    let Some((local, domain)) = email.split_once('@') else {
        return email.to_string();
    };
    if local.len() <= 1 {
        return format!("*@{domain}");
    }
    format!("{}***@{domain}", &local[..1])
}
