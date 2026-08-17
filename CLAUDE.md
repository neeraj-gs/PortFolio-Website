# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static portfolio website for a Product Engineer / Full Stack Developer & AI Solutions Engineer. No build tools, bundlers, or package managers — just plain HTML, CSS, and JavaScript. Deployed on Vercel at https://neeraj-gs-portfolio.vercel.app.

## Development

Open `index.html` directly in a browser to preview. No build step or dev server required. (A static server such as `python -m http.server` is handy but not required.)

## Architecture

- **`index.html`** — Single-page site with all sections (home, experience, about, projects, skills, contact)
- **`assets/css/styles.css`** — All styles; CSS custom properties in `:root` drive color, type, spacing, and slab lighting
- **`assets/js/field.js`** — The WebGL background ("the orchestration field"). Builds a 3D agent graph with Three.js and exposes `window.Field` (`setTheme`, `setScroll`)
- **`assets/js/main.js`** — All interactive behavior: boot overlay, custom cursor, mobile nav, scroll progress, active-link tracking, theme toggle, scroll reveals, split-text animation, counters, slab tilt, magnetic controls, Loom lazy-load, video modal, smooth scroll
- **`assets/img/`** — Images; **`assets/videos/`** — Project demo videos
- Three.js r134 is loaded from cdnjs; fonts (Bricolage Grotesque / Inter Tight / JetBrains Mono) and RemixIcon come from CDNs

## Design system — "The Orchestration Field"

The page is one continuous depth-space traversed as a six-stop scroll journey (mirrored by the fixed `.hud` readout). Three strata:

1. **back** — `#field` (WebGL agent graph) plus `.atmos` (bloom, perspective floor grid, vignette). Both are `position: fixed`; section backgrounds are *translucent* so the field reads through the whole page.
2. **mid** — `.panel` decks (Experience, Contact: rounded floating panels with `margin-inline`) and `.slab` cards. The **scene engine** in `main.js` transforms every `.scene` section per frame: entering sections rise out of depth (translate + rotateX + scale), leaving sections lift toward the camera and dissolve. `.scene__num` ghost numerals parallax via the `--p` variable the engine sets.
3. **front** — `[data-depth]` children lifted on Z during tilt; split-type headings.

### Scroll engines (all in `main.js`, sharing one master rAF loop)

- **Scenes** — see above. `.projects` is *not* a `.scene` (the pin lives inside it; transforming an ancestor mid-pin would fight the sticky).
- **Gallery** — `#proj-pin` gets its height set to `100vh + (track width − viewport)`; `.proj-sticky` pins; vertical scroll maps to `translate3d` on `#proj-track`, and each card gets center-distance `rotateY`/scale. Falls back to a vertical stack under 1024px and under reduced motion (CSS `transform: none !important` + JS guard). A `focusin` handler jumps window scroll so keyboard focus lands on-screen.
- **Skills** are *not* an engine: they're a static "instrument deck" — an editorial index (`.skills__row`, category left / keys right) of `.skills__item` keycaps with an extruded `--key-ledge` shadow that press down 3px on hover. A drifting marquee version was built and rejected by Neeraj; don't reintroduce autonomous motion here.

### Key patterns

- **Two-signal color**: `--amber` means human/actionable (CTAs, links, the person); `--flux` (teal) means machine/telemetry (mono labels, tags, the graph). Don't swap them. `--violet` is depth glow only — never text.
- **Theming**: Dark (default) and light, toggled via `data-theme="light"` on `<html>`. An inline script in `<head>` sets it before first paint from `localStorage` (falling back to `prefers-color-scheme`). Light theme is "blueprint paper", not stark white. Overrides live under `:root[data-theme="light"]`; a handful of effects (bloom opacity, grain, dark-artwork logos) need explicit light-theme rules. `main.js` also calls `Field.setTheme()` — the graph swaps to `NormalBlending` on light because additive blending washes out on a pale ground.
- **`html.js` guard**: every reveal's *hidden* state is scoped to `.js` (set by the inline head script). Without JS the content renders plainly visible instead of a page of `opacity: 0`. Keep this guard on any new entrance animation.
- **Slabs must not set a resting `transform`** — it would out-specify the `.reveal-*` / `.stagger` entrance transforms. The tilt script supplies its own `perspective()` while hovering, which is what makes `[data-depth]` children pop.
- **`[data-depth]` only on inset elements.** A child with a visible background that reaches its slab's edge will scale past the rounded corner. Put depth on padded/inset content instead.
- **`.panel` may use `overflow: clip`** (Experience, Contact — no sticky inside). Never clip `.about` (sticky stack) or `.projects` (sticky pin) — overflow on a sticky ancestor breaks the pin.
- **Section numerals are wayfinding, not decoration**: `.scene__num` values match the HUD index (`02`–`06`). Don't number non-sequential content (e.g. the About stack cards are unnumbered on purpose).
- **Split text**: `data-split` (per character) and `data-split-words` (per word) are wired in `main.js`. `.split` must not set `display` — the headings it's applied to are block-level.
- **Project cards**: `data-category` on `.project-card`; Loom videos use `data-src` for hover lazy-load.
- **Responsive**: Mobile-first. Breakpoints at `360px`, `480px`, `576px`, `768px`, `1024px`/`1025px`. Verified down to 320px with no horizontal overflow.
- **Motion budget**: `prefers-reduced-motion` disables the boot overlay, cursor, and all transitions, and renders the field as a single static frame. The field also pauses on tab hide and caps DPR at 1.75.
