// Guardado en IndexedDB (varias ranuras + autoguardado) con respaldo de la ranura vieja en LocalStorage; exportar e importar archivos
import {Game} from './game.js';
const LEG='fm_argentina_v04',DB='fm_db',ST='saves';
export const SLOTS=[['1','Ranura 1'],['2','Ranura 2'],['3','Ranura 3'],['auto','Autoguardado']];
const open=()=>new Promise((res,rej)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore(ST);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
async function tx(mode,fn){const db=await open();return new Promise((res,rej)=>{const t=db.transaction(ST,mode),r=fn(t.objectStore(ST));t.oncomplete=()=>{db.close();res(r.result)};t.onerror=()=>rej(t.error);t.onabort=()=>rej(t.error)})}
const meta=g=>({club:g.clubs[g.userClubId].nombre,fecha:g.date,anio:g.year,at:Date.now()});
export async function save(g,k='1'){try{await tx('readwrite',s=>s.put({txt:JSON.stringify(g),meta:meta(g)},k));return true}catch(e){return false}}
export async function load(k='1'){try{const o=await tx('readonly',s=>s.get(k));if(o)return Game.from(JSON.parse(o.txt))}catch(e){}
 if(k==='1'){try{const s=localStorage.getItem(LEG);if(s)return Game.from(JSON.parse(s))}catch(e){}}return null}
export async function list(){const out=[];for(const[k,l]of SLOTS){let m=null;try{const o=await tx('readonly',s=>s.get(k));if(o)m=o.meta}catch(e){}
  if(!m&&k==='1'){try{if(localStorage.getItem(LEG))m={club:'Partida anterior',fecha:'—',anio:'',at:0}}catch(e){}}out.push({k,label:l,meta:m})}return out}
export async function borrar(k){try{await tx('readwrite',s=>s.delete(k))}catch(e){}}
export const exportar=g=>{const blob=new Blob([JSON.stringify(g)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`manager-argentina_${g.clubs[g.userClubId].nombre.replace(/\W+/g,'_')}_${g.date}.json`;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)};
export const importar=async file=>{const o=JSON.parse(await file.text());if(!o.clubs||!o.players||!o.leagues)throw new Error('Archivo inválido');return Game.from(o)};
