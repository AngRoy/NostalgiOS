
import { db } from './storage'
async function exportSnapshot(): Promise<Uint8Array> {
  const d = await db()
  const kvProfile = await d.get('kv', 'profile')
  const files: any[] = []
  let c = await d.transaction('files').store.openCursor()
  while (c) { files.push({ key: c.key, value: c.value }); c = await c.continue() }
  const payload = { version: 1, kv: { profile: kvProfile }, files }
  const txt = JSON.stringify(payload)
  return new TextEncoder().encode(txt)
}
async function importSnapshot(bytes: Uint8Array) {
  const txt = new TextDecoder().decode(bytes)
  const obj = JSON.parse(txt)
  if (!obj || obj.version !== 1) throw new Error('bad snapshot')
  const d = await db()
  let cur = await d.transaction('files').store.openCursor()
  const toDel:any[] = []
  while (cur) { toDel.push(cur.key); cur = await cur.continue() }
  for (const k of toDel) await d.delete('files', k)
  await d.put('kv', obj.kv.profile, 'profile')
  for (const row of obj.files) await d.put('files', row.value, row.key)
}
async function getKey(passphrase:string, salt:Uint8Array){
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(passphrase), {name:'PBKDF2'}, false, ['deriveKey'])
  return crypto.subtle.deriveKey({ name:'PBKDF2', salt, iterations:250000, hash:'SHA-256' }, keyMaterial, { name:'AES-GCM', length:256 }, false, ['encrypt','decrypt'])
}
export async function encryptForBackup(passphrase:string):Promise<Uint8Array>{
  const plain = await exportSnapshot()
  let saltB64 = localStorage.getItem('nostalgios:cloud:salt')
  let salt = saltB64 ? Uint8Array.from(atob(saltB64), c => c.charCodeAt(0)) : null
  if (!salt) { salt = crypto.getRandomValues(new Uint8Array(16)); localStorage.setItem('nostalgios:cloud:salt', btoa(String.fromCharCode(...salt))) }
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await getKey(passphrase, salt!)
  const cipher = new Uint8Array(await crypto.subtle.encrypt({ name:'AES-GCM', iv }, key, plain))
  const out = new Uint8Array(16+12+cipher.length); out.set(salt!,0); out.set(iv,16); out.set(cipher,28); return out
}
export async function decryptFromBackup(passphrase:string, bytes:Uint8Array){
  const salt = bytes.slice(0,16), iv = bytes.slice(16,28), cipher = bytes.slice(28)
  const key = await getKey(passphrase, salt)
  const plain = new Uint8Array(await crypto.subtle.decrypt({ name:'AES-GCM', iv }, key, cipher))
  await importSnapshot(plain)
}
function authHeaders(token?:string){ return token ? { 'Authorization': 'Bearer ' + token } : {} }
export async function backupToServer(serverUrl:string, deviceId:string, passphrase:string, token?:string) {
  const body = await encryptForBackup(passphrase)
  const res = await fetch(`${serverUrl.replace(/\/$/,'')}/api/snapshots/${encodeURIComponent(deviceId)}`, { method:'POST', headers:{ 'Content-Type':'application/octet-stream', ...authHeaders(token) }, body })
  if (!res.ok) throw new Error('backup failed'); return true
}
export async function restoreFromServer(serverUrl:string, deviceId:string, passphrase:string, token?:string){
  const res = await fetch(`${serverUrl.replace(/\/$/,'')}/api/snapshots/${encodeURIComponent(deviceId)}`, { headers: { ...authHeaders(token) } })
  if (res.status === 404) throw new Error('no backup on server')
  if (!res.ok) throw new Error('download failed')
  const buf = new Uint8Array(await res.arrayBuffer())
  await decryptFromBackup(passphrase, buf)
  return true
}
export async function submitScore(serverUrl:string, gameId:string, player:string, score:number){
  const res = await fetch(`${serverUrl.replace(/\/$/,'')}/api/leaderboard/${encodeURIComponent(gameId)}`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ player, score }) })
  return res.ok
}
