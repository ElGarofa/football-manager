// v1.5: presentación de fichajes, ceremonia de premios, figurita descargable, gráfico de valor y números animados
import {badge,kit,face,radar,colors} from './visual.js';
import {fmt} from './players.js';
import * as CH from './charts.js';
import {sonido} from './extras.js';
const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;');
const U=g=>g.clubs[g.userClubId];
const K=[['vel','VEL'],['ace','ACE'],['pas','PAS'],['tec','TEC'],['tir','TIR'],['def','DEF'],['fis','FIS'],['res','RES']];
function dlg(){let d=document.getElementById('gfxdlg');if(!d){d=document.createElement('dialog');d.id='gfxdlg';d.className='gfxdlg';d.addEventListener('click',e=>{if(e.target===d||e.target.closest('[data-gfx=close]'))d.close()});document.body.appendChild(d)}return d}
const svgImg=svg=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.onerror=()=>r(null);i.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg.replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" '))});
export async function figurita(g,p){const c=g.clubs[p.clubId]||U(g),[a,b]=colors(c),W=400,H=560,cv=document.createElement('canvas');cv.width=W;cv.height=H;const x=cv.getContext('2d');
 const gr=x.createLinearGradient(0,0,W,H);gr.addColorStop(0,a);gr.addColorStop(1,'#0b1020');x.fillStyle=gr;x.fillRect(0,0,W,H);x.strokeStyle=b;x.lineWidth=8;x.strokeRect(10,10,W-20,H-20);
 x.fillStyle='rgba(255,255,255,.08)';for(let i=0;i<8;i++)x.fillRect(i*60,0,24,H);
 const fi=await svgImg(face(p,240,c)),bi=await svgImg(badge(c,80));if(fi)x.drawImage(fi,80,60,240,264);if(bi)x.drawImage(bi,28,28,60,69);
 const ex=p.clubId===g.userClubId||!g.fog;x.fillStyle='#fff';x.textAlign='center';x.font='bold 30px system-ui';x.fillText(p.nombre.length>20?p.nombre.split(' ').pop():p.nombre,W/2,358);x.font='16px system-ui';x.fillStyle='rgba(255,255,255,.8)';x.fillText(`${p.pos} · ${p.edad} años · ${c.nombre}`,W/2,384);
 x.textAlign='right';x.fillStyle=b;x.font='bold 56px system-ui';x.fillText(ex?p.ovr:'?',W-30,80);x.font='bold 14px system-ui';x.fillText('OVR',W-30,100);
 K.forEach(([k,l],i)=>{const cx=i<4?40:215,cy=420+(i%4)*28,v=ex?p[k]:0;x.textAlign='left';x.fillStyle='#fff';x.font='bold 13px system-ui';x.fillText(l,cx,cy);x.fillStyle='rgba(255,255,255,.2)';x.fillRect(cx+38,cy-11,110,10);x.fillStyle=v>=75?'#34d399':v>=55?'#fbbf24':'#f87171';x.fillRect(cx+38,cy-11,110*Math.min(1,v/100),10);x.fillStyle='#fff';x.fillText(ex?v:'?',cx+154,cy)});
 x.textAlign='center';x.fillStyle='rgba(255,255,255,.55)';x.font='11px system-ui';x.fillText('Manager Argentina · '+g.date.slice(0,4),W/2,H-22);
 cv.toBlob(bl=>{if(!bl)return;const u=URL.createObjectURL(bl),a2=document.createElement('a');a2.href=u;a2.download='figurita-'+p.nombre.replace(/\W+/g,'-')+'.png';document.body.appendChild(a2);a2.click();a2.remove();setTimeout(()=>URL.revokeObjectURL(u),2000)})}
function presentar(g,p){const c=U(g),d=dlg(),ex=!g.fog||p.clubId===g.userClubId;
 d.innerHTML=`<div class="gx-pres" style="--k:${colors(c)[0]}"><div class="gx-spot"></div><small>¡NUEVO REFUERZO!</small><div class="gx-hero">${face(p,110,c)}<div class="gx-kit">${kit(c,96)}<b>${p.num||p.id%30+1}</b></div></div><h2>${esc(p.nombre)}</h2><p class="muted">${p.pos} · ${p.edad} años · OVR ${ex?p.ovr:'?'} / POT ${ex?p.pot:'?'}</p><div class="gx-r">${radar(p,150)}</div><p>Bienvenido a <b>${esc(c.nombre)}</b> ${badge(c,22)}<br><small class="muted">Valor ${fmt(p.val)} · salario ${fmt(p.sal)}</small></p><p><button class="pri" data-gfx="fig" data-id="${p.id}">📸 Descargar figurita</button> <button data-gfx="close">Cerrar</button></p></div>`;
 d.showModal();sonido('logro')}
function ceremonia(g){const W=g.premios.at(-1);if(!W)return;const d=dlg(),row=(ic,t,o,i)=>o?`<div class="gx-row ${o.mio?'mio':''}" style="--i:${i}"><span>${ic}</span><b>${t}</b><em>${esc(o.n||o.nombre)}${o.club?` <small>${esc(o.club)}</small>`:''}</em>${o.mio?'<i>¡VOS!</i>':''}</div>`:'';
 const pod=(W.podio||[]).slice(0,3).map((o,i)=>row(['🥇','🥈','🥉'][i],i?'':'Balón de Oro',o,i)).join('');
 d.innerHTML=`<div class="gx-cer"><small>GALA DE PREMIOS ${W.y}</small><h2>🏆 Ceremonia</h2>${pod}${row('🧤','Yashin',W.yashin,3)}${row('⭐','Kopa',W.kopa,4)}${row('👟','Bota de Oro',W.bota,5)}${row('🚀','Puskás',W.puskas,6)}${row('👔','Entrenador del año',W.dt,7)}${W.liga?row('🏅','MVP '+esc(W.liga.nombre),W.liga.mvp,8)+row('⚽','Goleador',W.liga.goleador,9):''}<p><button data-gfx="close" class="pri">Cerrar</button></p></div>`;
 d.showModal();sonido('logro')}
function countUp(root){if(document.documentElement.dataset.anim==='0')return;root.querySelectorAll('.cards > div > b').forEach(b=>{const m=b.textContent.trim().match(/^(\D*?)(\d+(?:\.\d+)?)(\D*)$/);if(!m)return;const to=parseFloat(m[2]),dec=(m[2].split('.')[1]||'').length;if(!(to>0))return;const t0=performance.now();const f=t=>{const k=Math.min(1,(t-t0)/600),e=1-Math.pow(1-k,3);b.textContent=m[1]+(to*e).toFixed(dec)+m[3];if(k<1&&b.isConnected)requestAnimationFrame(f);else b.textContent=m[1]+m[2]+m[3]};requestAnimationFrame(f)})}
export function install(UI){const P=UI.prototype;
 const oc=P.card;P.card=function(id){oc.call(this,id);const g=this.g,p=g.players[id],d=document.getElementById('dlg');if(!p||!d||!d.open)return;
  const ex=!g.fog||p.clubId===g.userClubId,h=(p.vh||[]).filter(x=>x[1]!=null);
  const box=document.createElement('div');box.className='gx-val';box.innerHTML=`<h4>Valor de mercado</h4>${ex&&h.length>=2?CH.line({series:[{data:h.map(x=>x[1]),area:true}],labels:h.map(x=>x[0]),w:420,h:150,fmt:v=>fmt(v)}):`<p class="muted">${ex?'Todavía sin historial: se arma al cierre de cada temporada. Hoy vale '+fmt(p.val)+'.':'Información oculta por la niebla.'}</p>`}<p><button type="button" data-gfx="fig" data-id="${p.id}">📸 Descargar figurita</button></p>`;
  const f=d.querySelector('form');(f||d).appendChild(box)};
 const oa=P.act;P.act=function(a,d){const g=this.g,u=g&&g.clubs&&U(g),b0=u?new Set(u.plantilla):null,np=g&&g.premios?g.premios.length:0;const r=oa.call(this,a,d);
  try{if(b0&&this.g===g){const nu=U(g).plantilla.filter(i=>!b0.has(i));if(nu.length&&nu.length<=2&&a!=='endseason'&&!/load|new|imp/.test(a)){const p=g.players[nu[0]];if(p)presentar(g,p)}
   if(a==='endseason'&&g.premios.length>np)ceremonia(g)}}catch(e){console.warn(e)}return r};
 const orr=P.render;P.render=function(){orr.call(this);if(this._av!==this.view){this._av=this.view;countUp(this.el)}};
 document.addEventListener('click',e=>{const b=e.target.closest('[data-gfx=fig]');if(!b)return;const ui=window.__ui,g=ui&&(ui.g||ui.game),p=g&&g.players[+b.dataset.id];if(p)figurita(g,p)});
}
