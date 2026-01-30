# 🧠 Sonnet 4.5 — Daily Execution Checklist (LDE)

**Document Type:** OFFICIAL EXECUTION CHECKLIST
**Audience:** Sonnet 4.5 (Implementation Agent)
**Repo:** Suite
**Scope:** Suite → platform-admin → Gate 4.x
**Execution Mode:** STRICT · FAIL-CLOSED · GOVERNANCE-FIRST

---

## 0️⃣ Absolute Rules (Read Every Day)

* You are NOT building product features.
* You are building a **control-plane kernel**.
* Bassan.os Core is a **BLACK BOX** — do not touch, import, or assume.
* Any ambiguity = **STOP**.
* Writing LESS code is success.

---

## 1️⃣ Mental Model (Do Not Drift)

```
Bassan.os Core (LOCKED)
        ↓
Suite Control Plane  ← YOU ARE HERE
        ↓
Everything Else (NOT YOUR JOB YET)
```

If a change helps anything **below** this line, it is probably **out of scope**.

---

## 2️⃣ Daily Start Checklist (Before Writing Code)

* [ ] Confirm current Gate authorization (Gate number explicitly approved)
* [ ] Read the Execution Board (`BASSAN_EXECUTION_BOARD.md`)
* [ ] Verify previous gates are CLOSED and TAGGED
* [ ] Confirm no parallel gate work is active
* [ ] Re-read gate-specific prompt

If ANY item fails → **STOP**.

---

## 3️⃣ Allowed Work Surface (platform-admin)

You MAY work ONLY inside:

```
modules/platform-admin/
```

You MUST NOT:

* Import from Bassan.os Core
* Import from other Suite modules
* Add middleware, controllers, or services (unless explicitly authorized)
* Add DB logic
* Add UI logic
* Add helpers “for later”

---

## 4️⃣ Gate-by-Gate Daily Execution

### 🔹 Gate 4.2 — Data Contracts (Interfaces Only)

**Daily Focus:** Define shapes, not behavior.

Allowed:

* `interface`
* `type`

Forbidden:

* Classes
* Runtime logic
* Validation
* DB access
* Core calls

Daily Exit:

* [ ] Interfaces compile
* [ ] No runtime diff
* [ ] `git diff` shows contracts only

---

### 🔹 Gate 4.3 — RBAC (Deny-by-Default)

**Daily Focus:** No action without permission.

Rules:

* Default = deny
* Explicit allow only
* No implicit roles

Daily Exit:

* [ ] Permission model defined
* [ ] No default grants
* [ ] Missing permission = denied

---

### 🔹 Gate 4.4 — Tenant Mapping Resolver

**Daily Focus:** Prevent cross-tenant access.

Rules:

* Single resolver
* Missing mapping = STOP
* No auto-create

Daily Exit:

* [ ] Resolver is fail-closed
* [ ] No fallback behavior

---

### 🔹 Gate 4.5 — Audit Write Path

**Daily Focus:** Everything leaves a trace.

Rules:

* Write-only
* Immutable
* No reads
* No analysis

Mandatory fields:

* actor
* action
* resource
* orgId
* correlationId
* timestamp

Daily Exit:

* [ ] Audit write enforced
* [ ] Missing audit context = denied

---

### 🔹 Gate 4.6 — Correlation Enforcement

**Daily Focus:** Trace every request.

Rules:

* Correlation ID required
* Propagated end-to-end
* Written to audit

Daily Exit:

* [ ] Missing correlationId = rejected

---

### 🔹 Gate 4.7 — Core Adapter

**Daily Focus:** Safe, minimal Core integration.

Rules:

* Server-only token
* Contract-based calls
* No guessing

Daily Exit:

* [ ] Adapter respects contract
* [ ] No Core assumptions

---

### 🔹 Gate 4.8 — Template Publish Command

**Daily Focus:** Configuration, not execution.

Rules:

* No auto-apply
* Human approval required
* Versioned

Daily Exit:

* [ ] Templates registered only

---

## 5️⃣ Evidence Checklist (End of Day)

* [ ] `git status --porcelain` is clean
* [ ] `git diff --stat` matches gate scope
* [ ] Lint passes
* [ ] Build passes
* [ ] No unauthorized files touched

If ANY check fails → **DO NOT COMMIT**.

---

## 6️⃣ Commit Discipline

* One gate = one commit
* Clear commit message (`gateX.Y(scope): description`)
* Tag immediately after approval

---

## 7️⃣ Stop Conditions (Success Criteria)

You MUST STOP if:

* You feel tempted to optimize
* You want to prepare for a future gate
* You think “this will save time later”
* You are unsure if something is allowed

Stopping is SUCCESS.

---

## 8️⃣ Final Reminder

> You are building the rules of the system, not the system itself.
> Precision beats speed.
> Governance beats cleverness.

---

**Next Action:** Execute ONLY the currently authorized Gate.

# 🧭 Bassan Platform — Execution Board & Master Roadmap (Post-Core)

**Status:** OFFICIAL · SINGLE SOURCE OF TRUTH
**Repo:** Suite
**Scope:** Post-Core Platform Execution (Suite Only)
**Execution Mode:** STRICT · FAIL-CLOSED · GOVERNANCE-FIRST

---

## 1️⃣ Immutable Foundations (DO NOT REPEAT / DO NOT REOPEN)

### 1.1 Bassan.os Core (LOCKED)

* BLACK BOX · IMMUTABLE · PRODUCTION-READY
* Provides ONLY:

  * Multi-tenant isolation
  * Organizations / Users / Roles / Permissions
  * Workflow Engine (state machine)
  * Triggers & Executions
  * Fail-closed security

**Core MUST NOT contain:**

* UI
* Business logic
* CRM / Omnichannel
* AI decisions

> Any capability outside this list is **OUTSIDE CORE**.

---

### 1.2 Global Invariants (Apply to EVERYTHING)

* UI ❌ → Core (FORBIDDEN)
* UI ✅ → BFF → Core (ONLY allowed path)
* Core tokens = server-only
* Core DB ≠ Suite DB (hard separation)
* Tenant boundary = organizationId mapping ONLY
* Any ambiguity = **FAIL-CLOSED**

---

## 2️⃣ Authoritative System Layers (One-Time Definition)

### Layer A — Core Engine

* Bassan.os Core (LOCKED)
* No execution here

---

### Layer B — Suite Control Plane (CURRENT FOCUS)

**Purpose:** Governance + isolation + integration kernel.

Responsibilities:

* Server-to-server Core integration
* Tenant mapping enforcement
* RBAC (deny-by-default)
* Correlation IDs
* Suite-level audit writing
* Rate limiting
* Fail-closed enforcement

> No vertical features, UI panels, AI, or business logic may start before this layer is COMPLETE.

---

### Layer C — Suite Data Layer (Suite DB)

**Purpose:** Store all non-core data.

Owns:

* Business entities (clients, patients, sessions)
* Templates & configuration
* Messaging logs
* Partner relations
* Usage & value metrics
* Suite audit mirror

---

### Layer D — Access Layer (UI)

**Purpose:** User interaction only.

Forms:

* Web
* PWA
* Mobile (later)

Rules:

* No Core tokens
* No security decisions
* No direct Core calls

---

## 3️⃣ Execution Track — Control Plane (platform-admin)

### 3.1 Module Scope

**Module:** platform-admin
**Role:** Control-plane kernel inside Suite.

---

### 3.2 Gate 4 — Micro-Gated Implementation (Authoritative)

```
Gate 4.1 — Skeleton & Deny-All        ✅ CLOSED / TAGGED
Gate 4.2 — Data Contracts            ⏭ NEXT
Gate 4.3 — RBAC (deny-by-default)
Gate 4.4 — Tenant Mapping Resolver
Gate 4.5 — Audit Write Path
Gate 4.6 — Correlation Enforcement
Gate 4.7 — Core Adapter
Gate 4.8 — Template Publish Command
Gate 4.9 — HTTP Layer (ONLY if authorized)
Gate 4.10 — Hardening & Evidence Pack
```

**Exit Conditions (Gate 4 COMPLETE):**

* Isolation proven
* Audit + correlation enforced
* Core integration contract-safe

---

## 4️⃣ Platform Execution Roadmap (Sequential — No Skips)

### Phase 1 — Control Plane Kernel (MANDATORY)

* platform-admin Gates 4.1 → 4.10
* No UI
* No business logic
* No AI

---

### Phase 2 — Smart Onboarding & Templates

* Business profiling
* Default departments & roles
* Template injection (config only)
* Guided setup
* Human approval gates

---

### Phase 3 — First Vertical (Pilot)

**Example:** Medical / PT Center

* Client Admin Panel
* Staff Panels (Reception / Doctor / Staff)
* Session & record management
* Optional patient view

> All vertical logic lives ABOVE the control plane.

---

### Phase 4 — Communication & Sync Layer

* Event propagation
* Notifications
* Unified timeline
* Audit mirror updates

---

### Phase 5 — Partner / Network Suite (HIGH RISK)

* Company ↔ Company requests
* Approval workflows
* Scoped permissions
* Event sharing (NO data sharing)
* Remote workers

> Executed ONLY after isolation & audit are battle-tested.

---

### Phase 6 — Usage, Value & Compliance

* Audit viewer
* Permission reviews
* Secure exports
* Usage & ROI metrics
* Trust & compliance indicators

---

### Phase 7 — AI Layer (LAST)

**AI = Assistant, NOT Decision Maker**

* Suggests
* Explains
* Drafts

Restrictions:

* No autonomous execution
* Human approval required
* Full traceability

Includes:

* Staff AI
* Admin AI
* Sales AI
* Support AI
* Developer AI

---

### Phase 8 — AI Template Factory (Advanced)

* Discovery chat
* Workflow understanding
* Blueprint extraction
* Diagram generation
* Template customization
* Client approval
* Apply to tenant

---

## 5️⃣ Daily Execution Control — Kanban System

### 5.1 Fixed Columns (DO NOT CHANGE)

1. BACKLOG — Authorized, not started
2. READY — Preconditions verified
3. IN PROGRESS — ONE card only
4. EVIDENCE REQUIRED — Waiting for proof
5. REVIEW — Architecture authority decision
6. DONE — Locked & tagged

---

### 5.2 Gate 4.5 — Audit Write Path (Planned Cards)

**Card 4.5-A — Audit Contract Definition**

* Write-only interface
* actor / action / resource / orgId / correlationId / timestamp
* No reads · No DB

**Card 4.5-B — Audit Writer Skeleton**

* Compile-safe shell
* No persistence logic

**Card 4.5-C — Fail-Closed Enforcement**

* Missing audit context → deny
* No silent bypass

**Card 4.5-D — Correlation Binding**

* correlationId mandatory
* Reject ambiguity

**Card 4.5-E — Evidence & Lock**

* git diff limited
* lint & build pass
* commit + tag

> Gate 4.5 execution is FORBIDDEN until Gates 4.2–4.4 are CLOSED.

---

## 6️⃣ Engineer Rules (30-Year Notes)

* Kernel before features
* Audit before AI
* Isolation before partners
* Templates = configuration, never code
* Stopping early is success
* Any doubt = STOP

---

## 7️⃣ Current State (Single Line of Truth)

* Core: ✔️ LOCKED
* Control Plane: Gate 4.1 ✔️ CLOSED
* Next Authorized Action: **START GATE 4.2 — Data Contracts (interfaces only)**
-------
