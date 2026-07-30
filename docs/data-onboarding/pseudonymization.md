---
sidebar_position: 2
title: Pseudonymization
---

# Pseudonymization

Before any network event reaches Telcofy, direct subscriber identifiers must be pseudonymised. This step runs entirely on the telecom operator's side — inside its own security perimeter, on infrastructure it owns and operates. It happens before TelcofyCore ever sees a record, and before any other stage described in this section.

That boundary is central to how Telcofy handles telecom data: personal data never leaves the telecom operator's network, and the pseudonymisation process itself is owned and operated by the operator, not by Telcofy. Telcofy never receives a raw IMSI, and never receives the key used to pseudonymise it — only the resulting pseudonym flows into the ingest pipeline described next.

## Two ways to build the pseudonym

Both approaches turn a subscriber's IMSI into a fixed-length pseudonym. They differ in how resistant that pseudonym is to being reversed.

### Salted hash

```
SHA-256(salt + IMSI)
```

A general-purpose hash with a salt attached to the input — a familiar pattern from password storage. But an IMSI isn't a password: it's a short, low-entropy, publicly-structured value (a known carrier prefix plus a handful of digits), and the salt is typically stored alongside the data rather than kept secret. Once the salt is known, the underlying IMSI space is straightforward to re-derive. [ENISA's *Pseudonymisation techniques and best practices*](https://www.enisa.europa.eu/publications/pseudonymisation-techniques-and-best-practices) covers this construction in section 5.1.3, flagging it as weak when used on its own.

### Keyed hash

```
HMAC-SHA-256(K, IMSI)
```

The same idea, keyed with a secret instead of a public salt. The key `K` is generated and held in the telecom operator's own key management system, never transmitted anywhere, and never stored alongside the pseudonymised data. Because there's no public salt to work backwards from, this construction resists the enumeration attack the salted variant is vulnerable to. ENISA covers this in section 5.1.4, classifying it as robust provided the key itself is protected.

**Telcofy's default ingestion pipelines are built around the keyed-hash approach.**

## Where this fits

Pseudonymisation is the one step that happens entirely on the telecom operator's side, before anything crosses into Telcofy. It runs on infrastructure it owns, using a key it controls, and produces the identifier that flows into the [ingest pipeline](./probe-data-ingest.md). Telcofy has no visibility into — and no need for — anything upstream of that pseudonym.

If this pipeline doesn't exist yet, the telecom operator doesn't need to build it alone: Telcofy Professional Services can design and implement it together with the operator, on its own premises, and then handle the integration into TelcofyCore. For rotation schedules, key management guidance, and implementation support, reach out to [sales@telcofy.ai](mailto:sales@telcofy.ai).
