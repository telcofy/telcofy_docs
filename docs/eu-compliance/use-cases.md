---
sidebar_position: 3
title: MultiMNO Use Cases
---

# MultiMNO Use Case Portfolio

Deliverable **[D2.3 Volume II](https://cros.ec.europa.eu/group/6/files/2656/download)** inventories the statistical products that Eurostat’s MultiMNO pipeline can generate from mobile network operator (MNO) data. Telcofy reuses these definitions when mapping our offerings to EU stakeholder expectations. The sections below condense the seven headline use cases (with sub-variants) and highlight their operational implications. (See the [CROS deliverables overview](https://cros.ec.europa.eu/book-page/methodology-framework-high-level-architecture-requirements-use-cases-and-methods) for the full documentation set.)

## UC 1.A — Present Population Estimation

- **Output**: headcount of all persons physically present in a spatial unit at a given timestamp; optionally extended with visit frequency or dwell time.  
- **Spatial scope**: INSPIRE grid (100×100 m) as processing baseline; output can be reprojected to any NSI-defined zoning (census areas, municipalities, etc.).  
- **Temporal resolution**: configurable snapshots (e.g., every two hours); reference scenario targets daily coverage, while demonstrator runs may focus on exemplar days/times.  
- **Value**: supports census validation, emergency planning, social policy, and environmental accounts by exposing near-real-time population distribution, including non-residents.

## UC 2 — Usual Environment & Derived Indicators

### UC 2.A — M-Usual Environment (M-UE)
- Identifies the set of locations a person frequents (home, work/study, secondary homes, “unspecified usual places”).  
- Aggregates by grid or administrative geography to quantify how many people anchor their routine in each area, how many usual places they maintain, and the distances between them.  
- Requires longitudinal observation (recommended 12 months) to capture seasonality and to guard against misclassification.

### UC 2.B — M-Home Location
- Derives residential population estimates exclusively from behavioural data (time spent, overnight presence) instead of subscription addresses.  
- Outputs can be stratified by age group, socio-economic proxies, or housing type once integrated with auxiliary registers.  
- Useful for census frame updates, housing policy, and monitoring second-home usage.

### UC 2.C — Access to Services
- Combines M-UE footprints with service locations (schools, hospitals, retail) to profile accessibility and service catchments.  
- Produces indicators such as travel time distributions, share of population within defined service radii, and identification of underserved areas.  
- Informs spatial justice debates, infrastructure planning, and resilience assessments.

## UC 3 — Mobility Profiles

### UC 3.A — Usual Mobility (M-UM)
- Tracks the recurring flows between usual environment locales (e.g., typical daily itineraries, clusters of grid tiles).  
- Outputs include dominant movement chains, distance bands, and temporal rhythms (weekday vs. weekend, seasonal shifts).  
- Downstream use: transport modelling, functional area delineation, and validation of smart city interventions.

### UC 3.B — Commuting
- Focuses on home-to-work/study journeys inferred from M-UE labelling.  
- Delivers origin–destination matrices, modal proxies (derived from travel speed and corridor selection), and peak-load diagnostics.  
- Supports labour market intelligence, public transit scheduling, and greenhouse-gas accounting.

## UC 4 — M-Functional Urban Areas (M-FUA) & Greater City Boundaries

- Fuses M-UE and M-UM indicators to delineate urban cores and commuting zones based on observed mobility rather than static administrative limits.  
- Produces alternative FUA geometries, dynamic “greater city” extents, and population tallies per zone.  
- Enables NSIs to refresh national FUA lists, benchmark against Eurostat definitions, and study peri-urban expansion.

## UC 5 — Tourism Statistics

### UC 5.A — Domestic Touristic Arrivals & Nights Spent
- Detects overnight trips outside the individual’s usual environment but within the country.  
- Reports arrivals, nights, and multi-destination itineraries at fine spatial resolution; can differentiate leisure vs. business using dwell-time heuristics plus auxiliary data.

### UC 5.B — Domestic Same-Day Visits
- Captures excursions without overnight stays by flagging out-of-UE travel and same-day return.  
- Outputs include visitor counts, average stay duration, and trip purpose proxies.

### UC 5.C — Inbound Tourism
- Monitors foreign devices roaming on domestic networks; classifies country of origin via MCC/MNC and identifies inbound travel patterns.  
- Requires careful handling of multi-roaming behaviours (devices switching between operators) and collaboration with MNOs for complete coverage.  
- Outputs feed balance-of-payments, regional tourism boards, and crisis response (e.g., pandemic border controls).

### UC 5.D — Outbound Tourism
- Follows domestic subscribers abroad by leveraging outbound roaming records.  
- Produces counts of travellers, nights spent, visited countries/regions, and trip chains.  
- Complements UC 5.C to deliver a full inbound/outbound tourism satellite account.

## UC 6 — Exposure to Risks

- Integrates present population, usual environment, and hazard layers (natural disasters, pollution, industrial sites) to quantify population exposure.  
- Supports dynamic risk maps, early warning prioritisation, and impact assessment of mitigation measures.  
- Requires prompt data provisioning to civil protection agencies while maintaining statistical disclosure controls.

## UC 7 — Internal Migration

- Uses long-term permanence scores and successive home-location labels to detect relocations between administrative units.  
- Generates migration flows, net balances, and duration-of-stay statistics; can distinguish temporary vs. permanent moves by observing post-move stability.  
- Benefits demographic analysis, housing supply forecasts, and regional funding formulas.

---

**Telcofy action points**

1. **Metadata parity** — ensure our product catalogue references the same UC IDs and terminology when interacting with NSIs or Eurostat.  
2. **Parameter transparency** — document UE, UM, and tourism thresholds so auditors can reconcile Telcofy outputs with MultiMNO defaults.  
3. **Quality + uncertainty** — propagate the soft-classification paradigm (confidence scores, warning flags) to every UC export.  
4. **Privacy posture** — preserve the disclosure-control assumptions (basic vs. advanced data fusion) when configuring data sharing agreements.
