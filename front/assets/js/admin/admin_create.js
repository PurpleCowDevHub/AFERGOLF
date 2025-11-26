/**
 * ============================================================================
 * AFERGOLF - MÓDULO FRONTEND: CREAR PRODUCTO
 * ============================================================================
 * 
 * ARCHIVO: admin_create.js
 * UBICACIÓN: /front/assets/js/admin/admin_create.js
 * 
 * ============================================================================
 * DESCRIPCIÓN GENERAL
 * ============================================================================
 * 
 * Este módulo JavaScript maneja toda la lógica del lado del cliente (frontend)
 * para la CREACIÓN de nuevos productos en el panel de administración de AFERGOLF.
 * 
 * PRINCIPIO DE RESPONSABILIDAD ÚNICA (SRP):
 * Este archivo solo maneja la operación CREATE del CRUD.
 * Para otras operaciones, usar:
 * - admin_read.js   → Cargar y mostrar productos
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
 *    ├── Usuario hace clic en botón "Crear Producto"
 *    └── Se dispara evento click → openCreateModal()
 * 
 * 2. ESTE MÓDULO (admin_create.js)
 *    ├── openCreateModal() → Prepara y abre el modal vacío
 *    ├── Usuario llena el formulario
 *    ├── handleImageUpload() → Convierte imágenes a Base64
 *    ├── Usuario hace clic en "Guardar Producto"
 *    ├── handleProductSubmit() → Captura evento submit
 *    ├── collectFormData() → Recopila datos del formulario
 *    ├── validateFormData() → Valida campos obligatorios
 *    └── saveNewProduct() → Envía petición POST a la API
 * 
 * 3. BACKEND (create_product.php)
 *    ├── Recibe JSON con datos del producto
 *    ├── Valida y sanitiza datos
 *    ├── Genera referencia única (AFG-P001, etc.)
 *    ├── Guarda imágenes en /uploads/products/
 *    └── Inserta registro en tabla 'productos'
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
 * ┌────────────────────────┬────────────────────────────────────────────────┐
 * │ Función                │ Descripción                                    │
 * ├────────────────────────┼────────────────────────────────────────────────┤
 * │ openCreateModal()      │ Abre el modal en modo creación                 │
 * │ handleProductSubmit(e) │ Maneja el envío del formulario                 │
 * │ handleImageUpload(e,p) │ Procesa carga de imágenes                      │
 * │ clearTempImageFiles()  │ Limpia imágenes temporales                     │
 * │ getTempImageFiles()    │ Obtiene objeto de imágenes temporales          │
 * │ setTempImageFile(p,d)  │ Establece una imagen temporal                  │
 * └────────────────────────┴────────────────────────────────────────────────┘
 * 
 * ============================================================================
 * DEPENDENCIAS
 * ============================================================================
 * 
 * ARCHIVOS REQUERIDOS (cargar antes de este):
 * - /front/assets/js/ui/toast.js      → showNotification()
 * - /front/assets/js/ui/components.js → resetProductForm(), openProductModal(),
 *                                       closeProductModal(), enableFormFields(),
 *                                       updateImagePreviewFromDataUrl()
 * 
 * ARCHIVOS QUE USAN ESTE MÓDULO:
 * - admin_read.js   → Llama loadProducts() después de crear
 * - admin_update.js → Usa getTempImageFiles() y setTempImageFile()
 * 
 * ============================================================================
 * ELEMENTOS HTML REQUERIDOS
 * ============================================================================
 * 
 * BOTONES:
 * - #btn-create-product  → Botón para abrir modal de creación
 * 
 * MODAL:
 * - #product-modal       → Modal de crear/editar producto
 * - #modal-title         → Título del modal (se cambia a "Crear Producto")
 * - #btn-submit-text     → Texto del botón submit
 * 
 * FORMULARIO:
 * - #product-form        → Formulario principal
 * - #product-id          → Input hidden para ID (vacío en creación)
 * - #product-name        → Nombre del producto
 * - #product-description → Descripción
 * - #product-category    → Select de categoría
 * - #product-brand       → Select de marca
 * - #product-model       → Modelo
 * - #product-price       → Precio
 * - #product-stock       → Stock general
 * 
 * INPUTS DE IMÁGENES:
 * - #product-image-main  → Imagen principal (obligatoria)
 * - #product-image-front → Vista frontal
 * - #product-image-top   → Vista superior
 * - #product-image-side  → Vista lateral
 * 
 * CAMPOS DINÁMICOS (según categoría):
 * - Guantes: #stock-size-s, #stock-size-m, #stock-size-l, etc.
 * - Bolas: #product-units
 * - Palos: #product-dimensions, #product-weight
 * - Accesorios: #product-dimensions-acc, #product-weight-acc
 * 
 * ============================================================================
 * CONFIGURACIÓN
 * ============================================================================
 */

// URL del endpoint para crear productos
const CREATE_API_URL = 'http://localhost/AFERGOLF/back/modules/products/api/admin/create_product.php';

/**
 * Almacenamiento temporal de imágenes convertidas a Base64
 * Se usa tanto para crear como para editar productos
 * 
 * @type {Object}
 * @property {string|null} main  - Imagen principal del producto
 * @property {string|null} front - Vista frontal del producto
 * @property {string|null} top   - Vista superior del producto
 * @property {string|null} side  - Vista lateral del producto
 */
let tempImageFiles = {
  main: null,
  front: null,
  top: null,
  side: null
};

// ============================================================================
// FUNCIÓN: ABRIR MODAL DE CREACIÓN
// ============================================================================

/**
 * Abre el modal para crear un nuevo producto
 * 
 * FLUJO:
 * 1. Establece currentProductId como null (modo creación)
 * 2. Actualiza título del modal a "Crear Producto"
 * 3. Limpia el formulario de datos anteriores
 * 4. Limpia las imágenes temporales
 * 5. Habilita todos los campos
 * 6. Hace que la imagen principal sea requerida
 * 7. Muestra el modal
 * 
 * @function openCreateModal
 * @global
 * @returns {void}
 */
function openCreateModal() {
  // Indicar que estamos en modo creación
  // currentProductId está definido en admin_update.js
  if (typeof window.currentProductId !== 'undefined') {
    window.currentProductId = null;
  }
  
  // Actualizar textos del modal
  const modalTitle = document.getElementById('modal-title');
  const btnSubmitText = document.getElementById('btn-submit-text');
  
  if (modalTitle) modalTitle.textContent = 'Crear Producto';
  if (btnSubmitText) btnSubmitText.textContent = 'Guardar Producto';
  
  // Limpiar formulario (función de components.js)
  if (typeof resetProductForm === 'function') {
    resetProductForm();
  }
  
  // Limpiar imágenes temporales
  clearTempImageFiles();
  
  // Habilitar campos para edición (función de components.js)
  if (typeof enableFormFields === 'function') {
    enableFormFields();
  }
  
  // Hacer que la imagen principal sea requerida en modo creación
  const mainImageInput = document.getElementById('product-image-main');
  if (mainImageInput) {
    mainImageInput.setAttribute('required', 'required');
  }
  
  // Abrir el modal (función de components.js)
  if (typeof openProductModal === 'function') {
    openProductModal();
  }
}

// ============================================================================
// FUNCIÓN: MANEJAR SUBMIT DEL FORMULARIO
// ============================================================================

/**
 * Maneja el evento submit del formulario de productos
 * 
 * Determina si es creación o edición basándose en currentProductId
 * y llama a la función correspondiente.
 * 
 * @function handleProductSubmit
 * @global
 * @param {Event} e - Evento submit del formulario
 * @returns {void}
 */
function handleProductSubmit(e) {
  e.preventDefault();
  
  // Recopilar datos del formulario
  const formData = collectFormData();
  
  // Validar campos obligatorios
  if (!validateFormData(formData)) {
    return;
  }
  
  // Determinar si es creación o edición
  const isUpdate = typeof window.currentProductId !== 'undefined' && 
                   window.currentProductId !== null;
  
  if (isUpdate) {
    // Modo edición - llamar función de admin_update.js
    if (typeof updateProduct === 'function') {
      updateProduct(formData);
    }
  } else {
    // Modo creación - usar este módulo
    saveNewProduct(formData);
  }
}

// ============================================================================
// FUNCIÓN: RECOPILAR DATOS DEL FORMULARIO
// ============================================================================

/**
 * Recopila todos los datos del formulario en un objeto
 * 
 * Maneja campos dinámicos según la categoría seleccionada:
 * - Guantes: stock por tallas
 * - Bolas: unidades por paquete
 * - Palos/Accesorios: dimensiones y peso
 * 
 * @function collectFormData
 * @global
 * @returns {Object} Objeto con todos los datos del producto
 */
function collectFormData() {
  const category = document.getElementById('product-category')?.value || '';
  
  // Datos generales
  const formData = {
    nombre: document.getElementById('product-name')?.value || '',
    descripcion: document.getElementById('product-description')?.value || '',
    categoria: category,
    marca: document.getElementById('product-brand')?.value || '',
    modelo: document.getElementById('product-model')?.value || '',
    precio: parseInt(document.getElementById('product-price')?.value) || 0,
    
    // Imágenes en Base64
    imagen_principal: tempImageFiles.main || '',
    imagen_frontal: tempImageFiles.front || '',
    imagen_superior: tempImageFiles.top || '',
    imagen_lateral: tempImageFiles.side || ''
  };
  
  // Stock según categoría
  if (category === 'guantes') {
    // Guantes: stock por tallas
    formData.stock_talla_s = parseInt(document.getElementById('stock-size-s')?.value) || 0;
    formData.stock_talla_m = parseInt(document.getElementById('stock-size-m')?.value) || 0;
    formData.stock_talla_l = parseInt(document.getElementById('stock-size-l')?.value) || 0;
    formData.stock_talla_xl = parseInt(document.getElementById('stock-size-xl')?.value) || 0;
    formData.stock_talla_xxl = parseInt(document.getElementById('stock-size-xxl')?.value) || 0;
    
    // Stock total = suma de tallas
    formData.stock = formData.stock_talla_s + formData.stock_talla_m + 
                     formData.stock_talla_l + formData.stock_talla_xl + 
                     formData.stock_talla_xxl;
  } else {
    // Otras categorías: stock general
    formData.stock = parseInt(document.getElementById('product-stock')?.value) || 0;
  }
  
  // Campos específicos por categoría
  if (category === 'bolas') {
    formData.unidades_paquete = parseInt(document.getElementById('product-units')?.value) || 0;
  } else if (category === 'palos') {
    formData.dimensiones = document.getElementById('product-dimensions')?.value || '';
    formData.peso = parseFloat(document.getElementById('product-weight')?.value) || 0;
  } else if (category === 'accesorios') {
    formData.dimensiones = document.getElementById('product-dimensions-acc')?.value || '';
    formData.peso = parseFloat(document.getElementById('product-weight-acc')?.value) || 0;
  }
  
  return formData;
}

// ============================================================================
// FUNCIÓN: VALIDAR DATOS DEL FORMULARIO
// ============================================================================

/**
 * Valida que los campos obligatorios estén completos
 * 
 * @function validateFormData
 * @param {Object} formData - Datos del formulario
 * @returns {boolean} True si es válido, false si hay errores
 */
function validateFormData(formData) {
  const errores = [];
  
  if (!formData.nombre || formData.nombre.trim() === '') {
    errores.push('Nombre del producto');
  }
  
  if (!formData.categoria) {
    errores.push('Categoría');
  }
  
  if (!formData.marca) {
    errores.push('Marca');
  }
  
  if (!formData.precio || formData.precio <= 0) {
    errores.push('Precio (debe ser mayor a 0)');
  }
  
  if (errores.length > 0) {
    if (typeof showNotification === 'function') {
      showNotification(`Campos obligatorios faltantes: ${errores.join(', ')}`, 'error');
    }
    return false;
  }
  
  return true;
}

// ============================================================================
// FUNCIÓN: GUARDAR NUEVO PRODUCTO
// ============================================================================

/**
 * Envía los datos del nuevo producto a la API
 * 
 * FLUJO:
 * 1. Envía petición POST con datos JSON
 * 2. Espera respuesta del servidor
 * 3. Si éxito: cierra modal, limpia imágenes, recarga tabla
 * 4. Si error: muestra notificación
 * 
 * @function saveNewProduct
 * @async
 * @param {Object} formData - Datos del producto
 * @returns {Promise<void>}
 */
async function saveNewProduct(formData) {
  try {
    const response = await fetch(CREATE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Éxito
      if (typeof showNotification === 'function') {
        showNotification('Producto creado correctamente', 'success');
      }
      
      // Cerrar modal
      if (typeof closeProductModal === 'function') {
        closeProductModal();
      }
      
      // Limpiar imágenes temporales
      clearTempImageFiles();
      
      // Recargar tabla de productos
      if (typeof loadProducts === 'function') {
        loadProducts();
      }
      
    } else {
      // Error del servidor
      if (typeof showNotification === 'function') {
        showNotification(result.message || 'Error al crear el producto', 'error');
      }
    }
    
  } catch (error) {
    console.error('Error al crear producto:', error);
    if (typeof showNotification === 'function') {
      showNotification('Error al conectar con el servidor', 'error');
    }
  }
}

// ============================================================================
// FUNCIÓN: MANEJAR CARGA DE IMÁGENES
// ============================================================================

/**
 * Maneja la carga y conversión de imágenes a Base64
 * 
 * @function handleImageUpload
 * @global
 * @param {Event} event - Evento change del input file
 * @param {string} position - Posición de la imagen (main, front, top, side)
 * @returns {void}
 */
function handleImageUpload(event, position) {
  const file = event.target.files[0];
  
  if (!file) {
    tempImageFiles[position] = null;
    return;
  }
  
  // Validar que sea imagen
  if (!file.type.startsWith('image/')) {
    if (typeof showNotification === 'function') {
      showNotification('Por favor selecciona un archivo de imagen válido', 'error');
    }
    event.target.value = '';
    return;
  }
  
  // Validar tamaño (máximo 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB en bytes
  if (file.size > maxSize) {
    if (typeof showNotification === 'function') {
      showNotification('La imagen no debe superar 5MB', 'error');
    }
    event.target.value = '';
    return;
  }
  
  // Convertir a Base64
  const reader = new FileReader();
  
  reader.onload = (e) => {
    tempImageFiles[position] = e.target.result;
    
    // Actualizar vista previa
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

// ============================================================================
// FUNCIONES DE UTILIDAD PARA IMÁGENES
// ============================================================================

/**
 * Limpia todas las imágenes temporales
 * 
 * @function clearTempImageFiles
 * @global
 * @returns {void}
 */
function clearTempImageFiles() {
  tempImageFiles = {
    main: null,
    front: null,
    top: null,
    side: null
  };
  
  // Limpiar inputs de archivo
  if (typeof clearFileInputs === 'function') {
    clearFileInputs();
  }
}

/**
 * Obtiene el objeto de imágenes temporales
 * Usado por admin_update.js para acceder a las imágenes
 * 
 * @function getTempImageFiles
 * @global
 * @returns {Object} Objeto con imágenes temporales
 */
function getTempImageFiles() {
  return tempImageFiles;
}

/**
 * Establece una imagen temporal
 * Usado por admin_update.js al cargar producto existente
 * 
 * @function setTempImageFile
 * @global
 * @param {string} position - Posición (main, front, top, side)
 * @param {string} data - Datos de la imagen (Base64 o URL)
 * @returns {void}
 */
function setTempImageFile(position, data) {
  if (tempImageFiles.hasOwnProperty(position)) {
    tempImageFiles[position] = data;
  }
}

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

/**
 * Configura los event listeners para la creación de productos
 * 
 * @function setupCreateEventListeners
 * @returns {void}
 */
function setupCreateEventListeners() {
  // Botón "Crear Producto"
  const btnCreate = document.getElementById('btn-create-product');
  if (btnCreate) {
    btnCreate.addEventListener('click', openCreateModal);
  }
  
  // Formulario de producto
  const form = document.getElementById('product-form');
  if (form) {
    form.addEventListener('submit', handleProductSubmit);
  }
  
  // Inputs de imágenes
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

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupCreateEventListeners);
} else {
  setupCreateEventListeners();
}
