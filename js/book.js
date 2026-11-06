(async () => {
  const PER_PAGE = 3;
  const PAGE_W = 420, PAGE_H = 700;

  const stage = document.getElementById('stage');
  const scaler = document.getElementById('scaler');
  const book = document.getElementById('book');

  let data;
  try {
    const res = await fetch('entries.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error(res.status);
    data = await res.json();
  } catch (e) {
    stage.innerHTML = '<p class="msg">讀不到 entries.json。如果你是直接在電腦上開檔案，請改用網址（GitHub Pages）或本機伺服器開啟。</p>';
    document.querySelector('nav').hidden = true;
    return;
  }
  const entries = Array.isArray(data.entries) ? data.entries : [];
  if (data.title) document.title = data.title;

  // ---------- 組頁面 ----------
  const el = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; };
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function seeded(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

  const chunks = [];
  for (let i = 0; i < entries.length; i += PER_PAGE) chunks.push(entries.slice(i, i + PER_PAGE));
  if (!chunks.length) chunks.push([]);

  // 頁面描述：type = cover | endpaper | intro | content | blank | endback | backcover
  // 封面內側（左）＋扉頁（右），之後第 1、2 頁會在同一個跨頁
  const pages = [{ type: 'cover' }, { type: 'endpaper' }, { type: 'intro' }];
  chunks.forEach((c, i) => pages.push({ type: 'content', items: c, no: i + 1 }));
  if (chunks.length % 2 === 0) pages.push({ type: 'blank' });
  pages.push({ type: 'endback' }, { type: 'backcover' });

  function fillFace(face, page, side) {
    switch (page.type) {
      case 'cover':
        face.classList.add('cover');
        face.append(el('div', 'label', `<h1>${esc(data.title || '詞彙收集簿')}</h1>${data.subtitle ? `<p>${esc(data.subtitle)}</p>` : ''}`));
        break;
      case 'backcover':
        face.classList.add('cover', 'backcover');
        break;
      case 'endpaper':
        face.classList.add('endpaper');
        break;
      case 'intro':
        face.classList.add('paper');
        if (data.intro) face.append(el('div', 'intro', esc(data.intro)));
        break;
      case 'endback':
        face.classList.add('endpaper');
        break;
      case 'blank':
        face.classList.add('paper');
        break;
      case 'content': {
        face.classList.add('paper');
        const slots = el('div', 'slots');
        if (!page.items.length) {
          face.append(el('div', 'empty-note', '還沒有收錄任何詞彙'));
        }
        page.items.forEach((it, j) => {
          const rnd = seeded((page.no * 31 + j * 7) * 97);
          const b = el('button', 'slot');
          b.type = 'button';
          b.style.transform = `rotate(${(rnd() - 0.5) * 3}deg) translateX(${(rnd() - 0.5) * 10}px)`;
          const alt = [it.name, it.word].filter(Boolean).join('：') || '詞彙卡';
          const img = el('img'); img.src = it.src; img.alt = alt; img.loading = 'lazy'; img.decoding = 'async';
          const tape = el('span', 'tape');
          tape.style.transform = `rotate(${(rnd() - 0.5) * 8}deg)`;
          b.append(img, tape);
          b.addEventListener('click', ev => { ev.stopPropagation(); openLightbox(it.src, alt); });
          slots.append(b);
        });
        face.append(slots);
        face.append(el('div', 'pno', page.no));
        break;
      }
    }
  }

  let swiped = false;
  const leaves = [];
  for (let i = 0; i < pages.length; i += 2) {
    const leaf = el('div', 'leaf');
    const front = el('div', 'face front');
    const back = el('div', 'face back');
    fillFace(front, pages[i], 'front');
    fillFace(back, pages[i + 1], 'back');
    front.addEventListener('click', () => { if (!swiped) go(1); });
    back.addEventListener('click', () => { if (!swiped) go(-1); });
    leaf.append(front, back);
    book.append(leaf);
    leaves.push(leaf);
  }
  const L = leaves.length;

  // ---------- 翻頁 ----------
  let cur = 0;            // 已經翻過去的張數
  let scale = 1;
  const flying = new Set();

  function zOrder() {
    leaves.forEach((lf, i) => {
      if (flying.has(lf)) return;
      lf.style.zIndex = i < cur ? i + 1 : L - i;
    });
  }

  function position() {
    const sw = stage.clientWidth, sh = stage.clientHeight;
    scale = Math.min((sw - 24) / (PAGE_W * 2), (sh - 8) / PAGE_H, 1.25);
    scaler.style.transform = `scale(${scale})`;
    let shift = 0;
    if (cur === 0) shift = -PAGE_W / 2;
    else if (cur === L) shift = PAGE_W / 2;
    const left = (sw - PAGE_W * 2 * scale) / 2 + shift * scale;
    scaler.style.left = left + 'px';
    scaler.style.top = Math.max(0, (sh - PAGE_H * scale) / 2) + 'px';
  }

  function updateNav() {
    document.getElementById('prev').disabled = cur === 0;
    document.getElementById('next').disabled = cur === L;
    const pos = document.getElementById('pos');
    if (cur === 0) pos.textContent = '封面';
    else if (cur === L) pos.textContent = '封底';
    else {
      const nums = [pages[cur * 2 - 1], pages[cur * 2]].filter(p => p && p.type === 'content').map(p => p.no);
      pos.textContent = nums.length ? `第 ${nums.join('–')} 頁 / 共 ${chunks.length} 頁` : '';
    }
  }

  function go(dir) {
    const target = cur + dir;
    if (target < 0 || target > L) return;
    const lf = dir > 0 ? leaves[cur] : leaves[cur - 1];
    flying.add(lf);
    lf.style.zIndex = 1000;
    cur = target;
    lf.classList.toggle('flipped', dir > 0);
    const done = () => { flying.delete(lf); zOrder(); };
    lf.addEventListener('transitionend', done, { once: true });
    setTimeout(done, 1100);
    zOrder();
    position();
    updateNav();
  }

  document.getElementById('prev').addEventListener('click', () => go(-1));
  document.getElementById('next').addEventListener('click', () => go(1));
  document.addEventListener('keydown', e => {
    if (lightbox.classList.contains('show')) { if (e.key === 'Escape') closeLightbox(); return; }
    if (e.key === 'ArrowRight') go(1);
    if (e.key === 'ArrowLeft') go(-1);
  });

  // 手機滑動
  let sx = null, sy = null;
  stage.addEventListener('pointerdown', e => { sx = e.clientX; sy = e.clientY; });
  stage.addEventListener('pointerup', e => {
    if (sx == null) return;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      go(dx < 0 ? 1 : -1);
      swiped = true; setTimeout(() => { swiped = false; }, 50);
    }
    sx = null;
  });

  // 放大
  const lightbox = document.getElementById('lightbox');
  function openLightbox(src, alt) {
    const img = lightbox.querySelector('img'); img.src = src; img.alt = alt;
    lightbox.classList.add('show');
  }
  function closeLightbox() { lightbox.classList.remove('show'); }
  lightbox.addEventListener('click', closeLightbox);

  zOrder(); position(); updateNav();
  window.addEventListener('resize', position);
})();
