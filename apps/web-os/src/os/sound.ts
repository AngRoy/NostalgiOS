
let ctx: AudioContext | null = null
function ensure(){ if(!ctx){ ctx = new (window.AudioContext || (window as any).webkitAudioContext)() } return ctx }
function beep(freq:number, dur=0.07){ const c=ensure(); const o=c.createOscillator(); const g=c.createGain(); o.frequency.value=freq; o.type='square'; o.connect(g); g.connect(c.destination); g.gain.value=0.05; o.start(); o.stop(c.currentTime+dur) }
export const sound = {
  open(){ beep(880, 0.06) },
  close(){ beep(220, 0.06) },
  error(){ beep(120, 0.12) }
}
