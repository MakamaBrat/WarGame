import struct,glob,os
class R:
    def __init__(s,d):s.d=d;s.p=0
    def u1(s):v=s.d[s.p];s.p+=1;return v
    def u2(s):v=struct.unpack('>H',s.d[s.p:s.p+2])[0];s.p+=2;return v
    def u4(s):v=struct.unpack('>I',s.d[s.p:s.p+4])[0];s.p+=4;return v
    def b(s,n):v=s.d[s.p:s.p+n];s.p+=n;return v
class Method:pass
class Cls:pass
def parse(path):
    r=R(open(path,'rb').read());r.u4();r.u2();r.u2()
    n=r.u2();cp=[None]*n;i=1
    while i<n:
        t=r.u1()
        if t==1:l=r.u2();cp[i]=('utf',r.b(l).decode('utf8','replace'))
        elif t==3:cp[i]=('int',struct.unpack('>i',r.b(4))[0])
        elif t==4:cp[i]=('float',struct.unpack('>f',r.b(4))[0])
        elif t==5:cp[i]=('long',struct.unpack('>q',r.b(8))[0]);i+=1
        elif t==6:cp[i]=('double',struct.unpack('>d',r.b(8))[0]);i+=1
        elif t in(7,8):cp[i]=('class' if t==7 else 'str',r.u2())
        elif t in(9,10,11):cp[i]=({9:'field',10:'meth',11:'imeth'}[t],r.u2(),r.u2())
        elif t==12:cp[i]=('nt',r.u2(),r.u2())
        else:raise Exception('cp tag %d'%t)
        i+=1
    c=Cls();c.cp=cp
    u=lambda k:cp[k][1]
    c.access=r.u2();c.name=u(cp[r.u2()][1]);sc=r.u2();c.sup=u(cp[sc][1]) if sc else None
    c.ifaces=[u(cp[r.u2()][1]) for _ in range(r.u2())]
    c.fields=[]
    for _ in range(r.u2()):
        a=r.u2();nm=u(r.u2());ds=u(r.u2());cv=None
        for _ in range(r.u2()):
            an=u(r.u2());l=r.u4();b=r.b(l)
            if an=='ConstantValue':cv=struct.unpack('>H',b)[0]
        c.fields.append((a,nm,ds,cv))
    c.methods=[]
    for _ in range(r.u2()):
        m=Method();m.access=r.u2();m.name=u(r.u2());m.desc=u(r.u2());m.code=None
        for _ in range(r.u2()):
            an=u(r.u2());l=r.u4();b=r.b(l)
            if an=='Code':
                q=R(b);m.maxstack=q.u2();m.maxlocals=q.u2();cl=q.u4();m.code=q.b(cl)
                m.exc=[(q.u2(),q.u2(),q.u2(),q.u2()) for _ in range(q.u2())]
        c.methods.append(m)
    return c
def load_all(d='jar'):
    return {c.name:c for c in (parse(f) for f in glob.glob(d+'/*.class'))}
def ref(c,i):
    e=c.cp[i];k=e[0];u=lambda x:c.cp[x][1]
    cn=u(c.cp[e[1]][1]);nt=c.cp[e[2]];return cn,u(nt[1]),u(nt[2])
