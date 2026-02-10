# Design Tokens — platform-admin

## Document Control

| Attribute      | Value                                         |
| -------------- | --------------------------------------------- |
| Platform Name  | Bassan                                        |
| Document Title | DESIGN_TOKENS                                 |
| Repo           | Suite (Layer / Product Repo)                  |
| Module         | platform-admin                                |
| Status         | FINAL — BINDING TOKEN CONCEPTS                |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST       |
| Authority      | Brand & UI Constitution — Human-First Edition |
| Effective Date | 2026-02-10                                    |

---

## 1) Purpose

Define conceptual design tokens for the platform-admin module. This document establishes semantic meaning and intent, NOT implementation values.

**This document does NOT contain**:

- CSS variables
- Hex color codes
- Pixel or rem values
- Font family names
- Implementation code

---

## 2) Color Tokens

### 2.1 Semantic Color Roles

**Primary**:

- Role: Brand identity, primary actions, active states
- Character: Muted Purple
- Intent: Neutral, non-aggressive, supports long usage

**Background**:

- Role: Page and surface backgrounds
- Character: Soft, low contrast
- Intent: Reduce eye strain, support long hours

**Foreground**:

- Role: Text and primary content
- Character: Controlled contrast against background
- Intent: Readable without harshness

**Surface**:

- Role: Cards, panels, elevated elements
- Character: Subtle elevation from background
- Intent: Visual hierarchy without hard edges

**Border**:

- Role: Dividers, outlines, boundaries
- Character: Soft, low contrast
- Intent: Structure without visual noise

**Accent**:

- Role: Highlights, notifications, important states
- Character: Contextual (success, warning, error)
- Intent: Clear communication without alarm

**Evidence**: Brand & UI Constitution Section 3

---

### 2.2 Color Philosophy

**Principles**:

- Soft backgrounds
- Controlled contrast
- No harsh color jumps
- Muted primary (non-aggressive)

**Evidence**: Brand & UI Constitution Section 3

---

## 3) Typography Tokens

### 3.1 Typographic Roles

**Heading**:

- Role: Page titles, section headers
- Intent: Hierarchy, orientation

**Subheading**:

- Role: Subsection titles, group labels
- Intent: Structure, grouping

**Body**:

- Role: Primary content, descriptions
- Intent: Readability, comfort

**Label**:

- Role: Form labels, input hints
- Intent: Clarity, guidance

**Caption**:

- Role: Secondary information, metadata
- Intent: Context without distraction

**Code**:

- Role: Technical content, identifiers
- Intent: Distinction, monospace clarity

**Evidence**: Brand & UI Constitution Section 13

---

### 3.2 Typography Philosophy

**Principles**:

- Human tone
- Simple sentences
- Friendly but professional
- Calm expert voice

**Evidence**: Brand & UI Constitution Section 13

---

## 4) Spacing Tokens

### 4.1 Spacing Scale (Conceptual)

**Compact**:

- Role: Tight grouping, dense layouts
- Context: Admin UI, operational views

**Comfortable**:

- Role: Balanced spacing, default layouts
- Context: Standard views

**Spacious**:

- Role: Generous whitespace, calm layouts
- Context: Client UI, focus modes

**Evidence**: Brand & UI Constitution Sections 2, 18

---

### 4.2 Spacing Philosophy

**Principles**:

- Context-adaptive density
- Admin → denser
- Client → more spacious
- No cramped feeling

**Evidence**: Brand & UI Constitution Section 18

---

## 5) Radius Tokens

### 5.1 Corner Radius (Conceptual)

**Sharp**:

- Role: Minimal rounding, precise edges
- Intent: Clarity, structure

**Soft**:

- Role: Gentle rounding, approachable edges
- Intent: Calm, friendly

**Rounded**:

- Role: Pronounced rounding, distinct elements
- Intent: Emphasis, separation

---

### 5.2 Radius Philosophy

**Principles**:

- Soft edges support long hours
- No harsh corners
- Consistency across elements

**Evidence**: Brand & UI Constitution Section 3

---

## 6) Elevation Tokens

### 6.1 Elevation Levels (Conceptual)

**Flat**:

- Role: Base surface, no elevation
- Intent: Grounded, stable

**Raised**:

- Role: Cards, panels, slight elevation
- Intent: Hierarchy, grouping

**Floating**:

- Role: Modals, popovers, overlays
- Intent: Temporary, focused

---

### 6.2 Elevation Philosophy

**Principles**:

- Subtle elevation (no dramatic shadows)
- Functional, not decorative
- Attached to surface, not floating above

**Evidence**: Brand & UI Constitution Section 6

---

## 7) Motion Tokens

### 7.1 Motion Duration (Conceptual)

**Quick**:

- Role: Immediate feedback, micro-interactions
- Range: 150–200ms
- Intent: Responsiveness

**Standard**:

- Role: Transitions, state changes
- Range: 150–200ms
- Intent: Orientation

**Evidence**: Brand & UI Constitution Section 5

---

### 7.2 Motion Easing (Conceptual)

**Principles**:

- No bounce
- No exaggerated easing
- Smooth, natural

**Evidence**: Brand & UI Constitution Section 5

---

### 7.3 Motion Philosophy

**Motion is functional, not decorative**:

- Duration: 150–200ms
- No bounce
- No exaggerated easing
- No sound
- Motion guides orientation only

> Motion should feel like breathing — not talking.

**Evidence**: Brand & UI Constitution Section 5

---

## 8) Forbidden Patterns

**MUST NOT**:

- Use harsh, high-contrast colors
- Use aggressive or saturated primary colors
- Use dramatic shadows or elevation
- Use bounce or exaggerated easing
- Use motion for decoration
- Use inconsistent spacing scales

**Evidence**: Brand & UI Constitution Sections 3, 5, 6

---

## 9) Acceptance Criteria

This design tokens document is considered ACTIVE and BINDING when ALL of the following are true:

- [x] Color tokens are defined semantically (NO hex values)
- [x] Typography tokens are defined by role (NO font families or sizes)
- [x] Spacing tokens are defined conceptually (NO pixel values)
- [x] Radius tokens are defined conceptually (NO pixel values)
- [x] Elevation tokens are defined conceptually (NO shadow values)
- [x] Motion tokens are defined philosophically (NO CSS animations)
- [x] All token philosophies are documented
- [x] Forbidden patterns are explicit
- [x] All evidence links to canonical source are provided

---

## 10) Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-10  
**Status**: FINAL — BINDING TOKEN CONCEPTS  
**Canonical Source**: Brand & UI Constitution — Human-First Edition
