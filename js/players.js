import {lineOf,pfit} from './tactics.js';
import {nombre as nombreDe} from './nombres.js';
let PAIS={cod:'ARG',nombre:'Argentina'};
export const setPais=p=>{PAIS={cod:p.codigo||'ARG',nombre:p.nombre||'Argentina'}};
export const paisActual=()=>PAIS;
const W={G:{def:.6,men:.2,fis:.1,ace:.1},D:{def:.45,fis:.2,vel:.1,men:.1,pas:.1,ace:.05},M:{pas:.35,tec:.25,res:.2,def:.1,men:.1},A:{tir:.35,tec:.25,vel:.15,ace:.1,pas:.15}};
export const lineRating=(p,l)=>{let s=0;for(const k in W[l])s+=p[k]*W[l][k];return s};
export const effective=(p,slot)=>lineRating(p,lineOf(slot))*pfit(p,slot)*(.85+.15*p.mor/100)*(.7+.3*p.cond/100);
export const fmt=n=>{const a=Math.abs(n);return(n<0?'-$':'$')+(a>=1e6?(a/1e6).toFixed(2)+'M':Math.round(a/1e3)+'K')};
export const marketValue=p=>Math.round(8000*1.16**(p.ovr-40)*(p.edad<24?1.25:p.edad<30?1:.6)/1000)*1000;
const C=(x,a,b)=>Math.max(a,Math.min(b,Math.round(x))),R=(a,b)=>a+Math.random()*(b-a),pk=s=>{const a=s.split(' ');return a[Math.floor(Math.random()*a.length)]};
const OFF={POR:[-15,-10,-10,-15,-35,10],DFC:[-5,-5,-8,-12,-25,8],LI:[5,5,-2,-5,-15,3],LD:[5,5,-2,-5,-15,3],MCD:[-3,-3,3,-3,-15,7],MC:[0,0,6,3,-5,0],MCO:[0,2,7,8,3,-15],MI:[5,5,3,5,-2,-8],MD:[5,5,3,5,-2,-8],EI:[8,8,0,6,3,-18],ED:[8,8,0,6,3,-18],DC:[2,3,-5,2,10,-25]};
export function mkPlayer(id,clubId,rep,pos,boost=0){const ovr=C(24+rep*.55+R(-6,6)+boost,30,82),p={id,clubId,nombre:PAIS.cod==='ARG'?pk('Lucas Mateo Tomás Franco Nicolás Agustín Bruno Joaquín Santiago Ramiro Facundo Gonzalo')+' '+pk('Acosta Benítez Cabrera Domínguez Escobar Figueroa Godoy Herrera Ibarra Juárez Luna Medina'):nombreDe(PAIS.cod),edad:C(R(17,19),17,19),nacionalidad:PAIS.nombre,pos,ovr,pot:C(ovr+R(5,20)+boost/2,ovr,95),exp:C(R(10,30),10,30),mor:70,cond:100,lesion:0,contrato:0,rasgo:'',pie:'Derecho'};
 ['vel','ace','pas','tec','tir','def'].forEach((k,i)=>p[k]=C(ovr+OFF[pos][i]+R(-6,6),20,99));['fis','res','men'].forEach(k=>p[k]=C(ovr+R(-9,9),20,99));p.val=marketValue(p);p.clausula=p.val*3;p.sal=Math.floor(p.val*.18/1000)*1000;return p}
