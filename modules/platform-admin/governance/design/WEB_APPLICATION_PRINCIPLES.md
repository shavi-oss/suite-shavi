# Web Application Principles — platform-admin

## Document Control

| Attribute      | Value                                                                           |
| -------------- | ------------------------------------------------------------------------------- |
| Platform Name  | Bassan                                                                          |
| Document Title | WEB_APPLICATION_PRINCIPLES                                                      |
| Repo           | Suite (Layer / Product Repo)                                                    |
| Module         | platform-admin                                                                  |
| Status         | FINAL — BINDING WEB APPLICATION RULES                                           |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST                                         |
| Authority      | BRAND_IDENTITY.md, CROSS_PLATFORM_PRINCIPLES.md, HOST_APP_CONSOLE_DEFINITION.md |
| Effective Date | 2026-02-10                                                                      |

---

## 1) Purpose

Define how the Bassan brand and design system is applied to the Web Admin Console under responsive conditions and governance pressure.

**This document does NOT contain**:

- Pixel values or numeric breakpoints
- Component implementations
- Native mobile app references

---

## 2) Web Admin-First Usage Principles

### 2.1 Primary User Context

**Web Admin Console is designed for**:

- Authorized administrative users (Owner, Internal Admin)
- Long-session work (sustained hours)
- Operational workflows (user management, org management, monitoring)
- Desktop-first, responsive-aware

**Evidence**: HOST_APP_CONSOLE_DEFINITION.md Sections 1, 2

---

### 2.2 Long-Session Ergonomics

**MUST optimize for**:

- Reduced cognitive load over hours
- Calm, confident interface
- Predictable behavior (no surprises)
- User control (no forced flows)

**MUST avoid**:

- Visual noise
- Excessive motion
- Harsh contrast
- Cramped layouts

**Evidence**: BRAND_IDENTITY.md Sections 1, 2, 3

---

### 2.3 Cognitive Load Reduction

**Web Admin MUST**:

- Reduce mental effort (not increase)
- Support sustained focus
- Provide clear orientation
- Preserve state on navigation

**Evidence**: BRAND_IDENTITY.md Section 3.1, CROSS_PLATFORM_PRINCIPLES.md Section 5.1

---

## 3) Responsive Profiles (Web Only)

### 3.1 Desktop (Primary)

**Characteristics**:

- Large screen
- Precise pointing (mouse/trackpad)
- Multi-pane layouts
- Persistent navigation
- Denser information density

**Primary use case**: Operational admin work

---

### 3.2 Tablet (Secondary)

**Characteristics**:

- Medium screen
- Touch or precise pointing
- Collapsible navigation
- Moderate information density
- Hybrid layouts (multi-pane when space allows)

**Primary use case**: Mobile admin work (on-the-go)

---

### 3.3 Mobile Web (Restricted)

**Characteristics**:

- Small screen
- Touch only
- Drawer navigation
- Single-pane layouts
- Spacious density (touch targets)

**Primary use case**: Emergency access, monitoring

**Restrictions**:

- Complex workflows may be limited
- Multi-step operations may be simplified
- Some features may be view-only

**Rationale**: Mobile web is for emergency access, not primary admin work.

---

## 4) Progressive Simplification on Smaller Screens

### 4.1 Simplification Strategy

**As screen size decreases**:

- Reduce visible controls
- Collapse navigation
- Shift to single-pane layouts
- Increase whitespace (touch targets)
- Hide advanced features (accessible via overflow)

**Rationale**: Smaller screens require focus and simplification.

**Evidence**: CROSS_PLATFORM_PRINCIPLES.md Section 3

---

### 4.2 What Simplifies

**MAY simplify**:

- Layout structure (multi-pane → single-pane)
- Navigation (persistent → collapsible → drawer)
- Density (compact → comfortable → spacious)
- Visible controls (all → essential → critical)

**MUST NOT simplify**:

- Brand identity
- Security behavior (fail-closed)
- Error handling
- Cognitive safety principles

**Evidence**: CROSS_PLATFORM_PRINCIPLES.md Section 4

---

## 5) System Control and Governance Pressure Behavior

### 5.1 System States

**Web Admin MUST assume existence of**:

- Restricted (limited access)
- Suspended (temporary block)
- Usage limited (quota reached)
- Abuse / Incident handling (security response)

**Evidence**: MODULE_SECURITY_LAWS.md Section 3.1

---

### 5.2 Fail-Closed Behavior

**Under system control states, UI MUST**:

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

**Evidence**: BRAND_IDENTITY.md (derived from security baseline), MODULE_SECURITY_LAWS.md Section 3.1

---

### 5.3 Governance Pressure Examples

**Restricted state**:

- Actions disabled (grayed out)
- Safe message: "This action is not available"
- Navigation remains stable

**Suspended state**:

- Critical actions blocked
- Safe message: "Access temporarily restricted. Please contact your administrator."
- Read-only access may remain

**Usage limited**:

- Write actions blocked
- Safe message: "Usage limit reached. Please contact your administrator."
- Read access remains

**Evidence**: MODULE_SECURITY_LAWS.md Section 3.1

---

## 6) What MUST Remain Identical to Brand

### 6.1 Brand Identity

**MUST remain identical across all responsive profiles**:

- Brand purpose (reduce cognitive load, serve people)
- Core vision (calm, confident, premium, supportive, fast without anxiety)
- Emotional tone (never rushed, never judged)
- Brand voice (calm expert)

**Evidence**: BRAND_IDENTITY.md Sections 1, 2, 7, CROSS_PLATFORM_PRINCIPLES.md Section 2.1

---

### 6.2 Human-First Principles

**MUST remain identical across all responsive profiles**:

- Cognitive safety (no surprise behavior, no sudden changes)
- User control (undo when possible, back preserves state)
- Fail-closed behavior (deny on uncertainty)
- Safe error messages (no internal details)

**Evidence**: BRAND_IDENTITY.md Section 3, CROSS_PLATFORM_PRINCIPLES.md Section 2.2

---

### 6.3 Security Invariants

**MUST remain identical across all responsive profiles**:

- Fail-closed on 401/403
- No token storage in client-side storage
- No Core API calls from UI
- Safe error messages only

**Evidence**: CROSS_PLATFORM_PRINCIPLES.md Section 4.1

---

## 7) What May Adapt (Presentation and Interaction Only)

### 7.1 Layout Structure

**MAY adapt**:

- Multi-pane (desktop) → Single-pane (mobile web)
- Persistent sidebar (desktop) → Collapsible (tablet) → Drawer (mobile web)
- Horizontal tabs (desktop) → Vertical stack (mobile web)

**Rationale**: Screen size and input method differ.

**Evidence**: CROSS_PLATFORM_PRINCIPLES.md Section 3.4

---

### 7.2 Density

**MAY adapt**:

- Compact/Comfortable (desktop) → Comfortable (tablet) → Spacious (mobile web)
- Tighter spacing (desktop) → Generous spacing (mobile web)

**Rationale**: Touch targets require more space.

**Evidence**: CROSS_PLATFORM_PRINCIPLES.md Section 3.1

---

### 7.3 Interaction Patterns

**MAY adapt**:

- Hover states (desktop) → Touch feedback (tablet/mobile web)
- Click (desktop) → Tap (tablet/mobile web)
- Keyboard shortcuts (desktop) → Gesture support (mobile web)

**Rationale**: Input methods differ.

**Evidence**: CROSS_PLATFORM_PRINCIPLES.md Section 3.3

---

### 7.4 Visible Controls

**MAY adapt**:

- All controls visible (desktop) → Essential controls (tablet) → Critical controls (mobile web)
- Advanced features visible (desktop) → Hidden in overflow (mobile web)

**Rationale**: Smaller screens require focus and simplification.

---

## 8) Forbidden Patterns

**MUST NOT**:

- Break brand identity on any responsive profile
- Break human-first principles on any responsive profile
- Implement fail-open behavior on any responsive profile
- Use different emotional tones per responsive profile
- Fragment brand across responsive profiles
- Sacrifice security for responsive convenience
- Create responsive-specific brand identities

**Evidence**: CROSS_PLATFORM_PRINCIPLES.md Section 7

---

## 9) Acceptance Criteria

This web application principles document is considered ACTIVE and BINDING when ALL of the following are true:

- [x] Web admin-first usage principles are documented
- [x] Long-session ergonomics are documented
- [x] Responsive profiles are defined (Desktop, Tablet, Mobile Web)
- [x] Progressive simplification strategy is documented
- [x] System control and governance pressure behavior is documented
- [x] What MUST remain identical to brand is explicit
- [x] What may adapt is explicit (presentation and interaction only)
- [x] Forbidden patterns are explicit
- [x] All evidence links to canonical sources are provided

---

## 10) Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-10  
**Status**: FINAL — BINDING WEB APPLICATION RULES  
**Canonical Sources**: BRAND_IDENTITY.md, CROSS_PLATFORM_PRINCIPLES.md, HOST_APP_CONSOLE_DEFINITION.md, MODULE_SECURITY_LAWS.md
