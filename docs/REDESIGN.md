# Rediseño del sitio — Seguimiento

Dirección: **Editorial + Documental mínimo**

---

## ✅ Hecho

### Sistema y layout
- Sistema de diseño nuevo: paleta cálida, Source Serif 4 como tipografía dominante
- Layout dos columnas en todas las páginas: sidebar (Inicio, Árbol, Archivo, Blog) + área de contenido
- Sidebar sticky con indicador de página activa (`border-left` con color de acento, `font-weight: 700`)
- Sidebar fijo: layout refactorizado a flex column en `body` + `overflow: hidden` en `.site-body` + scroll en `.site-main`
- Nav: "Clemenzo" (serif) a la izquierda, solo ícono GitHub a la derecha en desktop
- Mobile (≤960px): sidebar oculta, links de navegación (Inicio, Árbol, Archivo, Blog) integrados al nav superior
- Mobile (≤640px): footer apilado y centrado verticalmente
- Footer: rediseñado con descripción y link al changelog

### Páginas
- `index.html` — epígrafe editorial centrado, panorámica Valle del Ródano (B&W), escudos heráldicos de Clemenzo y Ardon, sección "Última entrada" dinámica (fetch de blog-entries.json)
- `blog.html` — tarjetas puramente tipográficas (sin imagen), búsqueda y filtro eliminados; corregido JSON roto por comillas tipográficas
- `archivo.html` — nuevo layout, funcionalidad conservada
- `arbol-matrimonios.html` — nuevo layout, D3 zoom corregido (Ctrl+scroll); modularización completa: JS dividido en 5 módulos ES (`assets/js/arbol/`), CSS extraído a `assets/css/arbol.css`, HTML reducido a 81 líneas sin código inline
- `content/templates/post-template.html` — todos los posts del blog usan el nuevo template
- `changelog.html` — completado con historial real y detallado
- Páginas eliminadas (no estaban en uso): `clemenzo-por-el-mundo.html`, `trama-mexicana.html`, `mapa-clemenzos.html`

### Build y deploy
- Build: posts ordenados por campo `date` del front matter (antes por mtime del archivo)
- Deploy: `scripts/update-and-deploy.js` reescrito — hace build + commit + push automático

---

### Datos del árbol
- Migración de Google Sheets a SQLite + Python: `data/arbol.db` es la nueva fuente de verdad; `scripts/export_arbol.py` genera `arbol.json` en cada build; `scripts/gestionar_arbol.py` reemplaza la edición manual en Sheets
