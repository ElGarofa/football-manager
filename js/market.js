// Mercado: agentes, ventanas de pases (v0.9)
export const AGENTES=[
 {nombre:'Gustavo Maidana',tipo:'Duro',com:.07},{nombre:'Hernán Pizarro',tipo:'Flexible',com:.05},{nombre:'Claudio Ferraris',tipo:'Codicioso',com:.08},{nombre:'Sergio Montoya',tipo:'Flexible',com:.04},
 {nombre:'Darío Caballero',tipo:'Duro',com:.06},{nombre:'Matías Rossi',tipo:'Codicioso',com:.09},{nombre:'Leandro Quiroz',tipo:'Flexible',com:.05},{nombre:'Ariel Benavídez',tipo:'Duro',com:.07},
 {nombre:'Fabricio Lencina',tipo:'Flexible',com:.04},{nombre:'Rubén Cáceres',tipo:'Codicioso',com:.08},{nombre:'Norberto Gallo',tipo:'Duro',com:.06},{nombre:'Esteban Villalba',tipo:'Flexible',com:.05},
 {nombre:'Omar Sandoval',tipo:'Codicioso',com:.1},{nombre:'Ismael Duarte',tipo:'Duro',com:.07}];
export const AG_TXT={Duro:'Pide más y no acepta contraofertas.',Flexible:'Negocia: acepta un poco menos.',Codicioso:'Pide aumento de salario y comisión alta.'};
export const agOf=p=>AGENTES[Math.abs(p.id)%AGENTES.length];
export const comision=p=>Math.round(agOf(p).com*p.sal*3/1000)*1000;
export function enVentana(d){const m=+d.slice(5,7),dd=+d.slice(8,10);return m<=2||m===7||(m===8&&dd<=15)}
export const cierreVentana=d=>d.slice(5)==='02-28'||d.slice(5)==='08-15';
export function proxVentana(d){const m=+d.slice(5,7);if(enVentana(d))return m<=2?'cierra el 28/2':'cierra el 15/8';return m<=6?'abre el 1/7':m<=8?'abre el 1/1':'abre el 1/1'}
