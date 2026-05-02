### 2 de mayo de 2026

#### Panel del árbol: rediseño visual SaaS

El panel lateral fue rediseñado con un lenguaje visual moderno. El **hero** pasa a tener el color de rama como fondo con gradiente suave y texto blanco; dos círculos decorativos semitransparentes agregan profundidad glassmorphism. El botón de cierre adopta efecto **frosted glass**. El cuerpo del panel usa fondo gris neutro claro con **cards blancas** por sección (border-radius 10px, sombra sutil) en lugar del fondo beige cálido anterior. Los tabs pasaron a estilo **flat underline** (sin pills), coherente con dashboards modernos de referencia. La grilla vita usa mini-cards individuales por campo.

### 2 de mayo de 2026

#### Panel: pestañas Persona · Investigación · Archivos

El panel lateral fue reorganizado en **tres pestañas** con roles distintos. *Persona* muestra datos biográficos, padres, matrimonios e hijos. *Investigación* renderiza un archivo Markdown individual por persona (`content/personas/<id>.md`) cargado en tiempo de ejecución — permite llevar notas de investigación detalladas con formato completo. *Archivos* muestra el contenido multimedia. El estado de investigación (`verificado`, `incompleto`, `en_proceso`, `sin_datos`) aparece como badge en el hero. La pestaña activa persiste al navegar entre personas.

### 2 de mayo de 2026

#### Investigación: prosa Markdown con estilo

Los archivos `.md` de la pestaña Investigación se renderizan con una tipografía editorial enriquecida: H1 con línea inferior gruesa, H2 con borde izquierdo en color de acento, H3 como etiqueta uppercase, listas con dash `–` en acento, `strong` en color de acento, blockquotes con fondo cálido tintado, y tablas con header diferenciado. El estilo es coherente con el sistema de diseño del sitio.

### 2 de mayo de 2026

#### Limpieza de código y portabilidad

Eliminación de 10 archivos de código muerto: scripts de migración one-time (`import_arbol.py`, `migrate_schema_v2.py`), scripts obsoletos (`build-archive.js`, `optimize-images.js`, `sync-and-deploy.cjs`), el módulo `graph.js` sin uso, e imágenes sin referencia. El módulo `path-config.js` fue simplificado: cambiar de hosting ahora requiere editar solo dos constantes (`DEPLOY_HOST`, `DEPLOY_SUBPATH`) en un solo archivo. El contrato JSON de `arbol.json` quedó documentado formalmente en `data/README.md`.

### 2 de mayo de 2026

#### Changelog en Markdown

El historial del sitio pasó de ser HTML estático a un archivo Markdown (`content/changelog.md`). La página lo carga en tiempo de ejecución via `fetch()` y lo renderiza con `marked`. Para agregar una entrada basta con editar el `.md` — sin tocar HTML.

### 2 de mayo de 2026

#### Panel del árbol: rediseño visual

El panel lateral fue ampliado de 288px a 400px. Incorpora una **franja del color de rama** en la parte superior (coherente con las tarjetas del árbol), el nombre en **Source Serif 4** a 21px, y los años de vida como subtítulo. Los títulos de sección (`Fechas y lugares`, `Padres`, `Matrimonios`) pasaron a `font-weight: 700` en color de acento. El símbolo `♦` en el cónyuge fue eliminado. Al abrir el panel, el árbol se **recentra automáticamente** en el espacio visible restante; al cerrarlo, recupera el ancho completo.

### 2 de mayo de 2026

#### Optimización de imágenes de personas

Nuevo comando `npm run optimize-personas` que convierte JPG/JPEG/PNG en `assets/images/personas/` a **WebP** usando ImageMagick. Ancho máximo 2400px, calidad 85. Elimina el original tras convertir. Idempotente: saltea archivos que ya tienen `.webp`.

### 2 de mayo de 2026

#### Gestión de archivos multimedia

Nuevo comando `delete-media <id>` en `gestionar_arbol.py`: muestra el registro, pide confirmación y elimina opcionalmente el archivo del disco. `list-media` ahora funciona sin argumentos. `add-media` antepone la ruta de directorio si se ingresa solo el nombre del archivo.

### 1 de mayo de 2026

#### Archivo familiar: rediseño completo

La página de archivo fue reescrita desde cero. Los datos ya no provienen de Google Sheets — la fuente es `arbol.json`, el mismo archivo generado por el árbol genealógico. El código anterior (~1400 líneas con estilos inline y lógica de Sheets) fue reemplazado por ~270 líneas limpias más una hoja de estilos dedicada. La tabla muestra las 55 personas ordenadas por generación, con búsqueda por nombre y rama. El modal de detalle incluye fechas, lugares, padres, notas, fuentes y multimedia agrupada.

### 1 de mayo de 2026

#### Árbol genealógico: panel lateral y búsqueda

Al hacer click en cualquier tarjeta se abre un **panel lateral** con la información completa: fechas y lugares, padres, matrimonios, hijos, notas, fuentes y archivos multimedia. Cada nombre es un link de navegación. Click en el fondo o en ✕ cierra el panel. La barra de herramientas incorpora un **buscador con autocompletado** propio: filtra mientras se escribe, navega con ↑↓ y confirma con Enter.

### 1 de mayo de 2026

#### Árbol genealógico: nuevo motor de visualización

Motor completamente nuevo basado en `d3.hierarchy()` y `d3.tree()`. El pedigree se centra en una persona y muestra **tres generaciones hacia arriba** y una hacia abajo. Tarjetas de 160×80px con franja de color por rama, nombre en dos líneas y años de vida. Conectores de **curvas cúbicas de Bezier**. Click en cualquier persona → recentrado con transición de 600ms. Zoom con Ctrl+scroll y botones +/−.

### 1 de mayo de 2026

#### Árbol genealógico: migración a base de datos local

Los datos migraron de Google Sheets a **SQLite** (`data/arbol.db`). Nueva tabla `personas` con campos extendidos; tabla `matrimonios` como entidad propia (soporta múltiples matrimonios); tabla `media` para fotos y documentos por persona. El script `export_arbol.py` genera el JSON estático en cada build. `gestionar_arbol.py` cubre toda la gestión desde la terminal.

### 29 de abril de 2026

#### Inicio: rediseño editorial

Texto introductorio centrado en Source Serif 4, fotografía panorámica del **Valle del Ródano**, escudos heráldicos de Valais, Clemenzo y Ardon. Sección de última entrada que se actualiza automáticamente con cada nuevo post del blog.

### 29 de abril de 2026

#### Navegación mobile

En pantallas menores a 960px la sidebar desaparece y los links de navegación pasan al nav superior. Footer centrado y apilado verticalmente.

### 29 de abril de 2026

#### Blog: tarjetas tipográficas

Las tarjetas del blog dejaron de mostrar imágenes. Diseño puramente tipográfico: categoría, título, descripción y fecha. Se eliminó el glitch visual donde las tarjetas aparecían grandes al cargar.

### 29 de abril de 2026

#### Rediseño editorial del sitio

Rediseño completo del frontend. Layout de dos columnas con **sidebar de navegación persistente** en todas las páginas. Nueva paleta de colores cálidos, tipografía editorial basada en **Source Serif 4**, footer simplificado. Árbol genealógico modularizado en cinco módulos ES; CSS extraído a archivo propio; HTML reducido a 81 líneas sin código inline.

### 29 de agosto de 2025

#### Árbol genealógico interactivo

Primera versión del árbol genealógico con visualización interactiva. Permite navegar por las ramas familiares y explorar los vínculos entre generaciones.

### 10 de agosto de 2025

#### Lanzamiento del sitio

Primera versión pública. Incluye presentación personal, archivo de documentos y fotografías, y el inicio del blog de investigación genealógica.
