/**
 * Catálogo AFERGOLF - Carga dinámica desde backend
 * y navegación a la vista de detalles de producto.
 */

const CATALOG_API_URL = "../../back/modules/products/api/catalog.php";

// Variable global para recordar el término de búsqueda actual
let currentSearchQuery = "";

document.addEventListener("DOMContentLoaded", () => {
  // Leer el parámetro ?q= de la URL (búsqueda desde el header)
  const params = new URLSearchParams(window.location.search);
  currentSearchQuery = (params.get("q") || "").trim().toLowerCase();

  loadCatalogProducts();

  const tipoSelect = document.getElementById("tipo");
  const marcaSelect = document.getElementById("marca");

  if (tipoSelect) tipoSelect.addEventListener("change", loadCatalogProducts);
  if (marcaSelect) marcaSelect.addEventListener("change", loadCatalogProducts);
});

async function loadCatalogProducts() {
  const container = document.getElementById("catalogo-productos");
  if (!container) return;

  container.innerHTML = `
    <div style="
      width: 100%;
      padding: 40px 20px;
      text-align: center;
      color: #555;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    ">
      <p style="font-size: 1rem;">Cargando productos...</p>
    </div>
  `;

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

  const q = currentSearchQuery; // ya viene en minúsculas

  return productos.filter((p) => {
    const matchTipo = tipo === "" || p.categoria === tipo;
    const matchMarca = marca === "" || p.marca === marca;

    // Campos donde vamos a buscar el texto libre
    const nombre = (p.nombre || "").toLowerCase();
    const descripcion =
      (p.descripcion || p.descripcion_corta || "").toLowerCase();
    const marcaProd = (p.marca || "").toLowerCase();
    const categoriaProd = (p.categoria || "").toLowerCase();
    const referencia = (p.referencia || "").toLowerCase();

    const matchBusqueda =
      q === "" ||
      nombre.includes(q) ||
      descripcion.includes(q) ||
      marcaProd.includes(q) ||
      categoriaProd.includes(q) ||
      referencia.includes(q);

    return matchTipo && matchMarca && matchBusqueda;
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

    // Calcular stock total
    const stockTotal = calcularStockTotal(p);
    const stockBadge = getStockBadge(stockTotal);
    
    // Nombre de categoría formateado
    const categoriaNombre = {
      palos: 'Palos',
      bolas: 'Bolas',
      guantes: 'Guantes'
    }[p.categoria] || p.categoria;

    article.innerHTML = `
      <div class="catalogo-producto-img">
        <img src="${imagenPrincipal}" alt="${p.nombre}" loading="lazy">
        <span class="catalogo-categoria-badge ${p.categoria}">${categoriaNombre}</span>
        ${stockBadge}
      </div>
      <div class="catalogo-producto-content">
        <span class="catalogo-marca">${p.marca || 'AFERGOLF'}</span>
        <h3>${p.nombre}</h3>
        ${renderTallas(p)}
        <div class="catalogo-producto-footer">
          <p class="catalogo-precio">${formatPrice(p.precio)}</p>
        </div>
      </div>
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

/**
 * Calcula el stock total de un producto
 */
function calcularStockTotal(producto) {
  if (producto.categoria === 'guantes') {
    return (parseInt(producto.stock_talla_s) || 0) +
           (parseInt(producto.stock_talla_m) || 0) +
           (parseInt(producto.stock_talla_l) || 0) +
           (parseInt(producto.stock_talla_xl) || 0) +
           (parseInt(producto.stock_talla_xxl) || 0);
  }
  return parseInt(producto.stock) || 0;
}

/**
 * Genera el badge de stock según la cantidad disponible
 */
function getStockBadge(stock) {
  if (stock === 0) {
    return '<span class="catalogo-stock-badge out-stock">Agotado</span>';
  } else if (stock <= 5) {
    return `<span class="catalogo-stock-badge low-stock">¡Últimas ${stock}!</span>`;
  } else {
    return '<span class="catalogo-stock-badge in-stock">Disponible</span>';
  }
}

function renderEmptyState() {
  const container = document.getElementById("catalogo-productos");
  if (!container) return;

  const mensajeBusqueda = currentSearchQuery
    ? `No encontramos resultados para <strong>"${currentSearchQuery}"</strong>.`
    : "No se encontraron productos para los filtros seleccionados.";

  container.innerHTML = `
    <div style="
      width: 100%;
      padding: 80px 20px;
      text-align: center;
      color: #555;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 320px;
      transform: translateX(290px); 
    ">
      <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="#b0b0b0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>

      <p style="
        margin-top: 20px;
        font-size: 1.2rem;
        max-width: 480px;
        line-height: 1.5;
      ">
        ${mensajeBusqueda}
      </p>

      <p style="margin-top: 10px; color: #888; font-size: 0.9rem;">
        Intenta buscar otra palabra o revisar la ortografía.
      </p>
    </div>
  `;
}