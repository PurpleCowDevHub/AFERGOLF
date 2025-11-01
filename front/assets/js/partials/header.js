/**
 * ============================================================================
 * AFERGOLF - Header Functionality
 * ============================================================================
 * 
 * Este archivo contiene toda la funcionalidad interactiva del header principal.
 * Gestiona el menú hamburguesa y el modal de búsqueda.
 * 
 * Funcionalidades:
 * - Abrir/cerrar menú hamburguesa (móvil y escritorio)
 * - Abrir/cerrar modal de búsqueda
 * - Control de overlay y scroll del body
 * - Cierre con tecla ESC
 * 
 * @author Afergolf Team
 * @version 1.0.0
 */

// ============================================================================
// ELEMENTOS DEL DOM
// ============================================================================

const overlay = document.getElementById('modal-overlay');
const hamburguerMenu = document.getElementById('hamburguer-menu');
const searchModal = document.getElementById('search-modal');

// Botones de menú hamburguesa
const openMenuMobile = document.getElementById('open-menu-mobile');
const openMenuDesktop = document.getElementById('open-menu-desktop');

// Botones de búsqueda
const openSearchMobile = document.getElementById('open-search-mobile');
const openSearchDesktop = document.getElementById('open-search-desktop');

// ============================================================================
// FUNCIONES DEL MENÚ HAMBURGUESA
// ============================================================================

/**
 * Abre el menú hamburguesa y muestra el overlay.
 * Previene el scroll del body mientras el menú está abierto.
 */
function openMenu() {
  hamburguerMenu.classList.add('active');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

/**
 * Cierra el menú hamburguesa y oculta el overlay.
 * Restaura el scroll del body.
 */
function closeMenu() {
  hamburguerMenu.classList.remove('active');
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

// ============================================================================
// FUNCIONES DEL MODAL DE BÚSQUEDA
// ============================================================================

/**
 * Abre el modal de búsqueda y muestra el overlay.
 * Enfoca automáticamente el campo de búsqueda.
 */
function openSearch() {
  searchModal.classList.add('active');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  
  // Enfocar el input de búsqueda
  const searchInput = searchModal.querySelector('.search-input');
  setTimeout(() => searchInput.focus(), 100);
}

/**
 * Cierra el modal de búsqueda y oculta el overlay.
 * Restaura el scroll del body.
 */
function closeSearch() {
  searchModal.classList.remove('active');
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

// Event listeners para abrir el menú
if (openMenuMobile) {
  openMenuMobile.addEventListener('click', openMenu);
}
if (openMenuDesktop) {
  openMenuDesktop.addEventListener('click', openMenu);
}

// Event listeners para abrir el buscador
if (openSearchMobile) {
  openSearchMobile.addEventListener('click', openSearch);
}
if (openSearchDesktop) {
  openSearchDesktop.addEventListener('click', openSearch);
}

// Evitar que el clic en el contenido de búsqueda cierre el modal
searchModal.addEventListener('click', (e) => {
  // Solo cerrar si se hace clic en el fondo, no en el contenido
  if (e.target === searchModal) {
    closeSearch();
  }
});

// Evitar que el clic en el menú cierre el modal
hamburguerMenu.addEventListener('click', (e) => {
  // Evitar que el clic dentro del menú lo cierre
  e.stopPropagation();
});

// Cerrar al hacer clic en el overlay
overlay.addEventListener('click', () => {
  closeMenu();
  closeSearch();
});

// Cerrar con la tecla ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeMenu();
    closeSearch();
  }
});