import {effective,lineRating} from './players.js';
import {FORMATIONS,mods,lineOf} from './tactics.js';
const R=(a,b)=>a+Math.random()*(b-a),C=(x,a,b)=>Math.max(a,Math.min(b,x)),avg=a=>a.reduce((x,y)=>x+y,0)/(a.length||1);
const pick=(arr,w)=>{let t=w.reduce((a,b)=>a+b,0)*Math.random();for(let i=0;i<arr.length;i++){t-=w[i];if(t<=0)return arr[i]}return arr[arr.length-1]};
const GW={A:5,M:2,D:.5,G:0},CW={D:3,M:2.5,A:1,G:.3},TR={Gambeteador:1.04,Pasador:1.04,Muro:1.04,Reflejos:1.05,Goleador:1.03},TIPOS=[['Golpe',3,7],['Muscular',10,25],['Esguince',20,40],['Fractura',50,120]];
function strength(s,xi,home){const f=FORMATIONS[s.tactic.formacion],m=mods(s.tactic),L={G:[],D:[],M:[],A:[]},h=(home?1.05:1)*(xi.some(p=>p.rasgo==='Capitán')?1.01:1);xi.forEach((p,i)=>L[lineOf(f[i])].push(effective(p,f[i])*(TR[p.rasgo]||1)));
 return{m,gk:avg(L.G),att:(avg(L.A)*.7+avg(L.M)*.3)*m.att*h,mid:avg(L.M)*m.mid*h,def:(avg(L.D)*.75+avg(L.G)*.25)*m.def*h}}
export class LiveMatch{
 constructor(H,A){this.T=[H,A];this.min=0;this.cur=[[...H.xi],[...A.xi]];this.ev=[];this.gp={};this.yc={};this.out=[new Set(),new Set()];this.played=[new Set(H.xi.map(p=>p.id)),new Set(A.xi.map(p=>p.id))];this.inj=[];this.gl=[];this.subs=[0,0];this.auto=[true,true];this.subAt=[R(58,72)|0,R(58,72)|0];
  this.st=[0,1].map(()=>({shots:0,sot:0,poss:0,fouls:0,yel:0,red:0,corners:0,k:1,goals:0}));this.recalc()}
 recalc(){[0,1].forEach(t=>Object.assign(this.st[t],strength(this.T[t],this.cur[t],!t)))}
 live(t){return this.cur[t].filter(p=>!this.out[t].has(p.id))}
 add(type,txt){this.ev.push({min:this.min,t:type,txt})}
 P(t,id){return[...this.T[t].xi,...this.T[t].bench].find(x=>x.id==id)}
 doSub(t,p,b,why){this.cur[t][this.cur[t].indexOf(p)]=b;this.played[t].add(b.id);this.subs[t]++;this.add('cambio',`Cambio en ${this.T[t].club.nombre}: sale ${p.nombre}, entra ${b.nombre}${why}`);this.recalc()}
 swap(t,p,why){const b=this.T[t].bench.find(x=>!this.played[t].has(x.id)&&lineOf(x.pos)==lineOf(p.pos));if(!b||this.subs[t]>=5)return false;this.doSub(t,p,b,why);return true}
 sub(t,oid,iid){const p=this.cur[t].find(x=>x.id==oid),b=this.T[t].bench.find(x=>x.id==iid&&!this.played[t].has(x.id));if(!p||!b||this.subs[t]>=5||this.out[t].has(p.id))return false;this.doSub(t,p,b,'');return true}
 step(){const min=++this.min,T=this.T,st=this.st,k=st.map(x=>x.mid*x.k),pr=C(k[0]/(k[0]+k[1])+st[0].m.poss-st[1].m.poss,.25,.75),o=Math.random()<pr?0:1,a=st[o],b=st[1-o],q=a.att*a.k/(b.def*b.k);
  a.poss++;this.lo=o;this.shot=null;
  if(Math.random()<.25*a.m.tempo*C(q,.6,1.6)){a.shots++;this.shot={o,g:false};
   if(Math.random()<C(.36+(a.att-60)/250,.2,.6)){a.sot++;
    if(Math.random()<C(.22*q**1.3*(65/b.gk)**1.2,.05,.7)){const ps=this.live(o),s=pick(ps,ps.map(p=>GW[lineOf(p.pos)]*p.tir/60*(p.rasgo==='Goleador'?1.6:1)));a.goals++;this.shot.g=true;this.gp[s.id]=(this.gp[s.id]||0)+1;this.gl.push(s.id);this.add('gol',`¡GOOOL de ${T[o].club.nombre}! ${s.nombre} — ${T[0].club.nombre} ${st[0].goals} - ${st[1].goals} ${T[1].club.nombre}`)}
    else if(Math.random()<.25)a.corners++}
   else if(Math.random()<.2)a.corners++}
  for(const t of[0,1]){const x=st[t],pf=T[t].club.cuerpoTecnico.preparadorFisico;
   if(Math.random()<.14*x.m.foul){x.fouls++;if(Math.random()<.14){const ps=this.live(t),p=pick(ps,ps.map(p=>CW[lineOf(p.pos)]));
    if(this.yc[p.id]||Math.random()<.05){x.red++;x.k*=.93;this.out[t].add(p.id);this.add('roja',`Tarjeta roja para ${p.nombre} (${T[t].club.nombre})`)}else{this.yc[p.id]=1;x.yel++;this.add('amarilla',`Tarjeta amarilla para ${p.nombre} (${T[t].club.nombre})`)}}}
   if(Math.random()<.0005*(1.6-pf/100)){const ps=this.live(t),p=pick(ps,ps.map(p=>(120-p.cond)*(p.rasgo==='Frágil'?3:1))),ty=pick(TIPOS,[5,4,3,1]);this.inj.push([p.id,Math.round(R(ty[1],ty[2])),ty[0]]);this.add('lesion',`Lesión de ${p.nombre} (${T[t].club.nombre}): ${ty[0]}`);if(!this.swap(t,p,' (lesión)')){this.out[t].add(p.id);x.k*=.93}}
   if(this.auto[t]&&min===this.subAt[t]){const p=this.live(t).filter(p=>p.pos!=='POR').sort((u,v)=>u.cond-v.cond)[0];if(p)this.swap(t,p,'')}}}
 result(){const T=this.T,st=this.st,hg=st[0].goals,ag=st[1].goals,rate=[];
  T.forEach((s,t)=>this.played[t].forEach(id=>{const p=this.P(t,id),res=t?ag-hg:hg-ag;rate.push({id,n:p.nombre,c:s.club.id,r:C(6+R(-.7,.7)+1.1*(this.gp[id]||0)+Math.sign(res)*.3+(lineRating(p,lineOf(p.pos))-65)/35,4,10)})}));
  return{h:T[0].club.id,a:T[1].club.id,hg,ag,ev:this.ev,gl:this.gl,inj:this.inj,top:rate.sort((x,y)=>y.r-x.r).slice(0,3),
   st:st.map(x=>({shots:x.shots,sot:x.sot,poss:Math.round(x.poss/(this.min||1)*100),fouls:x.fouls,yel:x.yel,red:x.red,corners:x.corners})),
   played:T.flatMap((s,t)=>[...this.played[t]].map(id=>{const p=this.P(t,id);return[id,R(10,20)*(1.4-p.res/100)*(p.rasgo==='Incansable'?.7:1)*(1.6-s.club.cuerpoTecnico.preparadorFisico/100)*st[t].m.fat]}))}}
}
export function simulate(H,A){const m=new LiveMatch(H,A);while(m.min<90)m.step();return m.result()}
