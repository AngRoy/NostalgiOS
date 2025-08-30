// apps/web-os/src/state/store.ts
import { loadProfile, saveProfile } from '../os/storage'
import type { OSProfile, WindowState } from '../os/types'

type Listener = () => void

// A minimal, safe default so the store is NEVER null.
function makeDefaultProfile(): OSProfile {
  // Only include keys your UI actually reads at first paint.
  // Cast to OSProfile to avoid compile fuss if OSProfile has more keys.
  return {
    windows: {},
    appData: {},
    lastSession: { openApps: [] }
  } as unknown as OSProfile
}

// Shallow merge: incoming persisted data overlays onto default.
// (You can deepen this later if you add nested settings.)
function mergeProfile(base: OSProfile, incoming: Partial<OSProfile>): OSProfile {
  return {
    ...base,
    ...(incoming as OSProfile),
    windows: { ...(base as any).windows, ...(incoming as any).windows },
    appData: { ...(base as any).appData, ...(incoming as any).appData },
    lastSession: {
      ...(base as any).lastSession,
      ...((incoming as any).lastSession || {})
    }
  } as OSProfile
}

class Store {
  // IMPORTANT: start non-null to avoid first-render crashes
  private state: OSProfile = makeDefaultProfile()
  private listeners: Set<Listener> = new Set()
  private zTop = 1

  private hydrated = false
  private readyPromise: Promise<void> | null = null

  async init() {
    if (this.readyPromise) return this.readyPromise
    this.readyPromise = (async () => {
      try {
        const loaded = await loadProfile()
        if (loaded && typeof loaded === 'object') {
          this.state = mergeProfile(this.state, loaded as OSProfile)
          // pick up an existing max z if any windows were persisted
          const zs = Object.values((this.state as any).windows || {}).map((w: any) => w.z || 1)
          this.zTop = Math.max(this.zTop, ...(zs.length ? zs : [1]))
        }
      } catch (e) {
        console.warn('Store hydration failed; continuing with default profile', e)
      } finally {
        this.hydrated = true
        this.emit()
      }
    })()
    return this.readyPromise
  }

  // Never throw again. Always return a valid object.
  get snapshot() { return this.state }

  // Expose readiness if components want to gate rendering
  get isReady() { return this.hydrated }

  async persist() {
    try {
      await saveProfile(this.state)
    } catch (e) {
      console.warn('persist failed:', e)
    }
    this.emit()
  }

  on(fn: Listener) { this.listeners.add(fn); return () => this.listeners.delete(fn) }
  emit() { this.listeners.forEach(fn => fn()) }

  openApp(appId: string, appState?: any) {
    const titleMap: Record<string, string> = {
      notes: 'Notes', calc: 'Calculator', explorer: 'File Explorer',
      breakout: 'Breakout', py: 'Python Console', wasm: 'WASM Demo',
      cloud: 'Cloud Backup', 'ext:hello': 'Hello Sandbox',
      terminal: 'Terminal', settings: 'Settings', snake: 'Snake',
      paddle: 'Paddle Battle', callbreak: 'Call Break', help: 'Help'
    }
    const id = crypto.randomUUID()
    const w: WindowState = {
      id, appId, title: titleMap[appId] || appId,
      x: 120, y: 100, w: 760, h: 520, z: ++this.zTop,
      minimized: false, maximized: false, appState
    }
    ;(this.state as any).windows[id] = w
    const last = (this.state as any).lastSession || { openApps: [] }
    last.openApps = [...new Set([...(last.openApps || []), appId])]
    ;(this.state as any).lastSession = last
    this.persist()
    return id
  }
  closeWindow(id: string) { delete (this.state as any).windows[id]; this.persist() }
  focus(id: string) { const w = (this.state as any).windows[id]; if (!w) return; w.z = ++this.zTop; this.persist() }
  move(id: string, dx: number, dy: number) { const w = (this.state as any).windows[id]; if (!w) return; w.x += dx; w.y += dy; this.persist() }
  resize(id: string, dw: number, dh: number) { const w = (this.state as any).windows[id]; if (!w) return; w.w = Math.max(300, w.w + dw); w.h = Math.max(200, w.h + dh); this.persist() }
  setBounds(id: string, x: number, y: number, w: number, h: number) { const win = (this.state as any).windows[id]; if (!win) return; win.x = x; win.y = y; win.w = w; win.h = h; this.persist() }
  minimize(id: string) { const w = (this.state as any).windows[id]; if (!w) return; w.minimized = true; this.persist() }
  restore(id: string) { const w = (this.state as any).windows[id]; if (!w) return; w.minimized = false; w.maximized = false; this.focus(id) }
  toggleMax(id: string) { const w = (this.state as any).windows[id]; if (!w) return; w.maximized = !w.maximized; this.focus(id) }
  setAppData(appId: string, key: string, val: any) {
    const ad = (this.state as any).appData || ((this.state as any).appData = {})
    ad[appId] = ad[appId] || {}
    ad[appId][key] = val
    this.persist()
  }
  getAppData<T>(appId: string, key: string, fallback: T) {
    const ad = (this.state as any).appData || {}
    return (ad[appId] && key in ad[appId]) ? ad[appId][key] : fallback
  }
}

export const store = new Store()

// Readiness helpers (keep your API)
let _ready: Promise<void> | null = null
export function initStore(): Promise<void> {
  if (!_ready) _ready = store.init()
  return _ready
}
export function isStoreReady() { return store.isReady }
