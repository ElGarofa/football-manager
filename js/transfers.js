import {fmt} from './players.js';
import {ingreso,gasto,pasaTope} from './finance.js';
import {ventaHook,vetoCheck,deudaAlta} from './investors.js';
import {agOf,comision,enVentana,proxVentana,cierreVentana} from './market.js';
const R=(a,b)=>a+Math.random()*(b-a),ask=p=>Math.ceil(p.val*(.9+((p.id*37)%30)/100)/1000)*1000,r1k=x=>Math.round(x/1000)*1000;
const cerrado=g=>g.enVentana?null:`El mercado está cerrado (${proxVentana(g.date)}). Solo podés firmar agentes libres.`;
export const search=(g,f)=>Object.values(g.players).filter(p=>p.clubId!==g.userClubId&&(!f.pos||p.pos===f.pos)&&(!f.q||p.nombre.toLowerCase().includes(f.q.toLowerCase()))&&p.ovr>=(f.min||0)&&(!f.exp||p.contrato<=g.year)&&(!f.max||p.val<=f.max)&&(!f.edad||p.edad<=f.edad)).sort((a,b)=>b.ovr-a.ovr).slice(0,40);
export function move(g,p,to,amt){const f=g.clubs[p.clubId],t=g.clubs[to];if(f){f.plantilla=f.plantilla.filter(i=>i!==p.id);if(amt)ingreso(f,'ventas',amt)}t.plantilla.push(p.id);if(amt)gasto(t,'fichajes',amt);p.clubId=to;p.contrato=+g.date.slice(0,4)+3;delete p.venta;
 if(f&&f.id==g.userClubId&&amt>0){ventaHook(g,p,amt);if(p.reventa){const rc=g.clubs[p.reventa.club],m=amt*p.reventa.pct;gasto(f,'reventa',m);if(rc)ingreso(rc,'ventas',m);g.news.push(`Pagaste ${fmt(m)} de reventa a ${rc?rc.nombre:'el club anterior'}`);delete p.reventa}}
 if(to==g.userClubId||(f&&f.id==g.userClubId))g.fixLineup()}
export function buy(g,id,amt,o={}){const p=g.players[id],me=g.clubs[g.userClubId],from=g.clubs[p.clubId],ag=agOf(p),com=comision(p),sal=p.sal*(ag.tipo==='Codicioso'?1.15:1);
 if(p.clubId!==0&&cerrado(g))return[false,cerrado(g)];
 if(pasaTope(g,sal))return[false,'Supera el tope salarial que fijó la directiva'];
 if(deudaAlta(g)&&p.clubId!==0)return[false,'Tu deuda es demasiado alta: la directiva no autoriza fichajes'];
 if(me.presupuesto<com+(p.clubId?Math.max(amt,0):0))return[false,`Presupuesto insuficiente (comisión del representante: ${fmt(com)})`];
 if(p.clubId===0){if(me.plantilla.length>=30)return[false,'Plantilla completa (máx. 30)'];move(g,p,me.id,0);gasto(me,'comisiones',com);if(sal!==p.sal)p.sal=r1k(sal);return[true,`${p.nombre} firmó como agente libre (comisión de ${ag.nombre}: ${fmt(com)})`]}
 if(!(amt>0))return[false,'Ingresá un monto válido'];
 if(me.plantilla.length>=30)return[false,'Plantilla completa (máx. 30)'];
 if(from.plantilla.length<=16)return[false,`${from.nombre} no puede quedarse con menos de 16 jugadores`];
 const need=ask(p)*(ag.tipo==='Duro'?1.05:ag.tipo==='Flexible'?.98:1)*(o.reventa?.92:1);
 if(amt<(p.clausula||1e15)&&amt<need)return amt>=need*.85&&ag.tipo!=='Duro'?[false,`${from.nombre} contraoferta por ${p.nombre}: ${fmt(Math.ceil(need/1000)*1000)}`,Math.ceil(need/1000)*1000]:[false,`${from.nombre} rechazó la oferta por ${p.nombre}${ag.tipo==='Duro'?` (su representante ${ag.nombre} no negocia)`:''}`];
 const fid=from.id;move(g,p,me.id,amt);gasto(me,'comisiones',com);if(sal!==p.sal)p.sal=r1k(sal);
 let extra='';if(o.reventa){p.reventa={pct:.15,club:fid};extra+=' · 15% de reventa para el club vendedor'}
 if(o.bonos){const s0=p.sal;p.sal=r1k(s0*.9);p.bono={pj:r1k(s0*.1/28)||1000,gol:r1k(s0*.12/10)||1000};extra+=' · salario con bonos por partido y gol'}
 return[true,`Fichaje cerrado: ${p.nombre} por ${fmt(amt)} (comisión ${fmt(com)})${extra}`]}
export function buySwap(g,id,amt,sid){const me=g.clubs[g.userClubId],s=g.players[sid],p=g.players[id];if(!s||s.clubId!==me.id)return[false,'Elegí un jugador tuyo para el trueque'];if(s.prestamo)return[false,'Ese jugador está en préstamo'];if(vetoCheck(g,s))return[false,'El mecenas veta la salida de ese jugador'];
 const from=g.clubs[p.clubId];if(!from)return[false,'No aplica a agentes libres'];if(from.plantilla.length>=30)return[false,`${from.nombre} no tiene lugar en la plantilla`];const sv=r1k(s.val*.85);
 me.presupuesto+=sv;const r=buy(g,id,amt+sv);me.presupuesto-=sv;if(!r[0])return r;
 // el club recibe al jugador; devolvemos lo que se sumó como pago
 me.plantilla=me.plantilla.filter(i=>i!==s.id);from.plantilla.push(s.id);s.clubId=from.id;s.contrato=+g.date.slice(0,4)+3;ingreso(me,'ventas',sv);gasto(from,'fichajes',sv);ingreso(from,'ventas',0);g.fixLineup();
 return[true,`${p.nombre} llega por ${fmt(amt)} más ${s.nombre} (valuado en ${fmt(sv)})`]}
export function sellOffer(g,id){const p=g.players[id],me=g.clubs[g.userClubId];if(cerrado(g))return null;if(me.plantilla.length<=16||p.prestamo||vetoCheck(g,p))return null;
 const price=Math.round(p.val*R(.8,1.1)/1e3)*1e3,bs=Object.values(g.clubs).filter(c=>c.id!==me.id&&c.presupuesto>=price&&c.plantilla.length<30);
 return bs.length?{to:bs[Math.random()*bs.length|0].id,price}:null}
export function sell(g,id,o){move(g,g.players[id],o.to,o.price);return[true,`Vendido por ${fmt(o.price)}`]}
const top=(g,id)=>[...g.clubs[id].plantilla].sort((a,b)=>g.players[b].ovr-g.players[a].ovr).slice(0,5);
export function loan(g,id,op){const p=g.players[id],me=g.clubs[g.userClubId],from=g.clubs[p.clubId],fee=Math.round(p.val*.08/1000)*1000;
 if(!from)return[false,'Es agente libre: ficharlo no cuesta nada'];
 if(cerrado(g))return[false,cerrado(g)];
 if(pasaTope(g,p.sal))return[false,'Supera el tope salarial que fijó la directiva'];
 if(me.plantilla.length>=30)return[false,'Plantilla completa (máx. 30)'];
 if(fee>me.presupuesto)return[false,'Presupuesto insuficiente'];
 if(from.plantilla.length<=18||top(g,from.id).includes(id))return[false,`${from.nombre} no cede a ${p.nombre}`];
 const o=from.id,k=p.contrato;move(g,p,me.id,fee);p.prestamo={de:o,hasta:g.year,k};
 if(op){p.prestamo.op={tipo:op,precio:r1k(p.val*1.1)};return[true,`${p.nombre} llega a préstamo con ${op==='obligacion'?'obligación de compra (si juega 10 partidos)':'opción de compra'} por ${fmt(p.prestamo.op.precio)} (préstamo: ${fmt(fee)})`]}
 return[true,`${p.nombre} llega a préstamo hasta fin de temporada por ${fmt(fee)}`]}
export function ejercer(g,id){const p=g.players[id],me=g.clubs[g.userClubId];if(!p||!p.prestamo?.op||p.clubId!==me.id)return[false,'No hay opción para ejercer'];const pr=p.prestamo.op.precio,old=g.clubs[p.prestamo.de];
 if(me.presupuesto<pr)return[false,'Presupuesto insuficiente'];if(deudaAlta(g))return[false,'Tu deuda es demasiado alta'];gasto(me,'fichajes',pr);if(old)ingreso(old,'ventas',pr);delete p.prestamo;p.contrato=g.year+3;return[true,`Ejerciste la opción: ${p.nombre} es tuyo por ${fmt(pr)}`]}
export function loanOut(g,id,op){const p=g.players[id],me=g.clubs[g.userClubId];
 if(cerrado(g))return[false,cerrado(g)];
 if(me.plantilla.length<=18)return[false,'Necesitás al menos 18 jugadores'];if(p.prestamo)return[false,'Ya está en préstamo'];if(vetoCheck(g,p))return[false,'El mecenas veta que prestes a una de tus figuras'];
 const bs=Object.values(g.clubs).filter(c=>c.id!==me.id&&c.plantilla.length<28);if(!bs.length)return[false,'Nadie lo quiere'];
 const to=bs[Math.random()*bs.length|0],k=p.contrato;move(g,p,to.id,0);p.prestamo={de:me.id,hasta:g.year,k};if(op)p.prestamo.op={tipo:op,precio:r1k(p.val*1.15)};
 return[true,`${p.nombre} se va a préstamo a ${to.nombre}${op?` con ${op==='obligacion'?'obligación':'opción'} de compra por ${fmt(p.prestamo.op.precio)}`:''} (vuelve a fin de temporada)`]}
// al terminar la temporada, antes de devolver los préstamos
export function opcionesFin(g){const u=g.userClubId;for(const p of Object.values(g.players)){const op=p.prestamo?.op;if(!op)continue;const c=g.clubs[p.clubId],old=g.clubs[p.prestamo.de];if(!c||!old)continue;
  if(p.clubId===u){if(op.tipo==='obligacion'&&(p.pj||0)>=10&&c.presupuesto>=op.precio){gasto(c,'fichajes',op.precio);ingreso(old,'ventas',op.precio);delete p.prestamo;p.contrato=g.year+3;g.news.push(`Se activó la obligación de compra de ${p.nombre} (${fmt(op.precio)})`)}}
  else if(old.id===u){if((p.pj||0)>=8&&c.presupuesto>=op.precio*1.5&&Math.random()<(op.tipo==='obligacion'?1:.6)){gasto(c,'fichajes',op.precio);ingreso(old,'ventas',op.precio);delete p.prestamo;p.contrato=g.year+3;g.news.push(`${c.nombre} compró a ${p.nombre} por ${fmt(op.precio)}`)}}}}
export function aiMarket(g,frenesi){const cs=Object.values(g.clubs).filter(c=>c.id!==g.userClubId),u=g.clubs[g.userClubId];
 for(let i=0;i<(frenesi?10:2);i++){const b=cs[Math.random()*cs.length|0],s=cs[Math.random()*cs.length|0];if(b===s||b.plantilla.length>=28||s.plantilla.length<=19)continue;
  const p=g.players[s.plantilla[Math.random()*s.plantilla.length|0]];if(p.prestamo)continue;const price=Math.round(p.val*R(.9,1.3)/1000)*1000;
  if(b.presupuesto>price*2&&p.ovr>=b.reputacion*.55+20){move(g,p,b.id,price);if(p.ovr>=72)g.news.push(`Fichaje: ${p.nombre} pasa de ${s.nombre} a ${b.nombre} por ${fmt(price)}`)}}
 g.ofertas=g.ofertas.filter(o=>g.players[o.pid]&&g.players[o.pid].clubId==u.id);
 const pf=frenesi?.5:.025+(g.players?0:0);
 if(g.ofertas.length<(frenesi?5:3)&&u.plantilla.length>18&&Math.random()<pf){const ps=u.plantilla.map(i=>g.players[i]).filter(p=>!p.prestamo&&!g.ofertas.some(o=>o.pid==p.id)),p=ps.find(x=>x.venta)||ps[Math.random()*ps.length|0];
  const bs=p?cs.filter(c=>c.presupuesto>p.val*1.5&&c.plantilla.length<28):[];
  if(bs.length){const c=bs[Math.random()*bs.length|0],monto=Math.round(p.val*R(.95,1.45)/1000)*1000;g.ofertas.push({club:c.id,pid:p.id,monto});g.news.push(`📨 ${c.nombre} ofrece ${fmt(monto)} por ${p.nombre}`)}}
 // cláusulas de rescisión bajas: un club rico las paga sin negociar
 if(Math.random()<(frenesi?.35:.02)){const ps=u.plantilla.map(i=>g.players[i]).filter(p=>!p.prestamo&&p.clausula&&p.clausula<=p.val*1.9&&!vetoCheck(g,p)),p=ps[Math.random()*ps.length|0];
  const bs=p?cs.filter(c=>c.presupuesto>p.clausula*1.5&&c.plantilla.length<28&&p.ovr>=c.reputacion*.5+18):[];
  if(bs.length&&u.plantilla.length>17){const c=bs[Math.random()*bs.length|0],m=r1k(p.clausula);move(g,p,c.id,m);g.news.push(`💥 ¡${c.nombre} pagó la cláusula de rescisión de ${p.nombre}! (${fmt(m)})`)}}}
export function cierreDia(g){if(!cierreVentana(g.date))return;g.news.push('⏰ Último día del mercado de pases');aiMarket(g,true)}
export function answerOffer(g,i,ok){const o=g.ofertas[i];g.ofertas.splice(i,1);if(!ok)return'Oferta rechazada';const p=g.players[o.pid];
 if(p.clubId!=g.userClubId)return'El jugador ya no está en tu plantilla';if(vetoCheck(g,p))return'El mecenas veta la venta de '+p.nombre;if(g.clubs[g.userClubId].plantilla.length<=16)return'Plantilla mínima: no podés vender';move(g,p,o.club,o.monto);return`${p.nombre} vendido por ${fmt(o.monto)}`}
