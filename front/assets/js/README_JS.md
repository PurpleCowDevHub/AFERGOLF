# AFERGOLF - Estructura de JavaScript

## 📁 Organización de la Carpeta JS

La carpeta `front/assets/js/` está organizada de forma modular y escalable siguiendo el principio de responsabilidad única:

```text
front/assets/js/
│
├── admin/                       # 🔧 Panel de Administración
│   ├── admin_create.js          # Crear productos
│   ├── admin_read.js            # Listar/leer productos
│   ├── admin_update.js          # Actualizar productos
│   └── admin_delete.js          # Eliminar productos
│
├── auth/                        # 🔐 Autenticación
│   └── auth.js                  # Login, logout, sesión, registro
│
├── pages/                       # 📄 Scripts específicos de cada página
│   ├── cart.js                  # Carrito de compras
│   ├── catalog.js               # Catálogo de productos
│   ├── change_password.js       # Cambio de contraseña
│   ├── edit_profile.js          # Edición de perfil (modal y página)
│   ├── login.js                 # Página de inicio de sesión
│   ├── my_account.js            # Mi cuenta
│   └── recover_password.js      # Recuperación de contraseña
│
├── ui/                          # 🎨 Componentes de interfaz
│   ├── animations.js            # Carousel y animaciones
│   ├── avatar_colors.js         # Colores dinámicos del avatar
│   ├── components.js            # Modales, menús, formularios
│   └── toast.js                 # Sistema de notificaciones
│
├── utils/                       # 🛠️ Utilidades reutilizables
│   └── helpers.js               # Validaciones, formateo, etc.
│
├── main.js                      # 🏠 Web Components (header/footer)
│
└── README.md                    # 📖 Esta documentación
```

---

## 📄 Descripción de Módulos

### `main.js` - Web Components

**Propósito**: Componentes web personalizados para cargar dinámicamente header y footer.

**Contiene**:

- `AfergolfHeader` - Carga dinámica del header desde partials
- `AfergolfFooter` - Carga dinámica del footer desde partials
- Reescritura de URLs para rutas relativas

**Carga en**: Todas las páginas del sitio

---

### `admin/` - Panel de Administración

Módulos separados para gestión CRUD de productos:

| Archivo | Propósito | Funciones principales |
|---------|-----------|----------------------|
| `admin_create.js` | Crear productos | `openCreateModal()`, `handleProductSubmit()`, `handleImageUpload()`, `formatBrand()`, `buildDimensionsString()` |
| `admin_read.js` | Listar productos | `loadProducts()`, `renderProductsTable()`, `viewProduct()`, `generateCategorySpecs()` |
| `admin_update.js` | Actualizar productos | `editProduct()`, `updateProduct()`, `loadProductIntoForm()`, `parseDimensionsToFields()` |
| `admin_delete.js` | Eliminar productos | `confirmDeleteProduct()`, `deleteProductConfirmed()` |

**Funciones de utilidad para productos:**

- `formatBrand(brand)`: Formatea la marca en Title Case (ej: "taylor made" → "Taylor Made")
- `buildDimensionsString(largoId, anchoId, altoId)`: Construye string de dimensiones desde campos separados
- `parseDimensionsToFields(dimensions, largoId, anchoId, altoId)`: Separa un string de dimensiones en campos individuales
- `generateCategorySpecs(producto)`: Genera HTML de especificaciones según categoría del producto

**Carga en**: `admin_dashboard.html`

---

### `auth/auth.js` - Autenticación Unificada

**Propósito**: Gestión completa de autenticación de usuarios.

**Contiene**:

- **Sesión**: `isAuthenticated()`, `getCurrentUser()`, `getUserId()`
- **Login**: `handleLogin()`, `saveSession()`
- **Logout**: `handleLogout()`, `clearSession()`, `showLogoutConfirmation()`
- **Registro**: `handleRegister()`, `validateRegistrationData()`
- **Control de acceso**: `requireAuth()`, `redirectIfAuthenticated()`, `updateHeaderUI()`

**Objeto global**: `window.AfergolfAuth`

**Carga en**: Todas las páginas

---

### `pages/` - Scripts de Páginas

| Archivo | Página | Funciones principales |
|---------|--------|----------------------|
| `cart.js` | `cart.html` | `addToCart()`, `removeFromCart()`, `updateCartCounter()` |
| `catalog.js` | `catalog.html` | `loadCatalogProducts()`, `filterProducts()`, `renderProducts()` |
| `change_password.js` | `change_password.html` | `handleChangePassword()`, `validatePasswordStrength()` |
| `edit_profile.js` | `Edit_profile.html`, `my_account.html` | `handleEditProfile()`, `openEditProfileModal()` |
| `login.js` | `log_in.html` | `handleLoginSubmit()`, `validateLoginForm()` |
| `my_account.js` | `my_account.html` | `loadUserProfile()`, `renderUserData()` |
| `recover_password.js` | `recover_password.html` | `handleRecoverPassword()`, `validateRecoveryForm()` |

---

### `ui/` - Componentes de Interfaz

| Archivo | Propósito |
|---------|-----------|
| `animations.js` | Carousel de productos con touch/swipe |
| `avatar_colors.js` | Extrae colores de imagen para avatar |
| `components.js` | Modales, menú hamburguesa, formularios dinámicos |
| `toast.js` | Sistema de notificaciones tipo toast |

---

### `utils/helpers.js` - Utilidades

**Propósito**: Funciones auxiliares reutilizables.

**Categorías**:

- **Formateo**: `formatPrice()`, `capitalizeFirst()`, `formatDate()`
- **Validaciones**: `isValidEmail()`, `isValidPassword()`, `isValidPhone()`
- **Texto**: `truncateText()`, `slugify()`, `cleanText()`
- **Arrays**: `removeDuplicates()`, `sortByProperty()`, `groupBy()`
- **Objetos**: `deepClone()`, `isEmptyObject()`
- **LocalStorage**: `setLocalStorage()`, `getLocalStorage()`
- **Rutas**: `getBasePrefix()`, `getRelativePath()`
- **Tiempo**: `delay()`, `debounce()`, `throttle()`
- **DOM**: `$()`, `$$()`, `createElement()`

**Objeto global**: `window.AfergolfHelpers`

---

## 🔗 Referencias en HTML

### Todas las páginas (mínimo)

```html
<script src="../assets/js/main.js" defer></script>
<script src="../assets/js/auth/auth.js" defer></script>
<script src="../assets/js/ui/toast.js" defer></script>
<script src="../assets/js/ui/components.js" defer></script>
```

### Página principal (index.html)

```html
<script src="front/assets/js/main.js" defer></script>
<script src="front/assets/js/auth/auth.js" defer></script>
<script src="front/assets/js/ui/toast.js" defer></script>
<script src="front/assets/js/ui/components.js" defer></script>
<script src="front/assets/js/ui/animations.js" defer></script>
```

### Catálogo (catalog.html)

```html
<script src="../assets/js/main.js" defer></script>
<script src="../assets/js/auth/auth.js" defer></script>
<script src="../assets/js/ui/toast.js" defer></script>
<script src="../assets/js/ui/components.js" defer></script>
<script src="../assets/js/pages/catalog.js" defer></script>
```

### Carrito (cart.html)

```html
<script src="../assets/js/main.js" defer></script>
<script src="../assets/js/auth/auth.js" defer></script>
<script src="../assets/js/ui/toast.js" defer></script>
<script src="../assets/js/ui/components.js" defer></script>
<script src="../assets/js/pages/cart.js" defer></script>
```

### Mi cuenta (my_account.html)

```html
<script src="../assets/js/main.js" defer></script>
<script src="../assets/js/auth/auth.js" defer></script>
<script src="../assets/js/ui/toast.js" defer></script>
<script src="../assets/js/ui/components.js" defer></script>
<script src="../assets/js/ui/avatar_colors.js" defer></script>
<script src="../assets/js/pages/my_account.js" defer></script>
<script src="../assets/js/pages/edit_profile.js" defer></script>
```

### Login (log_in.html)

```html
<script src="../assets/js/main.js" defer></script>
<script src="../assets/js/auth/auth.js" defer></script>
<script src="../assets/js/ui/toast.js" defer></script>
<script src="../assets/js/ui/components.js" defer></script>
<script src="../assets/js/pages/login.js" defer></script>
```

### Admin Dashboard (admin_dashboard.html)

```html
<script src="../assets/js/main.js" defer></script>
<script src="../assets/js/auth/auth.js" defer></script>
<script src="../assets/js/ui/toast.js" defer></script>
<script src="../assets/js/ui/components.js" defer></script>
<script src="../assets/js/utils/helpers.js" defer></script>
<script src="../assets/js/admin/admin_read.js" defer></script>
<script src="../assets/js/admin/admin_create.js" defer></script>
<script src="../assets/js/admin/admin_update.js" defer></script>
<script src="../assets/js/admin/admin_delete.js" defer></script>
```

---

## 📝 Convenciones de Código

### Estructura de cada archivo

```javascript
/**
 * ============================================================================
 * AFERGOLF - [Nombre del Módulo]
 * ============================================================================
 * 
 * @description   [Descripción breve]
 * @file          [Ruta del archivo]
 * @author        Afergolf Team
 * @version       1.0.0
 * 
 * ============================================================================
 * ÍNDICE DE CONTENIDO
 * ============================================================================
 * 
 * 1. CONSTANTES
 * 2. FUNCIONES PRINCIPALES
 * 3. FUNCIONES DE UI
 * 4. EVENT LISTENERS
 * 5. INICIALIZACIÓN
 * 
 * ============================================================================
 */

// 1. CONSTANTES
const API_URL = 'http://localhost/AFERGOLF/back/...';

// 2. FUNCIONES PRINCIPALES
function miFuncion() { ... }

// ... etc

// EXPORTACIÓN
if (typeof window !== 'undefined') {
  window.miFuncion = miFuncion;
}
```

### Nombrado

- **Funciones**: camelCase (`handleSubmit`, `loadProducts`)
- **Constantes**: UPPER_SNAKE_CASE (`API_URL`, `MAX_SIZE`)
- **Clases**: PascalCase (`ProductsCarousel`, `AfergolfAuth`)
- **Archivos**: snake_case (`admin_create.js`, `my_account.js`)

---

## 🚀 Para Desarrolladores

### Agregar nueva funcionalidad de página

1. Crea un archivo en `pages/` siguiendo la estructura documentada
2. Documenta el archivo con el header estándar
3. Exporta las funciones necesarias al objeto `window`
4. Actualiza esta documentación

### Agregar nuevo componente UI

1. Evalúa si debe ir en `components.js` o en un archivo separado
2. Si es complejo, crea un nuevo archivo en `ui/`
3. Documenta todas las funciones públicas

### Agregar nueva utilidad

1. Agrega la función al archivo `utils/helpers.js`
2. Agrégala al objeto `AfergolfHelpers`
3. Documenta con JSDoc

---

## 🔄 Historial de Cambios

| Fecha | Versión | Cambios |
|-------|---------|---------|
| 2025-01 | 2.0.0 | Reorganización completa: separación de admin en 4 módulos CRUD, consolidación de auth, creación de carpeta pages/ |
| 2024-11 | 1.0.0 | Estructura inicial con carpetas ajax/, ui/, utils/ |

---

**Última actualización**: Enero 2025  
**Versión**: 2.0.0
