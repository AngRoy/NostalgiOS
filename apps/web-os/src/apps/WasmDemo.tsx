
import React, { useEffect, useState } from 'react'
import { loadSim } from '../os/wasm-loader'
function jsDot(a:number[], b:number[]){ let s=0; for(let i=0;i<Math.min(a.length,b.length);i++) s+=a[i]*b[i]; return s }
export function WasmDemo(){
  const [res, setRes] = useState<string>('')
  async function run(){
    const N=50000; const a=new Array(N).fill(0).map((_,i)=>Math.sin(i)); const b=new Array(N).fill(0).map((_,i)=>Math.cos(i))
    const t0=performance.now(); const js=jsDot(a,b); const t1=performance.now()
    const sim=await loadSim(); const t2=performance.now(); const w=sim.dot(a,b); const t3=performance.now()
    setRes([`JS result: ${js.toFixed(6)} in ${(t1-t0).toFixed(2)} ms`,`SIM result: ${w.toFixed(6)} in ${(t3-t2).toFixed(2)} ms`, sim.__jsFallback?'(Using JS fallback. Build real WASM to speed up.)':'(WASM active)'].join('\n'))
  }
  useEffect(()=>{ run() },[])
  return (<div className="p-3 h-full flex flex-col gap-2">
    <div className="text-sm">Dot product benchmark (JS vs Emscripten module).</div>
    <pre className="flex-1 retro-border bg-black/20 p-2 whitespace-pre-wrap text-[var(--text)]">{res}</pre>
    <button className="btn w-max" onClick={run}>Run again</button>
  </div>)
}
