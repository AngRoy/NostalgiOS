import React, { useEffect, useRef } from 'react'
export function PaddleBattle(){
  const c=useRef<HTMLCanvasElement>(null)
  useEffect(()=>{
    const ctx=c.current!.getContext('2d')!, W=640,H=360; c.current!.width=W; c.current!.height=H
    const p1={x:20,y:H/2-30,w:10,h:60,vy:0}, p2={x:W-30,y:H/2-30,w:10,h:60,vy:0}
    const ball={x:W/2,y:H/2,r:6,vx:180,vy:120}
    const keys = new Set<string>(); window.addEventListener('keydown',e=>keys.add(e.key)); window.addEventListener('keyup',e=>keys.delete(e.key))
    let last=performance.now()
    function step(t:number){ const dt=(t-last)/1000; last=t
      p1.vy = (keys.has('w')?-220:0)+(keys.has('s')?220:0)
      p1.y = Math.max(0, Math.min(H-p1.h, p1.y + p1.vy*dt))
      // simple AI
      p2.y += Math.sign(ball.y-(p2.y+p2.h/2))*180*dt
      p2.y = Math.max(0, Math.min(H-p2.h, p2.y))
      ball.x += ball.vx*dt; ball.y += ball.vy*dt
      if(ball.y<ball.r||ball.y>H-ball.r) ball.vy*=-1
      function col(p:any){ return ball.x-ball.r<p.x+p.w && ball.x+ball.r>p.x && ball.y>p.y && ball.y<p.y+p.h }
      if(col(p1) && ball.vx<0){ ball.vx*=-1; ball.vy += (ball.y-(p1.y+p1.h/2))*5 }
      if(col(p2) && ball.vx>0){ ball.vx*=-1; ball.vy += (ball.y-(p2.y+p2.h/2))*5 }
      if(ball.x<0||ball.x>W){ ball.x=W/2; ball.y=H/2; ball.vx*=-1; ball.vy=120 }
      ctx.fillStyle='#0b0f15'; ctx.fillRect(0,0,W,H)
      ctx.fillStyle='#e6f0ff'; ctx.fillRect(p1.x,p1.y,p1.w,p1.h); ctx.fillRect(p2.x,p2.y,p2.w,p2.h)
      ctx.beginPath(); ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2); ctx.fill()
      requestAnimationFrame(step)
    } requestAnimationFrame(step)
    return ()=>{}
  },[])
  return <canvas ref={c} className="w-full h-full"/>
}
