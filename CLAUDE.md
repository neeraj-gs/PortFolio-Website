# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static portfolio website for a Full Stack Developer & AI Solutions Engineer. No build tools, bundlers, or package managers — just plain HTML, CSS, and JavaScript. Deployed on Vercel at https://neeraj-gs-portfolio.vercel.app.

## Development

Open `index.html` directly in a browser to preview. No build step or dev server required.

## Architecture

- **`index.html`** — Single-page site with all sections (home, experience, about, projects, skills, contact)
- **`assets/css/styles.css`** — All styles; uses CSS custom properties (`:root` variables) for theming, colors, typography, and spacing. Dark/light theme via `.dark-theme` class on `<body>`
- **`assets/js/main.js`** — All interactive behavior: mobile nav toggle, dark/light theme (persisted in localStorage), scroll-based active link highlighting, project category filtering, Loom video lazy-load on hover, and video modal
- **`assets/js/scrollreveal.min.js`** — Vendored ScrollReveal library for scroll animations
- **`assets/img/`** — Images; **`assets/videos/`** — Project demo videos

## Key Patterns

- **Theming**: CSS custom properties are redefined inside `.dark-theme` selector in `styles.css`. Theme toggle state stored in `localStorage` keys `selected-theme` and `selected-icon`.
- **Project cards**: Filtered by `data-category` attribute on `.project-card` elements. Filter buttons use `data-filter`. Videos use `data-src` for lazy loading.
- **External services**: RemixIcons (CDN), EmailJS for contact form, ScrollReveal for animations.
- **Responsive breakpoints**: Mobile-first; main desktop breakpoint at `1150px`. Additional breakpoints at `576px`, `768px`, `1024px`.
