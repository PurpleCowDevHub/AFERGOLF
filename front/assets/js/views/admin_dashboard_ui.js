/**
 * ============================================================================
 * AFERGOLF - Admin Dashboard UI (Frontend)
 * ============================================================================
 * 
 * Lógica de interfaz de usuario: modales, vista previa de imágenes y campos dinámicos.
 * 
 * @author Afergolf Team
 * @version 1.0.0
 * ============================================================================
 */

// ============================================================================
// CONTROL DE MODALES
// ============================================================================

/**
 * Controla el estado de un modal.
 * @param {string} modalId - ID del modal
 * @param {boolean} isOpen - Estado de apertura
 */
const toggleModal = (modalId, isOpen) => {
  const modal = document.getElementById(modalId);
  modal.classList.toggle('active', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
};

const openProductModal = () => toggleModal('product-modal', true);
const closeProductModal = () => toggleModal('product-modal', false);
const openDeleteModal = () => toggleModal('delete-modal', true);
const closeDeleteModal = () => toggleModal('delete-modal', false);
const openLogoutModal = () => toggleModal('logout-modal', true);
const closeLogoutModal = () => toggleModal('logout-modal', false);
const openProductDetailsModal = () => toggleModal('product-details-modal', true);
const closeProductDetailsModal = () => toggleModal('product-details-modal', false);

// ============================================================================
// CAMPOS DINÁMICOS
// ============================================================================

/**
 * Actualiza los campos del formulario según la categoría seleccionada.
 * @param {string} category - Categoría del producto (palos, bolas, guantes, accesorios)
 */
function updateDynamicFields(category) {
  const allCategoryFields = document.querySelectorAll('.category-fields');
  const stockFieldGeneral = document.getElementById('stock-field-general');
  const stockInput = document.getElementById('product-stock');
  
  // Ocultar todos los campos dinámicos
  allCategoryFields.forEach(field => field.style.display = 'none');
  
  // Controlar el campo de stock general
  if (stockFieldGeneral) {
    if (category === 'guantes') {
      stockFieldGeneral.style.display = 'none';
      stockFieldGeneral.classList.add('hidden');
      // Hacer el input opcional para guantes
      if (stockInput) {
        stockInput.removeAttribute('required');
      }
    } else {
      stockFieldGeneral.style.display = 'block';
      stockFieldGeneral.classList.remove('hidden');
      // Hacer el input requerido para otras categorías
      if (stockInput) {
        stockInput.setAttribute('required', 'required');
      }
    }
  }
  
  // Mostrar campos específicos de la categoría seleccionada
  if (category) {
    allCategoryFields.forEach(field => {
      if (field.dataset.category === category) {
        field.style.display = 'flex';
      }
    });
  }
}

// ============================================================================
// VISTA PREVIA DE IMÁGENES
// ============================================================================

/**
 * Actualiza la vista previa de una imagen desde una URL.
 * @param {string} position - Posición de la imagen (main, front, top, side)
 * @param {string} imageUrl - URL de la imagen
 */
function updateImagePreviewFromUrl(position, imageUrl) {
  const preview = document.getElementById(`preview-${position}`);
  if (!preview) return;
  
  const img = preview.querySelector('img');
  const placeholder = preview.querySelector('.preview-placeholder');
  
  if (!img || !placeholder) return;
  
  if (imageUrl && imageUrl.trim() !== '') {
    img.src = imageUrl;
    img.style.display = 'block';
    placeholder.style.display = 'none';
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
 * Actualiza la vista previa de una imagen desde un Data URL.
 * @param {string} position - Posición de la imagen
 * @param {string} dataUrl - Data URL de la imagen
 */
function updateImagePreviewFromDataUrl(position, dataUrl) {
  const preview = document.getElementById(`preview-${position}`);
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
 * Limpia una vista previa específica.
 * @param {string} position - Posición de la imagen
 */
function clearImagePreview(position) {
  const preview = document.getElementById(`preview-${position}`);
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
 * Limpia todas las vistas previas de imágenes.
 */
function clearImagePreviews() {
  ['main', 'front', 'top', 'side'].forEach(clearImagePreview);
}

/**
 * Limpia todos los inputs de tipo file.
 */
function clearFileInputs() {
  ['main', 'front', 'top', 'side'].forEach(position => {
    const input = document.getElementById(`product-image-${position}`);
    if (input) input.value = '';
  });
}

// ============================================================================
// ESTADOS DE FORMULARIO
// ============================================================================

/**
 * Habilita todos los campos del formulario.
 */
function enableFormFields() {
  document.querySelectorAll('#product-form input, #product-form select, #product-form textarea')
    .forEach(field => field.disabled = false);
}

/**
 * Deshabilita todos los campos del formulario (solo lectura).
 */
function disableFormFields() {
  document.querySelectorAll('#product-form input, #product-form select, #product-form textarea')
    .forEach(field => field.disabled = true);
}

/**
 * Resetea el formulario a su estado inicial.
 */
function resetProductForm() {
  const form = document.getElementById('product-form');
  form.reset();
  clearImagePreviews();
  clearFileInputs();
  updateDynamicFields('');
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

/**
 * Configura todos los event listeners de la interfaz de usuario.
 */
function setupUIEventListeners() {
  const modalClose = document.getElementById('modal-close');
  if (modalClose) modalClose.addEventListener('click', closeProductModal);
  
  const productDetailsClose = document.getElementById('product-details-close');
  if (productDetailsClose) productDetailsClose.addEventListener('click', closeProductDetailsModal);
  
  const btnCancel = document.getElementById('btn-cancel');
  if (btnCancel) btnCancel.addEventListener('click', closeProductModal);
  
  const btnCancelDelete = document.getElementById('btn-cancel-delete');
  if (btnCancelDelete) btnCancelDelete.addEventListener('click', closeDeleteModal);
  
  const btnCancelLogout = document.getElementById('btn-cancel-logout');
  if (btnCancelLogout) btnCancelLogout.addEventListener('click', closeLogoutModal);
  
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        const modal = overlay.closest('.modal');
        if (modal.id === 'product-modal') closeProductModal();
        else if (modal.id === 'delete-modal') closeDeleteModal();
        else if (modal.id === 'logout-modal') closeLogoutModal();
        else if (modal.id === 'product-details-modal') closeProductDetailsModal();
      }
    });
  });
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeProductModal();
      closeDeleteModal();
      closeLogoutModal();
      closeProductDetailsModal();
    }
  });
  
  const categorySelect = document.getElementById('product-category');
  if (categorySelect) {
    categorySelect.addEventListener('change', (e) => {
      console.log('Categoría seleccionada:', e.target.value); // Para debugging
      updateDynamicFields(e.target.value);
    });
    
    // Configurar estado inicial
    updateDynamicFields(categorySelect.value);
  }
  
  setupImagePreviewListeners();
}

/**
 * Configura los event listeners para la vista previa de imágenes.
 */
function setupImagePreviewListeners() {
  const previewBoxes = [
    { previewId: 'preview-main', inputAttr: 'product-image-main' },
    { previewId: 'preview-front', inputAttr: 'product-image-front' },
    { previewId: 'preview-top', inputAttr: 'product-image-top' },
    { previewId: 'preview-side', inputAttr: 'product-image-side' }
  ];
  
  previewBoxes.forEach(({ previewId, inputAttr }) => {
    const previewBox = document.getElementById(previewId);
    if (previewBox) {
      previewBox.style.cursor = 'pointer';
      previewBox.addEventListener('click', () => {
        const inputId = previewBox.dataset.input || inputAttr;
        const input = document.getElementById(inputId);
        if (input) input.click();
      });
    }
  });
  
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
 * Maneja la vista previa de una imagen cuando se selecciona un archivo.
 * @param {Event} event - Evento change del input file
 * @param {string} position - Posición de la imagen
 */
function handleImagePreview(event, position) {
  const file = event.target.files[0];
  
  if (!file) {
    clearImagePreview(position);
    return;
  }
  
  if (!file.type.startsWith('image/')) {
    alert('Por favor selecciona un archivo de imagen válido');
    event.target.value = '';
    clearImagePreview(position);
    return;
  }
  
  const reader = new FileReader();
  
  reader.onload = (e) => updateImagePreviewFromDataUrl(position, e.target.result);
  reader.onerror = () => {
    alert('Error al cargar la imagen');
    clearImagePreview(position);
  };
  
  reader.readAsDataURL(file);
}

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Muestra una notificación al usuario.
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de notificación (success, error, warning, info)
 */
function showNotification(message, type = 'info') {
  console.log(`[${type.toUpperCase()}] ${message}`);
  alert(message);
}

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

document.addEventListener('DOMContentLoaded', setupUIEventListeners);
