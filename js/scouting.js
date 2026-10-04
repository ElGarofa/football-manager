import {CFG} from './config.js';
import {addDays} from './league.js';
import {zl,gasto,jornadas} from './finance.js';
import {mkPlayer,fmt} from './players.js';
const R=(a,b)=>a+Math.random()*(b-a),C=(x,a,b)=>Math.max(a,Math.min(b,x)),pk=a=>a[Math.random()*a.length|0],r1k=x=>Math.round(x/1000)*1000;
export const MAX_POR_NIVEL=[1,1,2,2,3,3,4,5,5,6];
export const TIPOS={jugador:'Jugadores de cualquier edad',joven:'Jóvenes (hasta 21)',libre:'Agentes libres',promesa:'Promesas para la cantera'};
export const LINEAS={G:'Arqueros',D:'Defensores',M:'Mediocampistas',A:'Delanteros'};
export const lineaDe=pos=>pos==='POR'?'G':['DFC','LI','LD'].includes(pos)?'D':['MCD','MC','MCO','MI','MD'].includes(pos)?'M':'A';
export const regionDe=c=>CFG.scouts.provincias?.[c.provincia]||'Buenos Aires';
export const maxScouts=g=>MAX_POR_NIVEL[Math.min(9,Math.max(0,zl(g.clubs[g.userClubId],'scouting')-1))];
export const salScout=n=>r1k(9000*n*n+12000); // anual
export function init(g){g.scouts=g.scouts||[];g.informes=g.informes||[];g.conocido=g.conocido||{};if(g.fog===undefined)g.fog=true;g.seguir=g.seguir||[];g.promesas=g.promesas||[];g.scSeq=g.scSeq||1;if(!g.promesas.length)genPromesas(g,6)}
const nid=g=>Math.max(...Object.keys(g.players).map(Number),0)+1;
function genPromesas(g,n,region){const c=g.clubs[g.userClubId];
 for(let i=0;i<n;i++){const pos=pk(['POR','DFC','DFC','LI','LD','MCD','MC','MCO','MI','MD','EI','ED','DC','DC']),p=mkPlayer(0,0,28+Math.random()*30,pos,6);
  p.edad=Math.round(R(16,18));p.pot=C(Math.round(p.ovr+R(12,28)),p.ovr,92);p.ovr=C(p.ovr-6,28,70);p.val=Math.round(p.val*.6/1000)*1000;p.sal=Math.floor(p.val*.1/1000)*1000;
  g.promesas.push({sid:g.scSeq++,region:region||pk(CFG.scouts.regiones),precio:r1k(Math.max(5000,p.val*.8)),p})}
 g.promesas=g.promesas.slice(-24)}
export function contratar(g){const c=g.clubs[g.userClubId];if(g.scouts.length>=maxScouts(g))return[false,'Tu oficina de scouting no tiene lugar para más ojeadores: mejorá la zona'];
 const n=C(Math.round(R(1,4.6)),1,5),s={id:g.scSeq++,nombre:pk(CFG.scouts.nombres)+' '+pk(CFG.scouts.apellidos),nivel:n,sal:salScout(n),mision:null};g.scouts.push(s);return[true,`Contrataste a ${s.nombre} (nivel ${n}) por ${fmt(s.sal)} anuales`]}
export function despedir(g,id){const i=g.scouts.findIndex(s=>s.id===id);if(i<0)return;const s=g.scouts.splice(i,1)[0];return`${s.nombre} dejó el club`}
export function mision(g,sid,{region,tipo,linea}){const s=g.scouts.find(x=>x.id===sid);if(!s)return[false,'Ojeador inexistente'];if(s.mision)return[false,'Ya está en una misión'];
 const dias=Math.max(5,Math.round(16-s.nivel*1.6));s.mision={region,tipo,linea:linea||'',fin:addDays(g.date,dias),dias};return[true,`${s.nombre} viaja a ${region} (${dias} días)`]}
export function cancelar(g,sid){const s=g.scouts.find(x=>x.id===sid);if(s)s.mision=null}
export const precision=(g,s)=>C(.3+.1*s.nivel+.03*zl(g.clubs[g.userClubId],'scouting'),.3,.97);
function addInforme(g,p,prec){const prev=g.conocido[p.id]||0;g.conocido[p.id]=Math.max(prev,prec);
 const v=vista(g,p);g.informes.unshift({id:g.scSeq++,pid:p.id,fecha:g.date,nombre:p.nombre,pos:p.pos,edad:p.edad,club:p.clubId?g.clubs[p.clubId]?.nombre:'Libre',ovr:v.ovr,pot:v.pot,prec:Math.round(g.conocido[p.id]*100)});
 g.informes=g.informes.filter((x,i,a)=>a.findIndex(y=>y.pid===x.pid)===i).slice(0,60)}
function cumplir(g,s){const m=s.mision,prec=precision(g,s),me=g.userClubId;s.mision=null;let found=0;
 if(m.tipo==='promesa'){genPromesas(g,2+(s.nivel>3?1:0),m.region);g.news.push(`🔎 ${s.nombre} regresó de ${m.region} con nuevas promesas para la cantera`);return}
 let pool=Object.values(g.players).filter(p=>p.clubId!==me&&!p.prestamo);
 if(m.tipo==='libre')pool=pool.filter(p=>p.clubId===0);
 else{if(m.region==='Sudamérica')pool=pool.filter(p=>p.clubId===0||g.clubs[p.clubId]?.liga==='l1');else pool=pool.filter(p=>p.clubId&&regionDe(g.clubs[p.clubId])===m.region)}
 if(m.tipo==='joven')pool=pool.filter(p=>p.edad<=21);
 if(m.linea)pool=pool.filter(p=>lineaDe(p.pos)===m.linea);
 pool.sort((a,b)=>(b.ovr+(m.tipo==='joven'?b.pot:0)+R(-5,5))-(a.ovr+(m.tipo==='joven'?a.pot:0)+R(-5,5)));
 const top=pool.slice(0,Math.min(pool.length,12)),pick=[];while(pick.length<Math.min(4,top.length)){const p=top.splice(Math.random()*top.length|0,1)[0];pick.push(p)}
 pick.forEach(p=>{addInforme(g,p,prec);found++});
 g.news.push(found?`🔎 ${s.nombre} entregó ${found} informe(s) de ${m.region}`:`🔎 ${s.nombre} no encontró jugadores que cumplan con lo pedido en ${m.region}`)}
export function tick(g){if(!g.scouts)return;for(const s of g.scouts)if(s.mision&&g.date>=s.mision.fin)cumplir(g,s)}
// pago por fecha y refinamiento de seguidos
export function dia(g,J){if(!g.scouts)return;const c=g.clubs[g.userClubId],tot=g.scouts.reduce((a,s)=>a+s.sal,0);if(tot)gasto(c,'staff',Math.round(tot/J));
 const k=g.scouts.length*.02;if(k)for(const id of g.seguir){const p=g.players[id];if(p)g.conocido[id]=Math.min(.9,(g.conocido[id]||.15)+k)}}
export function seguir(g,pid){const i=g.seguir.indexOf(pid);if(i>=0)g.seguir.splice(i,1);else g.seguir.push(pid);return i<0}
export function nuevaTemporada(g){if(!g.scouts)return;g.promesas=g.promesas.slice(-10);genPromesas(g,5);for(const k in g.conocido)g.conocido[k]=Math.max(.15,g.conocido[k]*.7);g.seguir=g.seguir.filter(id=>g.players[id]);g.informes=g.informes.filter(i=>g.players[i.pid])}
// vista con niebla de información
export function vista(g,p){const exact={ovr:p.ovr,pot:p.pot,exacto:true,prec:1};if(!g.fog||p.clubId===g.userClubId||p.prestamo?.de===g.userClubId)return exact;
 const prec=g.conocido?.[p.id]||0;if(prec>=.95)return exact;const h=Math.round((1-Math.max(prec,.3))*8)+1,off=(((p.id*9301+49297)%233280)/233280-.5)*2*h*.5,h2=h+2;
 const f=(v,hh)=>[C(Math.round(v+off-hh),1,99),C(Math.round(v+off+hh),1,99)];return{ovr:f(p.ovr,h),pot:f(p.pot,h2),exacto:false,prec}}
export const txtOvr=v=>Array.isArray(v)?`${v[0]}–${v[1]}`:String(v);
export function ficharPromesa(g,sid){const me=g.clubs[g.userClubId],i=g.promesas.findIndex(x=>x.sid===sid);if(i<0)return[false,'La promesa ya no está disponible'];const x=g.promesas[i];
 if(me.plantilla.length>=30)return[false,'Plantilla completa (máx. 30)'];if(me.presupuesto<x.precio)return[false,'No alcanza el presupuesto'];
 const p=x.p,id=nid(g);Object.assign(p,{id,clubId:me.id,contrato:+g.date.slice(0,4)+4});g.players[id]=p;me.plantilla.push(id);gasto(me,'fichajes',x.precio);g.promesas.splice(i,1);return[true,`${p.nombre} (${p.edad}) se sumó a la cantera por ${fmt(x.precio)}`]}
export function vistaPromesa(g,x){const p=x.p;if(!g.fog)return{ovr:p.ovr,pot:p.pot};const s=Math.max(...g.scouts.map(s=>precision(g,s)),.3),h=Math.round((1-s)*10)+2,o=(((x.sid*7919)%1000)/1000-.5)*h;
 return{ovr:[C(Math.round(p.ovr+o-h),1,99),C(Math.round(p.ovr+o+h),1,99)],pot:[C(Math.round(p.pot+o-h-2),1,99),C(Math.round(p.pot+o+h+2),1,99)]}}
