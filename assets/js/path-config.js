// Configuración automática de rutas para GitHub Pages vs desarrollo local
(function() {
  'use strict';
  
  // Detectar si estamos en GitHub Pages
  const isGitHubPages = window.location.hostname === 'cmzo.github.io';
  const repoName = 'web-genealogia';
  
  // Configurar rutas base
  window.PATH_CONFIG = {
    base: isGitHubPages ? `/${repoName}/` : './',
    assets: isGitHubPages ? `/${repoName}/assets/` : './assets/',
    css: isGitHubPages ? `/${repoName}/assets/css/` : './assets/css/',
    images: isGitHubPages ? `/${repoName}/assets/images/` : './assets/images/',
    data: isGitHubPages ? `/${repoName}/assets/data/` : './assets/data/',
    content: isGitHubPages ? `/${repoName}/content/` : './content/',
    dist: isGitHubPages ? `/${repoName}/dist/` : './dist/'
  };
  
  // Función para obtener rutas completas
  window.getAssetPath = function(path) {
    if (path.startsWith('http')) return path;
    if (path.startsWith('./')) {
      return window.PATH_CONFIG.base + path.substring(2);
    }
    if (path.startsWith('assets/')) {
      return window.PATH_CONFIG.assets + path.substring(7);
    }
    return window.PATH_CONFIG.base + path;
  };
  
  // Función para obtener rutas de CSS
  window.getCSSPath = function(filename) {
    return window.PATH_CONFIG.css + filename;
  };
  
  // Función para obtener rutas de imágenes
  window.getImagePath = function(path) {
    if (path.startsWith('http')) return path;
    if (path.startsWith('./')) {
      return window.PATH_CONFIG.images + path.substring(2);
    }
    if (path.startsWith('assets/images/')) {
      return window.PATH_CONFIG.images + path.substring(14);
    }
    return window.PATH_CONFIG.images + path;
  };
  
  // Función para obtener rutas de contenido
  window.getContentPath = function(path) {
    return window.PATH_CONFIG.content + path;
  };
  
  // Función para obtener rutas de datos
  window.getDataPath = function(path) {
    return window.PATH_CONFIG.data + path;
  };
  
  // Función para obtener rutas de dist
  window.getDistPath = function(path) {
    return window.PATH_CONFIG.dist + path;
  };
  
  console.log('Path config loaded:', window.PATH_CONFIG);
})();
