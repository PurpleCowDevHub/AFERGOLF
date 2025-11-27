/**
 * ============================================================================
 * AFERGOLF - Toast Notifications System
 * ============================================================================
 * 
 * Sistema de notificaciones toast simple para toda la aplicación.
 * 
 * @author Afergolf Team
 * @version 1.1.0
 * 
 * USO:
 * - Toast.success('Mensaje de éxito');
 * - Toast.error('Mensaje de error');
 * - Toast.warning('Mensaje de advertencia');
 * - Toast.info('Mensaje informativo');
 * ============================================================================
 */

const Toast = (function() {
  'use strict';

  // ============================================================================
  // CONFIGURACIÓN
  // ============================================================================

  const CONFIG = {
    duration: 2500,        // Duración por defecto: 2.5 segundos
    maxToasts: 3           // Máximo de toasts visibles
  };

  // Iconos SVG simples
  const ICONS = {
    success: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    error: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`,
    warning: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
    info: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`
  };

  let container = null;

  // ============================================================================
  // FUNCIONES
  // ============================================================================

  function createContainer() {
    if (container) return container;
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
  }

  function show(message, type = 'info', duration = CONFIG.duration) {
    createContainer();

    // Limitar cantidad de toasts
    while (container.children.length >= CONFIG.maxToasts) {
      removeToast(container.firstChild);
    }

    // Crear toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-icon">${ICONS[type] || ICONS.info}</div>
      <div class="toast-message">${message}</div>
      <button class="toast-close" aria-label="Cerrar">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `;

    container.appendChild(toast);

    // Cerrar con botón
    toast.querySelector('.toast-close').addEventListener('click', () => removeToast(toast));

    // Auto-cerrar
    const timeoutId = setTimeout(() => removeToast(toast), duration);
    toast._timeoutId = timeoutId;

    return toast;
  }

  function removeToast(toast) {
    if (!toast || !toast.parentNode) return;
    if (toast._timeoutId) clearTimeout(toast._timeoutId);
    
    toast.classList.add('toast-exit');
    setTimeout(() => {
      if (toast.parentNode) toast.remove();
    }, 200);
  }

  // ============================================================================
  // API PÚBLICA
  // ============================================================================

  return {
    success: (msg, duration) => show(msg, 'success', duration || 2500),
    error: (msg, duration) => show(msg, 'error', duration || 3500),
    warning: (msg, duration) => show(msg, 'warning', duration || 3000),
    info: (msg, duration) => show(msg, 'info', duration || 2500),
    clear: () => { if (container) container.innerHTML = ''; }
  };
})();

// Disponible globalmente
window.Toast = Toast;

// Compatibilidad con código existente
window.showNotification = function(message, type = 'info') {
  if (Toast[type]) Toast[type](message);
  else Toast.info(message);
};
