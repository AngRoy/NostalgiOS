import React from 'react'

type State = { hasError: boolean; message?: string; stack?: string }

export class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false }
  static getDerivedStateFromError(err: any): State {
    return { hasError: true, message: err?.message || String(err) }
  }
  componentDidCatch(error: any, info: any) {
    // Log to console so we can see details in DevTools
    // (kept very small; no external services)
    console.error('[nostalgiOS crash]', error, info)
    this.setState(s => ({ ...s, stack: String(error?.stack || info?.componentStack || '') }))
  }
  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div style={{
        position:'fixed', inset:0, background:'rgba(0,0,0,.6)',
        color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', zIndex: 999999
      }}>
        <div style={{background:'rgba(15,22,33,.95)', border:'1px solid rgba(54,209,255,.2)', borderRadius:12, padding:16, width:720, maxWidth:'95%'}}>
          <div style={{fontWeight:800, marginBottom:8}}>nostalgiOS recovered from an error</div>
          <div style={{opacity:.9, marginBottom:8}}>{this.state.message}</div>
          {this.state.stack && <pre style={{whiteSpace:'pre-wrap', fontSize:12, maxHeight:300, overflow:'auto'}}>{this.state.stack}</pre>}
          <div style={{display:'flex', gap:8, marginTop:12}}>
            <button onClick={()=>location.reload()} style={{borderRadius:8, padding:'6px 10px'}}>Reload</button>
            <button onClick={()=>{
              // wipe local storage + IDB (only for this origin), then reload
              // this helps if a corrupted profile caused the crash
              // @ts-ignore
              (window as any).indexedDB?.databases?.().then((dbs:any[])=>{
                dbs?.forEach(d=>d?.name && indexedDB.deleteDatabase(d.name))
                localStorage.clear(); sessionStorage.clear(); location.reload()
              }).catch(()=>{
                localStorage.clear(); sessionStorage.clear(); location.reload()
              })
            }} style={{borderRadius:8, padding:'6px 10px'}}>Reset & Reload</button>
          </div>
        </div>
      </div>
    )
  }
}
