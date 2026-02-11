# Gate 29.5 — Shell Strategy

## Document Control

| Attribute      | Value                                 |
| -------------- | ------------------------------------- |
| Gate Number    | 29.5                                  |
| Gate Name      | System Vision Alignment               |
| Document Title | GATE_29_5_SHELL_STRATEGY              |
| Repo           | Suite (Layer / Product Repo)          |
| Module         | platform-admin                        |
| Status         | BINDING — ARCHITECTURE LOCKED         |
| Execution Mode | GOVERNANCE ONLY · NO CODE · NO DESIGN |
| Authority      | Platform Architecture Governance      |
| Effective Date | 2026-02-11                            |

---

## 1) Purpose

This document defines the permanent **Shell Architecture** of Bassan OS.

Shell = persistent system frame in which all work happens.

Shell must remain **stable across years**.

**Evidence**: Shell_Strategy.MD Section 1

---

## 2) Definition of Shell

Shell is the **persistent structure** of the platform.

Users stay inside the shell.  
Content changes within it.

**Shell components**:

```
App Shell
├─ Header
├─ Navigation Rail
└─ Workspace Container
```

**Only workspace content changes.**  
**Shell never changes.**

**Evidence**: Shell_Strategy.MD Section 2

---

## 3) Single System Shell (BINDING)

Bassan OS uses **ONE** permanent shell across **ALL** suites.

**Allowed variation**:

- Density (per suite type)
- Minor contextual tools

**Forbidden variation**:

- Layout structure
- Navigation model
- Header behavior
- Workspace framing

**Evidence**: Shell_Strategy.MD Section 8, Decision_Log.MD Decision 04

---

## 4) Shell Components (Enumeration)

### 4.1 Header (Immutable)

**Contains**:

- Brand context
- Navigation breadcrumbs
- Global search
- Notifications
- User menu
- Theme controls

**Rules**:

- Header never disappears
- Header never changes layout per page
- Header is system-level only

Page tools belong **inside workspace**.

**Evidence**: Shell_Strategy.MD Section 4

---

### 4.2 Navigation Rail (Immutable)

**Structure**:

Navigation rail is **permanent**.  
Represents suite-level navigation.

**States**:

- **Collapsed**: Icons only (maximize workspace)
- **Expanded**: Icons + labels (on hover or manual expand)
- **Active Indicator**: Workspace-colored indicator when collapsed

**Rules**:

- Rail never disappears
- Rail operates in three states only
- Active module shows workspace surface extending into rail

**Evidence**: Shell_Strategy.MD Sections 5, 6

---

### 4.3 Workspace Container (Immutable)

Workspace is **NOT** raw page.

Workspace is:

- Contained
- Padded
- Rounded
- Separated from frame

**Structure**:

```
Frame Background
  └─ Workspace Surface
```

**Benefits**:

- Calmer UI
- Reduced fatigue
- OS-like feeling

**Evidence**: Shell_Strategy.MD Section 7

---

### 4.4 Global States (Immutable)

Global states include:

- Loading states
- Error states
- Notification states
- Authentication states

**Rules**:

- Global states persist across navigation
- Global states do not reset context

---

## 5) App Frame Concept

Bassan OS behaves like a **desktop application**.

Users feel inside a **system window**.

```
System Frame
  └─ Workspace Screen
```

**NOT**:

```
Workspace
  └─ Navigation
```

The workspace is **contained**, not full browser page.

**Evidence**: Shell_Strategy.MD Section 3

---

## 6) Suite Inheritance Rule (BINDING)

**All suites inherit shell**:

- Platform Admin
- Tenant Admin
- CRM
- Omnichannel
- Automation
- AI Studio
- Analytics

**Suites CANNOT**:

- Redefine shell
- Remove header
- Change workspace framing
- Introduce custom shells
- Redesign navigation

**Allowed variation**:

- Accent colors
- Minor contextual tools

**Layout remains identical.**

**Evidence**: Shell_Strategy.MD Section 8

---

## 7) Motion Strategy

Motion exists for **orientation only**.

**Allowed motion**:

- Sidebar expand
- Drawer open
- Navigation transitions

**Motion duration**: 150–250ms

**Forbidden**:

- Decorative animation
- Bouncing effects
- Attention-grabbing motion

**Evidence**: Shell_Strategy.MD Section 9, Brand & UI Constitution Section 5

---

## 8) Workspace Protection Rule

Workspace is **dominant**.

Panels:

- Open temporarily
- Collapse when unused
- **Never permanently shrink workspace**

**Evidence**: Shell_Strategy.MD Section 10

---

## 9) Performance Rule

Shell must **load instantly**.

Workspace content loads **progressively**.

Navigation must **never block**.

System must feel **instant**.

**Evidence**: Shell_Strategy.MD Section 12

---

## 10) Long-Term Strategy

Shell must remain valid for:

- New suites
- AI tools
- Future expansions

**No redesign required.**

**Evidence**: Shell_Strategy.MD Section 13

---

## 11) Forbidden Actions (STOP Conditions)

Suites **MUST NOT**:

- Redesign navigation
- Remove header
- Change workspace framing
- Introduce custom shells
- Create multiple shells
- Implement suite-specific shell redesigns

Architecture consistency is **mandatory**.

**Evidence**: Shell_Strategy.MD Section 11

---

## 12) Shell Tolerance Rule

> The shell must tolerate future suites, not pre-optimize for them.

**Meaning**:

Shell is designed to be **stable** and **extensible**.

New suites inherit the shell **as-is**.

Shell does not evolve per suite.

**Evidence**: Shell_Strategy.MD Section 14

---

## 13) Acceptance Criteria

This shell strategy is considered BINDING when ALL of the following are true:

- [x] Single system shell defined
- [x] Shell components enumerated (Header, Navigation Rail, Workspace Container, Global States)
- [x] Immutable shell elements identified
- [x] Allowed variations defined (density only)
- [x] Multiple shells explicitly forbidden
- [x] Suite-specific shell redesigns explicitly forbidden
- [x] Shell tolerance rule established
- [x] Workspace protection rule defined
- [x] Performance rule defined
- [x] Forbidden actions explicit

---

## 14) Signature

**Approved By**: Platform Architecture Governance  
**Date**: 2026-02-11  
**Status**: BINDING — ARCHITECTURE LOCKED  
**Authority**: Shell_Strategy.MD, Decision_Log.MD
