/**
 * Featured Products - Carga dinámica desde la base de datos
 * Muestra productos recientes en el carrusel de la página principal (index.html)
 */

const FEATURED_PRODUCTS_API = "back/modules/products/api/catalog.php";
const MAX_FEATURED_PRODUCTS = 9; // Máximo de productos a mostrar

/**
 * Construye la URL correcta de la imagen
 * Usa la configuración centralizada si está disponible
 */
function getImageUrl(imagePath) {
  if (!imagePath) return null;
  
  // Si ya es una URL absoluta, retornarla tal cual
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  
  // Usar función centralizada si está disponible
  if (typeof normalizeImagePath === 'function') {
    const normalized = normalizeImagePath(imagePath);
    // Quitar la barra inicial para que sea relativa desde index.html
    return normalized.startsWith('/') ? normalized.substring(1) : normalized;
  }
  
  // Fallback: limpiar manualmente el prefijo /AFERGOLF/
  if (imagePath.includes("/AFERGOLF/uploads/")) {
    return imagePath.replace(/^.*\/AFERGOLF\//, "");
  }
  
  // Si es una ruta de uploads, construir desde la raíz del proyecto
  if (imagePath.startsWith("uploads/")) {
    return `${imagePath}`;
  }
  
  // Si comienza con /, remover la barra
  if (imagePath.startsWith("/uploads/")) {
    return imagePath.substring(1);
  }
  
  // Si ya contiene ../, devolverlo tal cual
  if (imagePath.includes("../")) {
    return imagePath;
  }
  
  // Por defecto, asumir que es relativa a assets
  return `front/assets/img/${imagePath}`;
}

document.addEventListener("DOMContentLoaded", () => {
  loadFeaturedProducts();
});

/**
 * Carga productos destacados desde la API
 */
async function loadFeaturedProducts() {
  const productsTrack = document.querySelector(".products[data-track]");
  
  if (!productsTrack) {
    return;
  }

  try {
    const response = await fetch(FEATURED_PRODUCTS_API);
    
    const data = await response.json();

    if (!data.success || !data.productos || data.productos.length === 0) {
      renderEmptyFeaturedState(productsTrack);
      return;
    }

    // Tomar solo los primeros MAX_FEATURED_PRODUCTS (productos recientes)
    const featuredProducts = data.productos.slice(0, MAX_FEATURED_PRODUCTS);

    // Limpiar productos estáticos
    productsTrack.innerHTML = "";

    // Renderizar productos
    featuredProducts.forEach((product, index) => {
      const article = createProductCard(product);
      productsTrack.appendChild(article);
    });
    
    // Reinicializar el carousel después de renderizar los productos
    setTimeout(() => {
      if (window.carousel) {
        window.carousel.setup();
      }
    }, 100);

  } catch (error) {
    renderEmptyFeaturedState(productsTrack);
  }
}

/**
 * Crea una tarjeta de producto
 */
function createProductCard(product) {
  const article = document.createElement("article");
  article.className = "product";
  article.style.cursor = "pointer";
  article.dataset.referencia = product.referencia;

  // Usar la imagen principal del producto o una por defecto
  const imagenPrincipal = getImageUrl(product.imagen_principal) || "front/assets/img/Catalog/placeholder.jpg";

  // Calcular stock total
  const stockTotal = calcularStockTotal(product);
  const stockBadge = getStockBadge(stockTotal);
  
  // Nombre de categoría formateado
  const categoriaNombre = {
    palos: 'Palos',
    bolas: 'Bolas',
    guantes: 'Guantes'
  }[product.categoria] || product.categoria;

  // Renderizar tallas si es guante
  let tallasHTML = "";
  if (product.categoria === "guantes") {
    const tallas = [];
    if (product.stock_talla_s > 0) tallas.push("<button>S</button>");
    if (product.stock_talla_m > 0) tallas.push("<button>M</button>");
    if (product.stock_talla_l > 0) tallas.push("<button>L</button>");
    if (product.stock_talla_xl > 0) tallas.push("<button>XL</button>");
    if (product.stock_talla_xxl > 0) tallas.push("<button>XXL</button>");

    if (tallas.length > 0) {
      tallasHTML = `<div class="catalogo-tallas">${tallas.join("")}</div>`;
    }
  }

  article.innerHTML = `
    <div class="catalogo-producto-img">
      <img src="${imagenPrincipal}" alt="${product.nombre}" loading="lazy">
      <span class="catalogo-categoria-badge ${product.categoria}">${categoriaNombre}</span>
      ${stockBadge}
    </div>
    <div class="catalogo-producto-content">
      <span class="catalogo-marca">${product.marca || 'AFERGOLF'}</span>
      <h3>${product.nombre}</h3>
      ${tallasHTML}
      <div class="catalogo-producto-footer">
        <p class="catalogo-precio">${formatPrice(product.precio)}</p>
      </div>
    </div>
  `;

  // Event listener: navegar a detalles del producto
  article.addEventListener("click", () => {
    if (!product.referencia) return;
    window.location.href = `./front/views/product_details.html?ref=${encodeURIComponent(
      product.referencia
    )}`;
  });

  return article;
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

/**
 * Formatea el precio en formato COP
 */
function formatPrice(price) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(price || 0);
}

/**
 * Renderiza estado vacío
 */
function renderEmptyFeaturedState(container) {
  container.innerHTML = `
    <article class="product" style="text-align: center; padding: 40px;">
      <p>No hay productos disponibles en este momento</p>
    </article>
  `;
}
