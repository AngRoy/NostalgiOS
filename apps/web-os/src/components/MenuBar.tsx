import React, { useState } from 'react'
import { MenuList, MenuItem } from '../ui/Menu'
import { store } from '../state/store'

export function MenuBar(){
  const [open, setOpen] = useState<string | null>(null)
  const close = ()=> setOpen(null)

  // Desktop (system) menu
  const desktop:MenuItem[] = [
    { label:'About nostalgiOS…', onClick:()=>store.openApp('help') },
    { separator:true },
    { label:'Settings…', onClick:()=>store.openApp('settings') },
    { label:'Change Wallpaper…', onClick:()=>store.openApp('settings', { tab:'wallpaper' }) },
    { separator:true },
    { label:'Sleep', onClick:()=>store.setAppData('power','state','sleep') },
    { label:'Restart', onClick:()=>window.location.reload() },
    { label:'Shut Down…', onClick:()=>store.setAppData('power','state','off') },
  ]

  // File menu (this was missing and caused the crash)
  const file:MenuItem[] = [
    { label:'New Window', onClick:()=>store.openApp('explorer') },
    { label:'New Folder', onClick:()=>store.setAppData('desktop','newFolder', Date.now()) },
    { separator:true },
    { label:'Close Window', onClick:()=>{}, disabled:true },
  ]

  const go:MenuItem[] = [
    { label:'Home', onClick:()=>store.openApp('explorer') },
    { label:'Documents', onClick:()=>store.openApp('explorer',{ path:'/Documents' }) },
    { label:'Sandbox', onClick:()=>store.openApp('explorer',{ path:'/Sandbox' }) },
  ]

  const windowMenu:MenuItem[] = [
    { label:'Minimize All', onClick:()=>Object.values(store.snapshot.windows).forEach(w=>store.minimize(w.id)) },
  ]

  const help:MenuItem[] = [
    { label:'nostalgiOS Help', onClick:()=>store.openApp('help') }
  ]

  // NOTE: 'View' menu intentionally removed; do not reference it here
  const groups:Record<string,MenuItem[]> = {
    Desktop:desktop, File:file, Go:go, Window:windowMenu, Help:help
  }

  return (
    <div className="menubar" onMouseLeave={close}>
      <div className="menubar-logo" onMouseDown={()=>setOpen('Desktop')}>★</div>
      {Object.keys(groups).map(key=>(
        <div key={key} className="menubar-item" onMouseDown={()=>setOpen(key)}>
          {key}
          {open===key && <div className="menu-pop"><MenuList items={groups[key]} /></div>}
        </div>
      ))}
    </div>
  )
}
