# Telcofy Data Access Quickstart

Use this quickstart to exchange your Telcofy machine-account API key for an OAuth
token, download Cloud Storage exports, and call the Data API for maps and
aggregated metrics. The Users API issues Google OAuth tokens scoped to specific
services: Cloud Storage by default, or BigQuery when explicitly requested.

To obtain Telcofy API access you need a valid contract; contact sales at tom@telcofy.ai.

---

## 1. Gather Prerequisites

- Telcofy-issued **API key** (the login response echoes back your `userId` if you do not have it handy).
- `curl` and `jq` for command-line examples.
- `gsutil` if you prefer to copy Cloud Storage results via the CLI.

Telcofy service base URLs:

- Users API: `https://users.api.telcofy.ai`
- Data API: `https://data.api.telcofy.ai`

---

## 2. Exchange the API Key for a Cloud Storage Access Token

If you are unsure where to retrieve `YOUR_MACHINE_ACCOUNT_KEY`, see the **API key
provisioning** notes in [`authentication.md`](authentication.md).

Call `POST /login-with-apikey` to obtain a one-hour Google OAuth token. The
response includes both the token and the Telcofy `userId` that owns the data.
Include an optional JSON body with `{"service":"bigquery"}` when you need a
BigQuery-scoped token instead of the default Cloud Storage scope.

```bash
export API_KEY="YOUR_MACHINE_ACCOUNT_KEY"
LOGIN_RESPONSE=$(curl -s -X POST https://users.api.telcofy.ai/login-with-apikey \
  -H "x-api-key: $API_KEY")
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r .accessToken)
USER_ID=$(echo "$LOGIN_RESPONSE" | jq -r .userId)

# Request a BigQuery-scoped token instead of Cloud Storage:
# LOGIN_RESPONSE=$(curl -s -X POST https://users.api.telcofy.ai/login-with-apikey \
#   -H "x-api-key: $API_KEY" \
#   -H "Content-Type: application/json" \
#   -d '{"service":"bigquery"}')
# ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r .accessToken)
```

Tokens expire after ~1 hour; repeat the exchange whenever you encounter
authorization errors.

---

Next steps: follow [`data-delivery.md`](data-delivery.md) for download, BigQuery,
and Data API workflows once you have your OAuth or API credentials in hand.

Happy building!
