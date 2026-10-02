import random
OFF={"POR":(-15,-10,-10,-15,-35,10),"DFC":(-5,-5,-8,-12,-25,8),"LI":(5,5,-2,-5,-15,3),"LD":(5,5,-2,-5,-15,3),"MCD":(-3,-3,3,-3,-15,7),"MC":(0,0,6,3,-5,0),"MCO":(0,2,7,8,3,-15),"MI":(5,5,3,5,-2,-8),"MD":(5,5,3,5,-2,-8),"EI":(8,8,0,6,3,-18),"ED":(8,8,0,6,3,-18),"DC":(2,3,-5,2,10,-25)}
cl=lambda x,a=25,b=97:max(a,min(b,int(x)))
def attrs(p):
    o,pos,age=p["ovr"],p["pos"],p["edad"]
    for k,f in zip(["vel","ace","pas","tec","tir","def"],OFF[pos]):p.setdefault(k,cl(o+f+random.randint(-6,6)))
    for k in["fis","res","men"]:p.setdefault(k,cl(o+random.randint(-9,9)))
    p.setdefault("exp",cl(25+(age-18)*3+random.randint(-8,8),10,95))
    p.setdefault("mor",random.randint(60,90));p.setdefault("cond",100);p.setdefault("lesion",0)
    v=8000*1.16**(o-40)*(1.25 if age<24 else 1 if age<30 else .6)
    p.setdefault("val",int(round(v/1000)*1000));p.setdefault("clausula",p["val"]*3)
    ln="G" if pos=="POR" else "D" if pos in("DFC","LI","LD") else "A" if pos in("EI","ED","DC") else "M"
    p.setdefault("rasgo",random.choice({"A":["Goleador","Gambeteador"],"M":["Pasador","Incansable","Capitán"],"D":["Muro","Capitán"],"G":["Reflejos"]}[ln]) if random.random()<.3 else ("Frágil" if random.random()<.08 else ""))
    p.setdefault("pie",random.choices(["Derecho","Izquierdo","Ambidiestro"],[7,2.5,.5])[0])
    p.setdefault("sal",int(p["val"]*.18/1000)*1000);p.setdefault("contrato",random.randint(2027,2030))
    return p
