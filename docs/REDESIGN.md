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

## 🌳 Rediseño del árbol genealógico (en progreso)

Decisión de rediseñar el árbol desde cero en lugar de parchar el código existente.
Dirección: **pedigree navegable centrado en una persona**, comparable en seriedad a FamilySearch.

### ✅ Fase 1 — Migración del schema de la base de datos
- `data/arbol.db` (SQLite) es la fuente de verdad del árbol, reemplaza a Google Sheets
- Nueva tabla `personas`: agrega `gender`, `photo_url`, `notes`, `sources`; elimina `spouse_id` y `children_ids` (datos derivados que generaban inconsistencias)
- Nueva tabla `matrimonios`: entidad propia con `id`, `spouse1_id`, `spouse2_id`, `marriage_date`, `marriage_place`, `divorce_date`, `notes`. Soporta múltiples matrimonios por persona
- Nueva tabla `media`: asocia fotos (`assets/images/personas/`) y documentos (`assets/docs/personas/`) a personas individuales
- 17 pares cónyuge existentes migrados automáticamente a `matrimonios`
- Script de migración: `scripts/migrate_schema_v2.py` (idempotente)

### ✅ Fase 2 — Nuevo export script y JSON
- `scripts/export_arbol.py` reescrito: genera `{ personas[], matrimonios[] }` con media embebido por persona
- Fechas en ISO (`YYYY-MM-DD`) en lugar del formato `Date(Y,M,D)` heredado de Google Sheets
- Hijos son datos derivados: el frontend los infiere desde `father_id`/`mother_id`, no se almacenan
- `scripts/gestionar_arbol.py` extendido con 9 comandos: personas (`list`, `show`, `add`, `edit`), matrimonios (`list-marriages`, `add-marriage`, `edit-marriage`), media (`list-media`, `add-media`)

### ✅ Fase 3 — Arquitectura de módulos JS
Nuevos módulos ES en `assets/js/arbol/`:
- `config.js` — constantes visuales: card 160×80px, `MARRIAGE_NODE`, `TRANSITION_MS`, colores de rama
- `data.js` — carga el JSON nuevo, construye 5 índices en memoria (`personaById`, `matrimonioById`, `matrimoniosByPersona`, `hijosByPersona`, `hijosByMatrimonio`). Expone accessors O(1)
- `store.js` — estado global con pub/sub: `focusPersonId`, `selectedPersonId`, `viewMode`. `setFocus(id)` dispara `focusChange`; `setSelected(id)` dispara `selectionChange`
- `graph.js` — `getAncestorTree(id, depth)`, `getDescendantTree(id, depth)`, `getFullTree()`, `searchPersonas(query)`, `getMatrimoniosConConyuge(id)`. Produce nodos `{ nodeId, type, data, children }` compatibles con `d3.hierarchy()`

---

## ⏳ Próximas fases

### ✅ Fase 4 — Layout D3 y renderizado del árbol
**Trabajo:** Reescribir `layout.js` y `render.js` usando `d3.hierarchy()` + `d3.tree()`.

El layout produce dos árboles a partir de los nodos de `graph.js`:
- **Árbol ancestral** (foco como raíz D3, ancestros como hijos → el eje Y se invierte para que fluya hacia arriba). El matrimonio de los padres es un nodo intermedio entre la persona y sus dos progenitores.
- **Árbol descendente** (foco como raíz, matrimonios e hijos hacia abajo).

El renderizado dibuja:
- Tarjetas de persona: 160×80px, barra de color de rama en la parte superior, nombre en 2 líneas, años de vida
- Nodo matrimonio: círculo entre los dos cónyuges, del que salen los conectores hacia los hijos
- Conectores: curvas cúbicas de Bezier coloreadas por rama
- Zoom/pan con `d3.zoom()`; click en persona → `store.setFocus(id)` que recentra el árbol con transición de 600ms

**Implementación:**
- `layout.js` reescrito: árbol de personas (sin nodos matrimonio) → `d3.tree().nodeSize()` para posiciones X, Y invertido para ancestros. Nodos matrimonio computados como punto medio entre cónyuges a mitad del espacio vertical (y = parent_y + VGAP/2). Constante `VGAP = 160px`.
- `render.js` reescrito: SVG con `d3.zoom()` (Ctrl+scroll), tarjetas 160×80 con franja de rama, nombre en 2 líneas, años de vida. Curvas cúbicas via `d3.linkVertical()` por tipo de arista (`spouse`, `marriage-child`, `focus-marriage`, `direct`). Click en tarjeta → `store.setFocus(id)` + recentrado de 600ms.
- `arbol-matrimonios.html` actualizado: listener `focusChange` → `computeLayout + render + recenterOn`. Botones zoom conectados.

**Al terminar:** el árbol funciona en el browser. Se puede navegar haciendo click en personas y el árbol se recentra. El zoom y el pan funcionan. Las tarjetas muestran nombre y fechas. El árbol muestra 3 generaciones hacia arriba y 1 hacia abajo desde la persona foco.

---

### ✅ Fase 5 — Panel lateral y navegación
**Trabajo:** Crear `panel.js` y `search.js`, actualizar `arbol-matrimonios.html`.

El panel lateral (300px, superpuesto al árbol) se abre al hacer click en una persona y muestra:
- Nombre completo, fechas y lugares de nacimiento/fallecimiento
- Padres (con link para navegar a cada uno)
- Matrimonios: cónyuge, fecha y lugar si existen, lista de hijos con links
- Notas y fuentes si no están vacías
- Fotos y documentos asociados (de la tabla `media`)

La barra de herramientas encima del árbol incluye:
- Selector de vista: Pedigree / Árbol completo
- Buscador por nombre (datalist HTML) que hace `store.setFocus(id)` al seleccionar

**Implementación:**
- `panel.js`: `initPanel()` escucha `selectionChange`; `_renderContent()` genera HTML para nombre, fechas/lugares, padres con links, matrimonios con hijos, notas, fuentes, media. Slide-in desde la derecha con CSS transform.
- `search.js`: `initSearch()` puebla un `<datalist>` con todos los nombres; al seleccionar → `setFocus(id) + setSelected(id)`.
- `render.js` actualizado: click en tarjeta llama `setFocus(id) + setSelected(id)`.
- `arbol-matrimonios.html` actualizado: toolbar con `#searchInput`, panel `#treePanel` con `#treePanelBody` y `#treePanelClose`.
- `arbol.css` actualizado: estilos de toolbar, panel (translate transition 300ms), zoom-controls movido a esquina inferior izquierda.

**Al terminar:** la experiencia es comparable a FamilySearch en interactividad. Click en persona → panel lateral con toda la información disponible. Búsqueda por nombre funcional.

---

### ✅ Fase 6 — CSS del árbol
**Trabajo:** Reescribir `assets/css/arbol.css` desde cero.

Dirección: **documental mínimo con densidad controlada**. El árbol es una canvas interactiva, no una página editorial, pero debe ser coherente con el sistema de diseño del sitio.

- Tarjetas: fondo blanco (`var(--surface)`), sombra sutil, borde superior de color de rama
- Hover: elevación de sombra, cursor pointer
- Conectores: coloreados por rama, opacidad 0.7 en reposo → 1 al hover
- Panel lateral: transición `translateX` desde fuera del viewport
- La única animación notable es el recentrado de 600ms — tiene dirección narrativa

**Implementación:** `arbol.css` reescrito desde cero (dead code eliminado). Fondo de puntos radiales sobre `--bg` para la canvas. Zoom buttons con tokens del sistema de diseño (32px, `var(--border)`, `var(--surface)`). Panel con `cubic-bezier` suave y sombra lateral. Scrollbar sutil (4px). `render.js`: conectores más finos (1.5–1.8px, opacidad reducida), nombre 12px, sombras de tarjeta más suaves.

**Al terminar:** el árbol se ve como un proyecto serio. La estética es coherente con el resto del sitio.

---

### Fase 7 — Wiring final, limpieza y documentación
**Trabajo:** Conectar todo, eliminar código viejo, actualizar docs.

- `arbol-matrimonios.html` reescrito con el HTML completo (toolbar, panel lateral, SVG container)
- Módulos viejos eliminados: `structure.js`, y las versiones anteriores de `layout.js` y `render.js`
- `CLAUDE.md` actualizado con el nuevo schema, módulos y flujo de datos
- `data/README.md` actualizado

**Al terminar (feature completo):** el árbol genealógico es un proyecto serio y mantenible. La fuente de verdad es una base de datos local. El frontend es navegable, tiene panel lateral con toda la información disponible por persona (incluyendo fotos y documentos), búsqueda, y dos vistas. El código es limpio y modular. No queda deuda técnica del código construido a prueba y error.
