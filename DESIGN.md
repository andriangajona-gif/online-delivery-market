# Design Brief

## Direction

Satul Meu — a warm, homely "village grocery run" storefront: cream paper, forest-green ink, terracotta action.

## Tone

Friendly editorial — like a well-made local shop flyer, not a corporate supermarket app.

## Differentiation

Four store entry cards as colored illustrated tiles with a hand-drawn feel, framed by a cream paper canvas and a Telegram-first promise.

## Color Palette

| Token      | OKLCH            | Role                              |
| ---------- | ---------------- | --------------------------------- |
| background | 0.972 0.014 85   | warm cream page canvas            |
| foreground | 0.245 0.042 158  | forest-green ink for all text     |
| card       | 0.995 0.006 85   | near-white card surface           |
| primary    | 0.545 0.152 40   | terracotta CTAs, active states    |
| accent     | 0.775 0.135 82   | honey-gold highlights, badges     |
| muted      | 0.928 0.022 82   | section bands, input backgrounds  |

## Typography

- Display: Bricolage Grotesque — hero headline, section headings, store names
- Body: Figtree — paragraphs, labels, forms, buttons
- Mono: Geist Mono — prices and order numbers only
- Scale: hero `text-4xl md:text-6xl font-bold tracking-tight`, h2 `text-2xl md:text-4xl font-bold tracking-tight`, label `text-xs font-semibold tracking-[0.18em] uppercase`, body `text-base md:text-lg`

## Elevation & Depth

Flat cream base with layered warm shadows (`shadow-card`, `shadow-elevated`) and 1px warm borders; depth comes from surface tint, never from glow.

## Structural Zones

| Zone    | Background              | Border      | Notes                                        |
| ------- | ----------------------- | ----------- | -------------------------------------------- |
| Header  | `bg-card/95` + backdrop | `border-b`  | sticky, wordmark left, cart pill right       |
| Content | `bg-background`         | —           | alternate bands with `bg-muted/40`           |
| Footer  | `bg-muted/60`           | `border-t`  | delivery note + Telegram hint                |

## Spacing & Rhythm

Sections breathe at `py-16 md:py-24`; groups use 8/12/16px micro-gaps; card grids `gap-4 md:gap-6`.

## Component Patterns

- Buttons: pill (`rounded-full`), terracotta primary, forest-green secondary, hover lifts 1px + darker fill
- Cards: `rounded-2xl`, `bg-card`, `border-border`, `shadow-card`, hover `shadow-elevated`
- Badges: small pill, `bg-accent/20 text-accent-foreground` for delivery time and status

## Motion

- Entrance: `animate-fade-up` on hero and card grid, 0.5s ease-out, staggered by index
- Hover: 200ms lift and shadow change via `transition-smooth`
- Decorative: none beyond subtle fade — keep it calm and trustworthy

## Constraints

- Romanian copy, prices in lei with comma decimals
- Semantic tokens only — no hex, no arbitrary color classes
- Mobile-first; store grid 1 col → 2 col → 4 col
- No purple gradients, no neon glow, no heavy glassmorphism

## Signature Detail

The four store tiles: each store owns a flat color band (green, red, amber, teal) with a simple line icon, making the catalog instantly scannable.
