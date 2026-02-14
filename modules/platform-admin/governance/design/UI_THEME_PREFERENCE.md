# UI Theme Preference

## Document Control

| Attribute      | Value                                 |
| -------------- | ------------------------------------- |
| Gate Number    | 29.5                                  |
| Gate Name      | System Vision Alignment               |
| Document Title | UI_THEME_PREFERENCE                   |
| Repo           | Suite (Layer / Product Repo)          |
| Module         | platform-admin                        |
| Status         | BINDING — THEME POLICY                |
| Execution Mode | GOVERNANCE ONLY · NO CODE · NO DESIGN |
| Authority      | Platform UX Governance                |
| Effective Date | 2026-02-11                            |

---

## 1) Purpose

This document defines the **theme policy** for Bassan OS.

**This is a governance artifact, NOT a design deliverable.**

Contains **NO** color values, hex codes, or visual specifications.

**Evidence**: Gate 29.5 requirements

---

## 2) Theme Hierarchy (LOCKED)

### Light Theme

**Status**: **Default**

**Rationale**: Light theme is standard for long-session operational work.

**Evidence**: Brand & UI Constitution Section 3

---

### Dark Theme

**Status**: **Secondary (Official)**

**Rationale**: Dark theme is official but secondary. Used for focus or user preference.

**Evidence**: Brand & UI Constitution Section 3

---

## 3) Accent Usage Policy

Accent colors are **FUNCTIONAL ONLY**.

**Allowed uses**:

- Active navigation indicator
- Primary action buttons
- Focus states
- Selection indicators
- Status indicators (when semantically appropriate)

**Forbidden uses**:

- Decorative elements
- Background fills
- Large surface areas
- Attention-grabbing effects

**Evidence**: Brand & UI Constitution Section 3

---

## 4) Contrast Rules for Long Sessions

### Readability Requirements

Contrast must support:

- 4–10 hour daily sessions
- Repeated scanning
- Heavy data loads
- Operational pressure

**Rules**:

- Soft backgrounds (no harsh whites or blacks)
- Controlled contrast (readable but not jarring)
- No harsh color jumps
- Consistent contrast across states

**Evidence**: Brand & UI Constitution Section 3, UI_Density_Policy.MD Section 11

---

### Fatigue Prevention

**MUST avoid**:

- High contrast that causes eye strain
- Low contrast that reduces readability
- Inconsistent contrast across screens
- Sudden contrast changes

**Evidence**: UI_Density_Policy.MD Section 2

---

## 5) Semantic Status Colors (NO VALUES)

Status colors must be **semantic** and **consistent**.

### Success

**Semantic meaning**: Operation completed successfully, positive state.

**Usage**: Success messages, completed tasks, active states.

---

### Warning

**Semantic meaning**: Attention required, caution advised.

**Usage**: Warning messages, pending actions, review required.

---

### Error

**Semantic meaning**: Operation failed, critical issue.

**Usage**: Error messages, failed operations, blocked states.

---

### Info

**Semantic meaning**: Informational, neutral notification.

**Usage**: Info messages, help text, neutral states.

---

### Neutral

**Semantic meaning**: Default state, no special status.

**Usage**: Default UI elements, inactive states, neutral content.

---

## 6) Theme Consistency Rules

### Across Suites

All suites must use:

- Same theme structure (Light default, Dark secondary)
- Same semantic status colors
- Same accent usage policy
- Same contrast rules

**Allowed variation**:

- Accent color hue (per suite context)

**Evidence**: Shell_Strategy.MD Section 8

---

### Across States

All states must exhibit:

- Consistent status color usage
- Predictable contrast levels
- Clear visual differentiation
- No surprise color changes

**Evidence**: Brand & UI Constitution Section 11

---

## 7) Theme Switching Behavior

### User Control

Users **MAY** switch between Light and Dark themes.

**Requirements**:

- Theme preference persists across sessions
- Theme switch does not reset context
- Theme switch does not cause layout changes
- Theme switch is instant (no loading)

**Evidence**: Brand & UI Constitution Section 11

---

### System Behavior

System **MUST**:

- Remember user theme preference
- Apply theme consistently across all suites
- Maintain contrast rules in both themes
- Preserve semantic status colors in both themes

---

## 8) Forbidden Theme Practices

**MUST NOT**:

- Use accent colors for decoration
- Implement high contrast that causes eye strain
- Create inconsistent contrast across screens
- Use non-semantic status colors
- Change theme without user action
- Reset context on theme switch
- Implement theme-specific layouts

**Evidence**: Brand & UI Constitution Sections 3, 11

---

## 9) Acceptance Criteria

This theme preference is considered BINDING when ALL of the following are true:

- [x] Light theme locked as default
- [x] Dark theme defined as secondary (official)
- [x] Accent usage defined as functional only
- [x] Contrast rules for long sessions defined
- [x] Semantic status colors defined (no values)
- [x] Theme consistency rules established
- [x] Theme switching behavior defined
- [x] Forbidden theme practices explicit
- [x] No color values included

---

## 10) Signature

**Approved By**: Platform UX Governance  
**Date**: 2026-02-11  
**Status**: BINDING — THEME POLICY  
**Authority**: Brand & UI Constitution, UI_Density_Policy.MD
