# Web Motion Usage — platform-admin

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Platform Name  | Bassan                                  |
| Document Title | WEB_MOTION_USAGE                        |
| Repo           | Suite (Layer / Product Repo)            |
| Module         | platform-admin                          |
| Status         | FINAL — BINDING WEB MOTION USAGE        |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | MOTION_ADAPTATION.md, DESIGN_TOKENS.md  |
| Effective Date | 2026-02-10                              |

---

## 1) Purpose

Define motion usage for web admin console.

**This document does NOT contain**:

- CSS animations or transitions
- Specific easing functions
- Numeric duration values

---

## 2) Motion Intent for Web Admin

### 2.1 Motion Philosophy

**Motion is functional, not decorative**:

- Motion guides orientation
- Motion provides feedback
- Motion indicates state changes
- Motion is NOT entertainment

**Evidence**: MOTION_ADAPTATION.md Section 2.1

---

### 2.2 Motion Purpose

**Motion is used for**:

- Immediate feedback (button press, hover)
- State transitions (loading → loaded, collapsed → expanded)
- Orientation (where did content come from/go to)
- Attention (important state change)

**Motion is NOT used for**:

- Decoration
- Entertainment
- Showing off
- Filling time

**Evidence**: MOTION_ADAPTATION.md Section 2.3

---

## 3) Motion as Feedback, Not Decoration

### 3.1 Feedback Motion

**Appropriate feedback motion**:

- Button press (immediate visual response)
- Hover state (indicates interactivity)
- Focus state (keyboard navigation)
- Loading indicator (progress feedback)

**Evidence**: MOTION_ADAPTATION.md Section 2.3

---

### 3.2 Decorative Motion (Forbidden)

**MUST NOT use motion for**:

- Page load animations (unless loading data)
- Idle animations (continuous motion)
- Decorative transitions (no functional purpose)
- Showing off design skills

**Evidence**: MOTION_ADAPTATION.md Section 7.1

---

## 4) Reduced Motion Defaults Increase on Smaller Screens

### 4.1 Desktop Motion

**Desktop MAY use**:

- Hover effects
- Drawer slide-in/out
- Fade-in transitions
- Loading indicators

**Rationale**: Desktop users expect subtle motion for feedback.

**Evidence**: MOTION_ADAPTATION.md Section 3.1

---

### 4.2 Tablet Motion

**Tablet SHOULD reduce**:

- Drawer slide-in/out (faster or instant)
- Fade-in transitions (faster or instant)

**Tablet MAY use**:

- Touch feedback
- Loading indicators

**Rationale**: Tablet users benefit from faster, more responsive motion.

---

### 4.3 Mobile Web Motion

**Mobile Web SHOULD minimize**:

- All non-essential motion (instant or very fast)

**Mobile Web MUST use**:

- Touch feedback (immediate response)
- Loading indicators (progress feedback)

**Rationale**: Mobile web users prioritize speed and battery life.

**Evidence**: MOTION_ADAPTATION.md Section 3.2

---

## 5) Motion Forbidden During Denied Actions

### 5.1 Denied Actions

**When action is denied (401/403), MUST NOT**:

- Animate button press (no feedback for denied action)
- Show loading indicator (action not executing)
- Animate transition (no state change)

**MUST instead**:

- Show immediate error state (no motion)
- Display safe error message
- Provide clear feedback (denied)

**Rationale**: Motion implies action is executing. Denied actions should not show motion.

**Evidence**: MOTION_ADAPTATION.md Section 7.3

---

### 5.2 Restricted State

**When UI is in restricted state, MUST NOT**:

- Animate disabled controls
- Show motion on blocked actions

**MUST instead**:

- Show static disabled state
- Provide safe message on interaction attempt

---

## 6) Motion Forbidden During Suspension / Quota Blocks

### 6.1 Suspended State

**When account is suspended, MUST NOT**:

- Animate navigation (no motion during suspension message)
- Show loading indicators for blocked actions
- Animate transitions to error states

**MUST instead**:

- Show static suspension message
- Provide clear next steps (no motion)

**Rationale**: Suspension is a critical state requiring immediate clarity, not motion.

---

### 6.2 Usage Limited State

**When usage limit is reached, MUST NOT**:

- Animate blocked actions
- Show loading indicators for quota-exceeded actions

**MUST instead**:

- Show static usage limit message
- Provide clear guidance (no motion)

**Rationale**: Usage limits require immediate clarity, not motion.

---

## 7) Motion Characteristics (Conceptual)

### 7.1 Duration (Conceptual)

**Motion duration is**:

- Quick (immediate feedback)
- Standard (transitions)

**Motion duration is NOT**:

- Long (> standard range)
- Continuous (looping, except loading)

**Evidence**: MOTION_ADAPTATION.md Section 5

---

### 7.2 Easing (Conceptual)

**Motion easing is**:

- Smooth
- Natural

**Motion easing is NOT**:

- Bouncy
- Exaggerated
- Elastic

**Evidence**: MOTION_ADAPTATION.md Section 6

---

## 8) Reduced Motion Support

### 8.1 Reduced Motion Preference

**MUST respect user preference**:

- Detect reduced motion preference (OS/browser setting)
- Disable non-essential motion
- Preserve essential feedback (immediate state changes)

**Evidence**: MOTION_ADAPTATION.md Section 4.1

---

### 8.2 Essential vs Non-Essential Motion

**Essential motion** (keep even with reduced motion):

- Immediate feedback (button press)
- State change indication (loading → loaded)
- Focus indicators (keyboard navigation)

**Non-essential motion** (disable with reduced motion):

- Drawer slide-in/out
- Fade-in effects
- Decorative transitions

**Evidence**: MOTION_ADAPTATION.md Section 4.2

---

## 9) Forbidden Motion Patterns

### 9.1 Decorative Motion

**MUST NOT**:

- Use motion for decoration
- Animate for entertainment
- Add motion without functional purpose
- Use motion to "show off"

**Evidence**: MOTION_ADAPTATION.md Section 7.1

---

### 9.2 Excessive Motion

**MUST NOT**:

- Use continuous animation (except loading)
- Animate multiple elements simultaneously (unless coordinated)
- Use motion that distracts from work
- Use motion that increases cognitive load

**Evidence**: MOTION_ADAPTATION.md Section 7.2

---

### 9.3 Disruptive Motion

**MUST NOT**:

- Animate during critical operations (no sidebar animation during save)
- Use motion that surprises user
- Use motion that loses user context
- Use motion that feels rushed or anxious

**Evidence**: MOTION_ADAPTATION.md Section 7.3

---

## 10) Motion Philosophy Summary

> Motion should feel like breathing — not talking.

**Motion is**:

- Functional
- Subtle
- Responsive
- Respectful (of user preferences)

**Motion is NOT**:

- Decorative
- Exaggerated
- Distracting
- Mandatory (respect reduced motion)

**Evidence**: MOTION_ADAPTATION.md Section 9

---

## 11) Acceptance Criteria

This web motion usage document is considered ACTIVE and BINDING when ALL of the following are true:

- [x] Motion intent for web admin is documented
- [x] Motion as feedback (not decoration) is explicit
- [x] Reduced motion defaults increase on smaller screens is documented
- [x] Motion forbidden during denied actions is explicit
- [x] Motion forbidden during suspension/quota blocks is explicit
- [x] Motion characteristics are documented (conceptual, no numeric values)
- [x] Reduced motion support is documented
- [x] Forbidden motion patterns are explicit
- [x] Motion philosophy summary is documented
- [x] All evidence links to canonical sources are provided

---

## 12) Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-10  
**Status**: FINAL — BINDING WEB MOTION USAGE  
**Canonical Sources**: MOTION_ADAPTATION.md, DESIGN_TOKENS.md
