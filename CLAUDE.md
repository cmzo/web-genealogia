# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Comandos de sesión

### «Actualiza todo»
Cuando el usuario diga **«Actualiza todo»**, ejecutar en orden:

1. **TODO.md** (`/Users/matias/genealogia/TODO.md`) — revisar cada tarea abierta y marcar `[x]` las que se resolvieron durante la sesión; moverlas a `## Completadas` con fecha y resultado breve. No inventar resoluciones: solo marcar lo que efectivamente ocurrió.
2. **`content/changelog.md`** — añadir una entrada `####` por cada cambio significativo hecho al sitio durante la sesión (UI, contenido, estructura, correcciones). Insertar bajo el encabezado `### <fecha de hoy>` (crear la sección **solo si no existe**; **no** renombrar la de otra fecha — los cambios viejos conservan su fecha). Marcar el tipo de cambio con una etiqueta al inicio del `####` (estilos en `changelog.html`):
   - herramienta/sección **entera** nueva → `<span class="changelog-tag changelog-tag--nueva">Función nueva</span>`
   - feature nueva **dentro de algo existente** → `<span class="changelog-tag changelog-tag--novedad">Novedad</span>`
   - mejora de algo existente → `<span class="changelog-tag changelog-tag--mejora">Mejora</span>`
   - corrección → `<span class="changelog-tag changelog-tag--fix">Arreglo</span>`
3. **`CLAUDE.md`** (este archivo) — revisar si algo documentado aquí quedó desactualizado por los cambios de la sesión (rutas, nombres de archivos, tipografía, comandos, descripción de componentes) y corregirlo.
4. **`design-system.html`** — si la sesión introdujo o cambió lenguaje visual (un token de color, un tamaño/escala tipográfica, un valor de espaciado, un componente o una variante nuevos —p. ej. la nav-bar, botones, cards), reflejarlo acá. Es la fuente única de verdad del diseño: actualizarla cuando algo se desvíe de lo documentado, no inventar estilos ad-hoc. Si no hubo cambios visuales, omitir.

## Commands

```bash
# Build: compile posts to HTML, regenerate blog-entries.json and arbol.json
npm run build

# Dev server: build then serve at http://localhost:8000
npm run dev

# Add a post (copies .md to content/posts/, runs build)
node scripts/add-post.js <file.md>
node scripts/add-post.js <file.md> --add-frontmatter  # auto-generate front matter if missing

# Manage posts
npm run list-posts
npm run delete-post <slug>   # removes .md, dist/blog/<slug>.html, and JSON entry

# Image optimization for personas (requires sharp)
npm run optimize-personas    # reads assets/images/personas/, outputs WebP

# Árbol genealógico — gestión de personas (requiere uv)
# REGLA DE APROBACIÓN: antes de crear una persona (arbol.db o página de wiki) o de
# cargar documentos/media, mostrar al usuario un resumen de los datos y documentos que
# se van a cargar y esperar su aprobación explícita. No crear ni cargar nada sin que lo apruebe.
uv run scripts/gestionar_web.py           # menú interactivo (recomendado)

# Comandos directos:
uv run scripts/gestionar_web.py list
uv run scripts/gestionar_web.py show <id>
uv run scripts/gestionar_web.py add
uv run scripts/gestionar_web.py edit <id>
uv run scripts/gestionar_web.py delete <id>

uv run scripts/gestionar_web.py list-marriages
uv run scripts/gestionar_web.py add-marriage
uv run scripts/gestionar_web.py edit-marriage <id>
uv run scripts/gestionar_web.py delete-marriage <id>

uv run scripts/gestionar_web.py list-media [<persona_id>]
uv run scripts/gestionar_web.py add-media <persona_id>
uv run scripts/gestionar_web.py add-media-bulk <persona_id>
uv run scripts/gestionar_web.py delete-media <media_id>

uv run scripts/gestionar_web.py list-unregistered  # fotos en disco sin entrada en DB

uv run scripts/gestionar_web.py create-post        # crear nuevo post interactivo

# Regenerar arbol.json manualmente (sin hacer build completo)
uv run scripts/export_arbol.py

# Deploy (build + git add + commit + push; Cloudflare auto-deploya desde el repo)
npm run deploy

# Remove dist/
npm run clean
```

There is no test suite and no linter configured.

## Architecture

This is a **static site** deployed to **Cloudflare Workers Assets**, served at **`cmzo.net`** (también accesible vía `web-genealogia.cmzo.workers.dev`). Configuration in `wrangler.toml`. There is no build framework — everything is plain HTML/CSS/JS with a small Node.js build pipeline.

### Blog pipeline

1. Write a post in `content/posts/<slug>.md` with YAML front matter
2. Run `npm run build` → `scripts/build.js` converts each `.md` to `dist/blog/<slug>.html` using the template at `content/templates/post-template.html`. El shell del post usa la **nav/footer nuevos** (`cmzo-top` con breadcrumb `~/cmzo / blog / <título>` que arma `nav.js` con `data-nav-prefix="../../"` + `data-page-label`; footer `cmzo-foot`); el cuerpo editorial del artículo conserva Source Serif + el lightbox.
3. The build also regenerates `assets/data/blog-entries.json`, which is the index that `blog.html` **y el `log` de la home** read at runtime via `fetch()`
4. **`dist/` is committed** to the repo — Cloudflare sirve esos archivos directamente, so always commit `dist/` after a build

### Traducciones (posts `.fr.md`)

Las traducciones al francés se hacen **con un LLM en sesión** (pedírselas a Claude) — no hay API externa. (El plan original era DeepL vía `scripts/translate.js`, pero DeepL cerró su API gratuita a altas nuevas a mediados de 2026 y el script **nunca corrió**; se eliminó del repo en 2026-07-06, queda en el historial de git.)

Reglas al traducir:
- **Fidelidad completa: nunca resumir ni abreviar** — la traducción de 2026-06 de `clan-clemenzo` resumió 11 hipótesis en 2 y hubo que rehacerla.
- Preservar intactos: `![[imágenes]]`, código con backticks (p. ej. `` `rama-directa` ``, del que depende el badge de las hypothesis cards), separadores `---` (delimitan las cards), tablas, y la estructura de headings.
- Frontmatter: traducir `title`/`kicker`/`description`; copiar tal cual `image`/`category`/`date`/`tags`/`featured`/`slug`/`wiki`; agregar `lang: "fr"`.
- **El archivo va junto al ES con su mismo basename**: `<archivo>.fr.md` al lado de `<archivo>.md` — el emparejamiento del selector de idiomas es por **nombre de archivo**, no por slug (el slug de salida lo aporta el ES). Un `.fr.md` sin ES homónimo queda huérfano, sin selector.
- Al **editar un post ES ya traducido, actualizar también su `.fr.md`** — no hay ningún aviso automático de traducción desactualizada.

### Otros feeds de contenido (generados en build)

Además del blog, `build.js` emite:
- **Lab** (`content/lab/*.md` → `assets/data/lab-entries.json`): área de experimentos. Cada entrada `kind: tool` (con `url:`, solo indexa una página existente como `lab-grafo.html`) o `kind: writeup` (genera `dist/lab/<slug>.html` con el mismo template de post).
- **Notas / momentos** (`content/notas/*.md` → `assets/data/notas.json`): entradas cortas (`type: nota|imagen|enlace`, `image:`/`link:` opcionales) que **no generan página** — se abren en un modal desde el `log` de la home (las `imagen` en el lightbox). Fotos en `assets/images/notas/`.
- **Changelog feed** (`content/changelog.md` → `assets/data/changelog-entries.json`): el build parsea cada `### fecha` + `#### entrada` para alimentar el `log`; la página `changelog.html` queda igual.
- **Fuentes** (`content/fuentes/*.md` → `assets/data/fuentes.json`): un `.md` por fuente con frontmatter `title/url/region/tipo/estado/autor/orden`; `buildFuentes()` en `build.js` ordena por región (`REGION_ORDER`) y luego `orden`. `fuentes.html` consume el JSON en runtime: sticky filter bar (`.fx-bar`) con chips de región, rows ricos (`.fx-row`), chips semánticos de estado (`color-mix()`), cuerpos colapsables, «Abrir ↗» directo, deep-link `#f-<id>`. Estilos en `assets/css/fuentes.css` (familia `.fx-*`).

### Front matter fields

```yaml
title: "..."
kicker: "..."          # required — subtitle shown above the title
description: "..."
image: "assets/images/cards/foo.webp"
category: "investigación"
date: "2024-08-17"
tags: "tag1, tag2"
featured: true
slug: "my-slug"        # defaults to filename without .md
wiki: "p36, metodologia"  # optional — ids de persona (pNN) y/o slugs de página de la wiki que trata el post; los enlaza en el grafo
aside: |               # optional sidebar content (supports Markdown)
  Some sidebar text
```

### Path handling

`assets/js/path-config.js` runs on every page and exposes `window.PATH_CONFIG` plus helpers (`getAssetPath`, `getImagePath`, `getDataPath`, etc.) that resolve paths correctly for both local dev (`./`) and producción (`cmzo.net`, raíz `/`; constantes `DEPLOY_HOST`/`DEPLOY_SUBPATH`). Pages that fetch data at runtime (like `index.html` and `blog.html`) use these helpers.

Generated posts in `dist/blog/` use hardcoded relative paths (`../../assets/…`, `../../index.html`) to reach root-level resources — this is handled automatically by `scripts/build.js`.

### Key data flow

- `index.html` — **home "Índice + log"**: hero + **01 Áreas** (tres tarjetas de color sólido, `.cmzo-gcard` — blog · lab · genealogía) + **02 log** (bitácora que fusiona `blog-entries.json` + `lab-entries.json` + `notas.json` + `changelog-entries.json` por fecha; `post`/`lab` navegan a su página, `nota`/`imagen`/`enlace`/`cambio` abren modal; `imagen` usa el lightbox compartido `assets/js/lightbox.js`). Límite 10 + "ver más". Solo-ES (sin i18n). Expone `window.__openNota(id)` y lee `?nota=<id>`
- `blog.html` — fetches `assets/data/blog-entries.json` and renders cards dynamically; cards are purely typographic (no image); search and filter were intentionally removed
- `arbol.html` — interactive family tree; fetches `assets/data/arbol.json` at runtime; uses D3.js v7 (**vendoreado** en `assets/js/vendor/d3.v7.min.js`) and ES modules from `assets/js/arbol/`
- `gen.html` — **índice del área genealogía**: hero + una grilla de **cuatro tarjetas de color sólido** (`.cmzo-gcard`): árbol · wiki · fuentes · colaborar.

**`.cmzo-gcard` (`home.css`)** — componente de tarjeta general del sitio, rediseño 2026-08 desde una referencia de Uiverse; grilla `.cmzo-gcards` de **3 por fila**. Lo usan `/gen` (4 tarjetas: árbol/wiki/fuentes/colaborar), la home (01 Áreas: blog/lab/genealogía) y `/lab` (los tres laboratorios) — reemplazó tanto a `.cmzo-area` (portada + pastilla) como a `.lab-card` y a las cuatro secciones a dos columnas con paneles `.cmzo-viz`/`.cmzo-solid` de `/gen` (con ellas se retiraron `.cmzo-rings`, `.cmzo-solid`, `.cmzo-meter`, `.cmzo-two`, `.cmzo-area*` y `.lab-card*`). **La tarjeta entera es el pastel** — sin borde, sin portada/imagen. Racimo de círculos superpuesto solo donde hay **individuos reales que nombrar** (iniciales de la línea directa en el árbol, hubs del grafo en la wiki); si no hay individuos, el badge va solo (Fuentes, Colaborar, y las tres del lab). Colores por familia (`--pill-escritura/--experim/--archivo`, e `--investig` por defecto — mismos tokens que `.cmzo-pill`, **fijos en ambos temas**: son objetos de papel). **Indicador + barra** al cierre; la barra **solo aparece donde hay una proporción real** que mostrar (blog: % de posts en francés; árbol: % con fecha de nacimiento; fuentes: % suizas; wiki: % de nodos documentados — lab y Colaborar no llevan porque no hay nada real que medir).
- `wiki.html` — **knowledge graph** (Obsidian-style, **Cytoscape.js + física propia**) que reemplazó al antiguo Archivo; fetches `assets/data/wiki-graph.json` + `arbol.json`. Clic en un nodo abre un panel lateral con relaciones/enlaces; el botón "Leer" abre un modal que carga el markdown renderizado de `dist/wiki/<id>.html`. Ver la sección **Wiki** más abajo.
- `archivo.html` — **retirado**: ahora es solo un redirect a `wiki.html` (preserva la URL para marcadores y posts viejos)
- `lab.html` — **índice del área lab**: carga `assets/data/lab-entries.json` y muestra las tools como tarjetas de color sólido (`.cmzo-gcard`, mismo componente que `/gen` y la home). Cada una lleva un hecho real de la herramienta como badge/indicador (`DATOS` en el script inline: editorial → 15 fuentes de tipografía disponibles; fractales → 4 fractales por L-system; grafo → 15 parámetros en vivo). Sin racimo de avatares (no hay individuos que nombrar) y sin barra (no hay proporción real que mostrar).
- `lab-grafo.html` — **laboratorio del grafo**: sandbox interactivo del motor de la Wiki (Cytoscape + la misma física). Genera un grafo sintético (preferential attachment) y expone diales en vivo de todos los parámetros físicos y estéticos, con una "receta" copiable. JS autocontenido en `assets/js/lab/grafo-lab.js`, estilos en `assets/css/lab.css`. `data-section="lab" data-page-label="grafo"`. **No comparte código con `wiki/graph.js`** (reimplementación deliberada standalone).
- `lab-fractales.html` — **laboratorio de fractales**: L-systems sobre Canvas 2D, sin dependencias externas. Motor `expand(axiom, rules, N)` + intérprete turtle. Cuatro fractales: Koch, Sierpiński, Árbol, Dragón. Panel derecho muestra gramática, iteración del string (N=0→N, truncado si supera 72 símbolos) y dimensión fractal. Controles: selector de fractal, slider N, slider ángulo, color mono/gradiente. Receta copiable. JS en `assets/js/lab/fractales-lab.js`. `data-section="lab" data-page-label="fractales"`.
- `lab-editorial.html` — **laboratorio editorial**: maqueta viva de la tipografía de los posts del blog. Muestra un especimen de un artículo real (h2/h3/p/blockquote/ul/figure/galería/tabla/mermaid) con diales para ancho de columna (360–1400px), fuente del cuerpo (16 opciones: las del sitio + serif/sans del sistema), tamaño, interlineado, márgenes de h2/h3/figuras, radio de imagen, caption. Modo fullscreen (⛶) para probar anchos sin restricción del panel. Receta: diff vs. estado actual del sitio, copiable. `data-section="lab" data-page-label="editorial"`. JS en `assets/js/lab/editorial-lab.js`.

### Global command palette (`assets/js/command-palette.js`)

Self-contained command palette (Spotlight/Raycast style) opened with **⌘/Ctrl + K**. Injects its own CSS + DOM and a "Buscar ⌘ + K" trigger button into `.nav-actions`. Busca **y ejecuta**: indexa **pages**, **personas** (`arbol.json`), **blog posts** (`blog-entries.json`), **notas** (`notas.json`, busca su contenido; al elegir una abre el modal vía `window.__openNota` o navega a `index.html?nota=<id>`), **páginas de la wiki** (`wiki-graph.json`, grupo **«Wiki»**: lugares/fuentes/eventos/temas con contenido; al elegir una **abre la lectura** vía `window.__wikiRead(id)` si estás en la wiki, o navega a `wiki.html?read=<id>`) y **fuentes** (`fuentes.json`, grupo «Fuentes»: Enter = `window.open(url, '_blank', 'noopener')` si hay url, si no navega a `fuentes.html#f-<id>`). Suma también un grupo **«Recientes»** (aparece al abrir sin query: últimas 5 selecciones en `localStorage["cmdk-recent"]`, tipos `persona/page/post/wiki/nota/fuente`, icono reloj) y un grupo **«Comandos»** con 2 acciones: alternar tema día/noche + copiar enlace de la página actual. Datos fetched lazily and cached. Búsqueda **multi-palabra** (tokens AND; títulos con coincidencia difusa, resto del haystack solo substring), insensible a acentos; **personas indexadas también por lugares y años** de nacimiento/defunción («riddes 1858» → François); **grupos ordenados inter-sí por relevancia** (score del mejor resultado de cada grupo); keyboard nav; el **resaltado marca cada token tanto en el título como en el subtítulo**. Selecting a persona focuses it sin salir vía `window.__personaFocus || window.__treeFocus` (el árbol expone `__treeFocus`; la wiki expone `__personaFocus`); si la página no define handler, navega a `arbol.html?focus=<id>`. En desktop (ancho > 960px) las filas de **persona y wiki** tienen **acción secundaria con `→` y `›`**: para persona → línea de tiempo (`window.__openTimeline` o `arbol.html?timeline=<id>`); para wiki → «Ver en el grafo» (foco en grafo). El footer muestra el hint solo cuando el ítem activo es persona o wiki. En mobile la secundaria se inhibe. **Accesibilidad**: `role="combobox"`, `aria-expanded`, `aria-controls="cmdkList"`, `aria-selected` en ítems, `aria-activedescendant` actualizado en cada movimiento. En la wiki, el filtro por familia es un **sub-menú**: una única entrada «Filtrar por familia…» (tipo `mode`) que al activarse cambia el placeholder a «Tipeá un apellido…» y lista solo las familias; Esc o Backspace con el input vacío vuelven a la raíz; si hay filtro activo aparece además «Quitar filtro de familia». Incluido en Inicio, Árbol, Wiki, Blog, Cambios y posts del blog — **no** en Colaborar ni Fuentes. Paths are relative; `ROOT` is `../../` inside `dist/blog/` posts, `''` elsewhere.

### Wiki — grafo de conocimiento (`wiki.html`)

Reemplaza al antiguo Archivo. Es un **grafo estilo Obsidian** donde el grafo es el hub: nodos = **personas** + **páginas** de lugar/fuente/evento + **posts** del blog; aristas = familia + menciones/enlaces. Todo ocurre in-page (panel lateral + modal), sin navegar.

**Tags fuera del grafo visual:** los tags existen en `wiki-graph.json` (aristas `rel:"tag"`) y alimentan el **panel** («Etiquetas») y el **resaltado temático** (clic en un chip de tag ilumina a toda su gente), pero **no se dibujan como nodos** — eran el ~51% de las aristas y enmarañaban el disco. El lienzo solo muestra personas + páginas + posts con aristas de familia (`rel:"familia"`) y enlaces/menciones.

**Pipeline (`scripts/build-wiki.js`, llamado por `build.js` después de generar `arbol.json`):**
1. Lee `content/wiki/*.md` (páginas autoradas, con frontmatter `title`/`type`/`summary`/`tags` y enlaces `[[destino]]`/`[[destino|alias]]`) + `content/personas/p{id}.md` (las **notas de investigación**; las que aún contienen el marcador `_Investigación pendiente._` cuentan como **stub**) + `arbol.json` (personas + backbone familiar **+ media**) + `blog-entries.json` (posts). **La media vive solo en la wiki** (la pestaña Archivos del árbol se retiró el 2026-07-07): cada página de persona termina con una sección «Documentos» (`mediaHtml()`: imágenes como `.wiki-figure` en un grid `.wiki-docs-grid` → lightbox compartido gratis; no-imágenes como link `.wiki-doc-file`; agrupación por `group_label` como la vieja pestaña). Una persona tiene página y `hasContent:true` si tiene **nota real o media**: un stub con media genera página con aviso `.wiki-pending` + galería; un stub sin media queda como nodo sin botón «Leer».
2. Resuelve enlaces: en páginas, `[[p26]]` / `[[slug]]` / `[[Título]]`; en notas de persona, las **menciones en prosa tipo `p36`** generan aristas; cada **post** se enlaza a las personas y/o páginas de su frontmatter `wiki: "p36, metodologia, …"`; los `tags:` (de páginas, notas y posts) generan aristas `rel:"tag"`.
3. Emite **`assets/data/wiki-graph.json`** `{ nodes:[{id,title,type,branch,url,summary,hasContent}], edges:[{source,target,rel}] }` y renderiza cada nodo con contenido a **`dist/wiki/<id>.html`** usando `content/templates/wiki-template.html`. El render del markdown (`renderRich`) soporta **imágenes** (`![[archivo]]` → `assets/images/wiki/`, envueltas en `<figure class="wiki-figure">` con pie) y **diagramas Mermaid** (```mermaid → `<div class="mermaid">`), además de callouts (`> [!tipo]`) y `==resaltado==`.

**Front-end (`assets/js/wiki/graph.js`, ES module; importa `cytoscape` **vendoreado** desde `assets/js/vendor/cytoscape.esm.min.js` — sin CDN; estilos en `assets/css/wiki.css`):** render con **Cytoscape.js** y una **física propia** estilo Obsidian — repulsión entre todos los nodos + centrado + resortes de enlace, **confinados en un borde circular** → el disco redondo emerge de la física (no de post-procesos). El armado son ~300 pasos síncronos con el lienzo oculto (fade-in al terminar). La **misma simulación maneja el arrastre**: agarrar un nodo arrastra a sus vecinos; al soltar todo vuelve al círculo. Constantes ajustables al inicio del bloque de física (`K_REPEL`, `K_CENTER`, `K_LINK`, `K_BOUND`, `DAMP`, `DISC_R`). Color por rama (`getBranchColor` de `arbol/config.js`) o por tipo (`TYPE_COLOR`: familia apagada/cálida, documentada en `design-system.html` §06 y duplicada en los badges/chips de `wiki.css` — cambiar siempre en ambos); los nodos **con contenido legible** (nota/página/post) llevan un **anillo `--accent`**; las aristas `rel:"familia"` van más tenues (opacidad 0.18 vs 0.4) que las de menciones/enlaces; la hoja de estilos se re-aplica al alternar día/noche (MutationObserver sobre `data-theme` → tema vivo); los **hubs** (grado ≥ `HUB_DEG`) muestran el nombre siempre, **todos** al acercar el zoom (> `ZOOM_LABELS`) y los **vecinos** al hover; nombres con **tamaño fijo en pantalla** (se recalcula `font-size` inverso al zoom); hover ilumina las aristas del nodo. El **laboratorio** (`lab-grafo.html`) deja afinar todos estos parámetros en vivo y exporta la receta. Clic → **panel lateral** (`#wikiPanel`) con relaciones + botones "Leer …"/"Ver en árbol"; el botón **Leer abre un modal** (`#wikiModal`) que muestra **solo el contenido editorial** (texto, imágenes con lightbox, Mermaid) — las relaciones **no se duplican**: el modal se ancla a la izquierda y deja el `#wikiPanel` a la derecha (backdrop uniforme, panel elevado `z-index 1001`; en mobile el modal va a pantalla completa y el panel a drawer). El modal carga `lightbox.js` y Mermaid **vendoreado** (`assets/js/vendor/mermaid.min.js`, build UMD inyectado como `<script>` perezoso — el ESM de mermaid está partido en chunks y no se puede vendorear en un archivo) y re-ejecuta Mermaid tras inyectar el HTML; la página directa hace lo propio en un script inline del template. La tipografía de lectura (`.wiki-page-content`) está documentada en `design-system.html` (sección 06). Filtro por familia (vía ⌘K, sub-menú «Filtrar por familia…»), leyenda, zoom. Lee `?focus=<id>` (foco en el grafo) y `?read=<id>` (foco + abre el modal de lectura directamente); expone `window.__personaFocus` y `window.__wikiRead`.

Para agregar contenido: crear `content/wiki/<slug>.md` (lugar/fuente/evento/tema), editar `content/personas/p{id}.md`, o poner `wiki: "p…, <slug>…"` en el frontmatter de un post; usar `[[…]]`/menciones para enlazar, `![[archivo]]` (en `assets/images/wiki/`) para imágenes y bloques ```mermaid para diagramas, y correr `npm run build`.

### Formulario Colaborar (`colaborar.html`)

Formulario de comentarios/aportes que **POSTea a un Google Apps Script** (`ENDPOINT` en el `<script>`; `mode: 'no-cors'`, así que el cliente no lee la respuesta). El Apps Script guarda en una Google Sheet y manda mail de aviso. Anti-spam en capas: **honeypot** (`_gotcha`) + **traba de tiempo** (2.5 s) + **Cloudflare Turnstile**. La **Site Key** de Turnstile es pública y vive en el HTML (`data-sitekey`); la **Secret Key** se verifica server-side en el Apps Script (`siteverify`), guardada en **Script Properties** (`TURNSTILE_SECRET`) — nunca en el repo. La verificación es *fail-open* (ante error técnico no bloquea). **Gotcha:** el Apps Script necesita autorizar el scope de `UrlFetchApp`, y tras editarlo hay que re-deployar (**Manage deployments → New version**) para que la URL `/exec` corra el código nuevo.

### Family tree (`arbol.html`)

The tree is modularized into ES modules under `assets/js/arbol/` and uses **D3.js v7** for SVG rendering with zoom/pan:

```
assets/js/arbol/
  ├── config.js    — CARD/MARRIAGE_NODE dimensions, TRANSITION_MS, getBranchColor()
  ├── data.js      — loadData(): fetches assets/data/arbol.json
  ├── store.js     — reactive focus/selection state (setFocus, setSelected)
  ├── structure.js — buildMarriageStructure(): parses personas+matrimonios into nodes
  ├── layout.js    — calculateLayout(): positions nodes by generation/order, exports VGAP
  ├── render.js    — initTree(), render(), recenterOn(), zoomIn/Out() — D3 SVG rendering
  ├── panel.js     — side panel con la ficha de la persona, sin pestañas (investigación **y media** viven en la Wiki; la ficha cierra con «Documentos e investigación (N) en la wiki» → `wiki.html?read=<id>` si hay media, `?focus=<id>` si no)
  ├── timeline.js  — modal «Línea de tiempo» por persona (se abre desde el botón del hero de panel.js)
  ├── search.js    — name search UI
  └── keyboard.js  — keyboard shortcuts
```

Styles are in `assets/css/arbol.css`. The HTML (`arbol.html`) has no inline CSS or JS.

El toolbar del árbol tiene un **botón ⓘ** (junto al zoom) que abre un popover (`.tree-info-pop`) con los atajos de teclado, el hint de ⌘K y la nota del clic-para-reorganizar — es la única documentación de atajos del sitio (antes vivía en `sobre.html`). Oculto en ≤600px.

**Panel inspector (`panel.js` + `.tree-panel`):** lenguaje editorial coherente con el blog — hero sobre superficie clara (nombre en Source Serif 4, años en serif cursiva), badge de estado tipo chip, secciones en cards blancas. En desktop el panel flota como tarjeta con **gaps de 5mm tipo i3** (el fondo de puntos vive en `.tree-wrapper` y se ve en los gaps). El botón "Ampliar panel" del footer alterna el estado `.is-expanded`, que hace que el panel ocupe todo el área dejando solo el gap de 5mm (toggle a "Volver al árbol"). **Esta expansión y los gaps son solo desktop** (`@media max-width: 960px` los desactiva: el panel vuelve a ser un drawer overlay a pantalla completa y el footer se oculta).

**Modal «Línea de tiempo» (`timeline.js`):** abre desde el botón del hero del panel y ubica a la persona —con su ascendencia y descendencia— en una columna central (eje temporal vertical) contra hitos históricos a la izquierda. A la derecha, un **panel de detalle fijo** (master-detail) que sigue al hover/scroll. Los hitos viven en el array `WORLD_EVENTS` (cada uno con `wiki` = título de artículo) y traen imagen + resumen en vivo vía `fetchWiki()` (REST de es.wikipedia, con caché en `sessionStorage`). La franja superior («slot-machine») muestra banderas de dónde nació/creció/vivió/murió cada persona; el país sale de `getCountry()` por regex sobre los lugares, con un mapa `HARDCODED_GEO` (por id) para personas sin datos de residencia (hoy p1/p3/p4 → España). Regla vivo/muerto: `DEAD_CUTOFF = 1941` (sin defunción y nacido antes → fallecido). El parentesco con la persona en foco se nombra hasta «chozno» (5.ª gen.) y luego por generación exacta. **No está disponible en pantallas ≤960px** (`TIMELINE_MIN_WIDTH`): el botón de la ficha, la acción del ⌘K y `openTimeline()` se inhiben.

**Data source:** `data/arbol.db` (SQLite) is the source of truth. At build time, `scripts/build.js` calls `scripts/export_arbol.py`, which reads the DB and writes `assets/data/arbol.json`. The tree page only ever reads the static JSON — it never touches the DB directly.

**Data schema** — `assets/data/arbol.json` root structure:
```json
{
  "personas":    [ <Persona>, ... ],
  "matrimonios": [ <Matrimonio>, ... ]
}
```

Key `Persona` fields: `id` (format `p<n>`), `name`, `gender` (`"M"`/`"F"`/`""`), `birth_date`, `birth_place`, `death_date`, `death_place`, `father_id`, `mother_id`, `branch` (determines card color), `generation`, `sort_order`, `vivo`, `photo_url`, `notes`, `sources`, `status`, `media: []`.

Key `Matrimonio` fields: `id` (format `m<n>`), `spouse1_id`, `spouse2_id`, `marriage_date`, `marriage_place`, `divorce_date`, `notes`.

Each `Persona` embeds its `media` array (type `"photo"` or `"document"`) with fields: `id` (format `med<n>`), `url`, `type`, `caption`, `date`, `source_label`, `group_label`, `group_order`.

All dates are stored as ISO partial strings (`"YYYY"`, `"YYYY-MM"`, or `"YYYY-MM-DD"`) in both the DB and the exported JSON. Children are derived at runtime from `father_id`/`mother_id` — they are not stored as a list.

See `data/README.md` for the full schema reference and DB table definitions.

**Media files:**
- Fotos: `assets/images/personas/` — WebP, naming: `p26-descripcion.webp`
- Documentos: `assets/docs/personas/` — naming: `p26-acta-nacimiento.pdf`

Run `npm run optimize-personas` to convert images to WebP before committing.

### Deploy script

`scripts/update-and-deploy.js` runs `git pull --rebase --autostash`, then `build()`, then **`git add -A`** (stages everything not covered by `.gitignore`, deletions included), commits and pushes. Since it's `-A` and not a selective list, anything that shouldn't ever reach the public repo **must be `.gitignore`d** — there's no other safety net.

Raw image files (`.jpg`, `.png` originals) in `assets/images/` are conventionally left uncommitted by habit, but nothing stops `git add -A` from picking them up if they're not gitignored — optimize to WebP before running `npm run deploy`.

### Material privado (no publicable)

`claude_mira_aqui/` (raíz del repo, gitignored) es una carpeta de intercambio para archivos que el usuario deja para que el agente los procese pero que **nunca deben llegar al repo público**: escaneos con datos personales (actas, documentos de identidad), fotos bajadas de redes sociales sin permiso de republicación, etc. Al terminar de extraer la información relevante (volcarla a una nota de investigación o a la base), el archivo se queda ahí — no se mueve a ninguna carpeta trackeada. Mismo criterio para cualquier otro archivo sensible que aparezca suelto en el repo (p. ej. una foto en `content/pendiente-media/` sin permiso de uso): moverlo a `claude_mira_aqui/`, nunca dejarlo en una ruta trackeada.

### Images

- **Originals**: `assets/images/original/` (gitignored) — also any loose `.jpg`/`.png` in `assets/images/` are not committed by the deploy script
- **Cards** (280×380 approx WebP): `assets/images/cards/` — used in `blog-entries.json` and home cards
- **Post images**: `assets/images/posts/` — referenced in Markdown post bodies
- **Personas**: `assets/images/personas/` — person photos for the family tree panel
- **Avatars**: `assets/images/avatars/`

In Markdown posts, Obsidian-style `![[filename.jpg]]` syntax is auto-converted to `../../assets/images/posts/filename.jpg` during build.

## Frontend Design

When building or significantly changing UI, use the skill defined in `frontend-design/SKILL.md`. Key rules:

- Pick one visual direction and commit to it — do not mix aesthetics
- Define type hierarchy, color variables, spacing rhythm, and layout logic before coding
- Flat empty backgrounds, generic card grids, and interchangeable SaaS patterns are anti-patterns here
- Motion should be meaningful: one well-directed sequence beats scattered micro-interactions
- Preserve the existing design system when working inside an existing page

**Visual consistency is mandatory.** Every page must use the same fonts, color tokens, spacing values, and component patterns documented in `design-system.html`. When a visual change deviates from what's documented (new color, new font size, new spacing, new component variant), **update `design-system.html` immediately** — it is the single source of truth for the site's visual language. Never introduce ad-hoc styles that aren't reflected there.

## Site design system

All pages use a **top-nav layout** (the old two-column sidebar was retired in the 2026-06 "CMZO" redesign). The header `<header class="cmzo-top">` is left empty in the HTML and **built at runtime by `assets/js/nav.js`**, which reads the `<body>` data attributes:

- `data-section="home|blog|gen|lab"` — top-level section. Also accepts a "loose" value (e.g. `changelog`) with `data-section-label` for pages outside the four sections (`cmzo /cambios`).
- `data-page="arbol|wiki|fuentes|colaborar"` — sub-page inside `gen` (renders `cmzo /gen /arbol`). Lab ya no es sub-página de gen: usa `data-section="lab"` + `data-page-label="grafo|fractales|editorial"`.
- `data-lang-switch` (presence) — render the language selector (only where switching does something, i.e. the home; `colaborar` keeps its own in-page selector).

nav.js renders a **navigable breadcrumb** (`~/cmzo / gen / arbol` — the `~/cmzo` wordmark links to the home, the rest are links except the current segment) anchored left next to the page sections, then an elastic spacer, then the right zone — **"Variante A" layout**: search pill (⌘K, injected by `command-palette.js`) · vertical line · tools box (`.cmzo-tools`: language selector · theme toggle · GitHub), with thin vertical dividers (`.cmzo-vr`). The CMZO nav/home visual layer lives in **`assets/css/home.css`** (linked after `styles.css` on every page); CSS variables `--mono`/`--sans` (IBM Plex Mono/Sans) are set on `body` there; **`--display` (Fraunces) lives in `:root` of `styles.css`**, because the direct wiki pages load `styles.css` but not `home.css`.

Page shells: content pages use `<main class="cmzo cmzo-wrap cmzo-page">` (centered, scrollable); app pages (árbol, wiki) use `.cmzo-app` (full-bleed canvas that fills the viewport under the nav); the footer is `.cmzo-foot`. The legacy `.site-nav`/`.site-body`/`.site-sidebar`/`.site-main`/`.site-footer` classes (still in `styles.css`) survive **only in the direct wiki pages** (`content/templates/wiki-template.html` → `dist/wiki/*.html`), which still use the pre-CMZO shell (`sobre.html`, the last standalone legacy page, was deleted on 2026-07-07). Mobile (≤760px): the top bar goes **minimal** — search collapses to just the lupa icon + the theme toggle; the inline sections (`.cmzo-mainnav`) and the GitHub link hide. Everything else lives in the slide-in **drawer** (`assets/js/nav-drawer.js`), restyled to the CMZO look (IBM Plex, `~/cmzo` wordmark): Inicio / Blog / **Lab** / Genealogía / Árbol / Wiki / Fuentes + Colaborar / Cambios + **GitHub**. Colaborar/Cambios are hidden from the footer on mobile (they're in the drawer). No page has an `og:image` — the share card is text-only (title + description) on purpose.

**Color palette (light mode):**

| Token | Value | Use |
|---|---|---|
| `--bg` | `#f6f6f4` | General background |
| `--surface` | `#ffffff` | Content surface (site-main) |
| `--border` | `#e8e8e6` | Borders and dividers |
| `--text` | `#1a1a1a` | Body text |
| `--muted` | `#5a5040` | Secondary text, metadata (warm brown-gray) |
| `--accent` | `#2d4a3e` | Emphasis, hover, links (verde botella) |
| `--on-accent` | `#cad7d0` | Text on accent-colored backgrounds |

**Dark mode** (`[data-theme="dark"]`) overrides all tokens: `--bg: #17181a`, `--surface: #1e2022`, `--border: #303336`, `--text: #e9eaec`, `--muted: #9a9ea3`, `--accent: #ddd8cd`, `--on-accent: #1a1a18`. The ground is a deliberately neutral graphite — **not** brown/sepia (tried in 2026-08, rejected) and not the old slate blue. The accent has **no hue at all**: any green on a dark ground reads as a hacker terminal, so colour is reserved for the `--tag-*` families, where it carries meaning. Light mode keeps the bottle green. Applied via:
- Anti-flash init script inline in `<head>` of every page (reads `localStorage["theme"]`, falls back to `prefers-color-scheme`)
- `assets/js/theme.js` — injects the sun/moon toggle button into the nav tools box (before the GitHub link inside `.cmzo-tools`); persists choice to `localStorage`; listens to `matchMedia` change events for system-preference tracking

**Typography:**

All fonts are **self-hosted** in `assets/fonts/*.woff2` (latin + latin-ext subsets). Loaded via `assets/css/fonts.css`, imported at the top of `styles.css` — no Google Fonts dependency.

Since 2026-08 the site is **entirely serif**: Fraunces for titles, Source Serif 4 for everything else, and monospace only inside code blocks. The tokens `--display`, `--sans` and `--mono` all live in `:root` of `styles.css` (not `home.css`, which the direct wiki pages don't load). Candidate display faces still being evaluated live in `assets/css/fonts-candidatas.css`, loaded **only** by `lab-editorial.html`.

| Font | Weights | Use |
|---|---|---|
| Fraunces | 500, 600, 700, 800 | **Titles across the whole site** (h1, h2, h3, card titles, section heads), `--display`. Section-level h2s are set in **small caps** (`font-variant-caps: small-caps` + `letter-spacing: 0.04em`); card titles and page h1s are not. Replaced Hanken Grotesk in 2026-08. |
| Hanken Grotesk | 500, 600, 700, 800 | Retired as the title face; kept self-hosted as the `--display` fallback |
| Source Serif 4 | 400, 400i, 600, 700 | **Everything that isn't a title or code**: body text, nav, buttons, labels, tag pills, metadata, tables. Since 2026-08 `--sans` and `--mono` are both aliases of it, so the ~150 rules that used them didn't have to be rewritten. |
| JetBrains Mono | 400, 500 | Code blocks — the only monospaced type left on the site |
| IBM Plex Mono / IBM Plex Sans / Inter | — | Retired in 2026-08 when the site went all-serif. Still self-hosted (`fonts.css`) but no rule requests them. |

**Layout constants:** top-nav (`.cmzo-top-inner`) `height: 58px`, content max-width `1120px` (`.cmzo-wrap`, padding `0 40px`). Content pages add vertical breathing room via `.cmzo-page` (`flex: 1 0 auto` so the page grows with content and never lets the footer overlap, since `body` is a fixed-height flex column). App pages use `.cmzo-app` (`flex: 1; overflow: hidden`). Mobile breakpoint `760px`: inline sections hide, hamburger drawer takes over. Blog-post article grid still switches to two columns when `aside` content is present.
