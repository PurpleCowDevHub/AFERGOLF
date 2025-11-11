// =====================================================
// ===== AFERGOLF - Admin Dashboard UI (Frontend) =====
// =====================================================
// Este archivo maneja toda la lógica de interfaz de usuario:
// - Apertura/cierre de modales
// - Efectos visuales (difuminado de fondo)
// - Vista previa de imágenes
// - Actualización de campos dinámicos según categoría
// - Control de estados de formularios
// =====================================================

// ===== CONTROL DE MODALES =====

/**
 * Abre el modal de producto/edición/visualización
 * Activa la clase 'active' y bloquea el scroll del body
 */
function openProductModal() {
  const modal = document.getElementById('product-modal');
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

/**
 * Cierra el modal de producto
 * Remueve la clase 'active' y restaura el scroll del body
 */
function closeProductModal() {
  const modal = document.getElementById('product-modal');
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

/**
 * Abre el modal de confirmación de eliminación
 */
function openDeleteModal() {
  const modal = document.getElementById('delete-modal');
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

/**
 * Cierra el modal de confirmación de eliminación
 */
function closeDeleteModal() {
  const modal = document.getElementById('delete-modal');
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

// ===== GESTIÓN DE CAMPOS DINÁMICOS =====

/**
 * Actualiza los campos del formulario según la categoría seleccionada
 * @param {string} category - La categoría del producto (palos, bolas, guantes, accesorios)
 * 
 * Muestra/oculta campos específicos:
 * - Palos: dimensiones, peso (sin peso de envío)
 * - Accesorios: dimensiones, peso (sin peso de envío)
 * - Guantes: stock por talla (S, M, L, XL)
 * - Bolas: unidades por paquete
 */
function updateDynamicFields(category) {
  const allCategoryFields = document.querySelectorAll('.category-fields');
  const stockFieldGeneral = document.getElementById('stock-field-general');
  
  // Ocultar todos los campos por defecto
  allCategoryFields.forEach(field => {
    field.style.display = 'none';
  });
  
  // Mostrar campo de stock general por defecto
  if (stockFieldGeneral) {
    stockFieldGeneral.style.display = 'block';
  }
  
  // Mostrar campos según la categoría seleccionada
  if (category) {
    allCategoryFields.forEach(field => {
      const categories = field.dataset.category;
      if (categories === category) {
        field.style.display = 'flex';
      }
    });
    
    // Para guantes, ocultar el campo de stock general
    if (category === 'guantes') {
      if (stockFieldGeneral) {
        stockFieldGeneral.style.display = 'none';
      }
    }
  }
}

// ===== GESTIÓN DE VISTA PREVIA DE IMÁGENES =====

/**
 * Actualiza la vista previa de una imagen desde una URL existente
 * @param {string} position - Posición de la imagen (main, front, top, side)
 * @param {string} imageUrl - URL de la imagen a mostrar
 */
function updateImagePreviewFromUrl(position, imageUrl) {
  const previewId = `preview-${position}`;
  const preview = document.getElementById(previewId);
  if (!preview) return;
  
  const img = preview.querySelector('img');
  const placeholder = preview.querySelector('.preview-placeholder');
  
  if (!img || !placeholder) return;
  
  if (imageUrl && imageUrl.trim() !== '') {
    img.src = imageUrl;
    img.style.display = 'block';
    placeholder.style.display = 'none';
    
    // Manejar error de carga de imagen
    img.onerror = () => {
      img.style.display = 'none';
      placeholder.style.display = 'flex';
    };
  } else {
    img.style.display = 'none';
    placeholder.style.display = 'flex';
  }
}

/**
 * Actualiza la vista previa de una imagen desde un Data URL (archivo local)
 * @param {string} position - Posición de la imagen (main, front, top, side)
 * @param {string} dataUrl - Data URL de la imagen en Base64
 */
function updateImagePreviewFromDataUrl(position, dataUrl) {
  const previewId = `preview-${position}`;
  const preview = document.getElementById(previewId);
  if (!preview) return;
  
  const img = preview.querySelector('img');
  const placeholder = preview.querySelector('.preview-placeholder');
  
  if (img && placeholder) {
    img.src = dataUrl;
    img.style.display = 'block';
    placeholder.style.display = 'none';
  }
}

/**
 * Limpia una vista previa específica
 * @param {string} position - Posición de la imagen a limpiar (main, front, top, side)
 */
function clearImagePreview(position) {
  const previewId = `preview-${position}`;
  const preview = document.getElementById(previewId);
  if (!preview) return;
  
  const img = preview.querySelector('img');
  const placeholder = preview.querySelector('.preview-placeholder');
  
  if (img && placeholder) {
    img.style.display = 'none';
    img.src = '';
    placeholder.style.display = 'flex';
  }
}

/**
 * Limpia todas las vistas previas de imágenes
 * Se usa al abrir el modal de creación de producto
 */
function clearImagePreviews() {
  const positions = ['main', 'front', 'top', 'side'];
  positions.forEach(position => {
    clearImagePreview(position);
  });
}

/**
 * Limpia todos los inputs de tipo file
 * Se usa al abrir el modal de creación o después de guardar
 */
function clearFileInputs() {
  const positions = ['main', 'front', 'top', 'side'];
  positions.forEach(position => {
    const input = document.getElementById(`product-image-${position}`);
    if (input) {
      input.value = '';
    }
  });
}

// ===== GESTIÓN DE ESTADOS DE FORMULARIO =====

/**
 * Habilita todos los campos del formulario (modo edición/creación)
 */
function enableFormFields() {
  const fields = document.querySelectorAll('#product-form input, #product-form select, #product-form textarea');
  fields.forEach(field => {
    field.disabled = false;
  });
}

/**
 * Deshabilita todos los campos del formulario (modo solo lectura)
 */
function disableFormFields() {
  const fields = document.querySelectorAll('#product-form input, #product-form select, #product-form textarea');
  fields.forEach(field => {
    field.disabled = true;
  });
}

/**
 * Resetea el formulario a su estado inicial
 */
function resetProductForm() {
  const form = document.getElementById('product-form');
  form.reset();
  clearImagePreviews();
  clearFileInputs();
  updateDynamicFields('');
}

// ===== CONFIGURACIÓN DE EVENTOS DE UI =====

/**
 * Configura todos los event listeners relacionados con la interfaz de usuario
 * Se ejecuta cuando el DOM está completamente cargado
 */
function setupUIEventListeners() {
  // Event listener para cerrar el modal de producto con el botón X
  const modalClose = document.getElementById('modal-close');
  if (modalClose) {
    modalClose.addEventListener('click', closeProductModal);
  }
  
  // Event listener para el botón Cancelar en el modal de producto
  const btnCancel = document.getElementById('btn-cancel');
  if (btnCancel) {
    btnCancel.addEventListener('click', closeProductModal);
  }
  
  // Event listeners para el modal de eliminación
  const btnCancelDelete = document.getElementById('btn-cancel-delete');
  if (btnCancelDelete) {
    btnCancelDelete.addEventListener('click', closeDeleteModal);
  }
  
  // Cerrar modales al hacer clic en el overlay (fondo difuminado)
  const overlays = document.querySelectorAll('.modal-overlay');
  overlays.forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        const modal = overlay.closest('.modal');
        if (modal.id === 'product-modal') {
          closeProductModal();
        } else if (modal.id === 'delete-modal') {
          closeDeleteModal();
        }
      }
    });
  });
  
  // Cerrar modales con la tecla ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeProductModal();
      closeDeleteModal();
    }
  });
  
  // Event listener para cambio de categoría (actualizar campos dinámicos)
  const categorySelect = document.getElementById('product-category');
  if (categorySelect) {
    categorySelect.addEventListener('change', (e) => {
      updateDynamicFields(e.target.value);
    });
  }
  
  // Event listeners para vista previa de imágenes al seleccionar archivos
  setupImagePreviewListeners();
}

/**
 * Configura los event listeners para la vista previa de imágenes
 * Las cajas de imagen son clickeables directamente
 */
function setupImagePreviewListeners() {
  // Configurar clickeabilidad de las cajas de vista previa
  const previewBoxes = [
    { previewId: 'preview-main', inputAttr: 'product-image-main' },
    { previewId: 'preview-front', inputAttr: 'product-image-front' },
    { previewId: 'preview-top', inputAttr: 'product-image-top' },
    { previewId: 'preview-side', inputAttr: 'product-image-side' }
  ];
  
  previewBoxes.forEach(({ previewId, inputAttr }) => {
    const previewBox = document.getElementById(previewId);
    if (previewBox) {
      // Hacer que la caja sea clickeable
      previewBox.addEventListener('click', () => {
        const inputId = previewBox.dataset.input || inputAttr;
        const input = document.getElementById(inputId);
        if (input) {
          input.click();
        }
      });
      
      // Agregar estilo de cursor pointer
      previewBox.style.cursor = 'pointer';
    }
  });
  
  // Event listeners para cuando se selecciona un archivo
  const imageInputs = [
    { id: 'product-image-main', position: 'main' },
    { id: 'product-image-front', position: 'front' },
    { id: 'product-image-top', position: 'top' },
    { id: 'product-image-side', position: 'side' }
  ];
  
  imageInputs.forEach(({ id, position }) => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('change', (e) => handleImagePreview(e, position));
    }
  });
}

/**
 * Maneja la vista previa de una imagen cuando se selecciona un archivo
 * @param {Event} event - El evento de cambio del input file
 * @param {string} position - Posición de la imagen (main, front, top, side)
 */
function handleImagePreview(event, position) {
  const file = event.target.files[0];
  
  if (!file) {
    clearImagePreview(position);
    return;
  }
  
  // Validar que sea una imagen
  if (!file.type.startsWith('image/')) {
    alert('Por favor selecciona un archivo de imagen válido');
    event.target.value = '';
    clearImagePreview(position);
    return;
  }
  
  // Crear URL temporal para vista previa
  const reader = new FileReader();
  
  reader.onload = (e) => {
    const imageDataUrl = e.target.result;
    updateImagePreviewFromDataUrl(position, imageDataUrl);
  };
  
  reader.onerror = () => {
    alert('Error al cargar la imagen');
    clearImagePreview(position);
  };
  
  reader.readAsDataURL(file);
}

// ===== UTILIDADES DE UI =====

/**
 * Muestra una notificación al usuario
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de notificación (success, error, warning, info)
 */
function showNotification(message, type = 'info') {
  // TODO: Implementar un sistema de notificaciones más sofisticado
  // Por ahora usamos alert simple
  console.log(`[${type.toUpperCase()}] ${message}`);
  alert(message);
}

// ===== INICIALIZACIÓN DE UI =====

/**
 * Inicializa todos los event listeners de la interfaz de usuario
 * Se ejecuta automáticamente cuando el DOM está listo
 */
document.addEventListener('DOMContentLoaded', () => {
  setupUIEventListeners();
});
