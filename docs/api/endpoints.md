# Telcofy REST Endpoints

Quick reference to Telcofy’s externally exposed REST endpoints.
All paths are relative to:

- Users API – `https://users.api.telcofy.ai`
- Data API – `https://data.api.telcofy.ai`

See `authentication.md` for header requirements and token exchange details.

---

## Users API

| Method | Path | Description | Auth |
| ------ | ---- | ----------- | ---- |
| GET | `/users/:uid/machine-accounts/list` | List machine-account labels available to the customer. | `x-api-key` |
| POST | `/users/:uid/machine-accounts` | Create or rotate a machine-account API key. | `x-api-key` |
| POST | `/login-with-apikey` | Exchange an API key for a 1-hour Google OAuth token. | `x-api-key` |

---

## Data API

| Method | Path | Description | Auth |
| ------ | ---- | ----------- | ---- |
| GET | `/maps` | Fetch geometries inside a bounding box (`geo_type`, `lng1/lat1/lng2/lat2`). | `x-api-key` |
| GET | `/data-agg` | Run a synchronous aggregation (`activities` or `trips`). | `x-api-key` |
| POST | `/data-agg` | Submit an aggregation job (`full=true` exports to Cloud Storage). | `x-api-key` |
| GET | `/data-agg/status/:jobId` | Check aggregation job status and progress. | `x-api-key` |
| GET | `/data-agg/results/:jobId` | Retrieve preview results or export metadata (`?full=true`). | `x-api-key` |
| GET | `/data-agg/jobs` | List historical aggregation jobs for the caller. | `x-api-key` |
| GET | `/maps/monitored` | List map IDs currently flagged for realtime monitoring. | `x-api-key` |
| POST | `/realtime` | Enable or disable realtime monitoring for a saved map. | `x-api-key` |

---

## Response Formats

- All responses are JSON encoded and include an `error` field on failures.
- Timestamp fields follow ISO 8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`) unless noted.
- Long-running jobs surface progress via `/data-agg/status/:jobId` and deliver
  export URLs via `/data-agg/results/:jobId?full=true`.

Refer to `quickstart.md` for example requests and to the individual service
readmes for in-depth payload schemas.
