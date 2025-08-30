import { loadProfile, saveProfile } from '../os/storage'
import type { OSProfile, WindowState } from '../os/types'

type Listener = () => void
class Store {
  private state: OSProfile | null = null
  private listeners: Set<Listener> = new Set()
  private zTop = 1
  async init(){ this.state = await loadProfile() as OSProfile }
  get snapshot(){ if(!this.state) throw new Error('Store not initialized'); return this.state }
  async persist(){ if(!this.state) return; await saveProfile(this.state); this.emit() }
  on(fn:Listener){ this.listeners.add(fn); return ()=>this.listeners.delete(fn) }
  emit(){ this.listeners.forEach(fn=>fn()) }

  openApp(appId:string, appState?:any){
    // titles mapping:
    const titleMap:Record<string,string>={
      notes:'Notes', calc:'Calculator', explorer:'File Explorer',
      breakout:'Breakout', py:'Python Console', wasm:'WASM Demo', cloud:'Cloud Backup', 'ext:hello':'Hello Sandbox',
      terminal:'Terminal', settings:'Settings', snake:'Snake', paddle:'Paddle Battle', callbreak:'Call Break',
      help:'Help'
    }


    const id=crypto.randomUUID(); const w:WindowState={ id, appId, title:titleMap[appId]||appId, x:120, y:100, w:760, h:520, z:++this.zTop, minimized:false, maximized:false, appState }
    this.snapshot.windows[id]=w; this.snapshot.lastSession.openApps=[...new Set([...this.snapshot.lastSession.openApps, appId])]; this.persist(); return id
  }
  closeWindow(id:string){ delete this.snapshot.windows[id]; this.persist() }
  focus(id:string){ const w=this.snapshot.windows[id]; if(!w) return; w.z=++this.zTop; this.persist() }
  move(id:string,dx:number,dy:number){ const w=this.snapshot.windows[id]; if(!w) return; w.x+=dx; w.y+=dy; this.persist() }
  resize(id:string,dw:number,dh:number){ const w=this.snapshot.windows[id]; if(!w) return; w.w=Math.max(300,w.w+dw); w.h=Math.max(200,w.h+dh); this.persist() }
  setBounds(id:string, x:number, y:number, w:number, h:number){ const win=this.snapshot.windows[id]; if(!win) return; win.x=x; win.y=y; win.w=w; win.h=h; this.persist() }
  minimize(id:string){ const w=this.snapshot.windows[id]; if(!w) return; w.minimized=true; this.persist() }
  restore(id:string){ const w=this.snapshot.windows[id]; if(!w) return; w.minimized=false; w.maximized=false; this.focus(id) }
  toggleMax(id:string){ const w=this.snapshot.windows[id]; if(!w) return; w.maximized=!w.maximized; this.focus(id) }
  setAppData(appId:string,key:string,val:any){ this.snapshot.appData[appId]=this.snapshot.appData[appId]||{}; this.snapshot.appData[appId][key]=val; this.persist() }
  getAppData<T>(appId:string,key:string,fallback:T){ return (this.snapshot.appData[appId] && key in this.snapshot.appData[appId]) ? this.snapshot.appData[appId][key] : fallback }
}

export const store = new Store();

// Track readiness without using a top-level await
let _ready: Promise<void> | null = null;
let _isReady = false; // New flag to track readiness synchronously

export function initStore(): Promise<void> {
  if (!_ready) {
    _ready = store.init().then(() => {
      _isReady = true; // Set flag to true once the promise resolves
    });
  }
  return _ready;
}

// New exported helper function
export function isStoreReady() {
  return _isReady;
}