/**
 * ============================================================================
 * AFERGOLF - UI Components Module
 * ============================================================================
 * 
 * Modales, menú hamburguesa, búsqueda, alertas y componentes de interfaz.
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
  if (!modal) return;
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

/**
 * Abre el modal de editar perfil y muestra el overlay.
 */
const openEditProfile = () => {
  const modal = document.getElementById('edit-profile-modal');
  const overlay = document.getElementById('edit-profile-overlay');
  
  if (modal) {
    modal.classList.add('active');
  }
  
  if (overlay) {
    overlay.classList.add('active');
  }
  
  document.body.style.overflow = 'hidden';
};

/**
 * Cierra el modal de editar perfil y oculta el overlay.
 */
const closeEditProfile = () => {
  const modal = document.getElementById('edit-profile-modal');
  const overlay = document.getElementById('edit-profile-overlay');
  if (modal) modal.classList.remove('active');
  if (overlay) overlay.classList.remove('active');
  document.body.style.overflow = '';
};

// ============================================================================
// MENÚ HAMBURGUESA Y BÚSQUEDA
// ============================================================================

// Variables para evitar duplicación de event listeners
let headerListenersInitialized = false;

/**
 * Alterna el estado del body overflow y overlay.
 * @param {boolean} isOpen - Estado de apertura
 */
const toggleBodyScroll = (isOpen) => {
  document.body.style.overflow = isOpen ? 'hidden' : '';
  const overlay = document.getElementById('modal-overlay');
  if (overlay) overlay.classList.toggle('active', isOpen);
};

/**
 * Abre el menú hamburguesa.
 */
const openMenu = () => {
  const hamburguerMenu = document.getElementById('hamburguer-menu');
  if (hamburguerMenu) {
    hamburguerMenu.classList.add('active');
    toggleBodyScroll(true);
  }
};

/**
 * Cierra el menú hamburguesa.
 */
const closeMenu = () => {
  const hamburguerMenu = document.getElementById('hamburguer-menu');
  if (hamburguerMenu) {
    hamburguerMenu.classList.remove('active');
    toggleBodyScroll(false);
  }
};

/**
 * Abre el modal de búsqueda y enfoca el input.
 */
const openSearch = () => {
  const searchModal = document.getElementById('search-modal');
  if (searchModal) {
    searchModal.classList.add('active');
    toggleBodyScroll(true);
    setTimeout(() => {
      const searchInput = searchModal.querySelector('.search-input');
      if (searchInput) searchInput.focus();
    }, 100);
  }
};

/**
 * Cierra el modal de búsqueda.
 */
const closeSearch = () => {
  const searchModal = document.getElementById('search-modal');
  if (searchModal) {
    searchModal.classList.remove('active');
    toggleBodyScroll(false);
  }
};

/**
 * Cierra todos los modales.
 */
const closeAll = () => {
  closeMenu();
  closeSearch();
};

// ============================================================================
// MI CUENTA - MODAL DE EDITAR PERFIL
// ============================================================================

/**
 * Configura los event listeners del modal de editar perfil.
 */
function setupMyAccountEventListeners() {
  // Buscar elementos con un pequeño delay para asegurar que el DOM esté listo
  setTimeout(() => {
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const closeEditBtn = document.getElementById('close-edit-profile');
    const cancelEditBtn = document.querySelector('.btn-secondary');
    const editProfileOverlay = document.getElementById('edit-profile-overlay');
    const editProfileModal = document.getElementById('edit-profile-modal');
    const profileForm = document.querySelector('.profile-form');
    
    // Abrir modal al hacer clic en "Editar Perfil"
    if (editProfileBtn) {
      editProfileBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openEditProfile();
      });
    }
    
    // Cerrar al hacer clic en el botón X
    if (closeEditBtn) {
      closeEditBtn.addEventListener('click', closeEditProfile);
    }
    
    // Cerrar al hacer clic en "Cancelar"
    if (cancelEditBtn) {
      cancelEditBtn.addEventListener('click', (e) => {
        e.preventDefault();
        closeEditProfile();
      });
    }
    
    // Cerrar al hacer clic en el overlay
    if (editProfileOverlay) {
      editProfileOverlay.addEventListener('click', closeEditProfile);
    }
    
    // Evitar que el clic dentro del modal cierre el modal
    if (editProfileModal) {
      editProfileModal.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }
    
    // Cerrar con la tecla ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && editProfileModal && editProfileModal.classList.contains('active')) {
        closeEditProfile();
      }
    });
    
    // Configurar avatar
    setupAvatarUpload();
    
    // Validación de formulario
    if (profileForm) {
      profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        closeEditProfile();
      });
    }
  }, 100);
}

// ============================================================================
// MI CUENTA - CARGA DE AVATAR
// ============================================================================

/**
 * Configura la funcionalidad de carga de avatar.
 */
function setupAvatarUpload() {
  const avatarContainer = document.getElementById('avatarContainer');
  const avatarInput = document.getElementById('avatarInput');
  const avatarImage = document.getElementById('avatarImage');
  
  if (!avatarContainer || !avatarInput || !avatarImage) return;
  
  // Permitir clic en el avatar para seleccionar imagen
  avatarContainer.addEventListener('click', (e) => {
    e.stopPropagation();
    avatarInput.click();
  });
  
  // Procesar cambio de imagen
  avatarInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    
    if (!file) return;
    
    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      if (window.Toast) {
        Toast.error('Por favor selecciona un archivo de imagen válido');
      } else {
        alert('Por favor selecciona un archivo de imagen válido');
      }
      avatarInput.value = '';
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      avatarImage.src = event.target.result;
    };
    
    reader.onerror = () => {
      if (window.Toast) {
        Toast.error('Error al cargar la imagen');
      } else {
        alert('Error al cargar la imagen');
      }
    };
    
    reader.readAsDataURL(file);
  });
}

// ============================================================================
// CAMPOS DINÁMICOS DEL DASHBOARD
// ============================================================================

/**
 * Actualiza los campos del formulario según la categoría seleccionada.
 * @param {string} category - Categoría del producto (palos, bolas, guantes)
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
  if (form) form.reset();
  clearImagePreviews();
  clearFileInputs();
  updateDynamicFields('');
  
  // Resetear contador de caracteres del nombre
  const productNameInput = document.getElementById('product-name');
  const counter = document.getElementById('product-name-counter');
  if (productNameInput && counter) {
    const maxLength = parseInt(productNameInput.getAttribute('maxlength')) || 80;
    counter.textContent = `${maxLength} caracteres restantes`;
    counter.classList.remove('warning', 'danger');
  }
}

// ============================================================================
// NOTIFICACIONES
// ============================================================================

/**
 * Muestra una notificación al usuario usando Toast.
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de notificación (success, error, warning, info)
 */
function showNotification(message, type = 'info') {
  // Usar el sistema de Toast si está disponible
  if (window.Toast) {
    const toastMethod = Toast[type] || Toast.info;
    toastMethod(message);
  } else {
    alert(message);
  }
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

/**
 * Configura los event listeners del menú hamburguesa y búsqueda.
 */
function setupHeaderEventListeners() {
  // Evitar duplicación de event listeners
  if (headerListenersInitialized) return;
  headerListenersInitialized = true;
  
  const overlay = document.getElementById('modal-overlay');
  const hamburguerMenu = document.getElementById('hamburguer-menu');
  const searchModal = document.getElementById('search-modal');
  const openMenuMobile = document.getElementById('open-menu-mobile');
  const openMenuDesktop = document.getElementById('open-menu-desktop');
  const openSearchMobile = document.getElementById('open-search-mobile');
  const openSearchDesktop = document.getElementById('open-search-desktop');

  // Menú hamburguesa
  [openMenuMobile, openMenuDesktop].forEach(btn => {
    if (btn) btn.addEventListener('click', openMenu);
  });

  // Búsqueda
  [openSearchMobile, openSearchDesktop].forEach(btn => {
    if (btn) btn.addEventListener('click', openSearch);
  });

  // Cerrar búsqueda al clicar en el fondo
  if (searchModal) {
    searchModal.addEventListener('click', (e) => {
      if (e.target === searchModal) closeSearch();
    });
  }

  // Evitar cierre del menú al clicar dentro
  if (hamburguerMenu) {
    hamburguerMenu.addEventListener('click', (e) => e.stopPropagation());
  }

  // Cerrar con overlay
  if (overlay) {
    overlay.addEventListener('click', closeAll);
  }

  // Cerrar con tecla ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAll();
  });
}

/**
 * Configura todos los event listeners de modales del dashboard.
 */
function setupDashboardModalsEventListeners() {
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
  
  const btnClosePreview = document.getElementById('btn-close-preview');
  if (btnClosePreview) btnClosePreview.addEventListener('click', closeProductDetailsModal);
  
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
    // Evitar duplicación de listeners usando atributo data
    if (previewBox && !previewBox.hasAttribute('data-click-initialized')) {
      previewBox.style.cursor = 'pointer';
      previewBox.setAttribute('data-click-initialized', 'true');
      previewBox.addEventListener('click', () => {
        const inputId = previewBox.dataset.input || inputAttr;
        const input = document.getElementById(inputId);
        if (input) input.click();
      });
    }
  });
  
  // NOTA: Los listeners de change para imágenes se manejan en admin_create.js
  // para evitar duplicación. Este archivo solo maneja el clic en preview boxes.
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
    if (window.Toast) {
      Toast.error('Por favor selecciona un archivo de imagen válido');
    } else {
      alert('Por favor selecciona un archivo de imagen válido');
    }
    event.target.value = '';
    clearImagePreview(position);
    return;
  }
  
  const reader = new FileReader();
  
  reader.onload = (e) => updateImagePreviewFromDataUrl(position, e.target.result);
  reader.onerror = () => {
    if (window.Toast) {
      Toast.error('Error al cargar la imagen');
    } else {
      alert('Error al cargar la imagen');
    }
    clearImagePreview(position);
  };
  
  reader.readAsDataURL(file);
}

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

/**
 * Inicializa los componentes de UI según el contexto de la página.
 */
function initializeUIComponents() {
  // Inicializar componentes del header si existen
  if (document.getElementById('hamburguer-menu') || document.getElementById('search-modal')) {
    setupHeaderEventListeners();
  }
  
  // Inicializar modales del dashboard si existen
  if (document.getElementById('product-modal') || document.getElementById('delete-modal')) {
    setupDashboardModalsEventListeners();
  }
  
  // Inicializar funcionalidad de Mi Cuenta si existe
  const editProfileModal = document.getElementById('edit-profile-modal');
  if (editProfileModal) {
    setupMyAccountEventListeners();
  }
}

// Exponer globalmente para que main.js pueda llamarla
if (typeof window !== 'undefined') {
  window.initializeUIComponents = initializeUIComponents;
}

// Auto-inicialización
function initWithRetry(attempts = 3) {
  initializeUIComponents();
  
  // Si aún hay elementos faltantes y tenemos intentos restantes, reintentar
  if (attempts > 1) {
    setTimeout(() => {
      const editModal = document.getElementById('edit-profile-modal');
      const editBtn = document.getElementById('edit-profile-btn');
      if (editModal && !editBtn) {
        initWithRetry(attempts - 1);
      }
    }, 200);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => initWithRetry());
} else {
  initWithRetry();
}

// También ejecutar cuando la página esté completamente cargada
window.addEventListener('load', () => initWithRetry());