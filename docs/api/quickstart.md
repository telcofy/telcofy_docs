# Telcofy Data Access Quickstart

Use this quickstart to exchange your Telcofy machine-account API key for an OAuth
token, download Cloud Storage exports, and call the Data API for maps and
aggregated metrics.

---

## 1. Gather Prerequisites

- Telcofy-issued **API key** and corresponding **user ID** (delivered securely by Telcofy).
- `curl` and `jq` for command-line examples.
- `gsutil` if you prefer to copy Cloud Storage results via the CLI.

Telcofy service base URLs:

- Users API: `https://users.api.telcofy.ai`
- Data API: `https://data.api.telcofy.ai`

---

## 2. Exchange the API Key for a Cloud Storage Access Token

If you are unsure where to retrieve `YOUR_MACHINE_ACCOUNT_KEY`, see the **API key
provisioning** notes in [`authentication.md`](authentication.md).

Call `POST /login-with-apikey` to obtain a one-hour Google OAuth token scoped to
read your Cloud Storage exports.

```bash
export API_KEY="YOUR_MACHINE_ACCOUNT_KEY"
ACCESS_TOKEN=$(curl -s -X POST https://users.api.telcofy.ai/login-with-apikey \
  -H "x-api-key: $API_KEY" | jq -r .accessToken)
```

Tokens expire after ~1 hour; repeat the exchange whenever you encounter
authorization errors.

---

## 3. Download Cloud Storage Exports

Use the OAuth token as a bearer credential. The example below copies every file
under your user’s export directory.

```bash
USER_ID="YOUR_USER_ID"
gsutil -o "GSUtil:additional_http_headers=Authorization: Bearer $ACCESS_TOKEN" \
  cp -r gs://telcofy-user-data/results/YOUR_USER_ID/ ./results_YOUR_USER_ID
```

Prefer a pure HTTP workflow? Use `curl` to stream individual objects:

```bash
curl -L -H "Authorization: Bearer $ACCESS_TOKEN" \
  "https://storage.googleapis.com/telcofy-user-data/results/$USER_ID/example.json" \
  -o example.json
```

Download an entire folder with `curl` by iterating over the object list:

```bash
FILES=$(gsutil -o "GSUtil:additional_http_headers=Authorization: Bearer $ACCESS_TOKEN" \
  ls gs://telcofy-user-data/results/$USER_ID/**)

mkdir -p results_$USER_ID
for f in $FILES; do
  NAME=$(basename "$f")
  curl -L -H "Authorization: Bearer $ACCESS_TOKEN" "$f" -o "results_$USER_ID/$NAME"
done
```

Prefer Python? Use the Google Cloud Storage client with the temporary OAuth token:

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

## 4. Call the Data API (Maps & Aggregations)

The Data API accepts your Telcofy API key via the `x-api-key` header.

Retrieve geometries within a bounding box:

```bash
curl -s "https://data.api.telcofy.ai/maps?geo_type=admin_level_4&lng1=10.70&lat1=59.90&lng2=10.80&lat2=59.95" \
  -H "x-api-key: $API_KEY" | jq '.results[0]'
```

Fetch a synchronous population aggregation:

```bash
curl -s "https://data.api.telcofy.ai/data-agg?agg_type=activities&measure=sum_unique_people&start_time=2024-03-01T08:00:00Z&end_time=2024-03-01T09:00:00Z&activity_type=hourly&geo_type=grid_250m&geo_ids=22637506648500" \
  -H "x-api-key: $API_KEY" | jq '.results[0]'
```

Submit a long-running aggregation job (exports to Cloud Storage when `full=true`):

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
completes, then download the exported files from Cloud Storage using the OAuth
token retrieved earlier.

---

## 5. Keep Exploring

- Review `authentication.md` for API key exchange details and best practices.
- Consult `endpoints.md` for the full list of supported Users API and Data API routes.
- Reach out to your Telcofy account team if you need additional dataset access or
  assistance with automation.

Happy building!
