---
sidebar_position: 2
title: Methodological Framework
---

# MultiMNO Methodological Framework Summary

Deliverable **[D2.3 Volume I](https://cros.ec.europa.eu/group/6/files/2655/download)** of the MultiMNO project (“Development, implementation and demonstration of a reference processing pipeline for the future production of official statistics based on multiple MNO data”) codifies the conceptual standard that Telcofy aligns with when designing compliant EU products. This note distils the key elements relevant for our engineering teams. (See also the [CROS deliverables overview](https://cros.ec.europa.eu/book-page/methodology-framework-high-level-architecture-requirements-use-cases-and-methods) for context.)

## Purpose and scope

- Establishes a reference processing pipeline that the European Statistical System (ESS) can adopt for population presence and mobility statistics derived from multiple operators.
- Couples a methodological blueprint with an open-source implementation, ensuring evolvability across new use cases beyond the six piloted by the project.
- Focuses on conceptual and semantic layers; syntactic conventions and software design are detailed in other deliverables but remain consistent with this framework.

## High-level requirements

- **Methodological soundness** by incorporating state-of-the-art techniques while remaining open to future advancements.
- **Integration of prior ESS work** (e.g., ESSnet Big Data, TF-MNO) to avoid reinventing earlier findings yet replace obsolete approaches when necessary.
- **Structured consultation** with the Advisory Board and ESS domain experts to validate feasibility and statistical rigor.
- **Evolvability and modularity** so components can be swapped, extended, or re-parameterised without redesigning the entire pipeline.
- **Quality assurance and explainability** embedded at every stage, combining automated checks, human review triggers, and auditable logs.

## Reference scenario

- Assumes legally enabled access to data from *all* significant MNOs in each Member State, with harmonised privacy safeguards and sustainable business models.
- Distinguishes between reference (target future state) and demonstrator (current legal constraints) scenarios; Telcofy must be ready to operate in either.
- Mandates processing on a standard spatial grid (INSPIRE) and highlights the need for secure, privacy-preserving data handling whether on MNO premises or in trusted shared environments.

## Fundamental design principles

1. **Common spatial grid** – everything aligns to a shared INSPIRE grid; projections to administrative units happen downstream with standardised methods.
2. **Multiscale longitudinal analysis** – three stacked time horizons (daily, mid-term, long-term) progressively reduce data granularity while honouring GDPR minimisation.
3. **Input accessibility** – any module may *read* upstream data objects, but only designated modules may *write* to maintain deterministic flows.
4. **Bottom-up one-way processing** – higher-level summaries never rewrite lower-level artefacts, preventing retrospective bias.
5. **Separated integration dimensions** – temporal, spatial, and unit aggregations are handled in distinct modules wherever possible.
6. **Balance flexibility vs. parsimony** – allow multiple method variants when justified by different use cases, but avoid proliferating redundant alternatives.
7. **Soft classification & uncertainty management** – promote probabilistic labels and confidence tracking, facilitating later reweighting or disclosure control.

## Pipeline overview

The methodology decomposes the processing flow into six macro stages (Figure references in the deliverable):

1. **Network topology ingestion (syntactic checks + spatial enrichment)**  
   Standardises cell identifiers, grid mappings, and overlapping-cell groups to support coverage modelling.

2. **Event data processing**  
   - Syntactic cleansing of raw events (CDRs, IPDRs) followed by semantic validation (e.g., impossible jumps, non-existent cells).  
   - Generates device-level quality metrics to flag sparse or anomalous behaviour.

3. **Multi-scale longitudinal analysis per device**  
   - Daily processing (e.g., Continuous Time Segmentation, Daily Permanence Score) yields “daily summaries”.  
   - Mid-term modules aggregate daily outputs (monthly/quarterly) before long-term labelling (usual environment, residence).  
   - Modular structure enables parallel methods tailored to different use cases (snapshot vs. longitudinal).

4. **Indicator calculation per use case**  
   - Recombines daily/mid-term/long-term summaries with configuration metadata to produce thematic indicators (present population, tourism, internal migration, etc.).  
   - Supports alternative inference strategies (direct totals, rescaling, weighting) while tracking the statistical population used per indicator.

5. **Multi-MNO data fusion and transfer**  
   - Defines both a *basic* approach (single-MNO aggregates, SDC applied before leaving premises) and an *advanced* approach (secure enclave enabling individual-level fusion of summaries).  
   - Aligns responsibilities between MNOs, NSIs, and potential trusted third parties.

6. **Statistical Disclosure Control (SDC) and quality checks**  
   - Applies output SDC and harmonised quality reporting prior to dissemination.  
   - Maintains audit trails that demonstrate compliance with privacy regulations and ESS quality frameworks.

## Supporting assets

- **Glossary** (Annex 2) ensures a shared vocabulary across NSIs and industry partners—critical when interpreting Telcofy deliverables.
- **Annex on project tasks** maps methodological design (Task 2) to software development (Task 4), clarifying where Telcofy should plug in enhancements.

## Telcofy alignment notes

- Maintain the bronze/silver/gold layering and INSPIRE grid usage so Telcofy outputs remain interoperable with ESS artefacts.
- When extending or substituting modules (e.g., alternative staypoint algorithms), document decisions against the principles above and retain explainability metadata.
- Respect the bottom-up one-way processing rule—especially when introducing Telcofy’s add-ons for forecasting or anomaly detection—to avoid retroactive modification of lower-level summaries.
- Prepare for both basic and advanced fusion setups: ensure our contractual and technical controls can operate when only aggregated data leave MNO premises or when secure enclaves become available.

Refer to the full deliverable [D2.3 Vol. I](https://cros.ec.europa.eu/group/6/files/2655/download) for diagrammatic details and the exhaustive specification of objects, functions, and quality rules.

