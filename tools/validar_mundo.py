#!/usr/bin/env python3
"""Valida data/mundo/*.json y regenera data/mundo/index.json.
Esquema de país:
{ "codigo":"BRA","pais":"Brasil","continente":"América del Sur","bandera":"🇧🇷",
  "divisiones":[{"nombre":"Serie A","nivel":1,"completo":true,
                 "clubes":[{"n":"Flamengo","c":"Río de Janeiro","r":88}]}] }
 r = reputación 1-100 (referencia: 88 gigante continental, 70 grande nacional, 50 mediano, 30 chico, 15 amateur)
 completo = false si la división no tiene todos sus clubes."""
import json,glob,os,sys
CONT=["América del Sur","América del Norte y Central","El Caribe","Europa","Asia","África","Oceanía"]
base=os.path.join(os.path.dirname(__file__),'..','data','mundo')
errs=[];idx={c:[] for c in CONT};tot=0
for f in sorted(glob.glob(base+'/[A-Z][A-Z][A-Z].json')):
    n=os.path.basename(f)
    try:d=json.load(open(f,encoding='utf8'))
    except Exception as e:errs.append(f'{n}: JSON inválido {e}');continue
    for k in('codigo','pais','continente','bandera','divisiones'):
        if k not in d:errs.append(f'{n}: falta {k}')
    if errs and errs[-1].startswith(n):continue
    if d['codigo']+'.json'!=n:errs.append(f'{n}: codigo no coincide')
    if d['continente'] not in CONT:errs.append(f'{n}: continente inválido {d["continente"]}')
    if not d['divisiones']:errs.append(f'{n}: sin divisiones')
    seen=set();nc=0;niv=[]
    for dv in d['divisiones']:
        niv.append(dv.get('nivel'))
        for k in('nombre','nivel','clubes'):
            if k not in dv:errs.append(f'{n}: división sin {k}')
        for c in dv.get('clubes',[]):
            nc+=1
            if not c.get('n') or not c.get('c'):errs.append(f'{n}/{dv.get("nombre")}: club incompleto {c}')
            r=c.get('r');
            if not isinstance(r,int) or not 1<=r<=100:errs.append(f'{n}/{c.get("n")}: r inválida {r}')
            if c.get('n') in seen:errs.append(f'{n}: club repetido {c.get("n")}')
            seen.add(c.get('n'))
    if sorted(niv)!=list(range(1,len(niv)+1)):errs.append(f'{n}: niveles no consecutivos {niv}')
    if d['continente'] in idx:
        idx[d['continente']].append({"codigo":d['codigo'],"pais":d['pais'],"bandera":d['bandera'],"divisiones":len(d['divisiones']),"clubes":nc});tot+=nc
CONF={"América del Sur":"CONMEBOL","América del Norte y Central":"CONCACAF","El Caribe":"CONCACAF","Europa":"UEFA","Asia":"AFC","África":"CAF","Oceanía":"OFC"}
def conf(d):
    if d["codigo"] in("GUY","SUR"):return"CONCACAF"
    if d["codigo"]=="AUS":return"AFC"
    return CONF[d["continente"]]
cont={k:[] for k in set(CONF.values())}
for f in sorted(glob.glob(base+'/[A-Z][A-Z][A-Z].json')):
    d=json.load(open(f,encoding='utf8'));cf=conf(d)
    allc=sorted([c for dv in d["divisiones"] for c in dv["clubes"]],key=lambda c:-c["r"])
    top=allc[:8];fz=round(14+.78*(sum(c["r"] for c in top)/max(1,len(top))))
    for ct in idx.get(d["continente"],[]):
        if ct["codigo"]==d["codigo"]:ct["f"]=max(38,min(82,fz));ct["conf"]=cf
    for c in allc[:6]:cont[cf].append({"n":c["n"],"c":c["c"],"p":d["pais"],"k":d["codigo"],"r":c["r"]})
for k in cont:cont[k]=sorted(cont[k],key=lambda c:-c["r"])[:140]
json.dump(cont,open(base+'/continental.json','w',encoding='utf8'),ensure_ascii=False,separators=(',',':'))
out={"continentes":[{"nombre":c,"paises":sorted(idx[c],key=lambda x:x['pais'])} for c in CONT]}
json.dump(out,open(base+'/index.json','w',encoding='utf8'),ensure_ascii=False)
print('países:',sum(len(v) for v in idx.values()),'clubes:',tot)
for c in CONT:print(' ',c,len(idx[c]))
if errs:print('\n'.join(errs[:80]));print(len(errs),'errores');sys.exit(1)
