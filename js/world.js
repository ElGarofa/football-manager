// Mundo vivo y tácticas (v0.9e): clima, plan semanal, entrenamiento individual, pelota parada,
// análisis del rival, plan B, socios, elecciones, clásicos, barras, estadio, eventos y quiebras.
import {addDays} from './league.js';
import {squadOf} from './clubs.js';
import {fmt,mkPlayer} from './players.js';
import {ingreso,gasto,refPrice,zl,ensureClub,topeSalarial,ingresoProy} from './finance.js';
const R=(a,b)=>a+Math.random()*(b-a),C=(x,a,b)=>Math.max(a,Math.min(b,x)),pk=a=>a[Math.random()*a.length|0],U=g=>g.clubs[g.userClubId];
const hash=s=>{let h=2166136261;for(const ch of s){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return(h>>>0)/4294967296};

// ---------- clima y cancha ----------
export const CLIMAS={Despejado:{gol:1,fat:1,ic:'☀️'},Nublado:{gol:1,fat:.98,ic:'☁️'},Lluvia:{gol:.93,fat:1.06,ic:'🌧️'},Tormenta:{gol:.88,fat:1.1,ic:'⛈️'},Calor:{gol:.97,fat:1.18,ic:'🥵'},Frío:{gol:.98,fat:.96,ic:'🥶'},Viento:{gol:.95,fat:1,ic:'💨'},Niebla:{gol:.97,fat:1,ic:'🌫️'}};
export function climaDe(date,c){const m=+date.slice(5,7),x=hash(date+(c?.provincia||'')),inv=m>=6&&m<=8,ver=m==12||m<=2;
 const t=inv?[['Frío',.25],['Nublado',.2],['Niebla',.1],['Lluvia',.15],['Despejado',.25],['Viento',.05]]:ver?[['Calor',.3],['Despejado',.3],['Tormenta',.12],['Lluvia',.1],['Nublado',.13],['Viento',.05]]:[['Despejado',.3],['Nublado',.22],['Lluvia',.2],['Viento',.1],['Niebla',.08],['Frío',.05],['Tormenta',.05]];
 let a=0;for(const[k,p]of t){a+=p;if(x<a)return k}return'Despejado'}
export const canchaTxt=v=>v>=80?'Excelente':v>=65?'Buena':v>=50?'Regular':'Mala';
export function climaFor(g,id){const c=g.clubs[id];if(!c)return null;const n=climaDe(g.date,c),b=CLIMAS[n],cn=c.cancha??80,mal=Math.max(0,(65-cn)/65);
 return{nombre:`${b.ic} ${n} · cancha ${canchaTxt(cn).toLowerCase()}`,gol:b.gol*(1-.08*mal),fat:b.fat*(1+.12*mal)}}
export const pronostico=(g,id,date)=>{const d=Math.round((new Date(date)-new Date(g.date))/864e5);return d<=3?{n:climaDe(date,g.clubs[id]),seguro:true}:{n:climaDe(date,g.clubs[id]),seguro:false}};

// ---------- plan semanal y entrenamiento ----------
export const FOCOS=['Equilibrado','Físico','Técnico','Táctico','Pelota parada','Descanso'];
export const DIAS=['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
export const TRAITS={Gambeteador:'Gambeteador',Pasador:'Pasador',Muro:'Muro',Reflejos:'Reflejos',Goleador:'Goleador'};
export const ATTR={vel:'Velocidad',ace:'Aceleración',pas:'Pase',tec:'Técnica',tir:'Tiro',def:'Defensa',fis:'Físico',res:'Resistencia',men:'Mentalidad'};
export function init(g){if(g.mundo)return;const c=U(g);
 g.mundo={plan:null,planes:{},famil:50,famForm:g.tactic?.formacion,ppSkill:30,pp:{},planB:null,rivalAna:null,pres:{nom:pk(['Rodolfo','Héctor','Ernesto','Daniel','Claudio','Gustavo','Marcelo'])+' '+pk(['Ferrari','Bianchi','Lombardi','Sosa','Medina','Ortiz','Pereyra']),perfil:pk(['Austero','Gastador','Ambicioso','Estable']),desde:g.year,hasta:g.year+3,apoyo:60},
  barra:{poder:30,tension:20,pedidos:0},proy:null,eventos:[],quiebras:{},log:[]};
 sociosInit(c,g)}
export function reset(g){const m=g.mundo;m.plan=null;m.famil=50;m.pp={};m.planB=null;m.rivalAna=null;m.proy=null;m.eventos=[];m.barra={poder:30,tension:20,pedidos:0};m.pres.apoyo=60;sociosInit(U(g),g);for(const p of Object.values(g.players))delete p.entr}
const M=g=>g.mundo;
export function sociosInit(c,g){if(c.socios==null){c.socios=Math.round(c.capacidad*(.12+.25*c.reputacion/100));c.cuota=1}if(c.cancha==null)c.cancha=Math.round(R(65,85))}
export const cuotaBase=(g,c)=>refPrice(g,c)*4;
export const sociosObj=(g,c)=>{const f=(c.forma||[]).reduce((s,x)=>s+(x==='V'?3:x==='E'?1:0),0)/Math.max(1,(c.forma||[]).length*3||1);return Math.round(c.capacidad*(.12+.25*c.reputacion/100)*(.9+.2*f)*Math.pow(1/(c.cuota||1),1.3)*(g.afic!=null&&c.id===g.userClubId?.85+g.afic/330:1))};
export function setCuota(g,x){const c=U(g);c.cuota=C(Math.round(x*100)/100,.6,1.6);return`Cuota societaria: ${Math.round(c.cuota*100)}% del valor de referencia`}
export function setPlan(g,plan){M(g).plan=plan}
export const planActual=g=>M(g).plan;
export function guardarPlan(g,n){if(!n)return'Poné un nombre';M(g).planes[n]=[...(M(g).plan||Array(7).fill(g.training))];return`Plan "${n}" guardado`}
export function cargarPlan(g,n){const p=M(g).planes[n];if(p)M(g).plan=[...p]}
export function entrenarInd(g,pid,spec){const p=g.players[pid];if(!p||p.clubId!==g.userClubId)return'Jugador inválido';
 const n=squadOf(g,g.userClubId).filter(x=>x.entr&&x.id!==pid).length;if(spec&&n>=3)return'Máximo 3 jugadores con plan individual';
 if(!spec){delete p.entr;return`${p.nombre}: plan individual cancelado`}
 if(spec.t==='pos'&&spec.pos===p.pos)return'Ya es su posición';if(spec.t==='rasgo'&&p.rasgo==='Capitán')return'El capitán conserva su rasgo';
 p.entr={...spec,prog:0};return`${p.nombre} empieza a entrenar ${spec.t==='attr'?ATTR[spec.k]:spec.t==='pos'?'como '+spec.pos:'el rasgo '+spec.r}`}
const meta=p=>p.entr.t==='attr'?(p.edad<=21?20:28):p.entr.t==='pos'?60:90;
function indDia(g){const t=g.cuerpo?.Táctico?.nivel||0;
 for(const p of squadOf(g,g.userClubId)){const e=p.entr;if(!e)continue;if(p.lesion>0)continue;e.prog+=1+(p.mor>75?.3:0)+t/300;
  if(e.prog<meta(p))continue;e.prog=0;
  if(e.t==='attr'){if(p[e.k]<Math.min(99,p.pot+10)){p[e.k]++;g.news.push(`📈 ${p.nombre} mejoró su ${ATTR[e.k].toLowerCase()} (${p[e.k]})`)}else{delete p.entr;g.news.push(`${p.nombre} llegó a su techo en ${ATTR[e.k].toLowerCase()}`)}}
  else if(e.t==='pos'){p.pos2=e.pos;delete p.entr;g.news.push(`🔁 ${p.nombre} ya puede jugar de ${e.pos}`)}
  else{p.rasgo=e.r;delete p.entr;g.news.push(`⭐ ${p.nombre} desarrolló el rasgo ${e.r}`)}}}
// pelota parada
export function setEncargado(g,k,id){M(g).pp[k]=id||null}
export function encargados(g){const xi=g.lineup.xi.map(i=>g.players[i]),m=M(g).pp,ok=k=>xi.find(p=>p.id==m[k]&&p.pos!=='POR')?m[k]:null;return{corner:ok('corner'),libre:ok('libre'),penal:ok('penal')}}
export const ppNivel=g=>C(.85+M(g).ppSkill/250+(g.cuerpo?.['Pelota parada']?.nivel||0)/400,.8,1.45);
// rival
export function proxRival(g){const L=g.league,u=g.userClubId;for(let j=L.j;j<L.fixtures.length;j++){const m=L.fixtures[j].find(x=>x.h==u||x.a==u);if(m)return{id:m.h==u?m.a:m.h,local:m.h==u,fecha:L.date(j),j}}return null}
export function analisis(g){const r=proxRival(g);if(!r)return null;const c=g.clubs[r.id],sq=squadOf(g,r.id).sort((a,b)=>b.ovr-a.ovr),n=g.cuerpo?.Táctico?.nivel||0,noise=Math.round((1-Math.min(.95,.45+n/140+(c.cuerpoTecnico?0:0)))*8);
 const f=c.formacion,men=c.reputacion>75?'Ofensiva':c.reputacion<55?'Defensiva':'Equilibrada',ov=x=>Math.max(30,x+Math.round(R(-noise,noise)));
 const clave=sq.slice(0,3).map(p=>({id:p.id,nombre:p.nombre,pos:p.pos,ovr:ov(p.ovr)})),arq=sq.find(p=>p.pos==='POR');
 const mi=squadOf(g,g.userClubId).sort((a,b)=>b.ovr-a.ovr).slice(0,14),prom=a=>a.reduce((s,p)=>s+p.ovr,0)/(a.length||1);
 const dbl=sq.filter(p=>['DFC','LI','LD'].includes(p.pos)).slice(0,4),atk=sq.filter(p=>['DC','EI','ED','MCO'].includes(p.pos)).slice(0,3);
 const tips=[];if(prom(dbl)<prom(atk)-4)tips.push('Su defensa es débil: presioná alto y atacá por las bandas.');if(prom(atk)<prom(dbl)-4)tips.push('Ataca poco: podés adelantar la línea.');if(c.reputacion>g.clubs[g.userClubId].reputacion+8)tips.push('Es superior: una mentalidad defensiva y contraataque puede servir.');else if(c.reputacion<g.clubs[g.userClubId].reputacion-8)tips.push('Sos favorito: tomá la iniciativa y presionalo.');if(arq&&arq.ovr<62)tips.push('Su arquero es inseguro: probá tiros de media distancia.');
 return{rival:r,club:c.nombre,formacion:f,mentalidad:men,clave,forma:(c.forma||[]).join(' '),tips:tips.length?tips:['Sin puntos débiles claros: jugá tu partido.'],fiable:noise<=3,hecho:M(g).rivalAna===r.id}}
export function analizar(g){const r=proxRival(g);if(!r)return'No hay próximo partido';if(M(g).rivalAna===r.id)return'Ya analizaste a este rival';const costo=Math.round(U(g).reputacion*400/1000)*1000;if(U(g).presupuesto<costo)return'Presupuesto insuficiente';gasto(U(g),'scouting',costo);M(g).rivalAna=r.id;return`Informe de ${g.clubs[r.id].nombre} listo (+bonus táctico para ese partido, costo ${fmt(costo)})`}
// plan B
export function setPlanB(g,pb){M(g).planB=pb}
// extras que consume Game.setup
export function userExtras(g){const m=M(g),r=proxRival(g),fam=1+Math.max(-.02,(m.famil-40)/1500),ana=r&&m.rivalAna===r.id?1.01+(g.cuerpo?.Táctico?.nivel||0)/6000:1,k=fam*ana;
 return{mx:{att:k,mid:k,def:k},pp:ppNivel(g),enc:encargados(g),planB:m.planB&&m.planB.on?m.planB:null}}

// ---------- tick diario ----------
export function tick(g){const m=M(g);if(!m)return;const c=U(g),dow=new Date(g.date+'T12:00:00').getDay();
 if(m.plan&&m.plan[dow]){g.training=m.plan[dow]==='Táctico'||m.plan[dow]==='Pelota parada'?'Equilibrado':m.plan[dow];const f=m.plan[dow];
  if(f==='Táctico')m.famil=Math.min(100,m.famil+1.3+(g.cuerpo?.Táctico?.nivel||0)/120);else if(f==='Pelota parada')m.ppSkill=Math.min(100,m.ppSkill+1.1+(g.cuerpo?.['Pelota parada']?.nivel||0)/150)}
 if(g.tactic.formacion!==m.famForm){m.famil*=.65;m.famForm=g.tactic.formacion}
 m.famil=Math.max(20,m.famil-.15);m.ppSkill=Math.max(15,m.ppSkill-.08);
 indDia(g);
 // cancha y socios (todos los clubes, barato)
 for(const k of Object.values(g.clubs)){sociosInit(k,g);const cl=CLIMAS[climaDe(g.date,k)];if(cl===CLIMAS.Lluvia||cl===CLIMAS.Tormenta)k.cancha=Math.max(25,k.cancha-1.5);else k.cancha=Math.min(95,k.cancha+.25+.07*zl(k,'estadio'));
  k.socios+=(sociosObj(g,k)-k.socios)*.012;const J=g.league.fixtures.length;if(k.liga&&g.leagues[k.liga])ingreso(k,'cuotas',k.socios*cuotaBase(g,k)*(k.cuota||1)/365)}
 proyDia(g);barraDia(g);presDia(g);
 if(Math.random()<.012&&m.eventos.length<2)lanzarEvento(g)}

// ---------- estadio ----------
export const costoAmpliar=(g,c=U(g))=>Math.round(c.capacidad*.1*refPrice(g,c)*40/10000)*10000;
export const costoNuevo=(g,c=U(g))=>Math.round(c.capacidad*1.35*refPrice(g,c)*30/10000)*10000;
export function proyectar(g,tipo){const m=M(g),c=U(g);if(m.proy)return'Ya hay una obra en marcha';
 const costo=tipo==='nuevo'?costoNuevo(g):costoAmpliar(g),up=tipo==='nuevo'?.25:1;if(c.presupuesto<costo*up)return`Necesitás ${fmt(costo*up)} para arrancar`;
 if(tipo==='nuevo'&&c.reputacion<45)return'La directiva no autoriza un estadio nuevo para un club de tu tamaño';
 if(tipo==='nuevo'&&g.confianza<50)return'La directiva no confía lo suficiente en vos para esa obra';
 gasto(c,'estadio',costo*up);m.proy={tipo,costo,pagado:costo*up,ini:g.date,fin:addDays(g.date,tipo==='nuevo'?540:150),cap:Math.round(c.capacidad*(tipo==='nuevo'?1.35:1.1))};
 g.news.push(`🏟️ Arrancó ${tipo==='nuevo'?'la construcción del nuevo estadio':'la ampliación del estadio'}`);return'Obra iniciada'}
function proyDia(g){const m=M(g),p=m.proy;if(!p)return;const c=U(g),tot=Math.max(1,(new Date(p.fin)-new Date(p.ini))/864e5);
 if(p.tipo==='nuevo'){const d=p.costo*.75/tot;gasto(c,'estadio',d);p.pagado+=d}
 if(g.date>=p.fin){c.capacidad=p.cap;if(p.tipo==='nuevo'){g.flags=g.flags||{};g.flags.estadioNuevo=true;c.reputacion=Math.min(95,c.reputacion+3);c.zonas.palcos=Math.min(10,(c.zonas.palcos||1)+1);c.cancha=95}g.news.push(`🎉 ¡Se inauguró ${p.tipo==='nuevo'?'el nuevo estadio':'la ampliación'}! Capacidad: ${p.cap.toLocaleString('es-AR')}`);m.proy=null}}

// ---------- barras ----------
function barraDia(g){const b=M(g).barra;b.tension=C(b.tension+(g.afic!=null?(55-g.afic)*.004:0)-.02,0,100);
 if(b.tension>70&&Math.random()<.004){b.tension=45;const mul=Math.round(U(g).reputacion*900/1000)*1000;gasto(U(g),'sanciones',mul);g.afic=C((g.afic||60)-6,0,100);g.news.push(`🚨 Incidentes de la barra en el estadio: multa de ${fmt(mul)}`)}}

// ---------- elecciones ----------
export const PERFIL_TXT={Austero:'Cuida cada peso: no da refuerzos, pero valora la estabilidad.',Gastador:'Abre la billetera: refuerzo extra al asumir, pero exige resultados.',Ambicioso:'Quiere pelear arriba: objetivos más exigentes, premios mayores.',Estable:'Sin sobresaltos: relación tranquila.'};
function presDia(g){const p=M(g).pres;p.apoyo=C(p.apoyo+(g.confianza-60)*.002+(g.afic!=null?(g.afic-60)*.002:0),0,100)}
export function elecciones(g){const p=M(g).pres;if(g.year<p.hasta)return;const c=U(g);const gana=Math.random()<.35+p.apoyo/150;
 if(gana){p.hasta=g.year+3;g.news.push(`🗳️ Elecciones en ${c.nombre}: ${p.nom} fue reelecto presidente`)}
 else{const old=p.nom;p.nom=pk(['Alberto','Raúl','Fabián','Sergio','Osvaldo','Néstor','Diego'])+' '+pk(['Acosta','Barrios','Cabrera','Duarte','Fuentes','Giménez','Herrera']);p.perfil=pk(['Austero','Gastador','Ambicioso','Estable']);p.desde=g.year;p.hasta=g.year+3;p.apoyo=55;
  g.news.push(`🗳️ Elecciones en ${c.nombre}: ganó ${p.nom} (perfil ${p.perfil.toLowerCase()}) y reemplaza a ${old}`);g.confianza=C(g.confianza-10,0,100);
  if(p.perfil==='Gastador'){const m=Math.round(ingresoProy(g,c)*.08/10000)*10000;ingreso(c,'directiva',m);g.news.push(`💰 El nuevo presidente aporta ${fmt(m)} para refuerzos`)}
  if(p.perfil==='Estable')g.confianza=C(g.confianza+8,0,100)}}

// ---------- clásicos ----------
const PARES=[['River','Boca'],['Independiente','Racing'],['San Lorenzo','Huracán'],['Newell','Rosario Central'],['Estudiantes (LP)','Gimnasia (LP)'],['Talleres','Belgrano'],['Colón','Unión'],['Vélez','Ferro'],['Lanús','Banfield'],['Chacarita','Platense'],['Nueva Chicago','Almirante Brown'],['San Martín (Tucumán)','Atlético Tucumán']];
export function esClasico(g,a,b){const A=g.clubs[a],B=g.clubs[b];if(!A||!B)return false;if(PARES.some(([x,y])=>(A.nombre.includes(x)&&B.nombre.includes(y))||(A.nombre.includes(y)&&B.nombre.includes(x))))return true;return A.ciudad===B.ciudad&&A.ciudad!=='Buenos Aires'&&Math.abs(A.reputacion-B.reputacion)<14}
export function partido(g,r){const u=g.userClubId;const h=g.clubs[r.h];if(h)h.cancha=Math.max(25,(h.cancha??80)-2.5);
 if(r.h!=u&&r.a!=u)return;const rv=r.h==u?r.a:r.h;if(!esClasico(g,u,rv))return;const s=Math.sign((r.h==u?r.hg-r.ag:r.ag-r.hg)),n=g.clubs[rv].nombre;
 g.afic=C((g.afic||60)+s*9,0,100);M(g).barra.tension=C(M(g).barra.tension+(s<0?14:-6),0,100);g.confianza=C(g.confianza+s*3,0,100);
 for(const p of squadOf(g,u))if(r.played.some(([i])=>i==p.id))p.mor=C(p.mor+s*3,20,100);
 g.news.push(s>0?`🔥 ¡Ganaste el clásico ante ${n}! Los hinchas están eufóricos.`:s<0?`😡 Perdiste el clásico ante ${n}. El humor del hincha cae.`:`🔥 Clásico ante ${n}: empate.`);
 if(s<0&&M(g).barra.tension>55)g.news.push('⚠️ La barra está caliente tras el clásico.')}

// ---------- eventos aleatorios ----------
const U_ =g=>U(g);
export const EVT={
 amistoso:{t:'Amistoso en el exterior',txt:g=>`Una empresa ofrece ${fmt(Math.round(ingresoProy(g,U(g))*.03/10000)*10000)} por una gira de amistosos. Cansa al plantel.`,op:[['Aceptar',g=>{ingreso(U(g),'amistosos',Math.round(ingresoProy(g,U(g))*.03/10000)*10000);squadOf(g,g.userClubId).forEach(p=>p.cond=Math.max(40,p.cond-12));return'La gira dejó dinero y cansancio.'}],['Rechazar',g=>'Declinaste la invitación.']]},
 donacion:{t:'Socio benefactor',txt:g=>'Un socio histórico quiere donar al club a cambio de ser homenajeado en la tribuna.',op:[['Aceptar el homenaje',g=>{ingreso(U(g),'donaciones',Math.round(U(g).reputacion*3000/1000)*1000);g.afic=C((g.afic||60)+3,0,100);return'La donación llegó y la tribuna aplaudió.'}],['Agradecer sin homenaje',g=>{ingreso(U(g),'donaciones',Math.round(U(g).reputacion*1500/1000)*1000);return'Se aceptó una donación menor.'}]]},
 barras:{t:'Pedido de la barra',txt:g=>'Referentes de la barra piden entradas y viajes pagos para la próxima fecha.',op:[['Ceder',g=>{gasto(U(g),'barras',Math.round(U(g).reputacion*500/1000)*1000);M(g).barra.tension=C(M(g).barra.tension-18,0,100);M(g).barra.poder=C(M(g).barra.poder+5,0,100);return'La barra se calma, pero gana poder.'}],['Negarse',g=>{M(g).barra.tension=C(M(g).barra.tension+16,0,100);M(g).barra.poder=C(M(g).barra.poder-3,0,100);return'Dijiste que no. La tensión sube.'}]]},
 intendente:{t:'El intendente ofrece obras',txt:g=>'El municipio ofrece mejorar los accesos al estadio si el club aporta una parte.',op:[['Aportar',g=>{const m=Math.round(U(g).reputacion*2000/1000)*1000;if(U(g).presupuesto<m)return'No te alcanzó el presupuesto.';gasto(U(g),'obras',m);U(g).cancha=Math.min(95,U(g).cancha+10);g.afic=C((g.afic||60)+2,0,100);return'Se mejoró el estadio y la relación con el municipio.'}],['Pasar',g=>'No hubo acuerdo.']]},
 viral:{t:'Jugador viral',txt:g=>{const p=pk(squadOf(g,g.userClubId));g._ev=p.id;return`${p.nombre} se volvió viral en redes por un video. ¿Aprovechás?`},op:[['Campaña de merchandising',g=>{const p=g.players[g._ev];ingreso(U(g),'merch',Math.round(U(g).reputacion*1800/1000)*1000);if(p)p.mor=C(p.mor+4,20,100);return'La camiseta se vendió como pan caliente.'}],['Que se concentre',g=>{const p=g.players[g._ev];if(p)p.mor=C(p.mor+2,20,100);return'Pidió disculpas por la distracción.'}]]},
 auditoria:{t:'Auditoría fiscal',txt:g=>'El fisco audita al club. Podés regularizar ahora o discutirlo.',op:[['Regularizar',g=>{gasto(U(g),'impuestos',Math.round(U(g).reputacion*1200/1000)*1000);return'Se pagó la deuda.'}],['Discutir',g=>{if(Math.random()<.5){gasto(U(g),'impuestos',Math.round(U(g).reputacion*3000/1000)*1000);return'Perdiste: multa mayor.'}return'Ganaste el reclamo, sin costo.'}]]},
 sponsorLocal:{t:'Sponsor local',txt:g=>'Un comercio del barrio ofrece publicidad en la tribuna popular.',op:[['Firmar',g=>{ingreso(U(g),'sponsors',Math.round(U(g).reputacion*2500/1000)*1000);return'Cobraste un aporte extra.'}],['Rechazar',g=>'Preferiste esperar algo mejor.']]},
 homenaje:{t:'Homenaje a un ídolo',txt:g=>'Los hinchas piden un partido homenaje para un ídolo retirado.',op:[['Organizarlo',g=>{gasto(U(g),'eventos',Math.round(U(g).reputacion*400/1000)*1000);g.afic=C((g.afic||60)+6,0,100);return'Una noche emotiva.'}],['No',g=>{g.afic=C((g.afic||60)-3,0,100);return'Algunos hinchas se molestaron.'}]]},
 temporal:{t:'Temporal en el estadio',txt:g=>'Un temporal dañó parte de la tribuna.',op:[['Reparar ya',g=>{gasto(U(g),'obras',Math.round(U(g).reputacion*1800/1000)*1000);return'Reparación urgente hecha.'}],['Reparar de a poco',g=>{U(g).cancha=Math.max(25,U(g).cancha-10);g.afic=C((g.afic||60)-2,0,100);return'Se arregla de a poco; el estadio luce peor.'}]]}};
export function lanzarEvento(g){const m=M(g),k=pk(Object.keys(EVT).filter(x=>!m.eventos.some(e=>e.key===x)));m.eventos.push({id:++g.seq,key:k,fecha:g.date,txt:EVT[k].txt(g)});g.news.push(`📩 ${EVT[k].t}: hay una decisión pendiente`)}
export function resolverEvento(g,id,i){const m=M(g),e=m.eventos.find(x=>x.id===id);if(!e)return'';const r=EVT[e.key].op[i][1](g);m.eventos=m.eventos.filter(x=>x.id!==id);g.news.push(`${EVT[e.key].t}: ${r}`);return r}

// ---------- fin de temporada: quiebras, fusiones y ascensos de la Federal ----------
const NOMBRES=[['Sportivo Ñandubay','Concordia','Entre Ríos'],['Atlético Villa Hudson','Berazategui','Buenos Aires'],['Deportivo Ceibal','Rosario','Santa Fe'],['Juventud Unida del Sur','Neuquén','Neuquén'],['Club Social Pampero','Santa Rosa','La Pampa'],['Defensores del Norte','Salta','Salta'],['Atlético Los Cardales','Campana','Buenos Aires'],['Unión Vecinal Cuyo','San Luis','San Luis'],['Rivadavia Atlético','Bahía Blanca','Buenos Aires'],['Estrella del Litoral','Corrientes','Corrientes'],['Deportivo Patagonia','Río Gallegos','Santa Cruz'],['Peñarol de Mar','Mar del Plata','Buenos Aires']];
export function cierre(g,ids,Ls){elecciones(g);const m=M(g),u=g.userClubId;let hecho=0;
 for(const c of Object.values(g.clubs)){if(c.id===u)continue;if(c.presupuesto<-Math.max(1.5e5,c.reputacion*4e3)){m.quiebras[c.id]=(m.quiebras[c.id]||0)+1}else if(m.quiebras[c.id])m.quiebras[c.id]--}
 const cand=Object.values(g.clubs).filter(c=>c.id!==u&&(m.quiebras[c.id]||0)>=2).sort((a,b)=>b.presupuesto-a.presupuesto);
 for(const c of cand.slice(0,1)){const k=Ls.findIndex(L=>L.def.id===c.liga),arr=ids[k];if(!arr)continue;const nm=pk(NOMBRES.filter(n=>!Object.values(g.clubs).some(x=>x.nombre===n[0]))),nid=Math.max(...Object.keys(g.clubs).map(Number))+1;if(!nm)continue;
  const lowest=k===Ls.length-1,partner=lowest?Object.values(g.clubs).find(x=>x.liga===c.liga&&x.id!==c.id&&x.id!==u&&arr.includes(x.id)):null,fus=partner&&Math.random()<.4;
  const players=squadOf(g,c.id).sort((a,b)=>b.ovr-a.ovr);
  if(fus){players.slice(0,5).forEach(p=>{c.plantilla=c.plantilla.filter(i=>i!==p.id);p.clubId=partner.id;partner.plantilla.push(p.id)});partner.reputacion=Math.min(95,partner.reputacion+1);g.news.push(`🏛️ ${c.nombre} se fusiona con ${partner.nombre} y desaparece de la categoría`)}
  else g.news.push(`🏛️ ${c.nombre} quebró y se retira de las competencias`);
  for(const p of squadOf(g,c.id)){p.clubId=0;c.plantilla=c.plantilla.filter(i=>i!==p.id)}
  const rep=Math.max(22,Math.min(40,Math.round(R(24,34)))),ni={id:nid,nombre:nm[0],ciudad:nm[1],provincia:nm[2],division:Ls[k].def.nombre,liga:c.liga,reputacion:rep,presupuesto:Math.round(R(.6,1.2)*(c.reputacion*3e4)),valorPlantilla:0,estadio:'Estadio de '+nm[0],capacidad:Math.round(R(3500,9000)),instalaciones:3,cuerpoTecnico:{entrenador:Math.round(R(35,55)),ayudante:Math.round(R(30,50)),preparadorFisico:Math.round(R(30,50))},plantilla:[],formacion:c.formacion};
  let pid=Math.max(...Object.keys(g.players).map(Number))+1;const TPL='POR POR DFC DFC DFC DFC LI LD MCD MC MC MCO MI MD EI ED DC DC DC MC'.split(' ');
  for(const pos of TPL){const p=mkPlayer(pid++,nid,rep,pos,0);p.contrato=g.year+Math.round(R(1,3));g.players[p.id]=p;ni.plantilla.push(p.id)}
  g.clubs[nid]=ni;ensureClub(ni,g);ni.topeSalarial=topeSalarial(g,ni);
  arr[arr.indexOf(c.id)]=nid;delete g.clubs[c.id];
  if(g.clasif)for(const q of['lib','sud']){const i=g.clasif[q].indexOf(c.id);if(i>=0){const pool=Object.values(g.clubs).filter(x=>x.liga===Ls[0].def.id&&!g.clasif.lib.includes(x.id)&&!g.clasif.sud.includes(x.id)).sort((a,b)=>b.reputacion-a.reputacion);g.clasif[q][i]=pool[0].id}}
  delete m.quiebras[c.id];hecho++;
  g.news.push(`🌱 ${ni.nombre} (${ni.ciudad}) asciende desde el Federal y se incorpora a ${Ls[k].def.nombre}`);m.log.push({y:g.year,txt:`${c.nombre} → ${ni.nombre}`})}
 return hecho}
export function alertas(g){const m=M(g);return{eventos:m.eventos.length,obra:m.proy?1:0}}
