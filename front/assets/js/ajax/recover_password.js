/**
 * ============================================================================
 * AFERGOLF - Recover Password AJAX Module
 * ============================================================================
 * 
 * Gestión de recuperación de contraseña: envío de código/email al usuario.
 * 
 * @author Afergolf Team
 * @version 1.0.0
 * ============================================================================
 */

// ============================================================================
// CONFIGURACIÓN Y VARIABLES GLOBALES
// ============================================================================

/**
 * URL del endpoint de la API REST de recuperación de contraseña
 */
const RECOVER_PASSWORD_API_URL = 'http://localhost/AFERGOLF/back/modules/users/api/recover_password.php';

// ============================================================================
// FUNCIONES DE RECUPERACIÓN DE CONTRASEÑA
// ============================================================================

/**
 * Maneja el envío del formulario de recuperación de contraseña.
 */
function handleRecoverPassword(e) {
  e.preventDefault();

  // Capture and validate form data
  const recoveryContact = document.getElementById('recovery-contact').value.trim();

  // Validate required field
  if (!recoveryContact) {
    showRecoveryResponse('Por favor ingresa tu correo o teléfono', 'error');
    return;
  }

  // Determine if input is email or phone
  const isEmail = recoveryContact.includes('@');
  const isPhone = /^[0-9\s\-()]+$/.test(recoveryContact);

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
        // Validate HTTP status code
        if (xhr.status < 200 || xhr.status >= 300) {
          showRecoveryResponse(`Error del servidor (${xhr.status})`, 'error');
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
          showRecoveryResponse('Respuesta del servidor incompleta', 'error');
          console.error('Invalid response format:', data);
          return;
        }

        // Handle server response
        showRecoveryResponse(data.message, data.status);

        if (data.status === 'success') {
          // Clear form
          document.querySelector('.recovery-form').reset();
          
          // Redirect to email app (in real scenario, user would check email)
          setTimeout(() => {
            showRecoveryResponse('Revisa tu correo para el enlace de recuperación', 'success');
          }, 1000);
        }
      } catch (error) {
        showRecoveryResponse('Error al procesar la respuesta: ' + error.message, 'error');
        console.error('Parse Error:', error, 'Response:', xhr.responseText);
      }
    }
  };

  xhr.onerror = function() {
    showRecoveryResponse('Error de conexión con el servidor', 'error');
  };

  // Send data
  const data = isEmail ? 
    { email: recoveryContact } : 
    { telefono: recoveryContact };

  xhr.send(JSON.stringify(data));
}

/**
 * Muestra el mensaje de respuesta al usuario.
 */
function showRecoveryResponse(message, status) {
  // Create or get message element
  let messageElement = document.getElementById('recovery-message');
  
  if (!messageElement) {
    messageElement = document.createElement('div');
    messageElement.id = 'recovery-message';
    const form = document.querySelector('.recovery-form');
    form.parentNode.insertBefore(messageElement, form.nextSibling);
  }

  messageElement.textContent = message;
  messageElement.className = `message-box ${status}`;
  messageElement.style.display = 'block';

  // Auto-hide error messages
  if (status === 'error') {
    setTimeout(() => {
      messageElement.style.display = 'none';
    }, 5000);
  }
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  const recoveryForm = document.getElementById('recoveryForm');
  if (recoveryForm) {
    recoveryForm.addEventListener('submit', handleRecoverPassword);
  }
});
