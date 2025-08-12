# 🌳 Árbol Genealógico - Guía de Uso

## 📋 Estructura del Árbol

El árbol genealógico está diseñado para manejar tanto la **rama paterna** (Clemenzo) como la **rama materna** de manera organizada.

### 🏗️ Estructura de Datos

```javascript
{
  name: "Nombre de la persona",
  birth_place: "Lugar de nacimiento",
  birth_date: "Fecha de nacimiento",
  death_place: "Lugar de fallecimiento", // opcional
  death_date: "Fecha de fallecimiento", // opcional
  avatar: "ruta/a/imagen.jpg", // opcional
  
  // Familia inmediata
  spouse: {
    name: "Nombre del cónyuge",
    // ... mismos campos que arriba
  },
  
  children: [
    // Array de hijos con la misma estructura
  ],
  
  // NUEVO: Antepasados
  parents: {
    father: {
      name: "Nombre del padre",
      // ... datos del padre
    },
    mother: {
      name: "Nombre de la madre", 
      // ... datos de la madre
    }
  },
  
  // NUEVO: Hermanos
  siblings: [
    {
      name: "Nombre del hermano",
      // ... datos del hermano
    }
  ]
}
```

## 🔄 Cómo Agregar Información

### 1. **Agregar Antepasados de Francisco**

Para agregar padres, abuelos, etc. de Francisco:

```javascript
window.FAMILY_TREE = {
  name: "Francisco Clemenzo",
  // ... datos existentes
  
  parents: {
    father: {
      name: "Nombre del padre de Francisco",
      birth_place: "Francia",
      birth_date: "1820",
      death_date: "1890"
    },
    mother: {
      name: "Nombre de la madre de Francisco",
      birth_place: "Francia", 
      birth_date: "1825",
      death_date: "1895"
    }
  }
}
```

### 2. **Agregar Hermanos de Francisco**

```javascript
window.FAMILY_TREE = {
  name: "Francisco Clemenzo",
  // ... datos existentes
  
  siblings: [
    {
      name: "Hermano de Francisco",
      birth_place: "Suiza",
      birth_date: "1858"
    },
    {
      name: "Hermana de Francisco", 
      birth_place: "Suiza",
      birth_date: "1860"
    }
  ]
}
```

### 3. **Expandir Familia de Celestina**

```javascript
window.FAMILY_TREE = {
  name: "Francisco Clemenzo",
  spouse: {
    name: "Celestina Roch",
    // ... datos existentes
    
    // Familia de Celestina
    parents: {
      father: {
        name: "Padre de Celestina",
        birth_place: "Suiza",
        birth_date: "1850"
      },
      mother: {
        name: "Madre de Celestina",
        birth_place: "Suiza",
        birth_date: "1855"
      }
    },
    
    siblings: [
      {
        name: "Hermano de Celestina",
        birth_place: "Suiza",
        birth_date: "1885"
      }
    ]
  }
}
```

### 4. **Agregar Rama Materna Completa**

```javascript
window.MATERNAL_FAMILY = {
  name: "Nombre de tu madre",
  birth_place: "Argentina",
  birth_date: "1940",
  
  parents: {
    father: {
      name: "Abuelo paterno (lado materno)",
      birth_place: "Argentina",
      birth_date: "1910",
      
      // Abuelos paternos de tu madre
      parents: {
        father: {
          name: "Bisabuelo paterno (lado materno)",
          birth_place: "Italia",
          birth_date: "1880"
        },
        mother: {
          name: "Bisabuela paterna (lado materno)",
          birth_place: "Italia",
          birth_date: "1885"
        }
      }
    },
    mother: {
      name: "Abuela materna (lado materno)",
      birth_place: "Argentina",
      birth_date: "1915",
      
      // Abuelos maternos de tu madre
      parents: {
        father: {
          name: "Bisabuelo materno (lado materno)",
          birth_place: "España",
          birth_date: "1885"
        },
        mother: {
          name: "Bisabuela materna (lado materno)",
          birth_place: "España",
          birth_date: "1890"
        }
      }
    }
  },
  
  siblings: [
    {
      name: "Tío/Tía materno/a",
      birth_place: "Argentina",
      birth_date: "1938"
    }
  ],
  
  spouse: {
    name: "Nombre de tu padre",
    birth_place: "Argentina",
    birth_date: "1935"
  },
  
  children: [
    {
      name: "Matias Clemenzo", // Tú
      birth_place: "Argentina",
      birth_date: "1980"
    }
  ]
}
```

## 🎯 Consejos para Organizar la Información

### **1. Mantener Consistencia**
- Usar el mismo formato de fechas en todo el árbol
- Mantener consistencia en los nombres de lugares
- Usar el mismo formato para todos los campos

### **2. Documentar Fuentes**
- Agregar comentarios sobre de dónde viene la información
- Incluir fechas de verificación
- Notar si la información es confirmada o estimada

### **3. Estructura Jerárquica**
- Organizar por generaciones
- Mantener clara la relación padre-hijo
- Usar la estructura de `parents` para antepasados directos

### **4. Manejo de Información Incompleta**
```javascript
{
  name: "Persona con datos incompletos",
  birth_date: "c. 1850", // circa
  birth_place: "Desconocido",
  // No incluir campos si no se conocen
}
```

## 🔧 Funcionalidades del Árbol

### **Visualización**
- **Zoom y Pan**: Navegar por el árbol
- **Búsqueda**: Encontrar personas específicas
- **Información detallada**: Hover sobre personas para ver detalles
- **Responsive**: Funciona en móviles y desktop

### **Datos Soportados**
- ✅ Nombres completos
- ✅ Fechas de nacimiento y fallecimiento
- ✅ Lugares de nacimiento y fallecimiento
- ✅ Cónyuges
- ✅ Hijos
- ✅ Hermanos
- ✅ Padres
- ✅ Avatares/fotos
- ✅ Información verificada

## 📝 Próximos Pasos

1. **Completar datos de Francisco**: Agregar información de sus padres y hermanos
2. **Expandir rama de Celestina**: Agregar su familia completa
3. **Agregar tu rama materna**: Incluir toda la familia de tu madre
4. **Verificar información**: Confirmar fechas y lugares
5. **Agregar fotos**: Incluir avatares de familiares

## 🆘 Solución de Problemas

### **El árbol no se carga**
- Verificar que `arbol.js` esté incluido en `arbol.html`
- Revisar la consola del navegador para errores
- Asegurar que la estructura JSON sea válida

### **Información no se muestra**
- Verificar que los nombres de campos coincidan
- Asegurar que las fechas estén en formato correcto
- Revisar que no haya errores de sintaxis

### **Árbol se ve desordenado**
- Ajustar el zoom inicial
- Usar el botón "Centrar" para reorganizar
- Verificar que las relaciones padre-hijo sean correctas
