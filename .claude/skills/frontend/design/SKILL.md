---
paths:
  - "frontend/src/**"
---

# Frontend Design Skill — Pinterest Design System

Use this file when building or reviewing any UI component in `frontend/src/`.
It defines the exact tokens, rules, and component specs to match Pinterest's visual language.

---

## 1. Visual Identity

**Character:** Warm, inspiration-driven canvas. Cozy and craft-like — not corporate.

| Trait | Decision |
|---|---|
| Background | Soft warm white — olive/sand neutrals, never cool steel |
| Brand accent | Pinterest Red `#e60023` — bold, singular, CTAs only |
| Text color | Plum Black `#211922` — near-black with warm plum undertone |
| Border radius | Generous (16px buttons, 20px+ cards) — rounded but never pill |
| Shadows | Minimal — depth comes from warm surfaces and photography |
| Font | Pin Sans exclusively — one family for everything |
| Content density | Photography-first; masonry grid is compact by design |

---

## 2. Color Tokens

### Brand & Interactive

| Role | Value | Usage |
|---|---|---|
| Pinterest Red | `#e60023` | Primary CTA, brand accent |
| Focus Blue | `#435ee5` | Focus rings (`--comp-button-color-border-focus-outer-transparent`) |
| Link Blue | `#2b48d4` | Link text |
| Performance Purple | `#6845ab` | Performance+ features |
| Recommendation Purple | `#7e238b` | AI recommendation labels |
| Facebook Blue | `#0866ff` | Social login button |
| Pressed Blue | `#617bff` | Pressed state |
| Green 700 | `#103c25` | Success / nature accent |
| Green 700 Hover | `#0b2819` | Pressed green |
| Error Red | `#9e0a0a` | Checkbox / form error states |

### Text

| Role | Value | Usage |
|---|---|---|
| Primary text | `#211922` | Body copy, headings — plum black |
| Secondary text | `#62625b` | Descriptions, muted labels — olive gray |
| Disabled / border text | `#91918c` | Warm silver — input borders, disabled |
| On-dark text | `#ffffff` | Text on colored or dark surfaces |
| Button text | `#000000` | Button labels (unusual: black on red) |

### Surface & Border

| Role | Value | Usage |
|---|---|---|
| Page background | `#ffffff` | Default canvas |
| Secondary button | `#e5e5e0` | Warm sand gray |
| Circular button bg | `#e0e0d9` | Action icon buttons |
| Warm badge wash | `hsla(60, 20%, 98%, 0.5)` | Subtle warm badge background |
| Light surface | `#f6f6f3` | Fog (at 50% opacity) |
| Dark section | `#33332e` | Footer / dark panels |
| Hover border | `#bcbcb3` | Hover state borders |
| Disabled border | `#c8c8c1` | Disabled input / control borders |

---

## 3. Typography

**Font family:** `Pin Sans, -apple-system, system-ui, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, …CJK fallbacks`

| Role | Size | Weight | Line Height | Letter Spacing | Notes |
|---|---|---|---|---|---|
| Display Hero | 70px / 4.38rem | 600 | normal | normal | Maximum impact |
| Section Heading | 28px / 1.75rem | 700 | normal | -1.2px | Negative tracking — intimate |
| Body | 16px / 1.00rem | 400 | 1.40 | normal | Standard reading |
| Caption Bold | 14px / 0.88rem | 700 | normal | normal | Strong metadata |
| Caption | 12px / 0.75rem | 400–500 | 1.50 | normal | Tags, small labels |
| Button | 12px / 0.75rem | 400 | normal | normal | Button labels |

**Principles:**
- Compact scale: most UI text is 12–16px; 70px only for display heroes
- No ultra-light weights — 400 minimum; type always feels substantial
- Negative tracking (-1.2px) on 28px headings creates cozy section titles
- Single font family — Pin Sans handles every role

---

## 4. Spacing & Radius

### Spacing scale (base unit: 8px)

`4px · 6px · 7px · 8px · 10px · 11px · 12px · 16px · 18px · 20px · 22px · 24px · 32px · 80px · 100px`

Large jumps (32 → 80 → 100) are for section-level separation only.

### Border radius scale

| Name | Value | Applied to |
|---|---|---|
| Standard | 12px | Small cards, link chips |
| Button / Input | 16px | Buttons, text inputs, medium cards |
| Comfortable | 20px | Feature cards |
| Large | 28px | Large containers |
| Section | 32px | Tab panels, large panel sections |
| Hero | 40px | Hero containers, feature blocks |
| Circle | 50% | Action icon buttons, indicators |

---

## 5. Component Specifications

### Buttons

| Variant | Background | Text | Padding | Radius | Notes |
|---|---|---|---|---|---|
| Primary Red | `#e60023` | `#000000` | `6px 14px` | 16px | Main CTA |
| Secondary Sand | `#e5e5e0` | `#000000` | `6px 14px` | 16px | Secondary action |
| Circular Action | `#e0e0d9` | `#211922` | — | 50% | Icon actions, nav controls |
| Ghost | `transparent` | `#000000` | `6px 14px` | 16px | Tertiary actions |

All buttons: `border: 2px solid rgba(255,255,255,0)` (transparent). Focus via `--sema-color-border-focus-outer-default` ring.

### Inputs

```
background:   #ffffff
border:       1px solid #91918c
border-radius: 16px
padding:      11px 15px
font-size:    16px (Pin Sans)
focus:        semantic border + outline via CSS variables
```

### Cards & Containers

- Photography-first — the image is the primary element
- Border radius: 12–20px on image containers
- No box-shadow on standard cards; elevation from warm surface colors
- 8px thick white border on featured image containers
- White or `#f6f6f3` (fog) background

### Navigation

- Clean header on white / warm background; Pinterest logo + centered search bar
- Pin Sans 16px for nav links
- Pinterest Red accents for active states

### Image Treatment

- Masonry grid with 12–20px rounded corners on pins
- Photography carries the visual interest — UI stays minimal
- Thick white border (8px) on featured / hero images only

---

## 6. Layout System

### Grid philosophy

- **Masonry** for pin content (signature layout) — content density is the value proposition
- Whitespace lives *between* sections, not within the pin grid
- Generous padding on hero/feature sections; dense and immersive within grids

### Breakpoints

| Name | Width | Pin columns | Key changes |
|---|---|---|---|
| Mobile | < 576px | 1 | Compact single-column |
| Mobile Large | 576–768px | 2 | 2-column pin grid |
| Tablet | 768–890px | 3 | Expanded grid |
| Desktop Small | 890–1312px | 4–5 | Standard masonry |
| Desktop | 1312–1440px | 5 | Full layout |
| Large Desktop | 1440–1680px | 6+ | Expanded columns |
| Ultra-wide | > 1680px | Maximum | Maximum grid density |

**Collapsing strategy:**
- Grid: 5+ cols → 3 → 2 → 1
- Navigation: full search + icons → simplified mobile nav
- Feature sections: side-by-side → stacked
- Hero type: 70px scales down proportionally

---

## 7. Token Architecture

Pinterest uses a three-tier CSS variable system:

| Tier | Prefix | Example | Purpose |
|---|---|---|---|
| Base | `--base-*` | `--base-color-green-700` | Raw values — never use directly in components |
| Semantic | `--sema-*` | `--sema-color-border-disabled` | Role-based aliases (what it's for) |
| Component | `--comp-*` | `--comp-button-color-text-transparent-disabled` | Component-specific overrides |

Always prefer `--sema-*` and `--comp-*` over hardcoded hex values for interactive states.

---

## 8. Rules

| ✅ Do | ❌ Don't |
|---|---|
| Use warm neutrals (`#e5e5e0`, `#e0e0d9`, `#91918c`) | Use cool/steel gray neutrals |
| Apply `#e60023` only for primary CTAs | Use red for decorative or secondary purposes |
| Use `#211922` plum black for primary text | Use pure `#000000` as primary text color |
| Border radius 16px on buttons/inputs, 20px+ on cards | Go below 12px on any card or use pill-shapes |
| Keep the pin grid dense — content IS the value | Add heavy whitespace within the masonry grid |
| Use warm badge bg `hsla(60,20%,98%,.5)` for wash | Use cold or opaque badge backgrounds |
| Use Pin Sans at 400+ weight minimum | Introduce a second font or use thin weights |
| Rely on `--sema-*` tokens for interactive states | Hard-code hex values in focus/hover/disabled states |
| Use minimal or no shadows on standard cards | Add heavy drop shadows — depth comes from content |

---

## 9. Agent Quick Reference

### Copy-paste prompts

**Hero section:**
> White background. `70px` Pin Sans weight `600`, plum black `#211922`. Red CTA `#e60023`, `16px` radius, `6px 14px` padding. Secondary sand button `#e5e5e0`, same radius.

**Pin card:**
> White background, `16px` radius, no shadow. Photography fills top, `16px` Pin Sans weight `400` description in `#62625b`.

**Circular action button:**
> `#e0e0d9` background, `50%` radius, `#211922` icon.

**Input field:**
> White background, `1px solid #91918c`, `16px` radius, `11px 15px` padding. Focus via semantic tokens.

**Dark footer:**
> `#33332e` background. Pinterest script logo in white. `12px` Pin Sans links in `#91918c`.

### Iteration checklist

- [ ] Warm olive/sand neutrals everywhere — no cool steel grays
- [ ] Pinterest Red `#e60023` on CTAs only
- [ ] 16px radius on buttons/inputs, 20px+ on cards, never pill-shaped
- [ ] Pin Sans only, 400 weight minimum
- [ ] Photography-first — UI stays warm and minimal
- [ ] Plum black `#211922` for text, never pure black
- [ ] No heavy shadows — depth from warm surfaces and content
