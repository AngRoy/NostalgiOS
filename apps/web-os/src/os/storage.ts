
import { openDB, IDBPDatabase } from 'idb'; import type { OSProfile } from './types'
const DB='nostalgios'; let _db:Promise<IDBPDatabase<any>>|null=null
export function db(){ return _db ||= openDB(DB,6,{ upgrade(d,old){ if(old<1) d.createObjectStore('kv'); if(old<2){ d.createObjectStore('files'); d.createObjectStore('journal') } } })}
export async function kvSet<T>(k:string,v:T){ (await db()).put('kv',v,k) } export async function kvGet<T>(k:string){ return (await db()).get('kv',k) as Promise<T|undefined> }
export async function saveProfile(p:OSProfile){ await kvSet('profile',p) } export async function loadProfile(){ return kvGet<OSProfile>('profile') }
