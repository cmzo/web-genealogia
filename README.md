# Genealogía Clemenzo - Sitio Web Personal

Sitio web personal para genealogía, historias y memoria familiar. Sistema de blog estático con Markdown, optimización de imágenes y gestión automatizada de contenido.

## 🚀 Scripts y comandos

### 📝 **Gestión de contenido**

```bash
# Generar posts desde Markdown
npm run build

# Listar posts disponibles
npm run list-posts

# Borrar un post completamente
npm run delete-post nombre-del-post

# Limpiar archivos generados
npm run clean

# Optimizar imágenes
npm run optimize-images
```

### 🌐 **Servidores de desarrollo**

```bash
# Servidor de desarrollo (build + servidor)
npm run dev

# Servidor estático
npm run serve
```

## 📋 **Explicación detallada de scripts**

### **`scripts/build.js` - Conversión Markdown a HTML**

**Función:** Convierte archivos Markdown en `content/posts/` a HTML en `dist/blog/`

**Proceso:**
1. **Lee archivos Markdown** con front matter
2. **Extrae metadatos:** título, descripción, imagen, categoría, tags, etc.
3. **Convierte Markdown a HTML** usando `marked.js`
4. **Aplica template** (`content/templates/post-template.html`)
5. **Genera archivo HTML** en `dist/blog/`
6. **Actualiza** `content/data/blog-entries.json`

**Características:**
- ✅ **Front matter parsing** para metadatos
- ✅ **Conversión Markdown** con soporte para GFM
- ✅ **Rutas automáticas** para imágenes y assets
- ✅ **Template personalizable** con variables
- ✅ **Aside content** para contenido lateral
- ✅ **Code blocks** con estilos CSS

**Ejemplo de uso:**
```bash
node scripts/build.js
# Genera: dist/blog/mi-post.html
# Actualiza: content/data/blog-entries.json
```

---

### **`scripts/delete-post.js` - Borrado completo de posts**

**Función:** Elimina completamente un post del sistema

**Proceso:**
1. **Valida** que el post existe
2. **Elimina** archivo Markdown de `content/posts/`
3. **Elimina** HTML generado de `dist/blog/`
4. **Remueve** entrada de `content/data/blog-entries.json`
5. **Regenera** JSON sin el post eliminado

**Opciones:**
```bash
# Listar posts disponibles
node scripts/delete-post.js --list

# Borrar post específico
node scripts/delete-post.js nombre-del-post
```

**Características:**
- ✅ **Borrado completo** (Markdown + HTML + JSON)
- ✅ **Validación** de existencia
- ✅ **Listado** de posts disponibles
- ✅ **Confirmación** antes de borrar
- ✅ **Manejo de errores** robusto

---

### **`scripts/optimize-images.js` - Optimización de imágenes**

**Función:** Convierte y optimiza imágenes para web

**Proceso:**
1. **Lee imágenes** de `assets/images/original/`
2. **Convierte a WebP** para mejor compresión
3. **Genera múltiples tamaños:**
   - `cards/` - Para tarjetas (280x380)
   - `posts/` - Para artículos (ancho completo)
   - `avatars/` - Para avatares (40x40)
4. **Optimiza calidad** y tamaño de archivo

**Características:**
- ✅ **Conversión automática** a WebP
- ✅ **Múltiples tamaños** según uso
- ✅ **Optimización** de calidad/tamaño
- ✅ **Preservación** de originales
- ✅ **Lazy loading** compatible

**Ejemplo de uso:**
```bash
node scripts/optimize-images.js
# Lee: assets/images/original/
# Genera: assets/images/cards/, posts/, avatars/
```

---

## 📝 **Gestión de posts**

### **Crear un nuevo post**

1. **Crear archivo** `content/posts/mi-post.md`:
```markdown
---
title: "Mi título"
description: "Descripción del post"
image: "assets/images/cards/mi-imagen.webp"
category: "categoria"
date: "2024-01-15"
tags: "tag1, tag2, tag3"
featured: true
slug: "mi-post"
kicker: "Subtítulo o descripción corta"
aside: |
  Contenido adicional para el sidebar
  ![Imagen](../../assets/images/posts/mi-imagen.png)
---

# Contenido del post

Texto en Markdown...
```

2. **Generar HTML:**
```bash
npm run build
```

3. **Verificar resultado:**
- HTML generado en `dist/blog/mi-post.html`
- Entrada agregada a `content/data/blog-entries.json`

### **Borrar un post**

```bash
# Ver posts disponibles
npm run list-posts

# Borrar post específico
npm run delete-post nombre-del-post
```

**⚠️ Importante:** El borrado es **completo e irreversible** - elimina:
- Archivo Markdown original
- HTML generado
- Entrada en el JSON de metadatos

### **¿Por qué el proceso completo es necesario?**

- **`content/posts/`**: Contiene los archivos Markdown originales
- **`dist/blog/`**: Contiene los archivos HTML generados
- **`content/data/blog-entries.json`**: Contiene la metadata que aparece en la home
- **Home**: Lee desde `blog-entries.json`, no desde los archivos HTML

Si solo borras el archivo HTML, la tarjeta seguirá apareciendo en la home porque la información está en el JSON.

---

## 🌐 **Despliegue en producción**

### **Gestión de posts en el servidor**

**Opción 1: Gestión local + Deploy (Recomendada)**
```bash
# En tu computadora
npm run delete-post ejemplo-post
npm run build
git add .
git commit -m "Borrar post ejemplo-post"
git push
```

**Opción 2: Scripts de build automático**
Algunos hosts (Netlify, Vercel) permiten ejecutar scripts durante el deploy:
```json
// package.json
{
  "scripts": {
    "build": "node scripts/build.js"
  }
}
```

**Opción 3: Panel de administración**
- Abrir `admin.html` en desarrollo local
- Ver lista de posts actuales
- Obtener comandos para borrar

### **Hosts recomendados**
- **GitHub Pages**: Subir archivos estáticos
- **Netlify**: Deploy automático desde Git
- **Vercel**: Deploy automático desde Git
- **Cualquier servidor web**: Solo archivos estáticos

---

## 📁 **Estructura del proyecto**

```
web-genealogia/
├── assets/                 # Recursos estáticos
│   ├── images/            # Imágenes organizadas
│   │   ├── cards/         # Imágenes para tarjetas (.webp)
│   │   ├── posts/         # Imágenes de artículos
│   │   ├── avatars/       # Avatares de usuarios
│   │   ├── icons/         # Iconos y logos
│   │   └── original/      # Archivos originales (gitignored)
│   ├── css/               # Estilos
│   └── js/                # JavaScript
├── content/               # Contenido dinámico
│   ├── posts/             # Posts en Markdown
│   ├── data/              # Datos JSON
│   └── templates/         # Templates HTML
├── dist/                  # Archivos generados (gitignored)
│   ├── blog/              # HTML generado
│   └── assets/            # Assets optimizados
├── scripts/               # Scripts de build
├── docs/                  # Documentación
├── index.html             # Página principal
├── blog.html              # Lista de posts
├── admin.html             # Panel de administración
└── [otros archivos HTML]
```

---

## 🛠️ **Tecnologías utilizadas**

- **HTML5** - Estructura semántica
- **CSS3** - Estilos modernos con Flexbox/Grid
- **JavaScript** - Funcionalidad interactiva
- **Node.js** - Scripts de build y automatización
- **Markdown** - Contenido de posts
- **WebP** - Optimización de imágenes
- **GitHub Pages** - Hosting estático

---

## 📄 **Licencia**

Este proyecto es personal y privado. Todos los derechos reservados.
