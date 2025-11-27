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
  const modelEl = document.getElementById("product-model");
  const refEl = document.getElementById("product-reference");
  const priceEl = document.getElementById("product-price");
  const descEl = document.getElementById("product-description");
  const categoryBadge = document.getElementById("product-category-badge");
  const stockContainer = document.getElementById("product-stock-container");
  const stockEl = document.getElementById("product-stock");

  if (titleEl) titleEl.textContent = p.nombre || "Producto sin nombre";
  if (brandEl) brandEl.textContent = p.marca || "-";
  if (modelEl) modelEl.textContent = p.modelo || "-";
  if (refEl) refEl.textContent = p.referencia || "-";
  if (priceEl) priceEl.textContent = formatPrice(p.precio || 0);

  // Badge de categoría
  if (categoryBadge && p.categoria) {
    const categoryNames = {
      palos: "Palos",
      guantes: "Guantes", 
      bolas: "Bolas"
    };
    categoryBadge.textContent = categoryNames[p.categoria] || p.categoria;
    categoryBadge.style.display = "inline-block";
  }

  // --- ESPECIFICACIONES SEGÚN CATEGORÍA ---
  renderCategorySpecs(p);

  // --- STOCK ---
  if (stockContainer && stockEl) {
    if (p.categoria === "guantes") {
      // Para guantes, el stock se muestra en las tallas
      stockContainer.style.display = "none";
    } else {
      stockContainer.style.display = "flex";
      stockEl.textContent = p.stock !== undefined ? p.stock : "-";
    }
  }

  // --- DESCRIPCIÓN ---
  if (descEl) {
    descEl.textContent =
      p.descripcion ||
      "Este producto aún no tiene una descripción detallada.";
  }

  // Botón de agregar al carrito
  const btnCart = document.getElementById("btn-add-cart");
  if (btnCart && !btnCart.dataset.listenerAttached) {
    // Marcar que ya tiene el listener para evitar duplicados
    btnCart.dataset.listenerAttached = 'true';
    
    // Guardar datos del producto en el botón para usarlos después
    btnCart.dataset.productId = p.referencia;
    btnCart.dataset.productName = p.nombre;
    btnCart.dataset.productPrice = p.precio;
    btnCart.dataset.productImage = srcMain;
    btnCart.dataset.productCategory = p.categoria;
    
    btnCart.addEventListener("click", () => {
      // Verificar si es un guante y si se seleccionó talla
      if (p.categoria === 'guantes') {
        if (!selectedGloveSize) {
          // Mostrar error si no se seleccionó talla
          const hint = document.getElementById("size-hint");
          if (hint) {
            hint.textContent = "Por favor selecciona una talla";
            hint.classList.add("error");
          }
          if (window.Toast) {
            Toast.warning('Debes seleccionar una talla antes de agregar al carrito');
          }
          return;
        }
      }
      
      // Verificar si la función addToCart está disponible
      if (typeof window.addToCart === 'function') {
        const product = {
          id: p.categoria === 'guantes' ? `${p.referencia}-${selectedGloveSize}` : p.referencia,
          originalId: p.referencia,
          name: p.nombre,
          price: parseFloat(p.precio) || 0,
          image: srcMain,
          category: p.categoria,
          brand: p.marca,
          model: p.modelo,
          size: p.categoria === 'guantes' ? selectedGloveSize : null
        };
        
        window.addToCart(product);
      } else {
        console.error('La función addToCart no está disponible');
        if (window.Toast) {
          Toast.error('Error al agregar al carrito. Intenta de nuevo.');
        }
      }
    });
  }
}

/**
 * Renderiza las especificaciones según la categoría del producto
 */
function renderCategorySpecs(p) {
  const specsPalos = document.getElementById("specs-palos");
  const specsGuantes = document.getElementById("specs-guantes");
  const specsBolas = document.getElementById("specs-bolas");

  // Ocultar todas las secciones primero
  if (specsPalos) specsPalos.style.display = "none";
  if (specsGuantes) specsGuantes.style.display = "none";
  if (specsBolas) specsBolas.style.display = "none";

  const categoria = (p.categoria || "").toLowerCase();

  if (categoria === "palos" && specsPalos) {
    specsPalos.style.display = "block";
    renderPalosSpecs(p);
  } else if (categoria === "guantes" && specsGuantes) {
    specsGuantes.style.display = "block";
    renderGuantesSpecs(p);
  } else if (categoria === "bolas" && specsBolas) {
    specsBolas.style.display = "block";
    renderBolasSpecs(p);
  }
}

/**
 * Renderiza las especificaciones de palos
 */
function renderPalosSpecs(p) {
  const setSpec = (id, value, suffix = "") => {
    const el = document.getElementById(id);
    const container = document.getElementById(`${id}-container`);
    if (el) {
      if (value !== null && value !== undefined && value !== "") {
        el.textContent = value + suffix;
        if (container) container.style.display = "flex";
      } else {
        el.textContent = "-";
        if (container) container.style.display = "none";
      }
    }
  };

  setSpec("spec-longitud", p.longitud, p.longitud ? '"' : "");
  setSpec("spec-loft", p.loft, p.loft ? "°" : "");
  setSpec("spec-lie", p.lie, p.lie ? "°" : "");
  setSpec("spec-peso", p.peso, p.peso ? " g" : "");
  setSpec("spec-swing", p.swingweight);
  setSpec("spec-flex", p.flex);
}

// Variable global para almacenar la talla seleccionada
let selectedGloveSize = null;
let currentGloveProduct = null;

/**
 * Renderiza las tallas disponibles para guantes (seleccionables)
 */
function renderGuantesSpecs(p) {
  const sizesContainer = document.getElementById("specs-sizes");
  if (!sizesContainer) return;

  // Resetear selección
  selectedGloveSize = null;
  currentGloveProduct = p;

  sizesContainer.innerHTML = "";

  const sizes = [
    { key: "stock_talla_s", label: "S" },
    { key: "stock_talla_m", label: "M" },
    { key: "stock_talla_l", label: "L" },
    { key: "stock_talla_xl", label: "XL" },
    { key: "stock_talla_xxl", label: "XXL" }
  ];

  sizes.forEach(size => {
    const stock = parseInt(p[size.key]) || 0;
    const isAvailable = stock > 0;

    const tag = document.createElement("span");
    tag.className = `size-tag ${isAvailable ? "available" : "unavailable"}`;
    tag.dataset.size = size.label;
    tag.dataset.stock = stock;
    tag.innerHTML = `
      <span class="size-name">${size.label}</span>
      <span class="size-stock">(${stock})</span>
    `;
    
    // Solo agregar click listener si hay stock
    if (isAvailable) {
      tag.addEventListener("click", () => selectGloveSize(tag, size.label));
    }
    
    sizesContainer.appendChild(tag);
  });

  // Agregar hint de selección
  const hint = document.createElement("p");
  hint.className = "size-selection-hint";
  hint.id = "size-hint";
  hint.textContent = "Selecciona una talla";
  sizesContainer.appendChild(hint);
}

/**
 * Maneja la selección de talla de guante
 */
function selectGloveSize(element, size) {
  // Remover selección anterior
  const allTags = document.querySelectorAll(".size-tag");
  allTags.forEach(tag => tag.classList.remove("selected"));
  
  // Seleccionar la nueva talla
  element.classList.add("selected");
  selectedGloveSize = size;
  
  // Actualizar hint
  const hint = document.getElementById("size-hint");
  if (hint) {
    hint.textContent = `Talla ${size} seleccionada`;
    hint.classList.remove("error");
  }
}

/**
 * Renderiza las especificaciones de bolas
 */
function renderBolasSpecs(p) {
  const unidadesEl = document.getElementById("spec-unidades");
  if (unidadesEl) {
    unidadesEl.textContent = p.unidades_paquete || "-";
  }
}

function formatPrice(price) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(price || 0);
}
