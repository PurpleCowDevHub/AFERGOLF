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