
import { VFS } from './vfs'
type Cap='fs'|'notify'|'settings'
type OsRequest={id:string;type:'request';cap:Cap;method:string;params:any[]}
type OsResponse={id:string;type:'response';ok:true;result:any}|{id:string;type:'response';ok:false;error:string}
const settings={ get(k:string){ return k==='theme'?'neo':null } }
const notify={ push(msg:string){ console.log('[notify]',msg); alert(msg); return true } }
export async function handleOsRequest(req:OsRequest):Promise<OsResponse>{ try{ if(req.cap==='fs'){ // @ts-ignore
    const fn=VFS[req.method]; if(typeof fn!=='function') throw new Error('fs method not allowed'); const result=await fn(...req.params); return {id:req.id,type:'response',ok:true,result} }
  if(req.cap==='notify'){ // @ts-ignore
    const result=notify[req.method](...req.params); return {id:req.id,type:'response',ok:true,result} }
  if(req.cap==='settings'){ // @ts-ignore
    const result=settings[req.method](...req.params); return {id:req.id,type:'response',ok:true,result} } throw new Error('capability denied')
}catch(e:any){ return {id:req.id,type:'response',ok:false,error:e.message||String(e)} } }
