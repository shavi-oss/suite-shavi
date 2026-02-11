# Gate 29.5 — UI Density Policy

## Document Control

| Attribute      | Value                                 |
| -------------- | ------------------------------------- |
| Gate Number    | 29.5                                  |
| Gate Name      | System Vision Alignment               |
| Document Title | GATE_29_5_UI_DENSITY_POLICY           |
| Repo           | Suite (Layer / Product Repo)          |
| Module         | platform-admin                        |
| Status         | BINDING — GOVERNED POLICY             |
| Execution Mode | GOVERNANCE ONLY · NO CODE · NO DESIGN |
| Authority      | Platform UX Governance                |
| Effective Date | 2026-02-11                            |

---

## 1) Purpose

UI Density defines **how much information appears on screen at once**.

This is a **GOVERNED POLICY**, not a taste preference.

Density controls:

- Usability
- Readability
- Fatigue level
- Productivity speed
- Scanning efficiency
- Error rate
- Long-session comfort

**Evidence**: UI_Density_Policy.MD Section 1

---

## 2) Why Density Is Governed

Bassan OS is not a casual app.

Users stay inside the system:

- 4–10 hours per day
- Handling large data
- Managing operations
- Scanning lists repeatedly
- Working under pressure

**Wrong density results in**:

- Eye fatigue
- Slower work
- User frustration
- Cognitive overload
- Mistakes

**Correct density results in**:

- Faster scanning
- Lower fatigue
- Higher efficiency
- Long-term usability

**Evidence**: UI_Density_Policy.MD Section 2

---

## 3) Density as Policy (Not Aesthetics)

**Rule**:

> Density follows task, not aesthetics.

Meaning:

Inbox ≠ Dashboard ≠ Builder

Each workspace type needs **different density**.

**Evidence**: UI_Density_Policy.MD Section 4

---

## 4) Allowed Density Levels (ONLY)

Bassan OS allows **ONLY** these density levels:

### dense

**Used for**: Platform / Admin / Operations

**Characteristics**:

- Smaller row height
- Compact padding
- Quick scanning
- Maximize visible rows

**NOT**: Cramped or unreadable

---

### normal

**Used for**: Workspace / Inbox / CRM / Dashboards

**Characteristics**:

- Moderate spacing
- Readable charts
- Grouped data
- Balance readability and information

**NOT**: Wasteful of space

---

### focus

**Used for**: Builders (Automation / AI / Analytics)

**Characteristics**:

- Large spacing
- Visual breathing
- Minimal noise
- Reduce cognitive overload

**NOT**: Excessive whitespace

**Evidence**: UI_Density_Policy.MD Sections 6, 7

---

## 5) Density Mapping (LOCKED)

The following mapping is **BINDING**:

| Suite Type             | Density Level |
| ---------------------- | ------------- |
| Platform Admin         | dense         |
| Tenant Admin           | dense         |
| Operations / Support   | dense         |
| Omnichannel Inbox      | dense         |
| CRM Lists              | normal        |
| Dashboards             | normal        |
| Reports                | normal        |
| Workspace              | normal        |
| Automation Builders    | focus         |
| AI Studio              | focus         |
| Analytics Environments | focus         |
| Workflow Editors       | focus         |

**Evidence**: UI_Density_Policy.MD Sections 6, 7

---

## 6) Forbidden Density Practices

**MUST NOT**:

- Mix density levels in the same screen
- Implement responsive or adaptive density without governance approval
- Use density for visual style
- Override density for aesthetic reasons
- Create custom density levels

**Evidence**: UI_Density_Policy.MD Section 8

---

## 7) Density Rules That Cannot Break

The following rules are **permanent**:

- Row height must never block readability
- Click targets must remain comfortable
- Tables must remain scannable
- Filters must not compress content
- Panels must not shrink workspace permanently

**Evidence**: UI_Density_Policy.MD Section 8

---

## 8) Workspace Protection Rule

Workspace must remain **dominant**.

Panels, filters, drawers:

- Appear temporarily
- Collapse when unused
- **Never permanently steal space**

**Evidence**: UI_Density_Policy.MD Section 9

---

## 9) Scanning Speed Principle

Users must scan:

- 20–50 rows in seconds
- Large datasets comfortably

Density must **optimize scanning**, not decoration.

**Evidence**: UI_Density_Policy.MD Section 10

---

## 10) Long-Session Comfort Rule

Users may spend **hours** inside:

- Inbox
- CRM
- Dashboards

Density must **reduce fatigue**, not maximize data blindly.

**Evidence**: UI_Density_Policy.MD Section 11

---

## 11) Future Density Override Policy

Future versions **MAY** allow:

User-selectable density modes:

- Compact
- Comfortable
- Spacious

**BUT**: System default remains **adaptive** (task-based).

**Evidence**: UI_Density_Policy.MD Section 12

---

## 12) Implementation Constraints

Developers **MUST**:

- Avoid fixed heights
- Use scalable spacing
- Respect density levels per suite

Design **MUST NOT** drift.

**Evidence**: UI_Density_Policy.MD Section 13

---

## 13) Acceptance Criteria

This density policy is considered BINDING when ALL of the following are true:

- [x] Density defined as governed policy (not taste)
- [x] Only three density levels allowed (dense, normal, focus)
- [x] Density mapping locked per suite type
- [x] Mixed density in same screen explicitly forbidden
- [x] Responsive/adaptive density requires governance approval
- [x] Workspace protection rule established
- [x] Scanning speed principle defined
- [x] Long-session comfort rule defined

---

## 14) Signature

**Approved By**: Platform UX Governance  
**Date**: 2026-02-11  
**Status**: BINDING — GOVERNED POLICY  
**Authority**: UI_Density_Policy.MD
