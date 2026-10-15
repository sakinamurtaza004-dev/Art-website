/* Shop page: filters, masonry grid, product modal */
(() => {
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const FILTERS = [['all', 'All'], ['paintings', 'Paintings'], ['resin', 'Resin Art'], ['tshirts', 'T-Shirts'], ['decor', 'Home Décor'], ['gifting', 'Gifting']];
  const grid = $('#shop-grid'), bar = $('#filters');
  let all = [], byId = {}, current = 'all', busy = false, triggers = [];

  /* painted band behind the banner title */
  $('#band').innerHTML = `<svg viewBox="0 0 1440 320" preserveAspectRatio="none"><g filter="url(#wc)" fill="none" stroke-linecap="round">
    <path d="M-20 120 C300 60 520 180 820 110 S1260 70 1470 130" stroke="${PAL.amber}" stroke-width="130" stroke-opacity=".5"/>
    <path d="M-20 200 C260 250 560 150 860 215 S1250 250 1470 190" stroke="${PAL.yellow}" stroke-width="100" stroke-opacity=".5"/>
    <path d="M200 160 C480 120 760 200 1100 150" stroke="${PAL.magenta}" stroke-width="70" stroke-opacity=".4"/></g></svg>`;

  /* ---------- cards ---------- */
  const link = (p, item) => `customise.html?category=${p.custom}&item=${encodeURIComponent(item)}`;
  const card = p => {
    const btn = p.sold ? `<a class="btn sm" href="${link(p, 'Something like ' + p.title)}">Request similar</a>`
      : p.cta === 'cart' ? `<button type="button" class="btn sm" data-add="${p.id}">Add to Cart</button>`
      : `<a class="btn sm" href="${link(p, p.title)}">Enquire</a>`;
    return `<article class="pcard${p.sold ? ' sold' : ''}" tabindex="0" data-id="${p.id}" style="--tint:${catOf(p.category).tint}" aria-label="${esc(p.title)}">
      <figure style="aspect-ratio:${p.ratio || '4/5'}">${phHTML(p)}<span class="tintwash"></span>
        ${p.original && !p.sold ? '<span class="stamp-badge">One of a kind</span>' : ''}${p.sold ? '<span class="sold-tag">Sold</span>' : ''}</figure>
      <div class="pc-cap"><h3>${esc(p.title)}</h3><p class="meta">${esc(p.medium)} · ${esc(p.size)}</p>
        <div class="pc-row"><span class="price">${priceText(p)}</span>${btn}</div></div></article>`;
  };

  const list = () => current === 'all' ? all : all.filter(p => p.category === current);
  function draw(first) {
    triggers.forEach(t => t.kill()); triggers = [];
    grid.innerHTML = list().map(card).join('');
    fill(grid);
    if (first && HAS_GSAP && !RM && window.ScrollTrigger) {
      const cards = $$('.pcard');
      gsap.set(cards, { opacity: 0, y: 70 });
      triggers = ScrollTrigger.batch(cards, { start: 'top 94%', once: true,
        onEnter: els => gsap.to(els, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', stagger: .12, clearProps: 'transform,opacity' }) });
    }
  }
  const paintFilters = () => bar.innerHTML = FILTERS.map(([id, name]) =>
    `<button type="button" class="fpill ${current === id ? 'on' : ''}" data-id="${id}" aria-pressed="${current === id}">${name}</button>`).join('');

  /* filter change: pieces scatter, then reassemble */
  const rnd = (a, b) => gsap.utils.random(a, b);
  function setFilter(id) {
    if (busy || id === current) return;
    current = id; paintFilters();
    const cards = $$('.pcard');
    if (!HAS_GSAP || RM || !cards.length) { draw(); return; }
    busy = true;
    gsap.to(cards, { x: () => rnd(-170, 170), y: () => rnd(-130, 130), rotate: () => rnd(-24, 24), opacity: 0, scale: .7,
      duration: .45, ease: 'power2.in', stagger: { amount: .2 },
      onComplete() {
        draw();
        gsap.fromTo($$('.pcard'), { x: () => rnd(-220, 220), y: () => rnd(-170, 170), rotate: () => rnd(-24, 24), opacity: 0, scale: .7 },
          { x: 0, y: 0, rotate: 0, opacity: 1, scale: 1, duration: .95, ease: 'back.out(1.3)', stagger: { amount: .5 }, clearProps: 'transform,opacity',
            onComplete: () => { busy = false; if (window.ScrollTrigger) ScrollTrigger.refresh(); } });
      } });
  }
  bar.addEventListener('click', e => { const b = e.target.closest('.fpill'); if (b) setFilter(b.dataset.id); });

  grid.addEventListener('click', e => {
    const add = e.target.closest('[data-add]');
    if (add) { Cart.add(byId[add.dataset.add]); return; }
    if (e.target.closest('a')) return;
    const c = e.target.closest('.pcard'); if (c) openModal(c.dataset.id);
  });
  grid.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('pcard')) { e.preventDefault(); openModal(e.target.dataset.id); }
  });

  /* ---------- product modal ---------- */
  const pm = $('#pm'), panel = $('#pm-panel'), body = $('#pm-body'), pwash = $('#pm-wash');
  let lastFocus = null, swapping = false;
  const stripes = ['#F4A261', '#C9184A', '#F5C518', '#E8651A', '#F4A261', '#F5C518', '#C9184A'];
  pwash.innerHTML = `<svg viewBox="0 0 1000 900" preserveAspectRatio="none"><g filter="url(#wc)" fill="none" stroke-linecap="round">${stripes.map((c, i) =>
    `<path d="M30 ${70 + i * 125} C260 ${40 + i * 125} 540 ${110 + i * 125} 975 ${75 + i * 125}" stroke="${c}" stroke-width="190" stroke-opacity=".96"/>`).join('')}</g></svg>`;

  const meta = (k, v) => `<div><dt>${k}</dt><dd>${v}</dd></div>`;
  function modalHTML(p) {
    const related = [...all.filter(x => x.id !== p.id && x.category === p.category), ...all.filter(x => x.id !== p.id && x.category !== p.category)].slice(0, 3);
    const cta = p.sold ? `<a class="btn solid" href="${link(p, 'Something like ' + p.title)}">Request something similar</a>`
      : p.cta === 'cart' ? `<button type="button" class="btn solid" data-add="${p.id}">Add to Cart</button><a class="btn" href="${link(p, p.title)}">Customise a similar one</a>`
      : `<a class="btn solid" href="${link(p, p.title)}">Request This Piece</a>`;
    return `
      <div class="pm-grid">
        <figure class="pm-img" style="--tint:${catOf(p.category).tint}"><div style="aspect-ratio:${p.ratio || '4/5'}">${phHTML(p)}</div>${p.original && !p.sold ? '<span class="stamp-badge big">One of a kind</span>' : ''}</figure>
        <div class="pm-info">
          <span class="kicker">${catName(p.category)}</span>
          <h2 id="pm-title">${esc(p.title)}</h2>
          <p class="pm-price">${priceText(p)}</p>
          <p class="pm-desc">${esc(p.description || '')}</p>
          <dl class="pm-meta">${meta('Medium', esc(p.medium))}${meta('Size', esc(p.size))}${meta('Availability', esc(p.availability || ''))}${p.original ? meta('Edition', 'Original · one of a kind') : ''}</dl>
          <div class="pm-actions">${cta}</div>
        </div>
      </div>
      <div class="rel"><h3>You might also love</h3><div class="rel-grid">${related.map(r => `
        <button type="button" class="rel-card" data-open="${r.id}" style="--tint:${catOf(r.category).tint}">
          <span class="rel-img">${phHTML(r)}</span><b>${esc(r.title)}</b><span>${priceText(r)}</span></button>`).join('')}</div></div>`;
  }

  function openModal(id, fromRelated) {
    const p = byId[id]; if (!p) return;
    history.replaceState(null, '', location.pathname + '?open=' + id);
    if (!pm.hidden) {            // already open: turn to another piece
      if (swapping) return; swapping = true;
      const swap = () => { body.innerHTML = modalHTML(p); fill(body); body.scrollTop = 0; };
      if (!HAS_GSAP || RM) { swap(); swapping = false; return; }
      gsap.set(pwash, { xPercent: 112, autoAlpha: 1 });
      gsap.to(pwash, { xPercent: 0, duration: .5, ease: 'power2.in', onComplete() {
        swap(); gsap.to(pwash, { xPercent: -115, duration: .85, ease: 'power2.out', onComplete: () => { gsap.set(pwash, { autoAlpha: 0 }); swapping = false; } });
      } });
      return;
    }
    lastFocus = document.activeElement;
    body.innerHTML = modalHTML(p); fill(body); body.scrollTop = 0;
    pm.hidden = false; document.body.style.overflow = 'hidden';
    if (HAS_GSAP && !RM) {
      gsap.fromTo('.pm-back', { opacity: 0 }, { opacity: 1, duration: .5 });
      gsap.fromTo(panel, { xPercent: 100, rotateY: -28 }, { xPercent: 0, rotateY: 0, duration: .95, ease: 'power3.out' });
      gsap.set(pwash, { xPercent: 0, autoAlpha: 1 });
      gsap.to(pwash, { xPercent: -115, duration: 1.25, ease: 'power2.inOut', delay: .35, onComplete: () => gsap.set(pwash, { autoAlpha: 0 }) });
    }
    $('.pm-x').focus();
  }
  function closeModal() {
    if (pm.hidden || swapping) return;
    history.replaceState(null, '', location.pathname);
    const done = () => { pm.hidden = true; document.body.style.overflow = ''; if (HAS_GSAP) gsap.set([panel, '.pm-back'], { clearProps: 'all' }); if (lastFocus && lastFocus.focus) lastFocus.focus(); };
    if (!HAS_GSAP || RM) return done();
    gsap.to('.pm-back', { opacity: 0, duration: .5 });
    gsap.to(panel, { xPercent: 100, rotateY: -16, duration: .65, ease: 'power2.in', onComplete: done });
  }
  pm.addEventListener('click', e => {
    if (e.target.closest('[data-close]')) return closeModal();
    const add = e.target.closest('[data-add]'); if (add) return Cart.add(byId[add.dataset.add]);
    const rel = e.target.closest('[data-open]'); if (rel) openModal(rel.dataset.open, true);
  });
  document.addEventListener('keydown', e => {
    if (pm.hidden) return;
    if (e.key === 'Escape') return closeModal();
    if (e.key !== 'Tab') return;
    const f = $$('#pm-panel button, #pm-panel a[href]'); if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* ---------- go ---------- */
  paintFilters();
  loadProducts().then(ps => {
    all = ps; ps.forEach(p => byId[p.id] = p);
    draw(true);
    const open = new URLSearchParams(location.search).get('open');
    if (open && byId[open]) setTimeout(() => openModal(open), 700);
  }).catch(() => { grid.innerHTML = '<p class="empty">The collection could not load. Please refresh the page.</p>'; });
})();
