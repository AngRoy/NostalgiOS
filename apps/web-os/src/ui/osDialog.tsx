import React, { useState } from 'react'
import { useModal } from './ModalProvider'

function Prompt({ __modalId, title, message, defaultValue, type='text' }: any){
  const { close } = useModal(); const [val,setVal]=useState(defaultValue||'')
  return (
    <div className="dialog">
      <div className="dialog-title">{title}</div>
      <div className="dialog-body">
        <div className="mb-2">{message}</div>
        {type && <input className="dialog-input" value={val} onChange={e=>setVal(e.target.value)} autoFocus />}
      </div>
      <div className="dialog-actions">
        <button className="btn" onClick={()=>close(__modalId, null)}>Cancel</button>
        <button className="btn primary" onClick={()=>close(__modalId, val)}>OK</button>
      </div>
    </div>
  )
}
function Confirm({ __modalId, title, message }: any){
  const { close } = useModal()
  return (
    <div className="dialog">
      <div className="dialog-title">{title}</div>
      <div className="dialog-body">{message}</div>
      <div className="dialog-actions">
        <button className="btn" onClick={()=>close(__modalId, false)}>Cancel</button>
        <button className="btn primary" onClick={()=>close(__modalId, true)}>OK</button>
      </div>
    </div>
  )
}
function Alert({ __modalId, title, message }: any){
  const { close } = useModal()
  return (
    <div className="dialog">
      <div className="dialog-title">{title}</div>
      <div className="dialog-body">{message}</div>
      <div className="dialog-actions"><button className="btn primary" onClick={()=>close(__modalId, true)}>OK</button></div>
    </div>
  )
}

export function useOSDialog(){
  const { push } = useModal()
  return {
    osPrompt: (title:string, message:string, def='') => push(<Prompt title={title} message={message} defaultValue={def}/>),
    osConfirm: (title:string, message:string) => push(<Confirm title={title} message={message}/>),
    osAlert: (title:string, message:string) => push(<Alert title={title} message={message}/>),
  }
}
