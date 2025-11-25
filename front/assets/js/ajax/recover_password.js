/**
 * ============================================================================
 * AFERGOLF - Recover Password AJAX Module
 * ============================================================================
 * 
 * Gestión de recuperación de contraseña: envío de código de verificación.
 * 
 * @author Afergolf Team
 * @version 1.0.0
 * ============================================================================
 */

// ============================================================================
// CONFIGURACIÓN Y VARIABLES GLOBALES
// ============================================================================

/**
 * URL del endpoint de la API REST para recuperar contraseña
 */
const RECOVER_PASSWORD_API_URL = 'http://localhost/AFERGOLF/back/modules/users/api/recover_password.php';

// ============================================================================
// FUNCIONES DE RECUPERACIÓN
// ============================================================================

/**
 * Maneja el envío del correo o teléfono para recuperación de contraseña.
 */
function handleRecoverPassword(e) {
  e.preventDefault();

  // Capture and validate form data
  const recoveryContact = document.getElementById('recovery-contact').value.trim();

  // Validate required field
  if (!recoveryContact) {
    showRecoveryResponse('Por favor ingresa un correo o teléfono', 'error');
    return;
  }

  // Validate format: email or phone
  const isEmail = isValidEmail(recoveryContact);
  const isPhone = isValidPhone(recoveryContact);

  if (!isEmail && !isPhone) {
    showRecoveryResponse('Por favor ingresa un correo o teléfono válido', 'error');
    return;
  }

  // Send recovery request to server
  const xhr = new XMLHttpRequest();
  xhr.open('POST', RECOVER_PASSWORD_API_URL, true);
  xhr.setRequestHeader('Content-Type', 'application/json');

  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      try {
        // Validate HTTP status code first
        if (xhr.status < 200 || xhr.status >= 300) {
          showRecoveryResponse(`Error del servidor (${xhr.status}): ${xhr.statusText}`, 'error');
          console.error('HTTP Error:', xhr.status, xhr.statusText, xhr.responseText);
          return;
        }

        // Parse JSON response
        if (!xhr.responseText) {
          showRecoveryResponse('El servidor no devolvió una respuesta válida', 'error');
          console.error('Empty response from server');
          return;
        }

        const data = JSON.parse(xhr.responseText);
        
        // Validate response has required fields
        if (!data.message || !data.status) {
          showRecoveryResponse('Respuesta del servidor incompleta o inválida', 'error');
          console.error('Invalid response format:', data);
          return;
        }
        
        // Handle server response
        showRecoveryResponse(data.message, data.status);

        if (data.status === 'success') {
          // Guardar el correo/teléfono en sessionStorage para usarlo después
          sessionStorage.setItem('recoveryContact', recoveryContact);
          
          // Redirigir a la página de código de verificación después de 2 segundos
          setTimeout(() => {
            window.location.href = './recovery_code.html';
          }, 2000);
        }
      } catch (error) {
        showRecoveryResponse('Error al procesar la respuesta del servidor: ' + error.message, 'error');
        console.error('JSON Parse Error:', error, 'Response:', xhr.responseText);
      }
    }
  };

  xhr.onerror = function() {
    showRecoveryResponse('Error de conexión con el servidor', 'error');
  };

  xhr.send(JSON.stringify({ recoveryContact }));
}

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

/**
 * Valida el formato de un correo electrónico.
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida el formato de un teléfono.
 */
function isValidPhone(phone) {
  // Acepta teléfonos con solo números, espacios, guiones y paréntesis
  const phoneRegex = /^[0-9\s\-()]{10,20}$/;
  return phoneRegex.test(phone);
}

/**
 * Muestra el mensaje de respuesta en la página.
 */
function showRecoveryResponse(message, status) {
  const respuestaDiv = document.getElementById('respuesta') || createResponseDiv();
  respuestaDiv.textContent = message;
  respuestaDiv.className = `recovery-response ${status}`;
  respuestaDiv.style.display = 'block';

  // Auto-hide error messages after 5 seconds
  if (status === 'error') {
    setTimeout(() => {
      respuestaDiv.style.display = 'none';
    }, 5000);
  }
}

/**
 * Crea un div para mostrar respuestas si no existe.
 */
function createResponseDiv() {
  const respuestaDiv = document.createElement('span');
  respuestaDiv.id = 'respuesta';
  document.querySelector('.recovery-card').appendChild(respuestaDiv);
  return respuestaDiv;
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

/**
 * Configura los event listeners de recuperación de contraseña.
 */
function setupRecoverPasswordEventListeners() {
  const recoveryForm = document.getElementById('recoveryForm');
  if (recoveryForm) {
    recoveryForm.addEventListener('submit', handleRecoverPassword);
  }
}

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupRecoverPasswordEventListeners);
} else {
  setupRecoverPasswordEventListeners();
}
