/**
 * i18n.js — traducción de interfaz por página, sin dependencias.
 *
 * Cada página define ANTES de incluir este script un objeto global:
 *   window.I18N = { es: {clave: 'texto'}, fr: {…}, en: {…} }
 * y marca los elementos traducibles con:
 *   data-i18n="clave"        → reemplaza el innerHTML
 *   data-i18n-ph="clave"     → reemplaza el placeholder
 * El selector de idioma son botones con clase .lang-opt y data-lang="es|fr|en".
 *
 * Expone:
 *   window.t(clave)   → texto traducido en el idioma actual
 *   window.getLang()  → idioma actual ('es' | 'fr' | 'en')
 * y emite el evento `langchange` en document cuando cambia (para que la
 * página re-renderice partes dinámicas, p. ej. etiquetas generadas por JS).
 */
(function () {
  'use strict';
  const DICT = window.I18N || {};
  const LANGS = Object.keys(DICT);
  if (!LANGS.length) return;

  function pick() {
    const u = new URLSearchParams(location.search).get('lang');
    const s = (u || localStorage.getItem('site_lang') || 'es').toLowerCase();
    return DICT[s] ? s : (DICT.es ? 'es' : LANGS[0]);
  }

  let cur = pick();
  window.t = k => ((DICT[cur] || DICT.es || {})[k]) ?? ((DICT.es || {})[k]) ?? '';
  window.getLang = () => cur;

  function apply() {
    const d = DICT[cur] || DICT.es || {};
    document.documentElement.lang = cur;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const v = d[el.dataset.i18n];
      if (v != null) el.innerHTML = v;
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      const v = d[el.dataset.i18nPh];
      if (v != null) el.placeholder = v;
    });
    document.querySelectorAll('.lang-opt').forEach(o => o.classList.toggle('is-active', o.dataset.lang === cur));
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: cur } }));
  }

  function wire() {
    document.querySelectorAll('.lang-opt').forEach(o => o.addEventListener('click', () => {
      if (!DICT[o.dataset.lang]) return;
      cur = o.dataset.lang;
      localStorage.setItem('site_lang', cur);
      const u = new URL(location); u.searchParams.set('lang', cur); history.replaceState(null, '', u);
      apply();
    }));
    apply();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire);
  else wire();
})();
