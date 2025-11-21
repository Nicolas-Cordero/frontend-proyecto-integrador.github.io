# 📁 JavaScript - Estructura de Archivos

Esta carpeta contiene todos los archivos JavaScript del proyecto PredictClass.

## 📄 Archivos

### `mockups.js` (ARCHIVADO)
**El archivo de mockups fue archivado en** `js/legacy/mockups.js`.

- **Propósito:** Datos de prueba para desarrollo local (archivado).
- **Ubicación actual:** `js/legacy/mockups.js`
- **Nota:** El proyecto ya no carga `mockups.js` por defecto; las llamadas de login usan la API real y el fallback a mocks se eliminó. Si necesitas los datos de prueba en desarrollo, copia `js/legacy/mockups.js` a `js/mockups.js` temporalmente.

---


### `index-script.js`
**Script principal del sistema de login.**

- **Propósito:** Manejo de autenticación y validación de formularios
- **Clase principal:** `LoginApp`
- **Dependencias:** Usa el endpoint de login (puclaro). No depende de `mockups.js` en runtime — el fallback a mocks fue retirado.
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
- **Dependencias:** No requiere `mockups.js`. Lee la sesión desde `sessionStorage` (clave `ucn_user_data`) para obtener info del usuario.
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

## 🔄 Orden de Carga (actualizado)

El proyecto ya no requiere incluir `mockups.js` por defecto. Carga los scripts principales así:

```html
<script src="../js/index-script.js?v=2025102304"></script>
<script src="../js/main-menu-script.js?v=2025102304"></script>
```

Si necesitas usar datos de prueba locales en desarrollo, crea una copia de `js/legacy/mockups.js` como `js/mockups.js` y cárgala antes de `index-script.js`.

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
