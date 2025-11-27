/**
 * Featured Products - Carga dinámica desde la base de datos
 * Muestra productos recientes en el carrusel de la página principal (index.html)
 */

const FEATURED_PRODUCTS_API = "back/modules/products/api/catalog.php";
const MAX_FEATURED_PRODUCTS = 9; // Máximo de productos a mostrar

/**
 * Construye la URL correcta de la imagen
 */
function getImageUrl(imagePath) {
  if (!imagePath) return null;
  
  // Si ya es una URL absoluta, retornarla tal cual
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  
  // Si tiene /AFERGOLF/uploads (viene de BD con prefijo), limpiar
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
    console.error("❌ Elemento .products[data-track] no encontrado");
    return;
  }

  console.log("✅ Elemento encontrado, iniciando fetch a:", FEATURED_PRODUCTS_API);

  try {
    const response = await fetch(FEATURED_PRODUCTS_API);
    console.log("📡 Response status:", response.status);
    
    const data = await response.json();
    console.log("📦 Data recibida:", data);
    console.log("📊 Cantidad de productos:", data.productos ? data.productos.length : 0);

    if (!data.success || !data.productos || data.productos.length === 0) {
      console.warn("⚠️ No hay productos disponibles o respuesta inválida");
      renderEmptyFeaturedState(productsTrack);
      return;
    }

    // Tomar solo los primeros MAX_FEATURED_PRODUCTS (productos recientes)
    const featuredProducts = data.productos.slice(0, MAX_FEATURED_PRODUCTS);
    console.log("🎯 Productos a renderizar:", featuredProducts.length);

    // Limpiar productos estáticos
    productsTrack.innerHTML = "";

    // Renderizar productos
    featuredProducts.forEach((product, index) => {
      console.log(`🎨 Renderizando producto ${index + 1}:`, product.nombre);
      const article = createProductCard(product);
      productsTrack.appendChild(article);
    });
    
    console.log("✨ ¡Productos renderizados correctamente!");
    
    // Reinicializar el carousel después de renderizar los productos
    setTimeout(() => {
      if (window.carousel) {
        console.log("🔄 Reinicializando carrusel...");
        window.carousel.setup();
      }
    }, 100);

  } catch (error) {
    console.error("❌ Error cargando productos destacados:", error);
    renderEmptyFeaturedState(productsTrack);
  }
}

/**
 * Crea una tarjeta de producto
 */
function createProductCard(product) {
  console.log("🏗️ Creando tarjeta para:", product.nombre);
  console.log("   Imagen original:", product.imagen_principal);
  
  const article = document.createElement("article");
  article.className = "product";
  article.style.cursor = "pointer";
  article.dataset.referencia = product.referencia;

  // Usar la imagen principal del producto o una por defecto
  const imagenPrincipal = getImageUrl(product.imagen_principal) || "front/assets/img/Catalog/placeholder.jpg";
  console.log("   Imagen procesada:", imagenPrincipal);

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
      tallasHTML = `<div class="sizes">${tallas.join("")}</div>`;
    }
  }

  article.innerHTML = `
    <img src="${imagenPrincipal}" alt="${product.nombre}" loading="lazy">
    <h3>${product.nombre}</h3>
    <p class="price">${formatPrice(product.precio)}</p>
    ${tallasHTML}
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
