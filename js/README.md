# 📁 JavaScript - Estructura de Archivos

Esta carpeta contiene todos los archivos JavaScript del proyecto PredictClass.

## 📄 Archivos

### `mockups.js`
**Archivo de datos de prueba (mockups) hardcodeados.**

- **Propósito:** Centraliza todos los datos de usuarios de prueba
- **Exporta:** `USUARIOS_MOCK` - Array de usuarios con información completa
- **Carga:** Debe incluirse ANTES de cualquier script que lo use
- **Versión:** 2025102304

**Estructura de datos:**
```javascript
const USUARIOS_MOCK = [
  {/* Lines 19-39 omitted */}
];
```

**Usuarios disponibles:**
- nicolas / nicolas.cordero01@alumnos.ucn.cl / 123
- branco / branco.abalos@alumnos.ucn.cl / 123
- maximiliano / maximiliano.urrutia@alumnos.ucn.cl / 123

---

### `index-script.js`
**Script principal del sistema de login.**

- **Propósito:** Manejo de autenticación y validación de formularios
- **Clase principal:** `LoginApp`
- **Dependencias:** Requiere `mockups.js` cargado previamente
- **Versión:** 2025102304

**Funcionalidades:**
- Validación de credenciales
- Gestión de sesión (sessionStorage)
- Manejo de errores visuales
- Toggle de visibilidad de contraseña
- Sistema de loading y mensajes de estado

---

### `main-menu-script.js`
**Script del dashboard principal.**

- **Propósito:** Navegación y gestión del menú principal
- **Clase principal:** `MainMenuApp`
- **Dependencias:** Requiere `mockups.js` cargado previamente
- **Versión:** 2025102304

**Funcionalidades:**
- Carga de datos de usuario desde sessionStorage
- Búsqueda en tiempo real del menú
- Navegación al perfil de usuario
- Logout y limpieza de sesión

---

### `perfil-usuario-script.js`
**Script del perfil de usuario.**

- **Propósito:** Visualización y edición de perfil
- **Clase principal:** `UserProfileApp`
- **Versión:** Actual

**Funcionalidades:**
- Muestra información personal
- Muestra información académica
- Botones de acción (editar, cambiar contraseña)

---

## 🔄 Orden de Carga

Es **crítico** que los scripts se carguen en el siguiente orden:

```html
<!-- 1. Primero los datos (mockups) -->
<script src="../js/mockups.js?v=2025102304"></script>

<!-- 2. Luego los scripts que usan los datos -->
<script src="../js/index-script.js?v=2025102304"></script>
```

### ¿Por qué este orden?

- `mockups.js` define `USUARIOS_MOCK` como variable global
- `index-script.js` usa `USUARIOS_MOCK` para autenticación
- Si se invierte el orden, `USUARIOS_MOCK` será `undefined`

---

## 📊 Cálculos Dinámicos

Algunos valores se calculan automáticamente en tiempo de ejecución para mantener la consistencia:

### Avance Curricular
```javascript
progresoCurricular = semestresTotales > 0 
  ? Math.round((semestreActual / semestresTotales) * 100) 
  : 0;
```

**Ejemplos:**
- Nicolás: 7 / 10 = **70%**
- Branco: 6 / 10 = **60%**
- Maximiliano: 6 / 10 = **60%**

### Semestres Restantes
```javascript
semestresRestantes = Math.max(0, semestresTotales - semestreActual);
```

**Ejemplos:**
- Nicolás: 10 - 7 = **3 semestres**
- Branco: 10 - 6 = **4 semestres**
- Maximiliano: 10 - 6 = **4 semestres**

> ⚠️ **Importante:** No incluyas `progresoCurricular` en los datos de `mockups.js`. Se calcula automáticamente basándose en `semestreActual` y `semestresTotales`.

---

## ⚙️ Cómo Agregar Nuevos Usuarios

1. Abre `mockups.js`
2. Agrega un nuevo objeto al array `MOCK_USERS`:

```javascript
{
  id: 4,
  username: 'nuevo_usuario',
  email: 'nuevo.usuario@alumnos.ucn.cl',
  password: '123',
  firstName: 'Nuevo',
  lastName: 'Usuario',
  rut: 'XX.XXX.XXX-X',
  role: 'student',
  academicInfo: {
    career: 'Ingeniería Civil en Computación e Informática',
    generation: 2021,
    currentSemester: 5,
    totalSemesters: 10,
    gpa: 6.0,
    approvedCourses: 30,
    currentCourses: 7
    // ⚠️ NO incluir curriculumProgress - se calcula automáticamente (5/10 = 50%)
  }
}
```

3. Guarda el archivo
4. Recarga el navegador (Cmd+Shift+R)

---

## 🚨 Notas Importantes

- ⚠️ **Solo para desarrollo:** Los mockups son para testing local
- 🔒 **No usar en producción:** Las contraseñas están en texto plano
- 📝 **Sincronización:** Solo hay que modificar `mockups.js` (no JSON)
- ✅ **Centralizado:** Un solo lugar para gestionar usuarios de prueba
- 🔄 **Cache busting:** Usa parámetros de versión (?v=...) para forzar recarga

---

## 📚 Archivos Relacionados

- `../html/index.html` - Página de login
- `../html/main-menu.html` - Dashboard
- `../html/perfil-usuario.html` - Vista de perfil
- `../mockups json/login-mockups.json` - **DEPRECADO** (ya no se usa)

---

**Última actualización:** 23 de octubre de 2025  
**Versión del sistema:** 1.0.2  
**Mantenedores:** Nicolás Cordero, Branco Abalos, Maximiliano Urrutia
