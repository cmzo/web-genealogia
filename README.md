# Web Genealogía - Sitio Personal de Matías Clemenzo

Sitio web de genealogía y memoria familiar con sistema de blog basado en Markdown, diseño minimalista inspirado en Notion.

## 🌟 Características

- **Diseño minimalista** inspirado en Notion
- **Sistema de blog** con Markdown
- **Tarjetas dinámicas** en la home
- **Búsqueda y filtros** por categorías
- **Aside dinámico** para imágenes
- **Responsive design** completo
- **Build automático** desde Markdown

## 🚀 Tecnologías

- **HTML5** semántico
- **CSS3** con variables y Grid/Flexbox
- **JavaScript** vanilla (ES6+)
- **Markdown** para contenido
- **Node.js** para build system
- **D3.js** para visualización del árbol genealógico

## 📁 Estructura del Proyecto

```
web-genealogia/
├── index.html              # Página principal (tarjetas dinámicas)
├── blog.html               # Lista de todos los posts
├── styles.css              # Estilos principales
├── package.json            # Dependencias y scripts
├── README.md               # Documentación
├── .gitignore              # Archivos ignorados por Git
├── posts/                  # Archivos Markdown
│   ├── francisco-misterio.md
│   └── ejemplo-post.md
├── templates/              # Template HTML para posts
│   └── post-template.html
├── scripts/                # Scripts de build
│   └── build.js
├── blog/                   # HTML generado (gitignored)
├── data/                   # Datos y JSON generado
│   ├── arbol.js
│   └── blog-entries.json   # (gitignored)
└── img/                    # Imágenes del sitio
    ├── matias.png
    ├── francisco.png
    └── ...
```

## 🛠️ Instalación y Uso

### Prerrequisitos
- Node.js (versión 14 o superior)
- npm

### Instalación
```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/web-genealogia.git
cd web-genealogia

# Instalar dependencias
npm install
```

### Desarrollo
```bash
# Generar posts desde Markdown
npm run build

# Modo watch (auto-rebuild al cambiar archivos)
npm run watch

# Desarrollo con servidor local
npm run dev
```

## 📝 Crear Nuevos Posts

### 1. Crear archivo Markdown
Crear archivo en `/posts/mi-post.md`:

```markdown
---
title: "Título del Post"
description: "Descripción para las tarjetas"
image: "img/mi-imagen.png"
category: "categoria"
date: "2024-01-15"
tags: "tag1, tag2, tag3"
featured: true
kicker: "Texto pequeño arriba del título"
aside: |
  ![Mi imagen](../img/mi-imagen.png)
  
  *Descripción de la imagen*
---

# Contenido del post

Escribe tu contenido en Markdown...
```

### 2. Generar el blog
```bash
npm run build
```

### 3. ¡Listo!
El post aparece automáticamente en:
- Home (si es `featured: true`)
- Página de blog
- Búsqueda y filtros

## 🎨 Metadatos Disponibles

| Campo | Requerido | Descripción |
|-------|-----------|-------------|
| `title` | ✅ | Título del post |
| `kicker` | ✅ | Texto pequeño arriba del título |
| `description` | ❌ | Descripción para tarjetas |
| `image` | ❌ | Imagen de la tarjeta |
| `category` | ❌ | Categoría del post |
| `date` | ❌ | Fecha de publicación |
| `tags` | ❌ | Tags separados por comas |
| `featured` | ❌ | Si es destacado (true/false) |
| `slug` | ❌ | URL del post (auto-generado) |
| `aside` | ❌ | Contenido a la derecha (Markdown) |

## 🌐 Funcionalidades

### Home Dinámica
- **Tarjetas automáticas** que cargan desde JSON
- **Posts destacados** aparecen automáticamente
- **Fallback seguro** si no carga el JSON
- **Loading state** elegante

### Página de Blog
- **Lista de todos los posts** con diseño de tarjetas
- **Búsqueda en tiempo real** por título, descripción y tags
- **Filtros por categoría** automáticos
- **Contador de resultados**
- **Diseño responsive**

### Sistema de Build
- **Markdown → HTML** automático
- **Aside dinámico** para imágenes a la derecha
- **JSON automático** con metadatos
- **Watch mode** para desarrollo

## 🎯 Características del Diseño

- **Tipografía**: Inter (sans-serif) + Source Serif 4 (serif)
- **Paleta de colores**: Notion-like (grises, azules suaves)
- **Layout**: Grid responsive con Flexbox
- **Imágenes**: Lazy loading y optimización automática
- **Accesibilidad**: ARIA labels y navegación por teclado

## 🔧 Scripts Disponibles

```bash
npm run build    # Generar posts desde Markdown
npm run watch    # Auto-rebuild al cambiar archivos
npm run dev      # Build + servidor local
```

## 📱 Responsive Design

- **Desktop**: Grid de tarjetas adaptativo
- **Tablet**: 2 columnas
- **Móvil**: 1 columna
- **Navegación**: Adaptativa por dispositivo

## 🚀 Despliegue

El sitio es completamente estático y se puede desplegar en:
- GitHub Pages
- Netlify
- Vercel
- Cualquier servidor web

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👤 Autor

**Matías Clemenzo**
- Email: cmzo@proton.me
- Sitio web: [web-genealogia](https://github.com/tu-usuario/web-genealogia)

## 🙏 Agradecimientos

- Diseño inspirado en Notion
- Tipografías de Google Fonts
- D3.js para visualizaciones
- Comunidad de desarrolladores web
