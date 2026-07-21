import type { Region } from "./types";

/** Build the official one-line install command. Router URL equals the region base URL. */
export function buildInstallCommand(region: Region, email: string, password: string): string {
  const url = region.url.replace(/\/$/, "");
  const mail = email.trim() || "<Email>";
  const pass = password.trim() || "<Password>";
  return `curl -SsL ${url}/install-client.sh | bash -s ${url} ${mail} ${pass}`;
}

export function installCommandComplete(email: string, password: string): boolean {
  return email.trim().length > 0 && password.trim().length > 0;
}
