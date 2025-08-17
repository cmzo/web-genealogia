# Mapas Interactivos - Ruta de Francisco Clemenzo

## 📍 Archivos creados

### 1. `mapa-ruta-francisco.html`
**Versión completa** con toda la información contextual:
- ✅ Página completa con header, navegación y footer
- ✅ Información detallada sobre cada lugar
- ✅ Timeline de la ruta migratoria
- ✅ Tarjetas descriptivas de cada ubicación
- ✅ Leyenda completa

### 2. `mapa-francisco-embed.html`
**Versión simplificada** para insertar en posts:
- ✅ Solo el mapa y la leyenda
- ✅ Diseño compacto y limpio
- ✅ Perfecto para embebido en Markdown
- ✅ Sin elementos de navegación

## 🗺️ Pines incluidos

| Lugar | Coordenadas | Año | Color | Descripción |
|-------|-------------|-----|-------|-------------|
| **Ardon, Valais, Suiza** | 46.2833, 7.2667 | 1870 | Verde | Lugar de origen |
| **Colonia San José, Entre Ríos** | -32.2, -58.2 | 1892 | Azul | Primera colonia |
| **Colonia Yeruá, Entre Ríos** | -31.5, -58.0 | 1899 | Naranja | Segunda colonia |
| **Concepción del Uruguay, Entre Ríos** | -32.4833, -58.2333 | 1928 | Rojo | Establecimiento final |

## 🎨 Características del mapa

### **Marcadores:**
- ✅ Círculos de colores diferenciados por tipo de lugar
- ✅ Popups informativos con descripción y año
- ✅ Bordes blancos para mejor visibilidad

### **Ruta migratoria:**
- ✅ Línea punteada púrpura conectando todos los puntos
- ✅ Popup explicativo de la ruta
- ✅ Opacidad reducida para no interferir con los marcadores

### **Leyenda:**
- ✅ Colores correspondientes a cada tipo de lugar
- ✅ Años incluidos para contexto temporal
- ✅ Diseño responsive

## 📝 Cómo usar en posts de Markdown

### **Opción 1: Iframe directo**
```html
<iframe src="mapa-francisco-embed.html" width="100%" height="500" frameborder="0"></iframe>
```

### **Opción 2: Enlace a página completa**
```markdown
[Ver mapa interactivo completo](mapa-ruta-francisco.html)
```

### **Opción 3: Captura de pantalla + enlace**
```markdown
![Ruta de Francisco Clemenzo](ruta-francisco-screenshot.png)

[Ver mapa interactivo](mapa-francisco-embed.html)
```

## 🔧 Personalización

### **Cambiar colores:**
Editar en el JavaScript:
```javascript
const placeColors = {
  switzerland: '#10b981',      // Verde
  'colonia-san-jose': '#3b82f6', // Azul
  'colonia-yerua': '#f59e0b',     // Naranja
  concepcion: '#ef4444'           // Rojo
};
```

### **Agregar nuevos pines:**
```javascript
{
  name: 'Nuevo Lugar',
  coords: [latitud, longitud],
  type: 'nuevo-tipo',
  description: 'Descripción del lugar',
  year: 'YYYY'
}
```

### **Cambiar altura del mapa:**
Editar en CSS:
```css
.interactive-map {
  height: 400px; /* Cambiar este valor */
}
```

## 🌐 Tecnologías utilizadas

- **Leaflet.js** - Biblioteca de mapas interactivos
- **OpenStreetMap** - Datos de mapas base
- **CSS Grid/Flexbox** - Layout responsive
- **Vanilla JavaScript** - Funcionalidad interactiva

## 📱 Responsive

Los mapas se adaptan automáticamente a:
- ✅ Desktop (pantallas grandes)
- ✅ Tablet (pantallas medianas)
- ✅ Mobile (pantallas pequeñas)

## 🚀 Próximas mejoras posibles

- [ ] Agregar más detalles históricos en los popups
- [ ] Incluir imágenes de los lugares
- [ ] Agregar filtros por período temporal
- [ ] Incluir información sobre documentos encontrados en cada lugar
- [ ] Agregar animación de la ruta migratoria
