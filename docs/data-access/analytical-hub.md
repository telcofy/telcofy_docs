---
sidebar_position: 2
---

# Analytical Hub

Telcofy distributes curated telecom intelligence as reusable BigQuery data exchanges. By leveraging [Googele Bigquery Analytics Hub](https://cloud.google.com/bigquery/docs/analytics-hub-introduction), you can subscribe to governed datasets directly inside Google Cloud, eliminating the overhead of manual data copies and keeping all consumers aligned on a single, auto-updating source of truth.

## Why use Analytics Hub listings

- **Native BigQuery experience** — query Telcofy tables with standard SQL, join them with your internal assets, and manage access through IAM.
- **Consistent updates** — subscribed listings always point to the latest Telcofy-managed data, so you avoid drift across teams and environments.
- **Governance and observability** — Google Cloud's audit logs, tagging, and lineage features flow through to the shared datasets, simplifying compliance reviews.

## Prerequisites

- A Google Cloud project with BigQuery enabled in the `eu` multi-region.
- Permission to view and subscribe to Telcofy's `realtime_customer_views` listing.
- (For API access) The `analyticsHub.googleapis.com` service enabled plus credentials with the `bigquery.dataViewer` and `analyticshub.listings.subscribe` permissions.

## Explore available listings

Sign in to the BigQuery console and open **Analytics Hub** from the left navigation. Search for *Telcofy* to locate the `realtime_customer_views` exchange or browse via the direct link shared by the Telcofy team. The [Google Cloud guide on viewing and subscribing to listings](https://cloud.google.com/bigquery/docs/analytics-hub-view-subscribe-listings#subscribe-listings) walks through the UI elements if you are new to the workspace.

## Subscribe to Telcofy's listing

Analytics Hub supports both console-based subscriptions and fully automated flows through the REST API.

### Option A: BigQuery console

1. In the BigQuery console, open **Analytics Hub** and navigate to the `Telcofy / Real-time Customer Views` listing.
2. Review the dataset details, including the data refresh cadence and usage terms.
3. Click **Subscribe**. Choose an existing project and dataset location (must be `EU`) where the linked dataset should live.
4. Confirm. BigQuery creates a **linked dataset** in your project that mirrors the Telcofy tables. You can now run SQL queries in the `bigquery-public-data` style using the dataset name you selected.

### Option B: REST API

Automate onboarding by calling the Analytics Hub API endpoint:

```bash
curl -X POST \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  -H "Content-Type: application/json" \
  "https://analyticshub.googleapis.com/v1/projects/telcofy-norway-poc/locations/eu/dataExchanges/realtime_customer_views/listings/realtime_customer_views_19a0c4cec2a:subscribe" \
  -d '{
    "destinationDataset": {
      "datasetReference": {
        "projectId": "YOUR_PROJECT_ID",
        "datasetId": "LINKED_DATASET_NAME"
      },
      "location": "EU"
    }
  }'
```

This request subscribes the specified project to the `realtime_customer_views` listing and creates (or reuses) the linked dataset. Ensure that the caller has the required IAM roles and that the destination dataset location matches the listing region.

Once subscribed—via either method—query the linked dataset from BigQuery, schedule downstream jobs, or grant access to additional teammates through standard IAM policies.
