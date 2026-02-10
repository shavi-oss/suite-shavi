# Theme Policy — platform-admin

## Document Control

| Attribute      | Value                                         |
| -------------- | --------------------------------------------- |
| Platform Name  | Bassan                                        |
| Document Title | THEME_POLICY                                  |
| Repo           | Suite (Layer / Product Repo)                  |
| Module         | platform-admin                                |
| Status         | FINAL — BINDING THEME POLICY                  |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST       |
| Authority      | Brand & UI Constitution — Human-First Edition |
| Effective Date | 2026-02-10                                    |

---

## 1) Purpose

Define the official theme policy for the platform-admin module, including theme intent, usage rules, and accessibility positioning.

**This document does NOT contain**:

- CSS theme variables
- Implementation code
- Component-specific theming

---

## 2) Official Themes

### 2.1 Primary Theme: Light

**Status**: Default theme

**Intent**:

- Optimized for long hours of use
- Soft backgrounds
- Controlled contrast
- Reduces eye strain in typical office lighting

**Usage**:

- Default for all users
- Recommended for sustained work
- Optimized for readability

**Evidence**: Brand & UI Constitution Section 3

---

### 2.2 Secondary Theme: Dark

**Status**: Secondary theme (focus/preference)

**Intent**:

- Alternative for low-light environments
- User preference for focus mode
- Reduced screen brightness

**Usage**:

- User-selectable
- Persistent across sessions
- Maintains brand identity in dark mode

**Evidence**: Brand & UI Constitution Section 3

---

## 3) Theme Intent

### 3.1 Light Theme Intent

**Optimized for**:

- Daytime work
- Well-lit environments
- Sustained reading and data entry
- Collaboration (screen sharing)

**Characteristics**:

- Soft, neutral backgrounds
- Comfortable contrast
- Muted primary color
- No harsh whites

---

### 3.2 Dark Theme Intent

**Optimized for**:

- Low-light environments
- Evening work
- Reduced screen brightness
- User preference for dark interfaces

**Characteristics**:

- Deep, neutral backgrounds
- Controlled contrast (not pure black/white)
- Muted primary color (consistent with light theme)
- No harsh blacks

---

## 4) Theme Usage Rules

### 4.1 Theme Selection

**MUST**:

- Default to Light theme for new users
- Persist user theme preference across sessions
- Apply theme consistently across all views

**MUST NOT**:

- Force theme based on time of day (user choice only)
- Use different themes for different sections
- Break brand identity in either theme

---

### 4.2 Theme Switching

**User-driven switching**:

- User may switch themes at any time
- Theme preference is saved immediately
- No page reload required (conceptual)

**System behavior**:

- Smooth transition between themes
- No jarring color changes
- Preserve user context during switch

**Evidence**: Brand & UI Constitution Section 5 (motion philosophy)

---

## 5) Accessibility Positioning

### 5.1 High-Level Commitment

**Bassan is committed to accessibility**:

- Both themes meet minimum contrast requirements
- Typography is readable in both themes
- Color is not the only means of conveying information
- Motion respects user preferences (reduced motion support)

**Evidence**: Brand & UI Constitution Sections 3, 5

---

### 5.2 Contrast Standards

**MUST**:

- Maintain readable contrast in both themes
- Avoid pure black/white extremes
- Use controlled contrast for long-hour comfort

**MUST NOT**:

- Sacrifice readability for aesthetics
- Use low-contrast text for body content
- Rely solely on color to convey meaning

---

### 5.3 Motion Accessibility

**MUST**:

- Respect user motion preferences
- Provide reduced motion alternative
- Keep motion functional, not decorative

**Evidence**: Brand & UI Constitution Section 5

---

## 6) Theme Consistency

### 6.1 Brand Identity Across Themes

**Both themes MUST**:

- Maintain Bassan brand identity
- Use same muted purple primary color (adapted for theme)
- Follow same spacing, typography, and motion rules
- Feel calm, confident, and premium

**Evidence**: Brand & UI Constitution Sections 1, 3

---

### 6.2 Context-Adaptive Density

**Theme density varies by context** (same in both light and dark):

- **Admin** → Denser, more operational
- **Client** → Calmer, lighter, more spacious

**Evidence**: Brand & UI Constitution Sections 2, 18

---

## 7) Forbidden Patterns

**MUST NOT**:

- Create theme-specific brand identities
- Use harsh pure black or pure white backgrounds
- Force theme based on time of day
- Break accessibility standards in either theme
- Use different motion behavior per theme
- Create theme-specific UI components

---

## 8) Future Theme Considerations

### 8.1 Additional Themes

**Any new theme MUST**:

- Require governance approval
- Maintain Bassan brand identity
- Meet accessibility standards
- Have clear intent and usage rules

**Examples of potential future themes**:

- High contrast (accessibility)
- Colorblind-friendly variants

---

### 8.2 Theme Customization

**User theme customization is NOT in scope**:

- No custom color selection
- No theme mixing
- Official themes only

**Rationale**: Consistency is a feature. Custom themes risk breaking brand identity and accessibility.

**Evidence**: Brand & UI Constitution Section 17

---

## 9) Acceptance Criteria

This theme policy is considered ACTIVE and BINDING when ALL of the following are true:

- [x] Official themes are defined (Light as default, Dark as secondary)
- [x] Theme intent is documented for each theme
- [x] Theme usage rules are explicit
- [x] Theme switching policy is documented (user-driven)
- [x] Accessibility positioning is documented (high-level commitment)
- [x] Theme consistency rules are explicit
- [x] Forbidden patterns are documented
- [x] Future theme considerations are documented
- [x] All evidence links to canonical source are provided

---

## 10) Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-10  
**Status**: FINAL — BINDING THEME POLICY  
**Canonical Source**: Brand & UI Constitution — Human-First Edition
