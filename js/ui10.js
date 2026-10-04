// v1.0/v1.1: móvil, guardado en ranuras, tutorial, logros, salón, editor, roles, Europa, búsqueda y detalles visuales
import {squadOf} from './clubs.js';
import {fmt} from './players.js';
import {badge,kit,face} from './visual.js';
import {ROLES} from './tactics.js';
import {Game} from './game.js';
import {endSeason} from './season.js';
import * as SV from './save.js';
import * as EX from './extras.js';
import * as V11 from './v11.js';
import * as CH from './charts.js';
import * as WO from './world.js';

const tabs=(cur,list,act)=>`<div class="tabs">${list.map(([k,t])=>`<button class="${k==cur?'on':''}" data-act="${act}" data-k="${k}">${t}</button>`).join('')}</div>`;
const ls=(k,d)=>{try{return localStorage.getItem(k)??d}catch(e){return d}};
const lset=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
const U=g=>g.clubs[g.userClubId];
const TUT=[
 ['👋 Bienvenido, míster','Dirigís un club del fútbol argentino con datos ficticios. Tu trabajo: armar el equipo, manejar la plata y cumplir el objetivo de la directiva sin que te echen.'],
 ['▶ Cómo se juega','En <b>Inicio</b> tocá “Jugar hasta la próxima jornada”. Si activás partidos en vivo, vas a poder cambiar la táctica y hacer cambios mientras se juega. “⏩ Hasta lo importante” frena ante clásicos, copas y decisiones pendientes.'],
 ['📋 Plantilla y tácticas','En <b>Tácticas</b> arrastrás jugadores en la pizarra, elegís formación y estilo, y asignás roles. Cuidá la condición física y las lesiones. En <b>Entrenamiento</b> armás tu semana.'],
 ['💱 Mercado','Solo se ficha en las <b>ventanas</b> (enero-febrero y 1/7 al 15/8). Cada jugador tiene un representante con carácter. Mirá el tope salarial: la directiva no te deja pasarlo.'],
 ['💰 Plata y negocios','Patrocinios, inversionistas, entradas, socios y TV mueven tu presupuesto. Si te endeudás demasiado no podés fichar. Las obras en Instalaciones tardan y cuestan.'],
 ['👔 Vestuario y cantera','Hablá con el plantel, contestá a la prensa y resolvé quejas. La <b>Cantera</b> te da juveniles baratos: subilos cuando estén listos.'],
 ['⌨️ Atajos y ayuda','Espacio juega, <b>/</b> busca jugadores y clubes, y I P T M C V F N E L abren pantallas. Podés guardar en 3 ranuras, exportar tu partida y volver a ver esta ayuda desde “Partida y ajustes”.']];

export function install(UI,H){
const P=UI.prototype,{opts}=H;

// ---------- apariencia ----------
const oth=P.theme;P.theme=function(){oth.call(this);const r=document.documentElement;r.style.setProperty('--fs',ls('fm_fs','1'));r.dataset.anim=ls('fm_anim','1')};

// ---------- inicio de partida ----------
P.start=function(){this.game=null;const sd=this.sd,dsf=this.dsf||'',lvl=id=>(this.data.leagues.find(l=>l.id===id)||{}).nivel||1;
 let cs=this.data.clubs.filter(c=>!sd||c.division==sd);if(dsf==='ascenso')cs=cs.filter(c=>lvl(c.liga)>=4);
 this.el.innerHTML=`<div class="start"><h1>Manager Argentina <small>v1.2</small></h1><p>Elegí tu club. Los jugadores son ficticios. <button data-act="mw_open">🌍 Explorar el mundo</button></p><div id="slots"></div>
 <div class="grid"><label>División<select data-chg="sd"><option value="">Todas</option>${opts(this.data.leagues.map(l=>l.nombre),sd)}</select></label><label>Modo<select data-chg="dsf"><option value="">Carrera libre</option>${Object.entries(V11.DESAFIOS).map(([k,d])=>`<option value="${k}" ${dsf===k?'selected':''}>Desafío: ${d.n}</option>`).join('')}</select></label><label>Importar partida<input type="file" accept=".json,application/json" data-chg="imp"></label></div>
 ${dsf?`<div class="alert">${V11.DESAFIOS[dsf].d}</div>`:''}
 <div class="grid"><label>Buscar club<input data-chg="csq" value="${this.csq||''}" placeholder="Nombre o ciudad"></label></div>
 <div class="cgrid">${cs.filter(c=>!this.csq||(c.nombre+' '+c.ciudad).toLowerCase().includes(this.csq.toLowerCase())).map(c=>`<div class="cpick"><div class="t">${badge(c,34)}<div>${c.nombre}<small>${c.ciudad}, ${c.provincia} · ${c.division}</small></div></div><div class="st"><span>Reputación<b>${c.reputacion}</b></span><span>Presupuesto<b>${fmt(c.presupuesto)}</b></span><span>Plantilla<b>${fmt(c.valorPlantilla)}</b></span></div><button class="pri" data-act="pick" data-id="${c.id}">Dirigir este club</button></div>`).join('')}</div></div>`;
 SV.list().then(l=>{const el=document.getElementById('slots');if(!el)return;const any=l.filter(x=>x.meta);el.innerHTML=any.length?`<h3>Continuar</h3><div class="slots">${any.map(x=>`<div class="card"><h4>${x.label}</h4><p>${x.meta.club}<br><small class="muted">${x.meta.fecha}</small></p><button class="pri" data-act="loadslot" data-k="${x.k}">Cargar</button></div>`).join('')}</div>`:''})};

// ---------- ajustes / guardado ----------
P.v_guardar=function(){const g=this.g,sl=this.slotsCache||[];let t=ls('fm_theme','dark');
 SV.list().then(l=>{this.slotsCache=l;const el=document.getElementById('slotl');if(el)el.innerHTML=this.slotsHtml(l)});
 return`<h2>Partida y ajustes</h2><h3>Guardado</h3><div id="slotl">${this.slotsHtml(sl)}</div><p><button data-act="export">⬇️ Exportar partida (archivo)</button> <label class="filebtn">⬆️ Importar<input type="file" accept=".json,application/json" data-chg="imp" hidden></label> <button class="bad" data-act="new">Volver al inicio</button></p><p class="hint">Se guarda en este navegador (IndexedDB) y hay autoguardado. Exportá un archivo para pasar la partida a otro dispositivo o tener un respaldo.</p>
 <h3>Apariencia y accesibilidad</h3><div class="grid"><label>Tema<select data-chg="tema"><option value="dark" ${t=='dark'?'selected':''}>Oscuro vivo</option><option value="light" ${t=='light'?'selected':''}>Claro</option><option value="club" ${t=='club'?'selected':''}>Color del club</option></select></label><label>Tamaño del texto<select data-chg="fs">${[['.9','Chico'],['1','Normal'],['1.15','Grande'],['1.3','Muy grande']].map(([v,l])=>`<option value="${v}" ${ls('fm_fs','1')==v?'selected':''}>${l}</option>`).join('')}</select></label><label>Animaciones<select data-chg="anim"><option value="1" ${ls('fm_anim','1')==='1'?'selected':''}>Activadas</option><option value="0" ${ls('fm_anim','1')==='0'?'selected':''}>Reducidas</option></select></label><label>Sonido<select data-chg="snd"><option value="1" ${EX.soundOn()?'selected':''}>Activado</option><option value="0" ${EX.soundOn()?'':'selected'}>Silencio</option></select></label></div>
 <h3>Jugabilidad</h3><p><button data-act="fog">Niebla de información: ${g.fog?'activada':'desactivada'}</button> <button data-act="livetog">Partidos en vivo: ${g.live?'sí':'no'}</button> <button data-act="tut_open">Ver tutorial</button> <button data-nav data-act="nav" data-v="editor">Editor de datos</button></p><p class="hint">Con la niebla activada ves rangos estimados de los jugadores de otros clubes y los ojeadores los afinan.</p>${g.editado?'<p class="hint">✏️ Esta partida usa datos editados.</p>':''}`};
P.slotsHtml=function(l){return`<div class="slots">${(l.length?l:[['1','Ranura 1'],['2','Ranura 2'],['3','Ranura 3'],['auto','Autoguardado']].map(([k,label])=>({k,label,meta:null}))).map(x=>`<div class="card"><h4>${x.label}</h4>${x.meta?`<p>${x.meta.club}<br><small class="muted">${x.meta.fecha}</small></p>`:'<p class="muted">Vacía</p>'}${x.k!=='auto'?`<button class="pri" data-act="saveslot" data-k="${x.k}">Guardar aquí</button> `:''}${x.meta?`<button data-act="loadslot" data-k="${x.k}">Cargar</button> <button class="bad" data-act="delslot" data-k="${x.k}">✕</button>`:''}</div>`).join('')}</div>`};

// ---------- logros / salón / editor ----------
P.v_logros=function(){const g=this.g,n=Object.keys(g.logros).length,s=g.stats;
 return`<h2>Logros y estadísticas</h2><div class="cards"><div><b>Logros</b>${n}/${EX.LOGROS.length}</div><div><b>Partidos</b>${s.pj}<small>${s.v}G ${s.e}E ${s.d}P</small></div><div><b>Goles</b>${s.gf}-${s.gc}</div><div><b>Mejor racha</b>${s.maxRacha||0} victorias<small>Invicto: ${s.maxInv}</small></div><div><b>Temporadas</b>${s.temporadas}</div></div>
 <div class="g2">${EX.LOGROS.map(([id,nm,d])=>{const got=g.logros[id];return`<div class="card ${got?'':'locked'}"><h4>${got?'🏅':'🔒'} ${nm}</h4><p class="hint">${d}</p>${got?`<small class="muted">${got}</small>`:''}</div>`}).join('')}</div>`};
P.v_salon=function(){const g=this.g,c=U(g),s=g.stats,t=s.t;
 const idol=[...g.idolos].sort((a,b)=>b.pj-a.pj),act=squadOf(g,g.userClubId).filter(p=>p.cpj).sort((a,b)=>(b.cgol||0)-(a.cgol||0)).slice(0,5);
 const d=g.desafio;
 return`<h2>Salón de la fama</h2><div class="cards"><div><b>Títulos de liga</b>${t.liga}</div><div><b>Copa Argentina</b>${t.copa}</div><div><b>Libertadores</b>${t.lib}</div><div><b>Sudamericana</b>${t.sud}</div><div><b>Ascensos</b>${t.asc}</div></div>
 ${d?`<div class="alert ${d.fail?'b':''}">🎯 Desafío “${V11.DESAFIOS[d.tipo].n}”: ${d.ok?'<b>¡cumplido!</b>':d.fail?'fallido':`${d.anios}/${d.limite} temporadas`}</div>`:''}
 <div class="g2"><div><h3>Récords</h3>${g.rec.goleada?`<div class="kv"><span>Mayor goleada</span><b>${g.rec.goleada.txt} (${g.rec.goleada.y})</b></div>`:''}${g.rec.derrota?`<div class="kv"><span>Peor derrota</span><b>${g.rec.derrota.txt} (${g.rec.derrota.y})</b></div>`:''}<div class="kv"><span>Mejor racha ganadora</span><b>${s.maxRacha||0}</b></div><div class="kv"><span>Invicto más largo</span><b>${s.maxInv}</b></div></div>
 <div><h3>Ídolos del club</h3>${idol.length?idol.map(i=>`<div class="kv"><span>⭐ ${i.nombre} <small class="muted">${i.pos}</small></span><b>${i.pj} PJ · ${i.gol} goles</b></div>`).join(''):'<p class="muted">Un jugador se vuelve ídolo al pasar los 120 partidos en tu club.</p>'}<h3>Con más goles en tu era</h3>${act.map(p=>`<div class="kv"><span>${p.nombre}</span><b>${p.cgol||0} goles · ${p.cpj} PJ</b></div>`).join('')||'<p class="muted">—</p>'}</div></div>
 ${g.europa.length?`<h3>Exportados a Europa</h3>${g.europa.map(e=>`<div class="kv"><span>${e.y} · ${e.nombre} → ${e.club}</span><b>${fmt(e.fee)}${e.pct?` · reventa ${Math.round(e.pct*100)}%${e.done?' ✔':''}`:''}</b></div>`).join('')}`:''}`};
P.v_editor=function(){const g=this.g,c=U(g),q=this.edq||'',k=this.ek||'club',res=q.length>=2?Object.values(g.players).filter(p=>p.nombre.toLowerCase().includes(q.toLowerCase())).slice(0,10):[];
 return`<h2>Editor de datos</h2><p class="hint">Cambiá nombres y atributos a tu gusto (por ejemplo para cargar plantillas reales). Los cambios quedan en esta partida y la marcan como editada.</p>${tabs(k,[['club','Mi club'],['jug','Jugadores']],'ek')}
 ${k==='club'?`<div class="grid"><label>Nombre<input id="ecn" value="${c.nombre}"></label><label>Ciudad<input id="ecc" value="${c.ciudad}"></label><label>Estadio<input id="ece" value="${c.estadio}"></label></div><p><button class="pri" data-act="ed_club">Guardar</button></p>`:`<label style="max-width:320px">Buscar jugador<input data-chg="edq" value="${q}" placeholder="al menos 2 letras"></label>${res.map(p=>`<div class="card"><h4>${face(p,26)} ${p.nombre} <small class="muted">${p.pos} · ${p.clubId?(g.clubs[p.clubId]?.nombre||''):'libre'}</small></h4><div class="grid"><label>Nombre<input id="en${p.id}" value="${p.nombre}"></label><label>Edad<input id="ea${p.id}" type="number" value="${p.edad}"></label><label>OVR<input id="eo${p.id}" type="number" value="${p.ovr}"></label><label>POT<input id="ep${p.id}" type="number" value="${p.pot}"></label></div><button class="pri" data-act="ed_pl" data-id="${p.id}">Guardar</button></div>`).join('')}`}`};

// ---------- tutorial, búsqueda, resumen ----------
P.tutorial=function(i=0){const dl=document.getElementById('dlg'),[t,x]=TUT[i];dl.innerHTML=`<h3>${t}</h3><p style="max-width:460px">${x}</p><p class="hint">Paso ${i+1} de ${TUT.length}</p><p>${i<TUT.length-1?`<button class="pri" data-act="tut_n" data-i="${i+1}">Siguiente</button> `:`<button class="pri" data-act="tut_end">¡A jugar!</button> `}<button data-act="tut_end">Saltar</button></p>`;if(!dl.open)dl.showModal()};
P.buscar=function(){const dl=document.getElementById('dlg');dl.innerHTML=`<h3>Buscar</h3><input id="gs" placeholder="Jugador o club…" autocomplete="off" style="width:100%"><div id="gsr" class="gsr"></div><form method="dialog"><p><button>Cerrar</button></p></form>`;dl.showModal();setTimeout(()=>document.getElementById('gs')?.focus(),30)};
P.buscarRes=function(q){const g=this.g,el=document.getElementById('gsr');if(!el)return;q=q.toLowerCase().trim();if(q.length<2){el.innerHTML='';return}
 const ps=Object.values(g.players).filter(p=>p.nombre.toLowerCase().includes(q)).sort((a,b)=>b.ovr-a.ovr).slice(0,8),cs=Object.values(g.clubs).filter(c=>c.nombre.toLowerCase().includes(q)).slice(0,5);
 el.innerHTML=`${cs.map(c=>`<div class="kv"><span>${badge(c,16)} ${c.nombre}</span><span class="muted">${c.division}</span></div>`).join('')}${ps.map(p=>`<div class="kv"><a class="plink" data-act="card" data-id="${p.id}">${p.nombre}</a><span class="muted">${p.pos} · ${p.ovr}/${p.pot} · ${g.clubs[p.clubId]?.nombre||'libre'}</span></div>`).join('')}`};
P.resumen=function(){const g=this.g,r=g.resumen;if(!r)return;const dl=document.getElementById('dlg');
 dl.innerHTML=`<h3>Resumen de la temporada ${r.y}</h3><div class="cards" style="grid-template-columns:repeat(2,1fr)"><div><b>${r.div}</b>${r.pos}º${r.champ?' 🏆':''}</div><div><b>Objetivo</b>${r.ok?'✅ Cumplido':'❌ No cumplido'}</div><div><b>Goleador</b>${r.goleador}</div><div><b>Presupuesto</b>${fmt(r.ppto)}</div></div><p>${r.promoted?'🎉 Ascendiste. ':''}${r.relegated?'⬇️ Descendiste. ':''}${r.copa?'🏆 Campeón de la Copa Argentina. ':''}Ingresos ${fmt(r.ing)} · Gastos ${fmt(r.gas)} · Logros: ${r.logros}/${EX.LOGROS.length}</p><form method="dialog"><p><button class="pri">Empezar la nueva temporada</button></p></form>`;dl.showModal()};

// ---------- wrappers de vistas ----------
const oin=P.v_inicio;P.v_inicio=function(){const g=this.g;let h=oin.call(this);if(g.despedido)return h;h=h.replace('<div class="hero">',`<div class="hero"><span class="kit">${kit(U(g),62)}</span>`);
 const d=g.desafio;if(d&&!d.ok&&!d.fail)h=h.replace('<div class="cards">',`<div class="alert">🎯 Desafío “${V11.DESAFIOS[d.tipo].n}”: ${d.anios}/${d.limite} temporadas</div><div class="cards">`);return h};
const otc=P.v_tacticas;P.v_tacticas=function(){const g=this.g,sq=g.lineup.xi.map(i=>g.players[i]);let h=otc.call(this);
 return h+`<h3>Roles</h3><p class="hint">Un rol rinde más si el jugador tiene el atributo que lo define (+5% como máximo) y rinde menos si no lo tiene.</p><div class="grid">${sq.map(p=>{const r=ROLES[p.pos]||[];return r.length?`<label>${p.pos} ${p.nombre}<select data-chg="rol" data-id="${p.id}"><option value="">Sin rol</option>${r.map(x=>`<option ${g.roles[p.id]===x[0]?'selected':''} value="${x[0]}">${x[0]} (${x[1].toUpperCase()})</option>`).join('')}</select></label>`:''}).join('')}</div>`};
const omk=P.v_mercado;P.v_mercado=function(){const g=this.g;let h=omk.call(this);
 const eu=g.euOfertas.map(o=>{const p=g.players[o.pid];return`<div class="card"><h4>🌍 ${o.club} <small class="muted">vence ${o.vence}</small></h4><p>Quiere a <b>${p.nombre}</b> (${p.pos}, ${p.edad} años, OVR ${p.ovr}). Ofrece <b>${fmt(o.fee)}</b>.</p><button class="pri" data-act="eu" data-id="${o.id}" data-m="ok">Aceptar ${fmt(o.fee)}</button> <button data-act="eu" data-id="${o.id}" data-m="reventa">Menos plata (${fmt(Math.round(o.fee*.8/10000)*10000)}) + 20% de reventa</button> <button data-act="eu" data-id="${o.id}" data-m="no">Rechazar</button></div>`}).join('');
 return eu?h.replace('<h3>Jugadores disponibles</h3>',`<h3>Ofertas desde Europa</h3>${eu}<h3>Jugadores disponibles</h3>`):h};
const omu=P.v_mundo;P.v_mundo=function(){let h=omu.call(this);if(this.mq!=='estadio')return h;const g=this.g,c=U(g),tiers=Math.min(4,1+Math.floor(c.capacidad/18000)),proy=g.mundo.proy,W=420,Hh=250;
 let s='';for(let t=0;t<tiers;t++){const m=18+t*14;s+=`<rect x="${m}" y="${m*.7}" width="${W-2*m}" height="${Hh-m*1.4}" rx="${40-t*6}" fill="hsl(var(--h) ${50+t*8}% ${30+t*9}%)" stroke="rgba(0,0,0,.35)"/>`}
 s+=`<rect x="${W*.22}" y="${Hh*.3}" width="${W*.56}" height="${Hh*.4}" rx="8" fill="#2f7d46"/><rect x="${W*.22}" y="${Hh*.3}" width="${W*.56}" height="${Hh*.4}" rx="8" fill="none" stroke="#fff" stroke-opacity=".7"/><line x1="${W/2}" y1="${Hh*.3}" x2="${W/2}" y2="${Hh*.7}" stroke="#fff" stroke-opacity=".7"/><circle cx="${W/2}" cy="${Hh/2}" r="14" fill="none" stroke="#fff" stroke-opacity=".7"/>`;
 if(proy)s+=`<g stroke="#fbbf24" stroke-width="3"><line x1="${W-50}" y1="10" x2="${W-50}" y2="90"/><line x1="${W-50}" y1="10" x2="${W-110}" y2="10"/><line x1="${W-110}" y1="10" x2="${W-110}" y2="30"/></g><text x="${W-52}" y="${Hh-6}" text-anchor="end" fill="#fbbf24" font-size="12">En obra</text>`;
 return h+`<h3>El estadio</h3><svg viewBox="0 0 ${W} ${Hh}" class="chart" style="max-width:520px">${s}</svg><p class="hint">${c.estadio} · ${tiers} anillo(s) de tribuna según la capacidad.</p>`};
const ohi=P.v_historia;P.v_historia=function(){const g=this.g,c=U(g),B=Array(6).fill(0),A=Array(6).fill(0),nm=c.nombre;
 for(const r of g.league.results){if(r.h!==c.id&&r.a!==c.id||!r.ev)continue;for(const e of r.ev){if(e.t!=='gol')continue;const b=Math.min(5,Math.floor((e.min-1)/15));if(e.txt.includes('GOOOL de '+nm))B[b]++;else A[b]++}}
 const cats=['1-15','16-30','31-45','46-60','61-75','76-90'];
 return ohi.call(this)+(B.concat(A).some(x=>x)?`<h3>Goles por período (esta temporada)</h3><div class="card">${CH.bars({cats,series:[{name:'A favor',color:'var(--ok)',data:B},{name:'En contra',color:'var(--bad)',data:A}]})}</div>`:'')};

// ---------- ficha de jugador ----------
const oc=P.card;P.card=function(id){oc.call(this,id);const g=this.g,p=g.players[id],dl=document.getElementById('dlg');if(!p||!dl.open)return;const ph=dl.querySelector('.ph');if(ph)ph.insertAdjacentHTML('afterbegin',face(p,56,g.clubs[p.clubId]));
 if(p.clubId===g.userClubId&&p.lesion>=12&&!p.rehab){const f=dl.querySelector('form p');if(f)f.insertAdjacentHTML('afterbegin',`<button type="button" data-act="rehab" data-id="${p.id}">🩺 Tratamiento intensivo (${fmt(V11.costoRehab(g,p))})</button> `)}};

// ---------- móvil: barra inferior ----------
const orn=P.render;P.render=function(){orn.call(this);if(!this.game||!this.el.querySelector('.side'))return;const g=this.g,v=this.view,it=[['inicio','🏠','Inicio'],['plantilla','👥','Plantilla'],['tacticas','📋','Tácticas'],['mercado','💱','Mercado']];
 this.el.insertAdjacentHTML('beforeend',`<div class="scrim ${this.mo?'open':''}" data-act="menu"></div><nav class="bnav">${it.map(([k,i,t])=>`<button class="${k==v?'on':''}" data-act="nav" data-v="${k}"><i>${i}</i><span>${t}</span></button>`).join('')}<button data-act="menu" class="${this.mo?'on':''}"><i>☰</i><span>Menú</span></button></nav>`);
 const sd=this.el.querySelector('.side');if(sd&&this.mo)sd.classList.add('open');
 if(g.nuevoLogro){const n=g.nuevoLogro;g.nuevoLogro=null;EX.sonido('logro');this.toast('🏅 Logro: '+n)}};
const ogo=P.go;P.go=function(){ogo.call(this);const g=this.g;if(g&&!g.pend&&Date.now()-(this._as||0)>30000){this._as=Date.now();SV.save(g,'auto')}};

// ---------- sonido en el partido ----------
const orl=P.renderLive;P.renderLive=function(){const lm=this.lm,n0=this._en??0;orl.call(this);if(!lm)return;if(this._lm!==lm){this._lm=lm;this._en=0}
 const ev=lm.ev;for(let i=this._en;i<ev.length;i++){const t=ev[i].t;if(t==='gol')EX.sonido('gol');else if(t==='amarilla'||t==='roja')EX.sonido('tarjeta')}this._en=ev.length;if(lm.min===45||lm.min>=90){if(this._pm!==lm.min){this._pm=lm.min;EX.sonido('pito')}}};

// ---------- cambios ----------
const oc9=P.chg9;P.chg9=function(a,d,v){const g=this.game&&this.g;switch(a){
 case'imp':{const f=(typeof v==='string'&&v)?null:null;return true}
 case'dsf':this.dsf=v;this.start();return true;case'csq':this.csq=v;this.start();document.querySelector('[data-chg=csq]')?.focus();return true;
 case'fs':lset('fm_fs',v);this.render();return true;
 case'anim':lset('fm_anim',v);this.render();return true;
 case'snd':EX.setSound(v==='1');EX.sonido('ok');this.render();return true;
 case'rol':g.roles&&this.toast(V11.setRol(g,+d.id,v));this.render();return true;
 case'edq':this.edq=v;this.render();return true}
 return this.game?oc9.call(this,a,d,v):false};

// ---------- acciones ----------
const oa9=P.act9;P.act9=function(a,d){const g=this.game&&this.g,done=(m,keep)=>{if(m)this.toast(m);if(!keep)this.render()};switch(a){
 case'menu':this.mo=!this.mo;this.render();return true;
 case'nav':if(!this.game)return false;this.mo=false;EX.sonido('click');break;
 case'pick':{this.game=Game.create(structuredClone(this.data),+d.id);if(this.dsf)V11.iniciarDesafio(this.game,this.dsf);this.dsf='';this.view='inicio';this.render();if(ls('fm_tut','0')!=='1')this.tutorial(0);return true}
 case'saveslot':SV.save(g,d.k).then(ok=>{this.toast(ok?'Partida guardada':'No se pudo guardar (poco espacio)');if(this.view==='guardar')this.render()});return true;
 case'loadslot':SV.load(d.k).then(n=>{if(n){this.game=n;this.view='inicio';this.go();this.toast('Partida cargada')}else this.toast('Ranura vacía')});return true;
 case'load':SV.load('1').then(n=>{if(n){this.game=n;this.view='inicio';this.go();this.toast('Partida cargada')}else this.toast('No hay partida guardada')});return true;
 case'save':SV.save(g,'1').then(ok=>this.toast(ok?'Partida guardada en la ranura 1':'No se pudo guardar'));return true;
 case'delslot':if(confirm('¿Borrar esta ranura?'))SV.borrar(d.k).then(()=>this.render());return true;
 case'export':SV.exportar(g);this.toast('Archivo descargado');return true;
 case'tut_open':this.tutorial(0);return true;
 case'tut_n':this.tutorial(+d.i);return true;
 case'tut_end':lset('fm_tut','1');document.getElementById('dlg').close();return true;
 case'ek':this.ek=d.k;this.render();return true;
 case'ed_club':{const v=i=>document.getElementById(i).value;done(V11.editClub(g,{nombre:v('ecn'),ciudad:v('ecc'),estadio:v('ece')}));return true}
 case'ed_pl':{const v=i=>document.getElementById(i+d.id).value;done(V11.editPlayer(g,+d.id,{nombre:v('en'),edad:v('ea'),ovr:v('eo'),pot:v('ep')}));return true}
 case'rehab':done(V11.rehab(g,+d.id),true);document.getElementById('dlg').close();this.render();return true;
 case'eu':{const m=V11.responderEU(g,+d.id,d.m);EX.sonido('ok');done(m);return true}
 case'endseason':{endSeason(g);this.view='inicio';this.mo=false;this.render();SV.save(g,'auto');this.resumen();return true}}
 return this.game?oa9.call(this,a,d):false};

// importar partida (desde inicio o ajustes)
document.addEventListener('change',async e=>{const t=e.target;if(t.dataset?.chg!=='imp'||!t.files?.[0])return;const ui=window.__ui;try{ui.game=await SV.importar(t.files[0]);ui.view='inicio';ui.go();ui.toast('Partida importada')}catch(err){ui.toast('No se pudo importar: '+err.message)}t.value=''},true);

// búsqueda global
if(typeof document!=='undefined'){document.addEventListener('input',e=>{if(e.target.id==='gs')window.__ui.buscarRes(e.target.value)});
 document.addEventListener('keydown',e=>{const ui=window.__ui;if(!ui||!ui.game||ui.lm)return;const tg=document.activeElement?.tagName;if((e.key==='/'&&!/INPUT|SELECT|TEXTAREA/.test(tg))||(e.key.toLowerCase()==='k'&&(e.ctrlKey||e.metaKey))){e.preventDefault();ui.buscar()}})}
}
