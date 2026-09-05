# SketchFlow AI — Repository Analysis

## 1. Current Framework & Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Build tool | Vite | 6.4.3 |
| Language | TypeScript | 5.9.3 |
| UI library | React | 19.2.8 |
| Routing | react-router-dom | 7.18.2 |
| Styling | Vanilla CSS + `@import "tailwindcss"` (not installed) |
| Backend | **None** | — |
| Database | **None** | — |
| Auth | **None** | — |

---

## 2. Current Folder Structure

```
SketchFlow AI/
├── index.html               ← Vite entry
├── package.json
├── tsconfig.json
├── vite.config.ts           ← References plugins NOT installed
├── dist/                    ← Stale build output
├── src/
│   ├── main.tsx             ← React entry (renders <App />)
│   ├── main.ts              ← LEGACY vanilla canvas engine (not used by React)
│   ├── App.tsx              ← Router: /, /login, /signup, /dashboard, /board/:boardId
│   ├── index.css            ← Main CSS (597 lines, comprehensive design system)
│   ├── style.css            ← LEGACY minified CSS for vanilla main.ts
│   ├── types/
│   │   └── index.ts         ← Tool, Point, Shape types
│   ├── components/
│   │   ├── Canvas.tsx       ← SVG canvas renderer (shapes + preview)
│   │   ├── Toolbar.tsx      ← Left tool rail (select/draw/rect/ellipse/arrow/text)
│   │   ├── TopBar.tsx       ← Header with brand, board name input, export
│   │   └── StylePanel.tsx   ← Right sidebar: color picker, stroke width, clear
│   ├── hooks/
│   │   └── useCanvas.ts     ← Drawing state machine (shapes, tool, drawing lifecycle)
│   └── pages/
│       ├── BoardPage.tsx    ← Full whiteboard UI — IMPLEMENTED
│       ├── LandingPage.tsx  ← Placeholder only (logo + tagline + one link)
│       ├── DashboardPage.tsx← Placeholder only ("Phase 10")
│       ├── LoginPage.tsx    ← Placeholder only ("Phase 8")
│       └── SignupPage.tsx   ← Placeholder only ("Phase 8")
```

---

## 3. What Has Been Implemented

### ✅ Phase 1 — Project Setup
- Vite + React + TypeScript project initialized
- React Router with 5 routes configured
- Design system with custom fonts (DM Mono, Fraunces), color tokens, and a warm paper/ink aesthetic

### ✅ Phase 2 — Canvas Foundation (Partial)
- SVG-based canvas with `viewBox="0 0 1200 700"` (fixed, not infinite)
- Dot-grid background pattern
- Zoom controls (0.6× – 1.4× via CSS `scale()`)
- Mini-map placeholder (visual only, not functional)
- Starter card overlay for empty canvas

### ✅ Phase 3 — Drawing Tools (Partial)
- **Freehand draw** — works via path with collected points
- **Rectangle** — drag to create, renders as `<rect>`
- **Ellipse** — drag to create, renders as `<ellipse>`
- **Arrow** — drag to create, renders as `<line>` with arrowhead marker
- **Select** — tool button exists but **does nothing** (no selection logic)
- **Text** — tool button exists but **does nothing** (no text input)
- Style panel with 5 stroke colors + 3 stroke widths
- Keyboard shortcuts: 1-5 for tools, Ctrl+Z for undo

### ✅ Phase 14 — Export (Basic)
- SVG export via `XMLSerializer` → Blob download

---

## 4. What Is Missing

| Phase | Feature | Status |
|-------|---------|--------|
| 2 | Infinite canvas (pan/scroll) | ❌ Fixed 1200×700 viewBox |
| 3 | Diamond shape | ❌ |
| 3 | Line (non-arrow) | ❌ |
| 3 | Pencil vs freehand distinction | N/A (draw = pencil) |
| 3 | Eraser/Delete tool | ❌ |
| 3 | Text tool (functional) | ❌ Button only, no logic |
| 4 | Select & move elements | ❌ |
| 4 | Resize elements | ❌ |
| 4 | Delete selected element | ❌ |
| 4 | Duplicate elements | ❌ |
| 4 | Multi-select | ❌ |
| 5 | Undo/redo (proper history stack) | ⚠️ Undo = `shapes.pop()`, no redo |
| 6 | Backend (Express) | ❌ |
| 7 | Database (PostgreSQL/MongoDB) | ❌ |
| 8 | Authentication (JWT, bcrypt) | ❌ |
| 9 | Board CRUD APIs | ❌ |
| 10 | Dashboard (real UI) | ❌ Placeholder |
| 11 | Canvas persistence | ❌ |
| 12 | Autosave | ❌ |
| 13 | Board sharing | ❌ |
| 14 | PNG/PDF export | ❌ SVG only |
| 15 | Search & board management | ❌ |
| 16 | AI diagram generation | ❌ |
| 1 | Landing page (full sections) | ❌ Placeholder |
| 17 | UI polish | ❌ |
| 18 | Security review | ❌ |

---

## 5. Technical Debt & Problems

> [!WARNING]
> ### Critical: Missing dependencies
> [vite.config.ts](file:///c:/Users/nakul/Desktop/dddeeevvv/SketchFlow%20AI/vite.config.ts) imports `@vitejs/plugin-react` and `@tailwindcss/vite`, but **neither is installed** in `package.json` or `node_modules`. The dev server likely crashes or the React JSX transform is silently broken.

> [!WARNING]
> ### Dead code: [main.ts](file:///c:/Users/nakul/Desktop/dddeeevvv/SketchFlow%20AI/src/main.ts) + [style.css](file:///c:/Users/nakul/Desktop/dddeeevvv/SketchFlow%20AI/src/style.css)
> These are remnants of an earlier **vanilla JS** implementation (DOM manipulation, no React). They are never imported by the React app. [main.tsx](file:///c:/Users/nakul/Desktop/dddeeevvv/SketchFlow%20AI/src/main.tsx) is the real entry point. These files should be removed to avoid confusion.

> [!NOTE]
> ### Tailwind CSS reference but vanilla CSS used
> [index.css](file:///c:/Users/nakul/Desktop/dddeeevvv/SketchFlow%20AI/src/index.css) starts with `@import "tailwindcss"` but the Tailwind Vite plugin is not installed. The entire CSS is hand-written vanilla CSS. The `@import` line should either be removed, or Tailwind should be properly installed.

> [!NOTE]
> ### Shape IDs use string UUIDs in React but number timestamps in legacy code
> [types/index.ts](file:///c:/Users/nakul/Desktop/dddeeevvv/SketchFlow%20AI/src/types/index.ts) uses `id: string` (correct), while [main.ts](file:///c:/Users/nakul/Desktop/dddeeevvv/SketchFlow%20AI/src/main.ts) uses `id: number` (legacy, irrelevant).

> [!NOTE]
> ### Shape type is minimal
> No `background` fill, no `text` content, no `rotation`, no `fill`. Only `stroke` and `width` are tracked. The element model will need to be enriched for text, fill colors, and AI-generated diagrams.

> [!NOTE]
> ### No `@types/react` or `@types/react-dom`
> React 19.2.8 bundles types, so this may not be an issue, but it's worth noting.

---

## 6. Architecture Summary

```
Current state:

     React Frontend (Vite)
          │
     ┌────┴────────────────────────┐
     │ App.tsx (Router)             │
     │   ├── LandingPage  (stub)   │
     │   ├── LoginPage    (stub)   │
     │   ├── SignupPage   (stub)   │
     │   ├── DashboardPage (stub)  │
     │   └── BoardPage ← ONLY REAL PAGE
     │        ├── TopBar            │
     │        ├── Toolbar           │
     │        ├── Canvas            │
     │        ├── StylePanel        │
     │        └── useCanvas hook    │
     └─────────────────────────────┘
            (no backend)
            (no database)
            (no auth)
```

---

## 7. Recommended Next Step

Per the development order, we are partway through **Phase 2–3** (canvas + drawing tools). The core drawing tools work but several fundamental canvas features are incomplete.

### Proposed: Complete Phase 4 — Element Manipulation

**What we'd build:**
1. **Select tool** — click on a shape to select it (visual highlight with selection handles)
2. **Move** — drag a selected shape to reposition it
3. **Delete** — press `Delete`/`Backspace` to remove selected shape
4. **Basic resize** — drag corner handles to resize shapes (rectangles, ellipses)

**But first**, I recommend a small **housekeeping step** to fix the broken build:
1. Install missing `@vitejs/plugin-react` and `@tailwindcss/vite` (or remove the Tailwind reference)
2. Remove dead files: `main.ts` and `style.css`
3. Verify `npm run dev` works cleanly

> [!IMPORTANT]
> **Should I start with the housekeeping fixes**, or would you prefer to jump directly to a specific phase? Also — do you want to keep Tailwind CSS or stay with vanilla CSS? Your spec says Tailwind, but the existing code is entirely hand-written vanilla CSS.
