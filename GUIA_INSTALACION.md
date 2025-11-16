# 🚀 GUÍA DE INSTALACIÓN Y CONFIGURACIÓN

## ✅ Pre-requisitos

Asegúrate de tener:
- ✅ XAMPP instalado y ejecutándose
- ✅ MySQL con la base de datos AFERGOLF
- ✅ Tabla `usuarios` creada en la base de datos
- ✅ Todos los archivos en la carpeta correcta: `C:\xampp\htdocs\AFERGOLF`

## 🗄️ Estructura de Base de Datos Requerida

### Tabla `usuarios`
```sql
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombres VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  telefono VARCHAR(20) DEFAULT NULL,
  ciudad VARCHAR(100) DEFAULT NULL,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Campos obligatorios**:
- `id`: Identificador único del usuario
- `nombres`: Nombre del usuario
- `apellidos`: Apellido(s) del usuario
- `email`: Correo electrónico (único)
- `password`: Contraseña hasheada

**Campos opcionales**:
- `telefono`: Número de teléfono
- `ciudad`: Ciudad del usuario

## 📂 Estructura de Carpetas Verificada

```
C:\xampp\htdocs\AFERGOLF\
│
├── front/
│   ├── views/
│   │   ├── sign_up.html              ✅
│   │   ├── log_in.html               ✅
│   │   └── my_account.html           ✅ (CON edit_profile.js)
│   │
│   └── assets/
│       ├── css/
│       │   └── pages/
│       │       ├── my_account.css    ✅ (ACTUALIZADO)
│       │
│       └── js/
│           └── ajax/
│               ├── auth.js            ✅
│               ├── log_in.js          ✅
│               ├── my_account.js      ✅
│               └── edit_profile.js    ✅ (NUEVO)
│
└── back/
    └── modules/
        └── users/
            └── api/
                ├── post/
                │   └── registro.php          ✅
                ├── log_in.php               ✅
                ├── my_account.php           ✅
                └── edit_profile.php         ✅ (NUEVO)
```

## ⚙️ Configuración de URLs

En los archivos JavaScript, verifica que las URLs sean correctas:

### En `auth.js` (línea 10)
```javascript
const API_URL = 'http://localhost/AFERGOLF/back/modules/users/api/post/registro.php';
```

### En `log_in.js` (línea 11)
```javascript
const LOGIN_API_URL = 'http://localhost/AFERGOLF/back/modules/users/api/log_in.php';
```

### En `edit_profile.js` (línea 10)
```javascript
const EDIT_PROFILE_API_URL = 'http://localhost/AFERGOLF/back/modules/users/api/edit_profile.php';
```

### En `my_account.js` (línea 18)
```javascript
const url = `http://localhost/AFERGOLF/back/modules/users/api/my_account.php?id=${userId}`;
```

---

**⚠️ Si tu servidor no está en `http://localhost`, reemplaza `localhost` con tu dominio.**

## 🔧 Configuración de la Base de Datos

### Archivo: `back/config/db_connect.php`

Asegúrate de que este archivo exista y tenga la configuración correcta:

```php
<?php
// Database configuration
$host = 'localhost';
$user = 'root';           // Usuario de MySQL
$password = '';           // Contraseña (por defecto vacía en XAMPP)
$database = 'AFERGOLF';   // Nombre de la base de datos

// Create connection
$conn = new mysqli($host, $user, $password, $database);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Set charset
$conn->set_charset("utf8");

?>
```

---

## 🚀 Pasos de Instalación

### Paso 1: Crear la Base de Datos

En phpMyAdmin:
1. Crear una nueva base de datos llamada `AFERGOLF`
2. Ejecutar el SQL anterior para crear la tabla `usuarios`

```sql
USE AFERGOLF;

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombres VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  telefono VARCHAR(20) DEFAULT NULL,
  ciudad VARCHAR(100) DEFAULT NULL,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Paso 2: Verificar Archivos Creados

Asegúrate de que estos archivos existan:
- [ ] `front/assets/js/ajax/edit_profile.js`
- [ ] `back/modules/users/api/edit_profile.php`

### Paso 3: Verificar Archivos Actualizados

Asegúrate de que estos archivos estén actualizados:
- [ ] `front/views/my_account.html` (debe incluir script edit_profile.js)
- [ ] `front/assets/css/pages/my_account.css` (debe tener estilos del modal)

### Paso 4: Iniciar XAMPP

1. Abre XAMPP Control Panel
2. Inicia Apache
3. Inicia MySQL

### Paso 5: Prueba

Abre el navegador y ve a: `http://localhost/AFERGOLF`

## ✨ Características Implementadas

### ✅ Registro de Usuario
- Validación de campos
- Email único
- Contraseña hasheada con password_hash()
- Base de datos actualizada

### ✅ Inicio de Sesión
- Validación de credenciales
- Sesión PHP iniciada
- localStorage actualizado
- Redirección a index.html

### ✅ Ver Perfil
- Protegido: requiere login
- Carga datos de la base de datos
- Muestra información del usuario
- Precarga datos en el modal

### ✅ Editar Perfil (NUEVO)
- Modal con interfaz amigable
- Validación en frontend
- Validación en backend
- Actualización en la base de datos
- Actualización en la página
- Actualización en localStorage
- Mensajes de éxito/error
- Cierre automático del modal

## 🧪 Prueba el Sistema Completo

### Test 1: Registrar Usuario
```
URL: http://localhost/AFERGOLF/front/views/sign_up.html

1. Completa el formulario:
   - Nombre: Juan
   - Apellidos: Pérez López
   - Correo: juan@ejemplo.com
   - Contraseña: MiPassword123
   - Confirmar: MiPassword123

2. Haz clic en "Registrarse"

Resultado esperado: "Usuario registrado exitosamente"
```

### Test 2: Iniciar Sesión
```
URL: http://localhost/AFERGOLF/front/views/log_in.html

1. Ingresa:
   - Correo: juan@ejemplo.com
   - Contraseña: MiPassword123

2. Haz clic en "Iniciar Sesión"

Resultado esperado: Redirección a index.html
Verificación: Abre Developer Tools → Application → localStorage
Debería tener: afergolf_logged, afergolf_user_id, user
```

### Test 3: Ver Perfil
```
URL: http://localhost/AFERGOLF/front/views/my_account.html

O desde index.html, haz clic en el botón "Perfil"

Resultado esperado:
- Página my_account se carga
- Tus datos (nombre, email) se muestran
- Aparecen 3 opciones: Editar Perfil, Historial de Compras, Cerrar Sesión
```

### Test 4: Editar Perfil (LA NUEVA FUNCIONALIDAD)
```
Desde my_account.html:

1. Haz clic en "Editar Perfil"

Resultado esperado:
- Modal se abre con transición suave
- Campos están precargados con tus datos:
  - Nombre: Juan
  - Apellidos: Pérez López
  - Correo: juan@ejemplo.com
  - Teléfono: (vacío)
  - Ciudad: (vacío)

2. Modifica los datos:
   - Nombre: Juan Carlos
   - Teléfono: +57 300 123 4567
   - Ciudad: Medellín

3. Haz clic en "Guardar cambios"

Resultado esperado:
- Mensaje verde: "Perfil actualizado correctamente"
- Modal se cierra automáticamente (1.5 segundos)
- En la página, tu nombre cambia a "Juan Carlos Pérez López"
- En localStorage, los datos se actualizan
- En la BD, se guardan los cambios

4. Recarga la página (F5)

Resultado esperado:
- Los cambios persisten
- Los datos son los nuevos
```

### Test 5: Manejo de Errores
```
1. Intenta cambiar el email a uno que ya existe
   - Resultado: Error "Este correo ya está registrado por otro usuario"

2. Intenta dejar vacío el campo de Nombre
   - Resultado: Error "Nombre, apellidos y correo son requeridos"

3. Intenta ingresar un email inválido
   - Resultado: Error "Por favor ingresa un correo válido"
```

## 🔍 Verificación en la Base de Datos

### En phpMyAdmin

1. Ve a la tabla `usuarios`
2. Haz clic en "Examinar"
3. Deberías ver:
   - Usuario registrado
   - Email único
   - Contraseña hasheada (comienza con $2y$)
   - Datos actualizados después de editar

## 📊 Monitoreo

### Consola del Navegador (F12)

Para ver los detalles de cada operación:

1. **Registro**: Abre Console
2. **Login**: Abre Console
3. **Cargar Perfil**: Abre Console → debería ver respuesta JSON
4. **Editar Perfil**: Abre Console → debería ver POST request y respuesta

### Network Tab

Para ver las solicitudes HTTP:

1. Abre DevTools → Network
2. Recarga la página
3. Busca solicitudes a:
   - `my_account.php` (GET - carga datos)
   - `edit_profile.php` (POST - guarda datos)

## 🆘 Solución de Problemas

### "El formulario no valida"
- Verifica que el archivo `edit_profile.js` esté incluido en `my_account.html`
- Verifica que los IDs de los inputs sean correctos

### "El modal no se abre"
- Verifica que el elemento con ID `edit-profile-modal` exista en `my_account.html`
- Verifica que el archivo CSS esté cargado correctamente

### "Los datos no se guardan"
- Abre Developer Tools → Network
- Intenta guardar cambios
- Verifica que la solicitud POST a `edit_profile.php` esté siendo enviada
- Verifica que recibas una respuesta JSON
- Revisa la consola para errores de JavaScript

### "El email no se puede cambiar"
- Verifica que la columna `email` en la BD tenga `UNIQUE`
- Asegúrate de que no haya duplicados en la base de datos

### "La contraseña no se puede cambiar"
- Esta funcionalidad NO está implementada en `edit_profile.php` (se supone que existe `change_password.html`)
- Los usuarios deben ir a "Ir a cambiar contraseña" para cambiarla

## 📞 Contacto

Si tienes problemas:
1. Revisa la consola del navegador (F12)
2. Revisa la pestaña Network (solicitudes HTTP)
3. Revisa el archivo de error de PHP
4. Verifica que XAMPP esté ejecutándose
5. Verifica que la base de datos exista y esté correctamente configurada

---

**✅ El sistema está listo para usar. ¡Felicidades!** 🎉
