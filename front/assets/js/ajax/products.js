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
 * 6. Hace que la imagen principal sea requerida
 * 7. Muestra el modal
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
  
  // Hacer que la imagen principal sea requerida en modo creación
  const mainImageInput = document.getElementById('product-image-main');
  if (mainImageInput) {
    mainImageInput.setAttribute('required', 'required');
  }
  
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
 * Envía el producto a la API REST para guardarlo o actualizarlo en la base de datos
 * 
 * FLUJO:
 * 1. Determina si es creación (POST) o actualización (PUT) según currentProductId
 * 2. Realiza petición a la API con los datos en formato JSON
 * 3. Espera respuesta del servidor
 * 4. Si es exitoso:
 *    - Muestra notificación de éxito
 *    - Cierra el modal
 *    - Limpia las imágenes temporales
 *    - Recarga la lista de productos
 * 5. Si hay error:
 *    - Muestra notificación de error con el mensaje del servidor
 * 6. Si hay error de conexión:
 *    - Muestra notificación de error de conexión
 * 
 * NOTA: 
 * - Para crear: La referencia se genera AUTOMÁTICAMENTE en el backend
 * - Para actualizar: Se envía la referencia existente en formData
 * 
 * @function saveProduct
 * @async
 * @param {Object} formData - Datos del producto a guardar
 * @returns {Promise<void>}
 */
async function saveProduct(formData) {
  try {
    // Determinar si es creación o actualización
    const isUpdate = currentProductId !== null;
    const method = isUpdate ? 'PUT' : 'POST';
    
    // Si es actualización, incluir la referencia
    if (isUpdate) {
      formData.referencia = currentProductId;
    }
    
    // Realizar petición HTTP a la API
    const response = await fetch(API_URL, {
      method: method,
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
        const mensaje = isUpdate ? 'Producto actualizado correctamente' : 'Producto creado correctamente';
        showNotification(mensaje, 'success');
      }
      
      // Cerrar el modal (función definida en components.js)
      if (typeof closeProductModal === 'function') closeProductModal();
      
      // Limpiar imágenes temporales
      clearTempImageFiles();
      
      // Resetear currentProductId
      currentProductId = null;
      
      // Recargar lista de productos en la tabla
      loadProducts();
      
    } else {
      // Mostrar mensaje de error del servidor
      if (typeof showNotification === 'function') {
        showNotification(result.message || 'Error al guardar el producto', 'error');
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
 * FLUJO:
 * 1. Hace petición GET a la API para obtener todos los productos
 * 2. Recibe array de productos en formato JSON
 * 3. Itera sobre cada producto
 * 4. Crea filas HTML con los datos de cada producto
 * 5. Inserta filas en la tabla del dashboard
 * 6. Agrega botones de acciones (editar, eliminar, ver)
 * 7. Muestra mensaje si no hay productos
 * 
 * RESPUESTA ESPERADA:
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
 * @async
 * @returns {Promise<void>}
 */
async function loadProducts() {
  try {
    // Realizar petición GET a la API
    const response = await fetch(API_URL, {
      method: 'GET'
    });

    // Convertir respuesta a JSON
    const result = await response.json();

    // Verificar si la operación fue exitosa
    if (result.success) {
      // Renderizar productos en la tabla
      renderProductsTable(result.productos);
      
    } else {
      // Mostrar mensaje de error
      if (typeof showNotification === 'function') {
        showNotification(result.message || 'Error al cargar productos', 'error');
      }
      renderProductsTable([]);
    }
    
  } catch (error) {
    // Error de conexión o error inesperado
    console.error('Error al cargar productos:', error);
    if (typeof showNotification === 'function') {
      showNotification('Error al conectar con el servidor', 'error');
    }
    renderProductsTable([]);
  }
}

/**
 * Renderiza la tabla de productos con los datos recibidos
 * 
 * Si no hay productos, muestra el estado vacío.
 * Si hay productos, crea una fila por cada uno con sus datos y botones de acción.
 * 
 * @function renderProductsTable
 * @param {Array} productos - Array de objetos producto
 * @returns {void}
 */
function renderProductsTable(productos) {
  const tbody = document.getElementById('products-tbody');
  const emptyState = document.getElementById('empty-state');
  
  // Limpiar tabla
  if (tbody) tbody.innerHTML = '';
  
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
 * Cada fila contiene:
 * - Imagen principal (miniatura)
 * - Referencia del producto
 * - Nombre del producto
 * - Categoría
 * - Marca
 * - Precio formateado ($ COP)
 * - Stock disponible (con desglose por tallas para guantes)
 * - Botones de acción (Ver, Editar, Eliminar)
 * 
 * @function createProductRow
 * @param {Object} producto - Datos del producto
 * @returns {HTMLTableRowElement} Elemento <tr> con los datos del producto
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
  nameSpan.title = producto.nombre; // Tooltip con nombre completo
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
  
  // Columna: Stock (diferente para guantes)
  const tdStock = document.createElement('td');
  
  if (producto.categoria === 'guantes') {
    // Para guantes: mostrar desglose por tallas
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
      
      // Aplicar clase según disponibilidad
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
    // Para otros productos: stock general
    const stockSpan = document.createElement('span');
    stockSpan.className = 'product-stock';
    stockSpan.textContent = producto.stock || 0;
    
    // Aplicar clase según disponibilidad
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
  btnEdit.onclick = () => editProduct(producto.referencia);
  
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
  btnDelete.onclick = () => confirmDeleteProduct(producto.referencia);
  
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

/**
 * Formatea un número como precio en pesos colombianos
 * 
 * Ejemplos:
 * - 250000 → "$250.000 COP"
 * - 1500000 → "$1.500.000 COP"
 * 
 * @function formatPrice
 * @param {number} price - Precio a formatear
 * @returns {string} Precio formateado
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
 * Ejemplos:
 * - "palos" → "Palos"
 * - "guantes" → "Guantes"
 * 
 * @function capitalizeFirstLetter
 * @param {string} str - String a capitalizar
 * @returns {string} String capitalizado
 */
function capitalizeFirstLetter(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ============================================================================
// SECCIÓN 4: ACCIONES DE PRODUCTOS (Ver, Editar, Eliminar)
// ============================================================================

/**
 * Obtiene los datos de un producto específico desde el servidor
 * 
 * FLUJO:
 * 1. Hace petición GET a la API con parámetro ?referencia=XXX
 * 2. Recibe los datos completos del producto
 * 3. Retorna el objeto producto
 * 
 * @function fetchProductByReference
 * @async
 * @param {string} referencia - Referencia del producto a obtener
 * @returns {Promise<Object|null>} Datos del producto o null si hay error
 */
async function fetchProductByReference(referencia) {
  try {
    // Hacer petición GET con parámetro en la URL
    const response = await fetch(`${API_URL}?referencia=${encodeURIComponent(referencia)}`, {
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

/**
 * Abre el modal para ver los detalles de un producto en modo solo lectura
 * 
 * FLUJO:
 * 1. Obtiene los datos del producto desde el servidor
 * 2. Carga las imágenes en el modal de vista previa
 * 3. Carga todos los datos del producto
 * 4. Muestra el modal
 * 
 * @function viewProduct
 * @async
 * @param {string} referencia - Referencia del producto a ver
 * @returns {Promise<void>}
 */
async function viewProduct(referencia) {
  // Obtener datos del producto
  const producto = await fetchProductByReference(referencia);
  
  if (!producto) {
    return; // Si no se encontró el producto, detener
  }

  // Cargar imágenes en el modal de vista previa
  loadProductImages(producto, 'details');
  
  // Cargar información del producto
  loadProductInfo(producto);
  
  // Abrir el modal de vista previa
  if (typeof openProductDetailsModal === 'function') {
    openProductDetailsModal();
  } else {
    // Fallback: abrir modal manualmente
    const modal = document.getElementById('product-details-modal');
    if (modal) {
      modal.classList.add('active');
    }
  }
}

/**
 * Carga las imágenes del producto en el modal
 * 
 * @function loadProductImages
 * @param {Object} producto - Datos del producto
 * @param {string} suffix - Sufijo para los IDs ('details' para modal de vista)
 * @returns {void}
 */
function loadProductImages(producto, suffix = '') {
  const positions = ['main', 'front', 'top', 'side'];
  const imageFields = {
    'main': 'imagen_principal',
    'front': 'imagen_frontal',
    'top': 'imagen_superior',
    'side': 'imagen_lateral'
  };

  positions.forEach(position => {
    const previewId = suffix ? `preview-${position}-${suffix}` : `preview-${position}`;
    const preview = document.getElementById(previewId);
    
    if (preview) {
      const img = preview.querySelector('img');
      const placeholder = preview.querySelector('.preview-placeholder');
      const imageData = producto[imageFields[position]];

      if (imageData) {
        // Mostrar imagen
        if (img) {
          img.src = imageData;
          img.style.display = 'block';
        }
        if (placeholder) {
          placeholder.style.display = 'none';
        }
      } else {
        // Mostrar placeholder
        if (img) {
          img.style.display = 'none';
        }
        if (placeholder) {
          placeholder.style.display = 'flex';
        }
      }
    }
  });
}

/**
 * Carga la información del producto en el modal de vista previa
 * 
 * @function loadProductInfo
 * @param {Object} producto - Datos del producto
 * @returns {void}
 */
function loadProductInfo(producto) {
  // Título del producto
  const titleElement = document.getElementById('product-name-details');
  if (titleElement) {
    titleElement.textContent = producto.nombre || 'Sin nombre';
  }

  // Marca
  const brandElement = document.getElementById('product-brand-details');
  if (brandElement) {
    brandElement.textContent = producto.marca || '-';
  }

  // Dimensiones
  const dimensionsElement = document.getElementById('product-dimensions-details');
  if (dimensionsElement) {
    dimensionsElement.textContent = producto.dimensiones || '-';
  }

  // Peso del producto
  const weightElement = document.getElementById('product-weight-details');
  if (weightElement) {
    weightElement.textContent = producto.peso ? `${producto.peso} kg` : '-';
  }

  // Peso de envío (calculado como peso + 0.1 kg de empaque)
  const shippingWeightElement = document.getElementById('product-shipping-weight-details');
  if (shippingWeightElement) {
    const shippingWeight = producto.peso ? (parseFloat(producto.peso) + 0.1).toFixed(2) : null;
    shippingWeightElement.textContent = shippingWeight ? `${shippingWeight} kg` : '-';
  }

  // Modelo
  const modelElement = document.getElementById('product-model-details');
  if (modelElement) {
    modelElement.textContent = producto.modelo || '-';
  }

  // Referencia
  const referenceElement = document.getElementById('product-reference-details');
  if (referenceElement) {
    referenceElement.textContent = producto.referencia || '-';
  }

  // Precio
  const priceElement = document.getElementById('product-price-details');
  if (priceElement) {
    priceElement.textContent = formatPrice(producto.precio || 0);
  }

  // Descripción
  const descriptionElement = document.getElementById('product-description-text-details');
  if (descriptionElement) {
    descriptionElement.textContent = producto.descripcion || 'Sin descripción disponible';
  }
  
  // Configurar interacción con miniaturas para cambiar imagen principal
  setupImageThumbnailInteraction('details');
}

/**
 * Configura la interacción con las miniaturas de imágenes
 * Permite cambiar la imagen principal al hacer clic en una miniatura
 * 
 * @function setupImageThumbnailInteraction
 * @param {string} suffix - Sufijo para los IDs ('details' para modal de vista)
 * @returns {void}
 */
function setupImageThumbnailInteraction(suffix = '') {
  const mainPreviewId = suffix ? `preview-main-${suffix}` : 'preview-main';
  const mainPreview = document.getElementById(mainPreviewId);
  
  if (!mainPreview) return;
  
  const thumbnailPositions = ['front', 'top', 'side'];
  
  thumbnailPositions.forEach(position => {
    const thumbId = suffix ? `preview-${position}-${suffix}` : `preview-${position}`;
    const thumb = document.getElementById(thumbId);
    
    if (thumb) {
      // Agregar cursor pointer si tiene imagen
      const thumbImg = thumb.querySelector('img');
      if (thumbImg && thumbImg.style.display !== 'none') {
        thumb.style.cursor = 'pointer';
        
        // Event listener para cambiar imagen principal
        thumb.onclick = () => {
          const mainImg = mainPreview.querySelector('img');
          const mainPlaceholder = mainPreview.querySelector('.preview-placeholder');
          
          if (mainImg && thumbImg && thumbImg.src) {
            // Intercambiar imágenes
            const tempSrc = mainImg.src;
            mainImg.src = thumbImg.src;
            thumbImg.src = tempSrc;
            
            // Asegurar que ambas estén visibles
            mainImg.style.display = 'block';
            thumbImg.style.display = 'block';
            if (mainPlaceholder) mainPlaceholder.style.display = 'none';
          }
        };
      }
    }
  });
}

/**
 * Abre el modal para editar un producto existente
 * 
 * FLUJO:
 * 1. Obtiene los datos del producto desde el servidor
 * 2. Cambia el título del modal a "Editar Producto"
 * 3. Carga todos los datos en el formulario
 * 4. Guarda la referencia en currentProductId
 * 5. Abre el modal
 * 
 * @function editProduct
 * @async
 * @param {string} referencia - Referencia del producto a editar
 * @returns {Promise<void>}
 */
async function editProduct(referencia) {
  // Obtener datos del producto
  const producto = await fetchProductByReference(referencia);
  
  if (!producto) {
    return; // Si no se encontró el producto, detener
  }

  // Cambiar a modo edición
  currentProductId = referencia;
  
  // Actualizar textos del modal
  document.getElementById('modal-title').textContent = 'Editar Producto';
  document.getElementById('btn-submit-text').textContent = 'Actualizar Producto';
  
  // Remover el atributo required de la imagen principal (ya tiene imagen)
  const mainImageInput = document.getElementById('product-image-main');
  if (mainImageInput) {
    mainImageInput.removeAttribute('required');
  }
  
  // Cargar datos en el formulario
  loadProductIntoForm(producto);
  
  // Habilitar campos para edición
  if (typeof enableFormFields === 'function') enableFormFields();
  
  // Abrir el modal
  if (typeof openProductModal === 'function') openProductModal();
}

/**
 * Carga los datos de un producto en el formulario de edición
 * 
 * @function loadProductIntoForm
 * @param {Object} producto - Datos del producto
 * @returns {void}
 */
function loadProductIntoForm(producto) {
  // Campos generales
  document.getElementById('product-name').value = producto.nombre || '';
  document.getElementById('product-description').value = producto.descripcion || '';
  document.getElementById('product-category').value = producto.categoria || '';
  document.getElementById('product-brand').value = producto.marca || '';
  document.getElementById('product-model').value = producto.modelo || '';
  document.getElementById('product-price').value = producto.precio || 0;
  
  // Disparar evento change en categoría para mostrar campos dinámicos
  const categoryElement = document.getElementById('product-category');
  if (categoryElement) {
    categoryElement.dispatchEvent(new Event('change'));
  }
  
  // Stock general o por tallas según categoría
  if (producto.categoria === 'guantes') {
    // Stock por tallas
    document.getElementById('stock-size-s').value = producto.stock_talla_s || 0;
    document.getElementById('stock-size-m').value = producto.stock_talla_m || 0;
    document.getElementById('stock-size-l').value = producto.stock_talla_l || 0;
    document.getElementById('stock-size-xl').value = producto.stock_talla_xl || 0;
    document.getElementById('stock-size-xxl').value = producto.stock_talla_xxl || 0;
  } else {
    // Stock general
    const stockElement = document.getElementById('product-stock');
    if (stockElement) {
      stockElement.value = producto.stock || 0;
    }
  }
  
  // Campos específicos por categoría
  if (producto.categoria === 'bolas') {
    const unitsElement = document.getElementById('product-units');
    if (unitsElement) {
      unitsElement.value = producto.unidades_paquete || 0;
    }
  } else if (producto.categoria === 'palos') {
    const dimensionsElement = document.getElementById('product-dimensions');
    const weightElement = document.getElementById('product-weight');
    if (dimensionsElement) dimensionsElement.value = producto.dimensiones || '';
    if (weightElement) weightElement.value = producto.peso || 0;
  } else if (producto.categoria === 'accesorios') {
    const dimensionsElement = document.getElementById('product-dimensions-acc');
    const weightElement = document.getElementById('product-weight-acc');
    if (dimensionsElement) dimensionsElement.value = producto.dimensiones || '';
    if (weightElement) weightElement.value = producto.peso || 0;
  }
  
  // Cargar imágenes
  tempImageFiles.main = producto.imagen_principal || null;
  tempImageFiles.front = producto.imagen_frontal || null;
  tempImageFiles.top = producto.imagen_superior || null;
  tempImageFiles.side = producto.imagen_lateral || null;
  
  // Actualizar previsualizaciones de imágenes
  loadProductImages(producto, '');
}

/**
 * Abre el modal de confirmación para eliminar un producto
 * 
 * @function confirmDeleteProduct
 * @param {string} referencia - Referencia del producto a eliminar
 * @returns {void}
 */
function confirmDeleteProduct(referencia) {
  // Guardar referencia para usar en la confirmación
  currentProductId = referencia;
  
  // Abrir modal de confirmación
  if (typeof openDeleteModal === 'function') {
    openDeleteModal();
  } else {
    // Fallback: abrir modal manualmente
    const modal = document.getElementById('delete-modal');
    if (modal) {
      modal.classList.add('active');
    }
  }
}

/**
 * Elimina un producto de la base de datos
 * 
 * FLUJO:
 * 1. Realiza petición DELETE a la API con la referencia
 * 2. Espera respuesta del servidor
 * 3. Si es exitoso:
 *    - Muestra notificación de éxito
 *    - Cierra el modal de confirmación
 *    - Recarga la lista de productos
 * 4. Si hay error:
 *    - Muestra notificación de error
 * 
 * @function deleteProductConfirmed
 * @async
 * @returns {Promise<void>}
 */
async function deleteProductConfirmed() {
  if (!currentProductId) {
    if (typeof showNotification === 'function') {
      showNotification('No se ha seleccionado ningún producto', 'error');
    }
    return;
  }

  try {
    // Realizar petición DELETE a la API
    const response = await fetch(`${API_URL}?referencia=${encodeURIComponent(currentProductId)}`, {
      method: 'DELETE'
    });

    // Convertir respuesta a JSON
    const result = await response.json();

    // Verificar si la operación fue exitosa
    if (result.success) {
      // Mostrar notificación de éxito
      if (typeof showNotification === 'function') {
        showNotification('Producto eliminado correctamente', 'success');
      }
      
      // Cerrar el modal de confirmación
      if (typeof closeDeleteModal === 'function') {
        closeDeleteModal();
      } else {
        const modal = document.getElementById('delete-modal');
        if (modal) {
          modal.classList.remove('active');
        }
      }
      
      // Resetear currentProductId
      currentProductId = null;
      
      // Recargar lista de productos en la tabla
      loadProducts();
      
    } else {
      // Mostrar mensaje de error del servidor
      if (typeof showNotification === 'function') {
        showNotification(result.message || 'Error al eliminar el producto', 'error');
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
// SECCIÓN 5: INICIALIZACIÓN Y EVENT LISTENERS
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
  
  // Event listener para cerrar modal de vista previa
  const btnClosePreview = document.getElementById('btn-close-preview');
  if (btnClosePreview) {
    btnClosePreview.addEventListener('click', () => {
      if (typeof closeProductDetailsModal === 'function') {
        closeProductDetailsModal();
      }
    });
  }
  
  // Event listener para cerrar modal con el botón X
  const productDetailsClose = document.getElementById('product-details-close');
  if (productDetailsClose) {
    productDetailsClose.addEventListener('click', () => {
      if (typeof closeProductDetailsModal === 'function') {
        closeProductDetailsModal();
      }
    });
  }
  
  // Event listener para confirmar eliminación
  const btnConfirmDelete = document.getElementById('btn-confirm-delete');
  if (btnConfirmDelete) {
    btnConfirmDelete.addEventListener('click', deleteProductConfirmed);
  }
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
