---
title: "Creación de un agente de investigación genealógica con CLAUDE"
kicker: "Creando un asistente de investigación"
description: "Este es el proceso (con errores, aciertos y fracasos) para crear un agente que me asista en la investigación de mis antepasa
dos."
category: "investigacion"
date: "2026-05-08"
tags: "investigacion, ia, genealogia, tecnologia"
featured: true
slug: "creacion-de-un-agente-de-investigacion-genealogica-con-claude"
---

# Creación de un Agente Genealógico con MCP y Claude Code

## Índice

1. [La necesidad: por qué un agente y no un chatbot](#1-la-necesidad)
2. [Qué es el protocolo MCP](#2-qué-es-el-protocolo-mcp)
3. [Arquitectura del agente](#3-arquitectura-del-agente)
4. [Requisitos previos](#4-requisitos-previos)
5. [Paso 1: API de búsqueda web (Tavily)](#5-paso-1-api-de-búsqueda-web)
6. [Paso 2: Servidores MCP base](#6-paso-2-servidores-mcp-base)
7. [Paso 3: Servidor MCP genealógico personalizado](#7-paso-3-servidor-mcp-personalizado)
8. [Paso 4: Contexto del agente (CLAUDE.md)](#8-paso-4-contexto-del-agente)
9. [Cómo usar el agente](#9-cómo-usar-el-agente)
10. [Ventajas frente a un chatbot convencional](#10-ventajas-frente-a-un-chatbot-convencional)

---

## 1. La necesidad

La investigación genealógica tiene características que la hacen particularmente difícil de gestionar con herramientas genéricas:

- **Los datos están dispersos**: registros en archivos locales, bases de datos en la nube, imágenes escaneadas, documentos en múltiples idiomas y formatos.
- **La información es acumulativa**: cada hallazgo modifica o complementa lo ya conocido. Se necesita un sistema que "recuerde" lo que ya está documentado.
- **Las fuentes deben verificarse**: una fecha o un lugar mal transcripto puede arruinar una línea de investigación entera. No alcanza con que el modelo "sepa" algo; tiene que poder buscarlo y citarlo.
- **Las tareas de investigación son repetitivas pero específicas**: para cada persona del árbol hay que recorrer los mismos repositorios (registros civiles, censos, archivos eclesiásticos), pero con datos distintos.

Un chatbot convencional puede ayudar a redactar, resumir o sugerir, pero no puede **leer tus archivos reales**, **buscar en la web en tiempo real** ni **guardar resultados** en tu sistema. Para eso se necesita un agente.

---

## 2. Qué es el protocolo MCP

**MCP (Model Context Protocol)** es un estándar abierto creado por Anthropic que define cómo los modelos de lenguaje pueden interactuar con herramientas externas de forma estandarizada.

Funciona como un contrato entre tres partes:

```
┌─────────────────┐        MCP         ┌──────────────────┐
│   Claude Code   │ ◄────────────────► │  Servidor MCP    │
│   (el modelo)   │   (JSON-RPC 2.0)   │  (tus herram.)   │
└─────────────────┘                    └──────────────────┘
```

### Conceptos clave

| Concepto | Descripción |
|---|---|
| **Host** | El cliente que usa el modelo (Claude Code en este caso) |
| **Servidor MCP** | Un proceso que expone herramientas al modelo |
| **Tool** | Una función que el modelo puede invocar (buscar, leer, escribir, etc.) |
| **Transport** | El canal de comunicación; aquí usamos `stdio` (entrada/salida estándar) |

### Por qué MCP y no una integración ad-hoc

Antes de MCP, integrar herramientas con un LLM requería construir glue code específico para cada modelo. Con MCP, el servidor es **agnóstico al modelo**: el mismo servidor que usás con Claude Code podría conectarse a cualquier host compatible con el protocolo. Esto hace que la inversión valga más a largo plazo.

---

## 3. Arquitectura del agente

El agente genealógico está compuesto por tres servidores MCP que corren en paralelo cada vez que se inicia una sesión de Claude Code:

```
Claude Code (host)
│
├── tavily-mcp          → Búsqueda web en tiempo real
│                          (API de Tavily, plan gratuito)
│
├── server-filesystem   → Lectura/escritura de archivos
│                          (acceso a datos del árbol y documentos)
│
└── genealogy-agent     → Herramientas genealógicas propias
    ├── buscar_persona()
    ├── obtener_persona()
    ├── listar_personas()
    ├── listar_documentos()
    └── crear_archivo_investigacion()
```

Cada servidor corre como un proceso separado y se comunica con Claude Code mediante `stdio` usando el protocolo MCP (JSON-RPC 2.0).

---

## 4. Requisitos previos

- **Claude Code** instalado y con sesión activa
- **Node.js** (para los servidores MCP oficiales via `npx`)
- **Python 3.9+** y **uv** (para el servidor personalizado)
- **Cuenta en Tavily** con API key (plan gratuito)
- Archivos de datos genealógicos organizados localmente

### Instalar uv (gestor de paquetes Python moderno)

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Reiniciar la terminal después de la instalación para que `uv` quede disponible en el PATH.

---

## 5. Paso 1: API de búsqueda web

### Por qué Tavily

Tavily es una API de búsqueda diseñada específicamente para agentes de IA. A diferencia de las APIs de búsqueda convencionales que devuelven HTML crudo o listas de URLs, Tavily devuelve **contenido limpio y estructurado**, listo para ser procesado por un modelo de lenguaje. Tiene un plan gratuito de 1.000 consultas mensuales, suficiente para uso personal de investigación.

### Registro

1. Ir a `https://tavily.com` y crear una cuenta (no requiere tarjeta de crédito en el plan gratuito).
2. Dentro del dashboard, copiar la **API Key** generada (comienza con `tvly-...`).
3. **No compartir esta key en ningún chat ni repositorio público.** Guardarla para el paso de configuración.

> ⚠️ Si la key queda expuesta accidentalmente, revocarla de inmediato desde el dashboard de Tavily y generar una nueva.

---

## 6. Paso 2: Servidores MCP base

Los servidores base son paquetes npm oficiales que se registran en Claude Code con el comando `claude mcp add`.

### Sintaxis general

```bash
claude mcp add --scope user <nombre> [opciones] -- <comando> [args...]
```

- `--scope user`: el servidor queda disponible en **todas** las sesiones de Claude Code, no solo en un proyecto.
- El `--` separa las opciones del comando del servidor.

### Servidor de búsqueda web (Tavily)

```bash
claude mcp add --scope user tavily -e TAVILY_API_KEY=TU_KEY -- npx -y tavily-mcp@0.2.19
```

> Nota de sintaxis: el nombre del servidor (`tavily`) debe ir **antes** de las opciones `-e`, de lo contrario el parser lo interpreta como un valor de la variable de entorno.

### Servidor de acceso a archivos (Filesystem)

```bash
claude mcp add --scope user filesystem -- npx -y @modelcontextprotocol/server-filesystem /ruta/a/datos
```

Si alguna ruta contiene espacios (como carpetas de iCloud en macOS), conviene crear un symlink sin espacios:

```bash
ln -s "/ruta/con espacios/Carpeta" ~/carpeta-sin-espacios
```

Y usar el symlink en el comando `mcp add`.

### Verificar los servidores

```bash
claude mcp list
```

Todos los servidores deben mostrar `✓ Connected`. Un `✗ Failed to connect` indica problema con el comando, la versión del paquete o las rutas.

---

## 7. Paso 3: Servidor MCP personalizado

El servidor personalizado es el núcleo del agente. Está escrito en Python usando el SDK oficial de MCP y expone herramientas específicas del dominio genealógico.

### Estructura del proyecto

```
genealogy-agent/
├── server.py          ← Servidor MCP principal
└── requirements.txt   ← Dependencias (mcp[cli])
```

### Dependencias inline con uv

Para evitar gestionar entornos virtuales manualmente, el script usa la sintaxis de dependencias inline de `uv`:

```python
# /// script
# dependencies = ["mcp[cli]"]
# ///
```

Con esta declaración, `uv run server.py` instala automáticamente las dependencias la primera vez que se ejecuta, sin necesidad de `pip install` ni `venv`.

### Herramientas expuestas

El servidor implementa cinco herramientas:

#### `buscar_persona(nombre: str)`
Busca en el árbol por nombre parcial (case-insensitive). Devuelve ID, generación, rama, fechas y estado de verificación.

#### `obtener_persona(person_id: str)`
Devuelve la ficha completa de una persona: datos del árbol principal, matrimonios con fecha y lugar, hijos, padre/madre y datos del archivo (biografía, fuentes, tags).

#### `listar_personas(rama?, generacion?)`
Lista todas las personas con filtros opcionales. Útil para tener una visión panorámica antes de una sesión de investigación.

#### `listar_documentos(subcarpeta?)`
Recorre la carpeta de documentos e imágenes y lista todos los archivos disponibles, incluyendo registros escaneados, PDFs y fotografías.

#### `crear_archivo_investigacion(persona_nombre, persona_id, lineas_investigacion, tareas_todo, notas?)`
Genera un archivo Markdown estructurado con:
- Contexto de la persona
- Líneas de investigación numeradas (qué buscar y dónde)
- Tareas ToDo con checkboxes
- Secciones vacías para fuentes consultadas y hallazgos

El archivo se guarda automáticamente en la carpeta de documentos con el nombre `investigacion-<slug>.md`.

### Implementación con FastMCP

El servidor usa `FastMCP`, la API de alto nivel del SDK que permite declarar herramientas como funciones Python decoradas:

```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("genealogy-agent")

@mcp.tool()
def buscar_persona(nombre: str) -> str:
    """Busca personas en el árbol genealógico por nombre."""
    # ...

if __name__ == "__main__":
    mcp.run()
```

El decorador `@mcp.tool()` registra automáticamente la función, usa el docstring como descripción para el modelo, e infiere el esquema de parámetros desde los type hints de Python.

### Registro en Claude Code

```bash
claude mcp add --scope user genealogy-agent -- uv run /ruta/al/servidor/server.py
```

---

## 8. Paso 4: Contexto del agente

Un agente con herramientas pero sin contexto es como un experto que no sabe para qué lo contrataron. El archivo `CLAUDE.md` en la raíz del proyecto genealógico cumple esa función: le dice al modelo **cómo comportarse** en este dominio específico.

### Qué incluye el CLAUDE.md del agente

- **Descripción del rol**: investigador genealógico especializado en la familia
- **Inventario de herramientas**: qué hace cada tool y cuándo usarla
- **Fuentes prioritarias para Tavily**: repositorios genealógicos específicos por región
- **Estructura de los datos**: qué columnas tienen los CSV, qué significa cada campo
- **Reglas de comportamiento**:
  - Consultar el árbol local antes de buscar en la web
  - Indicar siempre la fuente de cada dato
  - Distinguir entre datos verificados y sin confirmar
  - Formular tareas ToDo concretas y accionables
- **Contexto histórico**: período de emigración, países de origen y destino, idiomas de los archivos

Este archivo se carga automáticamente cuando Claude Code se abre en ese directorio.

---

## 9. Cómo usar el agente

### Activación

Abrir Claude Code en el directorio del proyecto genealógico. Los tres servidores MCP se inicializan automáticamente en cada sesión.

### Ejemplos de uso

#### Consulta sobre una persona
> *"¿Qué información tenemos sobre [nombre]? Consultá el árbol y el archivo."*

El agente invocará `buscar_persona` y luego `obtener_persona`, devolviendo una ficha consolidada con todos los datos disponibles.

#### Verificación de datos con la web
> *"Verificá la fecha de nacimiento de [nombre] en fuentes online."*

El agente usará Tavily para buscar en FamilySearch, Ancestry y archivos civiles relevantes, citando las fuentes encontradas.

#### Creación de archivo de investigación
> *"Creame un archivo de investigación para [nombre] con las líneas de trabajo principales."*

El agente obtendrá los datos del árbol, formulará líneas de investigación según los datos faltantes o sin verificar, generará tareas ToDo específicas y guardará el archivo Markdown en la carpeta de documentos.

#### Exploración del material disponible
> *"¿Qué registros escaneados tenemos de la rama [X]?"*

El agente usará `listar_documentos` para mostrar el inventario de archivos disponibles.

#### Sesión de investigación guiada
> *"Quiero trabajar en la investigación de [nombre]. Mostrá todo lo que sabemos, qué está sin verificar y qué deberíamos buscar primero."*

Esta consulta más abierta combina todas las herramientas: árbol local → documentos disponibles → búsqueda web → archivo de investigación.

---

## 10. Ventajas frente a un chatbot convencional

| Característica | Chatbot LLM convencional | Agente con MCP |
|---|---|---|
| **Acceso a tus datos** | No. Solo conoce lo que pegás en el chat. | Sí. Lee directamente tus archivos CSV, JSON e imágenes. |
| **Búsqueda web** | No (salvo plugins específicos, no siempre disponibles). | Sí, en tiempo real, con Tavily como capa de búsqueda. |
| **Persistencia** | Ninguna. Cada sesión empieza de cero. | Parcial. Los archivos `.md` generados persisten entre sesiones. |
| **Consistencia de datos** | Inventa o alucina si no tiene información. | Opera sobre datos reales, claramente distingue verificado de no verificado. |
| **Fuentes citables** | Las citas son generadas, no verificadas. | Tavily devuelve URLs y fuentes reales que podés consultar. |
| **Tareas específicas** | Las sugerencias son genéricas. | Las tareas ToDo se generan en base a los datos reales de cada persona. |
| **Escalabilidad** | Requiere pegar contexto manualmente cada vez. | El contexto se carga automáticamente desde el árbol y los archivos. |
| **Integración con tu flujo** | Copiar y pegar entre el chat y tus herramientas. | Los archivos se guardan directamente donde los necesitás. |

### El argumento de fondo

Un chatbot convencional es excelente para tareas de **conocimiento general**: explicar conceptos, redactar textos, ayudar a interpretar un documento que vos le mostrás. Pero la investigación genealógica es fundamentalmente un trabajo con **datos específicos, locales y acumulativos**.

La diferencia clave es que el agente con MCP **actúa en tu entorno real**: lee los archivos que vos tenés, escribe en las carpetas que vos usás, busca en la web y te devuelve resultados verificables. No simula tener contexto, lo tiene.

Con el tiempo, a medida que se generan más archivos de investigación y se actualizan los datos del árbol, el agente se vuelve progresivamente más útil porque trabaja siempre con la versión más reciente de tus datos, sin que tengas que pegar nada en un chat.

---

*Documentación generada el 2026-05-08. Stack: Claude Code + MCP + Python (FastMCP) + Tavily Search API.*
