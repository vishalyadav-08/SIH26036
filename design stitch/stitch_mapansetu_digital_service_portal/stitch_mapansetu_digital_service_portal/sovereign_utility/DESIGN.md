---
name: Sovereign Utility
colors:
  surface: '#FFFFFF'
  surface-dim: '#cfdaf2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d8e3fb'
  on-surface: '#111c2d'
  on-surface-variant: '#414753'
  inverse-surface: '#263143'
  inverse-on-surface: '#ecf1ff'
  outline: '#727784'
  outline-variant: '#c1c6d5'
  surface-tint: '#005cba'
  primary: '#004e9f'
  on-primary: '#ffffff'
  primary-container: '#0066cc'
  on-primary-container: '#dfe8ff'
  inverse-primary: '#aac7ff'
  secondary: '#3a5f94'
  on-secondary: '#ffffff'
  secondary-container: '#9fc2fe'
  on-secondary-container: '#294f83'
  tertiary: '#7a4200'
  on-tertiary: '#ffffff'
  tertiary-container: '#9d5600'
  on-tertiary-container: '#ffe3cf'
  error: '#B91C1C'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d7e3ff'
  primary-fixed-dim: '#aac7ff'
  on-primary-fixed: '#001b3e'
  on-primary-fixed-variant: '#00458e'
  secondary-fixed: '#d5e3ff'
  secondary-fixed-dim: '#a7c8ff'
  on-secondary-fixed: '#001b3c'
  on-secondary-fixed-variant: '#1f477b'
  tertiary-fixed: '#ffdcc2'
  tertiary-fixed-dim: '#ffb77a'
  on-tertiary-fixed: '#2e1500'
  on-tertiary-fixed-variant: '#6d3a00'
  background: '#f9f9ff'
  on-background: '#111c2d'
  surface-variant: '#d8e3fb'
  success: '#15803D'
  warning: '#B45309'
  page-bg: '#F8FAFC'
  border-subtle: '#CBD5E1'
typography:
  display-heading:
    fontFamily: Noto Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
  display-heading-mobile:
    fontFamily: Noto Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  h1:
    fontFamily: Noto Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.3'
  h1-mobile:
    fontFamily: Noto Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.3'
  h2:
    fontFamily: Noto Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.4'
  h2-mobile:
    fontFamily: Noto Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  h3:
    fontFamily: Noto Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  h4:
    fontFamily: Noto Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Noto Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body:
    fontFamily: Noto Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Noto Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label:
    fontFamily: Noto Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
  caption:
    fontFamily: Noto Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  micro: 4px
  compact: 8px
  standard: 16px
  component: 24px
  section: 32px
  large: 40px
  major: 48px
  hero: 64px
  exceptional: 80px
---

## Brand & Style

This design system is built upon the pillars of **Institutional Trust, Civic Accessibility, and Functional Clarity**. As an official digital interface for the Government of India, the brand personality is stoic, professional, and authoritative. It prioritizes the delivery of information and services over decorative aesthetics, ensuring that every citizen—regardless of digital literacy or physical ability—can navigate the platform with confidence.

The design style follows a **Corporate / Modern** movement, heavily influenced by GIGW 3.0 and UX4G principles. It intentionally avoids "SaaS-like" trends such as glassmorphism, vibrant gradients, or high-motion animations, which can undermine the perceived seriousness of a state utility. Instead, it utilizes a structured, grid-based layout with clear hierarchies, purposeful whitespace, and a high-contrast palette to ensure absolute legibility and task-centric utility.

## Colors

The color strategy is designed for maximum clarity and WCAG 2.1 Level AA compliance. 

- **Primary Blue (#0066CC):** The signature "Government Blue," used for primary actions, links, and active states.
- **Institutional Blue (#003366):** A deep, darker shade reserved for headers and high-level navigation to provide a grounded, formal structure.
- **Accent Saffron (#FF9933):** Used strictly for national identity markers and very specific callouts. It must never be used for primary interactive elements to maintain color-meaning consistency.
- **Neutral / Text:** We use a deep slate for typography to reduce eye strain while maintaining high contrast against the off-white page background.

**Accessibility Note:** Status indicators (Success, Warning, Error) must always be accompanied by descriptive icons and text labels. Color alone is never the sole conveyor of information.

## Typography

This design system uses **Noto Sans** for English and **Noto Sans Devanagari** for Hindi. This choice ensures perfect vertical alignment and legibility across bilingual content, which is a core requirement for GIGW compliance.

**Key Implementation Rules:**
- **Vertical Metrics:** Devanagari characters require more vertical breathing room. Line heights are set to a minimum of 1.5x for body text to prevent vowel markers (matras) from clipping.
- **Bilingual Weighting:** Maintain consistent weights across languages; if English is Bold (700), the corresponding Hindi text must also use the Bold weight of Noto Sans Devanagari.
- **Accessibility:** Users must be able to scale text up to 200% without loss of content or functionality. A global utility bar should provide "A+", "A", and "A-" controls for manual font resizing.

## Layout & Spacing

The design system employs a **12-column fluid grid** for desktop, transitioning to a **4-column grid** for mobile. The rhythm is governed by a strict **8-point spacing system**.

**Layout Principles:**
- **Grid:** Use a 24px gutter on desktop and 16px on mobile. Page margins are set to a minimum of 32px on desktop to provide institutional "breathing room."
- **Breakpoints:**
  - Mobile: 320px - 480px
  - Tablet: 481px - 1024px
  - Desktop: 1025px+
- **Responsive Behavior:** Complex data tables must use an internal horizontal scroll container with a visual indicator, rather than breaking the global page layout.
- **Vertical Rhythm:** All vertical gaps between components must be multiples of 8px. Use `major` (48px) for separating logical sections within a page.

## Elevation & Depth

To maintain a formal and trustworthy appearance, this system utilizes a **Tonal Layering** approach with minimal reliance on shadows. Depth is communicated through structural outlines rather than atmospheric effects.

- **Surface Strategy:** The primary page background is `page-bg` (#F8FAFC). Interactive containers (cards, white-spaces) use `surface` (#FFFFFF).
- **Outlines:** Use 1px solid `border-subtle` (#CBD5E1) to define component boundaries. 
- **Shadows:** Only use a single, restrained shadow tier for floating elements like dropdowns or modals.
  - *Institutional Shadow:* `0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)`. 
- **Focus States:** High-visibility 2px solid primary blue outline with 2px offset for all keyboard-focused elements to meet WCAG 2.1 AA standards.

## Shapes

The shape language is conservative and geometric. We use a **Soft (4px-8px)** roundedness level to balance professional authority with modern accessibility.

- **Small (4px):** Applied to buttons, input fields, and checkboxes.
- **Medium (6px):** Applied to standard UI cards and alerts.
- **Large (8px):** Applied to main container surfaces or modal dialogs.

Touch targets for all interactive elements must be a minimum of **48x48px** on mobile devices to accommodate all users.

## Components

### Buttons
- **Primary:** Solid `primary-blue` background, white text, 4px radius.
- **Secondary:** `primary-blue` 1px border, `primary-blue` text, white background.
- **Disabled:** Light grey background with dark grey text; cursor set to `not-allowed`.

### Input Fields
- Use 1px `border-subtle` with 4px radius. 
- Labels must always be visible (no floating labels that disappear).
- Error states must use a 2px red border and an error icon.

### Cards
- White background, 1px `border-subtle`, 6px radius.
- No hover elevation increase; use a subtle border color change instead to indicate interactivity.

### Chips/Badges
- Rectangular with 4px radius (not pills).
- Use `success`, `warning`, and `error` background tints with high-contrast text for status indicators.

### Global Utility Bar (Mandatory)
- Located above the main header.
- Includes: Language switcher (English/Hindi), Text Resizer (A-, A, A+), Contrast Toggle, and "Skip to Main Content" link.

### State Emblem
- The State Emblem of India must be placed in the top-left of the header, following official branding guidelines for proportion and clear space.