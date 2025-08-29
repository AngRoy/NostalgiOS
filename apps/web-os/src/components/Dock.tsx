import React from 'react'
import { store } from '../state/store'
const entries = [
  { id:'explorer', label:'Explorer', emoji:'🗂️' },
  { id:'notes', label:'Notes', emoji:'📄' },
  { id:'calc', label:'Calc', emoji:'🧮' },
  { id:'terminal', label:'Terminal', emoji:'⌘' },
  { id:'snake', label:'Snake', emoji:'🟩' },
  { id:'paddle', label:'Paddle', emoji:'🏓' },
  { id:'callbreak', label:'Call Break', emoji:'🂠' },
  { id:'breakout', label:'Breakout', emoji:'🧱' },
  { id:'cloud', label:'Cloud', emoji:'☁️' },
  { id:'settings', label:'Settings', emoji:'⚙️' },
]
export function Dock(){
  return (
    <div className="dock">
      <div className="dock-inner">
        {entries.map(e=>(
          <button key={e.id} className="dock-item" title={e.label} onClick={()=>store.openApp(e.id)}>
            <span className="dock-emoji">{e.emoji}</span>
            {Object.values(store.snapshot.windows).some(w=>w.appId===e.id) && <span className="dock-dot" />}
          </button>
        ))}
      </div>
    </div>
  )
}
