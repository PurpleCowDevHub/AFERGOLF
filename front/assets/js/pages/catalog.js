/**
 * Catálogo AFERGOLF - Carga dinámica desde backend
 * y navegación a la vista de detalles de producto.
 */

const CATALOG_API_URL = "../../back/modules/products/api/catalog.php";

document.addEventListener("DOMContentLoaded", () => {
  loadCatalogProducts();

  const tipoSelect = document.getElementById("tipo");
  const marcaSelect = document.getElementById("marca");

  if (tipoSelect) tipoSelect.addEventListener("change", loadCatalogProducts);
  if (marcaSelect) marcaSelect.addEventListener("change", loadCatalogProducts);
});

async function loadCatalogProducts() {
  const container = document.getElementById("catalogo-productos");
  if (!container) return;

  container.innerHTML = `<p style="padding: 20px;">Cargando productos...</p>`;

  try {
    const response = await fetch(CATALOG_API_URL);
    const data = await response.json();

    if (!data.success || !data.productos || data.productos.length === 0) {
      renderEmptyState();
      return;
    }

    const productos = filterProducts(data.productos);
    renderProducts(productos);
  } catch (error) {
    console.error("Error cargando catálogo:", error);
    renderEmptyState();
  }
}

function filterProducts(productos) {
  const tipo = document.getElementById("tipo")?.value || "";
  const marca = document.getElementById("marca")?.value || "";

  return productos.filter((p) => {
    const matchTipo = tipo === "" || p.categoria === tipo;
    const matchMarca = marca === "" || (p.marca && p.marca.toLowerCase() === marca.toLowerCase());
    return matchTipo && matchMarca;
  });
}

function renderProducts(productos) {
  const container = document.getElementById("catalogo-productos");
  if (!container) return;

  container.innerHTML = "";

  if (!productos || productos.length === 0) {
    renderEmptyState();
    return;
  }

  productos.forEach((p) => {
    const article = document.createElement("article");
    article.className = "catalogo-producto";
    article.dataset.referencia = p.referencia;

    const imagenPrincipal =
      p.imagen_principal || "../assets/img/Catalog/Guante Footjoy GTXtreme.jpeg";

    article.innerHTML = `
      <img src="${imagenPrincipal}" alt="${p.nombre}" loading="lazy">
      <h3>${p.nombre}</h3>
      <p class="catalogo-precio">${formatPrice(p.precio)}</p>
      ${renderTallas(p)}
    `;

    // 👉 Al hacer click en la tarjeta → ir a detalles
    article.addEventListener("click", () => {
      if (!p.referencia) return;
      window.location.href = `./product_details.html?ref=${encodeURIComponent(
        p.referencia
      )}`;
    });

    container.appendChild(article);
  });
}

function renderTallas(producto) {
  if (producto.categoria !== "guantes") return "";

  const tallas = [];

  if (producto.stock_talla_s > 0) tallas.push("<button>S</button>");
  if (producto.stock_talla_m > 0) tallas.push("<button>M</button>");
  if (producto.stock_talla_l > 0) tallas.push("<button>L</button>");
  if (producto.stock_talla_xl > 0) tallas.push("<button>XL</button>");
  if (producto.stock_talla_xxl > 0) tallas.push("<button>XXL</button>");

  if (tallas.length === 0) return "";

  return `<div class="catalogo-tallas">${tallas.join("")}</div>`;
}

function formatPrice(price) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(price || 0);
}

function renderEmptyState() {
  const container = document.getElementById("catalogo-productos");
  if (!container) return;

  container.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <path d="M16 10a4 4 0 0 1-8 0"></path>
        </svg>
        <span class="empty-state-badge">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </span>
      </div>
      <h3 class="empty-state-title">No encontramos productos</h3>
      <p class="empty-state-description">
        No hay productos que coincidan con los filtros seleccionados. Intenta ajustar tus criterios de búsqueda.
      </p>
      <div class="empty-state-actions">
        <button class="btn-secondary" onclick="clearFilters()">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18"></path>
            <path d="M7 12h10"></path>
            <path d="M10 18h4"></path>
          </svg>
          Limpiar filtros
        </button>
      </div>
    </div>
  `;
}

/**
 * Limpia los filtros y recarga los productos
 */
function clearFilters() {
  const tipoSelect = document.getElementById("tipo");
  const marcaSelect = document.getElementById("marca");
  
  if (tipoSelect) tipoSelect.value = "";
  if (marcaSelect) marcaSelect.value = "";
  
  loadCatalogProducts();
}
