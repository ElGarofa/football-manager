import {League,addDays} from './league.js';
import {autoLineup,DEFAULT_TACTIC,FORMATIONS,setFormation} from './tactics.js';
import {simulate} from './matches.js';
import {squadOf} from './clubs.js';
import {fxRecov,fxTrain,fxMoral,tickObras} from './facilities.js';
import {ensureClub,dayFinance,matchIncome,formaPush,topeSalarial,gasto} from './finance.js';
import {initContratos,tick as tickSp} from './sponsors.js';
import {nuevaTemporada as invNueva,tick as tickInv,dia as invDia} from './investors.js';
import {init as scInit,tick as tickSc,dia as scDia} from './scouting.js';
import {pendientes,regMatch,avanzar,avanzarTodos,extSetup,quick,nueva as compNueva,omitir,EXT0} from './comp.js';
import * as PE from './people.js';
import * as YO from './youth.js';
import {aiMarket,cierreDia} from './transfers.js';
import {enVentana} from './market.js';
import {setObjective} from './season.js';
import * as CA from './career.js';
import * as NA from './nacional.js';
import * as WO from './world.js';
import * as EX from './extras.js';
import * as V11 from './v11.js';
export class Game{
 static create(data,cid){const g=new Game(),lg=data.leagues[0],fs=Object.keys(FORMATIONS);
  g.clubs=Object.fromEntries(data.clubs.map(c=>[c.id,c]));g.players=Object.fromEntries(data.players.map(p=>[p.id,p]));
  Object.values(g.clubs).forEach(c=>c.formacion=fs[c.id%fs.length]);
  g.leagues=Object.fromEntries(data.leagues.map(l=>[l.id,new League(l,l.clubes)]));g.date=addDays(data.leagues[0].inicio,-6);g.userClubId=cid;g.tactic={...DEFAULT_TACTIC};
  g.lineup=autoLineup(squadOf(g,cid),g.tactic.formacion);g.training='Equilibrado';g.news=['Bienvenido, míster.'];g.fin={ing:0,gas:0};g.hist=[];g.live=true;g.ofertas=[];g.confianza=60;g.custom={};Object.values(g.clubs).forEach(c=>ensureClub(c,g));g.migrate();setObjective(g);return g}
 static from(o){const g=Object.assign(new Game(),o);g.custom=g.custom||{};for(const[k,v]of Object.entries(g.custom))setFormation(k,v);g.leagues={};for(const k in o.leagues)g.leagues[k]=Object.assign(new League(o.leagues[k].def,o.leagues[k].ids),o.leagues[k]);g.migrate();return g}
 migrate(){Object.values(this.clubs).forEach(c=>ensureClub(c,this));this.finHist=this.finHist||[];const c=this.clubs[this.userClubId];if(!this.contratos){this.seq=1000;this.invs=[];this.invOfertas=[];initContratos(this);invNueva(this)}scInit(this);this.enVentana=enVentana(this.date);PE.init(this);YO.init(this);CA.init(this);NA.init(this);WO.init(this);EX.init(this);V11.init(this);this.curva=this.curva||{pos:[],pres:[]};this.carrera=this.carrera||[];this.pal=this.pal||[];this.reps=this.reps||[];if(!this.comps){const ini=this.league.def.inicio;compNueva(this,ini);if(this.date>addDays(ini,14))omitir(this)}if(!c.topeSalarial)c.topeSalarial=topeSalarial(this,c)}
 get league(){return this.leagues[this.clubs[this.userClubId].liga]}
 get year(){return +this.league.def.inicio.slice(0,4)}
 get allDone(){return Object.values(this.leagues).every(l=>l.done)&&Object.values(this.comps||{}).every(c=>c.done)}
 expiring(){return squadOf(this,this.userClubId).filter(p=>p.contrato<=this.year)}
 fixLineup(){const u=this.userClubId,ok=id=>this.players[id]&&this.players[id].clubId==u,L=this.lineup;
  if(L.xi.some(id=>!ok(id)||this.players[id].lesion>0||this.players[id].no)){this.lineup=autoLineup(squadOf(this,u),this.tactic.formacion);this.news.push('Se ajustó la alineación por bajas o lesiones.')}else L.bench=L.bench.filter(ok)}
 playComps(){const u=this.userClubId;let played=false;
  for(const[c,m]of pendientes(this,this.date)){if(m.h===u||m.a===u){played=true;if(this.live){this.pend={kind:'comp',key:c.key,mid:m.id,m:{h:m.h,a:m.a}};continue}regMatch(this,c,m,simulate(this.setup(m.h),this.setup(m.a)))}else regMatch(this,c,m,quick(this,m.h,m.a))}
  if(!this.pend)avanzarTodos(this);return played}
 setup(id){if(id>=EXT0)return extSetup(this,id);const c=this.clubs[id],pl=a=>a.map(i=>this.players[i]);
  if(id==this.userClubId){this.fixLineup();return{club:c,xi:pl(this.lineup.xi),bench:pl(this.lineup.bench).filter(p=>p.lesion<=0&&!p.no),tactic:this.tactic,clima:WO.climaFor(this,id),roles:V11.rolesDe(this),...WO.userExtras(this)}}
  const t={...DEFAULT_TACTIC,formacion:c.formacion,mentalidad:c.reputacion>75?'Ofensiva':c.reputacion<55?'Defensiva':'Equilibrada'},l=autoLineup(squadOf(this,id),t.formacion);
  return{club:c,xi:pl(l.xi),bench:pl(l.bench),tactic:t,clima:WO.climaFor(this,id)}}
 advanceDay(){if(this.allDone)return false;let played=false;
  CA.tick(this);NA.tick(this);WO.tick(this);V11.tick(this);this.enVentana=enVentana(this.date);if(this.enVentana){aiMarket(this);cierreDia(this)}else if(this.ofertas.length)this.ofertas=[];
  for(const p of Object.values(this.players))p.no=!!(p.susp>0||(p.aus&&p.aus>=this.date));
  for(const L of Object.values(this.leagues))if(!L.done&&this.date==L.date(L.j)){this.playMatchday(L,this.live);if(L===this.league)played=true}
  if(this.playComps())played=true;
  this.date=addDays(this.date,1);tickObras(this);tickSp(this);tickInv(this);tickSc(this);
  for(const p of Object.values(this.players)){const mine=p.clubId==this.userClubId;const cb=this.clubs[p.clubId];p.cond=Math.min(100,p.cond+4+(cb?fxRecov(cb):1)+(mine&&this.training=='Descanso'?4:0));if(p.lesion>0&&--p.lesion==0)p.cond=Math.min(p.cond,70);
   if(mine&&this.cuerpo?.Físico&&p.lesion>1&&Math.random()<this.cuerpo.Físico.nivel/250)p.lesion--;
   if(mine&&Math.random()<.03*(.6+cb.cuerpoTecnico.entrenador/100)*fxTrain(cb)*(p.edad<29?1:.3)*(1+.05*((this.dt?.lic||1)-1))*(p.pos=='POR'&&this.cuerpo?.Arqueros?1+this.cuerpo.Arqueros.nivel/100:1)){const k={Físico:['fis','res','vel'],Técnico:['tec','pas','tir'],Equilibrado:['fis','tec','pas','def']}[this.training];if(k){const a=k[Math.random()*k.length|0];if(p[a]<99)p[a]++}}}
  return played}
 playMatchday(L,live){const j=L.j,u=this.userClubId;let wait=false;
  for(const m of L.fixtures[j]){if(live&&L===this.league&&(m.h==u||m.a==u)){this.pend={lg:L.def.id,m};wait=true;continue}this.store(L,simulate(this.setup(m.h),this.setup(m.a)))}
  if(!wait)this.closeDay(L)}
 store(L,r){const u=this.userClubId,n=id=>this.clubs[id].nombre;r.j=L.j+1;r.date=this.date;L.record(r);this.after(r);
  if(L!==this.league){delete r.ev;delete r.top;delete r.played;delete r.inj;delete r.gl}
  if(r.h==u||r.a==u)this.news.push(`J${r.j}: ${n(r.h)} ${r.hg}-${r.ag} ${n(r.a)}`)}
 closeDay(L){const u=this.userClubId;L.j++;PE.cierreFecha(this,L);if(L===this.league){PE.dia(this);YO.dia(this);CA.dia(this,L.fixtures.length)}
  dayFinance(this,L);if(L===this.league){invDia(this,L.fixtures.length);scDia(this,L.fixtures.length);this.curva.pos.push(L.sorted().findIndex(r=>r.id==u)+1);this.curva.pres.push(Math.round(this.clubs[u].presupuesto))}
  if(L===this.league){if(L.done)this.news.push('¡Terminó la temporada! Campeón: '+this.clubs[L.sorted()[0].id].nombre)}}
 finishLive(r){if(this.pend.kind==='comp'){const p=this.pend,c=this.comps[p.key],m=[...c.grupos||[]].flatMap(x=>x.ms).concat(c.rondas.flatMap(x=>x.ties.flatMap(t=>t.ms))).find(x=>x.id===p.mid);this.pend=null;regMatch(this,c,m,r);avanzarTodos(this);return}const L=this.leagues[this.pend.lg];this.pend=null;this.store(L,r);this.closeDay(L)}
 after(r){const hc=this.clubs[r.h],ac=this.clubs[r.a];if(hc)matchIncome(this,r);const rs=Math.sign(r.hg-r.ag);if(hc)formaPush(hc,rs>0?'V':rs<0?'D':'E');if(ac)formaPush(ac,rs>0?'D':rs<0?'V':'E');
  r.played.forEach(([id,fat])=>{const p=this.players[id];if(!p)return;const s=p.clubId==r.h?Math.sign(r.hg-r.ag):Math.sign(r.ag-r.hg);p.cond=Math.max(30,p.cond-fat);p.pj=(p.pj||0)+1;p.mor=Math.max(20,Math.min(100,p.mor+s*3*(s<0?fxMoral(this.clubs[p.clubId])*(p.clubId==this.userClubId?PE.moralMult(this):1):1)))});PE.disciplina(this,r);WO.partido(this,r);EX.partido(this,r);PE.minutos(this,r);{const uc=this.clubs[this.userClubId];for(const[id]of r.played){const p=this.players[id];if(p&&p.clubId==uc.id&&p.bono)gasto(uc,'bonos',p.bono.pj)}for(const id of r.gl){const p=this.players[id];if(p&&p.clubId==uc.id&&p.bono)gasto(uc,'bonos',p.bono.gol)}}
  r.inj.forEach(([id,d,t])=>{const p=this.players[id];if(!p)return;p.lesion=d;p.tipo=t;if(p.clubId==this.userClubId)this.news.push(`🩹 ${p.nombre}: ${t}, ${d} días`)});
  r.gl.forEach(id=>{const p=this.players[id];if(p)p.gol=(p.gol||0)+1})}
}
