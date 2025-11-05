--- FILE: index.mdx ---

---
sidebar_position: 1
title: Welcome to Telcofy
slug: /
hide_title: true
---

import AnimatedTelcofyPin from '@site/src/components/HomepageFeatures/TelcofyPin';
import ContactSection from '@site/src/components/ContactSection';
import Link from '@docusaurus/Link';

<div style={{
  background: '#000',
  color: '#fff',
  padding: '2rem 2rem',
  marginBottom: '3rem',
  marginTop: '1rem',
  marginLeft: '-2rem',
  marginRight: '-2rem',
  textAlign: 'center',
  borderRadius: '8px'
}}>
  <div style={{display: 'flex', justifyContent: 'center', marginBottom: '0.5rem'}}>
    <AnimatedTelcofyPin width={120} height={120} />
  </div>
  <h1 style={{color: '#fff', fontSize: '2rem', marginTop: '0.5rem', marginBottom: '0.5rem'}}>Telcofy Documentation</h1>
  <p style={{fontSize: '1rem', marginBottom: '0', color: '#ddd'}}>Transform Telco Data into Value - EU Compliance & Analytics Platform</p>
</div>

---

## Products

- [Telcofy Product Suite](./products/index.md)

## Methodology

- Explore the [methodology section](./methodology/index.md) for analytical frameworks and best practices.

## EU Compliance

Telcofy aligns with Eurostat's MultiMNO standards:

- [EU Compliance overview](./eu-compliance/index.md)
- [Methodological Framework (Vol. I)](./eu-compliance/methodological-framework.md)
- [Use Cases (Vol. II)](./eu-compliance/use-cases.md)
- [Methods & Data Objects (Vol. III)](./eu-compliance/methods.md)
- [Codebase & Orchestration](./eu-compliance/codebase-overview.md)
- [Quality Framework](./eu-compliance/quality.md)
- [Staypoint Detection](./eu-compliance/eurostat-pipeline-staypoint-detection.md)

## Data Delivery

- [Data Delivery Overview](./data-access/overview.md)
- [Google Bigquery Sharing](./data-access/analytical-hub.md)

## API Reference

- [Quickstart](./api/quickstart.md)
- [Authentication](./api/authentication.md)
- [Endpoints](./api/endpoints.md)

---

<ContactSection />


--- FILE: getting-started.md ---

---
sidebar_position: 2
title: Getting Started
---

# 🚧 Getting Started - Under Construction 🚧

This section is currently being updated with the latest installation and setup instructions.

## Coming Soon

We're preparing comprehensive guides for:
- Installation procedures
- Initial configuration
- Quick start tutorials
- Best practices

Please check back soon for updates.

## Contact Us

For immediate assistance with getting started:
- 📧 Email: tom@telcofy.ai
- 🐙 GitHub: [github.com/telcofy](https://github.com/telcofy)

--- FILE: products/index.md ---

---
sidebar_position: 1
title: Telcofy Products
---

# Telcofy Product Suite

Telcofy packages MultiMNO-derived analytics into commercial offerings designed for business and public-sector decision makers. Every dataset can split local SIMs from foreign roamers (with country-of-origin metadata). Local populations may be extrapolated using the originating operator’s market-share factors, whereas foreign roamers remain un-extrapolated because cross-operator coverage cannot be observed.

## Standardised Activity Stays

- **What it measures** — Sustained device presence based on staypoint detection (e.g. devices dwelling longer than 10 minutes).
- **Use cases** — Urban planning, retail footfall benchmarking, commercial real-estate evaluation, event and venue analysis.
- **Delivery** — Time-bucketed activity tables with duration bands, dwell counts, and optional segmentation by local vs. foreign SIMs.

## ODM: Origin–Destination Matrix

- **What it measures** — Movement flows between stay locations, capturing departures, arrivals, and trip volumes within configurable time windows.
- **Use cases** — Regional and long-distance transport planning, corridor optimisation, tourism flow analysis, infrastructure investment targeting.
- **Delivery** — Aggregated OD matrices with device counts, journey-time stats, and origin/destination attributes (including country for foreign SIMs).

## Telcofy Realtime

- **What it measures** — Low-latency snapshots of unique devices in a geography.
- **Use cases** — Operational monitoring, traffic and crowd management, emergency response, live event operations.
- **Delivery** — Streaming or frequent snapshots, surfaced via dashboards or APIs, with optional local vs. foreign breakdowns (non-extrapolated for roamers).


--- FILE: methodology/privacy-anonymization.md ---

---
sidebar_position: 2
title: Privacy & Anonymization
---

# Privacy & Anonymization

Advanced techniques to protect individual privacy while maintaining data utility for telecommunications analytics.

## Privacy-First Approach

Telcofy implements privacy protection at every stage of data processing, ensuring that individual privacy is preserved while enabling valuable insights for telecommunications analytics.

## Core Anonymization Techniques

### 1. K-Anonymity

```pseudocode
FUNCTION apply_k_anonymity(records, k_value)
    anonymized_records = []
    grouped_records = group_by_quasi_identifiers(records)
    
    FOR each group IN grouped_records
        IF group.size >= k_value THEN
            generalized_group = generalize_attributes(group)
            anonymized_records.extend(generalized_group)
        ELSE
            # Group too small, apply additional generalization
            merged_group = merge_with_similar_group(group, grouped_records)
            generalized_group = generalize_attributes(merged_group)
            anonymized_records.extend(generalized_group)
        END IF
    END FOR
    
    RETURN anonymized_records
END FUNCTION
```

**K-anonymity ensures**: Each record is indistinguishable from at least k-1 other records based on quasi-identifying attributes.

### 2. Differential Privacy

```pseudocode
FUNCTION apply_differential_privacy(data, epsilon, query_function)
    # Calculate sensitivity of the query
    sensitivity = calculate_sensitivity(query_function)
    
    # Add calibrated Laplace noise
    noise_scale = sensitivity / epsilon
    noise = generate_laplace_noise(noise_scale)
    
    # Apply query and add noise
    true_result = query_function(data)
    private_result = true_result + noise
    
    RETURN private_result
END FUNCTION
```

**Differential privacy provides**: Mathematical guarantees that the presence or absence of any individual record cannot be determined from the output.

### 3. Spatial Generalization

```pseudocode
FUNCTION spatially_generalize(location_data, grid_size)
    generalized_locations = []
    
    FOR each location IN location_data
        # Map to grid cell
        grid_cell = map_to_grid(location, grid_size)
        
        # Use grid cell center as generalized location
        generalized_location = get_grid_center(grid_cell)
        generalized_locations.append(generalized_location)
    END FOR
    
    RETURN generalized_locations
END FUNCTION
```

**Spatial generalization**: Reduces location precision while maintaining geographic utility.

## Comprehensive Anonymization Pipeline

```pseudocode
FUNCTION anonymize_data(validated_records)
    anonymized_records = []
    
    FOR each record IN validated_records
        # Step 1: Remove direct identifiers
        sanitized_record = remove_direct_identifiers(record)
        
        # Step 2: Apply spatial generalization
        spatially_generalized = generalize_location(sanitized_record)
        
        # Step 3: Apply temporal generalization
        temporally_generalized = generalize_time(spatially_generalized)
        
        # Step 4: Apply k-anonymity
        k_anonymous_record = apply_k_anonymity_single(temporally_generalized)
        
        # Step 5: Add differential privacy noise
        noisy_record = add_calibrated_noise(k_anonymous_record)
        
        anonymized_records.append(noisy_record)
    END FOR
    
    RETURN anonymized_records
END FUNCTION
```

## Direct Identifier Removal

```pseudocode
FUNCTION remove_direct_identifiers(record)
    # Remove or hash direct identifiers
    record.phone_number = hash_with_salt(record.phone_number)
    record.imsi = hash_with_salt(record.imsi)
    record.imei = hash_with_salt(record.imei)
    
    # Remove names and addresses
    record.customer_name = null
    record.billing_address = null
    
    # Keep only necessary operational identifiers
    record.session_id = generate_anonymous_session_id()
    
    RETURN record
END FUNCTION
```

## Temporal Generalization

```pseudocode
FUNCTION generalize_time(record, time_granularity)
    original_timestamp = record.timestamp
    
    SWITCH time_granularity
        CASE "hour":
            generalized_time = round_to_hour(original_timestamp)
        CASE "day":
            generalized_time = round_to_day(original_timestamp)
        CASE "week":
            generalized_time = round_to_week(original_timestamp)
        DEFAULT:
            generalized_time = round_to_hour(original_timestamp)
    END SWITCH
    
    record.timestamp = generalized_time
    RETURN record
END FUNCTION
```

## Privacy Level Assessment

```pseudocode
FUNCTION assess_privacy_level(record)
    privacy_score = 0
    
    # Assess based on data sensitivity
    IF contains_location_data(record) THEN
        privacy_score += 30
    END IF
    
    IF contains_behavioral_data(record) THEN
        privacy_score += 20
    END IF
    
    IF contains_demographic_data(record) THEN
        privacy_score += 25
    END IF
    
    # Assess based on data granularity
    IF high_temporal_resolution(record) THEN
        privacy_score += 15
    END IF
    
    IF high_spatial_resolution(record) THEN
        privacy_score += 10
    END IF
    
    RETURN classify_privacy_level(privacy_score)
END FUNCTION
```

## Utility Preservation

```pseudocode
FUNCTION optimize_utility_privacy_tradeoff(data, privacy_requirements, utility_requirements)
    best_configuration = null
    best_score = 0
    
    FOR each configuration IN generate_anonymization_configurations()
        anonymized_data = apply_anonymization(data, configuration)
        
        privacy_score = evaluate_privacy_protection(anonymized_data)
        utility_score = evaluate_data_utility(anonymized_data)
        
        IF privacy_score >= privacy_requirements THEN
            combined_score = calculate_combined_score(privacy_score, utility_score)
            
            IF combined_score > best_score THEN
                best_configuration = configuration
                best_score = combined_score
            END IF
        END IF
    END FOR
    
    RETURN best_configuration
END FUNCTION
```

## Privacy Risk Assessment

```pseudocode
FUNCTION assess_privacy_risk(anonymized_data)
    risk_factors = {}
    
    # Assess re-identification risk
    risk_factors.reidentification = assess_reidentification_risk(anonymized_data)
    
    # Assess inference risk
    risk_factors.inference = assess_inference_risk(anonymized_data)
    
    # Assess linkage risk
    risk_factors.linkage = assess_linkage_risk(anonymized_data)
    
    # Calculate overall risk score
    overall_risk = calculate_weighted_risk(risk_factors)
    
    RETURN overall_risk
END FUNCTION
```

## Anonymization Quality Metrics

```pseudocode
FUNCTION calculate_anonymization_quality(original_data, anonymized_data)
    quality_metrics = {}
    
    # Privacy metrics
    quality_metrics.k_anonymity_level = calculate_k_value(anonymized_data)
    quality_metrics.l_diversity = calculate_l_diversity(anonymized_data)
    quality_metrics.t_closeness = calculate_t_closeness(anonymized_data)
    
    # Utility metrics
    quality_metrics.information_loss = calculate_information_loss(original_data, anonymized_data)
    quality_metrics.query_accuracy = evaluate_query_accuracy(original_data, anonymized_data)
    
    # Compliance metrics
    quality_metrics.gdpr_compliance = assess_gdpr_compliance(anonymized_data)
    quality_metrics.differential_privacy_epsilon = calculate_epsilon_value(anonymized_data)
    
    RETURN quality_metrics
END FUNCTION
```

## Advanced Privacy Techniques

### Synthetic Data Generation

```pseudocode
FUNCTION generate_synthetic_data(original_data, privacy_budget)
    # Learn statistical properties
    statistical_model = learn_statistical_properties(original_data)
    
    # Apply differential privacy to model parameters
    private_model = apply_differential_privacy(statistical_model, privacy_budget)
    
    # Generate synthetic records
    synthetic_data = generate_records_from_model(private_model)
    
    RETURN synthetic_data
END FUNCTION
```

### Federated Learning Integration

```pseudocode
FUNCTION federated_anonymization(distributed_data_sources)
    global_anonymization_parameters = initialize_parameters()
    
    FOR each iteration IN federated_training_iterations
        local_updates = []
        
        FOR each data_source IN distributed_data_sources
            local_update = compute_local_anonymization_update(data_source, global_anonymization_parameters)
            local_updates.append(local_update)
        END FOR
        
        # Aggregate updates with differential privacy
        global_anonymization_parameters = aggregate_with_privacy(local_updates)
    END FOR
    
    RETURN global_anonymization_parameters
END FUNCTION
```

## Compliance Integration

Our privacy and anonymization techniques are designed to meet:
- **GDPR Requirements**: Right to be forgotten, data minimization, purpose limitation
- **ePrivacy Directive**: Consent requirements, communication confidentiality
- **Sector-Specific Regulations**: Telecommunications privacy requirements
- **Eurostat Standards**: Statistical disclosure control requirements

The anonymization process integrates seamlessly with our [EU Compliance](./eu-compliance) methodology to ensure comprehensive regulatory adherence.

--- FILE: methodology/eu-compliance.md ---

---
sidebar_position: 3
title: EU Compliance
---

# EU Compliance Methodology

Ensuring adherence to GDPR, Eurostat requirements, and other EU regulations throughout the data processing lifecycle.

## Compliance Framework

Telcofy's compliance methodology is built around three pillars:

1. **Regulatory Adherence**: Meeting all applicable EU regulations
2. **Audit Trail**: Maintaining comprehensive documentation
3. **Continuous Monitoring**: Ongoing compliance validation

## GDPR Compliance

```pseudocode
FUNCTION ensure_gdpr_compliance(data_processing_activity)
    compliance_checklist = {}
    
    # Lawful basis assessment
    compliance_checklist.lawful_basis = verify_lawful_basis(data_processing_activity)
    
    # Data minimization
    compliance_checklist.data_minimization = verify_data_minimization(data_processing_activity)
    
    # Purpose limitation
    compliance_checklist.purpose_limitation = verify_purpose_limitation(data_processing_activity)
    
    # Storage limitation
    compliance_checklist.storage_limitation = verify_retention_periods(data_processing_activity)
    
    # Accuracy principle
    compliance_checklist.accuracy = verify_data_accuracy(data_processing_activity)
    
    # Integrity and confidentiality
    compliance_checklist.security = verify_security_measures(data_processing_activity)
    
    # Accountability
    compliance_checklist.accountability = verify_documentation(data_processing_activity)
    
    RETURN validate_all_requirements(compliance_checklist)
END FUNCTION
```

### Data Subject Rights Implementation

```pseudocode
FUNCTION handle_data_subject_request(request_type, subject_identifier)
    SWITCH request_type
        CASE "access":
            return provide_data_access(subject_identifier)
            
        CASE "rectification":
            return process_data_correction(subject_identifier, request.corrections)
            
        CASE "erasure":
            return process_right_to_be_forgotten(subject_identifier)
            
        CASE "portability":
            return provide_data_export(subject_identifier, request.format)
            
        CASE "restriction":
            return restrict_data_processing(subject_identifier)
            
        CASE "objection":
            return process_objection_to_processing(subject_identifier)
            
        DEFAULT:
            return log_invalid_request(request)
    END SWITCH
END FUNCTION
```

## Eurostat Compliance

```pseudocode
FUNCTION format_for_eurostat(compliance_data)
    eurostat_formatted = {}
    
    # Apply Eurostat classification standards
    eurostat_formatted.geography = apply_nuts_classification(compliance_data.location)
    eurostat_formatted.time_period = standardize_time_format(compliance_data.timestamp)
    eurostat_formatted.statistical_unit = define_statistical_unit(compliance_data)
    
    # Apply statistical disclosure control
    eurostat_formatted.data = apply_disclosure_control(compliance_data.aggregated_values)
    
    # Add metadata required by Eurostat
    eurostat_formatted.metadata = generate_eurostat_metadata(compliance_data)
    
    # Validate against Eurostat schemas
    IF validate_eurostat_schema(eurostat_formatted) THEN
        RETURN eurostat_formatted
    ELSE
        RETURN handle_validation_errors(eurostat_formatted)
    END IF
END FUNCTION
```

### Statistical Disclosure Control

```pseudocode
FUNCTION apply_disclosure_control(statistical_data)
    controlled_data = statistical_data
    
    # Primary disclosure control
    controlled_data = apply_primary_suppression(controlled_data)
    
    # Secondary disclosure control
    controlled_data = apply_complementary_suppression(controlled_data)
    
    # Cell perturbation for additional protection
    controlled_data = apply_cell_perturbation(controlled_data)
    
    # Validate disclosure risk
    IF assess_disclosure_risk(controlled_data) > ACCEPTABLE_RISK_THRESHOLD THEN
        controlled_data = apply_additional_protection(controlled_data)
    END IF
    
    RETURN controlled_data
END FUNCTION
```

## ePrivacy Directive Compliance

```pseudocode
FUNCTION ensure_eprivacy_compliance(communication_data)
    compliance_status = {}
    
    # Confidentiality of communications
    compliance_status.confidentiality = verify_communication_confidentiality(communication_data)
    
    # Traffic data processing
    compliance_status.traffic_data = verify_traffic_data_processing(communication_data)
    
    # Location data processing
    compliance_status.location_data = verify_location_data_consent(communication_data)
    
    # Terminal equipment access
    compliance_status.terminal_access = verify_terminal_equipment_consent(communication_data)
    
    RETURN validate_eprivacy_requirements(compliance_status)
END FUNCTION
```

## Consent Management

```pseudocode
FUNCTION manage_consent(user_identifier, processing_purposes)
    consent_record = {}
    
    # Verify consent requirements
    required_consents = determine_consent_requirements(processing_purposes)
    
    # Check existing consents
    existing_consents = retrieve_user_consents(user_identifier)
    
    FOR each purpose IN processing_purposes
        IF purpose_requires_consent(purpose) THEN
            IF valid_consent_exists(existing_consents, purpose) THEN
                consent_record[purpose] = "valid"
            ELSE
                consent_record[purpose] = "required"
                request_user_consent(user_identifier, purpose)
            END IF
        ELSE
            consent_record[purpose] = "not_required"
        END IF
    END FOR
    
    RETURN consent_record
END FUNCTION
```

## Data Protection Impact Assessment (DPIA)

```pseudocode
FUNCTION conduct_dpia(processing_activity)
    dpia_assessment = {}
    
    # Step 1: Necessity and proportionality assessment
    dpia_assessment.necessity = assess_necessity(processing_activity)
    dpia_assessment.proportionality = assess_proportionality(processing_activity)
    
    # Step 2: Risk identification
    dpia_assessment.privacy_risks = identify_privacy_risks(processing_activity)
    dpia_assessment.rights_impact = assess_rights_impact(processing_activity)
    
    # Step 3: Risk mitigation measures
    dpia_assessment.mitigation_measures = design_mitigation_measures(dpia_assessment.privacy_risks)
    
    # Step 4: Residual risk assessment
    dpia_assessment.residual_risks = assess_residual_risks(dpia_assessment)
    
    # Step 5: Decision making
    IF dpia_assessment.residual_risks > ACCEPTABLE_RISK_LEVEL THEN
        dpia_assessment.recommendation = "consult_supervisory_authority"
    ELSE
        dpia_assessment.recommendation = "proceed_with_safeguards"
    END IF
    
    RETURN dpia_assessment
END FUNCTION
```

## Cross-Border Data Transfer Compliance

```pseudocode
FUNCTION ensure_transfer_compliance(data, destination_country)
    transfer_mechanism = determine_transfer_mechanism(destination_country)
    
    SWITCH transfer_mechanism
        CASE "adequacy_decision":
            return validate_adequacy_decision(destination_country)
            
        CASE "standard_contractual_clauses":
            return implement_sccs(data, destination_country)
            
        CASE "binding_corporate_rules":
            return validate_bcrs(data, destination_country)
            
        CASE "certification_mechanism":
            return validate_certification(data, destination_country)
            
        CASE "derogation":
            return apply_derogation(data, destination_country)
            
        DEFAULT:
            return block_transfer(data, destination_country)
    END SWITCH
END FUNCTION
```

## Compliance Monitoring and Reporting

```pseudocode
FUNCTION monitor_compliance_status()
    compliance_metrics = {}
    
    # GDPR compliance metrics
    compliance_metrics.gdpr = {
        data_subject_requests_response_time: calculate_average_response_time(),
        data_minimization_compliance: assess_data_minimization_compliance(),
        security_incidents: count_security_incidents(),
        breach_notification_compliance: assess_breach_notification_compliance()
    }
    
    # Eurostat compliance metrics
    compliance_metrics.eurostat = {
        reporting_deadline_compliance: assess_reporting_deadlines(),
        data_quality_scores: calculate_data_quality_scores(),
        statistical_confidentiality: assess_confidentiality_protection()
    }
    
    # ePrivacy compliance metrics
    compliance_metrics.eprivacy = {
        consent_rates: calculate_consent_rates(),
        communication_confidentiality: assess_confidentiality_measures(),
        terminal_equipment_compliance: assess_terminal_access_compliance()
    }
    
    RETURN compliance_metrics
END FUNCTION
```

## Automated Compliance Validation

```pseudocode
FUNCTION validate_compliance_automatically(processed_data)
    validation_results = {}
    
    # Automated GDPR validation
    validation_results.gdpr = run_gdpr_validation_rules(processed_data)
    
    # Automated Eurostat validation
    validation_results.eurostat = run_eurostat_validation_rules(processed_data)
    
    # Automated data quality validation
    validation_results.data_quality = run_quality_validation_rules(processed_data)
    
    # Generate compliance report
    compliance_report = generate_compliance_report(validation_results)
    
    # Alert on non-compliance
    IF detect_non_compliance(validation_results) THEN
        trigger_compliance_alert(validation_results)
    END IF
    
    RETURN compliance_report
END FUNCTION
```

## Audit Trail Management

```pseudocode
FUNCTION maintain_audit_trail(activity)
    audit_entry = {
        timestamp: current_timestamp(),
        activity_type: activity.type,
        user_identifier: activity.user,
        data_affected: activity.data_scope,
        legal_basis: activity.legal_basis,
        processing_purpose: activity.purpose,
        retention_period: activity.retention,
        security_measures: activity.security_controls
    }
    
    # Encrypt audit entry
    encrypted_entry = encrypt_audit_entry(audit_entry)
    
    # Store in tamper-evident audit log
    store_audit_entry(encrypted_entry)
    
    # Update compliance dashboard
    update_compliance_dashboard(audit_entry)
    
    RETURN audit_entry.id
END FUNCTION
```

## Integration with Privacy Framework

Our EU compliance methodology works in close integration with:
- [Privacy & Anonymization](./privacy-anonymization) - Technical privacy measures
- [Quality Assurance](./quality-assurance) - Compliance validation
- [Data Processing Pipeline](./data-pipeline) - Compliance by design
- API Integration - Compliant data access *(Coming soon)*

This comprehensive approach ensures that Telcofy not only meets current EU regulatory requirements but is also prepared for evolving privacy and data protection regulations.

--- FILE: methodology/data-pipeline.md ---

---
sidebar_position: 1
title: Data Processing Pipeline
---

# Data Processing Pipeline

The backbone of Telcofy's data transformation process, handling billions of telecommunications events while maintaining quality and compliance.

## Pipeline Overview

Our data processing pipeline consists of four main stages:

1. **Data Ingestion** - Continuous intake of raw telco data
2. **Validation & Cleansing** - Quality control and standardization
3. **Anonymization** - Privacy protection measures
4. **Compliance Processing** - EU regulation adherence

## Stage 1: Data Ingestion

```pseudocode
FUNCTION ingest_telco_data(raw_data_stream)
    FOR each data_batch IN raw_data_stream
        validate_schema(data_batch)
        apply_initial_filters(data_batch)
        queue_for_processing(data_batch)
    END FOR
END FUNCTION
```

### Data Sources
The system continuously ingests data from various telco sources:
- **Call Detail Records (CDR)**: Voice and SMS transaction data
- **Location Data**: Cell tower and GPS positioning information
- **Network Events**: Connection, handover, and quality metrics
- **Billing Records**: Usage and payment information

### Ingestion Characteristics
- **Real-time processing**: Sub-second latency for critical events
- **Batch processing**: Efficient handling of large historical datasets
- **Schema validation**: Ensuring data structure compliance
- **Rate limiting**: Preventing system overload

## Stage 2: Data Validation & Cleansing

```pseudocode
FUNCTION validate_and_cleanse(data_batch)
    validated_records = []
    
    FOR each record IN data_batch
        IF validate_required_fields(record) THEN
            cleansed_record = apply_data_cleaning_rules(record)
            standardized_record = standardize_formats(cleansed_record)
            validated_records.append(standardized_record)
        ELSE
            log_validation_error(record)
        END IF
    END FOR
    
    RETURN validated_records
END FUNCTION
```

### Validation Steps
- **Schema validation**: Ensuring data structure compliance
- **Data type validation**: Verifying field formats (dates, numbers, strings)
- **Business rule validation**: Checking logical constraints
- **Duplicate detection**: Identifying and handling duplicate records
- **Completeness checks**: Ensuring required fields are present

### Data Cleansing Rules
- **Standardization**: Converting to consistent formats
- **Normalization**: Scaling numerical values appropriately
- **Outlier detection**: Identifying and handling anomalous values
- **Missing value handling**: Imputation or exclusion strategies

## Stage 3: Anonymization Integration

```pseudocode
FUNCTION prepare_for_anonymization(validated_records)
    prepared_records = []
    
    FOR each record IN validated_records
        # Add anonymization metadata
        record.privacy_level = determine_privacy_level(record)
        record.anonymization_strategy = select_strategy(record)
        
        prepared_records.append(record)
    END FOR
    
    RETURN prepared_records
END FUNCTION
```

The pipeline seamlessly integrates with our [Privacy & Anonymization](./privacy-anonymization) module to ensure data protection.

## Stage 4: Compliance Processing

```pseudocode
FUNCTION ensure_pipeline_compliance(processed_records)
    compliant_records = []
    
    FOR each record IN processed_records
        # Apply GDPR requirements
        gdpr_compliant_record = apply_gdpr_rules(record)
        
        # Format for Eurostat requirements
        eurostat_formatted = format_for_eurostat(gdpr_compliant_record)
        
        # Validate against EU regulations
        IF validate_eu_compliance(eurostat_formatted) THEN
            compliant_records.append(eurostat_formatted)
        END IF
    END FOR
    
    RETURN compliant_records
END FUNCTION
```

## Performance Characteristics

### Throughput Metrics
- **Peak processing rate**: 1M records/second
- **Average latency**: &lt;100ms per record
- **Batch processing**: 10TB+ datasets in &lt;1 hour
- **Availability**: 99.9% uptime SLA

### Scalability Features
- **Horizontal scaling**: Auto-scaling based on load
- **Partitioning**: Intelligent data distribution
- **Caching**: Multi-level caching for frequently accessed data
- **Load balancing**: Distributed processing across nodes

## Error Handling

```pseudocode
FUNCTION handle_pipeline_errors(error_context)
    error_type = classify_error(error_context)
    
    SWITCH error_type
        CASE "validation_error":
            log_validation_issue(error_context)
            quarantine_record(error_context.record)
            
        CASE "processing_error":
            retry_with_backoff(error_context.operation)
            
        CASE "system_error":
            alert_operations_team(error_context)
            failover_to_backup_system()
            
        DEFAULT:
            log_unknown_error(error_context)
    END SWITCH
END FUNCTION
```

## Monitoring & Observability

The pipeline includes comprehensive monitoring:
- **Real-time metrics**: Processing rates, error rates, latency
- **Quality indicators**: Data completeness, accuracy scores
- **Compliance tracking**: Regulation adherence metrics
- **Performance dashboards**: System health visualization

## Integration Points

The data pipeline integrates with:
- [Quality Assurance](./quality-assurance) - Continuous quality monitoring
- [Analytics & Insights](./analytics-insights) - Downstream processing
- Performance Optimization - Efficiency improvements *(Coming soon)*
- API Integration - External data access *(Coming soon)*

--- FILE: methodology/analytics-insights.md ---

---
sidebar_position: 4
title: Analytics & Insights
---

# Analytics & Insights Generation

How Telcofy transforms processed telecommunications data into meaningful insights for business intelligence and regulatory reporting.

## Analytics Pipeline Overview

Our analytics methodology converts anonymized, compliant data into actionable insights through sophisticated algorithms and statistical methods.

## Core Analytics Functions

### Population Density Analysis

```pseudocode
FUNCTION calculate_population_density(records, grid_size)
    density_map = initialize_grid(grid_size)
    
    FOR each record IN records
        grid_cell = map_to_grid(record.location, grid_size)
        density_map[grid_cell] += record.weighted_count
    END FOR
    
    # Apply smoothing to prevent re-identification
    smoothed_density = apply_gaussian_smoothing(density_map)
    
    RETURN smoothed_density
END FUNCTION
```

### Mobility Pattern Analysis

```pseudocode
FUNCTION analyze_mobility_patterns(records)
    patterns = {}
    
    # Group by time periods
    hourly_patterns = group_by_hour(records)
    daily_patterns = group_by_day(records)
    
    # Calculate origin-destination matrices
    od_matrix = calculate_od_matrix(records)
    
    # Identify commuting patterns
    commuting_flows = identify_commuting_flows(od_matrix)
    
    patterns.hourly = hourly_patterns
    patterns.daily = daily_patterns
    patterns.commuting = commuting_flows
    
    RETURN patterns
END FUNCTION
```

## Statistical Analysis Methods

### Time Series Analysis

```pseudocode
FUNCTION analyze_temporal_trends(time_series_data)
    trends = {}
    
    # Decompose time series
    trends.seasonal = extract_seasonal_patterns(time_series_data)
    trends.trend = extract_long_term_trend(time_series_data)
    trends.residual = calculate_residuals(time_series_data)
    
    # Forecast future values
    trends.forecast = generate_forecasts(time_series_data)
    
    RETURN trends
END FUNCTION
```

### Spatial Analysis

```pseudocode
FUNCTION perform_spatial_analysis(spatial_data)
    spatial_insights = {}
    
    # Hotspot analysis
    spatial_insights.hotspots = identify_activity_hotspots(spatial_data)
    
    # Connectivity analysis
    spatial_insights.connectivity = analyze_spatial_connectivity(spatial_data)
    
    # Accessibility metrics
    spatial_insights.accessibility = calculate_accessibility_metrics(spatial_data)
    
    RETURN spatial_insights
END FUNCTION
```

## Business Intelligence Generation

### Tourism Analytics

```pseudocode
FUNCTION analyze_tourism_patterns(mobility_data, external_data)
    tourism_insights = {}
    
    # Identify tourist vs resident patterns
    tourism_insights.visitor_classification = classify_visitors(mobility_data)
    
    # Analyze stay duration
    tourism_insights.stay_duration = calculate_stay_patterns(mobility_data)
    
    # Identify popular destinations
    tourism_insights.popular_destinations = rank_destinations(mobility_data)
    
    # Correlate with events and seasons
    tourism_insights.seasonal_patterns = correlate_with_calendar(mobility_data, external_data)
    
    RETURN tourism_insights
END FUNCTION
```

### Economic Impact Assessment

```pseudocode
FUNCTION assess_economic_impact(mobility_data, economic_data)
    economic_insights = {}
    
    # Business district activity
    economic_insights.business_activity = analyze_business_district_activity(mobility_data)
    
    # Retail footfall analysis
    economic_insights.retail_footfall = analyze_retail_patterns(mobility_data)
    
    # Economic correlation
    economic_insights.economic_correlation = correlate_mobility_economics(mobility_data, economic_data)
    
    RETURN economic_insights
END FUNCTION
```

## Machine Learning Integration

### Predictive Analytics

```pseudocode
FUNCTION generate_predictions(historical_data, prediction_horizon)
    prediction_models = {}
    
    # Traffic prediction
    traffic_model = train_traffic_prediction_model(historical_data.traffic)
    prediction_models.traffic = predict_future_traffic(traffic_model, prediction_horizon)
    
    # Demand forecasting
    demand_model = train_demand_forecasting_model(historical_data.demand)
    prediction_models.demand = forecast_demand(demand_model, prediction_horizon)
    
    # Anomaly detection
    anomaly_model = train_anomaly_detection_model(historical_data)
    prediction_models.anomalies = detect_future_anomalies(anomaly_model, prediction_horizon)
    
    RETURN prediction_models
END FUNCTION
```

### Clustering Analysis

```pseudocode
FUNCTION perform_clustering_analysis(feature_data)
    clustering_results = {}
    
    # User behavior clustering
    clustering_results.user_segments = cluster_user_behaviors(feature_data.user_features)
    
    # Geographic clustering
    clustering_results.geographic_segments = cluster_geographic_areas(feature_data.geographic_features)
    
    # Temporal clustering
    clustering_results.temporal_patterns = cluster_temporal_patterns(feature_data.temporal_features)
    
    RETURN clustering_results
END FUNCTION
```

## Real-Time Analytics

### Stream Processing

```pseudocode
FUNCTION process_real_time_stream(data_stream)
    real_time_insights = {}
    
    # Initialize sliding windows
    hourly_window = initialize_sliding_window(duration=1_hour)
    daily_window = initialize_sliding_window(duration=24_hours)
    
    FOR each new_data_point IN data_stream
        # Update sliding windows
        hourly_window.add(new_data_point)
        daily_window.add(new_data_point)
        
        # Calculate real-time metrics
        real_time_insights.current_density = calculate_current_density(hourly_window)
        real_time_insights.trend_direction = calculate_trend_direction(daily_window)
        real_time_insights.anomaly_score = calculate_anomaly_score(new_data_point, hourly_window)
        
        # Trigger alerts if necessary
        IF real_time_insights.anomaly_score > ANOMALY_THRESHOLD THEN
            trigger_anomaly_alert(real_time_insights)
        END IF
    END FOR
    
    RETURN real_time_insights
END FUNCTION
```

## Quality Metrics for Analytics

### Accuracy Assessment

```pseudocode
FUNCTION assess_analytics_accuracy(predictions, ground_truth)
    accuracy_metrics = {}
    
    # Statistical accuracy measures
    accuracy_metrics.mae = calculate_mean_absolute_error(predictions, ground_truth)
    accuracy_metrics.rmse = calculate_root_mean_square_error(predictions, ground_truth)
    accuracy_metrics.mape = calculate_mean_absolute_percentage_error(predictions, ground_truth)
    
    # Business accuracy measures
    accuracy_metrics.directional_accuracy = calculate_directional_accuracy(predictions, ground_truth)
    accuracy_metrics.confidence_intervals = calculate_confidence_intervals(predictions)
    
    RETURN accuracy_metrics
END FUNCTION
```

### Insights Validation

```pseudocode
FUNCTION validate_insights(generated_insights, validation_data)
    validation_results = {}
    
    # Cross-validation
    validation_results.cross_validation = perform_cross_validation(generated_insights, validation_data)
    
    # External validation
    validation_results.external_validation = validate_against_external_sources(generated_insights)
    
    # Business logic validation
    validation_results.business_validation = validate_business_logic(generated_insights)
    
    RETURN validation_results
END FUNCTION
```

## Integration with Eurostat Requirements

### Statistical Output Formatting

```pseudocode
FUNCTION format_for_statistical_reporting(analytics_output)
    statistical_report = {}
    
    # Apply Eurostat classifications
    statistical_report.nuts_regions = apply_nuts_classification(analytics_output.geographic_data)
    statistical_report.time_periods = standardize_time_periods(analytics_output.temporal_data)
    
    # Aggregate to required statistical levels
    statistical_report.aggregated_metrics = aggregate_to_statistical_units(analytics_output)
    
    # Apply disclosure control
    statistical_report.protected_data = apply_statistical_disclosure_control(statistical_report.aggregated_metrics)
    
    RETURN statistical_report
END FUNCTION
```

## Performance Optimization for Analytics

### Computational Efficiency

```pseudocode
FUNCTION optimize_analytics_performance(large_dataset)
    # Implement distributed computing
    partitioned_data = partition_dataset(large_dataset)
    
    # Parallel processing
    partial_results = []
    FOR each partition IN partitioned_data PARALLEL
        partial_result = compute_analytics(partition)
        partial_results.append(partial_result)
    END FOR
    
    # Aggregate results
    final_analytics = aggregate_partial_results(partial_results)
    
    RETURN final_analytics
END FUNCTION
```

This analytics methodology ensures that Telcofy generates high-quality, actionable insights while maintaining compliance with privacy regulations and statistical standards.

--- FILE: methodology/index.md ---

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


--- FILE: methodology/quality-assurance.md ---

---
sidebar_position: 5
title: Quality Assurance
---

# Quality Assurance Methodology

Comprehensive validation methods and quality metrics to ensure data integrity throughout the Telcofy platform.

## Quality Assurance Framework

Our QA methodology encompasses four key dimensions:
1. **Data Quality**: Accuracy, completeness, consistency, timeliness
2. **Process Quality**: Pipeline reliability, performance consistency
3. **Output Quality**: Result accuracy, statistical validity
4. **Compliance Quality**: Regulatory adherence, audit readiness

## Data Quality Metrics

### Completeness Assessment

```pseudocode
FUNCTION assess_data_completeness(dataset)
    completeness_metrics = {}
    
    FOR each field IN dataset.required_fields
        total_records = count_total_records(dataset)
        non_null_records = count_non_null_records(dataset, field)
        
        completeness_metrics[field] = {
            completeness_ratio: non_null_records / total_records,
            missing_count: total_records - non_null_records,
            completeness_grade: classify_completeness(non_null_records / total_records)
        }
    END FOR
    
    # Overall completeness score
    completeness_metrics.overall_score = calculate_weighted_average(completeness_metrics)
    
    RETURN completeness_metrics
END FUNCTION
```

### Accuracy Validation

```pseudocode
FUNCTION validate_data_accuracy(dataset, reference_data)
    accuracy_metrics = {}
    
    # Field-level accuracy
    FOR each field IN dataset.fields
        IF has_reference_data(field, reference_data) THEN
            accuracy_metrics[field] = {
                match_rate: calculate_match_rate(dataset[field], reference_data[field]),
                error_rate: calculate_error_rate(dataset[field], reference_data[field]),
                accuracy_score: calculate_accuracy_score(dataset[field], reference_data[field])
            }
        END IF
    END FOR
    
    # Business rule validation
    accuracy_metrics.business_rules = validate_business_rules(dataset)
    
    # Range validation
    accuracy_metrics.range_validation = validate_field_ranges(dataset)
    
    RETURN accuracy_metrics
END FUNCTION
```

### Consistency Checking

```pseudocode
FUNCTION check_data_consistency(dataset)
    consistency_metrics = {}
    
    # Internal consistency
    consistency_metrics.internal = check_internal_consistency(dataset)
    
    # Cross-field consistency
    consistency_metrics.cross_field = check_cross_field_consistency(dataset)
    
    # Temporal consistency
    consistency_metrics.temporal = check_temporal_consistency(dataset)
    
    # Format consistency
    consistency_metrics.format = check_format_consistency(dataset)
    
    # Calculate overall consistency score
    consistency_metrics.overall_score = aggregate_consistency_scores(consistency_metrics)
    
    RETURN consistency_metrics
END FUNCTION
```

## Process Quality Monitoring

### Pipeline Performance Monitoring

```pseudocode
FUNCTION monitor_pipeline_performance()
    performance_metrics = {}
    
    # Throughput monitoring
    performance_metrics.throughput = {
        records_per_second: calculate_processing_rate(),
        peak_throughput: get_peak_processing_rate(),
        average_throughput: get_average_processing_rate()
    }
    
    # Latency monitoring
    performance_metrics.latency = {
        end_to_end_latency: measure_end_to_end_latency(),
        stage_latencies: measure_stage_latencies(),
        percentile_latencies: calculate_latency_percentiles()
    }
    
    # Error rate monitoring
    performance_metrics.errors = {
        error_rate: calculate_error_rate(),
        error_types: categorize_errors(),
        error_trends: analyze_error_trends()
    }
    
    # Resource utilization
    performance_metrics.resources = {
        cpu_utilization: measure_cpu_usage(),
        memory_utilization: measure_memory_usage(),
        storage_utilization: measure_storage_usage()
    }
    
    RETURN performance_metrics
END FUNCTION
```

### Data Lineage Tracking

```pseudocode
FUNCTION track_data_lineage(data_element)
    lineage_info = {}
    
    # Source tracking
    lineage_info.source = {
        original_source: identify_original_source(data_element),
        ingestion_timestamp: get_ingestion_timestamp(data_element),
        source_quality_score: get_source_quality_score(data_element)
    }
    
    # Transformation tracking
    lineage_info.transformations = []
    FOR each transformation IN get_applied_transformations(data_element)
        transformation_info = {
            transformation_type: transformation.type,
            transformation_timestamp: transformation.timestamp,
            transformation_parameters: transformation.parameters,
            quality_impact: assess_transformation_quality_impact(transformation)
        }
        lineage_info.transformations.append(transformation_info)
    END FOR
    
    # Output tracking
    lineage_info.outputs = track_data_outputs(data_element)
    
    RETURN lineage_info
END FUNCTION
```

## Output Quality Validation

### Statistical Validity Checks

```pseudocode
FUNCTION validate_statistical_output(statistical_results)
    validity_checks = {}
    
    # Distribution validation
    validity_checks.distribution = {
        normality_test: test_normality(statistical_results),
        outlier_detection: detect_statistical_outliers(statistical_results),
        range_validation: validate_statistical_ranges(statistical_results)
    }
    
    # Correlation validation
    validity_checks.correlation = {
        expected_correlations: validate_expected_correlations(statistical_results),
        spurious_correlations: detect_spurious_correlations(statistical_results)
    }
    
    # Temporal validation
    validity_checks.temporal = {
        trend_consistency: validate_trend_consistency(statistical_results),
        seasonal_patterns: validate_seasonal_patterns(statistical_results)
    }
    
    # Statistical significance
    validity_checks.significance = {
        confidence_levels: calculate_confidence_levels(statistical_results),
        p_values: calculate_p_values(statistical_results),
        effect_sizes: calculate_effect_sizes(statistical_results)
    }
    
    RETURN validity_checks
END FUNCTION
```

### Cross-Validation Framework

```pseudocode
FUNCTION perform_cross_validation(model, dataset)
    cv_results = {}
    
    # K-fold cross-validation
    cv_results.k_fold = perform_k_fold_validation(model, dataset, k=5)
    
    # Time series cross-validation
    IF is_time_series_data(dataset) THEN
        cv_results.time_series = perform_time_series_validation(model, dataset)
    END IF
    
    # Stratified cross-validation
    IF has_categorical_target(dataset) THEN
        cv_results.stratified = perform_stratified_validation(model, dataset)
    END IF
    
    # Calculate cross-validation metrics
    cv_results.metrics = {
        mean_accuracy: calculate_mean_cv_accuracy(cv_results),
        std_accuracy: calculate_std_cv_accuracy(cv_results),
        confidence_interval: calculate_cv_confidence_interval(cv_results)
    }
    
    RETURN cv_results
END FUNCTION
```

## Compliance Quality Assurance

### Regulatory Compliance Validation

```pseudocode
FUNCTION validate_regulatory_compliance(processed_data)
    compliance_validation = {}
    
    # GDPR compliance checks
    compliance_validation.gdpr = {
        data_minimization: validate_data_minimization(processed_data),
        purpose_limitation: validate_purpose_limitation(processed_data),
        storage_limitation: validate_storage_limitation(processed_data),
        consent_compliance: validate_consent_requirements(processed_data)
    }
    
    # Eurostat compliance checks
    compliance_validation.eurostat = {
        classification_compliance: validate_classification_standards(processed_data),
        quality_standards: validate_eurostat_quality_standards(processed_data),
        disclosure_control: validate_disclosure_control(processed_data)
    }
    
    # Privacy compliance checks
    compliance_validation.privacy = {
        anonymization_quality: validate_anonymization_quality(processed_data),
        re_identification_risk: assess_re_identification_risk(processed_data),
        privacy_utility_tradeoff: assess_privacy_utility_balance(processed_data)
    }
    
    RETURN compliance_validation
END FUNCTION
```

### Audit Trail Validation

```pseudocode
FUNCTION validate_audit_trail(audit_logs)
    audit_validation = {}
    
    # Completeness of audit logs
    audit_validation.completeness = {
        log_coverage: assess_log_coverage(audit_logs),
        missing_events: identify_missing_audit_events(audit_logs),
        log_retention: validate_log_retention_compliance(audit_logs)
    }
    
    # Integrity of audit logs
    audit_validation.integrity = {
        log_integrity: validate_log_integrity(audit_logs),
        tamper_evidence: check_tamper_evidence(audit_logs),
        chronological_order: validate_chronological_order(audit_logs)
    }
    
    # Accessibility of audit logs
    audit_validation.accessibility = {
        search_capability: validate_log_search_capability(audit_logs),
        export_capability: validate_log_export_capability(audit_logs),
        reporting_capability: validate_reporting_capability(audit_logs)
    }
    
    RETURN audit_validation
END FUNCTION
```

## Automated Quality Monitoring

### Real-Time Quality Alerts

```pseudocode
FUNCTION monitor_quality_real_time(data_stream)
    quality_alerts = []
    
    FOR each data_batch IN data_stream
        # Real-time quality checks
        quality_scores = calculate_real_time_quality_scores(data_batch)
        
        # Check against thresholds
        FOR each metric IN quality_scores
            IF quality_scores[metric] < QUALITY_THRESHOLDS[metric] THEN
                alert = {
                    alert_type: "quality_degradation",
                    metric: metric,
                    current_value: quality_scores[metric],
                    threshold: QUALITY_THRESHOLDS[metric],
                    timestamp: current_timestamp(),
                    severity: determine_alert_severity(quality_scores[metric], QUALITY_THRESHOLDS[metric])
                }
                quality_alerts.append(alert)
                trigger_quality_alert(alert)
            END IF
        END FOR
    END FOR
    
    RETURN quality_alerts
END FUNCTION
```

### Quality Trend Analysis

```pseudocode
FUNCTION analyze_quality_trends(quality_history)
    trend_analysis = {}
    
    # Temporal trend analysis
    trend_analysis.temporal_trends = {
        daily_trends: analyze_daily_quality_trends(quality_history),
        weekly_trends: analyze_weekly_quality_trends(quality_history),
        monthly_trends: analyze_monthly_quality_trends(quality_history)
    }
    
    # Quality degradation prediction
    trend_analysis.predictions = {
        predicted_quality: predict_future_quality(quality_history),
        degradation_risk: assess_degradation_risk(quality_history),
        intervention_recommendations: recommend_quality_interventions(quality_history)
    }
    
    # Root cause analysis
    trend_analysis.root_causes = {
        correlation_analysis: analyze_quality_correlations(quality_history),
        anomaly_sources: identify_quality_anomaly_sources(quality_history),
        process_impacts: assess_process_quality_impacts(quality_history)
    }
    
    RETURN trend_analysis
END FUNCTION
```

## Quality Reporting and Dashboards

### Quality Scorecard Generation

```pseudocode
FUNCTION generate_quality_scorecard(time_period)
    scorecard = {}
    
    # Data quality scores
    scorecard.data_quality = {
        overall_score: calculate_overall_data_quality_score(time_period),
        completeness_score: calculate_completeness_score(time_period),
        accuracy_score: calculate_accuracy_score(time_period),
        consistency_score: calculate_consistency_score(time_period),
        timeliness_score: calculate_timeliness_score(time_period)
    }
    
    # Process quality scores
    scorecard.process_quality = {
        pipeline_reliability: calculate_pipeline_reliability(time_period),
        performance_consistency: calculate_performance_consistency(time_period),
        error_recovery: calculate_error_recovery_efficiency(time_period)
    }
    
    # Compliance scores
    scorecard.compliance_quality = {
        regulatory_compliance: calculate_regulatory_compliance_score(time_period),
        privacy_compliance: calculate_privacy_compliance_score(time_period),
        audit_readiness: calculate_audit_readiness_score(time_period)
    }
    
    # Generate recommendations
    scorecard.recommendations = generate_quality_improvement_recommendations(scorecard)
    
    RETURN scorecard
END FUNCTION
```

This quality assurance methodology ensures that Telcofy maintains the highest standards of data integrity, process reliability, and compliance throughout the entire analytics lifecycle.

--- FILE: use-cases/eurostat.md ---

---
sidebar_position: 1
---

# Eurostat Reporting

Coming soon...


--- FILE: use-cases/urban-planning.md ---

---
sidebar_position: 2
---

# Urban Planning

Coming soon...


--- FILE: use-cases/tourism.md ---

---
sidebar_position: 3
---

# Tourism Analytics

Coming soon...


--- FILE: use-cases/emergency-response.md ---

---
sidebar_position: 4
---

# Emergency Response

Coming soon...


--- FILE: architecture/scalability.md ---

---
sidebar_position: 4
---

# Scalability

Coming soon...


--- FILE: architecture/overview.md ---

---
sidebar_position: 1
---

# Architecture Overview

Coming soon...


--- FILE: architecture/data-pipeline.md ---

---
sidebar_position: 2
---

# Data Pipeline

Coming soon...


--- FILE: architecture/security.md ---

---
sidebar_position: 3
---

# Security

Coming soon...


--- FILE: support/troubleshooting.md ---

---
sidebar_position: 1
---

# Troubleshooting

Coming soon...


--- FILE: support/contact.md ---

---
sidebar_position: 3
---

# Contact Support

Coming soon...


--- FILE: support/faq.md ---

---
sidebar_position: 2
---

# FAQ

Coming soon...


--- FILE: eu-compliance/methodological-framework.md ---

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



--- FILE: eu-compliance/codebase-overview.md ---

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


--- FILE: eu-compliance/eurostat-pipeline-staypoint-detection.md ---

---
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


--- FILE: eu-compliance/quality.md ---

---
sidebar_position: 6
title: Quality Framework
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


--- FILE: eu-compliance/methods.md ---

---
sidebar_position: 4
title: MultiMNO Methods
---

# Core Methods and Data Objects

Eurostat’s Deliverable **[D2.3 Volume III](https://cros.ec.europa.eu/group/6/files/2657/download)** documents the algorithms, quality checks, and data contracts that make up the MultiMNO reference pipeline. The volume specifies, in detail, the full set of methods and data objects developed for four core use cases: Present Population Estimation, M-Usual Environment Indicators, M-Home Location Indicators, and Internal Migration. These methods sit underneath the framework (Vol. I) and use case catalogue (Vol. II) already summarised in this section of the docs. Telcofy keeps the same modular structure so that regulators can trace every output back to an ESS-aligned procedure. (Additional background is available via the [CROS deliverables overview](https://cros.ec.europa.eu/book-page/methodology-framework-high-level-architecture-requirements-use-cases-and-methods).)

- *M-Home Location Indicators*: derived from long-term permanence outputs, this pipeline labels each device’s de facto residence, aggregates counts to grids or administrative areas, and attaches quality/confidence scores plus change flags so downstream processes (e.g., internal migration) can quantify relocations.

## 1. Network topology & coverage modules

### Module 1 — MNO network topology data cleaning (syntactic checks)

The first module scrubs raw topology feeds (cell plan CSV, JSON, XML) into the canonical schema. Validation falls
into three buckets:

- **Coordinate hygiene** — latitude/longitude must exist, be parseable as WGS 84, and fall inside the bounding
  geometry provided for the target country. Optional altitude and antenna height are checked against admissible
  ranges (e.g. metres above sea level).
- **Antenna descriptors** — directionality, azimuth, elevation, power, beam widths, frequency, technology, and
  cell type are individually verified for presence (if required), data type, and inclusion in the enumerated value
  sets delivered with D2.3.
- **Geometry payloads** — when MNOs supply polygons (`Cell Footprint with Differentiated Signal Strength
  Coverage Areas`), Well Known Text is parsed and clipped to the bounding box; signal strength attributes must
  lie in the interval (0, 1].

Rows failing mandatory-field checks are dropped; optional-field failures are nulled but logged. The method emits:

- `Clean MNO Network Topology Data` — the sanitised dataset with type-correct columns ready for downstream
  geospatial joins.
- `MNO Network Topology Data Quality Metrics` — counts of rows removed per validation rule plus the k most
  frequent error signatures, so recurring issues can be negotiated with the operator.

### Module 2 — MNO network topology quality warnings

Module 2 turns the metrics above into actionable warnings. For each topology refresh (typically daily), key series
such as *raw row count*, *post-clean row count*, and *field-level error ratios* are tracked and compared with historical
behaviour over a configurable look-back window (week, month, or quarter). Threshold types include:

- **Absolute** — e.g. “raise a warning if the number of cells falls below 10 000”.
- **Relative** — e.g. “raise a warning if today’s error rate exceeds the trailing mean by 30 %”.
- **Control limits** — control-chart style bands computed as `μ ± k·σ`.

Warnings are grouped by metric (size, missing values, wrong format, out-of-range, parsing errors) and the output
dashboard plots the time series with annotated breaches so analysts can distinguish genuine network changes
from ingest glitches. All thresholds can be tuned per NSI; defaults follow the values published in D2.3.

### Module 3 — Signal strength estimation

When only the radio plan is available, Module 3 synthesises a radio-frequency coverage surface. Two variants are
documented in D2.3; Telcofy implements both.

#### 3.1 Omnidirectional model

For small cells or sectors with no directional beam, the received signal strength for cell `a` at grid tile `g` is


![Omnidirectional model](/img/eu-compliance/omnidirectional-model.png)

where:

- `S₀` is the transmit power expressed as signal strength at reference distance `r₀ = 1 m` (converted from the
  cell plan power `P` in Watts via the standard Watt ↔ dBm conversion).
- `r_{g,a}` is the 3‑D distance between the antenna position and the tile centroid (assuming user devices at ground level).
- `S_{\text{dist}}(r)` encodes the distance-based attenuation:



with path-loss exponent `γ` describing reflections, diffraction, and clutter (default γ = 2 for free space, configurable for urban/rural scenes).

#### 3.2 Directional model

Macrocells add angular attenuation. Let `φ_a` be the azimuth, `θ_a` the downtilt, `α_a` the horizontal 3 dB beam
width, and `β_a` the vertical 3 dB width. Define:

- `δ_{g,a}` — difference between `φ_a` and the azimuth from cell `a` to tile `g`.
- `ε_{g,a}` — elevation offset between `θ_a` and the line of sight to tile `g`.

The directional signal model becomes


![Directional model](/img/eu-compliance/directional-model.png)

where `S_{\text{azi}}` and `S_{\text{elev}}` are Gaussian-shaped attenuation functions calibrated so that the loss
reaches 3 dB at `φ_a ± α_a/2` and `θ_a ± β_a/2`, respectively. D2.3 derives these functions by solving for the
parameters `c` and `σ` in


![Gaussian attenuation curve](/img/eu-compliance/gaussian-formula.png)

subject to the 3 dB constraints for each plane.

Figure 2 summarises the resulting radiation pattern: the main lobe is centred on the beam direction, grey rings
indicate successive 5 dB loss levels, and the red arms mark the 3 dB beam limits (spanning `2α_a` horizontally and
`2β_a` vertically). Side or back lobes may arise in real hardware, but the Gaussian attenuation captures the
dominant behaviour used for downstream modelling.

![Radiation patterns for azimuth and elevation planes](/img/eu-compliance/methods-module3-fig2.png)
*Source: MultiMNO D2.3 Vol. III, Figure 2.*

Once `S_{g,a}` is known, the coverage surface is rasterised onto the project grid by intersecting the continuous
footprint with target tiles—see Figures 3–5 for the projection workflow extracted from D2.3. Figure 4, in
particular, shows how arbitrary coverage shapes are snapped to the `project_grid_cell` lattice by attributing a
specific strength (or other cell property) to every intersected tile.

![Example directional coverage on the ground plane](/img/eu-compliance/methods-module3-fig3.png)
*Source: MultiMNO D2.3 Vol. III, Figure 3.* Here the cell (located at x = 0, y = 0, height = 55 m, γ = 4, power = 10 W,
azimuth pointing east, tilt = 5°, horizontal width = 65°, vertical width = 9°) produces peak signal a few hundred
metres from the mast because tiles directly underneath have larger elevation offsets `ε_{g,a}`.

![Rasterisation of coverage polygons to the project grid](/img/eu-compliance/methods-module3-fig4.png)
*Source: MultiMNO D2.3 Vol. III, Figure 4.*

![Intersection of MNO tiles with project tiles (Equation 1 in D2.3)](/img/eu-compliance/methods-module3-fig5.png)
*Source: MultiMNO D2.3 Vol. III, Figure 5.* The graphic demonstrates Equation 1 (below): intersect each MNO tile
with the `project_grid_cell`, compute the overlap area `A_{ij}`, and aggregate the MNO strengths `SE_j` into the
project tile `i`.

#### 3.3 Precomputed signal-strength tiles

When the operator already supplies gridded signal strengths, Module 3 reprojects them. For each project tile `i`,
intersecting with `n` MNO tiles, the blended signal is obtained using Equation 1 (below).

![Equation 1](/img/eu-compliance/equation-1.png)

Here `A_{ij}` is the overlap area between project tile `i` and MNO tile `j`, `A_T` is the area of tile `i`, and `S_j`
is the strength attached to MNO tile `j`.

### Module 4 — Cell footprint estimation

Signal strengths are converted to dimensionless *footprint* values `s(g,a)` in the range `[0,1]`, representing a
cell’s relative suitability at tile `g`. D2.3 offers two transformation families:

- **Linear**

![Linear transformation illustration](/img/eu-compliance/linear-transformation.png)

with default `S_{\min} = -130 \text{dBm}` and `S_{\max} = -50 \text{dBm}`.

- **Logistic**

![Logistic transformation illustration](/img/eu-compliance/logistic-transformation.png)

mirroring the “signal dominance” concept in Tennekes & Gootzen (2022). Parameters `S_{\text{steep}}` and
`S_{\text{mid}}` control the knee of the curve; defaults `(-92.5,\;0.2)` capture typical macro-cell behaviour.

To keep the dataset tractable, the module prunes low-utility cells per tile. A simple threshold (e.g. `s < 0.01`) is
available, but D2.3 recommends keeping only the Top‑`X` cells (default `X = 10`) for each tile:

![Top-X pruning example](/img/eu-compliance/topx-pruning.png)

### Module 5 — Cell connection probability estimation

Footprint values become probabilistic connection weights assuming no load balancing:

![Connection probability formula](/img/eu-compliance/connection-probability.png)

where `A` is the set of all cells that reach tile `g`. For every tile the probabilities sum to one and serve as priors for
later Bayesian localisation (Module 6). The outputs are stored as `Cell Connection Probabilities [INTERMEDIATE RESULTS]`.

> **Reference:** Tennekes, M. & Gootzen, Y. (2022). *Bayesian location estimation of mobile devices using a signal strength model.* Journal of Spatial Information Science.
>

## 2. Event-level quality assurance

- **Module 7 – Event data syntactic cleaning**  
  Deduplicates records, orders events temporally, validates mandatory fields, and harmonises roaming identifiers.
- **Module 8 – Event syntactic quality warnings**  
  Computes error rates and completeness metrics; emits daily dashboards with configurable thresholds.
- **Module 9 – Device demultiplex**  
  Splits cleaned events into per-device streams, aligning by user ID and timestamp while preserving metadata needed downstream.
- **Module 10 – Device-level semantic cleaning**  
  Removes impossible jumps (speed constraints, missing cells), imputes short gaps, and tags residual anomalies.
- **Module 11 – Device activity statistics**  
  Derives per-device indicators (event counts, idle gaps, night/day ratios) used for filtering and weighting.
- **Module 12 – Device semantic quality warnings**  
  Aggregates Module 10 & 11 scores into warning flags that can pause a pipeline or trigger manual review.

## 3. Daily & longitudinal analytics

- **Module 13 – Daily processing**  
  Offers three interchangeable methods: present population estimation, daily permanence score, and continuous time segmentation (CTS). Each consumes semantically cleaned events and connection probabilities to produce daily summaries and state labels.
- **Module 14 – Mid-term processing**  
  Aggregates daily permanence scores into monthly or quarterly summaries; implements decay rules, holiday adjustments, and confidence scores.
- **Module 15 – Long-term processing**  
  Builds yearly permanence and usual-environment labels, including home/work classification, stay frequencies, and uncertainty indicators.
- **Module 16 – Tourism methods**  
  Adapts daily outputs for inbound/outbound tourism: trip detection, nights spent, multi-destination chains, and country-of-origin logic. Validates robustness against multi-roaming scenarios.

## 4. Aggregation, fusion & estimation

- **Module 17 – Device filtering & single-MNO aggregation**  
  Applies quality filters (minimum activity, residence confirmation) and aggregates devices to grid/time buckets with disclosure-aware measures.
- **Module 18 – Merge single-MNO aggregates**  
  Combines results from participating MNOs using either secure enclave fusion or exchange of already-protected aggregates; harmonises schemas and metadata.
- **Module 19 – Projection to use-case geography**  
  Projects grid counts to administrative or analytical zones (LAU, municipality, FUA) using the same spatial transformation rules referenced in Vol. I.
- **Module 19 (Estimation stage) – Calibration of outputs**  
  Scales MultiMNO totals to official population frames via reweighting, residual adjustments, and estimation of coverage gaps (includes default inference recipes per use case).
- **Home-location change detection (Chapter 22)**  
  Detects migrations by comparing sequential long-term labels with stability thresholds, enabling internal migration statistics.

## 5. Data objects catalogue

Volume III concludes with a detailed schema inventory (Chapter 23) covering:
- **Input data** – raw network topology, event logs, auxiliary datasets (holidays, MCC/MNC mappings, land use priors).
- **Intermediate results** – every bronze/silver artefact referenced in the pipeline (cleaned events, quality metrics, grid probabilities, daily/mid-term/long-term summaries).
- **Output datasets** – gold tables per use case, each with mandatory metadata (time period, spatial reference, quality flags, disclosure level).

## Telcofy implementation notes

1. **Module parity** — keep the same numbering in code repositories and documentation so auditors can cross-check against D2.3 Vol. III.  
2. **Configurability** — surface key parameters (speed thresholds, permanence windows, calibration weights) in configuration files, mirroring Eurostat defaults but explicitly tracking Telcofy overrides.  
3. **Quality evidence** — persist syntactic and semantic warning outputs; these artefacts demonstrate compliance with the ESS quality framework and feed customer-facing dashboards.  
4. **Privacy controls** — respect the separation between single-MNO processing, secure enclaves, and post-aggregation SDC as defined in Modules 17–20. Telcofy add-ons must not bypass these boundaries.

See  [D2.3 Vol. III](https://cros.ec.europa.eu/group/6/files/2656/download) for algorithmic detail, pseudocode, and full attribute definitions.


--- FILE: eu-compliance/index.md ---

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
- **Resources** — Public (landing page)[https://cros.ec.europa.eu/landing-page/multi-mno-project] with deliverables and materials.
- **Tooling** — Open-source code [D4.4](https://cros.ec.europa.eu/group/6/files/2659/download) released in 2025 (version 1.0) ; ongoing quality framework updates (D3.3)(https://cros.ec.europa.eu/group/6/files/2658/download) and testing reports (D5.2)[https://cros.ec.europa.eu/group/6/files/2661/download].

## Why it matters for Telcofy

- **Regulatory assurance** — Adhering to the MultiMNO modules lets Telcofy evidence privacy, quality, and governance controls when onboarding EU customers.
- **Interoperable outputs** — Matching USE case definitions and data schemas ensures our indicators can be benchmarked against ESS publications.
- **Future-proofing** — Tracking Eurostat revisions keeps our data-sharing agreements and infrastructure aligned with evolving EU legislation (e.g., Regulation (EU) 2024/3018, amendments to Regulation (EC) No 223/2009).

## Privacy and data access posture

- **Privacy-by-design** — Following guidance from [MNOdata4OS](https://cros.ec.europa.eu/MNOdata4OS), Telcofy restricts raw-event handling to secure computation environments, enforces staged aggregation, and retains full provenance/retention logs.
- **Sustainable access models** — Contracts mirror the MultiMNO reference scenario: explicit mandates for MNO-to-NSI sharing, cost-recovery mechanisms, and options for secure enclaves when cross-MNO fusion is required.

## Deliverables at a glance

The full documentation set is available via Eurostat’s portal: [D2.3 – Methodology, requirements, use cases and methods](https://cros.ec.europa.eu/book-page/methodology-framework-high-level-architecture-requirements-use-cases-and-methods).

- **D2.3 Vol. I** — Conceptual & methodological framework ([download](https://cros.ec.europa.eu/group/6/files/2655/download)); see [Methodological Framework](./methodological-framework.md).
- **D2.3 Vol. II** — Statistical use cases ([download](https://cros.ec.europa.eu/group/6/files/2656/download)); see [Use Cases](./use-cases.md).
- **D2.3 Vol. III** — Methods & data objects ([download](https://cros.ec.europa.eu/group/6/files/2657/download)); see [Methods & Data Objects](./methods.md).
- **D3.3** — Business process & quality frameworxk ([download](https://cros.ec.europa.eu/group/6/files/2658/download)); Telcofy’s adoption is summarised in [Quality Framework](./quality.md).
- **D4.4** — Software releases & documentation ([download](https://cros.ec.europa.eu/group/6/files/2659/download)); reflected in [Codebase & Orchestration](./codebase-overview.md).

Use the linked pages to dive deeper into each aspect. Together they provide the traceability auditors expect when validating Telcofy’s EU compliance posture.


--- FILE: eu-compliance/use-cases.md ---

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


--- FILE: api/authentication.md ---

# Telcofy Authentication Guide

External customers authenticate to Telcofy services with **machine-account API keys**
issued by the Telcofy team. Two base URLs are available:

- Users API: `https://users.api.telcofy.ai`
- Data API: `https://data.api.telcofy.ai`

The Users API exchanges API keys for short-lived Google OAuth tokens (for Cloud Storage
downloads). The Data API accepts the same API key via the `x-api-key` header.

---

## 1. API Keys & Machine Accounts

Each Telcofy customer receives one or more API keys that represent Google Cloud service
accounts scoped to the customer’s data.

- Keys are labelled (e.g., `etl-prod`, `pipeline-a`) to distinguish workflows.
- Keys are 64-character hex strings and are shown only once—store them in a secret manager
  as soon as they are created or rotated.
- The `service` profile you choose while creating a machine account controls which Google
  scopes can be minted later (`storage` is the default; use `bigquery` for BigQuery access).
- Machine accounts are scoped to read artifacts under `gs://telcofy-user-data/results/{USER_ID}/`.
- Rotation is supported through the Users API. If you do not have the ability to call the
  rotation endpoints directly, contact Telcofy support to request a new key.

| Endpoint | Description | Notes |
| --- | --- | --- |
| `GET /users/:uid/machine-accounts/list` | View existing machine-account labels and rotation timestamps. | Available to customers with machine-account admin access; otherwise, contact Telcofy support to retrieve this information. |
| `POST /users/:uid/machine-accounts` | Create or rotate a machine-account API key. | Provide `keyLabel` and optional `service` (`storage` default, `bigquery` for BigQuery access). Telcofy support can run this on your behalf if self-service is not enabled. |
| `POST /login-with-apikey` | Exchange an API key for a 1-hour Google OAuth access token. | Supports optional `{"service":"bigquery"}` to request the BigQuery scope; defaults to a Cloud Storage read-only scope. |

> **Note:** Calling `POST /users/:uid/machine-accounts` with an existing `keyLabel`
> rotates the key (the previous key is revoked immediately). If you do not have self-service
> access, submit a ticket with the desired `keyLabel` and `service`.


---

## 2. Exchange the API Key for an OAuth Token

```bash
API_KEY="YOUR_API_KEY"
LOGIN_RESPONSE=$(curl -s -X POST https://users.api.telcofy.ai/login-with-apikey \
  -H "x-api-key: $API_KEY")
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r .accessToken)
USER_ID=$(echo "$LOGIN_RESPONSE" | jq -r .userId)
EXPIRES_AT=$(echo "$LOGIN_RESPONSE" | jq -r .expireTime)
```

- Tokens are valid for roughly one hour; check `expireTime` in the response.
- The default scope is `https://www.googleapis.com/auth/devstorage.read_only`.
- Provide a JSON body to request a different scope that matches your machine-account
  profile (for example, `{"service": "bigquery"}` to mint `https://www.googleapis.com/auth/bigquery`).

```bash
# Request a BigQuery-scoped token
LOGIN_RESPONSE=$(curl -s -X POST https://users.api.telcofy.ai/login-with-apikey \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"service":"bigquery"}')
```

Use the bearer token with Cloud Storage tooling. The examples below rely on the `USER_ID`
returned by `/login-with-apikey`.

**Example (gsutil):**

```bash
gsutil -o "GSUtil:additional_http_headers=Authorization: Bearer $ACCESS_TOKEN" \
  cp -r gs://telcofy-user-data/results/$USER_ID/ ./results_$USER_ID
```

**Example (HTTP download):**

```bash
curl -L -H "Authorization: Bearer $ACCESS_TOKEN" \
  "https://storage.googleapis.com/telcofy-user-data/results/$USER_ID/export.json" \
  -o export.json
```

---

## 3. Calling the Admin API with an API Key

Attach your API key to each Telcofy admin request using the `x-api-key` header.

### Admin Maps (`/admin/maps`)

Admin map endpoints let you store and maintain reusable geometries. These routes live on
`https://users.api.telcofy.ai` and also use the `x-api-key` header.

| Endpoint | Description | Notes |
| --- | --- | --- |
| `GET /admin/maps` | List saved admin maps (custom polygons, grids). | Returns map metadata, including geometry and owning machine account. |
| `GET /admin/maps/monitored` | List admin map IDs that are flagged for **realtime monitoring**. | Returns `count` plus `monitored_map_ids`. |
| `POST /admin/maps` | Create a new admin map. | Provide `name`, `type`, and either `geometry` (WKT) or compatible `ids`. |
| `PUT /admin/maps/:id` | Update an existing admin map. | Supply only the fields you want to change; geometry updates replace the stored polygon. |
| `DELETE /admin/maps/:id` | Delete an admin map. | Removes the map from future queries; returns `{ "msg": "Map deleted" }`. |

**List saved maps:**

```bash
curl -s https://users.api.telcofy.ai/admin/maps \
  -H "x-api-key: $API_KEY"
```

Example response:

```json
{
  "maps": [
    {
      "id": "2nnuJGDA0axOeuafA0wy",
      "name": "Customer Zone Alpha",
      "description": "Example custom zone created via API key",
      "type": "custom_polygon",
      "geometry": "POLYGON((10.7330245 59.948585, 10.734826 59.948413, 10.736222 59.949133, 10.735642 59.949885, 10.733625 59.94995, 10.732315 59.94924, 10.7330245 59.948585))",
      "owner": "api-test-user-1-my-dev-key@telcofy-norway-poc.iam.gserviceaccount.com"
    }
  ]
}
```

**List monitored maps:**

```bash
curl -s https://users.api.telcofy.ai/admin/maps/monitored \
  -H "x-api-key: $API_KEY"
```

Example response:

```json
{ "count": 1, "monitored_map_ids": ["2nnuJGDA0axOeuafA0wy"] }
```

**Create a map:**

```bash
curl -s -X POST https://users.api.telcofy.ai/admin/maps \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
        "name": "Customer Zone Alpha",
        "description": "Example custom zone created via API key",
        "type": "custom_polygon",
        "geometry": "POLYGON((10.7872664 59.8679278, 10.7969259 59.8680208, 10.7969259 59.8701131, 10.7924594 59.8734470, 10.7878905 59.8708231, 10.7872664 59.8679278))"
      }'
```

Example response:

```json
{
  "msg": "Map saved",
  "id": "2nnuJGDA0axOeuafA0wy",
  "name": "Customer Zone Alpha",
  "description": "Example custom zone created via API key",
  "type": "custom_polygon",
  "geometry": "POLYGON((10.7872664 59.8679278, 10.7969259 59.8680208, 10.7969259 59.8701131, 10.7924594 59.8734470, 10.7878905 59.8708231, 10.7872664 59.8679278))",
  "owner": "api-test-user-1-my-dev-key@telcofy-norway-poc.iam.gserviceaccount.com"
}

```

**Update a map:**

```bash
curl -s -X PUT https://users.api.telcofy.ai/admin/maps/$MAP_ID \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
        "name": "Customer Zone Alpha (updated)",
        "description": "Polygon geometry updated via API key",
        "type": "custom_polygon",
        "geometry": "POLYGON((10.761452 59.914762, 10.7654 59.914762, 10.7654 59.916699, 10.760765 59.916699, 10.757761 59.916139, 10.761452 59.914762))"
      }'
```

Successful updates return the map ID:

```json
{ "msg": "Map updated", "id": "svxtowUIKG33pVmbXKBT" }
```

**Delete a map:**

```bash
curl -s -X DELETE https://users.api.telcofy.ai/admin/maps/$MAP_ID \
  -H "x-api-key: $API_KEY"
```

Example response:

```json
{ "msg": "Map deleted", "id": "QdZn1VqNBreF1Lyoc9Hj" }
```

### Realtime Admin API 

Enable or disable realtime monitoring for previously saved admin maps. These calls use
`https://data.api.telcofy.ai` and require the same `x-api-key` header.

| Endpoint | Description | Notes |
| --- | --- | --- |
| `POST /realtime` | Toggle realtime monitoring for a map. | Body accepts `map_id` and `enable` (`true`/`false`); updates the realtime monitoring service parameters. |

**Enable monitoring for a map:**

```bash
curl -s -X POST https://data.api.telcofy.ai/realtime \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "map_id": "svxtowUIKG33pVmbXKBT", "enable": true }'
```

Example response:

```json
{
  "msg": "Realtime monitoring enabled",
  "map_id": "svxtowUIKG33pVmbXKBT",
  "is_monitored": true,
  "bq_updated_rows": 1
}
```

### Data Aggregation API (`/data-agg`)
//UNDER DEVELOPMENT


Use `/data-agg` to request Telcofy’s analytical products - Activities and Origin-Destination Matrix (ODM) datasets.
Submit asynchronous jobs for large date ranges, then download the results once processing completes. See
[`data-access/overview`](../data-access/overview.md) for a deeper look at product definitions and available measures.

**Submit an async aggregation job:**

```bash
curl -s -X POST https://data.api.telcofy.ai/data-agg \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "agg_type": "activities", "measure": "sum_unique_people", "start_time": "2024-03-01T00:00:00Z", "end_time": "2024-03-01T23:59:59Z", "activity_type": "daily", "geo_type": "grid_1000m", "geo_ids": [22637506648500], "full": true }'
```

Poll `/data-agg/status/{jobId}` and `/data-agg/results/{jobId}` using the same header.

---

## 4. Security Best Practices

- Treat API keys as secrets—do not embed them in mobile apps, client-side code, or public repositories.
- Rotate keys periodically (quarterly recommended) and immediately when staff change roles.
- Restrict Cloud Storage downloads to secured environments; OAuth tokens inherit read-only access to your results folder.
- If an API key is suspected to be compromised, request an immediate rotation from Telcofy support.
- Audit usage via `/users/:uid/machine-accounts/list` or Telcofy-provided dashboards when available.

Stay secure!


--- FILE: api/endpoints.md ---

# Telcofy REST Endpoints

Quick reference to Telcofy’s externally exposed REST endpoints.
All paths are relative to:

- Users API – `https://users.api.telcofy.ai`
- Data API – `https://data.api.telcofy.ai`

See `authentication.md` for header requirements and token exchange details.

---

## Users Admin API

| Method | Path | Description | Auth |
| ------ | ---- | ----------- | ---- |
| GET | `/users/:uid/machine-accounts/list` | List machine-account labels available to the customer. | `x-api-key` |
| POST | `/users/:uid/machine-accounts` | Create or rotate a machine-account API key. | `x-api-key` |
| POST | `/login-with-apikey` | Exchange an API key for a 1-hour Google OAuth token. | `x-api-key` |
| GET | `/admin/maps` | List saved admin maps (custom polygons, grids). | `x-api-key` |
| POST | `/admin/maps` | Create a new admin map. | `x-api-key` |
| PUT | `/admin/maps/:id` | Update an existing admin map. | `x-api-key` |
| DELETE | `/admin/maps/:id` | Delete an admin map. | `x-api-key` |
| GET | `/maps/monitored` | List map IDs currently flagged for realtime monitoring. | `x-api-key` |

---

## Data API

| Method | Path | Description | Auth |
| ------ | ---- | ----------- | ---- |
| GET | `/data-agg` | Run a synchronous aggregation (`activities` or `trips`). | `x-api-key` |
| POST | `/data-agg` | Submit an aggregation job (`full=true` exports to Cloud Storage). | `x-api-key` |
| GET | `/data-agg/status/:jobId` | Check aggregation job status and progress. | `x-api-key` |
| GET | `/data-agg/results/:jobId` | Retrieve preview results or export metadata (`?full=true`). | `x-api-key` |
| GET | `/data-agg/jobs` | List historical aggregation jobs for the caller. | `x-api-key` |
| POST | `/realtime` | Enable or disable realtime monitoring for a saved map. | `x-api-key` |

---

## Response Formats

- All responses are JSON encoded and include an `error` field on failures.
- Timestamp fields follow ISO 8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`) unless noted.
- Long-running jobs surface progress via `/data-agg/status/:jobId` and deliver
  export URLs via `/data-agg/results/:jobId?full=true`.

Refer to `quickstart.md` for example requests and to the individual service
readmes for in-depth payload schemas.


--- FILE: api/quickstart.md ---

# Telcofy Data Access Quickstart

Use this quickstart to exchange your Telcofy machine-account API key for an OAuth
token, download Cloud Storage exports, and call the Data API for maps and
aggregated metrics. The Users API issues Google OAuth tokens scoped to specific
services: Cloud Storage by default, or BigQuery when explicitly requested.

To obtain Telcofy API access you need a valid contract; contact sales at tom@telcofy.ai.

---

## 1. Gather Prerequisites

- Telcofy-issued **API key** (the login response echoes back your `userId` if you do not have it handy).
- `curl` and `jq` for command-line examples.
- `gsutil` if you prefer to copy Cloud Storage results via the CLI.

Telcofy service base URLs:

- Users API: `https://users.api.telcofy.ai`
- Data API: `https://data.api.telcofy.ai`

---

## 2. Exchange the API Key for a Cloud Storage Access Token

If you are unsure where to retrieve `YOUR_MACHINE_ACCOUNT_KEY`, see the **API key
provisioning** notes in [`authentication.md`](authentication.md).

Call `POST /login-with-apikey` to obtain a one-hour Google OAuth token. The
response includes both the token and the Telcofy `userId` that owns the data.
Include an optional JSON body with `{"service":"bigquery"}` when you need a
BigQuery-scoped token instead of the default Cloud Storage scope.

```bash
export API_KEY="YOUR_MACHINE_ACCOUNT_KEY"
LOGIN_RESPONSE=$(curl -s -X POST https://users.api.telcofy.ai/login-with-apikey \
  -H "x-api-key: $API_KEY")
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r .accessToken)
USER_ID=$(echo "$LOGIN_RESPONSE" | jq -r .userId)

# Request a BigQuery-scoped token instead of Cloud Storage:
# LOGIN_RESPONSE=$(curl -s -X POST https://users.api.telcofy.ai/login-with-apikey \
#   -H "x-api-key: $API_KEY" \
#   -H "Content-Type: application/json" \
#   -d '{"service":"bigquery"}')
# ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r .accessToken)
```

Tokens expire after ~1 hour; repeat the exchange whenever you encounter
authorization errors.

---

## 3. Download Cloud Storage Exports

Use the OAuth token as a bearer credential. The example below copies every file
under your user’s export directory using the `USER_ID` captured in the previous
step.

```bash
gsutil -o "GSUtil:additional_http_headers=Authorization: Bearer $ACCESS_TOKEN" \
  cp -r gs://telcofy-user-data/results/$USER_ID/ ./results_$USER_ID
```

Prefer a pure HTTP workflow? Use `curl` to stream individual objects:

```bash
curl -L -H "Authorization: Bearer $ACCESS_TOKEN" \
  "https://storage.googleapis.com/telcofy-user-data/results/$USER_ID/example.json" \
  -o example.json
```

Download an entire folder with `curl` by iterating over the object list:

```bash
FILES=$(gsutil -o "GSUtil:additional_http_headers=Authorization: Bearer $ACCESS_TOKEN" \
  ls gs://telcofy-user-data/results/$USER_ID/**)

mkdir -p results_$USER_ID
for f in $FILES; do
  NAME=$(basename "$f")
  curl -L -H "Authorization: Bearer $ACCESS_TOKEN" "$f" -o "results_$USER_ID/$NAME"
done
```

Prefer Python? Use the Google Cloud Storage client with the temporary OAuth token:

```python
import os

import requests
from google.cloud import storage
from google.oauth2.credentials import Credentials

API_KEY = os.environ["API_KEY"]
BASE_URL = "https://users.api.telcofy.ai"
BUCKET_NAME = "telcofy-user-data"

resp = requests.post(f"{BASE_URL}/login-with-apikey", headers={"x-api-key": API_KEY})
resp.raise_for_status()
token_data = resp.json()

creds = Credentials(token=token_data["accessToken"])
client = storage.Client(credentials=creds)

user_id = token_data["userId"]
prefix = f"results/{user_id}/"
os.makedirs(f"results_{user_id}", exist_ok=True)

for blob in client.list_blobs(BUCKET_NAME, prefix=prefix):
    if blob.name.endswith("/"):
        continue
    local = os.path.join(f"results_{user_id}", os.path.basename(blob.name))
    blob.download_to_filename(local)
    print(f"Downloaded {blob.name} -> {local}")

```
## 4. Download data from Bigquery shared datasets

Prefer Python for querying shared BigQuery datasets? Request a BigQuery-scoped token
and run parameterised queries against the Shared BigQuery dataset (see
[`Bigquery Sharing`](../data-access/analytical-hub.md) for dataset names and schema details):

```python
import os

import requests
from google.cloud import bigquery
from google.oauth2.credentials import Credentials

API_KEY = os.environ["API_KEY"]
BASE_URL = "https://users.api.telcofy.ai"

# Step 1: Get a BigQuery-scoped token
resp = requests.post(
    f"{BASE_URL}/login-with-apikey",
    headers={"x-api-key": API_KEY},
    json={"service": "bigquery"},
)
resp.raise_for_status()
token_data = resp.json()

creds = Credentials(token=token_data["accessToken"])

# Step 2: Initialise the BigQuery client with the temporary credentials
client = bigquery.Client(project="YOUR_SHARED_PROJECT", credentials=creds)

# Step 3: Query Telcofy analytical hub views
query = """
    SELECT
      c.target_name, 
      c.timestamp, 
      c.people_count  
    FROM `YOUR_SHARED_PROJECT.YOUR_DATASET.realtime_summary` c
    WHERE c.timestamp >= '2025-10-10T00:00:00Z' 
    LIMIT 10
"""

for row in client.query(query):
    print(
        f"{row.target_name} | {row.timestamp} | {row.people_count} "
    )

```

Need the same scope from the CLI? Include the JSON payload when calling the login endpoint:

```bash
curl -s -X POST https://users.api.telcofy.ai/login-with-apikey \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"service":"bigquery"}'
```

---

## 5. Call the Data API (Realtime & Aggregations)

The Data API accepts your Telcofy API key via the `x-api-key` header.

Toggle realtime monitoring for a saved admin map:

```bash
curl -s -X POST https://data.api.telcofy.ai/realtime \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "map_id": "2nnuJGDA0axOeuafA0wy", "enable": false }'
```

Example response:

```json
{
  "msg": "Realtime monitoring disabled",
  "map_id": "2nnuJGDA0axOeuafA0wy",
  "is_monitored": false,
  "bq_updated_rows": 1
}
```


Fetch a synchronous population aggregation:
// THIS FEATURE UNDER DEVELOPMENT AND NOT AVAILABLE IN PRODUCTION

```bash
curl -s "https://data.api.telcofy.ai/data-agg?agg_type=activities&measure=sum_unique_people&start_time=2024-03-01T08:00:00Z&end_time=2024-03-01T09:00:00Z&activity_type=hourly&geo_type=grid_250m&geo_ids=22637506648500" \
  -H "x-api-key: $API_KEY" | jq '.results[0]'
```

Submit a long-running aggregation job (exports to Cloud Storage when `full=true`):

```bash
curl -s -X POST https://data.api.telcofy.ai/data-agg \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
        "agg_type": "activities",
        "measure": "sum_unique_people",
        "start_time": "2024-03-01T00:00:00Z",
        "end_time": "2024-03-01T23:59:59Z",
        "activity_type": "daily",
        "geo_type": "grid_1000m",
        "geo_ids": [22637506648500, 22640006648500],
        "full": true
      }'
```

Poll `/data-agg/status/{jobId}` and `/data-agg/results/{jobId}` until the job
completes, then download the exported files from Cloud Storage using the OAuth
token retrieved earlier.

---

## 6. Keep Exploring

- Review `authentication.md` for API key exchange details and best practices.
- Consult `endpoints.md` for the full list of supported Users API and Data API routes.
- Reach out to your Telcofy account team if you need additional dataset access or
  assistance with automation.

Happy building!


--- FILE: api/webhooks.md ---

---
sidebar_position: 4
---

# Webhooks

Coming soon...


--- FILE: data-access/overview.md ---

---
sidebar_position: 1
---

# Data Delivery Methods Overview

Telcofy offers several pathways to explore, export, and integrate telecom insights. Choose the delivery mechanism that best fits your workflow, whether you prefer file-based exploration, SQL-driven analysis, or near-real-time API calls.

All Telcofy data products can be accessed and configured through the [Telcofy CityOS](https://app.telcofy.ai). If you do not yet have console access, reach out to [tom@telcofy.ai](mailto:tom@telcofy.ai) to request a trial.

Telcofy curates two product families:

- **Analytical products (Activities, ODMs, …)** — export curated files to your cloud storage bucket (see *Storage-backed datasets*), subscribe to governed tables via BigQuery Sharing, or automate retrieval through the REST API with tools like `curl`, Python, or Node.js clients.
- **Low-latency products (Telcofy Realtime)** — refreshed roughly every five minutes and best consumed via BigQuery Sharing or the REST API to keep downstream systems current.

## Storage-backed datasets

For teams that want direct file access, Telcofy curates data drops in familiar formats such as CSV, JSON, and Parquet. These assets are delivered through blob storage so you can pull them into notebooks, lakehouses, or existing ETL pipelines without additional tooling. See [API Reference](../api/quickstart.md) for more details

## BigQuery Sharing

If you already rely on Google Cloud, Telcofy's BigQuery listings provide an interactive SQL experience with governed sharing. Start with the curated listings described in the [BigQuery Sharing guide](./analytical-hub.md) to join, filter, and enrich datasets using native BigQuery tooling.

## REST API

For API-first integrations and operational systems that require programmatic access, Telcofy exposes the same curated data sets through a REST interface. Follow the [REST API quickstart](../api/quickstart.md) to authenticate, browse resources, and embed Telcofy insights into your applications.


--- FILE: data-access/analytical-hub.md ---

---
sidebar_position: 2
---

# BigQuery Sharing

Telcofy distributes curated telecom intelligence as reusable BigQuery data exchanges. By leveraging [BigQuery Sharing](https://cloud.google.com/bigquery/docs/analytics-hub-introduction), you can subscribe to governed datasets directly inside Google Cloud, eliminating the overhead of manual data copies and keeping all consumers aligned on a single, auto-updating source of truth.

## Why use BigQuery Sharing listings

- **Native BigQuery experience** — query Telcofy tables with standard SQL, join them with your internal assets, and manage access through IAM.
- **Consistent updates** — subscribed listings always point to the latest Telcofy-managed data, so you avoid drift across teams and environments.
- **Governance and observability** — Google Cloud's audit logs, tagging, and lineage features flow through to the shared datasets, simplifying compliance reviews.

## Prerequisites

- A Google Cloud project with BigQuery enabled in the `eu` multi-region.
- Permission to view and subscribe to Telcofy's `realtime_customer_views` listing.
- (For API access) The `analyticsHub.googleapis.com` service enabled plus credentials with the `bigquery.dataViewer` and `analyticshub.listings.subscribe` permissions.

## Explore available listings

Sign in to the BigQuery console and open **BigQuery Sharing** from the left navigation. Search for *Telcofy* to locate the `realtime_customer_views` exchange or browse via the direct link shared by the Telcofy team. The [Google Cloud guide on viewing and subscribing to listings](https://cloud.google.com/bigquery/docs/analytics-hub-view-subscribe-listings#subscribe-listings) walks through the UI elements if you are new to the workspace.

## Subscribe to Telcofy's listing

BigQuery Sharing supports both console-based subscriptions and fully automated flows through the REST API.

### Option A: BigQuery console

1. In the BigQuery console, open **BigQuery Sharing** and navigate to the `Telcofy / Real-time Customer Views` listing.
2. Review the dataset details, including the data refresh cadence and usage terms.
3. Click **Subscribe**. Choose an existing project and dataset location (must be `EU`) where the linked dataset should live.
4. Confirm. BigQuery creates a **linked dataset** in your project that mirrors the Telcofy tables. You can now run SQL queries in the `bigquery-public-data` style using the dataset name you selected.

### Option B: REST API

Automate onboarding by calling the BigQuery Sharing API endpoint:

```bash
curl -X POST \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  -H "Content-Type: application/json" \
  "https://analyticshub.googleapis.com/v1/projects/telcofy-norway-poc/locations/eu/dataExchanges/realtime_customer_views/listings/realtime_customer_views_19a0c4cec2a:subscribe" \
  -d '{
    "destinationDataset": {
      "datasetReference": {
        "projectId": "YOUR_PROJECT_ID",
        "datasetId": "LINKED_DATASET_NAME"
      },
      "location": "EU"
    }
  }'
```

This request subscribes the specified project to the `realtime_customer_views` listing and creates (or reuses) the linked dataset. Ensure that the caller has the required IAM roles and that the destination dataset location matches the listing region.

Once subscribed—via either method—query the linked dataset from BigQuery, schedule downstream jobs, or grant access to additional teammates through standard IAM policies.


--- FILE: analytics/overview.md ---

---
sidebar_position: 1
---

# Analytics Overview

Coming soon...


--- FILE: analytics/visualizations.md ---

---
sidebar_position: 4
---

# Visualizations

Coming soon...


--- FILE: analytics/dashboard.md ---

---
sidebar_position: 2
---

# Dashboard

Coming soon...


--- FILE: analytics/custom-queries.md ---

---
sidebar_position: 3
---

# Custom Queries

Coming soon...


