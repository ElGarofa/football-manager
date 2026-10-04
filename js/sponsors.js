import {CFG} from './config.js';
import {addDays} from './league.js';
import {E,zl,ingreso,nivelOf} from './finance.js';
import {fmt} from './players.js';
const R=(a,b)=>a+Math.random()*(b-a),r1k=x=>Math.round(x/1000)*1000;
export const SLOTS=['camiseta','estadio','indumentaria','carteleria'];
export const SLOT_NOMBRE={camiseta:'Camiseta',estadio:'Estadio',indumentaria:'Indumentaria',carteleria:'Cartelería'};
const MINREP=[58,44,32,0];
const base=(g,c)=>E().sponsor.k*Math.pow(c.reputacion,E().sponsor.exp)*(1+.02*zl(c,'oficinas'))+(E().sponsor.piso?.[nivelOf(g,c)-1]||0);
const club=g=>g.clubs[g.userClubId];
function genOferta(g,slot){const c=club(g),used=new Set([...Object.values(g.contratos).map(x=>x.sid),...g.spOfertas.map(o=>o.sid)]);
 const ok=CFG.sponsors.filter(s=>(slot==='indumentaria')===(s.rubro==='Indumentaria')&&MINREP[s.tier-1]<=c.reputacion&&!used.has(s.id));if(!ok.length)return null;
 let t=ok.reduce((a,s)=>a+(5-s.tier),0)*Math.random(),s=ok[0];for(const x of ok){t-=5-x.tier;if(t<=0){s=x;break}}
 return{id:++g.seq,slot,sid:s.id,nombre:s.nombre,rubro:s.rubro,anual:r1k(base(g,c)*E().sponsor.slots[slot]*s.valor*R(.9,1.12)),anios:1+Math.floor(Math.random()*4),
  bonos:{obj:+R(.1,.2).toFixed(2),camp:+R(.25,.4).toFixed(2),asc:+R(.15,.3).toFixed(2)},pen:+R(.15,.4).toFixed(2),vence:addDays(g.date,45),neg:false}}
const firmar=(g,o,anios)=>{g.contratos[o.slot]={sid:o.sid,nombre:o.nombre,rubro:o.rubro,anual:o.anual,desde:g.year,hasta:g.year+(anios??o.anios)-1,bonos:o.bonos,pen:o.pen}};
export function initContratos(g){g.contratos={};g.spOfertas=[];for(const s of SLOTS){const o=genOferta(g,s);if(o)firmar(g,o,1+Math.floor(Math.random()*3))}}
export const vacios=g=>SLOTS.filter(s=>!g.contratos[s]);
export function nuevaTemporada(g){g.spOfertas=[];for(const s of vacios(g))for(let i=0;i<2;i++){const o=genOferta(g,s);if(o)g.spOfertas.push(o)}}
export function tick(g){g.spOfertas=g.spOfertas.filter(o=>g.date<o.vence&&!g.contratos[o.slot]);g.dc=(g.dc||0)+1;
 if(g.dc%7===0)for(const s of vacios(g))if(!g.spOfertas.some(o=>o.slot===s)&&Math.random()<.5){const o=genOferta(g,s);if(o){g.spOfertas.push(o);g.news.push(`🤝 ${o.nombre} ofrece ser sponsor de ${SLOT_NOMBRE[s].toLowerCase()}`)}}}
export function aceptar(g,id){const i=g.spOfertas.findIndex(o=>o.id===id);if(i<0)return'La oferta venció';const o=g.spOfertas[i];if(g.contratos[o.slot])return'Ese espacio ya tiene sponsor';
 firmar(g,o);g.spOfertas=g.spOfertas.filter(x=>x.slot!==o.slot);return`Firmaste con ${o.nombre}: ${fmt(o.anual)} por año durante ${o.anios} ${o.anios>1?'temporadas':'temporada'}`}
export function rechazar(g,id){g.spOfertas=g.spOfertas.filter(o=>o.id!==id);return'Oferta rechazada'}
export function negociar(g,id,pct){const o=g.spOfertas.find(x=>x.id===id);if(!o)return'La oferta venció';if(o.neg)return'Ya negociaste esta oferta';
 const p={.1:.8,.25:.5,.5:.25}[pct]+.02*zl(club(g),'oficinas');o.neg=true;
 if(Math.random()<p){o.anual=r1k(o.anual*(1+pct));return`${o.nombre} aceptó mejorar la oferta: ahora paga ${fmt(o.anual)} por año`}
 g.spOfertas=g.spOfertas.filter(x=>x.id!==id);return`${o.nombre} se ofendió y retiró la oferta`}
export function cierre(g,res){const c=club(g);
 for(const[slot,k]of Object.entries(g.contratos)){let t=0;if(res.ok)t+=k.bonos.obj;if(res.champ)t+=k.bonos.camp;if(res.promoted)t+=k.bonos.asc;
  if(t>0){const m=Math.round(k.anual*t);ingreso(c,'premios',m);g.news.push(`💰 ${k.nombre} te paga un bono de ${fmt(m)} por tus resultados`)}
  if(res.relegated&&k.pen){k.anual=r1k(k.anual*(1-k.pen));g.news.push(`📉 ${k.nombre} reduce su aporte por el descenso`)}
  if(k.hasta<=g.year){delete g.contratos[slot];g.news.push(`Venció tu contrato con ${k.nombre} (${SLOT_NOMBRE[slot].toLowerCase()})`)}}}
