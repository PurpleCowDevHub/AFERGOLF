/**
 * ============================================================================
 * AFERGOLF - Animations & Effects Module
 * ============================================================================
 * 
 * Carousel de productos, animaciones y efectos visuales.
 * 
 * @author Afergolf Team
 * @version 1.0.0
 * ============================================================================
 */

// ============================================================================
// CAROUSEL DE PRODUCTOS
// ============================================================================

class ProductsCarousel {
  constructor() {
    this.slider = null;
    this.track = null;
    this.viewport = null;
    this.prevButton = null;
    this.nextButton = null;
    this.products = [];
    this.currentIndex = 0;
    this.productWidth = 370;
    this.visibleProducts = 3;
    this.maxIndex = 0;
    
    // Variables para touch/swipe
    this.startX = 0;
    this.currentX = 0;
    this.isDragging = false;
    this.startTime = 0;
    
    this.init();
  }

  /**
   * Inicializa el carousel.
   */
  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  /**
   * Configura todos los elementos y eventos del carousel.
   */
  setup() {
    this.slider = document.querySelector('[data-slider]');
    this.track = document.querySelector('[data-track]');
    this.viewport = document.querySelector('[data-viewport]');
    this.prevButton = document.querySelector('[data-prev]');
    this.nextButton = document.querySelector('[data-next]');

    if (!this.slider || !this.track || !this.viewport || !this.prevButton || !this.nextButton) {
      console.warn('Elementos del carousel no encontrados');
      return;
    }

    this.products = Array.from(this.track.querySelectorAll('.product'));
    
    if (this.products.length === 0) {
      console.warn('No se encontraron productos en el carousel');
      return;
    }

    this.calculateDimensions();
    this.maxIndex = Math.max(0, this.products.length - this.visibleProducts);
    this.setupEvents();
    this.updateButtons();
    
    setTimeout(() => this.recalculateAndUpdate(), 100);
    
    console.log('Carousel de productos inicializado correctamente');
  }

  /**
   * Calcula las dimensiones según el tamaño de pantalla.
   */
  calculateDimensions() {
    const screenWidth = window.innerWidth;
    
    if (screenWidth <= 430) {
      this.visibleProducts = 1;
    } else if (screenWidth <= 768) {
      this.visibleProducts = 2;
    } else if (screenWidth <= 1200) {
      this.visibleProducts = 3;
    } else {
      this.visibleProducts = 3;
    }

    if (this.products.length > 0) {
      const firstProduct = this.products[0];
      const productRect = firstProduct.getBoundingClientRect();
      const trackStyles = window.getComputedStyle(this.track);
      const gap = parseInt(trackStyles.gap) || 20;
      
      this.productWidth = productRect.width + gap;
      
      const viewportWidth = this.viewport.getBoundingClientRect().width;
      const marginLeft = parseInt(trackStyles.marginLeft) || 30;
      const marginRight = parseInt(trackStyles.marginRight) || 30;
      const availableWidth = viewportWidth - marginLeft - marginRight;
      const totalProductsWidth = this.products.length * this.productWidth;
      
      if (totalProductsWidth <= availableWidth) {
        this.maxIndex = 0;
      } else {
        const availableScrollWidth = totalProductsWidth - availableWidth;
        this.maxIndex = Math.ceil(availableScrollWidth / this.productWidth);
      }
    } else {
      this.productWidth = screenWidth <= 430 ? 370 : 370;
      this.maxIndex = Math.max(0, this.products.length - this.visibleProducts);
    }
  }

  /**
   * Configura todos los event listeners.
   */
  setupEvents() {
    this.prevButton.addEventListener('click', () => this.prev());
    this.nextButton.addEventListener('click', () => this.next());
    window.addEventListener('resize', () => this.handleResize());
    this.setupTouchEvents();
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));
  }

  /**
   * Configura eventos táctiles para swipe.
   */
  setupTouchEvents() {
    this.viewport.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
    this.viewport.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
    this.viewport.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });
    this.viewport.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    this.viewport.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.viewport.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    this.viewport.addEventListener('mouseleave', (e) => this.handleMouseUp(e));
    this.track.addEventListener('dragstart', (e) => e.preventDefault());
  }

  /**
   * Maneja el inicio del touch/mouse.
   */
  handleTouchStart(e) {
    this.startX = e.touches ? e.touches[0].clientX : e.clientX;
    this.currentX = this.startX;
    this.isDragging = true;
    this.startTime = Date.now();
    this.track.style.transition = 'none';
  }

  handleMouseDown(e) {
    e.preventDefault();
    this.handleTouchStart(e);
  }

  /**
   * Maneja el movimiento del touch/mouse.
   */
  handleTouchMove(e) {
    if (!this.isDragging) return;
    
    this.currentX = e.touches ? e.touches[0].clientX : e.clientX;
    const deltaX = this.currentX - this.startX;
    
    let resistance = 1;
    if ((this.currentIndex === 0 && deltaX > 0) || 
        (this.currentIndex === this.maxIndex && deltaX < 0)) {
      resistance = 0.3;
    }
    
    const currentTransform = -this.currentIndex * this.productWidth;
    const newTransform = currentTransform + (deltaX * resistance);
    
    this.track.style.transform = `translateX(${newTransform}px)`;
    
    if (Math.abs(deltaX) > 10) {
      e.preventDefault();
    }
  }

  handleMouseMove(e) {
    if (!this.isDragging) return;
    this.handleTouchMove(e);
  }

  /**
   * Maneja el final del touch/mouse.
   */
  handleTouchEnd(e) {
    if (!this.isDragging) return;
    
    this.isDragging = false;
    this.track.style.transition = 'transform 0.3s ease';
    
    const deltaX = this.currentX - this.startX;
    const deltaTime = Date.now() - this.startTime;
    const velocity = Math.abs(deltaX) / deltaTime;
    
    const threshold = this.productWidth * 0.3;
    const shouldChange = Math.abs(deltaX) > threshold || velocity > 0.5;
    
    if (shouldChange) {
      if (deltaX > 0 && this.currentIndex > 0) {
        this.prev();
      } else if (deltaX < 0 && this.currentIndex < this.maxIndex) {
        this.next();
      } else {
        this.updatePosition();
      }
    } else {
      this.updatePosition();
    }
  }

  handleMouseUp(e) {
    this.handleTouchEnd(e);
  }

  /**
   * Maneja navegación por teclado.
   */
  handleKeyboard(e) {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      this.prev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      this.next();
    }
  }

  /**
   * Maneja el redimensionamiento de ventana.
   */
  handleResize() {
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => this.recalculateAndUpdate(), 250);
  }

  /**
   * Recalcula dimensiones y actualiza posición.
   */
  recalculateAndUpdate() {
    this.track.style.transition = 'none';
    this.calculateDimensions();
    this.currentIndex = Math.min(this.currentIndex, this.maxIndex);
    this.updatePosition();
    this.updateButtons();
    requestAnimationFrame(() => {
      this.track.style.transition = 'transform 0.3s ease';
    });
  }

  /**
   * Navega al producto anterior.
   */
  prev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.updatePosition();
      this.updateButtons();
    }
  }

  /**
   * Navega al siguiente producto.
   */
  next() {
    if (this.currentIndex < this.maxIndex) {
      this.currentIndex++;
      this.updatePosition();
      this.updateButtons();
    }
  }

  /**
   * Actualiza la posición del carousel.
   */
  updatePosition() {
    const trackStyles = window.getComputedStyle(this.track);
    const marginLeft = parseInt(trackStyles.marginLeft) || 30;
    const marginRight = parseInt(trackStyles.marginRight) || 30;
    
    const viewportWidth = this.viewport.getBoundingClientRect().width;
    const trackWidth = this.products.length * this.productWidth;
    const availableWidth = viewportWidth - marginLeft - marginRight;
    
    const maxTranslate = Math.max(0, trackWidth - availableWidth);
    
    let translateX = -this.currentIndex * this.productWidth;
    
    if (Math.abs(translateX) > maxTranslate) {
      translateX = -maxTranslate;
      this.currentIndex = Math.floor(maxTranslate / this.productWidth);
    }
    
    this.track.style.transform = `translateX(${translateX}px)`;
  }

  /**
   * Actualiza el estado de los botones de navegación.
   */
  updateButtons() {
    this.prevButton.style.opacity = this.currentIndex === 0 ? '0.5' : '1';
    this.prevButton.style.cursor = this.currentIndex === 0 ? 'not-allowed' : 'pointer';
    
    this.nextButton.style.opacity = this.currentIndex >= this.maxIndex ? '0.5' : '1';
    this.nextButton.style.cursor = this.currentIndex >= this.maxIndex ? 'not-allowed' : 'pointer';
  }

  /**
   * Va a un índice específico.
   */
  goTo(index) {
    if (index >= 0 && index <= this.maxIndex) {
      this.currentIndex = index;
      this.updatePosition();
      this.updateButtons();
    }
  }

  /**
   * Reinicia el carousel al primer elemento.
   */
  reset() {
    this.currentIndex = 0;
    this.updatePosition();
    this.updateButtons();
  }
}

// ============================================================================
// INICIALIZACIÓN DEL CAROUSEL
// ============================================================================

let productsCarousel = null;

// Inicializar el carousel si existe en la página
if (document.querySelector('[data-slider]')) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      productsCarousel = new ProductsCarousel();
    });
  } else {
    productsCarousel = new ProductsCarousel();
  }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.ProductsCarousel = ProductsCarousel;
  window.carousel = productsCarousel;
  window.productsCarousel = productsCarousel;
}
