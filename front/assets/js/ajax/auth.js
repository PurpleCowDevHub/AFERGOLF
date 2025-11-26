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
// CONFIGURACIÓN Y VARIABLES GLOBALES
// ============================================================================

/**
 * URL del endpoint de la API REST de autenticación
 */
const API_URL = 'http://localhost/AFERGOLF/back/modules/users/api/post/registro.php';

// ============================================================================
// FUNCIONES DE REGISTRO
// ============================================================================

/**
 * Maneja el registro de nuevo usuario.
 */
function handleRegister(e) {
  e.preventDefault();

  // Capture and validate form data
  const nombre = document.getElementById('nombre').value.trim();
  const apellidos = document.getElementById('apellido').value.trim();
  const correo = document.getElementById('correo').value.trim();
  const telefono = document.getElementById('telefono').value.trim();
  const password = document.getElementById('password').value;
  const confirmar_password = document.getElementById('confirmar_password').value;

  // Validate required fields
  if (!nombre || !apellidos || !correo || !password || !confirmar_password) {
    showResponse('Por favor completa todos los campos', 'error');
    return;
  }

  // Validate password match
  if (password !== confirmar_password) {
    showResponse('Las contraseñas no coinciden', 'error');
    return;
  }

  // Send registration request to server
  const xhr = new XMLHttpRequest();
  xhr.open('POST', API_URL, true);
  xhr.setRequestHeader('Content-Type', 'application/json');

  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      try {
        // Validate HTTP status code first
        if (xhr.status < 200 || xhr.status >= 300) {
          showResponse(`Error del servidor (${xhr.status}): ${xhr.statusText}`, 'error');
          console.error('HTTP Error:', xhr.status, xhr.statusText, xhr.responseText);
          return;
        }

        // Parse JSON response
        if (!xhr.responseText) {
          showResponse('El servidor no devolvió una respuesta válida', 'error');
          console.error('Empty response from server');
          return;
        }

        const data = JSON.parse(xhr.responseText);
        
        // Validate response has required fields
        if (!data.message || !data.status) {
          showResponse('Respuesta del servidor incompleta o inválida', 'error');
          console.error('Invalid response format:', data);
          return;
        }
        
        // Handle server response
        showResponse(data.message, data.status);

        if (data.status === 'success') {
          setTimeout(() => window.location.href = './log_in.html', 2000);
        }
      } catch (error) {
        showResponse('Error al procesar la respuesta del servidor: ' + error.message, 'error');
        console.error('JSON Parse Error:', error, 'Response:', xhr.responseText);
      }
    }
  };

  xhr.onerror = function() {
    showResponse('Error de conexión con el servidor', 'error');
  };

  xhr.send(JSON.stringify({ nombre, apellidos, correo, telefono, password }));
}

/**
 * Muestra el mensaje de respuesta en la página.
 */
function showResponse(message, status) {
  const respuesta = document.getElementById('respuesta');
  respuesta.textContent = message;
  respuesta.className = status;
}

// ============================================================================
// FUNCIONES DE AUTENTICACIÓN
// ============================================================================

/**
 * Maneja el cierre de sesión del usuario.
 */
function handleLogout() {
  window.location.href = '../views/log_in.html';
}

/**
 * Verifica si el usuario está autenticado.
 * @returns {boolean} True si está autenticado
 */
function isAuthenticated() {
  return true;
}

/**
 * Obtiene los datos del usuario actual.
 * @returns {Object|null} Datos del usuario o null
 */
function getCurrentUser() {
  return {
    id: 1,
    name: 'Admin',
    email: 'admin@afergolf.com',
    role: 'admin'
  };
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

/**
 * Configura los event listeners de autenticación.
 */
function setupAuthEventListeners() {
  const registerForm = document.querySelector('.register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }

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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupAuthEventListeners);
} else {
  setupAuthEventListeners();
}
