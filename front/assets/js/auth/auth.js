/**
 * ============================================================================
 * AFERGOLF - Módulo de Autenticación
 * ============================================================================
 * 
 * @description   Módulo para gestión de sesión y control de acceso.
 *                Los formularios de login/registro se manejan en pages/*.js
 * 
 * @file          front/assets/js/auth/auth.js
 * @author        Afergolf Team
 * @version       2.1.0
 * @since         2025-01-01
 * 
 * ============================================================================
 * ÍNDICE DE CONTENIDO
 * ============================================================================
 * 
 * 1. CONSTANTES Y CONFIGURACIÓN
 *    - STORAGE_KEYS: Claves de localStorage
 *    - PROTECTED_PAGES: Páginas que requieren autenticación
 * 
 * 2. FUNCIONES DE SESIÓN
 *    - isAuthenticated(): Verifica si el usuario está autenticado
 *    - getCurrentUser(): Obtiene datos del usuario actual
 *    - getUserId(): Obtiene el ID del usuario actual
 *    - getUserEmail(): Obtiene el email del usuario actual
 * 
 * 3. FUNCIONES DE SESIÓN (GUARDAR/LIMPIAR)
 *    - saveSession(): Guarda la sesión en localStorage
 *    - clearSession(): Limpia todos los datos de sesión
 * 
 * 4. FUNCIONES DE LOGOUT
 *    - handleLogout(): Cierra la sesión del usuario
 *    - showLogoutConfirmation(): Muestra modal de confirmación
 *    - closeLogoutConfirmation(): Cierra el modal
 * 
 * 5. CONTROL DE ACCESO
 *    - requireAuth(): Protege páginas que requieren autenticación
 *    - redirectIfAuthenticated(): Redirige si ya está autenticado
 *    - updateHeaderUI(): Actualiza la UI del header según sesión
 * 
 * 6. INICIALIZACIÓN
 *    - setupAuthEventListeners(): Configura event listeners
 *    - initAuth(): Inicializa el módulo de autenticación
 * 
 * ============================================================================
 * USO
 * ============================================================================
 * 
 * // Verificar autenticación
 * if (AfergolfAuth.isAuthenticated()) {
 *   const user = AfergolfAuth.getCurrentUser();
 * }
 * 
 * // Cerrar sesión
 * AfergolfAuth.handleLogout();
 * 
 * // Proteger una página
 * AfergolfAuth.requireAuth();
 * 
 * ============================================================================
 */

// ============================================================================
// 1. CONSTANTES Y CONFIGURACIÓN
// ============================================================================

/**
 * Claves utilizadas en localStorage para la sesión
 * @constant {Object}
 */
const STORAGE_KEYS = {
  LOGGED: 'afergolf_logged',
  USER_ID: 'afergolf_user_id',
  USER_EMAIL: 'afergolf_user_email',
  USER_DATA: 'user'
};

/**
 * Páginas que requieren autenticación para acceder
 * @constant {string[]}
 */
const PROTECTED_PAGES = [
  'my_account.html',
  'Edit_profile.html',
  'change_password.html',
  'Purchase_History.html',
  'cart.html'
];

/**
 * Páginas que requieren rol de administrador
 * @constant {string[]}
 */
const ADMIN_PAGES = [
  'admin_dashboard.html'
];

/**
 * Páginas solo para usuarios no autenticados (login, registro)
 * @constant {string[]}
 */
const GUEST_ONLY_PAGES = [
  'log_in.html',
  'sign_up.html',
  'recover_password.html',
  'recovery_code.html'
];

// ============================================================================
// 2. FUNCIONES DE SESIÓN
// ============================================================================

/**
 * Verifica si el usuario está autenticado.
 * @returns {boolean} True si el usuario está autenticado
 */
function isAuthenticated() {
  const logged = localStorage.getItem(STORAGE_KEYS.LOGGED);
  const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
  return logged === 'true' && userId !== null && userId !== '';
}

/**
 * Obtiene los datos del usuario actual desde localStorage.
 * @returns {Object|null} Datos del usuario o null si no existe
 */
function getCurrentUser() {
  try {
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
}

/**
 * Obtiene el ID del usuario actual.
 * @returns {string|null} ID del usuario o null si no está autenticado
 */
function getUserId() {
  return localStorage.getItem(STORAGE_KEYS.USER_ID);
}

/**
 * Obtiene el email del usuario actual.
 * @returns {string|null} Email del usuario o null si no está autenticado
 */
function getUserEmail() {
  return localStorage.getItem(STORAGE_KEYS.USER_EMAIL);
}

/**
 * Verifica si el usuario actual es administrador.
 * @returns {boolean} True si el usuario tiene rol de admin
 */
function isAdmin() {
  const user = getCurrentUser();
  return user && user.rol === 'admin';
}

// ============================================================================
// 3. FUNCIONES DE SESIÓN (GUARDAR/LIMPIAR)
// ============================================================================

/**
 * Guarda los datos de sesión en localStorage.
 * @param {Object} user - Datos del usuario
 */
function saveSession(user) {
  localStorage.setItem(STORAGE_KEYS.LOGGED, 'true');
  localStorage.setItem(STORAGE_KEYS.USER_ID, user.id);
  localStorage.setItem(STORAGE_KEYS.USER_EMAIL, user.email);
  localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
}

// ============================================================================
// 4. FUNCIONES DE LOGOUT
// ============================================================================

/**
 * Cierra la sesión del usuario y redirige según su rol.
 * @param {boolean} [showMessage=true] - Mostrar mensaje de confirmación
 */
function handleLogout(showMessage = true) {
  // Verificar si es admin antes de limpiar la sesión
  const wasAdmin = isAdmin();
  
  // Limpiar todos los datos de sesión
  clearSession();
  
  if (showMessage && window.Toast) {
    Toast.success('Sesión cerrada correctamente');
  }
  
  // Redirigir según el rol
  setTimeout(() => {
    const currentPath = window.location.pathname;
    
    if (wasAdmin) {
      // Si era admin, llevarlo al login
      if (currentPath.includes('/front/views/')) {
        window.location.href = 'log_in.html';
      } else if (currentPath.includes('/views/')) {
        window.location.href = 'log_in.html';
      } else {
        window.location.href = 'front/views/log_in.html';
      }
    } else {
      // Si era usuario normal, llevarlo al inicio
      if (currentPath.includes('/front/views/')) {
        window.location.href = '../../index.html';
      } else if (currentPath.includes('/views/')) {
        window.location.href = '../index.html';
      } else {
        window.location.href = 'index.html';
      }
    }
  }, 500);
}

/**
 * Limpia todos los datos de sesión del localStorage.
 */
function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.LOGGED);
  localStorage.removeItem(STORAGE_KEYS.USER_ID);
  localStorage.removeItem(STORAGE_KEYS.USER_EMAIL);
  localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  
  // Actualizar el contador del carrito a 0 (el carrito del usuario sigue guardado)
  if (typeof updateCartCounter === 'function') {
    updateCartCounter();
  } else {
    // Fallback: actualizar directamente los elementos del contador
    const cartCountMobile = document.getElementById('cart-count-mobile');
    const cartCountDesktop = document.getElementById('cart-count-desktop');
    if (cartCountMobile) cartCountMobile.textContent = '0';
    if (cartCountDesktop) cartCountDesktop.textContent = '0';
  }
}

/**
 * Muestra el modal de confirmación de logout.
 */
function showLogoutConfirmation() {
  const logoutModal = document.getElementById('logout-modal');
  const logoutOverlay = document.getElementById('logout-overlay');
  
  if (logoutModal) {
    if (logoutOverlay) logoutOverlay.classList.add('active');
    logoutModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  } else {
    // Si no hay modal, preguntar directamente
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      handleLogout();
    }
  }
}

/**
 * Cierra el modal de confirmación de logout.
 */
function closeLogoutConfirmation() {
  const logoutModal = document.getElementById('logout-modal');
  const logoutOverlay = document.getElementById('logout-overlay');
  
  if (logoutModal) {
    logoutModal.classList.remove('active');
    if (logoutOverlay) logoutOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// ============================================================================
// 5. CONTROL DE ACCESO
// ============================================================================

/**
 * Protege una página que requiere autenticación de usuario normal.
 * Redirige al login si no está autenticado.
 * Redirige al admin_dashboard si es administrador.
 * @param {string} [redirectUrl='log_in.html'] - URL de redirección
 */
function requireAuth(redirectUrl = 'log_in.html') {
  if (!isAuthenticated()) {
    // Mostrar mensaje y redirigir al login
    if (window.Toast) {
      Toast.warning('Debes iniciar sesión para acceder a esta página');
    }
    setTimeout(() => {
      window.location.href = redirectUrl;
    }, 2000);
    return false;
  }
  
  // Si es admin, no puede acceder a páginas de usuario normal
  if (isAdmin()) {
    if (window.Toast) {
      Toast.info('Redirigiendo al panel de administración');
    }
    setTimeout(() => {
      window.location.href = 'admin_dashboard.html';
    }, 500);
    return false;
  }
  
  return true;
}

/**
 * Protege una página que requiere rol de administrador.
 * Redirige al inicio si el usuario no es admin.
 * @param {string} [redirectUrl='../../index.html'] - URL de redirección
 */
function requireAdmin(redirectUrl = '../../index.html') {
  if (!isAuthenticated()) {
    if (window.Toast) {
      Toast.warning('Debes iniciar sesión para acceder a esta página');
    }
    setTimeout(() => {
      window.location.href = 'log_in.html';
    }, 500);
    return false;
  }
  
  if (!isAdmin()) {
    if (window.Toast) {
      Toast.error('No tienes permisos de administrador');
    }
    setTimeout(() => {
      window.location.href = redirectUrl;
    }, 500);
    return false;
  }
  return true;
}

/**
 * Redirige al usuario si ya está autenticado.
 * Útil para páginas de login/registro.
 * Admins van al dashboard, usuarios normales a my_account.
 * @param {string} [redirectUrl='my_account.html'] - URL de redirección para usuarios
 */
function redirectIfAuthenticated(redirectUrl = 'my_account.html') {
  if (isAuthenticated()) {
    if (isAdmin()) {
      window.location.href = 'admin_dashboard.html';
    } else {
      window.location.href = redirectUrl;
    }
    return true;
  }
  return false;
}

/**
 * Actualiza la UI del header según el estado de autenticación.
 * Muestra/oculta botones de login/cuenta según corresponda.
 */
function updateHeaderUI() {
  const loginBtn = document.getElementById('login-btn') || document.querySelector('.login-btn');
  const accountBtn = document.getElementById('account-btn') || document.querySelector('.account-btn');
  const logoutBtn = document.getElementById('logout-btn') || document.querySelector('.logout-btn');
  
  const authenticated = isAuthenticated();
  
  if (loginBtn) {
    loginBtn.style.display = authenticated ? 'none' : 'flex';
  }
  
  if (accountBtn) {
    accountBtn.style.display = authenticated ? 'flex' : 'none';
  }
  
  if (logoutBtn) {
    logoutBtn.style.display = authenticated ? 'flex' : 'none';
  }
}

/**
 * Verifica el acceso a la página actual según su tipo.
 * Ejecutar al cargar cada página.
 */
function checkPageAccess() {
  const currentPage = window.location.pathname.split('/').pop();
  
  // Verificar páginas de administrador (primero, más restrictivo)
  if (ADMIN_PAGES.includes(currentPage)) {
    requireAdmin();
    return;
  }
  
  // Verificar páginas protegidas (solo usuarios normales)
  if (PROTECTED_PAGES.includes(currentPage)) {
    requireAuth(); // Esto ya redirige admins al dashboard
    return;
  }
  
  // Verificar páginas solo para invitados
  if (GUEST_ONLY_PAGES.includes(currentPage)) {
    redirectIfAuthenticated(); // Esto ya considera el rol
    return;
  }
}

// ============================================================================
// 6. UTILIDADES
// ============================================================================

/**
 * Valida el formato de un email.
 * @param {string} email - Email a validar
 * @returns {boolean} True si el formato es válido
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Muestra un mensaje de autenticación usando Toast o fallback.
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de mensaje (success, error, warning, info)
 */
function showAuthMessage(message, type = 'info') {
  if (window.Toast) {
    const toastMethod = Toast[type] || Toast.info;
    toastMethod(message);
  } else {
    alert(message);
  }
}

// ============================================================================
// 7. INICIALIZACIÓN Y EVENT LISTENERS
// ============================================================================

/**
 * Configura los event listeners de autenticación.
 * NOTA: Los formularios de login y registro se manejan en sus respectivos 
 * archivos de pages/ para evitar duplicación de eventos.
 */
function setupAuthEventListeners() {
  // Detectar si estamos en el panel de administración
  // En admin_dashboard, los eventos de logout se manejan en admin_delete.js
  const currentPage = window.location.pathname.split('/').pop();
  const isAdminPage = ADMIN_PAGES.includes(currentPage);
  
  // Si estamos en admin, no configurar los eventos de logout aquí
  // para evitar duplicación (admin_delete.js los maneja)
  if (isAdminPage) {
    return;
  }
  
  // Solo configurar logout - los formularios se manejan en pages/*.js
  
  // Botones de logout
  const logoutButtons = document.querySelectorAll('.logout-btn, #logout-btn, [data-action="logout"]');
  logoutButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      showLogoutConfirmation();
    });
  });
  
  // Cards de opción (my_account.html)
  const logoutCard = document.getElementById('logout-card');
  if (logoutCard) {
    logoutCard.addEventListener('click', (e) => {
      e.preventDefault();
      showLogoutConfirmation();
    });
  }
  
  // Confirmación de logout en modal
  const confirmLogoutBtn = document.getElementById('btn-confirm-logout');
  if (confirmLogoutBtn) {
    confirmLogoutBtn.addEventListener('click', () => {
      closeLogoutConfirmation();
      handleLogout();
    });
  }
  
  // Cancelar logout
  const cancelLogoutBtn = document.getElementById('btn-cancel-logout');
  if (cancelLogoutBtn) {
    cancelLogoutBtn.addEventListener('click', closeLogoutConfirmation);
  }
  
  // Cerrar modal al hacer click en el overlay
  const logoutOverlay = document.getElementById('logout-overlay');
  if (logoutOverlay) {
    logoutOverlay.addEventListener('click', closeLogoutConfirmation);
  }
  
  // Cerrar modal con tecla ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const logoutModal = document.getElementById('logout-modal');
      if (logoutModal && logoutModal.classList.contains('active')) {
        closeLogoutConfirmation();
      }
    }
  });
}

/**
 * Inicializa el módulo de autenticación.
 * Debe llamarse cuando el DOM esté listo.
 */
function initAuth() {
  // Verificar acceso a la página actual
  checkPageAccess();
  
  // Actualizar UI del header
  updateHeaderUI();
  
  // Configurar event listeners
  setupAuthEventListeners();
}

// ============================================================================
// EXPORTACIÓN DEL MÓDULO
// ============================================================================

/**
 * Objeto global con todas las funciones de autenticación.
 * Permite acceso desde otros módulos via window.AfergolfAuth
 */
const AfergolfAuth = {
  // Funciones de sesión
  isAuthenticated,
  isAdmin,
  getCurrentUser,
  getUserId,
  getUserEmail,
  saveSession,
  clearSession,
  
  // Funciones de logout
  handleLogout,
  showLogoutConfirmation,
  closeLogoutConfirmation,
  
  // Control de acceso
  requireAuth,
  requireAdmin,
  redirectIfAuthenticated,
  updateHeaderUI,
  checkPageAccess,
  
  // Utilidades
  isValidEmail,
  showAuthMessage,
  
  // Inicialización
  init: initAuth
};

// Exponer globalmente
if (typeof window !== 'undefined') {
  window.AfergolfAuth = AfergolfAuth;
  
  // También exponer funciones individuales para compatibilidad
  window.isAuthenticated = isAuthenticated;
  window.isAdmin = isAdmin;
  window.handleLogout = handleLogout;
  window.getCurrentUser = getCurrentUser;
}

// ============================================================================
// AUTO-INICIALIZACIÓN
// ============================================================================

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAuth);
} else {
  initAuth();
}
