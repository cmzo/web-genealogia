export const CONFIG = {
  width: 2400,
  height: 1800,
  cardWidth: 140,
  cardHeight: 180,
  marriageSpacing: 500,
  generationSpacing: 400,
  spouseGap: 25,
};

export const cardColors = {
  background: '#f3f4f6',
  border: '#9ca3af',
  text: '#374151',
  secondary: '#6b7280',
  accent: '#4b5563',
  divider: '#d1d5db',
};

const branchColors = {
  'clemenzo':      '#1e40af',
  'roch':          '#ef4444',
  'putallaz':      '#10b981',
  'roh':           '#16a34a',
  'carvallo':      '#8b5cf6',
  'arceo':         '#eab308',
  'vargas':        '#65a30d',
  'baster':        '#6b7280',
  'costabile':     '#6366f1',
  'queipo':        '#ea580c',
  'stalder':       '#7c3aed',
  'vasquez':       '#dc2626',
  'yanitelli':     '#16a34a',
  'guido':         '#c2410c',
  'garrido':       '#0d9488',
  'fernandez':     '#a855f7',
  'cybulski':      '#be185d',
  'lantz':         '#9333ea',
  'fracchia':      '#ca8a04',
  'vargas yegros': '#15803d',
  'venegas':       '#0369a1',
  'default':       '#6b7280',
};

export function getBranchColor(branch) {
  if (!branch || branch.trim() === '') return branchColors.default;
  return branchColors[branch.toLowerCase().trim()] ?? branchColors.default;
}
