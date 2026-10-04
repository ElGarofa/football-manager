import {CFG} from './config.js';
import {addDays} from './league.js';
import {gasto,ingreso,ingresoProy} from './finance.js';
import {squadOf} from './clubs.js';
import {fmt} from './players.js';
const R=(a,b)=>a+Math.random()*(b-a),r10=x=>Math.round(x/10000)*10000,pk=a=>a[Math.random()*a.length|0],club=g=>g.clubs[g.userClubId];
export const TIPOS={prestamo:'Préstamo',socio:'Socio capitalista',mecenas:'Mecenas',fondo:'Fondo de derechos'};
export const deuda=g=>g.invs.filter(d=>d.tipo==='prestamo').reduce((s,d)=>s+d.restante,0);
export const limiteDeuda=g=>1.5*ingresoProy(g,club(g));
export const deudaAlta=g=>deuda(g)>.8*limiteDeuda(g);
function nueva(g,tipo){const c=club(g),ip=ingresoProy(g,c),pool=CFG.investors.filter(i=>i.tipo===tipo);if(!pool.length)return null;const inv=pk(pool);
 const o={id:++g.seq,tipo,nombre:inv.nombre,desc:inv.desc,vence:addDays(g.date,40)};
 if(tipo==='prestamo'){o.monto=r10(ip*R(.3,.8));o.interes=+R(.06,.11).toFixed(3);o.anios=2+Math.floor(Math.random()*3);o.total=Math.round(o.monto*(1+o.interes*o.anios))}
 else if(tipo==='socio'){o.monto=r10(ip*R(.5,1.2));o.pct=+R(.15,.3).toFixed(2);o.anios=3+Math.floor(Math.random()*3)}
 else if(tipo==='mecenas'){o.monto=r10(ip*R(1,2));o.anios=2+Math.floor(Math.random()*2);o.exigeMax=g.objetivo?g.objetivo.max:10}
 else{if(g.invs.filter(d=>d.tipo==='fondo').length>=2)return null;const ps=squadOf(g,c.id).filter(p=>!p.prestamo&&!p.fondo).sort((a,b)=>b.val-a.val).slice(0,8);if(!ps.length)return null;const p=pk(ps);o.pid=p.id;o.pnombre=p.nombre;o.pct=+R(.3,.5).toFixed(2);o.monto=r10(p.val*o.pct*1.1)}
 return o.monto>0?o:null}
const activo=(g,t)=>g.invs.some(d=>d.tipo===t)||g.invOfertas.some(o=>o.tipo===t);
export function nuevaTemporada(g){g.invOfertas=[];const ts=['prestamo','socio','mecenas','fondo'].sort(()=>Math.random()-.5);let n=0;
 for(const t of ts){if(n>=2)break;if(g.invs.some(d=>d.tipo===t&&t!=='prestamo'&&t!=='fondo'))continue;const o=nueva(g,t);if(o){g.invOfertas.push(o);n++}}}
export function tick(g){g.invOfertas=g.invOfertas.filter(o=>g.date<o.vence);
 if(g.invOfertas.length<3&&Math.random()<.04){const t=pk(['prestamo','socio','mecenas','fondo']);if(!activo(g,t)||t==='prestamo'||t==='fondo'){const o=nueva(g,t);if(o){g.invOfertas.push(o);g.news.push(`📨 ${o.nombre} te presenta una propuesta (${TIPOS[t].toLowerCase()})`)}}}}
export function aceptar(g,id){const i=g.invOfertas.findIndex(o=>o.id===id);if(i<0)return'La propuesta venció';const o=g.invOfertas[i],c=club(g);
 if(o.tipo==='prestamo'&&deuda(g)+o.total>limiteDeuda(g))return'Superarías tu límite de deuda';
 if((o.tipo==='socio'||o.tipo==='mecenas')&&g.invs.some(d=>d.tipo===o.tipo))return`Ya tenés un acuerdo de este tipo`;
 if(o.tipo==='fondo'){const p=g.players[o.pid];if(!p||p.clubId!==c.id||p.fondo)return'El jugador ya no está disponible';p.fondo={pct:o.pct,deal:o.id}}
 const d={...o,restante:o.total||0,desde:g.year};g.invs.push(d);g.invOfertas.splice(i,1);ingreso(c,'inversores',o.monto);return`Acuerdo cerrado con ${o.nombre}: recibís ${fmt(o.monto)}`}
export function rechazar(g,id){g.invOfertas=g.invOfertas.filter(o=>o.id!==id);return'Propuesta rechazada'}
export function dia(g,J){const c=club(g);for(const d of g.invs)if(d.tipo==='prestamo'){const cuota=d.total/d.anios/J;gasto(c,'deuda',cuota);d.restante-=cuota}g.invs=g.invs.filter(d=>d.tipo!=='prestamo'||d.restante>1)}
const top3=(g)=>[...squadOf(g,g.userClubId)].sort((a,b)=>b.ovr-a.ovr).slice(0,3).map(p=>p.id);
export const vetoCheck=(g,p)=>g.invs.some(d=>d.tipo==='mecenas')&&p.clubId===g.userClubId&&top3(g).includes(p.id);
export function ventaHook(g,p,amt){const c=club(g);
 for(const d of g.invs)if(d.tipo==='socio')gasto(c,'socios',amt*d.pct);
 if(p.fondo){gasto(c,'fondo',amt*p.fondo.pct);g.invs=g.invs.filter(d=>d.id!==p.fondo.deal);delete p.fondo}}
export function costoRecompra(g,d){return d.tipo==='prestamo'?d.restante*.92:d.tipo==='socio'?d.monto*1.1:d.tipo==='mecenas'?d.monto*.8:g.players[d.pid]?g.players[d.pid].val*d.pct*1.25:0}
export function recomprar(g,id){const d=g.invs.find(x=>x.id===id),c=club(g);if(!d)return'Acuerdo inexistente';const cost=Math.round(costoRecompra(g,d));
 if(c.presupuesto<cost)return'Presupuesto insuficiente';gasto(c,'deuda',cost);if(d.tipo==='fondo'&&g.players[d.pid])delete g.players[d.pid].fondo;g.invs=g.invs.filter(x=>x.id!==id);return`Terminaste el acuerdo con ${d.nombre} por ${fmt(cost)}`}
export function cierre(g,pos){
 g.invs=g.invs.filter(d=>d.tipo!=='fondo'||g.players[d.pid]);
 for(const d of g.invs){if(d.tipo==='mecenas'&&pos>d.exigeMax){g.confianza=Math.max(0,g.confianza-15);g.news.push(`😠 ${d.nombre} está furioso: no cumpliste lo que exigía (${pos}º, pedía ${d.exigeMax}º). La confianza de la directiva bajó.`)}
  if(d.tipo==='socio'||d.tipo==='mecenas')d.anios--}
 for(const d of g.invs.filter(d=>(d.tipo==='socio'||d.tipo==='mecenas')&&d.anios<=0))g.news.push(`Terminó tu acuerdo con ${d.nombre}`);
 g.invs=g.invs.filter(d=>(d.tipo!=='socio'&&d.tipo!=='mecenas')||d.anios>0)}
