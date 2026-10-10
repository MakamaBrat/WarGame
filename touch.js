// Жесты для сенсорных экранов -> клавиши игры. Не зависит от DOM (тестируется в Node).
// Один палец: тап = OK (в нижних углах — софт-клавиши), перетаскивание = стрелки (шаг cfg.step игровых пикселей).
// Два пальца: щипок = зум, перетаскивание = сдвиг увеличенной картинки.
(function(g){
  const UP=-1,DOWN=-2,LEFT=-3,RIGHT=-4,OK=-5,SL=-6,SR=-7;
  function createGestures(o){
    const P=new Map();let mode="none",S=null;
    const tapKey=k=>{o.key(true,k);o.vib();setTimeout(()=>o.key(false,k),60)};
    const hyp=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),mid=(a,b)=>({x:(a.x+b.x)/2,y:(a.y+b.y)/2});
    const toGame=e=>{const r=o.rect();return{gx:(e.clientX-r.left)*o.cw()/r.width,gy:(e.clientY-r.top)*o.ch()/r.height,sx:r.width/o.cw(),sy:r.height/o.ch()}};
    function down(e){
      P.set(e.pointerId,{x:e.clientX,y:e.clientY});
      if(P.size===1){const t=toGame(e);S={sx:e.clientX,sy:e.clientY,lx:e.clientX,ly:e.clientY,gx:t.gx,gy:t.gy,moved:false,ax:0,ay:0};mode="one"}
      else if(P.size===2){const[a,b]=[...P.values()];const z=o.zoom.get();mode="pinch";S={d0:Math.max(1,hyp(a,b)),c0:mid(a,b),z0:{...z}}}
      else mode="none";
    }
    function move(e){
      const p=P.get(e.pointerId);if(!p)return;p.x=e.clientX;p.y=e.clientY;
      if(mode==="one"&&P.size===1){
        const t=toGame(e),scx=t.sx||1,scy=t.sy||1;
        if(!S.moved){if(Math.hypot(e.clientX-S.sx,e.clientY-S.sy)<=o.cfg().tapSlop)return;S.moved=true;S.ax=(e.clientX-S.sx)/scx;S.ay=(e.clientY-S.sy)/scy}
        else{S.ax+=(e.clientX-S.lx)/scx;S.ay+=(e.clientY-S.ly)/scy}
        S.lx=e.clientX;S.ly=e.clientY;
        const st=o.cfg().step;
        while(S.ax>=st){tapKey(RIGHT);S.ax-=st}while(S.ax<=-st){tapKey(LEFT);S.ax+=st}
        while(S.ay>=st){tapKey(DOWN);S.ay-=st}while(S.ay<=-st){tapKey(UP);S.ay+=st}
      }else if(mode==="pinch"&&P.size>=2){
        const[a,b]=[...P.values()],d=hyp(a,b),c=mid(a,b);
        o.zoom.set(S.z0.uz*d/S.d0,S.z0.px+(c.x-S.c0.x),S.z0.py+(c.y-S.c0.y));
      }
    }
    function up(e){
      if(!P.has(e.pointerId))return;
      const was=mode,s=S;P.delete(e.pointerId);
      if(was==="one"&&P.size===0&&s&&!s.moved){
        const cw=o.cw(),ch=o.ch();
        if(s.gy>ch-36&&s.gx<56)tapKey(SL);else if(s.gy>ch-36&&s.gx>cw-56)tapKey(SR);
        else{if(o.tapMap)o.tapMap(s.gx,s.gy);tapKey(OK)}
      }
      if(P.size===0){mode="none";S=null}else if(was==="pinch"){mode="none"}
    }
    return{down,move,up,cancel:e=>{P.delete(e.pointerId);if(!P.size){mode="none";S=null}}};
  }
  g.createGestures=createGestures;
  if(typeof module!=="undefined")module.exports=createGestures;
})(typeof window!=="undefined"?window:globalThis);
