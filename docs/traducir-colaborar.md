# Instrucciones para traducir la página «Colaborar»

> **Para el traductor (Haiku): tu única tarea es traducir textos de interfaz. No cambies código, ni claves, ni el español. Seguí estas reglas al pie de la letra.**

## Qué hay que hacer

Traducir los textos de la interfaz de **`colaborar.html`** al **francés** y al **inglés**.

Dentro de `colaborar.html`, en el `<script>`, hay un objeto `I18N` con **tres bloques**:

```js
const I18N = {
  es: { … },   // ← FUENTE. Ya está traducido. NO TOCAR.
  fr: { … },   // ← traducir al francés (hoy es una copia del español)
  en: { … },   // ← traducir al inglés (hoy es una copia del español)
};
```

Cada bloque tiene **las mismas claves**. Hoy `fr` y `en` contienen el texto en español como respaldo. Tu trabajo es **reemplazar el valor de cada clave** (el texto entre comillas, a la derecha de los dos puntos) por su traducción.

Ejemplo:

```js
// ANTES (en el bloque fr)
tab_comment: 'Dejar un comentario',
// DESPUÉS
tab_comment: 'Laisser un commentaire',
```

## Reglas estrictas (no romper nada)

1. **Editá solo los bloques `fr` y `en`.** No toques el bloque `es` ni ninguna otra parte del archivo (HTML, CSS, demás JavaScript).
2. **Nunca cambies las claves.** `title`, `intro`, `tab_comment`, etc. quedan idénticas. Solo cambia el texto entre comillas.
3. **Conservá las etiquetas HTML dentro del texto.** Algunos valores tienen `<span class="opt">(opcional, …)</span>`. Dejá la etiqueta igual y traducí solo el texto visible de adentro.
   - Ej.: `'Email <span class="opt">(opcional, si querés que te responda)</span>'`
     → `'Email <span class="opt">(optionnel, si vous voulez une réponse)</span>'`
4. **Apóstrofos:** los valores van entre comillas simples `'…'`. En francés (y en inglés) usá **siempre el apóstrofo tipográfico `’` (U+2019), nunca el recto `'`** — el recto rompería el código.
   - Ej. correcto: `'Tout ce travail s’enrichit de ce qu’apportent les autres.'`
5. **No traduzcas:** el email `mdclemenzo@gmail.com`, el apellido «Clemenzo» ni otros nombres propios. Dejá `https://…` y los puntos suspensivos `…` tal cual.
6. **Tono:** informal y cordial, como el español. Francés: tratamiento de cortesía simple y natural. Inglés: friendly e informal.
7. Cada valor queda **en una sola línea**, entre comillas simples y **terminando con coma** `,` — igual que está ahora.

## Cómo verificar cuando termines

1. Abrir `colaborar.html` en el navegador y cambiar el selector **ES / FR / EN** arriba a la derecha: todos los textos (títulos, campos, botones, mensajes) deben verse traducidos.
2. Abrir la consola del navegador (F12): **no debe haber errores** de JavaScript (si aparece un error, casi siempre es un apóstrofo recto `'` mal puesto — cambialo por `’`).

## Referencia: claves y texto fuente (español)

Esta es la lista completa. Traducí el valor de cada una en los bloques `fr` y `en`. (Las marcadas con 🔖 contienen HTML que hay que conservar.)

| Clave | Texto en español |
|---|---|
| `title` | Colaborar |
| `intro` | Toda esta investigación se nutre de lo que aportan otros. Si tenés un recuerdo, una corrección, un documento o el dato de alguien relacionado con la familia, contámelo acá. También podés simplemente dejar un comentario. |
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

Eso es todo. **Traducir, nada más.**
