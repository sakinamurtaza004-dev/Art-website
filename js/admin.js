/* Studio admin: sign in, upload photos, publish listings to the Supabase database.
   Whatever is saved here is what every visitor sees in the shop. Setup steps: docs/ADMIN-SETUP.md
   (SUPA, supaHeaders, safeImg, fromRow, money, escH, phHTML come from main.js) */
(() => {
  const SESSION_KEY = 'sakina_admin_session';
  const BUCKET = 'listing-images';
  const MAX_PHOTOS = 8;
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const root = document.documentElement;
  const CATS = { paintings: 'Paintings', resin: 'Resin Art', tshirts: 'T-Shirts', decor: 'Home Décor', gifting: 'Gifting' };
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  let listings = [];      // listings from the database
  let photos = [];        // photos in the flow: { key, url, file|null }  (file = a new upload, null = already online)
  let editing = null;     // the listing being edited, or null when adding
  let busy = false;

  let toastTimer;
  function toast(msg) {
    const t = $('#adm-toast'); t.textContent = msg; t.classList.add('on');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('on'), 3000);
  }
  const priceLabel = l => !(Number(l.price) > 0) || l.priceType === 'contact' ? 'Contact for price' : (l.priceType === 'from' ? 'From ' : '') + money(Number(l.price));
  const publicPrefix = () => `${SUPA.url}/storage/v1/object/public/${BUCKET}/`;
  const publicUrl = path => publicPrefix() + path;

  /* ---------- session (kept for this browser tab only) ---------- */
  const readSession = () => { try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; } };
  const writeSession = s => { try { s ? sessionStorage.setItem(SESSION_KEY, JSON.stringify(s)) : sessionStorage.removeItem(SESSION_KEY); } catch { /* private mode */ } };
  const toSession = j => ({ access_token: j.access_token, refresh_token: j.refresh_token, expires_at: Date.now() + (j.expires_in || 3600) * 1000 });
  const notSignedIn = () => Object.assign(new Error('Not signed in'), { status: 401 });

  async function authCall(grant, body) {
    const r = await fetch(`${SUPA.url}/auth/v1/token?grant_type=${grant}`, {
      method: 'POST', headers: { apikey: SUPA.key, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw Object.assign(new Error(j.error_description || j.msg || j.message || 'Sign-in failed'), { status: r.status });
    return toSession(j);
  }
  async function token() {
    let s = readSession(); if (!s) throw notSignedIn();
    if (s.expires_at - Date.now() < 60000) {
      try { s = await authCall('refresh_token', { refresh_token: s.refresh_token }); writeSession(s); }
      catch { lock('Your session ended — please sign in again.'); throw notSignedIn(); }
    }
    return s.access_token;
  }
  async function api(path, { method = 'GET', body, headers = {} } = {}) {
    const t = await token();
    const r = await fetch(`${SUPA.url}${path}`, { method, headers: { ...supaHeaders(t), ...headers }, body });
    if (r.status === 401) { lock('Your session ended — please sign in again.'); throw notSignedIn(); }
    if (!r.ok) { const j = await r.json().catch(() => ({})); throw Object.assign(new Error(j.message || j.error || `request failed (${r.status})`), { status: r.status }); }
    return r.status === 204 ? null : r.json().catch(() => null);
  }
  const JSON_HDR = { 'Content-Type': 'application/json', Prefer: 'return=representation' };

  /* ---------- login ---------- */
  const gateForm = $('#gate-form'), un = $('#un'), pw = $('#pw'), gateMsg = $('#gate-msg'), gateBtn = $('#gate-btn');
  if (!SUPA.on) $('#gate-note').hidden = false;
  function wrongWord() {
    gateMsg.textContent = 'That’s not the magic word 🎨';
    [un, pw].forEach(el => { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); });
    pw.select();
  }
  [un, pw].forEach(el => el.addEventListener('animationend', () => el.classList.remove('shake')));
  gateForm.addEventListener('submit', async e => {
    e.preventDefault();
    if (!SUPA.on) { gateMsg.textContent = 'The studio isn’t connected to its database yet.'; return; }
    if (un.value.trim().toLowerCase() !== String(CFG.adminUsername || '').toLowerCase() || !pw.value) return wrongWord();
    gateBtn.disabled = true; gateMsg.textContent = '';
    try {
      writeSession(await authCall('password', { email: CFG.adminEmail, password: pw.value }));
      un.value = ''; pw.value = '';
      root.classList.add('authed'); startDash();
    } catch (err) {
      if (err.status && err.status < 500) wrongWord();
      else gateMsg.textContent = 'Couldn’t reach the studio database. Check your connection and try again.';
    } finally { gateBtn.disabled = false; }
  });
  function lock(message) {
    writeSession(null); root.classList.remove('authed'); resetFlow(); showTab('add');
    gateMsg.textContent = message || ''; un.focus();
  }
  $('#lock').onclick = () => lock();

  /* ---------- tabs ---------- */
  function showTab(name) {
    const list = name === 'list';
    $('#tab-add').setAttribute('aria-selected', !list); $('#tab-list').setAttribute('aria-selected', list);
    $('#panel-add').hidden = list; $('#panel-list').hidden = !list;
    if (list) loadListings();
  }
  $('#tab-add').onclick = () => showTab('add');
  $('#tab-list').onclick = () => showTab('list');

  /* ---------- step 1: photos ---------- */
  const fileInput = $('#file'), drop = $('#drop'), thumbs = $('#thumbs'), msg1 = $('#msg1');
  const typeOK = f => /^image\/(jpeg|png|webp|gif|heic|heif)$/i.test(f.type) || /\.(jpe?g|png|webp|gif|heic|heif)$/i.test(f.name);
  function addFiles(list) {
    msg1.textContent = '';
    [...list].forEach(f => {
      if (photos.length >= MAX_PHOTOS) { msg1.textContent = `You can add up to ${MAX_PHOTOS} photos.`; return; }
      if (!typeOK(f)) { msg1.textContent = `“${f.name}” isn’t a picture I can use.`; return; }
      photos.push({ key: uid(), file: f, url: URL.createObjectURL(f) });
    });
    renderPhotos();
  }
  function renderPhotos() {
    thumbs.innerHTML = photos.map((p, i) => `<div class="tb" data-key="${p.key}"><img src="${escH(p.url)}" alt="Photo ${i + 1}">
      ${i ? '<button type="button" class="cov" data-act="cover" aria-label="Make this the cover photo" title="Make cover">★</button>' : '<span class="tag-c">Cover</span>'}
      <button type="button" class="x" data-act="remove" aria-label="Remove this photo">×</button></div>`).join('');
    $('#next').disabled = photos.length === 0;
  }
  thumbs.addEventListener('click', e => {
    const b = e.target.closest('[data-act]'); if (!b) return;
    const i = photos.findIndex(p => p.key === b.closest('.tb').dataset.key); if (i < 0) return;
    if (b.dataset.act === 'remove') { const [p] = photos.splice(i, 1); if (p.file) URL.revokeObjectURL(p.url); }
    else { const [p] = photos.splice(i, 1); photos.unshift(p); }
    renderPhotos();
  });
  fileInput.addEventListener('change', () => { addFiles(fileInput.files); fileInput.value = ''; });
  fileInput.addEventListener('focus', () => drop.classList.add('focus')); fileInput.addEventListener('blur', () => drop.classList.remove('focus'));
  ['dragenter', 'dragover'].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); drop.classList.remove('over'); if (t === 'drop' && e.dataTransfer) addFiles(e.dataTransfer.files); }));

  /* ---------- steps ---------- */
  const step1 = $('#step1'), step2 = $('#step2'), msg2 = $('#msg2');
  function goStep(n) {
    step1.hidden = n !== 1; step2.hidden = n !== 2;
    $('#st1').className = 'st ' + (n === 1 ? 'on' : 'done'); $('#st2').className = 'st' + (n === 2 ? ' on' : '');
  }
  function renderStrip() {
    $('#strip').innerHTML = photos.map((p, i) => `<div class="tb"><img src="${escH(p.url)}" alt="Photo ${i + 1}"></div>`).join('');
  }
  $('#next').onclick = () => {
    if (!photos.length) { msg1.textContent = 'Add at least one photo first.'; return; }
    renderStrip(); goStep(2); $('#f-title').focus({ preventScroll: true });
  };
  $('#back').onclick = () => { if (!busy) goStep(1); };

  /* ---------- step 2: details ---------- */
  const f = { title: $('#f-title'), cat: $('#f-cat'), desc: $('#f-desc'), price: $('#f-price'), size: $('#f-size'),
    medium: $('#f-medium'), visible: $('#f-visible'), one: $('#f-one') };
  const priceType = () => ($('#step2 input[name=priceType]:checked') || {}).value || 'fixed';
  const syncPrice = () => { const c = priceType() === 'contact'; f.price.disabled = c; if (c) f.price.classList.remove('bad'); };
  const syncSwitch = () => { $('#sw-text').textContent = f.visible.checked ? 'Visible in shop' : 'Hidden'; };
  $$('#step2 input[name=priceType]').forEach(r => r.addEventListener('change', syncPrice));
  f.visible.addEventListener('change', syncSwitch);
  step2.addEventListener('input', e => { e.target.classList.remove('bad'); msg2.textContent = ''; });

  function resetFlow() {
    photos.forEach(p => { if (p.file) URL.revokeObjectURL(p.url); });
    photos = []; editing = null; step2.reset();
    f.visible.checked = true; $('#step2 input[name=priceType][value=fixed]').checked = true;
    $('#more').open = false; $$('#step2 .bad').forEach(x => x.classList.remove('bad'));
    msg1.textContent = ''; msg2.textContent = ''; $('#prog').hidden = true;
    $('#form-title').textContent = 'Add the details'; $('#save').textContent = 'Upload listing';
    syncPrice(); syncSwitch(); renderPhotos(); goStep(1);
  }
  $('#cancel1').onclick = () => { if (!busy) resetFlow(); };
  $('#cancel2').onclick = () => { if (busy) return; const was = editing; resetFlow(); if (was) showTab('list'); };

  function problem(text, el) { msg2.textContent = text; if (el) { el.classList.add('bad'); el.focus(); } return false; }
  function validate() {
    if (!f.title.value.trim()) return problem('Please give the piece a title.', f.title);
    if (!f.cat.value) return problem('Please choose a category.', f.cat);
    if (priceType() !== 'contact' && (f.price.value === '' || !(Number(f.price.value) >= 0))) return problem('Please enter a price, or open “More options” and choose “Contact for Price”.', f.price);
    return true;
  }

  /* ---------- photos: shrink on the device, then upload ---------- */
  async function prepareImage(file) {
    if (typeof createImageBitmap === 'function') {
      try {
        let bmp; try { bmp = await createImageBitmap(file, { imageOrientation: 'from-image' }); } catch { bmp = await createImageBitmap(file); }
        const k = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
        const c = document.createElement('canvas'); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
        const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(bmp, 0, 0, c.width, c.height);
        if (bmp.close) bmp.close();
        const blob = await new Promise(res => c.toBlob(res, 'image/jpeg', .86));
        if (blob && blob.size) return blob;
      } catch { /* fall back to the original file */ }
    }
    if (!/^image\/(jpeg|png|webp|gif)$/i.test(file.type)) throw new Error(`“${file.name}” is in a format I can’t use — please choose a JPG or PNG`);
    if (file.size > 5 * 1024 * 1024) throw new Error(`“${file.name}” is too big (5 MB max)`);
    return file;
  }
  const extFor = t => ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' }[t] || 'jpg');
  async function uploadImage(blob) {
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extFor(blob.type)}`;
    await api(`/storage/v1/object/${BUCKET}/${path}`, { method: 'POST', headers: { 'Content-Type': blob.type || 'image/jpeg', 'x-upsert': 'false' }, body: blob });
    return path;
  }
  // best effort: a failed clean-up never blocks the admin
  async function removeFiles(urls) {
    const prefixes = urls.filter(u => String(u).startsWith(publicPrefix())).map(u => String(u).slice(publicPrefix().length));
    if (!prefixes.length) return;
    try { await api(`/storage/v1/object/${BUCKET}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prefixes }) }); } catch { /* ignore */ }
  }

  function setBusy(on, text, pct) {
    busy = on;
    ['save', 'back', 'cancel2'].forEach(id => { $('#' + id).disabled = on; });
    const bar = $('#prog'); bar.hidden = !on;
    if (on) { $('#prog-t').textContent = text || ''; $('#prog-bar').style.width = Math.round((pct || 0) * 100) + '%'; }
  }

  step2.addEventListener('submit', async e => {
    e.preventDefault();
    if (busy || !validate()) return;
    const type = priceType();
    const row = {
      title: f.title.value.trim(), category: f.cat.value, description: f.desc.value.trim(),
      price: type === 'contact' ? null : Number(f.price.value), price_type: type,
      size: f.size.value.trim(), medium: f.medium.value.trim(), visible: f.visible.checked, one_of_a_kind: f.one.checked
    };
    const fresh = photos.filter(p => p.file).length, uploaded = [], urls = [];
    let n = 0;
    setBusy(true, fresh ? 'Uploading photos…' : 'Saving…', .05);
    try {
      for (const p of photos) {
        if (!p.file) { urls.push(p.url); continue; }
        setBusy(true, `Uploading photo ${++n} of ${fresh}…`, (n - 1) / (fresh + 1) + .05);
        const path = await uploadImage(await prepareImage(p.file));
        uploaded.push(path); urls.push(publicUrl(path));
      }
      row.images = urls;
      setBusy(true, 'Publishing…', fresh / (fresh + 1) + .05);
      const wasEditing = editing;
      if (wasEditing) await api(`/rest/v1/listings?id=eq.${wasEditing.id}`, { method: 'PATCH', headers: JSON_HDR, body: JSON.stringify(row) });
      else await api('/rest/v1/listings', { method: 'POST', headers: JSON_HDR, body: JSON.stringify(row) });
      if (wasEditing) removeFiles((wasEditing.images || []).filter(u => !urls.includes(u)));
      setBusy(false); resetFlow(); showTab('list');
      toast(wasEditing ? 'Listing updated — live in the shop' : 'Uploaded — it’s live in the shop now ✨');
    } catch (err) {
      if (uploaded.length) removeFiles(uploaded.map(publicUrl));
      setBusy(false);
      if (err.status !== 401) msg2.textContent = `Couldn’t upload: ${err.message}`;
    }
  });

  /* ---------- listings ---------- */
  const ICON_EDIT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20l1-4L16.5 4.5a2 2 0 0 1 3 3L8 19z"/><path d="M14 7l3 3"/></svg>';
  const ICON_EYE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
  const ICON_EYE_OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3l18 18"/><path d="M10.6 5.7A10 10 0 0 1 12 5.5C18.4 5.5 22 12 22 12a17 17 0 0 1-3.2 3.9M6.5 7.2A16.6 16.6 0 0 0 2 12s3.6 6.5 10 6.5a9.6 9.6 0 0 0 4-.9"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>';
  const ICON_TRASH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M10 7V4h4v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/></svg>';

  function cardHTML(l) {
    const thumb = phHTML({ image: safeImg((l.images || [])[0]), category: l.category, title: l.title });
    return `<article class="lcard ${l.visible ? '' : 'is-hidden'}" data-id="${escH(l.id)}">
      <div class="lthumb">${thumb}<span class="chip-s ${l.visible ? '' : 'off'}">${l.visible ? 'Visible' : 'Hidden'}</span></div>
      <div class="lbody">
        <h3>${escH(l.title)}</h3>
        <p class="lmeta">${escH(CATS[l.category] || l.category)} · <b>${escH(priceLabel(l))}</b>${l.oneOfAKind ? ' · one of a kind' : ''}${(l.images || []).length > 1 ? ` · ${l.images.length} photos` : ''}</p>
        <div class="lbtns">
          <button type="button" class="ib" data-act="edit">${ICON_EDIT}Edit</button>
          <button type="button" class="ib eye" data-act="toggle" aria-label="${l.visible ? 'Hide from shop' : 'Show in shop'}" title="${l.visible ? 'Hide from shop' : 'Show in shop'}">${l.visible ? ICON_EYE : ICON_EYE_OFF}</button>
          <button type="button" class="ib del" data-act="delete">${ICON_TRASH}Delete</button>
        </div>
      </div></article>`;
  }
  function renderList() {
    $('#count').textContent = listings.length;
    const box = $('#list');
    if (!listings.length) {
      box.innerHTML = '<div class="empty-state"><h2>No listings yet</h2><p>No listings yet — add your first piece!</p><button type="button" class="btn adm" id="first">Add New</button></div>';
      $('#first').onclick = () => showTab('add');
      return;
    }
    box.innerHTML = `<div class="lgrid">${listings.map(cardHTML).join('')}</div>`;
  }
  async function loadListings() {
    const box = $('#list');
    if (!listings.length) box.innerHTML = '<p class="hint" style="padding:24px 0">Loading your listings…</p>';
    try {
      listings = (await api('/rest/v1/listings?select=*&order=created_at.desc')).map(fromRow);
      renderList();
    } catch (err) {
      if (err.status === 401) return;
      box.innerHTML = '<div class="empty-state"><h2>Couldn’t load listings</h2><p>Check your connection and try again.</p><button type="button" class="btn adm" id="retry">Try again</button></div>';
      $('#retry').onclick = loadListings;
    }
  }
  $('#list').addEventListener('click', async e => {
    const btn = e.target.closest('[data-act]'); if (!btn) return;
    const l = listings.find(x => String(x.id) === btn.closest('.lcard').dataset.id); if (!l) return;
    try {
      if (btn.dataset.act === 'edit') startEdit(l);
      else if (btn.dataset.act === 'toggle') {
        await api(`/rest/v1/listings?id=eq.${l.id}`, { method: 'PATCH', headers: JSON_HDR, body: JSON.stringify({ visible: !l.visible }) });
        l.visible = !l.visible; renderList(); toast(l.visible ? 'Now visible in the shop' : 'Hidden from the shop');
      } else if (btn.dataset.act === 'delete' && confirm(`Delete “${l.title}”? This can’t be undone.`)) {
        await api(`/rest/v1/listings?id=eq.${l.id}`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } });
        listings = listings.filter(x => x !== l); renderList(); toast('Listing deleted'); removeFiles(l.images || []);
      }
    } catch (err) { if (err.status !== 401) toast(`That didn’t work: ${err.message}`); }
  });

  function startEdit(l) {
    resetFlow(); editing = l;
    photos = (l.images || []).map(u => ({ key: uid(), file: null, url: u }));
    f.title.value = l.title || ''; f.cat.value = l.category || ''; f.desc.value = l.description || '';
    f.price.value = Number(l.price) > 0 ? l.price : ''; f.size.value = l.size || ''; f.medium.value = l.medium || '';
    f.visible.checked = !!l.visible; f.one.checked = !!l.oneOfAKind;
    const r = $(`#step2 input[name=priceType][value="${l.priceType}"]`); if (r) r.checked = true;
    if (l.priceType !== 'fixed' || l.medium || l.oneOfAKind || !l.visible) $('#more').open = true;
    syncPrice(); syncSwitch(); renderPhotos(); renderStrip();
    $('#form-title').textContent = 'Edit listing'; $('#save').textContent = 'Update listing';
    showTab('add'); goStep(2); scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---------- go ---------- */
  function startDash() { showTab('add'); loadListings(); }
  syncPrice(); syncSwitch(); renderPhotos();
  if (root.classList.contains('authed')) { token().then(startDash).catch(() => {}); } else un.focus();
})();
