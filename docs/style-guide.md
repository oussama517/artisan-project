# Style Guide — Artisan Marketplace

## Design Tokens

### Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary-500` | `#6C63FF` | Primary actions, links, accents |
| `--color-primary-700` | `#4338CA` | Hover states, dark accents |
| `--color-accent-500` | `#FF6B6B` | Alerts, destructive, notifications |
| `--color-success-500` | `#10B981` | Success states, completed |
| `--color-warning-500` | `#F59E0B` | Pending states, caution |
| `--color-neutral-900` | `#0F172A` | Primary text |
| `--color-neutral-500` | `#64748B` | Secondary text |
| `--color-neutral-200` | `#E2E8F0` | Borders, dividers |

### Typography
- **Display**: Outfit (700–800), used for headings
- **Body**: Inter (300–600), used for body text and UI
- **Scale**: xs(12) → sm(14) → base(16) → lg(18) → xl(20) → 2xl(24) → 3xl(30) → 4xl(36)

### Spacing
- Scale: 4px (--space-1) → 8 → 12 → 16 → 20 → 24 → 32 → 40 → 48 → 64 → 80 → 96

### Border Radius
- `--radius-sm`: 6px (small elements)
- `--radius-lg`: 12px (inputs, buttons)
- `--radius-xl`: 16px (cards)
- `--radius-2xl`: 24px (modals, search bar)
- `--radius-full`: round (avatars, badges)

### Shadows
- `--shadow-sm`: subtle lift
- `--shadow-md`: card hover
- `--shadow-lg`: elevated panels
- `--shadow-xl`: modals, popovers
- `--shadow-glow`: primary glow effect

## Component Library

### Buttons
- `.btn-primary` — gradient primary, glow shadow
- `.btn-secondary` — outlined, neutral border
- `.btn-accent` — coral gradient for important actions
- `.btn-ghost` — transparent for navigation
- Sizes: `.btn-sm`, default, `.btn-lg`, `.btn-icon`

### Cards
- `.card` — white surface, 1px border, rounded-xl
- `.card-hover` — animate lift on hover (translateY -4px)
- `.card-body` — padded content area

### Forms
- `.form-input` — 2px border, focus glow ring
- `.form-select` — custom dropdown arrow
- `.form-textarea` — auto-resize ready
- `.form-error` — animated slide-down error text

### Rating Stars
- `.rating` — inline flex container
- `.rating-star.filled` — golden color (#FBBF24)

### Badges
- `.badge-primary/success/warning/danger/neutral`

### Skeletons
- `.skeleton` — shimmer animation
- `.skeleton-text/title/avatar/card` — preset shapes

## Animations
All use CSS transforms for GPU acceleration:
- `fadeIn`, `fadeInUp`, `fadeInDown` — page entry
- `slideInRight` — toasts
- `modalIn` — modals with spring curve
- `shimmer` — skeleton loaders
- `pulse` — notification badge
- `.stagger` — cascading child delays

## Responsive Breakpoints
- Desktop: > 1024px (full grid)
- Tablet: 768–1024px (2-col grid, hidden sidebar)
- Mobile: < 768px (1-col grid, simplified nav)
