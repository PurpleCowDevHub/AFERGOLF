/**
 * ============================================================================
 * AFERGOLF - Authentication AJAX Module
 * ============================================================================
 * 
 * Gestión de autenticación: login, logout, registro y sesiones.
 * 
 * @author Afergolf Team
 * @version 1.0.0
 * ============================================================================
 */

// ============================================================================
// FUNCIONES DE AUTENTICACIÓN
// ============================================================================

/**
 * Maneja el cierre de sesión del usuario.
 */
function handleLogout() {
  // Aquí iría la lógica de logout con el backend
  // Por ahora solo redirige al login
  window.location.href = '../views/log_in.html';
}

/**
 * Verifica si el usuario está autenticado.
 * @returns {boolean} True si está autenticado
 */
function isAuthenticated() {
  // Aquí iría la lógica de verificación de sesión
  // Por ahora retorna true (placeholder)
  return true;
}

/**
 * Obtiene los datos del usuario actual.
 * @returns {Object|null} Datos del usuario o null
 */
function getCurrentUser() {
  // Aquí iría la lógica para obtener datos del usuario
  // Por ahora retorna un objeto de ejemplo
  return {
    id: 1,
    name: 'Admin',
    email: 'admin@afergolf.com',
    role: 'admin'
  };
}

// ============================================================================
// EVENT LISTENERS DE AUTENTICACIÓN
// ============================================================================

/**
 * Configura los event listeners relacionados con autenticación.
 */
function setupAuthEventListeners() {
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      if (typeof openLogoutModal === 'function') {
        openLogoutModal();
      } else {
        handleLogout();
      }
    });
  }
  
  const btnConfirmLogout = document.getElementById('btn-confirm-logout');
  if (btnConfirmLogout) {
    btnConfirmLogout.addEventListener('click', handleLogout);
  }
}

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

// Auto-inicialización
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupAuthEventListeners);
} else {
  setupAuthEventListeners();
}
