use std::env;
use std::fs;
use std::path::Path;
use std::process::Command;

const REGIONS_URL: &str =
    "https://raw.githubusercontent.com/Xiechengqi/cc-switch-router/refs/heads/master/regions";

fn main() {
    let out_dir = env::var("OUT_DIR").unwrap();

    // --- 1. Download and parse regions ---
    let regions_text = fetch_regions().unwrap_or_else(|e| {
        eprintln!("cargo:warning=Failed to fetch regions from URL ({e}), trying local fallback");
        fs::read_to_string("/data/projects/cc-switch-router/regions")
            .or_else(|_| fs::read_to_string("/data/projects/portr-rs/regions"))
            .expect("Failed to load regions from both URL and local fallback")
    });

    let mut entries = Vec::new();
    for line in regions_text.lines() {
        let line = line.trim();
        if line.is_empty() {
            continue;
        }
        if let Some(idx) = line.find(':') {
            let region = &line[..idx];
            let base_url = &line[idx + 1..];
            entries.push(format!("(\"{region}\", \"{base_url}\")"));
        }
    }

    let regions_rs = format!(
        "pub const REGIONS: &[(&str, &str)] = &[{}];\n",
        entries.join(", ")
    );
    fs::write(Path::new(&out_dir).join("regions.rs"), regions_rs).unwrap();

    assert!(
        !entries.is_empty(),
        "No regions found — regions file is empty or malformed"
    );
    println!("cargo:warning=Embedded {} regions", entries.len());

    // --- 2. Build frontend ---
    let frontend_dir = Path::new("frontend");
    if frontend_dir.join("package.json").exists() {
        let status = Command::new("pnpm")
            .args(["install"])
            .current_dir(frontend_dir)
            .status()
            .expect("failed to run pnpm install");
        assert!(status.success(), "pnpm install failed");

        let status = Command::new("pnpm")
            .args(["build"])
            .current_dir(frontend_dir)
            .status()
            .expect("failed to run pnpm build");
        assert!(status.success(), "pnpm build failed");
    }

    // No rerun-if-changed directives: build.rs always re-runs so that
    // regions are freshly fetched from the remote URL on every build.
    // pnpm build is fast on no-op (vite skips if nothing changed).
}

fn fetch_regions() -> Result<String, String> {
    let output = Command::new("curl")
        .args(["-sSfL", "--connect-timeout", "10", REGIONS_URL])
        .output()
        .map_err(|e| format!("curl exec failed: {e}"))?;
    if !output.status.success() {
        return Err(format!("curl failed with {}", output.status));
    }
    String::from_utf8(output.stdout).map_err(|e| format!("invalid utf8: {e}"))
}
