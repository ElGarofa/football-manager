import {FORMATIONS,coords,lineOf,fit} from './tactics.js';
import {colors} from './visual.js';
import {ambiente} from './extras.js';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function drawPitch(c,W,H){c.fillStyle='#2f7d46';c.fillRect(0,0,W,H);c.fillStyle='rgba(255,255,255,.04)';for(let i=1;i<10;i+=2)c.fillRect(i*W/10,0,W/10,H);
 c.strokeStyle='rgba(255,255,255,.75)';c.lineWidth=2;const m=18;c.strokeRect(m,m,W-2*m,H-2*m);c.beginPath();c.moveTo(W/2,m);c.lineTo(W/2,H-m);c.stroke();c.beginPath();c.arc(W/2,H/2,H*.13,0,7);c.stroke();
 for(const s of[0,1]){c.strokeRect(s?W-m-W*.15:m,H*.22,W*.15,H*.56);c.strokeRect(s?W-m-W*.06:m,H*.36,W*.06,H*.28);c.strokeRect(s?W-m:m-8,H*.44,8,H*.12)}}
function dot(c,x,y,r,fill,tcol,txt,ring){c.beginPath();c.ellipse(x+2,y+r*.8,r*.9,r*.35,0,0,7);c.fillStyle='rgba(0,0,0,.28)';c.fill();c.beginPath();c.arc(x,y,r,0,7);c.fillStyle=fill;c.fill();c.lineWidth=ring?4:2;c.strokeStyle=ring||'rgba(0,0,0,.55)';c.stroke();c.fillStyle=tcol;c.font='bold '+Math.round(r*.95)+'px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText(txt,x,y+1)}
export function dorsales(ps){const used=new Set(),m={};for(const p of ps)if(p.num&&!used.has(p.num)){m[p.id]=p.num;used.add(p.num)}
 let n=2;for(const p of ps){if(m[p.id])continue;let k=p.pos==='POR'&&!used.has(1)?1:0;if(!k){while(used.has(n))n++;k=n}used.add(k);m[p.id]=k}return m}
export function tacticBoard(cv,get,cb){const c=cv.getContext('2d'),W=cv.width,H=cv.height;let drag=null,sx=0,sy=0;
 const draw=()=>{const s=get(),nm=dorsales(s.xi);drawPitch(c,W,H);s.slots.forEach((q,i)=>{const p=s.xi[i],f=fit(p.pos,s.labels[i]);dot(c,q.x*W,q.y*H,20,f==1?'#2e9e5b':f>.9?'#c9a227':'#c0463d','#fff',String(nm[p.id]));c.fillStyle='#fff';c.font='13px system-ui';c.fillText(p.nombre.split(' ').pop(),q.x*W,q.y*H+34);c.fillStyle='rgba(255,255,255,.7)';c.fillText(s.labels[i],q.x*W,q.y*H-30)})};
 const pt=e=>{const r=cv.getBoundingClientRect();return{x:clamp((e.clientX-r.left)/r.width,.04,.96),y:clamp((e.clientY-r.top)/r.height,.05,.95)}};
 cv.onpointerdown=e=>{const q=pt(e),r=cv.getBoundingClientRect(),i=get().slots.findIndex(o=>Math.hypot((o.x-q.x)*r.width,(o.y-q.y)*r.height)<24);if(i<0)return;drag=i;sx=e.clientX;sy=e.clientY;cv.setPointerCapture(e.pointerId)};
 cv.onpointermove=e=>{if(drag>0){const q=pt(e);cb.move(drag,q.x,q.y,false)}};
 cv.onpointerup=e=>{if(drag===null)return;const i=drag,q=pt(e);drag=null;if(Math.hypot(e.clientX-sx,e.clientY-sy)<5)cb.click(i);else if(i>0)cb.move(i,q.x,q.y,true)};
 return{draw}}
const hs=s=>{let h=2166136261;for(const ch of String(s)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
function lum(h){if(h[0]!=='#')return 120;return(parseInt(h.slice(1,3),16)+parseInt(h.slice(3,5),16)+parseInt(h.slice(5,7),16))/3}
function sprite(c,x,y,r,col,sec,txt,ring,ph,v){
 const bob=Math.sin(ph)*Math.min(3,v*900)*.5,lg=Math.sin(ph*1.2)*Math.min(4,v*1300);
 c.beginPath();c.ellipse(x,y+r*1.05,r*.95,r*.32,0,0,7);c.fillStyle='rgba(0,0,0,.3)';c.fill();
 c.strokeStyle='#1b1b1b';c.lineWidth=2.4;c.lineCap='round';c.beginPath();c.moveTo(x-r*.35,y+r*.5);c.lineTo(x-r*.35+lg*.6,y+r*1.05);c.moveTo(x+r*.35,y+r*.5);c.lineTo(x+r*.35-lg*.6,y+r*1.05);c.stroke();
 const by=y+bob;c.beginPath();c.moveTo(x-r*.85,by+r*.55);c.quadraticCurveTo(x-r*.95,by-r*.7,x-r*.4,by-r*.75);c.lineTo(x+r*.4,by-r*.75);c.quadraticCurveTo(x+r*.95,by-r*.7,x+r*.85,by+r*.55);c.closePath();
 c.fillStyle=col;c.fill();c.lineWidth=ring?3.5:1.6;c.strokeStyle=ring||'rgba(0,0,0,.6)';c.stroke();
 c.beginPath();c.arc(x,by-r*1.0,r*.38,0,7);c.fillStyle='#e8c19b';c.fill();c.lineWidth=1.2;c.strokeStyle='rgba(0,0,0,.5)';c.stroke();
 c.fillStyle=sec;c.font='bold '+Math.round(r*.85)+'px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText(txt,x,by-r*.05)}
export class Pitch{
 constructor(cv,lm,us){this.cv=cv;this.c=cv.getContext('2d');this.lm=lm;this.us=us;this.W=cv.width;this.H=cv.height;this.mode='live';
  const c0=colors(lm.T[0].club);let c1=colors(lm.T[1].club);const d=(a,b)=>Math.abs(lum(a)-lum(b));if(d(c0[0],c1[0])<50)c1=[c1[1],c1[0]];if(d(c0[0],c1[0])<50)c1=['#222','#fff'];
  this.col=[c0,c1];this.num=lm.T.map(s=>dorsales([...s.xi,...s.bench]));
  const h=hs(lm.T[0].club.nombre+(lm.T[1].club.nombre||'')+(lm.date||''));this.wx=['sol','sol','sol','lluvia','niebla','lluvia'][h%6];this.noche=((h>>>4)%3)===0;
  this.cap=lm.T[0].club.capacidad||20000;this.fill=Math.min(1,.35+.65*Math.random());
  this.drops=Array.from({length:120},()=>({x:Math.random()*this.W,y:Math.random()*this.H,v:500+Math.random()*300}));
  this.heat=[0,1].map(()=>new Float32Array(24*15));this.shots=[];this.passes=[];this.ph=[0,1].map(()=>Array(11).fill(0).map((_,i)=>i*1.3));
  this.pl=[0,1].map(t=>coords(lm.T[t].tactic.formacion).map(q=>({x:t?1-q.x:q.x,y:t?1-q.y:q.y})));this.tg=this.pl.map(a=>a.map(q=>({...q})));this.ball={x:.5,y:.5};this.bt={x:.5,y:.5};this.flash=0;this.stop=false;this.zoom=false;this.rec=[];this.rt=0;this.rep=null;this.loop=this.loop.bind(this);try{ambiente(true,this.fill)}catch(e){}requestAnimationFrame(this.loop)}
 update(){const lm=this.lm,o=lm.lo??0,sh=lm.shot,dir=[1,-1],AL={A:3,M:2,D:.6,G:0};
  [0,1].forEach(t=>{const tc=lm.T[t].tactic,labs=FORMATIONS[tc.formacion],ln={Baja:-.04,Media:0,Alta:.05}[tc.linea]||0,pr={Baja:-.02,Media:0,Alta:.03}[tc.presion]||0;
   this.pl[t].forEach((_,i)=>{const q=coords(tc.formacion)[i],bx=t?1-q.x:q.x,by=t?1-q.y:q.y,L=lineOf(labs[i]),k=L==='G'?0:1,s=(t===o?.08:-.03)+(L==='D'?ln:L==='M'?pr:0);
    this.tg[t][i]={x:clamp(bx+dir[t]*s*k,.03,.97),y:clamp(by+(this.ball.y-by)*.18*k,.05,.95)}})});
  const w=FORMATIONS[lm.T[o].tactic.formacion].map(l=>AL[lineOf(l)]);let r=Math.random()*w.reduce((a,b)=>a+b,0),ci=0;for(;ci<10&&(r-=w[ci])>0;ci++);
  const cp=this.tg[o][ci],from={x:this.bt.x,y:this.bt.y};if(sh){cp.x=o?.3:.7;cp.y=.5+(Math.random()-.5)*.3;this.bt={x:o?.045:.955,y:.5+(Math.random()-.5)*.14};this.shots.push({t:o,x:cp.x,y:cp.y,g:!!sh.g});if(sh.g){this.flash=2.4;this.pendRep=this.rec.slice(-55);try{ambiente('roar')}catch(e){}}}else this.bt={x:clamp(cp.x+dir[o]*.02,.03,.97),y:cp.y};
  this.passes.push({x1:from.x,y1:from.y,x2:this.bt.x,y2:this.bt.y,t:o,a:1});if(this.passes.length>40)this.passes.shift();
  const gx=Math.min(23,Math.floor(this.bt.x*24)),gy=Math.min(14,Math.floor(this.bt.y*15));for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const X=gx+dx,Y=gy+dy;if(X<0||Y<0||X>23||Y>14)continue;this.heat[o][Y*24+X]+=1/(1+dx*dx+dy*dy)}}
 setMode(m){this.mode=m}
 setZoom(z){this.zoom=z}
 overlay(c,W,H){const m=this.mode;if(m==='heat'){const t=this.us,A=this.heat[t],mx=Math.max(1,...A);for(let y=0;y<15;y++)for(let x=0;x<24;x++){const v=A[y*24+x]/mx;if(v<=0)continue;c.fillStyle=`hsla(${60-60*v},95%,50%,${.12+v*.55})`;c.fillRect(x*W/24,y*H/15,W/24+1,H/15+1)}}
  if(m==='shots'){this.shots.forEach(s=>{const x=s.x*W,y=s.y*H;c.beginPath();c.arc(x,y,s.g?11:7,0,7);c.fillStyle=s.g?'#ffd23f':(s.t===this.us?'rgba(60,200,120,.8)':'rgba(230,80,70,.8)');c.fill();c.strokeStyle='#fff';c.lineWidth=2;c.stroke();if(s.g){c.fillStyle='#000';c.font='bold 11px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText('⚽',x,y)}})}
  if(m==='pases'){this.passes.forEach((p,i)=>{c.strokeStyle=p.t===this.us?`rgba(255,255,255,${.15+i/60})`:`rgba(255,120,110,${.1+i/80})`;c.lineWidth=2;c.beginPath();c.moveTo(p.x1*W,p.y1*H);c.lineTo(p.x2*W,p.y2*H);c.stroke();c.beginPath();c.arc(p.x2*W,p.y2*H,3,0,7);c.fillStyle=c.strokeStyle;c.fill()})}}

 grabar(ts){if(ts-this.rt<66)return;this.rt=ts;this.rec.push({b:[this.ball.x,this.ball.y],p:this.pl.map(a=>a.map(q=>[q.x,q.y]))});if(this.rec.length>90)this.rec.shift()}
 loopRep(ts){const dt=Math.min(.1,(ts-(this.last||ts))/1000),c=this.c,W=this.W,H=this.H,R=this.rep;this.last=ts;R.i+=dt*9;const i=Math.floor(R.i);
  if(i>=R.f.length-1){this.rep=null;requestAnimationFrame(this.loop);return}
  const f=R.f[i],lm=this.lm;c.save();if(this.zoom){const zx=clamp(f.b[0]*W,W/3.4,W-W/3.4),zy=clamp(f.b[1]*H,H/3.4,H-H/3.4);c.translate(W/2,H/2);c.scale(1.7,1.7);c.translate(-zx,-zy)}
  drawPitch(c,W,H);[0,1].forEach(t=>f.p[t].forEach((q,k)=>{const pl=lm.cur[t][k];if(!pl||lm.out[t].has(pl.id))return;const gk=k===0;sprite(c,q[0]*W,q[1]*H,15,gk?(t?'#e08a1e':'#2aa6a0'):this.col[t][0],gk?'#fff':this.col[t][1],String(this.num[t][pl.id]),t===this.us?'#ffd23f':null,R.i*3+k,.002)}));
  for(let k=Math.max(0,i-8);k<=i;k++){c.beginPath();c.arc(R.f[k].b[0]*W,R.f[k].b[1]*H,2+(k-i+8)*.4,0,7);c.fillStyle=`rgba(255,255,255,${(k-i+8)/12})`;c.fill()}
  c.beginPath();c.arc(f.b[0]*W,f.b[1]*H,7,0,7);c.fillStyle='#fff';c.fill();c.strokeStyle='#111';c.lineWidth=2;c.stroke();c.restore();
  c.fillStyle='rgba(0,0,0,.55)';c.fillRect(0,0,W,34);c.fillStyle='#ffd23f';c.font='bold 17px system-ui';c.textAlign='left';c.textBaseline='middle';c.fillText('🔁 REPETICIÓN DEL GOL',14,17);c.textBaseline='alphabetic';
  requestAnimationFrame(this.loop)}
 loop(ts){if(this.stop||!this.cv.isConnected){this.stop=true;try{ambiente(false)}catch(e){}return}if(this.rep)return this.loopRep(ts);const dt=Math.min(.1,(ts-(this.last||ts))/1000),c=this.c,W=this.W,H=this.H,lm=this.lm,k=Math.min(1,dt*3);this.last=ts;
  c.save();if(this.zoom){const zx=clamp(this.ball.x*W,W/3.4,W-W/3.4),zy=clamp(this.ball.y*H,H/3.4,H-H/3.4);c.translate(W/2,H/2);c.scale(1.7,1.7);c.translate(-zx,-zy)}
  drawPitch(c,W,H);
  if(this.noche){c.fillStyle='rgba(5,10,40,.38)';c.fillRect(0,0,W,H)}
  // tribunas con público
  const seed=hs(lm.T[0].club.nombre);const n=Math.round(60*this.fill*(.4+Math.min(1,this.cap/60000)*.6));for(let i=0;i<n;i++){const hx=((seed*(i+7))%1000)/1000;const col=['#d44','#48d','#ee4','#fff','#4b6'][(seed+i)%5];c.fillStyle=col;c.globalAlpha=.75;c.fillRect(hx*W,2+(i%3)*4,5,4);c.fillRect(((hx*7.3)%1)*W,H-6-(i%3)*4,5,4)}c.globalAlpha=1;
  if(this.mode!=='heat'&&this.mode!=='shots')[0,1].forEach(t=>this.pl[t].forEach((p,i)=>{const g=this.tg[t][i];const ox=p.x,oy=p.y;p.x+=(g.x-p.x)*k+Math.sin(ts/700+i*1.7+t*3)*.0006;p.y+=(g.y-p.y)*k+Math.cos(ts/800+i*2.1+t)*.0006;const v=Math.hypot(p.x-ox,p.y-oy);this.ph[t][i]+=dt*(6+v*900);const pl=lm.cur[t][i];if(lm.out[t].has(pl.id))return;
   const gk=i===0,col=gk?(t?'#e08a1e':'#2aa6a0'):this.col[t][0];sprite(c,p.x*W,p.y*H,15,col,gk?'#fff':this.col[t][1],String(this.num[t][pl.id]),t===this.us?'#ffd23f':null,this.ph[t][i],v)}));
  else [0,1].forEach(t=>this.pl[t].forEach((p,i)=>{const g=this.tg[t][i];p.x+=(g.x-p.x)*k;p.y+=(g.y-p.y)*k}));
  this.overlay(c,W,H);
  const b=this.ball,kb=Math.min(1,dt*6);b.x+=(this.bt.x-b.x)*kb;b.y+=(this.bt.y-b.y)*kb;const tr=this.trail||(this.trail=[]);tr.push({x:b.x,y:b.y});if(tr.length>16)tr.shift();tr.forEach((q,i)=>{c.beginPath();c.arc(q.x*W,q.y*H,2+i*.25,0,7);c.fillStyle=`rgba(255,255,255,${i/40})`;c.fill()});c.beginPath();c.arc(b.x*W,b.y*H,7,0,7);c.fillStyle='#fff';c.fill();c.strokeStyle='#111';c.lineWidth=2;c.stroke();
  c.restore();
  this.grabar(ts);
  if(this.noche){const g=c.createRadialGradient(0,0,0,0,0,200);for(const[fx,fy]of[[0,0],[W,0],[0,H],[W,H]]){const r=c.createRadialGradient(fx,fy,0,fx,fy,260);r.addColorStop(0,'rgba(255,250,200,.45)');r.addColorStop(1,'rgba(255,250,200,0)');c.fillStyle=r;c.fillRect(0,0,W,H)}}
  if(this.wx==='lluvia'){c.strokeStyle='rgba(190,210,255,.55)';c.lineWidth=1.2;this.drops.forEach(d=>{d.y+=d.v*dt;d.x-=60*dt;if(d.y>H){d.y=-10;d.x=Math.random()*W}c.beginPath();c.moveTo(d.x,d.y);c.lineTo(d.x+4,d.y+14);c.stroke()});c.fillStyle='rgba(40,60,90,.18)';c.fillRect(0,0,W,H)}
  if(this.wx==='niebla'){c.fillStyle='rgba(220,230,235,.25)';c.fillRect(0,0,W,H);const o=Math.sin(ts/3000)*40;const g=c.createLinearGradient(0,0,W,0);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.5,'rgba(255,255,255,.18)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(o,0,W,H)}
  c.fillStyle='rgba(0,0,0,.45)';c.fillRect(8,H-26,0,0);c.font='12px system-ui';c.textAlign='left';c.textBaseline='alphabetic';c.fillStyle='rgba(255,255,255,.85)';c.fillText((this.wx==='lluvia'?'🌧️ Lluvia':this.wx==='niebla'?'🌫️ Niebla':'☀️ Despejado')+(this.noche?' · 🌙 Nocturno':'')+' · 👥 '+Math.round(this.cap*this.fill).toLocaleString('es-AR'),24,H-22);
  if(this.flash>0){if(!this.conf||this.flash>2.3)this.conf=Array.from({length:60},()=>({x:Math.random()*W,y:-10,v:80+Math.random()*160,h:Math.random()*360}));this.conf.forEach(q=>{q.y+=q.v*dt;c.fillStyle=`hsl(${q.h} 90% 60%)`;c.fillRect(q.x,q.y,6,10)});this.flash-=dt;if(this.flash<=0&&this.pendRep&&this.pendRep.length>8){this.rep={f:this.pendRep,i:0};this.pendRep=null}c.fillStyle='rgba(0,0,0,.35)';c.fillRect(0,H*.4,W,H*.2);c.fillStyle='#fff';c.font='bold 64px system-ui';c.textAlign='center';c.fillText('¡GOOOL!',W/2,H/2)}
  requestAnimationFrame(this.loop)}
}
