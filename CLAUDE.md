# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static portfolio website for a Product Engineer / Full Stack Developer & AI Solutions Engineer. No build tools, bundlers, or package managers — just plain HTML, CSS, and JavaScript. Deployed on Vercel at https://neeraj-gs-portfolio.vercel.app.

## Development

Open `index.html` directly in a browser to preview. No build step or dev server required. (A static server such as `python -m http.server` is handy but not required.)

## Architecture

- **`index.html`** — Single-page site with all sections (home, experience, about, projects, the edge, skills, contact)
- **`assets/css/styles.css`** — All styles; CSS custom properties in `:root` drive color, type, spacing, and slab lighting
- **`assets/js/field.js`** — The WebGL background ("the orchestration field"). Builds a 3D agent graph with Three.js and exposes `window.Field` (`setScroll`)
- **`assets/js/main.js`** — All interactive behavior: boot overlay, custom cursor, mobile nav, scroll progress, active-link tracking, scroll reveals, split-text animation, counters, ledger playhead, slab tilt, magnetic controls, Loom lazy-load, video modal, smooth scroll
- **`assets/img/`** — Images; **`assets/videos/`** — Project demo videos
- Three.js r134 is loaded from cdnjs; fonts (Bricolage Grotesque / Inter Tight / JetBrains Mono) and RemixIcon come from CDNs

## Design system — "The Orchestration Field"

The page is one continuous depth-space traversed as a seven-stop scroll journey (mirrored by the fixed `.hud` readout). Three strata:

1. **back** — `#field` (WebGL agent graph) plus `.atmos` (bloom, perspective floor grid, vignette). Both are `position: fixed`; section backgrounds are *translucent* so the field reads through the whole page.
2. **mid** — `.panel` decks (Experience, Contact: rounded floating panels with `margin-inline`) and `.slab` cards. A sticky stacking-card deck lived in About and was cut — Neeraj reads overlapping cards as filler; don't reintroduce them. The **scene engine** in `main.js` transforms every `.scene` section per frame: entering sections rise out of depth (translate + rotateX + scale), leaving sections lift toward the camera and dissolve. `.scene__num` ghost numerals parallax via the `--p` variable the engine sets.
3. **front** — `[data-depth]` children lifted on Z during tilt; split-type headings.

### Scroll engines (all in `main.js`, sharing one master rAF loop)

- **Scenes** — see above. `.projects` is *not* a `.scene` (the pin lives inside it; transforming an ancestor mid-pin would fight the sticky).
- **Gallery** — `#proj-pin` gets its height set to `100vh + (track width − viewport)`; `.proj-sticky` pins; vertical scroll maps to `translate3d` on `#proj-track`, and each card gets center-distance `rotateY`/scale. Falls back to a vertical stack under 1024px and under reduced motion (CSS `transform: none !important` + JS guard). A `focusin` handler jumps window scroll so keyboard focus lands on-screen.
- **Edge console** — The Edge section (`#edge`), the page's "why me" argument. 25 disciplines as a five-column index of names + the library each runs on; hovering one writes its full name, library and description into a single fixed `.console__readout` below. Only the pointed-at item spends words, so the whole argument fits one screen. `pointerenter` covers the mouse, `click` covers touch and `focus` covers the keyboard — all three just repaint the readout, and the buttons carry their copy in `data-*` plus a `.disc__desc` that `.js` hides, so the list still reads plainly without scripts. Under 768px the readout is dropped and the descriptions come back inline. An earlier version was a full-height ledger with a sticky rail and a scroll-lit playhead; it was cut for asking three screens of scrolling to say the same thing.
- **Skills** are a curated deck, not an inventory: roughly one line of keycaps per category. An exhaustive 67-key version was built and rejected by Neeraj — "too much does not mean amazing". They're also *not* an engine: a static "instrument deck" — an editorial index (`.skills__row`, category left / keys right) of `.skills__item` keycaps with an extruded `--key-ledge` shadow that press down 3px on hover. A drifting marquee version was built and rejected by Neeraj; don't reintroduce autonomous motion here.

### Key patterns

- **Two-signal color**: `--amber` means human/actionable (CTAs, links, the person); `--flux` (teal) means machine/telemetry (mono labels, tags, the graph). Don't swap them. `--violet` is depth glow only — never text.
- **Theming**: Dark only — there is no light theme or toggle. Don't reintroduce one without an explicit request.
- **`html.js` guard**: every reveal's *hidden* state is scoped to `.js` (set by the inline head script). Without JS the content renders plainly visible instead of a page of `opacity: 0`. Keep this guard on any new entrance animation.
- **Slabs must not set a resting `transform`** — it would out-specify the `.reveal-*` / `.stagger` entrance transforms. The tilt script supplies its own `perspective()` while hovering, which is what makes `[data-depth]` children pop.
- **`[data-depth]` only on inset elements.** A child with a visible background that reaches its slab's edge will scale past the rounded corner. Put depth on padded/inset content instead.
- **`.panel` may use `overflow: clip`** (Experience, Contact — no sticky inside). Never clip `.edge` (sticky ledger rail) or `.projects` (sticky pin) — overflow on a sticky ancestor breaks the pin.
- **Section numerals are wayfinding, not decoration**: `.scene__num` values match the HUD index (`02`–`07`) and `SECTION_ORDER` in `main.js`. Adding or reordering a section means updating both.
- **Split text**: `data-split` (per character) and `data-split-words` (per word) are wired in `main.js`. `.split` must not set `display` — the headings it's applied to are block-level.
- **Project cards**: `data-category` on `.project-card`; Loom videos use `data-src` for hover lazy-load.
- **Counters**: `.counter` renders `data-target` with a trailing `+`. `data-suffix=""` opts a literal count (e.g. the "2 regions live" stat) out of it.
- **Responsive**: Mobile-first. Breakpoints at `360px`, `480px`, `576px`, `768px`, `1024px`/`1025px`. Verified down to 320px with no horizontal overflow.
- **Motion budget**: `prefers-reduced-motion` disables the boot overlay, cursor, and all transitions, and renders the field as a single static frame. The field also pauses on tab hide and caps DPR at 1.75.
