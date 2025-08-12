# Web Genealogía - Matías Clemenzo

Sitio web personal para genealogía, historias y memoria familiar.

## 📝 Gestión de Posts

### Crear un nuevo post
1. Crear archivo `.md` en la carpeta `posts/`
2. Ejecutar: `node scripts/build.js`
3. El post aparecerá automáticamente en la home y en el blog

### Borrar un post completamente

**Opción 1: Script automático (recomendado)**
```bash
# Listar todos los posts
node scripts/delete-post.js --list

# Borrar un post específico
node scripts/delete-post.js nombre-del-post
```

**Opción 2: Proceso manual**
1. Borrar `posts/nombre-del-post.md`
2. Borrar `blog/nombre-del-post.html`
3. Editar `data/blog-entries.json` para remover la entrada
4. Ejecutar `node scripts/build.js` para regenerar

### ¿Por qué el proceso completo es necesario?

- **`posts/`**: Contiene los archivos Markdown originales
- **`blog/`**: Contiene los archivos HTML generados
- **`data/blog-entries.json`**: Contiene la metadata que aparece en la home
- **Home**: Lee desde `blog-entries.json`, no desde los archivos HTML

Si solo borras el archivo HTML, la tarjeta seguirá apareciendo en la home porque la información está en el JSON.

## 🚀 Comandos útiles

```bash
# Generar todos los posts
node scripts/build.js

# Listar posts disponibles
node scripts/delete-post.js --list

# Borrar un post
node scripts/delete-post.js nombre-del-post

# Servidor local
python3 -m http.server 8000
# o
npx serve

# Panel de administración (desarrollo local)
# Abrir admin.html en el navegador
```

## 🌐 Despliegue en producción

### Gestión de posts en el servidor

**Opción 1: Gestión local + Deploy (Recomendada)**
```bash
# En tu computadora
node scripts/delete-post.js ejemplo-post
node scripts/build.js
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

### Hosts recomendados
- **GitHub Pages**: Subir archivos estáticos
- **Netlify**: Deploy automático desde Git
- **Vercel**: Deploy automático desde Git
- **Cualquier servidor web**: Solo archivos estáticos

## 📁 Estructura del proyecto

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
