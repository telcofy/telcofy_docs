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

**Fetch realtime headcount rows** for your monitored maps, newest first:

| Query parameter | Description |
| --------------- | ----------- |
| `datetime_from` | ISO 8601 start (inclusive). Default: the whole history. |
| `datetime_to` | ISO 8601 end (inclusive). Default: now. |
| `target_id` | Only this monitored map (the `target_id` of a row). |
| `limit` | Maximum rows to return. Default `1000`, maximum `10000`. |
| `offset` | Rows to skip, for paging. Default `0`. |

Without `datetime_from` and `limit` you only get the newest rows, up to `limit`.
Page back in time with `datetime_to`, or narrow with `target_id`. Invalid dates
return `400`.

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

The response also contains `count`, the number of rows returned.

Example with filters, one map over one day:

```bash
curl -s "https://data.api.telcofy.ai/admin/realtime/data?target_id=snS123456sDQnAwk&datetime_from=2026-04-20T00:00:00Z&datetime_to=2026-04-21T00:00:00Z&limit=1000" \
  -H "x-api-key: $API_KEY"
```

**Fetch the by-country breakdown** with `GET /admin/realtime/data/country`. It takes
the same query parameters and returns `{ "rows": [...], "count": n }`, with the
visitor country on each row. It returns `403` unless the country view is enabled
for your account.

```bash
curl -s "https://data.api.telcofy.ai/admin/realtime/data/country?target_id=snS123456sDQnAwk&limit=100" \
  -H "x-api-key: $API_KEY"
```

**Fetch the night baseline** with `GET /realtime/baseline`. For each map it returns
the median headcount over the quiet hours (02:00-04:59, Europe/Oslo time).

| Query parameter | Description |
| --------------- | ----------- |
| `target_id` | Only this monitored map. Default: all your maps. |
| `from` | First night to include, `YYYY-MM-DD`. Default: first available night. |
| `to` | Last night to include, `YYYY-MM-DD`. Default: last available night. |

```bash
curl -s "https://data.api.telcofy.ai/realtime/baseline?target_id=snS123456sDQnAwk&from=2026-04-01&to=2026-04-20" \
  -H "x-api-key: $API_KEY"
```

Example response:

```json
{
  "baselines": [
    {
      "target_id": "snS123456sDQnAwk",
      "target_name": "my_area1",
      "night_floor": 112,
      "quiet_samples": 420,
      "nights_used": 20,
      "available_nights": ["2026-04-01", "2026-04-02"],
      "range_from": "2026-04-01",
      "range_to": "2026-04-20"
    }
  ]
}
```

`night_floor` is `null` when fewer than 12 quiet-hour samples fall in the range.
`available_nights` lists every night with data (shortened above).

### Data Aggregation API (`/data-agg`)

> **Note:** Activities and activity distributions are served by the production API
> (`https://data.api.telcofy.ai`) with your API key. Flow (`agg_type=flow`) is only available in the
> **Telcofy Dev environment** (`https://dev.data.api.telcofy.ai`), which requires a separate Dev
> API key. Contact [support@telcofy.ai](mailto:support@telcofy.ai) to get access to Telcofy Dev and
> test features under development.

Use `/data-agg` to request Telcofy's analytical products: Activities, Activity
distributions, Origin-Destination Matrix (ODM) and Flow. Start with synchronous previews or
submit asynchronous jobs that export detailed results to Cloud Storage.

`/data-agg` serves **Telcofy data catalogue 1.0**: the tables, columns and values of the
catalogue, returned as they are. Everything it returns is listed by
[`/data-availability`](#data-availability-api-data-availability), so check there which dates
exist before you query. `country_code` is `NOR`, `EST`, `LAT` or `LTU` (`NO`, `EE`, `LV`
and `LT` are accepted too) and defaults to `NOR`.

> **Breaking change (November 2026):** catalogue 1.0 replaces the earlier `/data-agg`
> schema, with no mapping back to it. Geo types `admin_level_2` / `admin_level_4`, numeric
> Norwegian IDs, EHAK codes, the `type` column and the measures `stays_devices`,
> `sum_people_home`, `sum_people_work`, `sum_people_visitors` and `trips_car` (and the other
> unsuffixed modes, now `*_modelled`) are gone and return `400`. Jobs created before the
> switch can no longer be previewed. See [Migrating from the earlier schema](#migrating-from-the-earlier-schema).

#### Geo types and IDs

Each request reads one catalogue table, chosen from `agg_type`, the geo type and
`activity_type` (`hourly` or `daily`):

| `agg_type` | Admin geo types | Grid geo types | Product |
| ---------- | --------------- | -------------- | ------- |
| `activities` | `country`, `admin_lvl_1` … `admin_lvl_4` | `grid_250m`, `grid_500m`, `grid_1000m`, `grid_5000m`, `grid_10000m` | Activities |
| `activity_distributions` | as `activities` | as `activities` | Activities |
| `odm` | as `activities`, plus `station` in LAT and LTU | as `activities` | ODM |
| `flow` | — (by coordinate, on the nearest road link) | — | Flow |

Each country has its own admin levels:

| `country_code` | Admin geo types | Grid cell IDs |
| -------------- | --------------- | ------------- |
| `NOR` (`NO`) | `country`, `admin_lvl_1` (fylke), `admin_lvl_2` (kommune), `admin_lvl_3` (delområde), `admin_lvl_4` (grunnkrets) | SSB squares, 14 digits (`22622506649500`) |
| `EST` (`EE`) | `country`, `admin_lvl_1` (maakond), `admin_lvl_2` (omavalitsus), `admin_lvl_3` (asustusüksus) | INSPIRE (`1kmN4111E5311`) |
| `LAT` (`LV`) | `country`, `admin_lvl_1` (novads), `station` (border crossings, ODM only) | INSPIRE |
| `LTU` (`LT`) | `country`, `admin_lvl_2` (savivaldybė), `station` (border crossings, ODM only) | INSPIRE |

- **IDs are strings with a country prefix:** `NO_2_0301` (Oslo kommune), `NO_4_03010101`,
  `EE_3_1089`, `LV_1_0001000` (Rīga), `LT_2_11` (Vilnius); `NO`, `EE`, `LV` or `LT` for
  `country`; border crossings are numbers as text (`"900001"`). Grid cells are SSB squares in
  Norway and INSPIRE IDs led by the cell size elsewhere (`250mN16479E20753`, `1kmN4111E5311`,
  `10kmN411E531`). An ID that doesn't match its geo type and country returns `400`.
- `geo_ids` (and `origin_geo_ids` / `destination_geo_ids` for ODM) may be left out to get
  every area of the geo type.
- Any other geo type for a country returns `400` with the supported values.

#### Rows, measures and privacy

- **Window.** `start_time` and `end_time` (ISO 8601, required) select every row whose
  bucket overlaps `[start_time, end_time)`. `time_bucket` is the start of the bucket as an
  ISO timestamp (`2026-10-20T00:00:00.000Z`), `batch_date` its UTC date, and `day_type` the
  kind of day (for example `weekday` or `saturday`).
- **Key columns** always come back: `batch_date`, `day_type`, `time_bucket`, the geo IDs,
  `geo_type`, names (`geo_name`) and `k5_tier`. Activity distributions return only the keys
  that vary (see [Activity distributions](#activity-distributions)).
- **`measure` is optional.** Name one or more of the table's measure columns (a comma list on
  GET, an array or comma list on POST) to get only those; leave it out to get every measure.
- **k = 5 privacy threshold in every country.** A figure that would describe fewer than 5
  people is not published. `k5_tier` says how a row was published: `total`, a cell size such
  as `1km`, `hour` (flow), or `suppressed`. A `null` measure means withheld or not available
  for that row, never zero. When you ask for every area (no `geo_ids`), rows with `geo_id`
  `suppressed` hold what was withheld from the finer areas.
- **Previews** return at most 100 rows with `"truncated": true` when there are more. Use an
  asynchronous job with `full=true` to export every row.

> **Modelled data:** activities, ODM and flow build on Telcofy's activity-based travel model
> of all residents. Columns ending in `_modelled` come from the model; `share_telco`,
> `share_counter`, `vehicles_telco` and `vehicles_counter` show how much of a figure is backed
> by mobile network or traffic counter data.

#### Synchronous data preview endpoint (GET `/data-agg`)

Usage: quick preview of the data, at most 100 rows. GET supports `agg_type` `activities`,
`activity_distributions` and `flow`; request ODM with
[POST `/data-agg`](#origindestination-matrix-odm).

**1. Flow data preview**

> **Note:** Flow is only available in the **Telcofy Dev environment**
> (`https://dev.data.api.telcofy.ai`) and requires a Dev API key.

Given a coordinate, `flow` returns the traffic on the nearest road link that has flow data in
the requested window. Flow is available hourly (default) and daily in every country.

| Parameter | Description |
| --------- | ----------- |
| `lat`, `lon` | The point to look up (required). |
| `start_time` | ISO 8601 start (required). |
| `end_time` | ISO 8601 end. Default: now. |
| `activity_type` | `hourly` (default) or `daily`. |
| `measure` | Optional flow columns (below). |

The road links within 300 m of the point are looked up, nearest first, and the response holds
the rows of the nearest one with data in the window, in both directions, each with
`distance_m` (metres from the point to the link). Many nearby links (footpaths, side roads)
carry no flow, so `distance_m` can be larger than the distance to the nearest street: check
`link_name` and `distance_m` to see which road was used. With no road with traffic within
300 m, `results` is empty.

```bash
curl -sG "https://dev.data.api.telcofy.ai/data-agg" \
  -H "x-api-key: $API_KEY" \
  --data-urlencode "agg_type=flow" \
  --data-urlencode "country_code=EST" \
  --data-urlencode "lat=59.437" \
  --data-urlencode "lon=24.7536" \
  --data-urlencode "measure=people" \
  --data-urlencode "start_time=2025-10-14T07:00:00Z" \
  --data-urlencode "end_time=2025-10-14T09:00:00Z" | jq
```

Example response:

```json
{
  "agg_type": "flow",
  "activity_type": "hourly",
  "country_code": "EST",
  "lat": 59.437,
  "lon": 24.7536,
  "start_time": "2025-10-14T07:00:00.000Z",
  "end_time": "2025-10-14T09:00:00.000Z",
  "results": [
    {
      "batch_date": "2025-10-14",
      "day_type": "weekday",
      "time_bucket": "2025-10-14T07:00:00.000Z",
      "period": "MD",
      "link_id": 501150631,
      "link_name": "Viru väljak",
      "link_type": "secondary",
      "length_m": 23.89,
      "direction": 1,
      "k5_tier": "hour",
      "people": 866.89,
      "distance_m": 24.37
    }
  ],
  "truncated": false
}
```

`results` continues with one row per bucket and `direction`, all on the same `link_id`.

| Field | Description |
| ----- | ----------- |
| `link_id`, `link_name`, `link_type`, `length_m` | The road link (OpenStreetMap-based network) and its length in metres. |
| `direction` | `1` or `-1`, the two directions of travel on the link. |
| `period` | Hourly only: the time-of-day period the hour belongs to (for example `MD`). |
| `people` (hourly) / `trips` (daily) | People travelling on the link in that direction. |
| `vehicles_total`, `vehicles_model`, `vehicles_telco`, `vehicles_counter`, `vehicles_commercial`, `vehicles_heavy`, `vehicles_local` | Vehicles on the link: the total, and by source or kind. |
| `share_telco`, `share_counter` | Share of the figure backed by mobile network or traffic counter data. |
| `distance_m` | Distance from the requested point to the link, in metres. |

Flow for every road link of a country, minor streets included, is available by request via
[Cloud Storage Export](#1-download-cloud-storage-exports) or
[Shared BigQuery Dataset](#2-query-shared-bigquery-datasets). Contact support@telcofy.ai for
more information.

**2. Activity data preview**

`activities` returns, per area and bucket, the people present and their arrivals, for one or
more areas (`geo_type` / `geo_ids`) in the `start_time` / `end_time` window. `activity_type`
is `hourly` (default) or `daily`.

For example, unique people and arrivals in Lasnamäe linnaosa, Tallinn, on 14 October 2025:

```bash
curl -sG "https://data.api.telcofy.ai/data-agg" \
  -H "x-api-key: $API_KEY" \
  --data-urlencode "agg_type=activities" \
  --data-urlencode "country_code=EST" \
  --data-urlencode "activity_type=daily" \
  --data-urlencode "geo_type=admin_lvl_3" \
  --data-urlencode "geo_ids=EE_3_0387" \
  --data-urlencode "measure=sum_unique_people,arrivals" \
  --data-urlencode "start_time=2025-10-14T00:00:00Z" \
  --data-urlencode "end_time=2025-10-15T00:00:00Z" | jq
```

Example response:

```json
{
  "agg_type": "activities",
  "measure": "sum_unique_people,arrivals",
  "start_time": "2025-10-14T00:00:00Z",
  "end_time": "2025-10-15T00:00:00Z",
  "activity_type": "daily",
  "country_code": "EST",
  "geo_type": "admin_lvl_3",
  "geo_ids": ["EE_3_0387"],
  "results": [
    {
      "batch_date": "2025-10-14",
      "day_type": "weekday",
      "time_bucket": "2025-10-14T00:00:00.000Z",
      "geo_id": "EE_3_0387",
      "geo_type": "admin_lvl_3",
      "geo_name": "Lasnamäe linnaosa",
      "k5_tier": "total",
      "sum_unique_people": 170108,
      "arrivals": 203206
    }
  ],
  "truncated": false
}
```

Activity measures:

| Measure | Geo types | Description |
| ------- | --------- | ----------- |
| `sum_unique_people` | all | Unique people seen in the area during the bucket. |
| `arrivals` | all | Arrivals into the area during the bucket. |
| `average_distance` | all | Average distance travelled to arrive. |
| `average_travel_time` | all | Average travel time to arrive. |
| `average_visit_length` | all | Average length of a visit. |
| `arrivals_<mode>_modelled` | all | Arrivals by mode: `car`, `walk`, `bike`, `transit`; plus `arrivals_other_modelled`. |
| `average_travel_time_<mode>_modelled` | all | Average travel time by mode (`car`, `walk`, `bike`, `transit`). |
| `stays_count` | grid only | Number of stays in the cell. |
| `stays_dwell_minutes` | grid only | Total minutes spent in the cell. |

Each area is counted on its own: someone seen in several grid cells counts once in each, and
cells below the privacy threshold are withheld. Do not add up grid cells to get an admin area
figure; ask for the admin geo type instead.

##### 3. Activity distributions preview {#activity-distributions}

`agg_type=activity_distributions` takes the same geo types, IDs and window as `activities`
and splits `people` and `arrivals` into bands. Each row is one band of one distribution, for
one traveller role, area and bucket. There are five distributions:

| Distribution | Bands |
| ------------ | ----- |
| `origin_lau` | The municipality the arrivals came from: `band` is its ID (`EE_2_0784`), `band_name` its name (`Tallinn`). |
| `distance` | Travel distance: `0-1 km`, `1-2 km`, `2-5 km`, `5-10 km`, `10-25 km`, `25-50 km`, `50-100 km`, `100+ km`. |
| `travel_time` | Travel time: `0-10 min`, `10-20 min`, `20-30 min`, `30-45 min`, `45-60 min`, `60-90 min`, `90+ min`. |
| `visit_length` | Time spent in the area: `0-30 min`, `30-60 min`, `60-120 min`, `120-180 min`, `180-300 min`, `300-480 min`, `480-960 min`, `960+ min`. |
| `purpose` | Trip purpose: `home`, `work`, `education`, `business`, `shopping`, `leisure`, `errands`. |

Two optional parameters narrow the rows, each a comma list on GET or an array or comma list on
POST; left out, every value is returned:

| Parameter | Values |
| --------- | ------ |
| `distribution` | One or more of `origin_lau`, `distance`, `travel_time`, `visit_length`, `purpose`. |
| `role` | One or more traveller roles: `home`, `work`, `school`, `elsewhere`. |

A distribution row carries only the columns that vary. `geo_type` and `k5_tier` are not
returned, since they repeat the request:

| Field | Returned |
| ----- | -------- |
| `batch_date`, `day_type`, `time_bucket`, `geo_id` | Always. |
| `geo_name` | Admin geo types; grid cells have no name. |
| `role` | Unless `role` names exactly one role. |
| `measure` | The distribution. Unless `distribution` names exactly one. |
| `band` | Always. |
| `band_name` | With `origin_lau`; for the other distributions it equals `band`. |
| `band_min`, `band_max`, `unit` | With `distance`, `travel_time` or `visit_length` (`unit` `km` or `min`). |
| `people`, `arrivals` | People and arrivals in the band. Use the `measure` parameter to pick one. |

Dev does not have `distribution` and `role` yet; it returns every distribution with the full
column set.

**Where do visitors come from?** Ask for `origin_lau` on the area. For example, for six 250 m
grid cells in Ülemiste City, Tallinn:

```bash
curl -s -X POST https://data.api.telcofy.ai/data-agg \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
        "agg_type": "activity_distributions",
        "country_code": "EST",
        "activity_type": "daily",
        "geo_type": "grid_250m",
        "geo_ids": ["250mN16491E20623", "250mN16491E20624", "250mN16491E20625",
                    "250mN16492E20623", "250mN16492E20624", "250mN16492E20625"],
        "distribution": "origin_lau",
        "start_time": "2025-10-14T00:00:00Z",
        "end_time": "2025-10-15T00:00:00Z"
      }' | jq
```

Then fetch the rows from the [results endpoint](#activities) (shortened):

```json
{
  "job_id": "b8b1a362-dfa3-4488-8c84-0747d428ebdb",
  "status": "completed",
  "country_code": "EST",
  "preview": [
    {
      "batch_date": "2025-10-14",
      "day_type": "weekday",
      "time_bucket": "2025-10-14T00:00:00.000Z",
      "geo_id": "250mN16491E20623",
      "role": "work",
      "band": "EE_2_0141",
      "band_name": "Anija vald",
      "people": 2,
      "arrivals": 2
    }
  ],
  "truncated": true
}
```

The six cells hold more than 100 origin rows, so the preview is cut (`"truncated": true`). Add
`"full": true` to export every row.

Add `"role": "work"` for commuters only. To rank origins for the whole area, sum `arrivals`
by `band` over the cells and roles. Arrivals add up across cells. `people` does not, because
someone seen in two cells counts once in each.

For the six cells on 14 October 2025 this gives Tallinn 4,272 of 5,467 arrivals (78.1 %),
then Rae vald 320 and Viimsi vald 143.

With one distribution and one role named, `measure`, `role` and `band_name` are left out of the
rows. A `distance` row for the commuters (`"role": "work"`) of one cell:

```json
{ "batch_date": "2025-10-14", "day_type": "weekday", "time_bucket": "2025-10-14T00:00:00.000Z",
  "geo_id": "250mN16491E20623", "band": "2-5 km", "band_min": 2, "band_max": 5, "unit": "km",
  "people": 210, "arrivals": 215 }
```

The last band is open-ended (`100+ km`, `band_max: null`).

- **Privacy.** The k = 5 check applies to the area and bucket, so a single band can hold fewer
  than 5 people. The bands of an area add up to its arrivals.
- **Sum arrivals, not people.** `arrivals` adds up across cells, roles and bands. `people` counts
  a person once per cell, role and band, so summing it overstates unique people.
- **Preview and `truncated`.** A preview returns at most 100 rows; `"truncated": true` means
  there are more (the six cells have 218 `origin_lau` rows).
- **Every row as one CSV.** Submit with `"full": true`, wait for `completed`, then download:

```bash
curl -s https://data.api.telcofy.ai/data-agg/results/$JOB_ID/csv \
  -H "x-api-key: $API_KEY" -o origins.csv
```

The CSV is UTF-8 with a byte-order mark, and its header is the job's columns. The route returns
`409` until the export has finished.

**In the web app**, open a saved area in Activities, choose **Totals** or **Distributions** (a
distribution and optionally a role), pick the day and **Submit Job**. **Preview** shows the rows,
with Top origins for where visitors come from; **Export all rows (CSV)** downloads every row.

#### Asynchronous data aggregation endpoint (POST `/data-agg`)

For larger areas or time ranges, or when you want the full result set exported to Cloud
Storage rather than a 100-row inline preview, submit an asynchronous job. The job runs as a
BigQuery query you can poll for completion, then fetch either an inline preview or, when
`full=true`, a Cloud Storage export path.

The same submit → poll → fetch flow applies to every `agg_type`; only the request body and
the shape of the `preview` rows change.

| Body field | Description |
| ---------- | ----------- |
| `agg_type` | `activities`, `activity_distributions`, `odm` or `flow`. |
| `country_code` | `NOR`, `EST`, `LAT` or `LTU` (or `NO`, `EE`, `LV`, `LT`). Default `NOR`. |
| `start_time`, `end_time` | Required, ISO 8601. |
| `activity_type` | `hourly` or `daily`. Required for `activities`, `activity_distributions` and `odm`; flow defaults to `hourly`. |
| `measure` | Optional array (or comma list) of measure columns. Left out, every measure is returned. |
| `geo_type`, `geo_ids` | Activities and distributions: the geo type and optional IDs. |
| `distribution`, `role` | Distributions only, optional: the distributions and traveller roles to return (see [Activity distributions](#activity-distributions)). |
| `origin_geo_type`, `origin_geo_ids`, `destination_geo_type`, `destination_geo_ids` | ODM: see [below](#origindestination-matrix-odm). |
| `lat`, `lon` | Flow: the point to look up. |
| `full` | Optional `true`: export every row to Cloud Storage (the job record is kept 7 days). Otherwise the preview is 100 rows and the job record expires after about 24 hours. |

#### Activities

The steps below use the six 250 m grid cells of Ülemiste City, Tallinn, on 14 October 2025.

**Step 1 — Submit an asynchronous aggregation job** (exports to Cloud Storage when `full=true`):

```bash
curl -s -X POST https://data.api.telcofy.ai/data-agg \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
        "agg_type": "activities",
        "country_code": "EST",
        "geo_type": "grid_250m",
        "geo_ids": ["250mN16491E20623", "250mN16491E20624", "250mN16491E20625",
                    "250mN16492E20623", "250mN16492E20624", "250mN16492E20625"],
        "start_time": "2025-10-14T00:00:00Z",
        "end_time": "2025-10-15T00:00:00Z",
        "activity_type": "daily",
        "full": false
      }'
```

Example response (`202 Accepted`):

```json
{"job_id": "601e135e-1438-4c02-ae48-a4af6a9457f9", "status": "queued", "status_url": "/data-agg/status/601e135e-1438-4c02-ae48-a4af6a9457f9", "results_url": "/data-agg/results/601e135e-1438-4c02-ae48-a4af6a9457f9"}
```

**Step 2 — (Optional) Check job status:**

For long-running queries you can poll `status_url` to track progress before fetching results.

```bash
curl -s -X GET https://data.api.telcofy.ai/data-agg/status/601e135e-1438-4c02-ae48-a4af6a9457f9 \
  -H "x-api-key: $API_KEY"
```

Example response:

```json
{"job_id": "601e135e-1438-4c02-ae48-a4af6a9457f9", "status": "completed", "progress": 100, "created_at": "2026-11-04T11:24:01.674Z", "start_time": "2026-11-04T11:24:01.736Z", "end_time": "2026-11-04T11:24:01.797Z", "estimated_completion": null, "error": null}
```

In the status response, `created_at`, `start_time` and `end_time` describe the **job's**
lifecycle (when the BigQuery job was created, started and finished), not the **data** window
you requested.

**Step 3 — Fetch results:**

```bash
curl -s -X GET https://data.api.telcofy.ai/data-agg/results/601e135e-1438-4c02-ae48-a4af6a9457f9 \
  -H "x-api-key: $API_KEY"
```

Example response (`full=false`, inline preview; one of the six rows shown). With no
`measure`, every measure of the table comes back:

```json
{
  "job_id": "601e135e-1438-4c02-ae48-a4af6a9457f9",
  "status": "completed",
  "country_code": "EST",
  "preview": [
    {
      "batch_date": "2025-10-14",
      "day_type": "weekday",
      "time_bucket": "2025-10-14T00:00:00.000Z",
      "geo_id": "250mN16491E20623",
      "geo_type": "grid_250m",
      "geo_name": null,
      "k5_tier": "250m",
      "sum_unique_people": 539,
      "stays_count": 582,
      "stays_dwell_minutes": 227740.79694941867,
      "arrivals": 582,
      "average_distance": 8.791914658827116,
      "average_travel_time": 28.674269260613997,
      "average_visit_length": 391.30721125329666,
      "arrivals_car_modelled": 429,
      "average_travel_time_car_modelled": 24.613988989750563,
      "arrivals_walk_modelled": 70,
      "average_travel_time_walk_modelled": 39.29924813115171,
      "arrivals_bike_modelled": 8,
      "average_travel_time_bike_modelled": 36.39692775439471,
      "arrivals_transit_modelled": 75,
      "average_travel_time_transit_modelled": 41.158675224781035,
      "arrivals_other_modelled": 0
    }
  ],
  "truncated": false
}
```

When the job was created with `full=true`, request `GET /data-agg/results/{jobId}?full=true`
to get the export instead of an inline preview. `files` holds signed download links, valid
until `urls_expire_at` (15 minutes); request the results again for fresh links. Each file is
newline-delimited JSON, one row per line, with the same columns as the preview:

```json
{
  "job_id": "59c36453-87ab-48cd-80fd-1af0e45780b0",
  "status": "completed",
  "country_code": "EST",
  "files": [
    {
      "name": "000000000000.json",
      "size": 4459,
      "url": "https://storage.googleapis.com/telcofy-estonia-delivery-results/..."
    }
  ],
  "urls_expire_at": "2026-11-04T11:39:06.982Z",
  "gcs_folder": "gs://telcofy-estonia-delivery-results/results/<USER_ID>/59c36453-87ab-48cd-80fd-1af0e45780b0/activities_daily_est/",
  "http_path": "https://console.cloud.google.com/storage/browser/telcofy-estonia-delivery-results/results/<USER_ID>/59c36453-87ab-48cd-80fd-1af0e45780b0/activities_daily_est"
}
```

Download each file from its `url`, or read the `gcs_folder` with the OAuth token from [Section 1](#1-download-cloud-storage-exports).

`GET /data-agg/jobs` lists your jobs with their parameters, `status` and `http_path`.

#### Origin–Destination Matrix (ODM)

Set `agg_type` to `"odm"` to request Telcofy's Origin-Destination Matrix product: trips
between an origin area and a destination area, per bucket of the requested window. ODM is
POST only.

ODM jobs take the same `start_time`, `end_time`, `activity_type`, `measure` and `full`
fields as Activities, plus:

- `origin_geo_type` / `origin_geo_ids` — the origin geo type and optional IDs.
- `destination_geo_type` / `destination_geo_ids` — the destination geo type and optional IDs.

Both ends are either admin geo types, in any mix (for example `admin_lvl_4` to
`admin_lvl_2`, or `station` to `admin_lvl_1` in Latvia), or the **same** grid size on both
ends (`grid_1000m` to `grid_1000m`; `grid_250m` to `grid_1000m` returns `400`). Either end's
IDs may be left out to get every area. Rows come largest `trips` first.

**Step 1 — Submit an asynchronous ODM job:**

```bash
curl -s -X POST https://dev.data.api.telcofy.ai/data-agg \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
        "agg_type": "odm",
        "country_code": "NOR",
        "origin_geo_type": "admin_lvl_2",
        "origin_geo_ids": ["NO_2_0301"],
        "destination_geo_type": "admin_lvl_2",
        "start_time": "2026-10-20T00:00:00Z",
        "end_time": "2026-10-21T00:00:00Z",
        "activity_type": "daily",
        "full": false
      }'
```

Example response:

```json
{"job_id":"a6effca7-15c3-4fe7-9018-2eef9972d002","status":"queued","status_url":"/data-agg/status/a6effca7-15c3-4fe7-9018-2eef9972d002","results_url":"/data-agg/results/a6effca7-15c3-4fe7-9018-2eef9972d002"}
```

More request bodies:

```python
import requests

# Lithuania: 1 km cell to 1 km cell, one hour, trips only, full export
requests.post(
    "https://dev.data.api.telcofy.ai/data-agg",
    headers={"x-api-key": API_KEY},
    json={
        "agg_type": "odm",
        "country_code": "LTU",
        "origin_geo_type": "grid_1000m",
        "destination_geo_type": "grid_1000m",
        "measure": ["trips"],
        "start_time": "2026-09-25T06:00:00Z",
        "end_time": "2026-09-25T07:00:00Z",
        "activity_type": "hourly",
        "full": True,
    },
)

# Latvia: from border crossings to novads
requests.post(
    "https://dev.data.api.telcofy.ai/data-agg",
    headers={"x-api-key": API_KEY},
    json={
        "agg_type": "odm",
        "country_code": "LAT",
        "origin_geo_type": "station",
        "destination_geo_type": "admin_lvl_1",
        "start_time": "2026-09-25T00:00:00Z",
        "end_time": "2026-09-26T00:00:00Z",
        "activity_type": "daily",
    },
)
```

**Step 2 — Poll job status** exactly as described in [Step 2 above](#activities) using
the returned `status_url`.

**Step 3 — Fetch results:**

```bash
curl -s -X GET https://dev.data.api.telcofy.ai/data-agg/results/a6effca7-15c3-4fe7-9018-2eef9972d002 \
  -H "x-api-key: $API_KEY"
```

Example response for the Norwegian request above (`full=false` — inline preview, shortened),
with one entry per origin/destination pair per bucket:

```json
{
  "job_id": "a6effca7-15c3-4fe7-9018-2eef9972d002",
  "status": "completed",
  "country_code": "NOR",
  "preview": [
    {
      "batch_date": "2026-10-20",
      "day_type": "weekday",
      "time_bucket": "2026-10-20T00:00:00.000Z",
      "origin_geo_id": "NO_2_0301",
      "destination_geo_id": "NO_2_0301",
      "origin_geo_name": "Oslo",
      "destination_geo_name": "Oslo",
      "origin_geo_type": "admin_lvl_2",
      "destination_geo_type": "admin_lvl_2",
      "k5_tier": "total",
      "trips": 1854976,
      "unique_people": 584780,
      "trips_car_modelled": 445800,
      "trips_walk_modelled": 853834,
      "cross_border": false
    }
  ],
  "truncated": true
}
```

Grid ODM rows have no `origin_geo_name` / `destination_geo_name`. ODM measures:

| Measure | Description |
| ------- | ----------- |
| `trips` | Estimated trips between the origin and destination. |
| `unique_people` | Unique people making those trips. |
| `trips_<mode>_modelled` | Trips by mode: `car`, `walk`, `bike`, `transit`, `other`. |
| `trips_commercial` | Commercial trips. |
| `trips_role_<role>_modelled` | Trips by traveller role: `home`, `work`, `school`, `elsewhere`; plus `trips_role_unknown`. |
| `trips_purpose_<purpose>_modelled` | Trips by purpose: `home`, `work`, `education`, `business`, `shopping`, `leisure`, `errands`; plus `trips_purpose_unknown`. |
| `share_telco`, `vehicle_trips_telco` | Share of trips, and vehicle trips, backed by mobile network data. |
| `General_Distance` | Distance between origin and destination, in metres. |
| `Average_Speed` | Average travel speed, in km/h. |
| `Average_Travel_Time`, `Average_Travel_Time_<mode>_modelled` | Average travel time, overall and by mode (`car`, `walk`, `bike`, `transit`). |
| `cross_border` | Always returned: `true` when the trip crosses the national border. |

A measure the country's data doesn't provide is `null`. Pairs below the privacy threshold
are withheld at fine levels, so adding up fine pairs undercounts total trips; ask for a
coarser geo type to get the totals.

When `full=true`, results are returned the same way as Activities — a Cloud Storage
`http_path` instead of an inline `preview`.

#### Migrating from the earlier schema

| Before | Catalogue 1.0 |
| ------ | ------------- |
| `geo_type` `admin_level_2` / `admin_level_4` (Norway, Estonia) | `admin_lvl_1` … `admin_lvl_4`, per country (see [Geo types and IDs](#geo-types-and-ids)) |
| Numeric Norwegian IDs (`301`), EHAK codes (`"784"`) | Prefixed strings (`NO_2_0301`, `EE_3_1089`), as listed by the Maps API |
| `measure` required, one column | Optional, any number of columns |
| `type` column (`hourly` / `daily`) | Gone; `batch_date`, `day_type` and `k5_tier` are always returned |
| `time_bucket` as `YYYY-MM-DD HH:MM:SS` | ISO timestamp (`2026-10-20T00:00:00.000Z`) |
| `stays_devices`, `sum_people_home`, `sum_people_work`, `sum_people_visitors` | Gone; see `activity_distributions` and the ODM `trips_role_*` measures |
| `trips_car` and other unsuffixed modes | `trips_car_modelled` etc. |
| Activities in Estonia only; ODM on 1 km cells only in the Baltics | Activities, distributions and ODM in every country, admin and grid |
| Daily flow in Estonia only; empty-link row when the road has no data | Hourly and daily flow everywhere, from the nearest link with data; no rows when none within 300 m |
| `last_modified_time` in `/data-availability` | `day_type`; tables renamed (below) |

Look up the new IDs of your areas with the Maps API, which serves the catalogue layers
(`country`, `admin_lvl_<n>`, `station`, `model_grid`, `network_links`) for every country.

### Data Availability API (`/data-availability`)

> **Note:** The `/data-availability` endpoint is only available in the **Telcofy Dev environment** (`https://dev.data.api.telcofy.ai`). It requires a separate Dev API key. Contact [support@telcofy.ai](mailto:support@telcofy.ai) to get access to Telcofy Dev and test features under development.

Use `GET /data-availability` to check which dates of a data product have been delivered
before you query or export them. The response lists one row per catalogue table and
`batch_date` that holds data, with its `day_type` and row count. Only datasets and countries
your account has been granted are returned. New deliveries show within about five minutes.

**Query parameters** — all optional. Without any parameters, the endpoint returns every
dataset and date you have access to, across all supported countries.

| Parameter | Supported values | Description |
| --------- | ---------------- | ----------- |
| `country` | `LV` (Latvia), `LT` (Lithuania), `EE` (Estonia), `NO` (Norway) | Country to check. The 3-letter codes `LAT`, `LTU`, `EST` and `NOR` are also accepted; matching is case-insensitive. Omit to check every country you have access to. |
| `dataset` | `activities`, `odm`, `flows` | Data product to check. Omit to return all datasets you have access to. |
| `start_time` | `YYYY-MM-DD` or ISO 8601 timestamp | Earliest `batch_date` to include (inclusive). Only the date part is used, so `2026-09-01T12:00:00Z` is treated as `2026-09-01`. |
| `end_time` | `YYYY-MM-DD` or ISO 8601 timestamp | Latest `batch_date` to include (inclusive). Must not be before `start_time`. |

**Check everything available for Norway:**

```bash
curl -s "https://dev.data.api.telcofy.ai/data-availability?country=NO" \
  -H "x-api-key: $API_KEY" | jq
```

Example response (shortened):

```json
{
  "results": [
    {
      "country_code": "NOR",
      "dataset": "activities",
      "table_name": "activity_adaptive_daily",
      "batch_date": "2026-10-20",
      "day_type": "weekday",
      "total_rows": 104969
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

| Field | Type | Description |
| ----- | ---- | ----------- |
| `country_code` | string | 3-letter country code (`LAT`, `LTU`, `EST` or `NOR`). |
| `dataset` | string | Data product (`activities`, `odm` or `flows`). |
| `table_name` | string | Catalogue table holding the data (below). |
| `batch_date` | string | Date (`YYYY-MM-DD`) the rows cover. |
| `day_type` | string | Kind of day, for example `weekday` or `saturday`. |
| `total_rows` | integer | Number of rows for that date. Dates with no rows are not listed. |

| `dataset` | `table_name` | Served by |
| --------- | ------------ | --------- |
| `activities` | `activity_admin_hourly`, `activity_admin_daily` (admin geo types), `activity_adaptive_hourly`, `activity_adaptive_daily` (grid) | `agg_type=activities` |
| `activities` | `activity_admin_distribution_hourly`, `activity_admin_distribution_daily`, `activity_adaptive_distribution_hourly`, `activity_adaptive_distribution_daily` | `agg_type=activity_distributions` |
| `odm` | `odm_admin_hourly`, `odm_admin_daily`, `odm_adaptive_hourly`, `odm_adaptive_daily` | `agg_type=odm` |
| `flows` | `flows_hourly`, `flows_daily` | `agg_type=flow` |

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
