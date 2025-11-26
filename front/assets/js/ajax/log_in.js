/**
 * ============================================================================
 * AFERGOLF - Login AJAX Module
 * ============================================================================
 * 
 * Gestión de login: validación de credenciales y sesiones.
 * 
 * @author Afergolf Team
 * @version 1.0.0
 * ============================================================================
 */

// ============================================================================
// CONFIGURACIÓN Y VARIABLES GLOBALES
// ============================================================================

/**
 * URL del endpoint de la API REST de login
 */
const LOGIN_API_URL = 'http://localhost/AFERGOLF/back/modules/users/api/log_in.php';

// ============================================================================
// FUNCIONES DE LOGIN
// ============================================================================

/**
 * Maneja el login del usuario.
 */
function handleLogin(e) {
  e.preventDefault();

  // Capture and validate form data
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  // Validate required fields
  if (!email || !password) {
    showLoginResponse('Por favor completa todos los campos', 'error');
    return;
  }

  // Validate email format
  if (!isValidEmail(email)) {
    showLoginResponse('Por favor ingresa un correo válido', 'error');
    return;
  }

  // Send login request to server
  const xhr = new XMLHttpRequest();
  xhr.open('POST', LOGIN_API_URL, true);
  xhr.setRequestHeader('Content-Type', 'application/json');

  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      try {
        // Validate HTTP status code first
        if (xhr.status < 200 || xhr.status >= 300) {
          showLoginResponse(`Error del servidor (${xhr.status}): ${xhr.statusText}`, 'error');
          console.error('HTTP Error:', xhr.status, xhr.statusText, xhr.responseText);
          return;
        }

        // Parse JSON response
        if (!xhr.responseText) {
          showLoginResponse('El servidor no devolvió una respuesta válida', 'error');
          console.error('Empty response from server');
          return;
        }

        const data = JSON.parse(xhr.responseText);
        
        // Validate response has required fields
        if (!data.message || !data.status) {
          showLoginResponse('Respuesta del servidor incompleta o inválida', 'error');
          console.error('Invalid response format:', data);
          return;
        }
        
        // Handle server response
        showLoginResponse(data.message, data.status);

        if (data.status === 'success') {
          // Store user data in localStorage if provided
          if (data.user) {
            localStorage.setItem('user', JSON.stringify(data.user));
          }

          localStorage.setItem("afergolf_logged", "true");
          localStorage.setItem("afergolf_user_id", data.user.id);
          
          // Redirect to index
          setTimeout(() => window.location.href = '../../index.html', 1500);
        }
      } catch (error) {
        showLoginResponse('Error al procesar la respuesta del servidor: ' + error.message, 'error');
        console.error('JSON Parse Error:', error, 'Response:', xhr.responseText);
      }
    }
  };

  xhr.onerror = function() {
    showLoginResponse('Error de conexión con el servidor', 'error');
  };

  xhr.send(JSON.stringify({ email, password }));
}

/**
 * Valida el formato del email
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Muestra el mensaje de respuesta usando Toast notifications.
 */
function showLoginResponse(message, status) {
  console.log('showLoginResponse:', message, status, 'Toast:', typeof window.Toast);
  
  // Usar el sistema de Toast si está disponible
  if (typeof Toast !== 'undefined' && Toast) {
    if (status === 'success') {
      Toast.success(message);
    } else {
      Toast.error(message);
    }
  } else if (typeof window.Toast !== 'undefined' && window.Toast) {
    if (status === 'success') {
      window.Toast.success(message);
    } else {
      window.Toast.error(message);
    }
  } else {
    // Fallback al elemento de respuesta tradicional
    console.warn('Toast no disponible, usando fallback');
    const respuesta = document.getElementById('respuesta');
    if (respuesta) {
      respuesta.textContent = message;
      respuesta.className = status;
      respuesta.style.display = 'block';
      respuesta.style.padding = '12px';
      respuesta.style.marginTop = '15px';
      respuesta.style.borderRadius = '8px';
      respuesta.style.textAlign = 'center';
      respuesta.style.fontWeight = '500';
      if (status === 'success') {
        respuesta.style.background = '#f0fdf4';
        respuesta.style.color = '#166534';
        respuesta.style.border = '1px solid #22c55e';
      } else {
        respuesta.style.background = '#fef2f2';
        respuesta.style.color = '#991b1b';
        respuesta.style.border = '1px solid #ef4444';
      }
    }
  }
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

/**
 * Configura los event listeners de login.
 */
function setupLoginEventListeners() {
  const loginForm = document.querySelector('.login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
}

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupLoginEventListeners);
} else {
  setupLoginEventListeners();
}
