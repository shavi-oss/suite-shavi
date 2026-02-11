# Shell Strategy
## Bassan OS Platform

Status: Architecture Locked
Owner: Platform Architecture Governance
Applies to: All Suites and Future Extensions

---

# 1. Purpose

This document defines the permanent **Shell Architecture**
of Bassan OS.

Shell = persistent system frame in which all work happens.

It defines:

• System frame
• Navigation behavior
• Workspace container rules
• Layout consistency
• Motion behavior
• Suite inheritance rules

Shell must remain stable across years.

---

# 2. Definition of Shell

Shell is the persistent structure of the platform.

Users stay inside the shell,
content changes within it.

Shell components:

App Shell
├ Header
├ Navigation Rail
└ Workspace Container


Only workspace content changes.

Shell never changes.

---

# 3. App Frame Concept

Bassan OS behaves like a desktop application.

Users feel inside a system window.

System Frame
└ Workspace Screen


The workspace is contained,
not full browser page.

---

# 4. Header Strategy

Header is global.

Contains:

• Brand context
• Navigation breadcrumbs
• Global search
• Notifications
• User menu
• Theme controls

Rules:

• Header never disappears
• Header never changes layout per page
• Header is system-level only

Page tools belong inside workspace.

---

# 5. Navigation Rail Strategy

Navigation rail is permanent.

It represents suite-level navigation.

Structure:

Collapsed Mode:
│🏠│
│💬│
│📊│
│⚙│


Expanded Mode:
│🏠 Dashboard │
│💬 Inbox │
│📊 Reports │
│⚙ Settings │


---

## Behavior Rules

Rail operates in three states:

### Expanded
On hover or manual expand.

### Collapsed
Icons only to maximize workspace.

### Active Indicator Mode
When collapsed, active suite shows workspace-colored indicator.

Users always know location.

---

# 6. Active Location Indicator

Active module appears as:

Workspace surface extending into rail.

Not colored button.

This creates OS continuity.

Sidebar Workspace
│ ◐ ████████


---

# 7. Workspace Container Strategy

Workspace is not raw page.

Workspace is:

• contained
• padded
• rounded
• separated from frame

Example:

Frame Background
└ Workspace Surface


Benefits:

• calmer UI
• reduced fatigue
• OS-like feeling

---

# 8. Suite Inheritance Rule

All suites inherit shell:

- Platform Admin
- CRM
- Omnichannel
- Automation
- AI Studio
- Analytics

Suites cannot redefine shell.

Allowed variation:

• accent colors
• minor contextual tools

Layout remains identical.

---

# 9. Motion Strategy

Motion exists for orientation only.

Allowed motion:

• sidebar expand
• drawer open
• navigation transitions

Motion duration:

150–250ms.

Forbidden:

• decorative animation
• bouncing effects
• attention-grabbing motion

---

# 10. Workspace Protection Rule

Workspace is dominant.

Panels:

• open temporarily
• collapse when unused
• never permanently shrink workspace

---

# 11. Forbidden Actions

Suites must NOT:

• redesign navigation
• remove header
• change workspace framing
• introduce custom shells

Architecture consistency is mandatory.

---

# 12. Performance Rule

Shell must load instantly.

Workspace content loads progressively.

Navigation must never block.

System must feel instant.

---

# 13. Long-Term Strategy

Shell must remain valid for:

• new suites
• AI tools
• future expansions

No redesign required.

---

# 14. Final Decision

Bassan OS uses one permanent shell.

Suites evolve inside it.

Shell does not evolve per suite.
