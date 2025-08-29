
import React, { useEffect, useRef, useState } from 'react'
import { store } from '../state/store'

export function PythonConsole({winId}:{winId:string}){
  const win = store.snapshot.windows[winId]
  const initial = (win.appState?.code as string|undefined) || "print('Hello from Pyodide!')"
  const [code,setCode]=useState(initial); const [out,setOut]=useState(''); const wRef=useRef<Worker|null>(null)
  useEffect(()=>{ const w=new Worker(new URL('../workers/py.worker.ts', import.meta.url), { type:'module' }); w.onmessage=(e:any)=>{ const m=e.data; setOut(m.ok?String(m.result):`Error: ${m.error}`) }; wRef.current=w; return ()=>w.terminate() },[])
  function run(){ wRef.current?.postMessage({ code }) }
  return (<div className="h-full flex flex-col">
    <div className="p-2 text-sm bg:white/5">This downloads Pyodide on first run and caches it.</div>
    <textarea className="flex-1 retro-border p-2 bg-black/20 text-[var(--text)]" value={code} onChange={e=>setCode(e.target.value)}/>
    <div className="p-2"><button className="btn" onClick={run}>Run</button></div>
    <textarea className="flex-1 retro-border p-2 bg-black/20 text-[var(--text)]" value={out} readOnly/>
  </div>)
}
