/**
 * ============================================================================
 * AFERGOLF - Página de Registro
 * ============================================================================
 * 
 * @description   Manejo del formulario de registro de nuevos usuarios.
 * 
 * @file          front/assets/js/pages/sign_up.js
 * @author        Afergolf Team
 * @version       1.0.0
 * @since         2025-01-01
 * 
 * ============================================================================
 */

// ============================================================================
// 1. CONSTANTES
// ============================================================================

/**
 * URL del endpoint de registro.
 * @constant {string}
 */
const REGISTER_API_URL = 'http://localhost/AFERGOLF/back/modules/users/api/register.php';

// ============================================================================
// 2. FUNCIONES DE REGISTRO
// ============================================================================

/**
 * Procesa el formulario de registro.
 * @param {Event} event - Evento submit del formulario
 */
async function handleRegisterSubmit(event) {
  event.preventDefault();
  
  // Capturar datos del formulario (IDs del HTML de sign_up.html)
  const formData = {
    nombres: document.getElementById('nombre')?.value.trim(),
    apellidos: document.getElementById('apellido')?.value.trim(),
    email: document.getElementById('correo')?.value.trim(),
    telefono: document.getElementById('telefono')?.value.trim() || null,
    password: document.getElementById('password')?.value,
    confirmPassword: document.getElementById('confirmar_password')?.value
  };
  
  // Validar datos
  const validation = validateRegisterForm(formData);
  if (!validation.valid) {
    showRegisterMessage(validation.message, 'error');
    return;
  }
  
  // Deshabilitar botón durante la petición
  const submitBtn = document.querySelector('.btn-primary[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creando cuenta...';
  }
  
  try {
    const response = await fetch(REGISTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        email: formData.email,
        telefono: formData.telefono,
        password: formData.password
      })
    });
    
    const data = await response.json();
    
    if (data.status === 'success') {
      showRegisterMessage('¡Registro exitoso! Redirigiendo al login...', 'success');
      
      // Redirigir al login después de registro exitoso
      setTimeout(() => {
        window.location.href = 'log_in.html';
      }, 2000);
    } else {
      showRegisterMessage(data.message || 'Error al registrar usuario', 'error');
    }
  } catch (error) {
    console.error('Error de registro:', error);
    showRegisterMessage('Error de conexión con el servidor', 'error');
  } finally {
    // Rehabilitar botón
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Crear cuenta';
    }
  }
}

/**
 * Valida los datos del formulario de registro.
 * @param {Object} data - Datos del formulario
 * @returns {Object} Resultado de validación
 */
function validateRegisterForm(data) {
  // Campos requeridos
  if (!data.nombres || !data.apellidos || !data.email || !data.password) {
    return { valid: false, message: 'Por favor completa todos los campos requeridos' };
  }
  
  // Validar nombre
  if (data.nombres.length < 2) {
    return { valid: false, message: 'El nombre debe tener al menos 2 caracteres' };
  }
  
  // Validar apellido
  if (data.apellidos.length < 2) {
    return { valid: false, message: 'El apellido debe tener al menos 2 caracteres' };
  }
  
  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return { valid: false, message: 'Por favor ingresa un correo electrónico válido' };
  }
  
  // Validar longitud de contraseña
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
  
  // Validar que las contraseñas coincidan
  if (data.password !== data.confirmPassword) {
    return { valid: false, message: 'Las contraseñas no coinciden' };
  }
  
  return { valid: true, message: '' };
}

// ============================================================================
// 3. FUNCIONES DE UI
// ============================================================================

/**
 * Muestra mensajes de respuesta usando Toast o fallback.
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de mensaje (success, error, warning)
 */
function showRegisterMessage(message, type = 'info') {
  if (window.Toast) {
    const toastMethod = Toast[type] || Toast.info;
    toastMethod(message);
  } else {
    alert(message);
  }
}

/**
 * Muestra errores de validación en tiempo real.
 * @param {string} fieldId - ID del campo
 * @param {string} message - Mensaje de error
 */
function showFieldError(fieldId, message) {
  const errorElement = document.getElementById(`${fieldId}-error`);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = message ? 'block' : 'none';
  }
}

/**
 * Limpia los errores de validación.
 */
function clearFieldErrors() {
  const errorElements = document.querySelectorAll('.field-error');
  errorElements.forEach(el => {
    el.textContent = '';
    el.style.display = 'none';
  });
}

// ============================================================================
// 4. INICIALIZACIÓN
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Verificar si ya está autenticado
  const isLogged = localStorage.getItem('afergolf_logged');
  if (isLogged === 'true') {
    window.location.href = 'my_account.html';
    return;
  }
  
  // Configurar formulario de registro (clase en HTML: register-form)
  const registerForm = document.querySelector('.register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegisterSubmit);
  }
  
  // Limpiar errores al escribir
  const inputs = document.querySelectorAll('.field-input');
  inputs.forEach(input => {
    input.addEventListener('input', () => {
      clearFieldErrors();
    });
  });
  
  // Validación en tiempo real del email
  const emailInput = document.getElementById('correo');
  if (emailInput) {
    emailInput.addEventListener('blur', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailInput.value && !emailRegex.test(emailInput.value)) {
        showFieldError('correo', 'Ingresa un correo válido');
      }
    });
  }
  
  // Validación en tiempo real de contraseñas
  const passwordInput = document.getElementById('password');
  const confirmInput = document.getElementById('confirmar_password');
  
  if (confirmInput && passwordInput) {
    confirmInput.addEventListener('blur', () => {
      if (confirmInput.value && confirmInput.value !== passwordInput.value) {
        showFieldError('confirmar_password', 'Las contraseñas no coinciden');
      }
    });
  }
});

// ============================================================================
// EXPORTACIÓN
// ============================================================================

if (typeof window !== 'undefined') {
  window.handleRegisterSubmit = handleRegisterSubmit;
}
