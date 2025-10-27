sidebar_position: 7
title: Staypoint Detection
---

# Staypoint Detection in the MultiMNO Pipeline

Eurostat’s MultiMNO reference implementation detects staypoints—periods when a subscriber is stationary in a consistent location—by combining *Present Population* estimation with the *Continuous Time Segmentation* module. Together these stages transform raw Mobile Network Operator (MNO) events into longitudinal insights that underpin official statistics on residence, mobility, and tourism. Telcofy reuses the same logic as documented in the open-source repository on [GitHub](https://github.com/eurostat/multimno).

## Input data and prerequisite layers

Staypoint detection builds upon the **silver** layer generated earlier in the pipeline:

- `SilverEventFlaggedDataObject`: cleaned usage events annotated with semantic quality flags and network metadata.
- `SilverCellConnectionProbabilitiesDataObject`: grid-to-cell probabilities derived from radio coverage and calibration routines.
- `SilverCellIntersectionGroupsDataObject`: for each day, the list of neighbouring cells that form a consistent spatial footprint.
- `EventCacheDataObject`: cached “first events of the following day” that allow segments to connect across date boundaries.

These datasets are materialised by upstream components such as Event Cleaning, Semantic Cleaning, and Cell Footprint Estimation (see [Methodological Framework](./methodological-framework.md) for the full overview).

## Present Population: probabilistic occupancy counts

The **Present Population** component (`present_population_estimation.py`) calculates occupancy per grid tile and timestamp. Although its main output is population estimates, the method establishes the temporal window that later feeds staypoint logic:

1. **Event windowing** – for each query timestamp, the code keeps events within a configurable tolerance window (`tolerance_period_s`) and selects the event closest to the time point per device (Window spec sorted by time distance, see `calculate_devices_per_cell`).
2. **Device-to-grid weighting** – device counts per cell are merged with cell-to-grid probabilities and iterated through a Bayesian normalisation loop until differences fall below `min_difference_threshold`.
3. **Persisted cache** – intermediate population distributions are written to `pp_cache` to track convergence and supply stable inputs to downstream modules.

This step ensures that when a device remains within one cell (or cluster of overlapping cells) across multiple time points, the occupancy signal remains coherent, a critical prerequisite for consistent staypoint labelling.

## Continuous Time Segmentation: stay, move, abroad, unknown

The **Continuous Time Segmentation** component (`continuous_time_segmentation.py`) converts daily batches of events into time segments tagged with behavioural states. Key stages include:

1. **Daily slicing with cross-day continuity**  
   For each date in `[data_period_start, data_period_end]`, events are filtered by error flags and domains, then unioned with the first event of the next day (via `EventCacheDataObject`). This ensures that a stay spanning midnight is not split prematurely.

2. **Context enrichment**  
   Events are joined with intersection groups to recover all overlapping cells, enabling spatial buffering when multiple towers cover the same location. If segments from the previous day exist, they are joined back to preserve ending state and cell set.

3. **Segmentation parameters**  
   Configuration knobs (defined in `continuous_time_segmentation.ini`) drive the classification logic:
   - `min_time_stay_s`: minimum dwell time for a *STAY* segment (default 900s).
   - `max_time_missing_stay_s`, `max_time_missing_move_s`, `max_time_missing_abroad_s`: largest gap tolerated between events before inserting an `UNKNOWN` state.
   - `pad_time_s`: slight temporal expansion applied to isolated segments between `UNKNOWN` blocks.
   - `domains_to_include`: inbound, domestic, outbound domains processed; outbound-only runs still depend on domestic events to close segments.
   - `local_mcc`: identifies the home country, used to classify ABROAD segments.

4. **User-level UDF**  
   Events per user are grouped and fed to a Pandas UDF (`segmentation_return_schema`). The UDF tracks sequences of events, extends segments while devices remain within overlapping cells, and creates new segments when:
   - the device crosses domain boundaries (e.g., domestic → outbound),
   - the time gap exceeds the relevant `max_time_missing_*` threshold,
   - or overlapping cells no longer intersect.

5. **State assignment**  
   Each segment receives one of four enumerated states (`SegmentStates`):
   - `STAY` – dwell longer than `min_time_stay`.
   - `MOVE` – transitions with sufficient evidence of displacement.
   - `ABROAD` – activity outside the local MCC.
   - `UNKNOWN` – gaps or ambiguous signals beyond configured tolerances.

6. **Persistence with continuity**  
   Segments are written to the silver layer (`time_segments_silver`) with `is_last` markers indicating the trailing segment per user/day. Subsequent days reuse these markers to carry context forward.

## Outputs and downstream usage

- **Staypoint table** (`time_segments_silver`): each record contains start/end timestamps, last observed event, list of contributing cells, state, and a hashed `time_segment_id`. This dataset powers Midterm/Longterm Permanence calculations, usual environment labelling, and tourism metrics.
- **Population snapshots**: the `present_population_silver` table is refreshed for each analysed timestamp and feeds daily dashboards as well as the iterative permanence scores.

Telcofy extends these outputs with add-on analytics (e.g., persistence scoring, anomaly flagging) while preserving the upstream logic to remain interoperable with Eurostat deliverables.

## Telcofy alignment checklist

- ✅ **Reuse** the Continuous Time Segmentation configuration structure so auditors can compare parameters directly with the MultiMNO defaults.
- ✅ **Preserve** the four-state taxonomy and `is_last` markers, even when enriching segments with Telcofy-specific metadata.
- ✅ **Document** any changes to tolerance windows or dwell thresholds and justify them against ESS quality guidance.
- ✅ **Propagate** population caches and time segments into Telcofy’s compliance artifacts so EU stakeholders can trace staypoint derivations end-to-end.
