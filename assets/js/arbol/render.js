/**
 * render.js — renderizado del árbol genealógico con D3.
 *
 * Expone:
 *   initTree(containerId)                  → crea el SVG y el comportamiento zoom/pan
 *   render(layout)                          → dibuja nodos y aristas; focusId viene en layout
 *   recenterOn(duration?)                  → centra la vista en el foco (siempre x=0)
 *   zoomIn() / zoomOut()                   → botones de zoom
 */

import { CARD, MARRIAGE_NODE, TRANSITION_MS, getBranchColor } from './config.js';
import { VGAP } from './layout.js';
import { setFocus, setSelected, getSelectedPersonId } from './store.js';

let _svg    = null;
let _g      = null;
let _zoom   = null;
let _layout = null;

// ── Inicialización ────────────────────────────────────────────────────────────

export function initTree(containerId) {
  const container = document.getElementById(containerId);
  d3.select(container).selectAll('svg').remove();

  _svg = d3.select(container)
    .append('svg')
    .attr('width',  '100%')
    .attr('height', '100%');

  _g = _svg.append('g').attr('class', 'tree-root');

  _zoom = d3.zoom()
    .scaleExtent([0.1, 4])
    .filter(e => e.type !== 'wheel' || e.ctrlKey)
    .on('zoom', e => _g.attr('transform', e.transform));

  _svg.call(_zoom);

  // Click en fondo del SVG → cierra el panel
  _svg.on('click', () => setSelected(null));

  // Posición inicial: origen en el centro de la pantalla.
  // recenterOn() la ajustará al primer render.
  const W = container.clientWidth  || 800;
  const H = container.clientHeight || 600;
  _svg.call(_zoom.transform, d3.zoomIdentity.translate(W / 2, H / 2));

}

// ── Renderizado principal ─────────────────────────────────────────────────────

/** Redibuja el layout actual (útil para actualizar el estado de selección). */
export function rerender() {
  if (_layout) render(_layout);
}

export function render(layout) {
  if (!_g || !layout) return;
  _layout = layout;
  _g.selectAll('*').remove();

  const { nodes, edges, focusId } = layout;

  // Aristas primero (quedan detrás de los nodos)
  const linksLayer = _g.append('g').attr('class', 'links');
  edges.forEach(e => _drawEdge(linksLayer, e, nodes));

  // Nodos encima
  const nodesLayer = _g.append('g').attr('class', 'nodes');
  nodes.forEach(node => {
    if (node.type === 'persona')  _drawCard(nodesLayer, node, focusId);
    if (node.type === 'marriage') _drawMarriage(nodesLayer, node);
  });
}

// ── Navegación y zoom ─────────────────────────────────────────────────────────

/** Centra la vista en el contenido de la fila del foco, asegurando que la tarjeta
 *  del foco (en x=0) siempre quede visible dentro del espacio disponible. */
export function recenterOn(duration = TRANSITION_MS) {
  if (!_svg || !_zoom) return;

  const container = _svg.node().parentElement;
  const W = container.clientWidth  || 800;
  const H = container.clientHeight || 600;

  // Centro del bounding box de la fila del foco (personas en y=0)
  let cx = 0;
  if (_layout) {
    const rowNodes = [..._layout.nodes.values()].filter(n => n.type === 'persona' && n.y === 0);
    if (rowNodes.length > 0) {
      const minX = Math.min(...rowNodes.map(n => n.x));
      const maxX = Math.max(...rowNodes.map(n => n.x));
      const bboxCenter = (minX + maxX) / 2;
      // Clamp para que el foco (x=0) nunca salga de la pantalla
      const maxShift = W / 2 - CARD.width / 2 - 24;
      cx = Math.max(-maxShift, Math.min(maxShift, bboxCenter));
    }
  }

  _svg.transition().duration(duration)
    .call(_zoom.translateTo, cx, -VGAP * 0.15, [W / 2, H / 2]);
}

export function zoomIn() {
  if (!_svg || !_zoom) return;
  _svg.transition().duration(220).call(_zoom.scaleBy, 1.3);
}

export function zoomOut() {
  if (!_svg || !_zoom) return;
  _svg.transition().duration(220).call(_zoom.scaleBy, 0.77);
}

// ── Dibujo de aristas ─────────────────────────────────────────────────────────

const _link = d3.linkVertical().x(d => d.x).y(d => d.y);

function _drawEdge(layer, edge, nodes) {
  const src = nodes.get(edge.source);
  const tgt = nodes.get(edge.target);
  if (!src || !tgt) return;

  const color = _edgeColor(edge, src, tgt);

  if (edge.kind === 'spouse') {
    // Cónyuge → círculo de matrimonio (desde el borde inferior de la tarjeta)
    layer.append('path')
      .attr('d', _link({
        source: { x: src.x, y: src.y + CARD.height / 2 },
        target: { x: tgt.x, y: tgt.y },
      }))
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.45);

  } else if (edge.kind === 'marriage-child') {
    // Círculo de matrimonio → hijo. En el árbol ancestral el matrimonio está
    // entre el hijo (más cerca del foco) y los padres (más lejos del foco).
    layer.append('path')
      .attr('d', _link({
        source: { x: src.x, y: src.y + (src.type === 'marriage' ? MARRIAGE_NODE.r : CARD.height / 2) },
        target: { x: tgt.x, y: tgt.y - (tgt.type === 'marriage' ? MARRIAGE_NODE.r : CARD.height / 2) },
      }))
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 1.8)
      .attr('stroke-opacity', 0.7);

  } else if (edge.kind === 'direct') {
    // Padre → hijo directo (sin nodo de matrimonio)
    layer.append('path')
      .attr('d', _link({
        source: { x: src.x, y: src.y + CARD.height / 2 },
        target: { x: tgt.x, y: tgt.y - CARD.height / 2 },
      }))
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 1.8)
      .attr('stroke-opacity', 0.7);
  }
}

function _edgeColor(edge, src, tgt) {
  // Usa la rama del nodo persona más relevante para el color
  const persona = tgt.type === 'persona' ? tgt.data : (src.type === 'persona' ? src.data : null);
  return persona ? getBranchColor(persona.branch) : '#c4bdb0';
}

// ── Dibujo de tarjetas de persona ─────────────────────────────────────────────

function _drawCard(layer, node, focusId) {
  const { x, y, data: p } = node;
  const isFocus      = p.id === focusId;
  const isSelected   = p.id === getSelectedPersonId();
  const branchColor  = getBranchColor(p.branch);
  const W = CARD.width, H = CARD.height, R = CARD.borderRadius;

  const g = layer.append('g')
    .attr('class', 'person-card-group')
    .attr('transform', `translate(${x},${y})`)
    .attr('data-id', p.id)
    .style('cursor', 'pointer')
    .on('click', (e) => { e.stopPropagation(); setFocus(p.id); setSelected(p.id); });

  // Anillo de selección: halo coloreado detrás de la tarjeta
  if (isSelected) {
    g.append('rect')
      .attr('x', -W / 2 - 4).attr('y', -H / 2 - 4)
      .attr('width', W + 8).attr('height', H + 8)
      .attr('rx', R + 3)
      .attr('fill', 'none')
      .attr('stroke', branchColor)
      .attr('stroke-width', 2.5)
      .attr('stroke-opacity', 0.45)
      .attr('filter', `drop-shadow(0 0 8px ${branchColor}88)`);
  }

  // Fondo de la tarjeta
  g.append('rect')
    .attr('x', -W / 2).attr('y', -H / 2)
    .attr('width', W).attr('height', H)
    .attr('rx', R)
    .attr('fill', 'var(--surface, #fdfcf9)')
    .attr('stroke', isFocus ? branchColor : 'var(--border, #e2dbd0)')
    .attr('stroke-width', isFocus ? 2 : 1)
    .attr('filter', isSelected
      ? 'drop-shadow(0 4px 18px rgba(0,0,0,0.18))'
      : 'drop-shadow(0 1px 3px rgba(0,0,0,0.07))');

  // Franja de color de rama (arriba)
  g.append('rect')
    .attr('x', -W / 2).attr('y', -H / 2)
    .attr('width', W).attr('height', CARD.borderTop)
    .attr('rx', R)
    .attr('fill', branchColor);
  // Cubre las esquinas redondeadas inferiores de la franja
  g.append('rect')
    .attr('x', -W / 2).attr('y', -H / 2 + R)
    .attr('width', W).attr('height', CARD.borderTop - R)
    .attr('fill', branchColor);

  // Nombre (máx 2 líneas)
  const lines   = _wrapName(p.name, 22);
  const nameTopY = -H / 2 + CARD.borderTop + 10;
  lines.forEach((line, i) => {
    g.append('text')
      .attr('x', 0).attr('y', nameTopY + i * 14)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'hanging')
      .attr('font-family', 'Inter, sans-serif')
      .attr('font-size', '12px')
      .attr('font-weight', '600')
      .attr('fill', 'var(--text, #1c1814)')
      .text(line);
  });

  // Años de vida
  const birthY = _year(p.birth_date);
  const deathY = _year(p.death_date);
  if (birthY || deathY) {
    const suffix = !deathY && p.vivo === 'si' ? '' : (deathY || '?');
    const yearsStr = `${birthY || '?'} – ${suffix}`;
    g.append('text')
      .attr('x', 0).attr('y', H / 2 - 14)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'auto')
      .attr('font-family', 'Inter, sans-serif')
      .attr('font-size', '10px')
      .attr('fill', 'var(--muted, #7a7060)')
      .text(yearsStr);
  }

  // Hover: borde levemente iluminado
  g.on('mouseenter', function () {
    d3.select(this).select('rect:first-child')
      .attr('filter', 'drop-shadow(0 3px 10px rgba(0,0,0,0.13))');
  }).on('mouseleave', function () {
    d3.select(this).select('rect:first-child')
      .attr('filter', 'drop-shadow(0 1px 3px rgba(0,0,0,0.07))');
  });
}

// ── Dibujo del círculo de matrimonio ─────────────────────────────────────────

function _drawMarriage(layer, node) {
  layer.append('circle')
    .attr('cx', node.x).attr('cy', node.y)
    .attr('r',  MARRIAGE_NODE.r)
    .attr('fill',         'var(--surface, #fdfcf9)')
    .attr('stroke',       'var(--border, #c4bdb0)')
    .attr('stroke-width', 1.5);
}

// ── Utilidades ────────────────────────────────────────────────────────────────

function _wrapName(name, maxChars) {
  const words = name.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (test.length <= maxChars) { cur = test; }
    else {
      if (cur) lines.push(cur);
      if (lines.length >= 2) break;
      cur = w;
    }
  }
  if (cur && lines.length < 2) lines.push(cur);
  return lines.slice(0, 2);
}

function _year(dateStr) {
  if (!dateStr) return '';
  const m = String(dateStr).match(/^(\d{4})/);
  return m ? m[1] : '';
}
