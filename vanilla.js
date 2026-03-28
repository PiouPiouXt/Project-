
/* ═══════════════════ CURSOR ═══════════════════ */
const cur = document.getElementById('cursor');
document.addEventListener('mousemove', e => { cur.style.left=e.clientX+'px'; cur.style.top=e.clientY+'px'; });
function bindCur() {
  document.querySelectorAll('button,a,input,.device-box,.tt').forEach(el => {
    el.addEventListener('mouseenter',()=>cur.classList.add('hover'));
    el.addEventListener('mouseleave',()=>cur.classList.remove('hover'));
  });
}
bindCur();

/* ═══════════════════ BG PARTICLES ═══════════════════ */
const bgC=document.getElementById('bg-canvas'), bgX=bgC.getContext('2d');
let W,H,pts=[];
const rsz=()=>{W=bgC.width=window.innerWidth;H=bgC.height=window.innerHeight;};
rsz(); window.addEventListener('resize',rsz);
for(let i=0;i<80;i++) pts.push({x:Math.random()*1920,y:Math.random()*1080,r:Math.random()*1.3+.3,vx:(Math.random()-.5)*.2,vy:(Math.random()-.5)*.2,a:Math.random()});
(function bgLoop(){
  bgX.clearRect(0,0,W,H);
  pts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0)p.x=W;if(p.x>W)p.x=0;if(p.y<0)p.y=H;if(p.y>H)p.y=0;bgX.beginPath();bgX.arc(p.x,p.y,p.r,0,Math.PI*2);bgX.fillStyle=`rgba(255,214,0,${p.a*.5})`;bgX.fill();});
  for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){const dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y,d=Math.sqrt(dx*dx+dy*dy);if(d<110){bgX.beginPath();bgX.moveTo(pts[i].x,pts[i].y);bgX.lineTo(pts[j].x,pts[j].y);bgX.strokeStyle=`rgba(255,214,0,${(1-d/110)*.055})`;bgX.lineWidth=.5;bgX.stroke();}}
  requestAnimationFrame(bgLoop);
})();

/* ═══════════════════ GAUGE ═══════════════════ */
const gc   = document.getElementById('gc');
const gctx = gc.getContext('2d');
const gtt  = document.getElementById('gtt');
const gKEl = document.getElementById('gKwh');

const G = { cx:200, cy:215, r:155, maxKwh:500, cur:0, target:0, af:null, hov:null };
const gAngle = v => Math.PI + Math.max(0,Math.min(1,v/G.maxKwh)) * Math.PI;
const TICKS = [0,50,100,150,200,250,300,400,500];

function drawGauge(v, hovFrac) {
  const c=gctx, W2=gc.width, H2=gc.height;
  c.clearRect(0,0,W2,H2);
  const a = gAngle(v);

  /* outer ambient halo */
  if(v>0){
    const halo=c.createRadialGradient(G.cx,G.cy,G.r-20,G.cx,G.cy,G.r+60);
    const intensity=0.05+(v/G.maxKwh)*0.1;
    halo.addColorStop(0,'rgba(255,214,0,0)');
    halo.addColorStop(.55,`rgba(255,214,0,${intensity})`);
    halo.addColorStop(1,'rgba(255,214,0,0)');
    c.beginPath(); c.arc(G.cx,G.cy,G.r+60,Math.PI,Math.PI*2); c.closePath();
    c.fillStyle=halo; c.fill();
  }

  /* track shadow */
  c.beginPath(); c.arc(G.cx,G.cy,G.r,Math.PI,Math.PI*2);
  c.strokeStyle='#0c0c0c'; c.lineWidth=36; c.stroke();
  /* track base */
  c.beginPath(); c.arc(G.cx,G.cy,G.r,Math.PI,Math.PI*2);
  c.strokeStyle='#1a1a1a'; c.lineWidth=28; c.stroke();

  /* filled arc */
  if(v>0){
    const grad=c.createLinearGradient(G.cx-G.r,G.cy,G.cx+G.r,G.cy);
    grad.addColorStop(0,'#4a3300'); grad.addColorStop(.5,'#FFD600'); grad.addColorStop(1,'#fff7aa');
    c.beginPath(); c.arc(G.cx,G.cy,G.r,Math.PI,a);
    c.strokeStyle=grad; c.lineWidth=26; c.lineCap='round'; c.stroke();
    /* inner glow pass */
    c.shadowColor='#FFD600'; c.shadowBlur=20;
    c.beginPath(); c.arc(G.cx,G.cy,G.r,Math.PI,a);
    c.strokeStyle='rgba(255,214,0,.28)'; c.lineWidth=34; c.stroke();
    c.shadowBlur=0;
  }

  /* ticks */
  TICKS.forEach(t=>{
    const ta=gAngle(t), active=v>=t, major=t%100===0||t===50||t===250;
    const r1=G.r+14, r2=G.r+(major?30:22);
    const cos=Math.cos(ta),sin=Math.sin(ta);
    c.beginPath(); c.moveTo(G.cx+r1*cos,G.cy+r1*sin); c.lineTo(G.cx+r2*cos,G.cy+r2*sin);
    c.strokeStyle=active?'#FFD600':'#282828'; c.lineWidth=major?2:1;
    if(active){c.shadowColor='#FFD600';c.shadowBlur=5;} c.stroke(); c.shadowBlur=0;
    if(major){
      const lr=G.r+48;
      c.font=`700 10px 'Orbitron',monospace`; c.fillStyle=active?'#FFD600':'#2e2e2e';
      c.textAlign='center'; c.textBaseline='middle';
      c.fillText(t+' kWh',G.cx+lr*cos,G.cy+lr*sin);
    }
  });

  /* needle */
  c.save(); c.translate(G.cx,G.cy); c.rotate(a);
  c.beginPath(); c.moveTo(-10,-2.5); c.lineTo(G.r-6,0); c.lineTo(-10,2.5);
  c.fillStyle='#FFD600'; c.shadowColor='#FFD600'; c.shadowBlur=14; c.fill(); c.shadowBlur=0;
  c.beginPath(); c.arc(0,0,9,0,Math.PI*2); c.fillStyle='#0e0e0e'; c.fill();
  c.beginPath(); c.arc(0,0,4.5,0,Math.PI*2); c.fillStyle='#FFD600'; c.fill();
  c.restore();

  /* hover indicator */
  if(hovFrac!==null){
    const ha=Math.PI+hovFrac*Math.PI;
    const hx=G.cx+G.r*Math.cos(ha),hy=G.cy+G.r*Math.sin(ha);
    c.beginPath(); c.arc(hx,hy,7,0,Math.PI*2);
    c.fillStyle='rgba(255,214,0,.45)'; c.fill();
  }

  /* edge labels */
  c.font=`700 11px 'Orbitron',monospace`; c.fillStyle='#2e2e2e'; c.textAlign='center'; c.textBaseline='middle';
  c.fillText('0',G.cx-G.r-14,G.cy+10);
  c.fillText('MAX',G.cx+G.r+18,G.cy+10);
}

function animTo(target){
  if(G.af) cancelAnimationFrame(G.af);
  const s=G.cur,diff=target-s,dur=1500,t0=performance.now();
  (function step(now){
    const p=Math.min((now-t0)/dur,1);
    const e=1-Math.pow(1-p,3);
    G.cur=s+diff*e;
    drawGauge(G.cur,G.hov);
    gKEl.textContent=G.cur.toFixed(1);
    if(p<1) G.af=requestAnimationFrame(step);
    else{G.cur=target;G.target=target;}
  })(t0);
}

/* gauge hover interaction */
gc.addEventListener('mousemove',e=>{
  const rect=gc.getBoundingClientRect();
  const sx=gc.width/rect.width, sy=gc.height/rect.height;
  const mx=(e.clientX-rect.left)*sx, my=(e.clientY-rect.top)*sy;
  const dx=mx-G.cx,dy=my-G.cy,dist=Math.sqrt(dx*dx+dy*dy);
  if(dist>=G.r-30&&dist<=G.r+60){
    let ang=Math.atan2(dy,dx);
    if(ang<0) ang+=Math.PI*2;
    const frac=(ang-Math.PI)/Math.PI;
    if(frac>=0&&frac<=1){
      G.hov=frac;
      gtt.style.display='block';
      gtt.style.left=(e.clientX-rect.left)+'px';
      gtt.style.top=(e.clientY-rect.top-14)+'px';
      gtt.textContent=(frac*G.maxKwh).toFixed(0)+' kWh';
      drawGauge(G.cur,frac); return;
    }
  }
  G.hov=null; gtt.style.display='none'; drawGauge(G.cur,null);
});
gc.addEventListener('mouseleave',()=>{ G.hov=null; gtt.style.display='none'; drawGauge(G.cur,null); });

/* entry animation: 0 → 250 → 0 */
drawGauge(0,null);
setTimeout(()=>{ animTo(250); setTimeout(()=>animTo(0),1900); },600);

/* ═══════════════════ DATA ═══════════════════ */
const APPS = [
  {name:'Ampoule LED',watts:10,icon:'💡'},
  {name:'Téléviseur',watts:100,icon:'📺'},
  {name:'Réfrigérateur',watts:200,icon:'🧊'},
  {name:'Fer à repasser',watts:1000,icon:'🔲'},
  {name:'Ordinateur',watts:150,icon:'💻'},
  {name:'Ventilateur',watts:50,icon:'🌀'},
  {name:'Climatiseur',watts:1500,icon:'❄️'},
  {name:'Machine à laver',watts:800,icon:'🫧'},
  {name:'Micro-ondes',watts:900,icon:'📡'},
];
const ST  = APPS.map(()=>0);  // hours/day per builtin appliance
const CUS = [];                // {name,watts,icon,h}  custom devices

const CMin=[{l:'15min',v:.25},{l:'30min',v:.5},{l:'45min',v:.75}];
const CHr =[{l:'1h',v:1},{l:'2h',v:2},{l:'3h',v:3},{l:'4h',v:4},{l:'6h',v:6},{l:'8h',v:8},{l:'12h',v:12},{l:'24h',v:24}];

function fH(v){return String(Math.floor(v)).padStart(2,'0');}
function fM(v){return String(Math.round((v%1)*60)).padStart(2,'0');}

/* ── DEVICE GRID ── */
let activeKey=null; // 'b-i' or 'c-i' or 'form'

function buildGrid(){
  const g=document.getElementById('deviceGrid');
  g.innerHTML='';
  APPS.forEach((a,i)=>{
    const b=document.createElement('div');
    b.className='device-box'+(ST[i]>0?' selected':'');
    b.innerHTML=`<div class="db-check">✓</div><div class="db-icon">${a.icon}</div><div class="db-name">${a.name}</div><div class="db-watts">${a.watts}W</div>`;
    b.addEventListener('click',()=>openConfig('b',i));
    g.appendChild(b);
  });
  CUS.forEach((c,i)=>{
    const b=document.createElement('div');
    b.className='device-box'+(c.h>0?' selected':'');
    b.innerHTML=`<div class="db-check">✓</div><div class="db-icon">${c.icon}</div><div class="db-name">${c.name}</div><div class="db-watts">${c.watts}W</div>`;
    b.addEventListener('click',()=>openConfig('c',i));
    g.appendChild(b);
  });
  /* add box */
  const ab=document.createElement('div');
  ab.className='device-box add-box';
  ab.innerHTML=`<div class="db-plus">＋</div><div class="db-name" style="color:#333;font-size:.68rem">Ajouter un appareil</div>`;
  ab.addEventListener('click',()=>openConfig('form',0));
  g.appendChild(ab);
  bindCur();
}

/* ── CONFIG PANEL ── */
function openConfig(type,i){
  const key=type+'-'+i;
  if(activeKey===key){closeConfig();return;}
  activeKey=key;
  const panel=document.getElementById('configPanel');
  if(type==='form'){
    document.getElementById('cpIcon').textContent='⚙️';
    document.getElementById('cpName').textContent='Nouvel appareil personnalisé';
    document.getElementById('cpWatts').textContent='';
    document.getElementById('cpBody').innerHTML=`
      <div class="custom-form">
        <div class="form-row">
          <div class="form-field"><label class="form-label">Nom</label><input class="form-input" id="cName" placeholder="Ex: Chauffe-eau" type="text"/></div>
          <div class="form-field"><label class="form-label">Watts</label><input class="form-input" id="cWatts" placeholder="Ex: 1200" type="number" min="1"/></div>
          <div class="form-field" style="max-width:88px"><label class="form-label">Icône</label><input class="form-input" id="cIcon" placeholder="🔌" type="text" maxlength="2"/></div>
        </div>
        <div><button class="btn-primary" style="font-size:.7rem;padding:11px 24px" onclick="addCus()">+ Ajouter</button></div>
      </div>`;
  } else {
    const app = type==='b' ? APPS[i] : CUS[i];
    document.getElementById('cpIcon').textContent=app.icon;
    document.getElementById('cpName').textContent=app.name;
    document.getElementById('cpWatts').textContent='· '+app.watts+' W';
    document.getElementById('cpBody').innerHTML=renderTP(type,i);
    bindSlider();
  }
  panel.classList.add('open');
  bindCur();
}
function closeConfig(){ document.getElementById('configPanel').classList.remove('open'); activeKey=null; }

/* ── TIME PICKER HTML ── */
function getV(t,i){ return t==='b'?ST[i]:CUS[i].h; }
function setV(t,i,v){ v=Math.max(0,Math.min(24,v)); if(t==='b')ST[i]=v; else CUS[i].h=v; updateTP(t,i); updateBoxSel(t,i); recalc(); }

function renderTP(t,i){
  const v=getV(t,i), pct=(v/24)*100;
  const hz=Math.floor(v)===0, mz=Math.round((v%1)*60)===0;
  const mc=CMin.map(c=>`<button class="chip${v===c.v?' sel':''}" onclick="setV('${t}',${i},${c.v})">${c.l}</button>`).join('');
  const hc=CHr.map(c=>`<button class="chip${v===c.v?' sel':''}" onclick="setV('${t}',${i},${c.v})">${c.l}</button>`).join('');
  return `
    <div class="tp-label">Utilisation / Jour</div>
    <div class="seg-wrap">
      <div class="seg-group">
        <div class="seg-btn-col"><button class="seg-btn" onclick="stSeg('${t}',${i},'h',1)">▲</button><button class="seg-btn" onclick="stSeg('${t}',${i},'h',-1)">▼</button></div>
        <div class="time-seg"><div class="tsv${hz?' z':''}" id="sh-${t}-${i}">${fH(v)}</div><div class="tsu">h</div></div>
      </div>
      <div class="tc${!hz||!mz?' on':''}" id="col-${t}-${i}">:</div>
      <div class="seg-group">
        <div class="seg-btn-col"><button class="seg-btn" onclick="stSeg('${t}',${i},'m',1)">▲</button><button class="seg-btn" onclick="stSeg('${t}',${i},'m',-1)">▼</button></div>
        <div class="time-seg"><div class="tsv${mz&&hz?' z':''}" id="sm-${t}-${i}">${fM(v)}</div><div class="tsu">min</div></div>
      </div>
    </div>
    <div class="tt-wrap">
      <div class="tt" id="tt-${t}-${i}" data-t="${t}" data-i="${i}">
        <div class="ttf" id="ttf-${t}-${i}" style="width:${pct}%"></div>
      </div>
      <div class="notches" id="ntc-${t}-${i}">${buildNtc(v)}</div>
    </div>
    <div class="chips-wrap">
      <div class="cg-label">Minutes</div>
      <div class="chips" id="mc-${t}-${i}">${mc}</div>
      <div class="cg-label">Heures</div>
      <div class="chips" id="hc-${t}-${i}">${hc}</div>
    </div>`;
}

function buildNtc(v){
  let h='';
  for(let q=0;q<=96;q++){
    const qv=q*.25, isH=Number.isInteger(qv), act=v>=qv;
    const lbl=(isH&&(qv===0||qv===6||qv===12||qv===18||qv===24))?`${qv}h`:'';
    h+=`<div class="notch"><div class="nb${isH?' hr':''}${act?' on':''}"></div><span class="nl${act&&lbl?' on':''}">${lbl}</span></div>`;
  }
  return h;
}

function updateTP(t,i){
  const v=getV(t,i),pct=(v/24)*100;
  const H=Math.floor(v),M=Math.round((v%1)*60);
  const sh=document.getElementById(`sh-${t}-${i}`); if(!sh)return;
  sh.textContent=fH(v); sh.classList.toggle('z',H===0);
  const sm=document.getElementById(`sm-${t}-${i}`); sm.textContent=fM(v); sm.classList.toggle('z',H===0&&M===0);
  document.getElementById(`col-${t}-${i}`).classList.toggle('on',v>0);
  document.getElementById(`ttf-${t}-${i}`).style.width=pct+'%';
  document.getElementById(`ntc-${t}-${i}`).innerHTML=buildNtc(v);
  document.getElementById(`mc-${t}-${i}`).querySelectorAll('.chip').forEach((el,ci)=>el.classList.toggle('sel',v===CMin[ci].v));
  document.getElementById(`hc-${t}-${i}`).querySelectorAll('.chip').forEach((el,ci)=>el.classList.toggle('sel',v===CHr[ci].v));
}

function stSeg(t,i,seg,d){
  let v=getV(t,i);
  if(seg==='h') v=Math.max(0,Math.min(24,Math.floor(v)+d+(v%1)));
  else{const m=Math.round((v%1)*60),H2=Math.floor(v),nm=m+d*15;if(nm<0)v=Math.max(0,H2-1)+.75;else if(nm>=60)v=Math.min(24,H2+1);else v=H2+nm/60;}
  setV(t,i,parseFloat(v.toFixed(4)));
}

function updateBoxSel(t,i){
  const v=getV(t,i);
  const boxes=[...document.querySelectorAll('.device-box:not(.add-box)')];
  const idx=t==='b'?i:APPS.length+i;
  if(boxes[idx]) boxes[idx].classList.toggle('selected',v>0);
}

/* drag on slider */
let dragEl=null;
function bindSlider(){
  document.querySelectorAll('.tt').forEach(el=>{
    el.onmousedown=e=>{dragEl=el;doD(e);e.preventDefault();};
    el.ontouchstart=e=>{dragEl=el;doD(e);e.preventDefault();};
  });
}
function doD(e){
  if(!dragEl)return;
  const r=dragEl.getBoundingClientRect();
  const cx=e.touches?e.touches[0].clientX:e.clientX;
  const ratio=Math.max(0,Math.min(1,(cx-r.left)/r.width));
  const sn=Math.round(ratio*24*4)/4;
  setV(dragEl.dataset.t,parseInt(dragEl.dataset.i),sn);
}
document.addEventListener('mousemove',doD);
document.addEventListener('touchmove',e=>{if(dragEl)doD(e);},{passive:true});
document.addEventListener('mouseup',()=>{dragEl=null;});
document.addEventListener('touchend',()=>{dragEl=null;});

/* add custom device */
function addCus(){
  const n=(document.getElementById('cName').value||'').trim();
  const w=parseInt(document.getElementById('cWatts').value)||0;
  const ic=(document.getElementById('cIcon').value||'🔌').trim()||'🔌';
  if(!n||w<=0){alert('Veuillez remplir le nom et la consommation.');return;}
  CUS.push({name:n,watts:w,icon:ic,h:0});
  closeConfig(); buildGrid();
  /* auto-open the new device's config */
  setTimeout(()=>openConfig('c',CUS.length-1),100);
}

/* ── GAUGE LIVE ── */
const PKwh=500;
function recalc(){
  let k=0;
  APPS.forEach((a,i)=>k+=(a.watts*ST[i]*30)/1000);
  CUS.forEach(c=>k+=(c.watts*c.h*30)/1000);
  animTo(Math.min(k,G.maxKwh));
}

/* ── MODAL ── */
function openModal(){
  const rows=document.getElementById('mRows'); rows.innerHTML=''; let tot=0;
  const addR=(icon,name,h,w)=>{
    if(h<=0)return; const k=(w*h*30)/1000; tot+=k;
    const H2=Math.floor(h),M2=Math.round((h%1)*60);
    const ts=H2>0&&M2>0?`${H2}h ${M2}min`:H2>0?`${H2}h`:`${M2}min`;
    const r=document.createElement('div'); r.className='modal-row';
    r.innerHTML=`<span class="dev">${icon} ${name} <span style="color:#3a3a3a;font-size:.66rem">${ts}/j</span></span><span class="kwh">${k.toFixed(2)} kWh</span>`;
    rows.appendChild(r);
  };
  APPS.forEach((a,i)=>addR(a.icon,a.name,ST[i],a.watts));
  CUS.forEach(c=>addR(c.icon,c.name,c.h,c.watts));
  if(tot===0) rows.innerHTML='<p style="color:var(--muted);font-size:.85rem">Aucun appareil sélectionné.</p>';
  document.getElementById('mTotal').textContent=(tot*PKwh).toLocaleString('fr-MG');
  document.getElementById('mKwh').textContent=tot.toFixed(2)+' kWh';
  document.getElementById('modal').classList.add('open');
}
function closeModal(){ document.getElementById('modal').classList.remove('open'); }
document.getElementById('modal').addEventListener('click',function(e){if(e.target===this)closeModal();});

function scrollTo2(){ document.getElementById('sel').scrollIntoView({behavior:'smooth'}); }

/* ── HAMBURGER MENU ── */
function toggleMenu(){
  const hb=document.getElementById('hamburger');
  const mn=document.getElementById('navMenu');
  const qc=document.getElementById('quitConfirm');
  const open=mn.classList.toggle('open');
  hb.classList.toggle('open',open);
  if(!open) qc.classList.remove('open');
}
function closeMenu(){
  document.getElementById('hamburger').classList.remove('open');
  document.getElementById('navMenu').classList.remove('open');
  document.getElementById('quitConfirm').classList.remove('open');
}
function showQuit(){
  document.getElementById('navMenu').classList.remove('open');
  document.getElementById('quitConfirm').classList.add('open');
}
function hideQuit(){
  document.getElementById('quitConfirm').classList.remove('open');
  document.getElementById('hamburger').classList.remove('open');
}
// close menu on outside click
document.addEventListener('click',function(e){
  const t=document.getElementById('menuTrigger');
  if(t && !t.contains(e.target)) closeMenu();
});

/* ── LOGIN MODAL ── */
function openLogin(){
  closeMenu();
  document.getElementById('loginOverlay').classList.add('open');
}
function closeLogin(){
  document.getElementById('loginOverlay').classList.remove('open');
}
document.getElementById('loginOverlay').addEventListener('click',function(e){
  if(e.target===this) closeLogin();
});

/* ── INIT ── */
buildGrid();