# Documentación del Flujo de Editar Perfil - AFERGOLF

## Resumen General
Se ha implementado la funcionalidad completa de editar el perfil del usuario en la página `my_account.html`. El flujo permite al usuario cambiar su información personal (nombre, apellidos, correo, teléfono y ciudad) y guardarla tanto en la base de datos como en la interfaz.

---

## 📋 Archivos Creados

### 1. **Backend - `edit_profile.php`**
- **Ubicación**: `c:\xampp\htdocs\AFERGOLF\back\modules\users\api\edit_profile.php`
- **Tipo**: Endpoint API REST (método POST)
- **Funcionalidad**:
  - Recibe datos del usuario desde el frontend
  - Valida que los campos requeridos (nombre, apellidos, correo) no estén vacíos
  - Verifica que el email tenga formato válido
  - Comprueba que el email no esté siendo usado por otro usuario
  - Actualiza los datos en la base de datos
  - Retorna respuesta JSON con estado de éxito o error

### 2. **Frontend - `edit_profile.js`**
- **Ubicación**: `c:\xampp\htdocs\AFERGOLF\front\assets\js\ajax\edit_profile.js`
- **Tipo**: Módulo AJAX de gestión del modal
- **Funcionalidad**:
  - Abre/cierra el modal de edición de perfil
  - Valida el formulario antes de enviar
  - Envía los datos al backend mediante XMLHttpRequest
  - Actualiza la información mostrada en la página
  - Muestra mensajes de éxito o error
  - Cierra el modal automáticamente después de actualizar

---

## 🔄 Flujo Completo del Sistema

### 1️⃣ **REGISTRO (Sign Up)**
```
sign_up.html (formulario)
    ↓
auth.js (handleRegister)
    ↓
registro.php (crea usuario con contraseña hasheada)
    ↓
Base de Datos (tabla usuarios)
```

**Archivos involucrados**:
- Frontend: `sign_up.html`, `auth.js`
- Backend: `back/modules/users/api/post/registro.php`

---

### 2️⃣ **LOGIN (Iniciar Sesión)**
```
log_in.html (formulario)
    ↓
log_in.js (handleLogin)
    ↓
log_in.php (valida credenciales)
    ↓
localStorage (guarda: afergolf_logged, afergolf_user_id, user JSON)
    ↓
Redirección a index.html
```

**Archivos involucrados**:
- Frontend: `log_in.html`, `log_in.js`
- Backend: `back/modules/users/api/log_in.php`

---

### 3️⃣ **MI CUENTA (Ver Perfil)**
```
index.html → Clic en "Perfil"
    ↓
my_account.html (se abre)
    ↓
my_account.js (verifica login y carga datos)
    ↓
my_account.php (obtiene datos del usuario desde BD)
    ↓
Muestra datos en la página
```

**Archivos involucrados**:
- Frontend: `my_account.html`, `my_account.js`
- Backend: `back/modules/users/api/my_account.php`

---

### 4️⃣ **EDITAR PERFIL (NUEVO) ✨**
```
my_account.html → Clic en "Editar Perfil"
    ↓
edit_profile.js (openEditProfileModal)
    ↓
Modal se abre con datos precargados (del paso anterior)
    ↓
Usuario modifica campos (nombre, apellidos, correo, teléfono, ciudad)
    ↓
Clic en "Guardar cambios"
    ↓
edit_profile.js (handleEditProfile - valida)
    ↓
edit_profile.php (valida y actualiza BD)
    ↓
Respuesta exitosa:
    - Actualiza datos en la página
    - Actualiza localStorage
    - Muestra mensaje de éxito
    - Cierra modal automáticamente
```

**Archivos involucrados**:
- Frontend: `my_account.html`, `edit_profile.js`
- Backend: `back/modules/users/api/edit_profile.php`

---

## 📂 Estructura de Carpetas (Archivos Relacionados)

```
AFERGOLF/
│
├── front/
│   └── assets/
│       ├── css/
│       │   └── pages/
│       │       └── my_account.css ✏️ (actualizado con estilos del modal)
│       │
│       └── js/
│           └── ajax/
│               ├── auth.js (registro)
│               ├── log_in.js (login)
│               ├── my_account.js (carga perfil)
│               └── edit_profile.js ✨ (NUEVO - editar perfil)
│
├── back/
│   └── modules/
│       └── users/
│           └── api/
│               ├── post/
│               │   └── registro.php
│               ├── log_in.php
│               ├── my_account.php
│               └── edit_profile.php ✨ (NUEVO - actualizar perfil)
```

---

## 🔐 Validaciones Implementadas

### En `edit_profile.php` (Backend):
- ✅ Verifica que sea solicitud POST
- ✅ Valida que se envíe el ID del usuario
- ✅ Valida que los campos requeridos no estén vacíos
- ✅ Valida formato de email
- ✅ Verifica que el email no esté en uso por otro usuario
- ✅ Manejo seguro de errores con mensajes JSON

### En `edit_profile.js` (Frontend):
- ✅ Verifica que el usuario esté logueado
- ✅ Valida que los campos requeridos no estén vacíos
- ✅ Valida formato de email
- ✅ Manejo de errores de conexión
- ✅ Validación de respuesta del servidor

---

## 💾 Datos Almacenados

### En localStorage:
```javascript
{
  "afergolf_logged": "true",           // Indica si está logueado
  "afergolf_user_id": "123",          // ID del usuario
  "user": {                            // Datos del usuario
    "id": 123,
    "nombres": "Samuel",
    "apellidos": "Fernandez",
    "email": "samdezurrea@gmail.com"
  }
}
```

### En Base de Datos (tabla usuarios):
```
id | nombres | apellidos | email | password | telefono | ciudad
```

---

## 🎯 Flujo de Edición de Perfil Detallado

### Paso 1: Usuario abre modal
```javascript
// En my_account.html, usuario hace clic en "Editar Perfil"
// Dispara: edit_profile.js → openEditProfileModal()
```

### Paso 2: Modal se abre con datos precargados
```javascript
// my_account.js ya cargó los datos del usuario:
document.getElementById("firstName").value = user.nombres;
document.getElementById("lastName").value = user.apellidos;
document.getElementById("email").value = user.email;
document.getElementById("phone").value = user.telefono;
document.getElementById("city").value = user.ciudad;
```

### Paso 3: Usuario modifica y envía
```javascript
// Usuario modifica datos en el modal
// Hace clic en "Guardar cambios"
// Dispara: edit_profile.js → handleEditProfile()
```

### Paso 4: Validación y envío
```javascript
// edit_profile.js valida:
// - Campos requeridos no vacíos
// - Email válido
// - Usuario logueado

// Envía POST a edit_profile.php con:
{
  id: userId,
  nombres: "Nuevo Nombre",
  apellidos: "Nuevo Apellido",
  email: "nuevo@correo.com",
  telefono: "+57 300 000 0000",
  ciudad: "Bogotá"
}
```

### Paso 5: Actualización en base de datos
```php
// edit_profile.php:
// - Valida los datos nuevamente
// - Verifica que email no esté en uso
// - Ejecuta UPDATE en tabla usuarios
// - Retorna respuesta JSON
```

### Paso 6: Actualización en la página
```javascript
// Si respuesta es success:
// - Actualiza elementos DOM con nuevos datos
// - Actualiza localStorage
// - Muestra mensaje de éxito
// - Cierra modal automáticamente
```

---

## ⚙️ Configuración Necesaria

### Variables de Configuración
Asegúrate de que estas URLs sean correctas en los archivos JavaScript:

**En `log_in.js`:**
```javascript
const LOGIN_API_URL = 'http://localhost/AFERGOLF/back/modules/users/api/log_in.php';
```

**En `edit_profile.js`:**
```javascript
const EDIT_PROFILE_API_URL = 'http://localhost/AFERGOLF/back/modules/users/api/edit_profile.php';
```

### Base de Datos
Asegúrate de que la tabla `usuarios` tenga estas columnas:
```sql
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombres VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
  ciudad VARCHAR(100)
);
```

---

## 🧪 Pasos para Probar

1. **Crear usuario** (sign_up.html):
   - Completa el formulario de registro
   - Deberías ver el mensaje "Usuario registrado exitosamente"

2. **Iniciar sesión** (log_in.html):
   - Inicia sesión con las credenciales creadas
   - Deberías ser redirigido a index.html

3. **Ir a "Mi Cuenta"**:
   - Haz clic en el botón "Perfil" desde index.html
   - Deberías ver la página my_account.html con tus datos

4. **Editar perfil**:
   - Haz clic en "Editar Perfil"
   - El modal debería abrirse con tus datos precargados
   - Modifica al menos un campo
   - Haz clic en "Guardar cambios"
   - Deberías ver el mensaje "Perfil actualizado correctamente"
   - El modal se debería cerrar y los datos deberían actualizarse en la página

5. **Verificar persistencia**:
   - Recarga la página (F5)
   - Tus cambios deberían persistir
   - Los datos en localStorage deberían reflejar los cambios

---

## 📝 Notas Importantes

- ✅ Todos los archivos están nombrados con el mismo patrón: `edit_profile` (`.js` y `.php`)
- ✅ El archivo JS está en `front/assets/js/ajax/`
- ✅ El archivo PHP está en `back/modules/users/api/`
- ✅ El modal se abre y cierra suavemente con transiciones CSS
- ✅ Los mensajes de error/éxito se muestran claramente
- ✅ El formulario tiene validación tanto en frontend como en backend
- ✅ Los datos se actualizan en tiempo real en la página
- ✅ El localStorage se actualiza para mantener sincronización

---

## 🔧 Solución de Problemas

**El modal no se abre:**
- Verifica que `edit_profile.js` esté incluido en `my_account.html`
- Asegúrate de que el elemento con id `edit-profile-modal` existe

**Los datos no se guardan:**
- Revisa la consola del navegador para errores
- Verifica que la URL de la API sea correcta
- Asegúrate de que el usuario esté logueado (verifica localStorage)

**El email no se actualiza:**
- Verifica que la columna `email` en la BD tenga `UNIQUE`
- Asegúrate de que el email no esté siendo usado por otro usuario

---

## 📞 Soporte
Para cualquier problema, revisa:
1. Consola de JavaScript (F12)
2. Pestaña Network (verificar respuestas de API)
3. Validaciones en los archivos PHP y JS
