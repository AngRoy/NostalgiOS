
import { db } from './storage'; import type { FileEntry } from './types'
export function norm(path:string){ if(!path) path='/'; if(!path.startsWith('/')) path='/'+path; const parts:string[]=[]; for(const seg of path.split('/')){ if(!seg||seg==='.') continue; if(seg==='..') parts.pop(); else parts.push(seg) } return '/'+parts.join('/') }
async function getEntry(p:string){ const e=await (await db()).get('files',p); return e||undefined }
async function ensureDir(path:string){ const p=norm(path); if(p==='/') return; const parent=p.split('/').slice(0,-1).join('/')||'/'; if(parent!=='/') await ensureDir(parent); const e=await getEntry(p); if(!e) await (await db()).put('files',{path:p,kind:'dir',mtime:Date.now()},p) }
export const VFS = {
  norm,
  async mkdir(path:string){ path=norm(path); if(path==='/') return; await ensureDir(path) },
  async writeText(path:string,text:string,mime='text/plain'){ path=norm(path); const d=await db(); const txId=crypto.randomUUID(); await d.put('journal',{op:'writeText',path,mime,text,ts:Date.now()},txId); await ensureDir(path.split('/').slice(0,-1).join('/')||'/'); const entry:FileEntry={path,kind:'file',mime,size:text.length,mtime:Date.now()}; await d.put('files',entry,path); await d.put('files',text,path+':data'); await d.delete('journal',txId) },
  async readText(path:string){ path=norm(path); const e=await getEntry(path); if(!e||e.kind!=='file') throw new Error('not found'); const data=await (await db()).get('files',path+':data'); return typeof data==='string'?data:'' },
  async exists(path:string){ path=norm(path); return !!(await getEntry(path)) },
  async list(dir:string){ dir=norm(dir); const d=await db(); const out:FileEntry[]=[]; const prefix=dir.endsWith('/')?dir:dir+'/'; let c=await d.transaction('files').store.openCursor(); while(c){ const k=c.key as string; if(!k.includes(':data')){ if(k.startsWith(prefix)){ const rest=k.slice(prefix.length); if(rest && !rest.includes('/')) out.push(c.value as FileEntry) } else if (k===dir) out.push(c.value as FileEntry) } c=await c.continue() } return out.filter(e=>e.path!==dir).sort((a,b)=> (a.kind!==b.kind)?(a.kind==='dir'?-1:1):a.path.localeCompare(b.path)) },
  async remove(path:string){ path=norm(path); const d=await db(); const e=await getEntry(path); if(!e) return; if(e.kind==='file'){ await d.delete('files',path); await d.delete('files',path+':data'); return } const keys:string[]=[]; const prefix=path.endsWith('/')?path:path+'/'; let c=await d.transaction('files').store.openCursor(); while(c){ const k=c.key as string; if(!k.includes(':data')&&(k===path||k.startsWith(prefix))) keys.push(k); if(!k.includes(':data')&&k.startsWith(prefix)){ const dataKey=k+':data'; const has=await d.get('files',dataKey); if(has!==undefined) keys.push(dataKey) } c=await c.continue() } for(const k of keys) await d.delete('files',k) },
  async move(src:string, dest:string){ src=norm(src); dest=norm(dest); const d=await db(); const e=await getEntry(src); if(!e) throw new Error('not found'); await ensureDir(dest.split('/').slice(0,-1).join('/')||'/'); if(e.kind==='file'){ const data=await d.get('files',src+':data'); await d.put('files',{...e, path:dest, mtime:Date.now()},dest); await d.put('files',data,dest+':data'); await d.delete('files',src); await d.delete('files',src+':data'); return }
    const prefix=src.endsWith('/')?src:src+'/'; const newPrefix=dest.endsWith('/')?dest:dest+'/'
    let c=await d.transaction('files').store.openCursor(); const writes: any[]=[]; const dels: any[]=[]
    while(c){ const k=c.key as string; const val=c.value; if(k===src || k.startsWith(prefix)){ const rel=k===src?'' : k.slice(prefix.length); const nk = rel? newPrefix + rel : dest
        writes.push([nk, {...val, path: nk}]); dels.push(k);
        const dataKey = k+':data'; const has=await d.get('files',dataKey); if(has!==undefined){ writes.push([nk+':data', has]); dels.push(dataKey) }
    } c=await c.continue() }
    for(const [k,v] of writes) await d.put('files',v,k); for(const k of dels) await d.delete('files',k)
  },
}
