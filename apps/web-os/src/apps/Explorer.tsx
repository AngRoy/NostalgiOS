import React, { useEffect, useMemo, useState } from 'react'
import { VFS } from '../os/vfs';
import type { FileEntry } from '../os/types'
import { store } from '../state/store'
import { useOSDialog } from '../ui/osDialog'

const ICONS: Record<string,string> = {
  'dir':'📁', 'txt':'📄', 'md':'📝', 'json':'{ }', 'py':'🐍', 'js':'🟨', 'ts':'🟦', 'html':'🌐', 'png':'🖼️', 'jpg':'🖼️', 'bin':'📦'
}
function iconFor(name:string, kind:'file'|'dir'){ if(kind==='dir') return ICONS['dir']; const ext=(name.split('.').pop()||'').toLowerCase(); return ICONS[ext]||ICONS['txt'] }
const isText = (name:string)=> /\.(txt|md|json|js|ts|html|css)$/i.test(name)
const isPython = (name:string)=> /\.py$/i.test(name)

type MenuItem = { label:string; action:()=>void; danger?:boolean }

export function Explorer(){
  const [path,setPath]=useState('/');
  const [items,setItems]=useState<FileEntry[]>([])
  const [preview,setPreview]=useState('');
  const [sel,setSel] = useState<FileEntry|null>(null)
  const [menu,setMenu] = useState<{x:number;y:number;items:MenuItem[]}|null>(null)
  const { osPrompt, osConfirm } = useOSDialog()

  async function refresh(p=path){ const list=await VFS.list(p); setItems(list); setPreview(''); setSel(null) }
  useEffect(()=>{ refresh('/') },[])

  function goInto(e:FileEntry){ if(e.kind==='dir'){ const p=e.path; setPath(p); refresh(p) } else openFile(e) }

  async function openFile(e:FileEntry){
    const name=e.path.split('/').pop()||'';
    if(isText(name)){
      store.openApp('notes', { path: e.path })
    } else if(isPython(name)){
      const code = await VFS.readText(e.path).catch(()=> '') ;
      store.openApp('py', { code })
    } else {
      try{
        const txt=await VFS.readText(e.path);
        setPreview(txt)
      }catch{
        setPreview('(binary or unreadable file)')
      }
    }
  }

  async function newFolder(){
    const name = await osPrompt('New Folder', 'Enter a folder name:', 'New Folder')
    if(!name) return;
    await VFS.mkdir(`${path}/${String(name)}`); refresh()
  }

  async function newFile(){
    const name = await osPrompt('New File', 'Enter a file name:', 'new.txt')
    if(!name) return;
    await VFS.writeText(`${path}/${String(name)}`, ''); refresh()
  }

  async function del(p:string){
    const ok = await osConfirm('Delete', 'Are you sure you want to delete this item?')
    if(!ok) return; await VFS.remove(p); refresh()
  }

  function up(){
    if(path==='/') return;
    const parent=path.split('/').slice(0,-1).join('/')||'/';
    setPath(parent);
    refresh(parent)
  }

  async function renameEntry(e:FileEntry){
    const base=e.path.split('/').pop()||''
    const newName = await osPrompt('Rename', 'Rename to:', base)
    if(!newName || newName===base) return;
    const dest = (path==='/'? '' : path) + '/' + newName
    await VFS.move(e.path, dest); refresh()
  }

  async function moveEntry(e:FileEntry){
    const to = await osPrompt('Move to…', 'Destination folder (absolute path):', '/Documents')
    if(!to) return
    const dest = (String(to)==='/'? '' : to) + '/' + (e.path.split('/').pop()||'')
    await VFS.move(e.path, dest); setPath(String(to)); refresh(String(to))
  }

  function onRightClick(e:React.MouseEvent, it:FileEntry){
    e.preventDefault();
    setSel(it);
    const name=it.path.split('/').pop()||''
    const items:MenuItem[] = [
      { label: 'Open', action: ()=>openFile(it) },
      ...(isText(name) ? [{ label:'Open with Notes', action: ()=>store.openApp('notes', { path: it.path }) }] : []),
      ...(isPython(name) ? [{ label:'Open with Python', action: async ()=>{ const code = await VFS.readText(it.path).catch(()=> ''); store.openApp('py', { code }) } }] : []),
      { label:'Rename', action: ()=>renameEntry(it) },
      { label:'Move to…', action: ()=>moveEntry(it) },
      { label:'Delete', action: ()=>del(it.path), danger:true },
    ]
    setMenu({ x: e.clientX, y: e.clientY, items })
  }

  const rows = useMemo(()=>items.map(e=>{
    const name=e.path.split('/').pop()||''
    return (
      <tr key={e.path} className={`hover:bg-white/5 cursor-pointer ${sel?.path===e.path?'bg-white/10':''}`} onDoubleClick={()=>goInto(e)} onContextMenu={(ev)=>onRightClick(ev,e)} onClick={()=>setSel(e)}>
        <td className="p-2"><span className="mr-2">{iconFor(name, e.kind)}</span>{name}</td>
        <td className="p-2">{e.kind}</td>
        <td className="p-2">{new Date(e.mtime).toLocaleString()}</td>
        <td className="p-2 text-right"><button className="btn btn-danger" onClick={(ev)=>{ev.stopPropagation(); del(e.path)}}>Delete</button></td>
      </tr>
    )
  }), [items, sel])

  return (
    <div className="h-full flex relative" onClick={()=>setMenu(null)}>
      <div className="w-2/3 border-r border-white/10 p-2">
        <div className="flex gap-2 mb-2">
          <button className="btn" onClick={up}>Up</button>
          <button className="btn" onClick={newFolder}>New Folder</button>
          <button className="btn" onClick={newFile}>New File</button>
          <button className="btn" disabled={!sel} onClick={()=> sel && openFile(sel)}>Open</button>
          <button className="btn" disabled={!sel} onClick={()=> sel && renameEntry(sel)}>Rename</button>
          <button className="btn" disabled={!sel} onClick={()=> sel && moveEntry(sel)}>Move</button>
        </div>
        <div className="text-xs mb-2 opacity-70">Path: {path}</div>
        <div className="retro-border h-[calc(100%-70px)] overflow-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-white/5"><th className="text-left p-2">Name</th><th className="text-left p-2">Type</th><th className="text-left p-2">Modified</th><th></th></tr></thead>
            <tbody>{rows}</tbody>
          </table>
        </div>
      </div>
      <div className="w-1/3 p-2"><div className="mb-2 font-bold">Preview</div><textarea className="w-full h-[calc(100%-2rem)] retro-border p-2 bg-black/20 text-[var(--text)]" value={preview} onChange={(e)=>setPreview(e.target.value)} readOnly/></div>

      {menu && (
        <div className="absolute z-[9999]" style={{ left:menu.x, top:menu.y }}>
          <div className="retro-border bg-[var(--panel)] min-w-[180px] p-1">
            {menu.items.map((mi,i)=>(
              <button key={i} className={`w-full text-left px-2 py-1 hover:bg-white/10 ${mi.danger?'text-red-300':''}`} onClick={()=>mi.action()}>{mi.label}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}