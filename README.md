# nostalgiOS — A Web-Native, Retro-Modern “OS” in the Browser

nostalgiOS is a lightweight, browser-based operating environment that blends early-Mac/90s desktop nostalgia with a polished modern UX. It ships with windowed apps (Explorer, Settings, Help), a right-side Dock and menubar, a terminal, an in-OS browser (sandboxed), and a suite of classic game clones—plus a Spring Boot backend that can persist snapshots locally or to S3. Everything runs on the open web stack (React + Vite + TypeScript + Web APIs), with optional WASM (Pyodide, Bash).

> **Why this project?**
> To explore how far we can push a “desktop-like OS” inside a single web origin—fast boot, rich UX, offline capability, and state that “just comes back” when you reopen the tab—without accounts or friction.

---

## ✨ Key Features

* **Original, retro-inspired desktop UI**
  Right-aligned window controls (−, ☐, ×), no trade-dress of other OSes. Light (default), Aqua-Dark, and High-Contrast themes. Smooth animations, dock bounce, window snapping.

* **State that survives reloads**
  IndexedDB + localStorage snapshotting; optional server snapshots on disk or S3. Reopen and continue where you left off.

* **Games, the 90s way**
  Included: Snake, *Paddle Battle* (pong-like), *Call Break* cards; start/replay screens, score boards, original assets. (Planned: Minefield, Crate Mover, Tile Merge, Space Rocks.)

* **Terminal(s)**
  Fast virtual FS shell (built-in commands). Optional **WASM Bash** mode (lazy-loaded, offline-bundled).

* **In-OS Browser (sandboxed)**
  Tabs + address bar via `<iframe sandbox>` with an allow-list of embeddable sites and a retro “NostalgiNet” homepage. CSP-blocked sites get a clear “Open in new tab” button. (Proxy mode optional later.)

* **Backend APIs (Spring Boot 3 + Java 21)**
  Health endpoints; snapshot store/fetch/delete to **local disk** or **AWS S3** (v2 SDK). H2 for local dev; secure defaults for production.

* **Single-container production**
  Build the SPA with Vite, bake into the Spring Boot jar, run one image. Or use docker-compose for split dev (Vite @5173, API @8080).

---

## 🧭 Table of Contents

* [Architecture](#architecture)
* [Repo Structure](#repo-structure)
* [Prerequisites](#prerequisites)
* [Quick Start (Docker All-in-One)](#quick-start-docker-all-in-one)
* [Dev Workflow (docker-compose)](#dev-workflow-docker-compose)
* [Configuration & Env](#configuration--env)
* [Backend API](#backend-api)
* [Front-End Tech Notes](#front-end-tech-notes)
* [WASM & Python](#wasm--python)
* [Theming & Accessibility](#theming--accessibility)
* [Testing & Quality](#testing--quality)
* [Deployment Options](#deployment-options)
* [Troubleshooting](#troubleshooting)
* [Roadmap](#roadmap)
* [Security & Legal](#security--legal)
* [Credits](#credits)
* [License](#license)

---

## Architecture

```
┌──────────────────────────┐
│  Browser (SPA, PWA-ish)  │  React + Vite + TS
│  • Desktop, Dock, Windows│  IndexedDB/localStorage
│  • Apps: Explorer, Games │  Optional WASM (Pyodide/Bash)
│  • Terminal, Settings    │
└─────────────┬────────────┘
              │ fetch /api/*
              ▼
┌──────────────────────────┐
│ Spring Boot 3 (Java 21)  │  REST APIs
│ • /api/health, /api/ping │  H2 for dev
│ • /api/snap/*            │  S3 (AWS SDK v2) optional
│ Serves SPA static files  │
└─────────────┬────────────┘
              │
              ▼
     ┌──────────────────┐
     │ Storage          │
     │ • /app/data/...  │  (volume)
     │ • S3 bucket      │  (opt-in)
     └──────────────────┘
```

---

## Repo Structure

```
nostalgios/
├─ apps/
│  └─ web-os/
│     ├─ public/
│     │  ├─ wallpapers/               # default.jpg (your default wallpaper)
│     │  ├─ sdk/pyodide/              # local Pyodide bundle (offline)
│     │  └─ assets/games/...          # game sprites, SFX, icons
│     ├─ src/
│     │  ├─ components/               # Desktop, Window, Dock, MenuBar, etc.
│     │  ├─ apps/                     # Explorer, Settings, Help, Browser, Games, Terminal
│     │  ├─ games/                    # Snake, PaddleBattle, CallBreak (and more)
│     │  ├─ os/                       # boot, vfs, wallpaper utils
│     │  ├─ state/                    # Store, types, init (no top-level await)
│     │  ├─ workers/                  # py.worker.ts (loads pyodide via importScripts)
│     │  ├─ ui/                       # Menu, ModalProvider, shared UI
│     │  ├─ ErrorBoundary.tsx
│     │  ├─ main.tsx                  # awaits initStore() + bootOS(), mounts UI
│     │  └─ styles.css                # themes (aqua-light default), tokens
│     ├─ index.html
│     ├─ vite.config.ts
│     └─ package.json
│
├─ server/
│  └─ snap/
│     ├─ src/main/java/com/nostalgi/snap/
│     │  ├─ SnapApplication.java
│     │  ├─ SecurityConfig.java
│     │  ├─ HealthController.java     # GET /api/health
│     │  ├─ ApiControllers.java       # GET /api/ping, APIs
│     │  ├─ SnapshotService.java      # local/S3 storage, path-style support
│     │  └─ ... repositories/entities if needed
│     ├─ src/main/resources/
│     │  ├─ application.yaml          # prod/dev props (optional)
│     │  └─ static/                   # SPA bundle injected at build
│     └─ pom.xml
│
├─ docker/
│  └─ entrypoint.sh                   # fixes volume ownership, then gosu → appuser
│
├─ Dockerfile                         # all-in-one (build SPA + jar)
├─ docker-compose.yml                 # dev split: web (5173) + api (8080)
└─ README.md
```

---

## Prerequisites

* **Docker** (Desktop) or Docker Engine
* Optional: Node 18+/20+, Java 21 if you want to run parts without Docker

---

## Quick Start (Docker All-in-One)

Build SPA → bundle into Spring Boot → run one container.

```bash
# From repo root
docker build --no-cache -t nostalgios:all-in-one .
docker run --rm -p 8080:8080 -v nostalgios_data:/app/data nostalgios:all-in-one

# Open the SPA served by Spring:
http://localhost:8080/
```

**Notes**

* The container runs an entrypoint that ensures `/app/data` is owned by the app user:

  * It creates `${SNAP_STORAGE_DIR:-/app/data/snapshots}` and `chown`s `/app/data`.
  * Then starts Spring with `-Dsnap.storageDir=...`.
* Data persists in the named volume `nostalgios_data`.

---

## Dev Workflow (docker-compose)

Use Vite’s hot-reload (PORT 5173) + API (PORT 8080).

`docker-compose.yml` (example):

```yaml
services:
  web:
    build:
      context: .
      dockerfile: Dockerfile.dev.web   # or use the main Dockerfile if you prefer
    working_dir: /app/apps/web-os
    command: npm run dev -- --host 0.0.0.0
    ports:
      - "5173:5173"
    volumes:
      - ./apps/web-os:/app/apps/web-os
    environment:
      - VITE_API_BASE=http://localhost:8080

  server:
    build:
      context: .
      dockerfile: Dockerfile.dev.server
    working_dir: /app/server/snap
    ports:
      - "8080:8080"
    volumes:
      - ./server/snap:/app/server/snap
      - nostalgios_data:/app/data
    environment:
      - SPRING_PROFILES_ACTIVE=dev
      - SNAP_STORAGE_DIR=/app/data/snapshots

volumes:
  nostalgios_data:
```

> You can also drive both services from the **single** root Dockerfile; many teams keep small `.dev` Dockerfiles for faster inner-loop.

**Open:**

* Frontend (Vite dev): `http://localhost:5173/`
* API: `http://localhost:8080/api/health`

---

## Configuration & Env

### Frontend

* **Default theme**: `aqua-light` (stronger contrast). Change under **Settings → Appearance**.
* **Wallpapers**: add `apps/web-os/public/wallpapers/default.jpg`. Users can upload images; we store them in IndexedDB (and optionally server snapshots).
* **Safe state init**: `initStore()` is awaited in `main.tsx`. `get snapshot()` never throws; `Desktop` renders a boot splash until ready.

### Backend (Spring Boot)

Key properties (via env or `application.yaml`):

| Property                 | Default            | Description                                                             |
| ------------------------ | ------------------ | ----------------------------------------------------------------------- |
| `snap.storageDir`        | `./data/snapshots` | Local snapshot path (overridden by entrypoint to `/app/data/snapshots`) |
| `snap.s3.enabled`        | `false`            | Enable S3 storage                                                       |
| `snap.s3.bucket`         | `nostalgios-snaps` | S3 bucket                                                               |
| `snap.s3.region`         | `ap-south-1`       | AWS region                                                              |
| `snap.s3.endpoint`       | *(empty)*          | Custom endpoint (e.g. MinIO)                                            |
| `snap.s3.forcePathStyle` | `true`             | Path style access                                                       |
| `aws.accessKeyId`        | *(empty)*          | S3 creds (if not using default provider chain)                          |
| `aws.secretAccessKey`    | *(empty)*          | S3 creds                                                                |

**Security**
In dev, Spring Security prints a generated password to logs; the API allows unauthenticated `/api/health` (and `/api/ping` if present). Harden for production as needed.

---

## Backend API

* `GET /api/health` → `{ "status": "ok" }`
* `GET /api/ping`   → `{ "status": "ok" }` (optional)
* `POST /api/snap/{deviceId}` → body bytes stored (disk or S3)
* `GET  /api/snap/{deviceId}` → returns snapshot bytes
* `DELETE /api/snap/{deviceId}` → delete snapshot

> The SPA primarily uses the browser-local snapshot. Server snapshots are optional long-term persistence or sync.

---

## Front-End Tech Notes

* **React + Vite + TypeScript** (modern target, `esnext`).
* **State Store** with explicit `initStore()` (no top-level `await`).
* **ErrorBoundary** overlays any crash with a “Reset & Reload” button that clears local storage + IndexedDB (one origin only).
* **Windowing**: draggable panels, right-docked Dock, z-index stacking, snap gap.
* **Keyboard**: `Esc` closes menus, arrow keys in games, space/pause where relevant.

---

## WASM & Python

* **Pyodide**: bundled locally under `apps/web-os/public/sdk/pyodide/` so it works offline (no CDN).
  In `py.worker.ts`, Pyodide is loaded via `importScripts(BASE + 'sdk/pyodide/pyodide.js')` with `indexURL` pointing to the same folder—**not** bundled by Vite.

* **Bash (WASM)**: optional. When enabled, the wasm asset is lazy-loaded from `public/wasm/bash/`. If it fails, terminal falls back to the built-in VFS shell.

---

## Theming & Accessibility

* Light/Dark/High-Contrast with tokens:

  * **Light**: higher contrast for readability (`--text`, `--border`, `--shadow` tuned).
  * **Dark (Aqua-inspired)**: glow accents, subtle transparency—original palettes (no traffic-lights).
* Focus rings, large hit targets on menus, color-blind safe accent defaults.
* Users can upload wallpapers and pick fit (fill/fit/tile/center).

---

## Testing & Quality

* TypeScript strictness where practical.
* Lint/format recommended:

  * Frontend: `npm run lint`, `npm run format` (add ESLint/Prettier as desired).
  * Backend: `mvn -q -DskipTests=false test` (add tests over time).
* CI suggestion (GitHub Actions):

  * Cache Maven & npm.
  * Build SPA, inject into jar, run `mvn -DskipTests package` for release.
  * Build Docker image per tag.

---

## Deployment Options

### 1) Single Docker image (recommended)

Already covered in “Quick Start”. Push to any registry and run.

### 2) Render / Fly.io / Railway

* Build from Docker. Expose port `8080`.
* Set `SNAP_STORAGE_DIR=/app/data/snapshots`, mount a persistent volume to `/app/data`.
* For S3: set `snap.s3.*` env vars and `snap.s3.enabled=true`.

### 3) K8s

* One Deployment + Service; mount a PVC at `/app/data`.
* Optional: HPA on CPU/RAM; externalized S3 credentials via Secret.

---

## Troubleshooting

**Blank screen (only background)**

* Use our Error Boundary; click **Reset & Reload** (clears IndexedDB/localStorage for this origin).
* Causes we already hardened:

  * Missing wallpaper record → now handled safely.
  * Old profile missing defaults → migrations in `boot.ts`.

**`file is not defined` in `MenuBar.tsx`**

* Ensure `File` menu array exists and `groups` references it. (Fixed in current code.)

**Vite error: “Cannot import non-asset file inside /public”**

* You can’t `import` files from `public/`. Load at runtime via URL (`importScripts` in workers, `<script src>` otherwise).

**Build error: top-level await not available**

* Don’t use `await` at module scope. We export `initStore()` and await it in `main.tsx`.
* `vite.config.ts` sets `build.target: 'esnext'`.

**Runtime `AccessDeniedException: /app/./data/snapshots`**

* You’re running as a non-root user with a volume owned by root. Our `docker/entrypoint.sh` chowns `/app/data` before starting, then `gosu` drops to `appuser`.
* Alternative: recreate the named volume after setting correct ownership in the image.

**Spring startup: duplicate `/api/health`**

* Don’t map the same route twice. Keep `HealthController#health()` and map the extra method as `/api/ping`.

---

## Credits

* Built with: React, Vite, TypeScript, Spring Boot 3, Java 21, AWS SDK v2, H2, and WASM (Pyodide/Bash).
* Pixel art & SFX: original or public-domain (attribution in `public/assets` where applicable).

