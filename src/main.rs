mod embedded;
mod fetcher;

use axum::extract::State;
use axum::routing::get;
use axum::{Json, Router};
use tokio::net::TcpListener;

const LISTEN_ADDR: &str = "0.0.0.0:3000";

async fn map_points(State(shared): State<fetcher::SharedData>) -> Json<fetcher::AggregatedData> {
    Json(shared.read().await.clone())
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "tokenswitch=info".into()),
        )
        .init();

    let shared = fetcher::new_shared_data();

    // Start background fetcher
    tokio::spawn(fetcher::run(shared.clone()));

    let app = Router::new()
        .route("/api/map-points", get(map_points))
        .fallback(get(embedded::static_handler))
        .with_state(shared);

    tracing::info!("listening on {LISTEN_ADDR}");
    let listener = TcpListener::bind(LISTEN_ADDR).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
