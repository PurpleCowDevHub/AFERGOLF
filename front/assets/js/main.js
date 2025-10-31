// Definimos una clase para el componente del header
class AfergolfHeader extends HTMLElement {
  connectedCallback() {
    // Traemos el archivo header.html que está dentro de /front/partials
    fetch('/front/partials/header.html')
      .then(response => response.text())
      .then(html => {
        this.innerHTML = html;
        // Después de insertar el HTML, inicializar la funcionalidad del header
        this.initHeaderFunctionality();
      })
      .catch(err => console.error('Error cargando el header:', err));
  }

  initHeaderFunctionality() {
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

    // Verificar que todos los elementos existen
    if (!overlay || !hamburguerMenu || !searchModal) {
      console.error('No se encontraron los elementos del header');
      return;
    }

    // Función para abrir el menú hamburguesa
    const openMenu = () => {
      hamburguerMenu.classList.add('active');
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    };

    // Función para cerrar el menú hamburguesa
    const closeMenu = () => {
      hamburguerMenu.classList.remove('active');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    };

    // Función para abrir el buscador
    const openSearch = () => {
      searchModal.classList.add('active');
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      
      // Enfocar el input de búsqueda
      const searchInput = searchModal.querySelector('.search-input');
      setTimeout(() => searchInput?.focus(), 100);
    };

    // Función para cerrar el buscador
    const closeSearch = () => {
      searchModal.classList.remove('active');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    };

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
      if (e.target === searchModal) {
        closeSearch();
      }
    });

    // Evitar que el clic en el menú cierre el modal
    hamburguerMenu.addEventListener('click', (e) => {
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
  }
}

// Registramos la etiqueta personalizada
customElements.define('afergolf-header', AfergolfHeader);

//----------------------------------------------------------------------------

// Definimos una clase para el componente del header_admin
class AfergolfHeaderAdmin extends HTMLElement {
  connectedCallback() {
    // Traemos el archivo header_admin.html que está dentro de /front/partials
    fetch('/front/partials/header_admin.html')
      .then(response => response.text())
      .then(html => {
        this.innerHTML = html;
      })
      .catch(err => console.error('Error cargando el header_admin:', err));
  }
}

// Registramos la etiqueta personalizada
customElements.define('afergolf-header-admin', AfergolfHeaderAdmin);

//----------------------------------------------------------------------------

// Definimos una clase para el componente del footer
class AfergolfFooter extends HTMLElement {
  connectedCallback() {
    // Traemos el archivo footer.html que está dentro de /front/partials
    fetch('/front/partials/footer.html')
      .then(response => response.text())
      .then(html => {
        this.innerHTML = html;
      })
      .catch(err => console.error('Error cargando el footer:', err));
  }
}

// Registramos la etiqueta personalizada
customElements.define('afergolf-footer', AfergolfFooter);

//----------------------------------------------------------------------------

// Carrusel de productos
class ProductsCarousel {
  constructor() {
    this.viewport = null;
    this.track = null;
    this.prevBtn = null;
    this.nextBtn = null;
    
    this.init();
  }

  /**
   * Initialize the carousel
   */
  init() {
    this.bindElements();
    if (!this.viewport || !this.prevBtn || !this.nextBtn) {
      return; // No hay carrusel en esta página
    }
    
    this.bindEvents();
  }

  /**
   * Bind DOM elements
   */
  bindElements() {
    const slider = document.querySelector('.productos-slider[data-slider]');
    if (!slider) return;
    
    this.viewport = slider.querySelector('[data-viewport]');
    this.track = slider.querySelector('[data-track]');
    this.prevBtn = slider.querySelector('[data-prev]');
    this.nextBtn = slider.querySelector('[data-next]');
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    this.prevBtn.addEventListener('click', () => {
      this.scrollPrevious();
    });
    
    this.nextBtn.addEventListener('click', () => {
      this.scrollNext();
    });
  }

  /**
   * Calculate scroll step based on product width
   */
  getScrollStep() {
    const productWidth = 280 + 30; // width + gap
    return productWidth * 2; // Scroll 2 products at a time
  }

  /**
   * Scroll to previous items
   */
  scrollPrevious() {
    this.viewport.scrollBy({
      left: -this.getScrollStep(),
      behavior: 'smooth'
    });
  }

  /**
   * Scroll to next items
   */
  scrollNext() {
    this.viewport.scrollBy({
      left: this.getScrollStep(),
      behavior: 'smooth'
    });
  }
}

// Initialize products carousel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ProductsCarousel();
});