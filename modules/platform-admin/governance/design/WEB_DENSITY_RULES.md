# Web Density Rules — platform-admin

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Platform Name  | Bassan                                  |
| Document Title | WEB_DENSITY_RULES                       |
| Repo           | Suite (Layer / Product Repo)            |
| Module         | platform-admin                          |
| Status         | FINAL — BINDING WEB DENSITY RULES       |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | DENSITY_MAPPING.md, DESIGN_TOKENS.md    |
| Effective Date | 2026-02-10                              |

---

## 1) Purpose

Define conceptual density mapping for web admin console contexts.

**This document does NOT contain**:

- Specific spacing values
- Pixel or rem values
- CSS grid systems
- Numeric breakpoints

---

## 2) Conceptual Density Levels

### 2.1 Compact

**Characteristics**:

- Tight grouping
- Minimal whitespace
- Dense layouts
- More information per screen

**Intent**: Maximize information density for operational workflows

**Evidence**: DENSITY_MAPPING.md Section 2.1

---

### 2.2 Comfortable

**Characteristics**:

- Balanced spacing
- Moderate whitespace
- Default layouts
- Readable without cramping

**Intent**: Balance information density and readability

**Evidence**: DENSITY_MAPPING.md Section 2.2

---

### 2.3 Spacious

**Characteristics**:

- Generous whitespace
- Calm layouts
- Fewer elements per screen
- Breathing room

**Intent**: Reduce cognitive load, optimize for touch

**Evidence**: DENSITY_MAPPING.md Section 2.3

---

## 3) Density Rules by Screen Size

### 3.1 Large (Desktop)

**Default density**: Comfortable

**MAY use**:

- Compact (for dense operational views: tables, lists, monitoring)
- Comfortable (for standard views: forms, detail pages)
- Spacious (for focus modes: single-item detail)

**Rationale**: Large screens support denser layouts with precise pointing.

**Evidence**: DENSITY_MAPPING.md Section 3.1

---

### 3.2 Medium (Tablet)

**Default density**: Comfortable

**MAY use**:

- Comfortable (for standard views)
- Spacious (for touch-optimized views)

**SHOULD avoid**:

- Compact (touch targets may be too small)

**Rationale**: Medium screens balance density and touch targets.

**Evidence**: DENSITY_MAPPING.md Section 3.2

---

### 3.3 Small (Mobile Web)

**Default density**: Spacious

**MUST use**:

- Spacious (for all views)

**MAY use**:

- Comfortable (for read-heavy views with minimal interaction)

**MUST NOT use**:

- Compact (touch targets too small)

**Rationale**: Small screens require generous spacing for touch targets.

**Evidence**: DENSITY_MAPPING.md Section 3.2

---

## 4) Density Rules by Screen Purpose

### 4.1 Tables and Lists (Data-Heavy)

**Desktop**:

- Compact to Comfortable
- Maximize visible rows
- Support scanning and comparison

**Tablet**:

- Comfortable
- Balance visibility and touch targets

**Mobile Web**:

- Spacious
- Simplify to essential columns
- Support vertical scrolling

---

### 4.2 Monitoring and Dashboards (Analytics)

**Desktop**:

- Compact to Comfortable
- Maximize visible metrics
- Support at-a-glance monitoring

**Tablet**:

- Comfortable
- Reduce visible metrics if needed

**Mobile Web**:

- Spacious
- Show critical metrics only
- Support vertical scrolling

**Reading over interaction**: Monitoring views prioritize readability over interaction density.

---

### 4.3 Forms and Detail Pages (Input-Heavy)

**Desktop**:

- Comfortable
- Balance input fields and labels
- Support keyboard navigation

**Tablet**:

- Comfortable to Spacious
- Optimize for touch input

**Mobile Web**:

- Spacious
- Large touch targets
- Single-column layouts

---

### 4.4 Settings and Configuration (Complex)

**Desktop**:

- Comfortable
- Support nested sections
- Allow advanced controls

**Tablet**:

- Comfortable to Spacious
- Simplify nested sections

**Mobile Web**:

- Spacious
- Flatten hierarchy
- Hide advanced controls in overflow

---

## 5) Density Rules by Governance State

### 5.1 Normal State

**Use standard density rules** (Sections 3, 4)

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

## 6) Forbidden Density Misuse

### 6.1 Screen Size Violations

**MUST NOT**:

- Use Compact density on mobile web (touch targets too small)
- Use identical density on desktop and mobile web (ignores input method)
- Sacrifice touch target size for information density

**Evidence**: DENSITY_MAPPING.md Section 7.1

---

### 6.2 Purpose Violations

**MUST NOT**:

- Use Compact density for input-heavy forms (reduces usability)
- Use Spacious density for data-heavy tables on desktop (wastes space)
- Sacrifice readability for density in monitoring views

---

### 6.3 Governance State Violations

**MUST NOT**:

- Use Compact density in restricted/suspended states (reduces clarity)
- Sacrifice error message visibility for density
- Hide critical governance messages in cramped layouts

---

### 6.4 Accessibility Violations

**MUST NOT**:

- Use density that violates minimum touch target sizes
- Use density that reduces readability
- Ignore user accessibility preferences (e.g., large text)

**Evidence**: DENSITY_MAPPING.md Section 7.3

---

## 7) Reading Over Interaction Principle

### 7.1 Analytics and Usage Views

**Prioritize readability**:

- Use Comfortable to Spacious density
- Maximize chart/graph visibility
- Reduce interactive controls
- Support scanning and comprehension

**Rationale**: Analytics views are read-heavy, not interaction-heavy.

---

### 7.2 Monitoring Views

**Prioritize at-a-glance readability**:

- Use Compact to Comfortable density (desktop)
- Maximize visible metrics
- Reduce interaction noise
- Support quick scanning

**Rationale**: Monitoring views prioritize information density for quick assessment.

---

## 8) Density Philosophy

### 8.1 Density as Tool

**Density is a tool to**:

- Reduce cognitive load (not increase)
- Support user goals (not designer preferences)
- Adapt to context (not impose uniformity)

**Evidence**: DENSITY_MAPPING.md Section 8.1

---

### 8.2 No Cramped Feeling

**MUST avoid**:

- Cramped layouts
- Insufficient whitespace
- Overwhelming information density

**Rationale**: Bassan is designed for long hours. Cramped layouts increase fatigue.

**Evidence**: DENSITY_MAPPING.md Section 8.2

---

## 9) Acceptance Criteria

This web density rules document is considered ACTIVE and BINDING when ALL of the following are true:

- [x] Conceptual density levels are defined
- [x] Density rules by screen size are explicit
- [x] Density rules by screen purpose are explicit
- [x] Density rules by governance state are explicit
- [x] Forbidden density misuse is documented
- [x] Reading over interaction principle is documented
- [x] Density philosophy is documented
- [x] All evidence links to canonical sources are provided

---

## 10) Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-10  
**Status**: FINAL — BINDING WEB DENSITY RULES  
**Canonical Sources**: DENSITY_MAPPING.md, DESIGN_TOKENS.md
