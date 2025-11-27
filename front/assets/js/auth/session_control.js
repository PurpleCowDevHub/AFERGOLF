/**
 * ============================================================================
 * AFERGOLF - Control de Sesión para Navegación
 * ============================================================================
 * 
 * @description   Intercepta clics en enlaces protegidos (perfil, carrito, etc.)
 *                y valida la autenticación ANTES de navegar.
 *                Si el usuario no está autenticado, muestra un mensaje
 *                y redirige al login sin cargar la página protegida.
 * 
 * @file          front/assets/js/auth/session_control.js
 * @author        Afergolf Team
 * @version       1.0.0
 * 
 * ============================================================================
 */

(function() {
  'use strict';

  // Evitar inicialización duplicada
  if (window._sessionControlInitialized) return;
  window._sessionControlInitialized = true;

  // ============================================================================
  // CONFIGURACIÓN
  // ============================================================================

  /**
   * Páginas que requieren autenticación (solo nombres de archivo)
   */
  const PROTECTED_FILES = [
    'my_account.html',
    'Edit_profile.html',
    'change_password.html',
    'Purchase_History.html',
    'cart.html'
  ];

  /**
   * Claves de localStorage para verificar sesión
   */
  const STORAGE_KEYS = {
    LOGGED: 'afergolf_logged',
    USER_ID: 'afergolf_user_id'
  };

  /**
   * Tiempo en ms antes de redirigir al login
   */
  const REDIRECT_DELAY = 2000;

  // ============================================================================
  // FUNCIONES DE UTILIDAD
  // ============================================================================

  /**
   * Verifica si el usuario está autenticado
   * @returns {boolean}
   */
  function isUserAuthenticated() {
    const logged = localStorage.getItem(STORAGE_KEYS.LOGGED);
    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    return logged === 'true' && userId !== null && userId !== '';
  }

  /**
   * Extrae el nombre del archivo de una URL o href
   * @param {string} href - URL o href a analizar
   * @returns {string} Nombre del archivo
   */
  function getFileName(href) {
    if (!href) return '';
    // Remover query strings y hash
    const cleanHref = href.split('?')[0].split('#')[0];
    // Obtener el último segmento de la ruta
    const parts = cleanHref.split('/');
    return parts[parts.length - 1] || '';
  }

  /**
   * Verifica si una URL apunta a una página protegida
   * @param {string} href - URL a verificar
   * @returns {boolean}
   */
  function isProtectedPath(href) {
    if (!href) return false;
    const fileName = getFileName(href);
    return PROTECTED_FILES.includes(fileName);
  }

  /**
   * Obtiene la URL correcta del login según la ubicación actual
   * @returns {string}
   */
  function getLoginUrl() {
    const currentPath = window.location.pathname;
    
    // Detectar la base del proyecto (ej: /AFERGOLF/)
    const pathParts = currentPath.split('/').filter(Boolean);
    const projectBase = pathParts.length > 0 ? `/${pathParts[0]}` : '';
    
    // Si estamos en /PROYECTO/front/views/, el login está en la misma carpeta
    if (currentPath.includes('/front/views/')) {
      return 'log_in.html';
    }
    // Si estamos en la raíz del proyecto (ej: /AFERGOLF/ o /AFERGOLF/index.html)
    else if (projectBase) {
      return `${projectBase}/front/views/log_in.html`;
    }
    // Fallback para servidor en raíz
    else {
      return '/front/views/log_in.html';
    }
  }

  /**
   * Muestra el mensaje de advertencia usando Toast o alert
   * @param {string} message - Mensaje a mostrar
   */
  function showWarningMessage(message) {
    // Intentar usar Toast si está disponible
    if (window.Toast && typeof window.Toast.warning === 'function') {
      window.Toast.warning(message);
      return;
    }
    
    // Si Toast no está disponible, esperar un poco y reintentar
    let attempts = 0;
    const maxAttempts = 10;
    const interval = setInterval(() => {
      attempts++;
      if (window.Toast && typeof window.Toast.warning === 'function') {
        clearInterval(interval);
        window.Toast.warning(message);
      } else if (attempts >= maxAttempts) {
        clearInterval(interval);
        // Fallback a alert si Toast nunca carga
        alert(message);
      }
    }, 100);
  }

  /**
   * Redirige al login después de un delay
   */
  function redirectToLogin() {
    const loginUrl = getLoginUrl();
    setTimeout(() => {
      window.location.href = loginUrl;
    }, REDIRECT_DELAY);
  }

  // ============================================================================
  // MANEJADOR DE CLICS
  // ============================================================================

  /**
   * Intercepta clics en enlaces protegidos
   * @param {Event} event - Evento de clic
   */
  function handleProtectedLinkClick(event) {
    // Obtener el elemento clickeado o su padre <a>
    let target = event.target;
    
    // Buscar el elemento <a> más cercano (puede ser el ícono dentro del enlace)
    while (target && target.tagName !== 'A') {
      target = target.parentElement;
    }
    
    if (!target || !target.href) return;
    
    const href = target.getAttribute('href') || target.href;
    
    // Verificar si es una ruta protegida
    if (!isProtectedPath(href)) return;
    
    // Si el usuario está autenticado, permitir la navegación normal
    if (isUserAuthenticated()) return;
    
    // Usuario NO autenticado intentando acceder a página protegida
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    
    // Mostrar mensaje de advertencia
    showWarningMessage('Debes iniciar sesión para acceder a esta página');
    
    // Redirigir al login después del delay
    redirectToLogin();
  }

  // ============================================================================
  // INICIALIZACIÓN
  // ============================================================================

  /**
   * Configura los event listeners cuando el DOM esté listo
   */
  function init() {
    // Usar delegación de eventos en el documento para capturar todos los clics
    // Usar la fase de captura (true) para interceptar antes que otros handlers
    document.addEventListener('click', handleProtectedLinkClick, true);
  }

  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Exponer funciones para uso externo si es necesario
  window.SessionControl = {
    isUserAuthenticated,
    isProtectedPath,
    getLoginUrl
  };

})();
