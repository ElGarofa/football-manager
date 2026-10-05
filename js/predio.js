// v1.2: predio del club — vista general con edificios que crecen y obras en curso
import {fmt} from './players.js';
import {zl} from './finance.js';
import * as F from './facilities.js';
import {CFG} from './config.js';
import {dibujarIso} from './predio_iso.js';
const U=g=>g.clubs[g.userClubId];
const dias=(a,b)=>Math.max(0,Math.round((new Date(b)-new Date(a))/864e5));
// parcelas (x,y,w,h) dentro de un lienzo de 920x560
const PLOT={estadio:[24,24,400,250],palcos:[444,24,140,120],oficinas:[600,24,140,120],scouting:[756,24,140,120],
 medica:[444,160,140,114],concentracion:[600,160,140,114],tienda:[756,160,140,114],entrenamiento:[24,298,430,238],cantera:[470,298,426,238]};
const wall=(i)=>['#d9dfef','#cfd8ee','#e4d9c8','#d8e4d4'][i%4];
function windows(x,y,w,h,rows,cols,lit){let s='';const gw=w/(cols+1),gh=h/(rows+1);for(let r=1;r<=rows;r++)for(let c=1;c<=cols;c++)s+=`<rect x="${x+c*gw-3}" y="${y+r*gh-3}" width="6" height="6" rx="1" fill="${lit?'#fde68a':'#5b6788'}" opacity="${lit?.95:.7}"/>`;return s}
function box(x,y,w,h,lv,roof,wl){const fl=1+Math.floor(lv/4),H=18+fl*17,top=y+h-H;
 return`<rect x="${x+6}" y="${y+h-2}" width="${w}" height="6" rx="3" fill="#000" opacity=".25"/><rect x="${x}" y="${top}" width="${w}" height="${H}" fill="${wl}" stroke="#0006"/><polygon points="${x-4},${top} ${x+w+4},${top} ${x+w-8},${top-12} ${x+8},${top-12}" fill="${roof}" stroke="#0006"/>${windows(x,top,w,H,fl,Math.max(2,Math.round(w/22)),true)}<rect x="${x+w/2-6}" y="${y+h-13}" width="12" height="13" fill="#3b2f2f"/>`}
function deco(id,x,y,w,h,lv){switch(id){
 case'medica':return`<g transform="translate(${x+w/2},${y+h-52-Math.floor(lv/4)*17})"><circle r="10" fill="#fff"/><path d="M-2 -6h4v4h4v4h-4v4h-4v-4h-4v-4h4z" fill="#dc2626"/></g>`;
 case'tienda':return`<path d="M${x-2} ${y+h-30} h${w+4} l-6 -10 h-${w-8} z" fill="repeating-linear-gradient(90deg,#e11d48,#fff)" /><rect x="${x-2}" y="${y+h-34}" width="${w+4}" height="8" fill="#e11d48"/>`;
 case'palcos':return`<rect x="${x+8}" y="${y+h-40}" width="${w-16}" height="14" fill="#7dd3fc" opacity=".6"/>`;
 case'scouting':return`<circle cx="${x+w/2}" cy="${y+h-48-Math.floor(lv/4)*17}" r="14" fill="#e2e8f0" stroke="#0006"/><line x1="${x+w/2}" y1="${y+h-48-Math.floor(lv/4)*17}" x2="${x+w/2+16}" y2="${y+h-66-Math.floor(lv/4)*17}" stroke="#334155" stroke-width="4"/>`;
 case'concentracion':return`<g fill="#94a3b8"><rect x="${x+w-18}" y="${y+h-70}" width="8" height="40"/></g>`;
 case'oficinas':return`<rect x="${x+w/2-9}" y="${y+h-70-Math.floor(lv/4)*17}" width="18" height="10" fill="#1d4ed8"/>`;
 default:return''}}
function pitch(x,y,w,h,col){return`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${col||'#2f7d46'}"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="none" stroke="#fff" stroke-opacity=".7"/><line x1="${x+w/2}" y1="${y}" x2="${x+w/2}" y2="${y+h}" stroke="#fff" stroke-opacity=".7"/><circle cx="${x+w/2}" cy="${y+h/2}" r="${Math.min(w,h)/7}" fill="none" stroke="#fff" stroke-opacity=".7"/>`}
function stadium(x,y,w,h,lv,cap){const rings=Math.min(5,1+Math.floor(lv/2)),cx=x+w/2,cy=y+h/2;let s='';
 for(let t=0;t<rings;t++){const m=t*14;s+=`<rect x="${x+m}" y="${y+m*.62}" width="${w-2*m}" height="${h-m*1.24}" rx="${70-t*9}" fill="hsl(var(--h) ${48+t*8}% ${26+t*8}%)" stroke="#0007"/>`}
 const m=rings*14;s+=pitch(x+m+8,y+m*.62+8,w-2*m-16,h-m*1.24-16);
 if(lv>=6)s+=`<g stroke="#cbd5e1" stroke-width="3"><line x1="${x+10}" y1="${y+4}" x2="${x+10}" y2="${y-26}"/><line x1="${x+w-10}" y1="${y+4}" x2="${x+w-10}" y2="${y-26}"/></g><rect x="${x+4}" y="${y-32}" width="14" height="8" fill="#fde68a"/><rect x="${x+w-18}" y="${y-32}" width="14" height="8" fill="#fde68a"/>`;
 return s}
function obra(x,y,w,h,ob,g){const p=ob.hasta,tot=F.obraDias(ob.a-1),left=dias(g.date,p),pct=Math.max(0,Math.min(1,1-left/tot));
 return`<g class="pd-obra"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#pdhatch)" opacity=".55"/><g stroke="#f59e0b" stroke-width="2" fill="none"><path d="M${x+10} ${y+h} V${y+30} M${x+w-10} ${y+h} V${y+30} M${x+10} ${y+60} H${x+w-10} M${x+10} ${y+90} H${x+w-10}"/></g>
 <g stroke="#fbbf24" stroke-width="3" fill="none" class="pd-crane"><path d="M${x+w-24} ${y+h} V${y+4} H${x+30} M${x+w-24} ${y+4} l-16 -14 M${x+44} ${y+4} V${y+30}"/></g><rect x="${x+38}" y="${y+30}" width="12" height="8" fill="#ef4444" class="pd-load"/>
 <rect x="${x+8}" y="${y+h-14}" width="${w-16}" height="8" rx="4" fill="#0008"/><rect x="${x+8}" y="${y+h-14}" width="${(w-16)*pct}" height="8" rx="4" fill="#fbbf24"/><text x="${x+w/2}" y="${y+h-20}" text-anchor="middle" font-size="11" font-weight="700" fill="#fff" stroke="#000" stroke-width=".5">Nv ${ob.a} · ${left} d</text></g>`}
export function dibujar(g,sel){const c=U(g),Z=F.zonas();let s=`<defs><pattern id="pdhatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="5" height="10" fill="#fbbf24"/><rect x="5" width="5" height="10" fill="#1f2937"/></pattern></defs>
 <rect width="920" height="560" rx="18" fill="#28572f"/><g opacity=".18" fill="#fff">${Array.from({length:14},(_,i)=>`<rect x="${i*66}" y="0" width="33" height="560"/>`).join('')}</g>
 <rect x="0" y="278" width="920" height="16" fill="#3a3f4b"/><rect x="430" y="0" width="12" height="560" fill="#3a3f4b"/><line x1="0" y1="286" x2="920" y2="286" stroke="#e5e7eb" stroke-dasharray="14 10" opacity=".6"/>
 <text x="460" y="552" text-anchor="middle" fill="#fff" opacity=".7" font-size="12" font-weight="700">${c.nombre} · predio deportivo</text>`;
 Z.forEach((z,i)=>{const [x,y,w,h]=PLOT[z.id]||[0,0,0,0],lv=zl(c,z.id),ob=c.obras.find(o=>o.zona===z.id),on=sel===z.id;
  let b='';
  if(z.id==='estadio')b=stadium(x,y,w,h,lv);
  else if(z.id==='entrenamiento'){const n=Math.min(4,1+Math.floor(lv/3));for(let k=0;k<n;k++)b+=pitch(x+10+(k%2)*((w-110)/2),y+10+Math.floor(k/2)*108,(w-110)/2-8,98,k?'#3b8c52':'#2f7d46');b+=box(x+w-96,y+h-70,86,70,lv,'#475569',wall(i))}
  else if(z.id==='cantera'){const n=Math.min(3,1+Math.floor(lv/4));for(let k=0;k<n;k++)b+=pitch(x+10+(k%2)*((w-110)/2),y+10+Math.floor(k/2)*108,(w-110)/2-8,98,'#3b8c52');b+=box(x+w-96,y+h-70,86,70,lv,'#15803d',wall(i+1));b+=`<g fill="#16a34a"><circle cx="${x+w-30}" cy="${y+30}" r="${6+lv}"/></g>`}
  else{ if(lv>0)b=box(x+(w-84)/2,y+h-84,84,84,lv,['#b91c1c','#1e40af','#6d28d9','#0f766e','#a16207'][i%5],wall(i))+deco(z.id,x+(w-84)/2,y+h-84,84,84,lv);else b=`<rect x="${x+14}" y="${y+14}" width="${w-28}" height="${h-28}" fill="none" stroke="#fff" stroke-dasharray="6 6" opacity=".5"/>` }
  s+=`<g class="pd-b${on?' on':''}${ob?' obra':''}" data-act="pd_sel" data-k="${z.id}" tabindex="0" role="button" aria-label="${z.nombre}, nivel ${lv}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="rgba(255,255,255,.04)" stroke="${on?'#fbbf24':'rgba(255,255,255,.18)'}" stroke-width="${on?3:1}"/>${b}${ob?obra(x,y,w,h,ob,g):''}
  <g transform="translate(${x+8},${y+8})"><rect width="${Math.max(78,z.nombre.length*5.8)}" height="20" rx="10" fill="#0a1020" opacity=".85"/><text x="9" y="14" font-size="11" font-weight="700" fill="#fff">${z.icono} ${z.nombre.split(' ')[0]} · ${lv}</text></g></g>`});
 return`<svg viewBox="0 0 920 560" class="predio" role="img" aria-label="Predio del club">${s}</svg>`}

export function install(UI,H){
const P=UI.prototype,{pips}=H;
P.v_predio=function(){const g=this.g,c=U(g),Z=F.zonas(),tope=F.topeZona(g,c),sel=this.pdk&&Z.find(z=>z.id===this.pdk);
 let panel='<p class="hint">Tocá un edificio para ver sus detalles y mejorarlo.</p>';
 if(sel){const lv=zl(c,sel.id),ob=c.obras.find(o=>o.zona===sel.id),cost=this.zc(c,sel);
  panel=`<div class="card"><h4>${sel.icono} ${sel.nombre} <small class="muted">nivel ${lv}/${tope}</small></h4>${pips(lv,tope)}<p>${sel.desc}</p>${ob?`<p class="warn">🏗️ Obra a nivel ${ob.a}: faltan ${dias(g.date,ob.hasta)} días</p>`:`<div class="row">${lv>=tope?`<span class="muted">${lv>=10?'Máximo':'Tope de tu división'}</span>`:`<button class="pri" data-act="obra" data-k="${sel.id}">🔨 Mejorar a nivel ${lv+1} · ${fmt(cost)}</button><small class="muted">${F.obraDias(lv)} días de obra</small>`}</div>`}</div>`}
 return`<h2>Predio del club</h2><div class="cards"><div><b>Obras en curso</b>${c.obras.length}/${CFG.facilities.obrasMax}</div><div><b>Nivel máximo</b>${tope}<small>${c.division}</small></div><div><b>Presupuesto</b>${fmt(c.presupuesto)}</div></div>
 <p><button data-act="pd_vista">${this.pdiso?'🗺️ Vista plana':'🧊 Vista isométrica'}</button> ${this.pdiso?`<button data-act="pd_noche">${this.pdnoche?'☀️ Día':'🌙 Noche'}</button>`:''}</p><div class="pdwrap">${this.pdiso?dibujarIso(g,this.pdk,this.pdnoche):dibujar(g,this.pdk)}<div class="pdside">${panel}</div></div>
 <p class="hint">Los edificios crecen con cada nivel. Durante una obra vas a ver la grúa y el andamio hasta que termine.</p>`};
const oa=P.act9;P.act9=function(a,d){if(a==='pd_vista'){this.pdiso=!this.pdiso;this.render();return true}if(a==='pd_noche'){this.pdnoche=!this.pdnoche;this.render();return true}if(a==='pd_sel'){this.pdk=this.pdk===d.k?null:d.k;this.render();return true}return oa.call(this,a,d)};
}
