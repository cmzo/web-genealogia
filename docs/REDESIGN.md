# Rediseño del sitio — Seguimiento

Dirección: **Editorial + Documental mínimo**

---

## ✅ Hecho

- Sistema de diseño nuevo: paleta cálida, Source Serif 4 como tipografía dominante
- Nav: nombre del sitio (serif) a la izquierda, Blog + ícono GitHub a la derecha
- Layout dos columnas en todas las páginas: sidebar (Inicio, Árbol, Archivo) + área de contenido
- Sidebar sticky con indicador de página activa
- `index.html` — tarjetas eliminadas, imagen histórica de Valais 1890 con pie de foto (ratio 2:1, pie de foto centrado)
- `blog.html` — búsqueda y filtro eliminados, cards rediseñadas con nuevo sistema
- `quien-soy.html` — nuevo layout
- `francisco.html` — nuevo layout
- `archivo.html` — nuevo layout, nav/sidebar/footer actualizados, funcionalidad conservada
- `arbol-matrimonios.html` — nuevo layout, nav/sidebar/footer actualizados, D3 zoom corregido (Ctrl+scroll)
- `content/templates/post-template.html` — todos los posts del blog usan el nuevo template
- Footer: rediseñado con descripción y changelog
- Páginas eliminadas (no estaban en uso): `clemenzo-por-el-mundo.html`, `trama-mexicana.html`, `mapa-clemenzos.html`
- Sidebar: indicador visual de sección activa (`border-left` con color de acento, `font-weight: 700`)
- Sidebar fijo: layout refactorizado a flex column en `body` + `overflow: hidden` en `.site-body` + scroll en `.site-main` — funciona en todas las páginas
- Home: imagen reemplazada por `Vallée du Rhône` (optimizada a WebP, 246KB), filtro B&W con `grayscale(100%) contrast(140%)`
- Nav: "Clemenzo" agrandado de 22px a 26px
- Build: posts ahora se ordenan por campo `date` del front matter (antes por mtime del archivo)
- Deploy: `scripts/update-and-deploy.js` reescrito — hace build + commit + push automático

- `changelog.html` — completado con historial real y detallado
- `arbol-matrimonios.html` — modularización completa: JS dividido en 5 módulos ES (`assets/js/arbol/`), CSS extraído a `assets/css/arbol.css`, HTML reducido a 81 líneas sin código inline
- Contenido de la columna derecha en Inicio — definido (imagen Vallée du Rhône)
- `object-position` de imagen home — evaluado y confirmado con center

---

## ⏳ Pendiente

### Feature futura
- [ ] Migración de la capa de datos a Python (base de datos como fuente en lugar de Google Sheets, reemplaza `data.js` y `buildArbolData()` en el build)
