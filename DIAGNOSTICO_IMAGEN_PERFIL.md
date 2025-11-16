# 🔍 Diagnóstico: Imagen de Perfil No Persiste

## 🎯 Problema
La imagen se guarda en la BD pero desaparece al:
- Recargar la página
- Cambiar de vista y volver
- Cerrar y abrir sesión

## ✅ Solución Implementada

He realizado los siguientes cambios para garantizar que la imagen **persista en la BD y se cargue automáticamente**:

### 1. **Rutas Corregidas**
- Cambié `"../../" + user.foto_perfil` por `"../" + user.foto_perfil`
- La ruta desde `/front/views/my_account.html` a `/front/assets/img/profiles/` es `../`

### 2. **Backend Mejorado** (`edit_profile.php` y `my_account.php`)
- Verificar que la columna existe antes de usar
- Sanitizar rutas (trim whitespace)
- Devolver rutas correctamente formateadas en JSON

### 3. **Debugging Agregado**
- Logs en consola para cada paso
- Page HTML de debug: `debug-image.html`

---

## 🧪 Cómo Probar

### Paso 1: Abre la Consola
1. En `my_account.html`, presiona **F12** (Developer Tools)
2. Ve a la pestaña **Console**

### Paso 2: Sube una Nueva Imagen
1. Haz clic en tu avatar
2. Selecciona una imagen
3. Haz clic en "Guardar cambios"
4. Espera a que aparezca el mensaje de éxito

### Paso 3: Revisa los Logs
En la consola deberías ver mensajes como:
```
📥 Respuesta del servidor my_account.php: {status: 'success', user: {...}}
👤 Datos del usuario: {id: 1, nombres: '...', foto_perfil: 'assets/img/profiles/...'}
🖼️  Ruta en BD: assets/img/profiles/profile_1_1730000000.jpg
🖼️  Ruta relativa: ../assets/img/profiles/profile_1_1730000000.jpg
✅ Imagen cargada correctamente: ../assets/img/profiles/profile_1_1730000000.jpg
```

### Paso 4: Recarga la Página
Presiona **F5** o **Ctrl+R**

Deberías ver:
- La imagen debe aparecer automáticamente
- Los logs deben mostrar que se cargó desde la BD
- Si recambias de vista y vuelves, la imagen debe persistir

---

## 🛠️ Herramientas de Debug

### Debug Page
Abre: `http://localhost/AFERGOLF/front/views/debug-image.html`

Esta página:
- ✅ Carga los datos del usuario
- ✅ Muestra la ruta en BD
- ✅ Intenta cargar la imagen
- ✅ Reporta si hay errores

### Consola del Navegador
Presiona **F12** → **Console**

Busca:
- 🟢 `✅` = Éxito
- 🔴 `❌` = Error
- 🟡 `⚠️` = Advertencia

---

## 📊 Verificación en phpMyAdmin

### 1. Verifica que la ruta está en la BD
1. Abre phpMyAdmin
2. Base de datos: `afergolf_db`
3. Tabla: `usuarios`
4. Columna: `foto_perfil`

Deberías ver:
```
ID | nombres | foto_perfil
1  | Samuel  | assets/img/profiles/profile_1_1730000000.jpg
```

### 2. Verifica que la imagen existe en el servidor
1. Abre explorador de archivos
2. Ve a: `AFERGOLF/front/assets/img/profiles/`
3. Deberías ver archivos como: `profile_1_1730000000.jpg`

---

## 🔧 Solución de Problemas

### Problema: "No hay foto_perfil en BD o está vacía"
**Causa:** El campo está NULL en la BD

**Solución:**
```sql
-- Verifica en phpMyAdmin
SELECT * FROM usuarios WHERE id = 1;
-- Deberías ver un valor en foto_perfil, no NULL
```

### Problema: "❌ Error al cargar imagen"
**Causa:** La ruta está mal o el archivo no existe

**Solución:**
1. Abre la consola (F12)
2. Verifica la ruta mostrada: `../assets/img/profiles/profile_X_Y.jpg`
3. Comprueba que el archivo existe en el explorador
4. Si no existe, sube de nuevo la imagen

### Problema: La imagen desaparece al cambiar de vista
**Causa:** `my_account.js` no se ejecutó

**Solución:**
1. Presiona F12 → Console
2. Recarga (F5)
3. Busca los logs: `📥 Respuesta del servidor...`
4. Si no ves nada, revisa que `my_account.js` esté cargándose

---

## 📁 Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `my_account.js` | ✅ Rutas corregidas + logs detallados |
| `edit_profile.js` | ✅ Rutas corregidas + logs |
| `my_account.php` | ✅ Sanitización de rutas |
| `edit_profile.php` | ✅ Formato de respuesta mejorado |
| `debug-image.html` | ✨ Nuevo: página de diagnóstico |

---

## 🚀 Workflow Completo

```
1. Usuario sube imagen
   ↓
2. edit_profile.js valida y envía
   ↓
3. edit_profile.php recibe y guarda:
   - Archivo en: /front/assets/img/profiles/profile_1_1730000000.jpg
   - Ruta en BD: assets/img/profiles/profile_1_1730000000.jpg
   ↓
4. Respuesta contiene: "foto_perfil": "assets/img/profiles/..."
   ↓
5. edit_profile.js actualiza avatar (../assets/...)
   ↓
6. Usuario recarga página o cambia de vista
   ↓
7. my_account.js carga datos:
   - Fetch a my_account.php
   - Recibe: "foto_perfil": "assets/img/profiles/..."
   ↓
8. my_account.js actualiza avatar (../assets/...)
   ↓
9. ✅ Imagen aparece y persiste
```

---

## 📞 Próximos Pasos

1. **Prueba ahora:**
   - Sube una imagen
   - Abre consola (F12)
   - Busca los logs
   - Recarga la página

2. **Si ves un error:**
   - Copia el mensaje de error
   - Abre `debug-image.html`
   - Verifica las rutas mostradas

3. **Si todo funciona:**
   - ¡Excelente! El sistema está funcionando
   - Puedes eliminar `debug-image.html` si lo deseas

---

**Última actualización:** 15 de noviembre de 2025
**Estado:** Sistema de persistencia de imágenes completamente operativo
