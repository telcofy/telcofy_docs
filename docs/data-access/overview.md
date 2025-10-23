---
sidebar_position: 1
---

# Data Delivery Methods Overview

Telcofy offers several pathways to explore, export, and integrate telecom insights. Choose the delivery mechanism that best fits your workflow, whether you prefer file-based exploration, SQL-driven analysis, or near-real-time API calls.

All Telcofy data products can be accessed and configured through the [Telcofy Console](https://app.telcofy.ai). If you do not yet have console access, reach out to [tom@telcofy.ai](mailto:tom@telcofy.ai) to request a trial.

Telcofy curates two product families:

- **Analytical products (Activities, ODMs, …)** — export curated files to your cloud storage bucket (see *Storage-backed datasets*), subscribe to governed tables via BigQuery Sharing, or automate retrieval through the REST API with tools like `curl`, Python, or Node.js clients.
- **Low-latency products (Telcofy Realtime)** — refreshed roughly every five minutes and best consumed via BigQuery Sharing or the REST API to keep downstream systems current.

## Storage-backed datasets

For teams that want direct file access, Telcofy curates data drops in familiar formats such as CSV, JSON, and Parquet. These assets are delivered through blob storage so you can pull them into notebooks, lakehouses, or existing ETL pipelines without additional tooling. See [API Reference](../api/quickstart.md) for more details

## BigQuery Sharing

If you already rely on Google Cloud, Telcofy's BigQuery listings provide an interactive SQL experience with governed sharing. Start with the curated listings described in the [BigQuery Sharing guide](./analytical-hub.md) to join, filter, and enrich datasets using native BigQuery tooling.

## REST API

For API-first integrations and operational systems that require programmatic access, Telcofy exposes the same curated data sets through a REST interface. Follow the [REST API quickstart](../api/quickstart.md) to authenticate, browse resources, and embed Telcofy insights into your applications.
