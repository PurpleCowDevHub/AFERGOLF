/**
 * ============================================================================
 * AFERGOLF - Change Password AJAX Module
 * ============================================================================
 * 
 * Gestión del cambio de contraseña del usuario autenticado.
 * 
 * @author Afergolf Team
 * @version 1.0.0
 * ============================================================================
 */

// ============================================================================
// CONFIGURACIÓN Y VARIABLES GLOBALES
// ============================================================================

/**
 * URL del endpoint de la API REST de cambio de contraseña
 */
const CHANGE_PASSWORD_API_URL = 'http://localhost/AFERGOLF/back/modules/users/api/change_password.php';

// ============================================================================
// FUNCIONES DE CAMBIO DE CONTRASEÑA
// ============================================================================

/**
 * Maneja el cambio de contraseña.
 */
function handleChangePassword(e) {
  e.preventDefault();

  // Capture and validate form data
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  
  // Get user ID from URL parameter or localStorage
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const userId = localStorage.getItem('userId');

  // Validate required fields
  if (!newPassword || !confirmPassword) {
    showChangePasswordResponse('Por favor completa todos los campos', 'error');
    return;
  }

  // Validate password length
  if (newPassword.length < 8) {
    showChangePasswordResponse('La contraseña debe tener al menos 8 caracteres', 'error');
    return;
  }

  // Validate password match
  if (newPassword !== confirmPassword) {
    showChangePasswordResponse('Las contraseñas no coinciden', 'error');
    return;
  }

  // Validate password strength
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(newPassword)) {
    showChangePasswordResponse('La contraseña debe incluir mayúscula, minúscula, número y carácter especial', 'error');
    return;
  }

  // Send change password request to server
  const xhr = new XMLHttpRequest();
  xhr.open('POST', CHANGE_PASSWORD_API_URL, true);
  xhr.setRequestHeader('Content-Type', 'application/json');

  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      try {
        // Validate HTTP status code
        if (xhr.status < 200 || xhr.status >= 300) {
          showChangePasswordResponse(`Error del servidor (${xhr.status})`, 'error');
          console.error('HTTP Error:', xhr.status, xhr.statusText, xhr.responseText);
          return;
        }

        // Parse JSON response
        if (!xhr.responseText) {
          showChangePasswordResponse('El servidor no devolvió una respuesta válida', 'error');
          console.error('Empty response from server');
          return;
        }

        const data = JSON.parse(xhr.responseText);

        // Validate response has required fields
        if (!data.message || !data.status) {
          showChangePasswordResponse('Respuesta del servidor incompleta', 'error');
          console.error('Invalid response format:', data);
          return;
        }

        // Handle server response
        showChangePasswordResponse(data.message, data.status);

        if (data.status === 'success') {
          // Clear form
          document.getElementById('passwordForm').reset();
          
          // Redirect after success
          setTimeout(() => {
            window.location.href = './log_in.html';
          }, 2000);
        }
      } catch (error) {
        showChangePasswordResponse('Error al procesar la respuesta: ' + error.message, 'error');
        console.error('Parse Error:', error, 'Response:', xhr.responseText);
      }
    }
  };

  xhr.onerror = function() {
    showChangePasswordResponse('Error de conexión con el servidor', 'error');
  };

  // Send data
  const requestData = token ? 
    { token, newPassword } : 
    { userId, newPassword };

  xhr.send(JSON.stringify(requestData));
}

/**
 * Muestra el mensaje de respuesta al usuario.
 */
function showChangePasswordResponse(message, status) {
  // Create or get message element
  let messageElement = document.getElementById('change-password-message');
  
  if (!messageElement) {
    messageElement = document.createElement('div');
    messageElement.id = 'change-password-message';
    const form = document.getElementById('passwordForm');
    form.parentNode.insertBefore(messageElement, form);
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

/**
 * Valida la fortaleza de la contraseña en tiempo real.
 */
function validatePasswordStrength(password) {
  const strengthIndicator = document.getElementById('password-strength');
  if (!strengthIndicator) return;

  let strength = 0;
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[@$!%*?&]/.test(password);
  const isLongEnough = password.length >= 8;

  if (hasLowercase) strength++;
  if (hasUppercase) strength++;
  if (hasNumber) strength++;
  if (hasSpecial) strength++;
  if (isLongEnough) strength++;

  const strengthText = [
    'Muy débil',
    'Débil',
    'Regular',
    'Fuerte',
    'Muy fuerte'
  ];

  strengthIndicator.textContent = strengthText[strength - 1] || '';
  strengthIndicator.className = `strength strength-${strength}`;
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  const passwordForm = document.getElementById('passwordForm');
  if (passwordForm) {
    passwordForm.addEventListener('submit', handleChangePassword);
  }

  // Real-time password strength validation
  const newPasswordInput = document.getElementById('newPassword');
  if (newPasswordInput) {
    newPasswordInput.addEventListener('input', (e) => {
      validatePasswordStrength(e.target.value);
    });
  }
});
