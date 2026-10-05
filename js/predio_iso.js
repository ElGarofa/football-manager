// v1.5: predio en vista isométrica (día/noche, estadio que crece con la capacidad, obras con andamio y grúa)
import * as F from './facilities.js';
import {zl} from './finance.js';
const TW=170,TH=85,OX=345,OY=70;
// celda (col,fila,ancho,alto) de cada zona en una grilla de 4x3
const CELL={estadio:[0,0,2,2],palcos:[2,0,1,1],oficinas:[3,0,1,1],scouting:[2,1,1,1],medica:[3,1,1,1],concentracion:[0,2,1,1],tienda:[1,2,1,1],entrenamiento:[2,2,1,1],cantera:[3,2,1,1]};
const P=(c,r,z=0)=>[OX+(c-r)*TW/2,OY+(c+r)*TH/2-z];
const pt=a=>a.map(p=>p.map(n=>n.toFixed(1)).join(',')).join(' ');
const shade=(h,k)=>`hsl(${h[0]} ${h[1]}% ${Math.max(5,Math.min(95,h[2]*k))}%)`;
function box(c0,r0,w,h,z,col,roof,lit,z0=0){const t=[P(c0,r0,z+z0),P(c0+w,r0,z+z0),P(c0+w,r0+h,z+z0),P(c0,r0+h,z+z0)],
 l=[P(c0,r0+h,z0),P(c0+w,r0+h,z0),P(c0+w,r0+h,z+z0),P(c0,r0+h,z+z0)],r=[P(c0+w,r0,z0),P(c0+w,r0+h,z0),P(c0+w,r0+h,z+z0),P(c0+w,r0,z+z0)];
 let win='';const fl=Math.max(1,Math.floor(z/22));for(let f=0;f<fl;f++)for(let k=1;k<=3;k++){const a=P(c0+w*k/4-.04*w,r0+h,z0+8+f*22),b=P(c0+w*k/4+.04*w,r0+h,z0+8+f*22+11);win+=`<polygon points="${pt([a,[b[0],a[1]],b,[a[0],b[1]]])}" fill="${lit?'#fde68a':'#475569'}" opacity="${lit?.95:.75}"/>`}
 return`<polygon points="${pt(l)}" fill="${shade(col,.82)}" stroke="#0005"/><polygon points="${pt(r)}" fill="${shade(col,.62)}" stroke="#0005"/>${win}<polygon points="${pt(t)}" fill="${roof||shade(col,1.1)}" stroke="#0005"/>`}
function flat(c0,r0,w,h,fill,z=0,lines){const q=[P(c0,r0,z),P(c0+w,r0,z),P(c0+w,r0+h,z),P(c0,r0+h,z)];let s=`<polygon points="${pt(q)}" fill="${fill}" stroke="#fff6"/>`;
 if(lines){const a=P(c0+w/2,r0,z),b=P(c0+w/2,r0+h,z),m=P(c0+w/2,r0+h/2,z);s+=`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="#fff8"/><ellipse cx="${m[0]}" cy="${m[1]}" rx="${w*TW/9}" ry="${w*TH/9}" fill="none" stroke="#fff8"/>`}return s}
function lamp(c,r,z){const a=P(c,r,0),b=P(c,r,z);return`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="#cbd5e1" stroke-width="3"/><rect x="${b[0]-7}" y="${b[1]-6}" width="14" height="7" fill="#fde68a"/>`}
function tree(c,r){const a=P(c,r,0);return`<rect x="${a[0]-1.5}" y="${a[1]-8}" width="3" height="8" fill="#6b4423"/><circle cx="${a[0]}" cy="${a[1]-14}" r="8" fill="#2f7d46"/><circle cx="${a[0]-4}" cy="${a[1]-10}" r="5" fill="#3b8c52"/>`}
function obraIso(c0,r0,w,h,z,pct,left,nv){const t=[P(c0,r0,z+14),P(c0+w,r0,z+14),P(c0+w,r0+h,z+14),P(c0,r0+h,z+14)],k=P(c0+w-.05,r0+.05,z+14),b=P(c0+w-.05,r0+.05,0),m=P(c0+w/2,r0+h/2,z+14);
 return`<polygon points="${pt(t)}" fill="url(#pdhatch)" opacity=".7"/><g stroke="#f59e0b" stroke-width="2"><line x1="${P(c0,r0+h,0)[0]}" y1="${P(c0,r0+h,0)[1]}" x2="${P(c0,r0+h,z+14)[0]}" y2="${P(c0,r0+h,z+14)[1]}"/><line x1="${P(c0+w,r0+h,0)[0]}" y1="${P(c0+w,r0+h,0)[1]}" x2="${P(c0+w,r0+h,z+14)[0]}" y2="${P(c0+w,r0+h,z+14)[1]}"/><line x1="${P(c0,r0+h,z/2)[0]}" y1="${P(c0,r0+h,z/2)[1]}" x2="${P(c0+w,r0+h,z/2)[0]}" y2="${P(c0+w,r0+h,z/2)[1]}"/></g>
 <g class="pd-crane" stroke="#fbbf24" stroke-width="3" fill="none"><line x1="${b[0]}" y1="${b[1]}" x2="${b[0]}" y2="${k[1]-60}"/><line x1="${b[0]+10}" y1="${k[1]-60}" x2="${b[0]-80}" y2="${k[1]-60}"/><line x1="${b[0]-60}" y1="${k[1]-60}" x2="${b[0]-60}" y2="${k[1]-30}"/></g><rect x="${b[0]-66}" y="${k[1]-30}" width="12" height="9" fill="#ef4444" class="pd-load"/>
 <g transform="translate(${m[0]-34},${m[1]-6})"><rect width="68" height="14" rx="7" fill="#0008"/><rect width="${68*pct}" height="14" rx="7" fill="#fbbf24"/><text x="34" y="10.5" text-anchor="middle" font-size="9.5" font-weight="700" fill="#fff" stroke="#000" stroke-width=".4">Nv ${nv} · ${left} d</text></g>`}
const ROOF=['#b91c1c','#1e40af','#6d28d9','#0f766e','#a16207'];
export function dibujarIso(g,sel,night){const c=g.clubs[g.userClubId],Z=F.zonas(),H=Math.round(window.getComputedStyle?.(document.documentElement)?.getPropertyValue('--h')||150)||150,col=[H,45,36];
 const dias=(a,b)=>Math.max(0,Math.round((new Date(b)-new Date(a))/864e5));
 let s=`<defs><pattern id="pdhatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="5" height="10" fill="#fbbf24"/><rect x="5" width="5" height="10" fill="#1f2937"/></pattern></defs>
 <rect width="760" height="470" rx="18" fill="${night?'#0b1030':'#a8d8f0'}"/>${night?Array.from({length:30},(_,i)=>`<circle cx="${(i*97)%720}" cy="${(i*53)%150}" r="1.2" fill="#fff" opacity=".8"/>`).join('')+'<circle cx="640" cy="50" r="18" fill="#f1f5f9"/><circle cx="648" cy="45" r="16" fill="#0b1030"/>':'<circle cx="640" cy="52" r="22" fill="#fde68a"/>'}
 ${flat(-.35,-.35,4.7,3.7,'#3f8f4c',-6)}${flat(-.2,-.2,4.4,3.4,'#4c9d58',-2)}`;
 const items=Z.map(z=>{const [c0,r0,w,h]=CELL[z.id]||[0,0,1,1];return{z,c0,r0,w,h,k:c0+r0+w+h}}).sort((a,b)=>a.k-b.k);
 [[-.1,1.4],[4.2,.5],[4.2,2],[1.2,3.2],[4.1,3.1]].forEach(([a,b])=>s+=tree(a,b));
 items.forEach(({z,c0,r0,w,h})=>{const lv=zl(c,z.id),ob=c.obras.find(o=>o.zona===z.id),on=sel===z.id,m=.1;let b='';
  const base=flat(c0+m,r0+m,w-2*m,h-2*m,'#77808f',0);
  if(z.id==='estadio'){const rings=Math.min(5,1+Math.floor(lv/2)),cap=c.capacidad||15000,hh=10+rings*3+Math.min(10,cap/8000),mg=.1+rings*.03;
   b=box(c0+m,r0+m,w-2*m,h-2*m,hh,col,shade(col,.75))+flat(c0+m+.3+rings*.04,r0+m+.3+rings*.04,w-2*m-.6-rings*.08,h-2*m-.6-rings*.08,'#2f7d46',hh+.5,true);
   if(lv>=5)b+=lamp(c0+m,r0+m,hh+28)+lamp(c0+w-m,r0+m,hh+28)+lamp(c0+m,r0+h-m,hh+28)+lamp(c0+w-m,r0+h-m,hh+28)}
  else if(z.id==='entrenamiento'||z.id==='cantera'){const n=Math.min(3,1+Math.floor(lv/(z.id==='cantera'?4:3)));for(let k=0;k<n;k++)b+=flat(c0+.12,r0+.1+k*.3,.76,.26,k?'#3b8c52':'#2f7d46',1,true);b+=box(c0+.55,r0+.72,.38,.22,10+lv*2,col,ROOF[z.id==='cantera'?2:3],night)}
  else if(lv>0)b=box(c0+.15,r0+.15,.7,.7,10+lv*4.5,[(H+ZH(z.id))%360,35,48],ROOF[ZH(z.id)%5],night);
  else b=flat(c0+.2,r0+.2,.6,.6,'none',1).replace('stroke="#fff6"','stroke="#fff" stroke-dasharray="5 5" opacity=".6"');
  const zz=z.id==='estadio'?40:lv>0?24+lv*4.5:10,bz=P(c0+w/2,r0+h/2,zz),H0=ob?obraIso(c0+.15,r0+.15,w>1?.7:.7,.7,z.id==='estadio'?34:10+lv*4.5,Math.max(0,Math.min(1,1-dias(g.date,ob.hasta)/Math.max(1,F.obraDias(ob.a-1)))),dias(g.date,ob.hasta),ob.a):'';
  s+=`<g class="pd-b${on?' on':''}${ob?' obra':''}" data-act="pd_sel" data-k="${z.id}" tabindex="0" role="button" aria-label="${z.nombre}, nivel ${lv}">${base}${b}${H0}<g transform="translate(${bz[0]-22},${bz[1]-30})"><rect width="44" height="18" rx="9" fill="#0a1020" opacity=".88" stroke="${on?'#fbbf24':'none'}" stroke-width="2"/><text x="22" y="12.5" text-anchor="middle" font-size="10" font-weight="700" fill="#fff">${z.icono} ${lv}</text></g></g>`});
 if(night)s+=`<rect width="760" height="470" rx="18" fill="#05103c" opacity=".35" pointer-events="none"/>`;
 return`<svg viewBox="0 0 760 470" class="predio iso" role="img" aria-label="Predio del club en vista isométrica">${s}</svg>`}
const ZH=id=>[...id].reduce((a,ch)=>a+ch.charCodeAt(0),0)%360;
