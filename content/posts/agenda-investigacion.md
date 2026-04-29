---
title: "Agenda de investigación genealógica"
kicker: "Vacíos, errores y próximos pasos"
description: "Estado actual de la investigación: qué falta, qué parece irrecuperable, y qué líneas concretas quedan por explorar en Suiza y Argentina."
image: ""
category: "investigación"
date: "2026-04-29"
tags: "Clemenzo, Valais, Entre Ríos, metodología, fuentes"
featured: false
slug: "agenda-investigacion"
aside: |
  **Generaciones en el árbol**

  Gen. 0 — Nacidos 2016–2023
  Gen. 1 — Nacidos ~1983–1991
  Gen. 2 — Nacidos ~1959–1965
  Gen. 3 — Nacidos ~1914–1930
  Gen. 4 — Nacidos ~1880–1900
  Gen. 5 — Nacidos ~1855–1870 *(emigración)*
  Gen. 6 — Nacidos ~1809–1828 *(Valais)*
---

![Claude AI](../../assets/images/posts/Claude.webp)


## Errores de datos a corregir

Antes de seguir investigando, hay tres inconsistencias en el árbol que conviene corregir para no construir sobre datos incorrectos.

**François Clemenzo — fecha de nacimiento a verificar.** El registro dice 31 de mayo de 1858. La fecha es válida, pero vale confirmarla contra el acta original si aún no se hizo, dado que es el dato de base de toda la rama.

**Félix Clemenzo (p18) — referencia circular.** Su propio ID aparece en su lista de hijos. Es un error de carga en la planilla. No tiene consecuencias en la visualización actual, pero romperá cualquier análisis de grafo que se haga en el futuro.

**Celestina Roh — hija incorrecta.** El campo `childrenIds` de Celestina (p27) incluye a Isabel María Queipo (p19), que en realidad es la *esposa* de su hijo Félix. No su hija. El origen probable: al cargar las familias, se mezcló un campo.

---

## Vacíos por individuo

### Generación 6 — Valais, ~1800–1830

Estos son los ancestros más difíciles de documentar. El registro civil suizo comienza en 1876; todo lo anterior es registro parroquial.

**François Clemenzoz** (p36) — nacido 1809, Ardon, Valais.
El más antiguo con datos concretos. Falta: fecha y lugar de defunción, y todo sobre sus padres. Si murió en Valais antes de emigrar su familia, el acta de defunción debería estar en el registro parroquial de Ardon. Si sobrevivió a la emigración de sus hijos (François/Francisco nació en 1858, cuando el padre tenía ~49), podría haber fallecido en Argentina, aunque no hay ningún indicio de esto.

**Marie Louise Stalder** (p37) — nacida 1828, Salins, Valais.
Salins es una localidad pequeña, contigua a Ardon. El apellido Stalder es común en el Valais romando. Falta: fecha de defunción, lugar exacto, y sus padres. Si se casó con François Clemenzoz en Ardon o Salins, el acta matrimonial debería existir en los registros parroquiales de alguna de las dos parroquias (~1845–1855).

**Jose Roh** (p38) y **Maria Putallaz** (p39) — Conthey/Ardon.
Ambos con fecha de nacimiento desconocida. Solo se sabe el origen geográfico aproximado. Roh y Putallaz son apellidos vallesanos rastreables. La hija de ambos, Celestina, nació en 1863 en Conthey, lo que ubica el matrimonio Roh–Putallaz probablemente entre 1855 y 1862. Falta: todo.

---

### Generación 5 — Emigración, ~1855–1870

**François Clemenzo** (p26) — 1858, Riddes → 1928, Concepción del Uruguay.
El individuo mejor documentado de esta generación. Sin embargo:
- La fecha exacta de emigración es desconocida. Dado que sus primeros hijos nacen en Entre Ríos (Félix, ~1880s), emigró probablemente entre 1875 y 1885. Hay registros de emigración del cantón Valais para ese período.
- No hay constancia del barco ni del puerto de llegada.
- La fecha de matrimonio con Celestina Roh tampoco está registrada.

**José Clemenzo** (p28) — 1856, Riddes → 1899, Colonia Yerúa.
Hermano de François, murió joven (~43 años). No hay esposa ni hijos registrados. Las causas de muerte en Colonia Yerúa a fines del siglo XIX incluyen frecuentemente fiebre tifoidea o accidentes rurales. El acta de defunción en el Registro Civil de Concordia (1899) debería existir.

**Étienne Clemenzo** (p40) — 1862, Riddes.
El menor de los tres hermanos emigrantes. Su esposa, Estefanía Venegas, es completamente desconocida salvo el nombre. No hay hijos registrados, lo que puede ser un vacío del árbol más que un hecho. Falta: fecha y lugar de defunción para ambos.

**Celestina Roh** (p27) — 1863, Conthey → 1950, Santa Fe.
Uno de los registros más completos. El 1° de enero de 1863 probablemente sea una fecha aproximada usada cuando solo se conocía el año. La fecha exacta debería estar en los registros parroquiales de Conthey.

**Tomas Baster** (p31) — nacido en Inglaterra, lugar no especificado.
La presencia de un inglés en esta rama es llamativa. Falta absolutamente todo: fecha de nacimiento, lugar exacto, cómo llegó al Río de la Plata, cuándo murió. El apellido Baster existe en el sur de Inglaterra. Su esposa Francisca Guido es de Uruguay, lo que sugiere que Tomas llegó a la región rioplatense posiblemente como trabajador, comerciante o marino.

**Estefanía Venegas** (p41), **Pablo Martín Vásquez** (p55), **Elvira Garrido** (p56) — sin datos.
Sin información más allá del nombre. Elvira Garrido ni siquiera tiene rama asignada. Para estos, la única vía realista es documentación en manos de ramas familiares vivas.

---

### Generación 4 — Entre Ríos, ~1880–1900

**Félix Clemenzo** (p18) — hijo de François y Celestina, nacido en Entre Ríos.
Fecha de nacimiento desconocida. Si nació en la Colonia San José o zonas aledañas, el registro parroquial de la colonia o el Registro Civil de Concepción del Uruguay deberían tenerlo. Falta también la fecha de defunción.

**Isabel María Queipo** (p19) — esposa de Félix, nacida en Buenos Aires.
Sin fecha de nacimiento ni información sobre sus padres. El apellido Queipo tiene presencia en Buenos Aires desde mediados del siglo XIX.

**Léon Francisco Clemenzo** (p20) — 1891, Colonia San José.
El lugar de nacimiento está bien documentado. Solo falta la fecha y lugar de defunción.

**Emiliana Elena Baster** (p21) — 1896, Paraná.
Hija de Tomas Baster y Francisca Guido. Solo falta la fecha de defunción.

**Pedro** (p22), **Francisca** (p23), **Celestina** (p25), **María Luisa** (p29), **Carlota Julia** (p30) — hijos de François y Celestina.
Todos nacidos en Entre Ríos, con lugar de nacimiento vago o sin fecha. Las actas de nacimiento del Registro Civil de Concordia y Concepción del Uruguay para el período 1880–1900 deberían cubrir varios de estos casos.

**Benito Arceo** (p51), **Antonia Yanitelli** (p52), **Enrique Alfredo Vásquez** (p53), **María Luisa Fracchia** (p54) — sin datos.
Ramas colaterales con información nula. Yanitelli e incluso Fracchia son apellidos de origen italiano frecuentes en Entre Ríos y Santa Fe.

---

### Generación 3 — ~1910–1930

**Félix Ricardo Clemenzo** (p10) — 1926, Bolívar, Buenos Aires.
Tiene lugar de defunción (CABA) pero no fecha. Siendo el bisabuelo del autor, esta fecha debería ser conocida por la familia directa.

**Raquel Noemí Carvallo** (p11) — CABA.
Sin ninguna fecha. El apellido Carvallo tiene distribución amplia en Argentina.

**Hijos de Félix e Isabel** (p12 al p17) — sin fechas de nacimiento.
Nacidos probablemente entre 1905 y 1925 en Buenos Aires. El Registro Civil de CABA tiene registros digitalizados accesibles para ese período.

---

## Líneas de investigación

### Microfilmes no indexados en FamilySearch

Los registros parroquiales del Valais anteriores a 1876 están en gran parte microfilmados pero no indexados ni digitalizados. Esto significa que no aparecen en búsquedas por nombre, pero existen en el catálogo y se pueden consultar.

Las colecciones clave para buscar:
- **Riddes** — bautismos, matrimonios y defunciones, siglos XVII–XIX
- **Ardon** — ídem; aquí nacen los Clemenzoz más antiguos rastreados
- **Conthey** — para los Roh y Putallaz
- **Salins** — para los Stalder

Para ver estos microfilmes sin viajar: algunos FamilySearch Centers todavía permiten solicitar rollos. Pero la opción más directa, dado el contexto del viaje planeado, es leerlos directamente en Sion.

Para Argentina, el Registro Civil de Entre Ríos tiene microfilmes de 1870 a ~1920 que tampoco están completamente indexados. El catálogo de FamilySearch para "Entre Ríos, Argentina" lista varias colecciones por partido (Concordia, Concepción del Uruguay, Paraná) que merecen revisión rollo por rollo si la búsqueda indexada ya se agotó.

---

### Para el viaje a Valais

**Archives de l'État du Valais (AEV), Sion.** El recurso central. Tienen:
- Registros civiles completos desde 1876
- Registros parroquiales anteriores (los originales, no microfilmes)
- *Registres de bourgeoisie* por commune — especialmente relevante para Ardon y Riddes. Los Clemenzoz habrán tenido derechos de bourgeoisie que dejan huella documental generación tras generación
- *Registres militaires* — los hombres vallesanos del siglo XIX están registrados en roles de milicia, que permiten ubicar familias en un momento dado

Conviene pedir cita previa y llegar con los datos exactos: commune, período aproximado, nombres a buscar.

**Parroquias de Riddes y Ardon.** Los registros originales más antiguos, anteriores a los microfilmados, pueden estar en la propia parroquia. Vale consultar si tienen archivo propio o si todo fue entregado al AEV.

**Registro communal.** Cada commune suiza tiene un *registre des familles* o *Familienbuch* que lista los miembros de cada familia burguesa. Para Ardon/Riddes y los Clemenzoz, esto puede dar información sobre varias generaciones de una sola vez.

**Contactos ya establecidos en Valais.** Si alguno de los contactos locales tiene acceso o conocimiento de archivos privados, registros de asociaciones de emigrantes vallesanos, o publicaciones genealógicas locales (la Societé d'Histoire du Valais Romand publica anualmente), eso puede acortar mucho el trabajo de archivo.

---

### Recursos online específicos

**Généalogies vaudoises et valaisannes** — algunas bases de datos de aficionados locales indexan apellidos vallesanos raros. Los Clemenzoz/Clemenzo son lo suficientemente poco comunes como para que alguien los haya trabajado antes.

**HISREG** — registro histórico suizo de communes, útil para entender migraciones internas (de Ardon a Riddes, que parece haber ocurrido entre generaciones).

**Registros de emigración del Cantón Valais** — el cantón exigía pasaportes internos para emigrar. Los registros de emigración vallesana del período 1860–1890 están parcialmente disponibles y permitirían confirmar la fecha y los hermanos que viajaron juntos.

**Portal de la Colonia San José** — el Museo Histórico de la Colonia tiene un registro de colonos digitalizado parcialmente. Dado el contexto (libros sobre la colonia ya consultados), es probable que esto ya se revisó, pero los registros de tierras asignadas pueden dar fechas de llegada.

**Archivo Histórico de la Provincia de Entre Ríos (Paraná)** — tiene documentación de los partidos del interior que no siempre está en FamilySearch. Vale consultar directamente, especialmente para Concordia y Concepción del Uruguay en el período 1880–1910.

---

### Estrategias con IA

**Transcripción de documentos.** Los registros parroquiales vallesanos del siglo XIX están escritos en francés con caligrafía cursiva antigua y con abreviaturas específicas. Claude (con visión) puede transcribir y traducir estos documentos con buena precisión, incluso cuando la caligrafía es difícil. Útil para acelerar la lectura de rollos en Sion.

**Análisis de patrones de nombres.** El árbol muestra recurrencias claras: François/Félix/Francisco en la línea masculina, Celestina en la femenina. Esto es sistemático en las familias campesinas suizas del siglo XIX, donde se usaba el nombre del abuelo. Conociendo este patrón, si se encuentra un François Clemenzoz nacido en Ardon antes de 1809, es candidato fuerte a ser el padre del François nacido en 1809.

**Búsqueda de redes familiares.** Roh, Putallaz y Stalder son apellidos localizados geográficamente en el Valais romando. Si se encuentran matrimonios o documentos que crucen estos apellidos con los Clemenzoz en las mismas parroquias, pueden revelar conexiones que no están en el árbol todavía.

**Contexto histórico.** La emigración vallesana a Argentina se intensificó entre 1850 y 1890, impulsada por crisis agrícolas y el proyecto de colonización de Entre Ríos. Un prompt bien armado sobre el contexto específico del Bas-Valais en 1855–1875 puede ayudar a entender qué documentos esperarías encontrar y cuáles probablemente no sobrevivieron.

---

## Hipótesis de trabajo

**Los tres hermanos emigraron en tiempos cercanos.** François (1858), José (1856) y Étienne (1862) nacen en Riddes con pocos años de diferencia. Los tres aparecen en Argentina. Lo más probable es que hayan emigrado juntos o en oleadas del mismo contexto familiar, posiblemente con algún referente previo en la Colonia San José. Los registros de emigración del Valais podrían confirmar si viajaron con el mismo permiso o en fechas contiguas.

**El salto de Ardon a Riddes.** El padre François Clemenzoz nació en Ardon en 1809. Sus hijos nacen en Riddes, a unos 15 km. Esto sugiere una migración interna entre 1830 y 1855. Las razones pueden ser económicas (búsqueda de tierras o trabajo) o matrimoniales (Marie Louise Stalder es de Salins, también próxima a Riddes). El registro de bourgeoisie de Riddes podría confirmar cuándo la familia obtuvo derechos locales.

**Celestina Roh y el matrimonio en Argentina.** Celestina nació en Conthey en 1863 y François en Riddes en 1858. La distancia geográfica sugiere que el matrimonio no se concertó en Suiza sino que se conocieron en Argentina, posiblemente en la colonia o en Concepción del Uruguay. No hay constancia del acta matrimonial en el árbol actual.

**José Clemenzo murió sin descendencia conocida.** Falleció en 1899 en Colonia Yerúa, a los ~43 años, sin esposa ni hijos registrados. Puede haber tenido hijos no registrados en el árbol, o puede haber fallecido realmente sin descendencia. Vale revisar el acta de defunción para ver si menciona estado civil.
