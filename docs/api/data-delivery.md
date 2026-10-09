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
      "timestamp": "2026-04-20T13:40:12.000Z",
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
| `timestamp` | ISO 8601 string | Time the measurement was recorded. |
| `target_id` | string | Internal ID of the monitored admin map. |
| `target_name` | string | Human-readable name of the admin map. |
| `result` | string | Processing status (`SUCCESS` or error code). |
| `subscriber_count` | integer | Estimated headcount at measurement time. |

### Data Aggregation API (`/data-agg`)

> **Note:** The `/data-agg` endpoint is only available in the **Telcofy Dev environment** (`https://dev.data.api.telcofy.ai`). It requires a separate Dev API key. Contact [support@telcofy.ai](mailto:support@telcofy.ai) to get access to Telcofy Dev and test features under development.

Use `/data-agg` to request Telcofy’s analytical products (Activities, Origin-Destination
Matrix and Flow). Start with synchronous previews or submit asynchronous jobs that export
detailed results to Cloud Storage.

`/data-agg` serves only data that has been delivered for a country, so everything it returns
is listed by [`/data-availability`](#data-availability-api-data-availability). Check there
which dates exist before you query. `country_code` defaults to `NOR`.

| `country_code` | Activities | ODM `origin_geo_type` / `destination_geo_type` | Flow |
| -------------- | ---------- | ---------------------------------------------- | ---- |
| `LAT` (`LV`) | — | `grid_1000m`, IDs as delivered, e.g. `"1kmX507Y312"` | by coordinate |
| `LTU` (`LT`) | — | `grid_1000m`, INSPIRE IDs, e.g. `"1kmN3721E5144"` | by coordinate |
| `EST` (`EE`) | `grid_1000m`, `admin_level_2` | `grid_1000m`, numeric Maps API IDs | by coordinate |
| `NOR` (`NO`) | — | `admin_level_4` (grunnkrets), `admin_level_2` (kommune), numeric IDs | by coordinate |

Any other combination returns `400` with the supported values.

> **Modelled data:** the Estonian and Norwegian data are modelled, not measured from mobile
> network data. They come from an activity-based travel model of all residents, calibrated
> to national travel and labour statistics. Flows cover residents' cars only.

#### Synchronous data preview endpoint (GET `/data-agg` )

Usage: quick preview of the data. Returns a maximum of one day of data. Not designed
for querying historical data. GET supports `agg_type` `activities` and `flow`; request ODM
with [POST `/data-agg`](#origindestination-matrix-odm).

**1. Flow data preview**:

Example `flow` query — given a coordinate, resolves the nearest road link and returns its
flow counts over the requested datetime range. Flow is available for every country in the
table above (`LAT`/`LTU`/`EST`/`NOR`, also `LV`/`LT`/`EE`/`NO`). `end_time` is optional and
defaults to the current datetime when omitted. The legacy
`datetime_from`/`datetime_to` parameters are still accepted as aliases but are deprecated:


```bash
curl -sG "https://dev.data.api.telcofy.ai/data-agg" \
  -H "x-api-key: $API_KEY" \
  --data-urlencode "agg_type=flow" \
  --data-urlencode "country_code=LAT" \
  --data-urlencode "lat=56.628547" \
  --data-urlencode "lon=23.755313" \
  --data-urlencode "start_time=2026-07-15T10:00:00Z" | jq
```

Example response:

```json
{
  "agg_type": "flow",
  "country_code": "LAT",
  "lat": 56.628547,
  "lon": 23.755313,
  "start_time": "2026-07-15T10:00:00.000Z",
  "end_time": "2026-07-21T12:57:41.505Z",
  "results": [
    {
      "link_id": 431208917,
      "link_name": "Miera iela",
      "link_type": "primary",
      "distance_m": 12,
      "time_bucket": "2026-07-15T10:00:00.000Z",
      "direction": -1,
      "people": 39
    },
    {
      "link_id": 431208917,
      "link_name": "Miera iela",
      "link_type": "primary",
      "distance_m": 12,
      "time_bucket": "2026-07-15T10:00:00.000Z",
      "direction": 1,
      "people": 12
    }
  ]
}
```

`results` continues with one row per hour (and per `direction`) up to `end_time`, all
sharing the same nearest `link_id`.

For Estonia (`EST`) and Norway (`NOR`), the coordinate snaps to the nearest road that has
flow data in the requested window, so `distance_m` can be larger than the nearest street. If
no road has flow data in the window, `results` holds a single row for the nearest way with
`time_bucket`, `direction` and `people` set to `null`, so you can tell an empty window from a
failed lookup:

```json
{"link_id":4853860,"link_name":"Vana-Posti","link_type":"pedestrian","distance_m":5,"time_bucket":null,"direction":null,"people":null}
```

Flows are hourly. In Estonia an hour with fewer than 5 people on a road is not published,
so a quiet road (about a quarter of roads with traffic) has no hourly rows, and the lookup
snaps past it to a busier road.

> **Note:** flow rows do not yet carry a `type` field naming the bucket granularity
> (`hourly` / `daily`) the way Activities and ODM rows do. It will be added in a future
> release, following the same logic as those products.

**2. Activity data preview**:

Example `activities` query — returns aggregated activity counts (for example
`sum_unique_people`) for one or more geographies (`geo_type`/`geo_ids`) within the
requested `start_time`/`end_time` window, bucketed by `activity_type` (for example
`hourly`):

Activities are available for Estonia (see the [table above](#data-aggregation-api-data-agg)):

```bash
curl -sG "https://dev.data.api.telcofy.ai/data-agg" \
  -H "x-api-key: $API_KEY" \
  --data-urlencode "agg_type=activities" \
  --data-urlencode "country_code=EST" \
  --data-urlencode "measure=sum_unique_people" \
  --data-urlencode "activity_type=hourly" \
  --data-urlencode "geo_type=grid_1000m" \
  --data-urlencode "geo_ids=39991" \
  --data-urlencode "start_time=2025-10-14T08:00:00Z" \
  --data-urlencode "end_time=2025-10-14T09:00:00Z" | jq '.results[0]'
```


#### Asynchronous data aggregation endpoint  (POST `/data-agg` ) 

**Fetch asynchronous aggregation job**

For larger time ranges, or when you want the full result set exported to Cloud Storage
rather than a 100-row inline preview, submit an asynchronous job instead of using the
synchronous preview endpoint. The job runs as a BigQuery query you can poll for
completion, then fetch either an inline preview or, when `full=true`, a Cloud Storage
export path.

The same submit → poll → fetch flow applies to every `agg_type`; only the request body
and the shape of the `preview` rows change. See [`Activities`](#activities) below, and
[`ODM`](#origindestination-matrix-odm) for the Origin-Destination Matrix product.

#### Activities

**Step 1 — Submit an asynchronous aggregation job** (exports to Cloud Storage when `full=true`):

```bash
curl -s -X POST https://dev.data.api.telcofy.ai/data-agg \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
        "agg_type": "activities",
        "measure": "sum_unique_people",
        "start_time": "2025-10-14T08:00:00Z",
        "end_time": "2025-10-14T09:00:00Z",
        "activity_type": "hourly",
        "country_code": "EST",
        "geo_type": "grid_1000m",
        "geo_ids": [39991],
        "full": false
      }'
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
{"job_id":"12bd1616-002b-43c5-bc0c-422a2110c481","status":"completed","progress":100,"created_at":"2026-05-05T13:15:06.888Z","started_at":"2026-05-05T13:15:07.470Z","finished_at":"2026-05-05T13:15:09.194Z","estimated_completion":null,"error":null}
```

`created_at`, `started_at` and `finished_at` describe the **job's** lifecycle. They are
distinct from `start_time`/`end_time`, which always describe the **data** window you
requested.

**Step 3 — Fetch results:**

```bash
curl -s -X GET https://dev.data.api.telcofy.ai/data-agg/results/12bd1616-002b-43c5-bc0c-422a2110c481 \
  -H "x-api-key: $API_KEY"
```

Example response (`full=false` — inline preview):

```json
{"job_id":"12bd1616-002b-43c5-bc0c-422a2110c481","status":"completed","country_code":"EST","preview":[{"sum_unique_people":16016,"time_bucket":"2025-10-14 08:00:00","geo_id":39991,"geo_name":"1kmN4124E5153","type":"hourly"}]}
```

When `full=true`, the results response returns a Cloud Storage path instead of an inline preview:

```json
{"http_path":"https://console.cloud.google.com/storage/browser/telcofy-user-data/results/UHkLS2lo3xNjpG2JYyJLGZ9Obsf2/f1589d4e-eab4-4232-adee-476cebf71a07/activities_daily_sum_unique_people"}
```

Download the exported files from Cloud Storage using the OAuth token retrieved in [Section 1](#1-download-cloud-storage-exports).

**Estonia (`country_code: "EST"`)**

Activities are available for Estonia. Use
[`/data-availability`](#data-availability-api-data-availability) with `country=EE` to see
which dates are available.

| Parameter | Supported values for `EST` |
| --------- | -------------------------- |
| `geo_type` | `grid_1000m` (INSPIRE 1 km cells) or `admin_level_2` (municipalities). `admin_level_4` is not available for Estonia. |
| `geo_ids` | Numeric IDs as returned by the Maps API: `grid_1000m` cell IDs, or EHAK municipality codes for `admin_level_2` (for example `784` = Tallinn). |
| `activity_type` | `hourly` or `daily` |
| `measure` | `grid_1000m`: `sum_unique_people`, `stays_count`, `stays_dwell_minutes` or `stays_devices`. `admin_level_2`: `sum_unique_people` only. |

The request in Step 1 above is an Estonian example. `geo_name` is the INSPIRE cell ID for
`grid_1000m` and the municipality name for `admin_level_2`. `time_bucket` is a UTC string:
`YYYY-MM-DD HH:MM:SS` for `hourly`, `YYYY-MM-DD` for `daily`. A bucket is returned when it
overlaps the requested `start_time`/`end_time` window. Cells with fewer than 5 people in a
bucket are not published at 1 km, so they are missing from the results rather than
returned as zero.

`admin_level_2` returns full municipality totals: each person is counted once per
municipality and bucket. Do not add up `grid_1000m` cells to get a municipality figure:
someone seen in several cells would be counted several times, and cells below 5 people are
missing. Example daily row: `{"sum_unique_people":539446,"time_bucket":"2025-10-14","geo_id":784,"geo_name":"Tallinn","type":"daily"}`.
An hour is withheld (missing from the results) when publishing it would reveal fewer than
5 people.

The GET preview accepts the same Estonian parameters, plus `country_code=EST`:

```bash
curl -sG "https://dev.data.api.telcofy.ai/data-agg" \
  -H "x-api-key: $API_KEY" \
  --data-urlencode "agg_type=activities" \
  --data-urlencode "country_code=EST" \
  --data-urlencode "measure=sum_unique_people" \
  --data-urlencode "activity_type=daily" \
  --data-urlencode "geo_type=admin_level_2" \
  --data-urlencode "geo_ids=784" \
  --data-urlencode "start_time=2025-10-14T00:00:00Z" \
  --data-urlencode "end_time=2025-10-15T00:00:00Z" | jq
```

#### Origin–Destination Matrix (ODM)

Set `agg_type` to `"odm"` to request Telcofy's Origin-Destination Matrix product: trip
volumes between an origin geography and a destination geography, bucketed over the
requested time window.

ODM jobs take the same `start_time`, `end_time`, `activity_type`, `measure` and `full`
parameters as Activities, plus:

- `origin_geo_type` / `origin_geo_ids` — the origin geography type and IDs.
- `destination_geo_type` / `destination_geo_ids` — the destination geography type and IDs.
- `country_code` — `"LAT"`, `"LTU"`, `"EST"` or `"NOR"`.

`origin_geo_type`/`destination_geo_type` and the ID format depend on the country (see the
[table above](#data-aggregation-api-data-agg)); `activity_type` is `hourly` or `daily`.
`measure` is still required by the API, but for ODM it's only used to name the Cloud Storage
export folder when `full=true` — it doesn't select or filter columns; every ODM row returns
the same fixed set of fields.

For Norway, `admin_level_4` is grunnkrets and `admin_level_2` is kommune, with the same IDs as
the Maps API (for example `301` = Oslo, `3201` = Bærum). The two levels can be mixed, for
example grunnkrets to kommune. Kommune figures are exact sums of the grunnkrets trips.

**Step 1 — Submit an asynchronous ODM job:**

```bash
curl -s -X POST https://dev.data.api.telcofy.ai/data-agg \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
        "agg_type": "odm",
        "measure": "trips",
        "start_time": "2026-09-09T00:00:00Z",
        "end_time": "2026-09-10T00:00:00Z",
        "activity_type": "daily",
        "country_code": "NOR",
        "origin_geo_type": "admin_level_2",
        "origin_geo_ids": [301],
        "destination_geo_type": "admin_level_2",
        "destination_geo_ids": [3201],
        "full": false
      }'
```

Example response:

```json
{"job_id":"7a2e0c9d-1f34-4b6e-9d21-8e7a5c3b0f11","status":"queued","status_url":"/data-agg/status/7a2e0c9d-1f34-4b6e-9d21-8e7a5c3b0f11","results_url":"/data-agg/results/7a2e0c9d-1f34-4b6e-9d21-8e7a5c3b0f11"}
```

This Norwegian request returns Oslo → Bærum for 2026-09-09: `"trips": 92072`.

Estonia (`country_code: "EST"`) requires `grid_1000m` on both sides. `geo_ids` are the
numeric `grid_1000m` IDs and can be passed as numbers or numeric strings:

```python
import requests

requests.request(
    "POST",
    "https://dev.data.api.telcofy.ai/data-agg",
    headers={"x-api-key": API_KEY, "Content-Type": "application/json"},
    json={
        "agg_type": "odm",
        "measure": "trips",
        "start_time": "2025-10-14T00:00:00Z",
        "end_time": "2025-10-15T00:00:00Z",
        "activity_type": "daily",
        "origin_geo_type": "grid_1000m",
        "origin_geo_ids": [39799],
        "destination_geo_type": "grid_1000m",
        "destination_geo_ids": [39991],
        "full": False,
        "country_code": "EST"
    },
)
```

**Step 2 — Poll job status** exactly as described in [Step 2 above](#activities) using
the returned `status_url`.

**Step 3 — Fetch results:**

```bash
curl -s -X GET https://dev.data.api.telcofy.ai/data-agg/results/7a2e0c9d-1f34-4b6e-9d21-8e7a5c3b0f11 \
  -H "x-api-key: $API_KEY"
```

Example response for the Estonia request above (`full=false` — inline preview), with one
entry per origin/destination pair per bucket:

```json
{
  "job_id": "7a2e0c9d-1f34-4b6e-9d21-8e7a5c3b0f11",
  "status": "completed",
  "country_code": "EST",
  "preview": [
    {
      "batch_date": "2025-10-14",
      "time_bucket": "2025-10-14",
      "origin_geo_id": 39799,
      "destination_geo_id": 39991,
      "trips": 3319,
      "General_Distance": 1000,
      "Average_Speed": 42.09
    }
  ]
}
```

| Field | Type | Description |
| ----- | ---- | ----------- |
| `batch_date` | string | Date the aggregated row covers. |
| `time_bucket` | string | UTC bucket: `YYYY-MM-DD HH:MM:SS` for `hourly`, `YYYY-MM-DD` for `daily`. |
| `origin_geo_id` / `destination_geo_id` | number or string | IDs of the origin/destination geography, matching `origin_geo_type`/`destination_geo_type`: numbers for `EST` and `NOR`, strings for `LAT` and `LTU`. |
| `General_Distance` *(optional)* | number | Straight-line distance between origin and destination, in meters. |
| `Average_Speed` *(optional)* | number | Average travel speed for the trip, in km/h. |
| `trips` | number | Estimated trip count for the origin/destination pair. |

When `full=true`, results are returned the same way as Activities — a Cloud Storage
`http_path` instead of an inline `preview`.

> **Small flows (Latvia, Lithuania, Estonia):** origin/destination pairs with fewer than 5
> trips are not published at 1 km; they are only counted in coarser aggregates that
> `/data-agg` does not serve yet. Summing 1 km pairs therefore undercounts total trips (in
> Estonia about 77% of daily trips are at 1 km). Norway has no such suppression: every pair
> with a trip is published at grunnkrets level.

> **Optional fields:** `General_Distance` and `Average_Speed` are `null` where the delivery
> doesn't model them (for example all of Norway). Contact
> [support@telcofy.ai](mailto:support@telcofy.ai) to check what's available for your country.

### Data Availability API (`/data-availability`)

> **Note:** The `/data-availability` endpoint is only available in the **Telcofy Dev environment** (`https://dev.data.api.telcofy.ai`). It requires a separate Dev API key. Contact [support@telcofy.ai](mailto:support@telcofy.ai) to get access to Telcofy Dev and test features under development.

Use `GET /data-availability` to check which daily batches of a data product have been
delivered before you query or export them. The response lists one row per table and
`batch_date` that contains data, together with its row count and the time it was last
updated. Only datasets your account has been granted access to are returned.

**Query parameters** — all optional. Without any parameters, the endpoint returns every
dataset and date you have access to, across all supported countries.

| Parameter | Supported values | Description |
| --------- | ---------------- | ----------- |
| `country` | `LV` (Latvia), `LT` (Lithuania), `EE` (Estonia), `NO` (Norway) | Country to check. The 3-letter codes `LAT`, `LTU`, `EST` and `NOR` are also accepted; matching is case-insensitive. Omit to check every country you have access to. |
| `dataset` | `flows`, `odm`, `activities` | Data product to check. `activities` is available for Estonia only. Omit to return all datasets you have access to. |
| `start_time` | `YYYY-MM-DD` or ISO 8601 timestamp | Earliest `batch_date` to include (inclusive). Only the date part is used, so `2026-09-01T12:00:00Z` is treated as `2026-09-01`. |
| `end_time` | `YYYY-MM-DD` or ISO 8601 timestamp | Latest `batch_date` to include (inclusive). Must not be before `start_time`. |

**Check everything available for Latvia:**

```bash
curl -s "https://dev.data.api.telcofy.ai/data-availability?country=LV" \
  -H "x-api-key: $API_KEY" | jq
```

Example response:

```json
{
  "results": [
    {
      "country_code": "LAT",
      "dataset": "flows",
      "table_name": "flows_daily",
      "batch_date": "2026-09-03",
      "total_rows": 220447,
      "last_modified_time": "2026-10-05T06:11:37.008Z"
    }
  ]
}
```

**Check ODM availability for Lithuania in September 2026:**

```bash
curl -sG "https://dev.data.api.telcofy.ai/data-availability" \
  -H "x-api-key: $API_KEY" \
  --data-urlencode "country=LT" \
  --data-urlencode "dataset=odm" \
  --data-urlencode "start_time=2026-09-01" \
  --data-urlencode "end_time=2026-09-30" | jq
```

**Check Estonian activities:**

```bash
curl -sG "https://dev.data.api.telcofy.ai/data-availability" \
  -H "x-api-key: $API_KEY" \
  --data-urlencode "country=EE" \
  --data-urlencode "dataset=activities" | jq
```

Example response:

```json
{
  "results": [
    {
      "country_code": "EST",
      "dataset": "activities",
      "table_name": "activity_daily",
      "batch_date": "2025-10-11",
      "total_rows": 14353,
      "last_modified_time": "2026-10-07T07:30:41.645Z"
    }
  ]
}
```

Rows are sorted by `dataset`, `table_name` and then `batch_date`.

| Field | Type | Description |
| ----- | ---- | ----------- |
| `country_code` | string | 3-letter country code (`LAT`, `LTU`, `EST` or `NOR`). |
| `dataset` | string | Data product (`flows`, `odm` or `activities`). |
| `table_name` | string | Table holding the data: `flows_daily`, `flows_hourly`, `odm_daily`, `odm_hourly`, or for `activities` `activity_hourly`, `activity_daily`, `activity_dwell` (stays by dwell-time band), `activity_destrank` (people in each area split into residents, regular workers or students, and visitors), and `activity_admin_daily` / `activity_admin_hourly` (municipality, county and country totals). |
| `batch_date` | string | Date (`YYYY-MM-DD`) of the delivered batch. |
| `total_rows` | integer | Number of rows in that batch. Batches with no rows are not listed. |
| `last_modified_time` | ISO 8601 string | When the batch was last written or refreshed. |

**Errors**

| Status | When |
| ------ | ---- |
| `400` | `country`, `dataset`, `start_time` or `end_time` is invalid, or `start_time` is after `end_time`. The `error` message names the expected values. |
| `403` | Your account has no data product access (in the requested country). |

---

## 4. Keep Exploring

- Review [`authentication.md`](authentication.md) for endpoint descriptions and best practices.
- Consult [`endpoints.md`](endpoints.md) for a full list of REST routes.
- Need more datasets or automation help? Contact your Telcofy account team.
