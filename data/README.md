# data/arbol.db

Base de datos SQLite con las personas del árbol genealógico. Es la fuente de verdad — reemplaza a Google Sheets como origen de datos. El archivo está commiteado al repo para mantener historial de cambios.

## Flujo de datos

```
data/arbol.db
    ↓  scripts/export_arbol.py  (automático en cada npm run build)
assets/data/arbol.json
    ↓  fetch() en el browser
arbol-matrimonios.html  /  archivo.html
```

El frontend solo lee `arbol.json`. Nunca accede a la base de datos directamente.

---

## Gestión desde la terminal

```bash
# Personas
python3 scripts/gestionar_arbol.py list
python3 scripts/gestionar_arbol.py show <id>
python3 scripts/gestionar_arbol.py add
python3 scripts/gestionar_arbol.py edit <id>

# Matrimonios
python3 scripts/gestionar_arbol.py list-marriages
python3 scripts/gestionar_arbol.py add-marriage
python3 scripts/gestionar_arbol.py edit-marriage <id>

# Archivos multimedia
python3 scripts/gestionar_arbol.py list-media              # todos
python3 scripts/gestionar_arbol.py list-media <persona_id> # filtrar por persona
python3 scripts/gestionar_arbol.py add-media <persona_id>
python3 scripts/gestionar_arbol.py delete-media <media_id>
```

Después de cada operación de escritura, el script ofrece regenerar `arbol.json`. Para regenerarlo manualmente:

```bash
python3 scripts/export_arbol.py
```

Para editar la base de datos con interfaz gráfica: [DB Browser for SQLite](https://sqlitebrowser.org/).

---

## Archivos multimedia

- **Fotos**: `assets/images/personas/` — formato WebP, nombrar como `p26-descripcion.webp`
- **Documentos**: `assets/docs/personas/` — nombrar como `p26-acta-nacimiento.pdf`

Convertir imágenes a WebP antes de commitear:

```bash
npm run optimize-personas
```

---

## Contrato JSON — `assets/data/arbol.json`

Este es el contrato que cualquier exportador debe cumplir. El frontend asume exactamente esta estructura. Para cambiar la fuente de datos (otra base de datos, una API, CSV) basta con escribir un nuevo script que genere este mismo JSON.

### Estructura raíz

```json
{
  "personas":    [ <Persona>, ... ],
  "matrimonios": [ <Matrimonio>, ... ]
}
```

### Objeto `Persona`

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `id` | string | ✅ | Identificador único. Formato `p<n>` (ej: `"p26"`) |
| `name` | string | ✅ | Nombre completo |
| `gender` | string | — | `"M"`, `"F"` o `""` |
| `birth_date` | string | — | ISO parcial: `"YYYY-MM-DD"`, `"YYYY-MM"`, `"YYYY"` o `""` |
| `birth_place` | string | — | Lugar de nacimiento o `""` |
| `death_date` | string | — | Mismo formato que `birth_date` |
| `death_place` | string | — | Lugar de fallecimiento o `""` |
| `father_id` | string | — | `id` del padre, o `""` |
| `mother_id` | string | — | `id` de la madre, o `""` |
| `branch` | string | ✅ | Rama familiar (ej: `"clemenzo"`, `"roh"`). Determina el color en la visualización |
| `generation` | integer | ✅ | Número de generación. `1` = generación más antigua registrada |
| `sort_order` | integer | ✅ | Posición dentro de la generación (para ordenar en listas) |
| `vivo` | string | — | `"si"`, `"no"` o `""` |
| `photo_url` | string | — | Ruta relativa a una imagen de avatar, o `""` |
| `notes` | string | — | Texto libre: hipótesis, contexto histórico |
| `sources` | string | — | Citas de documentos (actas, censos, etc.) |
| `media` | array | ✅ | Array de objetos `Media`. Vacío (`[]`) si no hay archivos |

### Objeto `Media` (embebido en `Persona.media`)

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `id` | string | ✅ | Identificador único. Formato `med<n>` |
| `url` | string | ✅ | Ruta relativa al archivo (ej: `"assets/images/personas/p26-foto.webp"`) |
| `type` | string | ✅ | `"photo"` o `"document"` |
| `caption` | string | — | Texto descriptivo visible en el panel y el modal |
| `group_label` | string | — | Agrupa visualmente varios ítems bajo un encabezado común (ej: `"Carta de Conthey, 1905"`) |
| `group_order` | integer | — | Posición dentro del grupo (ascendente). `0` si no está en un grupo |

Los ítems con el mismo `group_label` se renderizan juntos. El orden dentro del grupo lo determina `group_order`.

### Objeto `Matrimonio`

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `id` | string | ✅ | Identificador único. Formato `m<n>` (ej: `"m1"`) |
| `spouse1_id` | string | ✅ | `id` del primer cónyuge |
| `spouse2_id` | string | ✅ | `id` del segundo cónyuge |
| `marriage_date` | string | — | ISO parcial, mismo formato que `birth_date` |
| `marriage_place` | string | — | Lugar del matrimonio o `""` |
| `divorce_date` | string | — | Solo si aplica |
| `notes` | string | — | Texto libre |

### Ejemplo mínimo válido

```json
{
  "personas": [
    {
      "id": "p1",
      "name": "Francisco Clemenzo",
      "gender": "M",
      "birth_date": "1859",
      "birth_place": "Conthey, Valais",
      "death_date": "1934",
      "death_place": "Paraná, Entre Ríos",
      "father_id": "",
      "mother_id": "",
      "branch": "clemenzo",
      "generation": 1,
      "sort_order": 1,
      "vivo": "no",
      "photo_url": "",
      "notes": "",
      "sources": "",
      "media": [
        {
          "id": "med1",
          "url": "assets/images/personas/p1-foto.webp",
          "type": "photo",
          "caption": "Circa 1910",
          "group_label": "",
          "group_order": 0
        }
      ]
    }
  ],
  "matrimonios": [
    {
      "id": "m1",
      "spouse1_id": "p1",
      "spouse2_id": "p2",
      "marriage_date": "1885",
      "marriage_place": "Paraná, Entre Ríos",
      "divorce_date": "",
      "notes": ""
    }
  ]
}
```

---

## Schema de la base de datos

### Tabla `personas`

| Columna | Tipo | Notas |
|---|---|---|
| `id` | TEXT PK | Formato `p<n>` |
| `name` | TEXT | |
| `gender` | TEXT | `"M"` / `"F"` / `""` |
| `birth_date` | TEXT | ISO parcial |
| `birth_place` | TEXT | |
| `death_date` | TEXT | ISO parcial |
| `death_place` | TEXT | |
| `father_id` | TEXT | |
| `mother_id` | TEXT | |
| `branch` | TEXT | |
| `generation` | INTEGER | |
| `sort_order` | INTEGER | |
| `vivo` | TEXT | `"si"` / `"no"` / `""` |
| `photo_url` | TEXT | |
| `notes` | TEXT | |
| `sources` | TEXT | |

### Tabla `matrimonios`

| Columna | Tipo | Notas |
|---|---|---|
| `id` | TEXT PK | Formato `m<n>` |
| `spouse1_id` | TEXT | |
| `spouse2_id` | TEXT | |
| `marriage_date` | TEXT | ISO parcial |
| `marriage_place` | TEXT | |
| `divorce_date` | TEXT | |
| `notes` | TEXT | |

### Tabla `media`

| Columna | Tipo | Notas |
|---|---|---|
| `id` | TEXT PK | Formato `med<n>` |
| `persona_id` | TEXT | FK → `personas.id` |
| `url` | TEXT | Ruta relativa desde la raíz del repo |
| `type` | TEXT | `"photo"` / `"document"` |
| `caption` | TEXT | |
| `group_label` | TEXT | `""` si no pertenece a ningún grupo |
| `group_order` | INTEGER | `0` por defecto |
