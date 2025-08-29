
import React, { useEffect, useRef, useState } from 'react'
import { startLoop, Keys } from '../os/gamekit'
import { store } from '../state/store'
import { submitScore } from '../os/cloud'

export function Breakout(){
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [high, setHigh] = useState<number>(store.getAppData('breakout','high',0))

  useEffect(()=>{
    const c = canvasRef.current!; const ctx = c.getContext('2d')!
    const keys = new Keys(); keys.attach(window)
    let W = c.width = 680, H = c.height = 400
    let paddle = { x: W/2 - 40, y: H-20, w: 80, h: 10, speed: 360 }
    let ball = { x: W/2, y: H/2, r: 6, vx: 160, vy: -200 }
    const rows = 5, cols = 10, bw = 60, bh = 18, offx = 20, offy = 40, gap = 6
    let bricks:boolean[] = Array(rows*cols).fill(true)
    let sc = 0
    function reset(){ ball.x=W/2; ball.y=H/2; ball.vx=160*Math.sign((Math.random()-0.5)||1); ball.vy=-200 }

    function step(dt:number){
      if (keys.isDown('ArrowLeft')) paddle.x -= paddle.speed*dt
      if (keys.isDown('ArrowRight')) paddle.x += paddle.speed*dt
      paddle.x = Math.max(0, Math.min(W-paddle.w, paddle.x))
      ball.x += ball.vx*dt; ball.y += ball.vy*dt
      if (ball.x < ball.r || ball.x > W-ball.r) ball.vx *= -1
      if (ball.y < ball.r) ball.vy *= -1
      if (ball.y > H+20){ sc = 0; bricks = Array(rows*cols).fill(true); reset() }
      if (ball.y+ball.r >= paddle.y && ball.x>=paddle.x && ball.x<=paddle.x+paddle.w && ball.vy>0){
        ball.vy *= -1; const u = (ball.x - (paddle.x+paddle.w/2))/(paddle.w/2); ball.vx = 220*u
      }
      for (let r=0;r<rows;r++) for (let c2=0;c2<cols;c2++){
        const i = r*cols + c2; if (!bricks[i]) continue
        const x = offx + c2*(bw+gap), y = offy + r*(bh+gap)
        if (ball.x> x && ball.x < x+bw && ball.y> y && ball.y < y+bh){
          bricks[i]=false; ball.vy *= -1; sc += 10
          if (sc>high){ setHigh(sc); store.setAppData('breakout','high',sc)
            const cfg = store.getAppData('cloud','config',{ serverUrl:'', player:'', submit:false })
            if (cfg.submit && cfg.serverUrl) submitScore(cfg.serverUrl,'breakout', cfg.player || 'anon', sc).catch(()=>{}) }
          break
        }
      }
      ctx.fillStyle = '#0b0f15'; ctx.fillRect(0,0,W,H)
      ctx.fillStyle = '#36d1ff'; ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h)
      ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI*2); ctx.fillStyle='#e6f0ff'; ctx.fill()
      for (let r=0;r<rows;r++) for (let c2=0;c2<cols;c2++){ const i=r*cols+c2; if (!bricks[i]) continue
        const x = offx + c2*(bw+gap), y = offy + r*(bh+gap); ctx.fillStyle = `hsl(${(r*cols+c2)*12%360},80%,60%)`; ctx.fillRect(x,y,bh*3.3,bh) }
      setScore(sc)
    }
    const stop = startLoop(step); return () => stop()
  }, [])

  return (<div className="w-full h-full bg-[#0b0f15] text-[#e6f0ff]">
    <div className="p-2 text-sm">Score: {score} · High: {high} · Arrows to move</div>
    <canvas ref={canvasRef} className="w-full h-[calc(100%-2rem)]"></canvas>
  </div>)
}
