# 📋 GUÍA RÁPIDA: Activar Sistema de Fotos de Perfil

## ¿Qué cambios se hicieron?

Se implementó un **sistema completo de carga y almacenamiento de fotos de perfil** con:

✅ Upload de imágenes desde el modal de edición de perfil  
✅ Validación de tipos (JPEG, PNG, GIF, WEBP) y tamaño (máx 5MB)  
✅ Vista previa en tiempo real  
✅ Almacenamiento en base de datos  
✅ Persistencia de datos al recargar la página  

---

## 🚀 Activación Automática

El sistema está **configurado para activarse automáticamente** en tu primer upload de imagen:

1. Inicia sesión en `my_account`
2. Haz clic en tu avatar (foto de perfil)
3. Selecciona una imagen
4. Haz clic en "Guardar cambios"
5. El sistema creará automáticamente la columna `foto_perfil` en la base de datos

---

## ⚙️ Activación Manual (si prefieres)

Si quieres crear la columna de antemano, accede a:

**`http://localhost/AFERGOLF/back/migrations/`**

Esta página ejecutará automáticamente la migración y preparará la base de datos.

---

## 📁 Cambios Realizados

### Archivos Modificados:
- ✅ `edit_profile.php` - Ahora maneja upload de imágenes y crea la columna automáticamente
- ✅ `edit_profile.js` - Agregó validación y preview de imágenes
- ✅ `my_account.php` - Carga la foto de perfil desde BD
- ✅ `my_account.js` - Muestra la foto guardada al abrir la página
- ✅ `my_account.css` - Estilos del modal (ya reparado)

### Nuevos Archivos:
- ✅ `/back/migrations/index.html` - Página para ejecutar migraciones
- ✅ `/back/migrations/add_foto_perfil.php` - Script de migración
- ✅ `/front/assets/img/profiles/` - Directorio para almacenar fotos

---

## 🔍 Detalles Técnicos

**Tabla de base de datos:**
```sql
ALTER TABLE usuarios ADD COLUMN foto_perfil VARCHAR(255) NULL;
```

**Almacenamiento de archivos:**
- Ubicación: `/front/assets/img/profiles/`
- Nombre: `profile_{user_id}_{timestamp}.{extension}`
- Ejemplo: `profile_1_1730000000.jpg`

**Validaciones:**
- Tipos permitidos: JPEG, PNG, GIF, WEBP
- Tamaño máximo: 5 MB
- Validación en cliente y servidor

---

## 🧪 Cómo Probar

1. **Ingresa a tu cuenta**
   ```
   http://localhost/AFERGOLF/front/views/my_account.html
   ```

2. **Haz clic en tu avatar**
   - Se abrirá un selector de archivos

3. **Selecciona una imagen**
   - Verás una vista previa instantánea

4. **Haz clic en "Guardar cambios"**
   - La imagen se subirá y guardará

5. **Recarga la página**
   - Tu imagen de perfil debe cargarse desde la base de datos

---

## 🛠️ Solución de Problemas

### La imagen no se guarda
→ Accede a `http://localhost/AFERGOLF/back/migrations/` para crear la columna

### Error al subir imagen
→ Verifica que:
- La imagen es JPEG, PNG, GIF o WEBP
- El tamaño es menor a 5MB
- El directorio `/front/assets/img/profiles/` existe y tiene permisos de escritura

### La imagen no carga al recargar
→ Abre la consola del navegador (F12) y verifica que:
- El servidor responde con la ruta `foto_perfil` en el JSON
- La ruta es relativa: `assets/img/profiles/profile_X_Y.jpg`

---

## 📚 Recursos

- Migración: `/back/migrations/README.md`
- Endpoint de perfil: `back/modules/users/api/edit_profile.php`
- Frontend: `front/assets/js/ajax/edit_profile.js`
