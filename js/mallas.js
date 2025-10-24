// =============================
// JSON de prueba
// =============================
const malla = [
    // SEMESTRE I
    { codigo: "DCCB-00106", asignatura: "CÁLCULO I", nivel: 1 },
    { codigo: "DCCB-00107", asignatura: "ÁLGEBRA I", nivel: 1 },
    { codigo: "DCCB-00108", asignatura: "INTRODUCCIÓN A LA FÍSICA", nivel: 1 },
    { codigo: "DCCB-00109", asignatura: "PROYECTO INTRO A LA ING I", nivel: 1 },
    { codigo: "DCCB-00110", asignatura: "COMUNICACIÓN EFECTIVA I", nivel: 1 },
    { codigo: "DCCB-00111", asignatura: "INGLÉS I", nivel: 1 },
    { codigo: "DCCB-00112", asignatura: "IDENTIDAD UNIVERSIDAD Y EQ. GÉNERO", nivel: 1 },
  
    // SEMESTRE II
    { codigo: "DCCB-00201", asignatura: "MECÁNICA", nivel: 2 },
    { codigo: "DCCB-00202", asignatura: "CÁLCULO II", nivel: 2 },
    { codigo: "DCCB-00203", asignatura: "ÁLGEBRA II", nivel: 2 },
    { codigo: "DCCB-00204", asignatura: "PROGRAMACIÓN", nivel: 2 },
    { codigo: "DCCB-00205", asignatura: "INGLÉS II", nivel: 2 },
    { codigo: "DCCB-00206", asignatura: "DIÁLOGO FÉ Y CULTURA", nivel: 2 },
  
    // SEMESTRE III
    { codigo: "DCCB-00301", asignatura: "QUÍMICA GENERAL", nivel: 3 },
    { codigo: "DCCB-00302", asignatura: "ECUACIONES DIFERENCIALES", nivel: 3 },
    { codigo: "DCCB-00303", asignatura: "CÁLCULO III", nivel: 3 },
    { codigo: "DCCB-00304", asignatura: "PROGRAMACIÓN ORIENTADA A OBJETOS", nivel: 3 },
    { codigo: "DCCB-00305", asignatura: "TECNOLOGÍAS Y MET. DE PROGRAMACIÓN", nivel: 3 },
    { codigo: "DCCB-00306", asignatura: "COMUNICACIÓN EFECTIVA II", nivel: 3 },
    { codigo: "DCCB-00307", asignatura: "FORMACIÓN GENERAL ELECTIVA I", nivel: 3 },
  
    // SEMESTRE IV
    { codigo: "DCCB-00401", asignatura: "DISEÑO SISTEMAS DIGITALES", nivel: 4 },
    { codigo: "DCCB-00402", asignatura: "BASES DE DATOS", nivel: 4 },
    { codigo: "DCCB-00403", asignatura: "ELECTROTECNIA", nivel: 4 },
    { codigo: "DCCB-00404", asignatura: "INTRODUCCIÓN A DATA SCIENCE", nivel: 4 },
    { codigo: "DCCB-00405", asignatura: "PROY. INTEGR. PROG. AVANZADA", nivel: 4 },
    { codigo: "DCCB-00406", asignatura: "PATRONES DE SOFTWARE", nivel: 4 },
  
    // SEMESTRE V
    { codigo: "DCCB-00501", asignatura: "DISEÑO SISTEMAS DIGITALES II", nivel: 5 },
    { codigo: "DCCB-00502", asignatura: "BASES DE DATOS II", nivel: 5 },
    { codigo: "DCCB-00503", asignatura: "ELECTROTECNIA II", nivel: 5 },
    { codigo: "DCCB-00504", asignatura: "INTRODUCCIÓN A DATA SCIENCE II", nivel: 5 },
    { codigo: "DCCB-00505", asignatura: "PROY. INTEGR. PROG. AVANZADA II", nivel: 5 },
    { codigo: "DCCB-00506", asignatura: "PATRONES DE SOFTWARE II", nivel: 5 }
  ];
  
  // =============================
  // Renderizar malla en HTML
  // =============================
  const contenedor = document.getElementById("contenedorMalla");
  
  // Agrupar por nivel (semestre)
  const semestres = {};
  malla.forEach(ramo => {
    if (!semestres[ramo.nivel]) semestres[ramo.nivel] = [];
    semestres[ramo.nivel].push(ramo);
  });
  
  // Crear columnas para cada semestre
  for (let nivel in semestres) {
    const columna = document.createElement("div");
    columna.classList.add("semestre");
    columna.innerHTML = `<h2>SEMESTRE ${nivel}</h2>`;
  
    semestres[nivel].forEach(ramo => {
      const divRamo = document.createElement("div");
      divRamo.classList.add("ramo");
      divRamo.textContent = ramo.asignatura;
      columna.appendChild(divRamo);
    });
  
    contenedor.appendChild(columna);
  }