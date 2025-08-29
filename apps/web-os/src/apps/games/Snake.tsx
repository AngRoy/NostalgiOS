import React, { useEffect, useRef, useState } from 'react'

type State = 'menu'|'play'|'over'
export function Snake(){
  const c = useRef<HTMLCanvasElement>(null)
  const [state,setState] = useState<State>('menu')
  const [score,setScore] = useState(0)
  const [best,setBest] = useState<number>(()=>Number(localStorage.getItem('snake.best')||0))

  useEffect(()=>{
    if(state!=='play') return
    const ctx = c.current!.getContext('2d')!
    const W=560,H=360,S=20; c.current!.width=W; c.current!.height=H
    let dir:'R'|'L'|'U'|'D'='R', pending:'R'|'L'|'U'|'D'='R'
    let snake=[{x:4,y:9},{x:3,y:9},{x:2,y:9}]
    let food={x:10,y:6}
    const place=()=>{ food={x:Math.floor(Math.random()*(W/S)), y:Math.floor(Math.random()*(H/S))} }
    place()
    const onKey=(e:KeyboardEvent)=>{ const k=e.key; if(k==='ArrowUp'&&dir!=='D')pending='U'; if(k==='ArrowDown'&&dir!=='U')pending='D'; if(k==='ArrowLeft'&&dir!=='R')pending='L'; if(k==='ArrowRight'&&dir!=='L')pending='R' }
    window.addEventListener('keydown', onKey)
    let tick = setInterval(()=>{
      dir=pending
      const head={...snake[0]}; if(dir==='R')head.x++; if(dir==='L')head.x--; if(dir==='U')head.y--; if(dir==='D')head.y++
      const hitWall = head.x<0||head.y<0||head.x>=W/S||head.y>=H/S
      const hitSelf = snake.some(s=>s.x===head.x&&s.y===head.y)
      if(hitWall||hitSelf){ clearInterval(tick); setState('over'); setBest(b=>{ const nb=Math.max(b,score); localStorage.setItem('snake.best', String(nb)); return nb }); return }
      snake=[head,...snake]
      if(head.x===food.x && head.y===food.y){ setScore(s=>s+10); place() } else snake.pop()

      // Paint
      ctx.fillStyle='rgba(12,19,31,0.95)'; ctx.fillRect(0,0,W,H)
      // grid
      ctx.fillStyle='rgba(255,255,255,.03)'
      for(let x=0;x<W;x+=S) ctx.fillRect(x,0,1,H)
      for(let y=0;y<H;y+=S) ctx.fillRect(0,y,W,1)
      // food
      const g = ctx.createLinearGradient(food.x*S,food.y*S, food.x*S+S,food.y*S+S)
      g.addColorStop(0,'#ff9e80'); g.addColorStop(1,'#ff5470'); ctx.fillStyle=g
      ctx.beginPath(); ctx.roundRect(food.x*S+3, food.y*S+3, S-6, S-6, 4); ctx.fill()
      // snake
      ctx.fillStyle='#aee3ff'
      snake.forEach((s,i)=>{ ctx.beginPath(); ctx.roundRect(s.x*S+2, s.y*S+2, S-4, S-4, 5); ctx.fill() })
    }, 90)
    return ()=>{ clearInterval(tick); window.removeEventListener('keydown', onKey) }
  },[state,score])

  return (
    <div className="game-wrap">
      {state!=='play' && (
        <div className="game-overlay">
          {state==='menu' && (
            <div className="game-panel">
              <div className="game-title">Snake</div>
              <div className="game-sub">Best: {best}</div>
              <button className="btn primary" onClick={()=>{ setScore(0); setState('play') }}>Start</button>
            </div>
          )}
          {state==='over' && (
            <div className="game-panel">
              <div className="game-title">Game Over</div>
              <div className="mb-2">Score: {score} · Best: {Math.max(best,score)}</div>
              <div className="flex gap-2">
                <button className="btn" onClick={()=>setState('menu')}>Menu</button>
                <button className="btn primary" onClick={()=>{ setScore(0); setState('play') }}>Replay</button>
              </div>
            </div>
          )}
        </div>
      )}
      <div className="p-2 text-sm">Score: {score}</div>
      <canvas ref={c} className="w-full h-[calc(100%-2rem)] rounded-lg"/>
    </div>
  )
}
