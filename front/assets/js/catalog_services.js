class ServicesCarousel {
  constructor() {
    this.viewport = null;
    this.track = null;
    this.prevBtn = null;
    this.nextBtn = null;
    this.autoplayInterval = null;
    this.autoplayDelay = 5000; // 5 seconds
    
    this.init();
  }

  /**
   * Initialize the carousel
   */
  init() {
    this.bindElements();
    if (!this.viewport || !this.track || !this.prevBtn || !this.nextBtn) {
      console.warn('ServicesCarousel: Required elements not found');
      return;
    }
    
    this.setupViewport();
    this.bindEvents();
    this.startAutoplay();
  }

  /**
   * Bind DOM elements
   */
  bindElements() {
    this.viewport = document.querySelector('[data-viewport]');
    this.track = document.querySelector('[data-track]');
    this.prevBtn = document.querySelector('[data-prev]');
    this.nextBtn = document.querySelector('[data-next]');
  }

  /**
   * Setup viewport styles
   */
  setupViewport() {
    this.viewport.style.overflow = 'hidden';
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    this.prevBtn.addEventListener('click', () => this.scrollPrevious());
    this.nextBtn.addEventListener('click', () => this.scrollNext());
    
    // Pause autoplay on hover
    this.viewport.addEventListener('pointerenter', () => this.stopAutoplay());
    this.viewport.addEventListener('pointerleave', () => this.startAutoplay());
    
    // Pause autoplay when user manually interacts
    this.prevBtn.addEventListener('click', () => this.resetAutoplay());
    this.nextBtn.addEventListener('click', () => this.resetAutoplay());
  }

  /**
   * Calculate scroll step based on viewport width
   */
  getScrollStep() {
    return this.viewport.clientWidth * 0.9;
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

  /**
   * Start autoplay functionality
   */
  startAutoplay() {
    this.stopAutoplay(); // Clear any existing interval
    this.autoplayInterval = setInterval(() => {
      this.scrollNext();
    }, this.autoplayDelay);
  }

  /**
   * Stop autoplay functionality
   */
  stopAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }

  /**
   * Reset autoplay after manual interaction
   */
  resetAutoplay() {
    this.stopAutoplay();
    setTimeout(() => this.startAutoplay(), 2000); // Resume after 2 seconds
  }

  /**
   * Destroy the carousel and clean up event listeners
   */
  destroy() {
    this.stopAutoplay();
    
    if (this.prevBtn) {
      this.prevBtn.removeEventListener('click', this.scrollPrevious);
    }
    if (this.nextBtn) {
      this.nextBtn.removeEventListener('click', this.scrollNext);
    }
    if (this.viewport) {
      this.viewport.removeEventListener('pointerenter', this.stopAutoplay);
      this.viewport.removeEventListener('pointerleave', this.startAutoplay);
    }
  }
}

// Initialize carousel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ServicesCarousel();
});

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ServicesCarousel;
}