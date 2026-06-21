/**
 * theme.js — modo claro/oscuro.
 *
 * El tema inicial lo fija un script inline en el <head> (anti-flash), leyendo
 * localStorage('theme') o, si no hay, la preferencia del sistema. Este script
 * inyecta el botón sol/luna en el nav, alterna el tema, lo persiste y sigue
 * los cambios del sistema mientras el usuario no haya elegido manualmente.
 */
(function () {
  'use strict';
  const root = document.documentElement;
  const KEY = 'theme';
  const mq = window.matchMedia('(prefers-color-scheme: dark)');

  const SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  const MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';

  let btn;

  const current = () => root.getAttribute('data-theme') || (mq.matches ? 'dark' : 'light');

  function updateButton(theme) {
    if (!btn) return;
    const dark = theme === 'dark';
    btn.innerHTML = dark ? SUN : MOON;
    btn.setAttribute('aria-label', dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
    btn.title = dark ? 'Modo claro' : 'Modo oscuro';
  }

  function apply(theme) {
    root.setAttribute('data-theme', theme);
    updateButton(theme);
  }

  function build() {
    const nav = document.querySelector('.nav-actions');
    if (!nav) return;
    btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'theme-toggle';
    const gh = nav.querySelector('a[aria-label="Repositorio en GitHub"]');
    // gh puede estar anidado en .cmzo-tools, así que insertamos en su propio contenedor.
    if (gh) gh.parentNode.insertBefore(btn, gh); else nav.appendChild(btn);
    updateButton(current());
    btn.addEventListener('click', () => {
      const next = current() === 'dark' ? 'light' : 'dark';
      localStorage.setItem(KEY, next);
      apply(next);
    });
  }

  // Seguir el sistema en vivo mientras no haya elección manual guardada.
  mq.addEventListener('change', e => {
    if (!localStorage.getItem(KEY)) apply(e.matches ? 'dark' : 'light');
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
