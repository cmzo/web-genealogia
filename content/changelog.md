### 7 de julio de 2026

#### <span class="changelog-tag changelog-tag--novedad">Novedad</span> Los documentos de cada persona ahora viven en la wiki

Las fotos, actas y censos de cada persona estaban en una pestaña «Archivos» dentro del árbol, separados de la investigación que respaldan. Ahora cada página de persona en la **wiki** termina con su galería de **Documentos** — y las personas que todavía no tienen investigación escrita pero sí documentos (61 casos) ganaron su propia página. Las páginas de persona con algo para ver pasaron de 11 a **72**. En el árbol, la ficha enlaza directo a la lectura con la cantidad de documentos; la pestaña Archivos se retiró para no tener lo mismo en dos lados.

#### <span class="changelog-tag changelog-tag--novedad">Novedad</span> Botón de ayuda en el árbol

El árbol se puede recorrer con el teclado —flechas para moverse entre padres, hijos, hermanos y cónyuges— pero eso no estaba explicado en ningún lado. Ahora hay un **botón ⓘ** junto a los controles de zoom que muestra todos los atajos, el buscador ⌘ K y cómo funciona el clic para reorganizar el árbol.

#### <span class="changelog-tag changelog-tag--mejora">Mejora</span> Se retiró la página «Sobre el proyecto»

La página «Sobre el proyecto» era la última que conservaba el diseño viejo del sitio, anterior al rediseño CMZO, y ya no estaba enlazada desde ninguna parte. Se eliminó. Su contenido útil tiene mejor casa en otros lados: la presentación vive en la portada, y los atajos de teclado del árbol volverán pronto como un botón de ayuda dentro del propio árbol.

#### <span class="changelog-tag changelog-tag--mejora">Mejora</span> El árbol ya no depende de servidores externos

Quedaban dos bibliotecas que se cargaban desde un CDN externo: la que dibuja el **árbol genealógico** y la que renderiza el texto en las páginas de cambios y ayuda. Si ese servicio fallaba, el árbol no cargaba. Ahora viven en el propio sitio, como ya pasaba con el grafo de la wiki y las tipografías — todo cmzo.net se sirve desde cmzo.net.

#### <span class="changelog-tag changelog-tag--mejora">Mejora</span> El buscador recuerda lo que usaste

El buscador (⌘ K) ahora muestra un grupo **«Recientes»** cuando lo abrís sin escribir nada: las últimas cinco cosas que elegiste, sean personas, posts, notas, páginas de la wiki o fuentes. Sin escribir nada, llegás directo al lugar donde estabas.

#### <span class="changelog-tag changelog-tag--novedad">Novedad</span> Abrí una fuente desde el buscador sin entrar a la página

Ahora podés buscar cualquier fuente bibliográfica o digital (FamilySearch, Ancestry, los archivos suizos) y al presionar Enter el sitio la abre directamente en una pestaña nueva. Sin pasar por la página de fuentes, sin buscar el link manual.

#### <span class="changelog-tag changelog-tag--mejora">Mejora</span> El buscador abre la lectura de la wiki, no solo la localiza

Antes, buscar una página de la wiki (un lugar, una fuente, un evento) la localizaba en el grafo pero no la abría. Ahora Enter abre el modal de lectura directamente. Si querés verla en el grafo, hay una acción secundaria para eso.

#### <span class="changelog-tag changelog-tag--mejora">Mejora</span> Los resultados más relevantes aparecen primero

El buscador antes mostraba los grupos en orden fijo (personas, luego wiki, luego posts). Ahora se ordenan por el mejor resultado de cada grupo: si la coincidencia más fuerte está en las fuentes, las fuentes aparecen primero.

#### <span class="changelog-tag changelog-tag--nueva">Función nueva</span> Página de fuentes completamente rehecha

La lista de fuentes genealógicas tenía forma de documento de texto. Ahora es una **página de consulta**: las fuentes están organizadas por región (Entre Ríos, Argentina, Valais, Suiza general, plataformas, bibliografía), con etiquetas de estado —consultada, pendiente, con membresía, presencial— y un botón para abrir cada fuente directo, sin leer el detalle. El filtro de la barra superior muestra solo las fuentes de la región que te interesa.

#### <span class="changelog-tag changelog-tag--novedad">Novedad</span> Ocho fuentes suizas nuevas, Cyndi's List auditada

Hice un barrido de los 318 recursos suizos de Cyndi's List: 212 están vivos, 11 caídos y 8 bloquean el acceso. De ahí rescaté ocho recursos de calidad que no estaban en el sitio: el Familiennamenbuch der Schweiz (índice de apellidos por cantón), los archivos federales suizos, la Société Genevoise de Généalogie, el Portrait-Archiv Eidgenössische Technische Hochschule, y otros. Todos disponibles desde el buscador.

#### <span class="changelog-tag changelog-tag--nueva">Función nueva</span> Wiki: Ardon (Valais), origen del clan Clemenzo

Nueva página en la wiki para **Ardon**, el pueblo del Valais del que salió el clan. Cubre la primera mención documental (1481, el Armorial Valaisan con «Clemenczoz»), el escudo heráldico —la llave de los Clemenzo derivada del arma de Ardon—, el patriarca Baptiste (p93, n.c. 1745–1755) y la bifurcación que define todo: Jean Baptiste se quedó en Ardon (rama de Jean-Yves), Jean Joseph emigró a Riddes y de ahí a la Argentina.

#### <span class="changelog-tag changelog-tag--nueva">Función nueva</span> Laboratorio editorial: jugá con la tipografía del blog

Nueva herramienta en el **Lab**: una maqueta viva de la tipografía de los posts. Mostrás un fragmento real del blog con todos los elementos (títulos, párrafos, citas, imágenes, galería, tabla, diagrama) y tenés diales para cambiar el ancho de la columna, la fuente, el tamaño del cuerpo, el interlineado, los márgenes de las figuras. Al terminar, copiás la **receta** —solo los cambios respecto al estado actual del sitio— y la traés al chat.

#### <span class="changelog-tag changelog-tag--mejora">Mejora</span> Los posts se leen con más espacio

Apliqué una receta de tipografía que salió del lab: la columna de texto pasó de **720 a 1020 px**, el cuerpo de 18 a 19.5 px, el interlineado de 1.8 a 1.75, los márgenes superiores de los h2 y las figuras crecieron. El texto respira más y las imágenes tienen más peso visual.

### 5 de julio de 2026

#### <span class="changelog-tag changelog-tag--fix">Arreglo</span> «Leer investigación» ya no abre páginas vacías

El botón «Leer investigación» del grafo aparecía en las 124 personas, pero la gran mayoría todavía no tiene investigación escrita: abrías el panel de lectura y te encontrabas una plantilla vacía. Ahora el botón aparece **solo en las personas que de verdad tienen algo para leer**; el resto sigue en el grafo con sus relaciones, y su ficha completa vive en el árbol.

#### <span class="changelog-tag changelog-tag--novedad">Novedad</span> Un anillo marca qué nodos tienen algo para leer

En el grafo de la wiki, los nodos que tienen contenido —una investigación, una página de lugar o fuente, un post— llevan ahora un **anillo verde**. De un vistazo se ve dónde hay historia para abrir, sin clickear a ciegas.

#### <span class="changelog-tag changelog-tag--mejora">Mejora</span> El grafo, más legible

Varios retoques finos al grafo de conocimiento: los colores de lugares, fuentes, eventos y posts pasaron a una **familia de tonos cálidos** propia del sitio (antes un lugar podía confundirse con una persona de cierta rama, porque compartían color exacto); las líneas de parentesco se dibujan **más tenues** que las de menciones y enlaces, así resalta la red de investigación sobre el esqueleto del árbol; y al alternar entre modo día y noche **el grafo acompaña al instante**, sin recargar la página.

#### <span class="changelog-tag changelog-tag--mejora">Mejora</span> La wiki ya no depende de servidores externos

Las bibliotecas que dibujan el grafo y los diagramas se servían desde un CDN externo: si ese servicio fallaba, la wiki no cargaba. Ahora viven en el propio sitio, como ya pasaba con las tipografías — la wiki carga completa desde cmzo.net.

#### <span class="changelog-tag changelog-tag--novedad">Novedad</span> El buscador entiende lugares, años y varias palabras

El buscador (⌘ + K) ahora encuentra personas **por dónde nacieron o murieron y por año**: «riddes» trae a todos los nacidos en Riddes, y «riddes 1858» te deja solo a François. Además podés combinar **varias palabras** («celestina roh», «censo 1870») y cada una se resalta en el resultado.

#### <span class="changelog-tag changelog-tag--mejora">Mejora</span> Buscador sin resultados repetidos

Antes, al buscar una persona, aparecía dos veces: una fila para verla en el árbol y otra para su línea de tiempo. Ahora hay una sola fila: **Enter** la abre en el árbol y **⌘ + Enter** abre su línea de tiempo (el pie del buscador te lo recuerda cuando corresponde).

#### <span class="changelog-tag changelog-tag--mejora">Mejora</span> Filtrar la wiki por familia, sin lista interminable

Estando en la wiki, el buscador ofrecía una fila por cada familia del grafo — muchas líneas para una sola función. Ahora hay una única opción, **«Filtrar por familia…»**, que abre un segundo paso donde tipeás el apellido y listo.

#### <span class="changelog-tag changelog-tag--mejora">Mejora</span> La portada se presenta como sitio personal

Reescribí la presentación de la portada: CMZO es un **sitio personal** —un blog, un laboratorio de experimentos y la investigación genealógica de la familia—, no solo una página de genealogía. La genealogía sigue siendo el proyecto más largo, pero acá se puede escribir de cualquier cosa.

### 28 de junio de 2026

#### <span class="changelog-tag changelog-tag--nueva">Función nueva</span> El árbol de Jean-Yves, en la wiki

Sumé una página nueva: el **árbol genealógico manuscrito de Jean-Yves Clemenzo**, la rama de los Clemenzo que se quedó en Ardon (Suiza) y que corre en paralelo a la que emigró a Entre Ríos. Trae las dos fotos del documento original, la transcripción generación por generación y un diagrama por cada una. De paso, resolvió una duda vieja de la investigación sobre quién era la «Elisabeth» casada con los Lambiel de Riddes.

#### <span class="changelog-tag changelog-tag--novedad">Novedad</span> Imágenes en los artículos de la wiki

Los artículos de la wiki ahora pueden mostrar **fotos** —un pueblo, un documento, un árbol manuscrito— con su pie de foto, y al tocarlas se abren en el visor con zoom, igual que en el blog.

#### <span class="changelog-tag changelog-tag--novedad">Novedad</span> Diagramas de parentesco dentro de un artículo

Se pueden dibujar **árboles y diagramas** directamente dentro de un artículo de la wiki (con Mermaid). El árbol de Jean-Yves los estrena: un esquema por cada generación.

#### <span class="changelog-tag changelog-tag--mejora">Mejora</span> Los artículos de la wiki se leen mucho mejor

Rehíce la tipografía de lectura de la wiki: una entradilla que resume, secciones bien marcadas, tablas más claras y citas destacadas. Además, al abrir un artículo, el recuadro de lectura se ubica a la izquierda y **el panel de relaciones queda a la derecha** —sin duplicarse—, así podés leer y saltar a personas o lugares vinculados a la vez.

#### <span class="changelog-tag changelog-tag--mejora">Mejora</span> El buscador encuentra páginas de la wiki

El buscador (⌘ + K) ahora también encuentra **las páginas de la wiki** por su nombre: escribís «jean-yves», «ardon» o «árbol» y te lleva al nodo en el grafo.

#### <span class="changelog-tag changelog-tag--novedad">Novedad</span> Nuevas personas y documentos en el árbol

Aparecieron papeles de la rama de los Roh y los Clemenzo en Santa Fe. Sumé al árbol tres personas con sus actas: **María Isidora Roh** (1907), **Felisa Clemenzo Roh** (1890) y **José Martín Clemenzo** (1905). Además se encontró el **bautismo de José Domingo (Santa Fe, 1884)** —el que en el post sobre los Roh figuraba como «pendiente»—, y apareció la **segunda hoja del censo de Colón de 1895**, con la familia de Francisco al completo.

#### <span class="changelog-tag changelog-tag--fix">Arreglo</span> Parentescos corregidos en el árbol

Revisé ficha por ficha los lazos familiares contra los documentos y corregí varios que estaban mal: alguien marcado como «bisabuelo» que en realidad era tío abuelo, hijos atribuidos al hermano equivocado, y dos «hermanas» de Francisco que eran en verdad sus sobrinas (hijas de su hermana). También suavicé las paternidades que son hipótesis y no están probadas. La idea es que se pueda confiar en lo que dice el árbol.

### 22 de junio de 2026

#### <span class="changelog-tag changelog-tag--nueva">Función nueva</span> Laboratorio de fractales

Un segundo experimento en el área lab: **L-systems** sobre Canvas 2D. Elegís el fractal —Koch, Sierpiński, árbol o curva dragón—, ajustás las iteraciones y el ángulo de giro, y ves cómo cambia en tiempo real. El panel derecho muestra la gramática que lo genera, cómo crece el string con cada paso y la dimensión fractal del resultado. Sin dependencias externas.

#### <span class="changelog-tag changelog-tag--nueva">Función nueva</span> Índice del lab con tarjetas visuales

El área lab tiene ahora su propia página de entrada (`/lab`), separada de genealogía. Cada herramienta aparece como una tarjeta con una visualización previa —un grafo esquemático o un Sierpiński— hecha con el mismo lenguaje visual del resto del sitio. El lab también tiene su propio lugar en la barra de navegación y en el menú mobile.

### 21 de junio de 2026

#### <span class="changelog-tag changelog-tag--mejora">Mejora</span> La versión mobile, más prolija

En el teléfono, la barra de arriba quedó minimal —solo el buscador (como lupa) y el modo día/noche—, y el resto de la navegación —todas las secciones y el GitHub— se mudó al **menú lateral**, ahora con el estilo del sitio. Colaborar y Cambios salieron del pie de página y viven en ese menú.

#### <span class="changelog-tag changelog-tag--mejora">Mejora</span> La tarjeta al compartir, sin foto

Al compartir el sitio (por WhatsApp y demás) ya no aparece esa imagen que no terminaba de quedar bien: la tarjeta muestra solo título y descripción, más limpio.

#### <span class="changelog-tag changelog-tag--fix">Arreglo</span> Las notas del log, mejor ordenadas y más limpias

Las notas del mismo día ahora se ordenan por la más reciente (la última que escribo aparece arriba), y en el hilo se muestra solo la primera línea, limpia; el contenido completo —con sus listas y formato— queda en el recuadro que se abre al tocarla.

#### <span class="changelog-tag changelog-tag--mejora">Mejora</span> Una presentación más honesta

Cambié el texto de bienvenida de la portada por algo más personal y directo.

#### <span class="changelog-tag changelog-tag--nueva">Función nueva</span> Una home nueva: índice y bitácora

La portada se rehízo de cero. Arriba, una presentación corta y tres áreas —<strong>blog</strong>, <strong>lab</strong> y <strong>genealogía</strong>— como "directorios", cada una con una vista previa en vivo (las últimas entradas, los experimentos, el estado del árbol). Abajo, un <strong>log</strong>: un hilo cronológico que mezcla posts, notas cortas y cambios del sitio, filtrable por tipo. La idea es que el sitio se sienta vivo aunque pase tiempo entre un post largo y otro.

#### <span class="changelog-tag changelog-tag--nueva">Función nueva</span> Notas sueltas

Ahora puedo publicar <strong>cosas cortas</strong> —una idea, un enlace, una foto que me llamó la atención— sin escribir un post entero. Aparecen en el log y se abren en un recuadro ahí mismo, sin página aparte; las fotos abren en el visor con zoom.

#### <span class="changelog-tag changelog-tag--novedad">Novedad</span> Un área para experimentos (lab)

El <strong>laboratorio del grafo</strong> dejó de ser una página suelta: ahora vive en un área propia, <code>lab</code>, pensada para experimentos y cosas técnicas. Sumar una nueva es tirar un archivo y listo.

#### <span class="changelog-tag changelog-tag--mejora">Mejora</span> Los posts del blog estrenan el diseño nuevo

Las entradas del blog se actualizaron al mismo diseño que el resto del sitio: la barra de arriba con la ruta (<code>~/cmzo / blog / …</code>), el pie nuevo y el selector de idioma más prolijo. La lectura del artículo queda igual.

#### <span class="changelog-tag changelog-tag--novedad">Novedad</span> El buscador hace más

El <strong>⌘ + K</strong> dejó de ser solo búsqueda: ahora también <strong>ejecuta acciones</strong> (por ejemplo, cambiar entre modo día y noche) y <strong>encuentra las notas</strong> por su contenido, no solo posts y personas.

#### <span class="changelog-tag changelog-tag--fix">Arreglo</span> El mapa de la wiki en el celular

En el teléfono —sobre todo en vertical— el grafo de la wiki se veía amontonado, como la maraña vieja. Ahora se arma igual de prolijo que en la computadora, en cualquier pantalla.

#### <span class="changelog-tag changelog-tag--mejora">Mejora</span> Favicon nuevo

El sitio estrena ícono en la pestaña.

#### <span class="changelog-tag changelog-tag--mejora">Mejora</span> Fuentes y Colaborar, al mismo lenguaje visual

Las páginas de <strong>Fuentes</strong> y <strong>Colaborar</strong>, que seguían con el diseño viejo, ahora hablan el mismo idioma que el resto del sitio: secciones numeradas, paneles y tipografía monoespaciada. Fuentes agrupa los archivos por región en paneles ordenados, con un índice arriba; Colaborar conserva el formulario y todo lo que hacía, pero con la piel nueva.

#### <span class="changelog-tag changelog-tag--novedad">Novedad</span> El tablero de genealogía muestra más

En la portada de genealogía (<code>/gen</code>), las secciones de Fuentes y Colaborar ahora traen una vista previa: un índice de archivos y un formulario de ejemplo, para dar una idea de lo que hay del otro lado antes de entrar.

#### <span class="changelog-tag changelog-tag--mejora">Mejora</span> Una marca con más identidad

El nombre del sitio en la barra pasó de un punto verde suelto a <strong><code>~/cmzo</code></strong> —un guiño a las rutas de carpetas—, con «cmzo» en negrita. Chico, pero le da carácter.

#### <span class="changelog-tag changelog-tag--fix">Arreglo</span> Un rectángulo fantasma al hacer scroll

Al frenar el scroll por encima del inicio (ese rebote elástico), asomaba un rectángulo claro arriba a la izquierda: era un atajo de accesibilidad oculto que se dejaba ver de más. Ahora queda invisible salvo cuando corresponde.

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
