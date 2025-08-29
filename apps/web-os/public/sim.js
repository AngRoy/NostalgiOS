
export default async function Module(){
  return {
    dot: (a,b)=>{ let s=0; for(let i=0;i<Math.min(a.length,b.length);i++) s+=a[i]*b[i]; return s; },
    __jsFallback: true
  }
}
