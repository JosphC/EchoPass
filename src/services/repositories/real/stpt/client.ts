import { parseStptEnvelope, type StptVehicle } from './schemas';

export const STPT_VEHICLES_URL = 'https://live.stpt.ro/gtfs-vehicles.php';
const TIMEOUT_MS = 8_000;

async function fetchJson(url: string): Promise<unknown> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`STPT ${res.status} on ${url}`);
    return (await res.json()) as unknown;
  } finally {
    clearTimeout(timer);
  }
}

/** Live vehicles from STPT Timisoara (unofficial live.stpt.ro mirror). Throws on network/schema errors. */
export async function fetchStptVehicles(): Promise<StptVehicle[]> {
  const envelope = parseStptEnvelope(await fetchJson(STPT_VEHICLES_URL));
  if (envelope.data.is_stale) throw new Error('STPT feed is stale');
  return envelope.data.vehicles;
}
