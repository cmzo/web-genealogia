---
title: "Metodología de investigación"
type: tema
summary: "Cómo se investiga y documenta este proyecto: notas por persona, fuentes registradas, una wiki-grafo mantenida por agentes y este mismo sitio como salida."
tags: metodologia, investigacion
---

# Metodología de investigación

Este proyecto no es solo un árbol: es un **sistema de trabajo**. Cada persona tiene una nota de investigación en markdown (cronología, hipótesis, líneas pendientes, fuentes); las fuentes se registran con su estado y cobertura; y todo se compila en el grafo de esta wiki, donde documentos, personas, lugares y posts quedan enlazados.

Tres posts del blog documentan cómo se llegó a este método:

- **«Ideas para documentar bien las fuentes»** — el registro sistemático de fuentes, actas y documentos.
- **«Creación de un agente de investigación genealógica con Claude»** — el agente MCP que asiste la investigación: busca personas, lee notas, carga documentos.
- **«Una LLM Wiki para mi genealogía»** — el patrón de Karpathy aplicado a este archivo: agentes que mantienen la base de conocimiento en markdown, y el grafo que la visualiza.

Las piezas del sistema, de la fuente al sitio: los registros originales (censos como el [[censo-valais-1870|censo del Valais de 1870]], actas parroquiales, prensa histórica) → notas por persona y páginas de lugar/fuente/evento → la base del árbol (SQLite) → el build estático que genera el árbol, esta wiki y el blog.
