---
sidebar_position: 6
title: Quality Framework (D3.3)
---

# Quality Assurance for MultiMNO Deliveries

Deliverable **[D3.3](https://cros.ec.europa.eu/group/6/files/2659/download)** sets out the final business process model and quality framework for MultiMNO. It complements the methodological, use-case, and methods documentation (D2.3 Vols. I–III) with concrete expectations on how MNO-based statistics are governed, monitored, and reported. Below is the subset that guides Telcofy’s quality controls; consult the [Eurostat deliverables overview](https://cros.ec.europa.eu/book-page/methodology-framework-high-level-architecture-requirements-use-cases-and-methods) for the full text.

## ESS quality context

- **Conceptual baseline** — D3.3 reiterates the European Statistics Code of Practice (ES CoP) and the ESS Quality Assurance Framework (QAF) as the reference standards. It inventories which ES CoP principles and QAF indicators already apply to MNO data and where tailored interpretations or extensions are needed.
- **Quality toolbox** — The report reviews existing ESS tools (SIMS metadata, quality reports, quality indicators dashboards) and explains how they should be adapted for telecom-derived statistics.

## Input data quality (MNO-supplied feeds)

- **Network topology** and **event data** receive separate checklists with concrete metrics (missing values, format errors, out-of-range values, parsing problems).
- D3.3 proposes a *quality report template* for MNOs, capturing:
  - Dataset identifiers, temporal coverage, and sampling notes.
  - Overview metrics (row counts, error ratios) and thresholds that trigger warnings.
  - Ticketing workflow references when data defects are found.
- A collaboration agreement template (appendix) specifies the division of responsibilities between MNOs and NSIs, including SLA-style commitments for delivering corrected data.

## Throughput quality (pipeline processing)

The quality framework maps each functional module in the reference pipeline (Modules 1–19) to specific controls:

- **Pre-processing** — syntactic/semantic QC for topology and event data (aligned with D2.3 Vol. III Modules 1–12).
- **Analytical modules** — recommended validation metrics for Daily Processing (CTS, DPS, Present Population), Mid-term/Long-term permanence, Tourism modules, etc.
- **Automation** — ticketing system guidelines ensure that quality issues raised by modules feed directly into incident tracking and resolution.

## Output validation & reporting

- **Indicators** — The report proposes key quality indicators (KQIs) for present population, usual environment, tourism, and internal migration outputs. Examples include coverage ratios, stability indices, and comparisons against official benchmarks.
- **Total Error Framework** — D3.3 adopts a Total Error perspective (updating the traditional survey TSE) to highlight where measurement, processing, or integration errors may enter the MNO pipeline.
- **Quality reports** — An ESS-compliant template is provided, extending SIMS metadata to cover:
  - Method descriptions, parameter choices, and data sources.
  - Quality dimensions (relevance, accuracy, timeliness, coherence, accessibility).
  - Risk assessments and mitigation steps.

## Business process model

- D3.3 details a MultiMNO-specific business process mapped to the Generic Statistical Business Process Model (GSBPM). Key elements include:
  - Preparation and legal arrangements.
  - Data acquisition, processing, and analysis workflows across MNOs and NSIs.
  - Publication and archiving stages, including data retention requirements.
- The model highlights decision points, responsibilities, and the recommended *ticketing system* to coordinate MNO and NSI teams.

## Software quality considerations

- The report addresses software governance: version control, code review, testing regimes, and deployment practices for the reference implementation.
- Telcofy should mirror these controls (e.g., CI pipelines, automated tests, package audits) to demonstrate compliance during audits.

## Telcofy adoption checklist

1. **Embed QAF indicators** — Implement the suggested metrics for topology, events, and module outputs; surface them in dashboards accessible to QA reviewers.
2. **Adopt MNO quality reports** — Ensure data-sharing agreements include the D3.3 template and enforce delivery of quality annexes with each data exchange.
3. **Integrate ticketing** — Route automated quality warnings (from Modules 1–19) into Telcofy’s incident/ticketing platform with traceable resolution workflows.
4. **Publish SIMS-aligned metadata** — When releasing statistics to EU stakeholders, package outputs with the extended SIMS quality report defined in D3.3.
5. **Align business processes** — Map Telcofy’s internal RACI matrix to the GSBPM-based process (data acquisition, processing, publication) described in the deliverable.
6. **Maintain software QA** — Record tests, code reviews, and release notes to mirror the software quality expectations in D3.3.

By following these guidelines Telcofy can show that its end-to-end production system not only uses the MultiMNO methodology, but also meets the ESS quality obligations laid out in D3.3.
