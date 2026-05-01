# data/arbol.db

Base de datos SQLite con las personas del árbol genealógico. Es la fuente de verdad del árbol — reemplaza a Google Sheets como origen de datos.

El archivo está commiteado al repo para mantener historial de cambios en los datos.

## Flujo de datos

```
data/arbol.db
    ↓  (scripts/export_arbol.py — automático en cada build)
assets/data/arbol.json
    ↓  (fetch en el browser)
arbol-matrimonios.html
```

## Gestión de datos

```bash
# Personas
python3 scripts/gestionar_arbol.py list
python3 scripts/gestionar_arbol.py show p26
python3 scripts/gestionar_arbol.py add
python3 scripts/gestionar_arbol.py edit p26

# Matrimonios
python3 scripts/gestionar_arbol.py list-marriages
python3 scripts/gestionar_arbol.py add-marriage
python3 scripts/gestionar_arbol.py edit-marriage m1

# Media (fotos y documentos)
python3 scripts/gestionar_arbol.py list-media p26
python3 scripts/gestionar_arbol.py add-media p26
```

Después de cada operación de escritura, el script ofrece regenerar `arbol.json` en el momento.

## Archivos de media

- Fotos de personas: `assets/images/personas/` — nombrar como `p26-francisco.webp`
- Documentos: `assets/docs/personas/` — nombrar como `p26-acta-nacimiento.pdf`

Optimizar imágenes a WebP antes de commitear. Los PDF se sirven directamente desde GitHub Pages.

Para publicar los cambios: `npm run deploy`

## Regenerar arbol.json manualmente

```bash
python3 scripts/export_arbol.py
```

## Schema de la tabla `personas`

| Columna | Tipo | Notas |
|---|---|---|
| `id` | TEXT PK | Formato `p<número>` (ej: `p26`) |
| `name` | TEXT | Nombre completo |
| `gender` | TEXT | `"M"` / `"F"` / `""` |
| `birth_date` | TEXT | ISO parcial: `YYYY-MM-DD`, o `""` |
| `birth_place` | TEXT | |
| `death_date` | TEXT | ISO parcial: `YYYY-MM-DD`, o `""` |
| `death_place` | TEXT | |
| `father_id` | TEXT | |
| `mother_id` | TEXT | |
| `branch` | TEXT | Rama familiar (ej: `clemenzo`, `roh`) |
| `generation` | INTEGER | 0 = generación actual |
| `sort_order` | INTEGER | Posición dentro de la generación |
| `vivo` | TEXT | `"si"` / `"no"` / `""` |
| `photo_url` | TEXT | Ruta relativa a `assets/images/avatars/`, o `""` |
| `notes` | TEXT | Texto libre: hipótesis, contexto histórico |
| `sources` | TEXT | Citas de documentos (actas, censos, etc.) |

## Schema de la tabla `matrimonios`

| Columna | Tipo | Notas |
|---|---|---|
| `id` | TEXT PK | Formato `m<número>` (ej: `m1`) |
| `spouse1_id` | TEXT | ID del primer cónyuge (menor numéricamente) |
| `spouse2_id` | TEXT | ID del segundo cónyuge |
| `marriage_date` | TEXT | ISO: `YYYY-MM-DD`, o `""` |
| `marriage_place` | TEXT | |
| `divorce_date` | TEXT | ISO: `YYYY-MM-DD`, o `""` — solo si aplica |
| `notes` | TEXT | Texto libre |

## Formato de fechas

Las fechas se guardan en formato ISO parcial (`YYYY-MM-DD`). Al exportar a JSON se convierten automáticamente al formato `Date(Y,M,D)` que espera el frontend (mes 0-indexado, igual que `new Date()` en JavaScript).

Si solo se conoce el año, se almacena como `YYYY-01-01` y se exporta como `Date(YYYY,0,1)`.

## Herramienta gráfica

Para editar la DB directamente se puede usar [DB Browser for SQLite](https://sqlitebrowser.org/) (gratuito, Mac/Win/Linux).
