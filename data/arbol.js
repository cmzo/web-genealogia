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
  name: "Francisco",
  birth_place: "Francia",
  birth_date: "1885",
  death_place: "Argentina",
  death_date: "1952",
  spouse: {
    name: "Celestina",
    birth_place: "Suiza",
    birth_date: "1887",
    death_place: "Santa Fe",
    death_date: "1968"
  },
  children: [
    {
      name: "María Luisa",
      birth_place: "Entre Ríos",
      birth_date: "1912",
      spouse: { name: "Agustín" },
      children: [
        { name: "Hijo 1", birth_date: "1935" },
        { name: "Hija 2", birth_date: "1938" }
      ]
    },
    {
      name: "Félix",
      birth_place: "Francia",
      birth_date: "1890",
      spouse: { name: "Ana" },
      children: [
        { name: "Nieto 1" },
        { name: "Nieto 2" }
      ]
    }
  ]
};


