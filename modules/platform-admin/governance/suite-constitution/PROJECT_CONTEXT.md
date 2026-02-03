# PROJECT_CONTEXT.md — Bassan.os Execution Context

**Last Updated:** 2026-02-01

This file provides a single, authoritative context for continuing execution of the Bassan.os project across new chats, tools, and AI assistants.  
Any engineer or AI must read this file before performing work on the project.

---

## 1) Project Identity

**Project Name:** Bassan.os  
**Nature:** Multi-tenant platform core + suite ecosystem  
**Execution Model:** Governance-first · Fail-closed · Contract-locked Core

Core provides:
- Authentication
- Tenant isolation
- Contracted API surface
- Workflow primitives
- Governance & execution controls

Suites are built **outside** Core and must never break Core contracts.

---

## 2) Current Execution Status

The project has reached:

✔ Core Contract v1 extracted from source  
✔ Core Contract minimal lock completed  
✔ Governance bundle established  
✔ Part2 Suite architecture specs created  
✔ Alignment pass completed  
✔ Runtime tenant & permission audit framework created  

Current milestone:
➡ Post Gate 5.3A — Core Contract Lock

Core behavior is now considered **immutable contract**.

---

## 3) Source of Truth (Strict Order)

Truth priority:

1. backend/src/** → Real code behavior
2. Core Contract artifacts
3. Governance documents
4. Alignment & audit reports
5. Suite specifications

If documentation conflicts with code → **code wins**.

---

## 4) Governance Rules

Non-negotiable rules:

- Core APIs must not break once locked.
- Suites must extend, not modify, Core.
- Tenant isolation must always be enforced.
- Authorization failures must fail closed.
- Documentation must mirror reality, not assumptions.
- No speculative endpoints allowed.

---

## 5) System Layers Overview

Core Engine (locked contract)
    ↓
Suites (CRM, Omni, Automation, AI, Analytics, etc.)
    ↓
Extensions / Marketplace
    ↓
Tenant Applications

Core is stable. Everything else evolves above it.

---

## 6) Current Technical Focus

Execution is now focused on:

- Verifying tenant boundary enforcement
- Verifying permission enforcement
- Preventing cross-tenant access
- Preparing safe Suite implementation
- Maintaining governance discipline

---

## 7) Next Execution Direction

Next major steps typically include:

1. Finalize runtime tenant/permission audits
2. Stabilize governance & stop conditions
3. Begin first Suite implementation
4. Expand platform safely without breaking Core

---

## 8) Instructions for AI Assistants

When continuing work:

- Assume project continuity
- Do not request historical recap unless required
- Use code as primary truth
- Avoid speculative features
- Preserve governance discipline
- Avoid scope creep

---

## 9) Usage Instructions

When opening a new execution chat, provide this file and state:

Continue Bassan.os execution from PROJECT_CONTEXT.md state.

Execution should resume from current governance stage.

---

**End of PROJECT_CONTEXT.md**
