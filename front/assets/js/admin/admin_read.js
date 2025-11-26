/**
 * ============================================================================
 * AFERGOLF - MÓDULO FRONTEND: LEER/LISTAR PRODUCTOS
 * ============================================================================
 * 
 * ARCHIVO: admin_read.js
 * UBICACIÓN: /front/assets/js/admin/admin_read.js
 * 
 * ============================================================================
 * DESCRIPCIÓN GENERAL
 * ============================================================================
 * 
 * Este módulo JavaScript maneja toda la lógica del lado del cliente (frontend)
 * para la LECTURA y LISTADO de productos en el panel de administración de AFERGOLF.
 * 
 * FUNCIONALIDADES PRINCIPALES:
 * - Cargar lista de productos desde el servidor
 * - Renderizar tabla de productos con datos
 * - Filtrar productos por categoría, marca y búsqueda
 * - Mostrar estado vacío cuando no hay productos
 * - Ver detalles de un producto específico
 * 
 * PRINCIPIO DE RESPONSABILIDAD ÚNICA (SRP):
 * Este archivo solo maneja la operación READ del CRUD.
 * Para otras operaciones, usar:
 * - admin_create.js → Crear productos
 * - admin_update.js → Editar productos existentes
 * - admin_delete.js → Eliminar productos
 * 
 * ============================================================================
 * ROL EN LA ARQUITECTURA DEL SISTEMA
 * ============================================================================
 * 
 * FLUJO COMPLETO FRONT → BACK → BASE DE DATOS:
 * 
 * 1. INTERFAZ DE USUARIO (admin_dashboard.html)
 *    ├── Página carga y dispara DOMContentLoaded
 *    ├── Usuario puede usar filtros y búsqueda
 *    └── Usuario puede hacer clic en "Ver" de un producto
 * 
 * 2. ESTE MÓDULO (admin_read.js)
 *    ├── loadProducts() → Carga inicial de productos
 *    ├── applyFilters() → Aplica filtros de búsqueda
 *    ├── renderProductsTable() → Dibuja tabla con productos
 *    ├── viewProduct() → Muestra modal con detalles
 *    └── fetchProductByReference() → Obtiene un producto específico
 * 
 * 3. BACKEND (read_products.php)
 *    ├── Recibe petición GET
 *    ├── Aplica filtros si se proporcionan
 *    └── Retorna JSON con productos
 * 
 * 4. BASE DE DATOS
 *    └── SELECT * FROM productos [WHERE filtros] ORDER BY fecha_creacion DESC
 * 
 * ============================================================================
 * FUNCIONES EXPORTADAS (Globales)
 * ============================================================================
 * 
 * ┌──────────────────────────┬──────────────────────────────────────────────┐
 * │ Función                  │ Descripción                                  │
 * ├──────────────────────────┼──────────────────────────────────────────────┤
 * │ loadProducts()           │ Carga todos los productos                    │
 * │ loadProductsWithFilters()│ Carga productos aplicando filtros            │
 * │ renderProductsTable(arr) │ Renderiza la tabla con productos             │
 * │ viewProduct(ref)         │ Abre modal de vista previa                   │
 * │ fetchProductByReference()│ Obtiene un producto por referencia           │
 * │ formatPrice(price)       │ Formatea número como precio COP              │
 * │ capitalizeFirstLetter()  │ Capitaliza primera letra de string           │
 * └──────────────────────────┴──────────────────────────────────────────────┘
 * 
 * ============================================================================
 * DEPENDENCIAS
 * ============================================================================
 * 
 * ARCHIVOS REQUERIDOS (cargar antes de este):
 * - /front/assets/js/ui/toast.js      → showNotification()
 * - /front/assets/js/ui/components.js → openProductDetailsModal(),
 *                                       closeProductDetailsModal()
 * 
 * ARCHIVOS QUE USAN ESTE MÓDULO:
 * - admin_create.js → Llama loadProducts() después de crear
 * - admin_update.js → Usa fetchProductByReference(), loadProducts()
 * - admin_delete.js → Llama loadProducts() después de eliminar
 * 
 * ============================================================================
 * ELEMENTOS HTML REQUERIDOS
 * ============================================================================
 * 
 * TABLA:
 * - #products-tbody → Cuerpo de la tabla donde se insertan filas
 * - #empty-state    → Mensaje cuando no hay productos
 * 
 * FILTROS:
 * - #search-input    → Input de búsqueda por texto
 * - #filter-category → Select de filtro por categoría
 * - #filter-brand    → Select de filtro por marca
 * 
 * MODAL DE VISTA PREVIA:
 * - #product-details-modal     → Modal de detalles
 * - #product-name-details      → Nombre del producto
 * - #product-brand-details     → Marca
 * - #product-price-details     → Precio
 * - #product-model-details     → Modelo
 * - #product-reference-details → Referencia
 * - #product-dimensions-details→ Dimensiones
 * - #product-weight-details    → Peso
 * - #preview-main-details      → Imagen principal
 * - #preview-front-details     → Imagen frontal
 * - #preview-top-details       → Imagen superior
 * - #preview-side-details      → Imagen lateral
 * - #product-description-text-details → Descripción
 * 
 * ============================================================================
 * CONFIGURACIÓN
 * ============================================================================
 */

// URL del endpoint para leer productos
const READ_API_URL = 'http://localhost/AFERGOLF/back/modules/products/api/admin/read_products.php';

// ============================================================================
// FUNCIÓN: CARGAR PRODUCTOS
// ============================================================================

/**
 * Carga todos los productos desde el servidor
 * 
 * Esta función se llama al:
 * - Iniciar la página
 * - Crear un producto
 * - Actualizar un producto
 * - Eliminar un producto
 * 
 * @function loadProducts
 * @global
 * @async
 * @returns {Promise<void>}
 */
async function loadProducts() {
  try {
    const response = await fetch(READ_API_URL, {
      method: 'GET'
    });
    
    const result = await response.json();
    
    if (result.success) {
      renderProductsTable(result.productos || []);
    } else {
      if (typeof showNotification === 'function') {
        showNotification(result.message || 'Error al cargar productos', 'error');
      }
      renderProductsTable([]);
    }
    
  } catch (error) {
    console.error('Error al cargar productos:', error);
    if (typeof showNotification === 'function') {
      showNotification('Error al conectar con el servidor', 'error');
    }
    renderProductsTable([]);
  }
}

/**
 * Carga productos aplicando filtros
 * 
 * @function loadProductsWithFilters
 * @global
 * @async
 * @param {Object} filters - Objeto con filtros
 * @param {string} [filters.categoria] - Filtrar por categoría
 * @param {string} [filters.marca] - Filtrar por marca
 * @param {string} [filters.buscar] - Texto de búsqueda
 * @returns {Promise<void>}
 */
async function loadProductsWithFilters(filters = {}) {
  try {
    // Construir URL con parámetros
    const params = new URLSearchParams();
    
    if (filters.categoria) params.append('categoria', filters.categoria);
    if (filters.marca) params.append('marca', filters.marca);
    if (filters.buscar) params.append('buscar', filters.buscar);
    
    const url = `${READ_API_URL}?${params.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET'
    });
    
    const result = await response.json();
    
    if (result.success) {
      renderProductsTable(result.productos || []);
    } else {
      renderProductsTable([]);
    }
    
  } catch (error) {
    console.error('Error al cargar productos con filtros:', error);
    renderProductsTable([]);
  }
}

// ============================================================================
// FUNCIÓN: RENDERIZAR TABLA DE PRODUCTOS
// ============================================================================

/**
 * Renderiza la tabla de productos con los datos proporcionados
 * 
 * @function renderProductsTable
 * @global
 * @param {Array} productos - Array de objetos producto
 * @returns {void}
 */
function renderProductsTable(productos) {
  const tbody = document.getElementById('products-tbody');
  const emptyState = document.getElementById('empty-state');
  
  if (!tbody) return;
  
  // Limpiar tabla
  tbody.innerHTML = '';
  
  // Si no hay productos, mostrar estado vacío
  if (!productos || productos.length === 0) {
    if (emptyState) emptyState.style.display = 'flex';
    return;
  }
  
  // Ocultar estado vacío
  if (emptyState) emptyState.style.display = 'none';
  
  // Crear filas para cada producto
  productos.forEach(producto => {
    const row = createProductRow(producto);
    tbody.appendChild(row);
  });
}

/**
 * Crea una fila HTML para un producto
 * 
 * @function createProductRow
 * @param {Object} producto - Datos del producto
 * @returns {HTMLTableRowElement} Elemento <tr>
 */
function createProductRow(producto) {
  const tr = document.createElement('tr');
  tr.dataset.referencia = producto.referencia;
  
  // Columna: Imagen
  const tdImage = document.createElement('td');
  const img = document.createElement('img');
  img.src = producto.imagen_principal || '../assets/img/placeholder-product.jpg';
  img.alt = producto.nombre;
  img.className = 'product-image';
  img.onerror = () => { img.src = '../assets/img/placeholder-product.jpg'; };
  tdImage.appendChild(img);
  
  // Columna: Referencia
  const tdReference = document.createElement('td');
  const referenceSpan = document.createElement('span');
  referenceSpan.className = 'product-reference';
  referenceSpan.textContent = producto.referencia;
  tdReference.appendChild(referenceSpan);
  
  // Columna: Nombre
  const tdName = document.createElement('td');
  const nameSpan = document.createElement('span');
  nameSpan.className = 'product-name';
  nameSpan.textContent = producto.nombre;
  nameSpan.title = producto.nombre;
  tdName.appendChild(nameSpan);
  
  // Columna: Categoría
  const tdCategory = document.createElement('td');
  const categorySpan = document.createElement('span');
  categorySpan.className = 'product-category';
  categorySpan.textContent = capitalizeFirstLetter(producto.categoria);
  tdCategory.appendChild(categorySpan);
  
  // Columna: Marca
  const tdBrand = document.createElement('td');
  const brandSpan = document.createElement('span');
  brandSpan.className = 'product-brand';
  brandSpan.textContent = producto.marca;
  tdBrand.appendChild(brandSpan);
  
  // Columna: Precio
  const tdPrice = document.createElement('td');
  const priceSpan = document.createElement('span');
  priceSpan.className = 'product-price';
  priceSpan.textContent = formatPrice(producto.precio);
  tdPrice.appendChild(priceSpan);
  
  // Columna: Stock
  const tdStock = document.createElement('td');
  
  if (producto.categoria === 'guantes') {
    // Guantes: mostrar desglose por tallas
    const stockContainer = document.createElement('div');
    stockContainer.className = 'stock-sizes-container';
    
    const sizes = [
      { label: 'S', value: producto.stock_talla_s || 0 },
      { label: 'M', value: producto.stock_talla_m || 0 },
      { label: 'L', value: producto.stock_talla_l || 0 },
      { label: 'XL', value: producto.stock_talla_xl || 0 },
      { label: 'XXL', value: producto.stock_talla_xxl || 0 }
    ];
    
    sizes.forEach(size => {
      const sizeItem = document.createElement('span');
      sizeItem.className = 'stock-size-item';
      
      if (size.value === 0) {
        sizeItem.classList.add('out-of-stock');
      } else if (size.value < 3) {
        sizeItem.classList.add('low-stock');
      }
      
      sizeItem.textContent = `${size.label}: ${size.value}`;
      sizeItem.title = `Talla ${size.label}: ${size.value} unidades`;
      stockContainer.appendChild(sizeItem);
    });
    
    tdStock.appendChild(stockContainer);
  } else {
    // Otras categorías: stock general
    const stockSpan = document.createElement('span');
    stockSpan.className = 'product-stock';
    stockSpan.textContent = producto.stock || 0;
    
    if (producto.stock === 0) {
      stockSpan.classList.add('out-of-stock');
    } else if (producto.stock < 5) {
      stockSpan.classList.add('low-stock');
    }
    
    tdStock.appendChild(stockSpan);
  }
  
  // Columna: Acciones
  const tdActions = document.createElement('td');
  tdActions.className = 'product-actions';
  
  // Botón Ver
  const btnView = document.createElement('button');
  btnView.className = 'action-btn view';
  btnView.title = 'Ver detalles';
  btnView.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  `;
  btnView.onclick = () => viewProduct(producto.referencia);
  
  // Botón Editar
  const btnEdit = document.createElement('button');
  btnEdit.className = 'action-btn edit';
  btnEdit.title = 'Editar producto';
  btnEdit.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
  `;
  btnEdit.onclick = () => {
    // Llamar función de admin_update.js
    if (typeof editProduct === 'function') {
      editProduct(producto.referencia);
    }
  };
  
  // Botón Eliminar
  const btnDelete = document.createElement('button');
  btnDelete.className = 'action-btn delete';
  btnDelete.title = 'Eliminar producto';
  btnDelete.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
  `;
  btnDelete.onclick = () => {
    // Llamar función de admin_delete.js
    if (typeof confirmDeleteProduct === 'function') {
      confirmDeleteProduct(producto.referencia);
    }
  };
  
  tdActions.appendChild(btnView);
  tdActions.appendChild(btnEdit);
  tdActions.appendChild(btnDelete);
  
  // Ensamblar fila
  tr.appendChild(tdImage);
  tr.appendChild(tdReference);
  tr.appendChild(tdName);
  tr.appendChild(tdCategory);
  tr.appendChild(tdBrand);
  tr.appendChild(tdPrice);
  tr.appendChild(tdStock);
  tr.appendChild(tdActions);
  
  return tr;
}

// ============================================================================
// FUNCIÓN: OBTENER PRODUCTO POR REFERENCIA
// ============================================================================

/**
 * Obtiene los datos de un producto específico desde el servidor
 * 
 * @function fetchProductByReference
 * @global
 * @async
 * @param {string} referencia - Referencia del producto
 * @returns {Promise<Object|null>} Datos del producto o null
 */
async function fetchProductByReference(referencia) {
  try {
    const response = await fetch(`${READ_API_URL}?referencia=${encodeURIComponent(referencia)}`, {
      method: 'GET'
    });
    
    const result = await response.json();
    
    if (result.success && result.producto) {
      return result.producto;
    } else {
      if (typeof showNotification === 'function') {
        showNotification(result.message || 'Producto no encontrado', 'error');
      }
      return null;
    }
    
  } catch (error) {
    console.error('Error al obtener producto:', error);
    if (typeof showNotification === 'function') {
      showNotification('Error al conectar con el servidor', 'error');
    }
    return null;
  }
}

// ============================================================================
// FUNCIÓN: VER PRODUCTO (Modal de vista previa)
// ============================================================================

/**
 * Abre el modal de vista previa con los detalles de un producto
 * 
 * @function viewProduct
 * @global
 * @async
 * @param {string} referencia - Referencia del producto
 * @returns {Promise<void>}
 */
async function viewProduct(referencia) {
  const producto = await fetchProductByReference(referencia);
  
  if (!producto) return;
  
  // Cargar imágenes en el modal
  loadProductImagesInModal(producto);
  
  // Cargar información del producto
  loadProductInfoInModal(producto);
  
  // Abrir modal
  if (typeof openProductDetailsModal === 'function') {
    openProductDetailsModal();
  } else {
    const modal = document.getElementById('product-details-modal');
    if (modal) modal.classList.add('active');
  }
}

/**
 * Carga las imágenes del producto en el modal de vista previa
 * 
 * @function loadProductImagesInModal
 * @param {Object} producto - Datos del producto
 */
function loadProductImagesInModal(producto) {
  const positions = ['main', 'front', 'top', 'side'];
  const imageFields = {
    'main': 'imagen_principal',
    'front': 'imagen_frontal',
    'top': 'imagen_superior',
    'side': 'imagen_lateral'
  };
  
  positions.forEach(position => {
    const previewId = `preview-${position}-details`;
    const preview = document.getElementById(previewId);
    
    if (preview) {
      const img = preview.querySelector('img');
      const placeholder = preview.querySelector('.preview-placeholder');
      const imageData = producto[imageFields[position]];
      
      if (imageData) {
        if (img) {
          img.src = imageData;
          img.style.display = 'block';
        }
        if (placeholder) placeholder.style.display = 'none';
      } else {
        if (img) img.style.display = 'none';
        if (placeholder) placeholder.style.display = 'flex';
      }
    }
  });
  
  // Configurar interacción de miniaturas
  setupThumbnailInteraction();
}

/**
 * Carga la información del producto en el modal
 * 
 * @function loadProductInfoInModal
 * @param {Object} producto - Datos del producto
 */
function loadProductInfoInModal(producto) {
  // Nombre
  const nameEl = document.getElementById('product-name-details');
  if (nameEl) nameEl.textContent = producto.nombre || 'Sin nombre';
  
  // Marca
  const brandEl = document.getElementById('product-brand-details');
  if (brandEl) brandEl.textContent = producto.marca || '-';
  
  // Dimensiones
  const dimEl = document.getElementById('product-dimensions-details');
  if (dimEl) dimEl.textContent = producto.dimensiones || '-';
  
  // Peso
  const weightEl = document.getElementById('product-weight-details');
  if (weightEl) weightEl.textContent = producto.peso ? `${producto.peso} kg` : '-';
  
  // Peso de envío
  const shippingEl = document.getElementById('product-shipping-weight-details');
  if (shippingEl) {
    const shipping = producto.peso ? (parseFloat(producto.peso) + 0.1).toFixed(2) : null;
    shippingEl.textContent = shipping ? `${shipping} kg` : '-';
  }
  
  // Modelo
  const modelEl = document.getElementById('product-model-details');
  if (modelEl) modelEl.textContent = producto.modelo || '-';
  
  // Referencia
  const refEl = document.getElementById('product-reference-details');
  if (refEl) refEl.textContent = producto.referencia || '-';
  
  // Precio
  const priceEl = document.getElementById('product-price-details');
  if (priceEl) priceEl.textContent = formatPrice(producto.precio || 0);
  
  // Descripción
  const descEl = document.getElementById('product-description-text-details');
  if (descEl) descEl.textContent = producto.descripcion || 'Sin descripción disponible';
}

/**
 * Configura la interacción de miniaturas para cambiar imagen principal
 * 
 * @function setupThumbnailInteraction
 */
function setupThumbnailInteraction() {
  const mainPreview = document.getElementById('preview-main-details');
  if (!mainPreview) return;
  
  const thumbPositions = ['front', 'top', 'side'];
  
  thumbPositions.forEach(position => {
    const thumb = document.getElementById(`preview-${position}-details`);
    if (thumb) {
      const thumbImg = thumb.querySelector('img');
      if (thumbImg && thumbImg.style.display !== 'none') {
        thumb.style.cursor = 'pointer';
        
        thumb.onclick = () => {
          const mainImg = mainPreview.querySelector('img');
          if (mainImg && thumbImg.src) {
            // Intercambiar imágenes
            const tempSrc = mainImg.src;
            mainImg.src = thumbImg.src;
            thumbImg.src = tempSrc;
          }
        };
      }
    }
  });
}

// ============================================================================
// FUNCIONES DE UTILIDAD
// ============================================================================

/**
 * Formatea un número como precio en pesos colombianos
 * 
 * @function formatPrice
 * @global
 * @param {number} price - Precio a formatear
 * @returns {string} Precio formateado (ej: "$250.000 COP")
 */
function formatPrice(price) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
}

/**
 * Capitaliza la primera letra de un string
 * 
 * @function capitalizeFirstLetter
 * @global
 * @param {string} str - String a capitalizar
 * @returns {string} String capitalizado
 */
function capitalizeFirstLetter(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ============================================================================
// FILTROS Y BÚSQUEDA
// ============================================================================

/**
 * Aplica los filtros actuales y recarga la tabla
 * 
 * @function applyFilters
 */
function applyFilters() {
  const searchInput = document.getElementById('search-input');
  const categoryFilter = document.getElementById('filter-category');
  const brandFilter = document.getElementById('filter-brand');
  
  const filters = {
    buscar: searchInput?.value || '',
    categoria: categoryFilter?.value || '',
    marca: brandFilter?.value || ''
  };
  
  loadProductsWithFilters(filters);
}

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

/**
 * Configura los event listeners para lectura de productos
 */
function setupReadEventListeners() {
  // Filtros
  const searchInput = document.getElementById('search-input');
  const categoryFilter = document.getElementById('filter-category');
  const brandFilter = document.getElementById('filter-brand');
  
  // Búsqueda con debounce
  let searchTimeout;
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(applyFilters, 300);
    });
  }
  
  // Filtros de select
  if (categoryFilter) {
    categoryFilter.addEventListener('change', applyFilters);
  }
  
  if (brandFilter) {
    brandFilter.addEventListener('change', applyFilters);
  }
  
  // Botón cerrar vista previa
  const btnClosePreview = document.getElementById('btn-close-preview');
  if (btnClosePreview) {
    btnClosePreview.addEventListener('click', () => {
      if (typeof closeProductDetailsModal === 'function') {
        closeProductDetailsModal();
      } else {
        const modal = document.getElementById('product-details-modal');
        if (modal) modal.classList.remove('active');
      }
    });
  }
  
  // Botón X del modal de vista previa
  const detailsClose = document.getElementById('product-details-close');
  if (detailsClose) {
    detailsClose.addEventListener('click', () => {
      if (typeof closeProductDetailsModal === 'function') {
        closeProductDetailsModal();
      } else {
        const modal = document.getElementById('product-details-modal');
        if (modal) modal.classList.remove('active');
      }
    });
  }
}

/**
 * Inicializa el módulo de lectura de productos
 */
function initializeReadModule() {
  setupReadEventListeners();
  loadProducts();
}

// Ejecutar cuando el DOM esté listo
if (document.getElementById('products-tbody')) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeReadModule);
  } else {
    initializeReadModule();
  }
}
