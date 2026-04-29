export async function loadData() {
  const response = await fetch('./assets/data/arbol.json');
  if (!response.ok) throw new Error(`No se pudo cargar arbol.json (${response.status})`);
  return response.json();
}
