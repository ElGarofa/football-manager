export const addDays=(iso,n)=>{const d=new Date(iso+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)};
export class League{
 constructor(def,ids){this.def=def;this.ids=ids;this.j=0;this.results=[];this.table={};ids.forEach(id=>this.table[id]={id,pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0});this.fixtures=League.fixtures(ids)}
 static fixtures(ids){const a=[...ids];if(a.length%2)a.push(null);const n=a.length,r=[];for(let i=0;i<n-1;i++){const d=[];for(let k=0;k<n/2;k++){const h=a[k],v=a[n-1-k];if(h!=null&&v!=null)d.push(i%2?{h:v,a:h}:{h,a:v})}r.push(d);a.splice(1,0,a.pop())}return a.length>24?r:r.concat(r.map(d=>d.map(m=>({h:m.a,a:m.h}))))}
 date(i){return addDays(this.def.inicio,i*this.def.diasEntreJornadas)}
 record(r){const H=this.table[r.h],A=this.table[r.a],P=this.def.puntos;H.pj++;A.pj++;H.gf+=r.hg;H.gc+=r.ag;A.gf+=r.ag;A.gc+=r.hg;
  if(r.hg>r.ag){H.g++;A.p++;H.pts+=P.victoria;A.pts+=P.derrota}else if(r.hg<r.ag){A.g++;H.p++;A.pts+=P.victoria;H.pts+=P.derrota}else{H.e++;A.e++;H.pts+=P.empate;A.pts+=P.empate}this.results.push(r)}
 sorted(){return Object.values(this.table).sort((x,y)=>y.pts-x.pts||(y.gf-y.gc)-(x.gf-x.gc)||y.gf-x.gf)}
 get done(){return this.j>=this.fixtures.length}
}
