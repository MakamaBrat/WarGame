import struct,json,sys,os
from cf import *;from ops import *
J=json.dumps
ASYNCNATIVE={"java/lang/Thread.sleep(J)V","java/lang/Thread.yield()V"}
def pdesc(d):
    i=1;a=[]
    while d[i]!=')':
        j=i
        while d[j]=='[':j+=1
        if d[j]=='L':j=d.index(';',j)
        a.append(d[i:j+1]);i=j+1
    return a,d[i+1:]
tg=lambda t:'2' if t in('J','D') else '1'
def mk(n):return n.replace('/','_').replace('$','_S_')
class I:pass
def decode(code):
    out=[];p=0;L=len(code)
    while p<L:
        i=I();i.pc=p;o=code[p];n=NAME[o];i.arg=None
        if n=='tableswitch':
            q=(p+4)&~3;dflt,lo,hi=struct.unpack('>iii',code[q:q+12]);cnt=hi-lo+1
            offs=struct.unpack('>%di'%cnt,code[q+12:q+12+4*cnt]);i.arg=(p+dflt,lo,[p+x for x in offs]);p=q+12+4*cnt
        elif n=='lookupswitch':
            q=(p+4)&~3;dflt,cnt=struct.unpack('>ii',code[q:q+8]);pairs=struct.unpack('>%di'%(2*cnt),code[q+8:q+8+8*cnt])
            i.arg=(p+dflt,[(pairs[2*k],p+pairs[2*k+1]) for k in range(cnt)]);p=q+8+8*cnt
        elif n=='wide':
            o2=code[p+1];n=NAME[o2];idx=struct.unpack('>H',code[p+2:p+4])[0]
            if n=='iinc':i.arg=(idx,struct.unpack('>h',code[p+4:p+6])[0]);p+=6
            else:i.arg=idx;p+=4
        else:
            sz=SZ[o];b=code[p+1:p+1+sz]
            if n in('bipush',):i.arg=struct.unpack('>b',b)[0]
            elif n=='sipush':i.arg=struct.unpack('>h',b)[0]
            elif n in('ldc','newarray') or n in('iload','lload','fload','dload','aload','istore','lstore','fstore','dstore','astore','ret'):i.arg=b[0]
            elif n=='iinc':i.arg=(b[0],struct.unpack('>b',b[1:])[0])
            elif n=='multianewarray':i.arg=(struct.unpack('>H',b[:2])[0],b[2])
            elif n in('goto','ifeq','ifne','iflt','ifge','ifgt','ifle','if_icmpeq','if_icmpne','if_icmplt','if_icmpge','if_icmpgt','if_icmple','if_acmpeq','if_acmpne','ifnull','ifnonnull'):i.arg=p+struct.unpack('>h',b)[0]
            elif n=='goto_w':n='goto';i.arg=p+struct.unpack('>i',b)[0]
            elif sz==2:i.arg=struct.unpack('>H',b)[0]
            elif sz==4:i.arg=struct.unpack('>H',b[:2])[0]
            p+=1+sz
        if '_' in n and n.split('_')[-1].isdigit() and n!='if_icmpeq':
            base,k=n.rsplit('_',1);n=base;i.arg=int(k)
        i.name=n;i.next=p;out.append(i)
    return out
BIN={'iadd':'({a}+{b})|0','isub':'({a}-{b})|0','imul':'Math.imul({a},{b})','iand':'{a}&{b}','ior':'{a}|{b}','ixor':'{a}^{b}','ishl':'{a}<<{b}','ishr':'{a}>>{b}','iushr':'({a}>>>{b})|0','idiv':'$idiv({a},{b})','irem':'$irem({a},{b})'}
LBIN={'ladd':'$l({a}+{b})','lsub':'$l({a}-{b})','lmul':'$l({a}*{b})','ldiv':'$ldiv({a},{b})','lrem':'$lrem({a},{b})','land':'{a}&{b}','lor':'{a}|{b}','lxor':'{a}^{b}','lshl':'$l({a}<<BigInt({b}&63))','lshr':'{a}>>BigInt({b}&63)','lushr':'$l(BigInt.asUintN(64,{a})>>BigInt({b}&63))'}
CMP={'eq':'===','ne':'!==','lt':'<','ge':'>=','gt':'>','le':'<='}
class Ctx:
    def __init__(s,cl,ASYNC):s.cl=cl;s.ASYNC=ASYNC
    def decl_static(s,owner,name,desc,field=False):
        o=owner
        while o in s.cl:
            c=s.cl[o]
            if field:
                if any(f[1]==name and f[2]==desc for f in c.fields):return o
            elif any(m.name==name and m.desc==desc for m in c.methods):return o
            o=c.sup
        return None
    def anc(s,o):
        r=[]
        while o in s.cl:r.append(o);o=s.cl[o].sup
        return r
    def cands(s,O,key):
        if O not in s.cl:return []
        res=set()
        for C,c in s.cl.items():
            if any(m.name+m.desc==key for m in c.methods) and (C in s.anc(O) or O in s.anc(C)):res.add(C)
        return res
    def isasync(s,kind,owner,key):
        if f'{owner}.{key}' in ASYNCNATIVE:return True
        if owner not in s.cl:return False
        if kind in('invokestatic','invokespecial'):
            o=s.decl_static(owner,key.split('(')[0],'('+key.split('(',1)[1])
            return o is not None and (o,key) in s.ASYNC
        return any((C,key) in s.ASYNC for C in s.cands(owner,key))
    def cref(s,o):return 'J_'+mk(o) if o in s.cl else 'K_'+mk(o)
def step(X,c,i,st):
    n=i.name;d=len(st);v=lambda k:'s%d'%k;a=i.arg
    def ret(code,nst,succ=(),fall=True):return code,nst,list(succ),fall
    def jmp(t):return '{pc=%d;continue L;}'%t
    if n=='nop':return ret('',st)
    if n=='aconst_null':return ret(f'{v(d)}=null;',st+['1'])
    if n=='iconst_m1':return ret(f'{v(d)}=-1;',st+['1'])
    if n=='iconst':return ret(f'{v(d)}={a};',st+['1'])
    if n in('bipush','sipush'):return ret(f'{v(d)}={a};',st+['1'])
    if n=='lconst':return ret(f'{v(d)}={a}n;',st+['2'])
    if n in('fconst','dconst'):raise Exception('float const')
    if n in('ldc','ldc_w','ldc2_w'):
        e=c.cp[a if n=='ldc' else a]
        if e[0]=='int':return ret(f'{v(d)}={e[1]};',st+['1'])
        if e[0]=='str':return ret(f'{v(d)}={J(c.cp[e[1]][1])};',st+['1'])
        if e[0]=='long':return ret(f'{v(d)}={e[1]}n;',st+['2'])
        if e[0]=='class':return ret(f'{v(d)}=$cls({J(c.cp[e[1]][1])});',st+['1'])
        raise Exception('ldc '+e[0])
    if n in('iload','aload'):return ret(f'{v(d)}=l{a};',st+['1'])
    if n=='lload':return ret(f'{v(d)}=l{a};',st+['2'])
    if n in('fload','dload','fstore','dstore'):raise Exception('float')
    if n in('istore','astore','lstore'):return ret(f'l{a}={v(d-1)};',st[:-1])
    if n in('iaload','aaload','baload','caload','saload'):return ret(f'{v(d-2)}=$ld({v(d-2)},{v(d-1)});',st[:-2]+['1'])
    if n=='laload':return ret(f'{v(d-2)}=$ld({v(d-2)},{v(d-1)});',st[:-2]+['2'])
    if n in('iastore','aastore','bastore','castore','sastore','lastore'):return ret(f'$st({v(d-3)},{v(d-2)},{v(d-1)});',st[:-3])
    if n=='pop':return ret('',st[:-1])
    if n=='pop2':return ret('',st[:-1] if st[-1]=='2' else st[:-2])
    if n in('dup','dup_x1','dup_x2','dup2','dup2_x1','dup2_x2','swap'):
        nt,nu,cp_={'dup':(1,0,1),'dup_x1':(1,1,1),'dup_x2':(1,2,1),'dup2':(2,0,1),'dup2_x1':(2,1,1),'dup2_x2':(2,2,1),'swap':(1,1,0)}[n]
        def take(words,stk):
            k=0;w=0
            while w<words:w+=2 if stk[-1-k]=='2' else 1;k+=1
            return k
        ka=take(nt,st);kb=take(nu,st[:-ka]) if nu else 0
        base=d-ka-kb;vals=[(v(base+j),st[base+j]) for j in range(ka+kb)]
        B=vals[:kb];A=vals[kb:]
        new=A+B+(A if cp_ else [])
        tmp=[f't{j}' for j in range(len(vals))]
        code='{'+''.join(f'const {tmp[j]}={vals[j][0]};' for j in range(len(vals)))
        tm=dict((vals[j][0],tmp[j]) for j in range(len(vals)))
        code+=''.join(f'{v(base+j)}={tm[new[j][0]]};' for j in range(len(new)))+'}'
        return ret(code,st[:base]+[x[1] for x in new])
    if n in BIN:return ret(f'{v(d-2)}='+BIN[n].format(a=v(d-2),b=v(d-1))+';',st[:-1])
    if n in LBIN:return ret(f'{v(d-2)}='+LBIN[n].format(a=v(d-2),b=v(d-1))+';',st[:-1])
    if n=='ineg':return ret(f'{v(d-1)}=(-{v(d-1)})|0;',st)
    if n=='lneg':return ret(f'{v(d-1)}=$l(-{v(d-1)});',st)
    if n=='iinc':return ret(f'l{a[0]}=(l{a[0]}+({a[1]}))|0;',st)
    if n=='i2l':return ret(f'{v(d-1)}=BigInt({v(d-1)});',st[:-1]+['2'])
    if n=='l2i':return ret(f'{v(d-1)}=Number(BigInt.asIntN(32,{v(d-1)}));',st[:-1]+['1'])
    if n=='i2b':return ret(f'{v(d-1)}={v(d-1)}<<24>>24;',st)
    if n=='i2s':return ret(f'{v(d-1)}={v(d-1)}<<16>>16;',st)
    if n=='i2c':return ret(f'{v(d-1)}={v(d-1)}&65535;',st)
    if n=='lcmp':return ret(f'{v(d-2)}=({v(d-2)}<{v(d-1)}?-1:{v(d-2)}>{v(d-1)}?1:0);',st[:-2]+['1'])
    if n in('ifeq','ifne','iflt','ifge','ifgt','ifle'):return ret(f'if({v(d-1)}{CMP[n[2:]]}0)'+jmp(a),st[:-1],[a])
    if n.startswith('if_icmp') or n.startswith('if_acmp'):return ret(f'if({v(d-2)}{CMP[n[7:]]}{v(d-1)})'+jmp(a),st[:-2],[a])
    if n=='ifnull':return ret(f'if({v(d-1)}==null)'+jmp(a),st[:-1],[a])
    if n=='ifnonnull':return ret(f'if({v(d-1)}!=null)'+jmp(a),st[:-1],[a])
    if n=='goto':return ret(jmp(a),st,[a],False)
    if n=='tableswitch':
        dflt,lo,offs=a;code=f'switch({v(d-1)}){{'+''.join(f'case {lo+k}:{jmp(t)}' for k,t in enumerate(offs))+f'default:{jmp(dflt)}}}'
        return ret(code,st[:-1],[dflt]+offs,False)
    if n=='lookupswitch':
        dflt,pr=a;code=f'switch({v(d-1)}){{'+''.join(f'case {k}:{jmp(t)}' for k,t in pr)+f'default:{jmp(dflt)}}}'
        return ret(code,st[:-1],[dflt]+[t for _,t in pr],False)
    if n in('ireturn','areturn','lreturn'):return ret(f'return {v(d-1)};',st[:-1],[],False)
    if n=='return':return ret('return;',st,[],False)
    if n in('getstatic','putstatic','getfield','putfield'):
        owner,name,desc=ref(c,a);key=J(name+':'+desc);t=tg(desc[0])
        if n[3:]=='static':
            o=X.decl_static(owner,name,desc,True) or owner;r=X.cref(o)
            return ret(f'{v(d)}={r}[{key}];',st+[t]) if n=='getstatic' else ret(f'{r}[{key}]={v(d-1)};',st[:-1])
        if n=='getfield':return ret(f'{v(d-1)}={v(d-1)}[{key}];',st[:-1]+[t])
        return ret(f'{v(d-2)}[{key}]={v(d-1)};',st[:-2])
    if n in('invokevirtual','invokespecial','invokestatic','invokeinterface'):
        owner,name,desc=ref(c,a);args,rt=pdesc(desc);k=len(args);stat=n=='invokestatic'
        base=d-k-(0 if stat else 1);first=base+(0 if stat else 1)
        al=','.join(v(first+j) for j in range(k));key=name+desc;full=f'{owner}.{key}'
        isasync=X.isasync(n,owner,key)
        if full=='java/lang/Math.abs(I)I':call=f'(Math.abs({al})|0)'
        elif full in('java/lang/Math.min(II)I','java/lang/Math.max(II)I'):call=f'Math.{name}({al})'
        elif stat:
            o=X.decl_static(owner,name,desc) or owner;call=f'{X.cref(o)}[{J(key)}]({al})'
        elif n=='invokespecial':
            call=f'{X.cref(owner)}.prototype[{J(key)}].call({v(base)}'+(','+al if k else '')+')'
        else:
            r=v(base)
            if owner=='java/lang/String':call=f'$S[{J(key)}]({r}'+(','+al if k else '')+')'
            elif owner=='java/lang/Object':call=f'$O[{J(key)}]({r}'+(','+al if k else '')+')'
            elif owner.startswith('['):call=f'$aclone({r})'
            else:call=f'{r}[{J(key)}]({al})'
        if isasync:call=f'(await {call})'
        if rt=='V':return ret(call+';',st[:base])
        return ret(f'{v(base)}={call};',st[:base]+[tg(rt[0])])
    if n=='new':
        cn=c.cp[c.cp[a][1]][1];return ret(f'{v(d)}=new {X.cref(cn)}();',st+['1'])
    if n=='newarray':return ret(f'{v(d-1)}=$na({a},{v(d-1)});',st[:-1]+['1'])
    if n=='anewarray':return ret(f'{v(d-1)}=$naa({v(d-1)});',st[:-1]+['1'])
    if n=='arraylength':return ret(f'{v(d-1)}={v(d-1)}.length;',st[:-1]+['1'])
    if n=='athrow':return ret(f'throw {v(d-1)};',st[:-1],[],False)
    if n=='checkcast':return ret('',st)
    if n=='instanceof':
        cn=c.cp[c.cp[a][1]][1];return ret(f'{v(d-1)}=$io({v(d-1)},{J(cn)})?1:0;',st[:-1]+['1'])
    if n in('monitorenter','monitorexit'):return ret('',st[:-1])
    if n=='multianewarray':
        cn=c.cp[c.cp[a[0]][1]][1];k=a[1];return ret(f'{v(d-k)}=$mna({J(cn)},[{",".join(v(d-k+j) for j in range(k))}]);',st[:-k]+['1'])
    raise Exception('op '+n)
def emit_method(X,c,m):
    ins=decode(m.code);bypc={i.pc:i for i in ins}
    state={0:[]};work=[0];leaders={0}
    for (s,e,h,t) in m.exc:state[h]=['1'];work.append(h);leaders.add(h)
    while work:
        pc=work.pop();st=state[pc]
        while True:
            i=bypc[pc];_,nst,succ,fall=step(X,c,i,st)
            for t in succ:
                leaders.add(t)
                if t not in state:state[t]=nst;work.append(t)
            if not fall:break
            pc=i.next
            if pc in state:break
            state[pc]=nst;st=nst
    for (s,e,h,t) in m.exc:
        for x in(s,e):
            if x in state:leaders.add(x)
    static=bool(m.access&8);args,rt=pdesc(m.desc)
    params=[];idx=0 if static else 1
    for t in args:
        params.append('l%d'%idx);idx+=2 if t in('J','D') else 1
    maxs=max([len(s) for s in state.values()]+[1])
    plist=set(params)|({'l0'} if not static else set())
    decl=[f'l{k}' for k in range(m.maxlocals) if f'l{k}' not in plist]
    body=[]
    if not static:body.append('let l0=this;')
    if decl:body.append('let '+','.join(decl)+';')
    body.append('let '+','.join(f's{k}' for k in range(maxs+1))+';')
    simple=len(leaders)==1 and not m.exc
    if not simple:body.append('let pc=0'+(',bpc=0' if m.exc else '')+';')
    isasync=(c.name,m.name+m.desc) in X.ASYNC
    out=[]
    for i in ins:
        if i.pc not in state:continue
        code,_,_,_=step(X,c,i,state[i.pc])
        if not simple and i.pc in leaders:out.append(f'case {i.pc}:'+('bpc=%d;'%i.pc if m.exc else ''))
        out.append(code)
    if simple:body+=out
    else:
        inner='switch(pc){\n'+'\n'.join(out)+'\n}'
        if m.exc:
            hs=[]
            for (s,e,h,t) in m.exc:
                tn=c.cp[c.cp[t][1]][1] if t else None
                cond=f'bpc>={s}&&bpc<{e}'+(f'&&$io(e,{J(tn)})' if tn else '')
                hs.append(f'if({cond}){{s0=e;pc={h};continue L;}}')
            inner=f'try{{{inner}}}catch(e){{e=$wex(e);'+''.join(hs)+'throw e;}'
        body.append('L:for(;;){'+inner+'}')
    pre=('static ' if static else '')+('async ' if isasync else '')
    return f'{pre}{J(m.name+m.desc)}({",".join(params)}){{\n'+'\n'.join(body)+'\n}'
def default(desc):return '0n' if desc=='J' else 'null' if desc[0] in 'L[' else '0'
def compile_all(jar,outfile):
    cl=load_all(jar)
    X=Ctx(cl,set())
    calls={}
    for c in cl.values():
        for m in c.methods:
            if not m.code:continue
            lst=[]
            for i in decode(m.code):
                if i.name.startswith('invoke') and i.name!='invokedynamic':
                    o,n,d=ref(c,i.arg);lst.append((i.name,o,n+d))
            calls[(c.name,m.name+m.desc)]=lst
    ch=True
    while ch:
        ch=False
        for k,lst in calls.items():
            if k in X.ASYNC:continue
            if any(X.isasync(kd,o,key) for kd,o,key in lst):X.ASYNC.add(k);ch=True
    ASYNC=X.ASYNC
    order=[];seen=set()
    def visit(n):
        if n in seen or n not in cl:return
        seen.add(n);visit(cl[n].sup);order.append(n)
    for n in sorted(cl):visit(n)
    out=['"use strict";\n(function(RT){const P=RT.P,$ld=RT.ld,$st=RT.st,$idiv=RT.idiv,$irem=RT.irem,$l=RT.l,$ldiv=RT.ldiv,$lrem=RT.lrem,$na=RT.na,$naa=RT.naa,$mna=RT.mna,$io=RT.io,$wex=RT.wex,$S=RT.S,$O=RT.O,$aclone=RT.aclone,$cls=RT.cls;']
    plat=set()
    for c in cl.values():
        for e in c.cp:
            if e and e[0]=='class':
                n=c.cp[e[1]][1]
                if n not in cl and not n.startswith('['):plat.add(n)
        if c.sup and c.sup not in cl:plat.add(c.sup)
    for n in sorted(plat):
        if n=='java/lang/String':continue
        out.append(f'const K_{mk(n)}=P[{J(n)}];')
    for n in order:
        c=cl[n];sup=X.cref(c.sup) if c.sup else 'RT.JObject'
        if c.sup not in cl:
            if c.sup=='java/lang/Object':sup='K_java_lang_Object'
        out.append(f'class J_{mk(n)} extends {sup}{{\nconstructor(){{super();'+''.join(f'this[{J(f[1]+":"+f[2])}]={default(f[2])};' for f in c.fields if not f[0]&8)+'}')
        for m in c.methods:
            if m.code:out.append(emit_method(X,c,m))
        out.append('}')
        types=[n]+list(c.ifaces)
        out.append(f'J_{mk(n)}.prototype.$types=new Set({J(types)}.concat([...{X.cref(c.sup)}.prototype.$types]));' if c.sup else '')
        for f in c.fields:
            if f[0]&8:
                val=default(f[2])
                if f[3]:
                    e=c.cp[f[3]]
                    val=f'{e[1]}n' if e[0]=='long' else J(c.cp[e[1]][1]) if e[0]=='str' else str(e[1])
                out.append(f'J_{mk(n)}[{J(f[1]+":"+f[2])}]={val};')
    out.append('RT.classes={'+','.join(f'{J(n)}:J_{mk(n)}' for n in order)+'};')
    out.append('RT.clinits=['+','.join(f'J_{mk(n)}' for n in order if any(m.name=="<clinit>" for m in cl[n].methods))+'];')
    out.append('})(window.RT||globalThis.RT);')
    # natives list
    nat=set()
    for c in cl.values():
        for m in c.methods:
            if m.code:
                for i in decode(m.code):
                    if i.name.startswith('invoke'):
                        o,nm,d=ref(c,i.arg)
                        if o not in cl:nat.add(f'{o}.{nm}{d}')
    open(outfile,'w').write('\n'.join(out))
    open(outfile+'.natives','w').write('\n'.join(sorted(nat)))
    print('classes',len(cl),'async methods',len(ASYNC),sorted(ASYNC),'bytes',sum(len(x) for x in out))
if __name__=='__main__':compile_all(sys.argv[1],sys.argv[2])
