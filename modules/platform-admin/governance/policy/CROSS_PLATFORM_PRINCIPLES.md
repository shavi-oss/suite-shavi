# Cross-Platform Principles — platform-admin

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Platform Name  | Bassan                                  |
| Document Title | CROSS_PLATFORM_PRINCIPLES               |
| Repo           | Suite (Layer / Product Repo)            |
| Module         | platform-admin                          |
| Status         | FINAL — BINDING CROSS-PLATFORM RULES    |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | BRAND_IDENTITY.md, DESIGN_TOKENS.md     |
| Effective Date | 2026-02-10                              |

---

## 1) Purpose

Define what stays identical and what adapts across web and mobile platforms while maintaining Bassan's human-first brand identity.

---

## 2) What Stays Identical Across Platforms

### 2.1 Brand Identity

**MUST remain identical**:

- Brand purpose (reduce cognitive load, serve people)
- Core vision (calm, confident, premium, supportive, fast without anxiety)
- Emotional tone (never rushed, never judged)
- Brand voice (calm expert)

**Evidence**: BRAND_IDENTITY.md Sections 1, 2, 7

---

### 2.2 Human-First Principles

**MUST remain identical**:

- Cognitive safety (no surprise behavior, no sudden changes)
- User control (undo when possible, back preserves state)
- Fail-closed behavior (deny on uncertainty)
- Safe error messages (no internal details)

**Evidence**: BRAND_IDENTITY.md Section 3

---

### 2.3 Color and Theme Philosophy

**MUST remain identical**:

- Primary color (muted purple)
- Light theme as default
- Dark theme as secondary
- Soft backgrounds, controlled contrast
- No harsh color jumps

**Evidence**: DESIGN_TOKENS.md Section 2, THEME_POLICY.md Section 2

---

### 2.4 Typography Philosophy

**MUST remain identical**:

- Human tone
- Simple sentences
- Friendly but professional
- Calm expert voice

**Evidence**: DESIGN_TOKENS.md Section 3

---

### 2.5 Motion Philosophy

**MUST remain identical**:

- Motion is functional, not decorative
- Duration: 150–200ms
- No bounce
- No exaggerated easing
- Motion guides orientation only

**Evidence**: DESIGN_TOKENS.md Section 7

---

### 2.6 Icon Philosophy

**MUST remain identical**:

- Icons are shortcuts, not replacements
- Functional, not decorative
- Consistent stroke and weight
- Clear semantic meaning

**Evidence**: ICONOGRAPHY_RULES.md Sections 2, 3

---

### 2.7 Logo Philosophy

**MUST remain identical**:

- Logo is always present
- Small, calm, never dominant
- Logo exists to reassure, not advertise

**Evidence**: LOGO_USAGE.md Section 2

---

## 3) What Adapts Per Platform

### 3.1 Density

**Adapts by platform**:

- Desktop → More comfortable/compact density
- Mobile → More spacious density (touch targets)

**Adapts by context**:

- Admin → Denser, more operational
- Client → Calmer, lighter, more spacious

**Evidence**: DESIGN_TOKENS.md Section 4, BRAND_IDENTITY.md Section 4.2

---

### 3.2 Navigation Patterns

**Adapts by platform**:

- Web → Sidebar, tabs, multi-pane layouts
- Mobile → Bottom navigation, stacks, single-pane focus

**Rationale**: Platform conventions and ergonomics differ.

---

### 3.3 Input Methods

**Adapts by platform**:

- Desktop → Mouse, keyboard, precise pointing
- Mobile → Touch, gestures, larger targets

**Rationale**: Input methods require different interaction patterns.

---

### 3.4 Layout Structure

**Adapts by platform**:

- Desktop → Multi-column, side-by-side views
- Mobile → Single-column, stacked views

**Rationale**: Screen size and orientation differ.

---

## 4) What Must NEVER Change

### 4.1 Security Invariants

**MUST NEVER change across platforms**:

- Fail-closed behavior on 401/403
- No token storage in client-side storage
- No Core API calls from UI
- Safe error messages only

**Evidence**: BRAND_IDENTITY.md (derived from security baseline)

---

### 4.2 Cognitive Safety

**MUST NEVER change across platforms**:

- No surprise behavior
- No sudden layout changes
- No forced flows
- User always in control

**Evidence**: BRAND_IDENTITY.md Section 3.1

---

### 4.3 Emotional Tone

**MUST NEVER change across platforms**:

- Never rushed
- Never judged
- Never nagging
- Never blaming

**Evidence**: BRAND_IDENTITY.md Section 3.2

---

### 4.4 Brand Consistency

**MUST NEVER change across platforms**:

- Unified brand (no fragmentation)
- No white-label feeling
- Premium without trying
- Consistency is a feature

**Evidence**: BRAND_IDENTITY.md Sections 4.1, 10

---

## 5) Human-First Consistency Rules

### 5.1 Consistency Principle

**Consistency reduces cognitive load**:

- Same action = same result (across platforms)
- Same visual pattern = same meaning (across platforms)
- Same terminology = same concept (across platforms)

**Evidence**: BRAND_IDENTITY.md Section 10

---

### 5.2 Platform Adaptation Guidelines

**When adapting for platform**:

- Preserve intent and meaning
- Adapt form, not function
- Maintain brand identity
- Reduce cognitive load (never increase)

**Evidence**: BRAND_IDENTITY.md Section 9

---

### 5.3 Context-Adaptive Intensity

**Brand intensity varies by context** (same across platforms):

- Admin → Denser, more operational
- Client → Calmer, lighter, more spacious

**Evidence**: BRAND_IDENTITY.md Section 4.2

---

## 6) Cross-Platform Design Governance

### 6.1 Design Decision Criteria

**Any platform-specific design must answer**:

1. Does it reduce mental effort on this platform?
2. Does it preserve brand identity?
3. Does it maintain human-first principles?

**If not → it does not belong**.

**Evidence**: BRAND_IDENTITY.md Section 9

---

### 6.2 Platform Parity

**MUST maintain functional parity**:

- Same features available on all platforms
- Same data accessible on all platforms
- Same security on all platforms

**MAY differ in**:

- Interaction patterns (touch vs mouse)
- Layout structure (single vs multi-column)
- Density (touch targets vs precise pointing)

---

## 7) Forbidden Cross-Platform Patterns

**MUST NOT**:

- Create platform-specific brand identities
- Break human-first principles on any platform
- Implement fail-open behavior on any platform
- Use different emotional tones per platform
- Fragment brand across platforms
- Sacrifice security for platform convenience

**Evidence**: BRAND_IDENTITY.md Sections 3, 4, 6

---

## 8) Acceptance Criteria

This cross-platform principles document is considered ACTIVE and BINDING when ALL of the following are true:

- [x] What stays identical is explicit
- [x] What adapts per platform is explicit
- [x] What must NEVER change is explicit
- [x] Human-first consistency rules are documented
- [x] Cross-platform design governance is documented
- [x] Forbidden patterns are explicit
- [x] All evidence links to canonical sources are provided

---

## 9) Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-10  
**Status**: FINAL — BINDING CROSS-PLATFORM RULES  
**Canonical Sources**: BRAND_IDENTITY.md, DESIGN_TOKENS.md, THEME_POLICY.md, ICONOGRAPHY_RULES.md, LOGO_USAGE.md
