use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SendVerificationEmailRequest {
    pub email: String,
    pub purpose: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SendVerificationEmailResponse {
    pub ok: bool,
    pub cooldown_secs: i64,
    pub expires_in_secs: i64,
    pub masked_destination: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VerifyEmailCodeRequest {
    pub email: String,
    pub purpose: String,
    pub code: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct VerifyEmailCodeResponse {
    pub ok: bool,
    pub verified: bool,
    pub email: String,
    pub purpose: String,
    pub verification_token: String,
    pub verification_token_expires_at: i64,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RedeemVerificationTokenRequest {
    pub verification_token: String,
    pub purpose: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RedeemVerificationTokenResponse {
    pub ok: bool,
    pub email: String,
    pub purpose: String,
    pub verified_at: i64,
}
