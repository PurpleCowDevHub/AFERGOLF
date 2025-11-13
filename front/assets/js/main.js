/**
 * ============================================================================
 * AFERGOLF - Main JavaScript
 * ============================================================================
 * 
 * Componentes web personalizados para la carga dinámica de partials HTML.
 * 
 * @author Afergolf Team
 * @version 1.0.0
 * ============================================================================
 */

// ============================================================================
// COMPONENTE: HEADER PRINCIPAL
// ============================================================================

/**
 * Componente web personalizado para el header principal del sitio.
 * Carga dinámicamente el header desde un archivo HTML parcial y ejecuta sus scripts.
 * 
 * @class AfergolfHeader
 * @extends {HTMLElement}
 */
class AfergolfHeader extends HTMLElement {
  /**
   * Se ejecuta cuando el elemento es añadido al DOM.
   */
  connectedCallback() {
    // Calcular la ruta relativa al partial basada en la ubicación actual
    const path = this.getRelativePath('header.html');
    fetch(path)
      .then(response => response.text())
      .then(html => {
        this.innerHTML = html;
        this.executeScripts();
      })
      .catch(err => console.error('Error cargando el header:', err));
  }

  /**
   * Calcula la ruta relativa correcta al archivo partial.
   * @param {string} filename - Nombre del archivo partial
   * @returns {string} Ruta relativa al archivo
   */
  getRelativePath(filename) {
    const path = window.location.pathname;
    // Si estamos en /front/views/, subir un nivel
    if (path.includes('/front/views/')) {
      return `../partials/${filename}`;
    }
    // Si estamos en la raíz o en /front/
    return `front/partials/${filename}`;
  }

  /**
   * Ejecuta los scripts cargados dinámicamente.
   * Necesario porque innerHTML no ejecuta scripts automáticamente.
   */
  executeScripts() {
    this.querySelectorAll('script').forEach(oldScript => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach(attr => 
        newScript.setAttribute(attr.name, attr.value)
      );
      newScript.textContent = oldScript.textContent;
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });
  }
}

customElements.define('afergolf-header', AfergolfHeader);

// ============================================================================
// COMPONENTE: FOOTER
// ============================================================================

/**
 * Componente web personalizado para el footer del sitio.
 * Carga dinámicamente el footer desde un archivo HTML parcial.
 * 
 * @class AfergolfFooter
 * @extends {HTMLElement}
 */
class AfergolfFooter extends HTMLElement {
  /**
   * Se ejecuta cuando el elemento es añadido al DOM.
   */
  connectedCallback() {
    // Calcular la ruta relativa al partial basada en la ubicación actual
    const path = this.getRelativePath('footer.html');
    fetch(path)
      .then(response => response.text())
      .then(html => this.innerHTML = html)
      .catch(err => console.error('Error cargando el footer:', err));
  }

  /**
   * Calcula la ruta relativa correcta al archivo partial.
   * @param {string} filename - Nombre del archivo partial
   * @returns {string} Ruta relativa al archivo
   */
  getRelativePath(filename) {
    const path = window.location.pathname;
    // Si estamos en /front/views/, subir un nivel
    if (path.includes('/front/views/')) {
      return `../partials/${filename}`;
    }
    // Si estamos en la raíz o en /front/
    return `front/partials/${filename}`;
  }
}

customElements.define('afergolf-footer', AfergolfFooter);