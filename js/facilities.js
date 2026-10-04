import {CFG} from './config.js';
import {addDays} from './league.js';
import {fmt} from './players.js';
import {gasto,zl,zoneCost,nivelOf} from './finance.js';
export const zonas=()=>CFG.facilities.zonas;
export const fxInjury=c=>1.12-.04*zl(c,'medica');
export const fxHeal=c=>1.15-.05*zl(c,'medica');
export const fxRecov=c=>.15*zl(c,'medica')+.1*zl(c,'concentracion');
export const fxTrain=c=>.7+.06*zl(c,'entrenamiento');
export const fxYouth=c=>.8+.04*zl(c,'entrenamiento');
export const fxMoral=c=>Math.max(.4,1-.04*zl(c,'concentracion')-.003*(c.cuerpoTecnico?.ayudante||0));
export const topeZona=(g,c)=>CFG.facilities.topePorNivel[Math.min(nivelOf(g,c),5)-1];
export const obraDias=lv=>CFG.facilities.obraDias.base+CFG.facilities.obraDias.porNivel*lv;
export function mejorar(g,zid){const c=g.clubs[g.userClubId],z=zonas().find(x=>x.id===zid);if(!z)return'Zona inexistente';
 const lv=zl(c,zid),cost=zoneCost(c,z);
 if(lv>=topeZona(g,c))return lv>=10?'Ya está al máximo':'Tu división no permite más nivel: ascendé para seguir construyendo';
 if(c.obras.some(o=>o.zona===zid))return'Ya hay una obra en esta zona';
 if(c.obras.length>=CFG.facilities.obrasMax)return`Solo podés tener ${CFG.facilities.obrasMax} obras a la vez`;
 if(c.presupuesto<cost||c.presupuesto<0)return'Presupuesto insuficiente';
 gasto(c,'obras',cost);c.obras.push({zona:zid,a:lv+1,hasta:addDays(g.date,obraDias(lv))});return`Obra iniciada: ${z.nombre} nivel ${lv+1} por ${fmt(cost)}`}
export function tickObras(g){const c=g.clubs[g.userClubId];if(!c.obras?.length)return;
 c.obras=c.obras.filter(o=>{if(g.date<o.hasta)return true;c.zonas[o.zona]=o.a;if(o.zona==='estadio')c.capacidad=Math.round(c.capacidad+.08*c.capBase);
  g.news.push(`🏗️ Terminó la obra: ${zonas().find(z=>z.id===o.zona).nombre} nivel ${o.a}`);return false})}
export const staffUpCost=(c,k)=>Math.round(c.cuerpoTecnico[k]**2*60*Math.pow(c.reputacion/62,1.5)/1000)*1000;
export function mejorarStaff(g,k){const c=g.clubs[g.userClubId],lv=c.cuerpoTecnico[k],cost=staffUpCost(c,k);
 if(lv>=95)return'Ya está al máximo';if(c.presupuesto<cost||c.presupuesto<0)return'Presupuesto insuficiente';gasto(c,'obras',cost);c.cuerpoTecnico[k]+=5;return`Mejora realizada por ${fmt(cost)}`}
