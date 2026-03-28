
'use strict';

/* ══ CURSOR ══ */
const curEl = document.getElementById('cur');
document.addEventListener('mousemove', e => {
  curEl.style.left = e.clientX + 'px';
  curEl.style.top  = e.clientY + 'px';
});
function bindCur() {
  document.querySelectorAll('button,a,input,.dev-box,.tt').forEach(el => {
    el.addEventListener('mouseenter', () => curEl.classList.add('h'));
    el.addEventListener('mouseleave', () => curEl.classList.remove('h'));
  });
}
bindCur();

/* ══ PARTICLES ══ */
const bgc = document.getElementById('bgc');
const bgx = bgc.getContext('2d');
let W, H;
const pts = Array.from({length:80}, () => ({
  x: Math.random()*1920, y: Math.random()*1080,
  r: Math.random()*1.3+.3,
  vx: (Math.random()-.5)*.2, vy: (Math.random()-.5)*.2,
  a: Math.random()
}));
function resizeBg() { W = bgc.width = window.innerWidth; H = bgc.height = window.innerHeight; }
resizeBg();
window.addEventListener('resize', resizeBg);
(function bgLoop() {
  bgx.clearRect(0,0,W,H);
  pts.forEach(p => {
    p.x += p.vx; p.y += p.vy;
    if(p.x < 0) p.x = W; if(p.x > W) p.x = 0;
    if(p.y < 0) p.y = H; if(p.y > H) p.y = 0;
    bgx.beginPath(); bgx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    bgx.fillStyle = `rgba(255,214,0,${p.a*.5})`; bgx.fill();
  });
  for(let i = 0; i < pts.length; i++) {
    for(let j = i+1; j < pts.length; j++) {
      const dx = pts[i].x-pts[j].x, dy = pts[i].y-pts[j].y, d = Math.sqrt(dx*dx+dy*dy);
      if(d < 110) {
        bgx.beginPath(); bgx.moveTo(pts[i].x,pts[i].y); bgx.lineTo(pts[j].x,pts[j].y);
        bgx.strokeStyle = `rgba(255,214,0,${(1-d/110)*.05})`; bgx.lineWidth = .5; bgx.stroke();
      }
    }
  }
  requestAnimationFrame(bgLoop);
})();

/* ══ GAUGE ══ */
const gc   = document.getElementById('gc');
const gctx = gc.getContext('2d');
const gTip = document.getElementById('gTip');
const gKwh = document.getElementById('gKwh');
const G = { cx:200, cy:215, r:150, maxKwh:500, cur:0, af:null, hov:null };
const TICKS = [0,50,100,150,200,250,300,400,500];

function gAngle(v) {
  return Math.PI + Math.max(0, Math.min(1, v/G.maxKwh)) * Math.PI;
}

function drawGauge(v, hovFrac) {
  const c = gctx, W2 = gc.width, H2 = gc.height;
  c.clearRect(0,0,W2,H2);
  const a = gAngle(v);

  // halo
  if(v > 0) {
    const halo = c.createRadialGradient(G.cx,G.cy,G.r-20,G.cx,G.cy,G.r+55);
    halo.addColorStop(0,'rgba(255,214,0,0)');
    halo.addColorStop(.5,`rgba(255,214,0,${.05+(v/G.maxKwh)*.09})`);
    halo.addColorStop(1,'rgba(255,214,0,0)');
    c.beginPath(); c.arc(G.cx,G.cy,G.r+55,Math.PI,Math.PI*2); c.closePath();
    c.fillStyle = halo; c.fill();
  }

  // track
  c.beginPath(); c.arc(G.cx,G.cy,G.r,Math.PI,Math.PI*2);
  c.strokeStyle = '#0c0c0c'; c.lineWidth = 34; c.stroke();
  c.beginPath(); c.arc(G.cx,G.cy,G.r,Math.PI,Math.PI*2);
  c.strokeStyle = '#1a1a1a'; c.lineWidth = 26; c.stroke();

  // filled arc
  if(v > 0) {
    const grad = c.createLinearGradient(G.cx-G.r,G.cy,G.cx+G.r,G.cy);
    grad.addColorStop(0,'#4a3300'); grad.addColorStop(.5,'#FFD600'); grad.addColorStop(1,'#fff7aa');
    c.beginPath(); c.arc(G.cx,G.cy,G.r,Math.PI,a);
    c.strokeStyle = grad; c.lineWidth = 24; c.lineCap = 'round'; c.stroke();
    c.shadowColor = '#FFD600'; c.shadowBlur = 18;
    c.beginPath(); c.arc(G.cx,G.cy,G.r,Math.PI,a);
    c.strokeStyle = 'rgba(255,214,0,.25)'; c.lineWidth = 32; c.stroke();
    c.shadowBlur = 0;
  }

  // ticks
  TICKS.forEach(t => {
    const ta = gAngle(t), active = v >= t, major = t%100===0||t===50||t===250;
    const r1 = G.r+12, r2 = G.r+(major?28:20);
    c.beginPath();
    c.moveTo(G.cx+r1*Math.cos(ta), G.cy+r1*Math.sin(ta));
    c.lineTo(G.cx+r2*Math.cos(ta), G.cy+r2*Math.sin(ta));
    c.strokeStyle = active ? '#FFD600' : '#282828';
    c.lineWidth = major ? 2 : 1;
    if(active) { c.shadowColor='#FFD600'; c.shadowBlur=5; }
    c.stroke(); c.shadowBlur = 0;
    if(major) {
      c.font = "bold 10px 'Orbitron',monospace";
      c.fillStyle = active ? '#FFD600' : '#2e2e2e';
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText(t+' kWh', G.cx+(G.r+44)*Math.cos(ta), G.cy+(G.r+44)*Math.sin(ta));
    }
  });

  // needle
  c.save(); c.translate(G.cx, G.cy); c.rotate(a);
  c.beginPath(); c.moveTo(-10,-2.5); c.lineTo(G.r-6,0); c.lineTo(-10,2.5);
  c.fillStyle='#FFD600'; c.shadowColor='#FFD600'; c.shadowBlur=12; c.fill(); c.shadowBlur=0;
  c.beginPath(); c.arc(0,0,9,0,Math.PI*2); c.fillStyle='#0e0e0e'; c.fill();
  c.beginPath(); c.arc(0,0,4,0,Math.PI*2); c.fillStyle='#FFD600'; c.fill();
  c.restore();

  // hover dot
  if(hovFrac !== null) {
    const ha = Math.PI+hovFrac*Math.PI;
    c.beginPath(); c.arc(G.cx+G.r*Math.cos(ha), G.cy+G.r*Math.sin(ha), 7, 0, Math.PI*2);
    c.fillStyle = 'rgba(255,214,0,.4)'; c.fill();
  }

  // edge labels
  c.font = "bold 11px 'Orbitron',monospace";
  c.fillStyle = '#2e2e2e'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillText('0', G.cx-G.r-14, G.cy+10);
  c.fillText('MAX', G.cx+G.r+18, G.cy+10);
}

function animGaugeTo(target) {
  if(G.af) cancelAnimationFrame(G.af);
  const start = G.cur, diff = target-start, dur = 1400, t0 = performance.now();
  (function step(now) {
    const p = Math.min((now-t0)/dur, 1);
    const e = 1 - Math.pow(1-p, 3);
    G.cur = start + diff * e;
    drawGauge(G.cur, G.hov);
    gKwh.textContent = G.cur.toFixed(1);
    if(p < 1) G.af = requestAnimationFrame(step);
    else G.cur = target;
  })(t0);
}

gc.addEventListener('mousemove', e => {
  const rect = gc.getBoundingClientRect();
  const mx = (e.clientX-rect.left)*(gc.width/rect.width);
  const my = (e.clientY-rect.top)*(gc.height/rect.height);
  const dx = mx-G.cx, dy = my-G.cy, dist = Math.sqrt(dx*dx+dy*dy);
  if(dist >= G.r-28 && dist <= G.r+55) {
    let ang = Math.atan2(dy,dx);
    if(ang < 0) ang += Math.PI*2;
    const frac = (ang-Math.PI)/Math.PI;
    if(frac >= 0 && frac <= 1) {
      G.hov = frac;
      gTip.style.display = 'block';
      gTip.style.left = (e.clientX-rect.left) + 'px';
      gTip.style.top  = (e.clientY-rect.top-14) + 'px';
      gTip.textContent = (frac*G.maxKwh).toFixed(0)+' kWh';
      drawGauge(G.cur, frac); return;
    }
  }
  G.hov = null; gTip.style.display = 'none'; drawGauge(G.cur, null);
});
gc.addEventListener('mouseleave', () => {
  G.hov = null; gTip.style.display = 'none'; drawGauge(G.cur, null);
});

drawGauge(0, null);
setTimeout(() => { animGaugeTo(250); setTimeout(() => animGaugeTo(0), 1900); }, 600);

/* ══ DATA ══ */
const APPS = [
  {name:'Ampoule LED',    watts:10,   icon:'💡'},
  {name:'Téléviseur',     watts:100,  icon:'📺'},
  {name:'Réfrigérateur',  watts:200,  icon:'🧊'},
  {name:'Fer à repasser', watts:1000, icon:'🔲'},
  {name:'Ordinateur',     watts:150,  icon:'💻'},
  {name:'Ventilateur',    watts:50,   icon:'🌀'},
  {name:'Climatiseur',    watts:1500, icon:'❄️'},
  {name:'Machine à laver',watts:800,  icon:'🫧'},
  {name:'Micro-ondes',    watts:900,  icon:'📡'},
];
const ST  = APPS.map(() => 0);   // hours/day (fractional, 1-min precision)
const CUS = [];                   // {name,watts,icon,h}
const PKwh = 500;                 // Ariary per kWh

const CHIPS_M = [
  {l:'5min',  v:5/60}, {l:'10min',v:10/60}, {l:'15min',v:15/60},
  {l:'20min', v:20/60},{l:'30min',v:30/60}, {l:'35min',v:35/60},{l:'45min',v:45/60}
];
const CHIPS_H = [
  {l:'1h',v:1},{l:'2h',v:2},{l:'3h',v:3},{l:'4h',v:4},
  {l:'6h',v:6},{l:'8h',v:8},{l:'12h',v:12},{l:'24h',v:24}
];

function padZ(n) { return String(n).padStart(2,'0'); }
function fmtH(v) { return padZ(Math.floor(v)); }
function fmtM(v) { return padZ(Math.min(59, Math.round((v%1)*60))); }
function getV(t,i) { return t==='b' ? ST[i] : CUS[i].h; }
function setV(t,i,v) {
  v = Math.max(0, Math.min(24, parseFloat(v.toFixed(6))));
  if(t==='b') ST[i]=v; else CUS[i].h=v;
  updateTP(t,i);
  updateBoxSel(t,i);
  recalcGauge();
}

/* ══ DEVICE GRID ══ */
let activeKey = null;
let origVal = 0; // snapshot before editing, for discard

function buildGrid() {
  const g = document.getElementById('devGrid');
  g.innerHTML = '';
  APPS.forEach((a,i) => {
    const b = document.createElement('div');
    b.className = 'dev-box' + (ST[i]>0 ? ' sel' : '');
    b.innerHTML = `<div class="db-chk">✓</div><div class="db-ic">${a.icon}</div><div class="db-nm">${a.name}</div><div class="db-w">${a.watts}W</div>`;
    b.addEventListener('click', () => openConfig('b', i));
    g.appendChild(b);
  });
  CUS.forEach((c,i) => {
    const b = document.createElement('div');
    b.className = 'dev-box' + (c.h>0 ? ' sel' : '');
    b.innerHTML = `<div class="db-chk">✓</div><div class="db-ic">${c.icon}</div><div class="db-nm">${c.name}</div><div class="db-w">${c.watts}W</div>`;
    b.addEventListener('click', () => openConfig('c', i));
    g.appendChild(b);
  });
  const ab = document.createElement('div');
  ab.className = 'dev-box add-box';
  ab.innerHTML = '<div class="db-plus">＋</div><div class="db-add-lbl">Ajouter un appareil</div>';
  ab.addEventListener('click', () => openConfig('form', 0));
  g.appendChild(ab);
  bindCur();
}

/* ══ CONFIG PANEL ══ */
function openConfig(type, i) {
  const key = type+'-'+i;
  if(activeKey === key) { closeConfig(); return; }
  activeKey = key;
  if(type === 'form') {
    document.getElementById('cpIc').textContent = '⚙️';
    document.getElementById('cpNm').textContent = 'Nouvel appareil';
    document.getElementById('cpW').textContent  = '';
    document.getElementById('cpBody').innerHTML = `
      <div class="cust-form">
        <div class="form-row">
          <div class="form-fld"><label class="form-lbl">Nom</label><input class="form-in" id="cNm" placeholder="Ex: Chauffe-eau" type="text"/></div>
          <div class="form-fld"><label class="form-lbl">Watts</label><input class="form-in" id="cWt" placeholder="Ex: 1200" type="number" min="1"/></div>
          <div class="form-fld" style="max-width:86px"><label class="form-lbl">Icône</label><input class="form-in" id="cIc" placeholder="🔌" type="text" maxlength="2"/></div>
        </div>
        <button class="btn-p" style="font-size:.69rem;padding:10px 22px" onclick="addDevice()">+ Ajouter</button>
      </div>`;
  } else {
    const app = type==='b' ? APPS[i] : CUS[i];
    document.getElementById('cpIc').textContent = app.icon;
    document.getElementById('cpNm').textContent = app.name;
    document.getElementById('cpW').textContent  = '· '+app.watts+' W';
    // snapshot value before editing so discard can restore it
    origVal = getV(type, i);
    document.getElementById('cpBody').innerHTML = renderTP(type, i);
    bindSlider();
  }
  document.getElementById('cfgPanel').classList.add('open');
  bindCur();
}

function closeConfig() {
  document.getElementById('cfgPanel').classList.remove('open');
  activeKey = null;
}

/* ══ TIME PICKER ══ */
function buildNotches(v) {
  let h = '';
  for(let q = 0; q <= 48; q++) {
    const qv = q*0.5, isH = Number.isInteger(qv), act = v >= qv;
    const lbl = (isH && [0,4,8,12,16,20,24].includes(qv)) ? qv+'h' : '';
    h += `<div class="notch"><div class="nb${isH?' hr':''}${act?' on':''}"></div><span class="nl${act&&lbl?' on':''}">${lbl}</span></div>`;
  }
  return h;
}

function renderTP(t, i) {
  const v = getV(t, i);
  const pct = (v/24)*100;
  const H = Math.floor(v), M = Math.min(59, Math.round((v%1)*60));
  const hz = H===0, mz = M===0;
  const mc = CHIPS_M.map(c => `<button class="chip${Math.abs(v-c.v)<0.001?' on':''}" onclick="setV('${t}',${i},${c.v})">${c.l}</button>`).join('');
  const hc = CHIPS_H.map(c => `<button class="chip${Math.abs(v-c.v)<0.001?' on':''}" onclick="setV('${t}',${i},${c.v})">${c.l}</button>`).join('');
  return `
    <div class="tp-lbl">Utilisation / Jour</div>
    <div class="seg-row">
      <div class="seg-grp">
        <div class="seg-btns">
          <button class="sb" onclick="stepSeg('${t}',${i},'h',1)">▲</button>
          <button class="sb" onclick="stepSeg('${t}',${i},'h',-1)">▼</button>
        </div>
        <div class="tseg">
          <div class="tv${hz?' z':''}" id="th-${t}-${i}">${fmtH(v)}</div>
          <div class="tu">h</div>
        </div>
      </div>
      <div class="tcol${v>0?' on':''}" id="tc-${t}-${i}">:</div>
      <div class="seg-grp">
        <div class="seg-btns">
          <button class="sb" onclick="stepSeg('${t}',${i},'m',1)">▲</button>
          <button class="sb" onclick="stepSeg('${t}',${i},'m',-1)">▼</button>
        </div>
        <div class="tseg">
          <div class="tv${hz&&mz?' z':''}" id="tm-${t}-${i}">${fmtM(v)}</div>
          <div class="tu">min</div>
        </div>
      </div>
    </div>
    <div class="tt-wrap">
      <div class="tt" id="tt-${t}-${i}" data-t="${t}" data-i="${i}">
        <div class="ttf" id="ttf-${t}-${i}" style="width:${pct}%"></div>
      </div>
      <div class="notches" id="ntc-${t}-${i}">${buildNotches(v)}</div>
    </div>
    <div class="chips-wrap">
      <div class="cg-lbl">Raccourcis minutes</div>
      <div class="chips" id="cpm-${t}-${i}">${mc}</div>
      <div class="cg-lbl">Raccourcis heures</div>
      <div class="chips" id="cph-${t}-${i}">${hc}</div>
    </div>
    <div class="free-row">
      <span class="free-lbl">Saisie libre</span>
      <input class="free-in" type="number" min="0" max="23" placeholder="H"
        id="fh-${t}-${i}" value="${H||''}"
        oninput="freeIn('${t}',${i},'h',this.value)"/>
      <span class="free-sep">h</span>
      <input class="free-in" type="number" min="0" max="59" placeholder="MM"
        id="fm-${t}-${i}" value="${M||''}"
        oninput="freeIn('${t}',${i},'m',this.value)"/>
      <span class="free-unit">min</span>
    </div>
    <div class="tp-action-row">
      <button class="btn-discard" onclick="discardChange('${t}',${i})" title="Annuler les modifications">✕ Annuler</button>
      <button class="btn-reset" onclick="resetDevice('${t}',${i})" title="Remettre à zéro">↺ Réinitialiser</button>
    </div>`;
}

function updateTP(t, i) {
  const v = getV(t, i);
  const H = Math.floor(v), M = Math.min(59, Math.round((v%1)*60));
  const thEl = document.getElementById('th-'+t+'-'+i); if(!thEl) return;
  const tmEl = document.getElementById('tm-'+t+'-'+i);
  const tcEl = document.getElementById('tc-'+t+'-'+i);
  const ttfEl= document.getElementById('ttf-'+t+'-'+i);
  const ntcEl= document.getElementById('ntc-'+t+'-'+i);

  thEl.textContent = fmtH(v); thEl.classList.toggle('z', H===0);
  tmEl.textContent = fmtM(v); tmEl.classList.toggle('z', H===0&&M===0);
  tcEl.classList.toggle('on', v>0);
  ttfEl.style.width = (v/24)*100+'%';
  ntcEl.innerHTML = buildNotches(v);

  document.getElementById('cpm-'+t+'-'+i).querySelectorAll('.chip').forEach((el,ci) =>
    el.classList.toggle('on', Math.abs(v-CHIPS_M[ci].v)<0.001));
  document.getElementById('cph-'+t+'-'+i).querySelectorAll('.chip').forEach((el,ci) =>
    el.classList.toggle('on', Math.abs(v-CHIPS_H[ci].v)<0.001));

  const fhEl = document.getElementById('fh-'+t+'-'+i);
  const fmEl = document.getElementById('fm-'+t+'-'+i);
  if(fhEl && document.activeElement !== fhEl) fhEl.value = H || '';
  if(fmEl && document.activeElement !== fmEl) fmEl.value = M || '';
}

function stepSeg(t, i, seg, d) {
  let v = getV(t, i);
  if(seg === 'h') {
    v = Math.max(0, Math.min(24, Math.floor(v)+d + (v%1)));
  } else {
    const totalMins = Math.round(v*60) + d;
    v = Math.max(0, Math.min(24*60, totalMins)) / 60;
  }
  setV(t, i, v);
}

function freeIn(t, i, seg, val) {
  let v = getV(t, i);
  const n = Math.max(0, parseInt(val)||0);
  if(seg==='h') v = Math.min(23,n) + (v%1);
  else v = Math.floor(v) + Math.min(59,n)/60;
  setV(t, i, v);
}

function discardChange(t, i) {
  // restore value to what it was when panel was opened
  setV(t, i, origVal);
  closeConfig();
}

function resetDevice(t, i) {
  // set time to zero
  setV(t, i, 0);
}

/* ══ RESET ALL ══ */
function showResetConfirm() {
  document.getElementById('resetConfirm').classList.add('open');
  bindCur();
}
function hideResetConfirm() {
  document.getElementById('resetConfirm').classList.remove('open');
}
function resetAllDevices() {
  // zero all built-in
  for(let i = 0; i < ST.length; i++) ST[i] = 0;
  // zero all custom
  CUS.forEach(c => c.h = 0);
  // close config panel if open
  closeConfig();
  // rebuild grid to clear all sel states
  buildGrid();
  // update gauge
  recalcGauge();
  hideResetConfirm();
}

function updateBoxSel(t, i) {
  const v = getV(t, i);
  const boxes = [...document.querySelectorAll('.dev-box:not(.add-box)')];
  const idx = t==='b' ? i : APPS.length+i;
  if(boxes[idx]) boxes[idx].classList.toggle('sel', v>0);
}

/* ══ SLIDER DRAG ══ */
let dragEl = null;
function bindSlider() {
  document.querySelectorAll('.tt').forEach(el => {
    el.onmousedown  = e => { dragEl=el; doDrag(e); e.preventDefault(); };
    el.ontouchstart = e => { dragEl=el; doDrag(e); e.preventDefault(); };
  });
}
function doDrag(e) {
  if(!dragEl) return;
  const r = dragEl.getBoundingClientRect();
  const cx = e.touches ? e.touches[0].clientX : e.clientX;
  const ratio = Math.max(0, Math.min(1, (cx-r.left)/r.width));
  const snapped = Math.round(ratio*24*60)/60; // 1-minute snap
  setV(dragEl.dataset.t, parseInt(dragEl.dataset.i), snapped);
}
document.addEventListener('mousemove', doDrag);
document.addEventListener('touchmove', e => { if(dragEl) doDrag(e); }, {passive:true});
document.addEventListener('mouseup',   () => { dragEl = null; });
document.addEventListener('touchend',  () => { dragEl = null; });

/* ══ ADD CUSTOM DEVICE ══ */
function addDevice() {
  const name = (document.getElementById('cNm').value||'').trim();
  const watts = parseInt(document.getElementById('cWt').value)||0;
  const icon  = (document.getElementById('cIc').value||'🔌').trim()||'🔌';
  if(!name || watts<=0) { alert('Veuillez remplir le nom et la consommation.'); return; }
  CUS.push({name,watts,icon,h:0});
  closeConfig(); buildGrid();
  setTimeout(() => openConfig('c', CUS.length-1), 80);
}

/* ══ GAUGE LIVE RECALC ══ */
function recalcGauge() {
  let k = 0;
  APPS.forEach((a,i) => k += (a.watts*ST[i]*30)/1000);
  CUS.forEach(c => k += (c.watts*c.h*30)/1000);
  animGaugeTo(Math.min(k, G.maxKwh));
  updateMiniGauge();
}

/* ══ BILL MODAL ══ */
const HIST = [];

function openBillModal() {
  // save to history
  let tot = 0;
  APPS.forEach((a,i) => tot += (a.watts*ST[i]*30)/1000);
  CUS.forEach(c => tot += (c.watts*c.h*30)/1000);
  if(tot > 0) {
    // build device snapshot
    const devSnap = [];
    APPS.forEach((a,i) => {
      if(ST[i] > 0) {
        const k = (a.watts*ST[i]*30)/1000;
        const H2=Math.floor(ST[i]), M2=Math.min(59,Math.round((ST[i]%1)*60));
        const ts = H2>0&&M2>0 ? H2+'h '+M2+'min' : H2>0 ? H2+'h' : M2+'min';
        devSnap.push({icon:a.icon, name:a.name, ts, kwh:k.toFixed(2)});
      }
    });
    CUS.forEach(c => {
      if(c.h > 0) {
        const k = (c.watts*c.h*30)/1000;
        const H2=Math.floor(c.h), M2=Math.min(59,Math.round((c.h%1)*60));
        const ts = H2>0&&M2>0 ? H2+'h '+M2+'min' : H2>0 ? H2+'h' : M2+'min';
        devSnap.push({icon:c.icon, name:c.name, ts, kwh:k.toFixed(2)});
      }
    });
    HIST.unshift({
      date: new Date().toLocaleString('fr-FR'),
      kwh: tot.toFixed(2),
      cost: (tot*PKwh).toLocaleString('fr-FR'),
      devices: devSnap
    });
    if(HIST.length > 20) HIST.pop();
    document.getElementById('accCalcs').textContent = HIST.length;
  }

  const rows = document.getElementById('billRows');
  rows.innerHTML = ''; let billTot = 0;
  const addRow = (icon,name,h,w) => {
    if(h <= 0) return;
    const k = (w*h*30)/1000; billTot += k;
    const H2=Math.floor(h), M2=Math.min(59,Math.round((h%1)*60));
    const ts = H2>0&&M2>0 ? H2+'h '+M2+'min' : H2>0 ? H2+'h' : M2+'min';
    const row = document.createElement('div'); row.className='ov-row';
    row.innerHTML = '<span class="dev">'+icon+' '+name+' <span style="color:#3a3a3a;font-size:.64rem">'+ts+'/j</span></span><span class="kwh">'+k.toFixed(2)+' kWh</span>';
    rows.appendChild(row);
  };
  APPS.forEach((a,i) => addRow(a.icon,a.name,ST[i],a.watts));
  CUS.forEach(c => addRow(c.icon,c.name,c.h,c.watts));
  if(billTot === 0) rows.innerHTML = '<p style="color:var(--muted);font-size:.83rem">Aucun appareil sélectionné.</p>';
  document.getElementById('billTotal').textContent = (billTot*PKwh).toLocaleString('fr-FR');
  document.getElementById('billKwh').textContent   = billTot.toFixed(2)+' kWh';
  document.getElementById('billOv').classList.add('open');
}
function closeBillModal() { document.getElementById('billOv').classList.remove('open'); }
document.getElementById('billOv').addEventListener('click', function(e){ if(e.target===this) closeBillModal(); });

/* ══ HAMBURGER ══ */
function toggleMenu() {
  const open = document.getElementById('drop').classList.toggle('open');
  document.getElementById('hbg').classList.toggle('open', open);
  if(!open) document.getElementById('qconf').classList.remove('open');
}
function closeMenu() {
  document.getElementById('hbg').classList.remove('open');
  document.getElementById('drop').classList.remove('open');
  document.getElementById('qconf').classList.remove('open');
}
function showQuit() {
  document.getElementById('drop').classList.remove('open');
  document.getElementById('qconf').classList.add('open');
}
function hideQuit() {
  document.getElementById('qconf').classList.remove('open');
  document.getElementById('hbg').classList.remove('open');
}
document.addEventListener('click', e => {
  const wrap = document.getElementById('menuWrap');
  if(wrap && !wrap.contains(e.target)) closeMenu();
});

/* ══ LOGIN ══ */
let isLoggedIn = false;
function openLogin()  { closeMenu(); document.getElementById('lgOv').classList.add('open'); }
function closeLogin() { document.getElementById('lgOv').classList.remove('open'); }
document.getElementById('lgOv').addEventListener('click', function(e){ if(e.target===this) closeLogin(); });

function doLogin() {
  const pseudo = (document.getElementById('lgPseudo').value||'').trim();
  if(!pseudo) { alert('Veuillez entrer un pseudo.'); return; }
  isLoggedIn = true;
  document.getElementById('accName').textContent  = pseudo;
  document.getElementById('accEmail').textContent = document.getElementById('lgPwd').value ? '***@exemple.com' : '—';
  document.getElementById('miLogout').style.display = 'flex';
  closeLogin();
}
function doLogout() {
  isLoggedIn = false;
  document.getElementById('miLogout').style.display = 'none';
  document.getElementById('accName').textContent  = 'Utilisateur';
  document.getElementById('accEmail').textContent = '—';
  closePanel('account');
}

/* ══ SIDE PANELS ══ */
const PANEL_IDS = ['aide','historique','account'];
function openPanel(name) {
  closeMenu();
  PANEL_IDS.forEach(n => document.getElementById('sp'+n.charAt(0).toUpperCase()+n.slice(1)).classList.remove('open'));
  if(name==='historique') renderHist();
  document.getElementById('scrim').classList.add('open');
  document.getElementById('sp'+name.charAt(0).toUpperCase()+name.slice(1)).classList.add('open');
}
function closePanel(name) {
  document.getElementById('sp'+name.charAt(0).toUpperCase()+name.slice(1)).classList.remove('open');
  document.getElementById('scrim').classList.remove('open');
}
function closeAllPanels() {
  PANEL_IDS.forEach(n => document.getElementById('sp'+n.charAt(0).toUpperCase()+n.slice(1)).classList.remove('open'));
  document.getElementById('scrim').classList.remove('open');
}

function renderHist() {
  const el = document.getElementById('histList');
  if(HIST.length===0) {
    el.innerHTML = '<div class="hist-empty">Aucun calcul effectué.<br><span style="font-size:.74rem;color:#333">Lancez un calcul pour voir l\'historique.</span></div>';
    return;
  }
  el.innerHTML = HIST.map((h,i) => {
    const devRows = (h.devices||[]).map(d =>
      '<div class="hist-dev-row">' +
        '<span class="hd-name">'+d.icon+' '+d.name+' <span class="hd-time">('+d.ts+'/j)</span></span>' +
        '<span class="hd-kwh">'+d.kwh+' kWh</span>' +
      '</div>'
    ).join('');
    const hasDevs = (h.devices||[]).length > 0;
    return '<div class="hist-item">' +
      '<div class="hist-summary">' +
        '<div class="hist-left">' +
          '<div class="hist-date">'+h.date+'</div>' +
          '<div class="hist-cost">'+h.cost+' Ar &nbsp;·&nbsp; <span style="color:var(--y)">'+h.kwh+' kWh</span></div>' +
        '</div>' +
        (hasDevs ? '<button class="hist-toggle" onclick="toggleHistDev('+i+',this)" title="Voir les appareils">▼ '+h.devices.length+' appareils</button>' : '') +
        '<button class="hist-del" onclick="HIST.splice('+i+',1);renderHist()">✕</button>' +
      '</div>' +
      (hasDevs ? '<div class="hist-devices" id="hd-'+i+'">'+devRows+'</div>' : '') +
    '</div>';
  }).join('');
}

function toggleHistDev(i, btn) {
  const el = document.getElementById('hd-'+i);
  if(!el) return;
  const open = el.classList.toggle('open');
  btn.textContent = (open ? '▲ ' : '▼ ') + HIST[i].devices.length + ' appareils';
}


/* ══ PAGE NAVIGATION ══ */
function goToSelection() {
  document.getElementById('selPage').classList.add('open');
  document.body.style.overflow = 'hidden'; // lock main scroll
  buildGrid(); // rebuild in case custom devices were added
  recalcGauge(); // sync gauge display
  // also update mini gauge
  updateMiniGauge();
}
function goBack() {
  document.getElementById('selPage').classList.remove('open');
  document.body.style.overflow = '';
  closeConfig();
}
function updateMiniGauge() {
  let k = 0;
  APPS.forEach((a,i) => k += (a.watts*ST[i]*30)/1000);
  CUS.forEach(c => k += (c.watts*c.h*30)/1000);
  const pct = Math.min(100, (k/500)*100);
  const fill = document.getElementById('miniGaugeFill');
  const kwh  = document.getElementById('selLiveKwh');
  if(fill) fill.style.width = pct+'%';
  if(kwh)  kwh.textContent  = k.toFixed(1);
}

/* ══ INIT ══ */
buildGrid();