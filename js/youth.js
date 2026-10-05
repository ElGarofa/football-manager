// Cantera: Reserva y Sub-17, captación, mentores, torneos juveniles (v0.9)
import {League} from './league.js';
import {mkPlayer,marketValue,fmt} from './players.js';
import {zl,gasto,ingreso} from './finance.js';
import {fxYouth} from './facilities.js';
import {persOf} from './people.js';
import {squadOf} from './clubs.js';
const R=(a,b)=>a+Math.random()*(b-a),C=(x,a,b)=>Math.max(a,Math.min(b,Math.round(x))),pk=a=>a[Math.random()*a.length|0],U=g=>g.clubs[g.userClubId];
export const MAXJ=24,MAXCONV=4,costoRed=l=>Math.round(20000*(l+1)**2/1000)*1000,costoConv=g=>Math.round(14000*Math.pow(U(g).reputacion/50,1.3)/1000)*1000;
const POS=['POR','DFC','DFC','LI','LD','MCD','MC','MC','MCO','MI','MD','EI','ED','DC','DC'];
const staffJ=g=>g.cuerpo?.Juveniles?.nivel||0;
export function mkJoven(g,boost=0,region){const c=U(g),rep=20+zl(c,'cantera')*2+(g.juv?.red||0)*2+R(-8,8)+boost,p=mkPlayer(0,c.id,rep,pk(POS));
 p.id=-(++g.seq);p.edad=Math.random()<.5?16:17;p.ovr=C(p.ovr,28,52);p.pot=C(p.ovr+R(12,32)+zl(c,'cantera')*.9+boost*.6,p.ovr,93);p.val=marketValue(p);p.sal=0;p.contrato=0;p.pj=0;p.gol=0;p.cantera=true;if(region)p.region=region;return p}
export function init(g){if(g.juv)return;g.juv={R:[],S:[],tor:{},red:0,convenios:[],mentores:[],hist:[],ofrecidos:[]};
 const cs=Object.values(g.clubs).filter(c=>c.id!==g.userClubId&&g.leagues[c.liga]?.def.nivel>=4).sort(()=>Math.random()-.5),seen=new Set();
 for(const c of cs){if(!seen.has(c.provincia)&&g.juv.ofrecidos.length<8){seen.add(c.provincia);g.juv.ofrecidos.push(c.id)}}
 for(let i=0;i<8;i++)g.juv.S.push(mkJoven(g));for(let i=0;i<8;i++){const p=mkJoven(g,6);p.edad=Math.round(R(18,21));p.ovr=C(p.ovr+p.edad-16,30,60);p.pot=Math.max(p.pot,p.ovr);g.juv.R.push(p)}
 nuevoTorneo(g)}
function nuevoTorneo(g){const L=g.league,ids=L.ids.filter(i=>i!==g.userClubId).sort(()=>Math.random()-.5).slice(0,11);
 for(const k of['R','S']){const all=[g.userClubId,...ids];g.juv.tor[k]={ids:all,fx:League.fixtures(all),j:0,tabla:Object.fromEntries(all.map(i=>[i,{id:i,pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0}]))}}}
export const tabla=(g,k)=>Object.values(g.juv.tor[k].tabla).sort((x,y)=>y.pts-x.pts||(y.gf-y.gc)-(x.gf-x.gc)||y.gf-x.gf||x.id-y.id);
const pois=l=>{let k=0,p=1;const L=Math.exp(-l);do{k++;p*=Math.random()}while(p>L);return k-1};
const once=(g,k)=>{const sq=g.juv[k],xi=[...sq].sort((a,b)=>b.ovr-a.ovr).slice(0,11);return{xi,f:xi.length<11?36:xi.reduce((s,p)=>s+p.ovr,0)/11}};
const mentorOf=(g,p)=>g.juv.mentores.find(m=>m.jid===p.id);
export function dia(g){const J=g.juv;if(!J)return;
 for(const k of['R','S']){const t=J.tor[k],sq=J[k],{xi,f}=once(g,k),fx=fxYouth(U(g))*(1+staffJ(g)/300);
  const fr=t.fx[t.j];if(fr){for(const m of fr){const sf=i=>i===g.userClubId?f+1:(k==='R'?24+g.clubs[i].reputacion*.5-2:24+g.clubs[i].reputacion*.5-6)+R(-3,3),d=sf(m.h)-sf(m.a),hg=pois(1.4*Math.exp(d/18+.08)),ag=pois(1.1*Math.exp(-d/18)),H=t.tabla[m.h],A=t.tabla[m.a];
    H.pj++;A.pj++;H.gf+=hg;H.gc+=ag;A.gf+=ag;A.gc+=hg;if(hg>ag){H.g++;H.pts+=3;A.p++}else if(hg<ag){A.g++;A.pts+=3;H.p++}else{H.e++;A.e++;H.pts++;A.pts++}
    if(m.h===g.userClubId||m.a===g.userClubId){const gu=m.h===g.userClubId?hg:ag,att=xi.filter(p=>p.pos!=='POR');for(let i=0;i<gu&&att.length;i++){const s=att[Math.random()*att.length|0];s.gol=(s.gol||0)+1}}}}
  t.j++;
  for(const p of sq){const play=xi.includes(p);if(play)p.pj=(p.pj||0)+1;const mt=mentorOf(g,p),ch=.085*fx*(play?1.3:.8)*(mt?1.55:1)*(p.edad<=18?1.2:1);
   if(p.ovr<p.pot&&Math.random()<ch){p.ovr++;for(const a of['vel','ace','pas','tec','tir','def','fis','res','men'])if(Math.random()<.45&&p[a]<99)p[a]++}}
  if(t.j===t.fx.length){const tb=tabla(g,k),pos=tb.findIndex(r=>r.id===g.userClubId)+1;J.hist.push({y:g.year,k,pos});if(pos===1){g.news.push(`🏆 ¡Tu ${k==='R'?'Reserva':'Sub-17'} es campeona!`);U(g).reputacion=Math.min(95,U(g).reputacion+.3);ingreso(U(g),'premios',12000)}else g.news.push(`Tu ${k==='R'?'Reserva':'Sub-17'} terminó ${pos}º en el torneo juvenil`);J.hist=J.hist.slice(-20)}}}
function suelto(g,p){const id=Math.max(...Object.keys(g.players).map(Number),0)+1;p.id=id;p.clubId=0;p.contrato=0;g.players[id]=p}
function nuevoId(g){return Math.max(...Object.keys(g.players).map(Number),0)+1}
export function subir(g,jid){const J=g.juv,me=U(g);let cat=['R','S'].find(k=>J[k].some(p=>p.id===jid));if(!cat)return[false,'Ya no está'];if(me.plantilla.length>=30)return[false,'Plantilla completa (máx. 30)'];
 const p=J[cat].find(x=>x.id===jid);J[cat]=J[cat].filter(x=>x!==p);const mt=mentorOf(g,p);if(mt){const m=g.players[mt.mid];if(m&&['Líder','Profesional'].includes(persOf(m))&&Math.random()<.5)p.pers=persOf(m)}
 p.id=nuevoId(g);p.clubId=me.id;p.val=marketValue(p);p.sal=Math.max(3000,Math.floor(p.val*.1/1000)*1000);p.clausula=p.val*6;p.contrato=g.year+3;p.mor=75;p.cond=100;p.lesion=0;g.players[p.id]=p;me.plantilla.push(p.id);J.mentores=J.mentores.filter(m=>m.jid!==jid);
 g.stats&&g.stats.subidos++;return[true,`${p.nombre} (${p.edad}) subió al plantel profesional con contrato hasta ${p.contrato}`]}
export function liberar(g,jid){const J=g.juv;for(const k of['R','S']){const i=J[k].findIndex(p=>p.id===jid);if(i>=0){const p=J[k].splice(i,1)[0];suelto(g,p);J.mentores=J.mentores.filter(m=>m.jid!==jid);return`${p.nombre} fue liberado`}}return''}
export function mover(g,jid){const J=g.juv,i=J.S.findIndex(p=>p.id===jid);if(i<0)return'Solo se sube de Sub-17 a Reserva';if(J.R.length>=MAXJ)return'La Reserva está completa';J.R.push(J.S.splice(i,1)[0]);return'Pasó a la Reserva'}
export function mentores(g){return squadOf(g,g.userClubId).filter(p=>p.edad>=28&&(['Líder','Profesional'].includes(persOf(p))||p.exp>=70)&&!g.juv.mentores.some(m=>m.mid===p.id))}
export function asignar(g,mid,jid){const J=g.juv;if(J.mentores.length>=3)return'Máximo 3 mentorías a la vez';if(J.mentores.some(m=>m.jid===jid))return'Ese juvenil ya tiene mentor';if(!mentores(g).some(p=>p.id===mid))return'Ese jugador no puede ser mentor';J.mentores.push({mid,jid});return'Mentoría asignada: crecerá más rápido'}
export function quitar(g,jid){g.juv.mentores=g.juv.mentores.filter(m=>m.jid!==jid)}
export function convenio(g,cid){const J=g.juv,i=J.convenios.indexOf(cid);if(i>=0){J.convenios.splice(i,1);return'Convenio terminado'}if(J.convenios.length>=MAXCONV)return`Máximo ${MAXCONV} convenios`;const c=costoConv(g);if(U(g).presupuesto<c)return'Presupuesto insuficiente';gasto(U(g),'cantera',c);J.convenios.push(cid);return`Convenio firmado con ${g.clubs[cid].nombre} (${fmt(c)} por año)`}
export function mejorarRed(g){const J=g.juv;if(J.red>=5)return'La red está al máximo';const c=costoRed(J.red);if(U(g).presupuesto<c)return'Presupuesto insuficiente';gasto(U(g),'cantera',c);J.red++;return`Red de captación nivel ${J.red} (${fmt(c)})`}
export function cierre(g){const J=g.juv;if(!J)return;const me=U(g),fx=fxYouth(me);
 for(const k of['R','S'])for(const p of J[k]){p.edad++;const d=Math.round((p.pot-p.ovr)*R(.12,.3)*fx*(mentorOf(g,p)?1.4:1));if(d>0){p.ovr=C(p.ovr+d,28,95);for(const a of['vel','ace','pas','tec','tir','def','fis','res','men'])p[a]=C(p[a]+d+R(-1,1),20,99)}p.val=marketValue(p);p.pj=0;p.gol=0}
 const up=J.S.filter(p=>p.edad>=18);J.S=J.S.filter(p=>p.edad<18);J.R.push(...up);
 for(const p of J.R.filter(p=>p.edad>=22)){suelto(g,p);if(p.ovr>=50)g.news.push(`${p.nombre} dejó la cantera (llegó a los 22 años sin subir al plantel)`)}J.R=J.R.filter(p=>p.edad<22);
 J.R.sort((a,b)=>b.pot-a.pot);for(const p of J.R.splice(MAXJ))suelto(g,p);
 // Sudamericano Sub-20
 const cand=J.R.filter(p=>p.edad>=19).sort((a,b)=>b.ovr-a.ovr).slice(0,3);if(cand.length&&Math.random()<.7){const camp=Math.random()<.18;for(const p of cand){if(camp||Math.random()<.5){p.pot=Math.min(95,p.pot+(camp?2:1));p.ovr=Math.min(95,p.ovr+1)}}g.news.push(`${g.pais?.bandera||'🇦🇷'} ${cand.map(p=>p.nombre).join(', ')} fueron convocados al torneo Sub-20 de ${g.pais?.conf||'CONMEBOL'}${camp?` y ${g.pais?.nombre||'Argentina'} salió campeón`:''}`)}
 // costos y camada nueva
 const cost=J.convenios.length*costoConv(g)+(J.red?costoRed(J.red-1)*.4:0);if(cost)gasto(me,'cantera',Math.round(cost));
 J.mentores=J.mentores.filter(m=>g.players[m.mid]?.clubId===g.userClubId&&[...J.R,...J.S].some(p=>p.id===m.jid));
 const n=5+Math.floor(zl(me,'cantera')/3)+J.red;for(let i=0;i<n;i++)J.S.push(mkJoven(g));
 for(const cid of J.convenios)for(let i=0;i<(Math.random()<.5?2:1);i++)J.S.push(mkJoven(g,6,g.clubs[cid]?.provincia));
 J.S.sort((a,b)=>b.pot-a.pot);for(const p of J.S.splice(MAXJ))suelto(g,p);
 nuevoTorneo(g)}
