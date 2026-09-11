# Spec: Gutsphere Demo v2

Public click-through prototype. Same job as `demo.gutsphere.com`. New demo becomes the live demo later; the old demo is kept as history. Hosting is out of scope.

## Locked decisions

| Decision | Choice |
|---|---|
| Job | Public click-through. Replaces old demo as live; old stays archived. |
| IA | v0.2: Today / Track / Journey / Care / Chat. Plan is not a tab. |
| Persona | One: Bimal / constipation. Data-driven for later packs. |
| Build | Static modular: shared shell + tokens + condition JS. Not Rails. Not a single 500KB HTML. |
| Visual | Pixel-faithful v0.2 layouts and tokens. |
| Chrome | Full-bleed. No fake 9:41 status bar. No phone bezel. Max 430px centered column. |
| Entry | Plan generation → Plan → Today. |
| Depth | Do not paste old segmented bars onto v0.2 screens. Add secondary routes in the v0.2 skin. |
| FAB | None. |
| Hosting | Later. Hash URLs so any static host works. |

## Primary routes

`plan-generation`, `plan`, `today`, `track`, `journey`, `care`, `chat`

Bottom nav is hidden on `plan-generation` and `plan`. Plan opens from Today’s Plan chip, Track “View Plan”, and after generation. Back returns to origin.

## Secondary routes

| Route | Opens from |
|---|---|
| `profile` | Avatar |
| `notifications` | Bell |
| `entry` | Track recent row, Today record result |
| `visit` | Care visit CTA, notification, Journey carry-forward |
| `insight` | Journey synthesis / chapter |

## Design tokens (canonical)

```
--gs-color-canvas: #f6f3ed
--gs-color-surface: #ffffff
--gs-color-text: #11120f
--gs-color-text-muted: #555950
--gs-color-border: #dedfd9
--gs-color-brand-fill: #ef5350
--gs-color-brand-text: #b9363b
--gs-color-brand-soft: #fde9e7
--gs-color-support: #2f6b55
--gs-color-info: #3f627a
--gs-color-care: #8d642f
--gs-color-journey: #695886
--gs-color-critical: #a43e36
```

All screen aliases (`--gtc-*`, `--gts-*`, etc.) must resolve through `--gs-*`.

## Out of scope

- Rails / Hotwire / Stimulus
- Live AI
- Multi-condition packs
- FAB / Pattern tab / old Track-Care-Chat segments
- Deleting the current demo
- Dark mode, i18n, accounts, durable state
- Unapproved v0.3
