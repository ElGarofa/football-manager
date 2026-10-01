import {effective,lineRating} from './players.js';
import {FORMATIONS,mods,lineOf} from './tactics.js';
const R=(a,b)=>a+Math.random()*(b-a),C=(x,a,b)=>Math.max(a,Math.min(b,x)),avg=a=>a.reduce((x,y)=>x+y,0)/(a.length||1);
const pick=(arr,w)=>{let t=w.reduce((a,b)=>a+b,0)*Math.random();for(let i=0;i<arr.length;i++){t-=w[i];if(t<=0)return arr[i]}return arr[arr.length-1]};
const GW={A:5,M:2,D:.5,G:0},CW={D:3,M:2.5,A:1,G:.3};
function strength(s,home){const f=FORMATIONS[s.tactic.formacion],m=mods(s.tactic),L={G:[],D:[],M:[],A:[]},h=home?1.05:1;s.xi.forEach((p,i)=>L[lineOf(f[i])].push(effective(p,f[i])));
 return{m,gk:avg(L.G),att:(avg(L.A)*.7+avg(L.M)*.3)*m.att*h,mid:avg(L.M)*m.mid*h,def:(avg(L.D)*.75+avg(L.G)*.25)*m.def*h}}
export function simulate(H,A){
 const T=[H,A],st=T.map((s,i)=>({...strength(s,!i),shots:0,sot:0,poss:0,fouls:0,yel:0,red:0,corners:0,k:1,goals:0}));
 const cur=T.map(s=>[...s.xi]),ev=[],gp={},yc={},out=[new Set(),new Set()],played=T.map(s=>new Set(s.xi.map(p=>p.id))),inj=[],gl=[],subAt=[R(58,72)|0,R(58,72)|0];
 const live=t=>cur[t].filter(p=>!out[t].has(p.id)),add=(min,t,txt)=>ev.push({min,t,txt}),P=(t,id)=>[...T[t].xi,...T[t].bench].find(x=>x.id==id);
 const swap=(t,p,min,why)=>{const b=T[t].bench.find(x=>!played[t].has(x.id)&&lineOf(x.pos)==lineOf(p.pos));if(!b)return false;cur[t][cur[t].indexOf(p)]=b;played[t].add(b.id);add(min,'cambio',`Cambio en ${T[t].club.nombre}: sale ${p.nombre}, entra ${b.nombre}${why}`);return true};
 for(let min=1;min<=90;min++){
  const k=st.map(x=>x.mid*x.k),pr=C(k[0]/(k[0]+k[1])+st[0].m.poss-st[1].m.poss,.25,.75),o=Math.random()<pr?0:1,a=st[o],b=st[1-o],q=a.att*a.k/(b.def*b.k);
  a.poss++;
  if(Math.random()<.25*a.m.tempo*C(q,.6,1.6)){a.shots++;
   if(Math.random()<C(.36+(a.att-60)/250,.2,.6)){a.sot++;
    if(Math.random()<C(.22*q**1.3*(65/b.gk)**1.2,.05,.7)){const ps=live(o),s=pick(ps,ps.map(p=>GW[lineOf(p.pos)]*p.tir/60));a.goals++;gp[s.id]=(gp[s.id]||0)+1;gl.push(s.id);add(min,'gol',`¡GOOOL de ${T[o].club.nombre}! ${s.nombre} — ${T[0].club.nombre} ${st[0].goals} - ${st[1].goals} ${T[1].club.nombre}`)}
    else if(Math.random()<.25)a.corners++}
   else if(Math.random()<.2)a.corners++}
  for(const t of[0,1]){const x=st[t];
   if(Math.random()<.14*x.m.foul){x.fouls++;if(Math.random()<.14){const ps=live(t),p=pick(ps,ps.map(p=>CW[lineOf(p.pos)]));
    if(yc[p.id]||Math.random()<.05){x.red++;x.k*=.93;out[t].add(p.id);add(min,'roja',`Tarjeta roja para ${p.nombre} (${T[t].club.nombre})`)}else{yc[p.id]=1;x.yel++;add(min,'amarilla',`Tarjeta amarilla para ${p.nombre} (${T[t].club.nombre})`)}}}
   if(Math.random()<.0005){const ps=live(t),p=ps[Math.random()*ps.length|0];inj.push([p.id,5+R(0,35)|0]);add(min,'lesion',`Lesión de ${p.nombre} (${T[t].club.nombre})`);if(!swap(t,p,min,' (lesión)')){out[t].add(p.id);x.k*=.93}}
   if(min===subAt[t]){const p=live(t).filter(p=>p.pos!=='POR').sort((u,v)=>u.cond-v.cond)[0];if(p)swap(t,p,min,'')}}
 }
 const hg=st[0].goals,ag=st[1].goals,rate=[];
 T.forEach((s,t)=>played[t].forEach(id=>{const p=P(t,id),res=t?ag-hg:hg-ag;rate.push({id,n:p.nombre,c:s.club.id,r:C(6+R(-.7,.7)+1.1*(gp[id]||0)+Math.sign(res)*.3+(lineRating(p,lineOf(p.pos))-65)/35,4,10)})}));
 return{h:H.club.id,a:A.club.id,hg,ag,ev,gl,inj,top:rate.sort((x,y)=>y.r-x.r).slice(0,3),
  st:st.map(x=>({shots:x.shots,sot:x.sot,poss:Math.round(x.poss/.9),fouls:x.fouls,yel:x.yel,red:x.red,corners:x.corners})),
  played:T.flatMap((s,t)=>[...played[t]].map(id=>[id,R(10,20)*(1.4-P(t,id).res/100)*st[t].m.fat]))}}
