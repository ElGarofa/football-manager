// Simulador de prueba: node tools/simular.mjs [temporadas] [idClubUsuario]
import fs from 'fs';
import {Game} from '../js/game.js';
import {endSeason} from '../js/season.js';
import {setConfig} from '../js/config.js';
const rd=n=>JSON.parse(fs.readFileSync(new URL('../data/'+n+'.json',import.meta.url),'utf-8'));
const data=Object.fromEntries(['clubs','players','leagues','competitions','facilities','economy','sponsors','investors','scouts','ext'].map(n=>[n,rd(n)]));
setConfig(data);
const N=+process.argv[2]||5,U=+process.argv[3]||50,g=Game.create(structuredClone(data),U);g.live=false;
const sum=o=>Object.entries(o||{}).filter(([k])=>k!=='fichajes'&&k!=='ventas').reduce((s,[,v])=>s+v,0),K=x=>Math.round(x/1000);
for(let s=0;s<N;s++){let n=0;while(!g.allDone&&n++<800)g.advanceDay();
 const out=[];
 for(const L of Object.values(g.leagues)){const cs=L.ids.map(i=>g.clubs[i]),net=cs.map(c=>sum(c.fin.ing)-sum(c.fin.gas)),pp=cs.map(c=>c.presupuesto);
  const avg=a=>a.reduce((x,y)=>x+y,0)/a.length,cat=(t,k)=>K(avg(cs.map(c=>c.fin[t][k]||0)));
  out.push(`${L.def.nivel}: net ${K(avg(net))}K [${K(Math.min(...net))}..${K(Math.max(...net))}] ppto ${K(avg(pp))}K min ${K(Math.min(...pp))}K neg ${pp.filter(x=>x<0).length} rep ${avg(cs.map(c=>c.reputacion)).toFixed(0)} | ent ${cat('ing','entradas')} spo ${cat('ing','sponsors')} tv ${cat('ing','tv')} mer ${cat('ing','merch')} pal ${cat('ing','palcos')} pre ${cat('ing','premios')} | sue ${cat('gas','sueldos')} sta ${cat('gas','staff')} man ${cat('gas','mant')} obr ${cat('gas','obras')}`)}
 console.log('Temporada',g.year);console.log(out.join('\n'));endSeason(g)}
const all=Object.values(g.clubs),neg=all.filter(c=>c.presupuesto<0).length;console.log('clubes con presupuesto negativo al final:',neg,'| rep min/max',Math.min(...all.map(c=>c.reputacion)),Math.max(...all.map(c=>c.reputacion)));
