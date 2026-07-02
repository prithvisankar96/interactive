# Silence — a macOS desktop-style web app

A single-page, dependency-free web experience that recreates a macOS desktop,
built from the attached walkthrough. Moody grayscale wallpaper, scattered
draggable app icons, real draggable/resizable windows, and a magnifying Dock.
The UI is in English; each artwork keeps its original French title as a
subtitle.

![reference layout: scattered icons + dock](https://img.shields.io/badge/vanilla-HTML%20%C2%B7%20CSS%20%C2%B7%20JS-111)

## Run

No build step. Open `index.html` in any modern browser, or serve the folder:

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

## What it does

- **Boot sequence** → fades into the desktop with a welcome window.
- **Menu bar** — Apple menu + working dropdowns (File, Edit, View, Window,
  Help), a live clock, and status-tray glyphs.
- **Desktop icons** — the six pieces from the walkthrough (*Silent Field*,
  *The Scorned Silences*, *Edge of the Woods*, *Where the Water Sleeps*,
  *Raw Momentum*, *Gentle Revolt*). Drag to reposition; **double-click**
  to open.
- **Windows** — glassy, with traffic-light controls: close, minimize (to Dock),
  and zoom/maximize. Draggable by the title bar, resizable from the edges, with
  focus-based z-ordering and window cascading.
- **Dock** — cosine-curve magnification on hover, tooltips, running-app
  indicators, a separator, launch-bounce, and external links (Instagram, X,
  Behance).
- **Right-click the desktop** for a context menu (new note, tidy icons, change
  wallpaper, about).
- **Keyboard**: `⌘/Ctrl+W` close, `⌘/Ctrl+M` minimize, `Esc` dismiss menus.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Structure: menu bar, desktop, dock, boot screen |
| `styles.css` | Wallpaper, custom hand cursor, glass, dock, windows, animations |
| `app.js` | Window manager, dragging/resizing, dock magnification, menus |

Everything is self-contained — icons are inline SVG, the cursor and wallpaper
are pure CSS, and there are no network or package dependencies.
