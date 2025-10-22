# Telcofy Authentication Guide

External customers authenticate to Telcofy services with **machine-account API keys**
issued by the Telcofy team. Two base URLs are available:

- Users API: `https://users.api.telcofy.ai`
- Data API: `https://data.api.telcofy.ai`

The Users API exchanges API keys for short-lived Google OAuth tokens (for Cloud Storage
downloads). The Data API accepts the same API key via the `x-api-key` header.

---

## 1. API Keys & Machine Accounts

Each Telcofy customer receives one or more API keys that represent Google Cloud service
accounts scoped to the customer’s data.

- Keys are labelled (e.g., `etl-prod`, `pipeline-a`) to distinguish workflows.
- Store each key in a secure secret manager; the Users API only returns it at creation time.
- Rotation is supported through the Users API. If you do not have the ability to call the
  rotation endpoints directly, contact Telcofy support to request a new key.

| Endpoint | Auth Header | Description |
| -------- | ----------- | ----------- |
| `GET /users/:uid/machine-accounts/list` | `X-Api-Key` (contact Telcofy if access is restricted) | View existing labels for your account. |
| `POST /users/:uid/machine-accounts` | `X-Api-Key` (contact Telcofy if access is restricted) | Create or rotate a machine-account API key. |
| `POST /login-with-apikey` | `X-Api-Key: <API_KEY>` | Exchange an API key for a 1-hour Google OAuth access token. |

> **Note:** Many customers manage rotation through Telcofy support. If you do not have the
> necessary permissions, submit a ticket with the desired `keyLabel`.


---

## 2. Exchange the API Key for an OAuth Token

```bash
ACCESS_TOKEN=$(curl -s -X POST https://users.api.telcofy.ai/login-with-apikey \
  -H "x-api-key: $API_KEY" | jq -r .accessToken)
```

- Token lifetime: 1 hour.
- Scope: `https://www.googleapis.com/auth/devstorage.read_only`.
- Use the token as a bearer credential when calling `gsutil`, the Cloud Storage JSON API,
  or `google-cloud-storage` clients.

**Example (gsutil):**

```bash
gsutil -o "GSUtil:additional_http_headers=Authorization: Bearer $ACCESS_TOKEN" \
  cp -r gs://telcofy-user-data/results/YOUR_USER_ID/ ./results_YOUR_USER_ID
```

**Example (HTTP download):**

```bash
curl -L -H "Authorization: Bearer $ACCESS_TOKEN" \
  "https://storage.googleapis.com/telcofy-user-data/results/YOUR_USER_ID/export.json" \
  -o export.json
```

---

## 3. Calling the Data API with an API Key

Attach your API key to each Data API request using the `x-api-key` header.

**Bounding-box geometry query:**

```bash
curl -s "https://data.api.telcofy.ai/maps?geo_type=admin_level_4&lng1=10.70&lat1=59.90&lng2=10.80&lat2=59.95" \
  -H "x-api-key: $API_KEY"
```

**Synchronous aggregation:**

```bash
curl -s "https://data.api.telcofy.ai/data-agg?agg_type=activities&measure=sum_unique_people&start_time=2024-03-01T08:00:00Z&end_time=2024-03-01T09:00:00Z&activity_type=hourly&geo_type=grid_250m&geo_ids=22637506648500" \
  -H "x-api-key: $API_KEY"
```

**Submit an async aggregation job:**

```bash
curl -s -X POST https://data.api.telcofy.ai/data-agg \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "agg_type": "activities", "measure": "sum_unique_people", "start_time": "2024-03-01T00:00:00Z", "end_time": "2024-03-01T23:59:59Z", "activity_type": "daily", "geo_type": "grid_1000m", "geo_ids": [22637506648500], "full": true }'
```

Poll `/data-agg/status/{jobId}` and `/data-agg/results/{jobId}` using the same header.

---

## 4. Security Best Practices

- Treat API keys as secrets—do not embed them in mobile apps, client-side code, or public repositories.
- Rotate keys periodically (quarterly recommended) and immediately when staff change roles.
- Restrict Cloud Storage downloads to secured environments; OAuth tokens inherit read-only access to your results folder.
- If an API key is suspected to be compromised, request an immediate rotation from Telcofy support.
- Audit usage via `/users/:uid/machine-accounts/list` or Telcofy-provided dashboards when available.

Stay secure!
