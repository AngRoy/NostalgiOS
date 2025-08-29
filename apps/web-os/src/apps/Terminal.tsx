import React, { useEffect, useRef, useState } from 'react'
import { runCommand } from '../os/shell'

export function Terminal(){
  const [lines,setLines]=useState<string[]>(['nostalgiOS shell — type "help"'])
  const [input,setInput]=useState('')
  const env = useRef({ cwd:'/', user:'guest' })
  const scRef = useRef<HTMLDivElement>(null)

  function write(s:string){ setLines(l=>[...l, ...s.split('\n')]) }
  async function onEnter(){
    const cmd = input; setLines(l=>[...l, `guest:${env.current.cwd}$ ${cmd}`]); setInput('')
    await runCommand(env.current, cmd, write)
  }
  useEffect(()=>{ scRef.current!.scrollTop = scRef.current!.scrollHeight }, [lines])

  return (
    <div className="terminal">
      <div className="term-scroll" ref={scRef}>
        {lines.map((l,i)=><div key={i} className="term-line">{l}</div>)}
      </div>
      <div className="term-input">
        <span className="pr-2 text-[var(--muted)]">guest:{env.current.cwd}$</span>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&onEnter()} autoFocus/>
      </div>
    </div>
  )
}
