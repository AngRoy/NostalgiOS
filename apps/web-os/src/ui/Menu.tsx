import React from 'react'
export type MenuItem = { label: string; onClick?: ()=>void; disabled?: boolean; separator?: boolean }
export function MenuList({ items }: { items: MenuItem[] }){
  return (
    <div className="menu">
      {items.map((it,i)=> it.separator ? <div key={i} className="menu-sep" /> :
        <button key={i} className="menu-item" disabled={it.disabled} onClick={it.onClick}>{it.label}</button>
      )}
    </div>
  )
}
