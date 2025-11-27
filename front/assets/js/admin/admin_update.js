/**
 * ============================================================================
 * AFERGOLF - MÓDULO FRONTEND: ACTUALIZAR PRODUCTO
 * ============================================================================
 * 
 * ARCHIVO: admin_update.js
 * UBICACIÓN: /front/assets/js/admin/admin_update.js
 * 
 * ============================================================================
 * DESCRIPCIÓN GENERAL
 * ============================================================================
 * 
 * Este módulo JavaScript maneja toda la lógica del lado del cliente (frontend)
 * para la ACTUALIZACIÓN de productos existentes en el panel de administración
 * de AFERGOLF.
 * 
 * FUNCIONALIDADES PRINCIPALES:
 * - Abrir modal de edición con datos precargados
 * - Cargar datos de un producto existente en el formulario
 * - Detectar cambios realizados por el usuario
 * - Enviar actualizaciones parciales al servidor
 * - Manejar actualización de imágenes (nuevas, mantener, eliminar)
 * 
 * PRINCIPIO DE RESPONSABILIDAD ÚNICA (SRP):
 * Este archivo solo maneja la operación UPDATE del CRUD.
 * Para otras operaciones, usar:
 * - admin_create.js → Crear productos
 * - admin_read.js   → Cargar y mostrar productos
 * - admin_delete.js → Eliminar productos
 * 
 * ============================================================================
 * ROL EN LA ARQUITECTURA DEL SISTEMA
 * ============================================================================
 * 
 * FLUJO COMPLETO FRONT → BACK → BASE DE DATOS:
 * 
 * 1. INTERFAZ DE USUARIO (admin_dashboard.html)
 *    ├── Usuario hace clic en botón "Editar" de un producto
 *    └── Se dispara evento click → editProduct(referencia)
 * 
 * 2. ESTE MÓDULO (admin_update.js)
 *    ├── editProduct() → Inicia proceso de edición
 *    ├── fetchProductByReference() → Obtiene datos actuales (de admin_read.js)
 *    ├── loadProductIntoForm() → Carga datos en el formulario
 *    ├── Usuario modifica campos
 *    ├── handleProductSubmit() → Captura submit (de admin_create.js)
 *    ├── collectFormData() → Recopila datos (de admin_create.js)
 *    └── updateProduct() → Envía petición PUT a la API
 * 
 * 3. BACKEND (update_product.php)
 *    ├── Recibe JSON con referencia y campos a actualizar
 *    ├── Valida que el producto exista
 *    ├── Procesa imágenes nuevas si las hay
 *    └── Ejecuta UPDATE en tabla 'productos'
 * 
 * 4. RESPUESTA Y ACTUALIZACIÓN DE UI
 *    ├── JavaScript recibe respuesta JSON
 *    ├── Si éxito: cierra modal, muestra toast, recarga tabla
 *    └── Si error: muestra mensaje de error
 * 
 * ============================================================================
 * FUNCIONES EXPORTADAS (Globales)
 * ============================================================================
 * 
 * ┌─────────────────────────┬───────────────────────────────────────────────┐
 * │ Función                 │ Descripción                                   │
 * ├─────────────────────────┼───────────────────────────────────────────────┤
 * │ editProduct(ref)        │ Inicia proceso de edición de un producto      │
 * │ updateProduct(formData) │ Envía actualización al servidor               │
 * │ loadProductIntoForm(p)  │ Carga datos de producto en el formulario      │
 * │ currentProductId        │ Variable global con referencia en edición     │
 * └─────────────────────────┴───────────────────────────────────────────────┘
 * 
 * ============================================================================
 * DEPENDENCIAS
 * ============================================================================
 * 
 * ARCHIVOS REQUERIDOS (cargar antes de este):
 * - /front/assets/js/ui/toast.js       → showNotification()
 * - /front/assets/js/ui/components.js  → openProductModal(), closeProductModal(),
 *                                        enableFormFields(), updateImagePreviewFromDataUrl()
 * - /front/assets/js/admin/admin_read.js   → fetchProductByReference(), loadProducts()
 * - /front/assets/js/admin/admin_create.js → getTempImageFiles(), setTempImageFile(),
 *                                            collectFormData()
 * 
 * ============================================================================
 * ELEMENTOS HTML REQUERIDOS
 * ============================================================================
 * 
 * MODAL:
 * - #product-modal   → Modal de crear/editar producto
 * - #modal-title     → Título del modal (se cambia a "Editar Producto")
 * - #btn-submit-text → Texto del botón submit
 * 
 * FORMULARIO (mismos que admin_create.js):
 * - #product-form, #product-name, #product-description, etc.
 * 
 * ============================================================================
 * MANEJO DE IMÁGENES EN ACTUALIZACIÓN
 * ============================================================================
 * 
 * Al actualizar un producto, las imágenes se manejan así:
 * 
 * 1. MANTENER IMAGEN EXISTENTE:
 *    - El usuario no selecciona nueva imagen
 *    - Se envía la ruta actual (/AFERGOLF/uploads/products/...)
 *    - El backend detecta que no es Base64 y no la procesa
 * 
 * 2. SUBIR IMAGEN NUEVA:
 *    - El usuario selecciona un archivo
 *    - Se convierte a Base64 (data:image/...)
 *    - El backend detecta Base64, guarda nuevo archivo
 *    - Se reemplaza la imagen anterior
 * 
 * 3. ELIMINAR IMAGEN:
 *    - (TODO) Enviar cadena vacía ""
 *    - El backend actualiza el campo a vacío
 * 
 * ============================================================================
 * CONFIGURACIÓN
 * ============================================================================
 */

// URL del endpoint para actualizar productos
const UPDATE_API_URL = 'http://localhost/AFERGOLF/back/modules/products/api/admin/update_product.php';

/**
 * Referencia del producto actualmente en edición
 * - null: modo creación
 * - string: modo edición (ej: "AFG-P001")
 * 
 * @type {string|null}
 * @global
 */
window.currentProductId = null;

/**
 * Parsea un string de dimensiones y lo asigna a los campos individuales
 * 
 * @function parseDimensionsToFields
 * @param {string} dimensions - String de dimensiones (ej: "0.89 x 0.10 x 0.10")
 * @param {string} largoId - ID del input de largo
 * @param {string} anchoId - ID del input de ancho
 * @param {string} altoId - ID del input de alto
 */
function parseDimensionsToFields(dimensions, largoId, anchoId, altoId) {
  const largoInput = document.getElementById(largoId);
  const anchoInput = document.getElementById(anchoId);
  const altoInput = document.getElementById(altoId);
  
  if (!dimensions || dimensions.trim() === '') {
    if (largoInput) largoInput.value = '';
    if (anchoInput) anchoInput.value = '';
    if (altoInput) altoInput.value = '';
    return;
  }
  
  // Separar por 'x' y limpiar espacios
  const parts = dimensions.split('x').map(p => p.trim());
  
  if (largoInput) largoInput.value = parts[0] || '';
  if (anchoInput) anchoInput.value = parts[1] || '';
  if (altoInput) altoInput.value = parts[2] || '';
}

// ============================================================================
// FUNCIÓN: EDITAR PRODUCTO
// ============================================================================

/**
 * Inicia el proceso de edición de un producto
 * 
 * FLUJO:
 * 1. Obtiene datos del producto desde el servidor
 * 2. Cambia el modal a modo edición
 * 3. Carga los datos en el formulario
 * 4. Abre el modal
 * 
 * @function editProduct
 * @global
 * @async
 * @param {string} referencia - Referencia del producto a editar
 * @returns {Promise<void>}
 */
async function editProduct(referencia) {
  // Obtener datos del producto
  const producto = await fetchProductByReference(referencia);
  
  if (!producto) {
    return;
  }
  
  // Cambiar a modo edición
  window.currentProductId = referencia;
  
  // Actualizar textos del modal
  const modalTitle = document.getElementById('modal-title');
  const btnSubmitText = document.getElementById('btn-submit-text');
  
  if (modalTitle) modalTitle.textContent = 'Editar Producto';
  if (btnSubmitText) btnSubmitText.textContent = 'Actualizar Producto';
  
  // Remover required de imagen principal (ya tiene imagen)
  const mainImageInput = document.getElementById('product-image-main');
  if (mainImageInput) {
    mainImageInput.removeAttribute('required');
  }
  
  // Cargar datos en el formulario
  loadProductIntoForm(producto);
  
  // Habilitar campos
  if (typeof enableFormFields === 'function') {
    enableFormFields();
  }
  
  // Abrir modal
  if (typeof openProductModal === 'function') {
    openProductModal();
  }
}

// ============================================================================
// FUNCIÓN: CARGAR PRODUCTO EN FORMULARIO
// ============================================================================

/**
 * Carga los datos de un producto en el formulario de edición
 * 
 * @function loadProductIntoForm
 * @global
 * @param {Object} producto - Datos del producto
 * @returns {void}
 */
function loadProductIntoForm(producto) {
  // --- Campos generales ---
  
  const nameInput = document.getElementById('product-name');
  if (nameInput) {
    nameInput.value = producto.nombre || '';
    // Actualizar contador de caracteres
    if (typeof updateNameCharCounter === 'function') {
      updateNameCharCounter(nameInput);
    }
  }
  
  const descInput = document.getElementById('product-description');
  if (descInput) descInput.value = producto.descripcion || '';
  
  const categorySelect = document.getElementById('product-category');
  if (categorySelect) {
    categorySelect.value = producto.categoria || '';
    // Disparar evento change para mostrar campos dinámicos
    categorySelect.dispatchEvent(new Event('change'));
  }
  
  const brandSelect = document.getElementById('product-brand');
  if (brandSelect) brandSelect.value = producto.marca || '';
  
  const modelInput = document.getElementById('product-model');
  if (modelInput) modelInput.value = producto.modelo || '';
  
  const priceInput = document.getElementById('product-price');
  if (priceInput) priceInput.value = producto.precio || 0;
  
  // --- Stock según categoría ---
  
  if (producto.categoria === 'guantes') {
    // Stock por tallas
    const sizeS = document.getElementById('stock-size-s');
    const sizeM = document.getElementById('stock-size-m');
    const sizeL = document.getElementById('stock-size-l');
    const sizeXL = document.getElementById('stock-size-xl');
    const sizeXXL = document.getElementById('stock-size-xxl');
    
    if (sizeS) sizeS.value = producto.stock_talla_s || 0;
    if (sizeM) sizeM.value = producto.stock_talla_m || 0;
    if (sizeL) sizeL.value = producto.stock_talla_l || 0;
    if (sizeXL) sizeXL.value = producto.stock_talla_xl || 0;
    if (sizeXXL) sizeXXL.value = producto.stock_talla_xxl || 0;
  } else {
    // Stock general
    const stockInput = document.getElementById('product-stock');
    if (stockInput) stockInput.value = producto.stock || 0;
  }
  
  // --- Campos específicos por categoría ---
  
  if (producto.categoria === 'bolas') {
    const unitsInput = document.getElementById('product-units');
    if (unitsInput) unitsInput.value = producto.unidades_paquete || 0;
  } else if (producto.categoria === 'palos') {
    // Cargar especificaciones técnicas del palo
    const longitudInput = document.getElementById('product-longitud');
    const loftInput = document.getElementById('product-loft');
    const lieInput = document.getElementById('product-lie');
    const pesoInput = document.getElementById('product-peso');
    const swingweightInput = document.getElementById('product-swingweight');
    const flexSelect = document.getElementById('product-flex');
    
    if (longitudInput) longitudInput.value = producto.longitud || '';
    if (loftInput) loftInput.value = producto.loft || '';
    if (lieInput) lieInput.value = producto.lie || '';
    if (pesoInput) pesoInput.value = producto.peso || '';
    if (swingweightInput) swingweightInput.value = producto.swingweight || '';
    if (flexSelect) flexSelect.value = producto.flex || '';
  }
  
  // --- Cargar imágenes ---
  loadProductImagesForEdit(producto);
}

/**
 * Carga las imágenes del producto para edición
 * 
 * @function loadProductImagesForEdit
 * @param {Object} producto - Datos del producto
 */
function loadProductImagesForEdit(producto) {
  const imageFields = {
    main: 'imagen_principal',
    front: 'imagen_frontal',
    top: 'imagen_superior',
    side: 'imagen_lateral'
  };
  
  Object.keys(imageFields).forEach(position => {
    const imageData = producto[imageFields[position]];
    
    // Guardar en tempImageFiles para enviar en la actualización
    if (typeof setTempImageFile === 'function') {
      setTempImageFile(position, imageData || null);
    }
    
    // Actualizar vista previa
    const previewId = `preview-${position}`;
    const preview = document.getElementById(previewId);
    
    if (preview) {
      const img = preview.querySelector('img');
      const placeholder = preview.querySelector('.preview-placeholder');
      
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
}

// ============================================================================
// FUNCIÓN: ACTUALIZAR PRODUCTO
// ============================================================================

/**
 * Envía la actualización del producto al servidor
 * 
 * FLUJO:
 * 1. Agrega la referencia a los datos
 * 2. Envía petición PUT
 * 3. Maneja respuesta
 * 
 * @function updateProduct
 * @global
 * @async
 * @param {Object} formData - Datos del formulario
 * @returns {Promise<void>}
 */
async function updateProduct(formData) {
  if (!window.currentProductId) {
    if (typeof showNotification === 'function') {
      showNotification('Error: No se ha seleccionado producto para editar', 'error');
    }
    return;
  }
  
  try {
    // Agregar referencia
    formData.referencia = window.currentProductId;
    
    const response = await fetch(UPDATE_API_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Éxito
      if (typeof showNotification === 'function') {
        showNotification('Producto actualizado correctamente', 'success');
      }
      
      // Cerrar modal
      if (typeof closeProductModal === 'function') {
        closeProductModal();
      }
      
      // Limpiar imágenes temporales
      if (typeof clearTempImageFiles === 'function') {
        clearTempImageFiles();
      }
      
      // Resetear currentProductId
      window.currentProductId = null;
      
      // Recargar tabla
      if (typeof loadProducts === 'function') {
        loadProducts();
      }
      
    } else {
      // Error del servidor
      if (typeof showNotification === 'function') {
        showNotification(result.message || 'Error al actualizar el producto', 'error');
      }
    }
    
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    if (typeof showNotification === 'function') {
      showNotification('Error al conectar con el servidor', 'error');
    }
  }
}

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

/**
 * No requiere event listeners propios ya que:
 * - El botón "Editar" se crea dinámicamente en admin_read.js
 * - El formulario submit se maneja en admin_create.js
 */
