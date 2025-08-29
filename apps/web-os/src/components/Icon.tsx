
import React from 'react'; import { store } from '../state/store'; import { sound } from '../os/sound'
const APP_NAMES:Record<string,string>={ notes:'Notes', calc:'Calculator', explorer:'Explorer', breakout:'Breakout', py:'Python', wasm:'WASM Demo', cloud:'Cloud', 'ext:hello':'Hello' }
const EMOJI:Record<string,string>={ notes:'📄', calc:'🧮', explorer:'🗂️', breakout:'🧱', py:'🐍', wasm:'⚙️', cloud:'☁️', 'ext:hello':'🧪' }
export function AppIcon({appId,x,y}:{appId:string;x:number;y:number}){
  return (<div className="absolute text-center" style={{left:x,top:y}}>
    <button className="retro-border w-20 h-20 flex items-center justify-center text-xl" onDoubleClick={()=>{ sound.open(); store.openApp(appId) }} title={`Open ${APP_NAMES[appId]||appId}`}>
      <span>{EMOJI[appId]||'📦'}</span>
    </button>
    <div className="mt-1 text-xs">{APP_NAMES[appId]||appId}</div>
  </div>)
}
