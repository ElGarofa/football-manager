import {League,addDays} from './league.js';
import {autoLineup,DEFAULT_TACTIC} from './tactics.js';
import {mkPlayer,fmt} from './players.js';
import {CFG} from './config.js';
import {ingreso,E} from './finance.js';
const R=(a,b)=>a+Math.random()*(b-a),pk=a=>a[Math.random()*a.length|0],sh=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
export const EXT0=1001;
export const NOMBRES={copa:'Copa Argentina',lib:'Copa Libertadores',sud:'Copa Sudamericana'};
export const cl=(g,id)=>g.clubs[id]||g.ext?.clubs[id];
const todos=c=>[...(c.grupos||[]).flatMap(gr=>gr.ms),...c.rondas.flatMap(r=>r.ties.flatMap(t=>t.ms))];
// ---------- clubes extranjeros ficticios ----------
export function initExt(g){if(g.ext)return;g.ext={clubs:{},seq:EXT0};
 for(const p of CFG.ext.paises){const lug=sh(p.lug);for(let i=0;i<p.n;i++){const id=g.ext.seq++,l=lug[i%lug.length];
  g.ext.clubs[id]={id,nombre:`${pk(p.pref)} ${l}`,pais:p.pais,ciudad:l,provincia:p.pais,liga:'ext',division:p.pais,reputacion:Math.round(R(p.rep[0],p.rep[1])),cuerpoTecnico:{entrenador:60,ayudante:50,preparadorFisico:60},formacion:pk(['4-4-2','4-3-3'])}}}}
const evolExt=g=>{for(const c of Object.values(g.ext.clubs))c.reputacion=Math.round(Math.max(36,Math.min(88,c.reputacion+R(-2.5,2.5)+.05*(60-c.reputacion))))};
const cache=new Map();let uid=900000;
const POS='POR LD DFC DFC LI MD MC MC MI DC DC POR DFC MC EI'.split(' ');
export function extSetup(g,id){const key=id+':'+g.year;let s=cache.get(key);
 if(!s){const c=g.ext.clubs[id],pls=POS.map(p=>mkPlayer(uid++,id,c.reputacion,p)),by=Object.fromEntries(pls.map(p=>[p.id,p])),l=autoLineup(pls,c.formacion);
  s={club:c,xi:l.xi.map(i=>by[i]),bench:l.bench.map(i=>by[i]),tactic:{...DEFAULT_TACTIC,formacion:c.formacion,mentalidad:c.reputacion>75?'Ofensiva':'Equilibrada'}};cache.set(key,s)}
 s.xi.concat(s.bench).forEach(p=>{p.cond=100;p.lesion=0});return s}
// ---------- simulación rápida y penales ----------
const fuerza=(g,id)=>{const c=g.clubs[id];if(!c)return 24+g.ext.clubs[id].reputacion*.55;const o=c.plantilla.map(i=>g.players[i].ovr).sort((a,b)=>b-a).slice(0,12);return o.reduce((a,b)=>a+b,0)/o.length};
const pois=l=>{let k=0,p=1;const L=Math.exp(-l);do{k++;p*=Math.random()}while(p>L);return k-1};
export const quick=(g,h,a,f=1)=>{const d=fuerza(g,h)-fuerza(g,a);return{hg:pois(f*1.45*Math.exp(d/20+.1)),ag:pois(f*1.1*Math.exp(-d/20))}};
const penales=(g,a,b)=>{const p=.5+Math.max(-.12,Math.min(.12,(fuerza(g,a)-fuerza(g,b))/150)),w=3+(Math.random()*3|0),l=Math.max(0,w-1-(Math.random()*2|0));return Math.random()<p?[w,l]:[l,w]};
// ---------- construcción ----------
const mk=(g,h,a,date,x={})=>({id:++g.cmid,h,a,date,hg:null,ag:null,done:false,...x});
const dt=(ini,idx,off)=>addDays(ini,7*idx+off);
const NR={1:'Final',2:'Semifinales',4:'Cuartos de final',8:'Octavos de final',16:'16avos de final',32:'32avos de final',64:'64avos de final'};
function ronda(g,c,pairs,legs,fechas,nombre){const r={nombre:nombre||NR[pairs.length]||`Ronda de ${pairs.length*2}`,legs,ties:pairs.map(([a,b])=>({a,b,w:null,pen:null,agg:null,ms:legs===1?[mk(g,a,b,fechas[0])]:[mk(g,b,a,fechas[0]),mk(g,a,b,fechas[1])]}))};c.rondas.push(r);return r}
const COPA_IDX=[2,6,10,14,18,23,27];
function crearCopa(g,ini){const ids=Object.keys(g.clubs).map(Number).sort((a,b)=>g.clubs[b].reputacion-g.clubs[a].reputacion),n=ids.length;let size=1;while(size<n)size*=2;const nb=size-n,bye=ids.slice(0,nb),play=sh(ids.slice(nb));
 const c={key:'copa',nombre:NOMBRES.copa,tipo:'ko',ini,equipos:ids,bye,rondas:[],done:false,campeon:null,u:null};
 const pr=[];for(let i=0;i<play.length;i+=2)pr.push([play[i],play[i+1]]);ronda(g,c,pr,1,[dt(ini,COPA_IDX[0],3)],'Ronda previa');return c}
function crearGrupos(g,key,ini,equipos,ngr,idx,off,ko){
 const ord=[...equipos].sort((a,b)=>cl(g,b).reputacion-cl(g,a).reputacion),pots=ngr?Array.from({length:4},(_,k)=>ord.slice(k*ngr,(k+1)*ngr)):[];let grs;
 for(let t=0;t<60;t++){grs=Array.from({length:ngr},()=>[]);pots.forEach(p=>sh(p).forEach((id,i)=>grs[i].push(id)));if(grs.every(gr=>gr.filter(id=>g.clubs[id]).length<=1))break}
 const c={key,nombre:NOMBRES[key],tipo:'gko',ini,equipos,ko,grupos:grs.map(ids=>({ids,ms:[]})),rondas:[],done:false,campeon:null};
 c.grupos.forEach(gr=>League.fixtures(gr.ids).forEach((fx,k)=>fx.forEach(m=>gr.ms.push(mk(g,m.h,m.a,dt(ini,idx[k],off),{md:k+1})))));return c}
export function tablaGrupo(gr){const t={};gr.ids.forEach(i=>t[i]={id:i,pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0});
 gr.ms.filter(m=>m.done).forEach(m=>{const H=t[m.h],A=t[m.a];H.pj++;A.pj++;H.gf+=m.hg;H.gc+=m.ag;A.gf+=m.ag;A.gc+=m.hg;if(m.hg>m.ag){H.g++;H.pts+=3;A.p++}else if(m.hg<m.ag){A.g++;A.pts+=3;H.p++}else{H.e++;A.e++;H.pts++;A.pts++}});
 return Object.values(t).sort((x,y)=>y.pts-x.pts||(y.gf-y.gc)-(x.gf-x.gc)||y.gf-x.gf||x.id-y.id)}
const KO={lib:{names:['Octavos de final','Cuartos de final','Semifinales','Final'],idx:[[15,16],[18,19],[21,22],[24]],off:4},sud:{names:['Cuartos de final','Semifinales','Final'],idx:[[17,18],[20,21],[25]],off:5}};
// ---------- premios (fracción de la TV de Primera) ----------
const ESC={copa:1,lib:1,sud:.4},PR={copa:[.012,.018,.025,.04,.06,.1,.25],gko:{ini:.2,v:.04,e:.015,ko:[.12,.18,.3,.6]}};
const pago=(g,c,f,txt)=>{const m=Math.round(f*ESC[c.key]*E().tv[0]);if(m>0){ingreso(g.clubs[g.userClubId],'premios',m);if(txt)g.news.push(`💰 ${txt}: ${fmt(m)}`)}};
// ---------- registro ----------
export function regMatch(g,c,m,r){const u=g.userClubId;m.hg=r.hg;m.ag=r.ag;m.done=true;
 if(r.ev){g.after(r);m.asist=r.asist;g.lastRep=r;g.reps=[...(g.reps||[]),{key:c.key,mid:m.id,r:{...r,played:undefined,inj:undefined,gl:undefined}}].slice(-8)}
 if(m.h===u||m.a===u){const mine=m.h===u?[m.hg,m.ag]:[m.ag,m.hg];g.news.push(`${NOMBRES[c.key]}: ${cl(g,m.h).nombre} ${m.hg}-${m.ag} ${cl(g,m.a).nombre}`);
  if(c.tipo==='gko'&&m.md)pago(g,c,mine[0]>mine[1]?PR.gko.v:mine[0]===mine[1]?PR.gko.e:0)}}
function resolver(g,t){if(t.w!=null||!t.ms.every(m=>m.done))return;let A=0,B=0;t.ms.forEach(m=>{if(m.h===t.a){A+=m.hg;B+=m.ag}else{A+=m.ag;B+=m.hg}});t.agg=[A,B];
 if(A===B&&t.ms.length===1){const m=t.ms[0],e=quick(g,m.h,m.a,.33);t.et=[e.hg,e.ag];if(m.h===t.a){A+=e.hg;B+=e.ag}else{A+=e.ag;B+=e.hg}t.agg=[A,B]}
 if(A!==B)t.w=A>B?t.a:t.b;else{t.pen=penales(g,t.a,t.b);t.w=t.pen[0]>t.pen[1]?t.a:t.b}}
export function avanzar(g,c){if(c.done)return;const u=g.userClubId;
 if(c.tipo==='gko'&&!c.rondas.length){if(!c.grupos.every(gr=>gr.ms.every(m=>m.done)))return;
  const q=c.grupos.map(gr=>tablaGrupo(gr).slice(0,2).map(x=>x.id)),k=KO[c.key],par=[];
  for(let i=0;i<q.length;i+=2){par.push([q[i][0],q[i+1][1]],[q[i+1][0],q[i][1]])}
  if(q.some(x=>x.includes(u))&&!par.flat().includes(u)){}else if(par.flat().includes(u))g.news.push(`🌍 ${c.nombre}: ¡clasificaste a ${k.names[0].toLowerCase()}!`);else if(c.equipos.includes(u))g.news.push(`🌍 ${c.nombre}: quedaste eliminado en la fase de grupos.`);
  if(par.flat().includes(u))pago(g,c,0);
  ronda(g,c,par,2,k.idx[0].map(i=>dt(c.ini,i,k.off)),k.names[0]);return}
 const cur=c.rondas.at(-1);if(!cur)return;cur.ties.forEach(t=>resolver(g,t));if(!cur.ties.every(t=>t.w!=null))return;
 const ri=c.rondas.length-1,mine=cur.ties.find(t=>t.a===u||t.b===u);
 if(mine){const gano=mine.w===u,rival=cl(g,mine.a===u?mine.b:mine.a).nombre;
  g.news.push(gano?`✅ ${c.nombre}: pasaste ${cur.nombre.toLowerCase()} ante ${rival}${mine.pen?` (penales ${mine.pen[mine.a===u?0:1]}-${mine.pen[mine.a===u?1:0]})`:''}`:`❌ ${c.nombre}: quedaste eliminado en ${cur.nombre.toLowerCase()} ante ${rival}${mine.pen?` (penales ${mine.pen[mine.a===u?0:1]}-${mine.pen[mine.a===u?1:0]})`:''}`);
  if(gano)pago(g,c,c.tipo==='ko'?PR.copa[Math.min(ri,6)]:PR.gko.ko[Math.min(c.key==='lib'?ri:ri+1,3)],'Premio por avanzar')}
 const ws=cur.ties.map(t=>t.w);
 if(ws.length===1){c.done=true;c.campeon=ws[0];if(ws[0]===u)g.news.push(`🏆 ¡Sos campeón de la ${c.nombre}!`);else g.news.push(`${c.nombre}: campeón ${cl(g,ws[0]).nombre}`);return}
 if(c.tipo==='ko'){let pool=sh(ri===0?ws.concat(c.bye):ws);const pr=[];for(let i=0;i<pool.length;i+=2)pr.push([pool[i],pool[i+1]]);ronda(g,c,pr,1,[dt(c.ini,COPA_IDX[Math.min(ri+1,6)],3)])}
 else{const k=KO[c.key],pr=[];for(let i=0;i<ws.length;i+=2)pr.push([ws[i],ws[i+1]]);const n=k.idx[ri+1];ronda(g,c,pr,n.length,n.map(i=>dt(c.ini,i,k.off)),k.names[ri+1])}}
export function pendientes(g,fecha){const o=[];for(const c of Object.values(g.comps||{}))if(!c.done)for(const m of todos(c))if(!m.done&&m.date===fecha)o.push([c,m]);return o}
export const proximoUser=g=>{const u=g.userClubId,o=[];for(const c of Object.values(g.comps||{}))if(!c.done)for(const m of todos(c))if(!m.done&&(m.h===u||m.a===u))o.push({c,m,fecha:m.date});return o.sort((a,b)=>a.fecha<b.fecha?-1:a.fecha>b.fecha?1:0)[0]};
export const matchesUser=(g,c)=>todos(c).filter(m=>m.h===g.userClubId||m.a===g.userClubId);
export const avanzarTodos=g=>Object.values(g.comps||{}).forEach(c=>avanzar(g,c));
// ---------- temporada ----------
export function nueva(g,ini){initExt(g);evolExt(g);g.cmid=g.cmid||0;g.pal=g.pal||[];const u=g.userClubId;
 let cq=g.clasif;if(!cq){const p1=[...g.leagues[Object.keys(g.leagues)[0]].ids].sort((a,b)=>g.clubs[b].reputacion-g.clubs[a].reputacion);cq={lib:p1.slice(0,4),sud:p1.slice(4,8)}}
 const ex=Object.values(g.ext.clubs).sort((a,b)=>(b.reputacion+R(-6,6))-(a.reputacion+R(-6,6))).map(c=>c.id);
 const lib=crearGrupos(g,'lib',ini,[...cq.lib,...ex.slice(0,28)],8,[3,5,7,9,11,13],4),sud=crearGrupos(g,'sud',ini,[...cq.sud,...ex.slice(28,40)],4,[4,6,8,10,12,14],5);
 g.comps={copa:crearCopa(g,ini),lib,sud};g.clasif=null;
 for(const c of [lib,sud])if(c.equipos.includes(u)){pago(g,c,PR.gko.ini);g.news.push(`🌍 Clasificaste a la ${c.nombre}`)}}
export function alcance(g,key){const c=g.comps?.[key],u=g.userClubId;if(!c||c.omitida||!c.equipos.includes(u))return'No participó';if(c.campeon===u)return'Campeón';
 const rs=c.rondas.filter(r=>r.ties.some(t=>t.a===u||t.b===u));if(!rs.length)return c.tipo==='gko'?'Fase de grupos':'Eliminado en la ronda previa';
 const r=rs.at(-1);if(r.nombre==='Final')return'Subcampeón';return'Eliminado en '+r.nombre.toLowerCase()}
export function cierre(g,ord){const c=g.comps;if(!c)return;const nm=id=>id?cl(g,id).nombre:'—';
 g.pal.push({y:g.year,copa:nm(c.copa.campeon),lib:nm(c.lib.campeon),sud:nm(c.sud.campeon),copaId:c.copa.campeon,libId:c.lib.campeon,sudId:c.sud.campeon});g.pal=g.pal.slice(-30);
 const bump=(id,v)=>{const x=g.clubs[id]||g.ext.clubs[id];if(x)x.reputacion=Math.round(Math.min(95,x.reputacion+v)*10)/10};
 bump(c.copa.campeon,1.2);bump(c.lib.campeon,2.5);bump(c.sud.campeon,1.2);
 const f=c.lib.rondas.at(-1);if(f)f.ties.forEach(t=>bump(t.w===t.a?t.b:t.a,1.2));
 const p1=ord[0],lib=p1.slice(0,3);let cc=c.copa.campeon;
 if(cc&&!lib.includes(cc))lib.push(cc);else lib.push(p1[3]);
 if(c.lib.campeon&&g.clubs[c.lib.campeon]&&!lib.includes(c.lib.campeon)){lib.pop();lib.push(c.lib.campeon)}
 const sud=p1.filter(i=>!lib.includes(i)).slice(0,4);g.clasif={lib:[...new Set(lib)].slice(0,4),sud};
 while(g.clasif.lib.length<4){const x=p1.find(i=>!g.clasif.lib.includes(i)&&!sud.includes(i));g.clasif.lib.push(x)}}
export function omitir(g){for(const c of Object.values(g.comps||{})){c.done=true;c.omitida=true}}
