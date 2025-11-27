/**
 * Detalle de producto AFERGOLF
 * - Lee la referencia desde la URL (?ref=AFG-P001)
 * - Consulta el backend y pinta la ficha del producto
 */

const PRODUCT_API_URL = "../../back/modules/products/api/catalog.php";

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const referencia = params.get("ref");

  if (!referencia) {
    showError("No se especificó la referencia del producto.");
    return;
  }

  loadProductDetails(referencia);
});

async function loadProductDetails(referencia) {
  try {
    const response = await fetch(
      `${PRODUCT_API_URL}?referencia=${encodeURIComponent(referencia)}`
    );
    const data = await response.json();

    if (!data.success || !data.producto) {
      showError(data.message || "No se encontró la información del producto.");
      return;
    }

    renderProductDetails(data.producto);
  } catch (error) {
    console.error("Error cargando detalles:", error);
    showError("Error al conectar con el servidor.");
  }
}

function showError(message) {
  const errorDiv = document.getElementById("product-error");
  const content = document.getElementById("product-content");
  const descSection = document.getElementById("product-description-section");

  if (content) content.style.display = "none";
  if (descSection) descSection.style.display = "none";

  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = "block";
  }
}

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
    const cleanPath = imagePath.replace(/^.*\/AFERGOLF\//, "");
    return `../../${cleanPath}`;
  }
  
  // Si es una ruta de uploads, construir desde la raíz del proyecto
  if (imagePath.startsWith("uploads/")) {
    return `../../${imagePath}`;
  }
  
  // Si comienza con /, remover la barra y agregar ..
  if (imagePath.startsWith("/uploads/")) {
    return `../../${imagePath.substring(1)}`;
  }
  
  // Si ya contiene ../, devolverlo tal cual
  if (imagePath.includes("../")) {
    return imagePath;
  }
  
  // Por defecto, asumir que es relativa a assets
  return `../assets/img/${imagePath}`;
}

function renderProductDetails(p) {
  const content = document.getElementById("product-content");
  const descSection = document.getElementById("product-description-section");
  const errorDiv = document.getElementById("product-error");

  if (errorDiv) errorDiv.style.display = "none";
  if (content) content.style.display = "grid";
  if (descSection) descSection.style.display = "block";

  // --- IMÁGENES ---
  const mainImg = document.getElementById("img-main");
  const imgSide = document.getElementById("img-side");
  const imgTop = document.getElementById("img-top");
  const imgFront = document.getElementById("img-front");

  const thumbSide = document.getElementById("thumb-side");
  const thumbTop = document.getElementById("thumb-top");
  const thumbFront = document.getElementById("thumb-front");

  const placeholder =
    "../assets/img/Catalog/Guante Footjoy GTXtreme.jpeg";

  // Construir URLs correctas de las imágenes
  const srcMain = getImageUrl(p.imagen_principal) || placeholder;
  const srcSide = getImageUrl(p.imagen_lateral);
  const srcTop = getImageUrl(p.imagen_superior);
  const srcFront = getImageUrl(p.imagen_frontal);

  if (mainImg) mainImg.src = srcMain;

  if (srcSide && imgSide && thumbSide) {
    imgSide.src = srcSide;
    thumbSide.style.display = "flex";
  } else if (thumbSide) {
    thumbSide.style.display = "none";
  }

  if (srcTop && imgTop && thumbTop) {
    imgTop.src = srcTop;
    thumbTop.style.display = "flex";
  } else if (thumbTop) {
    thumbTop.style.display = "none";
  }

  if (srcFront && imgFront && thumbFront) {
    imgFront.src = srcFront;
    thumbFront.style.display = "flex";
  } else if (thumbFront) {
    thumbFront.style.display = "none";
  }

  // Click en miniaturas → cambia imagen principal
  [thumbSide, thumbTop, thumbFront].forEach((thumb) => {
    if (!thumb) return;
    const img = thumb.querySelector("img");
    if (!img) return;

    thumb.style.cursor = "pointer";
    thumb.addEventListener("click", () => {
      if (!mainImg || !img.src) return;
      mainImg.src = img.src;
    });
  });

  // --- TEXTO / META ---
  const titleEl = document.getElementById("product-title");
  const brandEl = document.getElementById("product-brand");
  const dimEl = document.getElementById("product-dimensions");
  const weightEl = document.getElementById("product-weight");
  const shipWeightEl = document.getElementById("product-shipping-weight");
  const modelEl = document.getElementById("product-model");
  const refEl = document.getElementById("product-reference");
  const priceEl = document.getElementById("product-price");
  const descEl = document.getElementById("product-description");

  if (titleEl) titleEl.textContent = p.nombre || "Producto sin nombre";
  if (brandEl) brandEl.textContent = p.marca || "-";
  if (dimEl) dimEl.textContent = p.dimensiones || "-";

  if (weightEl) {
    weightEl.textContent = p.peso ? `${p.peso} kg` : "-";
  }

  if (shipWeightEl) {
    if (p.peso) {
      const ship = (parseFloat(p.peso) + 0.1).toFixed(2);
      shipWeightEl.textContent = `${ship} kg`;
    } else {
      shipWeightEl.textContent = "-";
    }
  }

  if (modelEl) modelEl.textContent = p.modelo || "-";
  if (refEl) refEl.textContent = p.referencia || "-";

  if (priceEl) priceEl.textContent = formatPrice(p.precio || 0);

  if (descEl) {
    descEl.textContent =
      p.descripcion ||
      "Este producto aún no tiene una descripción detallada.";
  }

  // Botón carrito (por ahora solo placeholder)
  const btnCart = document.getElementById("btn-add-cart");
  if (btnCart) {
    btnCart.addEventListener("click", () => {
      alert("Funcionalidad de carrito pendiente de implementación 🙂");
    });
  }
}

function formatPrice(price) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(price || 0);
}
