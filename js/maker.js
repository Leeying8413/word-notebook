(() => {
  const W = 600,
    H = 350,
    SCALE = 2;

  const FONTS = [
    {
      id: "serif",
      label: "明體",
      family: '"Noto Serif TC"',
      fallback: "serif",
      weight: 600,
    },
    {
      id: "kai",
      label: "楷書",
      family: '"LXGW WenKai TC"',
      fallback: '"Noto Serif TC", serif',
      weight: 400,
    },
    {
      id: "sans",
      label: "黑體",
      family: '"Noto Sans TC"',
      fallback: "sans-serif",
      weight: 500,
    },
  ];
  const INKS = [
    { id: "black", label: "黑", color: "#25232b" },
    { id: "blue", label: "藍", color: "#22407a" },
    { id: "brown", label: "褐", color: "#5a3a24" },
  ];

  // 紙張：第一個是程式畫的舊筆記本，其他的從 papers/papers.json 讀進來
  // left：文字區左邊要空出的寬度（例如紅色邊線的位置），預設 0
  // desc：選了這張紙之後，卡片下方出現的灰色小字（可省略）
  const PAPERS = [
    {
      id: "notebook",
      label: "舊筆記本",
      builtin: true,
      left: 60,
      desc: "從筆記本直接撕下來的橫線紙，無聊但務實的選擇。",
    },
  ];

  function showPaperDesc() {
    document.getElementById("paperDesc").textContent =
      (state.paper && state.paper.desc) || "";
  }

  const state = {
    name: "",
    town: "",
    word: "",
    reading: "",
    meaning: "",
    font: FONTS[1],
    ink: INKS[0],
    paper: null,
    strokes: [],
    drawing: false,
  };

  // ---------- 紙張 ----------
  function seeded(seed) {
    let s = seed >>> 0;
    return () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  function drawPaper(ctx) {
    ctx.fillStyle = "#f3ead6";
    ctx.fillRect(0, 0, W, H);

    const rnd = seeded(19);
    // 紙的纖維與斑點
    for (let i = 0; i < 2200; i++) {
      const a = rnd() * 0.06;
      ctx.fillStyle =
        rnd() < 0.5 ? `rgba(120,95,60,${a})` : `rgba(255,255,255,${a * 1.5})`;
      ctx.fillRect(rnd() * W, rnd() * H, 1 + rnd() * 1.5, 1 + rnd() * 1.5);
    }
    // 淡淡的黃斑
    for (let i = 0; i < 5; i++) {
      const x = rnd() * W,
        y = rnd() * H,
        r = 10 + rnd() * 34;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, "rgba(170,125,60,0.07)");
      g.addColorStop(1, "rgba(170,125,60,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    // 橫線
    ctx.strokeStyle = "rgba(95,130,165,0.30)";
    ctx.lineWidth = 1;
    for (let y = 74; y < H - 8; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(W, y + 0.5);
      ctx.stroke();
    }
    // 左側紅色邊線
    ctx.strokeStyle = "rgba(185,80,70,0.45)";
    ctx.beginPath();
    ctx.moveTo(56.5, 0);
    ctx.lineTo(56.5, H);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(60.5, 0);
    ctx.lineTo(60.5, H);
    ctx.stroke();
    // 邊緣變暗
    const v = ctx.createRadialGradient(
      W / 2,
      H / 2,
      H * 0.35,
      W / 2,
      H / 2,
      W * 0.62,
    );
    v.addColorStop(0, "rgba(120,85,40,0)");
    v.addColorStop(1, "rgba(120,85,40,0.22)");
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, W, H);
  }

  // ---------- 文字 ----------
  const fontStr = (f, size) =>
    `${f.weight} ${size}px ${f.family}, ${f.fallback}`;

  function tokenize(text) {
    // 拉丁字母以單字為單位，其他字元逐字
    return text.match(/[A-Za-zÀ-ɏ0-9'’\-]+|\s+|./gu) || [];
  }

  function wrap(ctx, text, maxW) {
    const lines = [];
    let line = "";
    for (const t of tokenize(text)) {
      const test = line + t;
      if (line && ctx.measureText(test.trimEnd()).width > maxW) {
        lines.push(line.trim());
        line = t.trimStart();
      } else line = test;
    }
    if (line.trim()) lines.push(line.trim());
    return lines;
  }

  function layoutWord(ctx, word, f, maxW) {
    for (let size = 58; size >= 36; size -= 2) {
      ctx.font = fontStr(f, size);
      if (ctx.measureText(word).width <= maxW) return { size, lines: [word] };
    }
    for (let size = 36; size >= 22; size -= 2) {
      ctx.font = fontStr(f, size);
      const lines = wrap(ctx, word, maxW);
      if (lines.length <= 2) return { size, lines };
    }
    ctx.font = fontStr(f, 22);
    return { size: 22, lines: wrap(ctx, word, maxW).slice(0, 3) };
  }

  function drawText(ctx, s) {
    const f = s.font,
      ink = s.ink.color;
    ctx.fillStyle = ink;
    ctx.textBaseline = "alphabetic";

    if (s.town) {
      ctx.globalAlpha = 0.75;
      ctx.font = fontStr(f, 17);
      ctx.textAlign = "right";
      ctx.fillText(s.town, W - 30, 44);
      ctx.globalAlpha = 1;
    }

    const left = (s.paper || PAPERS[0]).left || 0;
    const cx = (left + W) / 2;
    const maxW = W - left - 90;
    const word = s.word.trim();
    const reading = s.reading.trim();
    const meaning = (s.meaning || "").trim();
    ctx.textAlign = "center";

    // 先算出每一塊的高度，再整組垂直置中
    const RS = 18,
      MS = 18;
    const wl = word ? layoutWord(ctx, word, f, maxW) : null;
    ctx.font = fontStr(f, MS);
    const ml = meaning ? wrap(ctx, meaning, maxW).slice(0, 2) : [];
    const gap = 14;
    const blocks = [];
    if (reading)
      blocks.push({
        h: RS,
        draw: (y) => {
          ctx.globalAlpha = 0.72;
          ctx.font = fontStr(f, RS);
          ctx.fillText(reading, cx, y + RS * 0.85);
          ctx.globalAlpha = 1;
        },
      });
    if (wl) {
      const lh = wl.size * 1.15;
      blocks.push({
        h: lh * (wl.lines.length - 1) + wl.size,
        draw: (y) => {
          ctx.font = fontStr(f, wl.size);
          wl.lines.forEach((ln, i) =>
            ctx.fillText(ln, cx, y + wl.size * 0.86 + i * lh),
          );
        },
      });
    }
    if (ml.length) {
      const lh = MS * 1.5;
      blocks.push({
        h: lh * (ml.length - 1) + MS,
        draw: (y) => {
          ctx.globalAlpha = 0.8;
          ctx.font = fontStr(f, MS);
          ml.forEach((ln, i) => ctx.fillText(ln, cx, y + MS * 0.85 + i * lh));
          ctx.globalAlpha = 1;
        },
      });
    }
    const total =
      blocks.reduce((a, b) => a + b.h, 0) +
      gap * Math.max(0, blocks.length - 1);
    let y = 172 - total / 2;
    for (const b of blocks) {
      b.draw(y);
      y += b.h + gap;
    }

    if (s.name.trim()) {
      ctx.font = fontStr(f, 22);
      ctx.textAlign = "right";
      ctx.fillText("—— " + s.name.trim(), W - 34, H - 30);
    }
  }

  function drawStrokes(ctx, strokes) {
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const st of strokes) {
      ctx.strokeStyle = st.color;
      ctx.fillStyle = st.color;
      ctx.lineWidth = st.size;
      const p = st.points;
      if (p.length === 1) {
        ctx.beginPath();
        ctx.arc(p[0].x, p[0].y, st.size / 2, 0, Math.PI * 2);
        ctx.fill();
        continue;
      }
      ctx.beginPath();
      ctx.moveTo(p[0].x, p[0].y);
      for (let i = 1; i < p.length - 1; i++) {
        const mx = (p[i].x + p[i + 1].x) / 2,
          my = (p[i].y + p[i + 1].y) / 2;
        ctx.quadraticCurveTo(p[i].x, p[i].y, mx, my);
      }
      const last = p[p.length - 1];
      ctx.lineTo(last.x, last.y);
      ctx.stroke();
    }
  }

  function paint(canvas, s) {
    const ctx = canvas.getContext("2d");
    ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const pp = s.paper || PAPERS[0];
    if (pp.img) ctx.drawImage(pp.img, 0, 0, W, H);
    else drawPaper(ctx);
    drawText(ctx, s);
    drawStrokes(ctx, s.strokes);
  }

  async function ensureFonts(s) {
    const text =
      [s.name, s.town, s.word, s.reading, s.meaning || ""].join("") || "字";
    try {
      await document.fonts.load(fontStr(s.font, 40), text);
    } catch (e) {
      /* 字體載入失敗就用備用字體 */
    }
  }

  // ---------- 介面 ----------
  const canvas = document.getElementById("card");
  let renderId = 0;
  async function render() {
    const id = ++renderId;
    paint(canvas, state); // 先畫一次，避免空白
    await ensureFonts(state);
    if (id === renderId) paint(canvas, state);
  }

  for (const key of ["name", "town", "word", "reading", "meaning"]) {
    const el = document.getElementById(key);
    el.addEventListener("input", () => {
      state[key] = el.value;
      render();
    });
  }

  function makeChips(container, items, key, dot) {
    items.forEach((item) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip";
      if (key === "paper") {
        if (item.src) {
          const t = document.createElement("img");
          t.className = "thumb";
          t.src = item.src;
          t.alt = "";
          b.append(t);
        }
      } else if (dot)
        b.innerHTML = `<span class="dot" style="background:${item.color}"></span>`;
      else b.style.fontFamily = `${item.family}, ${item.fallback}`;
      b.append(item.label);
      b.setAttribute("aria-pressed", state[key] === item);
      b.addEventListener("click", () => {
        state[key] = item;
        if (key === "paper") showPaperDesc();
        container
          .querySelectorAll(".chip")
          .forEach((c) => c.setAttribute("aria-pressed", "false"));
        b.setAttribute("aria-pressed", "true");
        render();
      });
      container.append(b);
    });
  }
  makeChips(document.getElementById("fonts"), FONTS, "font", false);

  // 讀取紙張設定
  state.paper = PAPERS[0];
  function loadImg(src) {
    return new Promise((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = src;
    });
  }
  (async () => {
    try {
      const r = await fetch("papers/papers.json", { cache: "no-cache" });
      if (r.ok) {
        const list = await r.json();
        for (const p of list) {
          try {
            p.img = await loadImg(p.src);
            PAPERS.push(p);
          } catch (e) {
            console.warn("紙張圖片讀不到：", p.src);
          }
        }
      }
    } catch (e) {
      /* 沒有設定檔就只用舊筆記本 */
    }
    makeChips(document.getElementById("papers"), PAPERS, "paper", false);
    showPaperDesc();
  })();
  makeChips(document.getElementById("inks"), INKS, "ink", true);

  // 手寫
  const drawToggle = document.getElementById("drawToggle");
  const penTools = document.getElementById("penTools");
  const drawHint = document.getElementById("drawHint");
  const penSize = document.getElementById("penSize");
  const undoBtn = document.getElementById("undo");
  const clearBtn = document.getElementById("clearInk");

  function syncPenButtons() {
    undoBtn.disabled = clearBtn.disabled = state.strokes.length === 0;
  }
  syncPenButtons();

  drawToggle.addEventListener("click", () => {
    state.drawing = !state.drawing;
    canvas.classList.toggle("drawing", state.drawing);
    drawToggle.classList.toggle("on", state.drawing);
    penTools.classList.toggle("show", state.drawing);
    drawHint.hidden = !state.drawing;
  });

  let current = null;
  function toCard(e) {
    const r = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * W,
      y: ((e.clientY - r.top) / r.height) * H,
    };
  }
  canvas.addEventListener("pointerdown", (e) => {
    if (!state.drawing) return;
    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);
    current = {
      color: state.ink.color,
      size: parseFloat(penSize.value),
      points: [toCard(e)],
    };
    state.strokes.push(current);
    paint(canvas, state);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!current) return;
    const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    for (const ev of evs) current.points.push(toCard(ev));
    paint(canvas, state);
  });
  const endStroke = () => {
    if (current) {
      current = null;
      syncPenButtons();
    }
  };
  canvas.addEventListener("pointerup", endStroke);
  canvas.addEventListener("pointercancel", endStroke);

  undoBtn.addEventListener("click", () => {
    state.strokes.pop();
    syncPenButtons();
    paint(canvas, state);
  });
  clearBtn.addEventListener("click", () => {
    state.strokes = [];
    syncPenButtons();
    paint(canvas, state);
  });

  // 存檔
  function fileName() {
    const clean = (t) => t.trim().replace(/[\\/:*?"<>|\s]+/g, "_");
    const parts = [clean(state.town), clean(state.name)].filter(Boolean);
    return (parts.join("-") || "詞彙卡") + ".png";
  }

  async function exportBlob(s) {
    await ensureFonts(s);
    const off = document.createElement("canvas");
    off.width = W * SCALE;
    off.height = H * SCALE;
    paint(off, s);
    return new Promise((res) => off.toBlob(res, "image/png"));
  }

  let lastUrl = null;
  document.getElementById("save").addEventListener("click", async () => {
    const blob = await exportBlob(state);
    if (lastUrl) URL.revokeObjectURL(lastUrl);
    lastUrl = URL.createObjectURL(blob);
    document.getElementById("resultImg").src = lastUrl;
    document.getElementById("result").classList.add("show");
    const a = document.createElement("a");
    a.href = lastUrl;
    a.download = fileName();
    document.body.append(a);
    a.click();
    a.remove();
  });

  // 給維護者用：在主控台呼叫 CardMaker.dataURL({...}) 可以直接產生卡片
  window.CardMaker = {
    async dataURL(data) {
      const s = { ...state, strokes: [], ...data };
      if (typeof s.font === "string")
        s.font = FONTS.find((f) => f.id === s.font) || FONTS[0];
      if (typeof s.ink === "string")
        s.ink = INKS.find((i) => i.id === s.ink) || INKS[0];
      if (typeof s.paper === "string")
        s.paper = PAPERS.find((p) => p.id === s.paper) || PAPERS[0];
      await ensureFonts(s);
      const off = document.createElement("canvas");
      off.width = W * SCALE;
      off.height = H * SCALE;
      paint(off, s);
      return off.toDataURL("image/png");
    },
  };

  render();
  document.fonts.ready.then(render);
})();
