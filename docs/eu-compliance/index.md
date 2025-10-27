---
sidebar_position: 1
title: EU Compliance Overview
---

# Multi-MNO Compliance Hub

Eurostat’s **Multi-MNO** programme (service contract ESTAT 2021.0400) delivers the standards Telcofy follows when producing EU-grade mobility analytics. The project combines: (1) a methodological blueprint, (2) an open-source PySpark implementation, and (3) a catalogue of statistical products for National Statistical Institutes (NSIs). This documentation cluster distils those artefacts and records how Telcofy aligns with them.

## How to navigate this section

- [Methodological Framework (Vol. I)](./methodological-framework.md) — key principles, reference vs. demonstrator scenarios, and design rules for the pipeline.
- [Use Cases (Vol. II)](./use-cases.md) — the seven statistical products (present population, usual environment, tourism, etc.) derived from MNO data.
- [Methods & Data Objects (Vol. III)](./methods.md) — detailed algorithms, equations, and intermediate datasets underlying each module.
- [Codebase & Orchestration](./codebase-overview.md) — how the open-source repository is structured and how Telcofy mirrors it operationally.
- [Quality Framework](./quality.md) — business processes, input/output QC, and reporting expectations for MNO-based statistics.
- [Staypoint Detection](./eurostat-pipeline-staypoint-detection.md) — deep dive on Continuous Time Segmentation and related staypoint logic.

## Programme snapshot

- **Timeline** — Contract awarded January 2023, concluding mid‑2025 after multi-country pilots with five participating MNOs.
- **Governance** — Driven by Eurostat’s Directorate ESTAT.A.5 with oversight from the ESS Task Force on MNO data and an external Advisory Board.
- **Resources** — Public landing page with deliverables and webinars: <https://cros.ec.europa.eu/landing-page/multi-mno-project>.
- **Tooling** — Open-source code released in 2025 (version 1); ongoing quality framework updates (D3.x) and testing reports (D5.x).

## Why it matters for Telcofy

- **Regulatory assurance** — Adhering to the MultiMNO modules lets Telcofy evidence privacy, quality, and governance controls when onboarding EU customers.
- **Interoperable outputs** — Matching USE case definitions and data schemas ensures our indicators can be benchmarked against ESS publications.
- **Future-proofing** — Tracking Eurostat revisions keeps our data-sharing agreements and infrastructure aligned with evolving EU legislation (e.g., Regulation (EU) 2024/3018, amendments to Regulation (EC) No 223/2009).

## Privacy and data access posture

- **Privacy-by-design** — Following guidance from [MNOdata4OS](https://cros.ec.europa.eu/MNOdata4OS), Telcofy restricts raw-event handling to secure computation environments, enforces staged aggregation, and retains full provenance/retention logs.
- **Sustainable access models** — Contracts mirror the MultiMNO reference scenario: explicit mandates for MNO-to-NSI sharing, cost-recovery mechanisms, and options for secure enclaves when cross-MNO fusion is required.

## Deliverables at a glance

The full documentation set is available via Eurostat’s portal: [D2.3 – Methodology, requirements, use cases and methods](https://cros.ec.europa.eu/book-page/methodology-framework-high-level-architecture-requirements-use-cases-and-methods).

| Deliverable | Focus | Telcofy alignment |
|-------------|-------|-------------------|
| [D2.3 Vol. I](https://cros.ec.europa.eu/group/6/files/2655/download) | Conceptual & methodological framework | See [Methodological Framework](./methodological-framework.md) |
| [D2.3 Vol. II](https://cros.ec.europa.eu/group/6/files/2656/download) | Statistical use cases | See [Use Cases](./use-cases.md) |
| [D2.3 Vol. III](https://cros.ec.europa.eu/group/6/files/2657/download) | Methods & data objects | See [Methods & Data Objects](./methods.md) |
| [D3.3](https://cros.ec.europa.eu/group/6/files/2658/download) | Quality framework & testing | [Quality artefacts](./quality.md) catalogued alongside module outputs   |
| [D4.4](https://cros.ec.europa.eu/group/6/files/2659/download) | Software releases & documentation | Reflected in [Codebase & Orchestration](./codebase-overview.md) |

Use the linked pages to dive deeper into each aspect. Together they provide the traceability auditors expect when validating Telcofy’s EU compliance posture.
