
import React, { useEffect, useState } from 'react'
import { store } from '../state/store'
import { WindowState } from '../os/types'
import { sound } from '../os/sound'

const launch = (id:string)=>()=>{ sound.open(); store.openApp(id) }

export function Taskbar(){
  const [, setTick] = useState(0); useEffect(()=>store.on(()=>setTick(x=>x+1)), [])
  const wins = Object.values(store.snapshot.windows).sort((a,b)=>a.z-b.z)
  const settings = store.getAppData('settings','ui',{ sounds:true })
  function toggleSounds(){ store.setAppData('settings','ui', { ...settings, sounds: !settings.sounds }) }
  const _open = sound.open, _close = sound.close
  sound.open = ()=>{ if(store.getAppData('settings','ui',{sounds:true}).sounds) _open() }
  sound.close = ()=>{ if(store.getAppData('settings','ui',{sounds:true}).sounds) _close() }

  return (
    <div className="absolute bottom-0 left-0 right-0 h-12 taskbar flex items-center gap-2 px-3">
      <button className="btn" onClick={launch('explorer')}>Explorer</button>
      <button className="btn" onClick={launch('notes')}>Notes</button>
      <button className="btn" onClick={launch('calc')}>Calc</button>
      <button className="btn" onClick={launch('breakout')}>Breakout</button>
      <button className="btn" onClick={launch('py')}>Python</button>
      <button className="btn" onClick={launch('wasm')}>WASM</button>
      <button className="btn" onClick={launch('cloud')}>Cloud</button>
      <div className="flex-1" />
      <button className="btn" onClick={toggleSounds} title="Toggle UI sounds">{store.getAppData('settings','ui',{sounds:true}).sounds ? '🔊' : '🔈'}</button>
      <div className="flex gap-2 pr-2">
        {wins.map((w:WindowState)=>(
          <div key={w.id} className="task-tab">
            <button className="btn" onClick={()=>store.restore(w.id)}>{w.title}</button>
            <button className="btn btn-danger" title="Close" onClick={()=>{ sound.close(); store.closeWindow(w.id) }} onPointerDown={(e)=>e.stopPropagation()}>✕</button>
          </div>
        ))}
      </div>
    </div>
  )
}
