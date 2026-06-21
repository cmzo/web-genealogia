/**
 * lightbox.js — visor de imágenes reutilizable (el mismo de los posts del blog).
 * El CSS vive en styles.css (.lbx*). Inyecta el markup una vez y expone:
 *   window.openLightbox(src, captionHTML, { sans })   → abre una imagen
 * `sans:true` usa la tipografía sans (IBM Plex) en el pie en vez de la serif
 * editorial del blog — para la bitácora de la home.
 *
 * Si la página ya trae su propio #lbx (los posts lo inyectan en build), no hace nada.
 */
(function () {
  if (window.openLightbox || document.getElementById('lbx')) return;

  const root = document.createElement('div');
  root.innerHTML = `
    <div class="lbx" id="lbx" hidden>
      <div class="lbx-modal">
        <div class="lbx-stage" id="lbxStage">
          <img class="lbx-img" id="lbxImg" alt="">
          <button class="lbx-btn lbx-nav lbx-prev" id="lbxPrev" aria-label="Anterior">‹</button>
          <button class="lbx-btn lbx-nav lbx-next" id="lbxNext" aria-label="Siguiente">›</button>
          <div class="lbx-hint">Clic para acercar · Esc cerrar</div>
        </div>
        <aside class="lbx-panel" id="lbxPanel" hidden>
          <div class="lbx-count" id="lbxCount"></div>
          <div class="lbx-cap" id="lbxCap"></div>
        </aside>
        <button class="lbx-btn lbx-close" id="lbxClose" aria-label="Cerrar">✕</button>
      </div>
    </div>`;
  document.body.appendChild(root.firstElementChild);

  const lbx = document.getElementById('lbx'), stage = document.getElementById('lbxStage'),
        imgEl = document.getElementById('lbxImg'), panel = document.getElementById('lbxPanel'),
        capEl = document.getElementById('lbxCap'), countEl = document.getElementById('lbxCount');

  let items = [], idx = 0, scale = 1, tx = 0, ty = 0, drag = false, moved = false, sx = 0, sy = 0, px = 0, py = 0;

  const apply = () => { imgEl.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + scale + ')'; };
  const reset = () => { scale = 1; tx = 0; ty = 0; stage.classList.remove('zoomed'); apply(); };
  const zoomTo = s => { scale = Math.max(1, Math.min(6, s)); if (scale === 1) { tx = 0; ty = 0; } stage.classList.toggle('zoomed', scale > 1); apply(); };
  const multi = () => items.length > 1;

  function render() {
    const it = items[idx];
    imgEl.src = it.src; imgEl.alt = it.alt || '';
    if (it.caption) { capEl.innerHTML = it.caption; countEl.textContent = multi() ? (idx + 1) + ' / ' + items.length : ''; panel.hidden = false; }
    else { panel.hidden = true; }
    document.getElementById('lbxPrev').style.display = multi() ? '' : 'none';
    document.getElementById('lbxNext').style.display = multi() ? '' : 'none';
    reset();
  }
  function openLB(i) { idx = i; lbx.hidden = false; document.body.style.overflow = 'hidden'; render(); }
  function closeLB() { lbx.hidden = true; document.body.style.overflow = ''; }
  function go(d) { if (!multi()) return; idx = (idx + d + items.length) % items.length; render(); }

  // API pública: una imagen suelta (bitácora). `gallery` admite varias.
  window.openLightbox = function (src, caption, opts) {
    opts = opts || {};
    lbx.classList.toggle('lbx--sans', !!opts.sans);
    items = [{ src: src, caption: caption || '', alt: opts.alt || '' }];
    openLB(0);
  };
  window.openLightboxGallery = function (arr, start, opts) {
    opts = opts || {};
    lbx.classList.toggle('lbx--sans', !!opts.sans);
    items = arr; openLB(start || 0);
  };
  window.closeLightbox = closeLB;

  document.getElementById('lbxClose').onclick = closeLB;
  document.getElementById('lbxPrev').onclick = e => { e.stopPropagation(); go(-1); };
  document.getElementById('lbxNext').onclick = e => { e.stopPropagation(); go(1); };
  lbx.addEventListener('click', e => { if (e.target === lbx) closeLB(); });
  imgEl.addEventListener('click', e => { e.stopPropagation(); if (moved) { moved = false; return; } zoomTo(scale > 1 ? 1 : 2.2); });
  stage.addEventListener('wheel', e => { e.preventDefault(); zoomTo(scale * (e.deltaY < 0 ? 1.2 : 1 / 1.2)); }, { passive: false });
  imgEl.addEventListener('pointerdown', e => { if (scale <= 1) return; drag = true; moved = false; sx = e.clientX; sy = e.clientY; px = tx; py = ty; try { imgEl.setPointerCapture(e.pointerId); } catch (_) {} });
  imgEl.addEventListener('pointermove', e => { if (!drag) return; const dx = e.clientX - sx, dy = e.clientY - sy; if (Math.abs(dx) + Math.abs(dy) > 3) moved = true; tx = px + dx; ty = py + dy; apply(); });
  window.addEventListener('pointerup', () => { drag = false; });
  document.addEventListener('keydown', e => { if (lbx.hidden) return; if (e.key === 'Escape') closeLB(); else if (e.key === 'ArrowLeft') go(-1); else if (e.key === 'ArrowRight') go(1); });
})();
