import React, { useRef } from 'react'
import type { WindowState } from '../os/types'
import { store } from '../state/store'
import { Notes } from '../apps/Notes'
import { Calculator } from '../apps/Calculator'
import { Explorer } from '../apps/Explorer'
import { Breakout } from '../apps/Breakout'
import { PythonConsole } from '../apps/PythonConsole'
import { WasmDemo } from '../apps/WasmDemo'
import { Cloud } from '../apps/Cloud'
import { sound } from '../os/sound'
import { Terminal } from '../apps/Terminal'
import { Settings } from '../apps/Settings'
import { Snake } from '../apps/games/Snake'
import { PaddleBattle } from '../apps/games/PaddleBattle'
import { CallBreak } from '../apps/games/CallBreak'

function WinControls({onMin,onMax,onClose}:{onMin:()=>void;onMax:()=>void;onClose:()=>void}){
  return (
    <div className="win-controls">
      <button className="wc wc-min"  title="Minimize" onClick={onMin}>−</button>
      <button className="wc wc-max"  title="Maximize" onClick={onMax}>☐</button>
      <button className="wc wc-close" title="Close"    onClick={onClose}>×</button>
    </div>
  )
}

export function WindowView({win}:{win:WindowState}){
  const ref = useRef<HTMLDivElement>(null)
  if (win.minimized) return null
  const style = win.maximized
  ? { left:0, top:24, width:'calc(100% - 104px)', height:'calc(100% - 24px)' } // leaves room for right dock
  : { left:win.x, top:win.y, width:win.w, height:win.h }

  function onDrag(e:React.PointerEvent){
    if((e.target as HTMLElement).closest('button')) return
    const t=ref.current!; t.setPointerCapture(e.pointerId)
    const start={x:e.clientX,y:e.clientY}
    function move(ev:PointerEvent){ store.move(win.id, ev.clientX-start.x, ev.clientY-start.y); start.x=ev.clientX; start.y=ev.clientY }
    async function up(){
      t.releasePointerCapture(e.pointerId); window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up)
      const vw=window.innerWidth, vh=window.innerHeight, tb=84
      const cur = store.snapshot.windows[win.id]; const W=cur.w, H=cur.h
      if (cur.y < 36) { store.toggleMax(win.id); return }
      if (cur.x < 10) store.setBounds(win.id, 0, cur.y, W, H)
      if (vw - (cur.x + W) < 10) store.setBounds(win.id, vw - W, cur.y, W, H)
      if (vh - tb - (cur.y + H) < 10) store.setBounds(win.id, cur.x, vh - tb - H, W, H)
    }
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up)
  }
  function onResize(e:React.PointerEvent){
    const t=ref.current!; t.setPointerCapture(e.pointerId); const start={x:e.clientX,y:e.clientY}
    function move(ev:PointerEvent){ store.resize(win.id, ev.clientX-start.x, ev.clientY-start.y); start.x=ev.clientX; start.y=ev.clientY }
    function up(){ t.releasePointerCapture(e.pointerId); window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up) }
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up)
  }

  const content = (():JSX.Element=>{
    const id = win.appId
    if (id==='notes') return <Notes winId={win.id} />
    if (id==='calc') return <Calculator />
    if (id==='explorer') return <Explorer />
    if (id==='breakout') return <Breakout />
    if (id==='py') return <PythonConsole winId={win.id} />
    if (id==='wasm') return <WasmDemo />
    if (id==='cloud') return <Cloud />
    if (id==='terminal') return <Terminal />
    if (id==='settings') return <Settings />
    if (id==='snake') return <Snake />
    if (id==='paddle') return <PaddleBattle />
    if (id==='callbreak') return <CallBreak />
    if (id.startsWith('ext:')){ const ext = id.split(':')[1]; return <iframe className="w-full h-full bg-white" src={`/apps/${ext}/index.html`} /> }
    return <div className="p-3">Unknown app: {id}</div>
  })()

  return (
    <div ref={ref} className="window" style={{...style, zIndex: win.z}} onMouseDown={()=>store.focus(win.id)}>
      <div className="titlebar" onPointerDown={onDrag}>
        <div className="title">{win.title}</div>
        <WinControls
          onMin={()=>store.minimize(win.id)}
          onMax={()=>store.toggleMax(win.id)}
          onClose={()=>{ sound.close(); store.closeWindow(win.id) }}
        />
      </div>
      <div className="win-body">
        {content}
        {!win.maximized && <div className="resize" onPointerDown={onResize}/>}
      </div>
    </div>
  )
}