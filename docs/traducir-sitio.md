# Instrucciones para traducir el sitio al francés y al inglés

> **Para el traductor (Haiku): tu única tarea es traducir textos. No cambies código, ni claves, ni el español. Seguí estas reglas al pie de la letra.**

El sitio queda en español por defecto. Hay tres páginas con selector **ES / FR / EN** cuyos textos faltan traducir. Hoy los bloques `fr` y `en` (y los `.fr.md` / `.en.md`) son **copias del español**: tu trabajo es reemplazar el texto por su traducción.

## Archivos a tocar

| # | Archivo | Qué traducir |
|---|---------|--------------|
| 1 | `colaborar.html` | objeto `I18N` → valores de los bloques `fr` y `en` |
| 2 | `index.html` | objeto `window.I18N` → valores de los bloques `fr` y `en` |
| 3 | `sobre.html` | objeto `CHROME` → valores de los bloques `fr` y `en` (solo 2 textos: `kicker` y `title`) |
| 4 | `content/sobre.fr.md` | traducir **todo el documento** al francés |
| 5 | `content/sobre.en.md` | traducir **todo el documento** al inglés |

---

## Reglas para los diccionarios JS (archivos 1, 2 y 3)

Cada uno tiene un objeto con tres bloques: `es` (fuente, **NO TOCAR**), `fr` y `en`. Ejemplo:

```js
fr: {
  tab_comment: 'Dejar un comentario',   // ← traducir el valor: 'Laisser un commentaire',
  …
}
```

1. **Editá solo `fr` y `en`.** Nunca toques el bloque `es` ni nada fuera de esos objetos.
2. **Nunca cambies las claves** (lo de la izquierda de los dos puntos). Solo el texto entre comillas.
3. **Conservá las etiquetas HTML** dentro del texto, p. ej. `<span class="opt">(opcional)</span>` o `<br>`: traducí solo el texto visible, dejá las etiquetas igual.
4. **Apóstrofos:** los valores van entre comillas simples `'…'`. Usá **siempre el apóstrofo tipográfico `’` (U+2019), nunca el recto `'`** — el recto rompe el código. Ej.: `'Tout ce travail s’enrichit…'`.
5. **No traduzcas:** el email `mdclemenzo@gmail.com`, nombres propios (Clemenzo, Roh, Riddes, Conthey, Valais, Aven, Ardon…), `https://…` ni los puntos suspensivos `…`.
6. Cada valor queda **en una sola línea**, entre comillas simples y **con coma final** `,`, igual que ahora.
7. **Tono:** informal y cordial, como el español.

## Reglas para los markdown (archivos 4 y 5)

Traducí **todo el texto** de `content/sobre.fr.md` (al francés) y `content/sobre.en.md` (al inglés), pero **conservando la estructura markdown**:

- Encabezados (`#`, `##`, `###`), listas, negritas/cursivas: traducí el texto, dejá los símbolos.
- **Tablas** (`| … |`): traducí el contenido de las celdas, mantené las barras y la fila de guiones.
- **Enlaces** `[texto](url)`: traducí solo `texto`, **nunca** la `url`.
- **Imágenes** `![alt](ruta)`: traducí `alt`, dejá la `ruta`.
- **Bloques de código** y ```` ```mermaid ````: **no traducir** su interior (son código/diagramas).
- **Callouts** tipo `> [!note]` o `> [!info]`: traducí el texto, **no** la etiqueta `[!note]`.
- No traduzcas nombres propios (los mismos de arriba).
- Si hay frontmatter (líneas entre `---` al inicio), no lo toques salvo el `title`/`description` si los hubiera.

---

## Cómo verificar al terminar

1. Abrí cada página en el navegador y cambiá el selector **ES / FR / EN** (arriba): todos los textos deben verse traducidos.
2. Abrí la consola (F12): **no debe haber errores** de JavaScript. Si aparece uno, casi siempre es un apóstrofo recto `'` mal puesto → cambialo por `’`.
3. En Sobre, al cambiar de idioma se carga `sobre.fr.md` / `sobre.en.md`; revisá que el contenido aparezca traducido y que las tablas/diagramas sigan bien.

---

## Apéndice A — claves y texto fuente de `colaborar.html`

(Las 🔖 contienen HTML que hay que conservar.)

| Clave | Español |
|---|---|
| `title` | Colaborar |
| `intro` | Más de un avance decisivo de esta investigación —de esos que destraban un nudo y permiten subir otra generación— salió del aporte de otra persona. Si tenés un recuerdo, una corrección, un documento o el dato de alguien relacionado con la familia, escribime. También podés dejar un comentario, sin más. |
| `tab_comment` | Dejar un comentario |
| `tab_info` | Tengo información sobre alguien |
| `f_name` | Nombre |
| `f_email_opt` 🔖 | Email `<span class="opt">`(opcional, si querés que te responda)`</span>` |
| `f_message` | Mensaje |
| `q_in_tree` | ¿La persona está en el árbol? |
| `opt_in_tree` | Sí, está en el árbol |
| `opt_out_tree` | No, pero se relaciona con alguien |
| `l_persons` | Persona(s) del árbol |
| `hint_persons` | Buscá y elegí una o varias personas del árbol. |
| `ph_search` | Escribí un nombre para buscar… |
| `l_ext_name` | Nombre de la persona |
| `ph_ext_name` | Nombre y apellido |
| `l_rel_with` 🔖 | ¿Con quién del árbol se relaciona? `<span class="opt">`(opcional)`</span>` |
| `l_type` 🔖 | Tipo de información `<span class="opt">`(opcional)`</span>` |
| `t_date` | Fecha |
| `t_place` | Lugar |
| `t_doc` | Foto/documento |
| `t_anec` | Anécdota |
| `t_corr` | Corrección |
| `t_link` | Vínculo familiar |
| `l_tellus` | Contanos |
| `ph_tellus` | El dato, la anécdota, la corrección… |
| `l_link` 🔖 | Enlace `<span class="opt">`(opcional)`</span>` |
| `l_your_name` 🔖 | Tu nombre `<span class="opt">`(opcional)`</span>` |
| `l_your_email` 🔖 | Tu email `<span class="opt">`(opcional, si querés que te responda)`</span>` |
| `btn_send` | Enviar |
| `btn_sending` | Enviando… |
| `status_ok` | ¡Gracias! Recibí tu mensaje. Si dejaste tu email, te escribo. |
| `err_generic` | Algo salió mal. Intentá de nuevo o escribime a mdclemenzo@gmail.com. |
| `err_wait` | Esperá un momento antes de enviar. |
| `err_name` | Por favor, dejá tu nombre. |
| `err_message` | Por favor, escribí un mensaje. |
| `err_message_info` | Contanos algo en el mensaje. |
| `err_pick` | Elegí al menos una persona del árbol. |
| `err_ext` | Escribí el nombre de la persona. |
| `err_not_config` | El formulario todavía no está configurado. Escribime a mdclemenzo@gmail.com. |

## Apéndice B — claves y texto fuente de `index.html`

| Clave | Español |
|---|---|
| `home_h1` | Genealogía Clemenzo — investigación familiar desde el Valais, Suiza, hasta Argentina |
| `tagline` | Investigación genealógica sobre la familia Clemenzo, originaria de Ardon, en el cantón de Valais, Suiza. Documentamos su emigración a la Argentina a fines del siglo XIX y los vínculos familiares a lo largo de generaciones. |
| `fig_hero` | Valle del Ródano, Valais, Suiza |
| `label_tree` | El árbol genealógico |
| `cta_tree` | Explorá el árbol interactivo |
| `label_latest` | Última entrada |
| `label_heraldry` | Heráldica |
| `fig_valais` | Escudo de Valais |
| `fig_clemenzo` 🔖 | Armorial valesano`<br>`familia Clemenzo |
| `fig_ardon` | Escudo de Ardon |
| `stat_people` | Personas |
| `stat_dates` | Fechas documentadas |
| `stat_places` | Lugares |
| `stat_generations` | Generaciones |
| `read` | Leer → |

## Apéndice C — claves y texto fuente de `sobre.html` (objeto `CHROME`)

| Clave | Español |
|---|---|
| `kicker` | Proyecto de investigación |
| `title` | Sobre el proyecto |

Eso es todo. **Traducir, nada más.**
