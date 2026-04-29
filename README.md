# Genealogía Clemenzo

Sitio web personal de investigación genealógica — historias, documentos y árbol familiar.

**→ [cmzo.github.io/web-genealogia](https://cmzo.github.io/web-genealogia/index.html)**

---

## Tecnologías

| Capa | Herramienta |
|---|---|
| Estructura | HTML5 semántico |
| Estilos | CSS3 (Grid, Flexbox, custom properties) |
| Scripts | Vanilla JavaScript |
| Build | Node.js |
| Contenido | Markdown con front matter |
| Árbol genealógico | D3.js v7 |
| Hosting | GitHub Pages |
| Imágenes | WebP (optimizadas con sharp) |

---

## Frontend

### Dirección visual

**Editorial + Documental mínimo.** Tipografía con carácter, paleta cálida, sin elementos decorativos. El contenido al centro.

### Paleta de colores

| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#f5f2ec` | Fondo general |
| `--surface` | `#fdfcf9` | Superficie de contenido (site-main) |
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

- Nav fija: `height: 52px`, `position: sticky`
- Sidebar: `width: 160px`, `position: sticky`
- Dos columnas: sidebar + contenido (`grid-template-columns: 160px 1fr`)
- Article grid: una columna por defecto, dos columnas cuando hay contenido en el aside

---

## Comandos

```bash
# Build: compila Markdown → HTML y regenera blog-entries.json
npm run build

# Dev: build + servidor en http://localhost:8000
npm run dev

# Gestión de posts
npm run list-posts
npm run delete-post <slug>

# Optimización de imágenes (requiere sharp)
npm run optimize-images

# Deploy a GitHub Pages
npm run deploy
```

---

## Pipeline del blog

1. Escribir post en `content/posts/<slug>.md` con front matter YAML
2. `npm run build` → genera `dist/blog/<slug>.html` usando `content/templates/post-template.html`
3. El build regenera `assets/data/blog-entries.json` (índice que lee `blog.html` en runtime)
4. Commitear `dist/` — GitHub Pages lo sirve directamente

### Front matter disponible

```yaml
title: "..."
kicker: "..."          # subtítulo visible sobre el título
description: "..."
image: "assets/images/cards/foo.webp"
category: "investigación"
date: "2024-08-17"
tags: "tag1, tag2"
featured: true
slug: "mi-slug"        # por defecto: nombre del archivo sin .md
aside: |               # opcional — contenido lateral (soporta Markdown)
  Texto o imagen en el sidebar
```

---

## Estructura

```
web-genealogia/
├── assets/
│   ├── css/styles.css          # Sistema de diseño completo
│   ├── data/blog-entries.json  # Índice de posts (generado por build)
│   └── images/
│       ├── cards/              # Imágenes de tarjetas (.webp)
│       ├── posts/              # Imágenes de artículos
│       ├── avatars/
│       └── original/           # Originales (gitignored)
├── content/
│   ├── posts/                  # Fuentes Markdown
│   └── templates/post-template.html
├── dist/blog/                  # HTML generado (commitear)
├── scripts/                    # build.js, delete-post.js, optimize-images.js
├── docs/                       # REDESIGN.md y documentación interna
├── frontend-design/SKILL.md    # Guía de diseño frontend
├── index.html
├── blog.html
├── archivo.html                # Archivo familiar (Google Sheets)
├── arbol-matrimonios.html      # Árbol genealógico (D3.js)
├── francisco.html
├── quien-soy.html
└── changelog.html
```

---

## Despliegue

El sitio está desplegado en GitHub Pages desde la rama `main`. Para actualizar producción:

```bash
npm run build        # regenerar posts si hubo cambios en Markdown
git add .
git commit -m "..."
git push origin main
```

O directamente con el script de deploy:

```bash
npm run deploy
```
