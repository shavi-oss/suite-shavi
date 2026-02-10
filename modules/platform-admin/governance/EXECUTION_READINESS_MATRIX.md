# Execution Readiness Matrix — platform-admin

## Document Control

| Attribute      | Value                                        |
| -------------- | -------------------------------------------- |
| Platform Name  | Bassan                                       |
| Document Title | EXECUTION_READINESS_MATRIX                   |
| Repo           | Suite (Layer / Product Repo)                 |
| Module         | platform-admin                               |
| Status         | FINAL — BINDING EXECUTION PERMISSION         |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST      |
| Authority      | GATE_21, GATE_25, GATE_26, MODULE_SCOPE_LOCK |
| Effective Date | 2026-02-10                                   |

---

## 1) Purpose

Define what is allowed to be implemented NOW, what is explicitly deferred, and what is forbidden for web and mobile applications.

---

## 2) Web Application

### 2.1 Allowed to Implement (NOW)

#### 2.1.1 Organization Management (Read-Only Views)

**Organization List**:

- Display all Suite organizations
- Show organization name, status, creation date
- Support basic filtering and search

**Organization Detail**:

- Display single organization details
- Show organization metadata
- Show organization status

**Evidence**: GATE_21_PLAN.md Section 2.1, MODULE_SCOPE_LOCK.md Section 2.1

---

#### 2.1.2 Organization Management (Light Actions)

**Organization Create**:

- Form to create new Suite organization
- Input validation
- Submit to BFF endpoint

**Organization Suspend**:

- Action to suspend organization
- Confirmation dialog
- Submit to BFF endpoint

**Organization Unsuspend**:

- Action to unsuspend organization
- Confirmation dialog
- Submit to BFF endpoint

**Evidence**: GATE_21_PLAN.md Section 2.1, MODULE_SCOPE_LOCK.md Section 2.2

---

#### 2.1.3 Navigation (Web)

**Global Navigation**:

- Persistent sidebar (desktop)
- Collapsible sidebar (tablet)
- Drawer navigation (mobile web)
- Top bar (user profile, notifications placeholder, global search placeholder)

**Contextual Navigation**:

- Organization List → Organization Detail (drill-down)
- Back button preserves state

**Evidence**: WEB_NAVIGATION_MODEL.md Sections 3, 4, 5, HOST_APP_CONSOLE_DEFINITION.md Section 3

---

#### 2.1.4 Brand and Design Application (Web)

**Brand Identity**:

- Bassan logo (small, calm, never dominant)
- Muted purple primary color
- Light theme (default)
- Dark theme (secondary)
- Calm, confident, premium tone

**Density**:

- Comfortable density (desktop default)
- Spacious density (mobile web default)

**Motion**:

- Functional motion only (feedback, state transitions)
- Reduced motion support

**Evidence**: WEB_APPLICATION_PRINCIPLES.md, WEB_DENSITY_RULES.md, WEB_MOTION_USAGE.md

---

#### 2.1.5 Security and Governance Behavior (Web)

**Fail-Closed Behavior**:

- Deny on 401/403
- Disable or hide restricted actions
- Show safe error messages
- Maintain navigation stability

**Restricted State**:

- Actions disabled (grayed out)
- Safe message: "This action is not available"

**Suspended State**:

- Critical actions blocked
- Safe message: "Access temporarily restricted. Please contact your administrator."

**Usage Limited State**:

- Write actions blocked
- Safe message: "Usage limit reached. Please contact your administrator."

**Evidence**: WEB_APPLICATION_PRINCIPLES.md Section 5, MODULE_SECURITY_LAWS.md Section 3.1

---

### 2.2 Explicitly Deferred (LATER)

#### 2.2.1 Other Entities

**Org Mapping Management**:

- View mappings
- Link Suite org ↔ Core org

**Internal User Management**:

- List internal users
- Create internal user
- User detail
- Deactivate user

**Audit Logs**:

- Audit log viewer (read-only, filterable)

**Evidence**: MODULE_SCOPE_LOCK.md Section 2.1, GATE_21_PLAN.md Section 3 (Out of Scope)

---

#### 2.2.2 Dashboard

**Dashboard Content**:

- Client-defined widgets, charts, KPIs
- Dashboard slot exists, content deferred

**Evidence**: HOST_APP_CONSOLE_DEFINITION.md Section 6

---

#### 2.2.3 Advanced Features

**Settings**:

- Platform configuration

**Global Search**:

- Search across entities

**Notifications**:

- Real-time notifications

**Evidence**: HOST_APP_CONSOLE_DEFINITION.md Section 3, MODULE_SCOPE_LOCK.md Section 2.1

---

### 2.3 Forbidden (DO NOT IMPLEMENT)

#### 2.3.1 Direct Core Access

**MUST NOT**:

- Call Core API endpoints directly from UI
- Store Core artifacts in UI
- Expose Core internal details

**Evidence**: HOST_APP_CONSOLE_DEFINITION.md Section 5, WEB_APPLICATION_PRINCIPLES.md Section 5

---

#### 2.3.2 Unauthorized Features

**MUST NOT**:

- Template publishing UI (Core v1 has no endpoint)
- Workflow builder or visual editor
- Custom template creation UI
- Customer user management screens
- Billing or subscription screens
- Real-time dashboards or analytics

**Evidence**: MODULE_SCOPE_LOCK.md Section 2.1

---

#### 2.3.3 Security Violations

**MUST NOT**:

- Implement fail-open behavior
- Show optimistic UI under denial states
- Expose internal error details
- Store tokens in insecure storage

**Evidence**: WEB_APPLICATION_PRINCIPLES.md Section 5, MODULE_SECURITY_LAWS.md Section 3.1

---

## 3) Mobile Application

### 3.1 Allowed to Implement (NOW)

#### 3.1.1 Organization Management (Read-Only Views)

**Organization List**:

- Display all Suite organizations
- Show organization name, status
- Support basic filtering and search
- Single-column layout
- Spacious density

**Organization Detail**:

- Display single organization details
- Show organization metadata
- Show organization status
- Single-pane focus

**Evidence**: GATE_26_PLAN.md, MOBILE_APPLICATION_PRINCIPLES.md Section 4, MODULE_SCOPE_LOCK.md Section 2.1

---

#### 3.1.2 Organization Management (Light Actions)

**Organization Create**:

- Form to create new Suite organization
- Large touch targets
- Single-column layout
- Input validation

**Organization Suspend**:

- Action to suspend organization
- Confirmation dialog
- Large touch target

**Organization Unsuspend**:

- Action to unsuspend organization
- Confirmation dialog
- Large touch target

**Evidence**: GATE_26_PLAN.md, MOBILE_APPLICATION_PRINCIPLES.md Section 3, MODULE_SCOPE_LOCK.md Section 2.2

---

#### 3.1.3 Navigation (Mobile)

**Primary Navigation**:

- Bottom navigation (3-5 primary destinations)
- Stack navigation (drill-down)
- Drawer (overflow, user profile)

**Back Behavior**:

- Back button preserves state
- Scroll position preserved
- Form state preserved (when possible)

**Evidence**: MOBILE_NAVIGATION_MODEL.md Sections 2, 3, 5

---

#### 3.1.4 Brand and Design Application (Mobile)

**Brand Identity**:

- Bassan logo (small, calm, never dominant)
- Muted purple primary color
- Light theme (default)
- Dark theme (secondary)
- Calm, confident, premium tone

**Density**:

- Spacious density (default)
- Large touch targets
- Generous whitespace

**Motion**:

- Functional motion only (touch feedback, state transitions)
- Reduced motion defaults
- Battery conservation

**Evidence**: MOBILE_APPLICATION_PRINCIPLES.md, MOBILE_DENSITY_RULES.md, MOBILE_MOTION_USAGE.md

---

#### 3.1.5 Security and Governance Behavior (Mobile)

**Fail-Closed Behavior**:

- Deny on 401/403
- Disable or hide restricted actions
- Show safe error messages
- Maintain navigation stability

**Restricted State**:

- Actions disabled (grayed out or hidden)
- Safe message: "This action is not available"

**Suspended State**:

- Critical actions blocked
- Safe message: "Access temporarily restricted. Please contact your administrator."

**Usage Limited State**:

- Write actions blocked
- Safe message: "Usage limit reached. Please contact your administrator."

**Evidence**: MOBILE_APPLICATION_PRINCIPLES.md Section 5, MODULE_SECURITY_LAWS.md Section 3.1

---

### 3.2 Explicitly Deferred (LATER)

#### 3.2.1 Other Entities

**Org Mapping Management**:

- View mappings
- Link Suite org ↔ Core org

**Internal User Management**:

- List internal users
- Create internal user
- User detail
- Deactivate user

**Audit Logs**:

- Audit log viewer (read-only, filterable)

**Evidence**: MODULE_SCOPE_LOCK.md Section 2.1, GATE_26_PLAN.md Section 3 (Out of Scope)

---

#### 3.2.2 Dashboard

**Dashboard Content**:

- Client-defined widgets, charts, KPIs
- Dashboard slot exists, content deferred

**Evidence**: HOST_APP_CONSOLE_DEFINITION.md Section 6

---

#### 3.2.3 Advanced Features

**Settings**:

- Platform configuration

**Global Search**:

- Search across entities

**Notifications**:

- Real-time notifications

**Evidence**: HOST_APP_CONSOLE_DEFINITION.md Section 3, MODULE_SCOPE_LOCK.md Section 2.1

---

#### 3.2.4 Complex Workflows

**Admin-Heavy Operations**:

- Bulk operations
- Complex multi-step workflows
- Advanced settings

**Rationale**: Mobile is designed for short sessions and quick tasks, not complex operational workflows.

**Evidence**: MOBILE_APPLICATION_PRINCIPLES.md Section 2.1

---

### 3.3 Forbidden (DO NOT IMPLEMENT)

#### 3.3.1 Direct Core Access

**MUST NOT**:

- Call Core API endpoints directly from UI
- Store Core artifacts in UI
- Expose Core internal details

**Evidence**: HOST_APP_CONSOLE_DEFINITION.md Section 5, MOBILE_APPLICATION_PRINCIPLES.md Section 5

---

#### 3.3.2 Unauthorized Features

**MUST NOT**:

- Template publishing UI (Core v1 has no endpoint)
- Workflow builder or visual editor
- Custom template creation UI
- Customer user management screens
- Billing or subscription screens
- Real-time dashboards or analytics

**Evidence**: MODULE_SCOPE_LOCK.md Section 2.1

---

#### 3.3.3 Security Violations

**MUST NOT**:

- Implement fail-open behavior
- Show optimistic UI under denial states
- Expose internal error details
- Store tokens in insecure storage

**Evidence**: MOBILE_APPLICATION_PRINCIPLES.md Section 5, MODULE_SECURITY_LAWS.md Section 3.1

---

#### 3.3.4 Compact Density

**MUST NOT**:

- Use Compact density (touch targets too small)
- Sacrifice touch target size for information density

**Evidence**: MOBILE_DENSITY_RULES.md Section 4.1

---

## 4) Cross-Platform Consistency Requirements

### 4.1 MUST Remain Identical

**Brand Identity**:

- Brand purpose, core vision, emotional tone, brand voice

**Human-First Principles**:

- Cognitive safety, user control, fail-closed behavior, safe error messages

**Security Invariants**:

- Fail-closed on 401/403, no token storage in insecure storage, safe error messages only

**Evidence**: CROSS_PLATFORM_PRINCIPLES.md Sections 2, 4

---

### 4.2 MAY Adapt

**Density**:

- Web: Comfortable (desktop), Spacious (mobile web)
- Mobile: Spacious (default)

**Layout Structure**:

- Web: Multi-pane (desktop), Single-pane (mobile web)
- Mobile: Single-pane (always)

**Navigation Patterns**:

- Web: Sidebar (desktop), Drawer (mobile web)
- Mobile: Bottom navigation, Stack, Drawer

**Evidence**: CROSS_PLATFORM_PRINCIPLES.md Section 3

---

## 5) Acceptance Criteria

This execution readiness matrix is considered ACTIVE and BINDING when ALL of the following are true:

- [x] Web application section is complete (Allowed, Deferred, Forbidden)
- [x] Mobile application section is complete (Allowed, Deferred, Forbidden)
- [x] All items justified by reference to prior gates
- [x] No new features appear
- [x] Descriptive labels used (NOT implementation details)
- [x] Read-only views, light actions, admin-heavy operations distinguished
- [x] Governance state behavior included
- [x] Cross-platform consistency requirements documented
- [x] All evidence links to canonical sources are provided

---

## 6) Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-10  
**Status**: FINAL — BINDING EXECUTION PERMISSION  
**Canonical Sources**: GATE_21, GATE_25, GATE_26, MODULE_SCOPE_LOCK, HOST_APP_CONSOLE_DEFINITION, WEB_APPLICATION_PRINCIPLES, WEB_DENSITY_RULES, WEB_NAVIGATION_MODEL, WEB_MOTION_USAGE, MOBILE_APPLICATION_PRINCIPLES, MOBILE_DENSITY_RULES, MOBILE_NAVIGATION_MODEL, MOBILE_MOTION_USAGE, CROSS_PLATFORM_PRINCIPLES, MODULE_SECURITY_LAWS
