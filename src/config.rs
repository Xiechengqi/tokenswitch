use std::env;
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Clone)]
pub struct Config {
    pub resend_api_key: Option<String>,
    pub resend_from: Option<String>,
    pub resend_reply_to: Option<String>,
    pub service_api_key: Option<String>,
    pub verify_code_ttl_secs: i64,
    pub verify_code_cooldown_secs: i64,
    pub verify_max_attempts: i64,
    pub verify_email_hourly_limit: i64,
    pub verify_ip_hourly_limit: i64,
    pub verification_token_ttl_secs: i64,
    pub db_path: PathBuf,
}

impl Config {
    pub fn from_env() -> Self {
        Self {
            resend_api_key: env::var("TOKENSWITCH_RESEND_API_KEY").ok(),
            resend_from: env::var("TOKENSWITCH_RESEND_FROM").ok(),
            resend_reply_to: env::var("TOKENSWITCH_RESEND_REPLY_TO").ok(),
            service_api_key: env::var("TOKENSWITCH_API_KEY").ok(),
            verify_code_ttl_secs: parse_env_i64("TOKENSWITCH_VERIFY_CODE_TTL_SECS", 5 * 60),
            verify_code_cooldown_secs: parse_env_i64("TOKENSWITCH_VERIFY_CODE_COOLDOWN_SECS", 60),
            verify_max_attempts: parse_env_i64("TOKENSWITCH_VERIFY_MAX_ATTEMPTS", 5),
            verify_email_hourly_limit: parse_env_i64("TOKENSWITCH_VERIFY_EMAIL_HOURLY_LIMIT", 5),
            verify_ip_hourly_limit: parse_env_i64("TOKENSWITCH_VERIFY_IP_HOURLY_LIMIT", 20),
            verification_token_ttl_secs: parse_env_i64(
                "TOKENSWITCH_VERIFICATION_TOKEN_TTL_SECS",
                15 * 60,
            ),
            db_path: env::var("TOKENSWITCH_DB_PATH")
                .map(PathBuf::from)
                .unwrap_or_else(|_| default_db_path()),
        }
    }

    pub fn ensure_storage(&self) -> std::io::Result<()> {
        if let Some(parent) = self.db_path.parent() {
            fs::create_dir_all(parent)?;
        }
        Ok(())
    }
}

fn parse_env_i64(key: &str, default: i64) -> i64 {
    env::var(key)
        .ok()
        .and_then(|value| value.parse::<i64>().ok())
        .unwrap_or(default)
}

fn default_db_path() -> PathBuf {
    env::var_os("HOME")
        .map(PathBuf::from)
        .map(|home| home.join(".config/tokenswitch/tokenswitch.db"))
        .unwrap_or_else(|| PathBuf::from("./tokenswitch.db"))
}
