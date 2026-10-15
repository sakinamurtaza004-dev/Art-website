/* Cart: localStorage-backed, slide-in drawer, available on every page */
(() => {
  const KEY = 'sakina_cart_v1';
  let items = [];
  try { items = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { items = []; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* private mode */ } };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  document.body.insertAdjacentHTML('beforeend', `
    <div class="cart-back" id="cart-back" hidden></div>
    <aside class="cart" id="cart" aria-label="Shopping cart" aria-hidden="true">
      <div class="cart-head"><h3>Your cart</h3><button type="button" class="cart-x" id="cart-x" aria-label="Close cart">×</button></div>
      <div class="cart-items" id="cart-items"></div>
      <div class="cart-foot" id="cart-foot"></div>
    </aside>
    <div class="toast" id="toast" role="status" aria-live="polite"></div>`);

  const $ = id => document.getElementById(id);
  const drawer = $('cart'), back = $('cart-back'), btn = $('cart-btn');
  let lastFocus = null, toastTimer;

  const count = () => items.reduce((n, i) => n + i.qty, 0);
  const total = () => items.reduce((n, i) => n + i.qty * i.price, 0);

  function toast(msg) {
    const t = $('toast'); t.textContent = msg; t.classList.add('on');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('on'), 2600);
  }

  function badge(pop) {
    const b = $('cart-count'), n = count();
    b.textContent = n; b.hidden = n === 0;
    if (pop && window.gsap && !RM && n) gsap.fromTo(b, { scale: 1.8 }, { scale: 1, duration: .75, ease: 'elastic.out(1,.5)' });
  }

  function orderText() {
    return `Hi ${CFG.brand}! I'd like to order:\n\n` +
      items.map(i => `• ${i.title} × ${i.qty} – ${money(i.price * i.qty)}`).join('\n') +
      `\n\nTotal: ${money(total())}\n\nPlease confirm availability, delivery and payment details. Thank you!`;
  }

  function render() {
    badge(false);
    const list = $('cart-items'), foot = $('cart-foot');
    if (!items.length) {
      list.innerHTML = `<div class="cart-empty"><div class="flora-s" aria-hidden="true">${floraSVG('palette')}</div><p>Your cart is empty.</p><a class="btn sm" href="shop.html">Browse the collection</a></div>`;
      foot.innerHTML = '';
      return;
    }
    list.innerHTML = items.map(i => `
      <div class="ci" data-id="${esc(i.id)}">
        <div class="ci-img">${i.image ? `<img src="${esc(i.image)}" alt="" onerror="this.remove()">` : ''}</div>
        <div class="ci-info">
          <h4>${esc(i.title)}</h4>
          <span class="ci-price">${money(i.price)}</span>
          ${i.unique ? '<span class="ci-note">One of a kind</span>' : `
          <div class="qty" role="group" aria-label="Quantity">
            <button type="button" data-q="-1" aria-label="Decrease quantity">−</button><span>${i.qty}</span><button type="button" data-q="1" aria-label="Increase quantity">+</button>
          </div>`}
        </div>
        <button type="button" class="ci-x" data-rm aria-label="Remove ${esc(i.title)}">×</button>
      </div>`).join('');
    foot.innerHTML = `
      <div class="sub"><span>Subtotal</span><b>${money(total())}</b></div>
      <p class="muted small">Delivery and payment are confirmed with you directly.</p>
      <button type="button" class="btn solid" id="checkout">Proceed to Checkout</button>
      <div class="co-note" id="co-note" hidden></div>`;
  }

  function add(p) {
    const found = items.find(i => i.id === p.id);
    if (found) {
      if (found.unique) { toast('That one-of-a-kind piece is already in your cart'); open(); return; }
      found.qty++;
    } else items.push({ id: p.id, title: p.title, price: p.price, image: p.image || '', unique: !!p.original, qty: 1 });
    save(); render(); badge(true); toast(`Added “${p.title}” to your cart`);
  }
  function setQty(id, d) {
    const i = items.find(x => x.id === id); if (!i) return;
    i.qty = Math.max(1, Math.min(20, i.qty + d)); save(); render();
  }
  function remove(id) { items = items.filter(i => i.id !== id); save(); render(); }

  function open() {
    lastFocus = document.activeElement;
    back.hidden = false; drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => back.classList.add('on'));
    document.body.style.overflow = 'hidden';
    $('cart-x').focus();
  }
  function close() {
    drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); back.classList.remove('on');
    setTimeout(() => { back.hidden = true; }, 400);
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  btn.onclick = open; $('cart-x').onclick = close; back.onclick = close;
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && drawer.classList.contains('open')) close(); });
  drawer.addEventListener('click', e => {
    const row = e.target.closest('.ci');
    if (row && e.target.closest('[data-rm]')) return remove(row.dataset.id);
    if (row && e.target.closest('[data-q]')) return setQty(row.dataset.id, +e.target.closest('[data-q]').dataset.q);
    if (e.target.closest('#checkout')) {
      if (CFG.checkoutUrl) { location.href = CFG.checkoutUrl; return; }
      const t = orderText(), note = $('co-note');
      note.innerHTML = `<p>Online payments aren't switched on yet. Send your order and Sakina will confirm delivery and payment with you.</p>
        <a class="btn sage solid sm" target="_blank" rel="noopener" href="https://wa.me/${CFG.whatsapp}?text=${encodeURIComponent(t)}">Send on WhatsApp</a>
        <a class="btn sm" href="mailto:${CFG.email}?subject=${encodeURIComponent('Order enquiry')}&body=${encodeURIComponent(t)}">Send by email</a>`;
      note.hidden = false; e.target.closest('#checkout').hidden = true;
    }
  });
  drawer.addEventListener('keydown', e => {   // keep focus inside the open drawer
    if (e.key !== 'Tab') return;
    const f = [...drawer.querySelectorAll('button:not([hidden]),a[href]')]; if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  render();
  window.Cart = { add, open, close, count, toast };
})();
