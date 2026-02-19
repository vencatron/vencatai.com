# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

VencatAI Portfolio Site - a showcase of AI-powered work including videos, custom websites, Next.js applications, and AI-generated images/infographics.

## Directory Structure

- **/** (root) - Main portfolio site (React + Vite + Tailwind)
- **fire-splash/** - ScrapR marketing site (separate project, see its own README)

## Development Commands

### Showcase (Main Portfolio)
```bash
npm install          # Install dependencies
npm run dev          # Start Vite dev server (http://localhost:5173)
npm run build        # Production build to dist/
npm run preview      # Preview production build
```

## Architecture

**Tech Stack:** React 18 + Vite 6 + Tailwind CSS 3 + Lucide Icons

**Project Structure (src/):**
- `main.jsx` → Entry point
- `App.jsx` → Main layout with all sections
- `components/` → Reusable components:
  - `Header.jsx` → Fixed navbar with mobile menu
  - `Hero.jsx` → Landing section with animated background
  - `SectionNav.jsx` → Sticky section navigation
  - `AIVideos.jsx` → AI-generated video showcase
  - `CustomWebsites.jsx` → Custom website portfolio
  - `NextJsApps.jsx` → Next.js application showcase
  - `ImagesInfographics.jsx` → Visual content gallery
  - `Tile.jsx` → Reusable tile components (VideoTile, WebsiteTile, ImageTile)
  - `Footer.jsx` → Footer with social links

**Key Features:**
- Glassmorphism design with cyber color palette
- Fully responsive (mobile-first)
- Smooth scroll navigation
- Animated backgrounds with floating orbs
- Modern glass-effect cards with hover states

## Adding Content

Each section component has a placeholder data array at the top. To add real content:

1. **Videos (AIVideos.jsx):** Add objects with `title`, `description`, `thumbnail` (URL), `url` (video link), `duration`
2. **Websites (CustomWebsites.jsx):** Add objects with `title`, `description`, `thumbnail`, `url`, `domain`, `tags`
3. **Apps (NextJsApps.jsx):** Same as websites
4. **Images (ImagesInfographics.jsx):** Add objects with `title`, `image` (URL), `url` (optional link), `category`

## Deployment

Deploys to Vercel. The `vercel.json` handles SPA routing.

## Color Palette

- `cyber-cyan`: #00f5ff
- `cyber-purple`: #a855f7
- `cyber-pink`: #ec4899
- Background: slate-950 (#0a0a0f)
