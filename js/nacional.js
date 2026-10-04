// Selección: convocatorias, Eliminatorias y Mundial (v0.9). Rivales ficticios.
import {League,addDays} from './league.js';
import {squadOf} from './clubs.js';
import {ingreso,gasto} from './finance.js';
import {fmt} from './players.js';
const R=(a,b)=>a+Math.random()*(b-a),pk=a=>a[Math.random()*a.length|0],sh=a=>[...a].sort(()=>Math.random()-.5),U=g=>g.clubs[g.userClubId];
export const SUR=[{n:'Argentina',f:0},{n:'Brasil',f:76},{n:'Uruguay',f:68},{n:'Colombia',f:67},{n:'Chile',f:63},{n:'Ecuador',f:63},{n:'Paraguay',f:61},{n:'Perú',f:59},{n:'Venezuela',f:57},{n:'Bolivia',f:55}];
const RESTO=['Francia','Alemania','España','Inglaterra','Italia','Países Bajos','Portugal','Bélgica','Croacia','México','Estados Unidos','Japón','Corea del Sur','Marruecos','Senegal','Dinamarca','Suiza','Australia'];
export const VENTANAS=['03-20','06-05','09-04','10-09'];
const pois=l=>{let k=0,p=1;const L=Math.exp(-l);do{k++;p*=Math.random()}while(p>L);return k-1};
const res=(fa,fb,h)=>{const d=fa-fb;return[pois(1.35*Math.exp(d/16+(h?.1:0))),pois(1.1*Math.exp(-d/16))]};
export const fuerzaARG=g=>{const o=Object.values(g.players).filter(p=>p.clubId>0&&p.nacionalidad==='Argentina').map(p=>p.ovr).sort((a,b)=>b-a).slice(0,20);return o.length?o.reduce((a,b)=>a+b,0)/o.length:60};
export function init(g){if(g.sel)return;g.sel={y0:g.year,elim:null,mundial:null,conv:[],hasta:null,hist:[],seguro:false};nuevoCiclo(g)}
function nuevoCiclo(g){const s=g.sel,eq=SUR.map((t,i)=>({id:i,n:t.n,f:i?t.f+R(-3,3):0}));s.elim={eq,fx:League.fixtures(eq.map(t=>t.id)),j:0,done:false,tabla:Object.fromEntries(eq.map(t=>[t.id,{id:t.id,pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0}]))};s.mundial=null}
export const tablaElim=g=>Object.values(g.sel.elim.tabla).sort((a,b)=>b.pts-a.pts||(b.gf-b.gc)-(a.gf-a.gc)||b.gf-a.gf||a.id-b.id);
const ronda=(g,t,fx)=>{for(const m of fx){const A=g.sel.elim.eq[m.h],B=g.sel.elim.eq[m.a],fa=m.h===0?fuerzaARG(g):A.f,fb=m.a===0?fuerzaARG(g):B.f,[x,y]=res(fa,fb,true),H=t[m.h],V=t[m.a];
  H.pj++;V.pj++;H.gf+=x;H.gc+=y;V.gf+=y;V.gc+=x;if(x>y){H.g++;H.pts+=3;V.p++}else if(x<y){V.g++;V.pts+=3;H.p++}else{H.e++;V.e++;H.pts++;V.pts++}
  if(m.h===0||m.a===0)g.news.push(`🇦🇷 Eliminatorias: ${A.n} ${x}-${y} ${B.n}`)}};
const convocar=(g,dias)=>{const arg=Object.values(g.players).filter(p=>p.clubId>0&&p.nacionalidad==='Argentina'&&p.lesion<=0&&!p.prestamo).sort((a,b)=>(b.ovr+(b.gol||0)*.25+(b.exp||0)*.05)-(a.ovr+(a.gol||0)*.25+(a.exp||0)*.05)).slice(0,26),hasta=addDays(g.date,dias);
 for(const p of arg){p.aus=hasta;p.sel=true}g.sel.conv=arg.map(p=>p.id);g.sel.hasta=hasta;
 const mios=arg.filter(p=>p.clubId===g.userClubId);if(mios.length)g.news.push(`🇦🇷 Convocados de tu club: ${mios.map(p=>p.nombre).join(', ')}`)};
const volver=(g)=>{let hurt=[];for(const id of g.sel.conv){const p=g.players[id];if(!p)continue;delete p.aus;delete p.sel;p.int=(p.int||0)+1;p.cond=Math.max(55,p.cond-14);p.mor=Math.min(100,p.mor+4);p.val=Math.round(p.val*1.025/1000)*1000;
  if(Math.random()<.04&&p.lesion<=0){p.lesion=Math.round(R(7,35));p.tipo='Lesión en la selección';if(p.clubId===g.userClubId){hurt.push(p);if(g.sel.seguro){const m=Math.round(p.val*.012*Math.min(p.lesion,30)/10/1000)*1000;ingreso(U(g),'seguro',m);g.news.push(`🩹 ${p.nombre} se lesionó en la selección (${p.lesion} días). El seguro paga ${fmt(m)}`)}else g.news.push(`🩹 ${p.nombre} se lesionó en la selección (${p.lesion} días)`)}}}
 g.sel.conv=[];g.sel.hasta=null};
export function tick(g){const s=g.sel;if(!s)return;const md=g.date.slice(5),y=+g.date.slice(0,4);
 if(s.hasta&&g.date>s.hasta){volver(g)}
 if(s.mundial){mundialTick(g);return}
 if(VENTANAS.includes(md)&&!s.hasta){
  if(y===s.y0+3&&md==='06-05'&&!s.mundial){iniciarMundial(g);return}
  if(!s.elim.done){convocar(g,9);s.k=0}}
 if(s.hasta&&!s.elim.done){const d=Math.round((new Date(s.hasta)-new Date(g.date))/864e5);if(d===7||d===3){const e=s.elim,fx=e.fx[e.j];if(fx){ronda(g,e.tabla,fx);e.j++}
   if(e.j>=e.fx.length){e.done=true;const t=tablaElim(g),pos=t.findIndex(r=>r.id===0)+1;e.pos=pos;g.news.push(pos<=6?`🇦🇷 ¡Argentina clasificó al Mundial (${pos}º en las Eliminatorias)!`:`🇦🇷 Argentina quedó afuera del Mundial (${pos}º)`)}}}}
// ---------- Mundial ----------
function iniciarMundial(g){const s=g.sel,q=s.elim.done&&s.elim.pos<=6,sur=tablaElim(g).slice(0,6).filter(r=>r.id!==0||q).map(r=>({n:s.elim.eq[r.id].n,f:r.id?s.elim.eq[r.id].f:fuerzaARG(g),arg:r.id===0}));
 const eq=[...sur,...sh(RESTO).slice(0,16-sur.length).map(n=>({n,f:R(58,80)}))],ord=sh(eq),grupos=[0,1,2,3].map(i=>ord.slice(i*4,i*4+4));
 s.mundial={eq,q,grupos:grupos.map(g4=>({eq:g4,t:Object.fromEntries(g4.map(e=>[e.n,{n:e.n,pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0}]))})),fase:'grupos',md:0,ko:[],campeon:null,arg:null,inicio:g.date};
 convocar(g,36);s.mundial.fecha0=g.date;g.news.push(q?'🌎 ¡Comienza el Mundial! Argentina participa y tus jugadores viajan.':'🌎 Comienza el Mundial. Argentina no clasificó.')}
const sim=(g,a,b)=>{const[x,y]=res(a.f,b.f,false);return[x,y]};
function mundialTick(g){const s=g.sel,m=s.mundial;if(m.campeon){if(s.hasta&&g.date>s.hasta)volver(g);return}
 const d=Math.round((new Date(g.date)-new Date(m.fecha0))/864e5);
 if(m.fase==='grupos'&&[8,13,18].includes(d)){const r=m.md++;for(const gr of m.grupos){const e=gr.eq,pr=[[[0,1],[2,3]],[[0,2],[1,3]],[[0,3],[1,2]]][r];for(const[i,j]of pr){const[x,y]=sim(g,e[i],e[j]),H=gr.t[e[i].n],V=gr.t[e[j].n];H.pj++;V.pj++;H.gf+=x;H.gc+=y;V.gf+=y;V.gc+=x;if(x>y){H.g++;H.pts+=3;V.p++}else if(x<y){V.g++;V.pts+=3;H.p++}else{H.e++;V.e++;H.pts++;V.pts++}
    if(e[i].arg||e[j].arg)g.news.push(`🌎 Mundial: ${e[i].n} ${x}-${y} ${e[j].n}`)}}
  if(m.md===3){const q=m.grupos.map(gr=>Object.values(gr.t).sort((a,b)=>b.pts-a.pts||(b.gf-b.gc)-(a.gf-a.gc)||b.gf-a.gf).slice(0,2).map(t=>m.eq.find(e=>e.n===t.n)));m.fase='ko';m.ko=[{nombre:'Cuartos de final',par:[[q[0][0],q[1][1]],[q[1][0],q[0][1]],[q[2][0],q[3][1]],[q[3][0],q[2][1]]],res:[]}];m.arg=q.flat().some(e=>e.arg)?'Octavos':'Fase de grupos'}}
 else if(m.fase==='ko'&&[22,27,32].includes(d)){const r=m.ko.at(-1);const ws=[];r.res=r.par.map(([a,b])=>{let[x,y]=sim(g,a,b),pen=null;if(x===y){const e=sim(g,{f:a.f},{f:b.f});x+=Math.round(e[0]/3);y+=Math.round(e[1]/3);if(x===y){pen=Math.random()<.5+(a.f-b.f)/200;ws.push(pen?a:b)}else ws.push(x>y?a:b)}else ws.push(x>y?a:b);if(a.arg||b.arg){const w=ws.at(-1);g.news.push(`🌎 Mundial (${r.nombre}): ${a.n} ${x}-${y} ${b.n}${pen!==null?' (penales)':''}${w.arg?' ✅':' ❌'}`);m.arg=w.arg?(ws.length&&r.par.length===1?'Campeón':r.nombre==='Cuartos de final'?'Semifinales':r.nombre==='Semifinales'?'Final':'Campeón'):r.nombre}return[x,y,pen]});
  if(ws.length===1){m.campeon=ws[0].n;g.sel.hist.push({y:+g.date.slice(0,4),campeon:m.campeon,arg:m.q?(ws[0].arg?'Campeón':m.arg):'No clasificó'});g.news.push(`🏆 Campeón del Mundo: ${m.campeon}${ws[0].arg?' — ¡¡¡ARGENTINA!!!':''}`);if(ws[0].arg)for(const id of g.sel.conv){const p=g.players[id];if(p)p.val=Math.round(p.val*1.08/1000)*1000}
   s.y0=+g.date.slice(0,4)+1;s.elimPrev=s.elim;nuevoCiclo(g);const keep=s.mundial;s.mundial=keep;s.cerrado=true}
  else m.ko.push({nombre:ws.length===2?'Semifinales':'Final',par:ws.reduce((a,_,i)=>i%2?a:a.concat([[ws[i],ws[i+1]]]),[]),res:[]})}
 if(s.cerrado&&g.date>addDays(m.fecha0,40)){s.mundial=null;s.cerrado=false}}
export function toggleSeguro(g){g.sel.seguro=!g.sel.seguro;return g.sel.seguro?`Seguro activado (cuesta ${fmt(costoSeguro(g))} por año)`:'Seguro desactivado'}
export const costoSeguro=g=>Math.round(squadOf(g,g.userClubId).reduce((a,p)=>a+p.val,0)*.004/1000)*1000;
export function cobroAnual(g){if(g.sel?.seguro)gasto(U(g),'seguro',costoSeguro(g))}
