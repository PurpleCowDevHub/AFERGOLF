/**
 * ============================================================================
 * AFERGOLF - Página de Inicio de Sesión
 * ============================================================================
 * 
 * @description   Manejo del formulario de login. Este archivo proporciona
 *                funcionalidad adicional específica de la página de login
 *                que complementa el módulo principal de autenticación.
 * 
 * @file          front/assets/js/pages/login.js
 * @author        Afergolf Team
 * @version       1.0.0
 * @since         2025-01-01
 * 
 * ============================================================================
 * ÍNDICE DE CONTENIDO
 * ============================================================================
 * 
 * 1. CONSTANTES
 *    - LOGIN_API_URL: URL del endpoint de login
 * 
 * 2. FUNCIONES DE LOGIN
 *    - handleLoginSubmit(): Procesa el formulario de login
 *    - validateLoginForm(): Valida los campos
 * 
 * 3. FUNCIONES DE UI
 *    - showLoginMessage(): Muestra mensajes
 *    - togglePasswordVisibility(): Muestra/oculta contraseña
 *    - setRememberMe(): Recordar credenciales
 * 
 * 4. INICIALIZACIÓN
 *    - Configuración de event listeners
 *    - Carga de credenciales guardadas
 * 
 * ============================================================================
 * NOTA
 * ============================================================================
 * 
 * Este archivo trabaja en conjunto con auth/auth.js. Las funciones principales
 * de autenticación están en el módulo de auth, este archivo solo proporciona
 * funcionalidad específica de la UI de login.
 * 
 * ============================================================================
 */

// ============================================================================
// 1. CONSTANTES
// ============================================================================

/**
 * URL del endpoint de inicio de sesión.
 * Se obtiene de la configuración centralizada.
 * @constant {string}
 */
const LOGIN_API_URL = window.AFERGOLF_CONFIG?.API?.LOGIN || '/back/modules/users/api/log_in.php';

/**
 * Clave de localStorage para recordar email.
 * @constant {string}
 */
const REMEMBER_EMAIL_KEY = 'afergolf_remember_email';

// ============================================================================
// 2. FUNCIONES DE LOGIN
// ============================================================================

/**
 * Procesa el formulario de inicio de sesión.
 * @param {Event} event - Evento submit del formulario
 */
async function handleLoginSubmit(event) {
  event.preventDefault();
  
  // Capturar datos del formulario (IDs del HTML: email, password)
  const email = document.getElementById('email')?.value.trim();
  const password = document.getElementById('password')?.value;
  const rememberMe = document.getElementById('remember-me')?.checked;
  
  // Validar campos
  const validation = validateLoginForm(email, password);
  if (!validation.valid) {
    showLoginMessage(validation.message, 'error');
    return;
  }
  
  // Deshabilitar botón durante la petición
  const submitBtn = document.querySelector('.btn-primary[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Iniciando sesión...';
  }
  
  try {
    const response = await fetch(LOGIN_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (data.status === 'success' && data.user) {
      // Guardar sesión
      localStorage.setItem('afergolf_logged', 'true');
      localStorage.setItem('afergolf_user_id', data.user.id);
      localStorage.setItem('afergolf_user_email', data.user.email);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Guardar email si "recordarme" está activado
      if (rememberMe) {
        localStorage.setItem(REMEMBER_EMAIL_KEY, email);
      } else {
        localStorage.removeItem(REMEMBER_EMAIL_KEY);
      }
      
      // Redirigir según el rol del usuario
      if (data.user.rol === 'admin') {
        showLoginMessage('¡Bienvenido Administrador!', 'success');
        setTimeout(() => {
          window.location.href = 'admin_dashboard.html';
        }, 1000);
      } else {
        showLoginMessage('¡Inicio de sesión exitoso!', 'success');
        setTimeout(() => {
          window.location.href = '../../index.html';
        }, 1000);
      }
      
    } else {
      showLoginMessage(data.message || 'Credenciales incorrectas', 'error');
    }
  } catch (error) {
    console.error('Login error:', error);
    showLoginMessage('Error de conexión con el servidor', 'error');
  } finally {
    // Rehabilitar botón
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Iniciar sesión';
    }
  }
}

/**
 * Valida los campos del formulario de login.
 * @param {string} email - Email ingresado
 * @param {string} password - Contraseña ingresada
 * @returns {Object} Resultado de validación
 */
function validateLoginForm(email, password) {
  if (!email || !password) {
    return { valid: false, message: 'Por favor completa todos los campos' };
  }
  
  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Por favor ingresa un correo válido' };
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
function showLoginMessage(message, type = 'info') {
  if (window.Toast) {
    const toastMethod = Toast[type] || Toast.info;
    toastMethod(message);
  } else {
    // Fallback a elemento de mensaje
    let messageElement = document.getElementById('login-message');
    
    if (!messageElement) {
      messageElement = document.createElement('div');
      messageElement.id = 'login-message';
      messageElement.style.cssText = `
        padding: 12px 16px;
        border-radius: 8px;
        margin-bottom: 16px;
        text-align: center;
        font-weight: 500;
      `;
      const form = document.getElementById('loginForm') || document.getElementById('login-form');
      if (form) {
        form.parentNode.insertBefore(messageElement, form);
      }
    }
    
    messageElement.textContent = message;
    messageElement.style.display = 'block';
    
    if (type === 'success') {
      messageElement.style.background = '#f0fdf4';
      messageElement.style.color = '#166534';
      messageElement.style.border = '1px solid #22c55e';
    } else if (type === 'error') {
      messageElement.style.background = '#fef2f2';
      messageElement.style.color = '#991b1b';
      messageElement.style.border = '1px solid #ef4444';
    } else {
      messageElement.style.background = '#f0f9ff';
      messageElement.style.color = '#075985';
      messageElement.style.border = '1px solid #0ea5e9';
    }
    
    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
      if (messageElement) {
        messageElement.style.display = 'none';
      }
    }, 5000);
  }
}

/**
 * Alterna la visibilidad de la contraseña.
 * @param {HTMLElement} button - Botón de toggle que fue clickeado
 */
function toggleLoginPasswordVisibility(button) {
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

/**
 * Carga el email guardado si existe.
 */
function loadRememberedEmail() {
  const savedEmail = localStorage.getItem(REMEMBER_EMAIL_KEY);
  if (savedEmail) {
    const emailInput = document.getElementById('email');
    const rememberCheckbox = document.getElementById('remember-me');
    
    if (emailInput) {
      emailInput.value = savedEmail;
    }
    if (rememberCheckbox) {
      rememberCheckbox.checked = true;
    }
  }
}

// ============================================================================
// 4. INICIALIZACIÓN
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Verificar si ya está autenticado y redirigir según rol
  const isLogged = localStorage.getItem('afergolf_logged');
  if (isLogged === 'true') {
    // Obtener datos del usuario para verificar rol
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.rol === 'admin') {
          window.location.href = 'admin_dashboard.html';
        } else {
          window.location.href = 'my_account.html';
        }
      } catch (e) {
        window.location.href = 'my_account.html';
      }
    } else {
      window.location.href = 'my_account.html';
    }
    return;
  }
  
  // Cargar email guardado
  loadRememberedEmail();
  
  // Configurar formulario (clase en HTML: login-form)
  const loginForm = document.querySelector('.login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLoginSubmit);
  }
  
  // Botón de toggle contraseña
  const toggleBtn = document.querySelector('.toggle-password');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      toggleLoginPasswordVisibility(toggleBtn);
    });
  }
  
  // Limpiar mensajes al escribir
  const inputs = document.querySelectorAll('#email, #password');
  inputs.forEach(input => {
    input.addEventListener('input', () => {
      const messageEl = document.getElementById('login-message');
      if (messageEl) {
        messageEl.style.display = 'none';
      }
    });
  });
  
  // Link de registro
  const registerLink = document.querySelector('a[href="sign_up.html"]');
  if (registerLink) {
    // Navegación normal
  }
  
  // Link de recuperar contraseña
  const recoverLink = document.querySelector('a[href="recover_password.html"]');
  if (recoverLink) {
    // Navegación normal
  }
});

// ============================================================================
// EXPORTACIÓN
// ============================================================================

if (typeof window !== 'undefined') {
  window.handleLoginSubmit = handleLoginSubmit;
  window.toggleLoginPasswordVisibility = toggleLoginPasswordVisibility;
}
