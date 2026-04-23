mod api;
mod config;
mod embedded;
mod error;
mod fetcher;
mod models;
mod store;

use std::sync::Arc;

use resend_rs::Resend;
use tokio::net::TcpListener;

const DEFAULT_PORT: u16 = 3000;

#[derive(Clone)]
pub struct AppState {
    pub shared: fetcher::SharedData,
    pub config: config::Config,
    pub store: store::AppStore,
    pub resend: Option<Arc<Resend>>,
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

    let config = config::Config::from_env();
    let shared = fetcher::new_shared_data();
    let store = store::AppStore::new(&config).expect("failed to initialize sqlite store");
    let resend = config
        .resend_api_key
        .as_deref()
        .map(Resend::new)
        .map(Arc::new);

    // Start background fetcher
    tokio::spawn(fetcher::run(shared.clone()));

    let state = AppState {
        shared,
        config,
        store,
        resend,
    };

    let app = api::router(state).fallback(axum::routing::get(embedded::static_handler));

    let addr = format!("0.0.0.0:{port}");
    tracing::info!("listening on {addr}");
    let listener = TcpListener::bind(&addr).await.unwrap();
    axum::serve(
        listener,
        app.into_make_service_with_connect_info::<std::net::SocketAddr>(),
    )
    .await
    .unwrap();
}
