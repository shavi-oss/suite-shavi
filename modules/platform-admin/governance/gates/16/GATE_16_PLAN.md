# Gate 16 — Host App / Console Definition (DOCS-ONLY) — Plan

## 1. Purpose

To strictly define the "Shell" (Host App) and "Console" (Admin Surface) for the Platform Admin module, establishing clear boundaries, user types, and navigation structures without implementing any code, UI, or business logic. This gate locks the architectural definition to enable a clean start for Gate 17 (UI Skeleton).

## 2. Scope

**IN SCOPE (Docs-Only):**

- **Host App Definition:** The "Shell" container, branding placeholders, and top-level navigation.
- **Console Definition:** The internal administrative surface definition.
- **User Types:** Definition of "Owner" and "Internal Admin" roles for this context.
- **Navigation Map:** High-level screen hierarchy (placeholders).
- **Auth Boundaries:** “Auth Boundaries: Boundary principles only.
No authentication mechanisms, flows, or processes are defined at this gate.”.
- **Integration Boundaries:** Strict mapping to Platform Admin module scope.

**OUT OF SCOPE (Forbidden):**

- **Implementation:** No code (TS/JS/HTML/CSS), no UI components, no authentication logic.
- **Dependencies:** No `npm install`, no new packages.
- **Dashboard Content:** Explicitly undefined (Client-Defined).
- **Business Logic:** No KPIs, no specific widgets, no client business rules.
- **Deployment:** No server, no build, no deploy.

## 3. Explicit Non-Goals

- We do NOT define _what_ goes inside the dashboard widgets.
- We do NOT define the specific visual design system (Gate 17).
- We do NOT implement the RBAC system (it is consumed from existing Governance).

## 4. Deliverables

1.  `modules/platform-admin/governance/GATE_16_PLAN.md` (This file)
2.  `modules/platform-admin/governance/GATE_16_AUTHORIZATION.md`
3.  `modules/platform-admin/governance/HOST_APP_CONSOLE_DEFINITION.md` (Core Definition)
4.  `modules/platform-admin/governance/GATE_16_VERIFICATION_EVIDENCE.md`
5.  `modules/platform-admin/governance/GATE_16_EXECUTION_REPORT.md`

## 5. Stop Conditions (FAIL-CLOSED)

Execution MUST STOP immediately if:

- Any code or file outside the allowed list is created/modified.
- Visual design or UI implementation is attempted.
- Dashboard content is defined (must remain "Client-Defined").
- Core (Bassan.os) is referenced as anything other than a Black Box.
- Direct UI-to-Core communication is ATTEMPTED or DESCRIBED.

## 6. Verification Checklist

- [ ] All 5 deliverable files exist.
- [ ] `HOST_APP_CONSOLE_DEFINITION.md` contains the required "Client-Defined" statement.
- [ ] No `src/` files touched.
- [ ] No `package.json` touched.
- [ ] No Core claims made beyond existing contracts.
