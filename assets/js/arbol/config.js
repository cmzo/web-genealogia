// Dimensiones y espaciado de las tarjetas de persona
export const CARD = {
  width:        160,
  height:        80,
  borderTop:      6,   // franja de color de rama
  borderRadius:   2,
  gap:           24,   // espacio entre tarjetas hermanas
  marriageGap:   32,   // espacio entre los dos cónyuges
  generationGap: 120,  // espacio vertical entre generaciones
};

// Dimensiones del nodo matrimonio (círculo conector entre cónyuges)
export const MARRIAGE_NODE = {
  r: 6,
};

// Animación
export const TRANSITION_MS = 600;

// Colores por rama familiar
const branchColors = {
  'clemenzo':      '#1e40af',
  'roh':           '#16a34a',
  'roch':          '#16a34a',
  'carvallo':      '#8b5cf6',
  'arceo':         '#eab308',
  'queipo':        '#ea580c',
  'stalder':       '#7c3aed',
  'baster':        '#6b7280',
  'guido':         '#c2410c',
  'putallaz':      '#10b981',
  'vasquez':       '#dc2626',
  'yanitelli':     '#16a34a',
  'fracchia':      '#ca8a04',
  'garrido':       '#0d9488',
  'fernandez':     '#a855f7',
  'cybulski':      '#be185d',
  'lantz':         '#9333ea',
  'vargas yegros': '#15803d',
  'venegas':       '#0369a1',
  'costabile':     '#6366f1',
  'default':       '#9ca3af',
};

export function getBranchColor(branch) {
  if (!branch?.trim()) return branchColors.default;
  return branchColors[branch.toLowerCase().trim()] ?? branchColors.default;
}
