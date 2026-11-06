(async () => {
  const PER_PAGE = 3;

  // 黨徽：用 SVG 畫的躺下來的 8
  const EMBLEM = `<svg class="emblem" viewBox="0 0 200 80" aria-hidden="true">
          <path class="emblem-shadow" d="M190.0 40.0 L189.3 46.2 L187.4 52.2 L184.4 57.5 L180.4 62.2 L175.7 65.9 L170.5 68.7 L165.1 70.6 L159.6 71.6 L154.1 71.8 L148.8 71.4 L143.7 70.3 L138.8 68.8 L134.2 66.9 L129.8 64.7 L125.7 62.3 L121.8 59.6 L118.1 56.8 L114.6 53.9 L111.2 50.9 L107.9 47.8 L104.7 44.7 L101.6 41.6 L98.4 38.4 L95.3 35.3 L92.1 32.2 L88.8 29.1 L85.4 26.1 L81.9 23.2 L78.2 20.4 L74.3 17.7 L70.2 15.3 L65.8 13.1 L61.2 11.2 L56.3 9.7 L51.2 8.6 L45.9 8.2 L40.4 8.4 L34.9 9.4 L29.5 11.3 L24.3 14.1 L19.6 17.8 L15.6 22.5 L12.6 27.8 L10.7 33.8 L10.0 40.0 L10.7 46.2 L12.6 52.2 L15.6 57.5 L19.6 62.2 L24.3 65.9 L29.5 68.7 L34.9 70.6 L40.4 71.6 L45.9 71.8 L51.2 71.4 L56.3 70.3 L61.2 68.8 L65.8 66.9 L70.2 64.7 L74.3 62.3 L78.2 59.6 L81.9 56.8 L85.4 53.9 L88.8 50.9 L92.1 47.8 L95.3 44.7 L98.4 41.6 L101.6 38.4 L104.7 35.3 L107.9 32.2 L111.2 29.1 L114.6 26.1 L118.1 23.2 L121.8 20.4 L125.7 17.7 L129.8 15.3 L134.2 13.1 L138.8 11.2 L143.7 9.7 L148.8 8.6 L154.1 8.2 L159.6 8.4 L165.1 9.4 L170.5 11.3 L175.7 14.1 L180.4 17.8 L184.4 22.5 L187.4 27.8 L189.3 33.8 L190.0 40.0Z"/>
          <path class="emblem-line" d="M190.0 40.0 L189.3 46.2 L187.4 52.2 L184.4 57.5 L180.4 62.2 L175.7 65.9 L170.5 68.7 L165.1 70.6 L159.6 71.6 L154.1 71.8 L148.8 71.4 L143.7 70.3 L138.8 68.8 L134.2 66.9 L129.8 64.7 L125.7 62.3 L121.8 59.6 L118.1 56.8 L114.6 53.9 L111.2 50.9 L107.9 47.8 L104.7 44.7 L101.6 41.6 L98.4 38.4 L95.3 35.3 L92.1 32.2 L88.8 29.1 L85.4 26.1 L81.9 23.2 L78.2 20.4 L74.3 17.7 L70.2 15.3 L65.8 13.1 L61.2 11.2 L56.3 9.7 L51.2 8.6 L45.9 8.2 L40.4 8.4 L34.9 9.4 L29.5 11.3 L24.3 14.1 L19.6 17.8 L15.6 22.5 L12.6 27.8 L10.7 33.8 L10.0 40.0 L10.7 46.2 L12.6 52.2 L15.6 57.5 L19.6 62.2 L24.3 65.9 L29.5 68.7 L34.9 70.6 L40.4 71.6 L45.9 71.8 L51.2 71.4 L56.3 70.3 L61.2 68.8 L65.8 66.9 L70.2 64.7 L74.3 62.3 L78.2 59.6 L81.9 56.8 L85.4 53.9 L88.8 50.9 L92.1 47.8 L95.3 44.7 L98.4 41.6 L101.6 38.4 L104.7 35.3 L107.9 32.2 L111.2 29.1 L114.6 26.1 L118.1 23.2 L121.8 20.4 L125.7 17.7 L129.8 15.3 L134.2 13.1 L138.8 11.2 L143.7 9.7 L148.8 8.6 L154.1 8.2 L159.6 8.4 L165.1 9.4 L170.5 11.3 L175.7 14.1 L180.4 17.8 L184.4 22.5 L187.4 27.8 L189.3 33.8 L190.0 40.0Z"/>
        </svg>`;
  const PAGE_W = 420,
    PAGE_H = 700;

  const stage = document.getElementById("stage");
  const scaler = document.getElementById("scaler");
  const book = document.getElementById("book");

  let data;
  try {
    const res = await fetch("entries.json", { cache: "no-cache" });
    if (!res.ok) throw new Error(res.status);
    data = await res.json();
  } catch (e) {
    stage.innerHTML =
      '<p class="msg">讀不到 entries.json。如果你是直接在電腦上開檔案，請改用網址（GitHub Pages）或本機伺服器開啟。</p>';
    document.querySelector("nav").hidden = true;
    return;
  }
  const entries = Array.isArray(data.entries) ? data.entries : [];
  if (data.title) document.title = data.title;

  // ---------- 組頁面 ----------
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };
  const esc = (s) =>
    String(s ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  function seeded(seed) {
    let s = seed >>> 0;
    return () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  const chunks = [];
  for (let i = 0; i < entries.length; i += PER_PAGE)
    chunks.push(entries.slice(i, i + PER_PAGE));
  if (!chunks.length) chunks.push([]);

  // 頁面描述：type = cover | endpaper | intro | content | blank | endback | backcover
  // 封面內側（左）＋扉頁（右），之後第 1、2 頁會在同一個跨頁
  const pages = [{ type: "cover" }, { type: "endpaper" }, { type: "intro" }];
  chunks.forEach((c, i) =>
    pages.push({ type: "content", items: c, no: i + 1 }),
  );
  if (chunks.length % 2 === 0) pages.push({ type: "blank" });
  pages.push({ type: "endback" }, { type: "backcover" });

  function fillFace(face, page, side) {
    switch (page.type) {
      case "cover":
        face.classList.add("cover");
        const title = data.title || "詞彙收集簿";
        face.append(
          el(
            "div",
            "label",
            `<h1${[...title].length > 10 ? ' class="long"' : ""}>${esc(title)}</h1>${data.subtitle ? `<p>${esc(data.subtitle)}</p>` : ""}`,
          ),
        );
        // 封面上的黨徽（躺下來的 8）；不想要的話把下面這行刪掉
        face.append(el("div", "emblem-wrap", EMBLEM));
        break;
      case "backcover":
        face.classList.add("cover", "backcover");
        break;
      case "endpaper":
        face.classList.add("endpaper");
        break;
      case "intro":
        face.classList.add("paper");
        if (data.intro) face.append(el("div", "intro", esc(data.intro)));
        break;
      case "endback":
        face.classList.add("endpaper");
        break;
      case "blank":
        face.classList.add("paper");
        break;
      case "content": {
        face.classList.add("paper");
        const slots = el("div", "slots");
        if (!page.items.length) {
          face.append(el("div", "empty-note", "還沒有收錄任何詞彙"));
        }
        page.items.forEach((it, j) => {
          const rnd = seeded((page.no * 31 + j * 7) * 97);
          const b = el("button", "slot");
          b.type = "button";
          b.style.transform = `rotate(${(rnd() - 0.5) * 3}deg) translateX(${(rnd() - 0.5) * 10}px)`;
          const alt = [it.name, it.word].filter(Boolean).join("：") || "詞彙卡";
          const img = el("img");
          img.src = it.src;
          img.alt = alt;
          img.loading = "lazy";
          img.decoding = "async";
          const tape = el("span", "tape");
          tape.style.transform = `rotate(${(rnd() - 0.5) * 8}deg)`;
          b.append(img, tape);
          b.addEventListener("click", (ev) => {
            ev.stopPropagation();
            pickUp(b, it.src, alt);
          });
          slots.append(b);
        });
        face.append(slots);
        face.append(el("div", "pno", page.no));
        break;
      }
    }
  }

  let swiped = false;
  const leaves = [];
  for (let i = 0; i < pages.length; i += 2) {
    const leaf = el("div", "leaf");
    const front = el("div", "face front");
    const back = el("div", "face back");
    fillFace(front, pages[i], "front");
    fillFace(back, pages[i + 1], "back");
    front.addEventListener("click", () => {
      if (!swiped) go(1);
    });
    back.addEventListener("click", () => {
      if (!swiped) go(-1);
    });
    leaf.append(front, back);
    book.append(leaf);
    leaves.push(leaf);
  }
  const L = leaves.length;

  // ---------- 翻頁 ----------
  let cur = 0; // 已經翻過去的張數
  let scale = 1;
  const flying = new Set();

  function zOrder() {
    leaves.forEach((lf, i) => {
      if (flying.has(lf)) return;
      lf.style.zIndex = i < cur ? i + 1 : L - i;
    });
  }

  function position() {
    const sw = stage.clientWidth,
      sh = stage.clientHeight;
    scale = Math.min((sw - 24) / (PAGE_W * 2), (sh - 8) / PAGE_H, 1.25);
    scaler.style.transform = `scale(${scale})`;
    let shift = 0;
    if (cur === 0) shift = -PAGE_W / 2;
    else if (cur === L) shift = PAGE_W / 2;
    const left = (sw - PAGE_W * 2 * scale) / 2 + shift * scale;
    scaler.style.left = left + "px";
    scaler.style.top = Math.max(0, (sh - PAGE_H * scale) / 2) + "px";
  }

  function updateNav() {
    document.getElementById("prev").disabled = cur === 0;
    document.getElementById("next").disabled = cur === L;
    const pos = document.getElementById("pos");
    if (cur === 0) pos.textContent = "封面";
    else if (cur === L) pos.textContent = "封底";
    else {
      const nums = [pages[cur * 2 - 1], pages[cur * 2]]
        .filter((p) => p && p.type === "content")
        .map((p) => p.no);
      pos.textContent = nums.length
        ? `第 ${nums.join("–")} 頁 / 共 ${chunks.length} 頁`
        : "";
    }
  }

  function go(dir) {
    const target = cur + dir;
    if (target < 0 || target > L) return;
    const lf = dir > 0 ? leaves[cur] : leaves[cur - 1];
    flying.add(lf);
    lf.style.zIndex = 1000;
    cur = target;
    lf.classList.toggle("flipped", dir > 0);
    const done = () => {
      flying.delete(lf);
      zOrder();
    };
    lf.addEventListener("transitionend", done, { once: true });
    setTimeout(done, 1100);
    zOrder();
    position();
    updateNav();
  }

  document.getElementById("prev").addEventListener("click", () => go(-1));
  document.getElementById("next").addEventListener("click", () => go(1));
  document.addEventListener("keydown", (e) => {
    if (held) {
      if (e.key === "Escape") putDown();
      return;
    }
    if (e.key === "ArrowRight") go(1);
    if (e.key === "ArrowLeft") go(-1);
  });

  // 手機滑動
  let sx = null,
    sy = null;
  stage.addEventListener("pointerdown", (e) => {
    sx = e.clientX;
    sy = e.clientY;
  });
  stage.addEventListener("pointerup", (e) => {
    if (sx == null) return;
    const dx = e.clientX - sx,
      dy = e.clientY - sy;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      go(dx < 0 ? 1 : -1);
      swiped = true;
      setTimeout(() => {
        swiped = false;
      }, 50);
    }
    sx = null;
  });

  // 拿起卡片：從原本的位置浮起、轉正、移到畫面中央；再點一下放回去
  const lightbox = document.getElementById("lightbox");
  const HELD_WIDTH = 0.62; // 拿起來時佔畫面寬度的比例
  const HELD_MAX = 640; // 最大寬度（px）
  let held = null;

  function slotRotation(slot) {
    const m = /rotate\(([-\d.]+)deg\)/.exec(slot.style.transform);
    return m ? parseFloat(m[1]) : 0;
  }

  function pickUp(slot, src, alt) {
    if (held) return;
    const r = slot.getBoundingClientRect();
    const rot = slotRotation(slot);
    const card = el("div", "held");
    const img = el("img");
    img.src = src;
    img.alt = alt;
    card.append(img);
    card.setAttribute("role", "dialog");
    card.setAttribute("aria-label", alt);

    // 目標大小與位置（畫面中央）
    const w = Math.min(
      window.innerWidth * HELD_WIDTH,
      HELD_MAX,
      (window.innerHeight * 0.8 * 600) / 350,
    );
    const h = (w * 350) / 600;
    const tx = (window.innerWidth - w) / 2,
      ty = (window.innerHeight - h) / 2;

    // 先放在目標位置，再用動畫從原本的卡片位置「飛」過來
    Object.assign(card.style, {
      left: tx + "px",
      top: ty + "px",
      width: w + "px",
      height: h + "px",
    });
    const sx = r.width / w;
    const dx = r.left + r.width / 2 - (tx + w / 2),
      dy = r.top + r.height / 2 - (ty + h / 2);
    const from = `translate(${dx}px, ${dy}px) scale(${sx}) rotate(${rot}deg)`;
    const lift = `translate(${dx * 0.6}px, ${dy * 0.6 - 18}px) scale(${sx * 1.25 + 0.15}) rotate(${rot - 4}deg)`;
    const to = "translate(0, 0) scale(1) rotate(-1.2deg)";

    document.body.append(card);
    slot.classList.add("lifted");
    lightbox.classList.add("show");
    held = { card, slot, from };

    card.animate(
      [
        {
          transform: from,
          filter: "drop-shadow(0 2px 3px rgba(60,40,20,.35))",
        },
        {
          transform: lift,
          filter: "drop-shadow(0 18px 22px rgba(0,0,0,.45))",
          offset: 0.35,
        },
        { transform: to, filter: "drop-shadow(0 24px 30px rgba(0,0,0,.5))" },
      ],
      {
        duration: reduceMotion ? 0 : 650,
        easing: "cubic-bezier(.3,.1,.2,1)",
        fill: "forwards",
      },
    );

    card.addEventListener("click", putDown);
  }

  function putDown() {
    if (!held) return;
    const { card, slot, from } = held;
    held = null;
    lightbox.classList.remove("show");
    const anim = card.animate(
      [
        {
          transform: "translate(0, 0) scale(1) rotate(-1.2deg)",
          filter: "drop-shadow(0 24px 30px rgba(0,0,0,.5))",
        },
        {
          transform: from,
          filter: "drop-shadow(0 2px 3px rgba(60,40,20,.35))",
        },
      ],
      {
        duration: reduceMotion ? 0 : 450,
        easing: "cubic-bezier(.4,0,.3,1)",
        fill: "forwards",
      },
    );
    anim.onfinish = () => {
      slot.classList.remove("lifted");
      card.remove();
    };
  }

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  lightbox.addEventListener("click", putDown);

  zOrder();
  position();
  updateNav();
  window.addEventListener("resize", position);
})();
