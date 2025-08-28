# 🚀 Script de Deploy Inteligente

Este script automatiza el proceso de actualización y deploy de tu sitio de genealogía, detectando automáticamente qué tipo de cambios has hecho y optimizando el proceso.

## 📋 Características

- ✅ **Detección automática** de cambios en Obsidian vs Quartz
- ✅ **Build automático** con Quartz cuando es necesario
- ✅ **Mensajes de commit inteligentes** basados en el tipo de cambios
- ✅ **Deploy optimizado** (2-5 minutos en lugar de 10-15)
- ✅ **Interfaz colorida** y fácil de usar
- ✅ **Manejo de errores** robusto

## 🛠️ Cómo usar

### Opción 1: Script directo
```bash
node scripts/update-and-deploy.cjs
```

### Opción 2: Script bash (recomendado)
```bash
./deploy.sh
```

### Opción 3: Con npm (si está configurado)
```bash
npm run deploy
```

## 📊 Tipos de cambios detectados

### 📝 **Cambios en Obsidian** (`content/`)
- Archivos Markdown en `content/` (excepto `index.md`)
- Se detectan como "Update: Obsidian content"

### ⚙️ **Cambios en Quartz** (`content/index.md` o `quartz/`)
- Configuración de Quartz
- Archivo `index.md` principal
- Se detectan como "Update: Quartz configuration"

### 📁 **Otros cambios**
- Cualquier otro archivo modificado
- Se detectan como "Update: Other changes"

## 🔄 Flujo de trabajo

1. **Edita tu contenido** en Obsidian o modifica `index.md`
2. **Guarda los archivos**
3. **Ejecuta el script**: `./deploy.sh`
4. **El script automáticamente**:
   - Analiza qué cambios hay
   - Muestra un resumen colorido
   - Construye el sitio si es necesario
   - Hace commit con mensaje inteligente
   - Sube los cambios a GitHub
   - Inicia el deploy (2-5 minutos)

## 📈 Ejemplo de uso

```bash
$ ./deploy.sh

🚀 Script de Actualización y Deploy Inteligente
==================================================

🔄 Analizando cambios...

==================================================
📊 RESUMEN DE CAMBIOS
==================================================

📝 Cambios en Obsidian (content/):
  📝 content/Arbol Genealogico/Francisco.md
  ➕ content/Investigaciones/Nuevo hallazgo.md

⚙️  Cambios en Quartz:
  📝 content/index.md

==================================================

🔄 Construyendo sitio con Quartz...
✅ Sitio construido exitosamente

🔄 Preparando commit...
✅ Commit creado: "Update: Obsidian content and Quartz configuration"

🔄 Subiendo cambios a GitHub...
✅ Cambios subidos exitosamente

==================================================
🎉 ¡Deploy iniciado exitosamente!
==================================================
ℹ️  El sitio se actualizará en 2-5 minutos.
ℹ️  Puedes verificar el progreso en: GitHub → Actions
```

## ⚡ Optimizaciones aplicadas

### **Antes (problemático):**
- Deploys de 10-15 minutos
- Múltiples builds en cola
- Builds no se cancelaban automáticamente

### **Ahora (optimizado):**
- Deploys de 2-5 minutos
- Builds se cancelan automáticamente
- Un solo build por cambio

## 🔧 Configuración del workflow

El script está optimizado para trabajar con el workflow de GitHub Actions que:
- Cancela builds en progreso automáticamente
- Solo procesa el commit más reciente
- Construye y despliega eficientemente

## 📝 Mensajes de commit automáticos

- **"Update: Obsidian content"** - Solo cambios en contenido
- **"Update: Quartz configuration"** - Solo cambios en configuración
- **"Update: Obsidian content and Quartz configuration"** - Ambos tipos
- **"Update: Other changes"** - Otros archivos

## 🚨 Solución de problemas

### **No hay cambios pendientes**
```
ℹ️  No hay cambios pendientes para commit.
ℹ️  Si acabas de hacer cambios, asegúrate de guardar los archivos.
```

### **Error de build**
El script mostrará el error específico y se detendrá.

### **Error de git**
El script mostrará el error y te permitirá solucionarlo manualmente.

## 🎯 Recomendaciones

1. **Usa el script después de cada sesión de edición**
2. **No hagas commits manuales** - deja que el script lo haga
3. **Verifica el progreso** en GitHub Actions si quieres
4. **El sitio se actualiza automáticamente** en 2-5 minutos

¡Disfruta de deploys rápidos y eficientes! 🚀
