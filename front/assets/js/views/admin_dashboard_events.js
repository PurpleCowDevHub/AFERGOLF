/**
 * ============================================================================
 * AFERGOLF - Admin Dashboard Events (Backend Logic)
 * ============================================================================
 * 
 * Gestión de datos de productos: CRUD, búsqueda, filtrado y renderizado.
 * 
 * @author Afergolf Team
 * @version 1.0.0
 * ============================================================================
 */

// ============================================================================
// VARIABLES GLOBALES
// ============================================================================

/**
 * Array principal de productos (simulación de base de datos)
 */
let products = [
  {
    id: 1,
    name: 'Guante Footjoy GTXtreme',
    category: 'guantes',
    brand: 'footjoy',
    price: 70000,
    stock: 15,
    images: {
      main: '../assets/img/Catalog/guante1.jpeg',
      front: '',
      top: '',
      side: ''
    },
    description: 'Guante de golf premium con tecnología GTXtreme para máximo agarre y comodidad en todas las condiciones climáticas.',
    sizeStock: { S: 3, M: 5, L: 5, XL: 2, XXL: 0 },
    model: 'GTX-2024',
    reference: 'FJ-GTX-001'
  },
  {
    id: 2,
    name: 'Bola Callaway Supersoft',
    category: 'bolas',
    brand: 'callaway',
    price: 120000,
    stock: 8,
    images: {
      main: '../assets/img/Catalog/bola1.jpeg',
      front: '',
      top: '',
      side: ''
    },
    description: 'Bolas de golf con núcleo supersuave para mayor distancia y control',
    units: 12,
    model: 'SUPERSOFT-2024',
    reference: 'CW-SS-12'
  },
  {
    id: 3,
    name: 'Hammer X Dr. Sandtrap Wedge De Golf De 60 Grados',
    category: 'palos',
    brand: 'hammerx',
    price: 125000,
    stock: 10,
    images: {
      main: '../assets/img/products/image 34.png',
      front: '../assets/img/products/image 35.png',
      top: '../assets/img/products/image 9.png',
      side: '../assets/img/products/image 7.png'
    },
    description: 'El Hammer X Dr. Sandtrap Wedge de 60° está diseñado para ofrecer máximo control y precisión en golpes delicados, especialmente desde el búnker o el rough.',
    dimensions: '0.89 x 0.10 x 0.10',
    weight: 0.91,
    model: 'B0D562R3XQ',
    reference: 'B0D562R3XQ'
  }
];

let currentProductId = null;
let nextId = 4;
let tempImageFiles = { main: null, front: null, top: null, side: null };

// ============================================================================
// RENDERIZADO DE PRODUCTOS
// ============================================================================

/**
 * Renderiza la lista de productos en la tabla aplicando filtros.
 * @param {Object} filter - Filtros de búsqueda (search, category, brand)
 */
function renderProducts(filter = {}) {
  const tbody = document.getElementById('products-tbody');
  const emptyState = document.getElementById('empty-state');
  
  let filteredProducts = products.filter(p => {
    const matchSearch = !filter.search || 
      p.name.toLowerCase().includes(filter.search.toLowerCase()) ||
      p.brand.toLowerCase().includes(filter.search.toLowerCase());
    const matchCategory = !filter.category || p.category === filter.category;
    const matchBrand = !filter.brand || p.brand === filter.brand;
    
    return matchSearch && matchCategory && matchBrand;
  });
  
  if (filteredProducts.length === 0) {
    tbody.innerHTML = '';
    emptyState.style.display = 'flex';
  } else {
    emptyState.style.display = 'none';
    tbody.innerHTML = filteredProducts.map(createProductRow).join('');
    attachRowEventListeners();
  }
}

/**
 * Crea el HTML de una fila de producto.
 * @param {Object} product - Datos del producto
 * @returns {string} HTML de la fila
 */
function createProductRow(product) {
  const stockClass = product.stock < 10 ? 'low-stock' : '';
  const stockText = product.stock < 10 ? `${product.stock} (Bajo)` : product.stock;
  const mainImage = product.images?.main || product.image || '';
  
  return `
    <tr data-id="${product.id}">
      <td>
        <img src="${mainImage}" alt="${product.name}" class="product-thumbnail" 
             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
        <div style="width: 60px; height: 60px; background: #e0e0e0; border-radius: 8px; display: none; 
                    align-items: center; justify-content: center; color: #999; font-size: 12px;">IMG</div>
      </td>
      <td class="product-name">${product.name}</td>
      <td><span class="product-category">${capitalizeFirst(product.category)}</span></td>
      <td><span class="product-brand">${capitalizeFirst(product.brand)}</span></td>
      <td class="product-price">${formatPrice(product.price)}</td>
      <td class="product-stock ${stockClass}">${stockText}</td>
      <td class="product-actions">
        <button class="action-btn view" data-action="view" title="Ver detalles">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>
        <button class="action-btn edit" data-action="edit" title="Editar">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
        <button class="action-btn delete" data-action="delete" title="Eliminar">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      </td>
    </tr>
  `;
}

/**
 * Adjunta event listeners a los botones de acción de las filas.
 */
function attachRowEventListeners() {
  document.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const action = e.currentTarget.dataset.action;
      const productId = parseInt(e.currentTarget.closest('tr').dataset.id);
      
      const actions = {
        view: viewProduct,
        edit: editProduct,
        delete: confirmDelete
      };
      
      actions[action]?.(productId);
    });
  });
}

// ============================================================================
// BÚSQUEDA Y FILTRADO
// ============================================================================

/**
 * Maneja la búsqueda y filtrado de productos.
 */
function handleSearch() {
  renderProducts({
    search: document.getElementById('search-input').value,
    category: document.getElementById('filter-category').value,
    brand: document.getElementById('filter-brand').value
  });
}

// ============================================================================
// OPERACIONES CRUD
// ============================================================================

/**
 * Abre el modal para crear un nuevo producto.
 */
function openCreateModal() {
  currentProductId = null;
  document.getElementById('modal-title').textContent = 'Crear Producto';
  document.getElementById('btn-submit-text').textContent = 'Guardar Producto';
  
  resetProductForm();
  clearTempImageFiles();
  enableFormFields();
  openProductModal();
}

/**
 * Abre el modal para editar un producto.
 * @param {number} id - ID del producto
 */
function editProduct(id) {
  const product = products.find(p => p.id === id);
  if (!product) {
    showNotification('Producto no encontrado', 'error');
    return;
  }
  
  currentProductId = id;
  document.getElementById('modal-title').textContent = 'Editar Producto';
  document.getElementById('btn-submit-text').textContent = 'Actualizar Producto';
  
  loadProductDataToForm(product);
  enableFormFields();
  openProductModal();
}

/**
 * Abre el modal para ver un producto (vista previa como lo ve el cliente).
 * @param {number} id - ID del producto
 */
function viewProduct(id) {
  const product = products.find(p => p.id === id);
  if (!product) {
    showNotification('Producto no encontrado', 'error');
    return;
  }
  
  loadProductDataToPreview(product);
  openProductDetailsModal();
}

/**
 * Carga los datos de un producto en el formulario.
 * @param {Object} product - Datos del producto
 */
function loadProductDataToForm(product) {
  document.getElementById('product-id').value = product.id;
  document.getElementById('product-name').value = product.name;
  document.getElementById('product-category').value = product.category;
  document.getElementById('product-brand').value = product.brand;
  document.getElementById('product-price').value = product.price;
  document.getElementById('product-description').value = product.description || '';
  document.getElementById('product-model').value = product.model || '';
  document.getElementById('product-reference').value = product.reference || '';
  
  clearTempImageFiles();
  
  const images = product.images || { main: product.image || '', front: '', top: '', side: '' };
  Object.keys(images).forEach(pos => updateImagePreviewFromUrl(pos, images[pos]));
  
  updateDynamicFields(product.category);
  
  if (product.category === 'guantes') {
    const sizeStock = product.sizeStock || { S: 0, M: 0, L: 0, XL: 0, XXL: 0 };
    ['S', 'M', 'L', 'XL', 'XXL'].forEach(size => {
      document.getElementById(`stock-size-${size.toLowerCase()}`).value = sizeStock[size] || 0;
    });
  } else {
    document.getElementById('product-stock').value = product.stock || 0;
  }
  
  if (product.category === 'bolas') {
    document.getElementById('product-units').value = product.units || '';
  } else if (product.category === 'palos' || product.category === 'accesorios') {
    const suffix = product.category === 'accesorios' ? '-acc' : '';
    document.getElementById(`product-dimensions${suffix}`).value = product.dimensions || '';
    document.getElementById(`product-weight${suffix}`).value = product.weight || '';
  }
}

/**
 * Carga los datos de un producto en el modal de vista previa (como lo ve el cliente).
 * @param {Object} product - Datos del producto
 */
function loadProductDataToPreview(product) {
  // Título del producto
  document.getElementById('product-name-preview').textContent = product.name;
  
  // Precio
  document.getElementById('product-price-preview').textContent = formatPrice(product.price);
  
  // Marca
  document.getElementById('product-brand-preview').textContent = capitalizeFirst(product.brand);
  
  // Modelo y referencia
  document.getElementById('product-model-preview').textContent = product.model || '-';
  document.getElementById('product-reference-preview').textContent = product.reference || '-';
  
  // Dimensiones y peso (solo para palos y accesorios)
  const dimensionsSpan = document.getElementById('product-dimensions-preview');
  const weightSpan = document.getElementById('product-weight-preview');
  const shippingWeightSpan = document.getElementById('product-shipping-weight-preview');
  
  if (product.category === 'palos' || product.category === 'accesorios') {
    dimensionsSpan.textContent = product.dimensions ? `${product.dimensions} mts` : '-';
    weightSpan.textContent = product.weight ? `${product.weight} kg` : '-';
    shippingWeightSpan.textContent = product.weight ? `${product.weight} kg` : '-';
  } else {
    dimensionsSpan.textContent = '-';
    weightSpan.textContent = '-';
    shippingWeightSpan.textContent = '-';
  }
  
  // Descripción
  document.getElementById('product-description-text-preview').textContent = 
    product.description || 'Descripción no disponible.';
  
  // Imágenes
  const images = product.images || { main: product.image || '', front: '', top: '', side: '' };
  
  // Imagen principal
  const mainImg = document.querySelector('#main-img-preview img');
  if (mainImg) {
    if (images.main) {
      mainImg.src = images.main;
      mainImg.style.display = 'block';
    } else {
      mainImg.style.display = 'none';
    }
  }
  
  // Miniaturas
  const thumbs = ['side', 'top', 'front'];
  thumbs.forEach((position, index) => {
    const thumbImg = document.querySelector(`#thumb-${position}-preview img`);
    if (thumbImg) {
      if (images[position]) {
        thumbImg.src = images[position];
        thumbImg.style.display = 'block';
      } else {
        thumbImg.style.display = 'none';
      }
    }
  });
}

/**
 * Abre el modal de confirmación para eliminar un producto.
 * @param {number} id - ID del producto
 */
function confirmDelete(id) {
  currentProductId = id;
  openDeleteModal();
}

/**
 * Elimina el producto seleccionado.
 */
function deleteProduct() {
  if (currentProductId === null) return;
  
  products = products.filter(p => p.id !== currentProductId);
  currentProductId = null;
  
  renderProducts();
  closeDeleteModal();
  showNotification('Producto eliminado correctamente', 'success');
}

/**
 * Maneja el envío del formulario de producto.
 * @param {Event} e - Evento submit
 */
function handleProductSubmit(e) {
  e.preventDefault();
  
  if (document.getElementById('btn-submit-text').textContent === 'Cerrar') {
    closeProductModal();
    return;
  }
  
  const formData = collectFormData();
  
  if (!formData.name || !formData.category || !formData.brand) {
    showNotification('Por favor completa todos los campos obligatorios', 'error');
    return;
  }
  
  if (currentProductId) {
    updateProduct(currentProductId, formData);
  } else {
    createProduct(formData);
  }
  
  renderProducts();
  closeProductModal();
  clearTempImageFiles();
}

/**
 * Recopila todos los datos del formulario.
 * @returns {Object} Datos del formulario
 */
function collectFormData() {
  const category = document.getElementById('product-category').value;
  const existingProduct = currentProductId ? products.find(p => p.id === currentProductId) : null;
  
  const images = {
    main: tempImageFiles.main || existingProduct?.images?.main || '',
    front: tempImageFiles.front || existingProduct?.images?.front || '',
    top: tempImageFiles.top || existingProduct?.images?.top || '',
    side: tempImageFiles.side || existingProduct?.images?.side || ''
  };
  
  const formData = {
    name: document.getElementById('product-name').value,
    category,
    brand: document.getElementById('product-brand').value,
    price: parseInt(document.getElementById('product-price').value) || 0,
    images,
    description: document.getElementById('product-description').value,
    model: document.getElementById('product-model').value,
    reference: document.getElementById('product-reference').value
  };
  
  if (category === 'guantes') {
    const sizeStock = {
      S: parseInt(document.getElementById('stock-size-s').value) || 0,
      M: parseInt(document.getElementById('stock-size-m').value) || 0,
      L: parseInt(document.getElementById('stock-size-l').value) || 0,
      XL: parseInt(document.getElementById('stock-size-xl').value) || 0,
      XXL: parseInt(document.getElementById('stock-size-xxl').value) || 0
    };
    formData.sizeStock = sizeStock;
    formData.stock = Object.values(sizeStock).reduce((a, b) => a + b, 0);
  } else {
    formData.stock = parseInt(document.getElementById('product-stock').value) || 0;
  }
  
  if (category === 'bolas') {
    formData.units = parseInt(document.getElementById('product-units').value) || 0;
  } else if (category === 'palos' || category === 'accesorios') {
    const suffix = category === 'accesorios' ? '-acc' : '';
    formData.dimensions = document.getElementById(`product-dimensions${suffix}`).value;
    formData.weight = parseFloat(document.getElementById(`product-weight${suffix}`).value) || 0;
  }
  
  return formData;
}

/**
 * Crea un nuevo producto.
 * @param {Object} formData - Datos del producto
 */
function createProduct(formData) {
  products.push({ id: nextId++, ...formData });
  showNotification('Producto creado correctamente', 'success');
}

/**
 * Actualiza un producto existente.
 * @param {number} id - ID del producto
 * @param {Object} formData - Nuevos datos
 */
function updateProduct(id, formData) {
  const index = products.findIndex(p => p.id === id);
  if (index !== -1) {
    products[index] = { ...products[index], ...formData };
    showNotification('Producto actualizado correctamente', 'success');
  } else {
    showNotification('Error al actualizar el producto', 'error');
  }
}

// ============================================================================
// GESTIÓN DE IMÁGENES
// ============================================================================

/**
 * Maneja la carga de archivos de imagen.
 * @param {Event} event - Evento change del input file
 * @param {string} position - Posición de la imagen (main, front, top, side)
 */
function handleImageUpload(event, position) {
  const file = event.target.files[0];
  
  if (!file) {
    clearImagePreview(position);
    tempImageFiles[position] = null;
    return;
  }
  
  if (!file.type.startsWith('image/')) {
    showNotification('Por favor selecciona un archivo de imagen válido', 'error');
    event.target.value = '';
    clearImagePreview(position);
    tempImageFiles[position] = null;
    return;
  }
  
  const reader = new FileReader();
  
  reader.onload = (e) => {
    const imageDataUrl = e.target.result;
    updateImagePreviewFromDataUrl(position, imageDataUrl);
    tempImageFiles[position] = imageDataUrl;
  };
  
  reader.onerror = () => {
    showNotification('Error al cargar la imagen', 'error');
    clearImagePreview(position);
    tempImageFiles[position] = null;
  };
  
  reader.readAsDataURL(file);
}

/**
 * Limpia todos los archivos temporales de imágenes.
 */
function clearTempImageFiles() {
  tempImageFiles = { main: null, front: null, top: null, side: null };
  clearFileInputs();
}

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Formatea un precio en pesos colombianos.
 * @param {number} price - Precio a formatear
 * @returns {string} Precio formateado
 */
const formatPrice = (price) => `$${price.toLocaleString('es-CO')} COP`;

/**
 * Capitaliza la primera letra de un string.
 * @param {string} str - String a capitalizar
 * @returns {string} String capitalizado
 */
const capitalizeFirst = (str) => str.charAt(0).toUpperCase() + str.slice(1);

// ============================================================================
// EVENT LISTENERS
// ============================================================================

/**
 * Configura todos los event listeners del dashboard.
 */
function setupDataEventListeners() {
  const btnCreateProduct = document.getElementById('btn-create-product');
  if (btnCreateProduct) {
    btnCreateProduct.addEventListener('click', openCreateModal);
  }
  
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      openLogoutModal();
    });
  }
  
  const btnConfirmLogout = document.getElementById('btn-confirm-logout');
  if (btnConfirmLogout) {
    btnConfirmLogout.addEventListener('click', () => {
      window.location.href = '../views/log_in.html';
    });
  }
  
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', handleSearch);
  }
  
  const filterCategory = document.getElementById('filter-category');
  if (filterCategory) {
    filterCategory.addEventListener('change', handleSearch);
  }
  
  const filterBrand = document.getElementById('filter-brand');
  if (filterBrand) {
    filterBrand.addEventListener('change', handleSearch);
  }
  
  const productForm = document.getElementById('product-form');
  if (productForm) {
    productForm.addEventListener('submit', handleProductSubmit);
  }
  
  const imageInputs = [
    { id: 'product-image-main', position: 'main' },
    { id: 'product-image-front', position: 'front' },
    { id: 'product-image-top', position: 'top' },
    { id: 'product-image-side', position: 'side' }
  ];
  
  imageInputs.forEach(({ id, position }) => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('change', (e) => handleImageUpload(e, position));
    }
  });
  
  const btnConfirmDelete = document.getElementById('btn-confirm-delete');
  if (btnConfirmDelete) {
    btnConfirmDelete.addEventListener('click', deleteProduct);
  }
}

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

/**
 * Inicializa la aplicación del dashboard.
 */
function initializeApp() {
  renderProducts();
  setupDataEventListeners();
}

document.addEventListener('DOMContentLoaded', initializeApp);
