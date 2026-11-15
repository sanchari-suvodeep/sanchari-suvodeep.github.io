/* =====================================================================
   Sanchari & Suvodeep — site behaviour
   Nothing here needs editing for normal use; change assets/js/config.js.
   ===================================================================== */
(function () {
  'use strict';

  var CFG = window.WEDDING_CONFIG || {};
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ------------------------------------------------- config into page */
  $$('#faqEmail, #closedEmail, .js-email').forEach(function (a) {
    if (CFG.contactEmail) { a.href = 'mailto:' + CFG.contactEmail; a.textContent = CFG.contactEmail; }
  });

  /* ----------------------------------------------------------- nav */
  var nav = $('#nav');
  var navToggle = $('#navToggle');

  navToggle.addEventListener('click', function () {
    var open = document.body.classList.toggle('nav-open');
    navToggle.setAttribute('aria-expanded', String(open));
  });

  $$('#navLinks a').forEach(function (a) {
    a.addEventListener('click', function () {
      document.body.classList.remove('nav-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
      document.body.classList.remove('nav-open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.focus();
    }
  });

  /* --------------------------------------- scroll: nav bg + parallax */
  var ticking = false;

  function onScroll() {
    var y = window.pageYOffset;
    nav.classList.toggle('scrolled', y > 40);
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ----------------------------------------------------- gallery grid */
  /* Built from window.GALLERY (assets/js/gallery.js). Photos go into
     whichever column is shortest, tallest photos placed first, so the
     columns finish level however many photos are added. Within a column
     they keep their list order. */
  var GALLERY = (window.GALLERY || []).filter(function (p) { return p && p.src && p.w && p.h; });
  (function galleryGrid() {
    var grid = $('#galleryGrid');
    if (!grid) return;
    if (!GALLERY.length) { grid.innerHTML = '<p class="center">Photos coming soon.</p>'; return; }

    function esc(t) { return String(t || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
    function figure(p, i) {
      var alt = esc(p.alt || 'Sanchari and Suvodeep');
      return '<figure class="photo"><button class="photo-btn" type="button" data-i="' + i + '" aria-label="Open photo: ' + alt + '">' +
             '<picture>' + (p.webp ? '<source srcset="' + esc(p.src) + '.webp" type="image/webp">' : '') +
             '<img src="' + esc(p.src) + '.jpg" alt="' + alt + '" width="' + p.w + '" height="' + p.h + '" loading="lazy">' +
             '</picture></button></figure>';
    }

    var cols = 0;
    function build() {
      var n = window.innerWidth <= 600 ? 1 : 3;
      if (n === cols) return;
      cols = n;
      var height = [], members = [];
      for (var c = 0; c < n; c++) { height.push(0); members.push([]); }
      GALLERY.map(function (p, i) { return { i: i, r: p.h / p.w }; })
        .sort(function (a, b) { return b.r - a.r || a.i - b.i; })
        .forEach(function (it) {
          var c = height.indexOf(Math.min.apply(null, height));
          height[c] += it.r; members[c].push(it.i);
        });
      if (n > 1) refine(members);
      /* columns read left to right by their earliest photo, so the first
         line in gallery.js always lands top-left */
      members.forEach(function (list) { list.sort(function (a, b) { return a - b; }); });
      members.sort(function (a, b) { return (a[0] === undefined ? 1e9 : a[0]) - (b[0] === undefined ? 1e9 : b[0]); });
      grid.innerHTML = members.map(function (list) {
        return '<div class="masonry-col">' + list.sort(function (a, b) { return a - b; })
          .map(function (i) { return figure(GALLERY[i], i); }).join('') + '</div>';
      }).join('');
      level(members);
    }

    function ratio(i) { return GALLERY[i].h / GALLERY[i].w; }
    function total(list) { return list.reduce(function (s, i) { return s + ratio(i); }, 0); }

    /* Greedy placement can strand a column. Keep moving or swapping photos
       between the tallest and shortest columns while it narrows the gap. */
    function refine(members) {
      for (var round = 0; round < 60; round++) {
        var t = members.map(total);
        var hi = t.indexOf(Math.max.apply(null, t)), lo = t.indexOf(Math.min.apply(null, t));
        var spread = t[hi] - t[lo], best = null;
        members[hi].forEach(function (a, ai) {
          var gain = spread - Math.abs((t[hi] - ratio(a)) - (t[lo] + ratio(a)));
          if (gain > 1e-6 && (!best || gain > best.gain)) best = { gain: gain, ai: ai, bi: -1 };
          members[lo].forEach(function (b, bi) {
            var d = ratio(a) - ratio(b);
            var g2 = spread - Math.abs((t[hi] - d) - (t[lo] + d));
            if (d > 0 && g2 > 1e-6 && (!best || g2 > best.gain)) best = { gain: g2, ai: ai, bi: bi };
          });
        });
        if (!best) break;
        var a = members[hi].splice(best.ai, 1)[0];
        if (best.bi >= 0) members[hi].push(members[lo].splice(best.bi, 1)[0]);
        members[lo].push(a);
      }
    }

    /* Placement gets the columns close; this closes the last gap by letting
       every photo in a shorter column grow a little taller (cropped with
       object-fit). Capped at 35% per photo so nothing is cut into a new
       shape — beyond that the columns are simply left a touch uneven. */
    function level(members) {
      if (members.length < 2) return;
      var colW = grid.querySelector('.masonry-col').getBoundingClientRect().width;
      var gap = parseFloat(getComputedStyle(grid.querySelector('.masonry-col')).rowGap) || 0;
      var g = gap / colW;                                   /* the gap, in column-widths */
      var tall = members.map(function (list) {
        return total(list) + g * (list.length - 1);
      });
      var target = Math.max.apply(null, tall);
      members.forEach(function (list, c) {
        var extra = target - tall[c];
        if (extra < 0.005 || !list.length) return;
        var grow = extra / total(list);                     /* same share for every photo in the column */
        if (grow > 0.35) return;
        var imgs = grid.children[c].querySelectorAll('img');
        list.forEach(function (i, k) {
          imgs[k].style.aspectRatio = '1 / ' + (ratio(i) * (1 + grow)).toFixed(4);
          imgs[k].style.objectFit = 'cover';
        });
      });
    }
    build();
    var rt;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(build, 150); });
  })();

  /* ------------------------------------------------ reveal on scroll */
  var revealables = $$('.fade-in');
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ------------------------------------------------------- scrollspy */
  var sections = $$('main section[id]');
  var navMap = {};
  $$('#navLinks a[href^="#"]').forEach(function (a) { navMap[a.getAttribute('href').slice(1)] = a; });

  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var link = navMap[en.target.id];
        if (!link) return;
        if (en.isIntersecting) {
          Object.keys(navMap).forEach(function (k) { navMap[k].removeAttribute('aria-current'); });
          link.setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* -------------------------------------------------------- countdown */
  (function countdown() {
    var root = $('#cd');
    if (!root) return;
    var target = new Date(CFG.weddingDate || '2026-12-11T16:00:00').getTime();
    if (isNaN(target)) return;

    var cells = {
      days:  root.querySelector('[data-cd="days"]'),
      hours: root.querySelector('[data-cd="hours"]'),
      mins:  root.querySelector('[data-cd="mins"]'),
      secs:  root.querySelector('[data-cd="secs"]')
    };
    var pad = function (n) { return n < 10 ? '0' + n : String(n); };

    function tick() {
      var diff = target - Date.now();
      if (diff <= 0) {
        root.innerHTML = '<p class="cd-done script">The day is here.</p>';
        clearInterval(timer);
        return;
      }
      var s = Math.floor(diff / 1000);
      cells.days.textContent  = Math.floor(s / 86400);
      cells.hours.textContent = pad(Math.floor(s / 3600) % 24);
      cells.mins.textContent  = pad(Math.floor(s / 60) % 60);
      cells.secs.textContent  = pad(s % 60);
    }
    tick();
    var timer = setInterval(tick, 1000);
  })();

  /* ------------------------------------------- itinerary scroll story */
  (function scrollStory() {
    var story = $('.scroll-story');
    if (!story) return;
    var stage    = $('.scenes', story);
    var skies    = $$('.sky', story);
    var night    = $$('.night-only', story);
    var ridgeBox = $('.scene-ridges', story);
    var layers   = $$('.scene-ridges [data-d]', story);
    var fills    = $$('.ridge-fill', story);
    var journals = $$('.journal', story);
    var steps    = $$('.story-step', story);
    var rail     = $$('.rail-btn', story);
    var palettes = JSON.parse(stage.getAttribute('data-palettes'));
    var hazes    = JSON.parse(stage.getAttribute('data-hazes')).map(function (h) { return h.split(',').map(Number); });

    /* --- the card: discrete, one per day ---------------------------- */
    var current = '1';
    function show(n) {
      if (n === current) return;
      current = n;
      var idx = +n;
      journals.forEach(function (j) {
        var k = +j.dataset.scene;
        j.classList.toggle('is-active', k === idx);
        j.classList.toggle('is-past', k < idx);
      });
      rail.forEach(function (b, i) { b.classList.toggle('is-active', i + 1 === idx); });
    }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) show(en.target.dataset.scene); });
      }, { rootMargin: '-50% 0px -50% 0px' });
      steps.forEach(function (st) { io.observe(st); });
    }
    rail.forEach(function (b) {
      b.addEventListener('click', function () {
        var t = document.getElementById(b.getAttribute('data-target'));
        if (t) window.scrollTo({ top: t.getBoundingClientRect().top + window.pageYOffset,
                                 behavior: reduced ? 'auto' : 'smooth' });
      });
    });

    /* --- the landscape: continuous, never swapped ---------------------
       "time" runs 0 → 3 across the story: 0 is Friday dusk, 1 Saturday
       night, 2 Sunday mist, 3 Monday dawn. It is read straight from the
       scroll position, then eased toward with a little inertia, so a
       mouse-wheel notch becomes a glide rather than a jump. */
    function hex(c) { return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; }
    var pal = palettes.map(function (p) { return p.map(hex); });
    function mix(a, b, f) { return [0, 1, 2].map(function (i) { return Math.round(a[i] + (b[i] - a[i]) * f); }); }
    function smooth(f) { return f * f * (3 - 2 * f); }

    function targetTime() {
      var r = story.getBoundingClientRect();
      var s = -r.top / window.innerHeight;          /* screens scrolled into the story */
      return Math.max(0, Math.min(3, s - 0.5));     /* each day's hold is centred on a whole number */
    }

    function render(t) {
      var i = Math.min(2, Math.floor(t)), f = smooth(t - i);
      for (var k = 0; k < fills.length; k++) {
        var c = mix(pal[i][k], pal[i + 1][k], f);
        fills[k].setAttribute('fill', 'rgb(' + c.join(',') + ')');
      }
      stage.style.setProperty('--hz', mix(hazes[i], hazes[i + 1], f).join(','));
      skies.forEach(function (sk, n) { sk.style.opacity = Math.max(0, 1 - Math.abs(t - n)).toFixed(3); });
      var nightAmt = Math.max(0, 1 - Math.abs(t - 1) * 1.1).toFixed(3);
      night.forEach(function (el) { el.style.opacity = nightAmt; });

      if (reduced) return;
      /* the camera starts high and sinks into the valley: near ridges begin
         pushed down out of frame and rise into it as the weekend goes on */
      var p = t / 3;
      for (var j = 0; j < layers.length; j++) {
        var d = +layers[j].dataset.d;
        layers[j].style.transform = 'translate3d(0,' + ((1 - p) * d * 150).toFixed(1) + 'px,0)';
      }
      ridgeBox.style.transform = 'scale(' + (1 + p * 0.07).toFixed(4) + ')';
    }

    var shown = targetTime(), running = false;
    function frame() {
      var goal = targetTime();
      shown += (goal - shown) * 0.09;
      if (Math.abs(goal - shown) < 0.0008) shown = goal;
      render(shown);
      if (shown !== goal) requestAnimationFrame(frame); else running = false;
    }
    function kick() {
      if (reduced) { render(targetTime()); return; }
      if (!running) { running = true; requestAnimationFrame(frame); }
    }
    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', kick, { passive: true });
    render(shown);
  })();

  /* ---------------------------------------------------- gallery lightbox */
  (function lightbox() {
    var box = $('.lightbox'), grid = $('#galleryGrid');
    if (!box || !grid || !GALLERY.length || typeof box.showModal !== 'function') return;
    var view = $('.lightbox-img', box), count = $('.lb-count', box);
    var at = 0, opener = null;
    var webp = (function () { try { return document.createElement('canvas').toDataURL('image/webp').indexOf('image/webp') === 5; } catch (e) { return false; } })();

    /* steps through the list order, not the column order */
    function go(i) {
      at = (i + GALLERY.length) % GALLERY.length;
      var p = GALLERY[at];
      view.src = p.src + (p.webp && webp ? '.webp' : '.jpg');
      view.alt = p.alt || 'Sanchari and Suvodeep';
      view.style.animation = 'none'; void view.offsetWidth; view.style.animation = '';
      count.textContent = (at + 1) + ' / ' + GALLERY.length;
    }
    /* delegated, so it survives the grid being rebuilt on resize */
    grid.addEventListener('click', function (e) {
      var btn = e.target.closest('.photo-btn');
      if (!btn) return;
      opener = btn; go(+btn.dataset.i); box.showModal();
    });
    $('.lb-prev', box).addEventListener('click', function () { go(at - 1); });
    $('.lb-next', box).addEventListener('click', function () { go(at + 1); });
    $('.lb-close', box).addEventListener('click', function () { box.close(); });
    box.addEventListener('click', function (e) { if (e.target === box) box.close(); });
    box.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') go(at - 1);
      if (e.key === 'ArrowRight') go(at + 1);
    });
    box.addEventListener('close', function () { if (opener && document.contains(opener)) opener.focus(); });

    var x0 = null;
    box.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) go(at + (dx < 0 ? 1 : -1));
      x0 = null;
    });
  })();

  /* ------------------------------------------------- copy the address */
  (function copyAddress() {
    var btn = $('.copy-addr'), note = $('.copy-done');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-address');
      function done(ok) {
        note.textContent = ok ? 'Copied' : 'Press and hold the address to copy';
        clearTimeout(btn._t); btn._t = setTimeout(function () { note.textContent = ''; }, 2400);
      }
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
      } else {
        /* file:// and older browsers have no async clipboard */
        var ta = document.createElement('textarea');
        ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        var ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta); done(ok);
      }
    });
  })();

  /* ------------------------------------------------- weather, per day */
  /* Each itinerary day gets its own strip. Until a forecast exists for the
     dates (Open-Meteo reaches 16 days ahead) it shows the ten-year typical
     conditions from weather.js, labelled as such; from then on it fetches
     the live forecast and caches it for three hours. */
  (function weather() {
    var W = window.WEATHER;
    var journals = $$('.journal');
    if (!W || !W.normals || !journals.length) return;
    var dates = Object.keys(W.normals).sort();
    /* a link out for guests who want AccuWeather's month view; the strip's
       own numbers stay on Open-Meteo (free, keyless, and it can be fetched) */
    var ACCU = 'https://www.accuweather.com/en/us/gatlinburg/37738/december-weather/335723?year=2026';
    var forecast = {}, unit = 'F';
    try { unit = localStorage.getItem('wx-unit') === 'C' ? 'C' : 'F'; } catch (e) {}

    var ICON = {
      sun:   '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
      part:  '<path d="M8 3.6V2M3.6 8H2M4.3 4.3l1.1 1.1M12.4 4.3l-1.1 1.1"/><path d="M5.6 10.4A3.4 3.4 0 0 1 11 6.6"/><path d="M8 19h9.5a3.5 3.5 0 0 0 .3-7 5 5 0 0 0-9.6 1.3A3 3 0 0 0 8 19z"/>',
      cloud: '<path d="M7 18h10.5a4 4 0 0 0 .4-8A6 6 0 0 0 6.3 11.6 3.3 3.3 0 0 0 7 18z"/>',
      rain:  '<path d="M7 14h10.5a4 4 0 0 0 .4-8A6 6 0 0 0 6.3 7.6 3.3 3.3 0 0 0 7 14z"/><path d="M8 17l-1 3M12 17l-1 3M16 17l-1 3"/>',
      snow:  '<path d="M7 14h10.5a4 4 0 0 0 .4-8A6 6 0 0 0 6.3 7.6 3.3 3.3 0 0 0 7 14z"/><path d="M8 18h.01M12 20h.01M16 18h.01M10 21.5h.01M14 21.5h.01" stroke-width="2.4" stroke-linecap="round"/>',
      fog:   '<path d="M4 9h16M3 13h18M5 17h14"/>',
      storm: '<path d="M7 14h10.5a4 4 0 0 0 .4-8A6 6 0 0 0 6.3 7.6 3.3 3.3 0 0 0 7 14z"/><path d="M12.5 15l-2 3.5h3l-2 3.5"/>'
    };
    function wmo(c) {
      if (c === 0) return ['sun', 'Clear'];
      if (c <= 2) return ['part', 'Partly cloudy'];
      if (c === 3) return ['cloud', 'Overcast'];
      if (c === 45 || c === 48) return ['fog', 'Fog'];
      if (c >= 71 && c <= 77 || c === 85 || c === 86) return ['snow', 'Snow'];
      if (c >= 95) return ['storm', 'Thunderstorms'];
      return ['rain', c >= 51 && c <= 57 ? 'Drizzle' : 'Rain'];
    }
    function t(c) { return Math.round(unit === 'F' ? c * 9 / 5 + 32 : c) + '°'; }
    function depth(mm, isSnow) {          /* snowfall arrives in cm, rain in mm */
      if (unit === 'F') { var inch = isSnow ? mm / 2.54 : mm / 25.4; return (inch < 0.1 ? '<0.1' : inch.toFixed(1)) + ' in'; }
      return isSnow ? mm.toFixed(1) + ' cm' : Math.round(mm) + ' mm';
    }
    function label(d) {
      var dt = new Date(d + 'T12:00:00');
      return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    function strip(d) {
      var f = forecast[d], n = W.normals[d], icon, desc, meta, src;
      if (f) {
        var w = wmo(f.code); icon = w[0]; desc = w[1];
        var bits = [];
        if (f.snow >= 0.1) bits.push('Snow ' + depth(f.snow, true));
        else if (f.pop != null) bits.push((f.pop >= 10 ? 'Rain ' + f.pop + '%' : 'Dry'));
        if (!(f.snow >= 0.1) && f.rain >= 1) bits.push(depth(f.rain, false));
        meta = bits.join(' · ');
        src = 'Forecast &middot; updated ' + new Date(f.at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        var hi = f.hi, lo = f.lo, fh = f.fhi, fl = f.flo;
      } else {
        icon = n.snowPct >= 30 ? 'snow' : n.wetPct >= 40 ? 'rain' : 'part';
        desc = 'Typical conditions';
        var wet = Math.round(n.wetPct / 10), sn = Math.round(n.snowPct / 10);
        meta = wet ? 'Rain or snow in ' + wet + ' of ' + n.years + ' years' + (sn ? ', snow in ' + sn : '') : 'Dry in all ' + n.years + ' years';
        src = 'Typical for ' + label(d) + ' &middot; ' + W.span;
        hi = n.hi; lo = n.lo; fh = n.feelsHi; fl = n.feelsLo;
      }
      var said = desc + '. High ' + t(hi) + ', low ' + t(lo) + ', feels like ' + t(fh) + ' to ' + t(fl) + '. ' + meta + '.';
      return '<div class="wx" role="group" aria-label="Weather for ' + label(d) + ': ' + said.replace(/°/g, ' degrees') + '">' +
        '<svg class="wx-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICON[icon] + '</svg>' +
        '<div class="wx-temps" aria-hidden="true"><span class="wx-hi">' + t(hi) + '</span><span class="wx-lo">' + t(lo) + '</span></div>' +
        '<div class="wx-meta" aria-hidden="true"><span>Feels ' + t(fh) + ' / ' + t(fl) + '</span><span>' + meta + '</span></div>' +
        '<div class="wx-unit" role="group" aria-label="Temperature unit">' +
          '<button type="button" data-u="F" aria-pressed="' + (unit === 'F') + '">°F</button>' +
          '<button type="button" data-u="C" aria-pressed="' + (unit === 'C') + '">°C</button></div>' +
        '<p class="wx-src">' + src + ' &middot; <a href="' + ACCU + '" target="_blank" rel="noopener">AccuWeather outlook&nbsp;&#8599;</a></p></div>';
    }

    function paint() {
      journals.forEach(function (j) {
        var d = dates[+j.dataset.scene - 1];
        if (!d) return;
        var old = j.querySelector('.wx');
        var holder = document.createElement('div'); holder.innerHTML = strip(d);
        if (old) old.replaceWith(holder.firstChild); else j.appendChild(holder.firstChild);
      });
    }
    document.addEventListener('click', function (e) {
      var b = e.target.closest('.wx-unit button');
      if (!b || b.dataset.u === unit) return;
      unit = b.dataset.u;
      try { localStorage.setItem('wx-unit', unit); } catch (er) {}
      paint();
    });
    paint();

    /* --- live forecast, once the dates are within reach --------------- */
    var DAY = 864e5, today = new Date(); today.setHours(0, 0, 0, 0);
    var first = new Date(dates[0] + 'T00:00:00'), last = new Date(dates[dates.length - 1] + 'T00:00:00');
    var reach = new Date(today.getTime() + 15 * DAY);                 /* stay a day inside the 16-day limit */
    if (first > reach || last < today) return;                        /* too early, or it's all over */
    var end = last < reach ? last : reach;
    function iso(dt) { return dt.getFullYear() + '-' + ('0' + (dt.getMonth() + 1)).slice(-2) + '-' + ('0' + dt.getDate()).slice(-2); }
    var start = first < today ? today : first;

    var cached = null;
    try { cached = JSON.parse(localStorage.getItem('wx-forecast') || 'null'); } catch (e) {}
    if (cached && Date.now() - cached.at < 3 * 36e5 && cached.end === iso(end)) { forecast = cached.days; paint(); return; }

    var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + W.lat + '&longitude=' + W.lon +
      '&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,' +
      'precipitation_probability_max,precipitation_sum,snowfall_sum&timezone=America%2FNew_York' +
      '&start_date=' + iso(start) + '&end_date=' + iso(end);
    fetch(url).then(function (r) { return r.json(); }).then(function (data) {
      if (!data || data.error || !data.daily) return;                 /* keep showing typical conditions */
      var dd = data.daily, at = Date.now(), days = {};
      dd.time.forEach(function (d, k) {
        if (dd.temperature_2m_max[k] == null) return;
        days[d] = { code: dd.weather_code[k], hi: dd.temperature_2m_max[k], lo: dd.temperature_2m_min[k],
                    fhi: dd.apparent_temperature_max[k], flo: dd.apparent_temperature_min[k],
                    pop: dd.precipitation_probability_max[k], rain: dd.precipitation_sum[k] || 0,
                    snow: dd.snowfall_sum[k] || 0, at: at };
      });
      forecast = days; paint();
      try { localStorage.setItem('wx-forecast', JSON.stringify({ at: at, end: iso(end), days: days })); } catch (e) {}
    }).catch(function () { /* offline or blocked: typical conditions stay up */ });
  })();

  /* ------------------------------------------- particles: confetti & rain */
  /* One full-screen canvas, created on first use and torn down when idle.
     Physics are time-scaled, so 120Hz screens don't play it at double speed. */
  var FX = (function () {
    var cv = null, ctx = null, parts = [], raf = 0, last = 0, W = 0, H = 0;
    var emojiCache = {};

    function size() {
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      W = window.innerWidth; H = window.innerHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function open() {
      if (cv) return;
      cv = document.createElement('canvas');
      cv.className = 'fx-canvas'; cv.setAttribute('aria-hidden', 'true');
      document.body.appendChild(cv);
      ctx = cv.getContext('2d'); size();
      window.addEventListener('resize', size);
    }
    function close() {
      cancelAnimationFrame(raf); raf = 0;
      window.removeEventListener('resize', size);
      if (cv) cv.remove(); cv = ctx = null;
    }
    /* emoji are drawn once to a small canvas, then stamped — far cheaper
       than fillText every frame */
    function emojiSprite(ch) {
      if (emojiCache[ch]) return emojiCache[ch];
      var c = document.createElement('canvas'), x = c.getContext('2d');
      c.width = c.height = 96;
      x.font = '72px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
      x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillText(ch, 48, 54);
      return (emojiCache[ch] = c);
    }
    function shade(hex, k) {
      var n = parseInt(hex.slice(1), 16), r = n >> 16, g = n >> 8 & 255, b = n & 255;
      return 'rgb(' + Math.round(r * k) + ',' + Math.round(g * k) + ',' + Math.round(b * k) + ')';
    }

    function draw(p) {
      var a = p.life > p.max * 0.72 ? 1 - (p.life - p.max * 0.72) / (p.max * 0.28) : 1;
      if (p.y > H + 60) a = 0;
      ctx.globalAlpha = Math.max(0, Math.min(1, a)) * (p.alpha || 1);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      if (p.kind === 'emoji') {
        var s = p.size; ctx.drawImage(emojiSprite(p.ch), -s / 2, -s / 2, s, s);
      } else if (p.kind === 'glyph') {
        /* a music note, drawn in one of the confetti colours */
        ctx.font = p.size + 'px Georgia, "Times New Roman", serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = p.color; ctx.fillText(p.ch, 0, 0);
      } else if (p.kind === 'ember') {
        /* a glowing spark: bright core, soft halo, flickering */
        var fl = 0.65 + Math.sin(p.flip * 3) * 0.35;
        ctx.fillStyle = p.halo; ctx.beginPath(); ctx.arc(0, 0, p.r * 3 * fl, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(0, 0, p.r * fl, 0, Math.PI * 2); ctx.fill();
      } else if (p.kind === 'paper') {
        /* a flat piece turning through 3D: squash on one axis, darker when
           its back face is towards us */
        var f = Math.cos(p.flip);
        ctx.scale(1, f);
        ctx.fillStyle = f < 0 ? p.back : p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      } else if (p.kind === 'dot') {
        ctx.scale(Math.abs(Math.cos(p.flip)) * 0.6 + 0.4, 1);
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(0, 0, p.r, 0, Math.PI * 2); ctx.fill();
      } else if (p.kind === 'ribbon') {
        ctx.strokeStyle = p.color; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(-p.len / 2, 0);
        for (var k = 1; k <= 6; k++) {
          var x = -p.len / 2 + p.len * k / 6;
          ctx.lineTo(x, Math.sin(p.flip + k * 1.1) * 4);
        }
        ctx.stroke();
      } else if (p.kind === 'glint') {
        var g = (Math.sin(p.flip * 2) + 1) / 2 * p.r + 1;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(0, -g * 2); ctx.lineTo(g * 0.45, 0); ctx.lineTo(0, g * 2); ctx.lineTo(-g * 0.45, 0);
        ctx.closePath(); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-g * 2, 0); ctx.lineTo(0, g * 0.45); ctx.lineTo(g * 2, 0); ctx.lineTo(0, -g * 0.45);
        ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    }

    function frame(t) {
      var dt = last ? Math.min(3, (t - last) / 16.667) : 1; last = t;
      ctx.clearRect(0, 0, W, H);
      parts = parts.filter(function (p) {
        if (p.delay > 0) { p.delay -= dt; return true; }
        p.life += dt;
        var drag = Math.pow(p.drag, dt);
        p.vx *= drag; p.vy = p.vy * drag + p.g * dt;
        if (p.sway) p.vx += Math.sin(p.life * p.swayRate + p.phase) * p.sway * dt;
        p.x += p.vx * dt; p.y += p.vy * dt;
        p.rot += p.vr * dt; p.flip += p.fr * dt;
        draw(p);
        return p.life < p.max && p.y < H + 80;
      });
      ctx.globalAlpha = 1;
      if (parts.length) raf = requestAnimationFrame(frame);
      else { last = 0; close(); }
    }
    function run(newParts) {
      open();
      parts = parts.concat(newParts);
      if (!raf) { last = 0; raf = requestAnimationFrame(frame); }
    }
    var R = function (a, b) { return a + Math.random() * (b - a); };
    var COLORS = ['#e3c88b', '#c5a365', '#f6e2a0', '#262c4e', '#4a5180', '#7a80a4', '#f2b5a7', '#e68a8a', '#fff3df'];

    /* confetti: two angled jets from the edges of the button + a central fountain */
    function confetti(rect) {
      var out = [], cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
      function piece(x, y, angle, spread, speed, delay) {
        var a = (angle + R(-spread, spread)) * Math.PI / 180, v = R(speed * 0.55, speed);
        var c = COLORS[(Math.random() * COLORS.length) | 0];
        var roll = Math.random(), base = {
          x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 0.2, drag: 0.976,
          rot: R(0, 6.28), vr: R(-0.12, 0.12), flip: R(0, 6.28), fr: R(0.08, 0.22),
          life: 0, max: R(150, 230), delay: delay, color: c, sway: 0.035, swayRate: R(0.05, 0.11), phase: R(0, 6.28)
        };
        if (roll < 0.55) { base.kind = 'paper'; base.w = R(9, 15); base.h = R(5, 9); base.back = shade(c, 0.62); }
        else if (roll < 0.74) { base.kind = 'dot'; base.r = R(3, 4.8); }
        else if (roll < 0.9) { base.kind = 'ribbon'; base.len = R(18, 30); base.drag = 0.968; }
        else { base.kind = 'glint'; base.r = R(2.6, 4.2); base.color = Math.random() < 0.6 ? '#f6e2a0' : '#fff'; base.g = 0.11; }
        out.push(base);
      }
      for (var i = 0; i < 110; i++) piece(rect.left + 6, cy, -118, 20, 25, R(0, 5));
      for (var j = 0; j < 110; j++) piece(rect.right - 6, cy, -62, 20, 25, R(0, 5));
      for (var k = 0; k < 90; k++) piece(cx, rect.top, -90, 26, 22, R(4, 12));
      /* second wave: a soft shower from the top of the screen, so the whole
         page celebrates, not just the button */
      for (var m = 0; m < 140; m++) {
        piece(R(0, window.innerWidth), R(-60, -10), 90, 25, 3, R(14, 70));
        var q = out[out.length - 1]; q.vx = R(-1, 1); q.max = R(260, 340);
      }
      run(out);
    }

    /* sad rain: a few seconds of slow, swaying, turning emoji across the screen */
    function sadRain() {
      var out = [], set = ['😢', '😭', '🥺', '💔', '😢', '😞'];
      var n = Math.round(Math.min(90, Math.max(40, window.innerWidth / 16)));
      for (var i = 0; i < n; i++) {
        out.push({
          kind: 'emoji', ch: set[(Math.random() * set.length) | 0], size: R(28, 58),
          x: R(0, window.innerWidth), y: R(-260, -40), vx: R(-0.4, 0.4), vy: R(2.2, 3.8),
          g: 0.035, drag: 0.992, rot: R(-0.5, 0.5), vr: R(-0.02, 0.02), flip: 0, fr: 0,
          sway: 0.05, swayRate: R(0.03, 0.06), phase: R(0, 6.28),
          life: 0, max: 420, delay: R(0, 55), alpha: 0.95
        });
      }
      run(out);
    }
    /* music notes: a fountain from a point that drifts up and sways */
    function notes(x, y, n) {
      var out = [], set = ['♪', '♫', '♬', '♩'], cols = ['#e8673c', '#c2496b', '#c5a365', '#262c4e', '#7d5c8c', '#ef5540'];
      for (var i = 0; i < (n || 46); i++) {
        var a = R(-160, -20) * Math.PI / 180, v = R(4, 13);
        out.push({
          kind: 'glyph', ch: set[(Math.random() * set.length) | 0], size: R(22, 46), color: cols[(Math.random() * cols.length) | 0],
          x: x + R(-20, 20), y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 0.05, drag: 0.972,
          rot: R(-0.4, 0.4), vr: R(-0.04, 0.04), flip: 0, fr: 0, sway: 0.06, swayRate: R(0.04, 0.09), phase: R(0, 6.28),
          life: 0, max: R(150, 230), delay: R(0, 40)
        });
      }
      run(out);
    }
    /* a gold starburst: glints thrown out in a ring */
    function sparkle(x, y) {
      var out = [];
      for (var i = 0; i < 70; i++) {
        var a = R(0, 6.28), v = R(3, 11);
        out.push({
          kind: i % 3 ? 'glint' : 'dot', r: R(2.4, 4.6), color: ['#f6e2a0', '#e3c88b', '#fff', '#c5a365'][i % 4],
          x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 0.12, drag: 0.94,
          rot: R(0, 6.28), vr: R(-0.1, 0.1), flip: R(0, 6.28), fr: R(0.1, 0.25),
          life: 0, max: R(70, 120), delay: R(0, 8)
        });
      }
      run(out);
    }
    /* embers that rise and flicker out, trailing a lantern */
    function embers(x, y, n) {
      var out = [];
      for (var i = 0; i < (n || 60); i++) {
        out.push({
          kind: 'ember', r: R(1.4, 3), color: Math.random() < 0.5 ? '#ffe0a0' : '#ffb35c', halo: 'rgba(255,150,70,.18)',
          x: x + R(-26, 26), y: y + R(-10, 20), vx: R(-0.6, 0.6), vy: R(-3.2, -0.8), g: -0.02, drag: 0.985,
          rot: 0, vr: 0, flip: R(0, 6.28), fr: R(0.08, 0.2), sway: 0.05, swayRate: R(0.04, 0.08), phase: R(0, 6.28),
          life: 0, max: R(90, 190), delay: R(0, 120)
        });
      }
      run(out);
    }
    return { confetti: confetti, sadRain: sadRain, notes: notes, sparkle: sparkle, embers: embers };
  })();

  /* ------------------------------------------------------ music toggle */
  (function music() {
    var btn = $('#musicBtn');
    if (!btn || !CFG.audioSrc) return;

    var audio = new Audio(CFG.audioSrc);
    audio.loop = true;
    audio.volume = typeof CFG.audioVolume === 'number' ? CFG.audioVolume : 0.35;

    /* Only show the button once we know the file actually exists. */
    audio.preload = 'metadata';
    audio.addEventListener('loadedmetadata', function () { btn.hidden = false; });
    audio.addEventListener('error', function () { btn.hidden = true; });

    btn.addEventListener('click', function () {
      if (audio.paused) {
        audio.play().then(function () {
          btn.classList.add('playing');
          btn.setAttribute('aria-pressed', 'true');
          btn.setAttribute('aria-label', 'Pause background music');
        }).catch(function () { /* browser refused; leave it alone */ });
      } else {
        audio.pause();
        btn.classList.remove('playing');
        btn.setAttribute('aria-pressed', 'false');
        btn.setAttribute('aria-label', 'Play background music');
      }
    });
  })();

  /* ------------------------------------------------- the Request Booth
     Three tiles (song, suggestion, wish), one shared name,
     and a send button that does something different for each. Entries go
     into the planner's database ("requests"); the public can only add. */
  (function booth() {
    var form = $('#boothForm');
    if (!form) return;
    var wrap = $('.booth'), tiles = $$('.tile'), panels = $$('.panel', form);
    var send = $('#boothSend'), sendIco = $('.send-ico', send), sendText = $('.send-text', send);
    var msg = $('#boothMsg'), done = $('#boothDone');
    var KIND = {
      song:       { icon: 'song', btn: 'Drop the needle', field: 'song', empty: 'Which song should we play?',
                    prompt: 'What gets you on the dance floor?', hint: 'Tell us the song. We’ll make sure the DJ (us) plays it.',
                    title: 'Needle’s down!', text: 'Your song is in the queue. See you on the dance floor.', unit: ['song', 'songs'] },
      suggestion: { icon: 'idea', btn: 'Fold & fly', field: 'idea', empty: 'What’s your idea?',
                    prompt: 'Make the weekend even better', hint: 'A hike, a game, a dish, a tradition from your family. We’re all ears.',
                    title: 'Idea landed!', text: 'Your note just touched down on our desk. Thank you for making the weekend better.', unit: ['idea', 'ideas'] },
      wish:       { icon: 'wish', btn: 'Send it up', field: 'wish', empty: 'Write your wish first.',
                    prompt: 'A few words for the two of us', hint: 'Blessings, advice, or your bold prediction for the first dance.',
                    title: 'Your wish is floating up', text: 'Thank you. We’ll read it together, probably more than once.', unit: ['wish', 'wishes'] }
    };
    /* songs famous for emptying (or stampeding) a dance floor */
    var BANNED = /macarena|chicken dance|cha.?cha slide|cotton.?eye.?joe|\by\.?m\.?c\.?a\b|gangnam|baby shark|hokey.?pokey|electric slide|achy breaky|who let the dogs|barbie girl/i;
    var kind = 'song', dared = false, busy = false, tally = { song: 0, suggestion: 0, wish: 0 };

    /* the line icons live in a <template> in the page, one per tile */
    function icon(name) { var t = $('#boothIcons'), i = t && t.content.querySelector('[data-k="' + name + '"] svg'); return i ? i.outerHTML : ''; }
    function show(text, isError) { msg.innerHTML = text; msg.classList.toggle('error', !!isError); msg.hidden = false; }
    function resetSend() {
      sendIco.innerHTML = icon(KIND[kind].icon); sendText.textContent = KIND[kind].btn;
      send.classList.remove('dare'); send.disabled = false; dared = false;
    }
    /* the card glides to its new height instead of snapping, so the page
       below eases up or down rather than jumping */
    var card = $('.booth-card'), morphing = null;
    function morph(change) {
      var from = card.offsetHeight;
      change();
      if (reduced || !from) return;
      var to = card.offsetHeight;
      if (morphing) morphing.cancel();
      if (Math.abs(from - to) < 4) return;
      card.style.overflow = 'hidden';
      morphing = card.animate([{ height: from + 'px' }, { height: to + 'px' }], { duration: 650, easing: 'cubic-bezier(.22,.61,.36,1)' });
      morphing.onfinish = morphing.oncancel = function () { card.style.overflow = ''; morphing = null; };
    }
    function pick(k, focus) { morph(function () { pickNow(k); }); if (focus) { var f = form.elements[KIND[k].field]; if (f) f.focus({ preventScroll: true }); } }
    function pickNow(k) {
      kind = k; wrap.dataset.kind = k;
      tiles.forEach(function (t) { t.setAttribute('aria-selected', String(t.dataset.kind === k)); });
      panels.forEach(function (p) { p.hidden = p.dataset.panel !== k; });
      if (typeof Crate !== 'undefined') Crate.show(k);
      $('#boothPrompt').textContent = KIND[k].prompt; $('#boothHint').textContent = KIND[k].hint;
      done.hidden = true; form.hidden = false; msg.hidden = true;
      resetSend();
    }
    tiles.forEach(function (t) { t.addEventListener('click', function () { pick(t.dataset.kind, true); }); });
    /* arrow keys move between tiles, like any tab list */
    $('.tiles').addEventListener('keydown', function (e) {
      var i = tiles.indexOf(document.activeElement); if (i < 0) return;
      var d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
      if (!d) return; e.preventDefault();
      var n = tiles[(i + d + tiles.length) % tiles.length]; n.focus(); pick(n.dataset.kind);
    });
    form.addEventListener('input', function (e) {
      if (dared && e.target.name === 'song') resetSend();
      msg.hidden = true;
    });

    /* ---- the flying props ------------------------------------------- */
    function prop(cls, html) {
      var el = document.createElement('div'); el.className = 'fx-prop ' + cls; el.setAttribute('aria-hidden', 'true');
      if (html) el.innerHTML = html;
      document.body.appendChild(el); return el;
    }
    function at(el, x, y) { return 'translate(' + (x - el.offsetWidth / 2) + 'px,' + (y - el.offsetHeight / 2) + 'px)'; }
    function gone(anim, el) { anim.onfinish = function () { el.remove(); }; }

    var PLAY = {
      /* a record spins up out of the button, then a burst of music notes */
      song: function (x, y, chaos) {
        var v = prop('fx-vinyl');
        var a = v.animate([
          { transform: at(v, x, y) + ' scale(.2) rotate(0deg)', opacity: 0 },
          { transform: at(v, x, y - 90) + ' scale(1.1) rotate(360deg)', opacity: 1, offset: .35 },
          { transform: at(v, x, y - 110) + ' scale(1) rotate(860deg)', opacity: 1, offset: .75 },
          { transform: at(v, x, y - 140) + ' scale(1.5) rotate(1100deg)', opacity: 0 }
        ], { duration: 2500, easing: 'cubic-bezier(.3,.6,.4,1)' });
        gone(a, v);
        setTimeout(function () { FX.notes(x, y - 110, chaos ? 90 : 46); if (chaos) FX.confetti(send.getBoundingClientRect()); }, 880);
      },
      /* the note folds into a paper plane and glides around the screen like a
         real one: steady speed, smoothly changing turns, a wide loop now and
         then, gently steering away from the edges, then out of sight. It
         leaves a soft gold contrail. A new flight every time. */
      suggestion: function (x, y) {
        var p = prop('fx-plane', '<svg viewBox="0 0 64 64"><path d="M4 30 L60 6 L40 58 L30 36 Z" fill="#fff" stroke="#c5a365" stroke-width="2" stroke-linejoin="round"/><path d="M30 36 L60 6 L22 33 Z" fill="#f3ead6" stroke="#c5a365" stroke-width="2" stroke-linejoin="round"/></svg>');
        var W = window.innerWidth, H = window.innerHeight, rnd = function (a, b) { return a + Math.random() * (b - a); };
        var M = Math.min(W, H), V = Math.max(4.5, M / 140);            /* pixels per step: steady speed */
        var KMAX = V / Math.max(110, M * 0.16);                          /* tightest ordinary turn */

        /* fly the route ahead of time, one small step at a time */
        var px = x, py = y, hd = -Math.PI / 2 + rnd(-0.5, 0.5), k = 0, path = [[px, py, hd]];
        var a1 = rnd(0.5, 1) * KMAX, w1 = rnd(0.012, 0.022), p1 = rnd(0, 6.28);
        var a2 = rnd(0.2, 0.5) * KMAX, w2 = rnd(0.03, 0.05), p2 = rnd(0, 6.28);
        var cruise = Math.round(rnd(2.6, 3.4) * M / V);                  /* steps before heading for the exit */
        var loopAt = Math.random() < 0.65 ? Math.round(rnd(0.25, 0.6) * cruise) : -1;
        var loopDir = Math.random() < 0.5 ? 1 : -1, loopK = V / Math.max(70, M * 0.1), loopLen = Math.round(2 * Math.PI / loopK);
        var exit = Math.random() < 0.5 ? [rnd(0.1, 0.9) * W, -200] : Math.random() < 0.5 ? [-200, rnd(0.1, 0.5) * H] : [W + 200, rnd(0.1, 0.5) * H];
        var turnTo = function (ang, gain) {                                  /* turn rate that eases the heading toward ang */
          var d = ang - hd; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
          return Math.max(-KMAX * 1.4, Math.min(KMAX * 1.4, d * gain));
        };
        for (var s = 0; s < 4000; s++) {
          var want;
          if (loopAt >= 0 && s >= loopAt && s < loopAt + loopLen) want = loopDir * loopK;      /* the loop-the-loop */
          else if (s < cruise) {
            want = a1 * Math.sin(w1 * s + p1) + a2 * Math.sin(w2 * s + p2);
            /* near an edge: lean back toward the middle, harder the closer it gets */
            var m = 0.14 * M, edge = Math.max(0, m - px, px - (W - m), m - py, py - (H - m)) / m;
            if (edge > 0) want = want * (1 - Math.min(1, edge)) + turnTo(Math.atan2(H * 0.45 - py, W / 2 - px), 0.08) * Math.min(1, edge * 1.5);
          } else want = turnTo(Math.atan2(exit[1] - py, exit[0] - px), 0.05);
          k += (want - k) * 0.08;                                        /* turns change smoothly, never snap */
          hd += k; px += Math.cos(hd) * V; py += Math.sin(hd) * V;
          path.push([px, py, hd]);
          if (s > cruise && (px < -120 || px > W + 120 || py < -120 || py > H + 120)) break;
        }

        /* draw it frame by frame, so the contrail stays glued to the tail */
        var cv = document.createElement('canvas'), ctx = cv.getContext('2d'), dpr = Math.min(2, window.devicePixelRatio || 1);
        cv.className = 'fx-prop fx-contrail'; cv.setAttribute('aria-hidden', 'true');
        cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
        document.body.insertBefore(cv, p); ctx.scale(dpr, dpr);
        var perMs = M * 0.0009 / V, len = path.length, tail = Math.round(1400 * perMs), t0 = performance.now();
        var half = p.offsetWidth / 2, sparks = [], R = function (a, b) { return a + Math.random() * (b - a); };
        function star(x0, y0, r0, rot) {   /* a four-pointed glint */
          ctx.beginPath();
          for (var n = 0; n < 8; n++) {
            var ang = rot + n * Math.PI / 4, rad = n % 2 ? r0 * 0.32 : r0;
            ctx[n ? 'lineTo' : 'moveTo'](x0 + Math.cos(ang) * rad, y0 + Math.sin(ang) * rad);
          }
          ctx.closePath(); ctx.fill();
        }
        (function frame(now) {
          /* g keeps counting after the plane has gone, so the contrail and sparks fade out on their own */
          var g = (now - t0) * perMs, f = Math.min(len - 1, g), i = Math.floor(f), flying = g < len - 1;
          if (flying) {
            var q = path[i], r = path[Math.min(len - 1, i + 1)], u = f - i;
            var cx = q[0] + (r[0] - q[0]) * u, cy = q[1] + (r[1] - q[1]) * u;
            var fadeIn = Math.min(1, f / 25), sc = 0.3 + 0.7 * fadeIn;
            p.style.opacity = fadeIn;
            p.style.transform = 'translate(' + (cx - half) + 'px,' + (cy - half) + 'px) rotate(' + (q[2] * 180 / Math.PI + 43).toFixed(1) + 'deg) scale(' + sc.toFixed(2) + ')';
            /* glitter shaken off the tail */
            if (f > 20) for (var n = Math.random() < 0.6 ? 2 : 1; n > 0; n--) {
              sparks.push({ x: cx - Math.cos(q[2]) * 24 + R(-5, 5), y: cy - Math.sin(q[2]) * 24 + R(-5, 5),
                            vx: -Math.cos(q[2]) * 0.6 + R(-0.5, 0.5), vy: R(-0.4, 0.3), r: R(1.6, 4.2), rot: R(0, 6.28), vr: R(-0.08, 0.08),
                            life: 0, max: R(55, 115), ph: R(0, 6.28), c: ['255,250,236', '243,214,150', '217,185,122', '255,255,255'][Math.random() * 4 | 0] });
            }
          } else if (p.isConnected) p.remove();
          ctx.clearRect(0, 0, W, H);
          /* contrail: a tapering streak, widest and brightest right behind the plane */
          ctx.lineCap = 'round';
          for (var j = Math.max(0, Math.floor(g - tail)); j < Math.min(g, len - 1); j += 2) {
            var age = (g - j) / tail, a = (1 - age) * (1 - age), nx = path[Math.min(len - 1, j + 2)];
            ctx.beginPath(); ctx.moveTo(path[j][0], path[j][1]); ctx.lineTo(nx[0], nx[1]);
            ctx.strokeStyle = 'rgba(205,168,98,' + (0.55 * a).toFixed(3) + ')'; ctx.lineWidth = 1 + 6 * (1 - age); ctx.stroke();
            ctx.strokeStyle = 'rgba(255,250,236,' + (0.95 * a).toFixed(3) + ')'; ctx.lineWidth = 0.5 + 1.8 * (1 - age); ctx.stroke();
          }
          /* the sparks drift down, twinkle and fade */
          ctx.shadowColor = 'rgba(255,214,140,.9)'; ctx.shadowBlur = 6;
          sparks = sparks.filter(function (sp) {
            sp.life++; sp.vy += 0.035; sp.vx *= 0.985; sp.x += sp.vx; sp.y += sp.vy; sp.rot += sp.vr;
            var k = sp.life / sp.max; if (k >= 1) return false;
            ctx.fillStyle = 'rgba(' + sp.c + ',' + ((1 - k) * (0.55 + 0.45 * Math.sin(sp.life * 0.45 + sp.ph))).toFixed(3) + ')';
            star(sp.x, sp.y, sp.r * (1 - k * 0.4), sp.rot);
            return true;
          });
          ctx.shadowBlur = 0;
          if (flying || sparks.length || g - tail < len) requestAnimationFrame(frame);
          else cv.remove();
        })(t0);
        setTimeout(function () { FX.sparkle(x, y - 40); }, 300);
      },
      /* a paper sky lantern lifts off on a random breeze and floats out of sight,
         with a couple of smaller ones rising far away behind it */
      wish: function (x, y) {
        var W = window.innerWidth, H = window.innerHeight, rnd = function (a, b) { return a + Math.random() * (b - a); };
        var LANTERN = '<span class="glow"></span><svg viewBox="0 0 60 84"><defs>' +
          '<radialGradient id="lnPaper" cx="50%" cy="78%" r="75%"><stop offset="0" stop-color="#fff6d6"/><stop offset=".35" stop-color="#ffd27a"/><stop offset=".7" stop-color="#f39445"/><stop offset="1" stop-color="#c8562b"/></radialGradient>' +
          '<radialGradient id="lnFlame" cx="50%" cy="60%" r="50%"><stop offset="0" stop-color="#fffbe8"/><stop offset=".5" stop-color="#ffe08a"/><stop offset="1" stop-color="#ff9a3c" stop-opacity="0"/></radialGradient></defs>' +
          '<path d="M9 8 Q30 1 51 8 L45 70 Q30 74 15 70 Z" fill="url(#lnPaper)"/>' +
          '<path d="M20 5 Q22 40 22 72 M30 3.5 V73.5 M40 5 Q38 40 38 72" stroke="#b34a22" stroke-opacity=".22" stroke-width="1" fill="none"/>' +
          '<path d="M9 8 Q30 1 51 8" stroke="#b34a22" stroke-opacity=".35" stroke-width="1.2" fill="none"/>' +
          '<ellipse cx="30" cy="71" rx="15.5" ry="3" fill="none" stroke="#7a3020" stroke-opacity=".7" stroke-width="1.2"/>' +
          '<ellipse class="flame" cx="30" cy="69" rx="6" ry="8" fill="url(#lnFlame)"/></svg>';
        function release(x0, y0, size, delay, dim) {
          var l = prop('fx-lantern' + (dim ? ' far' : ''), LANTERN);
          l.style.width = (60 * size) + 'px'; l.style.height = (84 * size) + 'px';
          /* the breeze: a drift to one side, a sway, and how fast it climbs */
          var drift = rnd(-0.32, 0.32) * W, sway = rnd(14, 38) * size, waves = rnd(1.5, 3.2), ph = rnd(0, 6.28);
          var top = -84 * size - 40, keys = [], N = 24;
          for (var i = 0; i <= N; i++) {
            var k = i / N, ease = Math.pow(k, 1.45);
            var px = x0 + drift * k + Math.sin(k * waves * 6.28 + ph) * sway * (0.3 + k);
            px = Math.max(30, Math.min(W - 30, px));
            var tilt = Math.cos(k * waves * 6.28 + ph) * 7;
            keys.push({ transform: at(l, px, y0 + (top - y0) * ease) + ' rotate(' + tilt.toFixed(1) + 'deg) scale(' + (1 - k * 0.5).toFixed(2) + ')',
                        opacity: i === 0 ? 0 : i === N ? 0 : i === 1 ? 1 : 1, offset: k });
          }
          gone(l.animate(keys, { duration: rnd(5200, 6400) * (dim ? 1.25 : 1), delay: delay, easing: 'cubic-bezier(.3,0,.7,1)', fill: 'backwards' }), l);
        }
        release(x, y - 50, 1.4, 0, false);
        for (var c = 0, m = 2 + (Math.random() * 2 | 0); c < m; c++) release(rnd(0.1, 0.9) * W, H + 60, rnd(0.35, 0.55), rnd(500, 1800), true);
        FX.embers(x, y - 40, 70);
        setTimeout(function () { FX.embers(x, y - 260, 40); }, 1400);
      }
    };

    /* ---- saving ----------------------------------------------------- */
    var local = /^(localhost|127\.0\.0\.1|\[::1\]|)$/.test(location.hostname);
    function save(payload) {
      /* previews on this computer never write to the real database */
      if (local) { console.info('[booth] preview only, not saved:', payload); return new Promise(function (r) { setTimeout(r, 350); }); }
      var store = CFG.rsvpStore || {};
      if (!store.projectId || !store.apiKey) return Promise.reject(new Error('not connected'));
      var id = '', abc = 'abcdefghijklmnopqrstuvwxyz0123456789';
      var rnd = (window.crypto && crypto.getRandomValues) ? crypto.getRandomValues(new Uint8Array(20)) : null;
      for (var k = 0; k < 20; k++) id += abc[rnd ? rnd[k] % abc.length : Math.floor(Math.random() * abc.length)];
      var fields = {};
      Object.keys(payload).forEach(function (key) { if (payload[key] !== '') fields[key] = { stringValue: payload[key] }; });
      var root = 'projects/' + store.projectId + '/databases/(default)/documents';
      /* create-only, with the server's own timestamp (the security rules insist on both) */
      return fetch('https://firestore.googleapis.com/v1/' + root + ':commit?key=' + encodeURIComponent(store.apiKey), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ writes: [{
          update: { name: root + '/requests/' + id, fields: fields },
          currentDocument: { exists: false },
          updateTransforms: [{ fieldPath: 'createdAt', setToServerValue: 'REQUEST_TIME' }]
        }] })
      }).then(function (res) { if (!res.ok) throw new Error('rejected'); });
    }
    function mailtoFallback() {
      return CFG.contactEmail ? ' Please email <a href="mailto:' + CFG.contactEmail + '">' + CFG.contactEmail + '</a> instead.' : '';
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (busy) return;
      msg.hidden = true;
      var f = form.elements, K = KIND[kind];
      var name = f.name.value.trim(), main = f[K.field].value.trim();
      if (!name) { show('Please tell us your name.', true); f.name.focus(); return; }
      if (!main) { show(K.empty, true); f[K.field].focus(); return; }
      if (f.website.value) return;   /* spam trap tripped: drop it quietly */

      /* the dare: a notorious song gets one "are you sure?" first */
      var chaos = kind === 'song' && BANNED.test(main);
      if (chaos && !dared) {
        dared = true;
        sendIco.textContent = '😏'; sendText.textContent = 'Bold choice. Sure?';
        send.classList.remove('dare'); void send.offsetWidth; send.classList.add('dare');
        show('That one is famous for clearing dance floors (or starting a stampede). Press again if you really mean it.');
        return;
      }

      var payload = {
        kind: kind, name: name,
        song: kind === 'song' ? main : '',
        dedication: kind === 'song' ? f.dedication.value.trim() : '',
        text: kind === 'song' ? '' : main,
        submittedAt: new Date().toISOString()
      };

      busy = true; send.disabled = true;
      var r = send.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
      if (!reduced) PLAY[kind](x, y, chaos);
      var wait = new Promise(function (res) { setTimeout(res, reduced ? 0 : kind === 'wish' ? 2200 : 1800); });
      Promise.all([save(payload), wait]).then(function () {
        busy = false;
        tally[kind]++;
        $('.done-ico', done).innerHTML = chaos ? '<span class="emo">🕺</span>' : icon(K.icon);
        $('#doneTitle').textContent = chaos ? 'Okay, you asked for it!' : K.title;
        $('#doneText').textContent = chaos ? 'It’s in the queue. Stretch first, you have been warned.' : K.text;
        var t = $('#doneTally');
        t.hidden = tally[kind] < 2;
        t.textContent = 'That’s ' + tally[kind] + ' ' + K.unit[1] + ' from you so far ' + (kind === 'song' ? '🎶' : '✨');
        morph(function () { form.hidden = true; done.hidden = false; });
        var d = $('.done-ico', done); d.style.animation = 'none'; void d.offsetWidth; d.style.animation = '';
        resetSend();
      }).catch(function () {
        busy = false; resetSend();
        show('Something went wrong sending that.' + mailtoFallback(), true);
      });
    });

    function clearKind() {
      var K = KIND[kind];
      form.elements[K.field].value = '';
      if (kind === 'song') form.elements.dedication.value = '';
    }
    $('#boothAgain').addEventListener('click', function () { clearKind(); pick(kind, true); });
    $('#boothOther').addEventListener('click', function () {
      clearKind();
      var next = tiles[(tiles.findIndex(function (t) { return t.dataset.kind === kind; }) + 1) % tiles.length];
      pick(next.dataset.kind); next.focus({ preventScroll: true });
    });

    /* ---- the crate -------------------------------------------------
       A row of ideas for whichever tile is chosen: album sleeves for
       songs, notecards for the rest. Flip through, tap one, and it's
       written into the form for you. */
    var Crate = (function () {
      var box = $('#crate'), row = $('#crateRow');
      if (!box || !row) return { show: function () {} };
      var EXTRA = CFG.boothIdeas || {};
      var SETS = {
        song: (CFG.songIdeas || []).map(function (s) { return { g: s[0], label: s[1], sub: s[2], fill: s[2] + ' — ' + s[1] }; })
      };
      ['suggestion', 'wish'].forEach(function (k) {
        SETS[k] = (EXTRA[k] || []).map(function (s) { return { g: s[0], label: s[1], sub: s[2], fill: s[2] }; });
      });
      var LINES = {
        song: 'Need inspiration? <small>Tap a record to request it.</small>',
        suggestion: 'Short on ideas? <small>Tap one to use it, or a few.</small>',
        wish: 'Lost for words? <small>Borrow one of these.</small>'
      };
      var filterBox = $('.crate-filter', box), prev = $('.crate-nav.prev', box), next = $('.crate-nav.next', box);
      var cur = 'song', genre = 'all', lastFill = '', order = [];

      function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
      function shuffled(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = (Math.random() * (i + 1)) | 0, t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
      function hash(t) { var h = 0; for (var i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) | 0; return Math.abs(h); }
      function groups() { var out = []; (SETS[cur] || []).forEach(function (s) { if (out.indexOf(s.g) < 0) out.push(s.g); }); return out; }
      function field() { return form.elements[KIND[cur].field]; }

      function card(idea, i) {
        var gi = groups().indexOf(idea.g), aria;
        if (cur === 'song') {
          aria = 'Request ' + idea.label + ' by ' + idea.sub;
          return '<button type="button" class="pick sleeve g' + (gi % 5) + ' m' + (hash(idea.label) % 4) + '" data-i="' + i + '" aria-label="' + esc(aria) + '">' +
            '<span class="jacket"><span class="disc" aria-hidden="true"></span>' +
            '<span class="cover"><span class="art"></span><i>' + esc(idea.g) + '</i><b>' + esc(idea.label) + '</b></span></span>' +
            '<span class="who">' + esc(idea.sub) + '</span></button>';
        }
        aria = 'Use: ' + idea.fill;
        return '<button type="button" class="pick notecard" data-i="' + i + '" aria-label="' + esc(aria) + '">' +
          '<i>' + esc(idea.g) + '</i><b>' + esc(idea.label) + '</b><span>' + esc(idea.sub) + '</span></button>';
      }
      function render() {
        var list = SETS[cur] || [];
        var shown = order.filter(function (i) { return genre === 'all' || list[i].g === genre; });
        row.innerHTML = shown.map(function (i) { return card(list[i], i); }).join('');
        row.scrollLeft = 0;
        mark(); arrows();
        if (!reduced) $$('.pick', row).forEach(function (el, k) {
          if (k > 8) return;
          el.animate([{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }],
                     { duration: 450, delay: k * 45, easing: 'cubic-bezier(.22,.61,.36,1)', fill: 'backwards' });
        });
      }
      function buildFilters() {
        filterBox.innerHTML = ['all'].concat(groups()).map(function (g) {
          return '<button type="button" data-g="' + esc(g) + '" aria-pressed="' + (g === genre) + '">' + (g === 'all' ? 'All' : esc(g)) + '</button>';
        }).join('');
        $('#crateLine').innerHTML = LINES[cur];
      }
      /* a gold tick on every idea already written into the form */
      function mark() {
        var v = (field() && field().value) || '', list = SETS[cur] || [];
        $$('.pick', row).forEach(function (el) { el.classList.toggle('in-use', v.indexOf(list[el.dataset.i].fill) >= 0); });
      }
      function arrows() {
        prev.disabled = row.scrollLeft < 8;
        next.disabled = row.scrollLeft + row.clientWidth > row.scrollWidth - 8;
      }
      row.addEventListener('scroll', arrows, { passive: true });
      window.addEventListener('resize', arrows);
      [prev, next].forEach(function (b, d) {
        b.addEventListener('click', function () { row.scrollBy({ left: (d ? 1 : -1) * row.clientWidth * 0.8, behavior: reduced ? 'auto' : 'smooth' }); });
      });
      filterBox.addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return;
        genre = b.dataset.g;
        $$('button', filterBox).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        render();
      });
      $('#crateShuffle').addEventListener('click', function () { order = shuffled(order); render(); });
      form.addEventListener('input', function (e) { if (e.target === field()) mark(); });

      row.addEventListener('click', function (e) {
        var el = e.target.closest('.pick'); if (!el) return;
        var idea = SETS[cur][el.dataset.i], f = field();
        if (cur === 'song' || !f.value.trim() || f.value === lastFill) f.value = idea.fill;
        else if (f.value.indexOf(idea.fill) < 0) f.value = f.value.replace(/\s+$/, '') + '\n' + idea.fill;   /* add to what they wrote */
        lastFill = f.value;
        f.dispatchEvent(new Event('input', { bubbles: true }));
        if (reduced) { flash(f); return; }
        /* a copy of the card lifts up into the field */
        var from = (el.querySelector('.cover') || el).getBoundingClientRect(), to = f.getBoundingClientRect();
        var ghost = (el.querySelector('.cover') || el).cloneNode(true);
        ghost.classList.add('pick-fly'); ghost.classList.add.apply(ghost.classList, el.className.split(' '));
        ghost.classList.remove('in-use');
        ghost.style.cssText += ';left:' + from.left + 'px;top:' + from.top + 'px;width:' + from.width + 'px;height:' + from.height + 'px;';
        document.body.appendChild(ghost);
        var tx = to.left + 24 - from.left, ty = to.top + Math.min(to.height / 2, 22) - from.top - from.height / 2;
        var a = ghost.animate([
          { transform: 'translate(0,0) scale(1)', opacity: 1 },
          { transform: 'translate(' + tx + 'px,' + ty + 'px) scale(.18)', opacity: 0 }
        ], { duration: 520, easing: 'cubic-bezier(.5,0,.2,1)' });
        a.onfinish = function () { ghost.remove(); flash(f); };
      });
      function flash(f) {
        f.classList.remove('filled'); void f.offsetWidth; f.classList.add('filled');
        var r = f.getBoundingClientRect();
        if (r.top < 70 || r.bottom > window.innerHeight) f.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
      }

      return {
        show: function (kind) {
          cur = kind; genre = 'all'; lastFill = '';
          var list = SETS[cur] || [];
          box.hidden = !list.length;
          if (!list.length) return;
          order = shuffled(list.map(function (_, i) { return i; }));
          buildFilters(); render();
        }
      };
    })();
    pick('song');
  })();
})();
