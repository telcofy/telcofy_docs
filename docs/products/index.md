---
sidebar_position: 1
title: Telcofy Products
---

# Telcofy Product Suite

Telcofy packages MultiMNO-derived analytics into commercial offerings designed for business and public-sector decision makers. Activities, ODM and Flow are delivered as **Telcofy data catalogue 1.0**: the same tables, columns and area IDs in Norway, Estonia, Latvia and Lithuania, hourly and daily, for admin areas and a model grid from 250 m to 10 km, with a privacy threshold of 5 people in every country (see the [Data Delivery Guide](../api/data-delivery.md#data-aggregation-api-data-agg)). Realtime can split local SIMs from foreign roamers (with country-of-origin metadata). Local populations may be extrapolated using the originating operator’s market-share factors, whereas foreign roamers remain un-extrapolated because cross-operator coverage cannot be observed.

## Standardised Activity Stays

- **What it measures** — Sustained device presence based on staypoint detection (e.g. devices dwelling longer than 10 minutes).
- **Use cases** — Urban planning, retail footfall benchmarking, commercial real-estate evaluation, event and venue analysis.
- **Delivery** — Hourly and daily tables per admin area and grid cell: unique people, arrivals, average travel distance, travel time and visit length, arrivals by mode (car, walk, bike, transit), and stays and dwell minutes on the grid. Activity distributions add people and arrivals by band (for example by travel distance).

## ODM: Origin–Destination Matrix

- **What it measures** — Movement flows between stay locations, capturing departures, arrivals, and trip volumes within configurable time windows.
- **Use cases** — Regional and long-distance transport planning, corridor optimisation, tourism flow analysis, infrastructure investment targeting.
- **Delivery** — Hourly and daily OD matrices between admin areas, grid cells of one size, or border crossings (Latvia, Lithuania): trips and unique people, split by mode, traveller role and trip purpose, with distance, speed and travel-time statistics and a cross-border flag.

## Telcofy Flow

- **What it measures** — Link-level traffic volumes on the road network, derived by projecting telco OD matrices through a pre-trained national traffic assignment model calibrated against ground-truth counter networks.
- **Use cases** — Road network planning, corridor and screen-line analysis, junction turning-movement estimation, infrastructure investment targeting, scenario comparison.
- **Delivery** — People (hourly) or trips (daily) and vehicle counts per OpenStreetMap road segment and direction of travel, with commercial and heavy vehicles and the share backed by mobile network and traffic counter data.

## Telcofy Realtime

- **What it measures** — Low-latency snapshots of unique devices in a geography.
- **Use cases** — Operational monitoring, traffic and crowd management, emergency response, live event operations.
- **Delivery** — Streaming or frequent snapshots, surfaced via dashboards or APIs, with optional local vs. foreign breakdowns (non-extrapolated for roamers).

