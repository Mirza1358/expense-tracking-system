# DESIGN.md — Expense Tracker

Design system for AI agents and contributors. Inspired by [Revolut](https://getdesign.md/) (fintech precision), [Linear](https://getdesign.md/) (minimal density), [Wise](https://getdesign.md/) (clear green money UX), and [Vercel](https://getdesign.md/) (Geist typography).

## Principles

1. **Clarity over decoration** — every surface earns its place; numbers are always tabular.
2. **Instant feedback** — actions close UI immediately; async work shows toast progress.
3. **Dark-first fintech** — void canvas, elevated surfaces, one confident accent.
4. **No purple gradients** — no generic AI aesthetic.

## Color tokens

| Token | Dark | Light | Usage |
|-------|------|-------|-------|
| `--canvas` | `#09090b` | `#fafafa` | Page background |
| `--surface` | `#111113` | `#ffffff` | Cards, sidebar |
| `--surface-raised` | `#18181b` | `#f4f4f5` | Inputs, hover |
| `--border` | `rgba(255,255,255,0.08)` | `#e4e4e7` | Dividers |
| `--text-primary` | `#fafafa` | `#09090b` | Headings, amounts |
| `--text-secondary` | `#a1a1aa` | `#71717a` | Labels, meta |
| `--accent` | `#00dc82` | `#059669` | CTAs, positive money |
| `--accent-muted` | `rgba(0,220,130,0.12)` | `rgba(5,150,105,0.1)` | Active nav, badges |
| `--danger` | `#f43f5e` | `#e11d48` | Delete, over-budget |

## Typography

- **Sans:** Geist Sans — UI, labels, body
- **Mono:** Geist Mono — amounts, dates, IDs (`tabular-nums`)
- **Page title:** `text-2xl font-semibold tracking-tight`
- **Section label:** `text-xs font-medium uppercase tracking-wider text-secondary`
- **Amount:** `font-mono text-lg font-semibold tabular-nums`

## Spacing & radius

- **Page padding:** `p-6 lg:p-8`
- **Card padding:** `p-5 lg:p-6`
- **Gap between sections:** `space-y-6`
- **Radius:** buttons `rounded-xl`, cards `rounded-2xl`, modals `rounded-2xl`

## Components

- **Primary button:** accent fill, subtle shadow glow, `h-10 px-4`
- **Card:** `surface` bg, 1px border, no heavy blur
- **Modal:** raised surface, backdrop `black/70 blur-md`, block dismiss while saving
- **Table:** sticky header, row hover `surface-raised`, zebra optional off
- **Toast:** bottom-right, `toast.promise` for all async CRUD

## Motion

- Page enter: `fade-in 200ms`
- Modal: `slide-up 250ms ease-out`
- Button press: `active:scale-[0.98]`
- No bouncy or spring animations

## Do not

- Use purple/indigo gradients
- Keep modals open during network requests
- Default amount input to `0`
- Show success only after multi-step receipt upload without progress toast
