/* Inkpane — sign PDFs in the browser. pdf.js renders, pdf-lib writes; nothing leaves the device. */
(() => {
  const VERSION = "1.0.1"; // keep in step with CACHE_VERSION in sw.js
  const { t } = I18N;
  const $ = s => document.querySelector(s);
  const LS_SIG = "inkpane.signature.v1";
  const LS_REMEMBER = "inkpane.remember";
  const state = { bytes: null, name: "", pdf: null, pages: [], items: [], sel: null, pending: null, sig: null, sample: false, userFile: false, renderToken: 0, lastWidth: 0 };
  let nextId = 1;

  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("vendor/pdfjs-3.11.174/pdf.worker.min.js", document.baseURI).href;
  const STD_FONTS = new URL("vendor/pdfjs-3.11.174/standard_fonts/", document.baseURI).href;

  // ---------- helpers ----------
  let toastTimer;
  function toast(msg, ms = 3200) {
    const el = $("#toast"); el.textContent = msg; el.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { el.hidden = true; }, ms);
  }
  const lsGet = k => { try { return localStorage.getItem(k); } catch { return null; } };
  const lsSet = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch {} };
  const dateLocale = () => (navigator.languages || []).find(l => l.toLowerCase().startsWith(I18N.lang)) || I18N.locale;
  const today = () => new Date().toLocaleDateString(dateLocale(), { day: "2-digit", month: "2-digit", year: "numeric" });
  function hexToRgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; }

  // ---------- PDF loading & rendering ----------
  async function loadPdf(bytes, name, sample, keepItems = false) {
    try {
      const pdf = await pdfjsLib.getDocument({ data: bytes.slice(0), standardFontDataUrl: STD_FONTS }).promise;
      if (state.pdf) state.pdf.destroy();
      Object.assign(state, { pdf, bytes, name, sample });
      if (!keepItems) Object.assign(state, { items: [], sel: null });
      $("#fileName").textContent = sample ? t("sampleBase") + ".pdf" : name;
      $("#banner").hidden = !sample;
      await renderPages();
    } catch (e) {
      console.error(e);
      toast(e && e.name === "PasswordException" ? t("pwdProtected") : t("unreadable"));
    }
    refreshUi();
  }

  async function renderPages() {
    const token = ++state.renderToken;
    const host = $("#pages");
    const avail = Math.max(260, $("#viewer").clientWidth - 40);
    state.lastWidth = $("#viewer").clientWidth;
    const frag = [], pages = [];
    for (let i = 1; i <= state.pdf.numPages; i++) {
      const p = await state.pdf.getPage(i);
      if (token !== state.renderToken) return;
      const vp1 = p.getViewport({ scale: 1 });
      const scale = Math.min(1.6, avail / vp1.width);
      const dpr = window.devicePixelRatio || 1;
      const wrap = document.createElement("div");
      wrap.className = "page";
      wrap.style.width = vp1.width * scale + "px";
      wrap.style.height = vp1.height * scale + "px";
      const c = document.createElement("canvas");
      c.width = Math.floor(vp1.width * scale * dpr); c.height = Math.floor(vp1.height * scale * dpr);
      c.style.width = "100%"; c.style.height = "100%";
      const layer = document.createElement("div"); layer.className = "layer";
      const num = document.createElement("span"); num.className = "num"; num.dataset.i = i;
      num.textContent = t("pageNum", { i, n: state.pdf.numPages });
      wrap.append(c, layer, num);
      const idx = i - 1;
      wrap.addEventListener("pointerdown", e => onPagePointer(e, idx));
      pages.push({ wrap, layer, scale, w: vp1.width, h: vp1.height, rotate: p.rotate });
      frag.push(wrap);
      await p.render({ canvasContext: c.getContext("2d"), viewport: p.getViewport({ scale: scale * dpr }) }).promise;
      if (token !== state.renderToken) return;
    }
    host.replaceChildren(...frag);
    state.pages = pages;
    drawItems();
    if (pages.some(p => p.rotate)) toast(t("rotated"));
  }

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      sizePad();
      if (state.pdf && Math.abs($("#viewer").clientWidth - state.lastWidth) > 30) renderPages();
    }, 200);
  });

  // ---------- items on pages ----------
  function drawItems() {
    state.pages.forEach(p => p.layer.replaceChildren());
    for (const it of state.items) { const pg = state.pages[it.page]; if (pg) pg.layer.append(makeItemEl(it)); }
    refreshUi();
  }

  function positionEl(el, it) {
    const s = state.pages[it.page].scale;
    el.style.left = it.x * s + "px"; el.style.top = it.y * s + "px";
    if (it.type === "img") { el.style.width = it.w * s + "px"; el.style.height = it.h * s + "px"; }
    else el.firstChild.style.fontSize = it.size * s + "px";
  }

  function makeItemEl(it) {
    const el = document.createElement("div");
    el.className = "item" + (it.id === state.sel ? " sel" : "");
    el.dataset.id = it.id;
    if (it.type === "img") { const im = new Image(); im.src = it.src; im.alt = ""; im.draggable = false; el.append(im); }
    else { const s = document.createElement("span"); s.textContent = it.text; s.style.color = it.color; el.append(s); }
    const h = document.createElement("div"); h.className = "h";
    const del = document.createElement("button"); del.className = "del"; del.textContent = t("remove"); del.type = "button";
    del.addEventListener("pointerdown", e => e.stopPropagation());
    del.addEventListener("click", e => { e.stopPropagation(); removeItem(it.id); });
    el.append(h, del);
    positionEl(el, it);
    el.addEventListener("pointerdown", e => startDrag(e, it, el, e.target === h ? "resize" : "move"));
    return el;
  }

  function select(id) {
    state.sel = id;
    document.querySelectorAll(".item").forEach(el => el.classList.toggle("sel", Number(el.dataset.id) === id));
  }
  function removeItem(id) {
    state.items = state.items.filter(i => i.id !== id);
    if (state.sel === id) state.sel = null;
    drawItems();
  }

  function startDrag(e, it, el, mode) {
    if (e.button !== 0) return;
    e.stopPropagation(); e.preventDefault();
    select(it.id);
    const pg = state.pages[it.page], s = pg.scale;
    const sx = e.clientX, sy = e.clientY;
    const o = { x: it.x, y: it.y, w: it.w, h: it.h, size: it.size, pxW: el.offsetWidth };
    el.setPointerCapture(e.pointerId);
    el.style.cursor = mode === "move" ? "grabbing" : "nwse-resize";
    const move = ev => {
      const dx = (ev.clientX - sx) / s, dy = (ev.clientY - sy) / s;
      if (mode === "move") {
        const w = it.type === "img" ? it.w : el.offsetWidth / s, h = it.type === "img" ? it.h : it.size;
        it.x = Math.min(Math.max(o.x + dx, -w / 2), pg.w - w / 2);
        it.y = Math.min(Math.max(o.y + dy, -h / 2), pg.h - h / 2);
      } else if (it.type === "img") {
        it.w = Math.max(20, o.w + dx); it.h = it.w * o.h / o.w;
      } else {
        it.size = Math.round(Math.min(72, Math.max(5, o.size * (o.pxW + dx * s) / o.pxW)) * 2) / 2;
      }
      positionEl(el, it);
    };
    const up = () => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerup", up); el.removeEventListener("pointercancel", up); el.style.cursor = ""; };
    el.addEventListener("pointermove", move); el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up);
  }

  function onPagePointer(e, pageIdx) {
    if (e.target.closest(".item")) return;
    const pg = state.pages[pageIdx];
    if (!state.pending) { select(null); return; }
    const r = pg.wrap.getBoundingClientRect();
    const px = (e.clientX - r.left) / pg.scale, py = (e.clientY - r.top) / pg.scale;
    const p = state.pending; let it;
    if (p.type === "img") {
      let w = 150, h = w * p.h / p.w;
      if (h > 60) { h = 60; w = h * p.w / p.h; }
      it = { id: nextId++, page: pageIdx, type: "img", src: p.src, x: px - w / 2, y: py - h * 0.75, w, h };
    } else {
      it = { id: nextId++, page: pageIdx, type: "text", text: p.text, size: p.size, color: "#111418", x: px, y: py - p.size * 0.85 };
    }
    state.items.push(it); state.sel = it.id;
    setPending(null);
    drawItems();
  }

  function hintText(p) { return (p.type === "img" ? t("hintSig") : t("hintTxt")) + " · " + t("escCancel"); }
  function setPending(p) {
    if (p && !state.pdf) { toast(t("openFirst")); return; }
    state.pending = p;
    $("#viewer").classList.toggle("placing", !!p);
    $("#hint").hidden = !p;
    if (p) $("#hint").textContent = hintText(p);
  }

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") setPending(null);
    if ((e.key === "Delete" || e.key === "Backspace") && state.sel != null && !/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) {
      e.preventDefault(); removeItem(state.sel);
    }
  });

  function refreshUi() {
    $("#saveBtn").disabled = !state.pdf || state.items.length === 0;
  }

  // ---------- export ----------
  async function buildSignedPdf() {
    const { PDFDocument, StandardFonts, rgb } = PDFLib;
    const doc = await PDFDocument.load(state.bytes.slice(0));
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const cache = new Map();
    for (const it of state.items) {
      const page = doc.getPage(it.page);
      const cb = page.getCropBox(); const x0 = cb.x, top = cb.y + cb.height;
      if (it.type === "img") {
        let img = cache.get(it.src);
        if (!img) { img = await doc.embedPng(it.src); cache.set(it.src, img); }
        page.drawImage(img, { x: x0 + it.x, y: top - it.y - it.h, width: it.w, height: it.h });
      } else {
        const [r, g, b] = hexToRgb(it.color);
        page.drawText(it.text, { x: x0 + it.x, y: top - it.y - it.size * 0.85, size: it.size, font, color: rgb(r, g, b) });
      }
    }
    return doc.save();
  }

  function downloadBlob(blob, filename) {
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename;
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }

  async function exportPdf() {
    const btn = $("#saveBtn"); btn.disabled = true;
    const base = (state.sample ? t("sampleBase") : state.name.replace(/\.pdf$/i, "")) || t("defaultBase");
    const filename = base + t("signedSuffix") + ".pdf";
    try {
      // Ask for the destination first, while the click still counts as a user gesture.
      let handle = null;
      if (typeof window.showSaveFilePicker === "function") {
        try {
          handle = await window.showSaveFilePicker({ suggestedName: filename, types: [{ description: "PDF", accept: { "application/pdf": [".pdf"] } }] });
        } catch (err) {
          if (err && err.name === "AbortError") { toast(t("saveCancelled")); return; }
          handle = null; // picker not allowed here: fall back to a plain download
        }
      }
      const out = await buildSignedPdf();
      const blob = new Blob([out], { type: "application/pdf" });
      if (handle) {
        const w = await handle.createWritable(); await w.write(blob); await w.close();
        toast(t("saved"));
      } else {
        downloadBlob(blob, filename);
        toast(t("ready"));
      }
    } catch (err) {
      console.error(err);
      toast(/WinAnsi/.test(String(err)) ? t("badChars") : t("exportError"));
    } finally { refreshUi(); }
  }
  $("#saveBtn").addEventListener("click", exportPdf);

  // ---------- open files ----------
  async function openFile(f) {
    if (!f) return;
    if (/\.(xlsx?|xlsm|csv|docx?)$/i.test(f.name)) { toast(t("officeFile"), 5000); return; }
    if (!/\.pdf$/i.test(f.name) && f.type !== "application/pdf") { toast(t("notPdf")); return; }
    state.userFile = true;
    const bytes = new Uint8Array(await f.arrayBuffer());
    await loadPdf(bytes, f.name, false);
  }
  $("#pdfInput").addEventListener("change", e => { openFile(e.target.files[0]); e.target.value = ""; });
  const viewer = $("#viewer");
  viewer.addEventListener("dragover", e => { if ([...e.dataTransfer.types].includes("Files")) { e.preventDefault(); viewer.classList.add("dropping"); } });
  viewer.addEventListener("dragleave", e => { if (e.target === viewer) viewer.classList.remove("dropping"); });
  viewer.addEventListener("drop", e => { e.preventDefault(); viewer.classList.remove("dropping"); openFile(e.dataTransfer.files[0]); });

  // Installed app opened from Explorer "Open with" (manifest file_handlers).
  if ("launchQueue" in window) {
    window.launchQueue.setConsumer(async params => {
      if (!params.files || !params.files.length) return;
      try { openFile(await params.files[0].getFile()); } catch (e) { console.error(e); toast(t("unreadable")); }
    });
  }

  // ---------- signature pad ----------
  const pad = $("#pad"), pctx = pad.getContext("2d");
  let strokes = [], cur = null, penColor = "#1d3a9e";
  function sizePad() {
    const r = pad.getBoundingClientRect(); if (!r.width) return;
    const d = window.devicePixelRatio || 1;
    pad.width = Math.round(r.width * d); pad.height = Math.round(r.height * d);
    pctx.setTransform(d, 0, 0, d, 0, 0); redrawPad();
  }
  function drawStrokes(ctx, list) {
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    for (const s of list) {
      const p = s.pts; ctx.strokeStyle = s.color; ctx.fillStyle = s.color; ctx.lineWidth = s.width;
      if (p.length === 1) { ctx.beginPath(); ctx.arc(p[0][0], p[0][1], s.width / 2, 0, Math.PI * 2); ctx.fill(); continue; }
      ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]);
      for (let i = 1; i < p.length - 1; i++) ctx.quadraticCurveTo(p[i][0], p[i][1], (p[i][0] + p[i + 1][0]) / 2, (p[i][1] + p[i + 1][1]) / 2);
      ctx.lineTo(p[p.length - 1][0], p[p.length - 1][1]); ctx.stroke();
    }
  }
  function redrawPad() { pctx.clearRect(0, 0, pad.width, pad.height); drawStrokes(pctx, strokes); }
  const padPt = e => { const r = pad.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  pad.addEventListener("pointerdown", e => {
    pad.setPointerCapture(e.pointerId);
    cur = { color: penColor, width: Number($("#penW").value), pts: [padPt(e)] }; strokes.push(cur); redrawPad();
  });
  pad.addEventListener("pointermove", e => {
    if (!cur) return;
    const co = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
    const evs = co.length ? co : [e];
    for (const ce of evs) cur.pts.push(padPt(ce));
    redrawPad();
  });
  const endStroke = () => { cur = null; $("#padUse").disabled = strokes.length === 0; };
  pad.addEventListener("pointerup", endStroke); pad.addEventListener("pointercancel", endStroke);
  $("#padClear").addEventListener("click", () => { strokes = []; redrawPad(); endStroke(); });
  document.querySelectorAll(".swatch").forEach(b => b.addEventListener("click", () => {
    penColor = b.dataset.color;
    document.querySelectorAll(".swatch").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
  }));

  $("#padUse").addEventListener("click", () => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const s of strokes) for (const [x, y] of s.pts) {
      minX = Math.min(minX, x - s.width); minY = Math.min(minY, y - s.width);
      maxX = Math.max(maxX, x + s.width); maxY = Math.max(maxY, y + s.width);
    }
    const k = 4, pad2 = 4;
    const c = document.createElement("canvas");
    c.width = Math.ceil((maxX - minX + pad2 * 2) * k); c.height = Math.ceil((maxY - minY + pad2 * 2) * k);
    const ctx = c.getContext("2d"); ctx.scale(k, k); ctx.translate(-minX + pad2, -minY + pad2);
    drawStrokes(ctx, strokes);
    setSignature({ src: c.toDataURL("image/png"), w: c.width, h: c.height });
    toast(t("sigReady"));
  });

  // ---------- signature from image ----------
  $("#imgInput").addEventListener("change", async e => {
    const f = e.target.files[0]; e.target.value = ""; if (!f) return;
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      const sc = Math.min(1, 1400 / img.naturalWidth);
      const c = document.createElement("canvas"); c.width = Math.round(img.naturalWidth * sc); c.height = Math.round(img.naturalHeight * sc);
      const ctx = c.getContext("2d"); ctx.drawImage(img, 0, 0, c.width, c.height);
      const id = ctx.getImageData(0, 0, c.width, c.height), d = id.data;
      const rmWhite = $("#rmWhite").checked;
      let minX = c.width, minY = c.height, maxX = -1, maxY = -1;
      for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
        const i = (y * c.width + x) * 4;
        if (rmWhite) {
          const lum = (d[i] + d[i + 1] + d[i + 2]) / 3;
          if (lum > 225) d[i + 3] = 0; else if (lum > 165) d[i + 3] = Math.round(d[i + 3] * (225 - lum) / 60);
        }
        if (d[i + 3] > 20) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
      }
      URL.revokeObjectURL(url);
      if (maxX < 0) { toast(t("noSigInImage")); return; }
      ctx.putImageData(id, 0, 0);
      const out = document.createElement("canvas"); out.width = maxX - minX + 1; out.height = maxY - minY + 1;
      out.getContext("2d").drawImage(c, minX, minY, out.width, out.height, 0, 0, out.width, out.height);
      setSignature({ src: out.toDataURL("image/png"), w: out.width, h: out.height });
      toast(t("sigReady"));
    };
    img.onerror = () => { URL.revokeObjectURL(url); toast(t("imgUnreadable")); };
    img.src = url;
  });

  // ---------- current signature & "remember" ----------
  const remember = () => $("#remember").checked;
  function persistSig() { lsSet(LS_SIG, state.sig && remember() ? JSON.stringify(state.sig) : null); }
  function setSignature(sig) {
    state.sig = sig;
    $("#current").hidden = !sig;
    if (sig) $("#curImg").src = sig.src;
    persistSig();
  }
  $("#remember").addEventListener("change", () => { lsSet(LS_REMEMBER, remember() ? "1" : "0"); persistSig(); });
  $("#forgetSig").addEventListener("click", () => { setSignature(null); strokes = []; redrawPad(); endStroke(); toast(t("sigForgotten")); });
  $("#placeSig").addEventListener("click", () => state.sig && setPending({ type: "img", ...state.sig }));
  $("#placeTxt").addEventListener("click", () => {
    const text = $("#txt").value.trim(); if (!text) { toast(t("writeFirst")); return; }
    setPending({ type: "text", text, size: Number($("#txtSize").value) });
  });

  // On <user>.github.io the user site and every project site share one origin, so localStorage is shared too.
  function updateRememberNote() {
    const host = location.hostname;
    const shared = /\.github\.io$/i.test(host);
    $("#rememberNote").textContent = t("rememberNote") + (shared ? " " + t("rememberNoteShared", { host }) : "");
  }

  function setTab(draw) {
    $("#tabDraw").setAttribute("aria-selected", String(draw)); $("#tabImg").setAttribute("aria-selected", String(!draw));
    $("#drawPane").hidden = !draw; $("#imgPane").hidden = draw;
    if (draw) requestAnimationFrame(sizePad);
  }
  $("#tabDraw").addEventListener("click", () => setTab(true));
  $("#tabImg").addEventListener("click", () => setTab(false));

  // ---------- sample document ----------
  async function makeSample() {
    const { PDFDocument, StandardFonts, rgb } = PDFLib;
    const d = await PDFDocument.create(); const p = d.addPage([595.28, 841.89]);
    d.setTitle("Inkpane - " + t("sampleBase"));
    const f = await d.embedFont(StandardFonts.Helvetica), fb = await d.embedFont(StandardFonts.HelveticaBold);
    const ink = rgb(.11, .13, .19), grey = rgb(.45, .47, .52), rule = rgb(.8, .82, .86);
    const now = new Date(), ref = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    let month = ref.toLocaleDateString(I18N.locale, { month: "long", year: "numeric" });
    month = month.charAt(0).toUpperCase() + month.slice(1);
    const mm = String(ref.getMonth() + 1).padStart(2, "0");
    p.drawText(t("sTitle", { month }), { x: 50, y: 780, size: 20, font: fb, color: ink });
    p.drawText(t("sExample"), { x: 50, y: 760, size: 9, font: f, color: grey });
    const cols = [50, 120, 430, 545]; let y = 720;
    p.drawText(t("sDay"), { x: cols[0], y, size: 10, font: fb, color: ink });
    p.drawText(t("sActivity"), { x: cols[1], y, size: 10, font: fb, color: ink });
    p.drawText(t("sHours"), { x: cols[2] + 60, y, size: 10, font: fb, color: ink });
    p.drawLine({ start: { x: 50, y: y - 6 }, end: { x: 545, y: y - 6 }, thickness: 1, color: ink });
    const acts = t("sActs");
    let tot = 0;
    for (let i = 1; i <= 14; i++) {
      y -= 22; const h = i % 5 === 0 ? 4 : 8; tot += h;
      p.drawText(String(i).padStart(2, "0") + "/" + mm, { x: cols[0], y, size: 10, font: f, color: ink });
      p.drawText(acts[i % acts.length], { x: cols[1], y, size: 10, font: f, color: ink });
      p.drawText(String(h), { x: cols[2] + 66, y, size: 10, font: f, color: ink });
      p.drawLine({ start: { x: 50, y: y - 7 }, end: { x: 545, y: y - 7 }, thickness: .5, color: rule });
    }
    y -= 28; p.drawText(t("sTotal"), { x: cols[1], y, size: 11, font: fb, color: ink }); p.drawText(String(tot), { x: cols[2] + 62, y, size: 11, font: fb, color: ink });
    p.drawText(t("sDate"), { x: 50, y: 170, size: 10, font: f, color: grey });
    p.drawLine({ start: { x: 50, y: 145 }, end: { x: 220, y: 145 }, thickness: .8, color: ink });
    p.drawText(t("sSignature"), { x: 330, y: 170, size: 10, font: f, color: grey });
    p.drawLine({ start: { x: 330, y: 145 }, end: { x: 545, y: 145 }, thickness: .8, color: ink });
    return d.save();
  }
  async function showSample(keepItems) {
    const b = await makeSample();
    if (state.userFile) return; // a real PDF arrived meanwhile (e.g. via launchQueue)
    await loadPdf(new Uint8Array(b), "", true, keepItems);
  }

  // ---------- language ----------
  function applyLanguage(lang, persist) {
    const oldDate = today();
    I18N.set(lang, persist);
    $("#lang").value = I18N.lang;
    $("#viewer").dataset.dropLabel = t("dropHere");
    updateRememberNote();
    if ($("#txt").value === oldDate || !$("#txt").value) $("#txt").value = today();
    document.querySelectorAll(".page .num").forEach(n => { n.textContent = t("pageNum", { i: n.dataset.i, n: state.pdf ? state.pdf.numPages : "" }); });
    document.querySelectorAll(".item .del").forEach(b => { b.textContent = t("remove"); });
    if (state.pending) $("#hint").textContent = hintText(state.pending);
    if (state.pdf) $("#fileName").textContent = state.sample ? t("sampleBase") + ".pdf" : state.name;
  }
  $("#lang").addEventListener("change", e => {
    applyLanguage(e.target.value, true);
    if (state.sample && !state.userFile) showSample(true);
  });

  // ---------- PWA: service worker & install ----------
  let installEvt = null;
  window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); installEvt = e; $("#installBtn").hidden = false; });
  $("#installBtn").addEventListener("click", async () => {
    if (!installEvt) return;
    installEvt.prompt(); await installEvt.userChoice.catch(() => null);
    installEvt = null; $("#installBtn").hidden = true;
  });
  window.addEventListener("appinstalled", () => { $("#installBtn").hidden = true; });

  if ("serviceWorker" in navigator && window.isSecureContext) {
    const hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.register("sw.js").then(reg => {
      reg.addEventListener("updatefound", () => {
        const w = reg.installing; if (!w) return;
        w.addEventListener("statechange", () => {
          if (w.state === "activated") toast(hadController ? t("updated") : t("offlineReady"), 5000);
        });
      });
    }).catch(err => console.warn("Service worker not registered:", err));
  }

  // ---------- boot ----------
  $("#ver").textContent = "Inkpane " + VERSION;
  $("#remember").checked = lsGet(LS_REMEMBER) !== "0";
  applyLanguage(I18N.lang, false);
  $("#txt").value = today();
  setTab(true);
  const saved = lsGet(LS_SIG);
  if (saved && remember()) { try { const s = JSON.parse(saved); state.sig = s; $("#current").hidden = false; $("#curImg").src = s.src; } catch {} }
  showSample(false);
})();
