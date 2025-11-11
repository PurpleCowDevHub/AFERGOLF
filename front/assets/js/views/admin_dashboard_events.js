// ========================================================
// ===== AFERGOLF - Admin Dashboard Events (Backend) =====
// ========================================================
// Este archivo maneja toda la lógica de negocio y datos:
// - Gestión de datos de productos (CRUD)
// - Búsqueda y filtrado de productos
// - Renderizado de la tabla de productos
// - Manejo de archivos de imágenes
// - Envío de formularios
// - Interacción con APIs (futuro)
// ========================================================

// ===== VARIABLES GLOBALES DE DATOS =====

/**
 * Array principal de productos
 * En producción, estos datos vendrían de una API/base de datos
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

/**
 * ID del producto actualmente seleccionado
 * null = modo creación, número = modo edición/vista
 */
let currentProductId = null;

/**
 * Contador para generar IDs únicos de productos
 */
let nextId = 4;

/**
 * Almacenamiento temporal de archivos de imagen
 * Guarda los Data URLs de las imágenes seleccionadas
 */
let tempImageFiles = {
  main: null,
  front: null,
  top: null,
  side: null
};

// ===== RENDERIZADO DE PRODUCTOS =====

/**
 * Renderiza la lista de productos en la tabla
 * @param {Object} filter - Objeto con filtros de búsqueda
 * @param {string} filter.search - Término de búsqueda
 * @param {string} filter.category - Categoría para filtrar
 * @param {string} filter.brand - Marca para filtrar
 */
function renderProducts(filter = {}) {
  const tbody = document.getElementById('products-tbody');
  const emptyState = document.getElementById('empty-state');
  
  let filteredProducts = [...products];
  
  // Aplicar filtro de búsqueda
  if (filter.search) {
    const searchLower = filter.search.toLowerCase();
    filteredProducts = filteredProducts.filter(p => 
      p.name.toLowerCase().includes(searchLower) ||
      p.brand.toLowerCase().includes(searchLower)
    );
  }
  
  // Aplicar filtro de categoría
  if (filter.category) {
    filteredProducts = filteredProducts.filter(p => p.category === filter.category);
  }
  
  // Aplicar filtro de marca
  if (filter.brand) {
    filteredProducts = filteredProducts.filter(p => p.brand === filter.brand);
  }
  
  // Mostrar productos o mensaje vacío
  if (filteredProducts.length === 0) {
    tbody.innerHTML = '';
    emptyState.style.display = 'flex';
  } else {
    emptyState.style.display = 'none';
    tbody.innerHTML = filteredProducts.map(product => createProductRow(product)).join('');
    attachRowEventListeners();
  }
}

/**
 * Crea el HTML de una fila de producto para la tabla
 * @param {Object} product - Objeto del producto
 * @returns {string} HTML de la fila
 */
function createProductRow(product) {
  const stockClass = product.stock < 10 ? 'low-stock' : '';
  const stockText = product.stock < 10 ? `${product.stock} (Bajo)` : product.stock;
  const mainImage = product.images?.main || product.image || '';
  
  return `
    <tr data-id="${product.id}">
      <td>
        <img src="${mainImage}" alt="${product.name}" class="product-thumbnail" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
        <div style="width: 60px; height: 60px; background: #e0e0e0; border-radius: 8px; display: none; align-items: center; justify-content: center; color: #999; font-size: 12px;">IMG</div>
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
 * Adjunta event listeners a los botones de acción de cada fila
 */
function attachRowEventListeners() {
  const actionButtons = document.querySelectorAll('.action-btn');
  
  actionButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const action = e.currentTarget.dataset.action;
      const row = e.currentTarget.closest('tr');
      const productId = parseInt(row.dataset.id);
      
      switch(action) {
        case 'view':
          viewProduct(productId);
          break;
        case 'edit':
          editProduct(productId);
          break;
        case 'delete':
          confirmDelete(productId);
          break;
      }
    });
  });
}

// ===== BÚSQUEDA Y FILTRADO =====

/**
 * Maneja la búsqueda y filtrado de productos
 * Lee los valores de los inputs y aplica los filtros
 */
function handleSearch() {
  const search = document.getElementById('search-input').value;
  const category = document.getElementById('filter-category').value;
  const brand = document.getElementById('filter-brand').value;
  
  renderProducts({ search, category, brand });
}

// ===== OPERACIONES CRUD =====

/**
 * Abre el modal para crear un nuevo producto
 */
function openCreateModal() {
  currentProductId = null;
  
  // Configurar modal para modo creación
  document.getElementById('modal-title').textContent = 'Crear Producto';
  document.getElementById('btn-submit-text').textContent = 'Guardar Producto';
  
  // Resetear formulario y limpiar imágenes
  resetProductForm();
  clearTempImageFiles();
  
  // Habilitar todos los campos
  enableFormFields();
  
  // Abrir modal
  openProductModal();
}

/**
 * Abre el modal para editar un producto existente
 * @param {number} id - ID del producto a editar
 */
function editProduct(id) {
  currentProductId = id;
  const product = products.find(p => p.id === id);
  
  if (!product) {
    showNotification('Producto no encontrado', 'error');
    return;
  }
  
  // Configurar modal para modo edición
  document.getElementById('modal-title').textContent = 'Editar Producto';
  document.getElementById('btn-submit-text').textContent = 'Actualizar Producto';
  
  // Cargar datos del producto en el formulario
  loadProductDataToForm(product);
  
  // Habilitar todos los campos
  enableFormFields();
  
  // Abrir modal
  openProductModal();
}

/**
 * Abre el modal para ver un producto en modo solo lectura
 * @param {number} id - ID del producto a visualizar
 */
function viewProduct(id) {
  currentProductId = null; // No guardar cambios en modo vista
  const product = products.find(p => p.id === id);
  
  if (!product) {
    showNotification('Producto no encontrado', 'error');
    return;
  }
  
  // Configurar modal para modo visualización
  document.getElementById('modal-title').textContent = 'Detalles del Producto';
  document.getElementById('btn-submit-text').textContent = 'Cerrar';
  
  // Cargar datos del producto en el formulario
  loadProductDataToForm(product);
  
  // Deshabilitar todos los campos (solo lectura)
  disableFormFields();
  
  // Abrir modal
  openProductModal();
}

/**
 * Carga los datos de un producto en el formulario
 * @param {Object} product - Objeto del producto
 */
function loadProductDataToForm(product) {
  // Campos básicos
  document.getElementById('product-id').value = product.id;
  document.getElementById('product-name').value = product.name;
  document.getElementById('product-category').value = product.category;
  document.getElementById('product-brand').value = product.brand;
  document.getElementById('product-price').value = product.price;
  document.getElementById('product-description').value = product.description || '';
  document.getElementById('product-model').value = product.model || '';
  document.getElementById('product-reference').value = product.reference || '';
  
  // Limpiar archivos temporales
  clearTempImageFiles();
  
  // Cargar imágenes existentes
  const images = product.images || { main: product.image || '', front: '', top: '', side: '' };
  updateImagePreviewFromUrl('main', images.main);
  updateImagePreviewFromUrl('front', images.front);
  updateImagePreviewFromUrl('top', images.top);
  updateImagePreviewFromUrl('side', images.side);
  
  // Actualizar campos dinámicos según categoría
  updateDynamicFields(product.category);
  
  // Cargar campos específicos por categoría
  if (product.category === 'guantes') {
    // Cargar stock por tallas
    const sizeStock = product.sizeStock || { S: 0, M: 0, L: 0, XL: 0, XXL: 0 };
    document.getElementById('stock-size-s').value = sizeStock.S || 0;
    document.getElementById('stock-size-m').value = sizeStock.M || 0;
    document.getElementById('stock-size-l').value = sizeStock.L || 0;
    document.getElementById('stock-size-xl').value = sizeStock.XL || 0;
    document.getElementById('stock-size-xxl').value = sizeStock.XXL || 0;
  } else {
    // Para otras categorías, usar stock general
    document.getElementById('product-stock').value = product.stock || 0;
  }
  
  if (product.category === 'bolas') {
    document.getElementById('product-units').value = product.units || '';
  } else if (product.category === 'palos') {
    document.getElementById('product-dimensions').value = product.dimensions || '';
    document.getElementById('product-weight').value = product.weight || '';
  } else if (product.category === 'accesorios') {
    document.getElementById('product-dimensions-acc').value = product.dimensions || '';
    document.getElementById('product-weight-acc').value = product.weight || '';
  }
}

/**
 * Abre el modal de confirmación para eliminar un producto
 * @param {number} id - ID del producto a eliminar
 */
function confirmDelete(id) {
  currentProductId = id;
  openDeleteModal();
}

/**
 * Elimina el producto seleccionado
 * Se ejecuta después de confirmar en el modal de eliminación
 */
function deleteProduct() {
  if (currentProductId === null) return;
  
  // Filtrar el producto del array
  products = products.filter(p => p.id !== currentProductId);
  currentProductId = null;
  
  // Actualizar la tabla
  renderProducts();
  
  // Cerrar modal y mostrar notificación
  closeDeleteModal();
  showNotification('Producto eliminado correctamente', 'success');
}

/**
 * Maneja el envío del formulario de producto
 * @param {Event} e - Evento de submit del formulario
 */
function handleProductSubmit(e) {
  e.preventDefault();
  
  // Si estamos en modo vista, solo cerrar
  const isViewMode = document.getElementById('btn-submit-text').textContent === 'Cerrar';
  if (isViewMode) {
    closeProductModal();
    return;
  }
  
  // Recopilar datos del formulario
  const formData = collectFormData();
  
  // Validar datos (básico)
  if (!formData.name || !formData.category || !formData.brand) {
    showNotification('Por favor completa todos los campos obligatorios', 'error');
    return;
  }
  
  if (currentProductId) {
    // Actualizar producto existente
    updateProduct(currentProductId, formData);
  } else {
    // Crear nuevo producto
    createProduct(formData);
  }
  
  // Actualizar tabla, cerrar modal y limpiar
  renderProducts();
  closeProductModal();
  clearTempImageFiles();
}

/**
 * Recopila todos los datos del formulario
 * @returns {Object} Objeto con los datos del formulario
 */
function collectFormData() {
  const category = document.getElementById('product-category').value;
  
  // Obtener las imágenes (usar archivos temporales o mantener las existentes)
  const existingProduct = currentProductId ? products.find(p => p.id === currentProductId) : null;
  const images = {
    main: tempImageFiles.main || existingProduct?.images?.main || '',
    front: tempImageFiles.front || existingProduct?.images?.front || '',
    top: tempImageFiles.top || existingProduct?.images?.top || '',
    side: tempImageFiles.side || existingProduct?.images?.side || ''
  };
  
  const formData = {
    name: document.getElementById('product-name').value,
    category: category,
    brand: document.getElementById('product-brand').value,
    price: parseInt(document.getElementById('product-price').value) || 0,
    images: images,
    description: document.getElementById('product-description').value,
    model: document.getElementById('product-model').value,
    reference: document.getElementById('product-reference').value
  };
  
  // Agregar campos específicos según categoría
  if (category === 'guantes') {
    // Recopilar stock por tallas
    const sizeStock = {
      S: parseInt(document.getElementById('stock-size-s').value) || 0,
      M: parseInt(document.getElementById('stock-size-m').value) || 0,
      L: parseInt(document.getElementById('stock-size-l').value) || 0,
      XL: parseInt(document.getElementById('stock-size-xl').value) || 0,
      XXL: parseInt(document.getElementById('stock-size-xxl').value) || 0
    };
    formData.sizeStock = sizeStock;
    // Calcular stock total
    formData.stock = sizeStock.S + sizeStock.M + sizeStock.L + sizeStock.XL + sizeStock.XXL;
  } else {
    // Para otras categorías, usar stock general
    formData.stock = parseInt(document.getElementById('product-stock').value) || 0;
  }
  
  if (category === 'bolas') {
    formData.units = parseInt(document.getElementById('product-units').value) || 0;
  } else if (category === 'palos') {
    formData.dimensions = document.getElementById('product-dimensions').value;
    formData.weight = parseFloat(document.getElementById('product-weight').value) || 0;
  } else if (category === 'accesorios') {
    formData.dimensions = document.getElementById('product-dimensions-acc').value;
    formData.weight = parseFloat(document.getElementById('product-weight-acc').value) || 0;
  }
  
  return formData;
}

/**
 * Crea un nuevo producto y lo agrega al array
 * @param {Object} formData - Datos del nuevo producto
 */
function createProduct(formData) {
  const newProduct = {
    id: nextId++,
    ...formData
  };
  
  products.push(newProduct);
  showNotification('Producto creado correctamente', 'success');
}

/**
 * Actualiza un producto existente
 * @param {number} id - ID del producto a actualizar
 * @param {Object} formData - Nuevos datos del producto
 */
function updateProduct(id, formData) {
  const index = products.findIndex(p => p.id === id);
  
  if (index !== -1) {
    products[index] = { 
      ...products[index], 
      ...formData 
    };
    showNotification('Producto actualizado correctamente', 'success');
  } else {
    showNotification('Error al actualizar el producto', 'error');
  }
}

// ===== GESTIÓN DE ARCHIVOS DE IMAGEN =====

/**
 * Maneja la carga de archivos de imagen
 * @param {Event} event - Evento de cambio del input file
 * @param {string} position - Posición de la imagen (main, front, top, side)
 */
function handleImageUpload(event, position) {
  const file = event.target.files[0];
  
  if (!file) {
    clearImagePreview(position);
    tempImageFiles[position] = null;
    return;
  }
  
  // Validar que sea una imagen
  if (!file.type.startsWith('image/')) {
    showNotification('Por favor selecciona un archivo de imagen válido', 'error');
    event.target.value = '';
    clearImagePreview(position);
    tempImageFiles[position] = null;
    return;
  }
  
  // Crear URL temporal para vista previa
  const reader = new FileReader();
  
  reader.onload = (e) => {
    const imageDataUrl = e.target.result;
    updateImagePreviewFromDataUrl(position, imageDataUrl);
    // Guardar el data URL temporalmente
    // En producción, aquí subirías la imagen a un servidor
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
 * Limpia todos los archivos temporales de imágenes
 */
function clearTempImageFiles() {
  tempImageFiles = {
    main: null,
    front: null,
    top: null,
    side: null
  };
  
  // Limpiar los inputs de tipo file
  clearFileInputs();
}

// ===== UTILIDADES =====

/**
 * Formatea un precio en pesos colombianos
 * @param {number} price - Precio a formatear
 * @returns {string} Precio formateado
 */
function formatPrice(price) {
  return `$${price.toLocaleString('es-CO')} COP`;
}

/**
 * Capitaliza la primera letra de un string
 * @param {string} str - String a capitalizar
 * @returns {string} String con primera letra mayúscula
 */
function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ===== CONFIGURACIÓN DE EVENT LISTENERS =====

/**
 * Configura todos los event listeners relacionados con los datos y eventos
 * Se ejecuta cuando el DOM está completamente cargado
 */
function setupDataEventListeners() {
  // Botón crear producto
  const btnCreateProduct = document.getElementById('btn-create-product');
  if (btnCreateProduct) {
    btnCreateProduct.addEventListener('click', openCreateModal);
  }
  
  // Búsqueda y filtros
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
  
  // Formulario de producto
  const productForm = document.getElementById('product-form');
  if (productForm) {
    productForm.addEventListener('submit', handleProductSubmit);
  }
  
  // Vista previa de imágenes al seleccionar archivos
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
  
  // Botón confirmar eliminación
  const btnConfirmDelete = document.getElementById('btn-confirm-delete');
  if (btnConfirmDelete) {
    btnConfirmDelete.addEventListener('click', deleteProduct);
  }
}

// ===== INICIALIZACIÓN =====

/**
 * Inicializa la aplicación
 * Se ejecuta automáticamente cuando el DOM está listo
 */
function initializeApp() {
  renderProducts();
  setupDataEventListeners();
}

// Ejecutar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});
