# Genealogía Clemenzo

Sitio web personal de investigación genealógica — historias, documentos y árbol familiar.

**→ [cmzo.net](https://cmzo.net)**

---

## Tecnologías

| Capa | Herramienta |
|---|---|
| Estructura | HTML5 semántico |
| Estilos | CSS3 (Grid, Flexbox, custom properties) |
| Scripts | Vanilla JavaScript (ES modules) |
| Build | Node.js |
| Contenido | Markdown con front matter YAML |
| Árbol genealógico | D3.js v7 |
| Base de datos | SQLite (`data/arbol.db`) |
| Hosting | GitHub Pages |
| Imágenes | WebP (optimizadas con ImageMagick) |

---

## Frontend

### Dirección visual

**Editorial + Documental mínimo.** Tipografía con carácter, paleta cálida, sin elementos decorativos. El contenido al centro.

### Paleta de colores

| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#f5f2ec` | Fondo general |
| `--surface` | `#fdfcf9` | Superficie de contenido (`site-main`) |
| `--border` | `#e2dbd0` | Bordes y separadores |
| `--text` | `#1c1814` | Texto principal |
| `--muted` | `#7a7060` | Texto secundario, metadatos |
| `--accent` | `#5c4a2a` | Énfasis, hover, detalles |

### Tipografía

| Fuente | Peso | Uso |
|---|---|---|
| **Source Serif 4** | 400, 600, 700 | Nav brand, títulos de artículos, cuerpo editorial |
| **Inter** | 400, 500, 600, 700 | UI, navegación, metadatos, changelog |
| **JetBrains Mono** | 400, 500 | Bloques de código |

### Layout

- Todas las páginas usan un layout de dos columnas: sidebar fija (160px) + área de contenido (`1fr`)
- Nav sticky: `height: 52px`
- Sidebar sticky: `width: 160px`
- Mobile (≤960px): sidebar oculta, links de navegación en el nav superior
- Los posts del blog usan una grilla de artículo con dos columnas cuando hay contenido `aside`

---

## Comandos rápidos

```bash
npm run build          # Compila Markdown → HTML y regenera blog-entries.json y arbol.json
npm run dev            # Build + servidor local en http://localhost:8000
npm run deploy         # Build + commit + push a GitHub Pages
```

---

## Scripts

### `npm run build` — `scripts/build.js`

Compila todos los posts Markdown en `content/posts/` a HTML en `dist/blog/` usando la plantilla `content/templates/post-template.html`. Regenera `assets/data/blog-entries.json` (índice del blog) y llama a `scripts/export_arbol.py` para regenerar `assets/data/arbol.json`.

Convierte automáticamente la sintaxis de imágenes de Obsidian (`![[archivo.jpg]]`) a Markdown estándar con ruta relativa.

```bash
npm run build
```

### `npm run dev` — build + servidor Python

Hace build y levanta un servidor HTTP en `http://localhost:8000`. Si el puerto ya está en uso, el servidor falla pero el build ya se completó; se puede levantar manualmente en otro puerto:

```bash
python3 -m http.server 8001
```

### `npm run deploy` — `scripts/update-and-deploy.js`

Corre el build, hace `git add` de todos los archivos relevantes (dist/, assets/, *.html, docs/, content/) y pushea a `main`. Los originales JPG/PNG no se incluyen — optimizar primero con `optimize-personas`.

```bash
npm run deploy
```

### `node scripts/add-post.js <archivo.md>` — agregar post al blog

Copia el archivo Markdown a `content/posts/`, ejecuta el build completo y reporta la URL del post generado. Si el archivo no tiene front matter se puede auto-generar con `--add-frontmatter`.

```bash
node scripts/add-post.js mi-articulo.md
node scripts/add-post.js mi-articulo.md --add-frontmatter
```

**Front matter disponible:**

```yaml
title: "..."
kicker: "..."          # subtítulo visible sobre el título (requerido)
description: "..."
image: "assets/images/cards/foo.webp"
category: "investigación"
date: "2024-08-17"
tags: "tag1, tag2"
featured: true
slug: "mi-slug"        # por defecto: nombre del archivo sin .md
aside: |               # opcional — contenido lateral (soporta Markdown)
  Texto en el sidebar del artículo
```

### `npm run list-posts` / `npm run delete-post <slug>` — `scripts/delete-post.js`

Lista todos los posts existentes o elimina uno por su slug (borra el `.md`, el HTML generado en `dist/blog/` y la entrada en `blog-entries.json`).

```bash
npm run list-posts
npm run delete-post investigando-francisco
```

### `npm run optimize-personas` — `scripts/optimize-personas.js`

Convierte todos los JPG, JPEG y PNG en `assets/images/personas/` a WebP usando ImageMagick. Reduce a un máximo de 2400px de ancho (sin ampliar), calidad 85. Elimina el original tras una conversión exitosa. Es idempotente: si ya existe un `.webp` con el mismo nombre base, el archivo se saltea.

**Requiere:** ImageMagick instalado (`brew install imagemagick`).

```bash
npm run optimize-personas
```

### `npm run optimize-images` — `scripts/optimize-images.js`

Convierte imágenes en `assets/images/original/` a WebP usando `sharp`. Genera versiones `card`, `thumbnail` y `avatar` con distintas dimensiones en `assets/images/`.

**Requiere:** paquete `sharp` instalado (`npm install sharp`).

```bash
npm run optimize-images
```

### `python3 scripts/export_arbol.py` — exportar árbol genealógico

Lee `data/arbol.db` y genera `assets/data/arbol.json` con la estructura `{ personas[], matrimonios[] }`. Se llama automáticamente en cada `npm run build`; usar directamente solo si se modificó la base de datos sin querer hacer un build completo.

```bash
python3 scripts/export_arbol.py
```

### `python3 scripts/gestionar_arbol.py` — gestionar la base de datos del árbol

Interfaz de terminal para administrar `data/arbol.db` sin abrir ninguna herramienta externa.

#### Personas

```bash
python3 scripts/gestionar_arbol.py list                  # listar todas las personas
python3 scripts/gestionar_arbol.py show <id>             # ver detalle de una persona
python3 scripts/gestionar_arbol.py add                   # agregar persona (interactivo)
python3 scripts/gestionar_arbol.py edit <id>             # editar persona (interactivo)
```

#### Matrimonios

```bash
python3 scripts/gestionar_arbol.py list-marriages        # listar todos los matrimonios
python3 scripts/gestionar_arbol.py add-marriage          # registrar matrimonio (interactivo)
python3 scripts/gestionar_arbol.py edit-marriage <id>    # editar matrimonio (interactivo)
```

#### Archivos multimedia (fotos y documentos)

```bash
python3 scripts/gestionar_arbol.py list-media            # listar todos los archivos multimedia
python3 scripts/gestionar_arbol.py list-media <persona_id>   # filtrar por persona
python3 scripts/gestionar_arbol.py add-media <persona_id>    # registrar archivo (interactivo)
python3 scripts/gestionar_arbol.py delete-media <media_id>   # eliminar registro (pide confirmación)
```

Al registrar un archivo con `add-media`, si se ingresa solo el nombre sin ruta el script antepone el directorio por defecto (`assets/images/personas/` para fotos, `assets/docs/personas/` para documentos). Los documentos o fotos de un mismo conjunto (p. ej. páginas de una carta) se pueden agrupar asignándoles el mismo `group_label`.

Tras cualquier modificación a la base de datos, correr `python3 scripts/export_arbol.py` o `npm run build` para reflejar los cambios en el frontend.

---

## Pipeline del blog

1. Escribir post en `content/posts/<slug>.md` con front matter YAML
2. `npm run build` → genera `dist/blog/<slug>.html` usando `content/templates/post-template.html`
3. El build regenera `assets/data/blog-entries.json` (índice que lee `blog.html` en runtime)
4. `npm run deploy` hace commit y push — `dist/` se sirve directamente desde GitHub Pages

---

## Árbol genealógico

La fuente de verdad es `data/arbol.db` (SQLite). El frontend (`arbol.html`) solo lee el JSON estático generado en build; nunca accede a la base de datos directamente.

### Módulos JS (`assets/js/arbol/`)

| Módulo | Responsabilidad |
|---|---|
| `config.js` | Constantes visuales: dimensiones de tarjetas, colores de rama, `TRANSITION_MS` |
| `data.js` | Carga `arbol.json`, construye 5 índices en memoria, expone accessors O(1) |
| `store.js` | Estado global con pub/sub: `focusPersonId`, `selectedPersonId`. Eventos: `focusChange`, `selectionChange` |
| `layout.js` | Computa posiciones X/Y para ancestros (hacia arriba) y descendientes (hacia abajo) usando `d3.tree()` |
| `render.js` | Dibuja tarjetas, nodos de matrimonio y conectores con D3. Maneja zoom/pan y recentrado |
| `panel.js` | Panel lateral de detalle: escucha `selectionChange`, renderiza HTML con fotos y links de navegación |
| `search.js` | Buscador con autocompletado: filtra mientras se escribe, navega con ↑↓, confirma con Enter |

### Schema de datos (`arbol.json`)

```
persona: { id, name, birth_date, birth_place, death_date, death_place,
           father_id, mother_id, branch, generation, order, vivo,
           notes, sources, gender, photo_url,
           media: [{ id, url, type, caption, group_label, group_order }] }

matrimonio: { id, spouse1_id, spouse2_id, marriage_date, marriage_place }
```

---

## Estructura de directorios

```
web-genealogia/
├── assets/
│   ├── css/
│   │   ├── styles.css          # Sistema de diseño global
│   │   ├── arbol.css           # Estilos del árbol genealógico
│   │   └── archivo.css         # Estilos del archivo familiar
│   ├── data/
│   │   ├── arbol.json          # Generado por export_arbol.py
│   │   └── blog-entries.json   # Generado por build.js
│   ├── images/
│   │   ├── personas/           # Fotos de personas (.webp)
│   │   ├── cards/              # Imágenes de tarjetas del blog (.webp)
│   │   ├── posts/              # Imágenes usadas en artículos
│   │   ├── avatars/
│   │   └── original/           # Originales para optimize-images (gitignored)
│   └── js/
│       ├── path-config.js      # Resuelve rutas para dev local y GitHub Pages
│       └── arbol/              # Módulos ES del árbol genealógico
├── content/
│   ├── posts/                  # Fuentes Markdown del blog
│   └── templates/
│       └── post-template.html  # Plantilla HTML para posts
├── data/
│   ├── arbol.db                # Base de datos SQLite (fuente de verdad del árbol)
│   └── README.md               # Documentación del schema
├── dist/
│   └── blog/                   # HTML generado de posts (commitear)
├── docs/
│   └── REDESIGN.md             # Seguimiento del rediseño
├── scripts/
│   ├── build.js                # Pipeline de build principal
│   ├── add-post.js             # Agrega post al blog
│   ├── delete-post.js          # Lista o elimina posts
│   ├── update-and-deploy.js    # Build + commit + push
│   ├── optimize-personas.js    # Convierte fotos de personas a WebP (ImageMagick)
│   ├── optimize-images.js      # Convierte imágenes del blog a WebP (sharp)
│   ├── export_arbol.py         # SQLite → arbol.json
│   └── gestionar_arbol.py      # CLI para gestionar arbol.db
├── index.html
├── blog.html
├── archivo.html                # Archivo familiar (datos desde arbol.json)
├── arbol.html      # Árbol genealógico interactivo (D3.js)
└── changelog.html
```
