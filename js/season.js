import {League,addDays} from './league.js';
import {squadOf} from './clubs.js';
import {autoLineup} from './tactics.js';
import {marketValue,mkPlayer} from './players.js';
import {cierre as spCierre,nuevaTemporada as spNueva} from './sponsors.js';
import {cierre as invCierre,nuevaTemporada as invNueva} from './investors.js';
import {nuevaTemporada as scNueva} from './scouting.js';
import {cierre as compCierre,nueva as compNueva,alcance} from './comp.js';
import * as PE from './people.js';
import * as YO from './youth.js';
import * as CA from './career.js';
import * as NA from './nacional.js';
import * as WO from './world.js';
import * as EX from './extras.js';
import * as V11 from './v11.js';
import {opcionesFin} from './transfers.js';
import {comision,agOf} from './market.js';
import {fmt} from './players.js';
import {fxYouth} from './facilities.js';
import {seasonEnd as finSeasonEnd,newSeason as finNewSeason,ingreso,gasto,zl,topeSalarial,pasaTope} from './finance.js';
const R=(a,b)=>a+Math.random()*(b-a),C=(x,a,b)=>Math.max(a,Math.min(b,Math.round(x)));
const TPL='POR POR DFC DFC DFC DFC LI LI LD LD MCD MC MC MCO MI MD EI ED DC DC'.split(' ');
const need=sq=>{const t=[...TPL];sq.forEach(p=>{const i=t.indexOf(p.pos);if(i>=0)t.splice(i,1)});return t[0]||'MC'};
export function renewCalc(p,o={}){const ag=agOf(p);let f=1.1+(ag.tipo==='Codicioso'?.05:0)+({alta:.05,baja:-.05}[o.rescision]||0)+(o.opcion?.04:0)-(o.bonos?.1:0);return Math.round(p.sal*f/1000)*1000}
export function renew(g,p,o={}){if(p.mor<45)return`${p.nombre} no quiere renovar`;const ns=renewCalc(p,o),com=Math.round(comision(p)*.5/1000)*1000;if(pasaTope(g,ns-p.sal))return'Supera el tope salarial que fijó la directiva';const c=g.clubs[g.userClubId];if(c.presupuesto<com)return`No alcanza para la comisión del representante (${fmt(com)})`;
 gasto(c,'comisiones',com);p.sal=ns;p.contrato=g.year+(p.edad>=33?1:3);p.clausula=p.val*({baja:1.6,media:3,alta:5}[o.rescision||'media']);delete p.bono;if(o.bonos)p.bono={pj:Math.round(ns*.1/28/1000)*1000||1000,gol:Math.round(ns*.12/10/1000)*1000||1000};if(o.opcion)p.opcion=true;return`${p.nombre} renovó hasta ${p.contrato} (comisión ${fmt(com)})`}
function grow(p,k,mu){const a=p.edad,dim=p.ovr>66?Math.max(.15,1-(p.ovr-66)/16):1,d=a<=23?((p.pot-p.ovr)*R(.12,.38)+R(0,1.2))*k*dim:(a<=28?R(-1.6,1.2):a<=31?-R(.4,2.4):-R(1.2,4.8))-(a>=24?Math.max(0,p.ovr-70)*.08+(p.ovr-mu)*.05:0),dl=Math.round(d);
 p.edad++;p.ovr=C(p.ovr+dl,30,95);
 for(const k of['vel','ace','pas','tec','tir','def','fis','res','men'])p[k]=C(p[k]+dl+R(-1,1)-(a>=30&&'vel ace res fis'.includes(k)?1:0),20,99);
 p.exp=C(p.exp+2,10,95);p.pot=a>=26?p.ovr:Math.max(p.pot,p.ovr);p.val=marketValue(p);p.clausula=p.val*3;p.sal=Math.floor(p.val*.18/1000)*1000;p.mor=70;p.cond=100;p.lesion=0;p.gol=0;p.pj=0}
export function endSeason(g){
 const Ls=Object.values(g.leagues),Y=g.year,u=g.userClubId,say=m=>g.news.push(m),cn=id=>g.clubs[id].nombre;
 for(const p of Object.values(g.players))if(!p.clubId)delete g.players[p.id];
 const ul=Ls.findIndex(l=>l.def.id==g.clubs[u].liga),pos=Ls[ul].sorted().findIndex(r=>r.id==u)+1,ob=g.objetivo;
 if(ob){const ok=pos<=ob.max;g.confianza=Math.max(0,Math.min(100,g.confianza+(ok?15:-Math.min(30,10+5*(pos-ob.max))*(g.objMod==='ambicioso'?1.3:1))+(pos==1?10:0)));say(ok?`✅ Objetivo cumplido (${pos}º). Confianza: ${g.confianza}`:`❌ No cumpliste el objetivo (${pos}º, pedían ${ob.max}º). Confianza: ${g.confianza}`);if(ok)ingreso(g.clubs[u],'premios',Math.round(g.clubs[u].reputacion**2*300*({seguro:.7,ambicioso:1.5}[g.objMod]||1)));if(g.confianza<=0)g.despedido=true}
 {const n=Ls[ul].ids.length;spCierre(g,{ok:!!ob&&pos<=ob.max,champ:pos===1,promoted:ul>0&&pos<=2,relegated:ul<Ls.length-1&&pos>n-2});invCierre(g,pos);if(g.clubs[u].presupuesto<0){g.confianza=Math.max(0,g.confianza-10);say('⚠️ Cerraste la temporada con presupuesto negativo: la directiva pierde confianza.');if(g.confianza<=0)g.despedido=true}}
 opcionesFin(g);{const L=Ls[ul],n=L.ids.length;CA.cierre(g,{pos,div:L.def.nombre,ok:!!ob&&pos<=ob.max,champ:pos===1,promoted:ul>0&&pos<=2,relegated:ul<Ls.length-1&&pos>n-2,copa:alcance(g,'copa')==='Campeón',intl:alcance(g,'lib')==='Campeón'||alcance(g,'sud')==='Campeón'})}
 EX.cierre(g,{pos,div:Ls[ul].def.nombre,ok:!!ob&&pos<=ob.max,champ:pos===1,promoted:ul>0&&pos<=2,relegated:ul<Ls.length-1&&pos>Ls[ul].ids.length-2,copa:alcance(g,'copa')==='Campeón',libCampeon:alcance(g,'lib')==='Campeón',sudCampeon:alcance(g,'sud')==='Campeón'});
 V11.cierre(g,{pos,relegated:ul<Ls.length-1&&pos>Ls[ul].ids.length-2});
 NA.cobroAnual(g);
 for(const p of Object.values(g.players))if(p.prestamo){const c=g.clubs[p.clubId],o=g.clubs[p.prestamo.de];if(c)c.plantilla=c.plantilla.filter(i=>i!==p.id);p.clubId=o.id;o.plantilla.push(p.id);p.contrato=p.prestamo.k;delete p.prestamo}
 g.hist.push({y:Y,camp:cn(Ls[0].sorted()[0].id)});
 const ord=Ls.map(L=>L.sorted().map(r=>r.id)),ids=ord.map(o=>[...o]);finSeasonEnd(g,ord);{const L=Ls[ul];g.carrera.push({y:Y,liga:L.def.nombre,nivel:L.def.nivel,pos,pts:L.table[u].pts,copa:alcance(g,'copa'),lib:alcance(g,'lib'),sud:alcance(g,'sud')});g.carrera=g.carrera.slice(-30)}compCierre(g,ord);
 for(let k=0;k<Ls.length-1;k++){const down=ord[k].slice(-2),up=ord[k+1].slice(0,2);ids[k]=ids[k].filter(i=>!down.includes(i)).concat(up);ids[k+1]=ids[k+1].filter(i=>!up.includes(i)).concat(down)}
 ids.forEach((a,k)=>a.forEach(id=>{const c=g.clubs[id];if(c.liga!==Ls[k].def.id){if(id==u)say(`${Ls.findIndex(l=>l.def.id==c.liga)>k?'🎉 ¡Ascendiste':'⬇️ Descendiste'} a ${Ls[k].def.nombre}!`);c.liga=Ls[k].def.id;c.division=Ls[k].def.nombre}}));
 for(const p of Object.values(g.players)){(p.h=p.h||[]).push([Y,p.ovr,p.pot,p.pj||0,p.gol||0]);if(p.h.length>15)p.h.shift();grow(p,(g.clubs[p.clubId]?.cuerpoTecnico.entrenador??65)/65*(g.clubs[p.clubId]?fxYouth(g.clubs[p.clubId]):1),g.clubs[p.clubId]?30+.55*g.clubs[p.clubId].reputacion:45);
  if(p.edad>=36||(p.edad>=34&&Math.random()<.35)){const c=g.clubs[p.clubId];if(c){c.plantilla=c.plantilla.filter(i=>i!==p.id);if(p.clubId==u){say(`${p.nombre} se retiró (${p.edad} años)`);V11.retiro(g,p)}}delete g.players[p.id]}}
 for(const p of Object.values(g.players)){const c=g.clubs[p.clubId];
  if(c&&p.contrato<=Y&&p.opcion&&p.clubId==u){p.contrato=Y+1;delete p.opcion;say(`Se activó la opción de renovación de ${p.nombre}`)}else if(c&&p.contrato<=Y){if(p.clubId==u||(Math.random()<.15&&c.plantilla.length>18)){c.plantilla=c.plantilla.filter(i=>i!==p.id);p.clubId=0;if(c.id==u)say(`${p.nombre} dejó el club (contrato vencido)`)}else p.contrato=Y+Math.round(R(1,3))}}
 const free=Object.values(g.players).filter(p=>!p.clubId).sort((a,b)=>b.ovr-a.ovr);let nid=Math.max(...Object.keys(g.players).map(Number))+1;
 for(const c of Object.values(g.clubs)){while(c.plantilla.length<(c.id===u?18:20)){const pos=need(squadOf(g,c.id)),i=c.id===u||Math.random()<.5?-1:free.findIndex(p=>p.pos===pos),p=i>=0?free.splice(i,1)[0]:mkPlayer(nid++,c.id,c.reputacion,pos,(zl(c,'cantera')-5)*1.5);g.players[p.id]=p;p.clubId=c.id;p.contrato=Y+Math.round(R(1,3));c.plantilla.push(p.id)}}
 WO.cierre(g,ids,Ls);
 const ini=addDays(Ls[0].def.inicio,364);
 Ls.forEach((L,k)=>{g.leagues[L.def.id]=new League({...L.def,inicio:ini,clubes:ids[k]},ids[k])});
 compNueva(g,ini);PE.nuevaTemporada(g);YO.cierre(g);CA.nuevaTemporada(g);if(g.despedido)CA.despedir(g);g.curva={pos:[],pres:[]};finNewSeason(g);{const uc=g.clubs[u];uc.topeSalarial=topeSalarial(g,uc)}spNueva(g);invNueva(g);scNueva(g);g.lineup=autoLineup(squadOf(g,u),g.tactic.formacion);g.news=g.news.slice(-40);g.ofertas=[];setObjective(g);say(`Comienza la temporada ${g.year}`)}
export function setObjective(g){const c=g.clubs[g.userClubId],L=g.league,n=L.ids.length,rk=[...L.ids].sort((a,b)=>g.clubs[b].reputacion-g.clubs[a].reputacion).indexOf(c.id)+1;g.objetivo={max:Math.max(1,Math.min(n-2,Math.ceil(rk*.9)+1-(g.mundo&&g.mundo.pres.perfil==='Ambicioso'?1:0)))}}
