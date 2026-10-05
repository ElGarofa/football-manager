// v1.3: genera un país jugable (clubes, ligas, jugadores) a partir de data/mundo/<ISO>.json
import {nombre,pool} from './nombres.js';
const R=(a,b)=>a+Math.random()*(b-a),RI=(a,b)=>Math.floor(R(a,b+1)),C=(x,a,b)=>Math.max(a,Math.min(b,Math.round(x))),pk=a=>a[Math.random()*a.length|0];
const OFF={POR:[-15,-10,-10,-15,-35,10],DFC:[-5,-5,-8,-12,-25,8],LI:[5,5,-2,-5,-15,3],LD:[5,5,-2,-5,-15,3],MCD:[-3,-3,3,-3,-15,7],MC:[0,0,6,3,-5,0],MCO:[0,2,7,8,3,-15],MI:[5,5,3,5,-2,-8],MD:[5,5,3,5,-2,-8],EI:[8,8,0,6,3,-18],ED:[8,8,0,6,3,-18],DC:[2,3,-5,2,10,-25]};
const POS='POR POR DFC DFC DFC DFC LI LI LD LD MCD MC MC MCO MI MD EI ED DC DC'.split(' ');
export const COPAS_CONF={CONMEBOL:{lib:'Copa Libertadores',sud:'Copa Sudamericana'},UEFA:{lib:'Liga de Campeones',sud:'Liga Europa'},CONCACAF:{lib:'Liga de Campeones CONCACAF',sud:'Copa CONCACAF'},AFC:{lib:'Liga de Campeones de Asia',sud:'Copa AFC'},CAF:{lib:'Liga de Campeones de África',sud:'Copa Confederación CAF'},OFC:{lib:'Liga de Campeones de Oceanía',sud:'Copa de Oceanía'}};
const COPAS={ENG:'FA Cup',ESP:'Copa del Rey',GER:'DFB-Pokal',ITA:'Copa Italia',FRA:'Copa de Francia',POR:'Taça de Portugal',NED:'Copa KNVB',BRA:'Copa de Brasil',MEX:'Copa MX',USA:'US Open Cup',SCO:'Copa de Escocia',TUR:'Copa de Turquía',BEL:'Copa de Bélgica',ARG:'Copa Argentina',JPN:"Copa del Emperador",KOR:'Copa Corea (FA Cup)',CHN:'Copa FA de China',SAU:'Copa del Rey de Arabia',RUS:'Copa de Rusia',COL:'Copa Colombia',CHI:'Copa Chile',URU:'Copa Uruguay',PAR:'Copa Paraguay',PER:'Copa Perú',ECU:'Copa Ecuador'};
export const EXT0=1001;
const PRE_ES=['Unión','Atlético','Deportivo','Sporting','Racing','Juventud','Real','Defensores de'],SUF=['FC','United','Athletic','Rovers','City','Town','Sporting','Dynamo'];
const lat=['ES','PT'];
const FORM=['4-4-2','4-3-3','4-2-3-1','3-5-2'];
function padClubs(dv,cities,grupoCod,usados,min=8){const out=[...dv.clubes];let k=0;while(out.length<min&&k++<200){const c=cities.length?pk(cities):'Ciudad Norte';
 const es=['es','pt'].includes(grupoCod),n=es?`${pk(PRE_ES)} ${c}`:`${c} ${pk(SUF)}`;if(usados.has(n))continue;usados.add(n);out.push({n,c,r:C(R(12,26)/(dv.nivel>3?1.15:1),10,30),f:1})}return out}
export function generar(idx,P,opt={}){
 const cod=P.codigo,info=idx.continentes.flatMap(c=>c.paises).find(p=>p.codigo===cod)||{},conf=info.conf||'UEFA';
 const grupo=((pool(cod),cod));const usados=new Set(P.divisiones.flatMap(d=>d.clubes.map(c=>c.n)));
 const divs=[...P.divisiones].sort((a,b)=>a.nivel-b.nivel).filter(d=>d.clubes.length>0);
 const cities=[...new Set(divs.flatMap(d=>d.clubes.map(c=>c.c)))];
 const hermanos=idx.continentes.flatMap(c=>c.paises).filter(p=>p.conf===conf&&p.codigo!==cod).sort((a,b)=>(b.f||0)-(a.f||0));
 const vec=hermanos.slice(0,12).map(p=>p.pais);
 const clubs=[],players=[],leagues=[];let pid=1;
 divs.forEach((dv,k)=>{const lista=padClubs(dv,cities,cod.slice(0,2).includes('ES')||['ESP','MEX','COL','CHI','URU','PAR','PER','ECU','BOL','VEN','POR','BRA'].includes(cod)?'es':'x',usados);
  const L={id:'l'+(k+1),nombre:dv.nombre,nivel:k+1,pais:P.pais,clubes:[],puntos:{victoria:3,empate:1,derrota:0},diasEntreJornadas:7,inicio:'2027-02-06',asc:2};
  for(const c of lista){const cid=clubs.length+1,rep=C(c.r,12,92),ids=[];let tot=0;
   for(const pos of POS){const age=RI(18,35),ovr=C(30+rep*.55+R(-13,13),35,90),p={id:pid,clubId:cid,nombre:nombre(cod),edad:age,nacionalidad:Math.random()<.88?P.pais:pk(vec.length?vec:[P.pais]),pos,ovr,pot:Math.min(95,ovr+Math.max(0,Math.floor((27-age)*R(.5,2)))+RI(0,3))};
    OFF[pos].forEach((o,i)=>p[['vel','ace','pas','tec','tir','def'][i]]=C(ovr+o+R(-6,6),20,99));['fis','res','men'].forEach(q=>p[q]=C(ovr+R(-9,9),20,99));
    p.exp=C(25+(age-18)*3+R(-8,8),10,95);p.mor=RI(60,90);p.cond=100;p.lesion=0;
    p.val=Math.round(8000*1.16**(ovr-40)*(age<24?1.25:age<30?1:.6)/1000)*1000;p.clausula=p.val*3;
    const ln=pos==='POR'?'G':['DFC','LI','LD'].includes(pos)?'D':['EI','ED','DC'].includes(pos)?'A':'M';
    p.rasgo=Math.random()<.3?pk({A:['Goleador','Gambeteador'],M:['Pasador','Incansable','Capitán'],D:['Muro','Capitán'],G:['Reflejos']}[ln]):(Math.random()<.08?'Frágil':'');
    p.pie=pk(['Derecho','Derecho','Derecho','Derecho','Derecho','Derecho','Derecho','Izquierdo','Izquierdo','Ambidiestro']);p.sal=Math.floor(p.val*.18/1000)*1000;p.contrato=RI(2027,2030);
    players.push(p);ids.push(pid);tot+=p.val;pid++}
   L.clubes.push(cid);
   clubs.push({id:cid,nombre:c.n,ciudad:c.c,provincia:c.c,division:dv.nombre,liga:L.id,reputacion:rep,presupuesto:rep*rep*1500,valorPlantilla:tot,estadio:'Estadio de '+c.n,capacidad:Math.round(rep*rep*6+RI(0,2000)),instalaciones:Math.max(1,Math.floor(rep/9)),cuerpoTecnico:{entrenador:RI(40,80),ayudante:RI(40,80),preparadorFisico:RI(40,80)},plantilla:ids,...(c.f?{ficticio:true}:{})})}
  leagues.push(L)});
 // ascensos por tamaño (se guarda en la división de abajo)
 leagues.forEach((L,k)=>{if(!k)return;const m=Math.min(L.clubes.length,leagues[k-1].clubes.length);L.asc=m>=18?3:m>=8?2:1});
 const n1=leagues[0].clubes.length;
 // clubes de otros países (reales) para las copas continentales
 const all=opt.cont||{};let ext=(all[conf]||[]).filter(c=>c.k!==cod);
 if(ext.length<64){const otros=Object.entries(all).filter(([k])=>k!==conf).flatMap(([,v])=>v).filter(c=>c.k!==cod).sort((a,b)=>b.r-a.r);ext=ext.concat(otros.slice(0,64-ext.length))}
 const eclubs={};let seq=EXT0;for(const c of ext.slice(0,90)){const id=seq++;eclubs[id]={id,nombre:c.n,pais:c.p,cod:c.k,ciudad:c.c,provincia:c.p,liga:'ext',division:c.p,reputacion:C(c.r,25,96),cuerpoTecnico:{entrenador:60,ayudante:50,preparadorFisico:60},formacion:pk(FORM),real:true}}
 // selección nacional: rivales de la confederación y del resto del mundo
 const mundo=idx.continentes.flatMap(c=>c.paises),self=mundo.find(p=>p.codigo===cod);
 const elim=[{n:P.pais,f:0},...hermanos.slice(0,9).map(p=>({n:p.pais,f:p.f||50}))];
 const resto=mundo.filter(p=>p.conf!==conf&&(p.f||0)>=52).sort((a,b)=>b.f-a.f).slice(0,40).map(p=>({n:p.pais,f:p.f}));
 const pais={codigo:cod,nombre:P.pais,bandera:P.bandera,conf,f:self?.f||50,copa:COPAS[cod]||`Copa de ${P.pais}`,cups:COPAS_CONF[conf],slots:{lib:C(n1/5,1,4),sud:C(n1/6,1,4)},elim,resto,gen:true,vec};
 const seen=new Set(),estBase=Object.values(all).flat().filter(c=>c.k!==cod).sort((a,b)=>b.r-a.r).filter(x=>!seen.has(x.n)&&seen.add(x.n)).slice(0,70);
 return{clubs,players,leagues,pais,estBase,ext:{clubs:eclubs,seq}}}
