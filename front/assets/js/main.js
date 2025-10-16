// Definimos una clase para el componente del header
class AfergolfHeader extends HTMLElement {
  connectedCallback() {
    // Traemos el archivo header.html que está dentro de /front/partials
    fetch('/front/partials/header.html')
      .then(response => response.text())
      .then(html => {
        this.innerHTML = html;
      })
      .catch(err => console.error('Error cargando el header:', err));
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