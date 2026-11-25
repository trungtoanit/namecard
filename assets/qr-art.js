/* Tuấn Tú – luxury share QR renderer (needs qrcodejs loaded first) */
(function(){
  const GOLD = ['#f8e6b0','#e0b865','#b0812f','#f3d58a'];
  function loadImg(src){return new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.onerror=()=>r(null);i.src=src})}
  function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
  function goldGrad(c,x0,y0,x1,y1){const g=c.createLinearGradient(x0,y0,x1,y1);GOLD.forEach((col,i)=>g.addColorStop(i/(GOLD.length-1),col));return g}
  function matrix(text){
    const tmp=document.createElement('div');
    const q=new QRCode(tmp,{text,width:64,height:64,correctLevel:QRCode.CorrectLevel.H});
    const m=q._oQRCode,n=m.getModuleCount(),out=[];
    for(let r=0;r<n;r++){out.push([]);for(let c=0;c<n;c++)out[r].push(m.isDark(r,c))}
    return out;
  }
  // draws a poster (1000 x 1250) onto canvas
  window.drawShareQR = async function(canvas, opt){
    const W=1000,H=1250; canvas.width=W; canvas.height=H; const c=canvas.getContext('2d');
    try{ await document.fonts.ready }catch(e){}
    const logo=await loadImg(opt.logo||'assets/logo-gold.png');
    // background
    const bg=c.createRadialGradient(W/2,H*.38,40,W/2,H*.5,H*.8);bg.addColorStop(0,'#24211b');bg.addColorStop(.55,'#121214');bg.addColorStop(1,'#070708');
    c.fillStyle=bg;c.fillRect(0,0,W,H);
    c.globalAlpha=.05;c.fillStyle='#fff';for(let y=0;y<H;y+=3)c.fillRect(0,y,W,1);c.globalAlpha=1;
    // light rays
    c.save();c.globalCompositeOperation='lighter';
    for(let i=0;i<18;i++){const a=i/18*Math.PI*2;const g=c.createLinearGradient(W/2,560,W/2+Math.cos(a)*700,560+Math.sin(a)*700);g.addColorStop(0,'rgba(255,215,140,.07)');g.addColorStop(1,'rgba(255,215,140,0)');
      c.fillStyle=g;c.beginPath();c.moveTo(W/2,560);c.lineTo(W/2+Math.cos(a-.05)*900,560+Math.sin(a-.05)*900);c.lineTo(W/2+Math.cos(a+.05)*900,560+Math.sin(a+.05)*900);c.fill()}
    c.restore();
    // frames
    c.lineWidth=4;c.strokeStyle=goldGrad(c,0,0,W,H);rr(c,26,26,W-52,H-52,56);c.stroke();
    c.lineWidth=1.2;c.globalAlpha=.55;rr(c,44,44,W-88,H-88,44);c.stroke();c.globalAlpha=1;
    // corner ornaments
    c.strokeStyle=goldGrad(c,0,0,W,0);c.lineWidth=2;
    [[70,70,1,1],[W-70,70,-1,1],[70,H-70,1,-1],[W-70,H-70,-1,-1]].forEach(([x,y,sx,sy])=>{c.beginPath();c.moveTo(x,y+sy*60);c.lineTo(x,y);c.lineTo(x+sx*60,y);c.stroke();
      c.beginPath();c.arc(x+sx*14,y+sy*14,4,0,7);c.fillStyle='#e0b865';c.fill()});
    // header: logo + brand
    if(logo)c.drawImage(logo,W/2-205,82,96,96);
    c.textBaseline='alphabetic';c.textAlign='left';c.fillStyle=goldGrad(c,0,90,0,180);
    c.font='700 46px Montserrat, "Be Vietnam Pro", "Noto Serif SC", sans-serif';c.fillText(opt.brand||'BAO BÌ TUẤN TÚ',W/2-92,138);
    c.font='500 20px Montserrat, sans-serif';c.fillStyle='#d9c79f';c.fillText((opt.brandSub||'TUAN TU PACKAGING').split('').join(' '),W/2-90,172);
    // QR panel
    const M=matrix(opt.url), n=M.length, size=600, cell=size/n, qx=(W-size)/2, qy=230;
    c.save();c.shadowColor='rgba(255,205,120,.45)';c.shadowBlur=60;c.fillStyle='#0c0c0e';rr(c,qx-44,qy-44,size+88,size+88,40);c.fill();c.restore();
    c.lineWidth=2.5;c.strokeStyle=goldGrad(c,qx,qy,qx+size,qy+size);rr(c,qx-44,qy-44,size+88,size+88,40);c.stroke();
    const isFinder=(r,col)=>(r<7&&col<7)||(r<7&&col>=n-7)||(r>=n-7&&col<7);
    const cx0=Math.floor(n/2), hole=Math.ceil(n*.22/2); // keep centre free for logo
    c.fillStyle=goldGrad(c,qx,qy,qx+size,qy+size);
    for(let r=0;r<n;r++)for(let col=0;col<n;col++){
      if(!M[r][col]||isFinder(r,col))continue;
      if(Math.abs(r-cx0)<=hole&&Math.abs(col-cx0)<=hole)continue;
      c.beginPath();c.arc(qx+col*cell+cell/2,qy+r*cell+cell/2,cell*.44,0,7);c.fill();
    }
    // finder eyes
    [[0,0],[0,n-7],[n-7,0]].forEach(([r,col])=>{const x=qx+col*cell,y=qy+r*cell,s=cell*7;
      c.lineWidth=cell;c.strokeStyle=goldGrad(c,x,y,x+s,y+s);rr(c,x+cell/2,y+cell/2,s-cell,s-cell,cell*1.8);c.stroke();
      c.fillStyle=goldGrad(c,x+s,y,x,y+s);rr(c,x+cell*2,y+cell*2,cell*3,cell*3,cell*1.1);c.fill()});
    // centre badge
    const b=(hole*2-1)*cell, bx=W/2-b/2, by=qy+size/2-b/2;
    c.fillStyle='#0c0c0e';rr(c,bx,by,b,b,b*.18);c.fill();c.lineWidth=2;c.strokeStyle=goldGrad(c,bx,by,bx+b,by+b);rr(c,bx,by,b,b,b*.18);c.stroke();
    if(logo)c.drawImage(logo,bx+b*.14,by+b*.14,b*.72,b*.72);
    // name & captions
    c.textAlign='center';
    c.fillStyle=goldGrad(c,0,960,0,1010);c.font='700 54px Montserrat, "Be Vietnam Pro", sans-serif';c.fillText(opt.name||'',W/2,1000);
    c.fillStyle='#e6d7b6';c.font='400 26px Montserrat, "Be Vietnam Pro", sans-serif';c.fillText(opt.title||'',W/2,1045);
    const lg=c.createLinearGradient(W/2-220,0,W/2+220,0);lg.addColorStop(0,'rgba(224,184,101,0)');lg.addColorStop(.5,'#e0b865');lg.addColorStop(1,'rgba(224,184,101,0)');
    c.fillStyle=lg;c.fillRect(W/2-220,1075,440,1.5);
    c.fillStyle='#f3e2b5';c.font='italic 500 32px "Cormorant Garamond", serif';c.fillText(opt.cta||'',W/2,1122);
    c.fillStyle='#9b8f76';c.font='400 20px Montserrat, sans-serif';c.fillText(opt.url.replace(/^https?:\/\//,'').replace(/\/$/,''),W/2,1162);
    return canvas;
  };
})();
