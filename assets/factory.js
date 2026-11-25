/* Tuấn Tú – virtual factory tour (canvas). window.FactoryTour(canvas, opts) */
(function(){
const NAMES={
  vi:{flexo:'Máy in Flexo',offset:'Máy in Offset',coat:'Máy phủ UV',film:'Máy cán màng',boi:'Máy bồi tự động',die:'Máy bế tự động',fold:'Máy dán hộp tự động',carton:'Máy dán thùng tự động',robot:'Robot gắp thùng tự động',dock:'Xuất hàng · Dock container'},
  en:{flexo:'Flexo Printer',offset:'Offset Press',coat:'UV Coater',film:'Film Laminator',boi:'Auto Laminating Machine',die:'Auto Die-Cutter',fold:'Auto Folder-Gluer',carton:'Auto Carton Gluer',robot:'Robotic Palletizer',dock:'Container Dock Shipping'},
  zh:{flexo:'柔版印刷机',offset:'胶印机',coat:'UV上光机',film:'覆膜机',boi:'全自动裱纸机',die:'全自动模切机',fold:'全自动糊盒机',carton:'全自动粘箱机',robot:'自动码垛机器人',dock:'集装箱码头出货'}};
const DESC={
  vi:{flexo:'In trực tiếp lên tấm carton tốc độ cao',offset:'In 4–6 màu sắc nét cho hộp cao cấp',coat:'Phủ UV bóng / mờ bảo vệ bề mặt',film:'Cán màng bóng, mờ, màng nhung',boi:'Bồi giấy in lên sóng carton',die:'Bế định hình chính xác từng milimet',fold:'Gấp và dán hộp tốc độ cao',carton:'Gấp dán thùng carton tự động',robot:'Robot xếp pallet chính xác 24/7',dock:'Đóng container – giao hàng đúng hẹn'},
  en:{flexo:'High-speed direct printing on corrugated board',offset:'Sharp 4–6 colour printing for premium boxes',coat:'Gloss or matte UV coating',film:'Gloss, matte & soft-touch film',boi:'Mounting printed sheets onto corrugated board',die:'Precision die-cutting & creasing',fold:'High-speed folding & gluing',carton:'Automatic carton folding & gluing',robot:'Precise 24/7 robotic palletizing',dock:'Container loading – on-time delivery'},
  zh:{flexo:'瓦楞纸板高速直印',offset:'4–6色高精度印刷',coat:'UV亮油/哑油表面保护',film:'亮膜、哑膜、触感膜',boi:'彩印面纸精准裱瓦楞',die:'精准模切压痕',fold:'高速折叠糊盒',carton:'纸箱自动折叠粘箱',robot:'24小时精准码垛',dock:'集装箱装车，准时交付'}};
const BRAND={vi:'BAO BÌ TUẤN TÚ',en:'TUAN TU PACKAGING',zh:'俊秀包装'};
const TITLE={vi:'NHÀ MÁY BAO BÌ TUẤN TÚ',en:'TUAN TU PACKAGING FACTORY',zh:'俊秀包装工厂'};

const ST=[
 {k:'flexo',n:1,x:320,w:300},{k:'flexo',n:2,x:720,w:300},{k:'flexo',n:3,x:1120,w:300},
 {k:'offset',n:1,x:1560,w:420},{k:'offset',n:2,x:2080,w:420},{k:'offset',n:3,x:2600,w:420},
 {k:'coat',x:3120,w:300},{k:'film',x:3520,w:320},{k:'boi',x:3940,w:340},{k:'die',x:4380,w:300},
 {k:'fold',x:4780,w:440},{k:'carton',x:5320,w:380},{k:'robot',x:5800,w:440},{k:'dock',x:6340,w:820}];
const ROB=ST[12], DOCK=ST[13];
const FLOOR=700, BELT=640, WORLD=7300, SPEED=70, GAP=150;
const PICKX=ROB.x+70, PALX=ROB.x+330;
const CONT={x:DOCK.x+150,w:560,h:250};
const DWELL=5, MOVE=1.6;
const GOLD='#d6ba80';

function FactoryTour(canvas,opt){
  const c=canvas.getContext('2d');
  let lang=opt.lang||'vi', W=0,H=0,S=1, t=0, last=0, playing=true, stIdx=0, stT=0, camX=0, onStation=opt.onStation||(()=>{}), forcedSize=null;
  // ---------- state ----------
  const items=[]; for(let x=PICKX-GAP;x>-200;x-=GAP)items.push({x});
  const robot={phase:'idle',p:0,hold:false};
  let pallet={x:PALX,n:0,moving:false,target:PALX};
  const moving=[]; // pallets travelling into container
  const truck={x:0,state:'loading',slots:0,doors:1,timer:0};
  let newPalletTimer=0;
  const sparks=[];

  function resize(){
    const dpr=Math.min(window.devicePixelRatio||1,2);
    const cw=forcedSize?forcedSize[0]:canvas.clientWidth, ch=forcedSize?forcedSize[1]:canvas.clientHeight;
    const k=forcedSize?1:dpr;
    canvas.width=Math.round(cw*k);canvas.height=Math.round(ch*k);
    W=canvas.width;H=canvas.height;S=H/900;
  }
  // ---------- helpers ----------
  const lerp=(a,b,k)=>a+(b-a)*k, ease=k=>k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2, clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function lg(x0,y0,x1,y1,stops){const g=c.createLinearGradient(x0,y0,x1,y1);stops.forEach((s,i)=>g.addColorStop(i/(stops.length-1),s));return g}
  function rr(x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
  function body(x,y,w,h,col){
    c.fillStyle=lg(0,y,0,y+h,col||['#34343b','#1d1d22','#141418']);rr(x,y,w,h,10);c.fill();
    c.strokeStyle='rgba(214,186,128,.55)';c.lineWidth=2;rr(x,y,w,h,10);c.stroke();
    c.fillStyle='rgba(255,255,255,.06)';c.fillRect(x+6,y+4,w-12,3);
  }
  function leds(x,y,n){for(let i=0;i<n;i++){const on=(Math.sin(t*3+i*1.7+x)>0);c.fillStyle=on?['#3dff8a','#ffcc33','#33c3ff'][i%3]:'#2a2a2f';c.beginPath();c.arc(x+i*12,y,3.5,0,7);c.fill()}}
  function screen(x,y,w,h){c.fillStyle='#071318';rr(x,y,w,h,4);c.fill();c.strokeStyle='#3aa7c9';c.lineWidth=1.2;c.beginPath();
    for(let i=0;i<=20;i++){const px=x+4+i*(w-8)/20,py=y+h/2+Math.sin(t*2+i*.8+x)*h*.28;i?c.lineTo(px,py):c.moveTo(px,py)}c.stroke();
    c.fillStyle='rgba(58,167,201,.15)';c.fillRect(x,y,w,h)}
  function roller(x,y,r,col){c.fillStyle=lg(x-r,y-r,x+r,y+r,['#d9d9de','#7b7b84','#3a3a40']);c.beginPath();c.arc(x,y,r,0,7);c.fill();
    if(col){c.strokeStyle=col;c.lineWidth=r*.35;c.beginPath();c.arc(x,y,r*.82,0,7);c.stroke()}
    c.strokeStyle='rgba(20,20,24,.8)';c.lineWidth=2;const a=t*4;for(let i=0;i<3;i++){c.beginPath();c.moveTo(x,y);c.lineTo(x+Math.cos(a+i*2.09)*r*.7,y+Math.sin(a+i*2.09)*r*.7);c.stroke()}
    c.fillStyle='#1a1a1e';c.beginPath();c.arc(x,y,r*.22,0,7);c.fill()}
  function slot(x,w){[[x-8,0],[x+w-14,1]].forEach(([sx])=>{c.fillStyle='#050506';rr(sx,BELT-30,22,46,4);c.fill();c.strokeStyle='rgba(214,186,128,.6)';c.lineWidth=1.5;rr(sx,BELT-30,22,46,4);c.stroke()})}
  function glow(x,y,r,col,a){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col.replace('A',a));g.addColorStop(1,col.replace('A',0));c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2)}
  function box3d(x,by,w,h,d,front,top,side){const y=by-h;c.fillStyle=front;c.fillRect(x,y,w,h);c.fillStyle=top;c.beginPath();c.moveTo(x,y);c.lineTo(x+d,y-d*.6);c.lineTo(x+w+d,y-d*.6);c.lineTo(x+w,y);c.fill();c.fillStyle=side;c.beginPath();c.moveTo(x+w,y);c.lineTo(x+w+d,y-d*.6);c.lineTo(x+w+d,by-d*.6);c.lineTo(x+w,by);c.fill();return y}

  // ---------- product appearance by stage ----------
  const centers=ST.map(s=>s.x+s.w/2);
  function stageOf(x){let s=0;for(let i=0;i<12;i++)if(x>centers[i])s=i+1;return s}
  function drawSheet(x,y,top,thick,deco){ // flat sheet seen at a slight angle
    const w=96,d=22;c.fillStyle=thick;c.fillRect(x-w/2,y-6,w,6);
    c.fillStyle=top;c.beginPath();c.moveTo(x-w/2,y-6);c.lineTo(x-w/2+d,y-6-d*.5);c.lineTo(x+w/2+d,y-6-d*.5);c.lineTo(x+w/2,y-6);c.fill();
    if(deco)deco(x-w/2,y-6,w,d);
  }
  function stripe(x0,y0,w,d,f0,f1,col){c.fillStyle=col;c.beginPath();c.moveTo(x0+w*f0,y0);c.lineTo(x0+w*f0+d,y0-d*.5);c.lineTo(x0+w*f1+d,y0-d*.5);c.lineTo(x0+w*f1,y0);c.fill()}
  function drawItem(x,s,y){
    y=y||BELT;
    if(s===0)return drawSheet(x,y,'#d4ae78','#a57f4b');
    if(s<=3)return drawSheet(x,y,'#d4ae78','#a57f4b',(x0,y0,w,d)=>{const cols=['#c0392b','#1f5fbf','#1a1a1a'];for(let i=0;i<s;i++)stripe(x0,y0,w,d,.12+i*.24,.26+i*.24,cols[i])});
    if(s<=6)return drawSheet(x,y,'#f7f4ee','#d8d2c6',(x0,y0,w,d)=>{const cols=['#00a3e0','#e6007e','#ffd400','#1a1a1a'];const n=s===4?2:s===5?3:4;for(let i=0;i<n;i++)stripe(x0,y0,w,d,.08+i*.22,.24+i*.22,cols[i]);});
    if(s<=9){drawSheet(x,y,'#f7f4ee',s>=9?'#b58d58':'#d8d2c6',(x0,y0,w,d)=>{const cols=['#00a3e0','#e6007e','#ffd400','#1a1a1a'];for(let i=0;i<4;i++)stripe(x0,y0,w,d,.08+i*.22,.24+i*.22,cols[i]);
        c.fillStyle=s>=8?'rgba(255,255,255,.45)':'rgba(255,255,255,.25)';stripe(x0,y0,w,d,.55,.68,c.fillStyle)});
      if(s>=9){c.fillStyle='#b58d58';c.fillRect(x-48,y-10,96,4)}return}
    if(s===10){ // die-cut flat blank (cross shape)
      c.fillStyle='#f3efe6';c.beginPath();const yy=y-8;c.moveTo(x-50,yy);c.lineTo(x-30,yy-10);c.lineTo(x-10,yy-10);c.lineTo(x-6,yy-18);c.lineTo(x+26,yy-18);c.lineTo(x+30,yy-10);c.lineTo(x+60,yy-10);c.lineTo(x+40,yy);c.fill();
      c.fillStyle='#e6007e';c.fillRect(x-20,yy-6,14,3);c.fillStyle='#00a3e0';c.fillRect(x,yy-6,14,3);c.fillStyle='#b58d58';c.fillRect(x-50,y-8,90,8);return}
    if(s===11){box3d(x-26,y,52,36,12,lg(0,y-36,0,y,['#2b6cb0','#1a3f6b']),'#e6007e','#13304f');c.fillStyle='#ffd400';c.fillRect(x-20,y-24,26,4);return}
    // packed shipping carton
    const yy=box3d(x-36,y,72,52,14,lg(0,y-52,0,y,['#d0a86f','#9c7442']),'#e5c68f','#7d5a30');
    c.fillStyle='rgba(150,110,60,.8)';c.fillRect(x-4,yy,8,14);c.fillStyle='rgba(40,28,12,.6)';c.font='700 9px Montserrat,sans-serif';c.textAlign='center';c.fillText('TUẤN TÚ',x,yy+33);
  }

  // ---------- machines ----------
  function drawFlexo(s){const x=s.x,w=s.w,y=FLOOR-250,ink=['#c0392b','#1f5fbf','#111'][s.n-1];
    // ink tanks
    for(let i=0;i<3;i++){c.fillStyle=lg(0,y-60,0,y,['#3b3b42','#202025']);rr(x+40+i*80,y-58,46,58,8);c.fill();c.fillStyle=ink;c.globalAlpha=.85;c.fillRect(x+46+i*80,y-30+Math.sin(t*2+i)*3,34,24);c.globalAlpha=1}
    body(x,y,w,250);
    c.fillStyle='#0b0b0e';rr(x+24,y+40,w-48,120,8);c.fill();
    roller(x+80,y+100,30,ink);roller(x+150,y+100,30);roller(x+220,y+100,30,ink);
    c.fillStyle=ink;c.globalAlpha=.6;c.fillRect(x+40,y+140,w-80,10);c.globalAlpha=1;
    screen(x+24,y+175,90,42);leds(x+140,y+198,5);
    slot(x,w); // feed slot
  }
  function drawOffset(s){const x=s.x,w=s.w,y=FLOOR-270;const cmyk=['#00a3e0','#e6007e','#ffd400','#1a1a1a'];
    // feeder pile
    c.fillStyle='#f4f1ea';for(let i=0;i<7;i++)c.fillRect(x-40,y+150+i*7,52,5);
    body(x,y+40,w,230);
    for(let i=0;i<4;i++){const tx=x+20+i*98;c.fillStyle=lg(0,y,0,y+60,['#3a3a42','#1c1c21']);rr(tx,y,86,70,8);c.fill();c.strokeStyle='rgba(214,186,128,.45)';c.lineWidth=1.5;rr(tx,y,86,70,8);c.stroke();
      c.fillStyle=cmyk[i];rr(tx+8,y+8,70,12,4);c.fill();roller(tx+43,y+120,22,cmyk[i]);roller(tx+43,y+168,16)}
    // sheet travelling between towers
    const k=(t*0.8)%1,sx=x+20+k*(w-40);c.fillStyle='rgba(255,255,255,.9)';c.fillRect(sx,y+142,40,3);
    screen(x+20,y+205,100,44);leds(x+150,y+230,6);
    slot(x,w);
  }
  function drawCoat(s){const x=s.x,w=s.w,y=FLOOR-230;body(x,y,w,230);
    c.fillStyle='#0b0b0e';rr(x+26,y+36,w-52,110,8);c.fill();
    const a=.35+.25*Math.sin(t*6);glow(x+w/2,y+96,150,'rgba(150,90,255,A)',a);
    c.fillStyle='#b9a2ff';rr(x+50,y+46,w-100,10,4);c.fill();c.fillStyle='#e9e0ff';c.fillRect(x+60,y+50,w-120,3);
    roller(x+90,y+118,22,'#f1f1f1');roller(x+w-90,y+118,22);
    screen(x+26,y+160,80,40);leds(x+130,y+182,4);slot(x,w);}
  function drawFilm(s){const x=s.x,w=s.w,y=FLOOR-230;
    // film roll on top
    const rx=x+w/2,ry=y-34;c.fillStyle=lg(rx-60,ry-30,rx+60,ry+30,['rgba(220,230,240,.9)','rgba(150,170,190,.7)','rgba(230,240,250,.9)']);rr(rx-70,ry-26,140,52,26);c.fill();
    c.strokeStyle='rgba(255,255,255,.7)';c.lineWidth=1.5;const o=(t*30)%20;for(let i=-60;i<70;i+=20){c.beginPath();c.moveTo(rx+i+o-10,ry-24);c.lineTo(rx+i+o-10,ry+24);c.stroke()}
    c.strokeStyle='rgba(200,220,240,.6)';c.lineWidth=3;c.beginPath();c.moveTo(rx,ry+26);c.lineTo(rx-30,y+80);c.stroke();
    body(x,y,w,230);c.fillStyle='#0b0b0e';rr(x+24,y+40,w-48,110,8);c.fill();
    glow(x+w/2,y+100,90,'rgba(255,120,40,A)',.35+.15*Math.sin(t*4));
    roller(x+w/2-40,y+100,26,'#ff7a2e');roller(x+w/2+40,y+100,26);
    screen(x+24,y+165,84,40);leds(x+140,y+186,4);slot(x,w);}
  function drawBoi(s){const x=s.x,w=s.w,y=FLOOR-250;
    // two feeders
    c.fillStyle='#f4f1ea';for(let i=0;i<6;i++)c.fillRect(x+30,y-40+i*6,90,4);
    c.fillStyle='#c9a06a';for(let i=0;i<6;i++)c.fillRect(x+w-120,y-40+i*7,90,5);
    body(x,y,w,250);c.fillStyle='#0b0b0e';rr(x+24,y+36,w-48,124,8);c.fill();
    roller(x+w/2-34,y+96,28,'#f0b429');roller(x+w/2+34,y+96,28);roller(x+w/2,y+140,18);
    const k=(t*.9)%1;c.fillStyle='#f4f1ea';c.fillRect(x+40+k*(w/2-60),y+60,40,3);c.fillStyle='#c9a06a';c.fillRect(x+w-80-k*(w/2-60),y+70,40,4);
    screen(x+24,y+178,90,44);leds(x+150,y+200,5);slot(x,w);}
  function drawDie(s){const x=s.x,w=s.w,y=FLOOR-300;
    body(x,y,w,300,['#3a3a41','#222228','#16161a']);
    const ph=(t*1.1)%1, down=ph<.15?ease(ph/.15):ph<.25?1:ph<.5?1-ease((ph-.25)/.25):0;
    c.fillStyle='#0b0b0e';rr(x+30,y+40,w-60,180,8);c.fill();
    // columns
    c.fillStyle=lg(0,0,20,0,['#9a9aa2','#56565e']);c.fillRect(x+44,y+50,16,160);c.fillRect(x+w-60,y+50,16,160);
    const py=y+60+down*90;c.fillStyle=lg(0,py,0,py+40,['#6d6d75','#34343a']);rr(x+64,py,w-128,40,4);c.fill();c.strokeStyle=GOLD;c.lineWidth=1.5;rr(x+64,py,w-128,40,4);c.stroke();
    c.fillStyle='#4a4a52';c.fillRect(x+64,y+200,w-128,14);
    if(ph>.14&&ph<.18&&sparks.length<60)for(let i=0;i<14;i++)sparks.push({x:x+w/2+(Math.random()-.5)*(w-140),y:y+196,vx:(Math.random()-.5)*160,vy:-Math.random()*160,l:1});
    screen(x+30,y+232,90,44);leds(x+150,y+256,5);slot(x,w);}
  function drawFold(s){const x=s.x,w=s.w,y=FLOOR-170;
    body(x,y,w,170);c.fillStyle='#0b0b0e';rr(x+20,y+24,w-40,70,8);c.fill();
    // belt
    c.fillStyle='#26262c';c.fillRect(x+26,y+70,w-52,14);c.strokeStyle='#4a4a52';c.lineWidth=2;const o=(t*80)%24;for(let i=0;i<w-52;i+=24){c.beginPath();c.moveTo(x+26+i+o,y+70);c.lineTo(x+26+i+o,y+84);c.stroke()}
    // folding arms
    for(let i=0;i<3;i++){const ax=x+90+i*120,a=Math.sin(t*4+i)*.9;c.strokeStyle=GOLD;c.lineWidth=5;c.beginPath();c.moveTo(ax,y+30);c.lineTo(ax+Math.cos(a-1.57)*0+Math.sin(a)*34,y+30+Math.cos(a)*34);c.stroke();c.fillStyle='#e8d199';c.beginPath();c.arc(ax,y+30,5,0,7);c.fill()}
    // glue jets
    for(let i=0;i<4;i++){const on=Math.sin(t*9+i*1.3)>.4;c.fillStyle=on?'#33c3ff':'#1b3a48';c.beginPath();c.arc(x+60+i*100,y+56,4,0,7);c.fill();if(on)glow(x+60+i*100,y+56,16,'rgba(51,195,255,A)',.6)}
    screen(x+26,y+104,90,40);leds(x+140,y+126,6);slot(x,w);}
  function drawCarton(s){const x=s.x,w=s.w,y=FLOOR-260;
    body(x,y,w,260);c.fillStyle='#0b0b0e';rr(x+24,y+36,w-48,140,8);c.fill();
    // flap folding demo: box in window with flaps animating
    const bx=x+w/2-40,by=y+150,a=(Math.sin(t*2.4)+1)/2;
    box3d(bx,by,80,56,14,lg(0,by-56,0,by,['#d0a86f','#9c7442']),'#e5c68f','#7d5a30');
    c.fillStyle='#d9b880';c.save();c.translate(bx,by-56);c.beginPath();c.moveTo(0,0);c.lineTo(40,0);c.lineTo(40-a*10,-34*(1-a));c.lineTo(-a*4,-34*(1-a));c.fill();c.restore();
    c.save();c.translate(bx+80,by-56);c.beginPath();c.moveTo(0,0);c.lineTo(-40,0);c.lineTo(-40+a*10,-34*(1-a));c.lineTo(a*4,-34*(1-a));c.fill();c.restore();
    // pusher arms
    c.strokeStyle=GOLD;c.lineWidth=6;c.beginPath();c.moveTo(x+40,y+70);c.lineTo(bx-6+a*6,y+100);c.stroke();c.beginPath();c.moveTo(x+w-40,y+70);c.lineTo(bx+94-a*6,y+100);c.stroke();
    screen(x+24,y+190,90,44);leds(x+150,y+212,5);slot(x,w);}
  // robot
  function ik(bx,by,tx,ty,l1,l2){const dx=tx-bx,dy=ty-by;let d=Math.hypot(dx,dy);d=Math.min(d,l1+l2-1);const a=Math.atan2(dy,dx),b=Math.acos((l1*l1+d*d-l2*l2)/(2*l1*d));const s=a-b;return [s,{x:bx+Math.cos(s)*l1,y:by+Math.sin(s)*l1}]}
  const RB={x:ROB.x+200,y:FLOOR-200}, L1=150, L2=150;
  function robotTarget(){const home={x:RB.x,y:RB.y-160};const pick={x:PICKX,y:BELT-72};const n=pallet.n,col=n%2,row=Math.floor(n/2);
    const place={x:PALX-38+col*76,y:FLOOR-14-row*52-72};
    const p=robot.p;let pt;
    if(robot.phase==='idle')return home;
    const segs=[[0,.2,home,{x:pick.x,y:pick.y-80}],[.2,.3,{x:pick.x,y:pick.y-80},pick],[.3,.42,pick,{x:pick.x,y:pick.y-110}],[.42,.68,{x:pick.x,y:pick.y-110},{x:place.x,y:place.y-110}],[.68,.78,{x:place.x,y:place.y-110},place],[.78,1,place,home]];
    for(const [a,b,A,B] of segs)if(p>=a&&p<=b){const k=ease((p-a)/(b-a));pt={x:lerp(A.x,B.x,k),y:lerp(A.y,B.y,k)};if(a===.42)pt.y-=Math.sin(k*Math.PI)*60;return pt}
    return home}
  function drawRobot(){
    // safety fence
    c.strokeStyle='rgba(255,200,60,.35)';c.lineWidth=2;for(let i=0;i<=8;i++){const fx=ROB.x+10+i*52;c.beginPath();c.moveTo(fx,FLOOR);c.lineTo(fx,FLOOR-150);c.stroke()}c.beginPath();c.moveTo(ROB.x+10,FLOOR-150);c.lineTo(ROB.x+426,FLOOR-150);c.stroke();
    // pedestal
    c.fillStyle=lg(0,RB.y,0,FLOOR,['#3a3a42','#1a1a1f']);c.fillRect(RB.x-40,RB.y,80,FLOOR-RB.y);c.strokeStyle='rgba(214,186,128,.5)';c.strokeRect(RB.x-40,RB.y,80,FLOOR-RB.y);
    const tg=robotTarget();const [s1,el]=ik(RB.x,RB.y,tg.x,tg.y,L1,L2);
    c.lineCap='round';
    c.strokeStyle='#e0b865';c.lineWidth=26;c.beginPath();c.moveTo(RB.x,RB.y);c.lineTo(el.x,el.y);c.stroke();
    c.strokeStyle='#f3d58a';c.lineWidth=18;c.beginPath();c.moveTo(el.x,el.y);c.lineTo(tg.x,tg.y);c.stroke();
    c.strokeStyle='rgba(0,0,0,.25)';c.lineWidth=4;c.beginPath();c.moveTo(RB.x,RB.y);c.lineTo(el.x,el.y);c.stroke();
    c.fillStyle='#1d1d22';[[RB.x,RB.y,20],[el.x,el.y,15]].forEach(([a,b,r])=>{c.beginPath();c.arc(a,b,r,0,7);c.fill();c.strokeStyle=GOLD;c.lineWidth=3;c.stroke()});
    // gripper
    c.fillStyle='#2a2a30';c.fillRect(tg.x-30,tg.y-6,60,12);c.fillStyle='#7a7a84';c.fillRect(tg.x-30,tg.y+6,6,14);c.fillRect(tg.x+24,tg.y+6,6,14);
    if(robot.hold)drawItem(tg.x,12,tg.y+72);
    c.lineCap='butt';
  }
  function drawPallet(p){const x=p.x;c.fillStyle='#8a6a42';c.fillRect(x-80,FLOOR-14,160,14);c.fillStyle='#5e4528';for(let i=0;i<4;i++)c.fillRect(x-76+i*48,FLOOR-14,14,14);
    for(let i=0;i<p.n;i++){const col=i%2,row=Math.floor(i/2);drawItem(x-38+col*76,12,FLOOR-14-row*52)}
    if(p.n>=6){c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=1;for(let k=0;k<6;k++){c.beginPath();c.moveTo(x-76,FLOOR-20-k*28);c.lineTo(x+82,FLOOR-30-k*28);c.stroke()}}}
  function drawDock(){
    const dx=DOCK.x;
    // building wall with dock door
    c.fillStyle=lg(0,FLOOR-420,0,FLOOR,['#202026','#15151a']);c.fillRect(dx,FLOOR-420,110,420);
    c.fillStyle='#0b0b0d';c.fillRect(dx+20,FLOOR-300,90,300);
    c.fillStyle='#ffcc33';for(let i=0;i<8;i++){c.fillStyle=i%2?'#ffcc33':'#1a1a1a';c.fillRect(dx+20,FLOOR-300+i*37,8,37)}
    c.fillStyle=GOLD;c.font='700 18px Montserrat,sans-serif';c.textAlign='center';c.fillText('DOCK 01',dx+65,FLOOR-320);
    glow(dx+65,FLOOR-300,80,'rgba(255,220,150,A)',.25);
    // dock leveler
    c.fillStyle='#3a3a40';c.fillRect(dx+110,FLOOR-8,60,8);
    // truck & container
    const tx=CONT.x+truck.x;
    c.save();
    const cy=FLOOR-CONT.h;
    // container back (inside)
    c.fillStyle='#1b2c3a';c.fillRect(tx,cy,CONT.w,CONT.h);
    c.strokeStyle='rgba(255,255,255,.06)';c.lineWidth=2;for(let i=10;i<CONT.w;i+=16){c.beginPath();c.moveTo(tx+i,cy+6);c.lineTo(tx+i,cy+CONT.h-6);c.stroke()}
    // pallets inside
    for(let k=0;k<truck.slots;k++)drawPallet({x:tx+CONT.w-90-k*125,n:6});
    // container frame + translucent side wall
    c.fillStyle='rgba(40,70,100,.28)';c.fillRect(tx,cy,CONT.w,CONT.h);
    c.strokeStyle='#d6ba80';c.lineWidth=3;c.strokeRect(tx,cy,CONT.w,CONT.h);
    c.fillStyle='rgba(214,186,128,.9)';c.font='800 34px Montserrat,sans-serif';c.textAlign='center';c.globalAlpha=.5;c.fillText('TUẤN TÚ',tx+CONT.w/2,cy+60);c.globalAlpha=1;
    // doors at the dock end
    if(truck.doors<1){c.fillStyle=`rgba(36,56,74,${(1-truck.doors)*.9})`;c.fillRect(tx,cy,CONT.w,CONT.h);c.strokeStyle=GOLD;c.lineWidth=2;c.strokeRect(tx,cy,CONT.w,CONT.h);
      c.fillStyle='rgba(214,186,128,.9)';c.font='800 34px Montserrat,sans-serif';c.textAlign='center';c.globalAlpha=(1-truck.doors)*.8;c.fillText('TUẤN TÚ',tx+CONT.w/2,cy+CONT.h/2+12);c.globalAlpha=1}
    c.fillStyle='#d6ba80';c.fillRect(tx-4,cy,8,CONT.h);
    // chassis + cab
    c.fillStyle='#111';c.fillRect(tx-10,FLOOR,CONT.w+150,14);
    const wr=t*(truck.state==='leaving'||truck.state==='arriving'?8:0);
    [tx+60,tx+120,tx+CONT.w-80,tx+CONT.w+60,tx+CONT.w+120].forEach(wx=>{c.fillStyle='#0c0c0c';c.beginPath();c.arc(wx,FLOOR+26,22,0,7);c.fill();c.strokeStyle='#6a6a70';c.lineWidth=4;c.beginPath();c.arc(wx,FLOOR+26,12,wr,wr+5);c.stroke()});
    const cx=tx+CONT.w+10;c.fillStyle=lg(cx,0,cx+140,0,['#2a2a30','#3d3d45']);rr(cx,FLOOR-170,140,170,14);c.fill();c.strokeStyle=GOLD;c.lineWidth=2;rr(cx,FLOOR-170,140,170,14);c.stroke();
    c.fillStyle='rgba(120,190,255,.35)';rr(cx+70,FLOOR-160,62,60,8);c.fill();
    c.fillStyle='#ffd27a';c.beginPath();c.arc(cx+136,FLOOR-40,6,0,7);c.fill();glow(cx+150,FLOOR-40,60,'rgba(255,210,120,A)',.4);
    c.restore();
  }
  // ---------- background ----------
  function drawBg(vx,vw){
    const par=vx*.45;
    c.fillStyle=lg(0,0,0,FLOOR,['#0e0e11','#17161a','#1b1a1d']);c.fillRect(vx,0,vw,FLOOR);
    // wall panels & windows (parallax)
    c.save();c.translate(vx-par,0);
    for(let i=Math.floor(par/240)-1;i<(par+vw)/240+2;i++){const x=i*240;c.fillStyle='rgba(255,255,255,.025)';c.fillRect(x,60,220,300);
      c.fillStyle='rgba(120,160,200,.07)';for(let r=0;r<3;r++)for(let k=0;k<4;k++)c.fillRect(x+16+k*50,80+r*90,40,70);
      c.fillStyle='rgba(214,186,128,.12)';c.fillRect(x,370,240,3)}
    // brand sign
    for(let i=Math.floor(par/1600)-1;i<(par+vw)/1600+2;i++){c.fillStyle='rgba(214,186,128,.16)';c.font='800 64px Montserrat,sans-serif';c.textAlign='left';c.fillText('TUẤN TÚ PACKAGING',i*1600+200,300)}
    c.restore();
    // roof truss + lights
    c.strokeStyle='rgba(214,186,128,.12)';c.lineWidth=3;
    const s0=Math.floor(vx/200)*200;for(let x=s0;x<vx+vw+200;x+=200){c.beginPath();c.moveTo(x,20);c.lineTo(x+100,60);c.lineTo(x+200,20);c.stroke();
      const g=c.createLinearGradient(x+100,60,x+100,FLOOR);g.addColorStop(0,'rgba(255,230,180,.10)');g.addColorStop(1,'rgba(255,230,180,0)');c.fillStyle=g;c.beginPath();c.moveTo(x+90,62);c.lineTo(x+110,62);c.lineTo(x+170,FLOOR);c.lineTo(x+30,FLOOR);c.fill();
      c.fillStyle='#fff3d0';c.fillRect(x+88,58,24,5)}
    c.beginPath();c.moveTo(vx,20);c.lineTo(vx+vw,20);c.stroke();
    // floor
    c.fillStyle=lg(0,FLOOR,0,900,['#1f1e22','#0d0d0f']);c.fillRect(vx,FLOOR,vw,200);
    c.fillStyle='rgba(255,204,51,.55)';c.fillRect(vx,FLOOR+40,vw,4);c.fillRect(vx,FLOOR+150,vw,3);
    c.fillStyle='rgba(255,255,255,.04)';for(let x=Math.floor(vx/120)*120;x<vx+vw;x+=120)c.fillRect(x,FLOOR+4,2,196);
  }
  function drawBelt(vx,vw){const x0=Math.max(-50,vx),x1=Math.min(PICKX+60,vx+vw);if(x1<x0)return;
    c.fillStyle='#2a2a30';c.fillRect(x0,BELT,x1-x0,12);c.fillStyle='#3d3d45';c.fillRect(x0,BELT,x1-x0,3);
    c.fillStyle='#55555e';const o=(t*SPEED)%30;for(let x=Math.floor(x0/30)*30;x<x1;x+=30)c.fillRect(x+o,BELT+4,10,3);
    c.fillStyle='#1a1a1f';for(let x=Math.floor(x0/160)*160;x<x1;x+=160)c.fillRect(x+10,BELT+12,10,FLOOR-BELT-12)}
  function drawLabel(s,i){const name=NAMES[lang][s.k]+(s.n?' '+s.n:''),x=s.x+s.w/2,y=FLOOR-(s.k==='die'?330:s.k==='flexo'||s.k==='boi'?330:s.k==='offset'?300:s.k==='robot'?380:s.k==='dock'?450:s.k==='fold'?200:s.k==='film'?300:290);
    c.font='600 22px Montserrat,"Be Vietnam Pro",sans-serif';const tw=c.measureText(name).width+64;
    c.fillStyle='rgba(10,10,12,.78)';rr(x-tw/2,y-46,tw,44,22);c.fill();c.strokeStyle=GOLD;c.lineWidth=1.5;rr(x-tw/2,y-46,tw,44,22);c.stroke();
    c.fillStyle=GOLD;c.beginPath();c.arc(x-tw/2+22,y-24,12,0,7);c.fill();c.fillStyle='#141414';c.font='700 13px Montserrat,sans-serif';c.textAlign='center';c.fillText(String(i+1).padStart(2,'0'),x-tw/2+22,y-19);
    c.fillStyle='#f3e2b5';c.font='600 22px Montserrat,"Be Vietnam Pro",sans-serif';c.textAlign='left';c.fillText(name,x-tw/2+42,y-16);
    c.strokeStyle='rgba(214,186,128,.5)';c.beginPath();c.moveTo(x,y-2);c.lineTo(x,y+18);c.stroke()}

  // ---------- simulation ----------
  function update(dt){
    t+=dt;
    // camera tour
    stT+=dt;const dwell=(ST[stIdx].k==='dock'?DWELL*2:DWELL);
    if(stT>dwell+MOVE){stT=0;stIdx=(stIdx+1)%ST.length;onStation(stIdx)}
    // conveyor items (queue at pick point)
    items.sort((a,b)=>b.x-a.x);
    for(let i=0;i<items.length;i++){const lim=i===0?PICKX:items[i-1].x-GAP*.7;items[i].x=Math.min(items[i].x+SPEED*dt,lim)}
    const lastX=items.length?items[items.length-1].x:PICKX;if(lastX>-200+GAP)items.push({x:lastX-GAP});
    // robot
    if(robot.phase==='idle'){if(items[0]&&items[0].x>=PICKX-1&&!pallet.moving&&pallet.n<6&&pallet.present!==false){robot.phase='cycle';robot.p=0}}
    else{robot.p+=dt/2.2;
      if(!robot.hold&&robot.p>=.3&&robot.p<.42){robot.hold=true;items.shift()}
      if(robot.hold&&robot.p>=.78){robot.hold=false;pallet.n++}
      if(robot.p>=1){robot.phase='idle';robot.p=0}}
    // full pallet → container
    if(pallet.n>=6&&!pallet.moving&&robot.phase==='idle'&&truck.state==='loading'&&truck.slots<4){pallet.moving=true;pallet.target=CONT.x+CONT.w-90-truck.slots*125}
    if(pallet.moving){pallet.x+=140*dt;if(pallet.x>=pallet.target){truck.slots++;pallet={x:PALX,n:0,moving:false,target:PALX,present:false};newPalletTimer=1.2}}
    if(pallet.present===false){newPalletTimer-=dt;if(newPalletTimer<=0)pallet.present=true}
    // truck cycle
    if(truck.state==='loading'&&truck.slots>=4&&!pallet.moving){truck.state='closing';truck.timer=0}
    if(truck.state==='closing'){truck.timer+=dt;truck.doors=1-Math.min(1,truck.timer/1.2);if(truck.timer>1.6){truck.state='leaving';truck.timer=0}}
    if(truck.state==='leaving'){truck.timer+=dt;truck.x=Math.pow(truck.timer,2)*120;if(truck.x>1400){truck.state='arriving';truck.timer=0;truck.slots=0}}
    if(truck.state==='arriving'){truck.timer+=dt;const k=Math.min(1,truck.timer/3.5);truck.x=1400*(1-ease(k));if(k>=1){truck.state='opening';truck.timer=0}}
    if(truck.state==='opening'){truck.timer+=dt;truck.doors=Math.min(1,truck.timer/1.2);if(truck.doors>=1){truck.state='loading'}}
    for(let i=sparks.length-1;i>=0;i--){const p=sparks[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=500*dt;p.l-=dt*2;if(p.l<=0)sparks.splice(i,1)}
  }
  function camTarget(i){const s=ST[i];const vw=W/S;return clamp(s.x+s.w/2-vw/2,-200,WORLD-vw)}
  function draw(){
    const vw=W/S;
    // camera
    const dwell=(ST[stIdx].k==='dock'?DWELL*2:DWELL);
    const prev=(stIdx-1+ST.length)%ST.length;
    let cx;if(stT<MOVE&&!(stIdx===0&&t<MOVE)){const k=ease(stT/MOVE);const a=camTarget(prev),b=camTarget(stIdx);cx=stIdx===0?b:lerp(a,b,k)}else cx=camTarget(stIdx);
    camX=cx;
    c.setTransform(S,0,0,S,-camX*S,0);
    drawBg(camX,vw);
    drawBelt(camX,vw);
    for(const it of items)if(it.x>camX-120&&it.x<camX+vw+120)drawItem(it.x,stageOf(it.x));
    const vis=s=>s.x+s.w>camX-200&&s.x<camX+vw+200;
    ST.forEach(s=>{if(!vis(s))return;({flexo:drawFlexo,offset:drawOffset,coat:drawCoat,film:drawFilm,boi:drawBoi,die:drawDie,fold:drawFold,carton:drawCarton}[s.k]||(()=>{}))(s)});
    if(vis(ROB)){drawRobot();if(pallet.present!==false||pallet.moving)drawPallet(pallet)}
    else if(pallet.moving)drawPallet(pallet);
    if(vis(DOCK))drawDock();
    if(pallet.moving&&vis(DOCK))drawPallet(pallet);
    c.fillStyle='#ffd98a';for(const p of sparks){c.globalAlpha=Math.max(0,p.l);c.fillRect(p.x,p.y,3,3)}c.globalAlpha=1;
    ST.forEach((s,i)=>{if(vis(s))drawLabel(s,i)});
    // HUD (screen space) – burnt into the video
    c.setTransform(1,0,0,1,0,0);
    const v=c.createRadialGradient(W/2,H/2,H*.3,W/2,H/2,H*.95);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.6)');c.fillStyle=v;c.fillRect(0,0,W,H);
    const u=H/900, s=ST[stIdx];
    c.fillStyle='rgba(8,8,10,.72)';c.fillRect(0,H-150*u,W,150*u);
    c.fillStyle=GOLD;c.fillRect(0,H-150*u,W,2*u);
    c.textAlign='left';c.fillStyle='#d6ba80';c.font=`600 ${20*u}px Montserrat,sans-serif`;c.fillText(`${String(stIdx+1).padStart(2,'0')} / ${ST.length}  ·  ${TITLE[lang]}`,40*u,H-108*u);
    c.fillStyle='#f6e7c1';c.font=`700 ${44*u}px Montserrat,"Be Vietnam Pro",sans-serif`;c.fillText(NAMES[lang][s.k]+(s.n?' '+s.n:''),40*u,H-62*u);
    c.fillStyle='#cfc3a8';c.font=`400 ${24*u}px Montserrat,"Be Vietnam Pro",sans-serif`;c.fillText(DESC[lang][s.k],40*u,H-26*u);
    // progress
    const prog=(stIdx+Math.min(1,stT/(dwell+MOVE)))/ST.length;c.fillStyle='rgba(255,255,255,.12)';c.fillRect(0,H-4*u,W,4*u);c.fillStyle='#e0b865';c.fillRect(0,H-4*u,W*prog,4*u);
    // brand mark
    c.textAlign='right';c.fillStyle='rgba(243,226,181,.85)';c.font=`700 ${22*u}px Montserrat,sans-serif`;c.fillText(BRAND[lang],W-40*u,52*u);
    c.fillStyle='rgba(243,226,181,.55)';c.font=`500 ${14*u}px Montserrat,sans-serif`;c.fillText('VIRTUAL FACTORY TOUR',W-40*u,74*u);
  }
  let raf=0, visible=true;
  function frame(now){raf=requestAnimationFrame(frame);if(!visible&&!forcedSize)return;const dt=Math.min(.05,(now-(last||now))/1000);last=now;if(playing)update(dt);draw()}
  resize();addEventListener('resize',()=>{if(!forcedSize)resize()});
  new IntersectionObserver(e=>{visible=e[0].isIntersecting}).observe(canvas);
  // warm up the simulation so the line is already busy
  for(let i=0;i<600;i++){update(1/30)}stIdx=0;stT=0;t=0;
  raf=requestAnimationFrame(frame);
  return {
    setLang(l){lang=l},
    play(){playing=true},pause(){playing=false},toggle(){playing=!playing;return playing},
    go(i){stIdx=i;stT=MOVE;onStation(i)},
    restart(){stIdx=0;stT=0},
    stations:ST.map(s=>s.k+(s.n||'')),
    names(){return ST.map(s=>NAMES[lang][s.k]+(s.n?' '+s.n:''))},
    duration(){return ST.reduce((a,s)=>a+(s.k==='dock'?DWELL*2:DWELL)+MOVE,0)},
    setSize(w,h){forcedSize=w?[w,h]:null;resize()},
  };
}
window.FactoryTour=FactoryTour;
})();
