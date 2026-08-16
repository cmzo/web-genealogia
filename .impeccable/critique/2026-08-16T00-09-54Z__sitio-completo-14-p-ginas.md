---
target: sitio completo (14 páginas)
total_score: 30
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
timestamp: 2026-08-16T00-09-54Z
slug: sitio-completo-14-p-ginas
---
Method: dual-agent (Assessment A: revisión de diseño · Assessment B: escaneo determinístico), ambas en subagentes aislados. Automatización de navegador no disponible en este entorno — las dos evaluaciones corrieron sobre el código fuente (HTML/CSS/JS), no sobre captura visual en vivo. Alcance: crítica consolidada de las 14 páginas de cara al usuario, decidido con vos en lugar de 14 corridas independientes.

## ⚠️ Nota sobre el escaneo determinístico

El detector corrió en **modo degradado** (le faltan los módulos de parseo HTML/CSS reales — `htmlparser2`, `css-select`, `css-tree`, `domutils` — y cae a matching por regex). En ese modo **solo lee los bloques `<style>` inline dentro del propio HTML — no sigue los `<link rel="stylesheet">`**. De las 14 páginas, solo `colaborar.html` y `changelog.html` tienen `<style>` inline; las otras 12 (incluidas `arbol.html` y `wiki.html`) dieron **0 hallazgos cada una — no porque estén limpias, sino porque el escáner nunca miró su CSS real** (`styles.css`, `home.css`, `arbol.css`, `wiki.css`, etc.). Para confirmar esto, el agente de la evaluación B corrió el mismo detector directamente contra `assets/css/` y encontró **367 hallazgos** (~10x más) en esos mismos archivos. Los números de la sección 3 reflejan ambas corridas.

## Design Health Score

Nielsen's 10 heuristics, evaluadas para el sitio como un todo (no por página) — la columna "Dónde" nombra la página que mejor ejemplifica cada hallazgo.

| # | Heurística | Score | Dónde / hallazgo clave |
|---|-----------|-------|-----------|
| 1 | Visibilidad del estado del sistema | 3 | `wiki.html`: el grafo queda en `opacity:0` ~300 pasos de física sin ningún indicador de carga. `index.html`/`gen.html`/`lab.html` renderizan contenedores vacíos mientras esperan el fetch — sin skeleton, a diferencia de `blog.html`/`fuentes.html` que sí lo tienen. |
| 2 | Coincidencia con el mundo real | 3 | Vocabulario claro y explicado en general; el wordmark `~/cmzo` (metáfora de terminal) asume comodidad con notación de path que un familiar no técnico puede no leer como navegación. |
| 3 | Control y libertad del usuario | 3 | Modales y filtros cierran/limpian bien. Punto débil: tras enviar `colaborar.html` con éxito, el formulario se oculta sin forma de enviar un segundo mensaje o revisar lo enviado. |
| 4 | Consistencia y estándares | 2 | **Confirmado por ambas evaluaciones**: `changelog.html` usa `font-family: 'Inter'` (5 instancias) y una paleta ad-hoc `#3d405b/#e07a5f/#81b29a/#f2cc8f` (comentada en el código como "paleta coolors") — viola directamente "La Regla del Todo-Serif" y "La Regla del Color Semántico" documentadas en `DESIGN.md`. Además, `lab-grafo.html` es la única página lab sin `command-palette.js` (⌘K no existe ahí, sin motivo aparente). |
| 5 | Prevención de errores | 3 | `colaborar.html` tiene honeypot + traba de 2.5s + Turnstile + validación al enviar con mensajes específicos. No hay validación inline mientras se escribe. |
| 6 | Reconocimiento antes que memoria | 4 | El ⌘K global (recientes, búsqueda difusa, indexa personas/wiki/fuentes/documentos, incluso por lugar+año) es un punto fuerte real y específico del producto. |
| 7 | Flexibilidad y eficiencia de uso | 3 | `arbol.html` tiene navegación por teclado completa y documentada (`assets/js/arbol/keyboard.js`). `wiki.html` — el grafo, arguiblemente la segunda página más importante del sitio — no tiene ningún camino por teclado: solo mouse/touch. |
| 8 | Diseño estético y minimalista | 4 | Punto más fuerte del sitio: sin sombras por regla, barras de proporción solo donde hay un dato real, badges solo donde hay individuos reales que nombrar — ejecutado con disciplina en 13 de 14 páginas. |
| 9 | Ayuda a reconocer/diagnosticar/recuperarse de errores | 3 | Errores de `colaborar.html` son específicos, en lenguaje llano, nunca borran el formulario, y ofrecen un email de resguardo. Pero todos los errores aparecen en un bloque genérico arriba del botón enviar, no junto al campo específico que falló. |
| 10 | Ayuda y documentación | 2 | El popover ⓘ del árbol (atajos, hint de ⌘K, nota de reorganización) es genuinamente buena ayuda contextual — y es la **única** en todo el sitio. `wiki.html`, `hipotesis.html`, los labs y `colaborar.html` no tienen equivalente. |
| **Total** | | **30/40** | **Bueno (75%)** |

## Veredicto de especificidad de diseño

**Evaluación LLM (Assessment A):** inequívocamente diseñado para CMZO, no una plantilla con contenido genealógico encima. La evidencia está en decisiones chicas y específicas: el racimo de avatares con iniciales reales de la línea directa (no iconos genéricos); la paleta "Archivo cálido" revisada explícitamente esta semana porque "aburren rápido los tonos pastel" (palabras del dueño del sitio); la ausencia deliberada de `og:image` en todas las páginas; la barra de proporción de `.cmzo-gcard` que **no aparece** en Lab/Colaborar porque, según el propio comentario del código, "no hay nada real que medir". Una plantilla genérica de blog/genealogía no produce esa restricción editorial aplicada a un componente de UI.

Dónde se resbala hacia lo genérico: `changelog.html` se lee como otra mano — la única página que parece pegada desde un proyecto anterior y nunca migrada al sistema all-serif/color-semántico.

**Escaneo determinístico (Assessment B):** confirma el hallazgo de `changelog.html` con números exactos (ver tabla de hallazgos abajo) y agrega uno que la revisión LLM no vio: `colaborar.html` tiene un `box-shadow` real (`.pp-dropdown`, `0 12px 32px rgba(20,20,18,.14)`) que contradice directamente "La Regla Sin Sombra" de `DESIGN.md` ("Ningún componente nuevo introduce box-shadow para jerarquía"). Es un caso claro de que el detector atrapó algo que la revisión cualitativa pasó por alto.

**Visuales:** no aplica — sin automatización de navegador en este entorno, no se generó ningún overlay visible.

## Impresión general

El sitio tiene una identidad visual genuinamente disciplinada y específica — no es intercambiable con ningún producto genealógico de catálogo. La mayor oportunidad no es estética sino de **alcance de la disciplina**: las reglas del sistema (todo-serif, sin sombra, color semántico, navegación por teclado) están bien pensadas donde se aplicaron, pero se aplicaron de forma desigual entre páginas. `changelog.html` y (en menor medida) `wiki.html` son los dos puntos donde el sitio deja de sentirse como un solo producto.

## Lo que funciona

1. **La disciplina de "proporción real o nada" en `.cmzo-gcard`** (home, `/gen`, `/lab`) — la barra solo aparece cuando hay un dato real que mostrar. Requiere que alguien sepa realmente qué es cierto sobre cada dataset; una plantilla no puede producir esto.
2. **El copy de error y éxito de `colaborar.html`** — específico, cálido, nunca borra lo escrito, siempre ofrece un contacto humano de resguardo. Es el momento de mayor peso emocional del sitio (un desconocido decidiendo confiarle un recuerdo familiar a un investigador) y está resuelto con cuidado real, del lado del "por qué importa" antes del formulario hasta el "te escribo" al final.
3. **La arquitectura de información del comando ⌘K** — indexar personas por lugar y año ("riddes 1858" → François), no solo por nombre, es una decisión ganada, no un buscador difuso genérico pegado encima.

## Problemas prioritarios

**[P1] `changelog.html` viola las reglas propias del sistema de diseño**
*Qué:* `font-family: 'Inter'` hardcodeado (5 instancias: h3/h4/p/li/loading) + una paleta ad-hoc de 5 colores sin relación con ningún token (`#3d405b`, `#e07a5f`, `#81b29a`, `#f2cc8f`, comentada como "paleta coolors" en el código). El detector suma un hallazgo de jerarquía tipográfica plana: 5 tamaños entre 10–18px con ratio 1.8:1.
*Por qué importa:* Es la página enlazada desde el footer de todo el sitio, y viola dos reglas nombradas explícitamente en `DESIGN.md` ("La Regla del Todo-Serif", "La Regla del Color Semántico"). Socava la afirmación de `design-system.html` de ser la única fuente de verdad.
*Fix:* Reemplazar `'Inter', sans-serif` por `var(--sans)`; mapear las 4 variantes de `.changelog-tag` a la familia `--tag-*`/`--stat-*` ya existente en vez de la paleta ad-hoc.
*Comando sugerido:* `/impeccable polish` (o `/impeccable harden`) sobre `changelog.html`.

**[P1] `wiki.html` — su interacción principal es inaccesible por teclado**
*Qué:* El grafo de conocimiento (`assets/js/wiki/graph.js`) no tiene `tabindex`, `role`, ni manejo de teclado más allá de Escape. Es mouse/touch-hover únicamente.
*Por qué importa:* Es la segunda página más importante del sitio según su propia arquitectura (el hub que conecta personas/lugares/fuentes/posts). Un usuario de teclado no puede ni entrar. El patrón inverso ya existe en el código: `arbol.html` tiene navegación por teclado completa y documentada (`assets/js/arbol/keyboard.js`) — nunca se extendió al grafo de la wiki.
*Fix:* Como mínimo, hacer los nodos alcanzables por Tab con foco visible y Enter para abrir el panel, sin necesidad de replicar la semántica de flechas del árbol.
*Comando sugerido:* `/impeccable harden` sobre `wiki.html` + `assets/js/wiki/graph.js`.

**[P2] `colaborar.html`: el `box-shadow` de `.pp-dropdown` viola "La Regla Sin Sombra"**
*Qué:* `box-shadow: 0 12px 32px rgba(20,20,18,.14)` en el dropdown del buscador de personas — encontrado por el detector, no por la revisión cualitativa.
*Por qué importa:* Es una regla nombrada explícitamente en `DESIGN.md` ("Ningún componente nuevo introduce box-shadow para jerarquía"). Es defendible como caso límite (es un overlay flotante separándose del contenido detrás, no una tarjeta estática), pero al menos merece una decisión consciente, no silenciosa.
*Fix:* O se documenta como excepción explícita en `DESIGN.md` (dropdowns/overlays sí pueden usar sombra para separarse del fondo), o se reemplaza por un borde + diferencia de superficie, consistente con el resto del sitio.
*Comando sugerido:* `/impeccable polish` sobre `colaborar.html`, o `/impeccable document` para registrar la excepción si es intencional.

**[P2] El indicador de foco de los inputs de formulario es débil en todo el sitio**
*Qué:* Tanto `.cmzo-field input/textarea` (el componente de formulario compartido y documentado, `home.css`) como los inputs de `colaborar.html` hacen `outline: none` y dependen solo de un cambio de `border-color` de 1px + un shift `--bg`→`--surface` muy sutil en modo claro.
*Por qué importa:* Como es el componente de formulario *compartido y documentado*, la debilidad se propaga a cualquier formulario del sitio, no solo a Colaborar. Para un usuario de baja visión navegando por teclado, un cambio de borde de 1px es una señal mucho más débil que un outline.
*Fix:* Agregar `outline: 2px solid var(--accent); outline-offset: 1px;` en `:focus-visible` — el patrón ya existe correctamente en `.colab-tab`/`.lang-opt`/`.form-submit` (agregado en el polish de esta sesión); falta aplicarlo a los inputs de texto mismos.
*Comando sugerido:* `/impeccable harden`.

**[P3] Sin indicador de carga en 3 grillas de tarjetas + el arranque del grafo de la wiki**
*Qué:* `#areaCards`/`#genCards`/`#labCards` quedan vacíos mientras esperan el fetch, sin skeleton ni spinner — a diferencia de `blog.html`/`fuentes.html`, que sí lo tienen. El host del grafo de `wiki.html` queda en `opacity:0` sin ninguna señal de que algo está pasando.
*Por qué importa:* Menor en conexión rápida, más notorio en 3G/mobile — un área en blanco se lee como "se rompió", no como "está cargando".
*Fix:* Reusar el patrón de carga ya existente en `blog.html`/`fuentes.html` para las tres grillas; agregar un texto breve tipo "Armando el grafo…" para el estado previo al fade-in de la wiki.
*Comando sugerido:* `/impeccable polish`.

## Alertas por persona

**Sam (usuario dependiente de accesibilidad)** — la persona más expuesta en este sitio:
- No puede usar `wiki.html` por teclado en absoluto (ver P1 arriba) — puerta cerrada en la segunda página más importante del sitio.
- El sistema de hover-preview estilo Gwern (`wiki-hover.js`, y el equivalente inline de `hipotesis.html`) es `mouseover`/`mouseout` únicamente, sin `focus`/`blur` — un usuario que llega por Tab a un `.wiki-link`/`.hyp-ref` nunca ve la vista previa, aunque el link en sí funcione con Enter.
- Foco de formulario débil en todo el sitio (ver P2 arriba).
- Contraejemplo positivo: `arbol.html` lo hace bien — navegación por flechas, Enter, Escape, todo documentado en un popover descubrible. La prueba de que el equipo sabe construir esto; simplemente no se extendió más allá del árbol.

**Jordan (primera vez, sin contexto previo)**:
- Las cinco tarjetas de `gen.html` (árbol/wiki/fuentes/hipótesis/colaborar) tienen el mismo peso visual, sin ninguna señal de "empezá por acá" — un visitante que no llega ya orientado no tiene ninguna pista.
- El wordmark `~/cmzo` y la estética de terminal asumen comodidad con notación de path que un familiar no técnico (una audiencia real, según `PRODUCT.md`) puede no leer como navegación.
- `hipotesis.html` presenta Llaves + Por-hacer (6 tabs) + Hipótesis todo junto en un solo scroll, con solo una línea de glosa por concepto ("llave", "sólida", "confirmada informalmente") — sin ningún prompt que invite a pasar el mouse por la explicación.

## Observaciones menores

- `contacto.html` no está huérfana — es un redirect `noindex` deliberado a `colaborar.html` (meta-refresh + `location.replace`), correctamente afuera del nav. No es un problema.
- `design-system.html` — la página que `CLAUDE.md` llama "única fuente de verdad" — todavía usa `'Inter', sans-serif` en la mayoría de su propia prosa/anotaciones (decenas de instancias). Fuera del alcance de las 14 páginas, pero socava la autoridad del propio documento.
- El color de `.form-error` en `colaborar.html` es un literal `#dc2626` en vez de un token — coincide en valor exacto con el `danger` semántico documentado, así que es consistente en resultado, no en método.
- Falsos positivos del detector que vale la pena resolver en la config, no en el código: 19 hallazgos son declaraciones `@font-face` de fuentes retiradas/candidatas (Inter, IBM Plex, Instrument Serif, Newsreader, Bodoni Moda, Young Serif) — intencionales según `CLAUDE.md`, mal interpretadas como uso en vivo. ~12 hallazgos son los colores semánticos `success`/`warning`/`danger`/`mark`, documentados en la prosa de `DESIGN.md` pero ausentes de su frontmatter — el detector solo lee el frontmatter.
- Drift real pero sin verificar línea por línea: el escaneo directo de `assets/css/` encontró ~59 valores de radio y ~117 de color fuera de escala dispersos en `styles.css`/`wiki.css`/`arbol.css`/`home.css`/`lab.css` — incluye algunos hexágonos tipo Tailwind (`#1e40af`, `#2563eb`, `#64748b`) que contradicen la regla explícita de "nunca azul pizarra" de `DESIGN.md`. No localizados a líneas exactas dentro del tiempo de esta corrida — recomendado como un pase de auditoría dedicado.

## Preguntas para considerar

1. `changelog.html` se lee como una página de otra era que nunca pasó por la migración all-serif/tokens de 2026-08. ¿Fue una excepción intencional (es una página "meta/utilitaria", no necesita la voz editorial), o es simplemente la página que nadie retomó después del rediseño?
2. El grafo de la wiki es mouse/touch-only mientras el árbol tiene un esquema de teclado completo. Dado que el patrón ya existe en el código del árbol, ¿vale la pena extender el acceso por teclado al grafo de la wiki, o el grafo se entiende como una superficie de "explorar, no operar" donde la paridad de teclado importa menos?
3. Las cinco tarjetas de `gen.html` no tienen un orden sugerido. ¿Es intencional (no hay un "punto de entrada correcto" — cada visitante busca algo distinto), o un familiar que llega por primera vez se beneficiaría de una tarjeta "empezá acá" visualmente distinguida?
