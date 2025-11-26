/**
 * ============================================================================
 * AFERGOLF - Recover Password AJAX Module
 * ============================================================================
 * 
 * Restablecimiento de contraseña a partir de correo + nueva contraseña.
 * 
 * @author Afergolf Team
 * @version 1.0.0
 * ============================================================================
 */

const RECOVER_API_URL = 'http://localhost/AFERGOLF/back/modules/users/api/recover_password.php';

/**
 * Muestra mensaje de respuesta usando Toast notifications
 */
function showRecoveryResponse(message, status = 'error') {
  if (!message) return;
  
  // Usar el sistema de Toast si está disponible
  if (typeof Toast !== 'undefined' && Toast) {
    status === 'success' ? Toast.success(message) : Toast.error(message);
  } else if (typeof window.Toast !== 'undefined' && window.Toast) {
    status === 'success' ? window.Toast.success(message) : window.Toast.error(message);
  } else {
    // Fallback al elemento tradicional
    const responseEl = document.getElementById('recovery-response');
    if (responseEl) {
      responseEl.textContent = message;
      responseEl.style.display = 'block';
      responseEl.style.padding = '12px';
      responseEl.style.marginTop = '15px';
      responseEl.style.borderRadius = '8px';
      responseEl.style.textAlign = 'center';
      responseEl.style.fontWeight = '500';
      if (status === 'success') {
        responseEl.style.background = '#f0fdf4';
        responseEl.style.color = '#166534';
        responseEl.style.border = '1px solid #22c55e';
      } else {
        responseEl.style.background = '#fef2f2';
        responseEl.style.color = '#991b1b';
        responseEl.style.border = '1px solid #ef4444';
      }
    }
  }
}

/**
 * Limpia mensajes de error de los campos
 */
function clearFieldErrors() {
  const errorEls = document.querySelectorAll('.field-error');
  errorEls.forEach(el => el.textContent = '');
}

/**
 * Validación simple de correo
 */
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Maneja envío del formulario de recuperación
 */
function handleRecoverPassword(event) {
  event.preventDefault();
  clearFieldErrors();
  showRecoveryResponse('', ''); // limpia mensaje global

  const correo = document.getElementById('correo')?.value.trim();
  const newPassword = document.getElementById('new_password')?.value;
  const confirmPassword = document.getElementById('confirm_password')?.value;

  let hasError = false;

  // Validación de correo
  if (!correo) {
    const el = document.getElementById('correo-error');
    if (el) el.textContent = 'El correo es obligatorio.';
    hasError = true;
  } else if (!isValidEmail(correo)) {
    const el = document.getElementById('correo-error');
    if (el) el.textContent = 'Ingresa un correo válido.';
    hasError = true;
  }

  // Validación de nueva contraseña
  if (!newPassword) {
    const el = document.getElementById('password-error');
    if (el) el.textContent = 'La nueva contraseña es obligatoria.';
    hasError = true;
  } else if (newPassword.length < 8) {
    const el = document.getElementById('password-error');
    if (el) el.textContent = 'La contraseña debe tener al menos 8 caracteres.';
    hasError = true;
  }

  // Validación de confirmación
  if (!confirmPassword) {
    const el = document.getElementById('confirm-password-error');
    if (el) el.textContent = 'Debes confirmar la contraseña.';
    hasError = true;
  } else if (newPassword && confirmPassword && newPassword !== confirmPassword) {
    const el = document.getElementById('confirm-password-error');
    if (el) el.textContent = 'Las contraseñas no coinciden.';
    hasError = true;
  }

  if (hasError) {
    showRecoveryResponse('Por favor corrige los errores antes de continuar.', 'error');
    return;
  }

  // Petición AJAX al backend
  const xhr = new XMLHttpRequest();
  xhr.open('POST', RECOVER_API_URL, true);
  xhr.setRequestHeader('Content-Type', 'application/json');

  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      try {
        if (xhr.status < 200 || xhr.status >= 300) {
          showRecoveryResponse(`Error del servidor (${xhr.status}): ${xhr.statusText}`, 'error');
          console.error('HTTP Error:', xhr.status, xhr.statusText, xhr.responseText);
          return;
        }

        if (!xhr.responseText) {
          showRecoveryResponse('El servidor no devolvió una respuesta válida.', 'error');
          console.error('Empty response from server');
          return;
        }

        const data = JSON.parse(xhr.responseText);

        if (!data.message || !data.status) {
          showRecoveryResponse('Respuesta del servidor incompleta o inválida.', 'error');
          console.error('Invalid response format:', data);
          return;
        }

        showRecoveryResponse(data.message, data.status);

        if (data.status === 'success') {
          // Redirige al login después de 2 segundos
          setTimeout(() => {
            window.location.href = './log_in.html';
          }, 2000);
        }
      } catch (error) {
        showRecoveryResponse('Error al procesar la respuesta del servidor: ' + error.message, 'error');
        console.error('JSON Parse Error:', error, 'Response:', xhr.responseText);
      }
    }
  };

  xhr.onerror = function() {
    showRecoveryResponse('Error de conexión con el servidor.', 'error');
  };

  xhr.send(JSON.stringify({
    correo: correo,
    password: newPassword
  }));
}

/**
 * Inicialización
 */
function setupRecoverPasswordListeners() {
  const form = document.getElementById('recoveryForm');
  if (form) {
    form.addEventListener('submit', handleRecoverPassword);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupRecoverPasswordListeners);
} else {
  setupRecoverPasswordListeners();
}
