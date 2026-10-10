"use strict";
(function(g){
const RT=g.RT=g.RT||{};const P=RT.P={};
const env=()=>RT.env;
// ---------- core object model ----------
class JObject{
  ["<init>()V"](){}
  ["getClass()Ljava/lang/Class;"](){return cls(this.constructor.name)}
  ["toString()Ljava/lang/String;"](){return "obj"}
  ["equals(Ljava/lang/Object;)Z"](o){return this===o?1:0}
  ["hashCode()I"](){return 0}
}
JObject.prototype.$types=new Set(["java/lang/Object"]);RT.JObject=JObject;P["java/lang/Object"]=JObject;
function def(name,sup,ifaces,proto,stat){
  const C={[name.replace(/\W/g,'_')]:class extends(sup||JObject){}}[name.replace(/\W/g,'_')];
  C.prototype.$types=new Set([name,...(ifaces||[]),...(sup||JObject).prototype.$types]);
  Object.assign(C.prototype,proto||{});Object.assign(C,stat||{});P[name]=C;return C;
}
RT.def=def;
const T=def("java/lang/Throwable",null,[],{
  ["<init>()V"](){this.msg=null},["<init>(Ljava/lang/String;)V"](m){this.msg=m},
  ["getMessage()Ljava/lang/String;"](){return this.msg},
  ["printStackTrace()V"](){console.error("[java]",this.constructor.name,this.msg,this.js||"")},
  ["toString()Ljava/lang/String;"](){return this.constructor.name+(this.msg?": "+this.msg:"")}});
const ex=(n,s)=>def("java/lang/"+n,P[s.includes('/')?s:"java/lang/"+s]);
def("java/lang/Exception",T);def("java/lang/Error",T);
for(const n of["RuntimeException","InterruptedException","CloneNotSupportedException"])ex(n,"Exception");
for(const n of["ArithmeticException","NullPointerException","IndexOutOfBoundsException","NegativeArraySizeException","IllegalArgumentException","ClassCastException","SecurityException","IllegalStateException"])ex(n,"RuntimeException");
ex("ArrayIndexOutOfBoundsException","IndexOutOfBoundsException");ex("StringIndexOutOfBoundsException","IndexOutOfBoundsException");
ex("NumberFormatException","IllegalArgumentException");
ex("OutOfMemoryError","Error");ex("StackOverflowError","Error");
const IOE=def("java/io/IOException",P["java/lang/Exception"]);def("java/io/EOFException",IOE);
def("javax/microedition/io/ConnectionNotFoundException",IOE);
const RSE=def("javax/microedition/rms/RecordStoreException",P["java/lang/Exception"]);
for(const n of["RecordStoreNotFoundException","RecordStoreFullException","InvalidRecordIDException","RecordStoreNotOpenException","RecordStoreExistsException"])def("javax/microedition/rms/"+n,RSE);
def("javax/microedition/media/MediaException",P["java/lang/Exception"]);
const mkex=(n,m)=>{const e=new P[n]();e.msg=m;return e};
function wex(e){
  if(e instanceof T)return e;
  if(RT.debug)console.warn("[js error]",e);
  let r;
  if(e instanceof TypeError)r=mkex("java/lang/NullPointerException",String(e.message));
  else if(e instanceof RangeError)r=mkex(/call stack/i.test(e.message)?"java/lang/StackOverflowError":"java/lang/OutOfMemoryError",String(e.message));
  else r=mkex("java/lang/RuntimeException",String(e&&e.message||e));
  r.js=e;return r;
}
RT.wex=wex;
RT.ld=(a,i)=>{if(i>>>0>=a.length)throw mkex("java/lang/ArrayIndexOutOfBoundsException",""+i);return a[i]};
RT.st=(a,i,v)=>{if(i>>>0>=a.length)throw mkex("java/lang/ArrayIndexOutOfBoundsException",""+i);a[i]=v};
RT.idiv=(a,b)=>{if(b===0)throw mkex("java/lang/ArithmeticException","/ by zero");return(a/b)|0};
RT.irem=(a,b)=>{if(b===0)throw mkex("java/lang/ArithmeticException","/ by zero");return(a%b)|0};
RT.l=x=>BigInt.asIntN(64,x);
RT.ldiv=(a,b)=>{if(b===0n)throw mkex("java/lang/ArithmeticException","/ by zero");return BigInt.asIntN(64,a/b)};
RT.lrem=(a,b)=>{if(b===0n)throw mkex("java/lang/ArithmeticException","/ by zero");return a%b};
const AT={4:Int8Array,5:Uint16Array,6:Float32Array,7:Float64Array,8:Int8Array,9:Int16Array,10:Int32Array,11:BigInt64Array};
const NASE=n=>mkex("java/lang/NegativeArraySizeException",""+n);
RT.na=(t,n)=>{if(n<0)throw NASE(n);return new AT[t](n)};
RT.naa=n=>{if(n<0)throw NASE(n);return new Array(n).fill(null)};
const PC={Z:4,C:5,F:6,D:7,B:8,S:9,I:10,J:11};
function mna(d,dims,k=0){const n=dims[k];if(n<0)throw NASE(n);const e=d.slice(1);
  if(k===dims.length-1)return e.length===1?RT.na(PC[e],n):new Array(n).fill(null);
  const a=new Array(n);for(let i=0;i<n;i++)a[i]=mna(e,dims,k+1);return a}
RT.mna=mna;
RT.io=(o,n)=>{if(o==null)return false;if(typeof o==="string")return n==="java/lang/String"||n==="java/lang/Object";
  if(Array.isArray(o)||ArrayBuffer.isView(o))return n[0]==="["||n==="java/lang/Object";return o.$types.has(n)};
RT.aclone=a=>a.slice();
const npe=()=>mkex("java/lang/NullPointerException",null);
const sioobe=i=>mkex("java/lang/StringIndexOutOfBoundsException",""+i);
RT.S={
  "charAt(I)C":(s,i)=>{if(i>>>0>=s.length)throw sioobe(i);return s.charCodeAt(i)},
  "length()I":s=>s.length,
  "equals(Ljava/lang/Object;)Z":(s,o)=>{if(s==null)throw npe();return s===o?1:0},
  "substring(II)Ljava/lang/String;":(s,a,b)=>{if(a<0||b>s.length||a>b)throw sioobe(a);return s.substring(a,b)},
  "toLowerCase()Ljava/lang/String;":s=>s.toLowerCase(),
  "toString()Ljava/lang/String;":s=>{if(s==null)throw npe();return s}};
RT.O={
  "getClass()Ljava/lang/Class;":o=>cls(typeof o==="string"?"java/lang/String":o.constructor.name),
  "toString()Ljava/lang/String;":o=>typeof o==="string"?o:o["toString()Ljava/lang/String;"](),
  "equals(Ljava/lang/Object;)Z":(o,x)=>typeof o==="string"?(o===x?1:0):o["equals(Ljava/lang/Object;)Z"](x),
  "hashCode()I":o=>0,"<init>()V":()=>{}};
// ---------- java.lang ----------
const JClass=def("java/lang/Class",null,[],{["getResourceAsStream(Ljava/lang/String;)Ljava/io/InputStream;"](n){
  const b=RT.res(n.replace(/^\//,""));if(!b)return null;const s=new P["java/io/ByteArrayInputStream"]();s["<init>([B)V"](b);return s}});
function cls(n){const c=new JClass();c.name=n;return c}RT.cls=cls;
const resCache={};
RT.res=n=>{if(resCache[n])return resCache[n];const b=RT.RES&&RT.RES[n];if(b==null)return null;
  const s=atob(b),a=new Int8Array(s.length);for(let i=0;i<s.length;i++)a[i]=s.charCodeAt(i);return resCache[n]=a};
def("java/lang/StringBuffer",null,[],{
  ["<init>()V"](){this.s=""},
  ["append(C)Ljava/lang/StringBuffer;"](c){this.s+=String.fromCharCode(c);return this},
  ["append(I)Ljava/lang/StringBuffer;"](i){this.s+=i;return this},
  ["append(Ljava/lang/String;)Ljava/lang/StringBuffer;"](x){this.s+=x==null?"null":x;return this},
  ["toString()Ljava/lang/String;"](){return this.s}});
def("java/lang/Integer",null,[],{},{
  "parseInt(Ljava/lang/String;)I":s=>{if(s==null||!/^[+-]?\d+$/.test(s))throw mkex("java/lang/NumberFormatException",s);const v=parseInt(s,10);if(v>2147483647||v<-2147483648)throw mkex("java/lang/NumberFormatException",s);return v},
  "toString(I)Ljava/lang/String;":i=>""+i});
def("java/lang/Math",null,[],{},{"abs(I)I":a=>Math.abs(a)|0,"max(II)I":Math.max,"min(II)I":Math.min});
def("java/lang/System",null,[],{},{"currentTimeMillis()J":()=>BigInt(Date.now()),"gc()V":()=>{},"getProperty(Ljava/lang/String;)Ljava/lang/String;":k=>null});
const yieldNow=()=>new Promise(r=>{if(g.MessageChannel){const c=new MessageChannel();c.port1.onmessage=()=>{c.port1.close();r()};c.port2.postMessage(0)}else setTimeout(r,0)});
def("java/lang/Thread",null,["java/lang/Runnable"],{
  ["<init>(Ljava/lang/Runnable;)V"](r){this.r=r},
  ["start()V"](){const r=this.r;(async()=>{try{await r["run()V"]()}catch(e){console.error("[thread died]",e);if(e&&e.printStackTrace)e.printStackTrace()}})()}},
  {"sleep(J)V":ms=>new Promise(r=>setTimeout(r,Math.max(0,Number(ms)))),"yield()V":yieldNow});
let seed=BigInt(Date.now())&0xFFFFFFFFFFFFn;
def("java/util/Random",null,[],{["<init>()V"](){},["nextInt()I"](){return(Math.random()*4294967296)|0}});
// ---------- java.io ----------
const IS=def("java/io/InputStream",null,[],{["<init>()V"](){},["close()V"](){},
  ["read()I"](){return-1},
  ["read([BII)I"](b,o,l){let n=0;for(;n<l;n++){const c=this["read()I"]();if(c<0)break;b[o+n]=c}return n===0&&l>0?-1:n}});
const BAIS=def("java/io/ByteArrayInputStream",IS,[],{["<init>([B)V"](b){this.buf=b;this.pos=0},
  ["read()I"](){return this.pos<this.buf.length?this.buf[this.pos++]&255:-1},
  ["read([BII)I"](b,o,l){const n=Math.min(l,this.buf.length-this.pos);if(n<=0)return l===0?0:-1;for(let i=0;i<n;i++)b[o+i]=this.buf[this.pos+i];this.pos+=n;return n}});
const eof=()=>mkex("java/io/EOFException",null);
def("java/io/DataInputStream",IS,[],{["<init>(Ljava/io/InputStream;)V"](i){this.i=i},
  ["read()I"](){return this.i["read()I"]()},["close()V"](){this.i["close()V"]()},
  ["read([B)I"](b){return this.i["read([BII)I"](b,0,b.length)},["read([BII)I"](b,o,l){return this.i["read([BII)I"](b,o,l)},
  rb(){const c=this.i["read()I"]();if(c<0)throw eof();return c},
  ["readByte()B"](){return this.rb()<<24>>24},["readBoolean()Z"](){return this.rb()?1:0},
  ["readShort()S"](){return(this.rb()<<8|this.rb())<<16>>16},
  ["readInt()I"](){return(this.rb()<<24|this.rb()<<16|this.rb()<<8|this.rb())|0},
  ["readLong()J"](){let v=0n;for(let i=0;i<8;i++)v=(v<<8n)|BigInt(this.rb());return BigInt.asIntN(64,v)}});
const OS=def("java/io/OutputStream",null,[],{["<init>()V"](){},["close()V"](){},["write(I)V"](b){},
  ["write([B)V"](a){for(let i=0;i<a.length;i++)this["write(I)V"](a[i])}});
def("java/io/ByteArrayOutputStream",OS,[],{["<init>()V"](){this.a=[]},["write(I)V"](b){this.a.push(b&255)},
  ["toByteArray()[B"](){return Int8Array.from(this.a)}});
def("java/io/DataOutputStream",OS,[],{["<init>(Ljava/io/OutputStream;)V"](o){this.o=o},
  ["write(I)V"](b){this.o["write(I)V"](b)},["close()V"](){this.o["close()V"]()},
  ["writeBoolean(Z)V"](b){this.o["write(I)V"](b)},["writeByte(I)V"](b){this.o["write(I)V"](b)},
  ["writeShort(I)V"](v){this.o["write(I)V"](v>>8);this.o["write(I)V"](v)},
  ["writeInt(I)V"](v){for(let s=24;s>=0;s-=8)this.o["write(I)V"](v>>s)},
  ["writeLong(J)V"](v){for(let s=56n;s>=0n;s-=8n)this.o["write(I)V"](Number(BigInt.asIntN(8,v>>s)))}});
// ---------- network stubs ----------
def("javax/microedition/io/Connection",null,[],{["close()V"](){}});
def("javax/microedition/io/Connector",null,[],{},{"open(Ljava/lang/String;)Ljavax/microedition/io/Connection;":u=>{throw mkex("javax/microedition/io/ConnectionNotFoundException",u)}});
// ---------- RMS ----------
const mem={};const stor=()=>env().storage||{getItem:k=>mem[k]??null,setItem:(k,v)=>{mem[k]=v},removeItem:k=>{delete mem[k]}};
const b64=a=>{let s="";for(let i=0;i<a.length;i++)s+=String.fromCharCode(a[i]&255);return btoa(s)};
const unb64=s=>{const t=atob(s),a=new Int8Array(t.length);for(let i=0;i<t.length;i++)a[i]=t.charCodeAt(i);return a};
def("javax/microedition/rms/RecordStore",null,[],{
  save(){stor().setItem("aow2.rms."+this.name,JSON.stringify(this.recs.map(b64)))},
  ["addRecord([BII)I"](d,o,l){this.recs.push(d.slice(o,o+l));this.save();return this.recs.length},
  ["getRecord(I)[B"](id){if(id<1||id>this.recs.length)throw mkex("javax/microedition/rms/InvalidRecordIDException",""+id);return this.recs[id-1].slice()},
  ["getNumRecords()I"](){return this.recs.length},["closeRecordStore()V"](){}},
  {"openRecordStore(Ljava/lang/String;Z)Ljavax/microedition/rms/RecordStore;":(n,c)=>{
    let raw=stor().getItem("aow2.rms."+n);if(raw==null&&RT.seedRMS&&RT.seedRMS[n])raw=JSON.stringify(RT.seedRMS[n]);
    if(raw==null&&!c)throw mkex("javax/microedition/rms/RecordStoreNotFoundException",n);
    const s=new P["javax/microedition/rms/RecordStore"]();s.name=n;s.recs=raw?JSON.parse(raw).map(unb64):[];s.save();return s},
   "deleteRecordStore(Ljava/lang/String;)V":n=>{if(stor().getItem("aow2.rms."+n)==null)throw mkex("javax/microedition/rms/RecordStoreNotFoundException",n);stor().removeItem("aow2.rms."+n)}});
// ---------- inflate + PNG (synchronous) ----------
function inflate(src,pos){
  let out=new Uint8Array(1<<16),op=0,bb=0,bc=0;
  const bits=n=>{let v=bb;while(bc<n){v|=src[pos++]<<bc;bc+=8}bb=v>>>n;bc-=n;return v&((1<<n)-1)};
  const put=b=>{if(op===out.length){const o=new Uint8Array(out.length*2);o.set(out);out=o}out[op++]=b};
  const mkH=(lens,n)=>{const count=new Uint16Array(16),sym=new Uint16Array(n),off=new Uint16Array(16);
    for(let i=0;i<n;i++)count[lens[i]]++;count[0]=0;for(let i=1;i<15;i++)off[i+1]=off[i]+count[i];
    for(let i=0;i<n;i++)if(lens[i])sym[off[lens[i]]++]=i;return{count,sym}};
  const dec=h=>{let code=0,first=0,idx=0;for(let l=1;l<=15;l++){code|=bits(1);const c=h.count[l];if(code-c<first)return h.sym[idx+(code-first)];idx+=c;first+=c;first<<=1;code<<=1}throw new Error("bad huffman")};
  const LB=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258],LE=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0];
  const DB=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577],DE=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13];
  let fl,fd;{const l=new Uint8Array(288);for(let i=0;i<144;i++)l[i]=8;for(let i=144;i<256;i++)l[i]=9;for(let i=256;i<280;i++)l[i]=7;for(let i=280;i<288;i++)l[i]=8;fl=mkH(l,288);const d=new Uint8Array(30).fill(5);fd=mkH(d,30)}
  const codes=(lh,dh)=>{for(;;){let s=dec(lh);if(s<256)put(s);else if(s===256)return;else{s-=257;const len=LB[s]+bits(LE[s]);const ds=dec(dh);const dist=DB[ds]+bits(DE[ds]);for(let i=0;i<len;i++)put(out[op-dist])}}};
  let last;do{last=bits(1);const t=bits(2);
    if(t===0){bb=0;bc=0;const len=src[pos]|src[pos+1]<<8;pos+=4;for(let i=0;i<len;i++)put(src[pos++])}
    else if(t===1)codes(fl,fd);
    else if(t===2){const nl=bits(5)+257,nd=bits(5)+1,nc=bits(4)+4,ord=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],ls=new Uint8Array(320);
      for(let i=0;i<nc;i++)ls[ord[i]]=bits(3);const ch=mkH(ls.subarray(0,19),19);const L=new Uint8Array(320);let i=0;
      while(i<nl+nd){const s=dec(ch);if(s<16)L[i++]=s;else{let p=0,r;if(s===16){p=L[i-1];r=3+bits(2)}else if(s===17)r=3+bits(3);else r=11+bits(7);while(r--)L[i++]=p}}
      codes(mkH(L.subarray(0,nl),nl),mkH(L.subarray(nl,nl+nd),nd))}
    else throw new Error("bad block")}while(!last);
  return out.subarray(0,op);
}
function decodePNG(b){
  const u=new Uint8Array(b.buffer,b.byteOffset,b.length);
  if(u[0]!==137||u[1]!==80)throw new Error("not png");
  let p=8,w=0,h=0,bd=0,ct=0,il=0,pal=null,trns=null;const idat=[];
  const u32=o=>(u[o]<<24|u[o+1]<<16|u[o+2]<<8|u[o+3])>>>0;
  while(p<u.length){const len=u32(p),ty=String.fromCharCode(u[p+4],u[p+5],u[p+6],u[p+7]),d=p+8;
    if(ty==="IHDR"){w=u32(d);h=u32(d+4);bd=u[d+8];ct=u[d+9];il=u[d+12]}
    else if(ty==="PLTE")pal=u.subarray(d,d+len);else if(ty==="tRNS")trns=u.subarray(d,d+len);
    else if(ty==="IDAT")idat.push(u.subarray(d,d+len));else if(ty==="IEND")break;p=d+len+4}
  if(il)throw new Error("interlaced png unsupported");
  let n=0;for(const c of idat)n+=c.length;const z=new Uint8Array(n);n=0;for(const c of idat){z.set(c,n);n+=c.length}
  const raw=inflate(z,2);const ch={0:1,2:3,3:1,4:2,6:4}[ct],bpp=Math.max(1,(ch*bd)>>3),stride=Math.ceil(w*ch*bd/8);
  const px=new Uint8Array(stride*h);
  for(let y=0;y<h;y++){const f=raw[y*(stride+1)],ro=y*(stride+1)+1,o=y*stride;
    for(let x=0;x<stride;x++){const a=x>=bpp?px[o+x-bpp]:0,up=y?px[o-stride+x]:0,c=x>=bpp&&y?px[o-stride+x-bpp]:0;let v=raw[ro+x];
      if(f===1)v+=a;else if(f===2)v+=up;else if(f===3)v+=(a+up)>>1;else if(f===4){const pp=a+up-c,pa=Math.abs(pp-a),pb=Math.abs(pp-up),pc=Math.abs(pp-c);v+=(pa<=pb&&pa<=pc)?a:(pb<=pc?up:c)}
      px[o+x]=v&255}}
  const out=new Uint8ClampedArray(w*h*4);
  const smp=(y,x,k)=>{if(bd===8)return px[y*stride+x*ch+k];if(bd===16)return px[y*stride+(x*ch+k)*2];
    const bit=(x*ch+k)*bd,v=(px[y*stride+(bit>>3)]>>(8-bd-(bit&7)))&((1<<bd)-1);return v};
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const o=(y*w+x)*4;let r,gg,bl,a=255;
    if(ct===3){const i=smp(y,x,0);r=pal[i*3];gg=pal[i*3+1];bl=pal[i*3+2];if(trns&&i<trns.length)a=trns[i]}
    else{const sc=bd<8?255/((1<<bd)-1):1;
      if(ct===0){r=gg=bl=smp(y,x,0)*sc;if(trns&&bd<=8&&smp(y,x,0)===trns[1])a=0}
      else if(ct===4){r=gg=bl=smp(y,x,0);a=smp(y,x,1)}
      else{r=smp(y,x,0);gg=smp(y,x,1);bl=smp(y,x,2);if(ct===6)a=smp(y,x,3)}}
    out[o]=r;out[o+1]=gg;out[o+2]=bl;out[o+3]=a}
  return{w,h,data:out};
}
RT.decodePNG=decodePNG;
// ---------- lcdui ----------
const mkCanvas=(w,h)=>{const c=env().makeCanvas(w,h);const x=c.getContext("2d",{willReadFrequently:true});x.imageSmoothingEnabled=false;return c};
const hex=n=>"#"+(n&0xFFFFFF).toString(16).padStart(6,"0");
const Gfx=def("javax/microedition/lcdui/Graphics",null,[],{
  init(ctx){this.x=ctx;ctx.save();this.c="#000000";this.fs=null},
  fs_(){if(this.fs!==this.c){this.x.fillStyle=this.c;this.fs=this.c}},
  ["setColor(I)V"](c){this.c=hex(c)},
  ["setColor(III)V"](r,gg,b){this.c=hex((r&255)<<16|(gg&255)<<8|(b&255))},
  ["fillRect(IIII)V"](x,y,w,h){if(w<=0||h<=0)return;this.fs_();this.x.fillRect(x,y,w,h)},
  ["drawRect(IIII)V"](x,y,w,h){if(w<0||h<0)return;this.fs_();const c=this.x;c.fillRect(x,y,w+1,1);if(h>0)c.fillRect(x,y+h,w+1,1);if(h>1){c.fillRect(x,y+1,1,h-1);if(w>0)c.fillRect(x+w,y+1,1,h-1)}},
  ["drawLine(IIII)V"](x1,y1,x2,y2){this.fs_();const c=this.x;
    if(y1===y2){c.fillRect(Math.min(x1,x2),y1,Math.abs(x2-x1)+1,1);return}
    if(x1===x2){c.fillRect(x1,Math.min(y1,y2),1,Math.abs(y2-y1)+1);return}
    let dx=Math.abs(x2-x1),dy=-Math.abs(y2-y1),sx=x1<x2?1:-1,sy=y1<y2?1:-1,e=dx+dy;
    for(;;){c.fillRect(x1,y1,1,1);if(x1===x2&&y1===y2)break;const e2=2*e;if(e2>=dy){e+=dy;x1+=sx}if(e2<=dx){e+=dx;y1+=sy}}},
  ["setClip(IIII)V"](x,y,w,h){const c=this.x;c.restore();c.save();this.fs=null;c.beginPath();c.rect(x,y,Math.max(0,w),Math.max(0,h));c.clip()},
  ["drawImage(Ljavax/microedition/lcdui/Image;III)V"](im,x,y,a){const p=anch(x,y,im.w,im.h,a);this.x.drawImage(im.cv,p[0],p[1])},
  ["drawRegion(Ljavax/microedition/lcdui/Image;IIIIIIII)V"](im,sx,sy,w,h,tr,dx,dy,a){
    if(w<=0||h<=0)return;const c=this.x,sw=tr>=4?h:w,sh=tr>=4?w:h,p=anch(dx,dy,sw,sh,a);
    if(tr===0){c.drawImage(im.cv,sx,sy,w,h,p[0],p[1],w,h);return}
    c.save();c.translate(p[0],p[1]);
    const M=[null,[1,0,0,-1,0,h],[-1,0,0,1,w,0],[-1,0,0,-1,w,h],[0,1,1,0,0,0],[0,1,-1,0,h,0],[0,-1,1,0,0,w],[0,-1,-1,0,h,w]][tr];
    c.transform(...M);c.drawImage(im.cv,sx,sy,w,h,0,0,w,h);c.restore()}});
function anch(x,y,w,h,a){if(a&1)x-=w>>1;else if(a&8)x-=w;if(a&2)y-=h>>1;else if(a&32)y-=h;return[x,y]}
const Img=def("javax/microedition/lcdui/Image",null,[],{
  ["getWidth()I"](){return this.w},["getHeight()I"](){return this.h},
  ["getGraphics()Ljavax/microedition/lcdui/Graphics;"](){const G=new Gfx();G.init(this.cv.getContext("2d"));return G},
  ["getRGB([IIIIIII)V"](rgb,off,scan,x,y,w,h){const d=this.cv.getContext("2d").getImageData(x,y,w,h).data;
    for(let j=0;j<h;j++)for(let i=0;i<w;i++){const k=(j*w+i)*4;rgb[off+j*scan+i]=(d[k+3]<<24|d[k]<<16|d[k+1]<<8|d[k+2])|0}}},
  {"createImage(II)Ljavax/microedition/lcdui/Image;":(w,h)=>{const im=new Img();im.w=w;im.h=h;im.cv=mkCanvas(w,h);const c=im.cv.getContext("2d");c.fillStyle="#fff";c.fillRect(0,0,w,h);return im},
   "createImage([BII)Ljavax/microedition/lcdui/Image;":(b,o,l)=>fromPNG(b.subarray(o,o+l)),
   "createImage(Ljava/lang/String;)Ljavax/microedition/lcdui/Image;":n=>{const b=RT.res(n.replace(/^\//,""));if(!b)throw mkex("java/io/IOException",n);return fromPNG(b)},
   "createRGBImage([IIIZ)Ljavax/microedition/lcdui/Image;":(rgb,w,h,al)=>{const im=new Img();im.w=w;im.h=h;im.cv=mkCanvas(w,h);const c=im.cv.getContext("2d"),id=c.createImageData(w,h);
     for(let i=0;i<w*h;i++){const v=rgb[i];id.data[i*4]=v>>16&255;id.data[i*4+1]=v>>8&255;id.data[i*4+2]=v&255;id.data[i*4+3]=al?v>>>24:255}c.putImageData(id,0,0);return im}});
function fromPNG(b){let r;try{r=decodePNG(b)}catch(e){throw mkex("java/lang/IllegalArgumentException",String(e.message))}
  const im=new Img();im.w=r.w;im.h=r.h;im.cv=mkCanvas(r.w,r.h);const c=im.cv.getContext("2d"),id=c.createImageData(r.w,r.h);id.data.set(r.data);c.putImageData(id,0,0);return im}
const Disp=def("javax/microedition/lcdui/Displayable",null,[],{});
const Canvas=def("javax/microedition/lcdui/Canvas",Disp,[],{
  ["<init>()V"](){},["repaint()V"](){RT.dirty=true},["setFullScreenMode(Z)V"](f){},
  ["getGameAction(I)I"](k){return GA[k]||0}});
const GA={[-1]:1,[-2]:6,[-3]:2,[-4]:5,[-5]:8,50:1,56:6,52:2,54:5,53:8,49:9,51:10,55:11,57:12};
def("javax/microedition/lcdui/Display",null,[],{
  ["setCurrent(Ljavax/microedition/lcdui/Displayable;)V"](d){RT.current=d;RT.dirty=true;RT.fire(d,"showNotify()V")}},
  {"getDisplay(Ljavax/microedition/midlet/MIDlet;)Ljavax/microedition/lcdui/Display;":m=>m.display||(m.display=new P["javax/microedition/lcdui/Display"]())});
def("javax/microedition/midlet/MIDlet",null,[],{["<init>()V"](){},
  ["getAppProperty(Ljava/lang/String;)Ljava/lang/String;"](k){const v=RT.props[k];return v===undefined?null:v},
  ["notifyDestroyed()V"](){RT.destroyed=true;if(env().onExit)env().onExit()},
  ["platformRequest(Ljava/lang/String;)Z"](u){try{g.open&&g.open(u,"_blank")}catch(e){}return 0}});
RT.props={"Code":"replaced_partner","MIDlet-Version":"1.1.24","Payment-Text":"0","Short-Number":"0","MIDlet-Jar-URL":"","MIDlet-Vendor":"Gear Games","MIDlet-Name":"Art Of War 2 - Global Confederation"};
// ---------- event dispatch / main loop ----------
RT.q=Promise.resolve();
RT.fire=(o,key,...a)=>{if(!o||!o[key])return;RT.q=RT.q.then(()=>o[key](...a)).catch(e=>{console.error("[callback "+key+"]",e);if(e&&e.printStackTrace)e.printStackTrace()})};
RT.key=(down,code)=>{RT.fire(RT.current,down?"keyPressed(I)V":"keyReleased(I)V",code)};
RT.ptr=(kind,x,y)=>{RT.fire(RT.current,kind==="p"?"pointerPressed(II)V":kind==="r"?"pointerReleased(II)V":"pointerDragged(II)V",x,y)};
RT.frame=async()=>{
  if(!RT.current||!RT.dirty||RT.painting)return;if(RT.beforeFrame&&RT.beforeFrame())return;RT.painting=true;RT.dirty=false;
  try{await RT.q;await RT.current["paint(Ljavax/microedition/lcdui/Graphics;)V"](RT.screenG)}catch(e){console.error("[paint]",e)}
  RT.painting=false;if(env().onFrame)env().onFrame();
};
// ext=true: показываем весь буфер игры 270x340 (запас карты за краями обычного окна 240x320)
RT.setView=ext=>{const sc=env().screen;sc.width=ext?270:240;sc.height=ext?340:320;const c=sc.getContext("2d");
  c.imageSmoothingEnabled=false;if(ext)c.translate(15,10);const G=new Gfx();G.init(c);RT.screenG=G;RT.ext=!!ext;RT.dirty=true};
RT.boot=async()=>{
  RT.setView(!!env().ext);
  for(const C of RT.clinits){const r=C["<clinit>()V"]();if(r&&r.then)await r}
  const M=RT.classes["aow2"],m=new M();await m["<init>()V"]();RT.midlet=m;
  RT.q=RT.q.then(()=>m["startApp()V"]()).catch(e=>console.error("[startApp]",e));
};
// ---------- sound ----------
const Player=def("javax/microedition/media/Player",null,[],{
  ["realize()V"](){if(this.st<200)this.st=200},["prefetch()V"](){if(this.st<300)this.st=300},
  ["getState()I"](){return this.st},["setLoopCount(I)V"](n){this.loops=n},
  ["addPlayerListener(Ljavax/microedition/media/PlayerListener;)V"](l){this.l=l},
  ["setMediaTime(J)J"](t){this.pos=Number(t)/1e6;return t},
  ["getControl(Ljava/lang/String;)Ljavax/microedition/media/Control;"](n){return this.vol},
  ["start()V"](){this.st=400;if(RT.midi)RT.midi.play(this)},
  ["stop()V"](){if(this.st===400)this.st=300;if(RT.midi)RT.midi.stop(this)},
  ["close()V"](){this.st=0;if(RT.midi)RT.midi.stop(this)}});
const Vol=def("javax/microedition/media/control/VolumeControl",null,["javax/microedition/media/Control"],{["setLevel(I)I"](l){this.lv=l;if(RT.midi)RT.midi.setVol(l);return l}});
def("javax/microedition/media/Manager",null,[],{},{"createPlayer(Ljava/io/InputStream;Ljava/lang/String;)Ljavax/microedition/media/Player;":(is,t)=>{
  const bytes=[];let c;while((c=is["read()I"]())>=0)bytes.push(c);const p=new Player();p.st=100;p.loops=1;p.pos=0;p.data=Uint8Array.from(bytes);p.vol=new Vol();p.vol.lv=100;return p}});
RT.midi={ctx:null,vol:1,cur:null,
  init(){if(this.ctx||!g.AudioContext)return;this.ctx=new g.AudioContext();this.master=this.ctx.createGain();this.master.gain.value=0.25;this.master.connect(this.ctx.destination)},
  unlock(){this.init();if(this.ctx&&this.ctx.state==="suspended")this.ctx.resume()},
  setVol(l){this.vol=Math.max(0,Math.min(100,l))/100;if(this.master)this.master.gain.value=0.25*this.vol},
  parse(d){let p=0;const u32=()=>(d[p]<<24|d[p+1]<<16|d[p+2]<<8|d[p+3])>>>0,u16=()=>d[p]<<8|d[p+1];
    p+=8;const fmt=u16();p+=2;const nt=u16();p+=2;const div=u16();p+=2;const ev=[];const tempos=[[0,500000]];
    for(let t=0;t<nt;t++){p+=4;const len=u32();p+=4;const end=p+len;let tick=0,rs=0;
      while(p<end){let dt=0,b;do{b=d[p++];dt=dt<<7|b&127}while(b&128);tick+=dt;let s=d[p];
        if(s===255){const ty=d[p+1];p+=2;let l=0,b2;do{b2=d[p++];l=l<<7|b2&127}while(b2&128);if(ty===0x51)tempos.push([tick,d[p]<<16|d[p+1]<<8|d[p+2]]);p+=l}
        else if(s===240||s===247){p++;let l=0,b2;do{b2=d[p++];l=l<<7|b2&127}while(b2&128);p+=l}
        else{if(s&128){rs=s;p++}else s=rs;const hi=s>>4,ch=s&15;
          if(hi===9||hi===8||hi===11||hi===14){const a=d[p++],b3=d[p++];ev.push({tick,hi,ch,a,b:b3})}
          else if(hi===12||hi===13){const a=d[p++];ev.push({tick,hi,ch,a})}else p++}}
      p=end}
    tempos.sort((x,y)=>x[0]-y[0]);
    const sec=tk=>{let t=0,lt=0,tp=500000;for(const [tt,v] of tempos){if(tt>=tk)break;t+=(tt-lt)*tp/div/1e6;lt=tt;tp=v}return t+(tk-lt)*tp/div/1e6};
    ev.sort((x,y)=>x.tick-y.tick);for(const e of ev)e.t=sec(e.tick);return{ev,dur:ev.length?ev[ev.length-1].t:0}},
  play(pl){this.init();if(!this.ctx)return;this.stop(this.cur);if(!pl.song){try{pl.song=this.parse(pl.data)}catch(e){console.warn("midi parse",e);return}}
    const s=pl.song,self=this;let loop=pl.loops;const run={pl,stopped:false,voices:new Set()};this.cur=run;
    const startLoop=()=>{const t0=this.ctx.currentTime+0.05;let i=0;const prog=new Array(16).fill(0),cv=new Array(16).fill(100),on={};
      const pump=()=>{if(run.stopped)return;const now=this.ctx.currentTime;
        while(i<s.ev.length&&t0+s.ev[i].t<now+0.3){self.ev(run,s.ev[i],t0+s.ev[i].t,prog,cv,on);i++}
        if(i>=s.ev.length&&now>t0+s.dur+0.1){loop=loop>0?loop-1:loop;if(loop===0){run.stopped=true;pl.st=300;RT.fire(pl.l,"playerUpdate(Ljavax/microedition/media/Player;Ljava/lang/String;Ljava/lang/Object;)V",pl,"endOfMedia",null);return}
          startLoop();return}
        run.timer=setTimeout(pump,60)};pump()};
    startLoop()},
  stop(run){if(!run)return;if(run.pl&&run===this.cur){}const r=this.cur&&(this.cur.pl===run||this.cur===run)?this.cur:null;if(!r)return;r.stopped=true;clearTimeout(r.timer);for(const v of r.voices){try{v.g.gain.cancelScheduledValues(0);v.g.gain.setValueAtTime(0,this.ctx.currentTime);v.o.stop(this.ctx.currentTime+0.02)}catch(e){}}r.voices.clear();this.cur=null},
  ev(run,e,t,prog,cv,on){const c=this.ctx;
    if(e.hi===12)prog[e.ch]=e.a;else if(e.hi===11&&e.a===7)cv[e.ch]=e.b;
    else if(e.hi===9&&e.b>0){
      if(e.ch===9){const d=e.a,n=c.createBufferSource();const len=Math.floor(c.sampleRate*0.12),buf=c.createBuffer(1,len,c.sampleRate),ch=buf.getChannelData(0);for(let k=0;k<len;k++)ch[k]=(Math.random()*2-1)*(1-k/len);
        n.buffer=buf;const gn=c.createGain();gn.gain.value=e.b/127*(d<=36?0.0:0.5);const f=c.createBiquadFilter();f.type=d>=42?"highpass":"bandpass";f.frequency.value=d>=42?6000:1500;n.connect(f);f.connect(gn);gn.connect(this.master);n.start(t);
        if(d<=36){const o=c.createOscillator(),g2=c.createGain();o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(40,t+0.1);g2.gain.setValueAtTime(e.b/127,t);g2.gain.exponentialRampToValueAtTime(0.001,t+0.15);o.connect(g2);g2.connect(this.master);o.start(t);o.stop(t+0.16)}return}
      const o=c.createOscillator(),gn=c.createGain(),p=prog[e.ch];o.type=p>=32&&p<40?"triangle":p>=40&&p<56?"sawtooth":p>=80&&p<88?"square":"square";
      o.frequency.value=440*Math.pow(2,(e.a-69)/12);const a=e.b/127*cv[e.ch]/127*0.35;
      gn.gain.setValueAtTime(0,t);gn.gain.linearRampToValueAtTime(a,t+0.01);o.connect(gn);gn.connect(this.master);o.start(t);
      const v={o,g:gn};on[e.ch*128+e.a]=v;run.voices.add(v)}
    else if(e.hi===8||(e.hi===9&&e.b===0)){const v=on[e.ch*128+e.a];if(v){delete on[e.ch*128+e.a];v.g.gain.cancelScheduledValues(t);v.g.gain.setValueAtTime(v.g.gain.value,t);v.g.gain.linearRampToValueAtTime(0,t+0.06);v.o.stop(t+0.08);setTimeout(()=>run.voices.delete(v),(t-c.currentTime+0.2)*1000)}}}};
})(typeof window!=="undefined"?window:globalThis);
