# SlotNest UI Design System (Current)

## Scope
This document describes the UI design rules currently implemented in the frontend.

## Design Intent
- Light, soft, and calm booking experience.
- High readability for time-slot scanning.
- Clear action hierarchy for booking flow.

## Color Tokens
Defined in `frontend/src/index.css`.

- `--sn-bg: #F8F6F4`
- `--sn-surface: #FFFFFF`
- `--sn-card: #FFFFFF`
- `--sn-border: #E9E4DE`
- `--sn-primary: #C58A95`
- `--sn-primary-hover: #B77985`
- `--sn-primary-soft: #F6ECEE`
- `--sn-action: #E89A5A`
- `--sn-action-hover: #D9853F`
- `--sn-action-focus: rgba(232, 154, 90, 0.22)`
- `--sn-text: #32302E`
- `--sn-text-body: #4B4743`
- `--sn-text-sub: #7B7773`
- `--sn-hover: #FFF8F4`
- `--sn-surface-soft: #F3EEE8`

## Typography
- Base font: `Manrope`, fallback to `Noto Sans TC` and system Chinese fonts.
- Heading weight: `600`.
- Utility classes:
  - `.page-title`: `24px`
  - `.section-title`: `18px`
  - `.text-main`: `16px`
  - `.text-sub`: `14px`

## Spacing
- Main page container (`UserLayout`/`AdminLayout`):
  - `max-width: 980px`
  - `padding: 32px`
  - vertical section gap: `20px`
- Booking toolbar (`.booking-toolbar`):
  - `padding: 20px`
- Cards and slot rows:
  - standard internal padding: `16px`

## Header Pattern
Implemented in:
- `frontend/src/app/layout/UserLayout.tsx`
- `frontend/src/app/layout/AdminLayout.tsx`

Current rules:
- Height: `64px`
- Background: `var(--sn-surface)`
- Bottom border: `1px solid var(--sn-border)`

## Component Rules
Implemented in `frontend/src/index.css` and shared UI components.

- Card (`.sn-card`)
  - radius: `12px`
  - border: `var(--sn-border)`
  - background: `var(--sn-card)`
- Primary button (`.sn-button-primary`)
  - background: `var(--sn-action)`
  - hover: `var(--sn-action-hover)`
  - radius: `4px`
- Ghost button (`.sn-button-ghost`)
  - background: `var(--sn-surface-soft)`
  - text: `var(--sn-text-sub)`
  - radius: `4px`
- Input (`.sn-input`)
  - radius: `8px`
  - focus ring uses `--sn-action-focus`

## Status and Feedback
- Alert component uses token-based palette in `frontend/src/shared/ui/Alert.tsx`:
  - Error: `--sn-error-*`
  - Info: `--sn-info-*`
  - Success: `--sn-success-*`
- Home page keeps a fixed feedback area below toolbar to reduce layout shift:
  - `min-height: 48px`

## Booking Page Interaction Notes
Implemented in `frontend/src/pages/HomePage.tsx`.

- Weekly navigation + quick mode toggle in toolbar.
- Slot row shows one primary action (`預約`) only.
- Booking confirmation uses custom modal (not native `window.confirm`).
- On booking conflict (`INTERVAL_ALREADY_BOOKED`), list is refreshed automatically.

## Motion
- Uses subtle fade-in (`@keyframes sn-fade-in`) for cards and slot rows.
- No large movement animations.
