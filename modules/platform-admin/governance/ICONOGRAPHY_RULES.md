# Iconography Rules — platform-admin

## Document Control

| Attribute      | Value                                         |
| -------------- | --------------------------------------------- |
| Platform Name  | Bassan                                        |
| Document Title | ICONOGRAPHY_RULES                             |
| Repo           | Suite (Layer / Product Repo)                  |
| Module         | platform-admin                                |
| Status         | FINAL — BINDING ICONOGRAPHY RULES             |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST       |
| Authority      | Brand & UI Constitution — Human-First Edition |
| Effective Date | 2026-02-10                                    |

---

## 1) Purpose

Define iconography philosophy and usage rules for the platform-admin module. Icons are functional tools, not decorative elements.

**This document does NOT contain**:

- SVG code
- Icon set specifications
- Specific icon names or libraries

---

## 2) Icon Philosophy

### 2.1 Icons as Shortcuts

**Icons are shortcuts, not replacements**:

- Icons supplement text, not replace it
- Icons provide visual orientation
- Icons speed recognition for frequent actions

**Icons are NOT**:

- Decorative elements
- Replacements for clear labels
- Standalone communication (except universally recognized actions)

**Evidence**: Brand & UI Constitution Section 7

---

### 2.2 Functional, Not Decorative

**Icons MUST**:

- Serve a functional purpose
- Aid navigation or action recognition
- Reduce cognitive load

**Icons MUST NOT**:

- Add visual noise
- Require interpretation
- Replace clear text labels without good reason

**Evidence**: Brand & UI Constitution Sections 1, 7

---

## 3) Consistency Rules

### 3.1 Stroke and Weight

**MUST maintain consistent**:

- Stroke weight across all icons
- Visual weight (no heavy/light mixing)
- Corner radius (sharp vs. rounded)

**Rationale**: Inconsistent icon styles create visual noise and reduce professionalism.

---

### 3.2 Size and Scale

**MUST maintain consistent**:

- Icon sizes within same context
- Optical alignment (visual centering)
- Padding and spacing around icons

**Rationale**: Consistent sizing creates visual rhythm and reduces cognitive load.

---

### 3.3 Style Consistency

**MUST use**:

- Single icon style (outline OR filled, not mixed)
- Consistent level of detail
- Consistent metaphors (e.g., trash for delete, not X)

**Rationale**: Mixed styles feel unprofessional and confuse users.

---

## 4) Icon Usage Rules

### 4.1 When to Use Icons

**DO use icons for**:

- Navigation items (with text labels)
- Common actions (save, delete, edit, close)
- Status indicators (success, warning, error)
- Visual shortcuts for frequent operations

**Evidence**: Brand & UI Constitution Section 7

---

### 4.2 When NOT to Use Icons

**DO NOT use icons for**:

- Rare or unfamiliar actions (use text only)
- Complex concepts requiring explanation
- Decoration or visual filler
- Replacing clear text when space is available

**Rationale**: Icons without clear meaning increase cognitive load.

---

### 4.3 Icon + Text Pairing

**MUST pair icons with text for**:

- Navigation items
- Primary actions
- Unfamiliar operations
- First-time user experiences

**MAY use icons alone for**:

- Universally recognized actions (close, search, menu)
- Repeated actions in dense interfaces (admin views)
- Space-constrained contexts (mobile, toolbars)

**MUST provide**:

- Tooltip or accessible label for icon-only buttons
- Clear hover state to indicate interactivity

---

## 5) Semantic Meaning

### 5.1 Icon Semantics

**Icons MUST have clear semantic meaning**:

- Trash/Delete → Remove permanently
- Pencil/Edit → Modify existing item
- Plus/Add → Create new item
- Check/Success → Confirmation or completion
- X/Close → Dismiss or cancel
- Warning → Caution or attention needed
- Error → Failure or problem

**Rationale**: Consistent semantics reduce learning curve and errors.

---

### 5.2 Avoid Ambiguity

**MUST NOT**:

- Use same icon for different actions
- Use different icons for same action
- Use obscure or metaphorical icons without labels

**Rationale**: Ambiguous icons cause confusion and errors.

---

## 6) Accessibility Rules

### 6.1 Icon Accessibility

**MUST**:

- Provide accessible labels for all icons
- Ensure icons meet contrast requirements
- Support screen readers with proper ARIA labels

**MUST NOT**:

- Rely solely on icon color to convey meaning
- Use icons as only means of communication (pair with text or tooltip)

**Evidence**: Brand & UI Constitution Section 3 (contrast)

---

### 6.2 Interactive Icons

**MUST**:

- Provide clear hover/focus states
- Ensure adequate touch target size
- Indicate interactivity visually

**MUST NOT**:

- Use icons that look interactive but are not
- Use tiny icons for primary actions

---

## 7) Icon Density by Context

### 7.1 Admin Context

**Admin UI MAY use**:

- Higher icon density
- Icon-only buttons (with tooltips)
- Icons in tables and lists

**Rationale**: Admin users are frequent users who benefit from visual shortcuts.

**Evidence**: Brand & UI Constitution Section 2 (context-adaptive density)

---

### 7.2 Client Context

**Client UI SHOULD use**:

- Lower icon density
- Icon + text pairing
- Fewer icons overall

**Rationale**: Client users may be less frequent and benefit from explicit labels.

**Evidence**: Brand & UI Constitution Section 18 (client experience safeguards)

---

## 8) Forbidden Patterns

**MUST NOT**:

- Use decorative icons without function
- Mix icon styles (outline + filled)
- Use icons without accessible labels
- Replace clear text with obscure icons
- Use inconsistent stroke weights or sizes
- Use icons as only means of communication (except universal actions)
- Add icons for visual filler

**Evidence**: Brand & UI Constitution Sections 1, 7, 16

---

## 9) Icon Selection Criteria

**Before adding an icon, verify**:

1. **Does it reduce mental effort?** (not add cognitive load)
2. **Does it repeat often?** (frequent actions benefit from icons)
3. **Is it universally recognized OR paired with text?**

**If not → use text only**.

**Evidence**: Brand & UI Constitution Section 16 (design governance)

---

## 10) Acceptance Criteria

This iconography rules document is considered ACTIVE and BINDING when ALL of the following are true:

- [x] Icon philosophy is explicit (shortcuts, not replacements)
- [x] Consistency rules are documented (stroke, weight, style)
- [x] Usage rules are explicit (when to use, when not to use)
- [x] Semantic meaning is documented
- [x] Accessibility rules are explicit
- [x] Icon density by context is documented
- [x] Forbidden patterns are explicit
- [x] Icon selection criteria are documented
- [x] All evidence links to canonical source are provided

---

## 11) Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-10  
**Status**: FINAL — BINDING ICONOGRAPHY RULES  
**Canonical Source**: Brand & UI Constitution — Human-First Edition
