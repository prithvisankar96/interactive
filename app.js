/* ============================================================
   Silence — macOS desktop-style web app
   Vanilla JS. No dependencies.
   ============================================================ */
(() => {
  "use strict";

  /* ---------- tiny helpers ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  /* ---------- SVG glyph factory ---------- */
  const glyph = {
    folder: (c1, c2) => `<svg viewBox="0 0 48 48"><defs><linearGradient id="g${c1.slice(1)}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><path d="M6 14a3 3 0 0 1 3-3h9l3 4h15a3 3 0 0 1 3 3v16a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3z" fill="url(#g${c1.slice(1)})"/></svg>`,
    wave: () => `<svg viewBox="0 0 48 48"><path d="M4 30c5-6 9-6 14 0s9 6 14 0 9-6 12-3" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M4 38c5-6 9-6 14 0s9 6 14 0 9-6 12-3" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".6"/></svg>`,
    spark: () => `<svg viewBox="0 0 48 48"><path d="M24 6l4 12 12 4-12 4-4 12-4-12-12-4 12-4z" fill="#fff"/></svg>`,
    leaf: () => `<svg viewBox="0 0 48 48"><path d="M38 10C20 10 10 22 10 38c16 0 28-10 28-28z" fill="#fff"/><path d="M14 34C22 26 30 20 36 14" stroke="rgba(0,0,0,.35)" stroke-width="2" fill="none"/></svg>`,
    field: () => `<svg viewBox="0 0 48 48"><g stroke="#fff" stroke-width="2.4" stroke-linecap="round"><path d="M12 40V22M20 40V16M28 40V20M36 40V14"/></g></svg>`,
    mountain: () => `<svg viewBox="0 0 48 48"><path d="M6 38l12-20 8 12 4-6 12 14z" fill="#fff"/></svg>`,
  };
  const photoThumb = (from, to, seed) =>
    `<div class="thumb" style="width:100%;height:100%;background:linear-gradient(135deg,${from},${to});filter:grayscale(.15)"><svg viewBox="0 0 48 48" style="width:100%;height:100%"><defs><radialGradient id="p${seed}" cx="50%" cy="38%"><stop offset="0" stop-color="rgba(255,255,255,.7)"/><stop offset="1" stop-color="rgba(0,0,0,.35)"/></radialGradient></defs><rect width="48" height="48" fill="url(#p${seed})"/><circle cx="24" cy="19" r="8" fill="rgba(0,0,0,.35)"/><path d="M10 44c2-9 8-13 14-13s12 4 14 13z" fill="rgba(0,0,0,.35)"/></svg></div>`;

  /* ---------- desktop content model ---------- */
  const PIECES = [
    { id: "champ", label: "Champ Silencieux", fr: "Silent Field", x: 60, y: 40,
      c1: "#ff7a2f", c2: "#c73a12", icon: glyph.field(), art: ["#f6a56b", "#7a2e12"],
      desc: "Une étendue sans bruit, où le vent oublie de parler. Cette pièce explore le vide comme matière — la texture du rien, patiemment cadrée.",
      tags: ["Photographie", "Silence", "2024"] },
    { id: "silences", label: "Les Silences Mépris", fr: "The Scorned Silences", x: 470, y: 30,
      c1: "#7fe0a0", c2: "#1e7d4a", icon: glyph.leaf(), art: ["#bfeacb", "#173b26"],
      desc: "Ce qui n'est pas dit pèse davantage. Une série sur les refus muets, la dignité des choses tues et le mépris qui se retient.",
      tags: ["Série", "Portrait", "Argentique"] },
    { id: "lisiere", label: "Lisière", fr: "Edge of the Woods", x: 120, y: 190,
      photo: ["#8a8f96", "#2c2f34"], icon: null, art: ["#9aa0a8", "#22252b"],
      desc: "La frontière tremblante entre la forêt et le champ, entre le connu et l'oubli. Là où le regard hésite avant de basculer.",
      tags: ["Paysage", "Noir & Blanc"] },
    { id: "eau", label: "Là où dort l'eau", fr: "Where the Water Sleeps", x: 250, y: 220,
      c1: "#ff3b6b", c2: "#8a0d33", icon: glyph.wave(), art: ["#ff6f92", "#4a0b22"],
      desc: "Les eaux dormantes gardent la mémoire du ciel. Un travail sur le reflet, l'immobilité et la profondeur qui ne se montre jamais.",
      tags: ["Vidéo", "Installation", "2023"] },
    { id: "elan", label: "Élan Brut", fr: "Raw Momentum", x: 400, y: 300,
      c1: "#39d98a", c2: "#0c5a3a", icon: glyph.spark(), art: ["#7ff0bd", "#0a3f2a"],
      desc: "Le geste avant la pensée. Une exploration de l'énergie non filtrée — le mouvement capté à l'instant où il échappe au contrôle.",
      tags: ["Danse", "Capture", "Live"] },
    { id: "revolte", label: "Révolte douce", fr: "Gentle Revolt", x: 500, y: 250,
      photo: ["#7d8288", "#26292e"], icon: null, art: ["#8b9096", "#1c1f24"],
      desc: "Résister sans crier. Cette œuvre parle des insurrections intérieures, des refus polis et de la tendresse comme arme.",
      tags: ["Manifeste", "Portrait", "2025"] },
  ];

  const DOCK = [
    { id: "finder", label: "Finder", type: "finder",
      icon: `<div class="dock-icon" style="background:linear-gradient(160deg,#4aa8ff,#1560d0)"><svg viewBox="0 0 48 48"><path d="M24 4a20 20 0 1 0 0 40 20 20 0 0 0 0-40z" fill="#fff" opacity=".95"/><path d="M24 4a20 20 0 0 0 0 40z" fill="#8fbdf0"/><circle cx="17" cy="20" r="2.2" fill="#333"/><circle cx="31" cy="20" r="2.2" fill="#333"/><path d="M18 30c3 3 9 3 12 0" stroke="#333" stroke-width="2" fill="none" stroke-linecap="round"/></svg></div>` },
    { id: "notes", label: "Notes", type: "notes",
      icon: `<div class="dock-icon" style="background:#fff"><svg viewBox="0 0 48 48"><rect x="8" y="6" width="32" height="36" rx="4" fill="#fff"/><rect x="8" y="6" width="32" height="9" rx="4" fill="#ffd54a"/><g stroke="#d9b53f" stroke-width="2" stroke-linecap="round"><path d="M15 24h18M15 30h18M15 36h11"/></g></svg></div>` },
    { id: "photos", label: "Photos", type: "finder",
      icon: `<div class="dock-icon" style="background:radial-gradient(circle at 50% 40%,#fff,#f0f0f0)"><svg viewBox="0 0 48 48"><g><circle cx="24" cy="12" r="6" fill="#f94"/><circle cx="33" cy="18" r="6" fill="#fd4"/><circle cx="36" cy="28" r="6" fill="#7d5"/><circle cx="30" cy="36" r="6" fill="#4bd"/><circle cx="18" cy="36" r="6" fill="#57e"/><circle cx="12" cy="28" r="6" fill="#a5e"/><circle cx="15" cy="18" r="6" fill="#f68"/></g></svg></div>` },
    { sep: true },
    { id: "instagram", label: "Instagram", type: "link", url: "https://instagram.com",
      icon: `<div class="dock-icon" style="background:linear-gradient(45deg,#feda75,#d62976 50%,#4f5bd5)"><svg viewBox="0 0 48 48"><rect x="10" y="10" width="28" height="28" rx="9" fill="none" stroke="#fff" stroke-width="3"/><circle cx="24" cy="24" r="7" fill="none" stroke="#fff" stroke-width="3"/><circle cx="33" cy="15" r="2.4" fill="#fff"/></svg></div>` },
    { id: "x", label: "X", type: "link", url: "https://x.com",
      icon: `<div class="dock-icon" style="background:#000"><svg viewBox="0 0 48 48"><path d="M13 12l9 12-10 12h4l8-9 7 9h8L28 22l10-10h-4l-8 8-6-8z" fill="#fff"/></svg></div>` },
    { id: "behance", label: "Behance", type: "link", url: "https://behance.net",
      icon: `<div class="dock-icon" style="background:#1769ff"><svg viewBox="0 0 48 48"><text x="24" y="31" font-size="20" font-weight="800" fill="#fff" text-anchor="middle" font-family="Arial">Bē</text></svg></div>` },
  ];

  /* ---------- window manager ---------- */
  let zTop = 100;
  const windows = new Map(); // key -> {node, iconEl, dockRunning}

  const desktop = $("#desktop");
  const windowLayer = $("#windowLayer");
  const dockEl = $("#dock");

  function focusWindow(win) {
    zTop += 1;
    win.style.zIndex = zTop;
    document.querySelectorAll(".window").forEach((w) => w.classList.toggle("focused", w === win));
  }

  function openApp(cfg) {
    const key = cfg.key || cfg.id;
    if (windows.has(key)) {
      const w = windows.get(key).node;
      if (w.dataset.min === "1") restoreWindow(w);
      focusWindow(w);
      return;
    }
    const win = buildWindow(cfg);
    windowLayer.appendChild(win);
    windows.set(key, { node: win });
    focusWindow(win);
    markDockRunning(cfg.dockId || cfg.id, true);
  }

  function buildWindow(cfg) {
    const win = el("div", "window");
    win.dataset.key = cfg.key || cfg.id;
    const w = cfg.w || 560, h = cfg.h || 420;
    win.style.width = w + "px";
    win.style.height = h + "px";
    // cascade placement, centered-ish
    const openCount = windows.size;
    win.style.left = clamp(window.innerWidth / 2 - w / 2 + (openCount % 5) * 26 - 40, 12, window.innerWidth - w - 12) + "px";
    win.style.top = clamp(90 + (openCount % 5) * 26, 34, window.innerHeight - h - 80) + "px";

    const bar = el("div", "titlebar");
    bar.innerHTML = `
      <div class="traffic">
        <button class="close" title="Fermer"><svg viewBox="0 0 8 8"><path d="M1 1l6 6M7 1L1 7" stroke="#4d0000" stroke-width="1.4" stroke-linecap="round"/></svg></button>
        <button class="min" title="Réduire"><svg viewBox="0 0 8 8"><path d="M1 4h6" stroke="#5a3d00" stroke-width="1.6" stroke-linecap="round"/></svg></button>
        <button class="zoom" title="Plein écran"><svg viewBox="0 0 8 8"><path d="M2 5V2h3M6 3v3H3" stroke="#003d0a" stroke-width="1.2" fill="none"/></svg></button>
      </div>
      <div class="win-title">${cfg.title}</div>
      <div class="win-spacer"></div>`;
    win.appendChild(bar);

    const body = el("div", "win-body");
    body.innerHTML = cfg.content;
    win.appendChild(body);

    // resize handles
    ["e", "s", "w", "se"].forEach((dir) => {
      const h = el("div", "resize-handle " + dir);
      win.appendChild(h);
      makeResizable(win, h, dir);
    });

    // traffic actions
    $(".close", bar).addEventListener("click", () => closeWindow(win));
    $(".min", bar).addEventListener("click", () => minimizeWindow(win, cfg));
    $(".zoom", bar).addEventListener("click", () => toggleMaximize(win));
    bar.addEventListener("dblclick", (e) => { if (!e.target.closest("button")) toggleMaximize(win); });

    win.addEventListener("pointerdown", () => focusWindow(win), true);
    makeDraggable(win, bar);
    return win;
  }

  function closeWindow(win) {
    win.classList.add("closing");
    const key = win.dataset.key;
    setTimeout(() => {
      win.remove();
      windows.delete(key);
      // dock running state: any other window for same dock id?
      const dockId = key.split(":")[0];
      const stillOpen = [...windows.keys()].some((k) => k.split(":")[0] === dockId);
      if (!stillOpen) markDockRunning(dockId, false);
    }, 190);
  }

  function minimizeWindow(win, cfg) {
    win.dataset.min = "1";
    win.dataset.prevZ = win.style.zIndex;
    win.classList.add("minimizing");
    setTimeout(() => { win.style.visibility = "hidden"; win.classList.remove("minimizing"); }, 400);
  }
  function restoreWindow(win) {
    win.dataset.min = "0";
    win.style.visibility = "visible";
    win.style.animation = "winOpen 0.3s cubic-bezier(0.32,0.72,0,1)";
    setTimeout(() => (win.style.animation = ""), 320);
  }

  function toggleMaximize(win) {
    if (win.dataset.max === "1") {
      win.dataset.max = "0";
      win.classList.remove("maximized");
      const p = JSON.parse(win.dataset.prevRect);
      Object.assign(win.style, { left: p.left, top: p.top, width: p.width, height: p.height });
    } else {
      win.dataset.max = "1";
      win.dataset.prevRect = JSON.stringify({ left: win.style.left, top: win.style.top, width: win.style.width, height: win.style.height });
      win.classList.add("maximized");
      Object.assign(win.style, { left: "0px", top: "26px", width: "100vw", height: "calc(100vh - 26px - " + 72 + "px)" });
    }
  }

  /* ---------- dragging (pointer events) ---------- */
  function makeDraggable(win, handle) {
    let sx, sy, ox, oy, active = false;
    handle.addEventListener("pointerdown", (e) => {
      if (e.target.closest("button") || win.dataset.max === "1") return;
      active = true;
      sx = e.clientX; sy = e.clientY;
      ox = win.offsetLeft; oy = win.offsetTop;
      handle.setPointerCapture(e.pointerId);
      document.body.classList.add("grabbing");
    });
    handle.addEventListener("pointermove", (e) => {
      if (!active) return;
      const nx = ox + (e.clientX - sx);
      const ny = oy + (e.clientY - sy);
      win.style.left = clamp(nx, -win.offsetWidth + 80, window.innerWidth - 80) + "px";
      win.style.top = clamp(ny, 26, window.innerHeight - 40) + "px";
    });
    const end = (e) => { if (!active) return; active = false; document.body.classList.remove("grabbing"); try { handle.releasePointerCapture(e.pointerId); } catch (_) {} };
    handle.addEventListener("pointerup", end);
    handle.addEventListener("pointercancel", end);
  }

  function makeResizable(win, handle, dir) {
    let sx, sy, ow, oh, ol, active = false;
    handle.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
      if (win.dataset.max === "1") return;
      active = true; sx = e.clientX; sy = e.clientY;
      ow = win.offsetWidth; oh = win.offsetHeight; ol = win.offsetLeft;
      handle.setPointerCapture(e.pointerId);
    });
    handle.addEventListener("pointermove", (e) => {
      if (!active) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (dir.includes("e")) win.style.width = Math.max(340, ow + dx) + "px";
      if (dir.includes("s")) win.style.height = Math.max(220, oh + dy) + "px";
      if (dir.includes("w")) {
        const nw = Math.max(340, ow - dx);
        win.style.width = nw + "px";
        win.style.left = ol + (ow - nw) + "px";
      }
    });
    const end = (e) => { active = false; try { handle.releasePointerCapture(e.pointerId); } catch (_) {} };
    handle.addEventListener("pointerup", end);
    handle.addEventListener("pointercancel", end);
  }

  /* ---------- content builders ---------- */
  function pieceContent(p) {
    const art = p.photo
      ? `<div style="position:absolute;inset:0;background:linear-gradient(140deg,${p.art[0]},${p.art[1]});filter:grayscale(.2)"></div>`
      : `<div style="position:absolute;inset:0;background:radial-gradient(70% 90% at 50% 30%,${p.art[0]},${p.art[1]})"></div>`;
    const centerGlyph = p.icon ? `<div style="position:relative;width:70px;height:70px;opacity:.9">${p.icon}</div>` : "";
    return `<div class="piece">
      <div class="piece-art">${art}<div class="grain"></div>${centerGlyph}</div>
      <div class="piece-meta">
        <h2>${p.label}</h2>
        <div class="fr">${p.fr}</div>
        <p>${p.desc}</p>
        <div class="piece-tags">${p.tags.map((t) => `<span>${t}</span>`).join("")}</div>
      </div>
    </div>`;
  }

  function finderContent() {
    const files = PIECES.map((p) => {
      const tile = p.photo
        ? `<div class="ff-tile photo">${photoThumb(p.photo[0], p.photo[1], p.id)}</div>`
        : `<div class="ff-tile" style="background:linear-gradient(160deg,${p.c1},${p.c2})">${p.icon}</div>`;
      return `<div class="finder-file" data-open="${p.id}">${tile}<span>${p.label}</span></div>`;
    }).join("");
    return `<div class="finder">
      <aside class="finder-side">
        <h4>Favoris</h4>
        <button class="active"><span class="dot" style="background:#4aa8ff"></span>Œuvres</button>
        <button><span class="dot" style="background:#ffb02e"></span>Récents</button>
        <button><span class="dot" style="background:#39d98a"></span>Bureau</button>
        <h4>Tags</h4>
        <button><span class="dot" style="background:#ff5f57"></span>Silence</button>
        <button><span class="dot" style="background:#a56bff"></span>Portraits</button>
      </aside>
      <div class="finder-main">${files}</div>
    </div>`;
  }

  function notesContent() {
    return `<textarea class="note-area" spellcheck="false" placeholder="Écrivez quelque chose de silencieux…">Silence — carnet

• Le vide n'est pas l'absence, c'est une présence retenue.
• Cadrer le rien demande plus de patience que cadrer le tout.
• « Là où dort l'eau », revenir au petit matin.

Cliquez pour éditer. Vos notes restent dans cette fenêtre.</textarea>`;
  }

  function aboutContent() {
    return `<div class="about-hero">
      <svg class="glyph" viewBox="0 0 100 100"><circle cx="50" cy="50" r="30" fill="none" stroke="#fff" stroke-width="4"/><circle cx="50" cy="50" r="4" fill="#fff"/></svg>
      <h2>Silence</h2>
      <div class="sub">Bureau créatif · Édition 2026</div>
    </div>
    <div class="about-rows">
      <div class="about-row"><span>Version</span><span>1.0 (build 8f00)</span></div>
      <div class="about-row"><span>Œuvres</span><span>6 pièces</span></div>
      <div class="about-row"><span>Moteur</span><span>HTML · CSS · JS</span></div>
      <div class="about-row"><span>Interactions</span><span>Glisser · Fenêtres · Dock</span></div>
      <div class="about-row"><span>Auteur</span><span>Studio Silence</span></div>
    </div>
    <div class="pad" style="padding-top:6px">
      <p style="text-align:center;color:rgba(255,255,255,.5);font-size:12.5px">Double-cliquez une icône du bureau pour ouvrir une œuvre. Glissez les fenêtres, réduisez-les dans le Dock, ou passez la souris sur le Dock pour la magnification.</p>
    </div>`;
  }

  /* ---------- routing to app content ---------- */
  function openPiece(id) {
    const p = PIECES.find((x) => x.id === id);
    if (!p) return;
    openApp({ key: "piece:" + id, dockId: "finder", title: p.label, content: pieceContent(p), w: 560, h: 460 });
  }

  function launchDock(item) {
    if (item.type === "link") { window.open(item.url, "_blank", "noopener"); bounceDock(item.id); return; }
    if (item.type === "finder")
      openApp({ key: item.id, dockId: item.id, title: item.label, content: finderContent(), w: 640, h: 440 });
    else if (item.type === "notes")
      openApp({ key: item.id, dockId: item.id, title: item.label, content: notesContent(), w: 460, h: 420 });
  }

  /* ============================================================
     RENDER: desktop icons
     ============================================================ */
  const iconField = $("#iconField");
  function renderIcons() {
    iconField.innerHTML = "";
    PIECES.forEach((p) => {
      const icon = el("div", "icon drag-target");
      icon.dataset.id = p.id;
      icon.style.left = p.x + "px";
      icon.style.top = p.y + "px";
      const tile = p.photo
        ? `<div class="icon-tile photo">${photoThumb(p.photo[0], p.photo[1], p.id)}</div>`
        : `<div class="icon-tile" style="background:linear-gradient(160deg,${p.c1},${p.c2})">${p.icon}</div>`;
      icon.innerHTML = `${tile}<div class="icon-label">${p.label}</div>`;
      iconField.appendChild(icon);
      makeIconInteractive(icon, p);
    });
  }

  function makeIconInteractive(icon, p) {
    let sx, sy, ox, oy, moved = false, active = false;
    icon.addEventListener("pointerdown", (e) => {
      active = true; moved = false;
      sx = e.clientX; sy = e.clientY; ox = icon.offsetLeft; oy = icon.offsetTop;
      document.querySelectorAll(".icon.selected").forEach((i) => i.classList.remove("selected"));
      icon.classList.add("selected");
      icon.style.zIndex = ++zTop;
      icon.setPointerCapture(e.pointerId);
    });
    icon.addEventListener("pointermove", (e) => {
      if (!active) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (!moved && Math.hypot(dx, dy) > 4) { moved = true; document.body.classList.add("grabbing"); }
      if (moved) {
        icon.style.left = clamp(ox + dx, 0, iconField.clientWidth - icon.offsetWidth) + "px";
        icon.style.top = clamp(oy + dy, 0, iconField.clientHeight - icon.offsetHeight) + "px";
      }
    });
    const end = (e) => {
      if (!active) return;
      active = false; document.body.classList.remove("grabbing");
      try { icon.releasePointerCapture(e.pointerId); } catch (_) {}
      if (moved) { p.x = icon.offsetLeft; p.y = icon.offsetTop; }
    };
    icon.addEventListener("pointerup", end);
    icon.addEventListener("pointercancel", end);
    icon.addEventListener("dblclick", () => openPiece(p.id));
  }

  /* ============================================================
     RENDER: dock + magnification
     ============================================================ */
  function renderDock() {
    dockEl.innerHTML = "";
    DOCK.forEach((item) => {
      if (item.sep) { dockEl.appendChild(el("li", "dock-sep")); return; }
      const li = el("li", "dock-item");
      li.dataset.id = item.id;
      li.innerHTML = `${item.icon}<span class="tip">${item.label}</span>`;
      li.addEventListener("click", () => launchDock(item));
      dockEl.appendChild(li);
    });
    initDockMagnify();
  }

  function markDockRunning(id, on) {
    const li = dockEl.querySelector(`.dock-item[data-id="${id}"]`);
    if (li) li.classList.toggle("running", on);
  }
  function bounceDock(id) {
    const li = dockEl.querySelector(`.dock-item[data-id="${id}"]`);
    if (!li) return;
    li.classList.remove("bounce"); void li.offsetWidth; li.classList.add("bounce");
    setTimeout(() => li.classList.remove("bounce"), 750);
  }

  function initDockMagnify() {
    const items = [...dockEl.querySelectorAll(".dock-item")];
    const BASE = 48, MAX = 74, RANGE = 130;
    dockEl.addEventListener("pointermove", (e) => {
      items.forEach((it) => {
        const r = it.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const d = Math.abs(e.clientX - cx);
        const scale = d > RANGE ? 0 : Math.cos((d / RANGE) * (Math.PI / 2));
        const size = BASE + (MAX - BASE) * scale;
        it.style.width = size + "px";
        it.style.height = size + "px";
      });
    });
    dockEl.addEventListener("pointerleave", () => {
      items.forEach((it) => { it.style.width = BASE + "px"; it.style.height = BASE + "px"; });
    });
  }

  /* ============================================================
     Menu bar dropdowns
     ============================================================ */
  const MENUS = {
    app: [ { l: "À propos de Silence", a: () => openApp({ key: "about", dockId: "finder", title: "À propos", content: aboutContent(), w: 460, h: 540 }) }, "sep",
           { l: "Préférences…", k: "⌘," }, "sep", { l: "Masquer Silence", k: "⌘H" }, { l: "Quitter", k: "⌘Q" } ],
    file: [ { l: "Nouvelle note", a: () => launchDock(DOCK.find(d=>d.id==="notes")) }, { l: "Nouvelle fenêtre Finder", k: "⌘N", a: () => launchDock(DOCK[0]) }, "sep", { l: "Fermer", k: "⌘W", a: closeTop } ],
    edit: [ { l: "Annuler", k: "⌘Z" }, { l: "Rétablir", k: "⇧⌘Z" }, "sep", { l: "Couper", k: "⌘X" }, { l: "Copier", k: "⌘C" }, { l: "Coller", k: "⌘V" } ],
    view: [ { l: "Ranger les icônes", a: cleanIcons }, { l: "Changer le fond d'écran", a: cycleWallpaper }, "sep", { l: "Activer le plein écran", k: "⌃⌘F", a: goFullscreen } ],
    window: [ { l: "Réduire", k: "⌘M", a: () => { const w = topWindow(); if (w) minimizeWindow(w); } }, { l: "Zoom", a: () => { const w = topWindow(); if (w) toggleMaximize(w); } }, "sep", { l: "Tout fermer", a: () => windows.forEach((v) => closeWindow(v.node)) } ],
    help: [ { l: "Aide de Silence", a: () => openApp({ key: "about", dockId: "finder", title: "À propos", content: aboutContent(), w: 460, h: 540 }) } ],
  };
  const dropdown = $("#dropdown");
  let openMenuBtn = null;

  function topWindow() {
    let top = null, z = -1;
    windows.forEach((v) => { if (v.node.dataset.min !== "1") { const zi = +v.node.style.zIndex || 0; if (zi > z) { z = zi; top = v.node; } } });
    return top;
  }
  function closeTop() { const w = topWindow(); if (w) closeWindow(w); }

  function openMenu(btn) {
    const key = btn.dataset.menu;
    const items = MENUS[key];
    if (!items) return;
    dropdown.innerHTML = items.map((it) =>
      it === "sep" ? `<div class="sep"></div>`
        : `<button data-idx="${items.indexOf(it)}">${it.l}${it.k ? `<span>${it.k}</span>` : ""}</button>`
    ).join("");
    dropdown.style.left = btn.getBoundingClientRect().left + "px";
    dropdown.hidden = false;
    document.querySelectorAll(".menu-item.open").forEach((m) => m.classList.remove("open"));
    btn.classList.add("open");
    openMenuBtn = btn;
    dropdown.querySelectorAll("button").forEach((b) => {
      const it = items[+b.dataset.idx];
      b.addEventListener("click", () => { closeMenu(); if (it.a) it.a(); });
    });
  }
  function closeMenu() {
    dropdown.hidden = true;
    if (openMenuBtn) openMenuBtn.classList.remove("open");
    openMenuBtn = null;
  }

  document.querySelectorAll(".menu-item[data-menu], .menu-item.apple").forEach((btn) => {
    const key = btn.classList.contains("apple") ? "app" : btn.dataset.menu;
    btn.dataset.menu = key;
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (openMenuBtn === btn) { closeMenu(); return; }
      openMenu(btn);
    });
    btn.addEventListener("pointerenter", () => { if (openMenuBtn && openMenuBtn !== btn) openMenu(btn); });
  });

  /* ============================================================
     Context menu, wallpaper, clean, fullscreen
     ============================================================ */
  const ctx = $("#contextMenu");
  iconField.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    ctx.style.left = clamp(e.clientX, 4, window.innerWidth - 210) + "px";
    ctx.style.top = clamp(e.clientY, 30, window.innerHeight - 180) + "px";
    ctx.hidden = false;
  });
  ctx.addEventListener("click", (e) => {
    const act = e.target.dataset.act;
    if (!act) return;
    ctx.hidden = true;
    if (act === "new-note") launchDock(DOCK.find((d) => d.id === "notes"));
    else if (act === "clean") cleanIcons();
    else if (act === "wallpaper") cycleWallpaper();
    else if (act === "about") openApp({ key: "about", dockId: "finder", title: "À propos", content: aboutContent(), w: 460, h: 540 });
  });

  function cleanIcons() {
    const cols = 1, startX = window.innerWidth - 110, gapY = 108;
    PIECES.forEach((p, i) => {
      p.x = startX; p.y = 20 + i * gapY;
      const node = iconField.querySelector(`.icon[data-id="${p.id}"]`);
      if (node) { node.style.transition = "left .35s ease, top .35s ease"; node.style.left = p.x + "px"; node.style.top = p.y + "px"; setTimeout(() => (node.style.transition = "transform .12s ease"), 360); }
    });
  }
  let wall = 0;
  function cycleWallpaper() { wall = (wall + 1) % 4; if (wall === 0) desktop.removeAttribute("data-wall"); else desktop.dataset.wall = wall; }
  function goFullscreen() { if (!document.fullscreenElement) document.documentElement.requestFullscreen?.(); else document.exitFullscreen?.(); }

  /* ---------- global click: dismiss overlays & selection ---------- */
  document.addEventListener("pointerdown", (e) => {
    if (!e.target.closest(".dropdown") && !e.target.closest(".menu-item")) closeMenu();
    if (!e.target.closest(".context-menu") && !e.target.closest(".icon")) ctx.hidden = true;
    if (!e.target.closest(".icon") && !e.target.closest(".dropdown")) document.querySelectorAll(".icon.selected").forEach((i) => i.classList.remove("selected"));
  });

  /* ---------- keyboard shortcuts ---------- */
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "w") { e.preventDefault(); closeTop(); }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "m") { e.preventDefault(); const w = topWindow(); if (w) minimizeWindow(w); }
    if (e.key === "Escape") { closeMenu(); ctx.hidden = true; }
  });

  /* ============================================================
     Clock
     ============================================================ */
  const clockEl = $("#clock");
  const DAYS = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];
  const MON = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
  function tick() {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    clockEl.textContent = `${DAYS[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]}  ${hh}:${mm}`;
  }
  tick(); setInterval(tick, 10000);

  /* ============================================================
     Boot
     ============================================================ */
  renderIcons();
  renderDock();
  const boot = $("#boot");
  setTimeout(() => {
    boot.classList.add("hidden");
    desktop.classList.remove("hidden");
    // welcome window
    openApp({ key: "about", dockId: "finder", title: "Bienvenue sur Silence", content: aboutContent(), w: 460, h: 540 });
  }, 2700);

  // keep windows on-screen on resize
  window.addEventListener("resize", () => {
    windows.forEach((v) => {
      const w = v.node;
      if (w.dataset.max === "1") return;
      w.style.left = clamp(w.offsetLeft, -w.offsetWidth + 80, window.innerWidth - 80) + "px";
      w.style.top = clamp(w.offsetTop, 26, window.innerHeight - 40) + "px";
    });
  });
})();
