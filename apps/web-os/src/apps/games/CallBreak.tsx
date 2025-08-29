import React, { useMemo, useState } from 'react'
import { deck, shuffle, Card, fmt } from '../../os/cards'
import { CardView } from './CardView'

type Player = { hand: Card[], tricks: number }
type State = 'menu'|'play'|'over'
const names = ['You','Bot A','Bot B','Bot C']

function deal(): Player[]{
  const d = shuffle(deck()); const P:Player[] = Array.from({length:4},()=>({hand:[],tricks:0}))
  for(let i=0;i<52;i++) P[i%4].hand.push(d[i])
  P.forEach(p=>p.hand.sort((a,b)=> a.s===b.s ? a.r-b.r : a.s.localeCompare(b.s)))
  return P
}
function validPlay(hand:Card[], lead:Card|null, c:Card){ if(!lead) return true; const hasLead = hand.some(x=>x.s===lead.s); return !hasLead || c.s===lead.s }
function winner(cards:{seat:number,card:Card}[], leadSuit:'S'|'H'|'D'|'C'){
  const sp = cards.filter(c=>c.card.s==='S'); const pool = sp.length? sp : cards.filter(c=>c.card.s===leadSuit)
  return pool.reduce((best,cur)=> cur.card.r>best.card.r? cur:best, pool[0])
}

export function CallBreak(){
  const [state,setState] = useState<State>('menu')
  const [players,setPlayers] = useState<Player[]>(deal())
  const [turn,setTurn] = useState(0)
  const [lead,setLead] = useState<Card|null>(null)
  const [pile,setPile] = useState<{seat:number,card:Card}[]>([])
  const your = players[0]

  function reset(){ setPlayers(deal()); setTurn(0); setLead(null); setPile([]); setState('play') }

  function playAI(){
    setTimeout(()=> setPlayers(P=>{
      const cur = P.slice(); let seat = turn
      if(seat===0) return P
      const hand = cur[seat].hand
      const playable = hand.filter(c=>validPlay(hand, lead, c))
      const pick = playable[Math.floor(Math.random()*playable.length)]
      cur[seat].hand = hand.filter(x=>x!==pick)
      const nextPile = [...pile, { seat, card: pick }]
      if(!lead) setLead(pick)
      setPile(nextPile)
      const nextSeat = (seat+1)%4
      if(nextPile.length===4){
        const win = winner(nextPile, (nextPile[0].card.s as any))
        cur[win.seat].tricks += 1
        setLead(null); setPile([]); setTurn(win.seat)
        // end condition: out of cards
        if(cur.every(p=>p.hand.length===0)) setState('over')
      } else setTurn(nextSeat)
      return cur
    }), 320)
  }

  function onPlay(c:Card){
    if(turn!==0) return
    if(!validPlay(your.hand, lead, c)) return
    setPlayers(P=>{
      const cur=P.slice(); cur[0].hand = cur[0].hand.filter(x=>x!==c)
      const nextPile=[...pile,{seat:0,card:c}]; if(!lead) setLead(c); setPile(nextPile)
      const nextSeat=(0+1)%4; setTurn(nextSeat); return cur
    })
  }

  useMemo(()=>{ if(state==='play' && turn!==0) playAI() }, [turn, state]) // eslint-disable-line

  return (
    <div className="p-2 text-sm h-full flex flex-col">
      {state!=='play' && (
        <div className="game-overlay">
          <div className="game-panel">
            {state==='menu' && <>
              <div className="game-title">Call Break</div>
              <div className="game-sub">Single round, spades trump</div>
              <button className="btn primary" onClick={reset}>Start</button>
            </>}
            {state==='over' && <>
              <div className="game-title mb-2">Round Over</div>
              <div className="mb-2">
                {names.map((n,i)=><div key={i}>{n}: {players[i].tricks} tricks</div>)}
              </div>
              <div className="flex gap-2">
                <button className="btn" onClick={()=>setState('menu')}>Menu</button>
                <button className="btn primary" onClick={reset}>Replay</button>
              </div>
            </>}
          </div>
        </div>
      )}

      <div className="mb-2">Tricks — You {players[0].tricks} · A {players[1].tricks} · B {players[2].tricks} · C {players[3].tricks}</div>

      <div className="cb-table">
        <div className="pile">
          {pile.map((p,i)=><div key={i} title={`${names[p.seat]}: ${fmt(p.card)}`}><CardView s={p.card.s as any} r={p.card.r}/></div>)}
        </div>
      </div>

      <div className="hand">
        {your.hand.map((c,i)=>
          <button key={i} className="card" onClick={()=>onPlay(c)} title={fmt(c)}>
            <CardView s={c.s as any} r={c.r}/>
          </button>
        )}
      </div>
    </div>
  )
}
