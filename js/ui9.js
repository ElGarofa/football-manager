// Pantallas y acciones de la v0.9: vestuario, cantera, mercado, carrera, selección, mundo, planificación y QoL
import {squadOf,wageBill} from './clubs.js';
import {fmt} from './players.js';
import {badge} from './visual.js';
import {OPTIONS,LBL,autoLineup} from './tactics.js';
import * as PE from './people.js';
import * as YO from './youth.js';
import * as MK from './market.js';
import * as CA from './career.js';
import * as NA from './nacional.js';
import * as WO from './world.js';
import * as T from './transfers.js';
import * as CP from './comp.js';
import * as CH from './charts.js';
import {renewCalc,renew} from './season.js';
import {refPrice,ingresoProy} from './finance.js';

const sel=(items,cur,attrs='')=>`<select ${attrs}>${items.map(x=>{const[v,l]=Array.isArray(x)?x:[x,x];return`<option value="${v}" ${v==cur?'selected':''}>${l}</option>`}).join('')}</select>`;
const meter=(v,cls='')=>`<div class="meter ${cls}"><i style="width:${Math.max(0,Math.min(100,v))}%"></i></div>`;
const tabs=(cur,list,act)=>`<div class="tabs">${list.map(([k,t])=>`<button class="${k==cur?'on':''}" data-act="${act}" data-k="${k}">${t}</button>`).join('')}</div>`;
const POSL=['POR','DFC','LI','LD','MCD','MC','MCO','MI','MD','EI','ED','DC'];
const NEWS_TOP={Partidos:/J\d+:|⚽|Clásico|clásico|Copa|Libertadores|Sudamericana|Liga de Campeones|Liga Europa|Liga de Campeones|campe|🏆|🟥|🟨|Mundial|Eliminatorias/,Mercado:/oferta|fich|vend|préstamo|cláusula|ventana|mercado|pagó|📨|🗞️|Último día|renov|contrato/i,Club:/obra|sponsor|patroc|inversion|estadio|socios|directiva|objetivo|presupuesto|elecciones|confianza|🏟️|🗳️|🏛️|🌱|💰|💼|🤝/i,Gente:/vestuario|capit|moral|se queja|prensa|lesi|🩹|😠|🎖️|rumor|Cantera|Sub-17|Reserva|juvenil|🇦🇷/i};

export function install(UI,H){
const P=UI.prototype,{pTable,chip,AT,bar,opts,dias}=H;
const U=g=>g.clubs[g.userClubId];
const alertsOf=g=>{const a=PE.alertas(g),w=WO.alertas(g),out=[];
 if(g.ofertas.length)out.push(['mercado',`📨 ${g.ofertas.length} oferta(s) por tus jugadores`]);
 if(g.prensa)out.push(['vestuario','🎤 Conferencia de prensa pendiente']);
 if(a.quejas)out.push(['vestuario',`😠 ${a.quejas} queja(s) en el vestuario`]);
 if(w.eventos)out.push(['mundo',`📩 ${w.eventos} decisión(es) pendiente(s)`]);
 if(g.ofertasDT?.length&&!g.despedido)out.push(['carrera',`💼 ${g.ofertasDT.length} oferta(s) para dirigir otro club`]);
 if(g.sel?.hasta)out.push(['seleccion',g.pais.bandera+' Fecha FIFA: convocados de tu club viajan']);
 if(a.susp)out.push(['vestuario',`🟥 ${a.susp} suspendido(s)`]);
 if(g.enVentana&&['02-28','08-15'].includes(g.date.slice(5)))out.push(['mercado','⏰ Último día del mercado de pases']);
 const sq=squadOf(g,g.userClubId);if(g.juv&&g.juv.S.concat(g.juv.R).some(p=>p.ovr>=55))out.push(['cantera','🌱 Hay juveniles listos para subir']);
 if(g.rumores?.length)out.push(['vestuario','🗞️ Rumores sobre tus jugadores']);
 return out};
const sigOf=g=>{const a=PE.alertas(g),w=WO.alertas(g);return a.quejas+a.prensa+g.ofertas.length+w.eventos+(g.ofertasDT?.length||0)+(g.sel?.hasta?1:0)};

// ---------- Inicio ----------
const oIn=P.v_inicio;
P.v_inicio=function(){const g=this.g;if(g.despedido)return this.vDespedido();
 const al=alertsOf(g),m=WO.proxRival(g),cl=m?WO.pronostico(g,m.local?g.userClubId:m.id,m.fecha):null;
 const extra=`${al.length?`<div class="alerts">${al.map(([v,t])=>`<button class="chipa" data-act="nav" data-v="${v}">${t}</button>`).join('')}</div>`:''}`;
 let h=oIn.call(this);
 h=h.replace(/<button data-act="day">Avanzar un día<\/button>/,`<button data-act="day">Avanzar un día</button> <button data-act="nextimp" title="Para al llegar un partido importante o cuando aparece algo que requiere tu atención">⏩ Hasta lo importante</button>`);
 h=h.replace(/<div class="cards">/,`${extra}${m?`<p class="hint">${WO.CLIMAS[cl.n].ic} Pronóstico para el próximo partido (${m.fecha.slice(8)}/${m.fecha.slice(5,7)}): <b>${cl.n}</b>${cl.seguro?'':' (estimado)'}${WO.esClasico(g,g.userClubId,m.id)?' · <b>🔥 ¡Es clásico!</b>':''}</p>`:''}<div class="cards">`);
 return h};
P.vDespedido=function(){const g=this.g;return`<h2>${g.confianza<=0?'Te despidieron':'Dejaste el club'}</h2><p>${g.confianza<=0?'La directiva perdió la confianza en vos.':'Renunciaste a tu cargo.'} Tu reputación como entrenador es <b>${Math.round(g.dt.rep)}</b>. Estas son las ofertas que tenés:</p>
 ${g.ofertasDT.length?g.ofertasDT.map(o=>`<div class="card"><h4>${badge(g.clubs[o.club],26)} ${g.clubs[o.club].nombre} <small class="muted">${g.clubs[o.club].division}</small></h4><p>Sueldo ${fmt(o.sueldo)} · ${o.anios} año(s) · objetivo: top ${o.obj}</p><button class="pri" data-act="dt_ok" data-id="${o.id}">Aceptar</button></div>`).join(''):'<p class="muted">Nadie te llamó.</p>'}
 <p><button data-act="new">Empezar una nueva partida</button></p>`};
// Hasta lo importante
P.jugarImportante=function(){const g=this.g,s0=sigOf(g);let n=0,stop='';
 while(n++<80&&!g.allDone){const was=g.date,pl=g.advanceDay();
  if(g.pend){stop='partido';break}
  if(sigOf(g)>s0){stop='aviso';break}
  const m=WO.proxRival(g);if(pl&&m&&WO.esClasico(g,g.userClubId,m.id)){stop='clásico';break}
  if(g.enVentana&&['02-28','08-15'].includes(g.date.slice(5))){stop='cierre';break}
  if(pl){const nc=CP.proximoUser(g);if(nc&&dias(g.date,nc.fecha)<=1){stop='copa';break}}}
 this.go();this.toast(stop?`Pausa: ${{partido:'partido en vivo',aviso:'hay algo que requiere tu atención',clásico:'se viene un clásico',cierre:'cierra el mercado',copa:'partido de copa'}[stop]}`:'Listo');};

// ---------- Noticias (filtro por tema) ----------
P.v_noticias=function(){const g=this.g,f=this.nf||'Todas',list=g.news.slice().reverse().filter(n=>f==='Todas'||NEWS_TOP[f].test(n));
 return`<h2>Noticias</h2>${tabs(f,[['Todas','Todas'],...Object.keys(NEWS_TOP).map(k=>[k,k])],'nf')}${list.length?list.map(n=>`<div class="kv"><span>${n}</span></div>`).join(''):'<p class="muted">Nada en esta categoría.</p>'}`};

// ---------- Vestuario ----------
P.v_vestuario=function(){const g=this.g,s=squadOf(g,g.userClubId),clm=PE.climaOf(g),cap=g.players[PE.autoCapitan(g)],used=g.charlaUsada===g.date;
 const rows=[...s].sort((a,b)=>POSL.indexOf(a.pos)-POSL.indexOf(b.pos)||b.ovr-a.ovr);
 return`<h2>Vestuario</h2><div class="cards"><div><b>Clima del grupo</b>${clm}/100${meter(clm,clm<40?'red':clm<60?'amb':'')}<small>${g.conflictos.length?g.conflictos.length+' conflicto(s) abierto(s)':'Sin conflictos'}</small></div><div><b>Afición</b>${Math.round(g.afic)}/100${meter(g.afic,g.afic<40?'red':g.afic<60?'amb':'')}<small>Humor de la tribuna</small></div><div><b>Capitán</b>${cap?cap.nombre:'—'}<small>${cap?PE.persOf(cap):''}</small></div><div><b>Directiva</b>${g.confianza}/100${meter(g.confianza,g.confianza<35?'red':g.confianza<55?'amb':'')}</div></div>
 <h3>Charla con el plantel</h3><p>${Object.keys(PE.TONOS).map(t=>`<button class="${used?'':'pri'}" data-act="charla" data-t="${t}" ${used?'disabled':''}>${t}</button>`).join(' ')} <span class="hint">${used?'Ya hablaste hoy.':'Una por día. Cada tono pega distinto según la personalidad. En los partidos en vivo podés dar charla previa y de entretiempo.'}</span></p>
 <div class="hint">${Object.entries(PE.TONO_TXT).map(([k,v])=>`<b>${k}</b>: ${v}`).join(' · ')}</div>
 ${g.prensa?`<h3>🎤 Conferencia de prensa</h3><div class="card"><h4>“${g.prensa.q}”</h4>${g.prensa.o.map((o,i)=>`<p><button data-act="prensa" data-i="${i}">${o.t}</button></p>`).join('')}</div>`:''}
 ${g.quejas.length?`<h3>Pedidos y conflictos</h3>${g.quejas.map(q=>{const p=g.players[q.pid],o=g.players[q.otro];return q.tipo==='minutos'?`<div class="card"><h4>😠 ${p.nombre} <small class="muted">${PE.persOf(p)}</small></h4><p>Reclama más minutos: hace ${p.nj||0} partidos que no juega.</p><button data-act="queja" data-id="${q.id}" data-op="prometer">Prometer minutos</button> <button data-act="queja" data-id="${q.id}" data-op="ignorar">Ignorar</button> <button class="bad" data-act="queja" data-id="${q.id}" data-op="vender">Ponerlo en venta</button></div>`:`<div class="card"><h4>⚡ ${p.nombre} vs ${o?o.nombre:'?'}</h4><p>Discusión en la práctica.</p><button data-act="queja" data-id="${q.id}" data-op="mediar">Mediar</button> <button data-act="queja" data-id="${q.id}" data-op="multar">Multar</button> <button data-act="queja" data-id="${q.id}" data-op="ignorar">Ignorar</button></div>`}).join('')}`:''}
 ${g.rumores.length?`<h3>Rumores</h3>${g.rumores.map(r=>`<div class="kv"><span>🗞️ ${g.clubs[r.club].nombre} pretende a ${g.players[r.pid].nombre}</span><b>hasta ${r.hasta.slice(8)}/${r.hasta.slice(5,7)}</b></div>`).join('')}`:''}
 <h3>Plantel y personalidades</h3><div class="tw"><table><tr><th>Pos</th><th>Nombre</th><th>Personalidad</th><th>Moral</th><th>Sin jugar</th><th>Amarillas</th><th>Estado</th><th></th></tr>${rows.map(p=>`<tr><td>${chip(p.pos)}</td><td><a class="plink" data-act="card" data-id="${p.id}">${p.nombre}</a>${p.id===g.capitan?' 🎖️':''}</td><td title="${PE.PERS_TXT[PE.persOf(p)]}">${PE.persOf(p)}</td><td>${bar(Math.round(p.mor))}</td><td>${p.nj||0}</td><td>${p.am||0}</td><td>${p.susp>0?'🟥 suspendido '+p.susp:p.lesion>0?'🩹 '+p.lesion+'d':p.prom?'📝 promesa':p.venta?'🏷️ en venta':'—'}</td><td>${p.id!==g.capitan?`<button data-act="cap" data-id="${p.id}">Capitán</button>`:''}</td></tr>`).join('')}</table></div>`};

// ---------- Cantera ----------
P.v_cantera=function(){const g=this.g,J=g.juv,k=this.cq||'R',me=U(g);
 const T_=[['R','Reserva'],['S','Sub-17'],['red','Captación'],['tor','Torneos']];
 let body='';
 if(k==='R'||k==='S'){const ps=[...J[k]].sort((a,b)=>b.pot-a.pot),ment=YO.mentores(g);
  body=`<p class="hint">${k==='R'?'La Reserva juega su torneo cada fecha. A los 22 años salen del club si no suben.':'Los de Sub-17 pasan a Reserva al cumplir 18.'} Los mentores (veteranos líderes o profesionales) aceleran el crecimiento.</p>
  <div class="tw"><table><tr><th>Pos</th><th>Nombre</th><th>Edad</th><th>OVR</th><th>POT</th><th>PJ</th><th>G</th><th>Mentor</th><th></th></tr>${ps.map(p=>{const mt=J.mentores.find(m=>m.jid===p.id);return`<tr><td>${chip(p.pos)}</td><td>${p.nombre}${p.region?` <small class="muted">(${p.region})</small>`:''}</td><td>${p.edad}</td><td>${bar(p.ovr)}</td><td>${p.pot}</td><td>${p.pj||0}</td><td>${p.gol||0}</td><td>${mt?`${g.players[mt.mid]?.nombre||'?'} <button data-act="ment_q" data-id="${p.id}">✕</button>`:ment.length?`<select id="mn${p.id}"><option value="">—</option>${ment.map(m=>`<option value="${m.id}">${m.nombre}</option>`).join('')}</select> <button data-act="ment_a" data-id="${p.id}">Asignar</button>`:'<span class="muted">sin candidatos</span>'}</td><td><button class="pri" data-act="y_up" data-id="${p.id}">Subir al plantel</button> ${k==='S'?`<button data-act="y_mv" data-id="${p.id}">A Reserva</button> `:''}<button class="bad" data-act="y_free" data-id="${p.id}">Liberar</button></td></tr>`}).join('')}</table></div>`}
 else if(k==='red')body=`<div class="cards"><div><b>Red de captación</b>Nivel ${J.red}/5<small>${J.red<5?`Subir cuesta ${fmt(YO.costoRed(J.red))}`:'Máximo'}</small></div><div><b>Convenios</b>${J.convenios.length}/4<small>Costo anual ${fmt(YO.costoConv(g))} c/u</small></div><div><b>Staff de juveniles</b>${g.cuerpo?.Juveniles?'Nivel '+g.cuerpo.Juveniles.nivel:'—'}<small>Contratalo en Carrera</small></div></div>
  <p><button class="pri" data-act="y_red">Mejorar la red de captación</button></p><h3>Convenios con clubes chicos</h3><p class="hint">Cada año recibís 1-2 juveniles extra de la provincia del club.</p>
  ${J.ofrecidos.map(id=>{const c=g.clubs[id];if(!c)return'';const on=J.convenios.includes(id);return`<div class="kv"><span>${badge(c,18)} ${c.nombre} <small class="muted">${c.provincia} · ${c.division}</small></span><button class="${on?'bad':'pri'}" data-act="y_conv" data-id="${id}">${on?'Terminar':'Firmar'}</button></div>`}).join('')}`;
 else body=['R','S'].map(q=>{const t=J.tor[q],tb=YO.tabla(g,q);return`<h3>${q==='R'?'Torneo de Reserva':'Torneo Sub-17'} <small class="muted">fecha ${t.j}/${t.fx.length}</small></h3><div class="tw"><table><tr><th>#</th><th>Club</th><th>PJ</th><th>G</th><th>E</th><th>P</th><th>DG</th><th>Pts</th></tr>${tb.map((r,i)=>`<tr class="${r.id===g.userClubId?'me':''}"><td>${i+1}</td><td>${this.tn(r.id)}</td><td>${r.pj}</td><td>${r.g}</td><td>${r.e}</td><td>${r.p}</td><td>${r.gf-r.gc}</td><td><b>${r.pts}</b></td></tr>`).join('')}</table></div>`}).join('')+(J.hist.length?`<h3>Historial</h3>${J.hist.slice().reverse().map(h=>`<div class="kv"><span>${h.y} · ${h.k==='R'?'Reserva':'Sub-17'}</span><b>${h.pos}º</b></div>`).join('')}`:'');
 return`<h2>Cantera</h2><div class="cards"><div><b>Reserva</b>${J.R.length}/${YO.MAXJ}</div><div><b>Sub-17</b>${J.S.length}/${YO.MAXJ}</div><div><b>Mentorías</b>${J.mentores.length}/3</div><div><b>Plantel</b>${me.plantilla.length}/30</div></div>${tabs(k,T_,'cq')}${body}`};

// ---------- Mercado ----------
P.v_mercado=function(){const g=this.g,f=this.f,c=U(g),res=T.search(g,{pos:f.pos,q:f.q,min:+f.min,max:+f.max||0,edad:+f.edad||0,exp:f.exp==='1'});
 const mine=squadOf(g,c.id),prest=mine.filter(p=>p.prestamo&&p.prestamo.op&&p.clubId===c.id);
 const lop=f.lop||'simple';
 return`<h2>Mercado</h2><div class="cards"><div><b>Ventana de pases</b><span class="${g.enVentana?'good':'badc'}">${g.enVentana?'ABIERTA':'CERRADA'}</span><small>${MK.proxVentana(g.date)}</small></div><div><b>Presupuesto</b>${fmt(c.presupuesto)}<small>Plantilla ${c.plantilla.length}/30</small></div><div><b>Tope salarial</b>${fmt(c.topeSalarial)}<small>Usado ${fmt(wageBill(g,c.id))}</small></div></div>
 ${g.enVentana?'':'<div class="alert">Fuera de la ventana solo podés fichar jugadores libres y renovar. Las ventanas son enero-febrero y 1/7 al 15/8.</div>'}
 ${g.fog?'<p class="hint">🌫️ Niebla de información activa: de los jugadores de otros clubes ves rangos estimados.</p>':''}
 <div class="grid"><label>Posición<select data-chg="f" data-k="pos"><option value="">Todas</option>${opts(POSL,f.pos)}</select></label><label>OVR mínimo<input type="number" data-chg="f" data-k="min" value="${f.min}"></label><label>Valor máx.<input type="number" step="100000" data-chg="f" data-k="max" value="${f.max||''}" placeholder="sin tope"></label><label>Edad máx.<input type="number" data-chg="f" data-k="edad" value="${f.edad||''}"></label><label>Nombre<input data-chg="f" data-k="q" value="${f.q}"></label><label>Contrato<select data-chg="f" data-k="exp"><option value="">Todos</option><option value="1" ${f.exp==='1'?'selected':''}>Vencen esta temporada</option></select></label></div>
 <div class="grid"><label>Reventa<select data-chg="f" data-k="rev">${[['','Sin cláusula'],['1','Cedo 15% de reventa (precio menor)']].map(([v,l])=>`<option value="${v}" ${f.rev===v?'selected':''}>${l}</option>`).join('')}</select></label><label>Bonos<select data-chg="f" data-k="bon">${[['','Sin bonos'],['1','Bonos por partido/gol (precio menor)']].map(([v,l])=>`<option value="${v}" ${f.bon===v?'selected':''}>${l}</option>`).join('')}</select></label><label>Préstamo<select data-chg="f" data-k="lop">${[['simple','Simple'],['opcion','Con opción de compra'],['obligacion','Con obligación de compra']].map(([v,l])=>`<option value="${v}" ${lop===v?'selected':''}>${l}</option>`).join('')}</select></label><label>Trueque: ofrezco<select data-chg="f" data-k="swap"><option value="">—</option>${mine.map(p=>`<option value="${p.id}" ${f.swap==p.id?'selected':''}>${p.pos} ${p.nombre} (${p.ovr})</option>`).join('')}</select></label></div>
 ${g.ofertas.length?`<h3>Ofertas recibidas</h3>${g.ofertas.map((o,i)=>`<div class="res">${this.tn(o.club)} ofrece <b>${fmt(o.monto)}</b> por ${g.players[o.pid].nombre} <button class="pri" data-act="offer" data-i="${i}" data-ok="1">Aceptar</button> <button data-act="offer" data-i="${i}" data-ok="0">Rechazar</button></div>`).join('')}`:''}
 ${prest.length?`<h3>Préstamos con opción u obligación</h3>${prest.map(p=>`<div class="res">${p.nombre} (de ${this.tn(p.prestamo.de)}) · ${p.prestamo.op.tipo==='obligacion'?'obligación':'opción'} de compra por <b>${fmt(p.prestamo.op.precio)}</b> ${p.prestamo.op.tipo==='obligacion'?'<small class="muted">(se cumple sola al final)</small>':`<button class="pri" data-act="ejercer" data-id="${p.id}">Ejercer</button>`}</div>`).join('')}`:''}
 <h3>Jugadores disponibles</h3>${pTable(res,p=>{const ag=MK.agOf(p);return`<small title="${MK.AG_TXT[ag.tipo]}">${p.clubId?this.tn(p.clubId):'Libre'} · 🧑‍💼 ${ag.nombre.split(' ')[1]} (${ag.tipo})</small> <button data-act="follow" data-id="${p.id}" title="Seguir">${g.seguir.includes(p.id)?'★':'☆'}</button> <input id="o${p.id}" type="number" step="10000" value="${p.val}" style="width:100px"> <button class="pri" data-act="buy" data-id="${p.id}">Ofertar</button>${p.clubId?` <button data-act="loan" data-id="${p.id}">Préstamo</button>${f.swap?` <button data-act="swap" data-id="${p.id}">Trueque</button>`:''}`:''} <button data-act="cmp" data-id="${p.id}" title="Comparar">⚖</button>`},g)}
 <h3>Vender o prestar</h3>${pTable(mine,p=>`<button data-act="sell" data-id="${p.id}">Vender</button> <button data-act="loanout" data-id="${p.id}">Prestar${lop==='simple'?'':' c/ '+(lop==='opcion'?'opción':'obligación')}</button>${p.prestamo?' (en préstamo)':''}`)}
 <details class="rd"><summary>Representantes <small class="muted">cada jugador tiene el suyo</small></summary><div style="padding:10px 16px">${MK.AGENTES.map(a=>`<div class="kv"><span><b>${a.nombre}</b> · ${a.tipo}</span><span class="muted">${MK.AG_TXT[a.tipo]} Comisión ${Math.round(a.com*100)}%</span></div>`).join('')}</div></details>`};

// ---------- Plantilla con filtros ----------
P.v_plantilla=function(){const g=this.g,f=this.pf=this.pf||{pos:'',q:'',ord:'pos',les:'',ven:''};
 let s=[...squadOf(g,g.userClubId)].filter(p=>(!f.pos||p.pos===f.pos)&&(!f.q||p.nombre.toLowerCase().includes(f.q.toLowerCase()))&&(!f.les||p.lesion>0||p.susp>0)&&(!f.ven||p.contrato<=g.year+1));
 const key={pos:(a,b)=>POSL.indexOf(a.pos)-POSL.indexOf(b.pos)||b.ovr-a.ovr,ovr:(a,b)=>b.ovr-a.ovr,pot:(a,b)=>b.pot-a.pot,edad:(a,b)=>a.edad-b.edad,val:(a,b)=>b.val-a.val,sal:(a,b)=>b.sal-a.sal,mor:(a,b)=>b.mor-a.mor,cond:(a,b)=>a.cond-b.cond}[f.ord];s.sort(key);
 return`<h2>Plantilla</h2><div class="grid"><label>Posición<select data-chg="pf" data-k="pos"><option value="">Todas</option>${opts(POSL,f.pos)}</select></label><label>Nombre<input data-chg="pf" data-k="q" value="${f.q}"></label><label>Ordenar por<select data-chg="pf" data-k="ord">${[['pos','Posición'],['ovr','OVR'],['pot','Potencial'],['edad','Edad (menor)'],['val','Valor'],['sal','Salario'],['mor','Moral'],['cond','Condición (menor)']].map(([v,l])=>`<option value="${v}" ${f.ord===v?'selected':''}>${l}</option>`).join('')}</select></label><label>Mostrar<select data-chg="pf" data-k="les"><option value="">Todos</option><option value="1" ${f.les?'selected':''}>Lesionados/suspendidos</option></select></label><label>Contratos<select data-chg="pf" data-k="ven"><option value="">Todos</option><option value="1" ${f.ven?'selected':''}>Por vencer</option></select></label></div>
 <p class="hint">📑 = derechos vendidos a un fondo · Verde = alto, rojo = bajo · ${s.length} jugadores</p>${pTable(s,p=>`${p.contrato<=g.year+1?`<button data-act="renew" data-id="${p.id}">Renovar</button> `:''}<button data-act="cmp" data-id="${p.id}" title="Comparar">⚖</button>`)}`};

// ---------- Renovación con cláusulas ----------
P.renewDlg=function(id){const g=this.g,p=g.players[id],dl=document.getElementById('dlg');if(!p)return;const f=this.rf=this.rf||{};const o={rescision:f.r||'media',bonos:f.b==='1',opcion:f.o==='1'};
 const ns=renewCalc(p,o),com=Math.round(MK.comision(p)*.5/1000)*1000;
 dl.innerHTML=`<h3>Renovar a ${p.nombre}</h3><p class="muted">Representante: ${MK.agOf(p).nombre} (${MK.agOf(p).tipo}). Salario actual ${fmt(p.sal)}.</p><div class="grid"><label>Cláusula de rescisión<select data-chg="rf" data-k="r" data-id="${id}">${[['baja','Baja (cobra más barato irse)'],['media','Media'],['alta','Alta (más cara, el jugador pide más)']].map(([v,l])=>`<option value="${v}" ${o.rescision===v?'selected':''}>${l}</option>`).join('')}</select></label><label>Bonos por partido y gol<select data-chg="rf" data-k="b" data-id="${id}"><option value="">No</option><option value="1" ${o.bonos?'selected':''}>Sí (baja el salario fijo)</option></select></label><label>Opción de renovación<select data-chg="rf" data-k="o" data-id="${id}"><option value="">No</option><option value="1" ${o.opcion?'selected':''}>Sí, a favor del club (sube el salario)</option></select></label></div>
 <div class="kv"><span>Nuevo salario</span><b>${fmt(ns)}</b></div><div class="kv"><span>Comisión del representante</span><b>${fmt(com)}</b></div>
 <p><button class="pri" data-act="renew2" data-id="${id}">Firmar renovación</button> <button data-act="closedlg">Cancelar</button></p>`;if(!dl.open)dl.showModal()};

// ---------- Carrera ----------
P.v_carrera=function(){const g=this.g,d=g.dt,k=this.kq||'perfil',c=U(g);
 const T_=[['perfil','Perfil'],['staff','Cuerpo técnico'],['ofertas','Ofertas'+(g.ofertasDT.length?` (${g.ofertasDT.length})`:'')],['directiva','Directiva']];let b='';
 if(k==='perfil')b=`<div class="cards"><div><b>Reputación</b>${Math.round(d.rep)}/100${meter(d.rep)}</div><div><b>Licencia</b>${CA.LIC[d.lic]}${d.curso?`<small>Cursando ${CA.LIC[d.curso.lic]} hasta ${d.curso.hasta}</small>`:''}</div><div><b>Ahorros</b>${fmt(d.ahorro)}<small>Sueldo ${fmt(CA.sueldoDT(g))}/año</small></div></div>
  <h3>Cursos</h3>${[2,3,4].map(l=>{const cu=CA.CURSO[l];return`<div class="kv"><span>${CA.LIC[l]} · ${cu.dias} días · ${fmt(cu.costo)} · reputación ${cu.rep}</span>${d.lic>=l?'<b class="good">Obtenida</b>':`<button data-act="curso" data-l="${l}" ${d.curso||l!==d.lic+1?'disabled':''}>Cursar</button>`}</div>`}).join('')}<p class="hint">Las licencias mejoran el entrenamiento, las charlas y la prensa. Se pagan de tus ahorros.</p>
  <h3>Trayectoria</h3>${d.hist.length?`<div class="tw"><table><tr><th>Temp.</th><th>Club</th><th>Pos</th><th>Logros</th></tr>${[...d.hist].reverse().map(h=>`<tr><td>${h.y}</td><td>${h.club}</td><td>${h.pos??'—'}</td><td>${h.nota||''}</td></tr>`).join('')}</table></div>`:'<p class="muted">Todavía no cerraste temporadas.</p>'}
  <p><button class="bad" data-act="renunciar">Renunciar al club</button></p>`;
 else if(k==='staff')b=`<h3>Tu cuerpo técnico</h3><div class="g2">${Object.keys(CA.ESP).map(e=>{const s=g.cuerpo[e];return`<div class="card"><h4>${e} ${s?`<small class="muted">nivel ${s.nivel}</small>`:''}</h4><p class="hint">${CA.ESP[e]}</p>${s?`<p>${s.nombre} · ${fmt(s.sal)}/año</p><button class="bad" data-act="esp_f" data-e="${e}">Despedir</button>`:'<p class="muted">Vacante</p>'}</div>`}).join('')}</div>
  <h3>Candidatos</h3>${g.cand.length?`<div class="tw"><table><tr><th>Nombre</th><th>Especialidad</th><th>Nivel</th><th>Sueldo/año</th><th></th></tr>${g.cand.map(s=>`<tr><td>${s.nombre}</td><td>${s.esp}</td><td>${bar(s.nivel)}</td><td>${fmt(s.sal)}</td><td><button class="pri" data-act="esp_h" data-id="${s.id}" ${g.cuerpo[s.esp]?'disabled':''}>Contratar</button></td></tr>`).join('')}</table></div>`:'<p class="muted">Sin candidatos.</p>'}`;
 else if(k==='ofertas')b=g.ofertasDT.length?g.ofertasDT.map(o=>{const cl=g.clubs[o.club];return`<div class="card"><h4>${badge(cl,26)} ${cl.nombre} <small class="muted">${cl.division} · reputación ${Math.round(cl.reputacion)}</small></h4><p>Sueldo ${fmt(o.sueldo)} · ${o.anios} año(s) · objetivo: top ${o.obj}${o.vence?` · vence ${o.vence}`:''}</p><button class="pri" data-act="dt_ok" data-id="${o.id}">Aceptar y cambiar de club</button> <button data-act="dt_no" data-id="${o.id}">Rechazar</button></div>`}).join(''):'<p class="muted">No tenés ofertas. Con buena reputación y buena relación con tu directiva van a llegar.</p>';
 else b=`<div class="cards"><div><b>Confianza</b>${g.confianza}/100${meter(g.confianza,g.confianza<35?'red':g.confianza<55?'amb':'')}</div><div><b>Objetivo</b>Top ${g.objetivo.max}<small>${g.objMod!=='normal'?'Acordado: '+g.objMod:'Estándar'}</small></div><div><b>Presidente</b>${g.mundo.pres.nom}<small>${g.mundo.pres.perfil}</small></div></div>
  <h3>Negociar el objetivo</h3><p>${g.objNeg?'<span class="muted">Ya negociaste este año.</span>':`<button data-act="obj" data-m="seguro">Pedir un objetivo más fácil (premio menor)</button> <button data-act="obj" data-m="ambicioso">Aceptar uno más exigente (premio mayor, más riesgo)</button>`}</p>
  <h3>Pedir refuerzos de presupuesto</h3><p><button data-act="pidepres" ${g.pedido?'disabled':''}>Pedir dinero a la directiva</button> <span class="hint">Una vez por temporada. La chance depende de la confianza y tu reputación.</span></p><p class="hint">${WO.PERFIL_TXT[g.mundo.pres.perfil]}</p>`;
 return`<h2>Carrera</h2>${tabs(k,T_,'kq')}${b}`};

// ---------- Selección ----------
P.v_seleccion=function(){const g=this.g,s=g.sel,k=this.sq2||'conv';const T_=[['conv','Convocatoria'],['elim','Eliminatorias'],['mund','Mundial'],['seg','Seguro']];let b='';
 if(k==='conv'){const mios=s.conv.map(i=>g.players[i]).filter(p=>p&&p.clubId===g.userClubId);b=`<p>${s.hasta?`Fecha FIFA en curso hasta el <b>${s.hasta}</b>. Los convocados no están disponibles.`:'No hay fecha FIFA ahora. Próximas ventanas: marzo, junio, septiembre y octubre.'}</p><h3>Convocados de tu club</h3>${mios.length?mios.map(p=>`<div class="kv"><span>${chip(p.pos)} ${p.nombre}</span><b>${p.ovr}</b></div>`).join(''):'<p class="muted">Ninguno ahora.</p>'}<h3>Tus internacionales</h3>${squadOf(g,g.userClubId).filter(p=>p.int).sort((a,b)=>b.int-a.int).slice(0,10).map(p=>`<div class="kv"><span>${p.nombre}</span><b>${p.int} fechas</b></div>`).join('')||'<p class="muted">Todavía ninguno.</p>'}<p class="hint">${g.pais.nombre} elige a los mejores jugadores de ${g.pais.nombre} que hay en el juego. Los que van pierden condición y pueden lesionarse, pero ganan valor.</p>`}
 else if(k==='elim'){const e=s.elim,t=NA.tablaElim(g);b=`<p class="hint">Eliminatorias de ${g.pais.conf} (18 fechas, clasifican 6). Fecha ${e.j}/${e.fx.length}${e.done?` · ${g.pais.nombre} terminó ${e.pos}º`:''}</p><div class="tw"><table><tr><th>#</th><th>Selección</th><th>PJ</th><th>G</th><th>E</th><th>P</th><th>DG</th><th>Pts</th></tr>${t.map((r,i)=>`<tr class="${r.id===0?'me':''} ${i<6?'':'out'}"><td>${i+1}</td><td>${e.eq[r.id].n}</td><td>${r.pj}</td><td>${r.g}</td><td>${r.e}</td><td>${r.p}</td><td>${r.gf-r.gc}</td><td><b>${r.pts}</b></td></tr>`).join('')}</table></div>`}
 else if(k==='mund'){const m=s.mundial;b=m?`<h3>Mundial ${g.year}</h3><p>${m.q?g.pais.nombre+' participa.':g.pais.nombre+' no clasificó.'} ${m.campeon?`<b>🏆 Campeón: ${m.campeon}</b>`:`Fase: ${m.fase==='grupos'?'grupos':'eliminación directa'}`}</p><div class="g2">${m.grupos.map((gr,i)=>`<div><div class="muted" style="font-weight:700">Grupo ${'ABCD'[i]}</div><div class="tw"><table><tr><th>Selección</th><th>PJ</th><th>DG</th><th>Pts</th></tr>${Object.values(gr.t).sort((a,b)=>b.pts-a.pts||(b.gf-b.gc)-(a.gf-a.gc)).map(r=>`<tr class="${gr.eq.find(e=>e.n===r.n)?.arg?'me':''}"><td>${r.n}</td><td>${r.pj}</td><td>${r.gf-r.gc}</td><td><b>${r.pts}</b></td></tr>`).join('')}</table></div></div>`).join('')}</div>${m.ko.map(r=>`<h4>${r.nombre}</h4>${r.par.map((p,i)=>`<div class="kv"><span>${p[0].n} vs ${p[1].n}</span><b>${r.res[i]?`${r.res[i][0]}-${r.res[i][1]}${r.res[i][2]!=null?' (pen)':''}`:'—'}</b></div>`).join('')}`).join('')}`:`<p class="muted">El Mundial se juega cada 4 años (el próximo en ${s.y0+3}). ${s.elim.done?'':'Primero hay que clasificar en las Eliminatorias.'}</p>`;
  b+=s.hist.length?`<h3>Palmarés de Mundiales</h3>${s.hist.map(h=>`<div class="kv"><span>${h.y} · campeón ${h.campeon}</span><b>${g.pais.nombre}: ${h.arg}</b></div>`).join('')}`:''}
 else b=`<p>El seguro cubre una parte del sueldo de tus jugadores que se lesionan en la selección.</p><div class="cards"><div><b>Seguro de lesiones</b>${s.seguro?'Activo':'Inactivo'}<small>Costo anual ${fmt(NA.costoSeguro(g))}</small></div></div><p><button class="pri" data-act="seguro">${s.seguro?'Desactivar':'Activar'}</button></p>`;
 return`<h2>Selección argentina</h2>${tabs(k,T_,'sq2')}${b}`};

// ---------- Club y mundo ----------
P.v_mundo=function(){const g=this.g,m=g.mundo,c=U(g),k=this.mq||'socios',L=g.league;
 const T_=[['socios','Socios'],['estadio','Estadio'],['directiva','Presidencia'],['barra','Hinchada'],['eventos','Eventos'+(m.eventos.length?` (${m.eventos.length})`:'')],['clima','Clima'],['federal','Federal']];let b='';
 if(k==='socios'){const b0=WO.cuotaBase(g,c);b=`<div class="cards"><div><b>Socios</b>${Math.round(c.socios).toLocaleString('es-AR')}<small>Objetivo ${WO.sociosObj(g,c).toLocaleString('es-AR')}</small></div><div><b>Cuota</b>$${(b0*c.cuota).toFixed(2)}<small>Referencia $${b0.toFixed(2)}</small></div><div><b>Ingreso anual</b>${fmt(c.socios*b0*c.cuota)}</div></div>
  <div class="card"><h4>Valor de la cuota</h4><input type="range" min="0.6" max="1.6" step="0.05" value="${c.cuota}" data-chg="cuota"><p class="hint">Cuota alta: más ingreso por socio pero se van; baja: más socios y más afición. Los resultados y el humor de la tribuna mueven el objetivo.</p></div>`}
 else if(k==='estadio'){const p=m.proy;b=`<div class="cards"><div><b>Capacidad</b>${c.capacidad.toLocaleString('es-AR')}</div><div><b>Estado de la cancha</b>${WO.canchaTxt(c.cancha)}${meter(c.cancha)}</div>${p?`<div><b>Obra</b>${p.tipo==='nuevo'?'Estadio nuevo':'Ampliación'}<small>Termina ${p.fin} (${dias(g.date,p.fin)} días)</small></div>`:''}</div>
  ${p?'<p class="hint">Hay una obra en marcha. En el estadio nuevo el 75% restante se paga de a poco.</p>':`<div class="g2"><div class="card"><h4>Ampliar la tribuna (+10%)</h4><p>Costo ${fmt(WO.costoAmpliar(g))} · 150 días</p><button class="pri" data-act="est" data-t="ampliar">Iniciar</button></div><div class="card"><h4>Estadio nuevo (+35%, +3 reputación)</h4><p>Costo total ${fmt(WO.costoNuevo(g))} · se paga 25% al arrancar y el resto durante 18 meses. Requiere reputación 45 y confianza 50.</p><button class="pri" data-act="est" data-t="nuevo">Iniciar</button></div></div>`}`}
 else if(k==='directiva'){const p=m.pres;b=`<div class="cards"><div><b>Presidente</b>${p.nom}<small>${p.perfil} · desde ${p.desde}</small></div><div><b>Mandato hasta</b>${p.hasta}<small>Las elecciones son al cierre de esa temporada</small></div><div><b>Apoyo</b>${Math.round(p.apoyo)}%${meter(p.apoyo)}</div></div><p class="hint">${WO.PERFIL_TXT[p.perfil]} Si pierde el oficialismo, puede cambiar tu relación con la directiva.</p>`}
 else if(k==='barra'){const bt=m.barra;const next=[];for(let j=L.j;j<L.fixtures.length&&next.length<4;j++){const x=L.fixtures[j].find(y=>y.h==g.userClubId||y.a==g.userClubId);if(x){const rv=x.h==g.userClubId?x.a:x.h;if(WO.esClasico(g,g.userClubId,rv))next.push(`${this.tn(rv)} (fecha ${j+1})`)}}
  b=`<div class="cards"><div><b>Tensión de la barra</b>${Math.round(bt.tension)}%${meter(bt.tension,bt.tension>70?'red':bt.tension>45?'amb':'')}</div><div><b>Poder</b>${Math.round(bt.poder)}%${meter(bt.poder)}</div></div><h3>Clásicos que vienen</h3>${next.length?next.map(x=>`<div class="kv"><span>🔥 ${x}</span></div>`).join(''):'<p class="muted">No hay clásicos próximos en la liga.</p>'}<p class="hint">Un clásico mueve mucho al hincha: ganar sube la afición, perder enciende a la barra. Con tensión alta hay incidentes y multas.</p>`}
 else if(k==='eventos')b=m.eventos.length?m.eventos.map(e=>`<div class="card"><h4>📩 ${WO.EVT[e.key].t}</h4><p>${e.txt}</p>${WO.EVT[e.key].op.map((o,i)=>`<button data-act="evt" data-id="${e.id}" data-i="${i}">${o[0]}</button>`).join(' ')}</div>`).join(''):'<p class="muted">No hay decisiones pendientes.</p>';
 else if(k==='clima'){const days=[];for(let i=0;i<5;i++){const d=new Date(g.date+'T12:00:00');d.setDate(d.getDate()+i);const ds=d.toISOString().slice(0,10);days.push([ds,WO.climaDe(ds,c)])}
  b=`<div class="cards"><div><b>Cancha</b>${WO.canchaTxt(c.cancha)} (${Math.round(c.cancha)})${meter(c.cancha)}<small>Se castiga con lluvia y partidos; se recupera con el tiempo</small></div></div><h3>Próximos días</h3><div class="cards">${days.map(([d,n])=>`<div><b>${d.slice(8)}/${d.slice(5,7)}</b>${WO.CLIMAS[n].ic} ${n}</div>`).join('')}</div><p class="hint">La lluvia y el viento bajan los goles; el calor cansa más. Una cancha mala también perjudica el juego.</p>`}
 else b=m.log.length?`<h3>Quiebras y fusiones</h3>${m.log.slice().reverse().map(l=>`<div class="kv"><span>${l.y} · ${l.txt}</span></div>`).join('')}`:'<p class="muted">Todavía no hubo clubes que desaparezcan. Cuando uno quiebra o se fusiona, un club del Federal ocupa su lugar.</p>';
 return`<h2>Club y mundo</h2>${tabs(k,T_,'mq')}${b}`};

// ---------- Planificación (reemplaza Entrenamiento) ----------
P.v_entrenamiento=function(){const g=this.g,m=g.mundo,k=this.tq||'sem',sq=squadOf(g,g.userClubId);
 const T_=[['sem','Semana'],['ind','Individual'],['pp','Pelota parada'],['riv','Rival'],['pb','Plan B']];let b='';
 const plan=m.plan||Array(7).fill(g.training);
 if(k==='sem')b=`<div class="cards"><div><b>Familiaridad táctica</b>${Math.round(m.famil)}%${meter(m.famil)}<small>Cambiar de formación la reduce</small></div><div><b>Pelota parada</b>${Math.round(m.ppSkill)}%${meter(m.ppSkill)}</div><div><b>Condición media</b>${Math.round(sq.reduce((s,p)=>s+p.cond,0)/sq.length)}%</div></div>
  <div class="grid">${[1,2,3,4,5,6,0].map(i=>`<label>${WO.DIAS[i]}<select data-chg="plan" data-d="${i}">${opts(WO.FOCOS,plan[i])}</select></label>`).join('')}</div>
  <p><button data-act="plan_fill">Mismo foco toda la semana</button> <button data-act="plan_save">Guardar plan…</button> ${Object.keys(m.planes).map(n=>`<button data-act="plan_load" data-n="${n}">${n}</button>`).join(' ')} <button data-act="plan_off">Volver al foco único</button></p>
  <p class="hint">Táctico sube la familiaridad (da un pequeño bonus al equipo), Pelota parada mejora córners y tiros libres, Físico/Técnico mejoran atributos, Descanso recupera más. ${m.plan?'':'Ahora usás un único foco: '+g.training}</p>`;
 else if(k==='ind'){const cur=sq.filter(p=>p.entr);b=`<p class="hint">Hasta 3 jugadores con un plan propio: mejorar un atributo, aprender una nueva posición (2 meses) o desarrollar un rasgo (3 meses).</p>${cur.map(p=>`<div class="kv"><span>${p.nombre}: ${p.entr.t==='attr'?WO.ATTR[p.entr.k]:p.entr.t==='pos'?'jugar de '+p.entr.pos:'rasgo '+p.entr.r}</span><span>${Math.round(p.entr.prog)} días <button data-act="ind_x" data-id="${p.id}">Cancelar</button></span></div>`).join('')||'<p class="muted">Nadie con plan individual.</p>'}
  <h3>Asignar</h3><div class="grid"><label>Jugador<select id="indp">${sq.map(p=>`<option value="${p.id}">${p.pos} ${p.nombre} (${p.ovr}${p.entr?' · en plan':''})</option>`).join('')}</select></label><label>Objetivo<select id="indv"><optgroup label="Atributo">${Object.entries(WO.ATTR).map(([a,n])=>`<option value="a:${a}">${n}</option>`).join('')}</optgroup><optgroup label="Nueva posición">${POSL.map(x=>`<option value="p:${x}">${x}</option>`).join('')}</optgroup><optgroup label="Rasgo">${Object.keys(WO.TRAITS).map(x=>`<option value="r:${x}">${x}</option>`).join('')}</optgroup></select></label></div><p><button class="pri" data-act="ind_a">Asignar</button></p>`}
 else if(k==='pp'){const xi=g.lineup.xi.map(i=>g.players[i]).filter(p=>p.pos!=='POR'),e=WO.encargados(g);
  b=`<div class="cards"><div><b>Nivel de pelota parada</b>×${WO.ppNivel(g).toFixed(2)}<small>Entrenamiento y especialista</small></div></div><div class="grid">${[['corner','Córners'],['libre','Tiros libres'],['penal','Penales']].map(([kk,l])=>`<label>${l}<select data-chg="enc" data-k="${kk}"><option value="">Automático (el mejor)</option>${xi.map(p=>`<option value="${p.id}" ${e[kk]==p.id?'selected':''}>${p.nombre} (PAS ${p.pas} · TIR ${p.tir})</option>`).join('')}</select></label>`).join('')}</div><p class="hint">Si el encargado no está en el once, se elige automáticamente al mejor. Los córners salen mejor con buen pase; tiros libres y penales con buen tiro.</p>`}
 else if(k==='riv'){const a=WO.analisis(g);b=a?`<h3>${a.club} <small class="muted">${a.rival.local?'local':'visitante'} · ${a.rival.fecha}</small></h3><div class="cards"><div><b>Formación</b>${a.formacion}</div><div><b>Mentalidad</b>${a.mentalidad}</div><div><b>Forma</b>${a.forma||'—'}</div><div><b>Fiabilidad</b>${a.fiable?'Alta':'Baja (subí el nivel del ayudante táctico)'}</div></div><h4>Jugadores clave</h4>${a.clave.map(p=>`<div class="kv"><span>${chip(p.pos)} ${p.nombre}</span><b>~${p.ovr}</b></div>`).join('')}<h4>Recomendaciones</h4>${a.tips.map(t=>`<p>• ${t}</p>`).join('')}<p>${a.hecho?'<span class="good">✔ Informe ya aplicado: bonus táctico para ese partido.</span>':'<button class="pri" data-act="ana">Encargar informe completo (da un pequeño bonus)</button>'}</p>`:'<p class="muted">No hay próximo partido.</p>'}
 else{const pb=m.planB||(m.planB={on:false,cuando:'perdiendo',min:60,tactic:{mentalidad:'Ofensiva',presion:'Alta'}});
  b=`<p class="hint">El Plan B cambia tu táctica solo cuando se cumple la condición durante el partido (en vivo o simulado).</p><div class="grid"><label>Activo<select data-chg="pb" data-k="on">${[['','No'],['1','Sí']].map(([v,l])=>`<option value="${v}" ${(!!pb.on)==(v==='1')?'selected':''}>${l}</option>`).join('')}</select></label><label>Cuando<select data-chg="pb" data-k="cuando">${[['perdiendo','Estoy perdiendo'],['empatando','Estoy empatando'],['ganando','Estoy ganando'],['min','Al minuto indicado']].map(([v,l])=>`<option value="${v}" ${pb.cuando===v?'selected':''}>${l}</option>`).join('')}</select></label><label>Desde el minuto<input type="number" min="0" max="85" data-chg="pb" data-k="min" value="${pb.min}"></label>${Object.keys(OPTIONS).map(o=>`<label>${LBL[o]}<select data-chg="pbt" data-k="${o}"><option value="">(sin cambio)</option>${opts(OPTIONS[o],pb.tactic[o])}</select></label>`).join('')}</div>`}
 return`<h2>Entrenamiento y planificación</h2>${tabs(k,T_,'tq')}${b}`};

// ---------- Comparador ----------
P.v_comparar=function(){const g=this.g,c=this.cmp=this.cmp||[null,null],A=[['vel','VEL'],['ace','ACE'],['pas','PAS'],['tec','TEC'],['tir','TIR'],['def','DEF'],['fis','FIS'],['res','RES'],['men','MEN']];
 const ps=c.map(i=>g.players[i]).map(p=>p?{p,ex:H.S.vista(g,p).exacto}:null);
 const pick=i=>`<label>Jugador ${i+1}<select data-chg="cmp" data-i="${i}"><option value="">—</option>${[...squadOf(g,g.userClubId),...g.seguir.map(x=>g.players[x]).filter(p=>p&&p.clubId!==g.userClubId)].map(p=>`<option value="${p.id}" ${c[i]==p.id?'selected':''}>${p.pos} ${p.nombre}</option>`).join('')}</select></label>`;
 return`<h2>Comparador</h2><div class="grid">${pick(0)}${pick(1)}</div><p class="hint">También podés agregar jugadores con el botón ⚖ en el mercado y en la plantilla.</p>
 ${ps[0]&&ps[1]?`<div class="g2">${ps.map(o=>`<div class="card"><h4>${o.p.nombre} <small class="muted">${o.p.edad} años · ${o.p.pos}</small></h4>${o.ex?CH.radar({labels:A.map(a=>a[1]),values:A.map(a=>o.p[a[0]])}):'<p class="muted">Sin información exacta (niebla).</p>'}</div>`).join('')}</div>
 <div class="tw"><table><tr><th>${ps[0].p.nombre}</th><th></th><th>${ps[1].p.nombre}</th></tr>${[['OVR','ovr'],['Potencial','pot'],['Edad','edad'],...A.map(a=>[a[1],a[0]]),['Salario','sal'],['Valor','val'],['Contrato','contrato']].map(([l,k])=>{const x=ps[0].p[k],y=ps[1].p[k],fx=v=>['sal','val'].includes(k)?fmt(v):v,good=k==='edad'?x<y:x>y,eq=x===y;return`<tr><td class="${!eq&&good?'good':''}">${ps[0].ex?fx(x):'?'}</td><th>${l}</th><td class="${!eq&&!good?'good':''}">${ps[1].ex?fx(y):'?'}</td></tr>`}).join('')}</table></div>`:''}`};

// ---------- Calendario con filtros ----------
P.v_calendario=function(){const g=this.g,id=g.userClubId,L=g.league,f=this.cf||'todos';
 const rows=L.fixtures.map((fx,i)=>{const m=fx.find(x=>x.h==id||x.a==id),r=L.results.find(x=>x.j==i+1&&(x.h==id||x.a==id));return{i,m,r}});
 const keep=({m,r})=>f==='todos'||(!m?false:f==='local'?m.h==id:f==='visita'?m.a==id:f==='jugados'?!!r:!r);
 const cl=rows.filter(x=>x.m&&WO.esClasico(g,id,x.m.h==id?x.m.a:x.m.h)).length;
 return`<h2>Calendario</h2>${tabs(f,[['todos','Todos'],['local','Local'],['visita','Visitante'],['jugados','Jugados'],['pend','Pendientes']],'cf')}${cl?`<p class="hint">🔥 ${cl} clásico(s) en la liga</p>`:''}<table><tr><th>J</th><th>Fecha</th><th>Partido</th><th>Resultado</th></tr>${rows.filter(keep).map(({i,m,r})=>{if(!m)return`<tr><td>${i+1}</td><td>${L.date(i)}</td><td colspan="2">Libre</td></tr>`;const loc=m.h==id,rv=loc?m.a:m.h,cls=WO.esClasico(g,id,rv);return`<tr><td>${i+1}</td><td>${L.date(i)}</td><td>${loc?'vs':'@'} ${this.tn(rv)}${cls?' 🔥':''}</td><td>${r?`<b class="${(loc?r.hg-r.ag:r.ag-r.hg)>0?'good':(loc?r.hg-r.ag:r.ag-r.hg)<0?'badc':''}">${r.hg}-${r.ag}</b> <button data-act="rep" data-i="${L.results.indexOf(r)}">Ver</button>`:'—'}</td></tr>`}).join('')}</table>${this.calComps()}`};

// ---------- wrappers ----------
const oc=P.card;P.card=function(id){oc.call(this,id);const g=this.g,p=g.players[id],dl=document.getElementById('dlg');if(!p||!dl.open)return;const f=dl.querySelector('form');if(!f)return;
 const mine=p.clubId===g.userClubId,ag=MK.agOf(p);
 f.insertAdjacentHTML('beforebegin',`<h4 style="margin-top:12px">Contrato y carácter</h4><div class="kv"><span>Personalidad</span><b title="${PE.PERS_TXT[PE.persOf(p)]}">${PE.persOf(p)}</b></div>${p.pos2?`<div class="kv"><span>Posición alternativa</span><b>${p.pos2}</b></div>`:''}<div class="kv"><span>Representante</span><b>${ag.nombre} (${ag.tipo})</b></div><div class="kv"><span>Cláusula de rescisión</span><b>${fmt(p.clausula||p.val*3)}</b></div>${p.bono?`<div class="kv"><span>Bonos</span><b>${fmt(p.bono.pj)}/partido · ${fmt(p.bono.gol)}/gol</b></div>`:''}${p.reventa?`<div class="kv"><span>Reventa a favor de otro club</span><b>${Math.round((p.reventa.pct||0)*100)}%</b></div>`:''}${p.opcion?'<div class="kv"><span>Opción de renovación</span><b>Sí</b></div>':''}${p.int?`<div class="kv"><span>Selección</span><b>${p.int} convocatorias</b></div>`:''}${p.entr?`<div class="kv"><span>Plan individual</span><b>${p.entr.t==='attr'?WO.ATTR[p.entr.k]:p.entr.t==='pos'?p.entr.pos:p.entr.r}</b></div>`:''}`);
 f.querySelector('p').insertAdjacentHTML('afterbegin',`<button type="button" data-act="cmp" data-id="${p.id}">⚖ Comparar</button> `)};
const orr=P.reportR;P.reportR=function(r){orr.call(this,r);const g=this.g,dl=document.getElementById('dlg'),f=dl.querySelector('form');if(!f)return;
 const nm=id=>(g.players[id]||{}).nombre||'?';
 f.insertAdjacentHTML('beforebegin',`${r.clima?`<p class="muted">${r.clima}${r.asist?` · Asistencia ${r.asist.toLocaleString('es-AR')}`:''}</p>`:''}${r.cards&&r.cards.length?`<h4>Tarjetas</h4>${r.cards.map(([id,t])=>`<div>${t==='r'?'🟥':'🟨'} ${nm(id)}</div>`).join('')}`:''}`)};
const ot=P.tieRow;P.tieRow=function(t){let h=ot.call(this,t);if(t.et)h=h.replace(/<\/div>$/,`<small class="muted">prórroga ${t.et[0]}-${t.et[1]}</small></div>`);return h};
const ol=P.live;P.live=function(){if(!this.lm)this.cd={};ol.call(this)};
const orl=P.renderLive;P.renderLive=function(){orl.call(this);const lm=this.lm;if(!lm||this.run)return;const half=lm.min===0?1:lm.min===45?2:0;if(!half)return;
 const done=(this.cd||{})[half],box=document.getElementById('lvc');if(!box)return;
 box.insertAdjacentHTML('beforeend',`<p>${half===1?'Charla previa':'Charla de entretiempo'}: ${done?'<span class="muted">ya la diste</span>':Object.keys(PE.TONOS).map(t=>`<button data-act="lcharla" data-t="${t}" title="${PE.TONO_TXT[t]}">${t}</button>`).join(' ')}</p>${half===1&&this.g.mundo.planB?.on?'<p class="hint">Plan B armado.</p>':''}`)};

// ---------- cambios (selects/inputs) ----------
P.chg9=function(a,d,v){const g=this.g,m=g.mundo;switch(a){
 case'plan':{const p=m.plan||(m.plan=Array(7).fill(g.training));p[+d.d]=v;break}
 case'pf':this.pf[d.k]=v;break;
 case'cuota':WO.setCuota(g,+v);return true;
 case'enc':WO.setEncargado(g,d.k,+v||null);break;
 case'pb':{const pb=m.planB;pb[d.k]=d.k==='on'?v==='1':d.k==='min'?+v:v;break}
 case'pbt':{const pb=m.planB;if(v)pb.tactic[d.k]=v;else delete pb.tactic[d.k];break}
 case'cmp':this.cmp[+d.i]=+v||null;break;
 case'rf':{this.rf=this.rf||{};this.rf[d.k]=v;this.renewDlg(+d.id);return true}
 default:return false}
 this.render();return true};

// ---------- acciones ----------
P.act9=function(a,d){const g=this.g,done=(m,keep)=>{if(m)this.toast(m);if(!keep)this.render()};switch(a){
 case'nextimp':this.jugarImportante();return true;
 case'nf':this.nf=d.k;break;case'cq':this.cq=d.k;break;case'kq':this.kq=d.k;break;case'sq2':this.sq2=d.k;break;case'mq':this.mq=d.k;break;case'tq':this.tq=d.k;break;case'cf':this.cf=d.k;break;
 case'charla':done(PE.charla(g,d.t,false));return true;
 case'lcharla':{const lm=this.lm,half=lm.min===0?1:2;this.cd[half]=1;this.toast(PE.charla(g,d.t,true,lm.live(this.us)));lm.recalc();this.renderLive();return true}
 case'prensa':done(PE.prensaResp(g,+d.i));return true;
 case'queja':done(PE.quejaResp(g,+d.id,d.op));return true;
 case'cap':done(PE.setCapitan(g,+d.id));return true;
 case'y_up':{const[,m]=YO.subir(g,+d.id);done(m);return true}
 case'y_mv':done(YO.mover(g,+d.id));return true;
 case'y_free':if(confirm('¿Liberar a este juvenil?'))done(YO.liberar(g,+d.id));return true;
 case'ment_a':{const v=document.getElementById('mn'+d.id).value;done(v?YO.asignar(g,+v,+d.id):'Elegí un mentor');return true}
 case'ment_q':YO.quitar(g,+d.id);break;
 case'y_red':done(YO.mejorarRed(g));return true;
 case'y_conv':done(YO.convenio(g,+d.id));return true;
 case'swap':{const f=this.f,[ok,m]=T.buySwap(g,+d.id,+document.getElementById('o'+d.id).value,+f.swap);done(m);return true}
 case'ejercer':done(T.ejercer(g,+d.id)[1]);return true;
 case'renew':this.renewDlg(+d.id);return true;
 case'renew2':{const f=this.rf||{};const msg=renew(g,g.players[d.id],{rescision:f.r||'media',bonos:f.b==='1',opcion:f.o==='1'});this.rf={};document.getElementById('dlg').close();done(msg);return true}
 case'closedlg':document.getElementById('dlg').close();return true;
 case'curso':done(CA.cursar(g,+d.l));return true;
 case'esp_h':done(CA.contratar(g,+d.id));return true;
 case'esp_f':if(confirm('¿Despedir al especialista?'))done(CA.despedirEsp(g,d.e));return true;
 case'dt_ok':{const m=CA.aceptar(g,+d.id);this.view='inicio';done(m);return true}
 case'dt_no':g.ofertasDT=g.ofertasDT.filter(o=>o.id!==+d.id);break;
 case'renunciar':if(confirm('¿Seguro que querés renunciar? Perdés 2 puntos de reputación y quedás sin club hasta aceptar una oferta.')){CA.renunciar(g);this.view='inicio';this.render()}return true;
 case'obj':done(CA.negociarObjetivo(g,d.m));return true;
 case'pidepres':done(CA.pedirPresupuesto(g));return true;
 case'seguro':done(NA.toggleSeguro(g));return true;
 case'est':done(WO.proyectar(g,d.t));return true;
 case'evt':done(WO.resolverEvento(g,+d.id,+d.i));return true;
 case'plan_fill':{const v=prompt('Foco para toda la semana',g.training);if(v&&WO.FOCOS.includes(v))g.mundo.plan=Array(7).fill(v);break}
 case'plan_save':{const n=prompt('Nombre del plan');done(n?WO.guardarPlan(g,n.trim()):'');return true}
 case'plan_load':WO.cargarPlan(g,d.n);break;
 case'plan_off':g.mundo.plan=null;break;
 case'ind_a':{const[t,x]=document.getElementById('indv').value.split(':');done(WO.entrenarInd(g,+document.getElementById('indp').value,t==='a'?{t:'attr',k:x}:t==='p'?{t:'pos',pos:x}:{t:'rasgo',r:x}));return true}
 case'ind_x':done(WO.entrenarInd(g,+d.id,null));return true;
 case'ana':done(WO.analizar(g));return true;
 case'cmp':{this.cmp=this.cmp||[null,null];const c=this.cmp;if(c[0]==null||c[0]==+d.id)c[0]=+d.id;else c[1]=+d.id;document.getElementById('dlg').open&&document.getElementById('dlg').close();this.view='comparar';this.toast('Agregado al comparador');break}
 default:return false}
 this.render();return true};

// ---------- atajos de teclado ----------
if(typeof document!=='undefined'&&!window.__fm9){window.__fm9=1;document.addEventListener('keydown',e=>{const ui=window.__ui;if(!ui||!ui.game||e.ctrlKey||e.metaKey||e.altKey)return;if(/INPUT|SELECT|TEXTAREA/.test(document.activeElement?.tagName))return;const dl=document.getElementById('dlg');if(dl&&dl.open)return;
 const k=e.key.toLowerCase(),map={i:'inicio',p:'plantilla',t:'tacticas',m:'mercado',c:'calendario',v:'vestuario',f:'finanzas',n:'noticias',e:'entrenamiento',l:'liga'};
 if(ui.lm){if(k===' '){e.preventDefault();ui.act('lp',{})}return}
 if(k===' '){e.preventDefault();if(!ui.game.pend&&!ui.game.despedido&&!ui.game.allDone)ui.act('next',{})}else if(k==='.'){ui.act('nextimp',{})}else if(map[k]&&!ui.game.despedido){ui.view=map[k];ui.render()}})}
}
