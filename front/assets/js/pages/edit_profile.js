/**
 * ============================================================================
 * AFERGOLF - Página de Edición de Perfil
 * ============================================================================
 * 
 * @description   Gestión de edición de perfil de usuario.
 *                Incluye edición de datos personales y foto de perfil.
 *                Este módulo maneja tanto el modal como la página completa.
 * 
 * @file          front/assets/js/pages/edit_profile.js
 * @author        Afergolf Team
 * @version       1.0.0
 * @since         2025-01-01
 * 
 * ============================================================================
 * ÍNDICE DE CONTENIDO
 * ============================================================================
 * 
 * 1. CONSTANTES
 *    - EDIT_PROFILE_API_URL: URL del endpoint de edición
 *    - ALLOWED_IMAGE_TYPES: Tipos de imagen permitidos
 *    - MAX_IMAGE_SIZE: Tamaño máximo de imagen
 * 
 * 2. FUNCIONES DEL MODAL
 *    - openEditProfileModal(): Abre el modal de edición
 *    - closeEditProfileModal(): Cierra el modal
 * 
 * 3. FUNCIONES DE EDICIÓN
 *    - handleEditProfile(): Procesa el formulario de edición
 *    - validateProfileData(): Valida los datos del formulario
 * 
 * 4. FUNCIONES DE IMAGEN
 *    - setupImageUploadListeners(): Configura listeners de imagen
 *    - handleImagePreview(): Muestra preview de imagen seleccionada
 *    - validateImageFile(): Valida el archivo de imagen
 * 
 * 5. INICIALIZACIÓN
 *    - Carga de datos actuales
 *    - Configuración de event listeners
 * 
 * ============================================================================
 * DEPENDENCIAS
 * ============================================================================
 * 
 * - auth/auth.js: Para verificación de sesión
 * - ui/avatar_colors.js: Para colores dinámicos del avatar
 * - ui/toast.js: Para notificaciones
 * 
 * ============================================================================
 */

// ============================================================================
// 1. CONSTANTES
// ============================================================================

/**
 * URL del endpoint para actualizar perfil.
 * @constant {string}
 */
const EDIT_PROFILE_API_URL = 'http://localhost/AFERGOLF/back/modules/users/api/edit_profile.php';

/**
 * URL del endpoint para obtener datos del perfil.
 * @constant {string}
 */
const GET_PROFILE_API_URL = 'http://localhost/AFERGOLF/back/modules/users/api/my_account.php';

/**
 * Tipos de imagen permitidos.
 * @constant {string[]}
 */
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

/**
 * Tamaño máximo de imagen (5MB).
 * @constant {number}
 */
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

// ============================================================================
// 2. FUNCIONES DEL MODAL
// ============================================================================

/**
 * Abre el modal de edición de perfil.
 */
function openEditProfileModal() {
  const modal = document.getElementById('edit-profile-modal');
  const overlay = document.getElementById('edit-profile-overlay');
  
  if (modal) {
    modal.classList.add('active');
  }
  if (overlay) {
    overlay.classList.add('active');
  }
  document.body.style.overflow = 'hidden';
}

/**
 * Cierra el modal de edición de perfil.
 */
function closeEditProfileModal() {
  const modal = document.getElementById('edit-profile-modal');
  const overlay = document.getElementById('edit-profile-overlay');
  
  if (modal) {
    modal.classList.remove('active');
  }
  if (overlay) {
    overlay.classList.remove('active');
  }
  document.body.style.overflow = '';
}

// ============================================================================
// 3. FUNCIONES DE EDICIÓN
// ============================================================================

/**
 * Procesa el formulario de edición de perfil.
 * @param {Event} event - Evento submit del formulario
 */
async function handleEditProfile(event) {
  event.preventDefault();
  
  // Capturar datos del formulario
  const formData = {
    nombres: document.getElementById('firstName')?.value.trim(),
    apellidos: document.getElementById('lastName')?.value.trim(),
    email: document.getElementById('email')?.value.trim(),
    telefono: document.getElementById('phone')?.value.trim() || '',
    ciudad: document.getElementById('city')?.value.trim() || ''
  };
  
  // Validar datos
  const validation = validateProfileData(formData);
  if (!validation.valid) {
    showProfileMessage(validation.message, 'error');
    return;
  }
  
  // Obtener ID del usuario
  const userId = localStorage.getItem('afergolf_user_id');
  if (!userId) {
    showProfileMessage('Error: No se encontró el ID del usuario', 'error');
    return;
  }
  
  // Crear FormData para enviar archivos
  const submitData = new FormData();
  submitData.append('id', userId);
  submitData.append('nombres', formData.nombres);
  submitData.append('apellidos', formData.apellidos);
  submitData.append('email', formData.email);
  submitData.append('telefono', formData.telefono);
  submitData.append('ciudad', formData.ciudad);
  
  // Agregar imagen si existe
  const avatarInput = document.getElementById('modalAvatarInput') || document.getElementById('avatarInput');
  if (avatarInput && avatarInput.files.length > 0) {
    const file = avatarInput.files[0];
    
    // Validar imagen
    const imageValidation = validateImageFile(file);
    if (!imageValidation.valid) {
      showProfileMessage(imageValidation.message, 'error');
      return;
    }
    
    submitData.append('profileImage', file);
  }
  
  try {
    const response = await fetch(EDIT_PROFILE_API_URL, {
      method: 'POST',
      body: submitData
    });
    
    const data = await response.json();
    
    showProfileMessage(data.message, data.status);
    
    if (data.status === 'success') {
      // Actualizar UI con nuevos datos
      if (data.user) {
        updateUIWithUserData(data.user);
        updateLocalStorage(data.user);
      }
      
      // Limpiar input de archivo
      if (avatarInput) {
        avatarInput.value = '';
      }
      
      // Cerrar modal después de un delay
      setTimeout(() => {
        closeEditProfileModal();
        
        // Si estamos en la página de edición, redirigir a mi cuenta
        if (window.location.pathname.includes('Edit_profile.html')) {
          window.location.href = 'my_account.html';
        }
      }, 1500);
    }
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    showProfileMessage('Error de conexión con el servidor', 'error');
  }
}

/**
 * Valida los datos del formulario de perfil.
 * @param {Object} data - Datos del formulario
 * @returns {Object} Resultado de validación
 */
function validateProfileData(data) {
  if (!data.nombres || !data.apellidos || !data.email) {
    return { 
      valid: false, 
      message: 'Por favor completa los campos requeridos (Nombre, Apellidos, Correo)' 
    };
  }
  
  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return { valid: false, message: 'Por favor ingresa un correo válido' };
  }
  
  return { valid: true, message: '' };
}

/**
 * Actualiza la UI con los nuevos datos del usuario.
 * @param {Object} user - Datos actualizados del usuario
 */
function updateUIWithUserData(user) {
  // Actualizar nombre
  const userName = document.querySelector('.user-name');
  if (userName) {
    userName.textContent = `${user.nombres} ${user.apellidos}`;
  }
  
  // Actualizar email
  const userEmail = document.querySelector('.user-email');
  if (userEmail) {
    userEmail.textContent = user.email;
  }
  
  // Actualizar teléfono
  const userPhone = document.querySelector('#user-phone .detail-text');
  if (userPhone) {
    userPhone.textContent = user.telefono && user.telefono.trim() !== '' 
      ? user.telefono 
      : 'Sin teléfono';
  }
  
  // Actualizar ciudad
  const userCity = document.querySelector('#user-city .detail-text');
  if (userCity) {
    userCity.textContent = user.ciudad && user.ciudad.trim() !== '' 
      ? user.ciudad 
      : 'Sin ciudad';
  }
  
  // Actualizar imagen si fue subida
  if (user.foto_perfil && user.foto_perfil.trim() !== '') {
    updateAvatarImage(user.foto_perfil);
  }
}

/**
 * Actualiza la imagen del avatar en la UI.
 * @param {string} imagePath - Ruta de la imagen
 */
function updateAvatarImage(imagePath) {
  const fullPath = '../' + imagePath;
  
  // Avatar principal
  const avatarImage = document.getElementById('avatarImage');
  const avatarPlaceholder = document.querySelector('.avatar .avatar-placeholder');
  const avatarContainer = document.querySelector('.avatar');
  
  if (avatarImage) {
    avatarImage.src = fullPath;
    avatarImage.style.display = 'block';
    
    // Aplicar colores dinámicos cuando cargue
    avatarImage.onload = () => {
      if (avatarPlaceholder) avatarPlaceholder.style.display = 'none';
      if (avatarContainer && window.avatarColorExtractor) {
        window.avatarColorExtractor.applyToAvatar(avatarContainer, avatarImage);
      }
    };
  }
  
  // Avatar del modal
  const modalAvatarImage = document.getElementById('modalAvatarImage');
  const modalPlaceholder = document.querySelector('.avatar-edit .avatar-placeholder');
  const modalContainer = document.querySelector('.avatar-edit');
  
  if (modalAvatarImage) {
    modalAvatarImage.src = fullPath;
    modalAvatarImage.style.display = 'block';
    
    // Aplicar colores dinámicos al modal cuando cargue
    modalAvatarImage.onload = () => {
      if (modalPlaceholder) modalPlaceholder.style.display = 'none';
      if (modalContainer && window.avatarColorExtractor) {
        window.avatarColorExtractor.applyToAvatar(modalContainer, modalAvatarImage);
      }
    };
  }
}

/**
 * Actualiza localStorage con los nuevos datos.
 * @param {Object} user - Datos del usuario
 */
function updateLocalStorage(user) {
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  userData.nombres = user.nombres;
  userData.apellidos = user.apellidos;
  userData.email = user.email;
  userData.telefono = user.telefono;
  userData.ciudad = user.ciudad;
  if (user.foto_perfil) {
    userData.foto_perfil = user.foto_perfil;
  }
  localStorage.setItem('user', JSON.stringify(userData));
}

// ============================================================================
// 4. FUNCIONES DE IMAGEN
// ============================================================================

/**
 * Configura los listeners para la carga de imagen.
 */
function setupImageUploadListeners() {
  // Modal de edición
  const modalAvatarContainer = document.getElementById('modalAvatarContainer');
  const modalAvatarInput = document.getElementById('modalAvatarInput');
  
  if (modalAvatarContainer && modalAvatarInput) {
    modalAvatarContainer.addEventListener('click', (e) => {
      e.stopPropagation();
      modalAvatarInput.click();
    });
    
    modalAvatarInput.addEventListener('change', (e) => {
      handleImagePreview(e, 'modal');
    });
  }
  
  // Página de edición
  const avatarContainer = document.getElementById('avatarContainer');
  const avatarInput = document.getElementById('avatarInput');
  
  if (avatarContainer && avatarInput) {
    avatarContainer.addEventListener('click', (e) => {
      e.stopPropagation();
      avatarInput.click();
    });
    
    avatarInput.addEventListener('change', (e) => {
      handleImagePreview(e, 'page');
    });
  }
}

/**
 * Maneja la vista previa de la imagen seleccionada.
 * @param {Event} event - Evento change del input
 * @param {string} context - Contexto ('modal' o 'page')
 */
function handleImagePreview(event, context = 'modal') {
  const file = event.target.files[0];
  if (!file) return;
  
  // Validar imagen
  const validation = validateImageFile(file);
  if (!validation.valid) {
    showProfileMessage(validation.message, 'error');
    event.target.value = '';
    return;
  }
  
  const reader = new FileReader();
  
  reader.onload = (e) => {
    const targetImage = context === 'modal' 
      ? document.getElementById('modalAvatarImage')
      : document.getElementById('avatarImage');
    
    const targetPlaceholder = context === 'modal'
      ? document.querySelector('.avatar-edit .avatar-placeholder')
      : document.querySelector('.avatar .avatar-placeholder');
    
    if (targetImage) {
      targetImage.src = e.target.result;
      targetImage.style.display = 'block';
    }
    
    if (targetPlaceholder) {
      targetPlaceholder.style.display = 'none';
    }
    
    // Aplicar colores dinámicos al preview
    if (targetImage && window.avatarColorExtractor) {
      targetImage.onload = () => {
        const container = context === 'modal'
          ? document.querySelector('.avatar-edit')
          : document.querySelector('.avatar');
        if (container) {
          window.avatarColorExtractor.applyToAvatar(container, targetImage);
        }
      };
    }
  };
  
  reader.onerror = () => {
    showProfileMessage('Error al leer la imagen', 'error');
  };
  
  reader.readAsDataURL(file);
}

/**
 * Valida un archivo de imagen.
 * @param {File} file - Archivo a validar
 * @returns {Object} Resultado de validación
 */
function validateImageFile(file) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { 
      valid: false, 
      message: 'Tipo de imagen no permitido. Use JPEG, PNG, GIF o WEBP' 
    };
  }
  
  if (file.size > MAX_IMAGE_SIZE) {
    return { 
      valid: false, 
      message: 'La imagen es muy grande. Máximo 5MB' 
    };
  }
  
  return { valid: true, message: '' };
}

// ============================================================================
// 5. UTILIDADES
// ============================================================================

/**
 * Muestra mensajes de respuesta usando Toast o fallback.
 * @param {string} message - Mensaje a mostrar
 * @param {string} status - Tipo de mensaje (success, error, warning)
 */
function showProfileMessage(message, status) {
  if (window.Toast) {
    const toastMethod = Toast[status] || Toast.info;
    toastMethod(message);
  } else {
    // Fallback al elemento tradicional
    let responseElement = document.getElementById('edit-profile-response');
    
    if (!responseElement) {
      responseElement = document.createElement('div');
      responseElement.id = 'edit-profile-response';
      const form = document.querySelector('.profile-form');
      if (form) {
        form.parentNode.insertBefore(responseElement, form);
      }
    }
    
    if (responseElement) {
      responseElement.textContent = message;
      responseElement.className = `message-box ${status}`;
      responseElement.style.display = 'block';
      
      setTimeout(() => {
        responseElement.style.display = 'none';
      }, status === 'success' ? 3000 : 4000);
    }
  }
}

/**
 * Carga los datos actuales del usuario para la página de edición.
 */
async function loadCurrentUserData() {
  const userId = localStorage.getItem('afergolf_user_id');
  if (!userId) return;
  
  try {
    const response = await fetch(`${GET_PROFILE_API_URL}?id=${userId}`);
    const data = await response.json();
    
    if (data.status === 'success' && data.user) {
      // Llenar campos del formulario
      document.getElementById('firstName').value = data.user.nombres || '';
      document.getElementById('lastName').value = data.user.apellidos || '';
      document.getElementById('email').value = data.user.email || '';
      document.getElementById('phone').value = data.user.telefono || '';
      document.getElementById('city').value = data.user.ciudad || '';
      
      // Cargar nombre y email en la vista
      const userName = document.querySelector('.user-name');
      const userEmail = document.querySelector('.user-email');
      if (userName) userName.textContent = `${data.user.nombres} ${data.user.apellidos}`;
      if (userEmail) userEmail.textContent = data.user.email;
      
      // Cargar imagen si existe
      if (data.user.foto_perfil && data.user.foto_perfil.trim() !== '') {
        updateAvatarImage(data.user.foto_perfil);
      }
    }
  } catch (error) {
    console.error('Error loading user data:', error);
  }
}

// ============================================================================
// 6. INICIALIZACIÓN
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Verificar sesión
  const isLogged = localStorage.getItem('afergolf_logged');
  const userId = localStorage.getItem('afergolf_user_id');
  
  if (!isLogged || !userId) {
    if (window.Toast) {
      Toast.warning('Debes iniciar sesión para editar tu perfil');
    }
    setTimeout(() => {
      window.location.href = 'log_in.html';
    }, 1000);
    return;
  }
  
  // Si estamos en la página de edición, cargar datos
  if (window.location.pathname.includes('Edit_profile.html')) {
    loadCurrentUserData();
  }
  
  // Configurar listeners de imagen
  setupImageUploadListeners();
  
  // Configurar formulario de edición
  const profileForm = document.querySelector('.profile-form') || document.getElementById('editProfileForm');
  if (profileForm) {
    profileForm.addEventListener('submit', handleEditProfile);
  }
  
  // Botón cancelar
  const cancelBtn = document.querySelector('.btn-secondary');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closeEditProfileModal();
      
      // Si estamos en página de edición, volver a mi cuenta
      if (window.location.pathname.includes('Edit_profile.html')) {
        window.location.href = 'my_account.html';
      }
    });
  }
  
  // Botón cerrar modal
  const closeBtn = document.getElementById('close-edit-profile');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeEditProfileModal);
  }
  
  // Overlay para cerrar modal
  const overlay = document.getElementById('edit-profile-overlay');
  if (overlay) {
    overlay.addEventListener('click', closeEditProfileModal);
  }
  
  // ESC para cerrar modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeEditProfileModal();
    }
  });
});

// ============================================================================
// EXPORTACIÓN
// ============================================================================

if (typeof window !== 'undefined') {
  window.openEditProfileModal = openEditProfileModal;
  window.closeEditProfileModal = closeEditProfileModal;
  window.handleEditProfile = handleEditProfile;
  
  // Alias para compatibilidad
  window.openEditProfile = openEditProfileModal;
  window.closeEditProfile = closeEditProfileModal;
}
