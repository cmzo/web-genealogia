// Datos locales por defecto si no se usa Google Sheet
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
//   children?: [ ...nodos ]
// }

window.FAMILY_TREE = {
  name: "Francisco Clemenzo",
  birth_place: "Ardon, Suiza",
  birth_date: "1856",
  death_place: "Concepción del Uruguay, Argentina",
  death_date: "1928",
  spouse: {
    name: "Celestina Roch",
    birth_place: "Suiza",
    birth_date: "1887",
    death_place: "Argentina, Santa Fe",
    death_date: "1968"
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


