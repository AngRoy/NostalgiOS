export type Card = { s:'S'|'H'|'D'|'C', r:number } // r: 2..14 (A=14)
export function deck(){ const d:Card[]=[]; for(const s of ['S','H','D','C'] as const) for(let r=2;r<=14;r++) d.push({s,r}); return d }
export function shuffle<T>(a:T[]){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]] } return a }
export function cmp(a:Card,b:Card){ return a.r-b.r }
export function fmt(c:Card){ const R = {11:'J',12:'Q',13:'K',14:'A'} as any; const S={S:'♠',H:'♥',D:'♦',C:'♣'}; return (R[c.r]||c.r)+S[c.s] }
