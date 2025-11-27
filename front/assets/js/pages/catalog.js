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
    const matchMarca = marca === "" || p.marca === marca;
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
    <p style="padding: 20px; font-size: 1rem;">
      No se encontraron productos para los filtros seleccionados.
    </p>
  `;
}
