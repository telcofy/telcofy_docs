---
sidebar_position: 4
title: Probe Data Processing Pipeline
---

# Probe Data Processing Pipeline

Once pseudonymised events land in Telcofy, they're picked up by **TelcofyCore** — Telcofy's specialised processing engine, purpose-built to turn raw network events into privacy-safe mobility products. By default, TelcofyCore runs inside your own network boundary: events are compressed, analysed, and aggregated behind your firewall, and only the fully anonymised result ever leaves.

TelcofyCore processes data in two phases, typically run once per day (a near-real-time mode is also available if you stream events rather than delivering a daily batch).

## Daily processing

1. **Compress** — raw, per-event pings are coalesced into intervals, cutting data volume roughly five-fold. Everything downstream reads this compressed form.
2. **Transitions** — the day's cell-to-cell handover pattern is derived, feeding the stay-detection step below.
3. **Stay detection** — sustained dwell periods (typically 20+ minutes in one place) are identified per pseudonymised device.
4. **Quality scoring** — each stay is enriched with reliability signals based on event density and signal continuity.
5. **Identifier quality** — each device's event pattern is classified to weight downstream confidence scores.

## Rolling window processing

6. **Destination ranking** — over the pseudonym's rotation window, a device's most likely destinations are ranked (its top destination typically corresponds to home).
7. **K-safe aggregation** — stays and destinations are aggregated into shippable products, enforcing a minimum group size of five distinct devices before anything is produced. No output can ever represent fewer than five devices.

## What comes out

TelcofyCore produces a small set of standard mobility products: origin-destination matrices, presence and dwell-time summaries, home-anchored movement patterns, and a near-real-time feed for live monitoring. Every row of every product represents at least five distinct devices; no per-device or raw trajectory data is ever produced as output.

## Getting TelcofyCore running

TelcofyCore is licensed software, deployed and configured to fit your requirements. For a demo, licensing details, or help planning your deployment, contact [sales@telcofy.ai](mailto:sales@telcofy.ai).
