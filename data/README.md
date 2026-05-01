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

## Gestión de personas

```bash
# Listar todas las personas
python3 scripts/gestionar_arbol.py list

# Ver detalle de una persona
python3 scripts/gestionar_arbol.py show p26

# Agregar nueva persona (modo interactivo)
python3 scripts/gestionar_arbol.py add

# Editar persona existente
python3 scripts/gestionar_arbol.py edit p26
```

Después de `add` o `edit`, el script ofrece regenerar `arbol.json` en el momento.

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
| `birth_date` | TEXT | ISO parcial: `YYYY-MM-DD`, o `""` |
| `birth_place` | TEXT | |
| `death_date` | TEXT | ISO parcial: `YYYY-MM-DD`, o `""` |
| `death_place` | TEXT | |
| `spouse_id` | TEXT | ID del cónyuge, o `""` |
| `children_ids` | TEXT | IDs separados por coma, o `""` |
| `father_id` | TEXT | |
| `mother_id` | TEXT | |
| `branch` | TEXT | Rama familiar (ej: `clemenzo`, `roh`) |
| `generation` | INTEGER | 0 = generación actual |
| `sort_order` | INTEGER | Posición dentro de la generación |
| `vivo` | TEXT | `"si"` / `"no"` / `""` |

## Formato de fechas

Las fechas se guardan en formato ISO parcial (`YYYY-MM-DD`). Al exportar a JSON se convierten automáticamente al formato `Date(Y,M,D)` que espera el frontend (mes 0-indexado, igual que `new Date()` en JavaScript).

Si solo se conoce el año, se almacena como `YYYY-01-01` y se exporta como `Date(YYYY,0,1)`.

## Herramienta gráfica

Para editar la DB directamente se puede usar [DB Browser for SQLite](https://sqlitebrowser.org/) (gratuito, Mac/Win/Linux).
