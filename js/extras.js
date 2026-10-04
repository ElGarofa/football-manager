// v1.0: estadísticas de carrera, logros, récords, resumen de temporada y sonido
import {squadOf} from './clubs.js';
import {fmt} from './players.js';
const U=g=>g.clubs[g.userClubId];

export function init(g){g.stats=g.stats||{pj:0,v:0,e:0,d:0,gf:0,gc:0,racha:0,inv:0,maxInv:0,goleada:0,subidos:0,temporadas:0,t:{liga:0,copa:0,lib:0,sud:0,asc:0,desc:0}};
 g.stats.t=g.stats.t||{liga:0,copa:0,lib:0,sud:0,asc:0,desc:0};g.logros=g.logros||{};g.rec=g.rec||{goleada:null,derrota:null};g.resumen=g.resumen||null;g.idolos=g.idolos||[]}

// se llama por cada partido (liga o copa) del club del usuario
export function partido(g,r){const u=g.userClubId;if(r.h!==u&&r.a!==u)return;const s=g.stats,gf=r.h===u?r.hg:r.ag,gc=r.h===u?r.ag:r.hg,rv=g.clubs[r.h===u?r.a:r.h]?.nombre||g.ext?.clubs[r.h===u?r.a:r.h]?.nombre||'?';
 s.pj++;s.gf+=gf;s.gc+=gc;if(gf>gc){s.v++;s.racha++;s.inv++;if(gf-gc>s.goleada)s.goleada=gf-gc;if(!g.rec.goleada||gf-gc>g.rec.goleada.dif)g.rec.goleada={dif:gf-gc,txt:`${gf}-${gc} ante ${rv}`,y:g.year}}
 else if(gf===gc){s.e++;s.racha=0;s.inv++}else{s.d++;s.racha=0;s.inv=0;if(!g.rec.derrota||gc-gf>g.rec.derrota.dif)g.rec.derrota={dif:gc-gf,txt:`${gf}-${gc} ante ${rv}`,y:g.year}}
 s.maxInv=Math.max(s.maxInv,s.inv);s.maxRacha=Math.max(s.maxRacha||0,s.racha);
 for(const[id]of r.played||[]){const p=g.players[id];if(p&&p.clubId===u)p.cpj=(p.cpj||0)+1}for(const id of r.gl||[]){const p=g.players[id];if(p&&p.clubId===u)p.cgol=(p.cgol||0)+1}
 chequear(g)}

export const LOGROS=[
 ['v1','Primera victoria','Ganá tu primer partido.',g=>g.stats.v>=1],
 ['v25','Ganador','25 victorias en tu carrera.',g=>g.stats.v>=25],
 ['v100','Centenario','100 victorias.',g=>g.stats.v>=100],
 ['pj300','Veterano del banco','Dirigí 300 partidos.',g=>g.stats.pj>=300],
 ['gol5','Goleada','Ganá por 4 goles de diferencia o más.',g=>g.stats.goleada>=4],
 ['inv10','Invicto','10 partidos sin perder.',g=>g.stats.maxInv>=10],
 ['rach7','Racha ganadora','7 victorias seguidas.',g=>(g.stats.maxRacha||0)>=7],
 ['liga','Campeón','Ganá un campeonato de liga.',g=>g.stats.t.liga>=1],
 ['liga3','Dinastía','Ganá 3 campeonatos.',g=>g.stats.t.liga>=3],
 ['asc','Ascenso','Conseguí un ascenso.',g=>g.stats.t.asc>=1],
 ['copa','Copero','Ganá la Copa Argentina.',g=>g.stats.t.copa>=1],
 ['lib','Gloria de América','Ganá la Copa Libertadores.',g=>g.stats.t.lib>=1],
 ['sud','Sudamericano','Ganá la Copa Sudamericana.',g=>g.stats.t.sud>=1],
 ['cantera','Semillero','Subí 5 juveniles al plantel.',g=>g.stats.subidos>=5],
 ['lic','Entrenador Pro','Obtené la Licencia Pro.',g=>(g.dt?.lic||0)>=4],
 ['rich','Club rico','Llegá a 50 millones de presupuesto.',g=>U(g).presupuesto>=5e7],
 ['est','Estadio nuevo','Inaugurá un estadio nuevo.',g=>!!g.flags?.estadioNuevo],
 ['mundo','Campeón del mundo','Argentina gana el Mundial con vos como DT.',g=>(g.sel?.hist||[]).some(h=>h.arg==='Campeón')],
 ['temp10','Larga carrera','Completá 10 temporadas.',g=>g.stats.temporadas>=10],
 ['europa','Exportador','Vendé un jugador a Europa.',g=>(g.europa||[]).length>=1],
 ['desafio','Misión cumplida','Completá un desafío.',g=>!!g.desafio?.ok]];
export function chequear(g){for(const[id,n,d,f]of LOGROS){if(g.logros[id])continue;let ok=false;try{ok=f(g)}catch(e){}if(ok){g.logros[id]=g.date;g.news.push(`🏅 Logro: ${n}`);g.nuevoLogro=n}}}

// cierre de temporada: títulos y resumen
export function cierre(g,res){const s=g.stats;s.temporadas++;if(res.champ)s.t.liga++;if(res.promoted)s.t.asc++;if(res.relegated)s.t.desc++;if(res.copa)s.t.copa++;if(res.libCampeon)s.t.lib++;if(res.sudCampeon)s.t.sud++;
 const sq=squadOf(g,g.userClubId),gl=[...sq].sort((a,b)=>(b.gol||0)-(a.gol||0))[0],c=U(g),ing=Object.values(c.fin.ing).reduce((a,b)=>a+b,0),gas=Object.values(c.fin.gas).reduce((a,b)=>a+b,0);
 g.resumen={y:g.year,pos:res.pos,div:res.div,champ:res.champ,promoted:res.promoted,relegated:res.relegated,copa:res.copa,ok:res.ok,goleador:gl&&gl.gol?`${gl.nombre} (${gl.gol})`:'—',ing,gas,ppto:c.presupuesto,logros:Object.keys(g.logros).length}
 // ídolos: jugadores con mucha historia en el club
 for(const p of sq){if((p.cpj||0)>=120&&!g.idolos.some(i=>i.id===p.id))g.idolos.push({id:p.id,nombre:p.nombre,pj:p.cpj,gol:p.cgol||0,pos:p.pos,y:g.year})}
 chequear(g)}

// ---------- sonido (WebAudio, sin archivos) ----------
let ctx=null;const on=()=>{try{return localStorage.getItem('fm_sound')!=='0'}catch(e){return true}};
export const soundOn=on;
export function setSound(v){try{localStorage.setItem('fm_sound',v?'1':'0')}catch(e){}}
const ac=()=>{if(!ctx){try{ctx=new (window.AudioContext||window.webkitAudioContext)()}catch(e){return null}}if(ctx.state==='suspended')ctx.resume();return ctx};
function tone(f,t0,d,type='sine',vol=.12){const c=ac();if(!c)return;const o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(0,c.currentTime+t0);g.gain.linearRampToValueAtTime(vol,c.currentTime+t0+.02);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+t0+d);o.connect(g).connect(c.destination);o.start(c.currentTime+t0);o.stop(c.currentTime+t0+d+.05)}
function noise(d,vol=.06){const c=ac();if(!c)return;const n=c.sampleRate*d,b=c.createBuffer(1,n,c.sampleRate),a=b.getChannelData(0);for(let i=0;i<n;i++)a[i]=(Math.random()*2-1)*(1-i/n);const s=c.createBufferSource(),g=c.createGain(),f=c.createBiquadFilter();f.type='bandpass';f.frequency.value=900;g.gain.value=vol;s.buffer=b;s.connect(f).connect(g).connect(c.destination);s.start()}
export function sonido(k){if(!on())return;try{
 if(k==='gol'){noise(1.6,.09);[523,659,784,1047].forEach((f,i)=>tone(f,i*.09,.35,'triangle',.1))}
 else if(k==='pito'){tone(2900,0,.25,'square',.04);tone(2900,.3,.5,'square',.04)}
 else if(k==='tarjeta'){tone(330,0,.15,'square',.05)}
 else if(k==='ok'){tone(660,0,.1,'sine',.06);tone(880,.08,.14,'sine',.06)}
 else if(k==='logro'){[659,784,988,1319].forEach((f,i)=>tone(f,i*.1,.4,'triangle',.09))}
 else if(k==='click')tone(520,0,.05,'sine',.03)}catch(e){}}
