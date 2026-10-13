import * as Location from 'expo-location';
import { nearestStation } from './arrivals';
import { loadStations, normStationText, type Station } from './stations';

export interface LocationPlace {
  id: string;
  name: string;
  subtitle: string;
  lat: number;
  lng: number;
  kind: 'station' | 'poi' | 'address';
  station?: Station;
}

interface LocalPOI {
  id: string;
  name: string;
  keywords: string[];
  subtitle: string;
  lat: number;
  lng: number;
}

const TIMISOARA_POIS: LocalPOI[] = [
  { id: 'poi-c9c', name: 'Cămin 9C', keywords: ['camin 9c', 'cmain 9c', 'complex studentesc', 'c9c', 'caminul 9c', 'caminul c9', 'upt'], subtitle: 'Aleea Studenților / Aleea Sportivilor · Complex', lat: 45.74925, lng: 21.24164 },
  { id: 'poi-c8c', name: 'Cămin 8C', keywords: ['camin 8c', 'c8c', 'caminul 8c', 'caminul c8', 'complex studentesc'], subtitle: 'Aleea Studenților · Complex Studențesc', lat: 45.74903, lng: 21.24117 },
  { id: 'poi-c10c', name: 'Cămin 10C', keywords: ['camin 10c', 'c10c', 'caminul 10c', 'caminul c10', 'complex studentesc'], subtitle: 'Aleea Studenților · Complex Studențesc', lat: 45.74947, lng: 21.24214 },
  { id: 'poi-c11c', name: 'Cămin 11C', keywords: ['camin 11c', 'c11c', 'caminul 11c', 'caminul c11', 'complex studentesc'], subtitle: 'Aleea Studenților · Complex Studențesc', lat: 45.74969, lng: 21.24264 },
  { id: 'poi-c14c', name: 'Cămin 14C', keywords: ['camin 14c', 'c14c', 'caminul 14c', 'caminul c14', 'complex studentesc'], subtitle: 'Aleea Studenților · Complex Studențesc', lat: 45.75040, lng: 21.24184 },
  { id: 'poi-c1c', name: 'Cămin 1C', keywords: ['camin 1c', 'c1c', 'caminul 1c', 'caminul c1', 'complex studentesc'], subtitle: 'Aleea F.C. Ripensia · Complex Studențesc', lat: 45.74698, lng: 21.23970 },
  { id: 'poi-c2c', name: 'Cămin 2C', keywords: ['camin 2c', 'c2c', 'caminul 2c', 'caminul c2', 'complex studentesc'], subtitle: 'Aleea F.C. Ripensia · Complex Studențesc', lat: 45.74776, lng: 21.23895 },
  { id: 'poi-c3c', name: 'Cămin 3C', keywords: ['camin 3c', 'c3c', 'caminul 3c', 'caminul c3', 'complex studentesc'], subtitle: 'Aleea Studenților · Complex Studențesc', lat: 45.74743, lng: 21.23839 },
  { id: 'poi-c4c', name: 'Cămin 4C', keywords: ['camin 4c', 'c4c', 'caminul 4c', 'caminul c4', 'complex studentesc'], subtitle: 'Aleea Studenților · Complex Studențesc', lat: 45.74718, lng: 21.23777 },
  { id: 'poi-c7c', name: 'Cămin 7C', keywords: ['camin 7c', 'c7c', 'caminul 7c', 'caminul c7', 'complex studentesc'], subtitle: 'Aleea Studenților · Complex Studențesc', lat: 45.74656, lng: 21.23582 },
  { id: 'poi-c19c', name: 'Cămin 19C', keywords: ['camin 19c', 'c19c', 'caminul 19c', 'complex studentesc'], subtitle: 'Aleea Studenților · Complex Studențesc', lat: 45.74797, lng: 21.23823 },
  { id: 'poi-c20c', name: 'Cămin 20C', keywords: ['camin 20c', 'c20c', 'caminul 20c', 'complex studentesc'], subtitle: 'Aleea Studenților · Complex Studențesc', lat: 45.74761, lng: 21.23754 },
  { id: 'poi-mv', name: 'Cămine MV (Mihai Viteazu)', keywords: ['camin mv', 'mv1', 'mv2', 'mihai viteazu'], subtitle: 'Bulevardul Mihai Viteazu', lat: 45.74550, lng: 21.23100 },
  { id: 'poi-schaeffler', name: 'Schaeffler România', keywords: ['schaeffler', 'scheffler', 'schaeffler romania', 'fabrica schaeffler'], subtitle: 'Calea Torontalului / Parc Industrial', lat: 45.78250, lng: 21.19850 },
  { id: 'poi-continental-auto', name: 'Continental Automotive', keywords: ['continental automotive', 'conti buziasului', 'continental'], subtitle: 'Calea Buziașului 11 · Zonă Industrială', lat: 45.73260, lng: 21.26124 },
  { id: 'poi-continental-anv', name: 'Continental Anvelope', keywords: ['continental anvelope', 'conti imbroane', 'anvelope'], subtitle: 'Str. Avram Imbroane 9', lat: 45.77496, lng: 21.25585 },
  { id: 'poi-hella', name: 'Hella România', keywords: ['hella', 'hella romania', 'hella ghiroda'], subtitle: 'Gheorghe Lazăr / Calea Lugojului', lat: 45.76800, lng: 21.29500 },
  { id: 'poi-flex', name: 'Flex (Flextronics)', keywords: ['flex', 'flextronics', 'fabrica flex'], subtitle: 'Calea Torontalului · Parc Tehnologic', lat: 45.78600, lng: 21.20200 },
  { id: 'poi-nokia', name: 'Nokia Timișoara', keywords: ['nokia', 'nokia romania', 'nokia campus'], subtitle: 'Bulevardul Republicii 9', lat: 45.74950, lng: 21.21200 },
  { id: 'poi-iulius', name: 'Iulius Town / Iulius Mall', keywords: ['iulius mall', 'iulius town', 'mall iulius', 'iulius'], subtitle: 'Piața Consiliul Europei 2', lat: 45.76638, lng: 21.22839 },
  { id: 'poi-shopping-city', name: 'Shopping City Timișoara', keywords: ['shopping city', 'mall sagului', 'carrefour sagului'], subtitle: 'Calea Șagului 100', lat: 45.72466, lng: 21.19870 },
  { id: 'poi-gara-nord', name: 'Gara de Nord Timișoara', keywords: ['gara de nord', 'gara timisoara', 'cfr gara'], subtitle: 'Str. Gării 2', lat: 45.75076, lng: 21.20727 },
  { id: 'poi-centru', name: 'Piața Victoriei (Centru)', keywords: ['centru', 'piata victoriei', 'opera', 'catedrala'], subtitle: 'Centrul Istoric · Timișoara', lat: 45.75268, lng: 21.22550 },
  { id: 'poi-upt', name: 'Universitatea Politehnica (UPT)', keywords: ['upt', 'politehnica', 'electro', 'mecanica', 'rectorat upt'], subtitle: 'Piața Victoriei / B-dul V. Pârvan', lat: 45.75320, lng: 21.22680 },
  { id: 'poi-uvt', name: 'Universitatea de Vest (UVT)', keywords: ['uvt', 'universitatea de vest', 'parvan uvt'], subtitle: 'Bulevardul Vasile Pârvan 4', lat: 45.74805, lng: 21.23064 },
  { id: 'poi-umft', name: 'UMFT Victor Babeș', keywords: ['umft', 'medicina', 'victor babes'], subtitle: 'Piața Eftimie Murgu 2', lat: 45.75650, lng: 21.23600 },
  { id: 'poi-spital-jud', name: 'Spitalul Clinic Județean', keywords: ['spitalul judetean', 'judetean', 'spital judet'], subtitle: 'Bulevardul Liviu Rebreanu 156', lat: 45.73834, lng: 21.24030 },
  { id: 'poi-aeroport', name: 'Aeroportul Traian Vuia (TSR)', keywords: ['aeroport', 'traian vuia', 'aeroport timisoara'], subtitle: 'Str. Aeroportului 2 · Ghiroda', lat: 45.80974, lng: 21.33302 },
];

export function makeUserLocationPlace(
  coords?: { lat: number; lng: number } | null,
  customName?: string,
): LocationPlace {
  const st = nearestStation(coords ?? null);
  const placeName = customName || st.name;
  return {
    id: 'current-location',
    name: placeName,
    subtitle: coords ? `Lângă stația ${st.name}` : 'Centru · Timișoara',
    lat: coords?.lat ?? st.lat,
    lng: coords?.lng ?? st.lng,
    kind: 'poi',
  };
}

export async function resolveUserLocationPlace(
  coords?: { lat: number; lng: number } | null,
): Promise<LocationPlace> {
  const base = makeUserLocationPlace(coords);
  if (!coords) return base;
  try {
    const res = await Location.reverseGeocodeAsync({
      latitude: coords.lat,
      longitude: coords.lng,
    });
    if (res && res.length > 0) {
      const addr = res[0];
      const street = [addr.street, addr.streetNumber].filter(Boolean).join(' ');
      const name = street || addr.name || addr.district || base.name;
      const subtitle = [addr.district, addr.city ?? 'Timișoara'].filter(Boolean).join(' · ') || base.subtitle;
      return { ...base, name, subtitle };
    }
  } catch {
    // Graceful fallback to nearest station base
  }
  return base;
}

export function stationToPlace(station: Station): LocationPlace {
  return {
    id: `station-${station.id}`,
    name: station.name,
    subtitle: `Linii: ${station.lines.join(', ')}`,
    lat: station.lat,
    lng: station.lng,
    kind: 'station',
    station,
  };
}

export function searchLocalPlaces(query: string, limit = 20): LocationPlace[] {
  const needle = normStationText(query.trim());
  if (needle.length < 2) return [];

  const matchedPois: LocationPlace[] = TIMISOARA_POIS.filter((p) => {
    if (normStationText(p.name).includes(needle)) return true;
    return p.keywords.some((k) => normStationText(k).includes(needle));
  }).map((p) => ({
    id: p.id,
    name: p.name,
    subtitle: p.subtitle,
    lat: p.lat,
    lng: p.lng,
    kind: 'poi',
  }));

  const matchedStations: LocationPlace[] = loadStations()
    .filter((s) => normStationText(s.name).includes(needle))
    .slice(0, 15)
    .map(stationToPlace);

  return [...matchedPois, ...matchedStations].slice(0, limit);
}

export async function searchPhotonPlaces(query: string, signal?: AbortSignal): Promise<LocationPlace[]> {
  const needle = query.trim();
  if (needle.length < 3) return [];
  try {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(needle)}&lat=45.7537&lon=21.2257&limit=6`;
    const res = await fetch(url, { signal });
    if (!res.ok) return [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = (await res.json()) as any;
    if (!Array.isArray(data?.features)) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.features.map((f: any, idx: number): LocationPlace => {
      const p = f.properties ?? {};
      const coords = f.geometry?.coordinates ?? [21.2287, 45.7577];
      const street = [p.street, p.housenumber].filter(Boolean).join(' ');
      const area = [p.district, p.city ?? 'Timișoara'].filter(Boolean).join(', ');
      return {
        id: `photon-${p.osm_id ?? idx}`,
        name: p.name ?? street ?? needle,
        subtitle: [street, area].filter(Boolean).join(' · ') || 'Timișoara',
        lat: Number(coords[1]),
        lng: Number(coords[0]),
        kind: 'address',
      };
    });
  } catch {
    return [];
  }
}

export async function searchAllPlaces(query: string, signal?: AbortSignal): Promise<LocationPlace[]> {
  const local = searchLocalPlaces(query);
  if (local.length >= 8) return local;

  const online = await searchPhotonPlaces(query, signal);
  const seen = new Set(local.map((l) => normStationText(l.name)));
  const uniqueOnline = online.filter((o) => !seen.has(normStationText(o.name)));

  return [...local, ...uniqueOnline];
}
