// ===== DATOS DE USUARIOS MOCKUP (ARCHIVADO) =====
// Este archivo fue archivado en js/legacy. Se mantiene aquí solo como referencia de desarrollo.
const USUARIOS_MOCK = [
  {
    id: 1,
    username: 'nicolas',
    email: 'nicolas.cordero01@alumnos.ucn.cl',
    password: '123',
    firstName: 'Nicolás',
    lastName: 'Cordero Varas',
    rut: '20.543.155-1',
    role: 'student',
    profilePicture: 'images/profile-pictures/id1.png',
    academicInfo: {
      career: 'Ingeniería Civil en Computación e Informática',
      generation: 2021,
      currentSemester: 7,
      totalSemesters: 10,
      gpa: 5.8,
      approvedCourses: 42,
      currentCourses: 5
    }
  },
  {
    id: 2,
    username: 'branco',
    email: 'branco.abalos@alumnos.ucn.cl',
    password: '123',
    firstName: 'Branco',
    lastName: 'Abalos Ortiz',
    rut: '21.619.393-8',
    role: 'student',
    profilePicture: 'images/profile-pictures/id2.png',
    academicInfo: {
      career: 'Ingeniería Civil en Computación e Informática',
      generation: 2022,
      currentSemester: 6,
      totalSemesters: 10,
      gpa: 6.2,
      approvedCourses: 38,
      currentCourses: 6
    }
  },
  {
    id: 3,
    username: 'maximiliano',
    email: 'maximiliano.urrutia@alumnos.ucn.cl',
    password: '123',
    firstName: 'Maximiliano',
    lastName: 'Urrutia Araya',
    rut: '21.573.565-6',
    role: 'student',
    profilePicture: 'images/profile-pictures/id3.png',
    academicInfo: {
      career: 'Ingeniería Civil en Computación e Informática',
      generation: 2022,
      currentSemester: 6,
      totalSemesters: 10,
      gpa: 6.1,
      approvedCourses: 36,
      currentCourses: 6
    }
  }
];


// Exportar para uso en node/test si se desea
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { USUARIOS_MOCK };
}
