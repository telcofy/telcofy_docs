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

Call `POST /login-with-apikey` to trade your machine-account API key for a short-lived
Google OAuth token. The full CLI walkthrough (including the optional BigQuery scope
request) lives in the quickstart — see
[`quickstart.md`](quickstart.md#2-exchange-the-api-key-for-a-cloud-storage-access-token).

Keep in mind:

- Tokens are valid for roughly one hour; inspect `expireTime` in the response.
- The default scope is `https://www.googleapis.com/auth/devstorage.read_only`; include
  `{"service":"bigquery"}` in the request body when you need BigQuery access.
- The response echoes your `userId`; reuse it when downloading Cloud Storage exports or
  labelling results.

---

## 3. Calling the Admin API with an API Key

For admin map management, realtime monitoring, and aggregation examples, see
[`data-delivery.md`](data-delivery.md#3-call-the-data-api-realtime--aggregations).

---

## 4. Security Best Practices

- Treat API keys as secrets—do not embed them in mobile apps, client-side code, or public repositories.
- Rotate keys periodically (quarterly recommended) and immediately when staff change roles.
- Restrict Cloud Storage downloads to secured environments; OAuth tokens inherit read-only access to your results folder.
- If an API key is suspected to be compromised, request an immediate rotation from Telcofy support.
- Audit usage via `/users/:uid/machine-accounts/list` or Telcofy-provided dashboards when available.

Stay secure!
