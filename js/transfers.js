import {fmt} from './players.js';
const R=(a,b)=>a+Math.random()*(b-a),ask=p=>Math.ceil(p.val*(.9+((p.id*37)%30)/100)/1000)*1000;
export const search=(g,f)=>Object.values(g.players).filter(p=>p.clubId!==g.userClubId&&(!f.pos||p.pos===f.pos)&&(!f.q||p.nombre.toLowerCase().includes(f.q.toLowerCase()))&&p.ovr>=(f.min||0)).sort((a,b)=>b.ovr-a.ovr).slice(0,40);
export function move(g,p,to,amt){const f=g.clubs[p.clubId],t=g.clubs[to];if(f){f.plantilla=f.plantilla.filter(i=>i!==p.id);f.presupuesto+=amt}t.plantilla.push(p.id);t.presupuesto-=amt;p.clubId=to;p.contrato=+g.date.slice(0,4)+3;if(to==g.userClubId||(f&&f.id==g.userClubId))g.fixLineup()}
export function buy(g,id,amt){const p=g.players[id],me=g.clubs[g.userClubId],from=g.clubs[p.clubId];
 if(p.clubId===0){if(me.plantilla.length>=30)return[false,'Plantilla completa (máx. 30)'];move(g,p,me.id,0);return[true,`${p.nombre} firmó como agente libre`]}
 if(!(amt>0))return[false,'Ingresá un monto válido'];
 if(amt>me.presupuesto)return[false,'Presupuesto insuficiente'];
 if(me.plantilla.length>=30)return[false,'Plantilla completa (máx. 30)'];
 if(from.plantilla.length<=16)return[false,`${from.nombre} no puede quedarse con menos de 16 jugadores`];
 if(amt<(p.clausula||1e15)&&amt<ask(p))return amt>=ask(p)*.85?[false,`${from.nombre} contraoferta por ${p.nombre}: ${fmt(ask(p))}`,ask(p)]:[false,`${from.nombre} rechazó la oferta por ${p.nombre}`];
 move(g,p,me.id,amt);return[true,`Fichaje cerrado: ${p.nombre} por ${fmt(amt)}`]}
export function sellOffer(g,id){const p=g.players[id],me=g.clubs[g.userClubId];if(me.plantilla.length<=16||p.prestamo)return null;
 const price=Math.round(p.val*R(.8,1.1)/1e3)*1e3,bs=Object.values(g.clubs).filter(c=>c.id!==me.id&&c.presupuesto>=price&&c.plantilla.length<30);
 return bs.length?{to:bs[Math.random()*bs.length|0].id,price}:null}
export function sell(g,id,o){move(g,g.players[id],o.to,o.price);return[true,`Vendido por ${fmt(o.price)}`]}
const top=(g,id)=>[...g.clubs[id].plantilla].sort((a,b)=>g.players[b].ovr-g.players[a].ovr).slice(0,5);
export function loan(g,id){const p=g.players[id],me=g.clubs[g.userClubId],from=g.clubs[p.clubId],fee=Math.round(p.val*.08/1000)*1000;
 if(!from)return[false,'Es agente libre: ficharlo no cuesta nada'];
 if(me.plantilla.length>=30)return[false,'Plantilla completa (máx. 30)'];
 if(fee>me.presupuesto)return[false,'Presupuesto insuficiente'];
 if(from.plantilla.length<=18||top(g,from.id).includes(id))return[false,`${from.nombre} no cede a ${p.nombre}`];
 const o=from.id,k=p.contrato;move(g,p,me.id,fee);p.prestamo={de:o,hasta:g.year,k};return[true,`${p.nombre} llega a préstamo hasta fin de temporada por ${fmt(fee)}`]}
export function loanOut(g,id){const p=g.players[id],me=g.clubs[g.userClubId];
 if(me.plantilla.length<=18)return[false,'Necesitás al menos 18 jugadores'];if(p.prestamo)return[false,'Ya está en préstamo'];
 const bs=Object.values(g.clubs).filter(c=>c.id!==me.id&&c.plantilla.length<28);if(!bs.length)return[false,'Nadie lo quiere'];
 const to=bs[Math.random()*bs.length|0],k=p.contrato;move(g,p,to.id,0);p.prestamo={de:me.id,hasta:g.year,k};return[true,`${p.nombre} se va a préstamo a ${to.nombre} (vuelve a fin de temporada)`]}
export function aiMarket(g){const cs=Object.values(g.clubs).filter(c=>c.id!==g.userClubId),u=g.clubs[g.userClubId];
 for(let i=0;i<3;i++){const b=cs[Math.random()*cs.length|0],s=cs[Math.random()*cs.length|0];if(b===s||b.plantilla.length>=28||s.plantilla.length<=19)continue;
  const p=g.players[s.plantilla[Math.random()*s.plantilla.length|0]];if(p.prestamo)continue;const price=Math.round(p.val*R(.9,1.3)/1000)*1000;
  if(b.presupuesto>price*2&&p.ovr>=b.reputacion*.55+20){move(g,p,b.id,price);if(p.ovr>=72)g.news.push(`Fichaje: ${p.nombre} pasa de ${s.nombre} a ${b.nombre} por ${fmt(price)}`)}}
 g.ofertas=g.ofertas.filter(o=>g.players[o.pid]&&g.players[o.pid].clubId==u.id);
 if(g.ofertas.length<3&&u.plantilla.length>18&&Math.random()<.15){const ps=u.plantilla.map(i=>g.players[i]).filter(p=>!p.prestamo&&!g.ofertas.some(o=>o.pid==p.id)),p=ps[Math.random()*ps.length|0];
  const bs=p?cs.filter(c=>c.presupuesto>p.val*1.5&&c.plantilla.length<28):[];
  if(bs.length){const c=bs[Math.random()*bs.length|0],monto=Math.round(p.val*R(.95,1.45)/1000)*1000;g.ofertas.push({club:c.id,pid:p.id,monto});g.news.push(`📨 ${c.nombre} ofrece ${fmt(monto)} por ${p.nombre}`)}}}
export function answerOffer(g,i,ok){const o=g.ofertas[i];g.ofertas.splice(i,1);if(!ok)return'Oferta rechazada';const p=g.players[o.pid];
 if(p.clubId!=g.userClubId)return'El jugador ya no está en tu plantilla';if(g.clubs[g.userClubId].plantilla.length<=16)return'Plantilla mínima: no podés vender';move(g,p,o.club,o.monto);return`${p.nombre} vendido por ${fmt(o.monto)}`}
