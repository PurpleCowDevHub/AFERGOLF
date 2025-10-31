// Elementos del DOM
const overlay = document.getElementById('overlay');
const hamburguerMenu = document.getElementById('hamburguer-menu');
const searchModal = document.getElementById('search-modal');

// Botones de menú hamburguesa
const openMenuMobile = document.getElementById('open-menu-mobile');
const openMenuDesktop = document.getElementById('open-menu-desktop');

// Botones de búsqueda
const openSearchMobile = document.getElementById('open-search-mobile');
const openSearchDesktop = document.getElementById('open-search-desktop');

// Función para abrir el menú hamburguesa
function openMenu() {
  hamburguerMenu.classList.add('active');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden'; // Evitar scroll en el body
}

// Función para cerrar el menú hamburguesa
function closeMenu() {
  hamburguerMenu.classList.remove('active');
  overlay.classList.remove('active');
  document.body.style.overflow = ''; // Restaurar scroll
}

// Función para abrir el buscador
function openSearch() {
  searchModal.classList.add('active');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden'; // Evitar scroll en el body
  
  // Enfocar el input de búsqueda
  const searchInput = searchModal.querySelector('.search-input');
  setTimeout(() => searchInput.focus(), 100);
}

// Función para cerrar el buscador
function closeSearch() {
  searchModal.classList.remove('active');
  overlay.classList.remove('active');
  document.body.style.overflow = ''; // Restaurar scroll
}

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
