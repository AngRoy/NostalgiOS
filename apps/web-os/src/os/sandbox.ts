
import { handleOsRequest } from './caps'
export function initSandboxBridge(){ window.addEventListener('message', async (e)=>{ const m=e.data; if(!m||m.type!=='request'||!m.id) return; const res=await handleOsRequest(m); (e.source as Window).postMessage(res,'*') }) }
