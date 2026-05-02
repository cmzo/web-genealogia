### 2 de mayo de 2026

#### Árbol: recentrado automático al abrir y cerrar el panel

Al hacer click en una persona del árbol, la vista se recentra automáticamente teniendo en cuenta el espacio que ocupa el panel lateral, de modo que la persona seleccionada queda centrada en el área visible restante. Al cerrar el panel, el árbol se recentra de nuevo al ancho completo. Ambas transiciones usan la misma animación de 600ms que el resto de la navegación.

---

### 2 de mayo de 2026

#### Panel de detalle y modal de archivo: más espacio y fotos agrupadas

El panel lateral del árbol fue ampliado de 288px a 400px. Se aumentó el espaciado entre secciones y entre archivos multimedia, tanto en el panel del árbol como en el modal de archivo. Los documentos o fotos que forman parte de un mismo conjunto (por ejemplo, las páginas de una carta) se muestran ahora agrupados bajo un encabezado común en lugar de como ítems individuales sueltos.

---

### 2 de mayo de 2026

#### Optimización de imágenes de personas desde la terminal

Nuevo comando `npm run optimize-personas` que convierte automáticamente cualquier JPG, JPEG o PNG en `assets/images/personas/` a WebP usando ImageMagick. El ancho máximo es 2400px y la calidad 85. El original se elimina tras una conversión exitosa. El comando es idempotente: si ya existe un `.webp` con el mismo nombre base, el archivo se saltea.

---

### 2 de mayo de 2026

#### Gestión de archivos multimedia: nuevo comando delete-media

El script `gestionar_arbol.py` incorpora un nuevo comando `delete-media <id>` que muestra el registro a eliminar, pide confirmación y opcionalmente borra también el archivo del disco. El comando `list-media` ahora funciona sin argumentos y muestra todos los archivos registrados agrupados por persona. Al registrar un nuevo archivo con `add-media`, si se ingresa solo el nombre sin ruta el script antepone el directorio correspondiente automáticamente.

---

### 1 de mayo de 2026

#### Archivo: rediseño y migración a base de datos local

La página de archivo fue reescrita completamente. Los datos ya no provienen de Google Sheets: la fuente es ahora `arbol.json`, el mismo archivo generado a partir de la base de datos SQLite que usa el árbol genealógico. El código anterior (~1400 líneas con estilos inline, lógica de Google Sheets y múltiples fallbacks) fue reemplazado por una implementación de ~200 líneas en HTML y ~70 líneas en JS, más una hoja de estilos separada que sigue el sistema de diseño del sitio. La tabla muestra las 55 personas ordenadas de generación más antigua a más reciente, con búsqueda por nombre y rama. El modal de detalle muestra fechas, lugares, padres y, cuando existan, notas, fuentes, fotos y documentos vinculados desde la base de datos.

---

### 1 de mayo de 2026

#### Árbol genealógico: panel lateral y búsqueda

Al hacer click en cualquier tarjeta se abre un panel lateral (400px, deslizamiento desde la derecha) con la información completa de la persona: nombre, fechas y lugares de nacimiento y fallecimiento, padres, matrimonios con cónyuge y lista de hijos, notas, fuentes y archivos multimedia. Cada nombre en el panel es un link de navegación que recentra el árbol. Click en el fondo del árbol o en ✕ cierra el panel. La barra de herramientas incluye un buscador por nombre con autocompletado propio: filtra mientras se escribe, navega con ↑↓ y confirma con Enter.

---

### 1 de mayo de 2026

#### Árbol genealógico: nuevo motor de visualización

El árbol genealógico ahora usa un motor completamente nuevo basado en `d3.hierarchy()` y `d3.tree()`. El pedigree se centra en una persona y muestra tres generaciones hacia arriba y una hacia abajo. Las tarjetas (160×80px) tienen una franja de color por rama familiar, nombre en dos líneas y años de vida. Los conectores entre generaciones son curvas cúbicas de Bezier. Al hacer click en cualquier persona el árbol se recentra con una transición de 600ms. Zoom con Ctrl+scroll y botones +/−.

---

### 1 de mayo de 2026

#### Escudo de Valais agregado al inicio

La página de inicio muestra ahora tres escudos heráldicos en orden: Valais, Clemenzo y Ardon.

---

### 1 de mayo de 2026

#### Árbol genealógico: migración a base de datos local

Los datos del árbol dejaron de depender de Google Sheets como fuente de escritura. La fuente de verdad es ahora una base de datos SQLite local (`data/arbol.db`), con un script Python que genera el JSON estático en cada build. Agregar o editar personas se hace desde la terminal con `gestionar_arbol.py`, sin necesidad de abrir ninguna planilla externa.

- **Base de datos local:** nueva tabla `personas` con `gender`, `photo_url`, `notes`, `sources`; tabla `matrimonios` como entidad propia (soporta múltiples matrimonios por persona); tabla `media` para fotos y documentos vinculados a personas individuales.
- **Scripts Python:** `export_arbol.py` genera el JSON estático en cada build. `gestionar_arbol.py` permite agregar, editar y consultar personas, matrimonios y archivos desde la terminal.
- **Módulos JS:** `config.js`, `data.js`, `store.js`, `layout.js`, `render.js`, `panel.js` y `search.js` reemplazan la implementación anterior. El estado global usa pub/sub (`focusChange`, `selectionChange`).

---

### 29 de abril de 2026

#### Inicio: rediseño editorial

La página de inicio fue rediseñada con un texto introductorio centrado en Source Serif 4, la foto panorámica del Valle del Ródano, los escudos heráldicos de la familia Clemenzo y Ardon, y una sección de última entrada que se actualiza automáticamente con cada nuevo post del blog.

---

### 29 de abril de 2026

#### Navegación mobile

En pantallas menores a 960px la sidebar desaparece y los links de navegación (Inicio, Árbol, Archivo, Blog) pasan al nav superior. El footer en mobile queda centrado y apilado verticalmente.

---

### 29 de abril de 2026

#### Blog: tarjetas sin imagen

Las tarjetas del blog dejaron de mostrar imágenes. El diseño es ahora puramente tipográfico: categoría, título, descripción y fecha. Se eliminó también el glitch visual donde las tarjetas aparecían grandes y se achicaban al cargar, causado por imágenes que fallaban silenciosamente en producción.

---

### 29 de abril de 2026

#### Árbol genealógico: rediseño visual

Las conexiones entre generaciones pasaron de tres líneas rectas a curvas cúbicas de Bezier, usando `d3.linkVertical()`. Las tarjetas de personas fueron rediseñadas: fondo blanco, franja de color superior por rama familiar, nombre en zona fija de dos líneas, y fechas centradas.

---

### 29 de abril de 2026

#### Árbol genealógico: modularización del código

El código JavaScript del árbol genealógico fue dividido en cinco módulos ES independientes: `config.js` (constantes y colores), `data.js` (carga de datos), `structure.js` (construcción de matrimonios y vínculos), `layout.js` (posicionamiento por generación) y `render.js` (renderizado D3). El CSS específico del árbol fue extraído a su propio archivo. El HTML del árbol quedó en 81 líneas sin código inline.

---

### 29 de abril de 2026

#### Árbol genealógico: datos estáticos y limpieza de código

El árbol genealógico dejó de depender de Google Sheets en tiempo de ejecución. Los datos ahora se generan durante el build y se sirven como un archivo JSON estático, lo que elimina la dependencia de una API no oficial y mejora la velocidad de carga. Se eliminó el panel "Filtro de Familias", el código de debug (83 `console.log`), los bloques de código muerto y las versiones históricas del árbol. El script de deploy fue reescrito para hacer build + commit + push de forma automática.

---

### 29 de abril de 2026

#### Rediseño editorial del sitio

Rediseño completo del frontend. Se reemplazó la grilla de tarjetas de inicio por un layout de dos columnas con sidebar de navegación persistente. Nueva paleta de colores cálidos, tipografía editorial basada en Source Serif 4, y footer simplificado.

---

### 29 de agosto de 2025

#### Árbol genealógico interactivo

Primera versión del árbol genealógico con visualización interactiva. Permite navegar por las ramas familiares y explorar los vínculos entre generaciones.

---

### 10 de agosto de 2025

#### Lanzamiento del sitio

Primera versión pública del sitio. Incluye presentación personal, archivo de documentos y fotografías, y el inicio del blog de investigación genealógica.
