# 📸 Guía de Manejo de Imágenes

## 🎯 Especificaciones Recomendadas

### **Proporción Óptima:**
- **Ratio: 3:4** (más alto que ancho)
- **Ejemplo: 600x800px** o **900x1200px**

### **Resoluciones por Dispositivo:**
- **Móvil: 300x400px**
- **Tablet: 450x600px** 
- **Desktop: 600x800px**
- **Retina/4K: 900x1200px**

## 🛠️ Proceso de Optimización Automática

### **1. Instalar dependencias:**
```bash
npm install
```

### **2. Preparar imágenes:**
1. Crear carpeta `img/original/`
2. Colocar imágenes originales ahí
3. Ejecutar optimización

### **3. Optimizar automáticamente:**
```bash
npm run optimize-images
```

### **4. Resultado:**
- **Imágenes optimizadas** en `img/`
- **Formato WebP** (mejor compresión)
- **Tamaño: 600x800px** (perfecto para tarjetas)
- **Calidad: 85%** (balance calidad/velocidad)

## 📁 Estructura de Archivos

```
img/
├── original/           # Imágenes originales (grandes)
│   ├── foto1.jpg
│   └── foto2.png
├── foto1.webp         # Optimizada para tarjetas
├── foto1-thumb.webp   # Versión thumbnail
└── foto2.webp
```

## 🎨 Tipos de Contenido Sugeridos

### **Para "¿Quién soy?":**
- Retrato personal (3:4)
- Mapa de viajes
- Collage familiar

### **Para "Árbol genealógico":**
- Árbol ilustrado
- Documentos antiguos
- Retratos de ancestros

### **Para "La trama mexicana":**
- Mapas de México
- Documentos de migración
- Fotos históricas

### **Para "Mapa de Clemenzo's":**
- Mapa mundial con marcadores
- Rutas de migración
- Lugares importantes

## 🔧 Solución de Problemas

### **Imagen muy grande rompe el diseño:**
- ✅ **Solución automática**: CSS con `object-fit: cover`
- ✅ **Optimización**: Script automático
- ✅ **Fallback**: Placeholder si falla la carga

### **Imagen no se ve:**
- Verificar que existe en `img/`
- Verificar extensión correcta (.webp, .jpg, .png)
- Verificar ruta en HTML

### **Imagen se ve distorsionada:**
- Usar proporción 3:4
- Ejecutar optimización automática
- Verificar `object-fit: cover` en CSS

## 📊 Comparación de Formatos

| Formato | Tamaño | Calidad | Compatibilidad |
|---------|--------|---------|----------------|
| **WebP** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **JPEG** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **PNG** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

## 🚀 Mejores Prácticas

1. **Siempre optimizar** antes de usar
2. **Usar proporción 3:4** para consistencia
3. **Nombres descriptivos** (ej: `francisco-retrato.webp`)
4. **Backup de originales** en `img/original/`
5. **Verificar en diferentes dispositivos**

## 📝 Comandos Útiles

```bash
# Optimizar todas las imágenes
npm run optimize-images

# Ver estado de Git
git status

# Agregar imágenes optimizadas
git add img/*.webp

# Commit de nuevas imágenes
git commit -m "Agregar imágenes optimizadas para tarjetas"
```
