/// <reference lib="WebWorker" />
export {}; // ensure this is a module

// Compute public base once; during Docker build we pass --base=/ so this becomes "/"
const BASE = (import.meta as any).env?.BASE_URL || '/';
const ORIGIN = self.location.origin;
const PY_BASE = `${ORIGIN}${BASE}sdk/pyodide/`;

// IMPORTANT: load the runtime JS from /public at runtime (no bundling)
importScripts(`${PY_BASE}pyodide.js`);

// @ts-ignore (added by pyodide.js)
const loadPyodideFn = (self as any).loadPyodide;

let pyodide: any;

self.addEventListener('message', async (evt: MessageEvent) => {
  const { type, code } = evt.data || {};
  try {
    if (type === 'init') {
      pyodide = await loadPyodideFn({ indexURL: PY_BASE });
      postMessage({ type: 'ready' });
      return;
    }
    if (type === 'run') {
      if (!pyodide) {
        pyodide = await loadPyodideFn({ indexURL: PY_BASE });
      }
      const result = await pyodide.runPythonAsync(code);
      postMessage({ type: 'result', result });
      return;
    }
  } catch (err: any) {
    postMessage({ type: 'error', error: String(err?.message || err) });
  }
});