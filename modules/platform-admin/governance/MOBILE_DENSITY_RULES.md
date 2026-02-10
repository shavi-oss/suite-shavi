# Mobile Density Rules — platform-admin

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Platform Name  | Bassan                                  |
| Document Title | MOBILE_DENSITY_RULES                    |
| Repo           | Suite (Layer / Product Repo)            |
| Module         | platform-admin                          |
| Status         | FINAL — BINDING MOBILE DENSITY RULES    |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | DENSITY_MAPPING.md, DESIGN_TOKENS.md    |
| Effective Date | 2026-02-10                              |

---

## 1) Purpose

Define density philosophy for mobile applications.

**This document does NOT contain**:

- Specific spacing values
- Numeric dimensions
- Component layouts

---

## 2) Density Philosophy for Small Screens

### 2.1 Default Density: Spacious

**Mobile MUST default to Spacious density**:

- Generous whitespace
- Large touch targets
- Calm layouts
- Breathing room

**Rationale**: Touch input requires more space than precise pointing.

**Evidence**: DENSITY_MAPPING.md Section 3.2

---

### 2.2 Touch Target Priority

**Mobile MUST prioritize touch targets**:

- Touch targets large enough for thumb interaction
- Adequate spacing between interactive elements
- No cramped layouts

**Rationale**: Accidental taps create frustration and errors.

**Evidence**: DENSITY_MAPPING.md Section 7.1

---

### 2.3 No Compact Density

**Mobile MUST NOT use Compact density**:

- Touch targets too small
- Accidental taps likely
- Reduces usability

**Evidence**: DENSITY_MAPPING.md Section 3.2

---

## 3) Reading vs Action Balance

### 3.1 Reading-Heavy Views

**For monitoring, dashboards, analytics**:

- Use Spacious density
- Maximize readability
- Reduce interactive controls
- Support scanning

**Rationale**: Mobile monitoring prioritizes quick comprehension.

---

### 3.2 Action-Heavy Views

**For forms, settings, configuration**:

- Use Spacious density
- Large touch targets for inputs
- Clear visual separation between fields
- Support single-hand operation (when possible)

**Rationale**: Mobile input requires generous spacing.

---

### 3.3 List Views

**For user lists, organization lists**:

- Use Comfortable to Spacious density
- Balance visible items and touch targets
- Support swipe gestures (when appropriate)
- Provide clear tap targets for drill-down

**Rationale**: Lists balance information density and interaction.

---

## 4) Forbidden Density Misuse

### 4.1 Compact Density Violation

**MUST NOT**:

- Use Compact density on mobile
- Sacrifice touch target size for information density
- Create cramped layouts

**Rationale**: Compact density is incompatible with touch input.

**Evidence**: DENSITY_MAPPING.md Section 7.1

---

### 4.2 Insufficient Whitespace

**MUST NOT**:

- Reduce whitespace below safe touch target spacing
- Create visually cramped layouts
- Sacrifice readability for density

**Rationale**: Mobile is designed for short sessions. Cramped layouts increase cognitive load.

**Evidence**: DENSITY_MAPPING.md Section 8.2

---

### 4.3 Accessibility Violations

**MUST NOT**:

- Use density that violates minimum touch target sizes
- Use density that reduces readability
- Ignore user accessibility preferences (e.g., large text)

**Evidence**: DENSITY_MAPPING.md Section 7.3

---

## 5) Governance-State Density Reduction

### 5.1 Normal State

**Use standard Spacious density**

---

### 5.2 Restricted State

**MAY increase whitespace**:

- Highlight disabled actions
- Provide clear visual separation
- Show safe error messages with breathing room

**Rationale**: Restricted state requires clear communication.

---

### 5.3 Suspended State

**MAY increase whitespace**:

- Focus on critical message
- Reduce visual clutter
- Provide clear next steps

**Rationale**: Suspended state requires user attention and clarity.

---

### 5.4 Usage Limited State

**MAY increase whitespace**:

- Highlight blocked actions
- Show usage status clearly
- Provide clear guidance

**Rationale**: Usage limited state requires clear communication of limits.

---

## 6) Density Adaptation by View Type

### 6.1 Dashboard and Monitoring

**Density**: Spacious

**Characteristics**:

- Large metric displays
- Clear visual hierarchy
- Minimal interactive controls
- Support quick scanning

---

### 6.2 Lists (Users, Organizations)

**Density**: Comfortable to Spacious

**Characteristics**:

- Balance visible items and touch targets
- Clear tap targets for drill-down
- Support swipe gestures (when appropriate)

---

### 6.3 Detail Views

**Density**: Spacious

**Characteristics**:

- Generous whitespace
- Clear visual separation between sections
- Large touch targets for actions

---

### 6.4 Forms and Settings

**Density**: Spacious

**Characteristics**:

- Large touch targets for inputs
- Clear visual separation between fields
- Support single-hand operation (when possible)

---

## 7) Density Philosophy

### 7.1 Density as Tool

**Density is a tool to**:

- Reduce cognitive load (not increase)
- Support touch interaction (not hinder)
- Adapt to mobile context (not impose desktop patterns)

**Evidence**: DENSITY_MAPPING.md Section 8.1

---

### 7.2 No Cramped Feeling

**MUST avoid**:

- Cramped layouts
- Insufficient whitespace
- Overwhelming information density

**Rationale**: Mobile sessions are short. Cramped layouts increase fatigue and errors.

**Evidence**: DENSITY_MAPPING.md Section 8.2

---

### 7.3 Touch-First Priority

**Mobile density MUST prioritize**:

- Touch target size
- Accidental tap prevention
- Single-hand operation (when possible)

**Rationale**: Touch is the primary input method on mobile.

---

## 8) Acceptance Criteria

This mobile density rules document is considered ACTIVE and BINDING when ALL of the following are true:

- [x] Density philosophy for small screens is documented
- [x] Reading vs action balance is documented
- [x] Forbidden density misuse is explicit
- [x] Governance-state density reduction is documented
- [x] Density adaptation by view type is documented
- [x] Density philosophy is documented
- [x] All evidence links to canonical sources are provided

---

## 9) Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-10  
**Status**: FINAL — BINDING MOBILE DENSITY RULES  
**Canonical Sources**: DENSITY_MAPPING.md, DESIGN_TOKENS.md
