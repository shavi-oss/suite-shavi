# Density Mapping — platform-admin

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Platform Name  | Bassan                                  |
| Document Title | DENSITY_MAPPING                         |
| Repo           | Suite (Layer / Product Repo)            |
| Module         | platform-admin                          |
| Status         | FINAL — BINDING DENSITY MAPPING         |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | DESIGN_TOKENS.md, BRAND_IDENTITY.md     |
| Effective Date | 2026-02-10                              |

---

## 1) Purpose

Define density levels and their mapping across platforms (desktop/mobile) and contexts (admin/client).

**This document does NOT contain**:

- Specific spacing values
- CSS grid systems
- Component layouts

---

## 2) Density Levels

### 2.1 Compact

**Characteristics**:

- Tight grouping
- Minimal whitespace
- Dense layouts
- More information per screen

**Intent**:

- Maximize information density
- Support operational workflows
- Reduce scrolling for frequent tasks

**Evidence**: DESIGN_TOKENS.md Section 4.1

---

### 2.2 Comfortable

**Characteristics**:

- Balanced spacing
- Moderate whitespace
- Default layouts
- Readable without cramping

**Intent**:

- Balance information density and readability
- Support sustained work
- Default for most views

**Evidence**: DESIGN_TOKENS.md Section 4.1

---

### 2.3 Spacious

**Characteristics**:

- Generous whitespace
- Calm layouts
- Fewer elements per screen
- Breathing room

**Intent**:

- Reduce cognitive load
- Support focus and calm
- Optimize for touch targets (mobile)

**Evidence**: DESIGN_TOKENS.md Section 4.1

---

## 3) Desktop vs Mobile Mapping

### 3.1 Desktop Density

**Default density**: Comfortable

**MAY use**:

- Compact (for dense operational views)
- Comfortable (for standard views)
- Spacious (for focus modes)

**Rationale**: Desktop has larger screens and precise pointing (mouse), allowing denser layouts.

---

### 3.2 Mobile Density

**Default density**: Spacious

**MAY use**:

- Comfortable (for standard views)
- Spacious (for most views)

**MUST NOT use**:

- Compact (touch targets too small)

**Rationale**: Mobile has smaller screens and touch input, requiring larger targets and more whitespace.

**Evidence**: DESIGN_TOKENS.md Section 4.2

---

## 4) Admin vs Client Mapping

### 4.1 Admin Context

**Default density**: Comfortable to Compact

**Characteristics**:

- Denser layouts
- More operational
- More information per screen
- Frequent users benefit from density

**MAY use**:

- Compact (for dense tables, lists)
- Comfortable (for standard forms, views)

**Evidence**: BRAND_IDENTITY.md Section 4.2, DESIGN_TOKENS.md Section 4.2

---

### 4.2 Client Context

**Default density**: Comfortable to Spacious

**Characteristics**:

- Calmer layouts
- Lighter, more spacious
- Fewer controls visible by default
- Less frequent users benefit from clarity

**MAY use**:

- Comfortable (for standard views)
- Spacious (for primary workflows)

**MUST NOT use**:

- Compact (too dense for infrequent users)

**Evidence**: BRAND_IDENTITY.md Section 4.2, DESIGN_TOKENS.md Section 4.2

---

## 5) Combined Mapping Matrix

### 5.1 Desktop Admin

**Recommended density**: Compact to Comfortable

**Rationale**:

- Large screen + precise pointing + frequent users
- Maximize information density
- Support operational workflows

---

### 5.2 Desktop Client

**Recommended density**: Comfortable to Spacious

**Rationale**:

- Large screen + precise pointing + less frequent users
- Balance information and calm
- Support focus and clarity

---

### 5.3 Mobile Admin

**Recommended density**: Comfortable

**Rationale**:

- Small screen + touch input + frequent users
- Balance density and touch targets
- Avoid cramping

**MUST NOT use**: Compact (touch targets too small)

---

### 5.4 Mobile Client

**Recommended density**: Spacious

**Rationale**:

- Small screen + touch input + less frequent users
- Maximize clarity and calm
- Optimize touch targets

**MUST NOT use**: Compact (touch targets too small)

---

## 6) Density Adaptation Rules

### 6.1 Platform-Driven Adaptation

**Desktop → Mobile**:

- Increase whitespace
- Increase touch target sizes
- Reduce information per screen
- Shift from Compact/Comfortable to Comfortable/Spacious

---

### 6.2 Context-Driven Adaptation

**Admin → Client**:

- Increase whitespace
- Reduce visible controls
- Shift from Compact/Comfortable to Comfortable/Spacious

**Rationale**: Client users are less frequent and benefit from calmer, clearer interfaces.

**Evidence**: BRAND_IDENTITY.md Section 4.2

---

## 7) Forbidden Density Misuse

### 7.1 Platform Violations

**MUST NOT**:

- Use Compact density on mobile (touch targets too small)
- Use identical density on desktop and mobile (ignores input method)
- Sacrifice touch target size for information density

---

### 7.2 Context Violations

**MUST NOT**:

- Use Compact density in Client context (too dense for infrequent users)
- Use identical density in Admin and Client (ignores user frequency)
- Sacrifice clarity for information density in Client context

---

### 7.3 Accessibility Violations

**MUST NOT**:

- Use density that violates minimum touch target sizes
- Use density that reduces readability
- Ignore user accessibility preferences (e.g., large text)

---

## 8) Density Philosophy

### 8.1 Density as Tool

**Density is a tool to**:

- Reduce cognitive load (not increase)
- Support user goals (not designer preferences)
- Adapt to context (not impose uniformity)

**Evidence**: BRAND_IDENTITY.md Section 9

---

### 8.2 No Cramped Feeling

**MUST avoid**:

- Cramped layouts
- Insufficient whitespace
- Overwhelming information density

**Rationale**: Bassan is designed for long hours. Cramped layouts increase fatigue.

**Evidence**: DESIGN_TOKENS.md Section 4.2

---

## 9) Acceptance Criteria

This density mapping document is considered ACTIVE and BINDING when ALL of the following are true:

- [x] Density levels are defined (Compact, Comfortable, Spacious)
- [x] Desktop vs Mobile mapping is explicit
- [x] Admin vs Client mapping is explicit
- [x] Combined mapping matrix is documented
- [x] Density adaptation rules are explicit
- [x] Forbidden density misuse is documented
- [x] Density philosophy is documented
- [x] All evidence links to canonical sources are provided

---

## 10) Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-10  
**Status**: FINAL — BINDING DENSITY MAPPING  
**Canonical Sources**: DESIGN_TOKENS.md, BRAND_IDENTITY.md
