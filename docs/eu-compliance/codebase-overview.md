---
sidebar_position: 5
title: Codebase & Orchestration
---

# MultiMNO Reference Codebase

The open-source **MultiMNO** repository ([GitHub](https://github.com/eurostat/multimno)) implements the end-to-end pipeline mandated by Eurostat. Telcofy mirrors this structure so that every processing step, quality artefact, and configuration can be mapped back to the ESS reference.

## Architectural building blocks

- **Component-based Spark jobs** — each processing step subclasses a common `Component`, standardising configuration parsing, Spark session management, and IO (`multimno/core/component.py`).
- **Config-driven orchestration** — `orchestrator_multimno.py` reads a JSON pipeline definition and launches each component via `spark-submit`, capturing exit codes that distinguish success, warnings, or errors.
- **Reusable data objects** — bronze (raw), silver (curated), and gold (publishable) layers are represented by typed IO wrappers (`multimno/core/data_objects`). Schema definitions, partitioning strategies, and helper methods (e.g., size, head, partition count) keep quality checks consistent.

## Lifecycle at a glance

1. **Setup / reference data**  
   Generate INSPIRE grid tiles, geo-enrichment tables, and auxiliary mappings (holidays, MCC → ISO, time zones).

2. **Daily ingestion & cleaning**  
   - Ingest raw network topology and event streams.  
   - Apply syntactic + semantic cleaning modules plus device-level quality metrics.

3. **Coverage modelling**  
   - Estimate signal strength, cell footprints, and connection probabilities (Modules 3–5).  
   - Produce the grid-to-cell probabilities consumed by analytical modules.

4. **Daily analytics**  
   - Present Population estimation.  
   - Continuous Time Segmentation (CTS).  
   - Daily Permanence Score (DPS).

5. **Longitudinal analytics**  
   - Mid-term and long-term permanence scoring.  
   - Usual Environment, Home Location, Internal Migration.  
   - Tourism (inbound/outbound) indicators.

6. **Aggregation & delivery**  
   - Secure fusion across MNOs.  
   - Projection to target geographies.  
   - Estimation/calibration plus Statistical Disclosure Control (SDC).  
   - Publishing of gold datasets and quality dashboards.

## Configuration hierarchy

- `pipe_configs/pipelines/*.json` — execution graphs with ordered component IDs.
- `pipe_configs/configurations/general_config.ini` — shared Spark, IO, logging, and temp-path settings.
- Component-specific INIs — override or extend per-module parameters (e.g., tolerances, pruning thresholds, quality gates).
- Sample data (`sample_data/lakehouse`) — synthetic lakehouse for local validation.

## Supporting assets

- **Documentation** (`docs/`) — system requirements, pipeline diagrams, developer guides.
- **Deployment** (`deployment/`) — Dockerfiles and scripts for containerised execution.
- **Tests** (`tests/`) — unit and integration tests aligning with Eurostat’s quality modules.

## Telcofy checklist

- Keep component IDs and configuration keys unchanged so regulators can diff our pipelines against MultiMNO.
- Persist orchestrator logs and module output paths; they provide the audit trail for ESS quality reviews.
- When extending components, add new configuration options rather than modifying defaults silently. Document overrides in Telcofy’s run books.
