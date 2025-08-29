
import React, { useState } from 'react'
import { store } from '../state/store'
import { backupToServer, restoreFromServer } from '../os/cloud'

export function Cloud(){
  const cfg = store.getAppData('cloud','config',{ serverUrl:'http://localhost:8080', player:'', submit:false, token:'' })
  const [serverUrl,setServerUrl]=useState<string>(cfg.serverUrl||'http://localhost:8080')
  const [player,setPlayer]=useState<string>(cfg.player||'anon')
  const [submit,setSubmit]=useState<boolean>(!!cfg.submit)
  const [token,setToken]=useState<string>(cfg.token||'')
  const [user,setUser]=useState(''); const [pass,setPass]=useState('')
  const [pp,setPP]=useState<string>(''); const [status,setStatus]=useState<string>('')

  function saveCfg(){ store.setAppData('cloud','config',{ serverUrl, player, submit, token }); setStatus('Saved settings.') }
  async function backup(){ setStatus('Encrypting + uploading...'); try{ await backupToServer(serverUrl, store.snapshot.id, pp, token); setStatus('Backup complete.') }catch(e:any){ setStatus('Backup failed: '+e.message) } }
  async function restore(){ setStatus('Downloading + decrypting...'); try{ await restoreFromServer(serverUrl, store.snapshot.id, pp, token); setStatus('Restore complete. Reloading...'); setTimeout(()=>location.reload(),600) }catch(e:any){ setStatus('Restore failed: '+e.message) } }

  async function login(){ try{
    const res = await fetch(`${serverUrl.replace(/\/$/,'')}/api/auth/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ username:user, password:pass }) })
    if(!res.ok) throw new Error('login failed'); const j=await res.json(); setToken(j.token); setStatus('Logged in. Token stored (client-side).'); saveCfg()
  }catch(e:any){ setStatus('Login error: '+e.message) } }
  async function register(){ try{
    const res = await fetch(`${serverUrl.replace(/\/$/,'')}/api/auth/register`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ username:user, password:pass }) })
    if(!res.ok) throw new Error('register failed'); setStatus('Registered. Now login.')
  }catch(e:any){ setStatus('Register error: '+e.message) } }

  return (<div className="p-3 space-y-3">
    <div className="text-sm">Encrypted snapshot backup &amp; leaderboards (optional). Keys never leave this device.</div>
    <div className="grid grid-cols-2 gap-3">
      <label className="flex flex-col gap-1"><span className="text-xs">Server URL</span><input className="retro-border px-2 py-1 bg-black/20 text-[var(--text)]" value={serverUrl} onChange={e=>setServerUrl(e.target.value)}/></label>
      <label className="flex flex-col gap-1"><span className="text-xs">Device ID</span><input className="retro-border px-2 py-1 bg-black/20 text-[var(--text)]" value={store.snapshot.id} readOnly/></label>
      <label className="flex flex-col gap-1"><span className="text-xs">Passphrase (not stored)</span><input type="password" className="retro-border px-2 py-1 bg-black/20 text-[var(--text)]" value={pp} onChange={e=>setPP(e.target.value)} placeholder="Your secret passphrase"/></label>
      <label className="flex items-center gap-2 mt-6"><input type="checkbox" checked={submit} onChange={e=>setSubmit(e.target.checked)}/><span className="text-sm">Submit game scores</span></label>
      <label className="flex flex-col gap-1"><span className="text-xs">Player name</span><input className="retro-border px-2 py-1 bg-black/20 text-[var(--text)]" value={player} onChange={e=>setPlayer(e.target.value)} placeholder="anon"/></label>
      <div className="mt-6"><button className="btn" onClick={saveCfg}>Save Settings</button></div>
    </div>

    <div className="retro-border p-2">
      <div className="text-sm mb-2">Auth</div>
      <div className="grid grid-cols-3 gap-2">
        <input className="retro-border px-2 py-1 bg-black/20 text-[var(--text)]" placeholder="username" value={user} onChange={e=>setUser(e.target.value)}/>
        <input className="retro-border px-2 py-1 bg-black/20 text-[var(--text)]" type="password" placeholder="password" value={pass} onChange={e=>setPass(e.target.value)}/>
        <div className="flex gap-2">
          <button className="btn" onClick={login}>Login</button>
          <button className="btn" onClick={register}>Register</button>
        </div>
      </div>
      <div className="text-xs mt-2">Token: <code>{token? token.slice(0,18)+'…' : '(none)'}</code></div>
    </div>

    <div className="flex gap-2">
      <button className="btn" onClick={backup}>Backup now</button>
      <button className="btn" onClick={restore}>Restore</button>
    </div>
    <div className="text-xs opacity-70">{status}</div>
  </div>)
}
