export const CFG={facilities:{zonas:[],topePorNivel:[10,8,6,5,4],obraDias:{base:30,porNivel:12},obrasMax:2},economy:{},sponsors:[],investors:[],scouts:{},ext:{paises:[]}};
export const setConfig=d=>{for(const k of Object.keys(CFG))if(d[k])CFG[k]=d[k]};
