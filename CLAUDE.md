# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vencat ScrapR marketing website - a React SPA for a visual, no-code web scraping tool. Features a distinctive ASCII "DoomFire" animation effect on the homepage. Core value prop: ease of use - point, click, extract.

## Development Commands

```bash
cd fire-splash
npm install          # Install dependencies (uses npm ci via .npmrc)
npm run dev          # Start Vite dev server
npm run build        # TypeScript compile + Vite production build
npm run lint         # ESLint with auto-fix
npm run preview      # Preview production build
```

## Architecture

**Tech Stack:** React 18 + TypeScript + Vite 6 + Tailwind CSS 4 + HeroUI component library

**Project Structure (fire-splash/src/):**
- `main.tsx` → Entry point, wraps app in BrowserRouter + HeroUIProvider
- `App.tsx` → React Router routes
- `provider.tsx` → HeroUI integration with React Router navigation
- `pages/` → Route components (index, docs, pricing, blog, about)
- `components/` → Reusable components including DoomFire animation
- `layouts/default.tsx` → Standard page layout with navbar/footer
- `config/site.ts` → Navigation items and external links
- `components/primitives.ts` → Tailwind Variants style definitions

**Key Patterns:**
- Path alias: `@/*` maps to `./src/*`
- HeroUI components are the primary UI building blocks
- Tailwind Variants (`tv()`) for composable component styles
- Client-side routing only (Vercel configured for SPA rewrites)

**DoomFire Component:** Custom ASCII fire animation using requestAnimationFrame, renders characters (` . : - = + X # & @`) at 240x60 resolution. Accepts `intensity` prop (0-1).

## Code Style

ESLint enforces:
- Import ordering: types → builtins → external → internal → parent → sibling → index
- JSX props sorted alphabetically with callbacks last
- Self-closing components when no children
- Blank lines before returns and after variable declarations
- `no-console` warnings
- JSX accessibility rules (jsx-a11y)

Prettier handles formatting.

## Deployment

Deploys to Vercel. The `vercel.json` rewrites all routes to `/` for SPA routing.
