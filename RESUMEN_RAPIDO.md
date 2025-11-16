# 🎯 RESUMEN RÁPIDO - CÓMO FUNCIONA EL SISTEMA

## 🔄 Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUJO COMPLETO DE AFERGOLF                   │
└─────────────────────────────────────────────────────────────────┘

1️⃣ REGISTRO (sign_up.html → auth.js → registro.php)
   ┌──────────────────────┐
   │ Usuario ingresa:     │
   │ - Nombre             │
   │ - Apellidos          │
   │ - Email              │
   │ - Contraseña         │
   └──────────────────────┘
            ↓
   ┌──────────────────────┐
   │ auth.js valida       │
   │ - Campos no vacíos   │
   │ - Email válido       │
   │ - Contraseñas iguales│
   └──────────────────────┘
            ↓
   ┌──────────────────────────────┐
   │ POST a registro.php          │
   │ {                            │
   │   nombre,                    │
   │   apellidos,                 │
   │   correo,                    │
   │   password                   │
   │ }                            │
   └──────────────────────────────┘
            ↓
   ┌──────────────────────────────┐
   │ registro.php valida          │
   │ - Email único                │
   │ - Hashea contraseña          │
   │ - Inserta en BD              │
   └──────────────────────────────┘
            ↓
   ✅ "Usuario registrado exitosamente"


2️⃣ LOGIN (log_in.html → log_in.js → log_in.php)
   ┌──────────────────────┐
   │ Usuario ingresa:     │
   │ - Email              │
   │ - Contraseña         │
   └──────────────────────┘
            ↓
   ┌──────────────────────┐
   │ log_in.js valida     │
   │ - Campos no vacíos   │
   │ - Email válido       │
   └──────────────────────┘
            ↓
   ┌──────────────────────────────┐
   │ POST a log_in.php            │
   │ {                            │
   │   email,                     │
   │   password                   │
   │ }                            │
   └──────────────────────────────┘
            ↓
   ┌──────────────────────────────┐
   │ log_in.php valida            │
   │ - Email existe               │
   │ - Contraseña correcta        │
   │ - Inicia sesión              │
   └──────────────────────────────┘
            ↓
   ┌──────────────────────────────┐
   │ log_in.js guarda en          │
   │ localStorage:                │
   │ - afergolf_logged = true     │
   │ - afergolf_user_id = 123     │
   │ - user = {...}               │
   └──────────────────────────────┘
            ↓
   ✅ Redirección a index.html


3️⃣ VER PERFIL (my_account.html → my_account.js → my_account.php)
   ┌──────────────────────┐
   │ Usuario hace clic    │
   │ en "Perfil"          │
   └──────────────────────┘
            ↓
   ┌──────────────────────────────┐
   │ my_account.js verifica:      │
   │ - afergolf_logged existe     │
   │ - afergolf_user_id existe    │
   │ Si no → Redirección a login  │
   └──────────────────────────────┘
            ↓
   ┌──────────────────────────────┐
   │ GET a my_account.php         │
   │ ?id=123                      │
   └──────────────────────────────┘
            ↓
   ┌──────────────────────────────┐
   │ my_account.php:              │
   │ - Busca usuario con ID 123   │
   │ - Retorna datos en JSON      │
   └──────────────────────────────┘
            ↓
   ┌──────────────────────────────┐
   │ my_account.js actualiza:     │
   │ - .user-name                 │
   │ - .user-email                │
   │ - Campos del formulario      │
   └──────────────────────────────┘
            ↓
   ✅ Página cargada con datos


4️⃣ EDITAR PERFIL (my_account.html → edit_profile.js → edit_profile.php) ✨ NUEVO
   ┌──────────────────────┐
   │ Usuario hace clic    │
   │ en "Editar Perfil"   │
   └──────────────────────┘
            ↓
   ┌──────────────────────────────┐
   │ edit_profile.js               │
   │ → openEditProfileModal()      │
   │ Modal se abre con datos       │
   │ precargados                   │
   └──────────────────────────────┘
            ↓
   ┌──────────────────────┐
   │ Usuario modifica:    │
   │ - Nombre             │
   │ - Apellidos          │
   │ - Email              │
   │ - Teléfono           │
   │ - Ciudad             │
   └──────────────────────┘
            ↓
   ┌──────────────────────┐
   │ Usuario hace clic    │
   │ "Guardar cambios"    │
   └──────────────────────┘
            ↓
   ┌──────────────────────────────┐
   │ edit_profile.js valida:      │
   │ - Campos requeridos          │
   │ - Email válido               │
   │ - Usuario logueado           │
   └──────────────────────────────┘
            ↓
   ┌──────────────────────────────┐
   │ POST a edit_profile.php      │
   │ {                            │
   │   id,                        │
   │   nombres,                   │
   │   apellidos,                 │
   │   email,                     │
   │   telefono,                  │
   │   ciudad                     │
   │ }                            │
   └──────────────────────────────┘
            ↓
   ┌──────────────────────────────┐
   │ edit_profile.php valida:     │
   │ - Campos requeridos          │
   │ - Email válido               │
   │ - Email no en uso            │
   │ - UPDATE en BD               │
   └──────────────────────────────┘
            ↓
   ┌──────────────────────────────┐
   │ edit_profile.js actualiza:   │
   │ - DOM (.user-name, etc)      │
   │ - localStorage               │
   │ - Mensaje de éxito           │
   │ - Cierra modal (1.5s)        │
   └──────────────────────────────┘
            ↓
   ✅ "Perfil actualizado correctamente"
```

---

## 📝 Código Clave Explicado

### Backend: edit_profile.php

```php
<?php
// 1. Recibir datos
$input = json_decode(file_get_contents("php://input"), true);
$user_id = $input['id'];
$nombres = $input['nombres'];
$apellidos = $input['apellidos'];
$email = $input['email'];
$telefono = $input['telefono'];
$ciudad = $input['ciudad'];

// 2. Validar
if (empty($nombres) || empty($apellidos) || empty($email)) {
    echo json_encode(["status" => "error", "message" => "Campos requeridos"]);
    exit;
}

// 3. Verificar email único
$stmt = $conn->prepare("SELECT COUNT(*) FROM usuarios WHERE email = ? AND id != ?");
$stmt->bind_param("si", $email, $user_id);
$stmt->execute();
$stmt->bind_result($count);
$stmt->fetch();
if ($count > 0) {
    echo json_encode(["status" => "error", "message" => "Email en uso"]);
    exit;
}

// 4. Actualizar BD
$stmt = $conn->prepare("UPDATE usuarios SET nombres = ?, apellidos = ?, email = ?, telefono = ?, ciudad = ? WHERE id = ?");
$stmt->bind_param("sssssi", $nombres, $apellidos, $email, $telefono, $ciudad, $user_id);

if ($stmt->execute()) {
    echo json_encode([
        "status" => "success",
        "message" => "Perfil actualizado correctamente",
        "user" => [
            "id" => $user_id,
            "nombres" => $nombres,
            "apellidos" => $apellidos,
            "email" => $email,
            "telefono" => $telefono,
            "ciudad" => $ciudad
        ]
    ]);
}
?>
```

---

### Frontend: edit_profile.js

```javascript
// 1. Abrir modal
function openEditProfileModal() {
  const modal = document.getElementById('edit-profile-modal');
  const overlay = document.getElementById('edit-profile-overlay');
  modal.style.display = 'flex';
  overlay.style.display = 'block';
}

// 2. Manejar envío
function handleEditProfile(e) {
  e.preventDefault();
  
  // Obtener datos del formulario
  const nombres = document.getElementById('firstName').value.trim();
  const apellidos = document.getElementById('lastName').value.trim();
  const email = document.getElementById('email').value.trim();
  const telefono = document.getElementById('phone').value.trim();
  const ciudad = document.getElementById('city').value.trim();
  
  // Validar
  if (!nombres || !apellidos || !email) {
    showEditProfileResponse('Campos requeridos', 'error');
    return;
  }
  
  // Obtener ID del usuario
  const userId = localStorage.getItem('afergolf_user_id');
  
  // 3. Enviar al backend
  const xhr = new XMLHttpRequest();
  xhr.open('POST', EDIT_PROFILE_API_URL, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
      const data = JSON.parse(xhr.responseText);
      
      if (data.status === 'success') {
        // 4. Actualizar DOM
        document.querySelector('.user-name').textContent = 
          `${data.user.nombres} ${data.user.apellidos}`;
        document.querySelector('.user-email').textContent = data.user.email;
        
        // 5. Actualizar localStorage
        let user = JSON.parse(localStorage.getItem('user') || '{}');
        user.nombres = data.user.nombres;
        user.apellidos = data.user.apellidos;
        user.email = data.user.email;
        localStorage.setItem('user', JSON.stringify(user));
        
        // 6. Mostrar éxito y cerrar
        showEditProfileResponse(data.message, 'success');
        setTimeout(() => closeEditProfileModal(), 1500);
      } else {
        showEditProfileResponse(data.message, 'error');
      }
    }
  };
  
  xhr.send(JSON.stringify({
    id: userId,
    nombres,
    apellidos,
    email,
    telefono,
    ciudad
  }));
}

// 7. Configurar event listeners
function setupEditProfileEventListeners() {
  document.getElementById('edit-profile-btn')
    .addEventListener('click', openEditProfileModal);
  
  document.getElementById('close-edit-profile')
    .addEventListener('click', closeEditProfileModal);
  
  document.querySelector('.profile-form')
    .addEventListener('submit', handleEditProfile);
}

// 8. Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupEditProfileEventListeners);
} else {
  setupEditProfileEventListeners();
}
```

---

## 🔑 Conceptos Clave

### localStorage
```javascript
// Guardar
localStorage.setItem('afergolf_user_id', '123');
localStorage.setItem('user', JSON.stringify({id: 123, ...}));

// Leer
const userId = localStorage.getItem('afergolf_user_id');
const user = JSON.parse(localStorage.getItem('user'));

// Borrar
localStorage.removeItem('afergolf_logged');
localStorage.clear(); // Borra todo
```

### XMLHttpRequest (Petición HTTP)
```javascript
const xhr = new XMLHttpRequest();

// Configurar
xhr.open('POST', 'http://localhost/api.php', true);
xhr.setRequestHeader('Content-Type', 'application/json');

// Escuchar respuesta
xhr.onreadystatechange = function() {
  if (xhr.readyState === 4) { // Completado
    if (xhr.status === 200) { // OK
      const data = JSON.parse(xhr.responseText);
      // Procesar datos
    }
  }
};

// Enviar
xhr.send(JSON.stringify({key: 'value'}));
```

### Prepared Statements (Seguridad)
```php
// INSEGURO (SQL Injection):
$sql = "SELECT * FROM usuarios WHERE email = '$email'";

// SEGURO (Prepared Statement):
$stmt = $conn->prepare("SELECT * FROM usuarios WHERE email = ?");
$stmt->bind_param("s", $email); // "s" = string
$stmt->execute();
$result = $stmt->get_result();
```

### Password Hashing
```php
// Crear (al registrar)
$hashed = password_hash($password, PASSWORD_DEFAULT);
// Resultado: $2y$10$... (bcrypt)

// Verificar (al login)
if (password_verify($password, $hashed)) {
    // Contraseña correcta
}
```

---

## 📊 Respuestas JSON

### Registro Exitoso
```json
{
  "status": "success",
  "message": "Usuario registrado exitosamente"
}
```

### Login Exitoso
```json
{
  "status": "success",
  "message": "Inicio de sesión exitoso",
  "user": {
    "id": 123,
    "nombres": "Juan",
    "apellidos": "Pérez",
    "email": "juan@ejemplo.com"
  }
}
```

### Perfil Cargado
```json
{
  "status": "success",
  "message": "Usuario encontrado",
  "user": {
    "id": 123,
    "nombres": "Juan",
    "apellidos": "Pérez",
    "email": "juan@ejemplo.com",
    "telefono": "+57 300 123 4567",
    "ciudad": "Medellín"
  }
}
```

### Perfil Actualizado
```json
{
  "status": "success",
  "message": "Perfil actualizado correctamente",
  "user": {
    "id": 123,
    "nombres": "Juan Carlos",
    "apellidos": "Pérez López",
    "email": "juan@ejemplo.com",
    "telefono": "+57 300 123 4567",
    "ciudad": "Bogotá"
  }
}
```

### Error
```json
{
  "status": "error",
  "message": "Descripción del error"
}
```

---

## 🛠️ Herramientas de Debugging

### 1. Consola del Navegador (F12)
```javascript
// Ver localStorage
console.log(localStorage);

// Ver JSON
console.log(JSON.parse(localStorage.getItem('user')));

// Ver errores
console.error('Mensaje de error');
```

### 2. Network Tab (F12 → Network)
- Busca solicitudes a `.php`
- Haz clic en la solicitud
- Pestaña "Preview" para ver respuesta JSON

### 3. phpMyAdmin
- Verificar que los datos se guardaron en la BD
- Verifica que la contraseña esté hasheada (comienza con $2y$)

---

## ✅ Checklist Rápido

Antes de producción:
- [ ] Database creada con tabla usuarios
- [ ] edit_profile.php creado
- [ ] edit_profile.js creado
- [ ] my_account.html incluye edit_profile.js
- [ ] my_account.css actualizado
- [ ] URLs de API correctas
- [ ] Prueba registro completo
- [ ] Prueba login completo
- [ ] Prueba edición de perfil
- [ ] Verifica que datos persistan

---

## 🎓 Para Aprender Más

**JavaScript**:
- MDN: XMLHttpRequest
- MDN: localStorage
- MDN: JSON

**PHP**:
- PHP Manual: prepared statements
- PHP Manual: password_hash
- PHP Manual: password_verify

**SQL**:
- UPDATE statement
- WHERE clause
- UNIQUE constraint

---

¡Listo! Ahora entiendes cómo funciona el sistema completo. 🎉
