/** Browser fetch that never throws — network/CORS failures return null. */
export async function safeFetch(url: string, init?: RequestInit): Promise<Response | null> {
  try {
    return await fetch(url, init);
  } catch {
    return null;
  }
}
