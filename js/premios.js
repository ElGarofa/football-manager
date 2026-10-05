// v1.3: premios individuales del año (Balón de Oro, Yashin, Kopa, Bota de Oro, Puskás, DT) y de tu liga
import {squadOf} from './clubs.js';
import {nombre as nm} from './nombres.js';
import {fmt} from './players.js';
import {ingreso,E} from './finance.js';
import {PREMIOS_COMP,NOMBRES} from './comp.js';
const R=(a,b)=>a+Math.random()*(b-a),C=(x,a,b)=>Math.max(a,Math.min(b,x)),pk=a=>a[Math.random()*a.length|0],U=g=>g.clubs[g.userClubId];
const COD={Brasil:'BRA',Uruguay:'URU',Chile:'CHI',Colombia:'COL',Paraguay:'PAR',Bolivia:'BOL',Ecuador:'ECU',Perú:'PER',Venezuela:'VEN'};
export const PREMIOS={bo:'Balón de Oro',yashin:'Premio Yashin (mejor arquero)',kopa:'Premio Kopa (mejor joven)',bota:'Bota de Oro',puskas:'Premio Puskás (mejor gol)',dt:'Entrenador del año',club:'Club del año',xi:'Equipo ideal del año'};
export function init(g){g.premios=g.premios||[];g.misPremios=g.misPremios||[];
 if(!g.estrellas||!g.estrellas.length){const cl=(g.estBase&&g.estBase.length?g.estBase.map(x=>({id:null,nombre:x.n,reputacion:x.r,cod:x.k,pais:x.p})):Object.values(g.ext?.clubs||{})).sort((a,b)=>b.reputacion-a.reputacion).slice(0,60);g.estrellas=[];let n=0;
  for(const c of cl){for(let k=0;k<2;k++){g.estrellas.push(nueva(g,c,++n))}}g.estSeq=n}}
function nueva(g,c,id,joven){const cod=c.cod||COD[c.pais]||'ESP',pos=pk(['POR','DFC','DFC','LD','LI','MC','MC','MCO','EI','ED','DC','DC']),edad=joven?Math.round(R(17,20)):Math.round(R(20,33));
 return{id:'e'+id,nombre:nm(cod),pos,edad,ovr:Math.round(C(35+c.reputacion*.55+R(-3,9),60,92)),club:c.nombre,clubId:c.id,pais:c.pais}}
const goles=(p,ovr)=>{const base={DC:1,EI:.7,ED:.7,MCO:.55,MC:.2,MD:.2,MI:.2,MCD:.1,LD:.1,LI:.1,DFC:.1,POR:0}[p.pos]||.1;return Math.max(0,Math.round(base*Math.max(0,ovr-58)*R(.35,.75)))};
function evolucionar(g){const cl=g.ext?.clubs||{};
 g.estrellas=g.estrellas.filter(p=>{p.edad++;const d=p.edad<=23?R(0,2.5):p.edad<=29?R(-1,1):-R(.5,2.5);p.ovr=Math.round(C(p.ovr+d,55,96));return p.edad<=36}).map(p=>{const c=cl[p.clubId];if(c)p.club=c.nombre;return p});
 const ranks=(g.estBase&&g.estBase.length?g.estBase.map(x=>({id:null,nombre:x.n,reputacion:x.r,cod:x.k,pais:x.p})):Object.values(cl)).sort((a,b)=>b.reputacion-a.reputacion).slice(0,60);while(g.estrellas.length<120&&ranks.length){g.estrellas.push(nueva(g,pk(ranks),++g.estSeq,true))}}
export function cierre(g,res){init(g);const Y=g.year,c=g.comps,libC=c?.lib?.campeon,sudC=c?.sud?.campeon,my=U(g),nmC=id=>id?(g.clubs[id]||g.ext?.clubs[id])?.nombre:null,libN=nmC(libC),sudN=nmC(sudC);
 const topN=[...new Set(g.estrellas.map(p=>p.club))].slice(0,14),campM=pk(topN);
 const cand=[];
 for(const p of g.estrellas){const perf=p.ovr+R(-6,6)+(p.club===campM?3.5:p.club===libN?1.8:p.club===sudN?.8:0);cand.push({n:p.nombre,pos:p.pos,edad:p.edad,club:p.club,pais:p.pais,perf,gol:goles(p,p.ovr),mio:false})}
 const f=(g.pais?.f||70)/80;
 for(const p of Object.values(g.players)){if(!p.clubId||p.ovr<74||!g.clubs[p.clubId])continue;const cb=g.clubs[p.clubId];const win=(libC===p.clubId?3.5:0)+(res.champ&&p.clubId===g.userClubId?1.5:0);
  const lg=g.leagues[cb.liga];if(!lg||lg.def.nivel>1)continue;
  cand.push({n:p.nombre,pos:p.pos,edad:p.edad,club:cb.nombre,pais:p.nacionalidad,perf:p.ovr*(.82+.18*f)+R(-5,5)+win+(p.gol||0)*.12,gol:Math.round((p.gol||0)*(.8+.2*f)),mio:p.clubId===g.userClubId,pid:p.id})}
 const top=(a,fn)=>[...a].sort((x,y)=>fn(y)-fn(x));
 const pod=top(cand,x=>x.perf).slice(0,5),yas=top(cand.filter(x=>x.pos==='POR'),x=>x.perf)[0],kopa=top(cand.filter(x=>x.edad<=21),x=>x.perf)[0]||top(cand.filter(x=>x.edad<=23),x=>x.perf)[0],bota=top(cand,x=>x.gol)[0];
 const gl=top(cand.filter(x=>x.gol>3),x=>x.gol+R(0,10)).slice(0,8),pus=gl.length?pk(gl):null;
 const mioDT=(libC===g.userClubId)||(res.champ&&(g.pais?.f||50)>=60&&Math.random()<.35);
 const dt=mioDT?{n:'Vos',club:my.nombre,mio:true}:{n:nm(pk(['ESP','ITA','GER','ENG','ARG','BRA'])),club:libC?(g.clubs[libC]||g.ext.clubs[libC])?.nombre:'—',mio:false};
 const grp=(ps,k)=>top(cand.filter(x=>ps.includes(x.pos)),x=>x.perf).slice(0,k);
 const xi=[...grp(['POR'],1),...grp(['DFC'],2),...grp(['LD'],1),...grp(['LI'],1),...grp(['MC','MCD'],2),...grp(['MCO','MI','MD'],1),...grp(['EI','ED'],2),...grp(['DC'],1)];
 const ext=libC?(g.clubs[libC]||g.ext.clubs[libC]):null;
 const W={y:Y,bo:pod[0],podio:pod,yashin:yas,kopa,bota,puskas:pus&&{n:pus.n,club:pus.club,mio:pus.mio,txt:pk(['volea desde fuera del área','chilena en el área','gol olímpico','slalom de medio campo','tiro libre al ángulo'])},dt,club:ext?{n:ext.nombre,mio:libC===g.userClubId}:null,xi:xi.map(x=>({n:x.n,pos:x.pos,club:x.club,mio:x.mio}))};
 // premios de tu liga (primera división del país)
 const L1=Object.values(g.leagues)[0],ids=L1.ids,pl=ids.flatMap(i=>squadOf(g,i)),pos=Object.fromEntries(L1.sorted().map((r,i)=>[r.id,i+1]));
 const sc=p=>p.ovr+(p.gol||0)*.8+(p.pj||0)*.08-(pos[p.clubId]||10)*.15+R(-3,3);
 const lm=top(pl,sc)[0],lgol=top(pl,p=>(p.gol||0)+R(0,.5))[0],lgk=top(pl.filter(p=>p.pos==='POR'),sc)[0],lj=top(pl.filter(p=>p.edad<=21),sc)[0]||top(pl.filter(p=>p.edad<=23),sc)[0];
 const ref=p=>p&&{n:p.nombre,club:g.clubs[p.clubId]?.nombre,pos:p.pos,gol:p.gol||0,id:p.id,mio:p.clubId===g.userClubId};
 const lxi=[['POR',1],['DFC',2],['LD',1],['LI',1],['MC',2],['MCO',1],['EI',1],['ED',1],['DC',1]].flatMap(([ps,k])=>top(pl.filter(p=>p.pos===ps),sc).slice(0,k)).map(ref);
 W.liga={nombre:L1.def.nombre,mvp:ref(lm),goleador:ref(lgol),arquero:ref(lgk),joven:ref(lj),xi:lxi};
 g.premios.push(W);g.premios=g.premios.slice(-25);
 // efectos y noticias para lo tuyo
 const mio=(txt,pid,bonus)=>{g.misPremios.push({y:Y,txt});g.news.push(`🏆 ${txt}`);const p=g.players[pid];if(p){p.val=Math.round(p.val*(1+bonus)/1000)*1000;p.mor=Math.min(100,p.mor+8)}U(g).reputacion=Math.min(95,Math.round((U(g).reputacion+bonus*8)*10)/10)};
 if(W.bo.mio)mio(`${W.bo.n} ganó el Balón de Oro`,W.bo.pid,.2);if(yas.mio)mio(`${yas.n} ganó el Premio Yashin`,yas.pid,.12);if(kopa?.mio)mio(`${kopa.n} ganó el Premio Kopa`,kopa.pid,.1);if(bota.mio)mio(`${bota.n} ganó la Bota de Oro`,bota.pid,.1);
 if(dt.mio){g.misPremios.push({y:Y,txt:'Vos: Entrenador del año'});g.news.push('🏆 ¡Ganaste el premio al Entrenador del año!');U(g).reputacion=Math.min(95,U(g).reputacion+1.5);g.dt&&(g.dt.rep=Math.min(98,(g.dt.rep||50)+3))}
 for(const [k,t] of [['mvp','Mejor jugador'],['goleador','Goleador'],['arquero','Mejor arquero'],['joven','Mejor joven']]){const r=W.liga[k];if(r?.mio)mio(`${r.n}: ${t} de ${W.liga.nombre}`,r.id,.05)}
 if(!W.bo.mio)g.news.push(`🌍 Balón de Oro ${Y}: ${W.bo.n} (${W.bo.club})`);
 evolucionar(g)}

// ---------- pantalla ----------
export function install(UI){const P=UI.prototype;
 const fila=(t,r)=>r?`<div class="kv"><span>${t}</span><b${r.mio?' class="good"':''}>${r.n}${r.club?` <small class="muted">(${r.club})</small>`:''}${r.gol&&t.includes('Goleador')?` · ${r.gol} goles`:''}</b></div>`:'';
 P.v_premios=function(){const g=this.g;init(g);const tab=this.prt||'mundo',W=g.premios.at(-1),tabs=[['mundo','🌍 Premios del mundo'],['liga','🏆 Mi liga'],['hist','📜 Historial'],['mis','🥇 Mis premios'],['dinero','💰 Premios en dinero']];
  let b='';
  if(tab==='mundo')b=W?`<h3>Temporada ${W.y}</h3><div class="g2"><div class="card"><h4>🥇 ${PREMIOS.bo}</h4>${W.podio.map((p,i)=>`<div class="kv"><span>${i+1}º ${p.n} <small class="muted">${p.pos} · ${p.club}</small></span><b${p.mio?' class="good"':''}>${p.mio?'¡Tu jugador!':p.pais}</b></div>`).join('')}</div><div class="card"><h4>Otros premios</h4>${fila('🧤 Yashin',W.yashin)}${fila('🌱 Kopa',W.kopa)}${fila('👟 Bota de Oro',W.bota)}${fila('✨ Puskás',W.puskas&&{n:W.puskas.n+' — '+W.puskas.txt,club:W.puskas.club,mio:W.puskas.mio})}${fila('📋 Entrenador del año',W.dt)}${fila('🏟️ Club del año',W.club)}</div></div><h3>${PREMIOS.xi}</h3><div class="grid">${W.xi.map(x=>`<div class="card"><b>${x.pos}</b> ${x.n}<br><small class="muted">${x.club}</small></div>`).join('')}</div>`:'<p class="muted">Los premios se entregan al terminar cada temporada.</p>';
  else if(tab==='liga')b=W?.liga?`<h3>${W.liga.nombre} ${W.y}</h3><div class="card">${fila('Mejor jugador',W.liga.mvp)}${fila('Goleador',W.liga.goleador)}${fila('Mejor arquero',W.liga.arquero)}${fila('Mejor joven',W.liga.joven)}</div><h3>Equipo ideal de la liga</h3><div class="grid">${W.liga.xi.map(x=>x&&`<div class="card${x.mio?' good':''}"><b>${x.pos}</b> ${x.n}<br><small class="muted">${x.club}</small></div>`).join('')}</div>`:'<p class="muted">Todavía no hay premios.</p>';
  else if(tab==='hist')b=g.premios.length?`<div class="tw"><table><tr><th>Año</th><th>Balón de Oro</th><th>Yashin</th><th>Kopa</th><th>Bota de Oro</th><th>Entrenador</th></tr>${[...g.premios].reverse().map(w=>`<tr><td>${w.y}</td><td>${w.bo.n}</td><td>${w.yashin?.n||'—'}</td><td>${w.kopa?.n||'—'}</td><td>${w.bota?.n||'—'} (${w.bota?.gol||0})</td><td>${w.dt.n}</td></tr>`).join('')}</table></div>`:'<p class="muted">Sin historial todavía.</p>';
  else if(tab==='mis')b=(g.misPremios.length?`<div class="card">${[...g.misPremios].reverse().map(p=>`<div class="kv"><span>${p.y}</span><b>${p.txt}</b></div>`).join('')}</div>`:'<p class="muted">Todavía no ganaste premios individuales. Los ganan tus jugadores y vos como entrenador.</p>')+`<h3>Títulos del club</h3><div class="cards"><div><b>Ligas</b>${g.stats?.t.liga||0}</div><div><b>${NOMBRES.copa}</b>${g.stats?.t.copa||0}</div><div><b>${NOMBRES.lib}</b>${g.stats?.t.lib||0}</div><div><b>${NOMBRES.sud}</b>${g.stats?.t.sud||0}</div></div>`;
  else{const tv=E().tv[0],{PR:p,ESC}=PREMIOS_COMP,nv=this.g.league.def.nivel,tvL=E().tv[nv-1];
   b=`<p class="hint">Valores aproximados (dependen de la TV de la primera división) y se cobran a medida que avanzás.</p><div class="tw"><table><tr><th>Competición</th><th>Campeón</th><th>Por victoria</th></tr>
   <tr><td>${g.league.def.nombre} (tu liga)</td><td>${fmt(E().premio[0]*tvL)}</td><td>—</td></tr>
   <tr><td>${NOMBRES.copa}</td><td>${fmt(p.copa[6]*tv)}</td><td>—</td></tr>
   <tr><td>${NOMBRES.lib}</td><td>${fmt((p.gko.ini+6*p.gko.v+p.gko.ko.reduce((a,b)=>a+b,0))*tv)}</td><td>${fmt(p.gko.v*tv)}</td></tr>
   <tr><td>${NOMBRES.sud}</td><td>${fmt((p.gko.ini+6*p.gko.v+p.gko.ko.reduce((a,b)=>a+b,0))*tv*ESC.sud)}</td><td>${fmt(p.gko.v*tv*ESC.sud)}</td></tr></table></div>
   <p class="hint">Además: 2º y 3º de liga cobran el ${Math.round(E().premio[1]*100)}% y ${Math.round(E().premio[2]*100)}% de la TV, y el ascenso da un premio extra.</p>`}
  return`<h2>Premios</h2><div class="tabs">${tabs.map(([k,t])=>`<button class="${k===tab?'on':''}" data-act="prt" data-k="${k}">${t}</button>`).join('')}</div>${b}`};
 const oa=P.act9;P.act9=function(a,d){if(a==='prt'){this.prt=d.k;this.render();return true}return oa.call(this,a,d)}}
