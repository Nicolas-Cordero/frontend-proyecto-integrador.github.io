# Backend de simulación de ramos

Servicio Express + SQLite que guarda las simulaciones reales que cada estudiante planifica para el próximo semestre. El proyecto se identifica como **backend-simulacion-ramos** y expone todos los nombres (archivos, tablas y rutas) en español, manteniendo alias en inglés para no romper integraciones previas. Cada simulación persistida se escribe además como un archivo JSON listo para ser enviado a la universidad.

## Requisitos

- Node.js >= 18
- npm

## Instalación

```bash
cd backend
npm install
```

## Ejecución

```bash
npm run dev   # reinicio automático con nodemon
# o
npm start
```

Variables de entorno opcionales (`.env`):

```
BACKEND_PORT=4000
DATABASE_FILE=./data/simulador.sqlite
CORS_ORIGIN=http://localhost:3000
```

## Esquema de datos

| Tabla                | Contenido principal |
|----------------------|---------------------|
| `estudiantes`        | Datos base (rut, correo, nombres, foto, rol).
| `carreras`           | Catálogos asociados al alumno autenticado.
| `estudiantes_carreras` | Métricas académicas: generación, semestre, promedio, etc.
| `ramos`              | Ramos oficiales obtenidos desde el API de mallas.
| `simulaciones`       | Cada simulación de toma de ramos (título, periodo objetivo, créditos totales).
| `simulaciones_ramos` | Ramos almacenados dentro de cada simulación, con un snapshot completo del ramo.

## Endpoints principales

### Salud del servicio

- `GET /api/salud` (alias: `/api/health`)

### Estudiantes

Base: `/api/estudiantes` (alias: `/api/students`)

- `POST /sincronizar` (alias: `/sync`)
  - Cuerpo: mismo formato devuelto por `avance/login.php`.
- `GET /:identificador`
  - Acepta id numérico o rut.

### Ramos / Malla

Base: `/api`

- `POST /carreras/:carreraId/ramos/importar`
  - Alias legacy: `/careers/:careerId/courses/import`
  - Cuerpo de ejemplo:
    ```json
    {
      "ramos": [
        { "codigo": "DCCB-00106", "asignatura": "Cálculo I", "nivel": 1 }
      ]
    }
    ```
- `GET /carreras/:carreraId/ramos` (alias: `/careers/:careerId/courses`)

### Simulaciones

Base: `/api/simulaciones` (alias: `/api/simulations`)

- `POST /`
  - Cuerpo mínimo:
    ```json
    {
      "studentRut": "20.543.155-1",
      "careerId": 1,
      "title": "Semestre 8",
      "targetTerm": "2025-1",
      "notes": "Simulación preliminar",
      "courses": [
        { "codigo": "DCCB-00402", "asignatura": "Bases de Datos", "nivel": 4, "creditos": 10 }
      ]
    }
    ```
- `GET /:id`
- `GET /:id/archivo` &rarr; descarga el archivo JSON `simulacion-{id}.json` almacenado en `data/simulaciones/`
- `GET /estudiante/:rut` (alias: `/student/:identifier`)
- `DELETE /:id`

### Archivos JSON generados automáticamente

- Cada simulación genera y actualiza un archivo `data/simulaciones/simulacion-{id}.json` que contiene:
  - Datos completos del estudiante autenticado (rut, correo, nombres).
  - Información de la carrera/catálogo asociado.
  - Metadatos de la simulación (título, periodo objetivo, créditos totales, notas).
  - El detalle de cada ramo planificado, incluyendo el snapshot original (`foto_ramo`).
- El campo `enlace_json` incluido en las respuestas de la API apunta al endpoint de descarga para que la universidad reciba directamente el JSON producido.
