use std::sync::Arc;
use std::time::Duration;

use serde::{Deserialize, Serialize};
use tokio::sync::RwLock;
use tokio::time;

include!(concat!(env!("OUT_DIR"), "/regions.rs"));

const POLL_INTERVAL: Duration = Duration::from_secs(60);
const REQUEST_TIMEOUT: Duration = Duration::from_secs(15);

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LatLonPoint {
    pub lat: f64,
    pub lon: f64,
}

#[derive(Debug, Clone, Serialize)]
pub struct ServerPoint {
    pub lat: f64,
    pub lon: f64,
    pub region: String,
    pub url: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct RegionInfo {
    pub region: String,
    pub url: String,
}

#[derive(Debug, Clone, Serialize, Default)]
pub struct AggregatedData {
    pub regions: Vec<RegionInfo>,
    pub servers: Vec<ServerPoint>,
    pub clients: Vec<LatLonPoint>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct RegionResponse {
    server: Option<LatLonPoint>,
    #[serde(default)]
    clients: Vec<LatLonPoint>,
}

pub type SharedData = Arc<RwLock<AggregatedData>>;

pub fn new_shared_data() -> SharedData {
    Arc::new(RwLock::new(AggregatedData::default()))
}

pub async fn run(shared: SharedData) {
    let client = reqwest::Client::builder()
        .timeout(REQUEST_TIMEOUT)
        .build()
        .expect("failed to build HTTP client");

    let mut interval = time::interval(POLL_INTERVAL);

    loop {
        interval.tick().await;
        let result = fetch_all(&client).await;
        if !result.servers.is_empty() || !result.clients.is_empty() {
            *shared.write().await = result;
        }
    }
}

async fn fetch_all(client: &reqwest::Client) -> AggregatedData {
    let futures: Vec<_> = REGIONS
        .iter()
        .map(|(region, base_url)| {
            let client = client.clone();
            let region = region.to_string();
            let base_url = base_url.to_string();
            let url = format!("https://{base_url}/v1/public/map-points");
            async move {
                let resp = client.get(&url).send().await?;
                let data: RegionResponse = resp.json().await?;
                Ok::<_, reqwest::Error>((region, base_url, data))
            }
        })
        .collect();

    let results = futures::future::join_all(futures).await;

    let mut aggregated = AggregatedData {
        regions: REGIONS
            .iter()
            .map(|(region, base_url)| RegionInfo {
                region: region.to_string(),
                url: format!("https://{base_url}"),
            })
            .collect(),
        ..Default::default()
    };

    for result in results {
        match result {
            Ok((region, base_url, data)) => {
                if let Some(server) = data.server {
                    aggregated.servers.push(ServerPoint {
                        lat: server.lat,
                        lon: server.lon,
                        region: region.clone(),
                        url: format!("https://{base_url}"),
                    });
                }
                aggregated.clients.extend(data.clients);
            }
            Err(e) => {
                tracing::warn!("region fetch failed: {e}");
            }
        }
    }

    aggregated
}
