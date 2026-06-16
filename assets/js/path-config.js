// ── Configuración de despliegue ──────────────────────────────────────────────
// Para cambiar de hosting, editar solo estas dos constantes:
const DEPLOY_HOST    = 'cmzo.net';   // hostname en producción
const DEPLOY_SUBPATH = '/';          // subpath (usar '/' si el sitio está en la raíz)
// ─────────────────────────────────────────────────────────────────────────────

(function() {
  'use strict';

  const isProd = window.location.hostname === DEPLOY_HOST;
  const base   = isProd ? DEPLOY_SUBPATH : './';

  window.PATH_CONFIG = {
    base,
    assets:  base + 'assets/',
    css:     base + 'assets/css/',
    images:  base + 'assets/images/',
    data:    base + 'assets/data/',
    content: base + 'content/',
    dist:    base + 'dist/',
  };

  window.getAssetPath = function(path) {
    if (path.startsWith('http')) return path;
    if (path.startsWith('./'))        return window.PATH_CONFIG.base    + path.slice(2);
    if (path.startsWith('assets/'))   return window.PATH_CONFIG.assets  + path.slice(7);
    return window.PATH_CONFIG.base + path;
  };

  window.getCSSPath     = function(filename) { return window.PATH_CONFIG.css     + filename; };
  window.getImagePath   = function(path)     { return window.PATH_CONFIG.images  + path; };
  window.getContentPath = function(path)     { return window.PATH_CONFIG.content + path; };
  window.getDataPath    = function(path)     { return window.PATH_CONFIG.data    + path; };
  window.getDistPath    = function(path)     { return window.PATH_CONFIG.dist    + path; };
})();
