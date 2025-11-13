/**
 * ============================================================================
 * AFERGOLF - Header Functionality
 * ============================================================================
 * 
 * Funcionalidad interactiva del header: menú hamburguesa y modal de búsqueda.
 * 
 * @author Afergolf Team
 * @version 1.0.0
 * ============================================================================
 */

// ============================================================================
// ELEMENTOS DEL DOM
// ============================================================================

const overlay = document.getElementById('modal-overlay');
const hamburguerMenu = document.getElementById('hamburguer-menu');
const searchModal = document.getElementById('search-modal');
const openMenuMobile = document.getElementById('open-menu-mobile');
const openMenuDesktop = document.getElementById('open-menu-desktop');
const openSearchMobile = document.getElementById('open-search-mobile');
const openSearchDesktop = document.getElementById('open-search-desktop');

// ============================================================================
// FUNCIONES DEL MENÚ Y BÚSQUEDA
// ============================================================================

/**
 * Alterna el estado del body overflow y overlay.
 * @param {boolean} isOpen - Estado de apertura
 */
const toggleBodyScroll = (isOpen) => {
  document.body.style.overflow = isOpen ? 'hidden' : '';
  overlay.classList.toggle('active', isOpen);
};

/**
 * Abre el menú hamburguesa.
 */
const openMenu = () => {
  hamburguerMenu.classList.add('active');
  toggleBodyScroll(true);
};

/**
 * Cierra el menú hamburguesa.
 */
const closeMenu = () => {
  hamburguerMenu.classList.remove('active');
  toggleBodyScroll(false);
};

/**
 * Abre el modal de búsqueda y enfoca el input.
 */
const openSearch = () => {
  searchModal.classList.add('active');
  toggleBodyScroll(true);
  setTimeout(() => {
    const searchInput = searchModal.querySelector('.search-input');
    if (searchInput) searchInput.focus();
  }, 100);
};

/**
 * Cierra el modal de búsqueda.
 */
const closeSearch = () => {
  searchModal.classList.remove('active');
  toggleBodyScroll(false);
};

/**
 * Cierra todos los modales.
 */
const closeAll = () => {
  closeMenu();
  closeSearch();
};

// ============================================================================
// EVENT LISTENERS
// ============================================================================

// Menú hamburguesa
[openMenuMobile, openMenuDesktop].forEach(btn => {
  if (btn) btn.addEventListener('click', openMenu);
});

// Búsqueda
[openSearchMobile, openSearchDesktop].forEach(btn => {
  if (btn) btn.addEventListener('click', openSearch);
});

// Cerrar búsqueda al clicar en el fondo
searchModal.addEventListener('click', (e) => {
  if (e.target === searchModal) closeSearch();
});

// Evitar cierre del menú al clicar dentro
hamburguerMenu.addEventListener('click', (e) => e.stopPropagation());

// Cerrar con overlay
overlay.addEventListener('click', closeAll);

// Cerrar con tecla ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeAll();
});