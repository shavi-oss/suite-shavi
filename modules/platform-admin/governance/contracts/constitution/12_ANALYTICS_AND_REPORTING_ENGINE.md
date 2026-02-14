# ULTRA SPEC PART 2 — 12 ANALYTICS & REPORTING ENGINE (Deep · Execution Canonical)

**Last Updated:** 2026-02-01  
**Status:** CANONICAL (Analytics, Aggregations, Dashboards, Exports)  
**Depends on:** `01_SCHEMAS.md`, `05_WORKERS_AND_JOBS.md`, `06_EVENTS_AND_OBSERVABILITY.md`, `07_STORAGE_AND_FILES.md`

> **🔴 SCOPE NOTICE:** This describes **SUITE-LAYER** analytics/reporting (future). Core v1 has NO analytics system. See: `backend/governance/core-contract/CORE_CONTRACT_V1_EXTRACT.md`

> **Meaning:** This document defines the analytics & reporting subsystem across all Suites:
>
> - metric ingestion
> - aggregation pipelines
> - dashboards & widgets
> - report execution
> - export generation
> - performance & cost safety

Analytics must be accurate, tenant-isolated, scalable, and safe for production workloads.

---

# 0) Analytics Principles (Non-Negotiable)

## 0.1 Tenant Isolation

All analytics queries are scoped by `organizationId`.  
No cross-tenant aggregations allowed.

## 0.2 DB Is Source of Truth

Analytics data derived from operational DB or event streams.  
Analytics layer never replaces transactional correctness.

## 0.3 Cost & Query Safety

Heavy queries must:

- run asynchronously
- enforce limits
- prevent DB overload.

---

# 1) Architecture Overview

Data Sources:

- operational tables (CRM, Omni, AI, Automation)
- EventLog stream
- job metrics

Flow:
Event/Data → aggregation jobs → metrics tables → dashboards/reports → exports

Components:

- Aggregation workers
- Metrics storage tables
- Report execution jobs
- Dashboard query API

---

# 2) Metrics Model

Metrics categorized as:

## 2.1 Counters

Examples:

- messages sent
- conversations opened
- leads created
- AI requests

## 2.2 Time Series

Examples:

- messages/day
- revenue per month
- conversation duration trends

## 2.3 Distribution Metrics

Examples:

- response time buckets
- message latency

Metrics stored aggregated by:

- time bucket
- tenant
- dimension (optional)

---

# 3) Aggregation Pipeline

## 3.1 Aggregation Jobs

Workers compute aggregates:

- hourly jobs
- daily rollups
- monthly summaries

Jobs:

- analytics.aggregate_hourly
- analytics.aggregate_daily

## 3.2 Incremental Aggregation

Only process new events since last checkpoint.

## 3.3 Idempotency

Aggregation jobs must be rerunnable safely.

---

# 4) Dashboards

Dashboards composed of widgets:

Widget types:

- KPI counters
- line charts
- bar charts
- funnel charts
- tables

Widgets query aggregated tables, not raw data.

Dashboards customizable per tenant.

---

# 5) Report Engine

Reports defined as reusable queries:

- filters
- grouping
- metrics selection

Report execution:

- async job generates dataset
- stored temporarily
- can be exported

---

# 6) Export Engine

Exports triggered via:
POST `/analytics/report-runs/{id}/export`

Formats:

- CSV
- Excel
- PDF (future)

Flow:

1. job executes export
2. file stored via storage layer
3. signed URL generated
4. download audited

Exports expire automatically.

---

# 7) Performance & Scaling

## 7.1 Query Limits

- maximum rows per report
- max time window per query
- pagination enforced

## 7.2 Heavy Queries

Large datasets processed offline via workers.

## 7.3 Caching

Frequently requested dashboards cached per tenant.

---

# 8) Security & Compliance

Rules:

- analytics data respects permissions
- sensitive fields masked
- exports audited

Audit events:

- report run
- export generation
- export download

---

# 9) Observability

Metrics:

- report execution time
- aggregation job durations
- export job failures

Events:

- analytics.report.run.started
- analytics.report.run.completed
- analytics.export.generated

---

# 10) Stop Conditions

- cross-tenant aggregation attempt
- query exceeding safety limits
- export without permission

Result: stop_condition_triggered

---

# 11) Implementation Checklist

- [ ] aggregation jobs scheduled
- [ ] reports async execution
- [ ] export files TTL enforced
- [ ] dashboard caching enabled
- [ ] permission filters applied
- [ ] observability metrics emitted

**END — 12 ANALYTICS & REPORTING ENGINE**
