/**
 * ============================================================================
 * AFERGOLF - Products Module
 * ============================================================================
 * Gestión de productos: crear, leer, actualizar, eliminar
 * 
 * @author AFERGOLF Team
 * @version 1.0.0
 * ============================================================================
 */

const API_URL = 'http://localhost/AFERGOLF/back/modules/products/api/admin_products.php';
let currentProductId = null;
let tempImageFiles = { main: null, front: null, top: null, side: null };

// ============================================================================
// CREAR PRODUCTO
// ============================================================================

/**
 * Abre el modal para crear un nuevo producto
 */
function openCreateModal() {
  currentProductId = null;
  document.getElementById('modal-title').textContent = 'Crear Producto';
  document.getElementById('btn-submit-text').textContent = 'Guardar Producto';
  
  if (typeof resetProductForm === 'function') resetProductForm();
  clearTempImageFiles();
  if (typeof enableFormFields === 'function') enableFormFields();
  if (typeof openProductModal === 'function') openProductModal();
}

/**
 * Recopila datos del formulario y envía al servidor
 * @param {Event} e - Evento submit del formulario
 */
function handleProductSubmit(e) {
  e.preventDefault();

  const formData = collectFormData();

  if (!formData.nombre || !formData.categoria || !formData.marca || formData.precio === 0) {
    if (typeof showNotification === 'function') {
      showNotification('Por favor completa todos los campos obligatorios', 'error');
    }
    return;
  }

  saveProduct(formData);
}

/**
 * Recopila todos los datos del formulario
 * @returns {Object} Datos del producto
 */
function collectFormData() {
  const category = document.getElementById('product-category').value;
  
  const formData = {
    nombre: document.getElementById('product-name').value,
    descripcion: document.getElementById('product-description').value,
    categoria: category,
    marca: document.getElementById('product-brand').value,
    modelo: document.getElementById('product-model').value,
    precio: parseInt(document.getElementById('product-price').value) || 0,
    imagen_principal: tempImageFiles.main || '',
    imagen_frontal: tempImageFiles.front || '',
    imagen_superior: tempImageFiles.top || '',
    imagen_lateral: tempImageFiles.side || ''
  };

  // Stock según categoría
  if (category === 'guantes') {
    formData.stock_talla_s = parseInt(document.getElementById('stock-size-s')?.value) || 0;
    formData.stock_talla_m = parseInt(document.getElementById('stock-size-m')?.value) || 0;
    formData.stock_talla_l = parseInt(document.getElementById('stock-size-l')?.value) || 0;
    formData.stock_talla_xl = parseInt(document.getElementById('stock-size-xl')?.value) || 0;
    formData.stock_talla_xxl = parseInt(document.getElementById('stock-size-xxl')?.value) || 0;
    formData.stock = Object.values({
      s: formData.stock_talla_s,
      m: formData.stock_talla_m,
      l: formData.stock_talla_l,
      xl: formData.stock_talla_xl,
      xxl: formData.stock_talla_xxl
    }).reduce((a, b) => a + b, 0);
  } else {
    formData.stock = parseInt(document.getElementById('product-stock')?.value) || 0;
  }

  // Campos específicos por categoría
  if (category === 'bolas') {
    formData.unidades_paquete = parseInt(document.getElementById('product-units')?.value) || 0;
  } else if (category === 'palos' || category === 'accesorios') {
    const suffix = category === 'accesorios' ? '-acc' : '';
    formData.dimensiones = document.getElementById(`product-dimensions${suffix}`)?.value || '';
    formData.peso = parseFloat(document.getElementById(`product-weight${suffix}`)?.value) || 0;
  }

  return formData;
}

/**
 * Envía el producto a la API para guardarlo en BD
 * @param {Object} formData - Datos del producto
 */
async function saveProduct(formData) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    const result = await response.json();

    if (result.success) {
      if (typeof showNotification === 'function') {
        showNotification('Producto creado correctamente', 'success');
      }
      if (typeof closeProductModal === 'function') closeProductModal();
      clearTempImageFiles();
      loadProducts();
    } else {
      if (typeof showNotification === 'function') {
        showNotification(result.message || 'Error al crear el producto', 'error');
      }
    }
  } catch (error) {
    console.error('Error:', error);
    if (typeof showNotification === 'function') {
      showNotification('Error al conectar con el servidor', 'error');
    }
  }
}

// ============================================================================
// GESTIÓN DE IMÁGENES
// ============================================================================

/**
 * Maneja la carga de imágenes
 * @param {Event} event - Evento change del input file
 * @param {string} position - Posición de la imagen (main, front, top, side)
 */
function handleImageUpload(event, position) {
  const file = event.target.files[0];

  if (!file) {
    tempImageFiles[position] = null;
    return;
  }

  if (!file.type.startsWith('image/')) {
    if (typeof showNotification === 'function') {
      showNotification('Por favor selecciona un archivo de imagen válido', 'error');
    }
    event.target.value = '';
    return;
  }

  const reader = new FileReader();

  reader.onload = (e) => {
    tempImageFiles[position] = e.target.result;
    if (typeof updateImagePreviewFromDataUrl === 'function') {
      updateImagePreviewFromDataUrl(position, e.target.result);
    }
  };

  reader.onerror = () => {
    if (typeof showNotification === 'function') {
      showNotification('Error al cargar la imagen', 'error');
    }
  };

  reader.readAsDataURL(file);
}

/**
 * Limpia archivos temporales de imágenes
 */
function clearTempImageFiles() {
  tempImageFiles = { main: null, front: null, top: null, side: null };
  if (typeof clearFileInputs === 'function') clearFileInputs();
}

// ============================================================================
// CARGAR PRODUCTOS (placeholder para futuro)
// ============================================================================

/**
 * Carga la lista de productos desde el servidor
 */
function loadProducts() {
  // TODO: Implementar carga de productos desde servidor
  // Esto renderizará la tabla
}

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

/**
 * Configura los event listeners del dashboard
 */
function setupProductsEventListeners() {
  const btnCreateProduct = document.getElementById('btn-create-product');
  if (btnCreateProduct) {
    btnCreateProduct.addEventListener('click', openCreateModal);
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
}

/**
 * Inicializa el módulo de productos
 */
function initializeProductsModule() {
  setupProductsEventListeners();
  loadProducts();
}

if (document.getElementById('products-tbody')) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeProductsModule);
  } else {
    initializeProductsModule();
  }
}
