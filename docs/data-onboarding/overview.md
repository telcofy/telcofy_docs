---
sidebar_position: 1
title: Data Onboarding Overview
---

# Data Onboarding

Telcofy turns network signalling into privacy-safe mobility intelligence. Before any of that analysis happens, every event has to make its way from your network into ours. This section covers that first leg of the journey: how pseudonymised network data leaves your infrastructure, arrives at Telcofy, and enters the pipeline that produces our mobility products.

Three stages, each covered in its own page:

1. **[Pseudonymization](./pseudonymization.md)** — how device identifiers are protected on your side, before anything reaches Telcofy.
2. **[Probe Data Ingest Pipeline](./probe-data-ingest.md)** — the two supported ways to get pseudonymised events into Telcofy: batched Parquet files, or a Kafka-compatible stream.
3. **[Probe Data Processing Pipeline](./probe-data-processing.md)** — what TelcofyCore does with that data once it arrives, on the way to producing aggregated, k-anonymous outputs.

By default, Telcofy works entirely from data you've already pseudonymised and delivered to us — no per-device data ever needs to touch infrastructure Telcofy controls. If any part of this pipeline doesn't exist on your side yet, Telcofy Professional Services can help you build it. Reach out to [sales@telcofy.ai](mailto:sales@telcofy.ai).
