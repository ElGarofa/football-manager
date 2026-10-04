import json,os,random,sys
sys.path.insert(0,os.path.dirname(__file__))
from common import *
random.seed(7)
D=os.path.join(os.path.dirname(__file__),"..","data")
PV=dict(CABA="CABA",BA="Buenos Aires",SF="Santa Fe",CBA="Córdoba",MZA="Mendoza",TUC="Tucumán",SJ="San Juan",SDE="Santiago del Estero",ER="Entre Ríos",JUJ="Jujuy",CHA="Chaco",CHU="Chubut")
BASE=[(52,68),(44,54),(36,46),(30,38),(24,32)]
BIG={"Boca Juniors":18,"River Plate":18,"Racing Club":8,"Independiente":8,"San Lorenzo":8,"Estudiantes (LP)":6,"Vélez Sarsfield":6,"Rosario Central":6,"Talleres (Córdoba)":6,"Newell's Old Boys":6}
FN="Lucas Mateo Tomás Franco Nicolás Agustín Bruno Joaquín Santiago Ramiro Facundo Gonzalo Ezequiel Julián Matías Emiliano Lautaro Bautista Federico Maxi Dylan Thiago Ignacio Leandro Gastón Cristian Damián Rodrigo Hernán Sebastián".split()
LN="Acosta Benítez Cabrera Domínguez Escobar Figueroa Godoy Herrera Ibarra Juárez Luna Medina Navarro Ojeda Paz Quiroga Ramírez Sosa Torres Urquiza Vega Ledesma Barrios Correa Díaz Fernández Giménez Maldonado Núñez Peralta Ríos Sánchez Villalba Zárate Molina Coria Bustos Aguirre Campos Roldán".split()
EX=["Uruguay","Paraguay","Chile","Colombia","Brasil","Bolivia"]
POS="POR POR DFC DFC DFC DFC LI LI LD LD MCD MC MC MCO MI MD EI ED DC DC".split()
leagues=[];clubs=[];players=[];pid=1
for line in open(os.path.join(D,"clubs_reales.csv"),encoding="utf-8"):
    line=line.strip()
    if not line:continue
    if line[0]=="#":
        leagues.append({"id":"l%d"%(len(leagues)+1),"nombre":line[1:].strip(),"nivel":len(leagues)+1,"pais":"Argentina","clubes":[],"puntos":{"victoria":3,"empate":1,"derrota":0},"diasEntreJornadas":7,"inicio":"2027-02-06"});continue
    nombre,ciudad,pv=line.split(",");L=leagues[-1];cid=len(clubs)+1
    rep=min(90,random.randint(*BASE[min(len(leagues)-1,4)])+BIG.get(nombre,0));ids=[];tot=0
    for pos in POS:
        age=random.randint(18,35);ovr=cl(30+rep*.55+random.randint(-13,13),35,90)
        p={"id":pid,"clubId":cid,"nombre":random.choice(FN)+" "+random.choice(LN),"edad":age,"nacionalidad":"Argentina" if random.random()<.9 else random.choice(EX),"pos":pos,"ovr":ovr,"pot":min(95,ovr+max(0,int((27-age)*random.uniform(.5,2)))+random.randint(0,3))}
        players.append(attrs(p));ids.append(pid);tot+=p["val"];pid+=1
    L["clubes"].append(cid)
    clubs.append({"id":cid,"nombre":nombre,"ciudad":ciudad,"provincia":PV.get(pv,pv),"division":L["nombre"],"liga":L["id"],"reputacion":rep,"presupuesto":rep*rep*1500,"valorPlantilla":tot,"estadio":"Estadio de "+nombre,"capacidad":int(rep*rep*6+random.randint(0,2000)),"instalaciones":max(1,rep//9),"cuerpoTecnico":{"entrenador":random.randint(40,80),"ayudante":random.randint(40,80),"preparadorFisico":random.randint(40,80)},"plantilla":ids})
w=lambda n,o:open(os.path.join(D,n+".json"),"w",encoding="utf-8").write(json.dumps(o,ensure_ascii=False,separators=(",",":")))
w("clubs",clubs);w("players",players);w("leagues",leagues)
w("competitions",[{"id":"liga-"+l["id"],"tipo":"liga","liga":l["id"],"idaVuelta":True} for l in leagues])
print(len(clubs),"clubes",len(players),"jugadores")
