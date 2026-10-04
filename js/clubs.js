import {CFG} from './config.js';
export const squadOf=(g,id)=>g.clubs[id].plantilla.map(i=>g.players[i]);
export const squadValue=(g,id)=>squadOf(g,id).reduce((s,p)=>s+p.val,0);
export const wageBill=(g,id)=>squadOf(g,id).reduce((s,p)=>s+p.sal,0);
export async function loadData(base='data/'){const get=n=>fetch(base+n+'.json').then(r=>r.json()),[clubs,players,leagues,competitions,facilities,economy,sponsors,investors,scouts,ext]=await Promise.all(['clubs','players','leagues','competitions','facilities','economy','sponsors','investors','scouts','ext'].map(get));return{clubs,players,leagues,competitions,facilities,economy,sponsors,investors,scouts,ext}}
export const staffCost=c=>Object.values(c.cuerpoTecnico).reduce((s,x)=>s+x,0)*Math.pow(c.reputacion,3)*CFG.economy.staff;
