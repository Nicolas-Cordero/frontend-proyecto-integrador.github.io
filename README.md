<div align="center">

# Predict Class
### Sistema Inteligente de Proyección Académica

[![Universidad](https://img.shields.io/badge/Universidad-UCN%20Coquimbo-blue?style=for-the-badge)](https://www.ucn.cl/)
[![Estado](https://img.shields.io/badge/Estado-Completado-brightgreen?style=for-the-badge)]()
[![Sprint](https://img.shields.io/badge/Sprint%20Actual-7%2F7-green?style=for-the-badge)]()
[![Metodología](https://img.shields.io/badge/Metodología-Scrum-orange?style=for-the-badge)]()

*Proyecto Integrador Software - Ingeniería Civil en Computación e Informática*  
*Semestre VI - 2025*

</div>

---

<div align="center">

## Resumen Ejecutivo

| Aspecto | Detalles |
|--------|---------|
| **Estudiantes** | 3 integrantes del equipo |
| **Duración Total** | 15 semanas (7 sprints completados) |
| **Tecnologías Principales** | Node.js, Express, SQLite, HTML5, CSS3, JavaScript, Docker |
| **Testing** | Jest con 70% de cobertura en módulos críticos |
| **Deployment** | Docker + Docker Compose |

</div>

---

## **INFORMACIÓN GENERAL**

<table>
  <tr>
    <td width="50%">

### Institución Académica
- **Universidad:** Universidad Católica del Norte
- **Sede:** Coquimbo, Chile
- **Facultad:** Escuela de Ingeniería
- **Profesor Guía:** Eric Ross

    </td>
    <td width="50%">

### Cronograma del Proyecto
- **Inicio:** 01 de Septiembre 2025
- **Término:** 19 de Diciembre 2025
- **Duración:** 15 semanas
- **Sprints:** 7 completados
- **Carga:** 30 horas por sprint

    </td>
  </tr>
</table>

### Equipo de Desarrollo

| Nombre | Email | Rol |
|--------|-------|-----|
| Branco Abalos Ortiz | branco.abalos@alumnos.ucn.cl | Scrum Master |
| Nicolás Cordero Varas | nicolas.cordero01@alumnos.ucn.cl | Product Owner |
| Maximiliano Urrutia Araya | maximiliano.urrutia@alumnos.ucn.cl | Desarrollador |

---

## **DESCRIPCIÓN DEL PROYECTO**

### Problema Central

En la Universidad Católica del Norte, Sede Coquimbo, existe una **carencia** en el sistema de proyección académica estudiantil. El sistema actual solo proporciona información estática sobre mallas curriculares y prerrequisitos, **obligando a los estudiantes a planificar manualmente** sus semestres de forma ineficiente.

<details open>
<summary><b>Problemas Identificados</b></summary>

- Ausencia de herramientas dinámicas para proyectar estadía universitaria
- Falta de algoritmos de optimización para combinaciones de ramos
- Inexistencia de validación automática de prerrequisitos y restricciones
- Carencia de personalización según preferencias del estudiante
- Planificación manual ineficiente que prolonga la permanencia universitaria

</details>

### Objetivo General

Desarrollar un **sitio web integral** donde los estudiantes puedan revisar su trayectoria académica y proyectar su tiempo de estadía aproximado, proporcionando **la mejor combinación de ramos por semestre** para **minimizar el tiempo de titulación**.

### Objetivos Logrados

| Área | Logro |
|------|-------|
| **Diseño** | Mockups, diagramas MER y arquitectura del sistema |
| **Algoritmo** | Validación de prerrequisitos, cálculo de créditos y proyecciones |
| **Desarrollo** | APIs UCN integradas, frontend y backend completos |
| **Testing** | Jest con 70% de cobertura en módulos críticos |

---

## **TECNOLOGÍAS Y ARQUITECTURA**

### Stack Tecnológico

<table>
  <tr>
    <td width="33%">
      
**Frontend**
- HTML5
- CSS3
- JavaScript (Vanilla)
- Axios
- Express (proxy)
- Jest

    </td>
    <td width="33%">
      
**Backend**
- Node.js
- Express.js
- SQLite 3
- better-sqlite3

    </td>
    <td width="33%">
      
**Middlewares**
- Helmet
- Morgan
- CORS
- Rate Limiting
- Multer
- dotenv

    </td>
  </tr>
</table>

### APIs Integradas

| API | Función |
|-----|---------|
| **Autenticación UCN** | Login y validación de usuarios |
| **Mallas Curriculares** | Planes de estudio y prerrequisitos |
| **Avance Académico** | Estado actual del estudiante |

### Herramientas de Desarrollo

```
GitHub  •  Jira  •  VS Code  •  Docker  •  Draw.io  •  Discord
```

---

## **ARQUITECTURA DEL SISTEMA**

El sistema implementa una arquitectura de tres capas:

<table>
  <tr>
    <td width="33%">
      
### Capa de Presentación
Interfaz web que permite visualizar:
- Malla curricular actual
- Histórico de avance
- Simulación de semestres
- Proyecciones futuras

    </td>
    <td width="33%">
      
### Capa de Negocio
Servicio Express que:
- Procesa simulaciones
- Valida combinaciones
- Expone endpoints REST
- Implementa seguridad

    </td>
    <td width="33%">
      
### Capa de Datos
Base de datos SQLite que almacena:
- Estudiantes y carreras
- Ramos y simulaciones
- Métricas académicas
- Configuraciones

    </td>
  </tr>
</table>

---

## **METODOLOGÍA SCRUM**

### Planificación de Sprints

| Sprint | Periodo | Estado | Duracion |
|:------:|:-------:|:------:|:-------:|
| 1 | 01/09 - 14/09 | ✓ Completado | 2 semanas |
| 2 | 15/09 - 28/09 | ✓ Completado | 2 semanas |
| 3 | 29/09 - 12/10 | ✓ Completado | 2 semanas |
| 4 | 13/10 - 26/10 | ✓ Completado | 2 semanas |
| 5 | 27/10 - 09/11 | ✓ Completado | 2 semanas |
| 6 | 10/11 - 23/11 | ✓ Completado | 2 semanas |
| 7 | 24/11 - 07/12 | ✓ Completado | 2 semanas |

### Distribución del Trabajo

- **30 horas** por sprint
- **5 horas semanales** por miembro
- **3 miembros** en el equipo
- Asignación según especialidades técnicas

---

## **INSTALACIÓN Y DESARROLLO**

### Requisitos Previos

```
Node.js 18+  •  npm  •  Git  •  Docker Desktop
```

### Instalación Rápida

Clona el repositorio en tu máquina local:

```bash
git clone https://github.com/Nicolas-Cordero/frontend-proyecto-integrador.git
```

Abre **dos terminales** para ejecutar backend y frontend en paralelo.

---

#### **Terminal 1: Backend (Docker)**

```bash
cd backend
docker-compose up --build
```

**Backend disponible en:** `http://localhost:4000`

---

#### **Terminal 2: Frontend**

```bash
cd frontend
npm install
npm start
```

**Frontend disponible en:** `http://localhost:3000`

---

#### **Ejecutar Tests (opcional)**

```bash
cd frontend
npm test
```

---

##  **ESTRUCTURA DEL PROYECTO**

```
frontend-proyecto-integrador/
├── frontend/                           # Aplicación cliente web
│   ├── html/                           # Páginas HTML (vistas)
│   │   ├── index.html                  # Página de login
│   │   ├── main-menu.html              # Dashboard principal
│   │   ├── malla-actual.html           # Vista de malla curricular
│   │   ├── historico.html              # Histórico de avance académico
│   │   ├── perfil-usuario.html         # Perfil del usuario
│   │   ├── simulacion-prox-semestre.html # Proyección de semestre
│   │   ├── mis-simulaciones-egreso.html  # Simulaciones guardadas
│   │   └── mallas (urr).html           # Base para visualización de mallas
│   ├── css/                            # Hojas de estilo
│   │   ├── index-styles.css            # Estilos del login
│   │   ├── main-menu.css               # Estilos del dashboard
│   │   ├── malla-actual.css            # Estilos de malla curricular
│   │   ├── historico-scoped.css        # Estilos de histórico
│   │   ├── historico-estadisticas.css  # Estilos de estadísticas
│   │   ├── simulacion-prox-semestre.css # Estilos de proyección
│   │   ├── perfil-usuario-styles.css   # Estilos de perfil
│   │   ├── dashboard-ross.css          # Estilos de dashboard específico
│   │   └── style-mallas.css            # Estilos base de mallas
│   ├── js/                             # Lógica JavaScript
│   │   ├── index-script.js             # Autenticación y login
│   │   ├── main-menu-script.js         # Navegación del dashboard
│   │   ├── malla-actual.js             # Visualización de malla actual
│   │   ├── historico-script.js         # Procesamiento de histórico
│   │   ├── historico-estadisticas.js   # Cálculo y visualización de estadísticas
│   │   ├── historico-avance-api.js     # Integración con API de avance
│   │   ├── mallas-api.js               # Operaciones con API de mallas
│   │   ├── mallas-ui.js                # Renderización UI de mallas
│   │   ├── mallas.js                   # Orquestación de mallas
│   │   ├── perfil-usuario-script.js    # Gestión de perfil
│   │   ├── mis-simulaciones.js         # Listado de simulaciones
│   │   ├── poblar-simulaciones.js      # Carga de simulaciones
│   │   ├── limpiar-malla.js            # Validación de combinaciones
│   │   ├── proyeccion-app.js           # Aplicación de proyección
│   │   ├── proyeccion-constructor.js   # Construcción de proyecciones
│   │   ├── proyeccion-procesador.js    # Procesamiento de datos
│   │   ├── proyeccion-trigger.js       # Eventos y triggers
│   │   ├── proyeccion-ui.js            # UI de proyección
│   │   ├── proyeccion-validador.js     # Validación de ramos
│   │   ├── carrera-selector.js         # Selección de carrera
│   │   ├── tema-manager.js             # Gestión de tema (oscuro/claro)
│   │   ├── toast-ui.js                 # Notificaciones toast
│   │   ├── proxy-server.js             # Servidor proxy local
│   │   ├── dashboard-ross.js           # Visualización específica
│   │   └── legacy/                     # Código heredado
│   ├── tests/                          # Suite de tests con Jest
│   │   ├── simulacion-prox-semestre.test.js
│   │   ├── historico-estadisticas.test.js
│   │   ├── dashboard-ross.test.js
│   │   ├── historico-script.test.js
│   │   ├── malla-actual.test.js
│   │   ├── mallas-api.test.js
│   │   ├── mallas-ui.test.js
│   │   └── otros tests...
│   ├── coverage/                       # Reportes de cobertura
│   │   ├── clover.xml
│   │   ├── coverage-final.json
│   │   ├── lcov.info
│   │   └── lcov-report/
│   ├── images/                         # Recursos gráficos
│   │   ├── profile-pictures/           # Fotos de perfil
│   │   ├── arquitectura.png            # Diagrama de arquitectura
│   │   ├── ucn-logo.png                # Logo UCN
│   │   └── ucn-name.png                # Nombre institucional
│   ├── jest.config.js                  # Configuración de Jest
│   ├── generate-coverage-report.js     # Script de cobertura
│   ├── package.json                    # Dependencias del frontend
│   ├── package-lock.json               # Lock file de versiones
│   └── README.md                       # Documentación del frontend
├── backend/                            # Servidor API (Express + SQLite)
│   ├── src/                            # Código fuente
│   │   ├── servidor.js                 # Servidor Express principal
│   │   ├── base-datos.js               # Inicialización SQLite
│   │   ├── configuracion.js            # Configuración global
│   │   ├── rutas/                      # Endpoints API
│   │   │   ├── estudiantes.js          # Operaciones de estudiantes
│   │   │   ├── cursos.js               # Gestión de cursos
│   │   │   └── simulaciones.js         # Persistencia de simulaciones
│   │   └── utilidades/                 # Módulos auxiliares
│   │       └── archivos-simulaciones.js # Gestión de JSON
│   ├── data/                           # Almacenamiento persistente
│   │   ├── base_datos.sqlite           # Base de datos SQLite
│   │   ├── base_datos.sqlite-shm       # Archivo de snapshot
│   │   ├── base_datos.sqlite-wal       # Write-ahead log
│   │   ├── profile-pictures/           # Fotos de perfil
│   │   └── simulaciones/               # Archivos JSON de simulaciones
│   ├── docker-compose.yml              # Configuración Docker
│   ├── Dockerfile                      # Imagen Docker
│   ├── package.json                    # Dependencias del backend
│   ├── package-lock.json               # Lock file de versiones
│   ├── README.md                       # Documentación del backend
│   ├── README-DOCKER.md                # Guía Docker
│   ├── ENDPOINTS.txt                   # Documentación de endpoints
│   └── .env (no versionado)            # Variables de entorno
├── README.md                           # Documentación principal
├── guia-uso.txt                        # Guía de uso del usuario
└── .gitattributes                      # Configuración de Git
```
---