/**
 * ============================================================================
 * AFERGOLF - Catálogo de Productos (vista pública)
 * ============================================================================
 * Carga los productos desde el backend y los pinta en catalog.html,
 * usando imagen_principal (base64) o un placeholder si no hay imagen.
 * ============================================================================
 */

const CATALOG_API_URL = 'http://localhost/AFERGOLF/back/modules/products/api/catalog.php';

/**
 * Formatea precio en COP
 */
function formatPrice(price) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price || 0);
}

/**
 * Carga productos desde la API aplicando filtros (tipo/marca)
 */
async function loadCatalogProducts() {
  const tipoSelect = document.getElementById('tipo');
  const marcaSelect = document.getElementById('marca');

  const categoria = tipoSelect ? tipoSelect.value : '';
  const marca = marcaSelect ? marcaSelect.value : '';

  const params = new URLSearchParams();
  if (categoria) params.append('categoria', categoria);
  if (marca) params.append('marca', marca);

  const url =
    params.toString().length > 0
      ? `${CATALOG_API_URL}?${params.toString()}`
      : CATALOG_API_URL;

  try {
    const response = await fetch(url, { method: 'GET' });
    const result = await response.json();

    if (result.success) {
      renderCatalogProducts(result.productos || []);
    } else {
      console.error(result.message || 'Error al cargar catálogo');
      renderCatalogProducts([]);
    }
  } catch (error) {
    console.error('Error al conectar con el servidor:', error);
    renderCatalogProducts([]);
  }
}

/**
 * Pinta las tarjetas de productos en el contenedor
 */
function renderCatalogProducts(productos) {
  const container = document.getElementById('catalog-products');
  if (!container) return;

  container.innerHTML = '';

  if (!productos || productos.length === 0) {
    const empty = document.createElement('p');
    empty.textContent = 'No se encontraron productos para los filtros seleccionados.';
    empty.className = 'catalogo-empty';
    container.appendChild(empty);
    return;
  }

  productos.forEach((producto) => {
    const card = document.createElement('article');
    card.className = 'catalogo-producto';

    // ---------------- Imagen ----------------
    const img = document.createElement('img');
    img.loading = 'lazy';
    img.alt = producto.nombre || 'Producto AFERGOLF';

    // aquí usamos la imagen_principal en base64;
    // si no existe, usamos un placeholder de /front/assets/img/placeholder.svg
    let src = producto.imagen_principal;

    if (!src || src.trim() === '') {
      src = '../assets/img/placeholder.svg';
    }

    img.src = src;
    card.appendChild(img);

    // ---------------- Nombre ----------------
    const title = document.createElement('h3');
    title.textContent = producto.nombre || 'Producto sin nombre';
    card.appendChild(title);

    // ---------------- Precio ----------------
    const price = document.createElement('p');
    price.className = 'catalogo-precio';
    price.textContent = formatPrice(producto.precio);
    card.appendChild(price);

    // ---------------- Tallas (solo guantes) ----------------
    if (producto.categoria === 'guantes') {
      const tallasContainer = document.createElement('div');
      tallasContainer.className = 'catalogo-tallas';

      const tallas = [
        { label: 'S', value: producto.stock_talla_s },
        { label: 'M', value: producto.stock_talla_m },
        { label: 'L', value: producto.stock_talla_l },
        { label: 'XL', value: producto.stock_talla_xl },
        { label: 'XXL', value: producto.stock_talla_xxl },
      ];

      tallas.forEach((t) => {
        const total = parseInt(t.value ?? 0, 10);
        if (total > 0) {
          const btn = document.createElement('button');
          btn.textContent = t.label;
          tallasContainer.appendChild(btn);
        }
      });

      if (tallasContainer.children.length > 0) {
        card.appendChild(tallasContainer);
      }
    }

    container.appendChild(card);
  });
}

/**
 * Configura eventos de filtros
 */
function setupCatalogFilters() {
  const tipoSelect = document.getElementById('tipo');
  const marcaSelect = document.getElementById('marca');

  if (tipoSelect) {
    tipoSelect.addEventListener('change', loadCatalogProducts);
  }
  if (marcaSelect) {
    marcaSelect.addEventListener('change', loadCatalogProducts);
  }
}

/**
 * Inicializa el módulo de catálogo cuando esté listo el DOM
 */
function initializeCatalogPage() {
  if (!document.getElementById('catalog-products')) return;

  setupCatalogFilters();
  loadCatalogProducts();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeCatalogPage);
} else {
  initializeCatalogPage();
}
