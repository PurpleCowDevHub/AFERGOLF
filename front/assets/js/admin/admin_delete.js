/**
 * ============================================================================
 * AFERGOLF - MÓDULO FRONTEND: ELIMINAR PRODUCTO
 * ============================================================================
 * 
 * ARCHIVO: admin_delete.js
 * UBICACIÓN: /front/assets/js/admin/admin_delete.js
 * 
 * ============================================================================
 * DESCRIPCIÓN GENERAL
 * ============================================================================
 * 
 * Este módulo JavaScript maneja toda la lógica del lado del cliente (frontend)
 * para la ELIMINACIÓN de productos en el panel de administración de AFERGOLF.
 * 
 * FUNCIONALIDADES PRINCIPALES:
 * - Abrir modal de confirmación antes de eliminar
 * - Enviar petición DELETE al servidor
 * - Manejar respuesta y actualizar UI
 * - Gestionar el modal de confirmación de logout
 * 
 * PRINCIPIO DE RESPONSABILIDAD ÚNICA (SRP):
 * Este archivo solo maneja la operación DELETE del CRUD.
 * Para otras operaciones, usar:
 * - admin_create.js → Crear productos
 * - admin_read.js   → Cargar y mostrar productos
 * - admin_update.js → Editar productos existentes
 * 
 * ============================================================================
 * ROL EN LA ARQUITECTURA DEL SISTEMA
 * ============================================================================
 * 
 * FLUJO COMPLETO FRONT → BACK → BASE DE DATOS:
 * 
 * 1. INTERFAZ DE USUARIO (admin_dashboard.html)
 *    ├── Usuario hace clic en botón "Eliminar" de un producto
 *    └── Se dispara evento click → confirmDeleteProduct(referencia)
 * 
 * 2. ESTE MÓDULO (admin_delete.js)
 *    ├── confirmDeleteProduct() → Abre modal de confirmación
 *    ├── Usuario confirma haciendo clic en "Eliminar Producto"
 *    └── deleteProductConfirmed() → Envía petición DELETE
 * 
 * 3. BACKEND (delete_product.php)
 *    ├── Recibe petición DELETE con referencia
 *    ├── Verifica que el producto exista
 *    ├── Elimina archivos de imágenes
 *    └── Elimina registro de tabla 'productos'
 * 
 * 4. RESPUESTA Y ACTUALIZACIÓN DE UI
 *    ├── JavaScript recibe respuesta JSON
 *    ├── Cierra modal de confirmación
 *    ├── Muestra notificación de éxito/error
 *    └── Recarga tabla de productos
 * 
 * ============================================================================
 * FUNCIONES EXPORTADAS (Globales)
 * ============================================================================
 * 
 * ┌────────────────────────────┬────────────────────────────────────────────┐
 * │ Función                    │ Descripción                                │
 * ├────────────────────────────┼────────────────────────────────────────────┤
 * │ confirmDeleteProduct(ref)  │ Abre modal de confirmación                 │
 * │ deleteProductConfirmed()   │ Ejecuta la eliminación                     │
 * │ openDeleteModal()          │ Muestra el modal de confirmación           │
 * │ closeDeleteModal()         │ Oculta el modal de confirmación            │
 * │ handleLogout()             │ Inicia proceso de cierre de sesión         │
 * │ confirmLogout()            │ Ejecuta el cierre de sesión                │
 * └────────────────────────────┴────────────────────────────────────────────┘
 * 
 * ============================================================================
 * DEPENDENCIAS
 * ============================================================================
 * 
 * ARCHIVOS REQUERIDOS (cargar antes de este):
 * - /front/assets/js/ui/toast.js      → showNotification()
 * - /front/assets/js/admin/admin_read.js → loadProducts()
 * 
 * ============================================================================
 * ELEMENTOS HTML REQUERIDOS
 * ============================================================================
 * 
 * MODAL DE ELIMINACIÓN:
 * - #delete-modal         → Modal de confirmación de eliminación
 * - #btn-cancel-delete    → Botón "Cancelar"
 * - #btn-confirm-delete   → Botón "Eliminar Producto"
 * 
 * MODAL DE LOGOUT:
 * - #logout-modal         → Modal de confirmación de cierre de sesión
 * - #btn-logout           → Botón en header para cerrar sesión
 * - #btn-cancel-logout    → Botón "Cancelar" del modal
 * - #btn-confirm-logout   → Botón "Cerrar Sesión" del modal
 * 
 * ============================================================================
 * CONSIDERACIONES DE UX
 * ============================================================================
 * 
 * CONFIRMACIÓN ANTES DE ELIMINAR:
 * - Se muestra un modal pidiendo confirmación
 * - El botón de eliminar es de color rojo (btn-danger)
 * - El texto indica que la acción es irreversible
 * 
 * FEEDBACK AL USUARIO:
 * - Notificación de éxito tras eliminar
 * - Notificación de error si falla
 * - La tabla se actualiza automáticamente
 * 
 * ============================================================================
 * CONFIGURACIÓN
 * ============================================================================
 */

// URL del endpoint para eliminar productos
const DELETE_API_URL = 'http://localhost/AFERGOLF/back/modules/products/api/admin/delete_product.php';

/**
 * Referencia del producto pendiente de eliminar
 * Se establece cuando el usuario hace clic en eliminar
 * y se limpia después de la confirmación/cancelación
 * 
 * @type {string|null}
 */
let productToDelete = null;

// ============================================================================
// MODAL DE CONFIRMACIÓN DE ELIMINACIÓN
// ============================================================================

/**
 * Abre el modal de confirmación para eliminar un producto
 * 
 * @function confirmDeleteProduct
 * @global
 * @param {string} referencia - Referencia del producto a eliminar
 * @returns {void}
 */
function confirmDeleteProduct(referencia) {
  productToDelete = referencia;
  openDeleteModal();
}

/**
 * Abre el modal de confirmación de eliminación
 * 
 * @function openDeleteModal
 * @global
 * @returns {void}
 */
function openDeleteModal() {
  const modal = document.getElementById('delete-modal');
  if (modal) {
    modal.classList.add('active');
  }
}

/**
 * Cierra el modal de confirmación de eliminación
 * 
 * @function closeDeleteModal
 * @global
 * @returns {void}
 */
function closeDeleteModal() {
  const modal = document.getElementById('delete-modal');
  if (modal) {
    modal.classList.remove('active');
  }
  productToDelete = null;
}

// ============================================================================
// FUNCIÓN: ELIMINAR PRODUCTO (CONFIRMADO)
// ============================================================================

/**
 * Ejecuta la eliminación del producto después de confirmación
 * 
 * FLUJO:
 * 1. Verifica que haya un producto seleccionado
 * 2. Envía petición DELETE al servidor
 * 3. Maneja respuesta
 * 4. Actualiza UI
 * 
 * @function deleteProductConfirmed
 * @global
 * @async
 * @returns {Promise<void>}
 */
async function deleteProductConfirmed() {
  if (!productToDelete) {
    if (typeof showNotification === 'function') {
      showNotification('No se ha seleccionado ningún producto', 'error');
    }
    closeDeleteModal();
    return;
  }
  
  try {
    // Enviar petición DELETE
    const response = await fetch(`${DELETE_API_URL}?referencia=${encodeURIComponent(productToDelete)}`, {
      method: 'DELETE'
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Éxito
      if (typeof showNotification === 'function') {
        showNotification('Producto eliminado correctamente', 'success');
      }
      
      // Cerrar modal
      closeDeleteModal();
      
      // Recargar tabla
      if (typeof loadProducts === 'function') {
        loadProducts();
      }
      
    } else {
      // Error del servidor
      if (typeof showNotification === 'function') {
        showNotification(result.message || 'Error al eliminar el producto', 'error');
      }
      closeDeleteModal();
    }
    
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    if (typeof showNotification === 'function') {
      showNotification('Error al conectar con el servidor', 'error');
    }
    closeDeleteModal();
  }
}

// ============================================================================
// MODAL DE CIERRE DE SESIÓN
// ============================================================================

/**
 * Abre el modal de confirmación de cierre de sesión
 * 
 * @function handleLogout
 * @global
 * @returns {void}
 */
function handleLogout() {
  const modal = document.getElementById('logout-modal');
  if (modal) {
    modal.classList.add('active');
  }
}

/**
 * Cierra el modal de logout
 * 
 * @function closeLogoutModal
 * @returns {void}
 */
function closeLogoutModal() {
  const modal = document.getElementById('logout-modal');
  if (modal) {
    modal.classList.remove('active');
  }
}

/**
 * Ejecuta el cierre de sesión
 * 
 * @function confirmLogout
 * @global
 * @async
 * @returns {Promise<void>}
 */
async function confirmLogout() {
  try {
    // Llamar a la API de logout si existe
    if (typeof logout === 'function') {
      await logout();
    } else {
      // Fallback: limpiar localStorage y redirigir
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      window.location.href = 'log_in.html';
    }
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    // Redirigir de todas formas
    window.location.href = 'log_in.html';
  }
}

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

/**
 * Configura los event listeners para eliminación y logout
 */
function setupDeleteEventListeners() {
  // --- Modal de eliminación ---
  
  // Botón confirmar eliminación
  const btnConfirmDelete = document.getElementById('btn-confirm-delete');
  if (btnConfirmDelete) {
    btnConfirmDelete.addEventListener('click', deleteProductConfirmed);
  }
  
  // Botón cancelar eliminación
  const btnCancelDelete = document.getElementById('btn-cancel-delete');
  if (btnCancelDelete) {
    btnCancelDelete.addEventListener('click', closeDeleteModal);
  }
  
  // Cerrar modal al hacer clic en overlay
  const deleteModal = document.getElementById('delete-modal');
  if (deleteModal) {
    const overlay = deleteModal.querySelector('.modal-overlay');
    if (overlay) {
      overlay.addEventListener('click', closeDeleteModal);
    }
  }
  
  // --- Modal de logout ---
  
  // Botón logout en header
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', handleLogout);
  }
  
  // Botón confirmar logout
  const btnConfirmLogout = document.getElementById('btn-confirm-logout');
  if (btnConfirmLogout) {
    btnConfirmLogout.addEventListener('click', confirmLogout);
  }
  
  // Botón cancelar logout
  const btnCancelLogout = document.getElementById('btn-cancel-logout');
  if (btnCancelLogout) {
    btnCancelLogout.addEventListener('click', closeLogoutModal);
  }
  
  // Cerrar modal de logout al hacer clic en overlay
  const logoutModal = document.getElementById('logout-modal');
  if (logoutModal) {
    const overlay = logoutModal.querySelector('.modal-overlay');
    if (overlay) {
      overlay.addEventListener('click', closeLogoutModal);
    }
  }
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupDeleteEventListeners);
} else {
  setupDeleteEventListeners();
}
