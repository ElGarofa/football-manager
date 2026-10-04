// Personas: personalidades, capitán, charlas, prensa, rumores, quejas y disciplina (v0.9)
import {addDays} from './league.js';
import {squadOf} from './clubs.js';
import {ingreso,gasto} from './finance.js';
import {fmt} from './players.js';
const R=(a,b)=>a+Math.random()*(b-a),pk=a=>a[Math.random()*a.length|0],C=(x,a,b)=>Math.max(a,Math.min(b,x));
export const PERS=['Líder','Profesional','Ambicioso','Leal','Conflictivo','Vago'];
export const PERS_TXT={Líder:'Referente natural: sostiene al grupo.',Profesional:'Cumple siempre, rinde en cualquier clima.',Ambicioso:'Quiere jugar siempre y crecer; se inquieta si no juega.',Leal:'Cuida al club; difícil que arme líos.',Conflictivo:'Talentoso pero arma problemas en el vestuario.',Vago:'Necesita que lo exijan; se relaja si no.'};
export function persOf(p){if(!p.pers){const h=(p.id*2654435761>>>0)%100;p.pers=p.exp>=70&&h<35?'Líder':h<22?'Profesional':h<40?'Ambicioso':h<62?'Leal':h<80?'Conflictivo':'Vago';if(p.exp>=70&&h<35)p.pers='Líder'}return p.pers}
const u=g=>g.clubs[g.userClubId];
const sq=g=>squadOf(g,g.userClubId);
const nm=(g,id)=>g.players[id]?.nombre||'?';
export function autoCapitan(g){const s=sq(g);if(g.capitan&&s.some(p=>p.id===g.capitan))return g.capitan;const b=[...s].sort((a,b)=>(persOf(b)==='Líder'?25:0)+b.exp+b.ovr*.3-((persOf(a)==='Líder'?25:0)+a.exp+a.ovr*.3))[0];g.capitan=b?.id;return g.capitan}
export function setCapitan(g,id){const p=g.players[id];if(!p||p.clubId!==g.userClubId)return'Jugador inválido';g.capitan=id;s_news(g,`🎖️ ${p.nombre} es el nuevo capitán`);return`${p.nombre} es el capitán`}
const s_news=(g,m)=>g.news.push(m);
export function climaOf(g){const s=sq(g).filter(p=>!p.prestamo||p.clubId===g.userClubId);if(!s.length)return 60;const top=[...s].sort((a,b)=>b.ovr-a.ovr).slice(0,18),mor=top.reduce((a,p)=>a+p.mor,0)/top.length;
 const cap=g.players[autoCapitan(g)],cb=cap?(persOf(cap)==='Líder'?6:persOf(cap)==='Profesional'?3:0):0;
 return Math.round(C(mor+cb-6*(g.conflictos?.length||0)+(g.climaB||0),0,100))}
export const moralMult=g=>{const cap=g.players[g.capitan];if(!cap)return 1;const p=persOf(cap);return p==='Líder'?.8:p==='Profesional'?.9:1}
// ---------- charlas ----------
export const TONOS={Motivar:{Líder:4,Profesional:3,Ambicioso:5,Leal:4,Conflictivo:2,Vago:3},Calmar:{Líder:2,Profesional:2,Ambicioso:0,Leal:3,Conflictivo:4,Vago:1},Exigir:{Líder:3,Profesional:4,Ambicioso:3,Leal:0,Conflictivo:-4,Vago:-3},Confiar:{Líder:3,Profesional:2,Ambicioso:1,Leal:5,Conflictivo:1,Vago:4}};
export const TONO_TXT={Motivar:'Levanta a todos, sobre todo a los ambiciosos.',Calmar:'Baja la tensión; ideal con conflictivos.',Exigir:'Funciona con profesionales; los vagos y conflictivos lo sufren.',Confiar:'Premia a los leales y a los vagos.'};
export function charla(g,tono,medio,xi){if(!TONOS[tono])return'Tono inválido';if(!medio&&g.charlaUsada===g.date)return'Ya diste la charla de hoy';
 const lic=g.dt?.lic||1,f=(medio?.6:1)*(1+.06*(lic-1)),cap=g.players[g.capitan],capB=cap&&persOf(cap)==='Líder'?1.1:1;let tot=0,n=0;
 const ps=medio?(xi||[]):sq(g).filter(p=>p.lesion<=0&&!p.no);
 for(const p of ps){const d=Math.round(TONOS[tono][persOf(p)]*f*capB*(TONOS[tono][persOf(p)]>0?C((100-p.mor)/40,.15,1):1));p.mor=C(p.mor+d,10,100);tot+=d;n++}
 if(!medio)g.charlaUsada=g.date;return`Charla "${tono}": moral ${tot>=0?'+':''}${n?(tot/n).toFixed(1):0} en promedio`}
// ---------- prensa ----------
const OPS=(t,c,a,k,x)=>({t,c,a,k,x}); // texto, clima, afición, confianza, extra
const BANK={
 D:[{q:'¿Qué le pasó al equipo hoy?',o:[OPS('Asumo toda la responsabilidad',2,1,2),OPS('El arbitraje nos perjudicó',3,-1,-2),OPS('Hay que trabajar y mirar para adelante',1,0,0)]},{q:'¿Piensa renunciar si siguen los malos resultados?',o:[OPS('Jamás, tengo un plan',2,1,-1),OPS('Eso lo decide la directiva',-1,-1,2),OPS('No hablo de eso',0,-1,0)]}],
 V:[{q:'¿Se siente candidato?',o:[OPS('Vamos partido a partido',1,0,1),OPS('Sí, vamos por todo',2,4,-2),OPS('Todavía falta mucho',-1,-1,1)]},{q:'¿Qué destacaría del equipo hoy?',o:[OPS('El esfuerzo de todos',3,1,0),OPS('El talento individual',-1,2,0),OPS('La táctica que preparamos',1,0,2)]}],
 E:[{q:'¿Conforme con el empate?',o:[OPS('Un punto es un punto',0,-1,1),OPS('Merecimos más',2,1,-1),OPS('Fue injusto para los dos',0,0,0)]}],
 X:[{q:'¿Necesita refuerzos?',o:[OPS('Sí, el plantel es corto',2,1,-2),OPS('Con este plantel alcanza',-2,0,2),OPS('Lo decide la directiva',0,0,1)]},{q:'¿Cumplirá el objetivo de la temporada?',o:[OPS('Sí, sin dudas',1,2,2,'riesgo'),OPS('Va a ser difícil',-1,-1,-1),OPS('Prefiero no prometer nada',0,0,0)]},{q:'¿Hay problemas en el vestuario?',o:[OPS('Todo muy bien',1,0,0),OPS('Estamos trabajando algunas cosas',-1,1,1),OPS('Eso queda puertas adentro',2,0,0)]},{q:'¿Cómo ve la competencia en la Copa?',o:[OPS('Es un objetivo importante',1,2,0),OPS('La liga es la prioridad',0,-1,2),OPS('Vamos a ver',0,0,0)]}]};
export function prensaGen(g){if(g.prensa)return;const c=u(g),res=c.forma?.at(-1)||'X',pool=Math.random()<.55&&BANK[res]?BANK[res]:BANK.X,q=pk(pool);g.prensa={id:++g.seq,q:q.q,o:q.o,fecha:g.date}}
export function prensaResp(g,i){const p=g.prensa;if(!p)return'Ya no hay conferencia';const o=p.o[i];g.prensa=null;const lic=1+.04*((g.dt?.lic||1)-1);
 let c=o.c*lic,a=o.a*lic,k=o.k*lic;if(o.x==='riesgo'&&Math.random()<.4){a=-a;k=-k}
 g.climaB=C((g.climaB||0)+c*2,-20,20);g.afic=C((g.afic??60)+a,0,100);g.confianza=C(g.confianza+Math.round(k),0,100);
 return`Respondiste: "${o.t}" (vestuario ${c>=0?'+':''}${Math.round(c*2)}, afición ${a>=0?'+':''}${Math.round(a)}, directiva ${k>=0?'+':''}${Math.round(k)})`}
// ---------- quejas, rumores, promesas (cada fecha de liga) ----------
export function dia(g){const c=u(g),s=sq(g).filter(p=>!p.prestamo||true);g.quejas=g.quejas||[];g.conflictos=g.conflictos||[];g.rumores=g.rumores||[];
 g.climaB=Math.round((g.climaB||0)*.85*10)/10;g.afic=C((g.afic??60)+(((c.forma?.filter(x=>x==='V').length||0)-(c.forma?.filter(x=>x==='D').length||0))*.3+(60-(g.afic??60))*.03),0,100);
 const clm=climaOf(g),top=[...s].sort((a,b)=>b.ovr-a.ovr),starter=new Set(top.slice(0,14).map(p=>p.id));
 for(const p of s){ // moral tiende al clima del grupo
  p.mor=C(p.mor+(60+(clm-60)*.3-p.mor)*.12,10,100);
  if(p.prom){if(g.date>p.prom.hasta){if(p.prom.n>=p.prom.need){p.mor=C(p.mor+4,0,100)}else{p.mor=C(p.mor-8,0,100);g.news.push(`😠 ${p.nombre} se queja: no cumpliste la promesa de minutos`)}delete p.prom}}
  if((p.nj||0)>=4&&starter.has(p.id)&&p.lesion<=0&&!p.no&&!p.prom&&g.quejas.length<5&&!g.quejas.some(q=>q.pid===p.id)){const pr={Ambicioso:.5,Conflictivo:.45,Líder:.12,Profesional:.15,Leal:.12,Vago:.2}[persOf(p)];if(Math.random()<pr)g.quejas.push({id:++g.seq,tipo:'minutos',pid:p.id,fecha:g.date})}}
 for(const p of s)if(persOf(p)==='Conflictivo'&&Math.random()<.02&&g.conflictos.length<2&&g.quejas.length<5){const o=pk(s.filter(x=>x.id!==p.id));if(o&&!g.quejas.some(q=>q.pid===p.id))g.quejas.push({id:++g.seq,tipo:'conflicto',pid:p.id,otro:o.id,fecha:g.date})}
 g.conflictos=g.conflictos.filter(x=>g.date<x.hasta);
 g.quejas=g.quejas.filter(q=>g.players[q.pid]?.clubId===g.userClubId&&(q.tipo!=='conflicto'||g.players[q.otro]?.clubId===g.userClubId)&&dias(q.fecha,g.date)<22);
 // rumores
 g.rumores=g.rumores.filter(r=>{if(g.date<r.hasta)return true;const p=g.players[r.pid];if(p&&p.clubId===g.userClubId&&g.enVentana&&Math.random()<.5&&!g.ofertas.some(o=>o.pid===p.id)){g.ofertas.push({club:r.club,pid:p.id,monto:Math.round(p.val*R(1,1.3)/1000)*1000});g.news.push(`📨 ${g.clubs[r.club].nombre} concreta una oferta por ${p.nombre}`)}return false});
 if(Math.random()<.1&&g.rumores.length<2){const p=pk(top.slice(0,8)),cs=Object.values(g.clubs).filter(x=>x.id!==c.id&&x.presupuesto>p.val*1.5);if(p&&cs.length){const cl=pk(cs);g.rumores.push({pid:p.id,club:cl.id,hasta:addDays(g.date,10)});if(persOf(p)==='Ambicioso')p.mor=C(p.mor-3,0,100);g.news.push(`🗞️ Rumor: ${cl.nombre} quiere a ${p.nombre}`)}}
 if(g.prensa&&dias(g.prensa.fecha,g.date)>=7){g.prensa=null;g.afic=C(g.afic-1,0,100)}
 prensaGen(g)}
const dias=(a,b)=>Math.round((new Date(b)-new Date(a))/864e5);
export function quejaResp(g,id,op){const q=g.quejas.find(x=>x.id===id);if(!q)return'Ya no está';const p=g.players[q.pid];g.quejas=g.quejas.filter(x=>x.id!==id);if(!p)return'';
 if(q.tipo==='minutos'){if(op==='prometer'){p.prom={hasta:addDays(g.date,35),need:2,n:0};p.mor=C(p.mor+6,0,100);return`Le prometiste minutos a ${p.nombre}: tiene que jugar al menos 2 partidos en 5 semanas`}
  if(op==='ignorar'){p.mor=C(p.mor-(persOf(p)==='Ambicioso'?8:5),0,100);return`${p.nombre} se fue molesto`}
  p.venta=true;p.mor=C(p.mor-3,0,100);return`${p.nombre} queda en la lista de transferibles: van a llegar ofertas`}
 const o=g.players[q.otro];if(op==='mediar'){const ok=Math.random()<.55+.05*((g.dt?.lic||1)-1)+(persOf(g.players[g.capitan]||{})==='Líder'?.1:0);if(ok){p.mor=C(p.mor+3,0,100);if(o)o.mor=C(o.mor+3,0,100);return'Mediaste con éxito: se arreglaron'}g.conflictos.push({a:p.id,b:o?.id,hasta:addDays(g.date,20)});return'La mediación no funcionó: el conflicto sigue unos días'}
 if(op==='multar'){const m=Math.round(p.sal*.1);ingreso(u(g),'multas',m);p.mor=C(p.mor-4,0,100);if(o)o.mor=C(o.mor-2,0,100);return`Multa a ${p.nombre} por ${fmt(m)}`}
 g.conflictos.push({a:p.id,b:o?.id,hasta:addDays(g.date,20)});return'Ignoraste el problema: baja el clima del grupo'}
export function minutos(g,r){const us=g.userClubId;for(const[id]of r.played||[]){const p=g.players[id];if(p&&p.clubId===us){p.nj=0;if(p.prom)p.prom.n++}}
 if(r.h===us||r.a===us){const jug=new Set((r.played||[]).map(x=>x[0]));for(const p of sq(g))if(!jug.has(p.id)&&p.lesion<=0&&!p.no)p.nj=(p.nj||0)+1}}
// ---------- disciplina ----------
export function disciplina(g,r){for(const[id,t]of r.cards||[]){const p=g.players[id];if(!p)continue;const mine=p.clubId===g.userClubId;
  if(t==='r'){p.susp=Math.random()<.2?2:1;p.sNew=true;if(mine){g.news.push(`🟥 ${p.nombre} queda suspendido ${p.susp} fecha${p.susp>1?'s':''}`);gasto(u(g),'multas',Math.round(p.sal*.05))}}
  else{p.am=(p.am||0)+1;if(p.am%5===0){p.susp=1;p.sNew=true;if(mine)g.news.push(`🟨 ${p.nombre} se pierde la próxima fecha por acumulación de amarillas`)}}}}
export function cierreFecha(g,L){for(const id of L.ids)for(const i of g.clubs[id].plantilla){const p=g.players[i];if(p?.susp>0){if(p.sNew)delete p.sNew;else p.susp--}}}
export function nuevaTemporada(g){for(const p of Object.values(g.players)){p.am=0;p.susp=0;p.nj=0;delete p.sNew;delete p.prom}g.quejas=[];g.conflictos=[];g.rumores=[];g.climaB=0}
export function alertas(g){const s=sq(g);return{quejas:(g.quejas||[]).length,prensa:g.prensa?1:0,susp:s.filter(p=>p.susp>0).length,lesion:s.filter(p=>p.lesion>0).length,ofertas:g.ofertas.length}}
export function init(g){g.afic=g.afic??60;g.climaB=g.climaB||0;g.quejas=g.quejas||[];g.conflictos=g.conflictos||[];g.rumores=g.rumores||[];g.prensa=g.prensa||null;autoCapitan(g)}
