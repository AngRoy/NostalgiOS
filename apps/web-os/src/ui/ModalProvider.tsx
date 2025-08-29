import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react'
type Modal = { id: string; node: ReactNode }
type Ctx = { push(node: ReactNode): Promise<any>; close(id: string, value?: any): void }
const ModalCtx = createContext<Ctx | null>(null)

export function useModal(){ const ctx = useContext(ModalCtx); if(!ctx) throw new Error('ModalProvider missing'); return ctx }

export function ModalProvider({ children }: { children: ReactNode }){
  const [stack, setStack] = useState<Modal[]>([])
  const [waiters, setWaiters] = useState<Record<string,(v:any)=>void>>({})

  const close = useCallback((id: string, value?: any) => {
    setStack(s => s.filter(m => m.id !== id))
    setWaiters(w => { if (w[id]) w[id](value); const { [id]:_, ...rest } = w; return rest })
  }, [])

  const push = useCallback((node: ReactNode) => {
    const id = crypto.randomUUID()
    return new Promise<any>(resolve => {
      setWaiters(w => ({ ...w, [id]: resolve }))
      setStack(s => [...s, { id, node: React.cloneElement(node as any, { __modalId: id }) }])
    })
  }, [])

  // trap ESC on topmost
  useEffect(()=>{
    function onKey(e:KeyboardEvent){ if(e.key==='Escape' && stack.length){ const top=stack[stack.length-1]; close(top.id, { cancelled:true }) } }
    window.addEventListener('keydown', onKey); return ()=>window.removeEventListener('keydown', onKey)
  }, [stack, close])

  return (
    <ModalCtx.Provider value={{ push, close }}>
      {children}
      {stack.map(m => (
        <div key={m.id} className="osmodal-backdrop" onMouseDown={()=>close(m.id, { cancelled:true })}>
          <div className="osmodal" onMouseDown={e=>e.stopPropagation()}>{m.node}</div>
        </div>
      ))}
    </ModalCtx.Provider>
  )
}