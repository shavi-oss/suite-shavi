# Motion Adaptation — platform-admin

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Platform Name  | Bassan                                  |
| Document Title | MOTION_ADAPTATION                       |
| Repo           | Suite (Layer / Product Repo)            |
| Module         | platform-admin                          |
| Status         | FINAL — BINDING MOTION ADAPTATION       |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | DESIGN_TOKENS.md, BRAND_IDENTITY.md     |
| Effective Date | 2026-02-10                              |

---

## 1) Purpose

Define motion intent and platform-specific adaptation while maintaining functional, non-decorative motion philosophy.

**This document does NOT contain**:

- CSS animations or transitions
- Specific easing functions
- Animation libraries

---

## 2) Motion Intent (Shared Across Platforms)

### 2.1 Motion Philosophy

**Motion is functional, not decorative**:

- Motion guides orientation
- Motion provides feedback
- Motion indicates state changes
- Motion is NOT entertainment

**Evidence**: DESIGN_TOKENS.md Section 7.3

---

### 2.2 Motion Characteristics

**Motion MUST**:

- Duration: 150–200ms
- No bounce
- No exaggerated easing
- No sound
- Feel like breathing, not talking

**Evidence**: DESIGN_TOKENS.md Section 7

---

### 2.3 Motion Purpose

**Motion is used for**:

- Immediate feedback (button press, interaction)
- State transitions (loading → loaded, collapsed → expanded)
- Orientation (where did content come from/go to)
- Attention (important state change)

**Motion is NOT used for**:

- Decoration
- Entertainment
- Showing off
- Filling time

**Evidence**: DESIGN_TOKENS.md Section 7.3

---

## 3) Platform-Specific Adaptation

### 3.1 Web Motion

**Web motion MAY use**:

- Transitions (state changes)
- Hover effects (immediate feedback)
- Drawer/modal animations (orientation)
- Loading indicators (progress)

**Web motion SHOULD**:

- Be subtle (150–200ms)
- Support reduced motion preference
- Avoid excessive animation

---

### 3.2 Mobile Motion

**Mobile motion MAY use**:

- Transitions (state changes)
- Touch feedback (immediate response)
- Swipe animations (gesture feedback)
- Loading indicators (progress)

**Mobile motion SHOULD**:

- Be responsive (immediate feedback to touch)
- Support reduced motion preference
- Respect battery life (avoid continuous animation)

---

### 3.3 Platform Differences

**Web vs Mobile**:

- Web: Hover states (mouse interaction)
- Mobile: Touch feedback (touch interaction)
- Both: Same duration (150–200ms)
- Both: Same philosophy (functional, not decorative)

**Rationale**: Input methods differ, but motion philosophy remains consistent.

---

## 4) Reduced Motion Rules

### 4.1 Reduced Motion Preference

**MUST respect user preference**:

- Detect reduced motion preference (OS/browser setting)
- Disable non-essential motion
- Preserve essential feedback (immediate state changes)

**Evidence**: THEME_POLICY.md Section 5.3

---

### 4.2 Essential vs Non-Essential Motion

**Essential motion** (keep even with reduced motion):

- Immediate feedback (button press)
- State change indication (loading → loaded)
- Focus indicators (keyboard navigation)

**Non-essential motion** (disable with reduced motion):

- Drawer slide-in/out
- Fade-in effects
- Decorative transitions

---

### 4.3 Reduced Motion Implementation

**With reduced motion preference**:

- Duration: 0ms (instant)
- OR Duration: minimal (50ms or less)
- No easing (linear)
- Preserve functionality (no motion, but state changes still occur)

---

## 5) Motion Duration Guidelines

### 5.1 Quick Motion

**Duration**: 150ms

**Use for**:

- Immediate feedback (button press, hover)
- Micro-interactions
- State toggles

**Evidence**: DESIGN_TOKENS.md Section 7.1

---

### 5.2 Standard Motion

**Duration**: 200ms

**Use for**:

- Transitions (page changes, drawer open/close)
- State changes (loading → loaded)
- Orientation (content movement)

**Evidence**: DESIGN_TOKENS.md Section 7.1

---

### 5.3 No Long Motion

**MUST NOT use**:

- Duration > 200ms (too slow, feels sluggish)
- Continuous animation (battery drain, distraction)
- Looping animation (except loading indicators)

**Rationale**: Long motion increases cognitive load and feels slow.

**Evidence**: DESIGN_TOKENS.md Section 7.3

---

## 6) Motion Easing Guidelines

### 6.1 Smooth Easing

**MUST use**:

- Smooth, natural easing
- No bounce
- No exaggerated easing

**Evidence**: DESIGN_TOKENS.md Section 7.2

---

### 6.2 Forbidden Easing

**MUST NOT use**:

- Bounce easing
- Elastic easing
- Exaggerated ease-in/ease-out
- Spring physics (unless very subtle)

**Rationale**: Exaggerated easing feels playful, not professional.

**Evidence**: DESIGN_TOKENS.md Section 7.2

---

## 7) Forbidden Motion Patterns

### 7.1 Decorative Motion

**MUST NOT**:

- Use motion for decoration
- Animate for entertainment
- Add motion without functional purpose
- Use motion to "show off"

**Evidence**: DESIGN_TOKENS.md Section 7.3

---

### 7.2 Excessive Motion

**MUST NOT**:

- Use continuous animation (except loading)
- Animate multiple elements simultaneously (unless coordinated)
- Use motion that distracts from work
- Use motion that increases cognitive load

**Evidence**: BRAND_IDENTITY.md Section 9

---

### 7.3 Disruptive Motion

**MUST NOT**:

- Animate during critical operations (no sidebar animation during save)
- Use motion that surprises user
- Use motion that loses user context
- Use motion that feels rushed or anxious

**Evidence**: BRAND_IDENTITY.md Sections 3.1, 3.2

---

## 8) Motion and Performance

### 8.1 Performance Considerations

**Motion MUST**:

- Be performant (60fps or instant)
- Not block user interaction
- Not drain battery (mobile)

**Motion SHOULD**:

- Use hardware acceleration (when available)
- Avoid layout thrashing
- Be cancelable (user can interrupt)

---

### 8.2 Loading Motion

**Loading indicators MUST**:

- Show progress intent (not just decoration)
- Be subtle (no aggressive spinning)
- Support timeout (see UI_FETCH_CONTRACT.md)

**Evidence**: BRAND_IDENTITY.md (derived from Brand & UI Constitution Section 9)

---

## 9) Motion Philosophy Summary

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

**Evidence**: DESIGN_TOKENS.md Section 7.3

---

## 10) Acceptance Criteria

This motion adaptation document is considered ACTIVE and BINDING when ALL of the following are true:

- [x] Motion intent is documented (functional, not decorative)
- [x] Platform-specific adaptation is documented
- [x] Reduced motion rules are explicit
- [x] Motion duration guidelines are documented
- [x] Motion easing guidelines are documented
- [x] Forbidden motion patterns are explicit
- [x] Motion and performance considerations are documented
- [x] Motion philosophy summary is documented
- [x] All evidence links to canonical sources are provided

---

## 11) Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-10  
**Status**: FINAL — BINDING MOTION ADAPTATION  
**Canonical Sources**: DESIGN_TOKENS.md, BRAND_IDENTITY.md, THEME_POLICY.md
