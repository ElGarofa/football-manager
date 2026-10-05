// v1.2: explorador del mundo — continente → país → división → clubes
import {badge} from './visual.js';
import {generar} from './gen.js';
const cache={idx:null,pais:{}};
const load=async u=>{const r=await fetch(u);if(!r.ok)throw new Error(u);return r.json()};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
export function render(ui,inGame){
 const S=ui.mw=ui.mw||{cont:null,pais:null,div:1,q:''},root=inGame?'':'<p><button data-act="mw_home">← Volver al inicio</button></p>';
 const redo=()=>inGame?ui.render():ui.mundoStart();
 if(!cache.idx){load('data/mundo/index.json').then(d=>{cache.idx=d;redo()}).catch(()=>{ui.toast('No se pudo cargar la base mundial');});return`${root}<h2>🌍 Mundo</h2><p class="muted">Cargando…</p>`}
 const I=cache.idx.continentes,tot=I.reduce((s,c)=>s+c.paises.reduce((a,p)=>a+p.clubes,0),0),np=I.reduce((s,c)=>s+c.paises.length,0);
 let h=`${root}<h2>🌍 Mundo del fútbol</h2><p class="muted">${np} países · ${tot.toLocaleString('es-AR')} clubes. Elegí un continente, después un país y sus divisiones.</p>`;
 h+=`<div class="tabs">${I.map(c=>`<button class="${S.cont===c.nombre?'on':''}" data-act="mw_c" data-k="${esc(c.nombre)}">${c.nombre} <small>(${c.paises.length})</small></button>`).join('')}</div>`;
 const C=I.find(c=>c.nombre===S.cont);
 if(!C)return h+'<p class="hint">Tocá un continente para ver sus países.</p>';
 if(!S.pais){h+=`<div class="grid"><label>Buscar país<input data-chg="mw_q" value="${esc(S.q||'')}" placeholder="Nombre"></label></div><div class="cgrid">${C.paises.filter(p=>!S.q||p.pais.toLowerCase().includes(S.q.toLowerCase())).map(p=>`<div class="cpick" data-act="mw_p" data-k="${p.codigo}" style="cursor:pointer"><div class="t"><span style="font-size:30px">${p.bandera}</span><div>${p.pais}<small>${p.divisiones} ${p.divisiones>1?'divisiones':'división'} · ${p.clubes} clubes</small></div></div></div>`).join('')}</div>`;return h}
 const P=cache.pais[S.pais];
 if(!P){load(`data/mundo/${S.pais}.json`).then(d=>{cache.pais[S.pais]=d;redo()}).catch(()=>ui.toast('No se pudo cargar el país'));return h+'<p class="muted">Cargando país…</p>'}
 const dv=P.divisiones.find(d=>d.nivel===S.div)||P.divisiones[0],q=(S.cq||'').toLowerCase(),cl=dv.clubes.filter(c=>!q||(c.n+' '+c.c).toLowerCase().includes(q)).sort((a,b)=>b.r-a.r);
 h+=`<p><button data-act="mw_p" data-k="">← ${C.nombre}</button></p><h2>${P.bandera} ${P.pais}</h2><div class="tabs">${P.divisiones.map(d=>`<button class="${d.nivel===dv.nivel?'on':''}" data-act="mw_d" data-k="${d.nivel}">${d.nivel}. ${esc(d.nombre)} <small>(${d.clubes.length})</small></button>`).join('')}</div>`;
 if(!dv.completo)h+=`<div class="alert">Lista parcial: faltan clubes de esta división o puede no estar actualizada.</div>`;
 h+=inGame?'<p class="hint">Para dirigir otro club, empezá una partida nueva desde el inicio.</p>':'<p class="hint">Elegí un club y tocá “Dirigir”. Las divisiones con menos de 8 clubes se completan con clubes ficticios; los jugadores son ficticios.</p>';
 h+=`<div class="grid"><label>Buscar club<input data-chg="mw_cq" value="${esc(S.cq||'')}" placeholder="Nombre o ciudad"></label></div><div class="tw"><table><tr><th>Club</th><th>Ciudad</th><th>Reputación</th><th></th></tr>${cl.map(c=>`<tr><td>${badge({nombre:c.n},22)} ${esc(c.n)}</td><td>${esc(c.c)}</td><td><div class="meter" style="width:110px"><i style="width:${c.r}%"></i></div></td><td>${!inGame?`<button class="pri" data-act="mw_play" data-k="${esc(c.n)}">Dirigir</button>`:''}</td></tr>`).join('')}</table></div>`;
 return h}
export function install(UI){const P=UI.prototype;
 P.v_mundo2=function(){return render(this,true)};
 P.mundoStart=function(){this.game=null;this.el.innerHTML=`<div class="start">${render(this,false)}</div>`};
 const oa=P.act9;P.act9=function(a,d){const S=this.mw=this.mw||{cont:null,pais:null,div:1,q:''},rr=()=>this.game?this.render():this.mundoStart();
  switch(a){case'mw_home':this.start();return true;case'mw_open':this.mw=this.mw||{cont:null,pais:null,div:1,q:''};this.mundoStart();return true;
   case'mw_play':{const P0=cache.pais[S.pais];if(!P0)return true;this.toast('Armando el país…');const run=async()=>{const cont=cache.cont||(cache.cont=await load('data/mundo/continental.json'));let cid;
    if(P0.codigo==='ARG'){const c=this.data.clubs.find(x=>x.nombre===d.k);if(!c){this.toast('Club no encontrado');return}cid=c.id;this.dataPlay=null}
    else{const r=generar(cache.idx,P0,{cont}),c=r.clubs.find(x=>x.nombre===d.k);if(!c){this.toast('Club no encontrado');return}cid=c.id;this.dataPlay={...structuredClone(this.data),clubs:r.clubs,players:r.players,leagues:r.leagues,pais:r.pais,ext:r.ext,estBase:r.estBase}}
    this.act9('pick',{id:cid})};run().catch(e=>this.toast('No se pudo crear la partida: '+e.message));return true}
   case'mw_c':S.cont=d.k;S.pais=null;S.q='';rr();return true;case'mw_p':S.pais=d.k||null;S.div=1;S.cq='';rr();return true;case'mw_d':S.div=+d.k;S.cq='';rr();return true}
  return oa.call(this,a,d)};
 const oc=P.chg9;P.chg9=function(a,d,v){if(a==='mw_q'||a==='mw_cq'){const S=this.mw;if(a==='mw_q')S.q=v;else S.cq=v;this.game?this.render():this.mundoStart();return true}return oc.call(this,a,d,v)}}
