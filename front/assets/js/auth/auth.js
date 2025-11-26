/**
 * ============================================================================
 * AFERGOLF - Módulo de Autenticación Unificado
 * ============================================================================
 * 
 * @description   Módulo consolidado para gestión de autenticación de usuarios.
 *                Incluye login, logout, registro, verificación de sesión y
 *                control de acceso a páginas protegidas.
 * 
 * @file          front/assets/js/auth/auth.js
 * @author        Afergolf Team
 * @version       2.0.0
 * @since         2025-01-01
 * 
 * ============================================================================
 * ÍNDICE DE CONTENIDO
 * ============================================================================
 * 
 * 1. CONSTANTES Y CONFIGURACIÓN
 *    - API_ENDPOINTS: URLs de los endpoints del backend
 *    - STORAGE_KEYS: Claves de localStorage
 *    - PROTECTED_PAGES: Páginas que requieren autenticación
 * 
 * 2. FUNCIONES DE SESIÓN
 *    - isAuthenticated(): Verifica si el usuario está autenticado
 *    - getCurrentUser(): Obtiene datos del usuario actual
 *    - getUserId(): Obtiene el ID del usuario actual
 *    - getUserEmail(): Obtiene el email del usuario actual
 * 
 * 3. FUNCIONES DE LOGIN
 *    - handleLogin(): Procesa el formulario de login
 *    - saveSession(): Guarda la sesión en localStorage
 * 
 * 4. FUNCIONES DE LOGOUT
 *    - handleLogout(): Cierra la sesión del usuario
 *    - clearSession(): Limpia todos los datos de sesión
 * 
 * 5. FUNCIONES DE REGISTRO
 *    - handleRegister(): Procesa el formulario de registro
 *    - validateRegistrationData(): Valida datos de registro
 * 
 * 6. CONTROL DE ACCESO
 *    - requireAuth(): Protege páginas que requieren autenticación
 *    - redirectIfAuthenticated(): Redirige si ya está autenticado
 *    - updateHeaderUI(): Actualiza la UI del header según sesión
 * 
 * 7. INICIALIZACIÓN
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
 *   console.log('Usuario:', user.nombres);
 * }
 * 
 * // Cerrar sesión
 * AfergolfAuth.handleLogout();
 * 
 * // Proteger una página
 * AfergolfAuth.requireAuth(); // Redirige a login si no está autenticado
 * 
 * ============================================================================
 * DEPENDENCIAS
 * ============================================================================
 * 
 * - Toast (opcional): Sistema de notificaciones
 * - LocalStorage: Almacenamiento de sesión
 * 
 * ============================================================================
 */

// ============================================================================
// 1. CONSTANTES Y CONFIGURACIÓN
// ============================================================================

/**
 * URLs de los endpoints de la API REST
 * @constant {Object}
 */
const API_ENDPOINTS = {
  LOGIN: 'http://localhost/AFERGOLF/back/modules/users/api/log_in.php',
  REGISTER: 'http://localhost/AFERGOLF/back/modules/users/api/register.php',
  LOGOUT: 'http://localhost/AFERGOLF/back/modules/users/api/auth.php',
  PROFILE: 'http://localhost/AFERGOLF/back/modules/users/api/my_account.php'
};

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

// ============================================================================
// 3. FUNCIONES DE LOGIN
// ============================================================================

/**
 * Procesa el formulario de inicio de sesión.
 * @param {Event} event - Evento submit del formulario
 */
async function handleLogin(event) {
  event.preventDefault();
  
  // IDs en el HTML de log_in.html son: email, password
  const email = document.getElementById('email')?.value.trim();
  const password = document.getElementById('password')?.value;
  
  // Validaciones básicas
  if (!email || !password) {
    showAuthMessage('Por favor completa todos los campos', 'error');
    return;
  }
  
  if (!isValidEmail(email)) {
    showAuthMessage('Por favor ingresa un correo válido', 'error');
    return;
  }
  
  try {
    const response = await fetch(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (data.status === 'success' && data.user) {
      // Guardar sesión
      saveSession(data.user);
      showAuthMessage('¡Inicio de sesión exitoso!', 'success');
      
      // Redirigir al inicio después de un breve delay
      setTimeout(() => {
        window.location.href = '../../index.html';
      }, 1000);
    } else {
      showAuthMessage(data.message || 'Error al iniciar sesión', 'error');
    }
  } catch (error) {
    console.error('Login error:', error);
    showAuthMessage('Error de conexión con el servidor', 'error');
  }
}

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
 * Cierra la sesión del usuario y redirige al inicio.
 * @param {boolean} [showMessage=true] - Mostrar mensaje de confirmación
 */
function handleLogout(showMessage = true) {
  // Limpiar todos los datos de sesión
  clearSession();
  
  if (showMessage && window.Toast) {
    Toast.success('Sesión cerrada correctamente');
  }
  
  // Redirigir al inicio
  setTimeout(() => {
    // Determinar la ruta correcta según ubicación actual
    const currentPath = window.location.pathname;
    if (currentPath.includes('/front/views/')) {
      // Desde front/views/ -> ir a la raíz
      window.location.href = '../../index.html';
    } else if (currentPath.includes('/views/')) {
      // Desde views/ directamente -> ir un nivel arriba
      window.location.href = '../index.html';
    } else {
      window.location.href = 'index.html';
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
// 5. FUNCIONES DE REGISTRO
// ============================================================================

/**
 * Procesa el formulario de registro de usuario.
 * @param {Event} event - Evento submit del formulario
 */
async function handleRegister(event) {
  event.preventDefault();
  
  // Capturar datos del formulario (IDs del HTML de sign_up.html)
  const formData = {
    nombres: document.getElementById('nombre')?.value.trim(),
    apellidos: document.getElementById('apellido')?.value.trim(),
    email: document.getElementById('correo')?.value.trim(),
    password: document.getElementById('password')?.value,
    confirmPassword: document.getElementById('confirmar_password')?.value
  };
  
  // Validar datos
  const validation = validateRegistrationData(formData);
  if (!validation.valid) {
    showAuthMessage(validation.message, 'error');
    return;
  }
  
  try {
    const response = await fetch(API_ENDPOINTS.REGISTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        email: formData.email,
        password: formData.password
      })
    });
    
    const data = await response.json();
    
    if (data.status === 'success') {
      showAuthMessage('¡Registro exitoso! Redirigiendo al login...', 'success');
      
      // Redirigir al login después de registro exitoso
      setTimeout(() => {
        window.location.href = 'log_in.html';
      }, 2000);
    } else {
      showAuthMessage(data.message || 'Error al registrar usuario', 'error');
    }
  } catch (error) {
    console.error('Registration error:', error);
    showAuthMessage('Error de conexión con el servidor', 'error');
  }
}

/**
 * Valida los datos del formulario de registro.
 * @param {Object} data - Datos del formulario
 * @returns {Object} Resultado de validación {valid: boolean, message: string}
 */
function validateRegistrationData(data) {
  if (!data.nombres || !data.apellidos || !data.email || !data.password) {
    return { valid: false, message: 'Por favor completa todos los campos requeridos' };
  }
  
  if (!isValidEmail(data.email)) {
    return { valid: false, message: 'Por favor ingresa un correo electrónico válido' };
  }
  
  if (data.password.length < 8) {
    return { valid: false, message: 'La contraseña debe tener al menos 8 caracteres' };
  }
  
  // Validar fortaleza de contraseña
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
  if (!passwordRegex.test(data.password)) {
    return { 
      valid: false, 
      message: 'La contraseña debe incluir mayúscula, minúscula, número y carácter especial (@$!%*?&#)' 
    };
  }
  
  if (data.password !== data.confirmPassword) {
    return { valid: false, message: 'Las contraseñas no coinciden' };
  }
  
  return { valid: true, message: '' };
}

// ============================================================================
// 6. CONTROL DE ACCESO
// ============================================================================

/**
 * Protege una página que requiere autenticación.
 * Redirige al login si el usuario no está autenticado.
 * @param {string} [redirectUrl='log_in.html'] - URL de redirección
 */
function requireAuth(redirectUrl = 'log_in.html') {
  if (!isAuthenticated()) {
    if (window.Toast) {
      Toast.warning('Debes iniciar sesión para acceder a esta página');
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
 * @param {string} [redirectUrl='my_account.html'] - URL de redirección
 */
function redirectIfAuthenticated(redirectUrl = 'my_account.html') {
  if (isAuthenticated()) {
    window.location.href = redirectUrl;
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
  
  // Verificar páginas protegidas
  if (PROTECTED_PAGES.includes(currentPage)) {
    requireAuth();
  }
  
  // Verificar páginas solo para invitados
  if (GUEST_ONLY_PAGES.includes(currentPage)) {
    redirectIfAuthenticated();
  }
}

// ============================================================================
// 7. UTILIDADES
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
    // Fallback a alert
    alert(message);
  }
}

// ============================================================================
// 8. INICIALIZACIÓN Y EVENT LISTENERS
// ============================================================================

/**
 * Configura los event listeners de autenticación.
 * NOTA: Los formularios de login y registro se manejan en sus respectivos 
 * archivos de pages/ para evitar duplicación de eventos.
 */
function setupAuthEventListeners() {
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
  
  console.log('✅ AfergolfAuth initialized');
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
  getCurrentUser,
  getUserId,
  getUserEmail,
  
  // Funciones de login/logout
  handleLogin,
  handleLogout,
  saveSession,
  clearSession,
  showLogoutConfirmation,
  closeLogoutConfirmation,
  
  // Funciones de registro
  handleRegister,
  validateRegistrationData,
  
  // Control de acceso
  requireAuth,
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
