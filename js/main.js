/* Sakina Art Blog – shared script: studio artwork, nav, cursor, transitions, GSAP */
const CFG = window.SITE_CONFIG;
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const HAS_GSAP = !!window.gsap;
if (HAS_GSAP && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

const CATEGORIES = [
  { id: 'paintings', name: 'Paintings', flora: 'palette', tint: '#F5C518' },
  { id: 'resin', name: 'Resin Art', flora: 'drops', tint: '#E63946' },
  { id: 'tshirts', name: 'T-Shirts', flora: 'swatches', tint: '#F4A261' },
  { id: 'decor', name: 'Home Décor', flora: 'palette2', tint: '#E8651A' },
  { id: 'gifting', name: 'Gifting', flora: 'tube', tint: '#C9184A' }
];
const catOf = id => CATEGORIES.find(c => c.id === id) || CATEGORIES[0];
const catName = id => catOf(id).name;
const money = n => '₹' + Number(n).toLocaleString('en-IN');

/* ---------- painter's-studio SVG sprite (hand-drawn style) ---------- */
const PAL = { yellow: '#F5C518', orange: '#E8651A', coral: '#E63946', magenta: '#C9184A', amber: '#F4A261' };
const INK = '#2D1B00', CREAM = '#FFF8E7';
// outlined shape + a second, offset pencil line so it looks sketched twice
const ln = (d, fillc, sw = 3) =>
  `<path d="${d}" fill="${fillc}" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/>` +
  `<path d="${d}" fill="none" stroke="${INK}" stroke-width="1.3" stroke-opacity=".35" transform="translate(2.5 -2) rotate(.8 100 100)"/>`;
const blob = (cx, cy, r, c) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${(r * .8).toFixed(1)}" fill="${c}" stroke="${INK}" stroke-width="1.6" stroke-opacity=".5" transform="rotate(-12 ${cx} ${cy})"/>` +
  `<ellipse cx="${(cx - r * .3).toFixed(1)}" cy="${(cy - r * .3).toFixed(1)}" rx="${(r * .28).toFixed(1)}" ry="${(r * .16).toFixed(1)}" fill="#fff" fill-opacity=".6"/>`;
const drop = (cx, cy, s, c) =>
  `<path d="M${cx} ${cy - s * 1.1}C${cx + s * .2} ${cy - s * .5} ${cx + s * .9} ${cy + s * .1} ${cx + s * .9} ${cy + s * .5}C${cx + s * .9} ${cy + s * 1.05} ${cx + s * .45} ${cy + s * 1.3} ${cx} ${cy + s * 1.3}C${cx - s * .45} ${cy + s * 1.3} ${cx - s * .9} ${cy + s * 1.05} ${cx - s * .9} ${cy + s * .5}C${cx - s * .9} ${cy + s * .1} ${cx - s * .2} ${cy - s * .5} ${cx} ${cy - s * 1.1}Z" fill="${c}" stroke="${INK}" stroke-width="2" stroke-opacity=".7"/>` +
  `<ellipse cx="${(cx - s * .3).toFixed(1)}" cy="${(cy + s * .35).toFixed(1)}" rx="${(s * .16).toFixed(1)}" ry="${(s * .3).toFixed(1)}" fill="#fff" fill-opacity=".55"/>`;

const tube = (band, squeeze) => `<g filter="url(#sk)"><g transform="rotate(-32 100 105)">
  <path d="M90 50C80 24 94 6 108 20C120 8 134 32 112 50Z" fill="${squeeze}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
  ${ln('M88 50L112 50L112 64L88 64Z', '#ECE6D6')}${ln('M80 64L120 64L134 80L66 80Z', CREAM)}${ln('M66 80L134 80L129 170L71 170Z', CREAM)}
  <path d="M67.5 104L132.5 104L131 146L69 146Z" fill="${band}" stroke="${INK}" stroke-width="2"/>
  <path d="M78 125Q90 114 100 125T122 125" stroke="${CREAM}" stroke-width="4" fill="none" stroke-linecap="round"/>
  ${ln('M71 170L129 170L129 184L71 184Z', '#D9D2C0')}
  <path d="M80 170V184M90 170V184M100 170V184M110 170V184M120 170V184" stroke="${INK}" stroke-width="1.4" stroke-opacity=".6"/>
</g></g>`;
const brush = (handle, bristle, rot) => `<g filter="url(#sk)"><g transform="rotate(${rot} 100 105)">
  ${ln('M95 192L105 192L108 94L92 94Z', handle)}${ln('M91 94L109 94L107 62L93 62Z', '#D9D2C0')}
  <path d="M92 76H108M92 84H108" stroke="${INK}" stroke-width="1.4" stroke-opacity=".5"/>
  ${ln('M93 62C88 44 95 26 100 10C105 26 112 44 107 62Z', bristle)}
  <path d="M100 12C95 26 104 32 99 48" stroke="${bristle}" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/>
  ${drop(116, 30, 5, bristle)}${drop(86, 8, 3.5, bristle)}
</g></g>`;
const flatBrush = (handle, bristle, rot) => `<g filter="url(#sk)"><g transform="rotate(${rot} 100 105)">
  ${ln('M94 192L106 192L109 96L91 96Z', handle)}${ln('M87 96L113 96L116 66L84 66Z', '#D9D2C0')}
  <path d="M86 78H114M85.5 86H114.5" stroke="${INK}" stroke-width="1.4" stroke-opacity=".5"/>
  ${ln('M84 66L116 66L114 26C110 16 90 16 86 26Z', bristle)}
  <path d="M92 30L92 60M100 26L100 60M108 30L108 60" stroke="${INK}" stroke-width="1.2" stroke-opacity=".3"/>
  ${drop(122, 20, 4.5, bristle)}
</g></g>`;
const roundPalette = `<g filter="url(#sk)">
  ${ln('M100 22C152 14 190 54 184 102C180 142 140 184 96 178C68 174 60 150 80 140C96 132 90 114 70 116C36 120 12 92 24 62C36 34 68 24 100 22Z', '#F9E2A8')}
  <ellipse cx="58" cy="82" rx="10" ry="8" fill="#FFFBF0" stroke="${INK}" stroke-width="2.5"/></g>
  ${blob(104, 52, 15, PAL.yellow)}${blob(145, 72, 15, PAL.orange)}${blob(158, 108, 14, PAL.coral)}${blob(141, 145, 14, PAL.magenta)}${blob(104, 155, 13, PAL.amber)}${blob(112, 104, 9, '#F7A31C')}`;
const rectPalette = `<g transform="rotate(8 100 100)"><g filter="url(#sk)">
  ${ln('M48 44H152C170 44 180 58 178 80C176 120 170 150 140 156H52C30 156 20 140 22 120C24 90 22 44 48 44Z', '#F9E2A8')}
  <ellipse cx="48" cy="72" rx="10" ry="8" fill="#FFFBF0" stroke="${INK}" stroke-width="2.5"/></g>
  ${blob(86, 72, 14, PAL.yellow)}${blob(120, 66, 14, PAL.orange)}${blob(152, 82, 13, PAL.coral)}${blob(144, 120, 13, PAL.magenta)}${blob(104, 124, 14, PAL.amber)}${blob(64, 122, 12, '#F7A31C')}</g>`;
const fan = () => [[-34, PAL.yellow], [-17, PAL.amber], [0, PAL.orange], [17, PAL.coral], [34, PAL.magenta]].map(([a, c]) =>
  `<g transform="rotate(${a} 100 176)"><g filter="url(#sk)">${ln('M88 30H112Q114 30 114 33V176H86V33Q86 30 88 30Z', CREAM, 2.6)}</g>
   <rect x="90" y="35" width="20" height="62" rx="3" fill="${c}"/><path d="M92 108H108M92 116H104M92 124H108" stroke="${INK}" stroke-width="1.5" stroke-opacity=".4"/></g>`).join('') +
  `<circle cx="100" cy="170" r="6" fill="${INK}"/><circle cx="100" cy="170" r="2" fill="${CREAM}"/>`;
const splat = `<g filter="url(#wc)">
  <path d="M100 40C124 34 150 52 152 78C170 82 176 108 160 120C166 144 140 160 120 150C108 170 80 166 74 146C50 150 34 126 46 106C30 90 44 66 66 62C70 46 84 42 100 40Z" fill="${PAL.coral}" fill-opacity=".92"/>
  <path d="M100 40C124 34 150 52 152 78C170 82 176 108 160 120C166 144 140 160 120 150C108 170 80 166 74 146C50 150 34 126 46 106C30 90 44 66 66 62C70 46 84 42 100 40Z" fill="${PAL.orange}" fill-opacity=".95" transform="translate(45 46) scale(.55)"/>
  <path d="M100 40C124 34 150 52 152 78C170 82 176 108 160 120C166 144 140 160 120 150C108 170 80 166 74 146C50 150 34 126 46 106C30 90 44 66 66 62C70 46 84 42 100 40Z" fill="${PAL.yellow}" transform="translate(72 74) scale(.28)"/>
  <circle cx="28" cy="40" r="7" fill="${PAL.orange}"/><circle cx="174" cy="40" r="5" fill="${PAL.magenta}"/><circle cx="22" cy="150" r="4.5" fill="${PAL.yellow}"/><circle cx="176" cy="164" r="8" fill="${PAL.amber}"/><circle cx="150" cy="22" r="3.5" fill="${PAL.coral}"/>
  <path d="M96 156C93 172 98 184 95 194" stroke="${PAL.coral}" stroke-width="9" fill="none" stroke-linecap="round"/></g>`;
const dropsArt = `<g>${drop(72, 78, 28, PAL.coral)}${drop(130, 100, 21, PAL.yellow)}${drop(98, 146, 16, PAL.magenta)}${drop(154, 50, 10, PAL.orange)}${drop(42, 144, 10, PAL.amber)}</g>`;

const SPRITE = `
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
  <filter id="wc" x="-20%" y="-20%" width="140%" height="140%">
    <feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="3" seed="4" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="9" result="d"/>
    <feGaussianBlur in="d" stdDeviation=".7"/>
  </filter>
  <filter id="sk" x="-10%" y="-10%" width="120%" height="120%">
    <feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="2" seed="11" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="4"/>
  </filter>
  <filter id="rough" x="-5%" y="-20%" width="110%" height="140%">
    <feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="2" seed="8" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="3.5"/>
  </filter>
  <symbol id="tube" viewBox="0 0 200 200">${tube(PAL.orange, PAL.coral)}</symbol>
  <symbol id="tube2" viewBox="0 0 200 200">${tube(PAL.yellow, PAL.magenta)}</symbol>
  <symbol id="brush" viewBox="0 0 200 200">${brush(PAL.yellow, PAL.coral, -34)}</symbol>
  <symbol id="brush2" viewBox="0 0 200 200">${flatBrush(PAL.orange, PAL.magenta, 30)}</symbol>
  <symbol id="palette" viewBox="0 0 200 200">${roundPalette}</symbol>
  <symbol id="palette2" viewBox="0 0 200 200">${rectPalette}</symbol>
  <symbol id="swatches" viewBox="0 0 200 200">${fan()}</symbol>
  <symbol id="splat" viewBox="0 0 200 200">${splat}</symbol>
  <symbol id="drops" viewBox="0 0 200 200">${dropsArt}</symbol>
</defs></svg>`;
document.body.insertAdjacentHTML('afterbegin', SPRITE);

const floraSVG = t => `<svg viewBox="0 0 200 200" aria-hidden="true"><use href="#${t}" width="200" height="200"/></svg>`;
// rough painted brushstroke divider: amber / orange / yellow with a coral glint
const BRUSH = `<svg viewBox="0 0 800 40" preserveAspectRatio="none" aria-hidden="true"><g filter="url(#wc)" fill="none" stroke-linecap="round">
  <path d="M6 20 C120 6 230 34 380 18 S620 8 794 22" stroke="${PAL.amber}" stroke-width="15" stroke-opacity=".9"/>
  <path d="M40 24 C200 14 330 32 480 22 S680 16 770 26" stroke="${PAL.orange}" stroke-width="8" stroke-opacity=".9"/>
  <path d="M120 13 C250 8 400 20 560 12" stroke="${PAL.yellow}" stroke-width="4"/>
  <path d="M420 28 C520 32 640 24 730 30" stroke="${PAL.coral}" stroke-width="3" stroke-opacity=".8"/></g></svg>`;
const fill = root => {
  root.querySelectorAll('[data-flora]:empty').forEach(el => el.innerHTML = floraSVG(el.dataset.flora));
  root.querySelectorAll('[data-brush]:empty').forEach(el => el.innerHTML = BRUSH);
};

/* ---------- header / footer / mobile menu ---------- */
const page = document.body.dataset.page;
const LINKS = [['index.html', 'Home', 'home'], ['customise.html', 'Customise', 'customise'], ['shop.html', 'Shop', 'shop'], ['about.html', 'About', 'about'], ['contact.html', 'Contact', 'contact']];
const UL = '<svg class="ul" viewBox="0 0 100 8" preserveAspectRatio="none" aria-hidden="true"><path class="y" d="M2 5 Q18 2 38 5 T70 4 T98 4" pathLength="1"/><path class="o" d="M3 6 Q22 3 42 6 T72 5 T97 6" pathLength="1"/></svg>';
const BAG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>';

document.getElementById('site-header').innerHTML = `
<header class="site"><div class="wrap nav">
  <a class="logo" href="index.html"><svg class="logo-ic" viewBox="0 0 200 200" aria-hidden="true"><use href="#palette" width="200" height="200"/></svg><span data-paint>${CFG.brand}</span></a>
  <nav class="menu" aria-label="Main">${LINKS.map(l => `<a href="${l[0]}" class="${page === l[2] ? 'active' : ''}">${l[1]}${UL}</a>`).join('')}</nav>
  <div class="nav-r">
    <button class="cart-btn" id="cart-btn" type="button" aria-label="Open cart">${BAG}<span class="badge" id="cart-count" hidden>0</span></button>
    <button class="burger" id="burger" aria-label="Open menu" aria-expanded="false"><span></span><span></span><span></span></button>
  </div>
</div></header>
<div class="mnav" id="mnav" aria-hidden="true">
  <div class="flora mn1" data-flora="palette"></div><div class="flora mn2" data-flora="brush"></div><div class="flora mn3" data-flora="tube"></div>
  <nav>${LINKS.map(l => `<a href="${l[0]}" class="${page === l[2] ? 'active' : ''}">${l[1]}</a>`).join('')}</nav>
</div>`;

document.getElementById('site-footer').innerHTML = `
<footer class="site-footer">
  <div class="flora f1" data-flora="tube2"></div><div class="flora f2" data-flora="splat"></div>
  <div class="wrap">
    <div class="cols">
      <div><h3>${CFG.brand}</h3><p>Painted by hand,<br>made with soul.</p></div>
      <div><h3>Explore</h3><ul>${LINKS.map(l => `<li><a href="${l[0]}">${l[1]}</a></li>`).join('')}</ul></div>
      <div><h3>Say hello</h3><ul>
        <li><a href="${CFG.instagram}" target="_blank" rel="noopener">${CFG.handle}</a></li>
        <li><a href="https://wa.me/${CFG.whatsapp}" target="_blank" rel="noopener">WhatsApp</a></li>
        <li><a href="mailto:${CFG.email}">${CFG.email}</a></li></ul></div>
    </div>
    <p class="copy">© ${new Date().getFullYear()} ${CFG.brand}</p>
  </div>
</footer>
<a class="wa-float" href="https://wa.me/${CFG.whatsapp}" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">Chat</a>
<div id="wash-page" aria-hidden="true"></div>`;

const burger = document.getElementById('burger'), mnav = document.getElementById('mnav');
function toggleMenu(open) {
  open = open ?? !mnav.classList.contains('open');
  mnav.classList.toggle('open', open);
  burger.classList.toggle('on', open);
  burger.setAttribute('aria-expanded', open);
  mnav.setAttribute('aria-hidden', !open);
  document.body.style.overflow = open ? 'hidden' : '';
  if (open && HAS_GSAP && !RM) gsap.fromTo('#mnav nav a', { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: .08, duration: .7, ease: 'power3.out', delay: .15 });
}
burger.onclick = () => toggleMenu();

/* ---------- products (shared by Home + Shop) ---------- */
const placeholderHTML = id => { const c = catOf(id); return `<div class="ph" style="--tint:${c.tint}">${floraSVG(c.flora)}</div>`; };
const phHTML = p => p.image
  ? `<img class="photo" src="${p.image}" alt="${p.title}" loading="lazy" data-cat="${p.category}">`
  : placeholderHTML(p.category);
const priceText = p => p.price ? `${p.from ? 'From ' : ''}${money(p.price)}` : 'Price on request';
// a picture that fails to load (offline, bad path) falls back to a painted illustration
document.addEventListener('error', e => {
  const t = e.target;
  if (t.tagName === 'IMG' && t.classList.contains('photo')) {
    const d = document.createElement('div'); d.innerHTML = placeholderHTML(t.dataset.cat);
    t.replaceWith(d.firstElementChild);
  }
}, true);

const loadProducts = () => fetch('data/products.json').then(r => r.json()).then(j => j.products);

const featured = document.getElementById('featured');
if (featured) loadProducts().then(ps => {
  featured.innerHTML = [0, 3, 10].map(i => ps[i]).filter(Boolean).map(p => `
    <a class="piece reveal" href="shop.html?open=${p.id}">
      <figure>${phHTML(p)}</figure>
      <div class="cap"><span class="kicker">${catName(p.category)}</span><h3>${p.title}</h3><p>${p.medium} · ${priceText(p)}</p><span class="btn sm">View piece</span></div>
    </a>`).join('');
  fill(featured); reveal(featured);
});

const tiles = document.getElementById('ig-tiles');
if (tiles) tiles.innerHTML = [['palette', '#F5C518'], ['brush', '#E8651A'], ['tube', '#E63946'], ['swatches', '#F4A261'], ['splat', '#C9184A'], ['drops', '#F5C518']]
  .map(([f, t]) => `<a class="tile reveal" href="${CFG.instagram}" target="_blank" rel="noopener" aria-label="Instagram"><div class="ph" style="--tint:${t}">${floraSVG(f)}</div></a>`).join('');

fill(document);

/* ---------- animation helpers ---------- */
function splitPaint(el) {
  const text = el.textContent;
  el.setAttribute('aria-label', text);
  el.innerHTML = text.split(' ').map(w => `<span class="w" aria-hidden="true">${[...w].map(ch => `<span class="ch">${ch}</span>`).join('')}</span>`).join(' ');
  return el.querySelectorAll('.ch');
}
function reveal(root = document, force = false) {
  if (!HAS_GSAP || RM || !window.ScrollTrigger) return;
  root.querySelectorAll('.reveal:not(.rv-done)').forEach((el, i) => {
    el.classList.add('rv-done');
    gsap.from(el, {
      y: 60, x: i % 2 ? 18 : -18, opacity: 0, rotate: i % 2 ? .9 : -.9, duration: 1.25, ease: 'power3.out',
      delay: (i % 3) * .08,
      scrollTrigger: { trigger: el, start: 'top 90%', once: true }
    });
  });
  if (force) ScrollTrigger.refresh();
}

function intro() {
  if (!HAS_GSAP || RM) return;
  document.querySelectorAll('[data-paint]').forEach((el, n) => {
    const chars = splitPaint(el);
    const target = getComputedStyle(el).color;
    gsap.fromTo(chars,
      { opacity: 0, filter: 'blur(14px)', scale: 1.3, y: 8, color: PAL.amber },
      { opacity: 1, filter: 'blur(0px)', scale: 1, y: 0, color: target, duration: 1.3, ease: 'power2.out', stagger: .055, delay: .25 + n * .15, clearProps: 'filter,transform,color' });
  });
  const has = s => document.querySelector(s);
  if (has('.wash')) gsap.from('.wash', { opacity: 0, scale: .4, duration: 2.4, ease: 'power2.out' });
  if (has('.hero, .page-head p')) gsap.from('.hero .lead, .hero .actions, .hero .eyebrow, .page-head p', { opacity: 0, y: 24, duration: 1.1, stagger: .15, delay: 1.1, ease: 'power2.out' });
  if (has('.page-head .flora, .hero .flora')) gsap.from('.page-head .flora, .hero .flora', { opacity: 0, scale: .6, duration: 1.8, stagger: .2, ease: 'power2.out' });
  reveal(document);
}

/* ---------- paintbrush cursor: brief paint trail + splatter on hover ---------- */
// the brush itself is the CSS cursor (see style.css); this adds the fading paint dots
function cursor() {
  if (!HAS_GSAP || RM || !matchMedia('(pointer:fine)').matches) return;
  const cols = Object.values(PAL), pick = () => cols[Math.floor(Math.random() * cols.length)];
  const blobR = () => `${40 + Math.random() * 30}% ${40 + Math.random() * 30}% ${40 + Math.random() * 30}% ${40 + Math.random() * 30}%`;
  const dot = (x, y, size, life, spread = 0) => {
    const s = document.createElement('i'); s.className = 'splat';
    Object.assign(s.style, { width: size + 'px', height: size + 'px', background: pick(), left: x + 'px', top: y + 'px', borderRadius: blobR() });
    document.body.appendChild(s);
    const a = Math.random() * Math.PI * 2, d = spread * (.5 + Math.random());
    gsap.fromTo(s, { x: 0, y: 0, scale: .5, opacity: .85 }, { x: Math.cos(a) * d, y: Math.sin(a) * d, scale: 1.1, opacity: 0, duration: life, ease: 'power1.out', onComplete: () => s.remove() });
  };
  let lx = -999, ly = -999, dist = 0, lastEl = null;
  addEventListener('mousemove', e => {
    dist += Math.hypot(e.clientX - lx, e.clientY - ly); lx = e.clientX; ly = e.clientY;
    if (dist < 16) return;
    dist = 0;
    for (let i = 0; i < 2 + (Math.random() < .5 ? 1 : 0); i++)
      dot(e.clientX + (Math.random() - .5) * 10, e.clientY + (Math.random() - .5) * 10, 5 + Math.random() * 8, .4);
  }, { passive: true });
  document.addEventListener('mouseover', e => {
    const el = e.target.closest('a,button,[role=button],.pcard,.piece,.tile,.pill,select,input[type=range]');
    if (el && el !== lastEl) for (let i = 0; i < 6; i++) dot(e.clientX, e.clientY, 6 + Math.random() * 12, .7, 34);
    lastEl = el || null;
  });
}

/* ---------- page transition: watercolour wash ---------- */
const wash = document.getElementById('wash-page');
let leaving = false;
function pageWash() {
  if (!HAS_GSAP || RM) return;
  if (sessionStorage.getItem('wash')) {
    sessionStorage.removeItem('wash');
    gsap.set(wash, { x: 0 });
    gsap.to(wash, { x: '135vw', duration: 1.1, ease: 'power2.inOut', delay: .05 });
  }
  addEventListener('pageshow', e => { if (e.persisted) { leaving = false; gsap.set(wash, { x: '-135vw' }); } });
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || leaving || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    const u = new URL(a.href, location.href);
    if (u.origin !== location.origin || a.target === '_blank' || a.hasAttribute('download')) return;
    if (u.pathname === location.pathname && u.search === location.search) { if (u.hash) return; e.preventDefault(); return; }
    e.preventDefault(); leaving = true; toggleMenu(false);
    gsap.fromTo(wash, { x: '-135vw' }, { x: 0, duration: .85, ease: 'power2.inOut', onComplete: () => { sessionStorage.setItem('wash', '1'); location.href = a.href; } });
  });
}

cursor(); pageWash(); intro();
