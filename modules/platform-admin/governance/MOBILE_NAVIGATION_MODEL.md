# Mobile Navigation Model — platform-admin

## Document Control

| Attribute      | Value                                                  |
| -------------- | ------------------------------------------------------ |
| Platform Name  | Bassan                                                 |
| Document Title | MOBILE_NAVIGATION_MODEL                                |
| Repo           | Suite (Layer / Product Repo)                           |
| Module         | platform-admin                                         |
| Status         | FINAL — BINDING MOBILE NAVIGATION MODEL                |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST                |
| Authority      | NAVIGATION_PHILOSOPHY.md, CROSS_PLATFORM_PRINCIPLES.md |
| Effective Date | 2026-02-10                                             |

---

## 1) Purpose

Define mobile navigation model for the platform-admin application.

**This document does NOT contain**:

- Framework-specific navigation components
- Routing code
- Implementation details

---

## 2) Primary Navigation Model

### 2.1 Bottom Navigation (Primary)

**Characteristics**:

- 3-5 primary destinations
- Always visible (persistent)
- Icons + labels
- Thumb-reachable

**Use for**:

- Dashboard
- User Management
- Organization Management
- Audit Logs
- Settings (or overflow)

**Rationale**: Bottom navigation is ergonomic for thumb reach.

**Evidence**: NAVIGATION_PHILOSOPHY.md Section 4.2

---

### 2.2 Stack Navigation (Drill-Down)

**Characteristics**:

- Hierarchical navigation
- Single-pane focus
- Back button preserves state
- Clear visual hierarchy

**Use for**:

- List → Detail (User List → User Detail)
- Parent → Child (Settings → Advanced Settings)
- Drill-down workflows

**Rationale**: Mobile users navigate in stacks, not multi-pane layouts.

**Evidence**: NAVIGATION_PHILOSOPHY.md Section 4.3

---

### 2.3 Drawer (Overflow)

**Characteristics**:

- Hidden by default
- Accessible via hamburger menu or profile icon
- Slides in as overlay
- Contains secondary navigation or user profile

**Use for**:

- User profile
- Account settings
- Help and support
- Logout

**Rationale**: Drawer provides access to secondary features without cluttering primary navigation.

**Evidence**: NAVIGATION_PHILOSOPHY.md Section 4.1

---

## 3) Hybrid Navigation Model

### 3.1 Bottom Navigation + Stack

**Recommended pattern**:

- Bottom navigation for primary modules
- Stack navigation for drill-down within modules

**Example**:

- Bottom nav: Dashboard, Users, Organizations, Audit, Settings
- Stack: User List → User Detail → Edit User

**Rationale**: Combines ergonomic primary navigation with hierarchical drill-down.

---

### 3.2 Bottom Navigation + Drawer

**Alternative pattern**:

- Bottom navigation for primary modules
- Drawer for user profile and secondary features

**Example**:

- Bottom nav: Dashboard, Users, Organizations, Audit
- Drawer: Profile, Settings, Help, Logout

**Rationale**: Keeps primary navigation focused on core workflows.

---

## 4) Context Switching Rules

### 4.1 Bottom Navigation Context Switch

**Switching between bottom nav items MUST**:

- Preserve state of previous item (scroll position, filters)
- Reset to top-level view of new item
- Provide clear visual indication of active item

**Rationale**: Users expect to return to previous context when switching back.

**Evidence**: NAVIGATION_PHILOSOPHY.md Section 6.3

---

### 4.2 Stack Navigation Context Switch

**Navigating within stack MUST**:

- Preserve parent state (scroll position, filters)
- Support back button (return to parent)
- Show clear hierarchy (breadcrumbs or back button with label)

**Rationale**: Users expect to return to exact previous state when going back.

**Evidence**: NAVIGATION_PHILOSOPHY.md Section 6.3

---

## 5) Back Behavior and State Preservation

### 5.1 Back Button Behavior

**Back button MUST**:

- Return to previous view in stack
- Preserve scroll position
- Preserve form state (when possible)
- Preserve filters and search

**Back button MUST NOT**:

- Exit app (unless at root)
- Lose user context
- Navigate unexpectedly

**Evidence**: NAVIGATION_PHILOSOPHY.md Section 6.3

---

### 5.2 State Preservation

**Navigation MUST preserve**:

- Scroll position (list views)
- Form state (unsaved changes)
- Filters and search (list views)
- Expanded/collapsed state (accordions)

**Rationale**: Losing state on navigation creates frustration and rework.

**Evidence**: NAVIGATION_PHILOSOPHY.md Section 6.3

---

### 5.3 Deep Linking

**Mobile MAY support deep linking**:

- Direct navigation to specific views
- Preserve navigation hierarchy
- Support back button from deep link

**Rationale**: Deep linking supports notifications and external links.

---

## 6) Navigation Under Governance States

### 6.1 Restricted State

**Navigation MUST**:

- Remain accessible (no broken navigation)
- Disable restricted items (grayed out or hidden)
- Show safe message on tap
- Preserve navigation structure

**Navigation MUST NOT**:

- Hide all navigation (user loses orientation)
- Break navigation structure
- Create dead ends

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

- Mix bottom navigation and top tabs for primary navigation
- Use different navigation patterns for same content type
- Create inconsistent navigation across views

**Rationale**: Conflicting navigation increases cognitive load.

**Evidence**: NAVIGATION_PHILOSOPHY.md Section 6.1

---

### 7.2 Redirect Loops

**MUST NOT**:

- Redirect to same view repeatedly
- Create circular navigation (A → B → A)
- Redirect without user action

**Rationale**: Redirect loops break user control and create confusion.

**Evidence**: NAVIGATION_PHILOSOPHY.md Section 6.2

---

### 7.3 Dead Ends

**MUST NOT**:

- Create views with no way back
- Hide navigation in restricted state (no dead ends)
- Break back button behavior

**Rationale**: Dead ends break user control and create frustration.

**Evidence**: NAVIGATION_PHILOSOPHY.md Section 6.2

---

### 7.4 Excessive Depth

**SHOULD avoid**:

- Navigation stacks deeper than 3-4 levels
- Complex hierarchies on mobile

**Rationale**: Deep stacks increase cognitive load and make navigation difficult.

---

## 8) Navigation Consistency Rules

### 8.1 Consistent Patterns

**MUST maintain**:

- Same navigation pattern for same content type
- Same terminology across views
- Same visual indicators for active state

**Rationale**: Consistency reduces cognitive load.

**Evidence**: NAVIGATION_PHILOSOPHY.md Section 6.1

---

### 8.2 Active State Indication

**Active navigation item MUST**:

- Be clearly distinguishable
- Use visual indicator (color, icon, underline)
- Provide orientation (user knows where they are)

**Evidence**: NAVIGATION_PHILOSOPHY.md Section 3.3

---

## 9) Acceptance Criteria

This mobile navigation model document is considered ACTIVE and BINDING when ALL of the following are true:

- [x] Primary navigation model is documented (bottom nav, stack, drawer)
- [x] Hybrid navigation model is documented
- [x] Context switching rules are documented
- [x] Back behavior and state preservation are documented
- [x] Navigation under governance states is documented
- [x] Forbidden navigation patterns are explicit
- [x] Navigation consistency rules are documented
- [x] All evidence links to canonical sources are provided

---

## 10) Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-10  
**Status**: FINAL — BINDING MOBILE NAVIGATION MODEL  
**Canonical Sources**: NAVIGATION_PHILOSOPHY.md, CROSS_PLATFORM_PRINCIPLES.md
