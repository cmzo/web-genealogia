// Datos locales por defecto si no se usa Google Sheet
// Estructura completa del árbol genealógico incluyendo ramas paterna y materna
// Esquema:
// {
//   id: string (opcional),
//   name: string,
//   avatar?: string,
//   birth_place?: string,
//   birth_date?: string,
//   death_place?: string,
//   death_date?: string,
//   spouse?: { name: string, avatar?: string, birth_place?: string, birth_date?: string, death_place?: string, death_date?: string },
//   children?: [ ...nodos ],
//   siblings?: [ ...hermanos ],
//   parents?: { father: {...}, mother: {...} }
// }

window.FAMILY_TREE = {
  // === RAMA PATERNA (CLEMENZO) ===
  name: "Francisco Clemenzo",
  birth_place: "Ardon, Suiza",
  birth_date: "1856",
  death_place: "Concepción del Uruguay, Argentina",
  death_date: "1928",
  
  // Antepasados de Francisco (si se conocen)
  parents: {
    father: {
      name: "Padre de Francisco Clemenzo",
      birth_place: "Francia/Suiza",
      birth_date: "1820",
      death_date: "1890"
    },
    mother: {
      name: "Madre de Francisco Clemenzo", 
      birth_place: "Francia/Suiza",
      birth_date: "1825",
      death_date: "1895"
    }
  },
  
  // Hermanos de Francisco (si se conocen)
  siblings: [
    {
      name: "Hermano de Francisco Clemenzo",
      birth_place: "Suiza",
      birth_date: "1858"
    }
  ],
  
  spouse: {
    name: "Celestina Roch",
    birth_place: "Suiza",
    birth_date: "1887",
    death_place: "Argentina, Santa Fe",
    death_date: "1968",
    
    // Familia de Celestina (rama materna de Francisco)
    parents: {
      father: {
        name: "Padre de Celestina Roch",
        birth_place: "Suiza",
        birth_date: "1850"
      },
      mother: {
        name: "Madre de Celestina Roch",
        birth_place: "Suiza", 
        birth_date: "1855"
      }
    },
    
    siblings: [
      {
        name: "Hermano de Celestina Roch",
        birth_place: "Suiza",
        birth_date: "1885"
      }
    ]
  },
  
  children: [
    {
      name: "Maria Luisa Clemenzo",
      birth_place: "Santa Fe, Argentina",
      birth_date: "1897",
      death_place: "Santa Fe, Argentina",
      death_date: "1972",
      spouse: { 
        name: "Agustin Costabile",
        birth_place: "Argentina",
        birth_date: "1895",
        death_place: "Argentina, Santa Fe",
        death_date: "1971"
      },
      children: [
        { 
          name: "Olga Hemilce Clemenzo Queipo",
          birth_place: "Santa Fe, Argentina",
          birth_date: "1920"
        },
        { 
          name: "Yolanda Isabel Clemenzo Queipo",
          birth_place: "Santa Fe, Argentina",
          birth_date: "1922"
        }
      ]
    },
    {
      name: "Felix Clemenzo",
      birth_place: "Entre Rios, Argentina",
      birth_date: "1894",
      death_place: "Entre Rios, Argentina",
      death_date: "1955",
      spouse: { 
        name: "Isabel Maria Queipo",
        birth_place: "Argentina",
        birth_date: "1905",
        death_place: "Argentina",
        death_date: "1969"
      },
      children: [
        { 
          name: "Felix Ricardo Clemenzo",
          birth_place: "Entre Rios, Argentina",
          birth_date: "1925",
          spouse: {
            name: "Raquel Noemi Carvallo",
            birth_place: "Argentina",
            birth_date: "1928"
          }
        }
      ]
    },
    {
      name: "León Francisco Clemenzo",
      birth_place: "Entre Rios, Argentina",
      birth_date: "1891",
      spouse: { 
        name: "Emiliana Elena Baster",
        birth_place: "Argentina",
        birth_date: "1895"
      },
      children: [
        { 
          name: "Rodolfo Ambrosio Clemenzo",
          birth_place: "Concepción del Uruguay, Argentina",
          birth_date: "21/03/1919"
        }
      ]
    },
    {
      name: "Pedro Clemenzo",
      birth_place: "Entre Rios, Argentina",
      birth_date: "1890",
      death_place: "Entre Rios, Argentina",
      death_date: "1950"
    },
    {
      name: "Carlota Julia Clemenzo",
      birth_place: "Entre Rios, Argentina",
      birth_date: "1899",
      death_place: "Argentina",
      death_date: "1980"
    }
  ]
};

// === RAMA MATERNA (FAMILIA DE TU MADRE) ===
// Esta estructura se puede agregar como una rama separada o integrar con la paterna
window.MATERNAL_FAMILY = {
  name: "Tu Madre", // Reemplazar con el nombre real
  birth_place: "Argentina",
  birth_date: "1940", // Aproximado
  
  parents: {
    father: {
      name: "Abuelo Paterno (lado materno)",
      birth_place: "Argentina",
      birth_date: "1910",
      death_date: "1980",
      
      // Abuelos paternos de tu madre
      parents: {
        father: {
          name: "Bisabuelo Paterno (lado materno)",
          birth_place: "Italia/Argentina",
          birth_date: "1880"
        },
        mother: {
          name: "Bisabuela Paterna (lado materno)",
          birth_place: "Italia/Argentina",
          birth_date: "1885"
        }
      }
    },
    mother: {
      name: "Abuela Materna (lado materno)",
      birth_place: "Argentina",
      birth_date: "1915",
      death_date: "1985",
      
      // Abuelos maternos de tu madre
      parents: {
        father: {
          name: "Bisabuelo Materno (lado materno)",
          birth_place: "España/Argentina",
          birth_date: "1885"
        },
        mother: {
          name: "Bisabuela Materna (lado materno)",
          birth_place: "España/Argentina",
          birth_date: "1890"
        }
      }
    }
  },
  
  siblings: [
    {
      name: "Tío/Tía Materno/a",
      birth_place: "Argentina",
      birth_date: "1938"
    }
  ],
  
  spouse: {
    name: "Tu Padre", // Reemplazar con el nombre real
    birth_place: "Argentina",
    birth_date: "1935" // Aproximado
  },
  
  children: [
    {
      name: "Matias Clemenzo", // Tú
      birth_place: "Argentina",
      birth_date: "1980" // Aproximado
    }
  ]
};


