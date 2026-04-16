mod embedded;
mod fetcher;

use axum::extract::State;
use axum::routing::get;
use axum::{Json, Router};
use tokio::net::TcpListener;

const DEFAULT_PORT: u16 = 3000;

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

    let port = std::env::args()
        .nth(1)
        .or_else(|| std::env::var("PORT").ok())
        .and_then(|s| s.parse::<u16>().ok())
        .unwrap_or(DEFAULT_PORT);

    let shared = fetcher::new_shared_data();

    // Start background fetcher
    tokio::spawn(fetcher::run(shared.clone()));

    let app = Router::new()
        .route("/api/map-points", get(map_points))
        .fallback(get(embedded::static_handler))
        .with_state(shared);

    let addr = format!("0.0.0.0:{port}");
    tracing::info!("listening on {addr}");
    let listener = TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
