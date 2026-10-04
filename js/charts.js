// Gráficos SVG simples, sin librerías. Usan las variables de color del tema.
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
const nice=(lo,hi)=>{if(lo===hi){lo-=1;hi+=1}const st=Math.pow(10,Math.floor(Math.log10((hi-lo)/4))),m=[1,2,2.5,5,10].find(k=>(hi-lo)/(k*st)<=5)*st;return[Math.floor(lo/m)*m,Math.ceil(hi/m)*m,m]};
const COL=['var(--a)','var(--info)','var(--warn)','#f472b6','#a78bfa'];
export function line({series,labels=[],w=460,h=230,inv=false,fmt=v=>v,min,max}){
 const all=series.flatMap(s=>s.data.filter(v=>v!=null));if(!all.length)return'<p class="muted">Todavía no hay datos.</p>';
 let[lo,hi,st]=nice(min??Math.min(...all),max??Math.max(...all));const L=52,Rr=14,T=14,B=26,pw=w-L-Rr,ph=h-T-B,n=Math.max(...series.map(s=>s.data.length)),
 X=i=>L+(n<2?pw/2:i/(n-1)*pw),Y=v=>T+(inv?(v-lo)/(hi-lo):1-(v-lo)/(hi-lo))*ph;let o=`<svg class="chart" viewBox="0 0 ${w} ${h}" role="img">`;
 for(let v=lo;v<=hi+1e-9;v+=st)o+=`<line x1="${L}" x2="${w-Rr}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--b)" stroke-dasharray="3 4"/><text x="${L-6}" y="${Y(v)+4}" text-anchor="end" font-size="11" fill="var(--m)">${esc(fmt(v))}</text>`;
 const step=Math.ceil(n/8);for(let i=0;i<n;i+=step)if(labels[i]!=null)o+=`<text x="${X(i)}" y="${h-8}" text-anchor="middle" font-size="11" fill="var(--m)">${esc(labels[i])}</text>`;
 series.forEach((s,k)=>{const c=s.color||COL[k%COL.length],pts=s.data.map((v,i)=>v==null?null:[X(i),Y(v)]).filter(Boolean);if(!pts.length)return;
  if(s.area&&pts.length>1)o+=`<path d="M${pts[0][0]},${T+ph} L${pts.map(p=>p.join(',')).join(' L')} L${pts.at(-1)[0]},${T+ph}Z" fill="${c}" opacity=".13"/>`;
  o+=`<polyline fill="none" stroke="${c}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round" points="${pts.map(p=>p.join(',')).join(' ')}"/>`;
  const e=pts.at(-1);o+=`<circle cx="${e[0]}" cy="${e[1]}" r="4.5" fill="${c}"/>`;
  if(s.data.length<=40)s.data.forEach((v,i)=>{if(v!=null)o+=`<circle cx="${X(i)}" cy="${Y(v)}" r="9" fill="transparent"><title>${esc(s.name||'')} ${esc(labels[i]??i+1)}: ${esc(fmt(v))}</title></circle>`})});
 o+='</svg>';if(series.length>1||series[0].name)o+=`<div class="legend">${series.map((s,k)=>`<span><i style="background:${s.color||COL[k%COL.length]}"></i>${esc(s.name||'')}</span>`).join('')}</div>`;return o}
export function bars({cats,series,w=460,h=230,fmt=v=>v}){
 if(!cats.length)return'<p class="muted">Todavía no hay datos.</p>';const all=series.flatMap(s=>s.data),[lo,hi,st]=nice(Math.min(0,...all),Math.max(...all));
 const L=56,Rr=10,T=12,B=26,pw=w-L-Rr,ph=h-T-B,Y=v=>T+(1-(v-lo)/(hi-lo))*ph,gw=pw/cats.length,bw=Math.min(34,gw*.7/series.length);let o=`<svg class="chart" viewBox="0 0 ${w} ${h}" role="img">`;
 for(let v=lo;v<=hi+1e-9;v+=st)o+=`<line x1="${L}" x2="${w-Rr}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--b)" stroke-dasharray="3 4"/><text x="${L-6}" y="${Y(v)+4}" text-anchor="end" font-size="11" fill="var(--m)">${esc(fmt(v))}</text>`;
 cats.forEach((c,i)=>{const cx=L+gw*(i+.5);o+=`<text x="${cx}" y="${h-8}" text-anchor="middle" font-size="11" fill="var(--m)">${esc(c)}</text>`;
  series.forEach((s,k)=>{const v=s.data[i],x=cx-bw*series.length/2+k*bw,y=Y(Math.max(v,0)),hh=Math.abs(Y(v)-Y(0));o+=`<rect x="${x+1}" y="${y}" width="${bw-2}" height="${Math.max(1,hh)}" rx="3" fill="${s.color||COL[k]}"><title>${esc(s.name)} ${esc(c)}: ${esc(fmt(v))}</title></rect>`})});
 o+='</svg>';return o+`<div class="legend">${series.map((s,k)=>`<span><i style="background:${s.color||COL[k]}"></i>${esc(s.name)}</span>`).join('')}</div>`}
export function radar({labels,values,size=250,max=99}){const n=labels.length,c=size/2,r=size/2-34,P=(i,k)=>{const a=-Math.PI/2+i/n*Math.PI*2;return[c+Math.cos(a)*r*k,c+Math.sin(a)*r*k]};let o=`<svg class="chart" viewBox="0 0 ${size} ${size}" style="max-width:${size}px" role="img">`;
 for(const k of[.25,.5,.75,1])o+=`<polygon points="${labels.map((_,i)=>P(i,k).join(',')).join(' ')}" fill="none" stroke="var(--b)"/>`;
 labels.forEach((l,i)=>{const[x,y]=P(i,1),[tx,ty]=P(i,1.2);o+=`<line x1="${c}" y1="${c}" x2="${x}" y2="${y}" stroke="var(--b)"/><text x="${tx}" y="${ty+4}" text-anchor="middle" font-size="11" fill="var(--m)">${l}</text>`});
 o+=`<polygon points="${values.map((v,i)=>v==null?P(i,0).join(','):P(i,Math.max(.05,v/max)).join(',')).join(' ')}" fill="var(--a)" fill-opacity=".28" stroke="var(--a)" stroke-width="2.4"/>`;
 values.forEach((v,i)=>{if(v!=null){const[x,y]=P(i,Math.max(.05,v/max));o+=`<circle cx="${x}" cy="${y}" r="3.5" fill="var(--a)"><title>${labels[i]}: ${v}</title></circle>`}});return o+'</svg>'}
