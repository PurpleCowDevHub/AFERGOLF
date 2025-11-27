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
 * 
 * ============================================================================
 * CONFIGURACIÓN
 * ============================================================================
 */

// URL del endpoint para crear productos
// Siempre usa localhost (Apache) para las APIs PHP, nunca Live Server
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
  
  // Determinar si es creación o edición
  const isUpdate = typeof window.currentProductId !== 'undefined' && 
                   window.currentProductId !== null;
  
  // Validar campos obligatorios (pasar isCreate como segundo parámetro)
  if (!validateFormData(formData, !isUpdate)) {
    return;
  }
  
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
 * Formatea la marca con primera letra mayúscula de cada palabra
 * 
 * @function formatBrand
 * @param {string} brand - Marca a formatear
 * @returns {string} Marca formateada
 */
function formatBrand(brand) {
  if (!brand) return '';
  return brand
    .trim()
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Construye el string de dimensiones a partir de los campos separados
 * 
 * @function buildDimensionsString
 * @param {string} largoId - ID del input de largo
 * @param {string} anchoId - ID del input de ancho
 * @param {string} altoId - ID del input de alto
 * @returns {string} Dimensiones en formato "largo x ancho x alto"
 */
function buildDimensionsString(largoId, anchoId, altoId) {
  const largo = document.getElementById(largoId)?.value || '';
  const ancho = document.getElementById(anchoId)?.value || '';
  const alto = document.getElementById(altoId)?.value || '';
  
  if (!largo && !ancho && !alto) return '';
  
  return `${largo || '0'} x ${ancho || '0'} x ${alto || '0'}`;
}

/**
 * Recopila todos los datos del formulario en un objeto
 * 
 * Maneja campos dinámicos según la categoría seleccionada:
 * - Guantes: stock por tallas
 * - Bolas: unidades por paquete
 * - Palos: dimensiones y peso
 * 
 * @function collectFormData
 * @global
 * @returns {Object} Objeto con todos los datos del producto
 */
function collectFormData() {
  const category = document.getElementById('product-category')?.value || '';
  
  // Datos generales (marca formateada)
  const formData = {
    nombre: document.getElementById('product-name')?.value || '',
    descripcion: document.getElementById('product-description')?.value || '',
    categoria: category,
    marca: formatBrand(document.getElementById('product-brand')?.value || ''),
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
    // Especificaciones técnicas del palo
    formData.longitud = parseFloat(document.getElementById('product-longitud')?.value) || 0;
    formData.loft = parseFloat(document.getElementById('product-loft')?.value) || 0;
    formData.lie = parseFloat(document.getElementById('product-lie')?.value) || 0;
    formData.peso = parseInt(document.getElementById('product-peso')?.value) || 0;
    formData.swingweight = document.getElementById('product-swingweight')?.value || '';
    formData.flex = document.getElementById('product-flex')?.value || '';
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
 * @param {boolean} isCreate - True si es modo creación, false si es edición
 * @returns {boolean} True si es válido, false si hay errores
 */
function validateFormData(formData, isCreate = true) {
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
  
  // Validar imagen principal solo en modo creación
  if (isCreate && !formData.imagen_principal) {
    errores.push('Imagen principal');
  }
  
  // Validar stock para categorías no-guantes
  if (formData.categoria !== 'guantes' && formData.stock < 0) {
    errores.push('Stock (no puede ser negativo)');
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
  // Obtener elementos del botón de submit
  const submitBtn = document.querySelector('#product-form button[type="submit"]');
  const btnSubmitText = document.getElementById('btn-submit-text');
  const originalText = btnSubmitText ? btnSubmitText.textContent : 'Guardar Producto';
  
  // Deshabilitar botón y mostrar indicador de carga
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
  }
  if (btnSubmitText) {
    btnSubmitText.textContent = 'Guardando...';
  }
  
  try {
    console.log('Enviando datos al servidor...', CREATE_API_URL);
    console.log('Tamaño del payload:', JSON.stringify(formData).length, 'bytes');
    
    const response = await fetch(CREATE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    console.log('Respuesta recibida:', response.status, response.statusText);
    
    // Verificar si la respuesta es JSON válido
    let result;
    try {
      const text = await response.text();
      console.log('Texto de respuesta:', text.substring(0, 500));
      result = JSON.parse(text);
    } catch (parseError) {
      console.error('Error parseando JSON:', parseError);
      throw new Error('Respuesta inválida del servidor');
    }
    
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
  } finally {
    // Restaurar estado del botón
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.classList.remove('loading');
    }
    if (btnSubmitText) {
      btnSubmitText.textContent = originalText;
    }
  }
}

// ============================================================================
// FUNCIÓN: MANEJAR CARGA DE IMÁGENES
// ============================================================================

// ============================================================================
// CONSTANTES DE VALIDACIÓN DE IMÁGENES
// ============================================================================

const IMAGE_CONFIG = {
  maxSize: 50 * 1024 * 1024,    // 50MB en bytes (muy amplio)
  maxWidth: 10000,              // Ancho máximo en píxeles (muy amplio)
  maxHeight: 10000,             // Alto máximo en píxeles (muy amplio)
  validTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml'],
  typeNames: {
    'image/jpeg': 'JPG',
    'image/png': 'PNG', 
    'image/gif': 'GIF',
    'image/webp': 'WebP'
  }
};

// ============================================================================
// FUNCIÓN: MANEJAR CARGA DE IMÁGENES
// ============================================================================

/**
 * Maneja la carga y conversión de imágenes a Base64
 * Con validación completa de tipo, tamaño y dimensiones
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
  
  // Validar que sea imagen válida
  if (!IMAGE_CONFIG.validTypes.includes(file.type)) {
    const validFormats = Object.values(IMAGE_CONFIG.typeNames).join(', ');
    if (typeof showNotification === 'function') {
      showNotification(`Formato no válido. Usa: ${validFormats}`, 'error');
    }
    event.target.value = '';
    tempImageFiles[position] = null;
    return;
  }
  
  // Validar tamaño del archivo
  if (file.size > IMAGE_CONFIG.maxSize) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const maxMB = (IMAGE_CONFIG.maxSize / (1024 * 1024)).toFixed(0);
    if (typeof showNotification === 'function') {
      showNotification(`La imagen (${sizeMB}MB) excede el límite de ${maxMB}MB`, 'error');
    }
    event.target.value = '';
    tempImageFiles[position] = null;
    return;
  }
  
  // Para SVG, omitir validación de dimensiones (no aplica)
  if (file.type === 'image/svg+xml') {
    const reader = new FileReader();
    reader.onload = (e) => {
      tempImageFiles[position] = e.target.result;
      if (typeof updateImagePreviewFromDataUrl === 'function') {
        updateImagePreviewFromDataUrl(position, e.target.result);
      }
      const positionNames = { main: 'principal', front: 'frontal', top: 'superior', side: 'lateral' };
      if (typeof showNotification === 'function') {
        showNotification(`Imagen ${positionNames[position]} cargada correctamente`, 'success');
      }
    };
    reader.onerror = () => {
      if (typeof showNotification === 'function') {
        showNotification('Error al procesar la imagen', 'error');
      }
      tempImageFiles[position] = null;
    };
    reader.readAsDataURL(file);
    return;
  }
  
  // Validar dimensiones de la imagen (para formatos rasterizados)
  const img = new Image();
  const objectUrl = URL.createObjectURL(file);
  
  img.onload = () => {
    URL.revokeObjectURL(objectUrl);
    
    // Verificar dimensiones (muy amplias, prácticamente sin límite)
    if (img.width > IMAGE_CONFIG.maxWidth || img.height > IMAGE_CONFIG.maxHeight) {
      if (typeof showNotification === 'function') {
        showNotification(
          `Imagen muy grande (${img.width}x${img.height}). Máximo: ${IMAGE_CONFIG.maxWidth}x${IMAGE_CONFIG.maxHeight} px`,
          'error'
        );
      }
      event.target.value = '';
      tempImageFiles[position] = null;
      return;
    }
    
    // Si pasa todas las validaciones, convertir a Base64
    const reader = new FileReader();
    
    reader.onload = (e) => {
      tempImageFiles[position] = e.target.result;
      
      // Actualizar vista previa
      if (typeof updateImagePreviewFromDataUrl === 'function') {
        updateImagePreviewFromDataUrl(position, e.target.result);
      }
      
      // Feedback positivo
      const positionNames = { main: 'principal', front: 'frontal', top: 'superior', side: 'lateral' };
      if (typeof showNotification === 'function') {
        showNotification(`Imagen ${positionNames[position]} cargada correctamente`, 'success');
      }
    };
    
    reader.onerror = () => {
      if (typeof showNotification === 'function') {
        showNotification('Error al procesar la imagen', 'error');
      }
      tempImageFiles[position] = null;
    };
    
    reader.readAsDataURL(file);
  };
  
  img.onerror = () => {
    URL.revokeObjectURL(objectUrl);
    if (typeof showNotification === 'function') {
      showNotification('El archivo no es una imagen válida', 'error');
    }
    event.target.value = '';
    tempImageFiles[position] = null;
  };
  
  img.src = objectUrl;
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
  
  // Limpiar inputs de archivo usando la función de components.js
  if (typeof clearFileInputs === 'function') {
    clearFileInputs();
  } else {
    // Fallback: limpiar manualmente
    ['main', 'front', 'top', 'side'].forEach(position => {
      const input = document.getElementById(`product-image-${position}`);
      if (input) input.value = '';
    });
  }
  
  // Limpiar vistas previas
  if (typeof clearImagePreviews === 'function') {
    clearImagePreviews();
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
// Variable para evitar duplicación de event listeners
let createListenersInitialized = false;

/**
 * Actualiza el contador de caracteres del nombre del producto
 * 
 * @function updateNameCharCounter
 * @param {HTMLInputElement} input - Input del nombre
 * @returns {void}
 */
function updateNameCharCounter(input) {
  const counter = document.getElementById('product-name-counter');
  if (!counter) return;
  
  const maxLength = parseInt(input.getAttribute('maxlength')) || 80;
  const currentLength = input.value.length;
  const remaining = maxLength - currentLength;
  
  counter.textContent = `${remaining} caracteres restantes`;
  
  // Cambiar color según proximidad al límite
  counter.classList.remove('warning', 'danger');
  if (remaining <= 10) {
    counter.classList.add('danger');
  } else if (remaining <= 20) {
    counter.classList.add('warning');
  }
}

/**
 * Configura los event listeners para la creación de productos
 * NOTA: Los event listeners de clic en preview boxes se manejan en components.js
 * Este módulo maneja los listeners de change para almacenar imágenes en Base64.
 * 
 * @function setupCreateEventListeners
 * @returns {void}
 */
function setupCreateEventListeners() {
  // Evitar duplicación de event listeners
  if (createListenersInitialized) return;
  createListenersInitialized = true;
  
  // Botón "Crear Producto" en el header
  const btnCreate = document.getElementById('btn-create-product');
  if (btnCreate) {
    btnCreate.addEventListener('click', openCreateModal);
  }
  
  // Botón "Crear nuevo producto" en el estado vacío
  const btnCreateEmpty = document.getElementById('btn-create-product-empty');
  if (btnCreateEmpty) {
    btnCreateEmpty.addEventListener('click', openCreateModal);
  }
  
  // Formulario de producto
  const form = document.getElementById('product-form');
  if (form && !form.hasAttribute('data-submit-initialized')) {
    form.addEventListener('submit', handleProductSubmit);
    form.setAttribute('data-submit-initialized', 'true');
  }
  
  // Configurar listeners de change para almacenar imágenes en Base64
  const imageInputs = [
    { id: 'product-image-main', position: 'main' },
    { id: 'product-image-front', position: 'front' },
    { id: 'product-image-top', position: 'top' },
    { id: 'product-image-side', position: 'side' }
  ];
  
  imageInputs.forEach(({ id, position }) => {
    const input = document.getElementById(id);
    if (input && !input.hasAttribute('data-base64-initialized')) {
      input.setAttribute('data-base64-initialized', 'true');
      input.addEventListener('change', (e) => handleImageUpload(e, position));
    }
  });
  
  // Configurar contador de caracteres para el nombre del producto
  const productNameInput = document.getElementById('product-name');
  if (productNameInput && !productNameInput.hasAttribute('data-counter-initialized')) {
    productNameInput.setAttribute('data-counter-initialized', 'true');
    productNameInput.addEventListener('input', () => updateNameCharCounter(productNameInput));
    // Inicializar contador al cargar
    updateNameCharCounter(productNameInput);
  }
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupCreateEventListeners);
} else {
  setupCreateEventListeners();
}