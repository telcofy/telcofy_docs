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
- Keys are 64-character hex strings and are shown only once—store them in a secret manager
  as soon as they are created or rotated.
- The `service` profile you choose while creating a machine account controls which Google
  scopes can be minted later (`storage` is the default; use `bigquery` for BigQuery access).
- Machine accounts are scoped to read artifacts under `gs://telcofy-user-data/results/{USER_ID}/`.
- Rotation is supported through the Users API. If you do not have the ability to call the
  rotation endpoints directly, contact Telcofy support to request a new key.

| Endpoint | Description | Notes |
| --- | --- | --- |
| `GET /users/:uid/machine-accounts/list` | View existing machine-account labels and rotation timestamps. | Available to customers with machine-account admin access; otherwise, contact Telcofy support to retrieve this information. |
| `POST /users/:uid/machine-accounts` | Create or rotate a machine-account API key. | Provide `keyLabel` and optional `service` (`storage` default, `bigquery` for BigQuery access). Telcofy support can run this on your behalf if self-service is not enabled. |
| `POST /login-with-apikey` | Exchange an API key for a 1-hour Google OAuth access token. | Supports optional `{"service":"bigquery"}` to request the BigQuery scope; defaults to a Cloud Storage read-only scope. |

> **Note:** Calling `POST /users/:uid/machine-accounts` with an existing `keyLabel`
> rotates the key (the previous key is revoked immediately). If you do not have self-service
> access, submit a ticket with the desired `keyLabel` and `service`.


---

## 2. Exchange the API Key for an OAuth Token

```bash
API_KEY="YOUR_API_KEY"
LOGIN_RESPONSE=$(curl -s -X POST https://users.api.telcofy.ai/login-with-apikey \
  -H "x-api-key: $API_KEY")
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r .accessToken)
USER_ID=$(echo "$LOGIN_RESPONSE" | jq -r .userId)
EXPIRES_AT=$(echo "$LOGIN_RESPONSE" | jq -r .expireTime)
```

- Tokens are valid for roughly one hour; check `expireTime` in the response.
- The default scope is `https://www.googleapis.com/auth/devstorage.read_only`.
- Provide a JSON body to request a different scope that matches your machine-account
  profile (for example, `{"service": "bigquery"}` to mint `https://www.googleapis.com/auth/bigquery`).

```bash
# Request a BigQuery-scoped token
LOGIN_RESPONSE=$(curl -s -X POST https://users.api.telcofy.ai/login-with-apikey \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"service":"bigquery"}')
```

Use the bearer token with Cloud Storage tooling. The examples below rely on the `USER_ID`
returned by `/login-with-apikey`.

**Example (gsutil):**

```bash
gsutil -o "GSUtil:additional_http_headers=Authorization: Bearer $ACCESS_TOKEN" \
  cp -r gs://telcofy-user-data/results/$USER_ID/ ./results_$USER_ID
```

**Example (HTTP download):**

```bash
curl -L -H "Authorization: Bearer $ACCESS_TOKEN" \
  "https://storage.googleapis.com/telcofy-user-data/results/$USER_ID/export.json" \
  -o export.json
```

---

## 3. Calling the Admin API with an API Key

Attach your API key to each Telcofy admin request using the `x-api-key` header.

### Admin Maps (`/admin/maps`)

Admin map endpoints let you store and maintain reusable geometries. These routes live on
`https://users.api.telcofy.ai` and also use the `x-api-key` header.

| Endpoint | Description | Notes |
| --- | --- | --- |
| `GET /admin/maps` | List saved admin maps (custom polygons, grids). | Returns map metadata, including geometry and owning machine account. |
| `GET /admin/maps/monitored` | List admin map IDs that are flagged for **realtime monitoring**. | Returns `count` plus `monitored_map_ids`. |
| `POST /admin/maps` | Create a new admin map. | Provide `name`, `type`, and either `geometry` (WKT) or compatible `ids`. |
| `PUT /admin/maps/:id` | Update an existing admin map. | Supply only the fields you want to change; geometry updates replace the stored polygon. |
| `DELETE /admin/maps/:id` | Delete an admin map. | Removes the map from future queries; returns `{ "msg": "Map deleted" }`. |

**List saved maps:**

```bash
curl -s https://users.api.telcofy.ai/admin/maps \
  -H "x-api-key: $API_KEY"
```

Example response:

```json
{
  "maps": [
    {
      "id": "2nnuJGDA0axOeuafA0wy",
      "name": "Customer Zone Alpha",
      "description": "Example custom zone created via API key",
      "type": "custom_polygon",
      "geometry": "POLYGON((10.7330245 59.948585, 10.734826 59.948413, 10.736222 59.949133, 10.735642 59.949885, 10.733625 59.94995, 10.732315 59.94924, 10.7330245 59.948585))",
      "owner": "api-test-user-1-my-dev-key@telcofy-norway-poc.iam.gserviceaccount.com"
    }
  ]
}
```

**List monitored maps:**

```bash
curl -s https://users.api.telcofy.ai/admin/maps/monitored \
  -H "x-api-key: $API_KEY"
```

Example response:

```json
{ "count": 1, "monitored_map_ids": ["2nnuJGDA0axOeuafA0wy"] }
```

**Create a map:**

```bash
curl -s -X POST https://users.api.telcofy.ai/admin/maps \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
        "name": "Customer Zone Alpha",
        "description": "Example custom zone created via API key",
        "type": "custom_polygon",
        "geometry": "POLYGON((10.7872664 59.8679278, 10.7969259 59.8680208, 10.7969259 59.8701131, 10.7924594 59.8734470, 10.7878905 59.8708231, 10.7872664 59.8679278))"
      }'
```

Example response:

```json
{
  "msg": "Map saved",
  "id": "2nnuJGDA0axOeuafA0wy",
  "name": "Customer Zone Alpha",
  "description": "Example custom zone created via API key",
  "type": "custom_polygon",
  "geometry": "POLYGON((10.7872664 59.8679278, 10.7969259 59.8680208, 10.7969259 59.8701131, 10.7924594 59.8734470, 10.7878905 59.8708231, 10.7872664 59.8679278))",
  "owner": "api-test-user-1-my-dev-key@telcofy-norway-poc.iam.gserviceaccount.com"
}

```

**Update a map:**

```bash
curl -s -X PUT https://users.api.telcofy.ai/admin/maps/$MAP_ID \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
        "name": "Customer Zone Alpha (updated)",
        "description": "Polygon geometry updated via API key",
        "type": "custom_polygon",
        "geometry": "POLYGON((10.761452 59.914762, 10.7654 59.914762, 10.7654 59.916699, 10.760765 59.916699, 10.757761 59.916139, 10.761452 59.914762))"
      }'
```

Successful updates return the map ID:

```json
{ "msg": "Map updated", "id": "svxtowUIKG33pVmbXKBT" }
```

**Delete a map:**

```bash
curl -s -X DELETE https://users.api.telcofy.ai/admin/maps/$MAP_ID \
  -H "x-api-key: $API_KEY"
```

Example response:

```json
{ "msg": "Map deleted", "id": "QdZn1VqNBreF1Lyoc9Hj" }
```

### Realtime Admin API 

Enable or disable realtime monitoring for previously saved admin maps. These calls use
`https://data.api.telcofy.ai` and require the same `x-api-key` header.

| Endpoint | Description | Notes |
| --- | --- | --- |
| `POST /realtime` | Toggle realtime monitoring for a map. | Body accepts `map_id` and `enable` (`true`/`false`); updates the realtime monitoring service parameters. |

**Enable monitoring for a map:**

```bash
curl -s -X POST https://data.api.telcofy.ai/realtime \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "map_id": "svxtowUIKG33pVmbXKBT", "enable": true }'
```

Example response:

```json
{
  "msg": "Realtime monitoring enabled",
  "map_id": "svxtowUIKG33pVmbXKBT",
  "is_monitored": true,
  "bq_updated_rows": 1
}
```

### Data Aggregation API (`/data-agg`)
//UNDER DEVELOPMENT


Use `/data-agg` to request Telcofy’s analytical products - Activities and Origin-Destination Matrix (ODM) datasets.
Submit asynchronous jobs for large date ranges, then download the results once processing completes. See
[`data-access/overview`](../data-access/overview.md) for a deeper look at product definitions and available measures.

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
