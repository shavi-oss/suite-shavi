# Mobile Motion Usage — platform-admin

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Platform Name  | Bassan                                  |
| Document Title | MOBILE_MOTION_USAGE                     |
| Repo           | Suite (Layer / Product Repo)            |
| Module         | platform-admin                          |
| Status         | FINAL — BINDING MOBILE MOTION USAGE     |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | MOTION_ADAPTATION.md, DESIGN_TOKENS.md  |
| Effective Date | 2026-02-10                              |

---

## 1) Purpose

Define motion usage for mobile applications.

**This document does NOT contain**:

- Animation code
- Specific easing functions
- Numeric duration values

---

## 2) Motion Intent for Mobile

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

- Immediate feedback (touch response)
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

## 3) Motion as Feedback Only

### 3.1 Touch Feedback

**Touch interactions MUST provide immediate feedback**:

- Visual response to touch (button press, tap)
- State change indication (selected, active)
- Progress indication (loading)

**Rationale**: Touch requires immediate feedback to feel responsive.

**Evidence**: MOTION_ADAPTATION.md Section 3.2

---

### 3.2 Gesture Feedback

**Gestures MUST provide feedback**:

- Swipe (content movement)
- Pull-to-refresh (progress indication)
- Long-press (haptic feedback, visual indication)

**Rationale**: Gestures require feedback to confirm recognition.

---

### 3.3 Decorative Motion (Forbidden)

**MUST NOT use motion for**:

- Page load animations (unless loading data)
- Idle animations (continuous motion)
- Decorative transitions (no functional purpose)
- Showing off design skills

**Evidence**: MOTION_ADAPTATION.md Section 7.1

---

## 4) Reduced Motion Defaults

### 4.1 Mobile Motion Minimization

**Mobile SHOULD minimize motion**:

- Faster transitions than desktop
- Instant state changes (when appropriate)
- Reduced decorative motion

**Rationale**: Mobile users prioritize speed and battery life.

**Evidence**: MOTION_ADAPTATION.md Section 3.2

---

### 4.2 Reduced Motion Preference

**MUST respect user preference**:

- Detect reduced motion preference (OS setting)
- Disable non-essential motion
- Preserve essential feedback (immediate state changes)

**Evidence**: MOTION_ADAPTATION.md Section 4.1

---

### 4.3 Essential vs Non-Essential Motion

**Essential motion** (keep even with reduced motion):

- Touch feedback (immediate response)
- State change indication (loading → loaded)
- Focus indicators (accessibility)

**Non-essential motion** (disable with reduced motion):

- Page transitions
- Drawer slide-in/out
- Fade-in effects

**Evidence**: MOTION_ADAPTATION.md Section 4.2

---

## 5) Motion Forbidden During Denial States

### 5.1 Denied Actions

**When action is denied (401/403), MUST NOT**:

- Animate touch feedback (no feedback for denied action)
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

### 5.3 Suspended State

**When account is suspended, MUST NOT**:

- Animate navigation (no motion during suspension message)
- Show loading indicators for blocked actions
- Animate transitions to error states

**MUST instead**:

- Show static suspension message
- Provide clear next steps (no motion)

**Rationale**: Suspension is a critical state requiring immediate clarity, not motion.

---

### 5.4 Usage Limited State

**When usage limit is reached, MUST NOT**:

- Animate blocked actions
- Show loading indicators for quota-exceeded actions

**MUST instead**:

- Show static usage limit message
- Provide clear guidance (no motion)

**Rationale**: Usage limits require immediate clarity, not motion.

---

## 6) Motion Characteristics (Conceptual)

### 6.1 Duration (Conceptual)

**Motion duration is**:

- Quick (immediate feedback)
- Standard (transitions)

**Motion duration is NOT**:

- Long (> standard range)
- Continuous (looping, except loading)

**Evidence**: MOTION_ADAPTATION.md Section 5

---

### 6.2 Easing (Conceptual)

**Motion easing is**:

- Smooth
- Natural
- Responsive

**Motion easing is NOT**:

- Bouncy
- Exaggerated
- Elastic

**Evidence**: MOTION_ADAPTATION.md Section 6

---

## 7) Battery and Performance Considerations

### 7.1 Battery Conservation

**Mobile motion MUST**:

- Minimize continuous animation
- Avoid excessive GPU usage
- Respect battery saver mode

**Rationale**: Mobile devices have limited battery life.

---

### 7.2 Performance Priority

**Mobile motion MUST**:

- Be performant (smooth, no jank)
- Not block user interaction
- Be cancelable (user can interrupt)

**Rationale**: Poor performance creates frustration.

---

## 8) Forbidden Motion Patterns

### 8.1 Decorative Motion

**MUST NOT**:

- Use motion for decoration
- Animate for entertainment
- Add motion without functional purpose
- Use motion to "show off"

**Evidence**: MOTION_ADAPTATION.md Section 7.1

---

### 8.2 Excessive Motion

**MUST NOT**:

- Use continuous animation (except loading)
- Animate multiple elements simultaneously (unless coordinated)
- Use motion that distracts from work
- Use motion that increases cognitive load

**Evidence**: MOTION_ADAPTATION.md Section 7.2

---

### 8.3 Disruptive Motion

**MUST NOT**:

- Animate during critical operations
- Use motion that surprises user
- Use motion that loses user context
- Use motion that feels rushed or anxious

**Evidence**: MOTION_ADAPTATION.md Section 7.3

---

## 9) Motion Philosophy Summary

> Motion should feel like breathing — not talking.

**Motion is**:

- Functional
- Subtle
- Responsive
- Respectful (of user preferences and battery)

**Motion is NOT**:

- Decorative
- Exaggerated
- Distracting
- Mandatory (respect reduced motion)

**Evidence**: MOTION_ADAPTATION.md Section 9

---

## 10) Acceptance Criteria

This mobile motion usage document is considered ACTIVE and BINDING when ALL of the following are true:

- [x] Motion intent for mobile is documented
- [x] Motion as feedback only is explicit
- [x] Reduced motion defaults are documented
- [x] Motion forbidden during denial states is explicit
- [x] Motion characteristics are documented (conceptual, no numeric values)
- [x] Battery and performance considerations are documented
- [x] Forbidden motion patterns are explicit
- [x] Motion philosophy summary is documented
- [x] All evidence links to canonical sources are provided

---

## 11) Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-10  
**Status**: FINAL — BINDING MOBILE MOTION USAGE  
**Canonical Sources**: MOTION_ADAPTATION.md, DESIGN_TOKENS.md
