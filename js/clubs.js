import {fmt} from './players.js';
export const squadOf=(g,id)=>g.clubs[id].plantilla.map(i=>g.players[i]);
export const squadValue=(g,id)=>squadOf(g,id).reduce((s,p)=>s+p.val,0);
export const wageBill=(g,id)=>squadOf(g,id).reduce((s,p)=>s+p.sal,0);
export async function loadData(base='data/'){const[clubs,players,leagues,competitions]=await Promise.all(['clubs','players','leagues','competitions'].map(n=>fetch(base+n+'.json').then(r=>r.json())));return{clubs,players,leagues,competitions}}
export const staffCost=c=>Object.values(c.cuerpoTecnico).reduce((s,x)=>s+x,0)*c.reputacion*50;
export const upgradeCost=(c,k)=>k==='instalaciones'?(c.instalaciones+1)**2*40000:c.cuerpoTecnico[k]**2*60;
export function upgrade(g,k){const c=g.clubs[g.userClubId],i=k==='instalaciones',lv=i?c.instalaciones:c.cuerpoTecnico[k],cost=upgradeCost(c,k);
 if(i?lv>=10:lv>=95)return'Ya está al máximo';if(c.presupuesto<cost)return'Presupuesto insuficiente';c.presupuesto-=cost;i?c.instalaciones++:c.cuerpoTecnico[k]+=5;return`Mejora realizada por ${fmt(cost)}`}
