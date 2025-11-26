# ⚙️ INSTALACIÓN Y CONFIGURACIÓN - RECUPERACIÓN DE CONTRASEÑA

## 🚀 PASOS PARA IMPLEMENTAR

### **PASO 1: Ejecutar la Migración de Base de Datos**

**Importante:** Antes de usar el sistema de recuperación de contraseña, debes agregar los campos necesarios a la tabla `usuarios`.

**Opción A: phpMyAdmin (Recomendado)**

1. Abre tu navegador → `http://localhost/phpmyadmin/`
2. Selecciona la base de datos `afergolf_db` en el panel izquierdo
3. Haz clic en la pestaña **"SQL"**
4. Copia y pega este código:

```sql
ALTER TABLE usuarios 
ADD COLUMN recovery_token VARCHAR(64) DEFAULT NULL,
ADD COLUMN token_expires_at TIMESTAMP DEFAULT NULL;

ALTER TABLE usuarios 
ADD INDEX idx_recovery_token (recovery_token);
```

5. Haz clic en **"Ejecutar"** (botón azul)
6. Deberías ver el mensaje: "Consulta ejecutada correctamente"

**Opción B: Línea de comando (CMD/PowerShell)**

```powershell
cd C:\xampp\mysql\bin
mysql -u root -p afergolf_db < "C:\xampp\htdocs\AFERGOLF\back\migrations\add_recovery_fields.sql"
```

---

### **PASO 2: Verificar que los Archivos Están en Lugar**

Verifica que existan estos archivos:

**Frontend JS:**
```
✅ C:\xampp\htdocs\AFERGOLF\front\assets\js\ajax\recover_password.js
✅ C:\xampp\htdocs\AFERGOLF\front\assets\js\ajax\change_password.js
```

**Backend PHP:**
```
✅ C:\xampp\htdocs\AFERGOLF\back\modules\users\api\recover_password.php
✅ C:\xampp\htdocs\AFERGOLF\back\modules\users\api\change_password.php
```

**HTML Views:**
```
✅ C:\xampp\htdocs\AFERGOLF\front\views\recover_password.html
✅ C:\xampp\htdocs\AFERGOLF\front\views\change_password.html
```

---

### **PASO 3: Verificar la Conexión a Base de Datos**

Verifica que `db_connect.php` esté configurado correctamente:

```php
// C:\xampp\htdocs\AFERGOLF\back\config\db_connect.php

<?php
$servername = "localhost";
$username = "root";
$password = "";  // Sin contraseña por defecto en XAMPP
$dbname = "afergolf_db";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}
?>
```

---

### **PASO 4: Configurar Email (IMPORTANTE)**

El sistema envía emails. Tienes dos opciones:

**Opción A: PHP Mail (Local, Simple)**
- Ya está configurado por defecto
- Usa la función `mail()` de PHP
- Solo funciona en servidores con SMTP configurado

**Opción B: SMTP (Producción, Recomendado)**
- Instala PHPMailer: `composer require phpmailer/phpmailer`
- O usa un servicio como SendGrid, Mailgun, etc.

Para desarrollo local, puedes usar **Mailtrap** o **MailHog** para capturar emails:

1. Descarga **MailHog**: https://github.com/mailhog/mailhog/releases
2. Ejecuta: `MailHog.exe`
3. Abre: `http://localhost:1025` (interfaz web)
4. Los emails se capturan automáticamente

---

### **PASO 5: Probar el Flujo Completo**

1. **Crea una cuenta** en `http://localhost/AFERGOLF/front/views/sign_up.html`
   - Nombre: Juan
   - Apellidos: Pérez
   - Correo: juan@example.com
   - Teléfono: 3134445196
   - Contraseña: Segura123!

2. **Inicia sesión** en `http://localhost/AFERGOLF/front/views/log_in.html`
   - Correo: juan@example.com
   - Contraseña: Segura123!

3. **Recupera contraseña:**
   - Haz clic en "¿Olvidaste tu contraseña?"
   - Ingresa: juan@example.com
   - Deberías ver: "Se ha enviado un enlace de recuperación a tu correo"

4. **Revisa el email** (en MailHog o tu cliente de email)
   - Busca el email de AFERGOLF
   - Haz clic en el enlace "Cambiar Contraseña"
   - Te llevará a `change_password.html?token=XXXXX`

5. **Cambia la contraseña:**
   - Ingresa nueva contraseña: NuevaSegura456!
   - Confirma: NuevaSegura456!
   - Haz clic en "Vamos"
   - Deberías ver: "Contraseña cambiada exitosamente"
   - Serás redirigido a login automáticamente

6. **Inicia sesión con la nueva contraseña:**
   - Correo: juan@example.com
   - Contraseña: NuevaSegura456!
   - ¡Deberías entrar! ✅

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### **Problema: "Unexpected token '<'"**

**Causa:** PHP está devolviendo HTML en lugar de JSON (error no capturado)

**Solución:**
1. Verifica que `db_connect.php` esté correcto
2. Verifica que la tabla `usuarios` exista
3. Verifica que los campos `recovery_token` y `token_expires_at` existan
4. Revisa los logs de Apache: `C:\xampp\apache\logs\error.log`

### **Problema: Email no se envía**

**Causa:** PHP Mail no está configurado

**Solución:**
1. Usa MailHog para desarrollo local
2. O configura SMTP en `php.ini`:
   ```
   SMTP = smtp.gmail.com
   smtp_port = 587
   ```
3. O usa PHPMailer con autenticación

### **Problema: Token expirado inmediatamente**

**Causa:** La zona horaria no es correcta

**Solución:**
1. En `recover_password.php`, agrega al inicio:
   ```php
   date_default_timezone_set('America/Bogota');
   ```

### **Problema: Usuario no encontrado**

**Causa:** El correo no existe en la BD

**Solución:**
1. Verifica que el usuario esté registrado
2. Verifica que el correo sea exacto (mayúsculas/minúsculas)
3. Revisa en phpMyAdmin la tabla `usuarios`

---

## 📋 CHECKLIST DE INSTALACIÓN

- [ ] Base de datos migrada (columnas `recovery_token`, `token_expires_at`)
- [ ] Archivos JS en `/front/assets/js/ajax/`
- [ ] Archivos PHP en `/back/modules/users/api/`
- [ ] HTML actualizado con referencias a JS
- [ ] Conexión a BD verificada
- [ ] Email configurado (MailHog o SMTP)
- [ ] Flujo completo probado

---

## 📞 CONTACTO

Si tienes problemas:

1. Revisa los logs: `C:\xampp\apache\logs\error.log`
2. Abre la consola del navegador (F12 → Console)
3. Verifica la pestaña Network para ver las respuestas del servidor

---

**Última actualización:** 25 de noviembre de 2025
