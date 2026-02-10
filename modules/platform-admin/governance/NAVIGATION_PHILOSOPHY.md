# Navigation Philosophy — platform-admin

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Platform Name  | Bassan                                  |
| Document Title | NAVIGATION_PHILOSOPHY                   |
| Repo           | Suite (Layer / Product Repo)            |
| Module         | platform-admin                          |
| Status         | FINAL — BINDING NAVIGATION PHILOSOPHY   |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | BRAND_IDENTITY.md                       |
| Effective Date | 2026-02-10                              |

---

## 1) Purpose

Define navigation philosophy for web and mobile platforms while maintaining cognitive safety and human-first principles.

**This document does NOT contain**:

- Component names or implementations
- Routing code
- Specific navigation libraries

---

## 2) Core Navigation Principles

### 2.1 Cognitive Safety

**Navigation MUST**:

- Be predictable (no surprise behavior)
- Preserve state (back button preserves context)
- Provide orientation (user always knows where they are)
- Support undo (when possible)

**Evidence**: BRAND_IDENTITY.md Section 3.1

---

### 2.2 User Control

**Navigation MUST**:

- Give user control (no forced flows)
- Allow backtracking (back preserves state)
- Support cancellation (escape from flows)

**Evidence**: BRAND_IDENTITY.md Section 3.1

---

### 2.3 Page Structure Strategy

**Navigation SHOULD**:

- Prefer fewer pages than features
- Use sections, drawers, tabs within pages
- Avoid excessive page hopping

**Rationale**: Fewer page transitions reduce cognitive load and maintain context.

**Evidence**: BRAND_IDENTITY.md (derived from Brand & UI Constitution Section 7)

---

## 3) Web Navigation Philosophy

### 3.1 Web Navigation Patterns

**Web MAY use**:

- Sidebar navigation (primary)
- Top navigation (secondary)
- Tabs (within pages)
- Drawers (for secondary content)
- Multi-pane layouts (desktop)

**Rationale**: Web has larger screens and supports multi-pane layouts.

---

### 3.2 Sidebar Behavior

**Sidebar MAY**:

- Slide in/out
- Act as overlay (drawer)
- Collapse to icons

**Sidebar MUST**:

- Feel attached to surface (not floating above)
- Remain stable during critical operations
- Indicate active state clearly

**Evidence**: BRAND_IDENTITY.md (derived from Brand & UI Constitution Section 6)

---

### 3.3 Active State Indication

**Active navigation item MUST**:

- Inherit page color (softly)
- Indicate context without text
- Be clearly distinguishable

**Evidence**: BRAND_IDENTITY.md (derived from Brand & UI Constitution Section 6)

---

### 3.4 Web Navigation Safety

**During critical operations**:

- Sidebar remains stable (no animated disappearance)
- Navigation remains accessible
- User can cancel or navigate away

**Evidence**: BRAND_IDENTITY.md (derived from Brand & UI Constitution Section 6)

---

## 4) Mobile Navigation Philosophy

### 4.1 Mobile Navigation Patterns

**Mobile MAY use**:

- Bottom navigation (primary)
- Top navigation (secondary)
- Hamburger menu (overflow)
- Stacks (navigation hierarchy)
- Single-pane focus

**Rationale**: Mobile has smaller screens and requires single-pane focus.

---

### 4.2 Bottom Navigation

**Bottom navigation SHOULD**:

- Contain 3-5 primary destinations
- Be always visible (persistent)
- Use icons + labels (for clarity)

**Rationale**: Bottom navigation is ergonomic for thumb reach.

---

### 4.3 Stack Navigation

**Stack navigation SHOULD**:

- Support back button (preserves state)
- Show clear hierarchy (breadcrumbs or back button)
- Allow escape from deep stacks

**Rationale**: Mobile users navigate in stacks, not multi-pane layouts.

---

### 4.4 Mobile Navigation Safety

**Mobile navigation MUST**:

- Support back button (preserves state)
- Provide clear exit from flows
- Avoid forced flows (user control)

**Evidence**: BRAND_IDENTITY.md Section 3.1

---

## 5) Tab vs Stack Rules

### 5.1 When to Use Tabs

**Use tabs for**:

- Related content within same context
- Switching between views of same data
- Peer-level navigation (not hierarchical)

**Examples**:

- Organization Details → Info / Settings / History
- Dashboard → Overview / Reports / Analytics

---

### 5.2 When to Use Stacks

**Use stacks for**:

- Hierarchical navigation (parent → child)
- Drill-down workflows
- Detail views from lists

**Examples**:

- Organization List → Organization Detail
- Settings → Advanced Settings → Specific Setting

---

### 5.3 Tab vs Stack Guidelines

**Tabs**:

- Peer-level, related content
- Horizontal navigation
- Same level of hierarchy

**Stacks**:

- Parent-child relationships
- Vertical navigation (drill-down)
- Different levels of hierarchy

---

## 6) Consistency and Cognitive Safety Rules

### 6.1 Consistent Navigation Patterns

**MUST maintain consistency**:

- Same navigation pattern for same content type
- Same terminology across platforms
- Same visual indicators for active state

**Rationale**: Consistency reduces cognitive load.

**Evidence**: BRAND_IDENTITY.md Section 10

---

### 6.2 No Surprise Behavior

**Navigation MUST NOT**:

- Change layout unexpectedly
- Navigate without user action
- Lose user context on back
- Force user into flows

**Evidence**: BRAND_IDENTITY.md Section 3.1

---

### 6.3 State Preservation

**Back button MUST**:

- Preserve scroll position
- Preserve form state (when possible)
- Preserve filters and search
- Return to exact previous state

**Evidence**: BRAND_IDENTITY.md Section 3.1

---

## 7) Advanced Operations Navigation

### 7.1 Advanced Mode

**Advanced or risky operations MUST**:

- Be explicit (clear labeling)
- Be separated visually (distinct section)
- Enter calmer, more focused mode

**Examples**:

- "Advanced Settings"
- "Manage Permissions"
- "Full View"

**Rationale**: Advanced work deserves different mental space.

**Evidence**: BRAND_IDENTITY.md (derived from Brand & UI Constitution Section 8)

---

### 7.2 Advanced Navigation Safety

**Advanced mode MUST**:

- Provide clear entry and exit
- Support cancellation
- Preserve state on back

---

## 8) Forbidden Navigation Patterns

**MUST NOT**:

- Force user into flows (no forced navigation)
- Change layout unexpectedly (no surprise behavior)
- Lose state on back (preserve context)
- Use excessive page hopping (prefer sections/drawers)
- Animate sidebar during critical operations
- Use navigation as decoration (functional only)

**Evidence**: BRAND_IDENTITY.md Sections 3.1, 9

---

## 9) Acceptance Criteria

This navigation philosophy document is considered ACTIVE and BINDING when ALL of the following are true:

- [x] Core navigation principles are documented
- [x] Web navigation philosophy is documented
- [x] Mobile navigation philosophy is documented
- [x] Tab vs Stack rules are explicit
- [x] Consistency and cognitive safety rules are documented
- [x] Advanced operations navigation is documented
- [x] Forbidden navigation patterns are explicit
- [x] All evidence links to canonical sources are provided

---

## 10) Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-10  
**Status**: FINAL — BINDING NAVIGATION PHILOSOPHY  
**Canonical Source**: BRAND_IDENTITY.md
