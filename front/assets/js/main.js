/**
 * ============================================================================
 * AFERGOLF - Main JavaScript
 * ============================================================================
 * 
 * Este archivo contiene los componentes web personalizados y funcionalidades
 * principales del sitio web de Afergolf.
 * 
 * Componentes:
 * - AfergolfHeader: Header principal (carga dinámica)
 * - AfergolfFooter: Footer del sitio
 * 
 * @author Afergolf Team
 * @version 1.0.0
 */

// ============================================================================
// COMPONENTE: HEADER PRINCIPAL
// ============================================================================

/**
 * Componente web personalizado para el header principal del sitio.
 * Carga dinámicamente el header desde un archivo HTML parcial.
 * 
 * @class AfergolfHeader
 * @extends {HTMLElement}
 */
class AfergolfHeader extends HTMLElement {
  /**
   * Se ejecuta cuando el elemento es añadido al DOM.
   * Carga el archivo header.html y ejecuta los scripts incluidos.
   */
  connectedCallback() {
    // Traemos el archivo header.html que está dentro de /front/partials
    fetch('/front/partials/header.html')
      .then(response => response.text())
      .then(html => {
        this.innerHTML = html;
        // Ejecutar los scripts que están dentro del HTML cargado
        this.executeScripts();
      })
      .catch(err => console.error('Error cargando el header:', err));
  }

  /**
   * Ejecuta los scripts que fueron cargados con el HTML.
   * Necesario porque innerHTML no ejecuta scripts automáticamente.
   */
  executeScripts() {
    const scripts = this.querySelectorAll('script');
    scripts.forEach(oldScript => {
      const newScript = document.createElement('script');
      // Copiar atributos
      Array.from(oldScript.attributes).forEach(attr => {
        newScript.setAttribute(attr.name, attr.value);
      });
      // Copiar contenido
      newScript.textContent = oldScript.textContent;
      // Reemplazar el script antiguo por el nuevo
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });
  }
}

// Registramos la etiqueta personalizada <afergolf-header>
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
   * Carga el archivo footer.html.
   */
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

// Registramos la etiqueta personalizada <afergolf-footer>
customElements.define('afergolf-footer', AfergolfFooter);

