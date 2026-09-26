export type SourceState = 'LIVE'|'STALE'|'DEGRADED'|'AUTH_REQUIRED'|'ENDPOINT_REQUIRED'|'UNAVAILABLE';
export type RiskState = 'NORMAL'|'WATCH'|'WARNING'|'ACTION'|'EMERGENCY'|'UNKNOWN';

export interface SourceHealth {
  id: string;
  name: string;
  state: SourceState;
  observedAt?: string;
  checkedAt: string;
  ageMinutes?: number;
  latencyMs?: number;
  message: string;
  officialUrl: string;
}

export interface Evidence {
  sourceId: string;
  kind: 'RAIN'|'RADAR'|'WATER_LEVEL'|'FLOOD_EXTENT'|'FORECAST'|'ROAD_FLOOD';
  observedAt?: string;
  value?: number;
  unit?: string;
  trend?: 'RISING'|'STABLE'|'FALLING'|'UNKNOWN';
  description: string;
}

export interface FloodSnapshot {
  generatedAt: string;
  location: { name: string; latitude: number; longitude: number; radiusKm: number };
  risk: { state: RiskState; confidence: 'LOW'|'MODERATE'|'HIGH'; reasons: string[] };
  sources: SourceHealth[];
  evidence: Evidence[];
  limitations: string[];
}
