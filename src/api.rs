use std::net::SocketAddr;

use axum::extract::{ConnectInfo, State};
use axum::http::HeaderMap;
use axum::routing::{get, post};
use axum::{Json, Router};

use crate::error::{AppError, AppResult};
use crate::models::{
    SendVerificationEmailRequest, SendVerificationEmailResponse, VerifyEmailCodeRequest,
    VerifyEmailCodeResponse,
};
use crate::AppState;

pub fn router(state: AppState) -> Router {
    Router::new()
        .route("/api/map-points", get(map_points))
        .route("/v1/verification/email/send", post(send_verification_email))
        .route("/v1/verification/email/verify", post(verify_email_code))
        .with_state(state)
}

async fn map_points(State(state): State<AppState>) -> Json<crate::fetcher::AggregatedData> {
    Json(state.shared.read().await.clone())
}

async fn send_verification_email(
    State(state): State<AppState>,
    headers: HeaderMap,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    Json(input): Json<SendVerificationEmailRequest>,
) -> AppResult<Json<SendVerificationEmailResponse>> {
    authorize(&state, &headers)?;
    let client_ip = forwarded_ip(&headers).or_else(|| Some(addr.ip().to_string()));
    Ok(Json(
        state
            .store
            .send_verification_email(&state.config, state.resend.as_deref(), input, client_ip)
            .await?,
    ))
}

async fn verify_email_code(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(input): Json<VerifyEmailCodeRequest>,
) -> AppResult<Json<VerifyEmailCodeResponse>> {
    authorize(&state, &headers)?;
    Ok(Json(
        state.store.verify_email_code(&state.config, input).await?,
    ))
}

fn authorize(state: &AppState, headers: &HeaderMap) -> AppResult<()> {
    let Some(expected) = state.config.service_api_key.as_deref() else {
        return Ok(());
    };
    let Some(value) = headers.get(axum::http::header::AUTHORIZATION) else {
        return Err(AppError::Unauthorized(
            "missing authorization header".into(),
        ));
    };
    let actual = value
        .to_str()
        .map_err(|_| AppError::Unauthorized("invalid authorization header".into()))?;
    if actual != format!("Bearer {expected}") {
        return Err(AppError::Unauthorized("invalid api key".into()));
    }
    Ok(())
}

fn forwarded_ip(headers: &HeaderMap) -> Option<String> {
    headers
        .get("x-forwarded-for")
        .and_then(|value| value.to_str().ok())
        .and_then(|value| value.split(',').next())
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(ToOwned::to_owned)
}
