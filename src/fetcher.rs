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

#[derive(Debug, Clone, Serialize)]
pub struct ClientPoint {
    pub lat: f64,
    pub lon: f64,
    pub region: String,
    pub count: usize,
}

#[derive(Debug, Clone, Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AggregatedData {
    pub regions: Vec<RegionInfo>,
    pub servers: Vec<ServerPoint>,
    pub client_count: usize,
    pub clients: Vec<ClientPoint>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct RegionClientPoint {
    lat: f64,
    lon: f64,
    #[serde(default = "default_client_point_count")]
    count: usize,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct RegionResponse {
    server: Option<LatLonPoint>,
    #[serde(default)]
    client_count: usize,
    #[serde(default)]
    clients: Vec<RegionClientPoint>,
}

fn default_client_point_count() -> usize {
    1
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
                aggregated.client_count += if data.client_count > 0 {
                    data.client_count
                } else {
                    data.clients.iter().map(|c| c.count).sum()
                };
                aggregated
                    .clients
                    .extend(data.clients.into_iter().map(|c| ClientPoint {
                        lat: c.lat,
                        lon: c.lon,
                        region: region.clone(),
                        count: c.count,
                    }));
            }
            Err(e) => {
                tracing::warn!("region fetch failed: {e}");
            }
        }
    }

    aggregated
}
