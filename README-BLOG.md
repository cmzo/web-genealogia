# Guía para Agregar Posts al Blog

Este documento explica cómo convertir archivos Markdown (.md) y publicarlos en el blog usando el script `add-post.js`.

## 🚀 Uso Rápido

```bash
# Agregar un post con front matter existente
node scripts/add-post.js archivo.md

# Agregar front matter automáticamente si no existe
node scripts/add-post.js archivo.md --add-frontmatter

# Ver ayuda completa
node scripts/add-post.js --help
```

## 📝 Preparar un Archivo Markdown

### 1. Front Matter Requerido

Todo archivo debe tener front matter al inicio:

```yaml
---
title: "Título del Post"
description: "Descripción del post para SEO"
image: "/assets/images/cards/nombre-imagen.webp"
category: "investigacion"
date: "28/08/2024"
tags: "tag1, tag2, tag3"
featured: true
kicker: "Descripción corta y atractiva"
---
```

### 2. Campos Obligatorios

- `title`: Título del post
- `kicker`: Descripción corta y atractiva

### 3. Campos Opcionales

- `description`: Para SEO (si está vacío, se usa el kicker)
- `image`: Imagen de portada (por defecto usa clemenzo-por-el-mundo.webp)
- `category`: Categoría del post (por defecto "general")
- `date`: Fecha en formato DD/MM/YYYY
- `tags`: Tags separados por comas
- `featured`: true/false para destacar el post
- `slug`: Se genera automáticamente del título si no se especifica

## 🖼️ Agregar Imágenes

### 1. Optimizar Imágenes

1. Coloca tu imagen original en `img/original/`
2. Ejecuta el script de optimización:
   ```bash
   node scripts/optimize-images.js
   ```
3. Mueve las imágenes optimizadas a la carpeta correcta:
   ```bash
   mv img/nombre-imagen.webp assets/images/cards/
   mv img/nombre-imagen-thumb.webp assets/images/cards/
   ```

### 2. Actualizar Front Matter

Actualiza la ruta de la imagen en el front matter:
```yaml
image: "/assets/images/cards/nombre-imagen.webp"
```

## 🔄 Proceso Completo

1. **Preparar imagen** (si es necesaria):
   ```bash
   # Coloca imagen en img/original/
   node scripts/optimize-images.js
   mv img/imagen.webp assets/images/cards/
   ```

2. **Agregar post**:
   ```bash
   node scripts/add-post.js mi-archivo.md
   ```

3. **Publicar cambios**:
   ```bash
   npm run deploy
   ```

## 📁 Estructura de Archivos

```
content/posts/               # Archivos Markdown fuente
├── mi-post.md
└── otro-post.md

dist/blog/                   # HTML generado
├── mi-post.html
└── otro-post.html

assets/data/
└── blog-entries.json       # Índice de posts para el sitio

assets/images/cards/         # Imágenes optimizadas
├── imagen.webp
└── imagen-thumb.webp
```

## 🔧 Comandos Útiles

```bash
# Solo generar HTML sin agregar nuevo post
node scripts/build.js

# Ver archivos del blog generados
ls -la dist/blog/

# Ver entradas del blog registradas
cat assets/data/blog-entries.json

# Limpiar archivos temporales
rm -rf dist/blog/*.html
```

## ⚠️ Notas Importantes

- Los archivos se copian a `content/posts/` con slug normalizado (sin espacios ni caracteres especiales)
- Si un archivo ya existe en `content/posts/`, no se sobrescribe
- El script genera automáticamente un slug único basado en el título
- Las imágenes deben estar en formato WebP para mejor rendimiento
- El sistema respeta la estructura existente del blog

## 🎯 Ejemplos

### Archivo con Front Matter Completo

```markdown
---
title: "Historia de la Familia Clemenzo"
description: "Un recorrido por las generaciones de la familia"
image: "/assets/images/cards/familia-clemenzo.webp"
category: "investigacion"
date: "15/12/2024"
tags: "genealogia, familia, historia"
featured: true
kicker: "Descubre la fascinante historia de varias generaciones"
---

# Historia de la Familia

Contenido del post aquí...
```

### Archivo Sin Front Matter

```markdown
# Mi Post Sin Metadatos

Este archivo será procesado con --add-frontmatter
```

Se convertirá automáticamente en:

```markdown
---
title: "Mi Post Sin Metadatos"
description: ""
image: "/assets/images/cards/clemenzo-por-el-mundo.webp"
category: "general"
date: "28/08/2024"
tags: ""
featured: false
kicker: ""
---

# Mi Post Sin Metadatos

Este archivo será procesado con --add-frontmatter
```
