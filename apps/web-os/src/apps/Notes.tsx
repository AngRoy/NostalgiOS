
import React, { useEffect, useRef, useState } from 'react'
import { store } from '../state/store'
import { VFS } from '../os/vfs'

export function Notes({winId}:{winId:string}){
  const win = store.snapshot.windows[winId]
  const boundPath = win.appState?.path as string | undefined
  const [text,setText]=useState('')
  const first = useRef(true)

  useEffect(()=>{
    if (boundPath){
      VFS.readText(boundPath).then(setText).catch(()=>setText(''))
    } else {
      setText(store.getAppData('notes','text',''))
    }
  }, [boundPath])

  useEffect(()=>{
    const t=setTimeout(async ()=>{
      if (first.current){ first.current=false; return }
      if (boundPath){ try{ await VFS.writeText(boundPath, text) }catch{} }
      else { store.setAppData('notes','text',text) }
    }, 250)
    return ()=>clearTimeout(t)
  },[text, boundPath])

  return (<textarea className="w-full h-full p-3 outline-none retro-border bg-black/20 text-[var(--text)]" value={text} onChange={e=>setText(e.target.value)} placeholder={boundPath?`Editing ${boundPath}`:'Type your notes... (auto-saves)'} />)
}
