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
   `demo-test-user-1@telcofy-norway-poc.iam.gserviceaccount.com`).
2. During account provisioning the account receives the `roles/bigquery.user` role on
   the Telcofy project.
3. Point your queries directly at Telcofy’s dataset.

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
BQ_PROJECT_ID = "telcofy-norway-poc"
BQ_DATASET_ID = "realtime_shared"
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

**Delete a map:**

```bash
curl -s -X DELETE https://users.api.telcofy.ai/admin/maps/$MAP_ID \
  -H "x-api-key: $API_KEY"
```

### Realtime Admin API (`/realtime`)

Enable or disable realtime monitoring for saved admin maps by calling
`https://data.api.telcofy.ai/admin/realtime`.

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

### Data Aggregation API (`/data-agg`)
// THIS FEATURE UNDER DEVELOPMENT

Use `/data-agg` to request Telcofy’s analytical products (Activities and Origin-Destination
Matrix). Start with synchronous previews or submit asynchronous jobs that export detailed
results to Cloud Storage.

**Fetch a synchronous population aggregation** (feature preview):

```bash
curl -s "https://data.api.telcofy.ai/data-agg?agg_type=activities&measure=sum_unique_people&start_time=2024-03-01T08:00:00Z&end_time=2024-03-01T09:00:00Z&activity_type=hourly&geo_type=grid_250m&geo_ids=22637506648500" \
  -H "x-api-key: $API_KEY" | jq '.results[0]'
```

Submit an asynchronous aggregation job (exports to Cloud Storage when `full=true`):

```bash
curl -s -X POST https://data.api.telcofy.ai/data-agg \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
        "agg_type": "activities",
        "measure": "sum_unique_people",
        "start_time": "2024-03-01T00:00:00Z",
        "end_time": "2024-03-01T23:59:59Z",
        "activity_type": "daily",
        "geo_type": "grid_1000m",
        "geo_ids": [22637506648500, 22640006648500],
        "full": true
      }'
```

Poll `/data-agg/status/{jobId}` and `/data-agg/results/{jobId}` until the job
completes, then download the exported files from Cloud Storage using the OAuth token
retrieved earlier.

---

## 4. Keep Exploring

- Review [`authentication.md`](authentication.md) for endpoint descriptions and best practices.
- Consult [`endpoints.md`](endpoints.md) for a full list of REST routes.
- Need more datasets or automation help? Contact your Telcofy account team.
