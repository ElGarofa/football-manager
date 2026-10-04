// Carrera del DT: reputación, licencias, ofertas, cuerpo técnico propio, directiva (v0.9)
import {CFG} from './config.js';
import {addDays} from './league.js';
import {squadOf} from './clubs.js';
import {autoLineup} from './tactics.js';
import {fmt} from './players.js';
import {ensureClub,gasto,ingreso,ingresoProy,topeSalarial,sponsAnualAI} from './finance.js';
import {initContratos} from './sponsors.js';
import {nuevaTemporada as invNueva} from './investors.js';
import {init as scInit} from './scouting.js';
import * as PE from './people.js';
import * as YO from './youth.js';
import * as WO from './world.js';
import * as V11 from './v11.js';
import {setObjective} from './season.js';
const R=(a,b)=>a+Math.random()*(b-a),C=(x,a,b)=>Math.max(a,Math.min(b,x)),pk=a=>a[Math.random()*a.length|0],U=g=>g.clubs[g.userClubId];
export const LIC=['','Licencia C','Licencia B','Licencia A','Licencia Pro'];
export const CURSO={2:{rep:32,costo:30000,dias:60},3:{rep:52,costo:70000,dias:90},4:{rep:70,costo:140000,dias:120}};
export const ESP={Arqueros:'Los arqueros mejoran con el entrenamiento.',Físico:'Menos lesiones y mejor recuperación.','Pelota parada':'Córners y tiros libres más peligrosos.',Táctico:'Familiaridad táctica más rápida y mejor análisis del rival.',Juveniles:'La cantera crece más rápido.'};
export const sueldoDT=(g)=>Math.round(g.dt.rep*U(g).reputacion*80/1000)*1000;
export function init(g){if(g.dt)return;const c=U(g);g.dt={rep:C(Math.round(c.reputacion*.55+8),18,60),lic:1,ahorro:30000,curso:null,hist:[],ini:g.year};g.cuerpo=g.cuerpo||{};g.cand=[];g.ofertasDT=[];g.objNeg=false;g.pedido=false;g.objMod='normal';nuevosCand(g)}
const nombre=()=>`${pk(CFG.scouts.nombres)} ${pk(CFG.scouts.apellidos)}`;
export function nuevosCand(g){g.cand=[];for(const e of Object.keys(ESP))for(let i=0;i<2;i++){const n=Math.round(R(35,90));g.cand.push({id:++g.seq,nombre:nombre(),esp:e,nivel:n,sal:Math.round(n*n*9/1000)*1000})}for(const x of V11.candExJ(g))g.cand.push(x)}
export function contratar(g,id){const i=g.cand.findIndex(x=>x.id===id);if(i<0)return'Ya no está disponible';const s=g.cand[i];if(g.cuerpo[s.esp])return`Ya tenés un especialista en ${s.esp}`;if(U(g).presupuesto<s.sal*.25)return'Presupuesto insuficiente';g.cuerpo[s.esp]=s;g.cand.splice(i,1);return`${s.nombre} (${s.esp}, nivel ${s.nivel}) se suma a tu cuerpo técnico`}
export function despedirEsp(g,esp){const s=g.cuerpo[esp];if(!s)return'';delete g.cuerpo[esp];return`${s.nombre} deja el cuerpo técnico`}
export function dia(g,J){if(!g.dt)return;const c=U(g);for(const s of Object.values(g.cuerpo))gasto(c,'staff',s.sal/J);g.dt.ahorro+=sueldoDT(g)*.12/J;
 const cu=g.dt.curso;if(cu&&g.date>=cu.hasta){g.dt.lic=cu.lic;g.dt.curso=null;g.news.push(`🎓 Obtuviste la ${LIC[cu.lic]}`)}}
export function cursar(g,lic){const d=g.dt,cu=CURSO[lic];if(!cu)return'Curso inexistente';if(d.curso)return'Ya estás cursando';if(lic!==d.lic+1)return'Tenés que hacer los cursos en orden';if(d.rep<cu.rep)return`Necesitás reputación ${cu.rep} como entrenador`;if(d.ahorro<cu.costo)return`No alcanza tu dinero personal (${fmt(d.ahorro)}): el curso cuesta ${fmt(cu.costo)}`;
 d.ahorro-=cu.costo;d.curso={lic,hasta:addDays(g.date,cu.dias)};return`Empezaste la ${LIC[lic]}: termina en ${cu.dias} días`}
export function negociarObjetivo(g,modo){if(g.objNeg)return'Ya negociaste el objetivo de esta temporada';const n=g.league.ids.length,o=g.objetivo;
 if(modo==='seguro')o.max=Math.min(n-2,o.max+2);else if(modo==='ambicioso')o.max=Math.max(1,o.max-2);g.objMod=modo;g.objNeg=true;return`Objetivo acordado: terminar entre los ${o.max} primeros (${modo})`}
export function pedirPresupuesto(g){if(g.pedido)return'Ya hiciste un pedido esta temporada';g.pedido=true;const c=U(g),p=C(.2+g.confianza/150+(g.dt.rep-50)/250,.1,.85);
 if(Math.random()<p){const m=Math.round(ingresoProy(g,c)*.25/10000)*10000;ingreso(c,'directiva',m);g.confianza=C(g.confianza-2,0,100);return`La directiva aprobó un refuerzo de ${fmt(m)}`}
 g.confianza=C(g.confianza-4,0,100);return'La directiva rechazó el pedido y perdió algo de confianza'}
// ---------- ofertas de otros clubes ----------
export function genOfertas(g,bajo){const d=g.dt,u=g.userClubId,lo=bajo?15:d.rep*.6,hi=bajo?d.rep*.9+8:d.rep*1.25+12;
 const cs=Object.values(g.clubs).filter(c=>c.id!==u&&c.reputacion>=lo&&c.reputacion<=hi&&!g.ofertasDT.some(o=>o.club===c.id)).sort(()=>Math.random()-.5).slice(0,bajo?3:2);
 for(const c of cs){const rank=Object.values(g.clubs).filter(x=>x.liga===c.liga).sort((a,b)=>b.reputacion-a.reputacion).findIndex(x=>x.id===c.id)+1,n=g.leagues[c.liga].ids.length;
  g.ofertasDT.push({id:++g.seq,club:c.id,sueldo:Math.round(d.rep*c.reputacion*80/1000)*1000,anios:1+Math.floor(Math.random()*3),obj:Math.max(1,Math.min(n-2,Math.ceil(rank*.9)+1)),vence:bajo?null:addDays(g.date,45)});
  if(!bajo)g.news.push(`💼 ${c.nombre} te ofrece ser su entrenador`)}}
export function tick(g){if(!g.dt)return;g.ofertasDT=g.ofertasDT.filter(o=>!o.vence||g.date<o.vence);if(!g.despedido&&g.ofertasDT.length<2&&g.dt.rep>=40&&g.confianza>=45&&Math.random()<.004)genOfertas(g,false)}
export function cambiarClub(g,cid){const old=U(g),nw=g.clubs[cid];if(!nw)return;old.sponsAnual=sponsAnualAI(old,g);
 g.dt.hist.push({y:g.year,club:old.nombre,nota:'Salió del club',pos:null});g.userClubId=cid;ensureClub(nw,g);
 initContratos(g);g.invs=[];g.invOfertas=[];invNueva(g);g.scouts=[];g.promesas=[];scInit(g);g.juv=null;YO.init(g);g.capitan=null;g.quejas=[];g.conflictos=[];g.rumores=[];g.prensa=null;g.afic=60;g.climaB=0;PE.init(g);
 g.ofertas=[];g.confianza=60;g.despedido=false;g.curva={pos:[],pres:[]};g.finHist=[];g.objNeg=false;g.pedido=false;g.objMod='normal';
 g.lineup=autoLineup(squadOf(g,cid),g.tactic.formacion);g.fixLineup();setObjective(g);nw.topeSalarial=topeSalarial(g,nw);g.seguir=g.seguir||[];g.ofertasDT=[];WO.reset(g);
 g.news.push(`✍️ Firmaste como entrenador de ${nw.nombre}`)}
export function aceptar(g,id){const o=g.ofertasDT.find(x=>x.id===id);if(!o)return'La oferta venció';const n=g.clubs[o.club].nombre;cambiarClub(g,o.club);return`Ahora dirigís a ${n}`}
export function cierre(g,res){const d=g.dt;let r=0;if(res.ok)r+=3;else r-=3;if(res.champ)r+=4;if(res.promoted)r+=4;if(res.relegated)r-=5;if(res.copa)r+=3;if(res.intl)r+=4;
 d.rep=C(Math.round((d.rep+r)*10)/10,10,98);d.hist.push({y:g.year,club:U(g).nombre,pos:res.pos,div:res.div,nota:[res.champ?'Campeón':'',res.promoted?'Ascenso':'',res.relegated?'Descenso':'',res.copa?'Copa Argentina':'',res.intl?'Título internacional':''].filter(Boolean).join(' · ')});d.hist=d.hist.slice(-40)}
export function despedir(g){const d=g.dt;d.rep=C(d.rep-8,10,98);g.ofertasDT=[];genOfertas(g,true);g.news.push('📰 Te despidieron. Tenés ofertas de clubes más chicos.')}
export function nuevaTemporada(g){g.objNeg=false;g.pedido=false;g.objMod='normal';nuevosCand(g);if(!g.despedido)genOfertas(g,false)}
export function renunciar(g){g.despedido=true;g.dt.rep=C(g.dt.rep-2,10,98);g.ofertasDT=[];genOfertas(g,true);g.news.push('Renunciaste al club.')}
