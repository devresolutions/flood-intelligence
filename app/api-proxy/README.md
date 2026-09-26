# Live data integration architecture

GitHub Pages is static hosting. Live upstreams that require API keys, hide CORS headers, or need schema normalization MUST be called through a server-side gateway (Cloudflare Worker / Vercel Function / ASP.NET Core API), not directly from the browser.

## Verified sources (2026-09-26)

### BMA / DDS rainfall radar
- Catalog: https://data.go.th/dataset/69-05-disaster
- Source: Bangkok Metropolitan Administration Drainage and Sewerage Department radar.
- Catalog says real-time, public, JSON/HTML, unrestricted access.
- Integration state: VERIFIED_SOURCE / ENDPOINT_DISCOVERY_REQUIRED.

### BMA water level
- Catalog: https://data.go.th/th/dataset/flood
- 5-minute observations from Bangkok water-level sensors, historical dataset.
- Integration state: VERIFIED_SOURCE / CURRENT_MACHINE_ENDPOINT_REQUIRED.

### ThaiWater / HII
- Public water/rain information ecosystem.
- Integration state: VERIFIED_SOURCE / SCHEMA_AND_NEARBY_STATION_VALIDATION_REQUIRED.

### TMD
- Official weather/radar/NWP services.
- Integration state: VERIFIED_SOURCE / MACHINE_ENDPOINT_OR_CREDENTIAL_REQUIRED.

### GISTDA Disaster Platform
- Docs: https://disaster.gistda.or.th/services/open-api
- Flood endpoints documented: /features/flood/1day, /3days, /7days, /30days; WMS/WMTS/TMS variants.
- Full access may require API key/login.
- Integration state: VERIFIED_CONTRACT / CREDENTIAL_REQUIRED.

### Road flood
- BMA open-data catalog includes historical road-flood records, but a verified real-time nearby-road sensor machine endpoint has not yet been established.
- Integration state: VERIFIED_HISTORICAL_SOURCE / REALTIME_ENDPOINT_REQUIRED.

## Runtime source-state model
LIVE = request succeeded + timestamp fresh + schema valid.
DEGRADED = source reachable but partial/quality warning.
STALE = last valid observation exceeds freshness threshold.
AUTH_REQUIRED = verified contract but credential unavailable.
ENDPOINT_REQUIRED = authoritative source exists but current machine endpoint is not verified.
UNAVAILABLE = request/contract unavailable.

Never map VERIFIED_SOURCE to LIVE until a runtime request succeeds.