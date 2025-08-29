import { VFS } from './vfs'
export type Wallpaper = { path: string; fit: 'fill'|'fit'|'tile'|'center' }
export function getWallpaperCSS(w: Wallpaper|null){
  if(!w) return ''
  const url = `url(/_vfs${w.path})` // we’ll map blob below in Desktop (simple approach)
  switch(w.fit){
    case 'fit': return `${url} no-repeat center / contain, var(--bg)`
    case 'tile': return `${url} repeat, var(--bg)`
    case 'center': return `${url} no-repeat center / auto, var(--bg)`
    default: return `${url} no-repeat center / cover, var(--bg)`
  }
}

export async function seedWallpaperFromURL(url:string, name='default.jpg', fit:'fill'|'fit'|'tile'|'center'='fill'){
  const res = await fetch(url); const blob = await res.blob()
  const buf = new Uint8Array(await blob.arrayBuffer())
  const p = `/System/Wallpapers/${name}`
  await (await import('./storage')).db().then(d=>d.put('files', { path:p, kind:'file', mime:blob.type, size:buf.length, mtime:Date.now() }, p))
  const b64 = btoa(String.fromCharCode(...buf))
  await (await import('./storage')).db().then(d=>d.put('files', `data:${blob.type};base64,${b64}`, p+':data'))
  return { path:p, fit }
}


// helper: save binary into VFS, return {path,fit}
export async function saveWallpaperFile(file: File, fit:'fill'|'fit'|'tile'|'center'='fill'){
  const p = `/System/Wallpapers/${Date.now()}-${file.name}`
  const buf = new Uint8Array(await file.arrayBuffer())
  await VFS.mkdir('/System'); await VFS.mkdir('/System/Wallpapers')
  // store as base64 to keep VFS text-based; simple for now
  const b64 = btoa(String.fromCharCode(...buf))
  await (await import('./storage')).db().then(d=>d.put('files', { path:p, kind:'file', mime:file.type, size:buf.length, mtime:Date.now() }, p))
  await (await import('./storage')).db().then(d=>d.put('files', `data:${file.type};base64,${b64}`, p+':data'))
  return { path:p, fit }
}
