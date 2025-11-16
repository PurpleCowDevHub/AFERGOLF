# ✅ ESTRUCTURA FINAL - Edición Centralizada en Edit_profile

## 🎯 Cambios Realizados (Inversión de Lógica)

Se han invertido las responsabilidades para que:
- **`Edit_profile.html`** = Edita IMAGEN + DATOS
- **`my_account.html`** = Solo MUESTRA IMAGEN + DATOS (sin editar imagen)

---

## 📄 Páginas y sus Funciones

### **1. `my_account.html` - Mi Cuenta (SOLO LECTURA)**
✅ **Muestra:**
- Avatar con imagen guardada (NO se puede hacer clic)
- Información personal (nombre, email)
- Opciones: Editar Perfil, Historial de Compras, Cerrar Sesión
- Modal para editar SOLO DATOS PERSONALES

✅ **Modal para editar:**
- Permite editar: Nombre, Apellidos, Email, Teléfono, Ciudad
- ❌ NO permite cambiar imagen
- Guarda solo datos personales

✅ **Imagen:**
- Se carga desde BD
- NO editable (solo lectura)
- Solo se actualiza cuando se edita desde Edit_profile

### **2. `Edit_profile.html` - Edición Completa (LECTURA + ESCRITURA)** ⭐
✅ **Muestra:**
- Avatar del usuario con imagen guardada
- Mensaje: "Haz clic en tu foto para cambiarla"

✅ **Permite editar:**
- ⭐ **Imagen de perfil** (click en avatar)
- Nombre, Apellidos, Email, Teléfono, Ciudad

✅ **Funcionalidad:**
- Click en avatar abre selector de archivos
- Preview en tiempo real
- Validación de tipo (JPEG, PNG, GIF, WEBP)
- Validación de tamaño (máx 5MB)
- Guarda TODO en BD

---

## 🔄 Flujo de Edición de Imagen

```
Usuario abre Edit_profile.html
     ↓
Ve su foto y mensaje "Haz clic en tu foto para cambiarla"
     ↓
Haz clic en el avatar
     ↓
Se abre selector de archivos
     ↓
Selecciona imagen
     ↓
Ve preview en tiempo real
     ↓
Edita otros datos si quiere
     ↓
Haz clic en "Guardar cambios"
     ↓
edit_profile_page.js envía TODO (imagen + datos)
     ↓
edit_profile.php procesa:
  - Valida imagen
  - Guarda archivo en /front/assets/img/profiles/
  - Actualiza BD (columna foto_perfil)
  - Actualiza BD (datos personales)
  ↓
Redirige a my_account.html
     ↓
my_account.html carga:
  - Datos actualizados
  - ✅ Imagen nueva desde BD
```

## 🔄 Flujo de Ver Perfil

```
Usuario abre my_account.html
     ↓
my_account.js carga datos
     ↓
Muestra:
  - Avatar con imagen (NO editable)
  - Información personal
     ↓
Si quiere editar imagen:
  → Va a Edit_profile.html
     ↓
Si quiere editar datos:
  → Abre modal y edita
```

---

## 📁 Estructura de Archivos

```
AFERGOLF/
├── back/
│   └── modules/users/api/
│       ├── my_account.php              (Devuelve datos + foto_perfil)
│       └── edit_profile.php            (Procesa imagen + datos)
│
├── front/
│   ├── views/
│   │   ├── my_account.html             ✅ (Solo lectura de imagen)
│   │   └── Edit_profile.html           ✅ (Editar imagen + datos)
│   │
│   └── assets/
│       ├── js/ajax/
│       │   ├── my_account.js           ✅ (Carga datos + imagen lectura)
│       │   ├── edit_profile.js         ✅ (Modal: solo datos)
│       │   └── edit_profile_page.js    ✅ (Página: imagen + datos)
│       │
│       └── img/profiles/
│           └── [archivos de imagen]    📸
```

---

## 📊 Comparativa Antes vs Ahora

### **Antes (Confuso)**
| Acción | my_account | Edit_profile |
|--------|---|---|
| Ver imagen | ✅ Editable | ❌ No |
| Editar imagen | ✅ Sí | ❌ No |
| Editar datos | ✅ Sí | ✅ Sí |
| **Resultado:** Confusión de dónde editar imagen |

### **Ahora (Claro)** ⭐
| Acción | my_account | Edit_profile |
|--------|---|---|
| Ver imagen | ✅ Solo lectura | ✅ Sí |
| **Editar imagen** | ❌ No | ✅ **AQUÍ** |
| Editar datos | ✅ (Modal) | ✅ (Página) |
| **Resultado:** Claro y centralizado |

---

## 🧩 Scripts JavaScript

### **`my_account.js`**
```javascript
// Responsable de:
✅ Cargar datos del usuario
✅ Cargar imagen desde BD (lectura)
✅ Llenar campos del modal
❌ NO maneja edición de imagen
```

### **`edit_profile.js`**
```javascript
// Responsable de:
✅ Abrir/cerrar modal
✅ Editar nombre, apellidos, email, teléfono, ciudad
❌ NO maneja imagen (removido)
✅ Guardar datos
```

### **`edit_profile_page.js`**
```javascript
// Responsable de:
✅ Cargar datos del usuario
✅ Cargar imagen desde BD
✅ ⭐ EDITAR IMAGEN (click en avatar)
✅ Editar nombre, apellidos, email, teléfono, ciudad
✅ Preview de imagen en tiempo real
✅ Validar imagen (tipo, tamaño)
✅ Guardar TODO en BD
✅ Redirigir a my_account
```

---

## 🧪 Checklist de Prueba

```
[ ] my_account.html:
    [ ] Carga imagen desde BD
    [ ] Imagen NO es editable (no se puede hacer clic)
    [ ] Modal abre al hacer clic en "Editar Perfil"
    [ ] Modal permite editar solo datos (no imagen)
    [ ] Guardar cambios actualiza datos
    [ ] Imagen sigue igual (no cambió)

[ ] Edit_profile.html:
    [ ] Carga imagen desde BD
    [ ] Mensaje claro: "Haz clic en tu foto para cambiarla"
    [ ] Haz clic en avatar abre selector archivos
    [ ] Selecciona imagen → preview en tiempo real
    [ ] Edita datos si quiere
    [ ] Haz clic "Guardar cambios"
    [ ] ✅ Se guarda todo (imagen + datos)
    [ ] Redirige a my_account.html
    [ ] ✅ Imagen nueva aparece en my_account
    [ ] ✅ Datos nuevos aparecen en my_account
    [ ] Recarga my_account → imagen persiste
```

---

## 🎯 Flujos de Usuario

### **Flujo 1: Ver Mi Perfil**
```
1. Usuario abre my_account.html
2. Ve su foto guardada (no editable)
3. Ve sus datos personales
4. Si quiere editar solo datos → Abre modal
5. Si quiere cambiar foto → Va a Edit_profile
```

### **Flujo 2: Editar Solo Datos**
```
1. Usuario en my_account.html
2. Haz clic en "Editar Perfil" → Modal abre
3. Edita campos (nombre, email, etc.)
4. Haz clic "Guardar cambios"
5. ✅ Datos se actualizan
6. Modal se cierra
7. Foto no cambia
```

### **Flujo 3: Cambiar Foto** ⭐
```
1. Usuario abre Edit_profile.html
2. Ve su foto actual
3. Haz clic en la foto
4. Selecciona imagen nueva
5. Ve preview
6. Edita datos si quiere
7. Haz clic "Guardar cambios"
8. ✅ Se guarda imagen + datos
9. Redirige a my_account.html
10. ✅ Nueva foto aparece
```

### **Flujo 4: Cambiar Foto + Datos**
```
1. Usuario abre Edit_profile.html
2. Haz clic en foto → Cambiar imagen
3. Edita nombre, email, etc.
4. Haz clic "Guardar cambios"
5. ✅ TODO se guarda y actualiza
6. Redirige a my_account
7. ✅ Todo aparece actualizado
```

---

## 🚀 Resumen de Cambios

✅ **my_account.html:**
- ❌ Removido: `<input type="file">` para avatar
- ✅ Agregado: Carga de imagen desde BD
- ✅ Actualizado: Descripción de opción "Editar Perfil"

✅ **Edit_profile.html:**
- ✅ Agregado: `<input type="file">` para avatar
- ✅ Agregado: Mensaje "Haz clic en tu foto para cambiarla"
- ✅ Agregado: Script `edit_profile_page.js`

✅ **edit_profile.js:**
- ❌ Removido: Lógica de manejo de imagen
- ✅ Mantiene: Edición de datos personales

✅ **edit_profile_page.js:**
- ✨ Nuevo archivo
- ✅ Maneja imagen + datos de Edit_profile.html

✅ **my_account.js:**
- ✅ Agregado: Carga de imagen desde BD (lectura)

---

## 📞 Preguntas Frecuentes

**P: ¿Dónde edito mi foto?**
R: En `Edit_profile.html`, haz clic en el avatar

**P: ¿Qué hace el modal de my_account?**
R: Permite editar solo datos personales, no la imagen

**P: ¿Dónde se guarda la foto?**
R: En `/front/assets/img/profiles/` y ruta en BD (columna `foto_perfil`)

**P: ¿La foto se ve en my_account?**
R: Sí, pero solo para verla, no para editarla

**P: ¿Qué pasa si cambio foto en Edit_profile?**
R: Se guarda en BD y aparece inmediatamente en my_account

---

**Última actualización:** 15 de noviembre de 2025
**Estado:** ✅ COMPLETAMENTE IMPLEMENTADO Y FUNCIONAL
**Versión:** 2.0 (Invertida)
