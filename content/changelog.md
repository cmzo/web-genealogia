### 21 de junio de 2026

#### <span class="changelog-tag changelog-tag--nueva">Función nueva</span> Una navegación nueva en todo el sitio

La barra de arriba cambió de fondo. En lugar del menú lateral, ahora hay una **ruta tipo carpetas** (`cmzo / gen / árbol`) que muestra dónde estás parado y te deja volver a cualquier nivel con un clic. Las secciones principales quedaron en **inicio**, **blog** y **genealogía**, y la barra se adapta según dónde estés. Es el primer paso de un cambio de enfoque: el sitio deja de ser solo «genealogía Clemenzo» para volverse una página personal donde la genealogía es uno de los temas, no el único.

#### <span class="changelog-tag changelog-tag--nueva">Función nueva</span> La genealogía ahora tiene su propia portada

Todo lo genealógico se reunió en una **página-tablero** (`/gen`): desde ahí entrás al **árbol** —con un resumen de cuántas personas, fechas, lugares y generaciones hay documentadas—, a la **wiki**, a las **fuentes** y a **colaborar**. Antes esos accesos estaban repartidos en el menú lateral; ahora viven juntos y con más contexto.

#### <span class="changelog-tag changelog-tag--mejora">Mejora</span> Una portada más enfocada

La página de inicio se replanteó: una presentación breve del sitio, dos accesos claros —**genealogía** y **blog**— y la última entrada publicada. Menos cosas, más dirección.

#### <span class="changelog-tag changelog-tag--mejora">Mejora</span> La barra de arriba, más ordenada

El buscador (⌘ + K), el selector de idioma, el modo claro/oscuro y el enlace al código quedaron **agrupados a la derecha**, separados por líneas finas, mientras las secciones se alinean a la izquierda junto al nombre del sitio. Se ve más prolija y con menos elementos compitiendo por el centro.

#### <span class="changelog-tag changelog-tag--fix">Arreglo</span> El mapa de la Wiki aparece centrado

El grafo de la Wiki (y el del Laboratorio) ahora se **centra en la pantalla** al abrirse, en vez de quedar corrido hacia un costado.

#### <span class="changelog-tag changelog-tag--fix">Arreglo</span> Enlaces de los posts que no funcionaban

Algunos enlaces dentro de los posts del blog —al árbol, la wiki y el laboratorio— estaban rotos y daban error de página inexistente. Ahora **llevan bien** a su destino.

### 20 de junio de 2026

#### <span class="changelog-tag changelog-tag--nueva">Función nueva</span> Un laboratorio para jugar con el grafo

Hay una página nueva, el **Laboratorio del grafo**, para experimentar con el mapa: elegís cuántos puntos y cuántas conexiones, y con una serie de controles cambiás la física —cómo se repelen los nodos, cuánto se agrupan, qué tan redondo queda el conjunto, el grosor de las líneas, el brillo de los puntos— viendo el resultado al instante. Sirve para entender cómo está hecho el mapa de la Wiki y para poder reproducirlo: incluye una "receta" copiable con todos los valores.

#### <span class="changelog-tag changelog-tag--novedad">Novedad</span> Los nombres de las personas más conectadas, siempre a la vista

En el mapa de la Wiki ahora se ven por defecto los nombres de los nodos con más conexiones (los centros de cada familia), y al acercar el zoom aparecen todos. Antes los nombres solo salían al pasar el mouse y daba la sensación de que faltaba algo.

#### <span class="changelog-tag changelog-tag--fix">Arreglo</span> Los enlaces a documentos llevan al lugar correcto

Algunos enlaces de los posts que invitaban a ver los documentos llevaban a la Wiki; ahora llevan al **Árbol**, que es donde está la galería de documentos de cada persona. La Wiki guarda la investigación; el árbol, los documentos.

#### <span class="changelog-tag changelog-tag--mejora">Mejora</span> El mapa de la Wiki ahora es un círculo navegable

El grafo de la Wiki pasó de ser una maraña a un **disco ordenado**: las personas y sus documentos se acomodan solos en un círculo, agrupados por familia, igual que los mapas de conocimiento de apps como Obsidian. Los nombres aparecen **al pasar el mouse** (en reposo se ven solo los puntos, más limpio) y, al apuntar a alguien, **se iluminan las líneas** que lo conectan con su familia. El conjunto aparece con una animación suave en lugar de saltar al cargar.

#### <span class="changelog-tag changelog-tag--novedad">Novedad</span> Mover los nodos del mapa

Ahora podés **agarrar cualquier punto y arrastrarlo**: los parientes conectados lo siguen, y al soltar todo vuelve lentamente a su lugar en el círculo, con una sensación elástica. Sirve para explorar quién está unido a quién.

#### <span class="changelog-tag changelog-tag--novedad">Novedad</span> Los posts del blog, conectados con su gente

Las entradas del blog ahora aparecen en el mapa **unidas a las personas que cuentan**: «La ruina de François» queda pegado a François Clemenzo y su familia, «Buscando a los Roh» entre los Roh, y así. Tocá un post para ver de quién habla, o una persona para ver en qué posts aparece.

### 19 de junio de 2026

#### <span class="changelog-tag changelog-tag--nueva">Función nueva</span> La Wiki: un mapa navegable de la familia

El **Archivo** se transformó en la **Wiki**, una forma nueva de recorrer la investigación. En lugar de una tabla, ahora hay un **grafo interactivo** —al estilo de las wikis de fans— donde las **personas, los lugares y las fuentes** son puntos conectados entre sí: se ve de un vistazo qué se relaciona con qué. Al tocar un punto se abre un **panel** con sus vínculos (padres, cónyuge, hijos) y los lugares y documentos donde aparece, y el botón **Leer** abre, sin salir de la página, un recuadro grande con la investigación o la ficha completa. Podés saltar de una persona a otra siguiendo las conexiones, y filtrar por rama familiar con las pastillas de arriba.

#### <span class="changelog-tag changelog-tag--mejora">Mejora</span> La investigación de cada persona ahora se lee mejor

Las notas de investigación que antes vivían en una pestaña del árbol se mudaron a la Wiki, donde se ven **más grandes y mejor maquetadas** (con sus tablas, cronologías y citas). Desde la ficha de una persona en el árbol, el botón **«Ver investigación en la wiki»** lleva directo a su página.

#### <span class="changelog-tag changelog-tag--novedad">Novedad</span> Acceso a la Wiki desde la portada

La página de inicio suma una invitación para **entrar a la Wiki**, igual que la que ya existía para el árbol genealógico.

### 17 de junio de 2026

#### <span class="changelog-tag changelog-tag--mejora">Mejora</span> Más protección contra spam y bots

El formulario de **Colaborar** sumó **Cloudflare Turnstile**: una verificación anti-spam que confirma que sos una persona **sin cookies ni "elegí los semáforos"** (la mayoría de las veces es invisible). Se valida del lado del servidor, así los envíos automatizados se descartan y solo llegan los reales. Se suma al honeypot y la traba de tiempo que ya tenía. Además se reforzó la protección anti-bots del sitio con herramientas de Cloudflare (AI Labyrinth).

### 16 de junio de 2026

#### <span class="changelog-tag changelog-tag--mejora">Mejora</span> El sitio tiene dominio propio: cmzo.net

El sitio ahora vive en **[cmzo.net](https://cmzo.net)**, un dominio propio más corto y fácil de recordar. `www.cmzo.net` redirige solo al dominio principal, así que no hay enlaces rotos.

#### <span class="changelog-tag changelog-tag--novedad">Novedad</span> Un panel de contexto fijo en la línea de tiempo

La línea de tiempo se ensanchó y sumó un **panel de detalle fijo a la derecha** que reemplaza a los globos chiquitos que aparecían al pasar el mouse. Se actualiza solo: al pasar o hacer clic sobre una persona muestra su ficha —relación con la persona del árbol («bisabuelo de…», «chozno de…»), nacimiento y defunción con lugares, casamientos, hijos, un fragmento de su historia y la lista de documentos— con un acceso para **abrir la ficha completa**.

#### <span class="changelog-tag changelog-tag--novedad">Novedad</span> Los hitos históricos ahora traen imagen y resumen de Wikipedia

Cada hito mundial de la línea (Revolución Francesa, llegada del hombre a la Luna, etc.) abre en ese panel con una **imagen y un resumen traídos en vivo de Wikipedia**, además del texto propio y un enlace para leer más. Se sumaron **hitos argentinos** (Constitución de 1853, Ley Sáenz Peña, Yrigoyen, el golpe de 1930, Perón, el retorno a la democracia en 1983), que aparecen cuando la vida de la persona los abarca, y se corrigieron enlaces rotos.

#### <span class="changelog-tag changelog-tag--mejora">Mejora</span> Geografía más clara y un desplazamiento que «encaja»

La franja superior muestra con **banderas circulares** dónde **nació, creció, vivió y murió** cada persona (incluida España para quienes emigraron allá). Al desplazar la línea, el nombre se resalta y **encaja en su lugar** como en un selector de fecha del celular, y el panel de la derecha acompaña. Si la persona vive, ya no aparece la columna «murió» y se muestra «vive». También se afinó el espaciado para que los nombres no se solapen y se puede llegar con el scroll hasta los integrantes más jóvenes del árbol.

#### <span class="changelog-tag changelog-tag--mejora">Mejora</span> La línea de tiempo, más a mano

El acceso dejó de pasar desapercibido: el botón **«Línea de tiempo»** en la ficha de cada persona ahora es **verde y destacado**, y además se puede abrir desde el buscador **⌘ + K** (escribís un nombre y elegís «Línea de tiempo»). En pantallas chicas, donde la vista no entra cómoda, el acceso se oculta.

#### <span class="changelog-tag changelog-tag--mejora">Mejora</span> Parentescos con nombre propio

La relación de cada persona con la que estás mirando se nombra con más precisión: hijo, nieto, bisnieto, tataranieto y **chozno** (la 5.ª generación). De ahí en adelante, en vez del genérico «descendiente», se indica la **generación exacta** (por ejemplo «Descendiente · 7.ª generación»).

#### <span class="changelog-tag changelog-tag--fix">Arreglo</span> Escudos heráldicos en modo oscuro

Los escudos de la portada (Valais, armorial Clemenzo, Ardon) tenían un fondo blanco que en modo oscuro se veía como un recuadro fuera de lugar. Ahora tienen **fondo transparente** —recortado respetando los blancos propios del escudo— con una sombra suave, así se ven prolijos sobre cualquier fondo.

### 15 de junio de 2026

#### <span class="changelog-tag changelog-tag--nueva">Función nueva</span> Línea de tiempo de cada persona

Al elegir a alguien en el **Árbol** aparece un botón **«Línea de tiempo»** que abre una vista nueva: ubica a la persona —junto a sus ancestros y descendientes— sobre un eje temporal, enfrentada a los **hitos históricos** del mundo de cada época (de la Revolución Francesa a la llegada del hombre a la Luna). Una franja superior muestra **dónde nació, creció, vivió y murió** cada quien, y al recorrer la línea se va resaltando cada nombre con su contexto. Es una forma de ver la historia familiar situada en el tiempo: qué pasaba en el mundo cuando vivió cada antepasado.

### 14 de junio de 2026

#### Modo oscuro en todo el sitio

El sitio sumó **modo oscuro** con una paleta neutra gris-azulada («Pizarra neutra»). Un botón **sol/luna** en la barra superior alterna el tema; si no elegís nada, sigue la preferencia de tu sistema operativo en vivo, y si lo tocás, recuerda tu elección. Un script mínimo en el `<head>` fija el tema antes de pintar la página, así no hay parpadeo al cargar. Se ajustaron los detalles para que todo se lea bien en oscuro: la grilla de puntos del árbol se aclaró, el avatar del autor recibe fondo claro para no perderse y los enlaces del panel lateral ganaron contraste.

#### Tipografía: títulos en grotesca suiza y cuerpo en serif

Los títulos del sitio pasaron de Playfair Display a **Hanken Grotesk**, una grotesca de estilo suizo, y el cuerpo de los artículos adoptó **Source Serif 4** a mayor tamaño (18 px) e interlineado más amplio, con una **medida de lectura más contenida y centrada** (≈720 px). El cambio se unificó en todo el sitio —posts, Sobre, Fuentes, Cambios y Colaborar— para lograr el mismo lenguaje editorial: título en grotesca + lectura en serif. De paso, las **tarjetas del blog** corrigieron una inversión: ahora el título va en grotesca y el resumen en serif.

#### Imágenes: nuevo visor con ficha y zoom

Al hacer clic en una imagen de un artículo se abre un **visor** que no ocupa toda la pantalla (el artículo se ve atenuado detrás): imagen grande sobre fondo oscuro, **panel lateral con el pie y la fuente**, **zoom** (clic, rueda o doble clic) con arrastre para desplazarse, **navegación** entre las imágenes del post (flechas ‹ › o teclado) y cierre con Esc. La presentación de las imágenes dentro del texto se volvió más sobria y respeta la paleta y el modo oscuro. Además se corrigió el pie de imagen para que se muestre prolijo y aparezca en el visor, y se agregaron pies a las imágenes de los posts.

#### Fuentes propias (sin Google Fonts)

Las cuatro tipografías del sitio (Hanken Grotesk, Inter, Source Serif 4 y JetBrains Mono) dejaron de cargarse desde Google y ahora se sirven **desde el propio dominio** (`assets/fonts/`). Esto mejora la privacidad —ningún visitante envía su IP a Google al abrir el sitio, lo que evita el problema de RGPD del Google Fonts embebido—, elimina la dependencia de un tercero y acelera la carga. Se incluyen solo los subconjuntos latin y latin-ext, suficientes para español y francés.

#### El Árbol ahora vive en `arbol.html`

La página del árbol genealógico se renombró de `arbol-matrimonios.html` (un nombre heredado de una versión vieja) a **`arbol.html`**. Se actualizaron todos los enlaces internos del sitio y la URL anterior quedó como **redirección**, para no romper enlaces ya compartidos o indexados.

#### Colaborar: nueva página con formulario de aportes (reemplaza Contacto)

La antigua página de Contacto se reemplazó por **Colaborar**, con dos modos. *Dejar un comentario* (nombre, email opcional, mensaje) y *Tengo información sobre alguien*: este último trae un **selector de personas del árbol** con búsqueda y chips (lee `arbol.json`), opción para personas que **no** están en el árbol pero se relacionan con alguien que sí, tipo de dato (checkboxes), anécdota y enlace. Anti-spam con honeypot y traba de tiempo. Los envíos se guardan en una **Google Sheet** propia mediante Google Apps Script y llega un mail de aviso — sin servicios pagos ni dependencias que puedan dejar de ser gratis. Todos los enlaces del sitio apuntan ahora a Colaborar; `contacto.html` quedó como redirección.

#### Colaborar: selector de idioma ES / FR / EN

La página tiene su propio selector de idioma que cambia todos los textos de la interfaz al instante, recuerda la elección y la refleja en la URL (`?lang=fr`). El español está completo; francés e inglés quedan preparados para traducir.

#### Archivo: buscador, columnas ordenables, navegación familiar y enlaces compartibles

El Archivo sumó **buscador por nombre**, **encabezados que ordenan** la tabla (nombre, años, generación, ítems), **navegación familiar** en la ficha (padre, madre, cónyuge e hijos clickeables para saltar entre fichas sin cerrar), filtro **«solo con documentos»** y **enlaces compartibles** (`archivo.html?focus=p38` abre una ficha directa). Además, el modal de ficha dejó de usar el color saturado de cada rama y adoptó el verde de la paleta (la rama quedó como un punto de color), y **⌘ + K ya no te saca del Archivo**: elegir una persona abre su ficha ahí mismo.

#### Inicio: estadísticas del árbol y acceso destacado

La portada muestra **estadísticas reales** calculadas en vivo desde el árbol (personas, fechas documentadas, lugares, generaciones) y un botón **«Explorá el árbol interactivo»**. Se aumentó el espaciado entre secciones.

#### Blog: indicador de traducción en las tarjetas

Las tarjetas del blog muestran un globo con los chips **ES / FR** cuando el post tiene traducción disponible.

#### Blog en francés

Cinco posts se tradujeron al francés —Clan Clemenzo, Buscando a los Roh, Línea de tiempo de Francisco, Investigando a Francisco y Documentar fuentes—, con selector ES/FR en cada artículo.

#### Accesibilidad y SEO

Se agregaron meta descripciones, etiquetas Open Graph y URLs canónicas en todas las páginas; un enlace **«Saltar al contenido»**, un `<h1>` accesible en la portada y se oscureció el gris del texto secundario para cumplir el contraste AA.

#### Investigación Roh: nuevos datos y fuente

A partir de la nómina *Émigrés de Conthey* (Gabriel Antonin, vía valais-argentine.ch) se corrigieron y completaron fechas y nombres de la familia Roch–Putallaz, se sumaron cuatro ancestros al árbol y se incorporó la nueva fuente —con su PDF— a la página de Fuentes. El detalle está en el post «Buscando a los Roh».

#### Mantenimiento

Se silenciaron los mensajes de consola del build (detección de galerías y conversión de imágenes Obsidian), disponibles con `--verbose`. La carpeta `docs/` dejó de servirse públicamente.

### 13 de junio de 2026

#### Hosting: migración a Cloudflare Workers Assets

El sitio migró de GitHub Pages a **Cloudflare Workers Assets**. La configuración vive en `wrangler.toml` (`directory = "./"`) y `.assetsignore` controla qué archivos se sirven al público (excluye fuentes: scripts, data, content/posts, templates). Todas las páginas, imágenes y assets se sirven ahora desde el CDN global de Cloudflare — sin cambios en las URLs ni en el proceso de edición. El deploy sigue siendo `npm run deploy`.

#### Blog: traducciones automáticas al francés con DeepL

Nuevo script `scripts/translate.js` que traduce los posts del blog de español a francés usando la API de DeepL. `npm run translate` detecta los posts sin versión `.fr.md` y los genera; `npm run translate-build` encadena traducción y build en un paso. Las traducciones se cachean en `content/.deepl-cache.json` para no llamar a la API dos veces con el mismo texto. Los bloques de código/mermaid, HTML (`<details>`, `<style>`) e imágenes `![[]]` de Obsidian se extraen con sentinelas antes de enviar a DeepL y se restauran después. Para excluir un post permanentemente: `notranslate: true` en el frontmatter. La clave de API va en `.env` (`DEEPL_API_KEY=xxx:fx` para el plan gratuito, 500k caracteres/mes).

#### Sidebar: corrección de salto visual al cargar

La barra lateral dejó de "moverse" al navegar o recargar. La causa era que `nav-drawer.js` se carga con `defer` e inyecta los spans de ícono después del primer paint, subiendo la altura de cada link de ~37px (texto plano) a ~44px (ícono 22px + texto). Con 7 links el salto acumulado era de ~49px visibles. Solución: `min-height: 44px` en `.sidebar-link` reserva el espacio final desde el inicio; `width: 22px; height: 22px; overflow: hidden` en `.sidebar-icon` fija las dimensiones del ícono independientemente de si la fuente Material Symbols ya cargó.

### 10 de junio de 2026

#### Buscador global con ⌘ + K

Nuevo buscador estilo *command palette* (Spotlight/Raycast) que se abre con **⌘ + K** (o **Ctrl + K** en Windows/Linux) desde cualquier página con buscador. Indexa y permite saltar a **páginas** del sitio, las **personas** del árbol y los **posts** del blog, con resultados agrupados, búsqueda difusa insensible a acentos (José = jose), resaltado del término, navegación con flechas/Enter y cierre con Esc. Al elegir una persona la enfoca en el árbol (sin recargar si ya estás ahí, o navegando con `?focus=`); páginas y posts navegan directo. En el nav aparece un botón **"Buscar ⌘ + K"** que sirve de indicador del atajo y de acceso al click. Disponible en Inicio, Árbol, Archivo, Blog, Cambios y los posts; queda fuera de Contacto, Fuentes y Sobre el proyecto. Reemplaza las barras de búsqueda propias del **Árbol** y el **Archivo** (en el Archivo se conservan los filtros por rama y país).

#### Sidebar con iconos y sección activa resaltada

La barra lateral adoptó **iconos Material Symbols** por sección (`info`, `account_tree`, `folder`, `edit_note`, `description`, `mail`, `history`), etiquetas en mayúsculas con tracking y el ítem activo como **píldora verde** con texto e icono claros. La fuente de iconos se carga sin el típico flash del texto de la ligadura. El cambio es global a todas las páginas.

#### Acento verde botella en todo el sitio

El color de acento del sitio pasó de azul (`#2563eb`) a **verde botella (`#2d4a3e`)**. El cambio repercute en todas las páginas y en mobile: links, hovers, foco de inputs, etiquetas de categoría del blog, callouts, badges y botones. Los colores de rama del árbol genealógico son un sistema aparte y se mantienen.

#### Árbol: panel inspector con lenguaje editorial

El panel lateral abandonó el hero de color saturado con texto blanco y adoptó el lenguaje del blog: hero sobre superficie clara con el nombre en **Source Serif 4** y los años en serif cursiva, badge de estado tipo chip, botón de cierre minimal y secciones en cards blancas. En desktop el panel ahora **flota como tarjeta con gaps de 5mm** al estilo de un window manager (i3) — el fondo de puntos del canvas se ve en los gaps alrededor. Un botón **"Ampliar panel"** al pie lo expande hasta ocupar toda el área dejando solo el marco de 5mm (con el árbol intuyéndose detrás), y cambia a **"Volver al árbol"**. La expansión y los gaps son exclusivos de desktop; en mobile el panel sigue siendo un drawer overlay como antes.

### 19 de mayo de 2026

#### Árbol: navegación mobile menos invasiva

Al tocar una persona en mobile ya no se abre el panel de información de forma inmediata. En cambio, aparece una pequeña pestaña azul en el borde superior derecho del árbol con el nombre de la persona y la acción "Abrir ficha". El árbol queda libre para seguir navegando. Tocar la pestaña abre el panel completo. Tocar el fondo del árbol descarta la pestaña.

### 13 de mayo de 2026

#### Fuentes y Guía: tipografía editorial

Las páginas de fuentes y guía adoptan **Playfair Display** para los títulos de sección (H2) y subtítulos (H3), e **Inter** para el cuerpo. El estilo es coherente con el de los posts del blog. Las tablas de la guía usan el mismo formato que el de los artículos: header uppercase en Inter, celdas con más padding y scroll horizontal en mobile.

#### Mobile: drawer de navegación

El nav móvil pasa de mostrar links inline a un **hamburger + drawer**: el botón abre un panel lateral con todos los links del sitio organizados en sección principal (Árbol, Archivo, Blog, Guía, Fuentes) y secundaria (Contacto, Cambios). El drawer se cierra con el botón ✕, click en el overlay o tecla Escape. Implementado en `assets/js/nav-drawer.js`, incluido en todas las páginas.

#### Mobile: footer oculto

El footer se oculta en pantallas ≤960px. Los links de Contacto y Cambios están accesibles desde el drawer.

#### Lightbox: scroll lock en iOS corregido

El lightbox ya no manipula `body.overflow` al abrirse, eliminando un bug en iOS Safari donde el scroll quedaba trabado tras cerrar una foto y era necesario recargar la página.

### 10 de mayo de 2026

#### Blog: tipografía editorial (Playfair Display + Inter)

Los posts del blog adoptan una combinación tipográfica editorial definida: **Playfair Display** para el título del artículo y los encabezados H2/H3, **Inter** para párrafos, listas y citas. El contraste serif/sans-serif marca jerarquía visual sin mezclar pesos arbitrarios.

#### Blog: overflow horizontal en mobile corregido

Posts con tablas o diagramas mermaid ya no generan scroll horizontal en mobile. La causa raíz era que los grid items tienen `min-width: auto` por defecto, por lo que una tabla ancha empujaba el artículo fuera del viewport. Solucionado con `min-width: 0` en `.article-grid` y `.article-content`. Las tablas se renderizan dentro de un `<div class="table-wrapper">` con `overflow-x: auto` propio — visible en desktop y scrolleable en mobile sin romper el layout.

#### Blog: renderizado de markdown en celdas de tabla

Las celdas de tabla con formato en negrita (`**texto**`) o cursiva ahora se renderizan correctamente como HTML. El renderer de tablas pasó de usar el token `raw` directo a procesar cada celda con `marked.parseInline()`.

#### Blog: botón volver arriba

Todos los posts tienen un botón fijo en la esquina inferior derecha que aparece al scrollear 400px. Click vuelve al inicio del artículo con animación suave.

#### Árbol y archivo: búsqueda por ID de persona

El buscador del árbol genealógico y el filtro del archivo aceptan ahora IDs de persona en formato `p26`. El árbol muestra el ID junto al nombre en cada sugerencia del autocompletado.

### 8 de mayo de 2026

#### Gestor del sitio: gestionar_web.py

`gestionar_arbol.py` fue renombrado a `gestionar_web.py` y ampliado con tres comandos para el blog. **Crear post** hace un formulario interactivo que pregunta título, kicker, descripción, categoría (con autocompletado de categorías existentes), tags, slug (sugerido automáticamente desde el título) y si es destacado — genera el `.md` con front matter completo y lo abre directamente en nvim en una pestaña nueva de WezTerm. **Editar post** muestra autocompletado de los posts existentes y abre el seleccionado en nvim. **Eliminar post** muestra un selector con el título de cada post y pide confirmación antes de borrar.

#### Markdown: callouts, highlights y tablas

El pipeline de build ahora soporta la sintaxis de Obsidian completa. Los **callouts** (`> [!NOTE]`, `> [!WARNING]`, `> [!TIP]`, etc.) se renderizan como bloques visuales con color e ícono según el tipo — doce tipos con variantes de color: azul (info/note/tip), ámbar (warning/caution), rojo (danger/error), verde (success) y gris (quote). Los **highlights** (`==texto==`) se convierten en `<mark>` con fondo amarillo. Las **tablas** y los separadores `---` tienen estilos propios en los artículos del blog. El mismo procesamiento fue incorporado al renderizado en browser de `guia.html`.

#### Guía del sitio: rediseño

`guia.md` fue reescrito con la nueva sintaxis disponible: secciones con emojis, callouts para tips y advertencias, y highlights para términos clave. Los estilos de `guia.html` fueron revisados: H2 pasa de 11px Inter uppercase a **Source Serif 4 a 22px**, H3 a 18px, tabla con borde exterior completo y divisores de columna, HR oculto (el `border-top` del H2 separa las secciones sin duplicar líneas).

#### Diseño: auditoría y correcciones

Se aplicó auditoría sistemática de diseño sobre `archivo.css` y `arbol.css`: valores de espaciado corregidos a múltiplos de 4px, colores hardcodeados reemplazados por tokens del sistema, sombras eliminadas en favor de bordes, botones de cierre con íconos SVG en lugar de `✕`. El modal del archivo y el panel del árbol quedaron visualmente consistentes. En mobile se ocultó el texto "Diseñado por…" del footer y se agregaron links de **Contacto** y **Cambios** en su lugar — visibles en todas las páginas. El párrafo introductorio del inicio fue reescrito, el H1 redundante eliminado, y la tipografía del tagline pasó a Source Serif 4.

### 7 de mayo de 2026

#### Página de contacto

Nueva página **Contacto** (`contacto.html`) con formulario integrado vía Formspree. Campos: nombre, email (opcional) y mensaje. El envío es asíncrono — el visitante no abandona la página. El link aparece en la sidebar de todas las páginas con un ícono de sobre junto al texto. La página tiene layout centrado, distinto al resto del sitio.

### 3 de mayo de 2026

#### Archivo familiar: galería en grilla de 3 columnas

El modal de archivo fue rediseñado con más espacio y estructura. El panel creció de 760px a 960px de ancho. El cuerpo interior tiene más padding y las secciones respiran con mayor margen entre ellas. Las fotos ahora se muestran en una **grilla de 3 columnas** con tarjetas de bordes redondeados y efecto de elevación al pasar el cursor — en lugar de apilarse una debajo de la otra. En mobile baja a 2 columnas.

#### Inicio: ajustes de presentación heráldica

El escudo de Clemenzo fue reemplazado por una versión definitiva (`clemenzo-def.png`) con fondo transparente limpio. Se corrigió la diferencia de tamaño visual entre los tres escudos igualando el ratio de aspecto de la imagen mediante padding transparente. El pie de imagen del Valle del Ródano quedó centrado. Se agregó más espacio vertical entre el título de sección "Heráldica" y los escudos.

#### Favicon

El favicon del sitio fue regenerado a partir del escudo de Clemenzo definitivo. Cubre 64×64px (PNG) y 16+32px (ICO).

#### Guía del sitio y navegación mobile

Nueva página **Guía** (`guia.html`) que documenta el uso del sitio: árbol genealógico, atajos de teclado, búsqueda, zoom, archivo familiar y blog. El link aparece en la barra lateral debajo de Blog. En mobile (donde la sidebar está oculta) los links Árbol, Archivo, Blog y Guía se muestran en el nav superior — aplicado a todas las páginas incluyendo posts del blog. "Cambios" se movió al pie de la sidebar con estilo secundario y hover más sutil.

### 3 de mayo de 2026

#### Gestor del árbol: interfaz interactiva con rich + questionary

`gestionar_arbol.py` fue reescrito con una interfaz de terminal enriquecida. Al ejecutar `uv run scripts/gestionar_arbol.py` sin argumentos se abre un **menú interactivo** con submenús anidados para Personas, Matrimonios y Media; la navegación es con flechas del teclado y autocompletado por nombre. Los campos con opciones fijas (género, estado de investigación, vivo) usan `select` — eliminan errores de tipeo. La salida es con **tablas y paneles** de `rich`: estado de investigación en colores, género diferenciado, vista de detalle en panel con borde. Se agrega `delete` para personas y `delete-marriage`. Las dependencias (`rich`, `questionary`) se instalan automáticamente via [PEP 723](https://peps.python.org/pep-0723/) — sin venvs manuales. Los comandos por argumento siguen funcionando igual.

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
