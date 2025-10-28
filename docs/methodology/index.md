---
sidebar_position: 3
title: Methodology
---

# Telcofy Methodology Overview

Telcofy’s analytics follow the Eurostat **MultiMNO** methodology. The summaries below use business-friendly names, with the original EU terminology in brackets so analysts can cross-check the detailed specifications in the [EU Compliance library](../eu-compliance/index.md) and [Use Case catalogue](../eu-compliance/use-cases.md).

## Activity Stays (Staypoint Detection)

- **What we do** — detect locations where devices linger for meaningful periods (for example, longer than 10 minutes) by analysing cleaned event streams.
- **Why it matters** — reveals how busy a site is and how long visitors remain, powering retail footfall studies, venue performance reviews, and destination benchmarking.
- **Tech notes** — Implementation details, including event ingestion, windowing, and cache handling, are described in the [Staypoint Detection guide](../eu-compliance/eurostat-pipeline-staypoint-detection.md) and the processing modules in [Methods & Data Objects](../eu-compliance/methods.md).

## Population Snapshots (Present Population Estimation)

- **What we do** — estimate how many unique devices are present in every grid tile at defined timestamps using Bayesian weighting against cell-coverage probabilities.
- **Why it matters** — provides crowd counts for city operations, event management, safety monitoring, and infrastructure planning.
- **Tech notes** — See Module 13 in [Methods & Data Objects](../eu-compliance/methods.md) for tolerance windows, iteration thresholds, and quality outputs referenced by NSIs.

## Movement Segments (Continuous Time Segmentation)

- **What we do** — label each stretch of time as STAY, MOVE, ABROAD, or UNKNOWN, generating a high-resolution activity timeline.
- **Why it matters** — unlocks commuting routines, trip sequences, peak travel windows, and visit sequencing.
- **Tech notes** — The [Staypoint Detection guide](../eu-compliance/eurostat-pipeline-staypoint-detection.md) details key inputs (semantic-cleaned events, intersection groups), **segmentation parameters** (minimum stay duration, maximum gaps, domain filters, MCC rules), and **state assignment** logic that produces labelled segments with continuity markers.

## Usual Places (M-Usual Environment Indicators)

- **What we do** — roll up movement segments over weeks and months to determine people’s habitual locations (home, work/school, and other frequented spots).
- **Why it matters** — exposes catchment areas, workplace concentrations, secondary-home patterns, and tourist routines for planning and marketing teams.
- **Tech notes** — Mid-term aggregation settings, confidence measures, and recommended outputs are covered in Module 14 of [Methods & Data Objects](../eu-compliance/methods.md) and the relevant use cases in [Vol. II](../eu-compliance/use-cases.md).

## Home Base Identification (M-Home Location Indicators)

- **What we do** — pinpoint each device’s likely home using long-term permanence scores, with confidence metrics and change alerts.
- **Why it matters** — offers accurate residential baselines for real-estate analysis, public-service targeting, audience segmentation, and churn detection.
- **Tech notes** — Module 15 in [Methods & Data Objects](../eu-compliance/methods.md) outlines the scoring thresholds, quality metrics, and metadata fields shared with NSIs.

## Relocation Tracking (Internal Migration)

- **What we do** — compare historical home bases to flag moves between districts or cities, distinguishing temporary from sustained relocations.
- **Why it matters** — informs housing strategy, infrastructure investment, workforce planning, and regional development initiatives.
- **Tech notes** — Migration computation, confidence flags, and reporting templates are defined in Module 16/17 of [Methods & Data Objects](../eu-compliance/methods.md) and the migration section of [Use Cases](../eu-compliance/use-cases.md).

## Putting it all together

1. **Activity Stays** and **Movement Segments** produce the raw behavioural timeline.
2. **Population Snapshots** and **Usual Places** aggregate those timelines into daily and monthly intelligence.
3. **Home Base Identification** and **Relocation Tracking** deliver long-term insights, enabling products such as OD matrices and real-time dashboards showcased in the [Telcofy Product Suite](../products/index.md).

All modules honour privacy constraints, separate local versus foreign SIMs, and support market-share extrapolation where feasible, ensuring results are trustworthy for commercial and technical teams alike.
