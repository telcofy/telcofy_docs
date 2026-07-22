# Telcofy Data Delivery Guide

Telcofy APIs surface three pillars of data: **Maps** (admin polygons and metadata),
**Realtime** headcounts, and **analytical products** such as Activities and ODM (refer to
[`Data Products`](../products/index.md) for product-level summaries). Once
you have an OAuth token (see [`Quickstart`](quickstart.md)), you can configure data
products via the Admin APIs, then collect results either by exporting files to Cloud
Storage or by running SQL against the shared BigQuery datasets. 

---

## 1. Download Cloud Storage Exports

Use the bearer token returned by `POST /login-with-apikey` to access your exports in
`gs://telcofy-user-data/results/{USER_ID}/`.

```bash
gsutil -o "GSUtil:additional_http_headers=Authorization: Bearer $ACCESS_TOKEN" \
  cp -r gs://telcofy-user-data/results/$USER_ID/ ./results_$USER_ID
```

Prefer HTTP downloads? Iterate over your objects and fetch them with `curl`:

```bash
FILES=$(gsutil -o "GSUtil:additional_http_headers=Authorization: Bearer $ACCESS_TOKEN" \
  ls gs://telcofy-user-data/results/$USER_ID/**)

mkdir -p results_$USER_ID
for f in $FILES; do
  NAME=$(basename "$f")
  curl -L -H "Authorization: Bearer $ACCESS_TOKEN" "$f" -o "results_$USER_ID/$NAME"
done
```

Python example using the Google Cloud Storage client:

```python
import os

import requests
from google.cloud import storage
from google.oauth2.credentials import Credentials

API_KEY = os.environ["API_KEY"]
BASE_URL = "https://users.api.telcofy.ai"
BUCKET_NAME = "telcofy-user-data"

resp = requests.post(f"{BASE_URL}/login-with-apikey", headers={"x-api-key": API_KEY})
resp.raise_for_status()
token_data = resp.json()

creds = Credentials(token=token_data["accessToken"])
client = storage.Client(credentials=creds)

user_id = token_data["userId"]
prefix = f"results/{user_id}/"
os.makedirs(f"results_{user_id}", exist_ok=True)

for blob in client.list_blobs(BUCKET_NAME, prefix=prefix):
    if blob.name.endswith("/"):
        continue
    local = os.path.join(f"results_{user_id}", os.path.basename(blob.name))
    blob.download_to_filename(local)
    print(f"Downloaded {blob.name} -> {local}")
```

---

## 2. Query Shared BigQuery Datasets

Telcofy shares realtime analytics via BigQuery. Choose the scenario that matches your
deployment.

### Scenario A — You have your own Google Cloud project (recommended)

1. Subscribe to the Telcofy listing as described in
   [`data-access/analytical-hub`](../data-access/analytical-hub.md).
2. Create a **linked dataset** inside your project; you pick the dataset name.
3. When building queries, set `BQ_PROJECT_ID` to your project ID and `BQ_DATASET_ID`
   to the linked dataset name you created.

**Prerequisites**

- Your querying identity (user or service account) must have `roles/analyticshub.viewer`
  and at least `roles/bigquery.user` within your Google Cloud project. See the
  [Analytics Hub subscriber permissions guide](https://cloud.google.com/bigquery/docs/analytics-hub-view-subscribe-listings)
  for additional context.
- Need to create a service account first? Follow Google’s
  [service account setup guide](https://docs.cloud.google.com/iam/docs/service-accounts-create).

```python
import os

import requests
from google.cloud import bigquery
from google.oauth2.credentials import Credentials

API_KEY = os.environ["API_KEY"]
BASE_URL = "https://users.api.telcofy.ai"

# Step 1: Mint a BigQuery-scoped token
resp = requests.post(
    f"{BASE_URL}/login-with-apikey",
    headers={"x-api-key": API_KEY},
    json={"service": "bigquery"},
)
resp.raise_for_status()
token_data = resp.json()

creds = Credentials(token=token_data["accessToken"])

# Scenario A configuration — your project, your linked dataset
BQ_PROJECT_ID = "my-gcp-project"
BQ_DATASET_ID = "my_telcofy_data_link"
BQ_TABLE_ID = "target_country_summary_view_customer"

client = bigquery.Client(project=BQ_PROJECT_ID, credentials=creds)

query_template = f"""
    SELECT
      target_name,
      timestamp,
      people_count
    FROM `{BQ_PROJECT_ID}.{BQ_DATASET_ID}.{BQ_TABLE_ID}`
    WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 HOUR)
    ORDER BY timestamp DESC
    LIMIT 20
"""

job_config = bigquery.QueryJobConfig(use_query_cache=False)
query_job = client.query(query_template, job_config=job_config, location="eu")

for row in query_job:
    print(f"{row.target_name} | {row.timestamp} | {row.people_count}")
```

The query runs inside **your** Google Cloud project and appears on your billing.

### Scenario B — You do not manage a Google Cloud project 

1. Telcofy issues a dedicated service account (for example,
   `demo-test-user-1@telcofy-norway-delivery.iam.gserviceaccount.com`).
2. During account provisioning the account receives the `roles/bigquery.user` role on
   the Telcofy project.
3. Point your queries directly at Telcofy’s dataset.

**Prerequisites**

- Your API key needs to have a BigQuery scope added in the **API Keys** section of [https://app.telcofy.ai](https://app.telcofy.ai).
- For accessing Realtime Data, a personal dataset needs to be requested in the **API Keys** section of [https://app.telcofy.ai](https://app.telcofy.ai).

```python
import os

import requests
from google.cloud import bigquery
from google.oauth2.credentials import Credentials

API_KEY = os.environ["API_KEY"]
BASE_URL = "https://users.api.telcofy.ai"

resp = requests.post(
    f"{BASE_URL}/login-with-apikey",
    headers={"x-api-key": API_KEY},
    json={"service": "bigquery"},
)
resp.raise_for_status()
token_data = resp.json()

creds = Credentials(token=token_data["accessToken"])

# Scenario B configuration — Telcofy-hosted project and dataset
BQ_PROJECT_ID = "telcofy-norway-delivery"
# Your personal dataset — find it in "API Keys" > "Existing API Keys" > "Personal dataset"
# Make sure you have "Realtime" enabled in "scopes"
# at https://app.telcofy.ai
BQ_DATASET_ID = "<your-personal-dataset>"
BQ_TABLE_ID = "realtime_data"

client = bigquery.Client(project=BQ_PROJECT_ID, credentials=creds)

query_template = f"""
    SELECT
      target_name,
      timestamp,
      people_count
    FROM `{BQ_PROJECT_ID}.{BQ_DATASET_ID}.{BQ_TABLE_ID}`
    WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 HOUR)
    ORDER BY timestamp DESC
    LIMIT 20
"""

job_config = bigquery.QueryJobConfig(use_query_cache=False)
query_job = client.query(query_template, job_config=job_config, location="europe-north1")

for row in query_job:
    print(f"{row.target_name} | {row.timestamp} | {row.people_count}")
```


Need to request the scope via `curl` instead? Supply the JSON body when calling the
login endpoint:

```bash
curl -s -X POST https://users.api.telcofy.ai/login-with-apikey \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"service":"bigquery"}'
```

### Scenario C — You prefer AWS, Azure, Snowflake, or other platforms

If you do not plan to integrate with Google Cloud at all, Telcofy can deliver the same
datasets through your existing stack. Reach out to `support@telcofy.ai` so we can set up
a transfer that fits your environment (for example, S3 drops, Azure Blob, or Snowflake
data shares).

---

## 3. Call the Data API (Realtime & Aggregations)

The Data API accepts your Telcofy API key via the `x-api-key` header.

### Admin Maps (`/admin/maps`)

Admin map endpoints let you store and maintain reusable geometries for downstream
workflows (dashboards, realtime monitoring, exports). All routes live on
`https://users.api.telcofy.ai`.

| Endpoint | Description | Notes |
| --- | --- | --- |
| `GET /admin/maps` | List saved admin maps (custom polygons, grids). | Returns map metadata, including geometry and owning machine account. |
| `GET /admin/maps/monitored` | List admin map IDs that are flagged for realtime monitoring. | Response includes `count` plus `monitored_map_ids`. |
| `POST /admin/maps` | Create a new admin map. | Provide `name` and `type` (`custom_polygon` with `geometry` WKT, or standard types `grid_250m`, `grid_1000m`, `admin_level_2`, `admin_level_4` with matching `ids`). |
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
      "owner": "api-test-user-1-my-dev-key@telcofy-norway-delivery.iam.gserviceaccount.com"
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

Supported map types:
- `custom_polygon` — requires a `geometry` polygon in WKT format.
- `grid_250m`, `grid_1000m`, `admin_level_2`, `admin_level_4` — require `ids` that belong to that standard map type.

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
  "owner": "api-test-user-1-my-dev-key@telcofy-norway-delivery.iam.gserviceaccount.com"
}
```

Create a standard map using existing geography IDs:

```bash
curl -s -X POST https://users.api.telcofy.ai/admin/maps \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
        "name": "Bjorvika",
        "description": "Bjorvika grunnkrets",
        "type": "admin_level_4",
        "ids": [3010104, 3012903]
      }'
```

Example response:

```json
{
  "msg": "Map saved",
  "id": "oqQoAMdgXXtl9ITwufxP",
  "name": "Bjorvika",
  "description": "Bjorvika grunnkrets",
  "type": "admin_level_4",
  "ids": [3010104, 3012903],
  "owner": "demo-test-user@test.com"
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

**Delete a map:**

```bash
curl -s -X DELETE https://users.api.telcofy.ai/admin/maps/$MAP_ID \
  -H "x-api-key: $API_KEY"
```

### Realtime Admin API (`/admin/realtime`)

**Enable or disable realtime monitoring** for a saved admin map:

```bash
curl -s -X POST https://data.api.telcofy.ai/admin/realtime \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "map_id": "2nnuJGDA0axOeuafA0wy", "enable": false }'
```

Example response:

```json
{
  "msg": "Realtime monitoring disabled",
  "map_id": "2nnuJGDA0axOeuafA0wy",
  "is_monitored": false,
  "bq_updated_rows": 1
}
```

**Fetch the latest realtime headcount rows** for all monitored maps:

```bash
curl -s "https://data.api.telcofy.ai/admin/realtime/data" \
  -H "x-api-key: $API_KEY"
```

Example response:

```json
{
  "rows": [
    {
      "timestamp": { "value": "2026-04-20T13:40:12.000Z" },
      "target_id": "snS123456sDQnAwk",
      "target_name": "my_area1",
      "result": "SUCCESS",
      "subscriber_count": 249
    }
  ]
}
```

| Field | Type | Description |
| ----- | ---- | ----------- |
| `timestamp.value` | ISO 8601 string | Time the measurement was recorded. |
| `target_id` | string | Internal ID of the monitored admin map. |
| `target_name` | string | Human-readable name of the admin map. |
| `result` | string | Processing status (`SUCCESS` or error code). |
| `subscriber_count` | integer | Estimated headcount at measurement time. |

### Data Aggregation API (`/data-agg`)

> **Note:** The `/data-agg` endpoint is only available in the **Telcofy Dev environment** (`https://dev.data.api.telcofy.ai`). It requires a separate Dev API key. Contact [support@telcofy.ai](mailto:support@telcofy.ai) to get access to Telcofy Dev and test features under development.

Use `/data-agg` to request Telcofy’s analytical products (Activities, Origin-Destination
Matrix and Flow). Start with synchronous previews or submit asynchronous jobs that export
detailed results to Cloud Storage.

#### Synchronous data preview endpoint (GET `/data-agg` )

Usage: quick preview of the data. Returns a maximum of one day of data. Not designed
for querying historical data.

**1. Flow data preview**:

Example `flow` query — given a coordinate, resolves the nearest road link and returns its
flow counts over the requested datetime range. For `country_code` `LAT`/`EST`, `datetime_to`
is optional and defaults to the current datetime when omitted:


```bash
curl -sG "https://dev.data.api.telcofy.ai/data-agg" \
  -H "x-api-key: $API_KEY" \
  --data-urlencode "agg_type=flow" \
  --data-urlencode "country_code=LAT" \
  --data-urlencode "lat=56.628547" \
  --data-urlencode "lon=23.755313" \
  --data-urlencode "datetime_from=2026-07-15T10:00:00Z" | jq
```

Example response:

```json
{
  "agg_type": "flow",
  "country_code": "LAT",
  "lat": 56.628547,
  "lon": 23.755313,
  "datetime_from": "2026-07-15T10:00:00.000Z",
  "datetime_to": "2026-07-21T12:57:41.505Z",
  "results": [
    {
      "link_id": 431208917,
      "link_name": "Miera iela",
      "link_type": "primary",
      "distance_m": 12,
      "datetime": { "value": "2026-07-15T10:00:00.000Z" },
      "direction": -1,
      "people": 39
    },
    {
      "link_id": 431208917,
      "link_name": "Miera iela",
      "link_type": "primary",
      "distance_m": 12,
      "datetime": { "value": "2026-07-15T10:00:00.000Z" },
      "direction": 1,
      "people": 12
    }
  ]
}
```

`results` continues with one row per hour (and per `direction`) up to `datetime_to`, all
sharing the same nearest `link_id`.

**2. Activity data preview**:

Example `activities` query — returns aggregated activity counts (for example
`sum_unique_people`) for one or more geographies (`geo_type`/`geo_ids`) within the
requested `start_time`/`end_time` window, bucketed by `activity_type` (for example
`hourly`):

```bash
curl -s "https://data.api.telcofy.ai/data-agg?agg_type=activities&measure=sum_unique_people&start_time=2024-03-01T08:00:00Z&end_time=2024-03-01T09:00:00Z&activity_type=hourly&geo_type=grid_250m&geo_ids=22637506648500" \
  -H "x-api-key: $API_KEY" | jq ‘.results[0]’
```


#### Asynchronous data aggregation endpoint  (POST `/data-agg` ) 

**Fetch asynchronous aggregation job**

For larger time ranges, or when you want the full result set exported to Cloud Storage
rather than a 100-row inline preview, submit an asynchronous job instead of using the
synchronous preview endpoint. The job runs as a BigQuery query you can poll for
completion, then fetch either an inline preview or, when `full=true`, a Cloud Storage
export path.

**Step 1 — Submit an asynchronous aggregation job** (exports to Cloud Storage when `full=true`):

```bash
curl -s -X POST https://dev.data.api.telcofy.ai/data-agg \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d ‘{
        "agg_type": "activities",
        "measure": "sum_unique_people",
        "start_time": "2024-03-01T08:00:00Z",
        "end_time": "2024-03-01T08:59:59Z",
        "activity_type": "hourly",
        "geo_type": "admin_level_4",
        "geo_ids": [3010104],
        "full": false
      }’
```

Example response:

```json
{"job_id":"12bd1616-002b-43c5-bc0c-422a2110c481","status":"queued","status_url":"/data-agg/status/12bd1616-002b-43c5-bc0c-422a2110c481","results_url":"/data-agg/results/12bd1616-002b-43c5-bc0c-422a2110c481"}
```

**Step 2 — (Optional) Check job status:**

For long-running queries you can poll `status_url` to track progress before fetching results.

```bash
curl -s -X GET https://dev.data.api.telcofy.ai/data-agg/status/12bd1616-002b-43c5-bc0c-422a2110c481 \
  -H "x-api-key: $API_KEY"
```

Example response:

```json
{"job_id":"12bd1616-002b-43c5-bc0c-422a2110c481","status":"completed","progress":100,"created_at":"2026-05-05T13:15:06.888Z","start_time":"2026-05-05T13:15:07.470Z","end_time":"2026-05-05T13:15:09.194Z","estimated_completion":null,"error":null}
```

**Step 3 — Fetch results:**

```bash
curl -s -X GET https://dev.data.api.telcofy.ai/data-agg/results/12bd1616-002b-43c5-bc0c-422a2110c481 \
  -H "x-api-key: $API_KEY"
```

Example response (`full=false` — inline preview):

```json
{"job_id":"12bd1616-002b-43c5-bc0c-422a2110c481","status":"completed","country_code":"NOR","preview":[{"sum_unique_people":1833,"time_bucket":"2024-03-01 08:00:00","geo_id":3010104,"geo_name":"Sentrum 1 - Rode 4","type":"hourly"}]}
```

When `full=true`, the results response returns a Cloud Storage path instead of an inline preview:

```json
{"http_path":"https://console.cloud.google.com/storage/browser/telcofy-user-data/results/UHkLS2lo3xNjpG2JYyJLGZ9Obsf2/f1589d4e-eab4-4232-adee-476cebf71a07/activities_daily_sum_unique_people"}
```

Download the exported files from Cloud Storage using the OAuth token retrieved in [Section 1](#1-download-cloud-storage-exports).

---

## 4. Keep Exploring

- Review [`authentication.md`](authentication.md) for endpoint descriptions and best practices.
- Consult [`endpoints.md`](endpoints.md) for a full list of REST routes.
- Need more datasets or automation help? Contact your Telcofy account team.
