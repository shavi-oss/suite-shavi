# Gate 18 — UI Execution Authorization

## 1. Authority

This document authorizes the **future** implementation of the Platform Admin UI, strictly bound by `MODULE_SCOPE_LOCK.md`.

**STATUS**: LOCKED
**MODE**: RESTRICTIVE (Whitelisting Only)
**EXECUTION TYPE**: DOCS-ONLY

## 2. Authorized UI Scope

The following screens are **AUTHORIZED** for implementation in subsequent gates:

1.  **Organization List** (View All)
2.  **Organization Detail** (Suspend/Unsuspend)
3.  **Create Organization Form**
4.  **Org Mapping Management** (List, Create, Link)
5.  **Internal User List** (View All)
6.  **Create Internal User Form**
7.  **User Detail** (Deactivate)
8.  **Audit Log Viewer** (Read-Only)

## 3. Forbidden UI Scope (Strictly Prohibited)

The following are **EXPLICITLY FORBIDDEN**:

- ❌ **Dashboard** (Deferred)
- ❌ **Settings** (Deferred)
- ❌ **Workflow Builder** (Out of Scope)
- ❌ **Customer User Management** (Out of Scope)
- ❌ **Billing / Subscription** (Out of Scope)
- ❌ **Direct Core Calls** (Architecture Violation)

## 4. Requirement for New Gate

Any runtime UI implementation (installing frameworks, writing components) requires a **NEW** Gate (Gate 19+) with its own authorization.
