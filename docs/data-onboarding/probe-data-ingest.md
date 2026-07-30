---
sidebar_position: 3
title: Probe Data Ingest Pipeline
---

# Probe Data Ingest Pipeline

Once your network events are pseudonymised (see [Pseudonymization](./pseudonymization.md)), they need a path into Telcofy. We support two ingestion patterns — pick whichever fits your existing pipeline better. Both land pseudonymised data inside a private, access-controlled Telcofy environment; neither ever touches the public internet.

## Option 1: Compressed Parquet file transfer

For partners running batch exports, Telcofy accepts daily Parquet files. Your systems pseudonymise and write the day's events to a Parquet file, encrypt it, and push it into a dedicated Google Cloud Storage bucket over a private network path.

At a high level:

- Files move over a private, encrypted network connection — never the public internet.
- The receiving bucket lives in a locked-down project reachable only from your network and by the Telcofy service that consumes it.
- Every write, read, and key use is logged and monitored on both sides.

### Uploading a Parquet file

Telcofy provisions your integration with a Workload Identity Federation credential — a short-lived, keyless identity your systems exchange for a Google Cloud access token, without ever holding a long-lived credential file.

```python
import google.auth
from google.cloud import storage

# google.auth.default() picks up your Workload Identity Federation
# credential configuration (the JSON file Telcofy provisions during
# onboarding) via the GOOGLE_APPLICATION_CREDENTIALS environment variable.
credentials, project = google.auth.default(
    scopes=["https://www.googleapis.com/auth/cloud-platform"]
)

client = storage.Client(credentials=credentials)
bucket = client.bucket("telcofy-<customer>-ingest-parquet")

blob = bucket.blob("events_2026-07-30.parquet")
blob.upload_from_filename("events_2026-07-30.parquet")
```

Setting up the encryption scheme, the private network path, and the Workload Identity Federation trust itself is handled jointly during onboarding — it's not something you need to design from scratch. **Telcofy Professional Services sets this up with you end-to-end.** Reach out to [sales@telcofy.ai](mailto:sales@telcofy.ai) to get started.

## Option 2: Kafka-compatible stream ingest

For partners who'd rather stream continuously than batch daily files, Telcofy accepts a live, Kafka-compatible record stream over Google Cloud Pub/Sub. Each pseudonymised record is published to a Pub/Sub topic dedicated to your integration; a managed subscription lands every message directly into a table that Telcofy's processing pipeline reads from — no intermediate service in between.

### Publishing a record

The example below shows the shape of a typical record — adapt the fields to what your pipeline produces.

```python
import json

import google.auth
from google.cloud import pubsub_v1

# Same Workload Identity Federation credential as the Parquet flow above —
# short-lived, no exported key file.
credentials, project = google.auth.default(
    scopes=["https://www.googleapis.com/auth/cloud-platform"]
)

publisher = pubsub_v1.PublisherClient(credentials=credentials)
topic_path = publisher.topic_path(
    "telcofy-<customer>-ingest", "telcofy-<customer>-ingest"
)

# Example fields — adapt to your own pipeline's schema.
record = {
    "hashed_imsi": "6f1ed002ab5595859014ebf0951522d9",
    "timestamp": "2026-07-30T12:00:00Z",
    "cell_id": "310-410-12345-6789",
}

future = publisher.publish(topic_path, data=json.dumps(record).encode("utf-8"))
future.result()
```

Your identity is scoped to publish to this one topic and nothing else.

Already running an existing Kafka-based pipeline? Telcofy can provision a dedicated Apache Kafka-compatible server for your integration, so you can publish using the native Kafka wire protocol instead of the Pub/Sub client library shown above. We're happy to talk through what that would look like for your setup — reach out to [sales@telcofy.ai](mailto:sales@telcofy.ai).

As with the Parquet flow, the connectivity, authentication, and delivery guarantees behind this are set up jointly during onboarding rather than something you configure alone. **Telcofy Professional Services handles the integration with you**, including the Kafka-compatible option above if that's the better fit for your infrastructure.
