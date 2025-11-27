/**
 * ============================================================================
 * AFERGOLF - Página de Cambio de Contraseña
 * ============================================================================
 * 
 * @description   Gestión del cambio de contraseña para usuarios autenticados.
 *                Incluye validación de fortaleza y confirmación.
 * 
 * @file          front/assets/js/pages/change_password.js
 * @author        Afergolf Team
 * @version       1.0.0
 * @since         2025-01-01
 * 
 * ============================================================================
 * ÍNDICE DE CONTENIDO
 * ============================================================================
 * 
 * 1. CONSTANTES
 *    - CHANGE_PASSWORD_API_URL: URL del endpoint
 *    - PASSWORD_REGEX: Expresión regular para validar fortaleza
 * 
 * 2. FUNCIONES DE CAMBIO DE CONTRASEÑA
 *    - handleChangePassword(): Procesa el formulario
 *    - validatePassword(): Valida la contraseña
 * 
 * 3. FUNCIONES DE UI
 *    - showPasswordMessage(): Muestra mensajes de respuesta
 *    - validatePasswordStrength(): Indicador de fortaleza en tiempo real
 *    - togglePasswordVisibility(): Muestra/oculta contraseña
 * 
 * 4. INICIALIZACIÓN
 *    - Verificación de sesión
 *    - Configuración de event listeners
 * 
 * ============================================================================
 */

// ============================================================================
// 1. CONSTANTES
// ============================================================================

/**
 * URL del endpoint para cambio de contraseña.
 * @constant {string}
 */
const CHANGE_PASSWORD_API_URL = 'http://localhost/AFERGOLF/back/modules/users/api/change_password.php';

/**
 * Expresión regular para validar fortaleza de contraseña.
 * Requiere: mayúscula, minúscula, número y carácter especial.
 * @constant {RegExp}
 */
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

// ============================================================================
// 2. FUNCIONES DE CAMBIO DE CONTRASEÑA
// ============================================================================

/**
 * Procesa el formulario de cambio de contraseña.
 * @param {Event} event - Evento submit del formulario
 */
async function handleChangePassword(event) {
  event.preventDefault();
  
  // Capturar datos del formulario
  const currentPassword = document.getElementById('currentPassword')?.value;
  const newPassword = document.getElementById('newPassword')?.value;
  const confirmPassword = document.getElementById('confirmPassword')?.value;
  
  // Obtener ID de usuario o token
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const userId = localStorage.getItem('afergolf_user_id');
  
  // Validar campos requeridos
  if (!newPassword || !confirmPassword) {
    showPasswordMessage('Por favor completa todos los campos', 'error');
    return;
  }
  
  // Validar longitud mínima
  if (newPassword.length < 8) {
    showPasswordMessage('La contraseña debe tener al menos 8 caracteres', 'error');
    return;
  }
  
  // Validar que coincidan
  if (newPassword !== confirmPassword) {
    showPasswordMessage('Las contraseñas no coinciden', 'error');
    return;
  }
  
  // Validar fortaleza
  if (!PASSWORD_REGEX.test(newPassword)) {
    showPasswordMessage('La contraseña debe incluir mayúscula, minúscula, número y carácter especial (@$!%*?&#)', 'error');
    return;
  }
  
  // Preparar datos para enviar
  const requestData = token 
    ? { token, newPassword }
    : { userId, currentPassword, newPassword };
  
  try {
    const response = await fetch(CHANGE_PASSWORD_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });
    
    const data = await response.json();
    
    showPasswordMessage(data.message, data.status);
    
    if (data.status === 'success') {
      // Limpiar formulario
      document.getElementById('passwordForm')?.reset();
      
      // Limpiar sesión para forzar re-login
      localStorage.removeItem('afergolf_logged');
      localStorage.removeItem('afergolf_user_id');
      localStorage.removeItem('user');
      
      // Redirigir al login
      setTimeout(() => {
        window.location.href = 'log_in.html';
      }, 2000);
    }
  } catch (error) {
    console.error('Password change error:', error);
    showPasswordMessage('Error de conexión con el servidor', 'error');
  }
}

/**
 * Valida si una contraseña cumple los requisitos.
 * @param {string} password - Contraseña a validar
 * @returns {Object} Resultado de validación
 */
function validatePassword(password) {
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&#]/.test(password)
  };
  
  const valid = Object.values(checks).every(Boolean);
  
  return { valid, checks };
}

// ============================================================================
// 3. FUNCIONES DE UI
// ============================================================================

/**
 * Muestra mensajes de respuesta usando Toast o fallback.
 * @param {string} message - Mensaje a mostrar
 * @param {string} status - Tipo de mensaje (success, error, warning)
 */
function showPasswordMessage(message, status) {
  if (window.Toast) {
    const toastMethod = Toast[status] || Toast.info;
    toastMethod(message);
  } else {
    // Fallback al elemento tradicional
    let messageElement = document.getElementById('change-password-message');
    
    if (!messageElement) {
      messageElement = document.createElement('div');
      messageElement.id = 'change-password-message';
      const form = document.getElementById('passwordForm');
      if (form) {
        form.parentNode.insertBefore(messageElement, form);
      }
    }
    
    if (messageElement) {
      messageElement.textContent = message;
      messageElement.className = `message-box ${status}`;
      messageElement.style.display = 'block';
      
      // Auto-ocultar errores
      if (status === 'error') {
        setTimeout(() => {
          messageElement.style.display = 'none';
        }, 5000);
      }
    }
  }
}

/**
 * Actualiza el indicador de fortaleza de contraseña en tiempo real.
 * @param {string} password - Contraseña a evaluar
 */
function validatePasswordStrength(password) {
  const strengthIndicator = document.getElementById('password-strength');
  const strengthBar = document.getElementById('strength-bar');
  
  if (!strengthIndicator) return;
  
  const { checks } = validatePassword(password);
  const strength = Object.values(checks).filter(Boolean).length;
  
  const strengthLevels = [
    { text: '', class: '', color: '#e0e0e0' },
    { text: 'Muy débil', class: 'strength-1', color: '#ef4444' },
    { text: 'Débil', class: 'strength-2', color: '#f97316' },
    { text: 'Regular', class: 'strength-3', color: '#eab308' },
    { text: 'Fuerte', class: 'strength-4', color: '#22c55e' },
    { text: 'Muy fuerte', class: 'strength-5', color: '#16a34a' }
  ];
  
  const level = strengthLevels[strength];
  
  strengthIndicator.textContent = level.text;
  strengthIndicator.className = `strength ${level.class}`;
  
  if (strengthBar) {
    strengthBar.style.width = `${(strength / 5) * 100}%`;
    strengthBar.style.backgroundColor = level.color;
  }
  
  // Actualizar checks visuales si existen
  updatePasswordChecks(checks);
}

/**
 * Actualiza los indicadores visuales de requisitos de contraseña.
 * @param {Object} checks - Objeto con los requisitos cumplidos
 */
function updatePasswordChecks(checks) {
  const checkElements = {
    'check-length': checks.length,
    'check-lowercase': checks.lowercase,
    'check-uppercase': checks.uppercase,
    'check-number': checks.number,
    'check-special': checks.special
  };
  
  Object.entries(checkElements).forEach(([id, passed]) => {
    const element = document.getElementById(id);
    if (element) {
      element.classList.toggle('passed', passed);
      element.classList.toggle('failed', !passed);
    }
  });
}

/**
 * Alterna la visibilidad de la contraseña.
 * @param {HTMLElement} button - Botón de toggle que fue clickeado
 */
function togglePasswordVisibility(button) {
  const input = button.parentElement.querySelector('input');
  
  if (input) {
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    
    button.innerHTML = isPassword 
      ? '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>'
      : '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
    
    button.setAttribute('aria-label', isPassword ? 'Ocultar contraseña' : 'Mostrar contraseña');
  }
}

// ============================================================================
// 4. INICIALIZACIÓN
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Verificar si hay token en la URL (reset desde email)
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  
  // Si no hay token, verificar sesión
  if (!token) {
    const isLogged = localStorage.getItem('afergolf_logged');
    const userId = localStorage.getItem('afergolf_user_id');
    
    if (!isLogged || !userId) {
      if (window.Toast) {
        Toast.warning('Debes iniciar sesión para cambiar tu contraseña');
      }
      setTimeout(() => {
        window.location.href = 'log_in.html';
      }, 1000);
      return;
    }
  }
  
  // Configurar formulario
  const passwordForm = document.getElementById('passwordForm');
  if (passwordForm) {
    passwordForm.addEventListener('submit', handleChangePassword);
  }
  
  // Validación en tiempo real
  const newPasswordInput = document.getElementById('newPassword');
  if (newPasswordInput) {
    newPasswordInput.addEventListener('input', (e) => {
      validatePasswordStrength(e.target.value);
    });
  }
  
  // Botones de toggle visibilidad
  const toggleButtons = document.querySelectorAll('.toggle-password');
  toggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      togglePasswordVisibility(btn);
    });
  });
  
  // Botón de cancelar
  const cancelBtn = document.querySelector('.btn-secondary');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'my_account.html';
    });
  }
});

// ============================================================================
// EXPORTACIÓN
// ============================================================================

if (typeof window !== 'undefined') {
  window.handleChangePassword = handleChangePassword;
  window.validatePasswordStrength = validatePasswordStrength;
  window.togglePasswordVisibility = togglePasswordVisibility;
}
