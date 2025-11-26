/**
 * ============================================================================
 * AFERGOLF - Página de Catálogo de Productos
 * ============================================================================
 * 
 * @description   Carga y filtrado dinámico de productos desde el backend.
 *                Renderiza productos con filtros por categoría y marca.
 * 
 * @file          front/assets/js/pages/catalog.js
 * @author        Afergolf Team
 * @version       1.0.0
 * @since         2025-01-01
 * 
 * ============================================================================
 * ÍNDICE DE CONTENIDO
 * ============================================================================
 * 
 * 1. CONSTANTES
 *    - CATALOG_API_URL: URL del endpoint de productos
 * 
 * 2. FUNCIONES DE CARGA
 *    - loadCatalogProducts(): Carga productos desde el backend
 *    - filterProducts(): Filtra productos según selectores
 * 
 * 3. FUNCIONES DE RENDERIZADO
 *    - renderProducts(): Renderiza los productos en el grid
 *    - renderTallas(): Renderiza botones de tallas para guantes
 *    - renderEmptyState(): Muestra mensaje cuando no hay productos
 * 
 * 4. UTILIDADES
 *    - formatPrice(): Formatea precios en COP
 * 
 * 5. INICIALIZACIÓN
 *    - Event listeners para filtros
 * 
 * ============================================================================
 * USO
 * ============================================================================
 * 
 * // Cargar productos manualmente
 * loadCatalogProducts();
 * 
 * // Los filtros funcionan automáticamente al cambiar los selectores
 * 
 * ============================================================================
 */

// ============================================================================
// 1. CONSTANTES
// ============================================================================

/**
 * URL del endpoint para obtener productos del catálogo.
 * Usa el nuevo endpoint modular de lectura.
 * @constant {string}
 */
const CATALOG_API_URL = 'http://localhost/AFERGOLF/back/modules/products/api/admin/read_products.php';

// ============================================================================
// 2. FUNCIONES DE CARGA
// ============================================================================

/**
 * Carga los productos del catálogo desde el backend.
 * Aplica filtros si están seleccionados.
 */
async function loadCatalogProducts() {
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
    console.error('Error cargando catálogo:', error);
    renderEmptyState('Error al cargar los productos. Intenta de nuevo más tarde.');
  }
}

/**
 * Filtra los productos según los selectores de tipo y marca.
 * @param {Array} productos - Array de productos a filtrar
 * @returns {Array} Productos filtrados
 */
function filterProducts(productos) {
  const tipoSelect = document.getElementById('tipo');
  const marcaSelect = document.getElementById('marca');
  
  const tipo = tipoSelect?.value || '';
  const marca = marcaSelect?.value || '';
  
  return productos.filter(p => {
    const matchTipo = tipo === '' || p.categoria === tipo;
    const matchMarca = marca === '' || p.marca === marca;
    return matchTipo && matchMarca;
  });
}

// ============================================================================
// 3. FUNCIONES DE RENDERIZADO
// ============================================================================

/**
 * Renderiza los productos en el contenedor del catálogo.
 * @param {Array} productos - Array de productos a renderizar
 */
function renderProducts(productos) {
  const container = document.getElementById('catalogo-productos');
  if (!container) {
    console.warn('Contenedor de catálogo no encontrado');
    return;
  }
  
  container.innerHTML = '';
  
  if (productos.length === 0) {
    renderEmptyState();
    return;
  }
  
  productos.forEach(p => {
    const article = document.createElement('article');
    article.className = 'catalogo-producto';
    article.dataset.referencia = p.referencia;
    
    article.innerHTML = `
      <a href="product_details.html?ref=${p.referencia}" class="product-link">
        <img src="${p.imagen_principal || '../assets/img/placeholder-product.jpg'}" 
             alt="${p.nombre}" 
             loading="lazy"
             onerror="this.src='../assets/img/placeholder-product.jpg'">
        
        <h3>${p.nombre}</h3>
        <p class="catalogo-precio">${formatCatalogPrice(p.precio)}</p>
        
        ${renderTallas(p)}
        
        ${renderStockBadge(p)}
      </a>
    `;
    
    // Agregar evento de click para ver detalles
    article.addEventListener('click', (e) => {
      if (!e.target.closest('.catalogo-tallas button')) {
        // Si no es click en talla, navegar a detalles
        window.location.href = `product_details.html?ref=${p.referencia}`;
      }
    });
    
    container.appendChild(article);
  });
}

/**
 * Renderiza los botones de tallas para productos de tipo guantes.
 * @param {Object} producto - Datos del producto
 * @returns {string} HTML de los botones de tallas o string vacío
 */
function renderTallas(producto) {
  if (producto.categoria !== 'guantes') return '';
  
  const tallas = [];
  
  if (producto.stock_talla_s > 0) tallas.push({ size: 'S', stock: producto.stock_talla_s });
  if (producto.stock_talla_m > 0) tallas.push({ size: 'M', stock: producto.stock_talla_m });
  if (producto.stock_talla_l > 0) tallas.push({ size: 'L', stock: producto.stock_talla_l });
  if (producto.stock_talla_xl > 0) tallas.push({ size: 'XL', stock: producto.stock_talla_xl });
  if (producto.stock_talla_xxl > 0) tallas.push({ size: 'XXL', stock: producto.stock_talla_xxl });
  
  if (tallas.length === 0) return '';
  
  return `
    <div class="catalogo-tallas">
      ${tallas.map(t => `
        <button class="talla-btn" 
                data-size="${t.size}" 
                data-stock="${t.stock}"
                title="${t.stock} disponibles">
          ${t.size}
        </button>
      `).join('')}
    </div>
  `;
}

/**
 * Renderiza un badge de stock si el producto tiene poco inventario.
 * @param {Object} producto - Datos del producto
 * @returns {string} HTML del badge o string vacío
 */
function renderStockBadge(producto) {
  // Para guantes, verificar stock por tallas
  if (producto.categoria === 'guantes') {
    const totalStock = (producto.stock_talla_s || 0) +
                       (producto.stock_talla_m || 0) +
                       (producto.stock_talla_l || 0) +
                       (producto.stock_talla_xl || 0) +
                       (producto.stock_talla_xxl || 0);
    
    if (totalStock === 0) {
      return '<span class="stock-badge agotado">Agotado</span>';
    }
    if (totalStock <= 3) {
      return '<span class="stock-badge poco-stock">Últimas unidades</span>';
    }
  } else {
    // Para otros productos
    if (producto.stock === 0) {
      return '<span class="stock-badge agotado">Agotado</span>';
    }
    if (producto.stock <= 3) {
      return '<span class="stock-badge poco-stock">Últimas unidades</span>';
    }
  }
  
  return '';
}

/**
 * Muestra un mensaje cuando no hay productos para mostrar.
 * @param {string} [message] - Mensaje personalizado
 */
function renderEmptyState(message = 'No se encontraron productos para los filtros seleccionados.') {
  const container = document.getElementById('catalogo-productos');
  if (!container) return;
  
  container.innerHTML = `
    <div class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="11" cy="11" r="8"></circle>
        <path d="M21 21l-4.35-4.35"></path>
      </svg>
      <p>${message}</p>
      <button class="btn-reset-filters" onclick="resetFilters()">Limpiar filtros</button>
    </div>
  `;
}

// ============================================================================
// 4. UTILIDADES
// ============================================================================

/**
 * Formatea un número como precio en COP.
 * @param {number} price - Precio a formatear
 * @returns {string} Precio formateado
 */
function formatCatalogPrice(price) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(price);
}

/**
 * Resetea los filtros a su estado inicial.
 */
function resetFilters() {
  const tipoSelect = document.getElementById('tipo');
  const marcaSelect = document.getElementById('marca');
  
  if (tipoSelect) tipoSelect.value = '';
  if (marcaSelect) marcaSelect.value = '';
  
  loadCatalogProducts();
}

// ============================================================================
// 5. INICIALIZACIÓN
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Cargar productos al iniciar
  loadCatalogProducts();
  
  // Configurar listeners para filtros
  const tipoSelect = document.getElementById('tipo');
  const marcaSelect = document.getElementById('marca');
  
  if (tipoSelect) {
    tipoSelect.addEventListener('change', loadCatalogProducts);
  }
  
  if (marcaSelect) {
    marcaSelect.addEventListener('change', loadCatalogProducts);
  }
  
  // Búsqueda en tiempo real (si existe el input)
  const searchInput = document.getElementById('search-catalog');
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        const query = e.target.value.trim().toLowerCase();
        searchProducts(query);
      }, 300);
    });
  }
});

/**
 * Búsqueda de productos por nombre/descripción.
 * @param {string} query - Término de búsqueda
 */
async function searchProducts(query) {
  if (!query) {
    loadCatalogProducts();
    return;
  }
  
  try {
    const url = `${CATALOG_API_URL}?buscar=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.success && data.productos) {
      renderProducts(data.productos);
    } else {
      renderEmptyState('No se encontraron productos que coincidan con tu búsqueda.');
    }
  } catch (error) {
    console.error('Error en búsqueda:', error);
    renderEmptyState('Error al buscar productos.');
  }
}

// ============================================================================
// EXPORTACIÓN
// ============================================================================

if (typeof window !== 'undefined') {
  window.loadCatalogProducts = loadCatalogProducts;
  window.resetFilters = resetFilters;
  window.searchProducts = searchProducts;
}
