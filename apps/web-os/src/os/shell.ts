import { VFS } from './vfs'
import { store } from '../state/store'

type Env = { cwd: string, user: string }
type Writer = (s:string)=>void

async function list(path:string){ return (await VFS.list(path)).map(e=>e.path.split('/').pop()).join('\n') }

export async function runCommand(env:Env, input:string, write:Writer){
  const [cmd, ...args] = input.trim().split(/\s+/)
  const cwd = env.cwd
  const abspath = (p:string)=> p.startsWith('/')? p : (cwd==='/'? '/'+p : `${cwd}/${p}`)
  try{
    switch(cmd){
      case 'help': write('Commands: help, ls, cd, pwd, cat, echo, mkdir, rm, mv, cp, touch, find, open, whoami, date, clear'); break
      case 'pwd': write(cwd); break
      case 'whoami': write(env.user); break
      case 'date': write(new Date().toString()); break
      case 'ls': { const p = abspath(args[0]||cwd); write(await list(p)); break }
      case 'cd': {
        const to = abspath(args[0]||'/'); if(!(await VFS.exists(to))) throw new Error('no such dir')
        env.cwd = to; break
      }
      case 'echo': write(args.join(' ')); break
      case 'cat': {
        const p = abspath(args[0]); if(!p) throw new Error('usage: cat <file>'); write(await VFS.readText(p)); break
      }
      case 'mkdir': { const p=abspath(args[0]); await VFS.mkdir(p); break }
      case 'touch': { const p=abspath(args[0]); await VFS.writeText(p,''); break }
      case 'rm': {
        const p=abspath(args[0]); await VFS.remove(p); break
      }
      case 'mv': { const [src,dst] = args.map(abspath); await VFS.move(src,dst); break }
      case 'cp': { const [src,dst] = args.map(abspath); const data = await VFS.readText(src); await VFS.writeText(dst,data); break }
      case 'find': { const p=abspath(args[0]||cwd); const listAll = await VFS.list(p); write(listAll.join('\n')); break }
      case 'open': { const app=args[0]||'explorer'; store.openApp(app); break }
      case 'clear': write('\x1bc'); break
      default: if(cmd) write(`command not found: ${cmd}`)
    }
  }catch(e:any){ write(`Error: ${e.message||e}`) }
}
