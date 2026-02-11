## Bassan OS Platform UI Density Policy

Status: Architecture Approved
Owner: Platform UX Governance
Scope: Entire Platform UI

---

# 1. Purpose

UI Density defines **how much information appears on screen at once**.

It controls:

• usability  
• readability  
• fatigue level  
• productivity speed  
• scanning efficiency  
• error rate  
• long-session comfort  

Density decisions affect every table, form, inbox, dashboard,
and builder in the platform.

Density mistakes destroy usability over time.

This document prevents that.

---

# 2. Why Density Matters in Bassan OS

Bassan OS is not a casual app.

Users stay inside the system:

• 4–10 hours per day
• handling large data
• managing operations
• scanning lists repeatedly
• working under pressure

Wrong density results in:

- eye fatigue
- slower work
- user frustration
- cognitive overload
- mistakes

Correct density results in:

- faster scanning
- lower fatigue
- higher efficiency
- long-term usability

---

# 3. Density Extremes (What We Avoid)

## Too Dense

Example:

Row Row Row Row Row Row Row Row
Row Row Row Row Row Row Row Row
Row Row Row Row Row Row Row Row


Problems:

• Hard to scan
• Hard to click
• Eye fatigue
• Mistakes increase

---

## Too Sparse

Example:

Row

Row

Row


Problems:

• Wasted space
• More scrolling
• Slower workflows
• Lower productivity

---

# 4. Bassan OS Density Philosophy

Density must adapt to work context.

Rule:

> Density follows task, not aesthetics.

Meaning:

Inbox ≠ Dashboard ≠ Builder

Each workspace type needs different density.

---

# 5. Adaptive Density Model

Bassan OS adopts:

## Adaptive Density Policy

Density changes per suite.

Not fixed across system.

---

# 6. Density Levels

## Level 1 — Operational Density (High)

Used for:

• Omnichannel Inbox
• Support queues
• Operations lists
• Ticket systems
• Live queues

Goal:
maximize visible rows.

Example:

┌───────────────────────────────┐
│Chat│User│Time│Status│Channel │
├───────────────────────────────┤
│... │... │... │... │... │
│... │... │... │... │... │
│... │... │... │... │... │
└───────────────────────────────┘


Rules:

• smaller row height
• compact padding
• quick scanning

But never cramped.

---

## Level 2 — Analytical Density (Medium)

Used for:

• Dashboards
• CRM lists
• Reports
• Analytics views

Goal:
balance readability and information.

Example:

┌───────────────────────────────┐
│ Card │ Chart │
│ Analytics │
├───────────────────────────────┤
│ Data table with spacing │
└───────────────────────────────┘


Rules:

• moderate spacing
• readable charts
• grouped data

---

## Level 3 — Builder Density (Spacious)

Used for:

• Automation builders
• AI Studio
• Workflow editors
• Pipeline editors

Goal:
reduce cognitive overload.

Example:

[ Trigger ] → [ Decision ] → [ Action ]


Rules:

• large spacing
• visual breathing
• minimal noise

---

# 7. Density Distribution Diagram

System density map:

HIGH DENSITY
┌────────────────────────────┐
│ Inbox / Operations │
└──────────────┬─────────────┘
│
▼
MEDIUM DENSITY
┌────────────────────────────┐
│ CRM / Dashboards / Reports │
└──────────────┬─────────────┘
│
▼
LOW DENSITY
┌────────────────────────────┐
│ Automation / AI Builders │
└────────────────────────────┘


---

# 8. Density Rules That Cannot Break

The following rules are permanent:

• Row height must never block readability
• Click targets must remain comfortable
• Tables must remain scannable
• Filters must not compress content
• Panels must not shrink workspace permanently

---

# 9. Workspace Protection Rule

Workspace must remain dominant.

Panels, filters, drawers:

• appear temporarily
• collapse when unused
• never permanently steal space

---

# 10. Scanning Speed Principle

Users must scan:

• 20–50 rows in seconds
• large datasets comfortably

Density must optimize scanning,
not decoration.

---

# 11. Long Session Comfort Rule

Users may spend hours inside:

• inbox
• CRM
• dashboards

Density must reduce fatigue,
not maximize data blindly.

---

# 12. Density Override Policy

Future versions may allow:

User selectable density modes:

• Compact
• Comfortable
• Spacious

But system default remains adaptive.

---

# 13. Implementation Guidance

Developers must:

• avoid fixed heights
• use scalable spacing
• respect density levels per suite

Design must not drift.

---

# 14. Final Decision

Bassan OS adopts adaptive density
as a permanent UI rule.

Density follows work context,
not visual style.

All suites must comply.
