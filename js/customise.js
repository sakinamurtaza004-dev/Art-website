/* Customise page: 3-step custom order flow */
(() => {
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = n => n >= 10000 ? '₹10,000+' : '₹' + Number(n).toLocaleString('en-IN');

/* ---------- pencil-and-wash illustrations (helpers pen / sk / wblob come from main.js) ---------- */
  const SK = inner => `<svg viewBox="0 0 200 200" aria-hidden="true"><g filter="url(#pencil)">${inner}</g></svg>`;
  const circ = (cx, cy, r) => `M${cx} ${cy - r}A${r} ${r} 0 1 1 ${cx - .1} ${cy - r}Z`;
  const ART = {
    portraits: SK(`
      <ellipse cx="100" cy="104" rx="68" ry="82" fill="${PAL.amber}" fill-opacity=".24" filter="url(#wash)"/>
      ${sk('M48 30L152 30L152 170L48 170Z', '#fffaf0', .55)}
      ${pen('M57 39L143 39L143 161L57 161Z', .5, 1.1)}
      ${sk('M52 168C56 134 80 124 100 124C120 124 144 134 148 168Z', PAL.magenta, .35, 'M100 124C120 124 144 134 148 168L122 168C122 150 114 134 100 124Z')}
      ${sk('M76 92C76 70 124 70 124 92C124 114 112 122 100 122C88 122 76 114 76 92Z', '#f0c9a8', .4)}
      ${sk('M73 92C66 52 134 48 127 92C120 74 82 72 73 92Z', '#7a5a4a', .3, 'M73 92C66 52 134 48 127 92C120 74 82 72 73 92Z')}
      ${pen('M90 95h.1M110 95h.1', .9, 3.4)}${pen('M92 108Q100 113 108 108', .75, 1.4, SIENNA)}${pen('M98 99Q95 105 99 105', .5, 1)}
      ${wblob(84, 104, 6, PAL.coral, .3)}${wblob(116, 104, 6, PAL.coral, .3)}`),
    tshirt: SK(`
      <ellipse cx="100" cy="100" rx="80" ry="72" fill="${PAL.yellow}" fill-opacity=".25" filter="url(#wash)"/>
      ${sk('M68 38L90 30Q100 48 110 30L132 38L166 68L146 90L132 78L132 168L68 168L68 78L54 90L34 68Z', PAL.yellow, .38, 'M112 34L132 38L166 68L146 90L132 78L132 168L112 168Z')}
      ${pen('M90 30Q100 48 110 30M86 34Q100 54 114 34', .6, 1.1)}
      ${pen('M70 160C85 156 110 162 130 158M68 146C90 142 112 148 132 144', .35, 1)}
      <use href="#splat" x="68" y="76" width="64" height="64"/>`),
    jewellery: SK(`
      <ellipse cx="100" cy="110" rx="72" ry="78" fill="${PAL.magenta}" fill-opacity=".3" filter="url(#wash)"/>
      ${pen('M74 14C72 54 100 64 100 86', .75, 1.5, SIENNA)}${pen('M126 14C128 54 100 64 100 86', .75, 1.5, SIENNA)}
      ${sk('M100 84C134 118 130 162 100 168C70 162 66 118 100 84Z', PAL.coral, .3, 'M104 90C130 118 128 160 102 168C118 150 118 116 104 90Z')}
      ${pen('M88 112C82 128 86 146 94 152', .45, 1.1)}
      <use href="#splat" x="82" y="116" width="38" height="38"/>
      ${pen('M38 92q10 -12 0 -22', .75, 1.5, SIENNA)}${sk('M38 96C52 112 50 134 38 136C26 134 24 112 38 96Z', PAL.amber, .4)}
      ${pen('M162 92q-10 -12 0 -22', .75, 1.5, SIENNA)}${sk('M162 96C176 112 174 134 162 136C150 134 148 112 162 96Z', PAL.yellow, .45)}`),
    decor: SK(`
      <ellipse cx="100" cy="106" rx="78" ry="74" fill="${PAL.amber}" fill-opacity=".26" filter="url(#wash)"/>
      ${sk('M30 38L54 30L66 134L42 142Z', PAL.magenta, .35, 'M54 30L66 134L42 142Z')}
      ${pen('M44 142L36 160M46 142L42 162', .6, 1.2, SIENNA)}
      ${sk(circ(128, 84, 48), PAL.yellow, .32)}
      ${sk(circ(96, 118, 58), PAL.amber, .34, 'M60 140A58 58 0 0 0 150 150C120 150 90 146 60 140Z')}
      ${pen(circ(96, 118, 46), .4, 1.1)}
      ${pen('M58 128C78 94 112 150 136 104', .6, 3, PAL.coral)}${pen('M78 96h.1M116 140h.1M124 104h.1', .7, 3, SIENNA)}`),
    gifting: SK(`
      <ellipse cx="100" cy="108" rx="80" ry="76" fill="${PAL.orange}" fill-opacity=".2" filter="url(#wash)"/>
      ${sk('M22 130L62 126L66 166L26 170Z', PAL.magenta, .38, 'M44 128L62 126L66 166L46 168Z')}
      ${pen('M44 158c-9 -7 -9 -16 0 -16s9 9 0 16Z', .6, 1.2, SIENNA)}
      ${pen(circ(160, 46, 14), .7, 1.6)}${pen('M160 60L160 82', .6, 1.3)}
      ${sk(circ(160, 98, 16), PAL.yellow, .4)}
      ${sk('M72 172C66 132 78 112 100 112C122 112 134 132 128 172Z', PAL.orange, .35, 'M104 113C124 114 134 134 128 172L108 172C112 150 112 128 104 113Z')}
      ${sk('M73 86C73 62 127 62 127 86C127 108 114 116 100 116C86 116 73 108 73 86Z', '#f0c9a8', .4)}
      ${sk('M73 84C72 52 128 52 127 84C118 68 82 68 73 84Z', '#7a5a4a', .3, 'M73 84C72 52 128 52 127 84C118 68 82 68 73 84Z')}
      ${pen('M91 90h.1M109 90h.1', .9, 3.2)}${pen('M93 101Q100 106 107 101', .75, 1.4, SIENNA)}
      ${wblob(84, 98, 5, PAL.coral, .3)}${wblob(116, 98, 5, PAL.coral, .3)}`)
  };

  /* ---------- category + field config ---------- */
  const THEMES = ['Ocean', 'Floral', 'Galaxy', 'Earthy', 'Pastel dream', 'Surprise me'];
  const SWATCHES = [['Dusty rose', '#E8B4B8'], ['Sage', '#A8C5A0'], ['Mauve', '#C4A0B5'], ['Terracotta', '#D4956A'], ['Ocean blue', '#8DB4D8'], ['Butter yellow', '#F2DC8C'], ['Ivory', '#F6EFE2'], ['Charcoal', '#4a4a4a']];
  const CATS = {
    portraits: { name: 'Portraits', desc: 'Faces, pets, and the people you love — painted in your chosen style', tint: '#F2C4A0',
      sizes: ['A5 (15 × 21 cm)', 'A4 (21 × 30 cm)', 'A3 (30 × 42 cm)', 'A2 (42 × 60 cm)', 'Other (tell me in the notes)'],
      extra: [
        { type: 'pills', name: 'subject', label: 'Who or what is the portrait of?', opts: ['Person', 'Pet', 'Both'], req: true },
        { type: 'pills', name: 'style', label: 'Art style', opts: ['Realistic', 'Watercolour', 'Oil-effect'], req: true }] },
    tshirt: { name: 'T-shirt Painting', desc: 'Wearable art, hand-painted just for you', tint: '#F5DFA0',
      sizes: ['Small design (chest)', 'Medium (front panel)', 'Large (full front or back)', 'Other (tell me in the notes)'],
      extra: [
        { type: 'pills', name: 'supply', label: 'T-shirt', opts: ["I'll provide my own", 'Please arrange one for me'], req: true },
        { type: 'select', name: 'tsize', label: 'T-shirt size', opts: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], req: true },
        { type: 'select', name: 'fabric', label: 'Fabric colour', opts: ['White', 'Black', 'Navy', 'Beige', 'Sage green', 'Dusty pink', 'Other'], req: true }] },
    jewellery: { name: 'Resin Jewellery', desc: 'Earrings, pendants, and bracelets preserved in resin', tint: '#E8C4D4',
      sizes: ['Dainty', 'Medium', 'Statement', 'Other (tell me in the notes)'],
      extra: [
        { type: 'pills', name: 'piece', label: 'What would you like?', opts: ['Earrings', 'Pendant', 'Bracelet'], req: true },
        { type: 'select', name: 'theme', label: 'Colour theme', opts: THEMES },
        { type: 'checks', name: 'incl', label: 'Inclusions', opts: ['Flowers', 'Glitter', 'Shells', 'Custom'] },
        { type: 'number', name: 'qty', label: 'Quantity', def: 1 }] },
    decor: { name: 'Resin Home Décor', desc: 'Coasters, bookmarks, photo frames, and trays', tint: '#E8957A',
      sizes: ['Small (coaster / bookmark)', 'Medium (frame)', 'Large (tray)', 'Other (tell me in the notes)'],
      extra: [
        { type: 'pills', name: 'piece', label: 'What would you like?', opts: ['Coasters', 'Bookmarks', 'Photo frame', 'Tray'], req: true },
        { type: 'select', name: 'theme', label: 'Colour theme', opts: THEMES },
        { type: 'checks', name: 'incl', label: 'Inclusions', opts: ['Flowers', 'Glitter', 'Shells', 'Custom'] },
        { type: 'number', name: 'qty', label: 'Quantity', def: 1 }] },
    gifting: { name: 'Desk & Gifting Pieces', desc: 'Figurines, keychains, and fridge magnets — small art for everyday joy', tint: '#D4849A',
      sizes: ['Mini (about 3 cm)', 'Small (about 5 cm)', 'Medium (about 8 cm)', 'Other (tell me in the notes)'],
      extra: [
        { type: 'pills', name: 'piece', label: 'What would you like?', opts: ['Figurine', 'Keychain', 'Fridge magnet'], req: true },
        { type: 'number', name: 'qty', label: 'Quantity', def: 1 },
        { type: 'text', name: 'ptext', label: 'Personalisation text', ph: 'Names, a date, a short message…' }] }
  };
  const ORDER = ['portraits', 'tshirt', 'jewellery', 'decor', 'gifting'];
  const LEGACY = { paintings: 'portraits', 'custom-tshirts': 'tshirt', 'resin-jewellery': 'jewellery', coasters: 'decor', photoframes: 'decor', 'clay-miniatures': 'gifting' };
  const OCCASIONS = ['Birthday', 'Anniversary', 'Corporate Gift', 'Wedding', 'Just Because', 'Other'];

  /* ---------- state ---------- */
  const S = { step: 1, cat: null, f: {}, colours: new Set(), incl: new Set(), files: [], budget: 3000 };
  let busy = false;

  /* ---------- step 1: cards ---------- */
  const grid = $('#cat-grid');
  grid.innerHTML = ORDER.map(id => `
    <button type="button" class="cat-card" role="radio" aria-checked="false" data-id="${id}" style="--tint:${CATS[id].tint}">
      <span class="wash-bg" aria-hidden="true"></span>
      <svg class="draw" aria-hidden="true"><path d=""/></svg>
      <span class="art">${ART[id]}</span>
      <span class="stamp" aria-hidden="true">✓</span>
      <h3>${CATS[id].name}</h3><p>${CATS[id].desc}</p>
    </button>`).join('');

  // a hand-drawn, slightly wobbly border that draws itself around the chosen card
  const wob = n => (Math.random() - .5) * n;
  function fitDraw(card) {
    const svg = card.querySelector('.draw'), p = svg.querySelector('path');
    const w = card.offsetWidth + 10, h = card.offsetHeight + 10;
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    p.setAttribute('d', `M${6 + wob(3)} ${7 + wob(3)}C${w * .3} ${2 + wob(4)} ${w * .7} ${8 + wob(4)} ${w - 6} ${5 + wob(3)}C${w - 2 + wob(3)} ${h * .3} ${w - 8 + wob(4)} ${h * .7} ${w - 5} ${h - 6}C${w * .7} ${h - 2 + wob(4)} ${w * .3} ${h - 8 + wob(4)} ${7 + wob(3)} ${h - 5}C${2 + wob(3)} ${h * .7} ${8 + wob(3)} ${h * .3} ${6 + wob(2)} ${14 + wob(2)}`);
    p.style.strokeDasharray = p.getTotalLength();
  }
  addEventListener('resize', () => { const c = document.querySelector('.cat-card.sel'); if (c) { fitDraw(c); const p = c.querySelector('.draw path'); p.style.transition = 'none'; p.style.strokeDashoffset = 0; } });
  function selectCat(id) {
    if (S.cat !== id) { S.cat = id; S.f = {}; S.incl = new Set(); }
    $$('.cat-card').forEach(c => {
      const on = c.dataset.id === id; c.classList.toggle('sel', on); c.setAttribute('aria-checked', on);
      const p = c.querySelector('.draw path');
      if (on) {
        fitDraw(c); const L = p.getTotalLength();
        p.style.transition = 'none'; p.style.strokeDashoffset = L; p.getBoundingClientRect(); p.style.transition = '';
        requestAnimationFrame(() => { p.style.strokeDashoffset = 0; });
      } else if (p.getAttribute('d')) p.style.strokeDashoffset = p.getTotalLength();
    });
    $('#next1').disabled = false;
    $('#hint1').textContent = `${CATS[id].name} — lovely choice`;
  }
  grid.addEventListener('click', e => { const c = e.target.closest('.cat-card'); if (c) selectCat(c.dataset.id); });

  // parallax tilt
  if (!RM && matchMedia('(pointer:fine)').matches) {
    $$('.cat-card').forEach(c => {
      c.addEventListener('pointermove', e => {
        const r = c.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
        c.style.setProperty('--ry', (px * 8).toFixed(2) + 'deg'); c.style.setProperty('--rx', (-py * 8).toFixed(2) + 'deg');
        c.style.setProperty('--tx', (px * 14).toFixed(1) + 'px'); c.style.setProperty('--ty', (py * 14).toFixed(1) + 'px');
      });
      c.addEventListener('pointerleave', () => ['--rx', '--ry', '--tx', '--ty'].forEach(v => c.style.removeProperty(v)));
    });
  }

  const clearErr = el => { const f = el.closest('.f'); if (!f) return; f.classList.remove('invalid'); const m = f.querySelector('.msg'); if (m) m.textContent = ''; };

  /* ---------- step 2: dynamic form ---------- */
  const field = (name, label, control, req) => `<div class="f" data-f="${name}"><label ${control.startsWith('<input') || control.startsWith('<select') || control.startsWith('<textarea') ? `for="z-${name}"` : ''}>${label}${req ? ' *' : ''}</label>${control}<small class="msg"></small></div>`;
  function renderField(d) {
    const id = `z-${d.name}`;
    if (d.type === 'pills') return field(d.name, d.label, `<div class="pills" role="radiogroup">${d.opts.map(o => `<label class="pill"><input type="radio" name="${d.name}" value="${esc(o)}"><span>${esc(o)}</span></label>`).join('')}</div>`, d.req);
    if (d.type === 'checks') return field(d.name, d.label, `<div class="pills">${d.opts.map(o => `<label class="pill"><input type="checkbox" name="incl" value="${esc(o)}"><span>${esc(o)}</span></label>`).join('')}</div>
      <input id="z-inclCustom" name="inclCustom" class="sub" placeholder="Tell me what to include…" hidden>`, d.req);
    if (d.type === 'select') return field(d.name, d.label, `<select id="${id}" name="${d.name}"><option value="">Choose…</option>${d.opts.map(o => `<option>${esc(o)}</option>`).join('')}</select>`, d.req);
    if (d.type === 'number') return field(d.name, d.label, `<input id="${id}" name="${d.name}" type="number" min="1" max="99" value="${d.def || 1}">`, d.req);
    return field(d.name, d.label, `<input id="${id}" name="${d.name}" placeholder="${d.ph || ''}">`, d.req);
  }
  function renderFields() {
    const c = CATS[S.cat];
    $('#chosen-tag').textContent = c.name;
    const sw = SWATCHES.map(([n, col]) => `<button type="button" class="sw" aria-pressed="${S.colours.has(n)}" data-n="${n}" style="--c:${col}"><i></i><span>${n}</span></button>`).join('');
    $('#fields').innerHTML = `
      <div class="fgrid">
        ${c.extra.map(renderField).join('')}
        ${field('size', 'Size / dimensions', `<select id="z-size" name="size"><option value="">Choose…</option>${c.sizes.map(o => `<option>${esc(o)}</option>`).join('')}</select>`, true)}
        ${field('occasion', 'Occasion', `<select id="z-occasion" name="occasion"><option value="">Choose…</option>${OCCASIONS.map(o => `<option>${o}</option>`).join('')}</select>`, true)}
      </div>
      <div class="f wide"><label>Colour palette <em>(pick any you love)</em></label><div class="swatches">${sw}</div></div>
      <div class="f wide"><label>Reference images <em>(optional)</em></label>
        <div class="drop" id="drop" tabindex="0" role="button" aria-label="Add reference images">
          <input type="file" id="files" accept="image/*" multiple hidden>
          <svg viewBox="0 0 60 40" aria-hidden="true"><use href="#splat" x="14" y="-2" width="32" height="32"/></svg>
          <p><b>Drop photos here</b> or tap to browse</p><small>Up to 5 images, 5 MB each</small>
        </div><div class="thumbs" id="thumbs"></div><small class="msg" id="file-msg"></small></div>
      <div class="f wide"><label for="z-notes">Special notes / instructions</label>
        <textarea id="z-notes" name="notes" class="lined" placeholder="Names, style, colours to avoid, what the piece is for…"></textarea></div>
      <div class="f wide"><label for="z-budget">Budget <em>(roughly, up to)</em></label>
        <div class="budget"><input type="range" id="z-budget" min="500" max="10000" step="250" value="${S.budget}"><output id="budget-out">${money(S.budget)}</output></div></div>`;
    // restore values
    $$('#fields [name]').forEach(el => {
      if (el.name === 'incl') el.checked = S.incl.has(el.value);
      else if (el.type === 'radio') el.checked = S.f[el.name] === el.value;
      else if (S.f[el.name] != null) el.value = S.f[el.name];
    });
    $$('#fields input[type=number]').forEach(el => { if (S.f[el.name] == null) S.f[el.name] = el.value; });
    syncIncl(); setBudgetFill(); renderThumbs();
    if (S.pre && !S.f.notes) { $('#z-notes').value = S.f.notes = S.pre; }
  }
  const syncIncl = () => { const el = $('#z-inclCustom'); if (el) el.hidden = !S.incl.has('Custom'); };
  const setBudgetFill = () => { const r = $('#z-budget'); if (r) r.style.setProperty('--p', ((r.value - r.min) / (r.max - r.min) * 100) + '%'); };

  $('#fields').addEventListener('input', e => {
    const el = e.target; if (!el.name && el.id !== 'z-budget') return;
    if (el.id === 'z-budget') { S.budget = +el.value; $('#budget-out').textContent = money(S.budget); setBudgetFill(); return; }
    if (el.name === 'incl') { el.checked ? S.incl.add(el.value) : S.incl.delete(el.value); syncIncl(); return; }
    if (el.type === 'file') return;
    S.f[el.name] = el.value;
    clearErr(el);
  });
  $('#fields').addEventListener('click', e => {
    const sw = e.target.closest('.sw');
    if (sw) { const n = sw.dataset.n, on = !S.colours.has(n); on ? S.colours.add(n) : S.colours.delete(n); sw.setAttribute('aria-pressed', on); return; }
    const drop = e.target.closest('#drop'); if (drop) $('#files').click();
    const rm = e.target.closest('[data-rm]'); if (rm) { S.files.splice(+rm.dataset.rm, 1); renderThumbs(); }
  });
  $('#fields').addEventListener('change', e => { if (e.target.id === 'files') { addFiles(e.target.files); e.target.value = ''; } });
  $('#fields').addEventListener('keydown', e => { if (e.target.id === 'drop' && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); $('#files').click(); } });
  ['dragover', 'dragenter'].forEach(t => $('#fields').addEventListener(t, e => { if (e.target.closest('#drop')) { e.preventDefault(); $('#drop').classList.add('over'); } }));
  ['dragleave', 'drop'].forEach(t => $('#fields').addEventListener(t, e => { const d = e.target.closest('#drop'); if (d) { d.classList.remove('over'); if (t === 'drop') { e.preventDefault(); addFiles(e.dataTransfer.files); } } }));

  function addFiles(list) {
    const msg = $('#file-msg'); msg.textContent = '';
    [...list].forEach(f => {
      if (!f.type.startsWith('image/')) { msg.textContent = 'Only image files, please.'; return; }
      if (f.size > 5 * 1024 * 1024) { msg.textContent = `${f.name} is over 5 MB.`; return; }
      if (S.files.length >= 5) { msg.textContent = 'Up to 5 images.'; return; }
      S.files.push(f);
    });
    renderThumbs();
  }
  function renderThumbs() {
    const t = $('#thumbs'); if (!t) return;
    t.querySelectorAll('img').forEach(i => URL.revokeObjectURL(i.src));
    t.innerHTML = S.files.map((f, i) => `<figure><img src="${URL.createObjectURL(f)}" alt="${esc(f.name)}"><button type="button" data-rm="${i}" aria-label="Remove ${esc(f.name)}">×</button></figure>`).join('');
  }

  function validate2() {
    const c = CATS[S.cat]; let first = null;
    const need = [...c.extra.filter(d => d.req).map(d => [d.name, 'Please choose one']), ['size', 'Please choose a size'], ['occasion', 'Please choose an occasion']];
    need.forEach(([n, m]) => {
      const f = $(`#fields [data-f="${n}"]`); const bad = !S.f[n];
      f.classList.toggle('invalid', bad); f.querySelector('.msg').textContent = bad ? m : '';
      if (bad && !first) first = f;
    });
    if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return !first;
  }

  /* ---------- step 3: summary + contact ---------- */
  const val = n => (S.f[n] || '').toString().trim();
  function rows() {
    const c = CATS[S.cat], r = [['Item', c.name]];
    if (val('piece')) r.push(['Piece', val('piece')]);
    if (val('subject')) r.push(['Subject', val('subject')]);
    if (val('style')) r.push(['Art style', val('style')]);
    if (val('supply')) r.push(['T-shirt', val('supply')]);
    if (val('tsize')) r.push(['T-shirt size', val('tsize')]);
    if (val('fabric')) r.push(['Fabric colour', val('fabric')]);
    if (val('theme')) r.push(['Colour theme', val('theme')]);
    if (S.incl.size) r.push(['Inclusions', [...S.incl].map(i => i === 'Custom' && val('inclCustom') ? `Custom (${val('inclCustom')})` : i).join(', ')]);
    if (val('qty')) r.push(['Quantity', val('qty')]);
    if (val('ptext')) r.push(['Personalised text', val('ptext')]);
    r.push(['Size', val('size')], ['Occasion', val('occasion')]);
    if (S.colours.size) r.push(['Colours', [...S.colours].join(', ')]);
    r.push(['Budget', 'Up to ' + money(S.budget)]);
    if (S.files.length) r.push(['Reference images', `${S.files.length} attached`]);
    if (val('notes')) r.push(['Notes', val('notes')]);
    return r;
  }
  function renderReceipt() {
    const sw = SWATCHES.filter(([n]) => S.colours.has(n)).map(([n, c]) => `<i style="--c:${c}" title="${n}"></i>`).join('');
    $('#receipt').innerHTML = `<h3>Your request</h3><p class="rc-sub">${esc(CATS[S.cat].name)}</p>
      <dl>${rows().map(([k, v]) => `<div><dt>${k}</dt><dd>${k === 'Colours' ? `<span class="dots">${sw}</span> ${esc(v)}` : esc(v)}</dd></div>`).join('')}</dl>
      <p class="rc-foot">✿ made by hand · just for you ✿</p>`;
  }
  $('#c-time').addEventListener('change', e => { $('#date-wrap').hidden = e.target.value !== 'I have a date in mind'; });
  $('#contact').addEventListener('input', e => clearErr(e.target));

  function validate3() {
    let first = null;
    const chk = (n, bad, m) => { const f = $(`#contact [data-f="${n}"]`); f.classList.toggle('invalid', bad); const s = f.querySelector('.msg'); if (s) s.textContent = bad ? m : ''; if (bad && !first) first = f; };
    chk('name', !$('#c-name').value.trim(), 'Please tell me your name');
    chk('email', !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($('#c-email').value.trim()), 'Please enter a valid email');
    if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return !first;
  }

  /* ---------- message + delivery ---------- */
  const contact = () => ({
    name: $('#c-name').value.trim(), email: $('#c-email').value.trim(), phone: $('#c-phone').value.trim() || '-',
    timeline: $('#c-time').value + ($('#c-time').value === 'I have a date in mind' && $('#c-date').value ? ` (${$('#c-date').value})` : '')
  });
  function buildText() {
    const k = contact();
    return `Hi ${CFG.brand}! I'd like a custom order.\n\n` + rows().map(([a, b]) => `${a}: ${b}`).join('\n') +
      `\n\nName: ${k.name}\nEmail: ${k.email}\nPhone: ${k.phone}\nTimeline: ${k.timeline}` +
      (S.files.length ? `\n\n(I have ${S.files.length} reference image(s) – I'll share them in this chat.)` : '');
  }
  async function deliver() {
    if (!CFG.formEndpoint) return 'manual';
    try {
      const fd = new FormData(), k = contact();
      rows().forEach(([a, b]) => fd.append(a, b));
      Object.entries(k).forEach(([a, b]) => fd.append(a, b));
      fd.append('_subject', `Custom order – ${CATS[S.cat].name}`); fd.append('message', buildText());
      S.files.forEach(f => fd.append('reference', f));
      const r = await fetch(CFG.formEndpoint, { method: 'POST', body: fd, headers: { Accept: 'application/json' } });
      return r.ok ? 'sent' : 'failed';
    } catch { return 'failed'; }
  }

  const submitBtn = $('#submit');
  submitBtn.onclick = async () => {
    if (submitBtn.disabled || !validate3()) return;
    submitBtn.disabled = true; submitBtn.classList.add('loading'); submitBtn.querySelector('.lbl').textContent = 'Painting…';
    const wait = new Promise(r => setTimeout(r, 1900));
    const [mode] = await Promise.all([deliver(), wait]);
    showSuccess(mode);
    submitBtn.disabled = false; submitBtn.classList.remove('loading'); submitBtn.querySelector('.lbl').textContent = 'Send my request';
  };

  function showSuccess(mode) {
    const sp = $('#splash'), t = buildText();
    const wa = `https://wa.me/${CFG.whatsapp}?text=${encodeURIComponent(t)}`;
    const mail = `mailto:${CFG.email}?subject=${encodeURIComponent('Custom order – ' + CATS[S.cat].name)}&body=${encodeURIComponent(t)}`;
    const copy = {
      sent: ['Your request has been received!', 'Sakina will get back to you within 48 hours 🎨'],
      manual: ['Your request is ready!', "One last step — send it to Sakina below and she'll get back to you within 48 hours 🎨"],
      failed: ["Hmm, that didn't send", 'Please use one of the buttons below to send it directly — Sakina will get back to you within 48 hours 🎨']
    }[mode];
    $('#splash-title').textContent = copy[0]; $('#splash-msg').textContent = copy[1];
    $('#splash-actions').innerHTML = (mode === 'sent' ? '' :
      `<a class="btn sage solid" href="${wa}" target="_blank" rel="noopener">Send on WhatsApp</a><a class="btn" href="${mail}">Send by email</a>`) +
      `<a class="btn" href="index.html">Back to home</a>`;
    sp.hidden = false; document.body.style.overflow = 'hidden';
    if (!HAS_GSAP || RM) return;
    const tl = gsap.timeline();
    tl.fromTo(sp, { opacity: 0 }, { opacity: 1, duration: .5 })
      .fromTo('.splash .sp', { scale: 0, opacity: 0 }, { scale: 1, opacity: .85, duration: 1.75, ease: 'power3.out', stagger: .19 }, 0)
      .fromTo('.splash-in > *', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1.12, ease: 'power2.out', stagger: .15 }, .5);
    const cols = Object.values(PAL);
    for (let i = 0; i < 18; i++) {
      const d = document.createElement('i'); d.className = 'dr';
      const sz = 8 + Math.random() * 22;
      Object.assign(d.style, { width: sz + 'px', height: sz + 'px', background: cols[i % 4] });
      sp.appendChild(d);
      const a = Math.random() * Math.PI * 2, dist = 160 + Math.random() * Math.min(innerWidth, 700) * .45;
      gsap.fromTo(d, { x: 0, y: 0, scale: .2, opacity: .8 }, { x: Math.cos(a) * dist, y: Math.sin(a) * dist, scale: 1, opacity: 0, duration: 2.25 + Math.random(), ease: 'power3.out', delay: .12, onComplete: () => d.remove() });
    }
  }

  /* ---------- navigation between steps (brush-stroke wipe) ---------- */
  const wipe = $('#wipe');
  const stripes = ['#F2C4A0', '#E8C4D4', '#F5DFA0', '#E8957A', '#F2C4A0', '#F5DFA0', '#E8C4D4'];
  wipe.innerHTML = `<svg viewBox="0 0 1000 420" preserveAspectRatio="none"><g filter="url(#wc)" fill="none" stroke-linecap="round">${stripes.map((c, i) =>
    `<path d="M${30 + (i % 3) * 14} ${36 + i * 58} C250 ${20 + i * 58} 520 ${60 + i * 58} 970 ${38 + i * 58}" stroke="${c}" stroke-width="84" stroke-opacity=".95"/>`).join('')}</g></svg>`;

  function paint(n) {
    $$('.panel').forEach(p => p.classList.toggle('on', +p.dataset.step === n));
    $$('.pstep').forEach(p => { const i = +p.dataset.p; p.classList.toggle('on', i === n); p.classList.toggle('done', i < n); });
    $$('.pline').forEach((l, i) => l.classList.toggle('fill', i + 1 < n));
    if (n === 2) renderFields();
    if (n === 3) renderReceipt();
    S.step = n;
    const top = $('.progress').getBoundingClientRect().top + scrollY - 90;
    scrollTo({ top: Math.max(0, top), behavior: RM ? 'auto' : 'smooth' });
  }
  function goTo(n) {
    if (busy || n === S.step) return;
    if (n > S.step && S.step === 1 && !S.cat) return;
    if (n > S.step && S.step === 2 && !validate2()) return;
    if (n === 3 && S.step === 1) return;
    busy = true;
    if (!HAS_GSAP || RM) { paint(n); busy = false; return; }
    const dir = n > S.step ? 1 : -1;
    gsap.set(wipe, { xPercent: -112 * dir, x: 0, autoAlpha: 1 });
    gsap.to(wipe, { xPercent: 0, duration: .75, ease: 'power2.in', onComplete() {
      paint(n);
      gsap.to(wipe, { xPercent: 112 * dir, duration: .94, ease: 'power2.out', onComplete: () => { gsap.set(wipe, { autoAlpha: 0 }); busy = false; } });
    } });
  }
  $('#next1').onclick = () => goTo(2);
  $('#back2').onclick = () => goTo(1);
  $('#next2').onclick = () => goTo(3);
  $('#back3').onclick = () => goTo(2);
  $$('.pstep button').forEach(b => b.onclick = () => { const n = +b.closest('.pstep').dataset.p; if (n < S.step) goTo(n); });

  /* ---------- prefill from the shop (?category=…&item=…) ---------- */
  const q = new URLSearchParams(location.search);
  const pre = LEGACY[q.get('category')] || (CATS[q.get('category')] ? q.get('category') : null);
  if (pre) {
    selectCat(pre);
    if (q.get('item')) S.pre = `I like: ${q.get('item')}\n`;
    $('#hint1').textContent = `${CATS[pre].name} selected from the shop — tap Continue`;
  }
})();
