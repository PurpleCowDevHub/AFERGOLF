# AFERGOLF - Estructura de JavaScript

## 📁 Nueva Organización

La carpeta `front/assets/js/` ahora está organizada de forma modular y escalable:

```text
front/assets/js/
│
├── ajax/                        # 🔌 Conexiones al backend
│   ├── products.js              # CRUD de productos, renderizado y gestión
│   └── auth.js                  # Autenticación: login, logout, sesiones
│
├── ui/                          # 🎨 Interfaz y componentes visuales
│   ├── animations.js            # Carousel de productos con touch/swipe
│   └── components.js            # Modales, menú hamburguesa, alertas
│
├── utils/                       # 🛠️ Utilidades reutilizables
│   └── helpers.js               # Validaciones, formateo, localStorage, etc.
│
└── main.js                      # 🏠 Componentes web (header/footer)
```

## 📄 Descripción de Archivos

### `main.js`

- **Propósito**: Componentes web personalizados que se cargan en TODAS las páginas
- **Contiene**:
  - `AfergolfHeader` - Carga dinámica del header
  - `AfergolfFooter` - Carga dinámica del footer
- **Carga en**: Todas las páginas del sitio

### `ajax/products.js`

- **Propósito**: Gestión completa de productos (solo para admin dashboard)
- **Contiene**:
  - Array de productos (simulación de base de datos)
  - Funciones CRUD: crear, editar, eliminar, ver productos
  - Renderizado de tabla de productos
  - Búsqueda y filtrado
  - Gestión de imágenes
  - Recolección y validación de datos del formulario
- **Carga en**: `admin_dashboard.html`

### `ajax/auth.js`

- **Propósito**: Autenticación y gestión de sesiones
- **Contiene**:
  - `handleLogout()` - Cierre de sesión
  - `isAuthenticated()` - Verificación de sesión
  - `getCurrentUser()` - Datos del usuario actual
- **Carga en**: `admin_dashboard.html`

### `ui/animations.js`

- **Propósito**: Animaciones y efectos visuales
- **Contiene**:
  - `ProductsCarousel` - Clase para carousel de productos
  - Soporte para touch/swipe en móviles
  - Navegación por teclado (flechas)
  - Responsive automático
- **Carga en**: `index.html` (página principal)

### `ui/components.js`

- **Propósito**: Componentes de interfaz de usuario
- **Contiene**:
  - Control de modales (abrir/cerrar)
  - Menú hamburguesa
  - Modal de búsqueda
  - Campos dinámicos del formulario de productos
  - Vista previa de imágenes
  - Estados de formulario (habilitar/deshabilitar)
  - Sistema de notificaciones
- **Carga en**: Todas las páginas excepto admin_dashboard

### `utils/helpers.js`

- **Propósito**: Funciones auxiliares reutilizables
- **Contiene**:
  - **Formateo**: `formatPrice()`, `capitalizeFirst()`, `formatDate()`, etc.
  - **Validaciones**: `isValidEmail()`, `isValidPassword()`, `isValidPhone()`, etc.
  - **Texto**: `truncateText()`, `slugify()`, `cleanText()`
  - **Arrays**: `removeDuplicates()`, `sortByProperty()`, `groupBy()`
  - **Objetos**: `deepClone()`, `isEmptyObject()`
  - **LocalStorage**: `setLocalStorage()`, `getLocalStorage()`, etc.
  - **Rutas**: `getBasePrefix()`, `getRelativePath()`, `rewriteAbsoluteUrls()`
  - **Tiempo**: `delay()`, `debounce()`, `throttle()`
  - **DOM**: `$()`, `$$()`, `createElement()`
- **Carga en**: `admin_dashboard.html`

## 🔗 Referencias en HTML

### Páginas Generales

```html
<script src="../assets/js/main.js" defer></script>
<script src="../assets/js/ui/components.js" defer></script>
```

### Página Principal (index.html)

```html
<script src="front/assets/js/main.js" defer></script>
<script src="front/assets/js/ui/components.js" defer></script>
<script src="front/assets/js/ui/animations.js" defer></script>
```

### Admin Dashboard

```html
<script src="../assets/js/utils/helpers.js" defer></script>
<script src="../assets/js/ui/components.js" defer></script>
<script src="../assets/js/ajax/products.js" defer></script>
<script src="../assets/js/ajax/auth.js" defer></script>
```

## 📝 Notas Importantes

- El atributo `defer` asegura que los scripts se ejecuten después del DOM
- Los módulos están diseñados para evitar conflictos de nombres
- Las funciones verifican la existencia de elementos antes de usarlos
- La inicialización es automática cuando se cargan los scripts

## 🚀 Para Desarrolladores

### Agregar Nueva Funcionalidad AJAX

Crea un nuevo archivo en `ajax/` siguiendo el patrón de `products.js`

### Agregar Nuevo Componente UI

Agrega funciones a `ui/components.js` o crea un nuevo archivo en `ui/`

### Agregar Nueva Utilidad

Agrega funciones al objeto `AfergolfHelpers` en `utils/helpers.js`

---

**Fecha de reorganización**: Noviembre 2025  
**Versión**: 1.0.0
