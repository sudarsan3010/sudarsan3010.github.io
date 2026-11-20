/* =====================================================================
   Sudarsan Natarajan — site behaviour (no libraries)
   1. Theme toggle        6. Animated aquifer cross-section (hero)
   2. Navigation          7. Reveal-on-scroll + counters
   3. Mobile menu         8. Publication filters
   4. Rotating words      9. Gallery + lightbox
   5. Depth gauge        10. Email copy, card flip, misc
   ===================================================================== */
(function () {
  'use strict';

  var toast, toastT;
  function showToast(msg) {
    toast = toast || document.querySelector('.toast');
    toast.textContent = msg; toast.classList.add('is-on');
    clearTimeout(toastT); toastT = setTimeout(function () { toast.classList.remove('is-on'); }, 2200);
  }
  function copyText(text, msg, fallback) {
    function done() { showToast(msg); }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, function () { fallback && fallback(); });
    } else {
      var ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { fallback && fallback(); }
      ta.remove();
    }
  }

  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

  // "Edit preview": on your own computer, or with ?edit in the URL, empty gallery slots are shown with their file paths
  var editMode = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) || location.protocol === 'file:' || /[?&]edit\b/.test(location.search);
  if (editMode) root.classList.add('is-edit');

  /* Time-aware text: <span data-until="YYYY-MM-DD" data-after="new text"> swaps itself after that date */
  $$('[data-until]').forEach(function (el) {
    var until = new Date(el.dataset.until + 'T23:59:59');
    if (!isNaN(until) && new Date() > until) {
      el.textContent = el.dataset.after;
      var card = el.closest('.now-card'); if (card) { var pulse = $('.pulse', card); if (pulse) pulse.remove(); }
    }
  });
  var yearEl = $('#year'); if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- 1. Theme toggle ---------- */
  $$('.theme-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  });

  /* ---------- 2. Navigation: solid on scroll + active link ---------- */
  var nav = $('#nav');
  var hero = $('.hero');
  function onScrollNav() {
    var limit = hero ? hero.offsetHeight - 90 : 40;
    nav.classList.toggle('nav--solid', window.scrollY > limit);
  }
  window.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();

  var navLinks = $$('.nav__links a');
  if ('IntersectionObserver' in window) {
    var secObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = en.target.id;
        navLinks.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach(function (s) { secObs.observe(s); });
  }

  /* ---------- 3. Mobile menu ---------- */
  var burger = $('.nav__burger');
  var menu = $('#mobile-menu');
  function setMenu(open) {
    menu.hidden = !open;
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    $('use', burger).setAttribute('href', open ? '#i-close' : '#i-menu');
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(menu.hidden); });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) setMenu(false); });
  }

  /* ---------- 4. Rotating words in the hero ---------- */
  var words = [
    'recharge under a changing climate',
    'regional aquifer modelling with MODFLOW 6',
    'future groundwater under uncertainty',
    'crop choices that conserve groundwater'
  ];
  var rot = $('.rotator__word');
  if (rot && !reduceMotion) {
    var wi = 0;
    setInterval(function () {
      rot.classList.add('is-out');
      setTimeout(function () {
        wi = (wi + 1) % words.length;
        rot.textContent = words[wi];
        rot.classList.remove('is-out');
      }, 380);
    }, 3200);
  }

  /* ---------- 5. Depth gauge (piezometer scroll indicator) ---------- */
  var gauge = $('.gauge');
  var gWater = $('.gauge__water'), gMarker = $('.gauge__marker'), gDepth = $('.gauge__depth');
  var strata = $$('[data-depth]');
  function onScrollGauge() {
    if (!gauge) return;
    var y = window.scrollY + window.innerHeight * 0.4;
    var cur = 0;
    for (var i = 0; i < strata.length; i++) { if (strata[i].offsetTop <= y) cur = i; }
    var s = strata[cur], n = strata[cur + 1];
    var d0 = +s.dataset.depth, d1 = n ? +n.dataset.depth : d0;
    var span = n ? n.offsetTop - s.offsetTop : s.offsetHeight;
    var f = Math.min(1, Math.max(0, (y - s.offsetTop) / span));
    var depth = Math.round(d0 + (d1 - d0) * f);
    var max = +strata[strata.length - 1].dataset.depth || 120;
    var pct = Math.min(100, depth / max * 100);
    gWater.style.height = pct + '%';
    gMarker.style.top = pct + '%';
    gDepth.innerHTML = depth + ' m<span class="gauge__stratum"> · ' + s.dataset.stratum + '</span>';
    gauge.classList.toggle('is-visible', window.scrollY > (hero ? hero.offsetHeight * 0.6 : 200));
  }
  window.addEventListener('scroll', onScrollGauge, { passive: true });
  window.addEventListener('resize', onScrollGauge);
  onScrollGauge();

  /* ---------- 6. Animated aquifer cross-section ---------- */
  (function aquifer() {
    var canvas = $('.hero__canvas');
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var W = 0, H = 0, DPR = 1, xs = 260, groundY = 0, wtBase = 0, wellX = 0, wellBottom = 0, riverX = 0, compact = false;
    var t = 0, running = false, visible = true, raf = null;
    var particles = [], drops = [], rain = [], rings = [], stipple = [], crops = [];
    var mouse = { x: -1, y: -1, on: false };
    var M_PER_PX = 0; // metres per pixel for the probe readout

    function noiseGround(x) { return groundY + 5 * Math.sin(x * 0.0042 + 0.6) + 3 * Math.sin(x * 0.013 + 2.1); }
    function riverDip(x) {
      if (compact) return 0;
      var dx = (x - riverX) / 46;
      return Math.abs(dx) < 1 ? 26 * Math.cos(dx * Math.PI / 2) : 0;
    }
    function ground(x) { return noiseGround(x) + riverDip(x); }
    function pumping() { return 0.85 + 0.15 * Math.sin(t * 0.004); }
    function wt(x) {
      var base = wtBase + 6 * Math.sin(x * 0.003 + t * 0.002) + 3 * Math.sin(x * 0.011 - t * 0.003);
      var spread = compact ? 70 : 120;
      var cone = xs * 0.24 * pumping() * Math.exp(-Math.pow((x - wellX) / spread, 2));
      var rv = compact ? 0 : -10 * Math.exp(-Math.pow((x - riverX) / 70, 2)); // mound under the river
      return base + cone + rv;
    }

    function rand(a, b) { return a + Math.random() * (b - a); }

    function resize() {
      var r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      xs = parseFloat(getComputedStyle(hero).paddingBottom) || 260;
      compact = W < 720;
      groundY = H - xs + 8;
      wtBase = groundY + xs * 0.36;
      wellX = W * (compact ? 0.84 : 0.8);
      wellBottom = H - xs * 0.12;
      riverX = W * 0.12;
      M_PER_PX = 60 / xs;

      // stipple dots for the soil (vadose zone)
      stipple = [];
      var nDots = Math.round(W * xs * 0.0016);
      for (var i = 0; i < nDots; i++) stipple.push({ x: Math.random() * W, f: Math.random(), r: Math.random() < 0.15 ? 1.4 : 0.8 });

      // crops along the surface (small swaying stems)
      crops = [];
      var step = compact ? 26 : 22;
      for (var x = 12; x < W; x += step) {
        if (!compact && Math.abs(x - riverX) < 70) continue;
        if (Math.abs(x - wellX) < 22) continue;
        crops.push({ x: x + rand(-4, 4), h: rand(9, 16), ph: Math.random() * 6.28 });
      }

      // groundwater flow particles
      particles = [];
      var nP = compact ? 70 : Math.min(190, Math.round(W / 7));
      for (var k = 0; k < nP; k++) particles.push(newParticle(true));
      drops = []; rain = []; rings = [];
      if (!running) draw();
    }

    function newParticle(anywhere) {
      var x = anywhere ? Math.random() * W : rand(-20, 0);
      var top = wt(x) + 6, bot = H - 6;
      return { x: x, y: rand(top, bot), px: x, py: 0, s: rand(0.35, 0.9), life: 0 };
    }

    function step() {
      t += 1;
      // flow: regional gradient to the right + capture zone of the pumping well
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.px = p.x; p.py = p.y;
        var vx = p.s * 0.55, vy = 0;
        var dx = wellX - p.x, dy = (wellBottom - 10) - p.y;
        var dist = Math.sqrt(dx * dx + dy * dy) || 1;
        var capture = Math.max(0, 1 - dist / (compact ? 150 : 240));
        vx += (dx / dist) * capture * 1.6;
        vy += (dy / dist) * capture * 1.6;
        vy += Math.sin((p.x + t) * 0.01) * 0.08;
        p.x += vx; p.y += vy; p.life++;
        var top = wt(p.x) + 4;
        if (p.y < top) p.y = top;
        if (p.y > H - 3) p.y = H - 3;
        if (dist < 9 || p.x > W + 10) particles[i] = newParticle(false);
      }
      // recharge drops percolating through the vadose zone
      if (t % (compact ? 14 : 8) === 0) {
        var x0 = rand(0, W);
        if (Math.abs(x0 - wellX) > 16) drops.push({ x: x0, y: ground(x0) + 2, v: rand(0.35, 0.6) });
      }
      for (var j = drops.length - 1; j >= 0; j--) {
        var d = drops[j];
        d.y += d.v; d.x += Math.sin((d.y + d.x) * 0.05) * 0.15;
        if (d.y >= wt(d.x)) { rings.push({ x: d.x, y: wt(d.x), r: 1, a: 0.7 }); drops.splice(j, 1); }
      }
      // light rain just above the land surface
      if (t % 3 === 0) rain.push({ x: rand(0, W + 60), y: groundY - rand(60, 120), v: rand(3.2, 4.4) });
      for (var k = rain.length - 1; k >= 0; k--) {
        var r = rain[k]; r.y += r.v; r.x -= r.v * 0.25;
        if (r.y > ground(r.x)) rain.splice(k, 1);
      }
      for (var m = rings.length - 1; m >= 0; m--) {
        rings[m].r += 0.45; rings[m].a -= 0.018;
        if (rings[m].a <= 0) rings.splice(m, 1);
      }
    }

    function pathAlong(fn, from, to, stepPx) {
      ctx.moveTo(from, fn(from));
      for (var x = from + stepPx; x <= to + stepPx; x += stepPx) ctx.lineTo(x, fn(x));
    }

    function label(txt, x, y, align, alpha) {
      ctx.font = (compact ? '500 9px ' : '500 10.5px ') + '"JetBrains Mono", ui-monospace, monospace';
      ctx.textAlign = align || 'left';
      ctx.fillStyle = 'rgba(200, 236, 231,' + (alpha || 0.55) + ')';
      if (ctx.letterSpacing !== undefined) ctx.letterSpacing = '1.5px';
      ctx.fillText(txt, x, y);
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // --- rain (fades in towards the ground)
      ctx.lineWidth = 1;
      for (var i = 0; i < rain.length; i++) {
        var r = rain[i];
        var a = Math.max(0, 1 - (groundY - r.y) / 120) * 0.35;
        ctx.strokeStyle = 'rgba(165, 209, 203,' + a + ')';
        ctx.beginPath(); ctx.moveTo(r.x, r.y); ctx.lineTo(r.x + 2, r.y - 8); ctx.stroke();
      }

      // --- vadose zone (soil) fill
      ctx.beginPath(); pathAlong(ground, 0, W, 8);
      ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
      var g1 = ctx.createLinearGradient(0, groundY, 0, H);
      g1.addColorStop(0, 'rgba(18, 52, 86, 0.95)');
      g1.addColorStop(1, 'rgba(10, 34, 60, 0.98)');
      ctx.fillStyle = g1; ctx.fill();

      // soil stipple
      ctx.fillStyle = 'rgba(165, 209, 203, 0.18)';
      for (var s = 0; s < stipple.length; s++) {
        var st = stipple[s], gy = ground(st.x), wy = wt(st.x);
        var y = gy + 6 + st.f * Math.max(0, (wy - gy - 10));
        ctx.beginPath(); ctx.arc(st.x, y, st.r, 0, 6.283); ctx.fill();
      }

      // --- saturated zone (aquifer)
      ctx.beginPath(); pathAlong(wt, 0, W, 6);
      ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
      var g2 = ctx.createLinearGradient(0, wtBase - 20, 0, H);
      g2.addColorStop(0, 'rgba(14, 123, 123, 0.42)');
      g2.addColorStop(1, 'rgba(14, 123, 123, 0.18)');
      ctx.fillStyle = g2; ctx.fill();

      // --- river channel (stream–aquifer exchange)
      if (!compact) {
        ctx.beginPath();
        var rx0 = riverX - 46, rx1 = riverX + 46, level = noiseGround(riverX) + 9;
        ctx.moveTo(rx0, level);
        for (var x = rx0; x <= rx1; x += 3) ctx.lineTo(x, Math.max(level, ground(x)));
        ctx.closePath();
        ctx.fillStyle = 'rgba(63, 201, 184, 0.55)'; ctx.fill();
        ctx.strokeStyle = 'rgba(165, 209, 203, 0.7)'; ctx.lineWidth = 1;
        ctx.beginPath();
        for (var wx = rx0 + 10; wx < rx1 - 10; wx += 2) ctx.lineTo(wx, level + Math.sin(wx * 0.3 + t * 0.08) * 0.8);
        ctx.stroke();
      }

      // --- flow particles
      ctx.lineCap = 'round';
      for (var p = 0; p < particles.length; p++) {
        var q = particles[p];
        var fade = Math.min(1, q.life / 30);
        ctx.strokeStyle = 'rgba(111, 220, 207,' + (0.65 * fade) + ')';
        ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(q.px - (q.x - q.px) * 5, q.py - (q.y - q.py) * 5); ctx.lineTo(q.x, q.y); ctx.stroke();
      }

      // --- recharge drops + rings at the water table
      ctx.fillStyle = 'rgba(111, 220, 207, 0.75)';
      for (var d = 0; d < drops.length; d++) {
        var dr = drops[d];
        ctx.beginPath(); ctx.ellipse(dr.x, dr.y, 1.4, 2.6, 0, 0, 6.283); ctx.fill();
      }
      for (var k = 0; k < rings.length; k++) {
        var rg = rings[k];
        ctx.strokeStyle = 'rgba(111, 220, 207,' + rg.a + ')'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(rg.x, rg.y, rg.r * 2.2, rg.r * 0.7, 0, 0, 6.283); ctx.stroke();
      }

      // --- water table (dashed, like a hydrogeology section)
      ctx.setLineDash([9, 7]); ctx.lineDashOffset = -t * 0.3;
      ctx.strokeStyle = 'rgba(63, 201, 184, 0.95)'; ctx.lineWidth = 1.8;
      ctx.beginPath(); pathAlong(wt, 0, W, 5); ctx.stroke();
      ctx.setLineDash([]);

      // --- land surface line
      ctx.strokeStyle = 'rgba(165, 209, 203, 0.65)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); pathAlong(ground, 0, W, 6); ctx.stroke();

      // --- crops on the surface
      ctx.strokeStyle = 'rgba(126, 214, 160, 0.75)'; ctx.lineWidth = 1.2;
      for (var c = 0; c < crops.length; c++) {
        var cr = crops[c], by = ground(cr.x) - 1, sway = Math.sin(t * 0.03 + cr.ph) * 1.6;
        ctx.beginPath(); ctx.moveTo(cr.x, by); ctx.quadraticCurveTo(cr.x, by - cr.h * 0.6, cr.x + sway, by - cr.h); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cr.x + sway * 0.5, by - cr.h * 0.55); ctx.lineTo(cr.x + 4 + sway, by - cr.h * 0.8); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cr.x + sway * 0.4, by - cr.h * 0.4); ctx.lineTo(cr.x - 4 + sway, by - cr.h * 0.65); ctx.stroke();
      }

      // --- pumping well with screen and rising water
      var gyW = ground(wellX);
      ctx.strokeStyle = 'rgba(220, 240, 238, 0.85)'; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(wellX - 5, gyW - 14); ctx.lineTo(wellX - 5, wellBottom); ctx.moveTo(wellX + 5, gyW - 14); ctx.lineTo(wellX + 5, wellBottom); ctx.stroke();
      ctx.setLineDash([2, 3]); ctx.strokeStyle = 'rgba(63, 201, 184, 0.9)';
      ctx.beginPath(); ctx.moveTo(wellX - 5, wellBottom - 46); ctx.lineTo(wellX - 5, wellBottom); ctx.moveTo(wellX + 5, wellBottom - 46); ctx.lineTo(wellX + 5, wellBottom); ctx.stroke();
      ctx.setLineDash([4, 6]); ctx.lineDashOffset = t * 0.9; ctx.strokeStyle = 'rgba(111, 220, 207, 0.9)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(wellX, wellBottom - 4); ctx.lineTo(wellX, gyW - 12); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(220, 240, 238, 0.9)';
      ctx.fillRect(wellX - 11, gyW - 22, 22, 9);
      ctx.fillRect(wellX + 9, gyW - 20, 14, 3);

      // --- water-table symbol ▽
      var sx = W * (compact ? 0.32 : 0.36), sy = wt(sx);
      ctx.fillStyle = 'rgba(63, 201, 184, 1)';
      ctx.beginPath(); ctx.moveTo(sx - 8, sy - 15); ctx.lineTo(sx + 8, sy - 15); ctx.lineTo(sx, sy - 4); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(63, 201, 184, 1)'; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(sx - 6, sy + 4); ctx.lineTo(sx + 6, sy + 4); ctx.moveTo(sx - 3, sy + 8); ctx.lineTo(sx + 3, sy + 8); ctx.stroke();

      // --- labels
      label('WATER TABLE', sx + 14, sy - 6, 'left', 0.8);
      label('VADOSE ZONE', compact ? 12 : W * 0.5, groundY + (wtBase - groundY) * 0.55, 'left');
      label(compact ? 'AQUIFER' : 'AQUIFER · SATURATED ZONE', compact ? 12 : W * 0.04, compact ? wtBase + 34 : H - 22, 'left');
      label('PUMPING WELL', wellX - 18, gyW - 30, 'right', 0.7);
      if (!compact) {
        label('RIVER', riverX, noiseGround(riverX) - 18, 'center', 0.7);
        label('RECHARGE ↓', W * 0.62, groundY + 22, 'left', 0.6);
        label('CONE OF DEPRESSION', wellX + 18, wt(wellX + 60) + 26, 'left', 0.55);
      }

      // --- interactive probe: hover to read depth to groundwater
      if (mouse.on && mouse.y > groundY - 60) {
        var mx = mouse.x, gm = ground(mx), wm = wt(mx);
        var depthM = ((wm - gm) * M_PER_PX).toFixed(1);
        ctx.setLineDash([3, 4]); ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(mx, gm - 10); ctx.lineTo(mx, wm); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(mx, wm, 3.5, 0, 6.283); ctx.fill();
        var txt = 'DEPTH TO WATER ' + depthM + ' m', bw = compact ? 150 : 178;
        var bx = Math.min(W - bw - 8, mx + 10), by = gm - 44;
        ctx.fillStyle = 'rgba(6, 26, 47, 0.85)'; roundRect(bx, by, bw, 24, 6); ctx.fill();
        ctx.strokeStyle = 'rgba(63, 201, 184, 0.6)'; ctx.stroke();
        label(txt, bx + 9, by + 16, 'left', 1);
      }
    }

    function roundRect(x, y, w, h, r) {
      ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
    }

    function loop() {
      if (!running) return;
      step(); draw();
      raf = requestAnimationFrame(loop);
    }
    function start() { if (running || reduceMotion) return; running = true; raf = requestAnimationFrame(loop); }
    function stop() { running = false; if (raf) cancelAnimationFrame(raf); }

    resize();
    if (reduceMotion) { for (var w = 0; w < 200; w++) step(); draw(); }
    else start();

    var resizeT;
    window.addEventListener('resize', function () { clearTimeout(resizeT); resizeT = setTimeout(resize, 120); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { visible = e[0].isIntersecting; visible && !document.hidden ? start() : stop(); }).observe(hero);
    }
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : (visible && start()); });

    hero.addEventListener('pointermove', function (e) {
      var r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; mouse.on = true;
      if (reduceMotion) draw();
    });
    hero.addEventListener('pointerleave', function () { mouse.on = false; if (reduceMotion) draw(); });
    hero.addEventListener('click', function (e) {
      if (e.target.closest('a, button')) return;
      var r = canvas.getBoundingClientRect(), x = e.clientX - r.left;
      for (var i = 0; i < 5; i++) drops.push({ x: x + rand(-14, 14), y: ground(x) + rand(2, 10), v: rand(0.6, 1) });
    });
  })();

  /* ---------- 7. Reveal-on-scroll + counters ---------- */
  function countUp(el) {
    var target = +el.dataset.count, suffix = el.dataset.suffix || '', t0 = null, dur = 1400;
    if (reduceMotion) { el.textContent = target + suffix; return; }
    function tick(ts) {
      if (!t0) t0 = ts;
      var k = Math.min(1, (ts - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(target * e) + (k === 1 ? suffix : '');
      if (k < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  var revealEls = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        var siblings = el.parentElement ? $$(':scope > .reveal', el.parentElement) : [];
        var idx = Math.max(0, siblings.indexOf(el));
        el.style.transitionDelay = Math.min(idx, 6) * 70 + 'ms';
        el.classList.add('in');
        if (el.classList.contains('stats')) $$('[data-count]', el).forEach(countUp);
        revObs.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { revObs.observe(el); });
    window.__revObs = revObs;
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
    $$('[data-count]').forEach(function (el) { el.textContent = el.dataset.count + (el.dataset.suffix || ''); });
  }

  /* ---------- 8. Publication filters ---------- */
  var pubs = $$('.pub');
  $$('#publications .filter').forEach(function (btn) {
    var f = btn.dataset.filter;
    var n = f === 'all' ? pubs.length : pubs.filter(function (p) { return p.dataset.type === f; }).length;
    btn.insertAdjacentHTML('beforeend', '<span class="count">' + n + '</span>');
    btn.addEventListener('click', function () {
      $$('#publications .filter').forEach(function (b) { b.classList.toggle('is-active', b === btn); b.setAttribute('aria-selected', String(b === btn)); });
      pubs.forEach(function (p) { p.classList.toggle('is-hidden', f !== 'all' && p.dataset.type !== f); p.classList.add('in'); });
    });
  });

  /* Publication actions: DOI link + copy-ready citation for every published paper */
  pubs.forEach(function (li) {
    var link = $('.pub__title a', li); if (!link) return;
    var doi = link.getAttribute('href').replace(/^https?:\/\/doi\.org\//, '');
    var authors = $('.pub__authors', li).textContent.trim();
    var year = $('.pub__year', li).textContent.trim();
    var venue = $('.pub__venue', li) ? $('.pub__venue', li).textContent.trim() : '';
    var cite = authors + ' (' + year + '). ' + link.textContent.trim() + '. ' + venue + '. https://doi.org/' + doi;
    var bar = document.createElement('div');
    bar.className = 'pub__actions';
    bar.innerHTML = '<a class="pub__btn" target="_blank" rel="noopener"><svg><use href="#i-external"/></svg><span></span></a>' +
                    '<button class="pub__btn" type="button"><svg><use href="#i-quote"/></svg>Copy citation</button>';
    var a = $('a', bar); a.href = link.href; $('span', a).textContent = 'DOI ' + doi;
    $('button', bar).addEventListener('click', function () { copyText(cite, 'Citation copied'); });
    $('.pub__body', li).appendChild(bar);
  });

  /* ---------- 9. Gallery + lightbox ---------- */
  (function gallery() {
    var grid = $('#gallery-grid');
    var filterBar = $('.gallery-filters');
    var moreWrap = $('.gallery-more');
    var cfg = window.GALLERY_CONFIG || {};
    if (!grid || !cfg.user) return;
    var IMG = /\.(jpe?g|png|webp|gif|avif)$/i;
    var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var CACHE_KEY = 'gallery-tree-v1', CACHE_MS = 10 * 60 * 1000;
    var data = [], limit = cfg.initialCount || 12, expanded = false, activeTag = 'All';

    function tidy(s) { return s.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim(); }
    function sentence(s) { s = tidy(s); return s.charAt(0).toUpperCase() + s.slice(1); }
    function parseAlbum(folder) {
      var m = folder.match(/^(\d{4})(?:-(\d{1,2}))?[\s_-]+(.+)$/);
      if (!m) return { name: tidy(folder) || 'Moments', when: '', sort: '0000-00 ' + folder };
      var mon = m[2] ? MONTHS[+m[2] - 1] + ' ' : '';
      return { name: tidy(m[3]), when: mon + m[1], sort: m[1] + '-' + (m[2] || '00').padStart(2, '0') + ' ' + m[3] };
    }
    function enc(path) { return path.split('/').map(encodeURIComponent).join('/'); }

    function build(paths) {
      var base = cfg.folder.replace(/\/$/, '') + '/';
      data = paths.filter(function (p) { return p.indexOf(base) === 0 && IMG.test(p); }).map(function (p) {
        var rel = p.slice(base.length), parts = rel.split('/');
        var file = parts.pop(), folder = parts.join('/');
        var album = folder ? parseAlbum(folder) : { name: 'Moments', when: '', sort: '0000-00' };
        var stem = file.replace(/\.[^.]+$/, '').replace(/^\d+[\s_-]+/, '');
        var generic = /^(img|dsc|dscn|pxl|photo|image|whatsapp|screenshot|signal)[\s_-]*\d*/i.test(stem) || /^\d+$/.test(stem);
        var caption = (cfg.captions && cfg.captions[rel]) || (generic ? album.name : sentence(stem));
        return { src: enc(p), caption: caption, tag: album.name, when: album.when, sort: album.sort, file: file };
      });
      data.sort(function (a, b) { return a.sort === b.sort ? a.file.localeCompare(b.file, undefined, { numeric: true }) : (a.sort < b.sort ? 1 : -1); });
      render();
    }

    function emptyState(msg) {
      grid.classList.add('is-empty'); filterBar.hidden = true; if (moreWrap) moreWrap.hidden = true;
      grid.innerHTML = '<div class="gallery-empty"><span class="gallery-empty__icon"><svg><use href="#i-camera"/></svg></span><div>' + msg + '</div></div>';
    }

    function render() {
      if (!data.length) {
        emptyState('<h3>Photos are on their way</h3><p>Pictures from conferences, fieldwork and research visits will appear here soon.</p>');
        return;
      }
      grid.classList.remove('is-empty'); grid.innerHTML = '';
      // album filter buttons
      var tags = ['All'];
      data.forEach(function (g) { if (tags.indexOf(g.tag) < 0) tags.push(g.tag); });
      filterBar.innerHTML = '';
      filterBar.hidden = tags.length < 3;
      tags.forEach(function (tag) {
        var b = document.createElement('button');
        b.className = 'filter' + (tag === activeTag ? ' is-active' : '');
        b.type = 'button'; b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', String(tag === activeTag));
        b.textContent = tag; b.dataset.tag = tag;
        filterBar.appendChild(b);
      });
      data.forEach(function (g, i) {
        var fig = document.createElement('figure');
        fig.className = 'tile' + (i === 0 ? ' tile--wide' : '');
        fig.dataset.tag = g.tag; fig.dataset.index = i; fig.tabIndex = 0;
        var img = document.createElement('img');
        img.src = g.src; img.alt = g.caption; img.loading = 'lazy'; img.decoding = 'async';
        img.onerror = function () { fig.remove(); };
        fig.appendChild(img);
        var cap = document.createElement('figcaption');
        cap.innerHTML = '<small></small><span></span>';
        cap.querySelector('small').textContent = g.tag + (g.when ? ' · ' + g.when : '');
        cap.querySelector('span').textContent = g.caption;
        fig.appendChild(cap);
        grid.appendChild(fig);
      });
      applyFilter();
    }

    function applyFilter() {
      var shownCount = 0, total = 0;
      $$('.tile', grid).forEach(function (t) {
        var match = activeTag === 'All' || t.dataset.tag === activeTag;
        if (match) total++;
        var show = match && (expanded || shownCount < limit);
        if (show) shownCount++;
        t.classList.toggle('is-hidden', !show);
        t.classList.add('in');
      });
      if (moreWrap) {
        moreWrap.hidden = expanded || total <= limit;
        var btn = $('button', moreWrap); if (btn) btn.textContent = 'Show all ' + total + ' photos';
      }
    }

    filterBar.addEventListener('click', function (e) {
      var b = e.target.closest('.filter'); if (!b) return;
      activeTag = b.dataset.tag;
      $$('.filter', filterBar).forEach(function (x) { x.classList.toggle('is-active', x === b); x.setAttribute('aria-selected', String(x === b)); });
      applyFilter();
    });
    if (moreWrap) $('button', moreWrap).addEventListener('click', function () { expanded = true; applyFilter(); });

    // List the photo folder with GitHub's public API (cached for 10 minutes per visitor)
    var cached = null;
    try { cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null'); } catch (e) {}
    if (cached && cached.paths && Date.now() - cached.t < CACHE_MS) { build(cached.paths); return; }
    var url = 'https://api.github.com/repos/' + cfg.user + '/' + cfg.repo + '/git/trees/' + (cfg.branch || 'main') + '?recursive=1';
    fetch(url, { headers: { Accept: 'application/vnd.github+json' } })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (json) {
        var paths = (json.tree || []).filter(function (n) { return n.type === 'blob'; }).map(function (n) { return n.path; });
        try { localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), paths: paths })); } catch (e) {}
        build(paths);
      })
      .catch(function () {
        if (cached && cached.paths) { build(cached.paths); return; }
        emptyState('<h3>The gallery is taking a break</h3><p>Photos couldn’t be loaded just now. <a href="https://github.com/' + cfg.user + '/' + cfg.repo + '/tree/' + (cfg.branch || 'main') + '/' + cfg.folder + '" target="_blank" rel="noopener">See them on GitHub</a>.</p>');
      });

    var lb = $('#lightbox'), lbImg = $('img', lb), lbCap = $('figcaption', lb), cur = -1, lastFocus = null;
    function shown() { return $$('.tile:not(.is-hidden)', grid); }
    function open(fig) {
      var list = shown(); cur = list.indexOf(fig); if (cur < 0) return;
      var g = data[+fig.dataset.index];
      lbImg.src = g.src; lbImg.alt = g.caption; lbCap.textContent = g.caption + ' — ' + g.tag + (g.when ? ', ' + g.when : '');
      if (lb.hidden) lastFocus = document.activeElement;
      lb.hidden = false; document.body.style.overflow = 'hidden';
      $('.lightbox__close', lb).focus();
    }
    function close() { lb.hidden = true; document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); }
    function go(dir) { var list = shown(); if (!list.length) return; cur = (cur + dir + list.length) % list.length; open(list[cur]); }
    grid.addEventListener('click', function (e) { var f = e.target.closest('.tile'); if (f) open(f); });
    grid.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { var f = e.target.closest('.tile'); if (f) { e.preventDefault(); open(f); } } });
    $('.lightbox__close', lb).addEventListener('click', close);
    $('.lightbox__prev', lb).addEventListener('click', function () { go(-1); });
    $('.lightbox__next', lb).addEventListener('click', function () { go(1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    });
  })();

  /* ---------- 10. Email copy, card flip, toast ---------- */
  $$('.email-copy').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var email = btn.dataset.email;
      copyText(email, 'Email copied — ' + email, function () { location.href = 'mailto:' + email; });
    });
  });

  var vcard = $('.vcard');
  if (vcard) vcard.addEventListener('click', function () { vcard.classList.toggle('is-flipped'); });
})();
