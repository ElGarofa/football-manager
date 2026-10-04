// v1.1: roles de jugador, ventas a Europa, rehabilitación, ex jugadores como staff, desafíos y editor
import {squadOf} from './clubs.js';
import {fmt} from './players.js';
import {ingreso,gasto,zl,topeSalarial} from './finance.js';
import {ROLES} from './tactics.js';
const R=(a,b)=>a+Math.random()*(b-a),C=(x,a,b)=>Math.max(a,Math.min(b,x)),pk=a=>a[Math.random()*a.length|0],U=g=>g.clubs[g.userClubId];

export function init(g){g.roles=g.roles||{};g.euOfertas=g.euOfertas||[];g.europa=g.europa||[];g.exj=g.exj||[];g.flags=g.flags||{};if(g.desafio===undefined)g.desafio=null}

// ---------- roles ----------
export function setRol(g,pid,rol){const p=g.players[pid];if(!p||p.clubId!==g.userClubId)return'Jugador inválido';if(!rol){delete g.roles[pid];return'Rol quitado'}
 const ok=(ROLES[p.pos]||[]).some(r=>r[0]===rol)||(p.pos2&&(ROLES[p.pos2]||[]).some(r=>r[0]===rol));if(!ok)return'Ese rol no va con su posición';g.roles[pid]=rol;return`${p.nombre}: ${rol}`}
export const rolesDe=g=>Object.fromEntries(Object.entries(g.roles).filter(([id])=>g.players[id]?.clubId===g.userClubId));

// ---------- Europa ----------
const EU=['Sporting Valdemar','FC Alto Rhin','Real Costa Brava','Olympique Montclair','Atlético Nordlund','Racing de Lys','Borussia Weidenau','Inter Mareterra','Dinamo Karpatia','Benfica do Minho (ficticio)','AS Riviera','Ajax-Delta FC'].map(n=>n.replace(' (ficticio)',''));
export function ofertaEU(g){const sq=squadOf(g,g.userClubId).filter(p=>p.edad>=18&&p.edad<=28&&p.ovr>=Math.max(66,U(g).reputacion*.75)&&!p.prestamo&&!g.euOfertas.some(o=>o.pid===p.id));if(!sq.length)return;
 const p=pk(sq.sort((a,b)=>b.ovr-a.ovr).slice(0,5)),fee=Math.round(p.val*R(1.5,2.6)/10000)*10000,club=pk(EU);
 g.euOfertas.push({id:++g.seq,pid:p.id,club,fee,vence:addD(g.date,20)});g.news.push(`🌍 ${club} (Europa) ofrece ${fmt(fee)} por ${p.nombre}`)}
const addD=(d,n)=>{const x=new Date(d+'T12:00:00');x.setDate(x.getDate()+n);return x.toISOString().slice(0,10)};
export function responderEU(g,id,modo){const o=g.euOfertas.find(x=>x.id===id);if(!o)return'La oferta venció';const p=g.players[o.pid],c=U(g);g.euOfertas=g.euOfertas.filter(x=>x.id!==id);
 if(modo==='no'||!p||p.clubId!==c.id)return'Rechazaste la oferta';if(c.plantilla.length<=16)return'Plantilla mínima (16): no podés vender';
 const pct=modo==='reventa'?.2:0,fee=Math.round(o.fee*(pct?.8:1)/10000)*10000;ingreso(c,'ventas',fee);
 c.plantilla=c.plantilla.filter(i=>i!==p.id);delete g.players[p.id];delete g.roles[p.id];if(g.lineup)g.lineup.xi=g.lineup.xi.filter(i=>i!==p.id);
 g.europa.push({nombre:p.nombre,pos:p.pos,edad:p.edad,ovr:p.ovr,club:o.club,fee,pct,y:g.year,done:false});g.news.push(`✈️ ${p.nombre} se va a ${o.club} por ${fmt(fee)}${pct?' (con 20% de reventa)':''}`);
 g.fixLineup&&g.fixLineup();return`${p.nombre} fue vendido a ${o.club} por ${fmt(fee)}`}

// ---------- rehabilitación ----------
export const costoRehab=(g,p)=>Math.round((p.sal*.04+p.val*.003)/1000)*1000;
export function rehab(g,pid){const p=g.players[pid],c=U(g);if(!p||p.clubId!==c.id)return'Jugador inválido';if(p.lesion<12)return'La lesión es corta: no hace falta';if(p.rehab)return'Ya está en tratamiento intensivo';const cost=costoRehab(g,p);if(c.presupuesto<cost)return'Presupuesto insuficiente';
 gasto(c,'medico',cost);const f=.7-.025*zl(c,'medica');const antes=p.lesion;p.lesion=Math.max(2,Math.round(p.lesion*f));p.rehab=true;return`${p.nombre}: tratamiento intensivo (${antes} → ${p.lesion} días, ${fmt(cost)})`}

// ---------- ex jugadores como staff ----------
export function retiro(g,p){if(p.clubId!==g.userClubId||p.exp<55)return;const esp=p.pos==='POR'?'Arqueros':['DFC','LI','LD','MCD'].includes(p.pos)?'Táctico':['DC','EI','ED','MCO'].includes(p.pos)?'Pelota parada':'Físico';
 g.exj.push({id:++g.seq,nombre:p.nombre,esp,nivel:C(Math.round(p.exp*.85+R(-4,6)),35,92),exj:true,y:g.year})}
export function candExJ(g){const out=(g.exj||[]).filter(e=>g.year-e.y<=2).slice(-3).map(e=>({...e,sal:Math.round(e.nivel*e.nivel*6.3/1000)*1000}));return out}

// ---------- tick y cierre ----------
export function tick(g){const md=g.date.slice(5);for(const p of squadOf(g,g.userClubId))if(p.rehab&&p.lesion<=0)delete p.rehab;
 g.euOfertas=g.euOfertas.filter(o=>g.date<o.vence&&g.players[o.pid]);
 if(g.enVentana&&(+md.slice(0,2)===7||+md.slice(0,2)===8)&&g.euOfertas.length<2&&Math.random()<.025)ofertaEU(g)}
export function cierre(g,res){
 // reventa de ventas a Europa
 for(const e of g.europa){if(e.done||!e.pct)continue;if(g.year-e.y>=2&&Math.random()<.35){e.done=true;const m=Math.round(e.fee*e.pct*R(.8,2.2)/1000)*1000;ingreso(U(g),'ventas',m);g.news.push(`💶 ${e.nombre} fue transferido otra vez desde ${e.club}: te corresponde ${fmt(m)} de reventa`)}}
 g.exj=g.exj.filter(e=>g.year-e.y<=2);g.euOfertas=[];
 const d=g.desafio;if(!d||d.ok||d.fail)return;d.anios++;const u=U(g);
 if(d.tipo==='salvar'){if(res.relegated){d.fail=true;g.news.push('❌ Desafío fallido: el club descendió')}else if(d.anios>=3){if(u.presupuesto>0){d.ok=true;g.news.push('✅ ¡Desafío cumplido! Salvaste al club')}else{d.fail=true;g.news.push('❌ Desafío fallido: el club sigue en rojo')}}}
 else if(d.tipo==='ascenso'){const nv=g.league.def.nivel;if(nv===1){d.ok=true;g.news.push('✅ ¡Desafío cumplido! Llegaste a Primera')}else if(d.anios>=d.limite){d.fail=true;g.news.push('❌ Desafío fallido: se acabó el tiempo')}}
 else if(d.tipo==='cantera'){const n=squadOf(g,g.userClubId).filter(p=>p.cantera).length;if(d.anios>=d.limite){if(n>=10&&res.pos<=10){d.ok=true;g.news.push('✅ ¡Desafío cumplido! Un club de cantera')}else{d.fail=true;g.news.push(`❌ Desafío fallido: ${n} de cantera en el plantel`)}}}}
export const DESAFIOS={
 salvar:{n:'Salvar al club',d:'Arrancás con deudas. Evitá el descenso y terminá en positivo en 3 temporadas.',lim:3},
 ascenso:{n:'De abajo a Primera',d:'Empezás en la categoría más baja y tenés 8 temporadas para llegar a Primera.',lim:8},
 cantera:{n:'Club de cantera',d:'En 5 temporadas, tené al menos 10 jugadores formados en tu cantera y terminá top 10.',lim:5}};
export function iniciarDesafio(g,tipo){if(!DESAFIOS[tipo])return;g.desafio={tipo,anios:0,limite:DESAFIOS[tipo].lim,ok:false,fail:false,ini:g.year};
 if(tipo==='salvar'){const c=U(g);c.presupuesto=-Math.round(c.reputacion*c.reputacion*350/1e5)*1e5-3e5;g.confianza=45}
 if(tipo==='cantera'){for(const p of squadOf(g,g.userClubId).slice(0,4))p.cantera=false}}

// ---------- editor ----------
export function editClub(g,f){const c=U(g);if(f.nombre&&f.nombre.trim())c.nombre=f.nombre.trim().slice(0,32);if(f.estadio&&f.estadio.trim())c.estadio=f.estadio.trim().slice(0,40);if(f.ciudad&&f.ciudad.trim())c.ciudad=f.ciudad.trim().slice(0,30);g.editado=true;return'Club actualizado'}
export function editPlayer(g,id,f){const p=g.players[id];if(!p)return'No existe';if(f.nombre&&f.nombre.trim())p.nombre=f.nombre.trim().slice(0,32);
 if(f.edad)p.edad=C(Math.round(+f.edad),15,45);if(f.pot)p.pot=C(Math.round(+f.pot),30,99);if(f.ovr){p.ovr=C(Math.round(+f.ovr),25,99);p.pot=Math.max(p.pot,p.ovr)}g.editado=true;return`${p.nombre} actualizado`}
