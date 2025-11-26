# 🔑 FLUJO COMPLETO: RECUPERACIÓN Y CAMBIO DE CONTRASEÑA

## 📋 Resumen General

Este documento describe el flujo completo de recuperación y cambio de contraseña en AFERGOLF.

---

## 1️⃣ RECUPERAR CONTRASEÑA

```
┌─────────────────────────────────────────────────────────────────┐
│         FLUJO: RECUPERACIÓN DE CONTRASEÑA                        │
├─────────────────────────────────────────────────────────────────┤

📄 FRONTEND (HTML)
  └─ /front/views/recover_password.html
     │
     ├─ Elementos:
     │  ├─ <input id="recovery-contact"> → Email o teléfono
     │  └─ <button type="submit"> → Enviar solicitud
     │
     └─ Scripts cargados:
        └─ ../assets/js/ajax/recover_password.js ✅

🔗 INTERMEDIARIO (JAVASCRIPT - AJAX)
  └─ /front/assets/js/ajax/recover_password.js
     │
     ├─ Función: handleRecoverPassword(e)
     │
     ├─ Validaciones:
     │  ├─ Campo no vacío
     │  ├─ Es email o teléfono válido
     │  └─ Detecta tipo de entrada (email o teléfono)
     │
     └─ Envía POST a:
        └─ http://localhost/AFERGOLF/back/modules/users/api/recover_password.php
           
        Datos enviados:
        ├─ Si es email: { email: "usuario@gmail.com" }
        └─ Si es teléfono: { telefono: "3134445196" }

⚙️ BACKEND (PHP - API)
  └─ /back/modules/users/api/recover_password.php
     │
     ├─ Recibe: POST JSON (email O telefono)
     │
     ├─ Valida:
     │  ├─ Email o teléfono válido
     │  └─ Usuario existe en BD
     │
     ├─ Procesa:
     │  ├─ Genera token único: bin2hex(random_bytes(32))
     │  ├─ Expira en 1 hora
     │  ├─ Guarda en BD: usuarios.recovery_token
     │  ├─ Guarda expiración: usuarios.token_expires_at
     │  └─ Envía email con enlace de recuperación
     │
     └─ Email contiene:
        └─ Enlace: http://localhost/AFERGOLF/front/views/change_password.html?token=XXXXX

💾 BASE DE DATOS
  └─ UPDATE usuarios SET
     ├─ recovery_token = 'TOKEN_UNICO'
     ├─ token_expires_at = NOW() + 1 HOUR
     └─ WHERE email = ? OR telefono = ?

📨 EMAIL ENVIADO AL USUARIO
  └─ Asunto: "Recuperación de contraseña - AFERGOLF"
     │
     └─ Cuerpo:
        ├─ "Hemos recibido una solicitud para recuperar tu contraseña"
        ├─ Botón con enlace: change_password.html?token=XXXXX
        ├─ "Este enlace expirará en 1 hora"
        └─ "Si no solicitaste esto, ignora este correo"
```

**TABLA DE COMPONENTES:**
| Componente | Ruta | Función |
|-----------|------|---------|
| HTML | `/front/views/recover_password.html` | Formulario de recuperación |
| JS | `/front/assets/js/ajax/recover_password.js` | Valida y envía datos |
| PHP | `/back/modules/users/api/recover_password.php` | Genera token y envía email |
| BD | `usuarios.recovery_token`, `usuarios.token_expires_at` | Almacena token |

---

## 2️⃣ CAMBIAR CONTRASEÑA

```
┌─────────────────────────────────────────────────────────────────┐
│           FLUJO: CAMBIO DE CONTRASEÑA                            │
├─────────────────────────────────────────────────────────────────┤

📄 FRONTEND (HTML)
  └─ /front/views/change_password.html
     │
     ├─ Acceso:
     │  └─ URL con parámetro: ?token=XXXXX
     │  └─ O usuario autenticado: localStorage.userId
     │
     ├─ Elementos:
     │  ├─ <input id="newPassword"> → Nueva contraseña
     │  ├─ <input id="confirmPassword"> → Confirmar contraseña
     │  └─ <button type="submit"> → Cambiar contraseña
     │
     └─ Scripts cargados:
        └─ ../assets/js/ajax/change_password.js ✅

🔗 INTERMEDIARIO (JAVASCRIPT - AJAX)
  └─ /front/assets/js/ajax/change_password.js
     │
     ├─ Función: handleChangePassword(e)
     │
     ├─ Obtiene:
     │  ├─ Token de URL: ?token=XXXXX
     │  ├─ O userId de localStorage
     │  └─ Nueva contraseña
     │
     ├─ Validaciones:
     │  ├─ Campos no vacíos
     │  ├─ Longitud mínima 8 caracteres
     │  ├─ Las contraseñas coinciden
     │  └─ Cumple requisitos de seguridad:
     │     ├─ Al menos 1 mayúscula
     │     ├─ Al menos 1 minúscula
     │     ├─ Al menos 1 número
     │     └─ Al menos 1 carácter especial (@$!%*?&)
     │
     └─ Envía POST a:
        └─ http://localhost/AFERGOLF/back/modules/users/api/change_password.php
           
        Datos enviados (opción 1 - Por token):
        ├─ token: "TOKEN_DEL_URL"
        └─ newPassword: "NuevaContraseña123!"

        Datos enviados (opción 2 - Usuario autenticado):
        ├─ userId: ID_DEL_USUARIO
        └─ newPassword: "NuevaContraseña123!"

⚙️ BACKEND (PHP - API)
  └─ /back/modules/users/api/change_password.php
     │
     ├─ Recibe: POST JSON
     │
     ├─ Valida:
     │  ├─ Si usa token:
     │  │  ├─ Token existe
     │  │  └─ Token no ha expirado
     │  │
     │  ├─ Si usa userId:
     │  │  └─ Usuario existe
     │  │
     │  └─ Nueva contraseña:
     │     └─ Longitud mínima 8 caracteres
     │
     ├─ Procesa:
     │  ├─ Hash de contraseña: password_hash($password, PASSWORD_DEFAULT)
     │  ├─ UPDATE en BD
     │  ├─ Limpia recovery_token (NULL)
     │  └─ Limpia token_expires_at (NULL)
     │
     └─ Respuesta:
        ├─ Si OK: { status: "success", message: "Contraseña cambiada exitosamente" }
        └─ Si ERROR: { status: "error", message: "Token inválido o expirado" }

💾 BASE DE DATOS
  └─ UPDATE usuarios SET
     ├─ password = '$2y$10$...' (hash)
     ├─ recovery_token = NULL
     ├─ token_expires_at = NULL
     └─ WHERE id = ?

🔄 RESPUESTA EN FRONTEND
  └─ change_password.js procesa
     ├─ Si OK: 
     │  ├─ Muestra mensaje de éxito
     │  └─ Redirige a log_in.html en 2 segundos
     │
     └─ Si ERROR:
        └─ Muestra mensaje de error al usuario
```

**TABLA DE COMPONENTES:**
| Componente | Ruta | Función |
|-----------|------|---------|
| HTML | `/front/views/change_password.html` | Formulario de cambio |
| JS | `/front/assets/js/ajax/change_password.js` | Valida y envía datos |
| PHP | `/back/modules/users/api/change_password.php` | Actualiza contraseña |
| BD | `usuarios.password` | Almacena nuevo hash |

---

## 🔄 FLUJO COMPLETO DE USUARIO

```
1. Usuario en log_in.html
   ↓
2. Haz clic en "¿Olvidaste tu contraseña?"
   ↓
3. Llega a recover_password.html
   ↓
4. Ingresa correo o teléfono
   ↓
5. recover_password.js valida y envía a recover_password.php
   ↓
6. PHP busca usuario en BD
   ↓
7. PHP genera token y lo guarda en BD (válido 1 hora)
   ↓
8. PHP envía email con enlace: change_password.html?token=XXXXX
   ↓
9. Usuario abre correo y hace clic en enlace
   ↓
10. Llega a change_password.html con token en URL
    ↓
11. Usuario ingresa nueva contraseña
    ↓
12. change_password.js valida y envía a change_password.php
    ↓
13. PHP verifica token
    ↓
14. PHP hace hash de contraseña nueva
    ↓
15. PHP actualiza usuario en BD
    ↓
16. Usuario ve mensaje de éxito
    ↓
17. Usuario redirigido a log_in.html
    ↓
18. Usuario inicia sesión con nueva contraseña ✅
```

---

## 📊 MIGRATIONS REQUERIDAS

Ejecutar en phpMyAdmin:

```sql
-- Agregar columnas para recuperación de contraseña
ALTER TABLE usuarios 
ADD COLUMN recovery_token VARCHAR(64) DEFAULT NULL,
ADD COLUMN token_expires_at TIMESTAMP DEFAULT NULL;

-- Agregar índice para búsquedas rápidas
ALTER TABLE usuarios 
ADD INDEX idx_recovery_token (recovery_token);
```

---

## ⚙️ CONFIGURACIÓN IMPORTANTE

### Email (SMTP)
El servidor necesita capacidad para enviar emails. Las opciones son:

**Opción 1: PHP Mail (Simple, local)**
```php
// Ya está configurado en recover_password.php
mail($to, $subject, $htmlBody, $headers);
```

**Opción 2: SMTP (Recomendado para producción)**
```php
// Utilizar librería PHPMailer o SwiftMailer
// Configurar credenciales de SMTP
```

---

## 🛡️ SEGURIDAD

✅ **Implementado:**
- Tokens únicos de 64 caracteres (bin2hex(random_bytes(32)))
- Tokens válidos solo 1 hora
- Hash de contraseña con PASSWORD_DEFAULT
- Validación de fortaleza (mayúscula, minúscula, número, especial)
- Limpieza de tokens después de usar

⚠️ **Recomendaciones futuras:**
- HTTPS obligatorio en producción
- Rate limiting para intentos de recuperación
- Logs de auditoría
- Verificación adicional (2FA)

---

## 📝 ARCHIVO DE MIGRACIÓN

**Ubicación:** `/back/migrations/add_recovery_fields.sql`

**Contenido:**
```sql
ALTER TABLE usuarios 
ADD COLUMN recovery_token VARCHAR(64) DEFAULT NULL,
ADD COLUMN token_expires_at TIMESTAMP DEFAULT NULL;

ALTER TABLE usuarios 
ADD INDEX idx_recovery_token (recovery_token);
```

**Cómo ejecutar:**
1. Abre phpMyAdmin
2. Selecciona la BD `afergolf_db`
3. Ve a pestaña "SQL"
4. Copia y pega el contenido
5. Ejecuta

---

## 🗂️ ESTRUCTURA ACTUALIZADA

```
/front/views/
├── log_in.html              ✅
├── sign_up.html             ✅
├── recover_password.html    ✅
├── change_password.html     ✅
└── recovery_code.html       ❌ (NO NECESARIO - usar token en URL)

/front/assets/js/ajax/
├── log_in.js                ✅
├── sign_up_auth.js          ✅
├── recover_password.js      ✅ NUEVO
├── change_password.js       ✅ NUEVO
└── ...

/back/modules/users/api/
├── log_in.php               ✅
├── post/sign_up_registro.php ✅
├── recover_password.php     ✅ NUEVO
├── change_password.php      ✅ NUEVO
└── ...

/back/migrations/
└── add_recovery_fields.sql  ✅ NUEVO
```

---

**Última actualización:** 25 de noviembre de 2025
**Estado:** Implementación completa
