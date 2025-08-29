import { loadProfile, saveProfile } from './storage'
import { VFS } from './vfs'
import { seedWallpaperFromURL } from './wallpaper'

export async function bootOS(){
  let p = await loadProfile()

  if(!p){
    p = {
      id: crypto.randomUUID(),
      theme: 'neo',
      windows: {},
      dock: ['explorer','notes','calc','breakout','py','wasm','cloud','terminal','settings'], // NEW default dock
      desktop: [{appId:'explorer',x:40,y:80},{appId:'cloud',x:120,y:80},{appId:'breakout',x:200,y:80}], // NEW defaults
      appData: { settings: { theme: 'aqua-light' } }, // light by default
      lastSession: { openApps: ['explorer'], ts: Date.now() }
    }
    await saveProfile(p)
  } else {
    // ------- MIGRATIONS (safe against older profiles) -------
    p.appData ??= { settings: { theme: 'aqua-light' } }
    p.appData.settings ??= { theme: 'aqua-light' }
    if (!p.appData.settings.theme) p.appData.settings.theme = 'aqua-light'

    // Ensure power state never persists "off"
    if (p.appData.power?.state === 'off') p.appData.power.state = 'on'

    // Ensure dock/desktop not empty
    if (!Array.isArray(p.dock) || p.dock.length === 0)
      p.dock = ['explorer','notes','calc','breakout','py','wasm','cloud','terminal','settings']
    if (!Array.isArray(p.desktop) || p.desktop.length === 0)
      p.desktop = [{appId:'explorer',x:40,y:80},{appId:'cloud',x:120,y:80}]

    await saveProfile(p)
  }

  if (!(await VFS.exists('/Documents'))) await VFS.mkdir('/Documents')
  if (!(await VFS.exists('/Sandbox'))) await VFS.mkdir('/Sandbox')

  // Seed a default wallpaper once (place your file at /public/wallpapers/default.jpg)
  if (!p.appData.settings.wallpaper) {
    try {
      const w = await seedWallpaperFromURL('/wallpapers/default.jpg', 'default.jpg', 'fill')
      p.appData.settings.wallpaper = w
      await saveProfile(p)
    } catch { /* ignore—file optional */ }
  }

  document.body.dataset.theme = p.appData.settings.theme || 'aqua-light'
}
