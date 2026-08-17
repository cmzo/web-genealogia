---
name: CMZO
description: Sitio personal editorial-documental de Matías Clemenzo — blog, lab de experimentos y grafo de investigación genealógica bajo una sola identidad serif.
colors:
  bg: "#f6f6f4"
  surface: "#ffffff"
  border: "#e8e8e6"
  text: "#1a1a1a"
  muted: "#5a5040"
  accent: "#2d4a3e"
  on-accent: "#cad7d0"
  tag-lugar: "#3f5c6b"
  tag-familia: "#8a5a3c"
  tag-metodo: "#2d4a3e"
  tag-tec: "#5a4a70"
  tag-otro: "#5a5040"
  stat-terracota: "#b5715a"
  stat-ochre: "#a8763a"
  stat-salvia: "#5c8a6e"
  pill-ink: "#262220"
  pill-escritura: "#f6dcc6"
  pill-experim: "#e0d9f4"
  pill-investig: "#c9e6d5"
  pill-archivo: "#f3e6b8"
  pill-hipotesis: "#cfe0f3"
  gcard-ink: "#f3ead9"
  gcard-gold: "#e8c77a"
  gcard-gold-ink: "#3a2c14"
  gcard-escritura: "#a8562f"
  gcard-experim: "#5d4a7a"
  gcard-investig: "#3f6b4a"
  gcard-archivo: "#8a6a1f"
  gcard-hipotesis: "#3f5f78"
typography:
  display:
    fontFamily: "Fraunces, Hanken Grotesk, Georgia, serif"
    fontSize: "clamp(34px, 6vw, 60px)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Source Serif 4, Georgia, serif"
    fontSize: "19.5px"
    fontWeight: 400
    lineHeight: 1.75
    letterSpacing: "normal"
  label:
    fontFamily: "IBM Plex Mono, monospace"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.04em"
  code:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  nav: "10px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "12px"
  md: "24px"
  lg: "44px"
  xl: "80px"
components:
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.accent}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "10px 18px"
  button-solid:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "10px 18px"
  card-gcard:
    backgroundColor: "{colors.pill-investig}"
    textColor: "{colors.pill-ink}"
    rounded: "{rounded.lg}"
    padding: "24px"
---

# Design System: CMZO

## Overview

**Creative North Star: "El cuaderno de investigación encuadernado en papel de archivo"**

CMZO es el sitio personal de Matías Clemenzo, modelado sobre gwern.net: un blog, un "lab" de experimentos técnicos y un proyecto grande de investigación genealógica conviven bajo una identidad editorial única, sin quedar encasillados en un solo tema. La superficie es enteramente serif — Fraunces para títulos, Source Serif 4 para todo el resto — con monoespacio reservado exclusivamente a código, breadcrumbs de navegación y metadata técnica. Esa combinación deliberada (títulos de libro + cuerpo de archivo + navegación de terminal) es la firma visual del sitio: se lee como un cuaderno de investigación real, no como una plantilla de blog ni un producto genealógico de catálogo.

El sistema es plano por decisión (`box-shadow: none` explícito en componentes clave): la jerarquía y la profundidad se transmiten con bordes de 1px y superficie clara/oscura, nunca con sombra. La paleta es cálida y desaturada — un verde botella como único acento, sin matiz de "hacker" ni fondo sepia — porque el sitio documenta papeles de archivo, no vende un producto. El color con significado (familias de tags, estados de hipótesis, pastillas de área) es la excepción deliberada a esa neutralidad: ahí el color codifica información, no decora.

Modo oscuro es una restricción permanente, no una decisión puntual: cada color tiene su contraparte y se probaron y rechazaron explícitamente un fondo marrón/sepia y un verde "hacker" saturado para el modo oscuro. Todas las fuentes son self-hosted (sin Google Fonts ni CDN).

**Key Characteristics:**
- Enteramente serif: Fraunces (títulos) + Source Serif 4 (todo el resto); monoespacio solo en código y navegación
- Superficie plana, sin sombras: profundidad vía bordes de 1px y color de superficie
- Un único acento neutro (verde botella claro / gris-salvia sin matiz oscuro); el resto del color es semántico, nunca decorativo
- Ritmo de espaciado editorial (deriva del contenido), no una grilla de 8px estricta
- Modo oscuro como invariante de primera clase en cada componente

## Colors

Paleta cálida y desaturada con un único acento sin matiz agresivo; el resto del color existe para codificar significado (tipo de etiqueta, estado de hipótesis, área del sitio), no para decorar.

### Primary
- **Verde botella / Salvia sin matiz** (`--accent`, `#2d4a3e` claro / `#ddd8cd` oscuro): énfasis, hover, links, elementos activos. En modo oscuro pierde deliberadamente todo matiz de verde — cualquier verde sobre grafito lee como terminal de hacker, así que el acento oscuro es un gris-salvia neutro.

### Neutral
- **Papel** (`--bg`, `#f6f6f4` claro / `#17181a` oscuro): fondo general de página. El oscuro es grafito neutro, nunca sepia ni azul pizarra.
- **Superficie** (`--surface`, `#ffffff` claro / `#1e2022` oscuro): contenido, cards, paneles.
- **Borde** (`--border`, `#e8e8e6` claro / `#303336` oscuro): la única herramienta de profundidad del sistema — no hay sombras.
- **Tinta** (`--text`, `#1a1a1a` claro / `#e9eaec` oscuro): texto principal.
- **Musgo cálido** (`--muted`, `#5a5040` claro / `#9a9ea3` oscuro): texto secundario y metadata; marrón-gris cálido en claro, gris neutro en oscuro.
- **Texto sobre acento** (`--on-accent`, `#cad7d0` claro / `#1a1a18` oscuro).

### Named Rules
**La Regla de la Neutralidad Oscura.** El acento no tiene matiz en modo oscuro. Cualquier verde sobre fondo grafito lee como terminal de hacker; el color con significado real vive únicamente en las familias `--tag-*`.

**La Regla del Color Semántico.** Todo color fuera de la paleta base (`bg`/`surface`/`border`/`text`/`muted`/`accent`) codifica un significado específico y estable: familia de etiqueta, estado de hipótesis o área del sitio. Nunca se introduce un color nuevo por preferencia estética puntual.

### Familias de etiquetas (tags del blog/wiki)
Desaturadas para convivir con el verde botella; se aclaran en oscuro para mantener contraste. Un tag sin familia cae en `--tag-otro`.
- **Azul pizarra** (`--tag-lugar`, `#3f5c6b` / `#8fb3c4` oscuro): geografía — valais, riddes, argentina.
- **Terracota apagada** (`--tag-familia`, `#8a5a3c` / `#cf9c80` oscuro): personas y apellidos — clemenzo, roh.
- **Verde botella** (`--tag-metodo`, `#2d4a3e` / `#8fb3a1` oscuro): investigación y archivo (coincide con `--accent` en claro).
- **Ciruela** (`--tag-tec`, `#5a4a70` / `#b3a3d4` oscuro): técnica — llm, ia, pkm, wiki.
- **Gris cálido** (`--tag-otro`, `#5a5040` / `#9a9ea3` oscuro): sin familia asignada.

### Estado de hipótesis (escala de certeza, no categorías)
- **Terracota** (`--stat-terracota`, `#b5715a` / `#d69880` oscuro): especulativa.
- **Ocre** (`--stat-ochre`, `#a8763a` / `#d1a768` oscuro): plausible.
- **Salvia** (`--stat-salvia`, `#5c8a6e` / `#8fc0a2` oscuro): sólida.
- **Acento**: confirmada (sin token propio, usa `--accent` directamente).

### Pastillas de texto de área (`.cmzo-pill`)
Fórmula fija en ambos modos — tinta casi negra (`--pill-ink`, `#262220`) sobre fondo pastel saturado, nunca el tono del color sobre fondo lavado. Son objetos de papel: no cambian con el tema. Uso: la pastilla chica de texto (`.cmzo-pill`), **no** la tarjeta grande `.cmzo-gcard` (ver abajo — desde 2026-08-16 tiene su propia paleta).
- **Damasco** (`--pill-escritura`, `#f6dcc6`): área Blog.
- **Lavanda** (`--pill-experim`, `#e0d9f4`): área Lab.
- **Menta** (`--pill-investig`, `#c9e6d5`): área Genealogía (color por defecto).
- **Amarillo pálido** (`--pill-archivo`, `#f3e6b8`): Fuentes.
- **Celeste pálido** (`--pill-hipotesis`, `#cfe0f3`): Hipótesis.

### Tarjetas de área — «Archivo cálido» (`.cmzo-gcard`)
Reemplazó al pastel original el 2026-08-16 (el usuario lo pidió explícitamente tras comparar varias direcciones: "aburren rápido los tonos pastel"). Tonos profundos y saturados por familia, tinta clara tipo pergamino (`--gcard-ink`, `#f3ead9`), badge en un dorado latón compartido por las cinco (`--gcard-gold`, `#e8c77a` con tinta `#3a2c14`) — un sello, no un color de familia más. Deliberadamente **no** reusa `--pill-*`: esos tokens siguen pastel porque los consume también `.cmzo-pill`, que necesita fondo claro + tinta oscura. Fija en ambos temas.
- **Terracota quemada** (`--gcard-escritura`, `#a8562f`): Blog.
- **Ciruela oscura** (`--gcard-experim`, `#5d4a7a`): Lab.
- **Verde botella profundo** (`--gcard-investig`, `#3f6b4a`): Genealogía (color por defecto).
- **Bronce/oliva** (`--gcard-archivo`, `#8a6a1f`): Fuentes.
- **Azul pizarra profundo** (`--gcard-hipotesis`, `#3f5f78`): Hipótesis.

### Colores semánticos (callouts)
- **success** (`#16a34a`, fondo `rgba(22,163,74,.05)`): confirmaciones.
- **warning** (`#d97706`, fondo `rgba(217,119,6,.05)`): datos inciertos.
- **danger** (`#dc2626`, fondo `rgba(220,38,38,.05)`): datos contradictorios.
- **mark** (resaltado `==texto==`): `#fef08a` claro / `#4a4424` oscuro.

## Typography

**Display Font:** Fraunces (con Hanken Grotesk, Georgia como fallback)
**Body Font:** Source Serif 4 (con Georgia como fallback)
**Label/Mono Font:** IBM Plex Mono (navegación, breadcrumbs, metadata técnica) · JetBrains Mono (código)

**Character:** Título de libro encontrándose con cuerpo de archivo. Fraunces aporta calidez editorial y peso a los títulos (incluidos h2 de sección en versalitas, `font-variant-caps: small-caps`); Source Serif 4 hace todo el trabajo pesado de lectura — cuerpo, UI, botones, tablas — con line-height generoso (1.75) porque el sitio se lee, no se escanea. IBM Plex Mono queda reservado a lo que es literalmente navegación de sistema: breadcrumb, comando ⌘K, etiquetas de sección.

### Hierarchy
- **Display** (700, clamp(34–60px), 1.05): `.article-title`, h1 de página. Fraunces.
- **Headline** (700, clamp(36–51px), 1.2): `.article-content h2` — en versalitas (`text-transform: lowercase` + `small-caps` + tracking 0.04em). Fraunces.
- **Title** (600, clamp(22–28px), 1.3): h3 de artículo, títulos de card. Sin versalitas — en textos largos las versalitas rompen la silueta de la palabra.
- **Body** (400, 19.5px, 1.75): párrafos de artículo. Source Serif 4. Máximo ~1020px de ancho de columna.
- **Label** (500, 12px, 0.04em, mayúsculas donde aplica): breadcrumb, kickers, botones. IBM Plex Mono.
- **Code** (400, 13px/0.88em inline, 1.6): bloques y código inline. JetBrains Mono.

### Named Rules
**La Regla del Todo-Serif.** Desde 2026-08 no hay tipografía sans-serif en el sitio (`--sans`/`--mono` son alias de Source Serif 4 en CSS); el único monoespacio real es JetBrains Mono en código e IBM Plex Mono en navegación/metadata.

**La Regla de las Versalitas de Sección.** Solo los h2 de sección editorial llevan versalitas; nunca un título de card, nunca un h1. Las versalitas existen para dar peso ceremonial a un encabezado de sección larga, no para etiquetar contenido corto.

## Layout

Ritmo editorial derivado del contenido, sin grilla de 8px estricta. Constantes: nav `--nav-h: 52-58px` sticky; sidebar (legado, solo páginas wiki directas) `200px`; ancho máximo de artículo `1020px` (contenido) / `860px` (contenedor completo); ancho máximo de home `900px`; `.cmzo-wrap` general `1120px` con padding `0 40px`. `site-main` padding `48px 56px 80px` desktop, `32px 24px 60px` mobile. Breakpoint único de colapso a mobile: `760px` (nav) / `960px` (sidebar legado, panel del árbol). Escala de espaciado observada: 4 · 6 · 8 · 12 · 16 · 20 · 24 · 28 · 32 · 40 · 44 · 48 · 52 · 56 · 60 · 80px — sin proporción fija, cada valor responde al elemento que separa.

Layout de página: shell `.cmzo-app` (full-bleed, para árbol/wiki) vs. `.cmzo-page` (contenido centrado, scrolleable, `flex: 1 0 auto` para que el footer nunca se superponga). Blog listing: grid de columnas de 260–360px, `max-width: 1128px` + `margin: auto`; `.cmzo-page .blog-grid` agrega `justify-content: center` (en `home.css`) — las columnas se centran dentro de ese bloque en vez de empacarse a la izquierda contra el título.

## Elevation & Depth

Sistema plano por decisión: no hay vocabulario de sombras. La profundidad se transmite exclusivamente con bordes de 1px (`--border`) y diferencia de superficie (`--bg` vs `--surface`). Componentes clave declaran `box-shadow: none` explícitamente (p. ej. `.cmzo-modal-card`) en vez de heredar un shadow por defecto.

### Named Rules
**La Regla Sin Sombra.** Ningún componente nuevo introduce `box-shadow` para jerarquía. Si algo necesita destacarse, usa borde o superficie más clara/oscura, no elevación simulada.

## Shapes

Radios pequeños y consistentes, nunca decorativos: `4px` (chips, botones), `6px` (nav mockups, sidebar, formularios), `8px` (paneles, cards, tablas — el radio "por defecto" del sitio), `10px` (top-nav), `999px`/`20px` (pastillas de estado y etiqueta — full-round). Bordes siempre `1px solid var(--border)`, nunca más gruesos. Sin recortes (`clip-path`) ni geometría decorativa; la forma sirve para delimitar contenido, no para expresar personalidad.

## Components

### Top-nav (CMZO, `.cmzo-top`)
Altura 58px, construida en runtime por `nav.js` leyendo `data-section`/`data-page` del `<body>`. Layout "Variante A": marca `~/cmzo` + breadcrumb de secciones ancladas a la izquierda (línea vertical entre segmentos), spacer elástico, y a la derecha búsqueda ⌘K separada por línea de la caja de herramientas (idioma · tema · GitHub). Todo en IBM Plex Mono. En mobile (≤760px) colapsa a lupa + toggle de tema; el resto vive en un drawer.

### Buttons
- **Shape:** radio 4px (`sm`).
- **Outline** (`.cmzo-btn`, por defecto): transparente, texto y borde `--accent`. Uso uniforme en dashboards.
- **Solid** (`.cmzo-btn--solid`): fondo `--accent`, texto `--on-accent`. Primario, uso escaso.
- **Ghost** (`.cmzo-btn--ghost`): borde tenue, secundario.
- Todos en IBM Plex Mono 13px, con flecha `→` como sufijo.

### Cards / Containers
- **Panel de índice** (`.cmzo-viz` + `.cmzo-srcrow`): caja con cabecera mono, filas grilla icono/nombre/meta. Usado en Fuentes y dashboard `/gen`.
- **Tarjeta de color sólido** (`.cmzo-gcard`): sin borde ni portada — la tarjeta entera es el color profundo de su familia («Archivo cálido», ver Colors) con tinta `--gcard-ink` clara, fijo en ambos temas. Badge en `--gcard-gold` compartido por las cinco familias. Racimo de círculos (`.cmzo-gcard-cluster`) solo cuando hay individuos reales que nombrar; si no, badge solo. Barra de proporción (`.cmzo-gcard-bar`) solo cuando hay un dato real que mostrar. Grilla de 3 por fila.
- **Corner Style:** 8px.
- **Shadow Strategy:** ninguna — ver Elevation.
- **Border:** ninguno en `.cmzo-gcard` (el color es el borde visual); 1px `--border` en el resto.

### Encabezado de sección (`.cmzo-mod-head` + `.cmzo-rub`)
Desde 2026-08-16, todo `<h1>`/`<h2>` de página o sección (home, `/gen`, Fuentes, Hipótesis, Colaborar, Blog, Lab) lleva la **rúbrica** como subrayado — la firma real de León Francisco Clemenzo (p20), vectorizada y nivelada 6°, un `<symbol id="cmzo-rubrica">` compartido referenciado por `<use>` en cada página. Reemplazó al filete de 1px (`.rule`, retirado). `preserveAspectRatio="none"` estira el trazo a un ancho fijo (290px) manteniendo el alto, como un subrayado hecho a mano. `<h2>` + rúbrica van envueltos juntos en `.cmzo-mod-title`; un ícono opcional (`.cmzo-mod-icon`) o una meta a la derecha (`.cmzo-mod-meta`, `margin-left:auto`) quedan afuera de ese wrapper.

### Log / Stream (`.cmzo-stream` + `.cmzo-fpill`)
Bitácora de la home: filtros como pastillas segmentadas (`.cmzo-fpill`, mismo componente que las tabs de Hipótesis), filas `.cmzo-s-item` con fecha/tipo/título/categoría. Pills de tipo: contenido real (post/lab) en acento; efímero (nota/imagen/enlace/cambio) en neutro.

### Modal (`.cmzo-modal-card`)
820px, `box-shadow: none`, cabecera con tipo + botón cerrar, cuerpo con soporte markdown completo.

### Forms (`.cmzo-form` + `.cmzo-field`)
Labels IBM Plex Mono mayúsculas; inputs sobre `--bg` (no `--surface`); foco en `--accent`. Pie con hint mono + botón.

### Pills / Chips
- **Etiqueta de tag** (`.tag-pill`): texto de color sobre `color-mix(in srgb, var(--c) 19%, var(--surface))`, mayúsculas, tracking — el color viene de `data-fam` (`--tag-*`).
- **Estado de hipótesis** (`.hyp-status`): misma receta exacta que `.tag-pill`, con la escala `--stat-*`.
- **Área** (`.cmzo-pill`): fondo pastel `--pill-*` + tinta `--pill-ink`.
- **Tipo de cambio** (`.changelog-tag`, en `changelog.html`): misma receta que `.tag-pill`, mapeada a tokens ya existentes en vez de una paleta propia — nueva función → `--stat-terracota`, novedad (default) → `--tag-tec`, mejora → `--stat-salvia`, arreglo → `--stat-ochre`. Reemplazó el 2026-08-16 una paleta ad-hoc de 5 hex fijos que no se adaptaba a modo oscuro.

## Do's and Don'ts

### Do:
- **Do** mantener todo el sitio en serif (Fraunces + Source Serif 4); reservar monoespacio a código y navegación de sistema únicamente.
- **Do** transmitir profundidad con bordes de 1px y diferencia de superficie, nunca con `box-shadow`.
- **Do** reflejar todo cambio de token, componente o variante en `design-system.html` de inmediato — es la única fuente de verdad visual del sitio.
- **Do** usar color semántico (familias de tag, estados de hipótesis, pastillas de área) solo con su significado fijo; nunca decorativo.
- **Do** probar modo oscuro y modo claro en cada cambio: el modo oscuro es una restricción permanente, no un afterthought.

### Don't:
- **Don't** introducir un fondo marrón/sepia en modo oscuro — se probó y se rechazó explícitamente en 2026-08.
- **Don't** dar matiz de verde al acento en modo oscuro — cualquier verde sobre grafito lee como terminal "hacker"; el oscuro usa un salvia sin matiz.
- **Don't** agregar sombras para jerarquía o elevación en ningún componente nuevo.
- **Don't** usar versalitas en títulos de card ni en h1 de página — solo en h2 de sección editorial.
- **Don't** cargar fuentes desde Google Fonts o un CDN — todo el tipo es self-hosted en `assets/fonts/*.woff2`.
- **Don't** inventar un color nuevo por preferencia estética puntual sin asignarle un significado semántico estable y documentarlo aquí.
