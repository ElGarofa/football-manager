import {FORMATIONS,coords,lineOf,fit} from './tactics.js';
import {colors} from './visual.js';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function drawPitch(c,W,H){c.fillStyle='#2f7d46';c.fillRect(0,0,W,H);c.fillStyle='rgba(255,255,255,.04)';for(let i=1;i<10;i+=2)c.fillRect(i*W/10,0,W/10,H);
 c.strokeStyle='rgba(255,255,255,.75)';c.lineWidth=2;const m=18;c.strokeRect(m,m,W-2*m,H-2*m);c.beginPath();c.moveTo(W/2,m);c.lineTo(W/2,H-m);c.stroke();c.beginPath();c.arc(W/2,H/2,H*.13,0,7);c.stroke();
 for(const s of[0,1]){c.strokeRect(s?W-m-W*.15:m,H*.22,W*.15,H*.56);c.strokeRect(s?W-m-W*.06:m,H*.36,W*.06,H*.28);c.strokeRect(s?W-m:m-8,H*.44,8,H*.12)}}
function dot(c,x,y,r,fill,tcol,txt,ring){c.beginPath();c.arc(x,y,r,0,7);c.fillStyle=fill;c.fill();c.lineWidth=ring?4:2;c.strokeStyle=ring||'rgba(0,0,0,.55)';c.stroke();c.fillStyle=tcol;c.font='bold '+Math.round(r*.95)+'px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText(txt,x,y+1)}
export function dorsales(ps){const used=new Set(),m={};for(const p of ps)if(p.num&&!used.has(p.num)){m[p.id]=p.num;used.add(p.num)}
 let n=2;for(const p of ps){if(m[p.id])continue;let k=p.pos==='POR'&&!used.has(1)?1:0;if(!k){while(used.has(n))n++;k=n}used.add(k);m[p.id]=k}return m}
export function tacticBoard(cv,get,cb){const c=cv.getContext('2d'),W=cv.width,H=cv.height;let drag=null,sx=0,sy=0;
 const draw=()=>{const s=get(),nm=dorsales(s.xi);drawPitch(c,W,H);s.slots.forEach((q,i)=>{const p=s.xi[i],f=fit(p.pos,s.labels[i]);dot(c,q.x*W,q.y*H,20,f==1?'#2e9e5b':f>.9?'#c9a227':'#c0463d','#fff',String(nm[p.id]));c.fillStyle='#fff';c.font='13px system-ui';c.fillText(p.nombre.split(' ').pop(),q.x*W,q.y*H+34);c.fillStyle='rgba(255,255,255,.7)';c.fillText(s.labels[i],q.x*W,q.y*H-30)})};
 const pt=e=>{const r=cv.getBoundingClientRect();return{x:clamp((e.clientX-r.left)/r.width,.04,.96),y:clamp((e.clientY-r.top)/r.height,.05,.95)}};
 cv.onpointerdown=e=>{const q=pt(e),r=cv.getBoundingClientRect(),i=get().slots.findIndex(o=>Math.hypot((o.x-q.x)*r.width,(o.y-q.y)*r.height)<24);if(i<0)return;drag=i;sx=e.clientX;sy=e.clientY;cv.setPointerCapture(e.pointerId)};
 cv.onpointermove=e=>{if(drag>0){const q=pt(e);cb.move(drag,q.x,q.y,false)}};
 cv.onpointerup=e=>{if(drag===null)return;const i=drag,q=pt(e);drag=null;if(Math.hypot(e.clientX-sx,e.clientY-sy)<5)cb.click(i);else if(i>0)cb.move(i,q.x,q.y,true)};
 return{draw}}
export class Pitch{
 constructor(cv,lm,us){this.cv=cv;this.c=cv.getContext('2d');this.lm=lm;this.us=us;this.W=cv.width;this.H=cv.height;this.col=lm.T.map(s=>colors(s.club));this.num=lm.T.map(s=>dorsales([...s.xi,...s.bench]));
  this.pl=[0,1].map(t=>coords(lm.T[t].tactic.formacion).map(q=>({x:t?1-q.x:q.x,y:t?1-q.y:q.y})));this.tg=this.pl.map(a=>a.map(q=>({...q})));this.ball={x:.5,y:.5};this.bt={x:.5,y:.5};this.flash=0;this.stop=false;this.loop=this.loop.bind(this);requestAnimationFrame(this.loop)}
 update(){const lm=this.lm,o=lm.lo??0,sh=lm.shot,dir=[1,-1],AL={A:3,M:2,D:.6,G:0};
  [0,1].forEach(t=>{const tc=lm.T[t].tactic,labs=FORMATIONS[tc.formacion],ln={Baja:-.04,Media:0,Alta:.05}[tc.linea]||0,pr={Baja:-.02,Media:0,Alta:.03}[tc.presion]||0;
   this.pl[t].forEach((_,i)=>{const q=coords(tc.formacion)[i],bx=t?1-q.x:q.x,by=t?1-q.y:q.y,L=lineOf(labs[i]),k=L==='G'?0:1,s=(t===o?.08:-.03)+(L==='D'?ln:L==='M'?pr:0);
    this.tg[t][i]={x:clamp(bx+dir[t]*s*k,.03,.97),y:clamp(by+(this.ball.y-by)*.18*k,.05,.95)}})});
  const w=FORMATIONS[lm.T[o].tactic.formacion].map(l=>AL[lineOf(l)]);let r=Math.random()*w.reduce((a,b)=>a+b,0),ci=0;for(;ci<10&&(r-=w[ci])>0;ci++);
  const cp=this.tg[o][ci];if(sh){cp.x=o?.3:.7;cp.y=.5+(Math.random()-.5)*.3;this.bt={x:o?.045:.955,y:.5+(Math.random()-.5)*.14};if(sh.g)this.flash=2}else this.bt={x:clamp(cp.x+dir[o]*.02,.03,.97),y:cp.y}}
 loop(ts){if(this.stop)return;const dt=Math.min(.1,(ts-(this.last||ts))/1000),c=this.c,W=this.W,H=this.H,lm=this.lm,k=Math.min(1,dt*3);this.last=ts;drawPitch(c,W,H);
  [0,1].forEach(t=>this.pl[t].forEach((p,i)=>{const g=this.tg[t][i];p.x+=(g.x-p.x)*k+Math.sin(ts/700+i*1.7+t*3)*.0006;p.y+=(g.y-p.y)*k+Math.cos(ts/800+i*2.1+t)*.0006;const pl=lm.cur[t][i];if(lm.out[t].has(pl.id))return;
   dot(c,p.x*W,p.y*H,17,t?this.col[1][1]:this.col[0][0],t?'#111':'#fff',String(this.num[t][pl.id]),t===this.us?'#ffd23f':null)}));
  const b=this.ball,kb=Math.min(1,dt*6);b.x+=(this.bt.x-b.x)*kb;b.y+=(this.bt.y-b.y)*kb;c.beginPath();c.arc(b.x*W,b.y*H,7,0,7);c.fillStyle='#fff';c.fill();c.strokeStyle='#111';c.lineWidth=2;c.stroke();
  if(this.flash>0){this.flash-=dt;c.fillStyle='rgba(0,0,0,.35)';c.fillRect(0,H*.4,W,H*.2);c.fillStyle='#fff';c.font='bold 64px system-ui';c.textAlign='center';c.fillText('¡GOOOL!',W/2,H/2)}
  requestAnimationFrame(this.loop)}
}
