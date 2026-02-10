# Mobile Application Principles — platform-admin

## Document Control

| Attribute      | Value                                                               |
| -------------- | ------------------------------------------------------------------- |
| Platform Name  | Bassan                                                              |
| Document Title | MOBILE_APPLICATION_PRINCIPLES                                       |
| Repo           | Suite (Layer / Product Repo)                                        |
| Module         | platform-admin                                                      |
| Status         | FINAL — BINDING MOBILE APPLICATION RULES                            |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST                             |
| Authority      | BRAND_IDENTITY.md, CROSS_PLATFORM_PRINCIPLES.md, DENSITY_MAPPING.md |
| Effective Date | 2026-02-10                                                          |

---

## 1) Purpose

Define how the Bassan brand and design system is applied to native mobile applications.

**This document does NOT contain**:

- Framework or SDK references
- Component implementations
- Numeric values or pixel dimensions

---

## 2) Mobile Usage Context

### 2.1 Short Sessions

**Mobile admin is designed for**:

- Quick tasks (on-the-go access)
- Monitoring and alerts
- Emergency actions
- Short-duration workflows

**Mobile admin is NOT designed for**:

- Long-session operational work
- Complex multi-step workflows
- Sustained data entry

**Rationale**: Mobile usage is typically brief and focused.

**Evidence**: DENSITY_MAPPING.md Section 5.4

---

### 2.2 On-the-Go Context

**Mobile admin MUST optimize for**:

- Single-hand operation (when possible)
- Quick orientation (where am I, what can I do)
- Immediate feedback (touch response)
- Interruption tolerance (save state, resume later)

**Evidence**: BRAND_IDENTITY.md Section 3.1

---

### 2.3 Information Prioritization

**Mobile screens MUST prioritize**:

- Critical information first
- Essential actions visible
- Advanced features in overflow
- Progressive disclosure

**Rationale**: Small screens require ruthless prioritization.

**Evidence**: CROSS_PLATFORM_PRINCIPLES.md Section 3.1

---

## 3) Touch-First Interaction Rules

### 3.1 Touch Targets

**Touch targets MUST**:

- Be large enough for thumb interaction
- Have adequate spacing (no accidental taps)
- Provide immediate feedback (visual response)

**Evidence**: DENSITY_MAPPING.md Section 3.2

---

### 3.2 Touch Feedback

**Touch interactions MUST**:

- Provide immediate visual feedback
- Indicate state change clearly
- Feel responsive (no lag)

**Evidence**: MOTION_ADAPTATION.md Section 3.2

---

### 3.3 Gestures

**Mobile MAY support**:

- Swipe (navigation, delete)
- Pull-to-refresh (data updates)
- Long-press (context menus)

**Mobile MUST**:

- Provide alternative tap-based interactions
- Support accessibility (no gesture-only features)

**Rationale**: Gestures enhance efficiency but must not be required.

---

## 4) Information Prioritization for Small Screens

### 4.1 Progressive Disclosure

**Mobile MUST use progressive disclosure**:

- Show essential information first
- Hide advanced features in overflow
- Support drill-down for details

**Rationale**: Small screens cannot show everything at once.

**Evidence**: CROSS_PLATFORM_PRINCIPLES.md Section 3.1

---

### 4.2 Single-Column Layouts

**Mobile MUST use single-column layouts**:

- Vertical scrolling (primary navigation)
- Stacked content (no side-by-side)
- Full-width elements

**Rationale**: Small screens require focus and simplification.

**Evidence**: CROSS_PLATFORM_PRINCIPLES.md Section 3.4

---

### 4.3 Critical Information First

**Mobile MUST prioritize**:

- Status indicators (system health, alerts)
- Critical actions (emergency operations)
- Recent activity (monitoring)

**Mobile MAY defer**:

- Historical data (accessible via drill-down)
- Advanced settings (accessible via overflow)
- Bulk operations (better suited for desktop)

---

## 5) Governance and Restricted States Behavior

### 5.1 Fail-Closed Behavior

**Under system control states, mobile UI MUST**:

- Behave fail-closed (deny by default)
- Disable or hide restricted actions
- Show safe error messages
- Maintain navigation stability
- Provide clear feedback (no silent failures)

**MUST NOT**:

- Fail-open (allow on error)
- Show optimistic UI under denial
- Break navigation
- Expose internal error details

**Evidence**: CROSS_PLATFORM_PRINCIPLES.md Section 4.1, MODULE_SECURITY_LAWS.md Section 3.1

---

### 5.2 Restricted State

**Restricted state behavior**:

- Actions disabled (grayed out or hidden)
- Safe message: "This action is not available"
- Navigation remains stable
- Read-only access may remain

---

### 5.3 Suspended State

**Suspended state behavior**:

- Critical actions blocked
- Safe message: "Access temporarily restricted. Please contact your administrator."
- Read-only access may remain
- Clear next steps provided

---

### 5.4 Usage Limited State

**Usage limited state behavior**:

- Write actions blocked
- Safe message: "Usage limit reached. Please contact your administrator."
- Read access remains
- Clear guidance provided

---

## 6) What MUST Remain Identical to Brand

### 6.1 Brand Identity

**MUST remain identical on mobile**:

- Brand purpose (reduce cognitive load, serve people)
- Core vision (calm, confident, premium, supportive, fast without anxiety)
- Emotional tone (never rushed, never judged)
- Brand voice (calm expert)

**Evidence**: BRAND_IDENTITY.md Sections 1, 2, 7, CROSS_PLATFORM_PRINCIPLES.md Section 2.1

---

### 6.2 Human-First Principles

**MUST remain identical on mobile**:

- Cognitive safety (no surprise behavior, no sudden changes)
- User control (undo when possible, back preserves state)
- Fail-closed behavior (deny on uncertainty)
- Safe error messages (no internal details)

**Evidence**: BRAND_IDENTITY.md Section 3, CROSS_PLATFORM_PRINCIPLES.md Section 2.2

---

### 6.3 Security Invariants

**MUST remain identical on mobile**:

- Fail-closed on 401/403
- No token storage in insecure storage
- Safe error messages only

**Evidence**: CROSS_PLATFORM_PRINCIPLES.md Section 4.1

---

### 6.4 Color and Theme Philosophy

**MUST remain identical on mobile**:

- Primary color (muted purple)
- Light theme as default
- Dark theme as secondary
- Soft backgrounds, controlled contrast

**Evidence**: CROSS_PLATFORM_PRINCIPLES.md Section 2.3

---

## 7) What Adapts for Mobile Context

### 7.1 Density

**Adapts for mobile**:

- Spacious density (default)
- Generous whitespace
- Large touch targets

**Rationale**: Touch input requires more space than precise pointing.

**Evidence**: CROSS_PLATFORM_PRINCIPLES.md Section 3.1, DENSITY_MAPPING.md Section 3.2

---

### 7.2 Layout Structure

**Adapts for mobile**:

- Single-column layouts
- Vertical scrolling
- Stacked content
- Full-width elements

**Rationale**: Small screens require focus and simplification.

**Evidence**: CROSS_PLATFORM_PRINCIPLES.md Section 3.4

---

### 7.3 Navigation Patterns

**Adapts for mobile**:

- Bottom navigation or tabs (primary)
- Stack navigation (drill-down)
- Drawer (overflow)

**Rationale**: Mobile navigation patterns differ from desktop.

**Evidence**: CROSS_PLATFORM_PRINCIPLES.md Section 3.2

---

### 7.4 Visible Controls

**Adapts for mobile**:

- Critical controls visible
- Essential controls accessible
- Advanced features in overflow

**Rationale**: Small screens require ruthless prioritization.

---

## 8) Forbidden Patterns

**MUST NOT**:

- Break brand identity on mobile
- Break human-first principles on mobile
- Implement fail-open behavior on mobile
- Use different emotional tones on mobile
- Fragment brand on mobile
- Sacrifice security for mobile convenience
- Create mobile-specific brand identity

**Evidence**: CROSS_PLATFORM_PRINCIPLES.md Section 7

---

## 9) Acceptance Criteria

This mobile application principles document is considered ACTIVE and BINDING when ALL of the following are true:

- [x] Mobile usage context is documented (short sessions, on-the-go)
- [x] Touch-first interaction rules are documented
- [x] Information prioritization for small screens is documented
- [x] Governance and restricted states behavior is documented
- [x] What MUST remain identical to brand is explicit
- [x] What adapts for mobile context is explicit
- [x] Forbidden patterns are explicit
- [x] All evidence links to canonical sources are provided

---

## 10) Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-10  
**Status**: FINAL — BINDING MOBILE APPLICATION RULES  
**Canonical Sources**: BRAND_IDENTITY.md, CROSS_PLATFORM_PRINCIPLES.md, DENSITY_MAPPING.md, MODULE_SECURITY_LAWS.md
