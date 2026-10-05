import {CFG} from './config.js';
import {squadOf,wageBill,staffCost} from './clubs.js';
const cl=(x,a,b)=>Math.max(a,Math.min(b,x));
export const E=()=>CFG.economy;
export const zl=(c,id)=>c.zonas?.[id]??5;
export const nivelOf=(g,c)=>g.leagues[c.liga]?.def.nivel??1;
export const jornadas=(g,c)=>g.leagues[c.liga].fixtures.length;
export const refPrice=(g,c)=>E().precioBase[nivelOf(g,c)-1]*(.75+c.reputacion/100*.5);
export const tvAnual=(g,c)=>E().tv[nivelOf(g,c)-1]*(.6+c.reputacion/100*.8);
export const merchAnual=c=>E().merch.k*Math.pow(c.reputacion,E().merch.exp)*(.5+.1*zl(c,'tienda'));
export const sponsAnualAI=(c,g)=>E().sponsor.k*Math.pow(c.reputacion,E().sponsor.exp)*(1+.02*zl(c,'oficinas'))+((g&&g.leagues[c.liga])?(E().sponsor.piso?.[g.leagues[c.liga].def.nivel-1]||0):0);
export const mantAnual=c=>CFG.facilities.zonas.reduce((s,z)=>s+zl(c,z.id),0)*Math.pow(c.reputacion,3)*E().mant*(1-.03*zl(c,'oficinas'));
export function ingreso(c,cat,amt){c.presupuesto+=amt;const f=c.fin=c.fin||{ing:{},gas:{}};f.ing[cat]=(f.ing[cat]||0)+amt}
export function gasto(c,cat,amt){c.presupuesto-=amt;const f=c.fin=c.fin||{ing:{},gas:{}};f.gas[cat]=(f.gas[cat]||0)+amt}
export function ensureClub(c,g){
 if(!c.zonas){const base=cl(Math.round(1+(c.reputacion-20)/10),1,9),inst=c.instalaciones||base;c.zonas={};
  CFG.facilities.zonas.forEach((z,i)=>{c.zonas[z.id]=cl(Math.round((base+inst)/2+((c.id+i)%3)-1),1,10)});c.capBase=c.capacidad}
 if(!c.capBase)c.capBase=c.capacidad;if(!c.forma)c.forma=[];if(!c.fin)c.fin={ing:{},gas:{}};if(c.precio==null)c.precio=1;if(!c.obras)c.obras=[];
 if(c.sponsAnual==null)c.sponsAnual=sponsAnualAI(c,g)}
export function attendance(g,c,rival){
 const f=c.forma||[],pts=f.reduce((s,x)=>s+(x==='V'?3:x==='E'?1:0),0),form=f.length?.9+.25*pts/(3*f.length):1;
 const derby=rival.ciudad===c.ciudad||(rival.provincia===c.provincia&&Math.abs(rival.reputacion-c.reputacion)<12),riv=1+(derby?.12:0)+rival.reputacion/100*.08;
 const D=c.capacidad*(.3+.8*c.reputacion/100)*form*riv*Math.pow(1/(c.precio||1),1.5);
 return{att:Math.min(c.capacidad,Math.round(D)),cap:c.capacidad,derby}}
export function matchIncome(g,r){const hc=g.clubs[r.h],ac=g.clubs[r.a]||g.ext?.clubs[r.a];if(!hc||!ac)return;const a=attendance(g,hc,ac),rp=refPrice(g,hc);
 r.asist=a.att;ingreso(hc,'entradas',a.att*rp*(hc.precio||1));ingreso(hc,'palcos',zl(hc,'palcos')*E().palcos*a.att*rp)}
export function formaPush(c,res){c.forma=[...(c.forma||[]),res].slice(-5)}
const contratosAnual=g=>Object.values(g.contratos||{}).reduce((s,x)=>s+x.anual,0);
export function dayFinance(g,L){const J=L.fixtures.length,u=g.userClubId;
 for(const id of L.ids){const c=g.clubs[id];gasto(c,'sueldos',wageBill(g,id)/J);gasto(c,'staff',staffCost(c)/J);gasto(c,'mant',mantAnual(c)/J);
  ingreso(c,'tv',.7*tvAnual(g,c)/J);ingreso(c,'merch',merchAnual(c)/J);
  ingreso(c,'sponsors',(id==u&&g.contratos?contratosAnual(g):c.sponsAnual)/J)}}
export function proyeccion(g,c){const J=jornadas(g,c),rp=refPrice(g,c),att=Math.min(c.capacidad,c.capacidad*(.3+.8*c.reputacion/100)*(c.precio?Math.pow(1/c.precio,1.5):1));
 const sp=c===g.clubs[g.userClubId]&&g.contratos?contratosAnual(g):c.sponsAnual;
 return{entradas:J/2*att*rp*(c.precio||1),palcos:J/2*zl(c,'palcos')*E().palcos*att*rp,sponsors:sp,tv:tvAnual(g,c),merch:merchAnual(c)}}
export const ingresoProy=(g,c)=>Object.values(proyeccion(g,c)).reduce((s,x)=>s+x,0);
export function topeSalarial(g,c){return Math.round(Math.max(wageBill(g,c.id)*E().salarioTope.crecimiento,ingresoProy(g,c)*E().salarioTope.ingresos)/1000)*1000}
export function pasaTope(g,extra){const c=g.clubs[g.userClubId];return wageBill(g,c.id)+extra>(c.topeSalarial||Infinity)}
export function seasonEnd(g,ord){const Ls=Object.values(g.leagues);
 ord.forEach((ids,k)=>{const n=ids.length,nv=Ls[k].def.nivel;ids.forEach((id,i)=>{const c=g.clubs[id],pos=i+1;
  ingreso(c,'tv',.3*tvAnual(g,c)*(1.6-1.2*(pos-1)/Math.max(1,n-1)));
  if(pos<=3)ingreso(c,'premios',E().premio[pos-1]*E().tv[nv-1]);
  if(k>0&&pos<=(Ls[k].def.asc??2))ingreso(c,'premios',E().asc*E().tv[nv-2]);
  const exp=[...ids].sort((a,b)=>g.clubs[b].reputacion-g.clubs[a].reputacion).indexOf(id)+1;
  const d=cl((exp-pos)/n*6,-3,3)+(k>0&&pos<=(Ls[k].def.asc??2)?2:0)+(k<Ls.length-1&&pos>n-(Ls[k+1].def.asc??2)?-2:0)+.03*(E().repCentro[nv-1]-c.reputacion);
  c.reputacion=Math.round(cl(c.reputacion+d,20,95)*10)/10})})}
export function newSeason(g){const u=g.userClubId,Z=CFG.facilities.zonas;
 for(const c of Object.values(g.clubs)){ensureClub(c,g);
  if(c.id===u){g.finHist=g.finHist||[];g.finHist.push({y:g.year-1,ing:{...c.fin.ing},gas:{...c.fin.gas}});g.finHist=g.finHist.slice(-12)}
  if(c.id!==u){c.sponsAnual=sponsAnualAI(c,g);
   if(c.presupuesto<0)c.presupuesto=Math.round(.2*(c.sponsAnual+tvAnual(g,c)));
   const tp=CFG.facilities.topePorNivel[Math.min(nivelOf(g,c),5)-1];let guard=0;
   while(guard++<3&&c.presupuesto>2.2*(wageBill(g,c.id)+staffCost(c)+mantAnual(c))){
    const z=Z.filter(x=>zl(c,x.id)<tp).sort((a,b)=>zl(c,a.id)-zl(c,b.id))[0];if(!z)break;
    const cost=zoneCost(c,z);if(c.presupuesto<cost*1.5)break;gasto(c,'obras',cost);c.zonas[z.id]++;if(z.id==='estadio')c.capacidad=Math.round(c.capacidad+.08*c.capBase)}}
  c.fin={ing:{},gas:{}};c.forma=[]}}
export const zoneCost=(c,z)=>Math.round(z.costo*(zl(c,z.id)+1)**2*Math.pow(c.reputacion/62,1.5)/1000)*1000;
