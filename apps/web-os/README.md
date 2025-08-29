
# nostalgiOS Web (Vite + React + Tailwind)

## Dev
```bash
npm i
npm run dev
# open http://localhost:5173
```

## Build
```bash
npm run build
npm run preview
```

## Notes
- Uses **IndexedDB** for persistent state and VFS.
- Service worker caches core assets for offline.
- Python console loads **Pyodide** on first use and caches it.
- WASM demo uses `/sim.js` (replace with Emscripten build for real speed).
