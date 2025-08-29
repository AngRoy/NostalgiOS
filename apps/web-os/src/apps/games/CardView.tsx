import React from 'react'
export function CardView({s, r}:{s:'S'|'H'|'D'|'C', r:number}){
  const label = r===14?'A':r===13?'K':r===12?'Q':r===11?'J':String(r)
  const color = s==='H'||s==='D' ? '#ff6b7a' : '#e6f0ff'
  const suit = s==='S'?'♠':s==='H'?'♥':s==='D'?'♦':'♣'
  return (
    <div className="card-ui" style={{color}}>
      <div className="c-corner tl">{label}<span>{suit}</span></div>
      <div className="c-suit">{suit}</div>
      <div className="c-corner br">{label}<span>{suit}</span></div>
    </div>
  )
}
