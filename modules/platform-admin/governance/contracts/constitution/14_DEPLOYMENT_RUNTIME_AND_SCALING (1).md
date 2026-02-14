# ULTRA SPEC PART 2 — 14 DEPLOYMENT, RUNTIME & SCALING (Deep · Execution Canonical)

**Last Updated:** 2026-02-01  
**Status:** CANONICAL (How Bassan runs in real infra)  
**Depends on:** `04_DATA_ACCESS_AND_SECURITY.md`, `05_WORKERS_AND_JOBS.md`, `06_EVENTS_AND_OBSERVABILITY.md`, `07_STORAGE_AND_FILES.md`, `13_BILLING_QUOTAS_AND_USAGE_CONTROL.md`

> **🔴 SCOPE NOTICE:** This describes **SUITE-LAYER** deployment (future). Core v1 deployment is simpler. See: `backend/governance/core-contract/CORE_CONTRACT_V1_EXTRACT.md`

> **Meaning:** This document defines how the complete Bassan ecosystem (Core + Suites + Apps) is deployed and scaled.
> It is designed to work from day-0 on one VPS, then scale to multi-node and multi-region without redesign.

---

# 0) Deployment Principles (Non-Negotiable)

## 0.1 One-Command Reproducibility

A production deployment must be reproducible:

- IaC preferred (Terraform/Ansible) later
- docker compose is acceptable early

## 0.2 Separation of Concerns

Core and Suites are separated components:

- Core = engine (auth/tenant/contract)
- Suites = vertical modules (CRM, Omni, Automation, AI, Analytics)
- Apps = UI clients (web/mobile)

## 0.3 Fail-Closed

If a service cannot guarantee tenant security:

- it must fail closed (no “partial”)

## 0.4 Portability

Avoid provider lock-in by using:

- Postgres
- S3-compatible storage
- standard load balancers
- container runtime

---

# 1) Runtime Topologies

## 1.1 Topology A — Single VPS (Bootstrapping)

Recommended for zero customers / early pilot.

Processes:

- API gateway (Suites)
- Workers (high/default/low/webhooks/scheduler)
- Postgres (optional local, better managed)
- Redis (if queue engine needs it)
- Reverse proxy (Nginx/Caddy)
- Monitoring agent (optional)

Pros:

- cheapest
- simplest
  Cons:
- no HA
- limited performance headroom

## 1.2 Topology B — Split DB + App (First Scale)

- Managed Postgres
- VPS for services
- Object storage external

Pros:

- DB stability improved
- easier scaling of workers
  Cons:
- slightly more cost

## 1.3 Topology C — Multi-Node (Growth)

- multiple service nodes behind LB
- dedicated worker nodes
- DB cluster managed
- separate search engine node (Meilisearch/OpenSearch)

## 1.4 Topology D — Multi-Region (Enterprise)

- region-local API nodes
- global routing
- geo-replicated storage
- primary DB + read replicas per region
- event replication strategy

---

# 2) Component Deployment Units

## 2.1 API Services

- suites-api (gateway + routing)
- per-suite services (optional split)

## 2.2 Workers

Worker groups:

- worker-high
- worker-default
- worker-low
- worker-webhooks
- scheduler

Scale by increasing replicas per group.

## 2.3 Databases

- Postgres primary
- optional read replicas
- migrations controlled by governance

## 2.4 Cache/Queue

- Redis (BullMQ etc.) or DB-backed job engine
- Must be durable enough for production

## 2.5 Search Engine

- Postgres FTS or Meilisearch or OpenSearch

## 2.6 Object Storage

- S3-compatible provider
- CDN optional

---

# 3) Environments

Environments:

- dev
- staging
- production

Rules:

- staging mirrors production topology as much as possible
- secrets per environment isolated
- databases separate

---

# 4) Configuration & Secrets

## 4.1 Config Sources

- env vars
- encrypted secrets manager (recommended)
- config file only for local dev

## 4.2 Secrets Handling

- never commit secrets
- rotate keys
- separate secrets per tenant if needed (provider configs stored per tenant)

---

# 5) Deployment Strategies

## 5.1 Rolling Deploy

For stateless services:

- rolling updates behind LB

## 5.2 Blue/Green Deploy

For safer deployments:

- deploy new version
- run health checks
- switch traffic

## 5.3 Migration Strategy

Schema changes:

- must be backward compatible
- deploy app first, then migrations or vice versa based on change type
- follow governance gates strictly

---

# 6) Scaling Rules

## 6.1 Scale Drivers

- number of employee users (staff) rather than end customers
- background jobs growth (broadcasts/exports/indexing)
- AI usage cost spikes

## 6.2 Scaling Levers

- add worker replicas for job-heavy workloads
- add API replicas for request-heavy workloads
- split suites into separate services
- introduce read replicas for analytics/search reads

## 6.3 Hard Limits

Define safe max per single node:

- max concurrent jobs
- max messages/min
- max exports/day

---

# 7) Performance Baselines

## 7.1 Targets

- API p95 latency < 500ms for normal CRUD
- messaging send pipeline queue delay p95 < 1 min
- dashboard render < 2s from aggregates

## 7.2 Bottlenecks

- DB CPU and IOPS
- worker CPU (exports/index)
- provider rate limits

---

# 8) Backups & Disaster Recovery

## 8.1 Postgres Backups

- daily full backups
- WAL archiving (preferred)
- restore test monthly

## 8.2 Object Storage Backups

- versioning enabled
- lifecycle policies
- optional replication

## 8.3 Recovery Objectives

- RPO: 24h initially, improve later
- RTO: 4–8h initially, improve later

---

# 9) Monitoring & Alerting

Must include:

- API latency/error rates
- DB health
- queue depth and DLQ
- provider health
- storage errors

On-call playbooks in `06_EVENTS_AND_OBSERVABILITY.md` apply.

---

# 10) Security Deployment Controls

- TLS everywhere
- WAF optional
- IP allowlists for admin endpoints
- mTLS (future)

---

# 11) Regional Considerations (Egypt/Gulf/Global)

Goals:

- low latency to Egypt & Gulf users
- global reach

Strategy:

- choose nearest region (e.g. EU/ME)
- use CDN for static assets
- keep DB close to majority of staff users
- provider endpoints for messaging may define latency constraints

---

# 12) Stop Conditions

- environment drift (staging != production materially)
- secrets leakage
- migration breaks backward compatibility
- inability to restore backup

Return:
stop_condition_triggered

---

# 13) Implementation Checklist

- [ ] single VPS topology documented (compose/systemd)
- [ ] staging environment exists
- [ ] backups automated + restore tested
- [ ] monitoring dashboards configured
- [ ] scaling plan defined (when to add nodes)
- [ ] governance for migrations enforced

**END — 14 DEPLOYMENT, RUNTIME & SCALING**
