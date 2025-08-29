import React, { useEffect, useState } from 'react'
import { store } from '../state/store'
import { saveWallpaperFile, Wallpaper } from '../os/wallpaper'

export function Settings(){
  const [theme, setTheme] = useState(store.getAppData('settings','theme','aqua-dark'))
  const [wall, setWall] = useState<Wallpaper | null>(store.getAppData('settings','wallpaper', null))
  useEffect(()=>{ document.body.dataset.theme = theme; store.setAppData('settings','theme', theme) }, [theme])
  useEffect(()=>{ store.setAppData('settings','wallpaper', wall) }, [wall])
  return (
    <div className="p-3 space-y-4">
      <section className="panel">
        <div className="panel-title">Appearance</div>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center gap-2"><input type="radio" checked={theme==='aqua-dark'} onChange={()=>setTheme('aqua-dark')}/> Aqua Dark</label>
          <label className="flex items-center gap-2"><input type="radio" checked={theme==='aqua-light'} onChange={()=>setTheme('aqua-light')}/> Aqua Light</label>
        </div>
      </section>
      <section className="panel">
        <div className="panel-title">Desktop & Wallpaper</div>
        <div className="flex items-center gap-2">
          <input type="file" accept="image/*" onChange={async e=>{
            const f=e.target.files?.[0]; if(!f) return
            if (f.size > 5_000_000) { alert('Max 5MB'); return }
            const w = await saveWallpaperFile(f, wall?.fit || 'fill'); setWall(w)
          }}/>
          <select value={wall?.fit || 'fill'} onChange={e=>wall && setWall({ ...wall, fit: e.target.value as any })}>
            <option value="fill">Fill</option><option value="fit">Fit</option>
            <option value="tile">Tile</option><option value="center">Center</option>
          </select>
          <button className="btn" onClick={()=>setWall(null)}>Remove</button>
        </div>
      </section>
    </div>
  )
}
