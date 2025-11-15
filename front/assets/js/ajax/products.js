/**
 * ============================================================================
 * AFERGOLF - Módulo de Gestión de Productos
 * ============================================================================
 * 
 * Este archivo maneja toda la lógica del lado del cliente (frontend) para la
 * gestión de productos en el panel de administración.
 * 
 * FUNCIONALIDADES PRINCIPALES:
 * - Crear nuevos productos con formulario dinámico
 * - Cargar y convertir imágenes a base64
 * - Validar datos antes de enviar
 * - Comunicarse con la API REST del backend
 * - Mostrar notificaciones de éxito/error
 * 
 * @author AFERGOLF Team
 * @version 1.0.0
 * @date 2025-11-15
 * ============================================================================
 */

// ============================================================================
// CONFIGURACIÓN Y VARIABLES GLOBALES
// ============================================================================

/**
 * URL del endpoint de la API REST de productos
 * Esta API maneja todas las operaciones CRUD (Crear, Leer, Actualizar, Eliminar)
 */
const API_URL = 'http://localhost/AFERGOLF/back/modules/products/api/admin_products.php';

/**
 * ID del producto actualmente en edición (null si estamos creando uno nuevo)
 * @type {number|null}
 */
let currentProductId = null;

/**
 * Almacenamiento temporal de imágenes convertidas a base64
 * Estas imágenes se guardarán en la base de datos cuando se envíe el formulario
 * @type {Object}
 * @property {string|null} main - Imagen principal del producto
 * @property {string|null} front - Vista frontal del producto
 * @property {string|null} top - Vista superior del producto
 * @property {string|null} side - Vista lateral del producto
 */
let tempImageFiles = { 
  main: null,   // Imagen principal (obligatoria)
  front: null,  // Vista frontal (opcional)
  top: null,    // Vista superior (opcional)
  side: null    // Vista lateral (opcional)
};

// ============================================================================
// SECCIÓN 1: CREAR PRODUCTO
// ============================================================================

/**
 * Abre el modal para crear un nuevo producto
 * 
 * FLUJO:
 * 1. Resetea el ID del producto (indica que es creación, no edición)
 * 2. Cambia el título del modal a "Crear Producto"
 * 3. Limpia el formulario de datos anteriores
 * 4. Limpia las imágenes temporales
 * 5. Habilita todos los campos del formulario
 * 6. Muestra el modal
 * 
 * @function openCreateModal
 * @returns {void}
 */
function openCreateModal() {
  // Indicar que estamos en modo creación (no edición)
  currentProductId = null;
  
  // Actualizar textos del modal
  document.getElementById('modal-title').textContent = 'Crear Producto';
  document.getElementById('btn-submit-text').textContent = 'Guardar Producto';
  
  // Limpiar formulario (función definida en components.js)
  if (typeof resetProductForm === 'function') resetProductForm();
  
  // Limpiar imágenes temporales
  clearTempImageFiles();
  
  // Habilitar campos para edición (función definida en components.js)
  if (typeof enableFormFields === 'function') enableFormFields();
  
  // Mostrar el modal (función definida en components.js)
  if (typeof openProductModal === 'function') openProductModal();
}

/**
 * Maneja el evento submit del formulario de productos
 * 
 * FLUJO:
 * 1. Previene el comportamiento por defecto (recarga de página)
 * 2. Recopila todos los datos del formulario
 * 3. Valida que los campos obligatorios estén completos
 * 4. Si es válido, envía los datos al servidor
 * 5. Si no es válido, muestra un mensaje de error
 * 
 * CAMPOS OBLIGATORIOS:
 * - nombre: Nombre del producto
 * - categoria: Categoría (palos, bolas, guantes, accesorios)
 * - marca: Marca del producto
 * - precio: Precio en COP (debe ser mayor a 0)
 * 
 * @function handleProductSubmit
 * @param {Event} e - Evento submit del formulario
 * @returns {void}
 */
function handleProductSubmit(e) {
  // Evitar que el formulario recargue la página
  e.preventDefault();

  // Recopilar todos los datos del formulario
  const formData = collectFormData();

  // Validar campos obligatorios
  if (!formData.nombre || !formData.categoria || !formData.marca || formData.precio === 0) {
    // Mostrar notificación de error (función definida en components.js)
    if (typeof showNotification === 'function') {
      showNotification('Por favor completa todos los campos obligatorios', 'error');
    }
    return; // Detener ejecución si hay errores
  }

  // Si la validación pasa, enviar datos al servidor
  saveProduct(formData);
}

/**
 * Recopila todos los datos del formulario en un objeto
 * 
 * IMPORTANTE: Esta función maneja campos dinámicos según la categoría
 * 
 * CAMPOS GENERALES (todas las categorías):
 * - nombre, descripcion, categoria, marca, modelo, precio
 * - imagen_principal, imagen_frontal, imagen_superior, imagen_lateral
 * 
 * CAMPOS ESPECÍFICOS POR CATEGORÍA:
 * 
 * GUANTES:
 * - stock_talla_s, stock_talla_m, stock_talla_l, stock_talla_xl, stock_talla_xxl
 * - stock total = suma de todas las tallas
 * 
 * BOLAS:
 * - unidades_paquete (ej: 12 bolas por caja)
 * - stock general
 * 
 * PALOS:
 * - dimensiones (ej: "0.89 x 0.10 x 0.10 m")
 * - peso en kg (ej: 0.91)
 * - stock general
 * 
 * ACCESORIOS:
 * - dimensiones (con sufijo '-acc')
 * - peso (con sufijo '-acc')
 * - stock general
 * 
 * @function collectFormData
 * @returns {Object} Objeto con todos los datos del producto
 */
function collectFormData() {
  // Obtener la categoría seleccionada (determina qué campos mostrar)
  const category = document.getElementById('product-category').value;
  
  // Objeto base con campos generales (presentes en todas las categorías)
  const formData = {
    nombre: document.getElementById('product-name').value,
    descripcion: document.getElementById('product-description').value,
    categoria: category,
    marca: document.getElementById('product-brand').value,
    modelo: document.getElementById('product-model').value,
    precio: parseInt(document.getElementById('product-price').value) || 0,
    
    // Imágenes en base64 (guardadas en tempImageFiles al cargar archivos)
    imagen_principal: tempImageFiles.main || '',
    imagen_frontal: tempImageFiles.front || '',
    imagen_superior: tempImageFiles.top || '',
    imagen_lateral: tempImageFiles.side || ''
  };

  // -------------------------------------------------------------------------
  // MANEJO DE STOCK SEGÚN CATEGORÍA
  // -------------------------------------------------------------------------
  
  if (category === 'guantes') {
    // GUANTES: Stock separado por tallas (S, M, L, XL, XXL)
    formData.stock_talla_s = parseInt(document.getElementById('stock-size-s')?.value) || 0;
    formData.stock_talla_m = parseInt(document.getElementById('stock-size-m')?.value) || 0;
    formData.stock_talla_l = parseInt(document.getElementById('stock-size-l')?.value) || 0;
    formData.stock_talla_xl = parseInt(document.getElementById('stock-size-xl')?.value) || 0;
    formData.stock_talla_xxl = parseInt(document.getElementById('stock-size-xxl')?.value) || 0;
    
    // Calcular stock total sumando todas las tallas
    formData.stock = Object.values({
      s: formData.stock_talla_s,
      m: formData.stock_talla_m,
      l: formData.stock_talla_l,
      xl: formData.stock_talla_xl,
      xxl: formData.stock_talla_xxl
    }).reduce((a, b) => a + b, 0); // Sumar todos los valores
    
  } else {
    // OTRAS CATEGORÍAS: Stock general único
    formData.stock = parseInt(document.getElementById('product-stock')?.value) || 0;
  }

  // -------------------------------------------------------------------------
  // CAMPOS ESPECÍFICOS POR CATEGORÍA
  // -------------------------------------------------------------------------
  
  if (category === 'bolas') {
    // BOLAS: Número de unidades por paquete (ej: 12, 24, etc.)
    formData.unidades_paquete = parseInt(document.getElementById('product-units')?.value) || 0;
    
  } else if (category === 'palos' || category === 'accesorios') {
    // PALOS Y ACCESORIOS: Dimensiones y peso
    // Nota: Los IDs tienen sufijo '-acc' para accesorios
    const suffix = category === 'accesorios' ? '-acc' : '';
    formData.dimensiones = document.getElementById(`product-dimensions${suffix}`)?.value || '';
    formData.peso = parseFloat(document.getElementById(`product-weight${suffix}`)?.value) || 0;
  }

  return formData;
}

/**
 * Envía el producto a la API REST para guardarlo en la base de datos
 * 
 * FLUJO:
 * 1. Realiza petición POST a la API con los datos en formato JSON
 * 2. Espera respuesta del servidor
 * 3. Si es exitoso:
 *    - Muestra notificación de éxito
 *    - Cierra el modal
 *    - Limpia las imágenes temporales
 *    - Recarga la lista de productos
 * 4. Si hay error:
 *    - Muestra notificación de error con el mensaje del servidor
 * 5. Si hay error de conexión:
 *    - Muestra notificación de error de conexión
 * 
 * NOTA: La referencia del producto se genera AUTOMÁTICAMENTE en el backend
 * con formato: AFG-P001 (Palos), AFG-B001 (Bolas), AFG-G001 (Guantes), AFG-A001 (Accesorios)
 * 
 * @function saveProduct
 * @async
 * @param {Object} formData - Datos del producto a guardar
 * @returns {Promise<void>}
 */
async function saveProduct(formData) {
  try {
    // Realizar petición HTTP POST a la API
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json' // Indicar que enviamos JSON
      },
      body: JSON.stringify(formData) // Convertir objeto a JSON
    });

    // Convertir respuesta a JSON
    const result = await response.json();

    // Verificar si la operación fue exitosa
    if (result.success) {
      // Mostrar notificación de éxito
      if (typeof showNotification === 'function') {
        showNotification('Producto creado correctamente', 'success');
      }
      
      // Cerrar el modal (función definida en components.js)
      if (typeof closeProductModal === 'function') closeProductModal();
      
      // Limpiar imágenes temporales
      clearTempImageFiles();
      
      // Recargar lista de productos en la tabla
      loadProducts();
      
    } else {
      // Mostrar mensaje de error del servidor
      if (typeof showNotification === 'function') {
        showNotification(result.message || 'Error al crear el producto', 'error');
      }
    }
    
  } catch (error) {
    // Error de conexión o error inesperado
    console.error('Error:', error);
    if (typeof showNotification === 'function') {
      showNotification('Error al conectar con el servidor', 'error');
    }
  }
}

// ============================================================================
// SECCIÓN 2: GESTIÓN DE IMÁGENES
// ============================================================================

/**
 * Maneja la carga y conversión de imágenes a base64
 * 
 * FLUJO:
 * 1. Obtiene el archivo seleccionado por el usuario
 * 2. Valida que sea una imagen
 * 3. Usa FileReader para leer el archivo
 * 4. Convierte la imagen a base64
 * 5. Guarda el base64 en tempImageFiles
 * 6. Actualiza la vista previa en el formulario
 * 
 * ¿POR QUÉ BASE64?
 * - Permite guardar imágenes directamente en la base de datos
 * - No necesita servidor de archivos separado
 * - Facilita el manejo de imágenes en JSON
 * 
 * POSICIONES DE IMAGEN:
 * - 'main': Imagen principal (obligatoria)
 * - 'front': Vista frontal (opcional)
 * - 'top': Vista superior (opcional)
 * - 'side': Vista lateral (opcional)
 * 
 * @function handleImageUpload
 * @param {Event} event - Evento change del input file
 * @param {string} position - Posición de la imagen (main, front, top, side)
 * @returns {void}
 */
function handleImageUpload(event, position) {
  // Obtener el archivo seleccionado
  const file = event.target.files[0];

  // Si no hay archivo, limpiar la posición
  if (!file) {
    tempImageFiles[position] = null;
    return;
  }

  // Validar que sea un archivo de imagen
  if (!file.type.startsWith('image/')) {
    if (typeof showNotification === 'function') {
      showNotification('Por favor selecciona un archivo de imagen válido', 'error');
    }
    event.target.value = ''; // Limpiar el input
    return;
  }

  // Crear lector de archivos para convertir a base64
  const reader = new FileReader();

  // Evento que se ejecuta cuando la lectura es exitosa
  reader.onload = (e) => {
    // Guardar imagen en base64 en el objeto temporal
    tempImageFiles[position] = e.target.result;
    
    // Actualizar vista previa en el formulario (función definida en components.js)
    if (typeof updateImagePreviewFromDataUrl === 'function') {
      updateImagePreviewFromDataUrl(position, e.target.result);
    }
  };

  // Evento que se ejecuta si hay error al leer el archivo
  reader.onerror = () => {
    if (typeof showNotification === 'function') {
      showNotification('Error al cargar la imagen', 'error');
    }
  };

  // Iniciar lectura del archivo como Data URL (base64)
  reader.readAsDataURL(file);
}

/**
 * Limpia todas las imágenes temporales
 * 
 * Se llama al:
 * - Abrir el modal de crear producto
 * - Después de guardar exitosamente un producto
 * - Al cerrar el modal sin guardar
 * 
 * @function clearTempImageFiles
 * @returns {void}
 */
function clearTempImageFiles() {
  // Resetear objeto de imágenes temporales
  tempImageFiles = { 
    main: null, 
    front: null, 
    top: null, 
    side: null 
  };
  
  // Limpiar los inputs de archivo (función definida en components.js)
  if (typeof clearFileInputs === 'function') clearFileInputs();
}

// ============================================================================
// SECCIÓN 3: CARGAR Y MOSTRAR PRODUCTOS
// ============================================================================

/**
 * Carga la lista de productos desde el servidor y renderiza la tabla
 * 
 * FUNCIONALIDAD PENDIENTE (TODO)
 * Esta función aún no está implementada. Cuando se implemente, deberá:
 * 
 * 1. Hacer petición GET a la API para obtener todos los productos
 * 2. Recibir array de productos en formato JSON
 * 3. Iterar sobre cada producto
 * 4. Crear filas HTML con los datos de cada producto
 * 5. Insertar filas en la tabla del dashboard
 * 6. Agregar botones de acciones (editar, eliminar, ver)
 * 7. Mostrar mensaje si no hay productos
 * 
 * EJEMPLO DE RESPUESTA ESPERADA:
 * {
 *   "success": true,
 *   "productos": [
 *     {
 *       "referencia": "AFG-P001",
 *       "nombre": "Palo de Golf X",
 *       "categoria": "palos",
 *       "marca": "TaylorMade",
 *       "precio": 250000,
 *       "stock": 10,
 *       ...
 *     }
 *   ]
 * }
 * 
 * @function loadProducts
 * @returns {void}
 */
function loadProducts() {
  // TODO: Implementar carga de productos desde servidor
  // Esta función renderizará la tabla con los productos existentes
  console.log('TODO: Implementar loadProducts() para mostrar productos en la tabla');
}

// ============================================================================
// SECCIÓN 4: INICIALIZACIÓN Y EVENT LISTENERS
// ============================================================================

/**
 * Configura todos los event listeners del módulo de productos
 * 
 * EVENT LISTENERS:
 * 
 * 1. Botón "Crear Producto": Abre modal de creación
 * 2. Formulario de producto: Maneja el submit (crear/editar)
 * 3. Inputs de imágenes: Manejan carga y conversión a base64
 * 
 * Se ejecuta una sola vez al inicializar el módulo
 * 
 * @function setupProductsEventListeners
 * @returns {void}
 */
function setupProductsEventListeners() {
  // Event listener para botón "Crear Producto"
  const btnCreateProduct = document.getElementById('btn-create-product');
  if (btnCreateProduct) {
    btnCreateProduct.addEventListener('click', openCreateModal);
  }

  // Event listener para submit del formulario
  const productForm = document.getElementById('product-form');
  if (productForm) {
    productForm.addEventListener('submit', handleProductSubmit);
  }

  // Event listeners para los 4 inputs de imágenes
  const imageInputs = [
    { id: 'product-image-main', position: 'main' },   // Imagen principal
    { id: 'product-image-front', position: 'front' }, // Vista frontal
    { id: 'product-image-top', position: 'top' },     // Vista superior
    { id: 'product-image-side', position: 'side' }    // Vista lateral
  ];

  imageInputs.forEach(({ id, position }) => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('change', (e) => handleImageUpload(e, position));
    }
  });
}

/**
 * Inicializa el módulo completo de productos
 * 
 * FLUJO:
 * 1. Configura todos los event listeners
 * 2. Carga la lista inicial de productos (cuando se implemente)
 * 
 * Se ejecuta automáticamente cuando el DOM está listo
 * 
 * @function initializeProductsModule
 * @returns {void}
 */
function initializeProductsModule() {
  setupProductsEventListeners();
  loadProducts();
}

// ============================================================================
// AUTO-INICIALIZACIÓN
// ============================================================================

/**
 * Verifica si estamos en la página del dashboard y ejecuta la inicialización
 * 
 * Condición: Solo se ejecuta si existe el elemento 'products-tbody' en la página
 * Esto asegura que el módulo solo se active en el admin dashboard
 */
if (document.getElementById('products-tbody')) {
  // Verificar si el DOM ya está cargado
  if (document.readyState === 'loading') {
    // Si aún está cargando, esperar al evento DOMContentLoaded
    document.addEventListener('DOMContentLoaded', initializeProductsModule);
  } else {
    // Si ya está cargado, ejecutar inmediatamente
    initializeProductsModule();
  }
}
