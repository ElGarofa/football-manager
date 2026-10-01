import csv,json,os,sys,unicodedata
sys.path.insert(0,os.path.dirname(__file__))
from common import *
D=os.path.join(os.path.dirname(__file__),"..","data")
norm=lambda s:unicodedata.normalize("NFD",s).encode("ascii","ignore").decode().lower().strip()
clubs=json.load(open(os.path.join(D,"clubs.json"),encoding="utf-8"));players=json.load(open(os.path.join(D,"players.json"),encoding="utf-8"))
by={norm(c["nombre"]):c for c in clubs}
src=sys.argv[1] if len(sys.argv)>1 else os.path.join(D,"jugadores_reales.csv")
touched={}
for r in csv.DictReader(open(src,encoding="utf-8-sig")):
    c=by.get(norm(r["club"]))
    if not c:print("Club no encontrado:",r["club"]);continue
    if r["pos"].strip().upper() not in OFF:print("Posición inválida:",r["nombre"],r["pos"]);continue
    touched.setdefault(c["id"],[]).append(r)
keep=[p for p in players if p["clubId"] not in touched];pid=max(p["id"] for p in players)+1
NUM=("edad","ovr","pot","vel","ace","pas","tec","tir","def","fis","res","men","exp","mor","sal","val","contrato")
for cid,rs in touched.items():
    c=next(x for x in clubs if x["id"]==cid);c["plantilla"]=[]
    for r in rs:
        p={"id":pid,"clubId":cid,"nombre":r["nombre"],"nacionalidad":r.get("nacionalidad") or "Argentina","pos":r["pos"].strip().upper()}
        for k in NUM:
            if r.get(k) not in(None,""):p[k]=int(r[k])
        p.setdefault("edad",25);p.setdefault("ovr",60);p.setdefault("pot",p["ovr"])
        keep.append(attrs(p));c["plantilla"].append(pid);pid+=1
    c["valorPlantilla"]=sum(p["val"] for p in keep if p["clubId"]==cid)
w=lambda n,o:open(os.path.join(D,n+".json"),"w",encoding="utf-8").write(json.dumps(o,ensure_ascii=False,separators=(",",":")))
w("clubs",clubs);w("players",keep);print("Clubes actualizados:",len(touched),"· jugadores totales:",len(keep))
