
export function startLoop(step:(dt:number)=>void){ let last=performance.now(); let raf=0; function loop(t:number){ const dt=Math.min(0.05,(t-last)/1000); last=t; step(dt); raf=requestAnimationFrame(loop)} raf=requestAnimationFrame(loop); return ()=>cancelAnimationFrame(raf) }
export class Keys{ private d=new Set<string>(); attach(el:HTMLElement|Window=window){ el.addEventListener('keydown',(e:any)=>this.d.add(e.key)); el.addEventListener('keyup',(e:any)=>this.d.delete(e.key)) } isDown(k:string){ return this.d.has(k) } }
