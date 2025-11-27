/**
 * ============================================================================
 * AFERGOLF - Página de Recuperación de Contraseña
 * ============================================================================
 * 
 * @description   Restablecimiento de contraseña mediante correo electrónico.
 *                Permite a usuarios olvidados establecer una nueva contraseña.
 * 
 * @file          front/assets/js/pages/recover_password.js
 * @author        Afergolf Team
 * @version       1.0.0
 * @since         2025-01-01
 * 
 * ============================================================================
 * ÍNDICE DE CONTENIDO
 * ============================================================================
 * 
 * 1. CONSTANTES
 *    - RECOVER_API_URL: URL del endpoint de recuperación
 * 
 * 2. FUNCIONES DE RECUPERACIÓN
 *    - handleRecoverPassword(): Procesa el formulario de recuperación
 *    - validateRecoveryForm(): Valida los campos del formulario
 * 
 * 3. FUNCIONES DE UI
 *    - showRecoveryMessage(): Muestra mensajes de respuesta
 *    - clearFieldErrors(): Limpia errores de campos
 * 
 * 4. UTILIDADES
 *    - isValidEmail(): Valida formato de email
 * 
 * 5. INICIALIZACIÓN
 *    - Configuración de event listeners
 * 
 * ============================================================================
 */

// ============================================================================
// 1. CONSTANTES
// ============================================================================

/**
 * URL del endpoint para recuperación de contraseña.
 * @constant {string}
 */
const RECOVER_API_URL = 'http://localhost/AFERGOLF/back/modules/users/api/recover_password.php';

// ============================================================================
// 2. FUNCIONES DE RECUPERACIÓN
// ============================================================================

/**
 * Procesa el formulario de recuperación de contraseña.
 * @param {Event} event - Evento submit del formulario
 */
async function handleRecoverPassword(event) {
  event.preventDefault();
  clearFieldErrors();
  
  // Capturar datos del formulario
  const correo = document.getElementById('correo')?.value.trim();
  const newPassword = document.getElementById('new_password')?.value;
  const confirmPassword = document.getElementById('confirm_password')?.value;
  
  // Validar formulario
  const validation = validateRecoveryForm(correo, newPassword, confirmPassword);
  if (!validation.valid) {
    showRecoveryMessage(validation.message, 'error');
    return;
  }
  
  try {
    const response = await fetch(RECOVER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        correo: correo,
        password: newPassword
      })
    });
    
    const data = await response.json();
    
    showRecoveryMessage(data.message, data.status);
    
    if (data.status === 'success') {
      // Limpiar formulario
      document.getElementById('recoveryForm')?.reset();
      
      // Redirigir al login después de éxito
      setTimeout(() => {
        window.location.href = 'log_in.html';
      }, 2000);
    }
  } catch (error) {
    console.error('Password recovery error:', error);
    showRecoveryMessage('Error de conexión con el servidor', 'error');
  }
}

/**
 * Valida los campos del formulario de recuperación.
 * @param {string} correo - Email del usuario
 * @param {string} newPassword - Nueva contraseña
 * @param {string} confirmPassword - Confirmación de contraseña
 * @returns {Object} Resultado de validación
 */
function validateRecoveryForm(correo, newPassword, confirmPassword) {
  let hasError = false;
  
  // Validar correo
  if (!correo) {
    setFieldError('correo-error', 'El correo es obligatorio.');
    hasError = true;
  } else if (!isValidRecoveryEmail(correo)) {
    setFieldError('correo-error', 'Ingresa un correo válido.');
    hasError = true;
  }
  
  // Validar nueva contraseña
  if (!newPassword) {
    setFieldError('password-error', 'La nueva contraseña es obligatoria.');
    hasError = true;
  } else if (newPassword.length < 8) {
    setFieldError('password-error', 'La contraseña debe tener al menos 8 caracteres.');
    hasError = true;
  }
  
  // Validar confirmación
  if (!confirmPassword) {
    setFieldError('confirm-password-error', 'Debes confirmar la contraseña.');
    hasError = true;
  } else if (newPassword && confirmPassword && newPassword !== confirmPassword) {
    setFieldError('confirm-password-error', 'Las contraseñas no coinciden.');
    hasError = true;
  }
  
  return {
    valid: !hasError,
    message: hasError ? 'Por favor corrige los errores antes de continuar.' : ''
  };
}

/**
 * Establece un mensaje de error en un campo específico.
 * @param {string} elementId - ID del elemento de error
 * @param {string} message - Mensaje de error
 */
function setFieldError(elementId, message) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = message;
    element.style.display = 'block';
  }
}

// ============================================================================
// 3. FUNCIONES DE UI
// ============================================================================

/**
 * Muestra mensajes de respuesta usando Toast o fallback.
 * @param {string} message - Mensaje a mostrar
 * @param {string} status - Tipo de mensaje (success, error, warning)
 */
function showRecoveryMessage(message, status = 'error') {
  if (!message) return;
  
  if (window.Toast) {
    const toastMethod = Toast[status] || Toast.info;
    toastMethod(message);
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
 * Limpia todos los mensajes de error de los campos.
 */
function clearFieldErrors() {
  const errorElements = document.querySelectorAll('.field-error');
  errorElements.forEach(el => {
    el.textContent = '';
    el.style.display = 'none';
  });
  
  // Limpiar mensaje global
  const responseEl = document.getElementById('recovery-response');
  if (responseEl) {
    responseEl.textContent = '';
    responseEl.style.display = 'none';
  }
}

// ============================================================================
// 4. UTILIDADES
// ============================================================================

/**
 * Valida el formato de un email.
 * @param {string} email - Email a validar
 * @returns {boolean} True si el formato es válido
 */
function isValidRecoveryEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ============================================================================
// 5. INICIALIZACIÓN
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Configurar formulario
  const form = document.getElementById('recoveryForm');
  if (form) {
    form.addEventListener('submit', handleRecoverPassword);
  }
  
  // Limpiar errores al escribir
  const inputs = document.querySelectorAll('#recoveryForm input');
  inputs.forEach(input => {
    input.addEventListener('input', () => {
      const errorId = `${input.id.replace('_', '-')}-error`;
      const errorEl = document.getElementById(errorId);
      if (errorEl) {
        errorEl.textContent = '';
        errorEl.style.display = 'none';
      }
    });
  });
  
  // Botón de volver al login
  const backBtn = document.querySelector('.btn-secondary, .back-link');
  if (backBtn) {
    backBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'log_in.html';
    });
  }
});

// ============================================================================
// EXPORTACIÓN
// ============================================================================

if (typeof window !== 'undefined') {
  window.handleRecoverPassword = handleRecoverPassword;
  window.clearFieldErrors = clearFieldErrors;
}
