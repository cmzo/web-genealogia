# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Tres públicos, sin jerarquía fija entre ellos:

- **Familiares y contactos de investigación** — parientes, contactos genealógicos en el Valais (Suiza) y en la Colonia San José (Entre Ríos, Argentina), y colaboradores que aportan datos, correcciones o documentos vía el formulario de Colaborar.
- **Lectores del blog/lab en general** — interesados en los posts de Matías sobre tecnología, proyectos y reflexiones personales, sin conexión previa a la genealogía.
- **Matías mismo, como archivo personal** — el sitio también funciona como su propio registro y memoria de investigación, no solo de cara al público.

## Product Purpose

CMZO (cmzo.net) es el sitio personal de Matías Clemenzo, modelado sobre gwern.net: un espacio no encasillado en un solo tema, donde conviven un blog personal, un "lab" de experimentos técnicos y un proyecto grande y en curso de investigación genealógica (árbol familiar, wiki de investigación, fuentes documentales, hipótesis abiertas). La genealogía es el proyecto ancla — el más grande y el que más contenido estructurado tiene — pero el sitio existe para que Matías pueda "postear sobre lo que quiera", no para quedar definido únicamente por el tema genealógico.

Éxito = que el sitio siga siendo un lugar vivo donde Matías publica lo que le interesa (genealógico o no) y donde su investigación familiar avanza de forma visible y consultable por sus contactos.

## Positioning

No es un árbol genealógico genérico ni una plantilla de blog: es un grafo de conocimiento personal construido a mano (SQLite como fuente de verdad, wiki tipo Obsidian con documentos curados y transcripciones, hipótesis de investigación rastreadas como tareas pendientes) combinado con un blog y un lab de experimentos técnicos bajo una sola identidad editorial. Ningún producto genealógico "de catálogo" ni ningún blogging template podría copiar honestamente esa combinación específica de rigor documental + identidad personal no temática.

## Operating Context

- Investigación genealógica de ~6 años, con acceso a documentación en Argentina y Suiza; relación activa con el Museo del Inmigrante de Entre Ríos y con contactos en el Valais; viaje al Valais planeado a futuro. Apellidos en investigación activa: Clemenzo/Clemenzoz (rama suiza) y Arceo (motivo personal: la ciudadanía española de Matías fija su apellido legal como "Clemenzó Arceo").
- El contenido genealógico se gestiona con `scripts/gestionar_web.py` (personas, matrimonios, media, documentos curados) sobre `data/arbol.db`, exportado a JSON en cada build. Requiere aprobación explícita del usuario antes de crear personas o cargar documentos/media (no es un flujo autoservicio).
- Los posts del blog se escriben en Markdown con front matter; las traducciones al francés se hacen a mano con un LLM en sesión (fidelidad completa, sin resumir), no vía una API de traducción.
- El formulario de Colaborar recibe aportes de visitantes (comentarios, correcciones, datos) vía Google Apps Script + Sheet, con antispam en capas (honeypot, traba de tiempo, Cloudflare Turnstile).
- No hay suite de tests ni linter configurado en el proyecto.

## Capabilities and Constraints

- Sitio estático sin framework de build: HTML/CSS/JS plano con un pipeline Node.js propio (`scripts/build.js`), desplegado en Cloudflare Workers Assets (`cmzo.net`).
- Fuente de verdad genealógica: SQLite (`data/arbol.db`), exportado a `assets/data/arbol.json` en build — el front-end nunca toca la DB directamente.
- Tipografía y assets **self-hosted** (sin dependencias de Google Fonts ni CDN para fuentes); soporte de modo oscuro obligatorio en todo el sitio.
- El deploy (`npm run deploy`) hace `git add -A`: cualquier archivo que no deba llegar al repo público tiene que estar gitignoreado — no hay otra red de seguridad. Material sensible (escaneos con datos personales, fotos sin permiso de republicación) va a `claude_mira_aqui/`, nunca a una ruta trackeada.
- Idioma: el sitio y toda la comunicación de cara al usuario son en español (salvo las traducciones al francés de posts específicos).

## Brand Commitments

- **Marca: CMZO**, alineada con el dominio `cmzo.net`.
- Identidad editorial: paleta cálida (verde botella `--accent` en modo claro, gris neutro + acento sin matiz en modo oscuro — se probó y se descartó explícitamente un fondo marrón/sepia y un verde "hacker" en modo oscuro), tipografía totalmente serif (Fraunces para títulos, Source Serif 4 para todo lo demás, monoespaciada solo en bloques de código).
- Voz: sin etiquetas de seniority ni autodefiniciones de nivel en el copy (p. ej. rechazó explícitamente "Junior Dev"). Lede vigente de la home resume el enfoque: seis años investigando genealogía familiar, y "de vez en cuando" posteando sobre otras cosas.

## Evidence on Hand

- Documentación exhaustiva del sistema de diseño y arquitectura en `CLAUDE.md` (raíz del proyecto) — tratarlo como fuente autorizada del estado incumbente del sitio.
- Contenido real existente: posts de blog (`content/posts/`), páginas de wiki y documentos curados (`content/wiki/`, `content/documentos/`), fuentes documentales (`content/fuentes/`), notas de investigación por persona (`content/personas/`), hipótesis abiertas (`content/hipotesis/`) — no hay datos de ejemplo ni ficticios en el sitio, todo el contenido genealógico es investigación real.
- `README.md` describe una paleta y layout de dos columnas **desactualizados** (pre-rediseño CMZO de 2026-06/08) — no usarlo como autoridad visual; `CLAUDE.md` y `design-system.html` son la fuente vigente.

## Product Principles

1. La genealogía es el eje del sitio, no una sección más entre iguales — pero no define la identidad completa de Matías ni limita qué puede publicar.
2. El rigor documental no se sacrifica por conveniencia: nunca afirmar en el sitio lo que no está respaldado por los datos/documentos, y nunca crear personas o cargar media sin aprobación explícita del usuario.
3. Consistencia visual estricta: todo cambio de UI se refleja en `design-system.html`, que es la única fuente de verdad del lenguaje visual — no se introducen valores estéticos ad hoc.
4. El modo oscuro y el self-hosting de assets (fuentes, librerías vendoreadas como D3/Cytoscape/Mermaid) son restricciones permanentes del sitio, no decisiones puntuales.
5. Los aportes de visitantes (formulario de Colaborar) se tratan como una fuente legítima de datos genealógicos, protegida pero no cerrada al público.

## Accessibility & Inclusion

Sin requisito puntual de un visitante específico conocido. El sitio sigue buenas prácticas generales de accesibilidad (contraste de color, navegación por teclado, semántica HTML) ya reflejadas en la implementación actual; no hay un estándar formal (WCAG AA/AAA, etc.) exigido explícitamente.
