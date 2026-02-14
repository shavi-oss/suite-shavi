# Web Navigation Model — platform-admin

## Document Control

| Attribute      | Value                                                    |
| -------------- | -------------------------------------------------------- |
| Platform Name  | Bassan                                                   |
| Document Title | WEB_NAVIGATION_MODEL                                     |
| Repo           | Suite (Layer / Product Repo)                             |
| Module         | platform-admin                                           |
| Status         | FINAL — BINDING WEB NAVIGATION MODEL                     |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST                  |
| Authority      | NAVIGATION_PHILOSOPHY.md, HOST_APP_CONSOLE_DEFINITION.md |
| Effective Date | 2026-02-10                                               |

---

## 1) Purpose

Define web navigation model for the platform-admin console across responsive profiles.

**This document does NOT contain**:

- Component names or implementations
- Routing code
- Native mobile navigation patterns

---

## 2) Global vs Contextual Navigation Principles

### 2.1 Global Navigation

**Purpose**: Access to primary modules and system-wide features

**Characteristics**:

- Always accessible (unless restricted by governance state)
- Consistent across all views
- Indicates current location

**Examples**:

- Dashboard
- User Management
- Organization Management
- Audit Logs
- Settings

**Evidence**: HOST_APP_CONSOLE_DEFINITION.md Section 3

---

### 2.2 Contextual Navigation

**Purpose**: Navigation within a specific module or workflow

**Characteristics**:

- Context-specific
- May change based on current view
- Supports drill-down and back

**Examples**:

- Organization List → Organization Detail
- User List → User Detail
- Settings → Advanced Settings

---

## 3) Desktop Navigation Model

### 3.1 Persistent Sidebar

**Characteristics**:

- Always visible
- Left-aligned
- Contains global navigation
- Indicates active item

**Behavior**:

- Remains stable during navigation
- Remains stable during critical operations
- Active item inherits page color (softly)

**Evidence**: NAVIGATION_PHILOSOPHY.md Section 3.2

---

### 3.2 Top Bar

**Characteristics**:

- Always visible
- Contains user profile, notifications, global search

**Behavior**:

- Remains stable during navigation
- Provides access to system-wide features

**Evidence**: HOST_APP_CONSOLE_DEFINITION.md Section 3.1

---

### 3.3 Contextual Navigation

**MAY use**:

- Tabs (within pages for peer-level content)
- Breadcrumbs (for hierarchical navigation)
- Back button (for drill-down workflows)

**Evidence**: NAVIGATION_PHILOSOPHY.md Section 5

---

## 4) Tablet Navigation Model

### 4.1 Collapsible Sidebar

**Characteristics**:

- Collapsible to icons or hidden
- Left-aligned
- Contains global navigation
- Indicates active item

**Behavior**:

- MAY collapse to icons to save space
- MAY slide out as overlay
- Remains stable during critical operations
- Active item inherits page color (softly)

**Rationale**: Tablet screens benefit from flexible navigation that adapts to available space.

**Evidence**: NAVIGATION_PHILOSOPHY.md Section 3.2

---

### 4.2 Top Bar

**Same as desktop** (Section 3.2)

---

### 4.3 Contextual Navigation

**Same as desktop** (Section 3.3)

---

## 5) Mobile Web Navigation Model

### 5.1 Drawer Navigation

**Characteristics**:

- Hidden by default
- Accessible via hamburger menu
- Slides in as overlay
- Contains global navigation

**Behavior**:

- Opens on tap (hamburger menu)
- Closes on selection or outside tap
- Indicates active item
- Remains stable during critical operations

**Rationale**: Mobile web screens require maximum content space.

**Evidence**: NAVIGATION_PHILOSOPHY.md Section 4.1

---

### 5.2 Top Bar

**Characteristics**:

- Always visible
- Contains hamburger menu, page title, user profile

**Behavior**:

- Hamburger menu opens drawer
- Page title indicates current location
- User profile provides access to account features

---

### 5.3 Stack Flow

**Characteristics**:

- Single-pane focus
- Hierarchical navigation (drill-down)
- Back button preserves state

**Behavior**:

- List → Detail (drill-down)
- Detail → List (back)
- Back button preserves scroll position, filters, search

**Evidence**: NAVIGATION_PHILOSOPHY.md Section 4.3

---

## 6) Navigation Stability Under Denied/Restricted States

### 6.1 Restricted State

**Navigation MUST**:

- Remain accessible (no broken navigation)
- Disable restricted items (grayed out)
- Show safe message on tap/click
- Preserve navigation structure

**Navigation MUST NOT**:

- Hide all navigation (user loses orientation)
- Break navigation structure
- Redirect to error page (dead end)

**Evidence**: NAVIGATION_PHILOSOPHY.md Section 6.2

---

### 6.2 Suspended State

**Navigation MUST**:

- Remain accessible (no broken navigation)
- Disable write actions (read-only may remain)
- Show safe message on restricted action
- Preserve navigation structure

**Navigation MUST NOT**:

- Hide all navigation
- Break navigation structure
- Create redirect loops

---

### 6.3 Usage Limited State

**Navigation MUST**:

- Remain accessible (no broken navigation)
- Disable write actions (read-only remains)
- Show safe message on blocked action
- Preserve navigation structure

**Navigation MUST NOT**:

- Hide all navigation
- Break navigation structure
- Create dead ends

---

## 7) Forbidden Navigation Patterns

### 7.1 Conflicting Navigation Models

**MUST NOT**:

- Mix sidebar and bottom navigation on same screen
- Use different navigation patterns for same content type
- Create inconsistent navigation across responsive profiles

**Rationale**: Conflicting navigation increases cognitive load.

**Evidence**: NAVIGATION_PHILOSOPHY.md Section 6.1

---

### 7.2 Redirect Loops

**MUST NOT**:

- Redirect to same page repeatedly
- Create circular navigation (A → B → A)
- Redirect without user action

**Rationale**: Redirect loops break user control and create confusion.

**Evidence**: NAVIGATION_PHILOSOPHY.md Section 6.2

---

### 7.3 Dead Ends Under Restriction

**MUST NOT**:

- Redirect to error page with no navigation
- Hide all navigation in restricted state
- Create dead ends (no way back)

**Rationale**: Dead ends break user control and create frustration.

**Evidence**: NAVIGATION_PHILOSOPHY.md Section 6.2

---

## 8) Navigation Consistency Rules

### 8.1 Consistent Patterns

**MUST maintain**:

- Same navigation pattern for same content type
- Same terminology across responsive profiles
- Same visual indicators for active state

**Rationale**: Consistency reduces cognitive load.

**Evidence**: NAVIGATION_PHILOSOPHY.md Section 6.1

---

### 8.2 State Preservation

**Back button MUST**:

- Preserve scroll position
- Preserve form state (when possible)
- Preserve filters and search
- Return to exact previous state

**Evidence**: NAVIGATION_PHILOSOPHY.md Section 6.3

---

## 9) Acceptance Criteria

This web navigation model document is considered ACTIVE and BINDING when ALL of the following are true:

- [x] Global vs contextual navigation principles are documented
- [x] Desktop navigation model is documented (persistent sidebar)
- [x] Tablet navigation model is documented (collapsible sidebar)
- [x] Mobile web navigation model is documented (drawer + stack flow)
- [x] Navigation stability under denied/restricted states is documented
- [x] Forbidden navigation patterns are explicit
- [x] Navigation consistency rules are documented
- [x] All evidence links to canonical sources are provided

---

## 10) Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-10  
**Status**: FINAL — BINDING WEB NAVIGATION MODEL  
**Canonical Sources**: NAVIGATION_PHILOSOPHY.md, HOST_APP_CONSOLE_DEFINITION.md
