import type {
  CityBuilding,
  CityPlaza,
  CityDecoration,
  CityRiver,
  CityBridge,
  DistrictZone,
} from "@/lib/github";

interface CityCache {
  buildings: CityBuilding[];
  plazas: CityPlaza[];
  decorations: CityDecoration[];
  river: CityRiver | null;
  bridges: CityBridge[];
  districtZones: DistrictZone[];
  stats: { total_developers: number; total_contributions: number };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rawDevs: any[];
  timestamp: number;
  layoutVersion: number;
}

// Module-level singleton — survives Next.js client-side navigation
let cache: CityCache | null = null;

const MAX_AGE_MS = 5 * 60 * 1000; // 5 minutes
const LAYOUT_VERSION = 2; // Bump when changing generateCityLayout

export function getCityCache(): CityCache | null {
  if (!cache) return null;
  if (Date.now() - cache.timestamp > MAX_AGE_MS || cache.layoutVersion !== LAYOUT_VERSION) {
    cache = null;
    return null;
  }
  return cache;
}

export function setCityCache(data: Omit<CityCache, "timestamp" | "layoutVersion">) {
  cache = { ...data, timestamp: Date.now(), layoutVersion: LAYOUT_VERSION };
}

export function clearCityCache() {
  cache = null;
}
