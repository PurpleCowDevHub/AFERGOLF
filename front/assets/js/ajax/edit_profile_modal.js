/**
 * ============================================================================
 * AFERGOLF - Edit Profile AJAX Module
 * ============================================================================
 * 
 * Gestión de edición de perfil: validación y actualización de datos de usuario.
 * 
 * @author Afergolf Team
 * @version 1.0.0
 * ============================================================================
 */

// ============================================================================
// CONFIGURACIÓN Y VARIABLES GLOBALES
// ============================================================================

/**
 * URL del endpoint de la API REST para actualizar perfil
 */
const EDIT_PROFILE_API_URL = 'http://localhost/AFERGOLF/back/modules/users/api/edit_profile.php';

// ============================================================================
// FUNCIONES DE EDICIÓN DE PERFIL
// ============================================================================

/**
 * Abre el modal de edición de perfil
 */
function openEditProfileModal() {
  const modal = document.getElementById('edit-profile-modal');
  const overlay = document.getElementById('edit-profile-overlay');
  
  if (modal && overlay) {
    modal.classList.add('active');
    overlay.classList.add('active');
  }
}

/**
 * Cierra el modal de edición de perfil
 */
function closeEditProfileModal() {
  const modal = document.getElementById('edit-profile-modal');
  const overlay = document.getElementById('edit-profile-overlay');
  
  if (modal && overlay) {
    modal.classList.remove('active');
    overlay.classList.remove('active');
  }
}

/**
 * Maneja el envío del formulario de edición de perfil
 */
function handleEditProfile(e) {
  e.preventDefault();

  // Capturar datos del formulario
  const nombres = document.getElementById('firstName').value.trim();
  const apellidos = document.getElementById('lastName').value.trim();
  const email = document.getElementById('email').value.trim();
  const telefono = document.getElementById('phone').value.trim();
  const ciudad = document.getElementById('city').value.trim();

  // Validar campos requeridos
  if (!nombres || !apellidos || !email) {
    showEditProfileResponse('Por favor completa los campos requeridos (Nombre, Apellidos, Correo)', 'error');
    return;
  }

  // Validar formato de email
  if (!isValidEmail(email)) {
    showEditProfileResponse('Por favor ingresa un correo válido', 'error');
    return;
  }

  // Obtener ID del usuario desde localStorage
  const userId = localStorage.getItem('afergolf_user_id');
  if (!userId) {
    showEditProfileResponse('Error: No se encontró el ID del usuario', 'error');
    return;
  }

  // Crear FormData para enviar archivos
  const formData = new FormData();
  formData.append('id', userId);
  formData.append('nombres', nombres);
  formData.append('apellidos', apellidos);
  formData.append('email', email);
  formData.append('telefono', telefono);
  formData.append('ciudad', ciudad);

  // Agregar imagen si existe en el modal
  const modalAvatarInput = document.getElementById('modalAvatarInput');
  if (modalAvatarInput && modalAvatarInput.files.length > 0) {
    const file = modalAvatarInput.files[0];
    
    // Validar tipo de archivo
    const allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowed_types.includes(file.type)) {
      showEditProfileResponse('Tipo de imagen no permitido. Use JPEG, PNG, GIF o WEBP', 'error');
      return;
    }
    
    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showEditProfileResponse('La imagen es muy grande. Máximo 5MB', 'error');
      return;
    }
    
    formData.append('profileImage', file);
    console.log("✓ Imagen incluida en formulario:", file.name);
  }

  // Enviar solicitud de actualización al servidor
  const xhr = new XMLHttpRequest();
  xhr.open('POST', EDIT_PROFILE_API_URL, true);

  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      try {
        // Validar código de estado HTTP
        if (xhr.status < 200 || xhr.status >= 300) {
          showEditProfileResponse(`Error del servidor (${xhr.status}): ${xhr.statusText}`, 'error');
          console.error('HTTP Error:', xhr.status, xhr.statusText, xhr.responseText);
          return;
        }

        // Parsear respuesta JSON
        if (!xhr.responseText) {
          showEditProfileResponse('El servidor no devolvió una respuesta válida', 'error');
          console.error('Empty response from server');
          return;
        }

        const data = JSON.parse(xhr.responseText);

        // Validar que la respuesta tenga los campos requeridos
        if (!data.message || !data.status) {
          showEditProfileResponse('Respuesta del servidor incompleta o inválida', 'error');
          console.error('Invalid response format:', data);
          return;
        }

        // Manejar respuesta del servidor
        showEditProfileResponse(data.message, data.status);

        if (data.status === 'success') {
          // Actualizar datos en la página
          if (data.user) {
            document.querySelector('.user-name').textContent = `${data.user.nombres} ${data.user.apellidos}`;
            document.querySelector('.user-email').textContent = data.user.email;

            // Actualizar teléfono en la vista
            const phoneElement = document.querySelector("#user-phone .detail-text");
            if (phoneElement) {
                phoneElement.textContent = data.user.telefono && data.user.telefono.trim() !== "" 
                    ? data.user.telefono 
                    : "Sin teléfono";
            }

            // Actualizar ciudad en la vista
            const cityElement = document.querySelector("#user-city .detail-text");
            if (cityElement) {
                cityElement.textContent = data.user.ciudad && data.user.ciudad.trim() !== "" 
                    ? data.user.ciudad 
                    : "Sin ciudad";
            }

            // Actualizar imagen si fue subida
            if (data.user.foto_perfil && data.user.foto_perfil.trim() !== "") {
              const imagePath = "../" + data.user.foto_perfil;
              const avatarImage = document.getElementById('avatarImage');
              const modalAvatarImage = document.getElementById('modalAvatarImage');
              
              // Mostrar imagen y ocultar placeholders
              avatarImage.src = imagePath;
              avatarImage.style.display = "block";
              modalAvatarImage.src = imagePath;
              modalAvatarImage.style.display = "block";
              
              const mainPlaceholder = document.querySelector('.avatar .avatar-placeholder');
              const modalPlaceholder = document.querySelector('.avatar-edit .avatar-placeholder');
              if (mainPlaceholder) mainPlaceholder.style.display = "none";
              if (modalPlaceholder) modalPlaceholder.style.display = "none";
              
              console.log("✓ Imagen actualizada:", imagePath);
              
              // Aplicar colores dinámicos a ambos avatares
              if (window.avatarColorExtractor) {
                avatarImage.onload = () => {
                  const mainAvatar = document.querySelector('.avatar');
                  if (mainAvatar) {
                    window.avatarColorExtractor.applyToAvatar(mainAvatar, avatarImage);
                  }
                };
                modalAvatarImage.onload = () => {
                  const modalAvatar = document.querySelector('.avatar-edit');
                  if (modalAvatar) {
                    window.avatarColorExtractor.applyToAvatar(modalAvatar, modalAvatarImage);
                  }
                };
              }
            }

            // Actualizar localStorage con nueva información
            const userStorageData = JSON.parse(localStorage.getItem('user') || '{}');
            userStorageData.nombres = data.user.nombres;
            userStorageData.apellidos = data.user.apellidos;
            userStorageData.email = data.user.email;
            localStorage.setItem('user', JSON.stringify(userStorageData));
          }

          // Limpiar input de archivo
          if (modalAvatarInput) {
            modalAvatarInput.value = '';
          }

          // Cerrar modal después de 1.5 segundos
          setTimeout(() => {
            closeEditProfileModal();
          }, 1500);
        }
      } catch (error) {
        showEditProfileResponse('Error al procesar la respuesta del servidor: ' + error.message, 'error');
        console.error('JSON Parse Error:', error, 'Response:', xhr.responseText);
      }
    }
  };

  xhr.onerror = function() {
    showEditProfileResponse('Error de conexión con el servidor', 'error');
  };

  xhr.send(formData);
}

/**
 * Valida el formato del email
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Muestra el mensaje de respuesta usando Toast notifications
 */
function showEditProfileResponse(message, status) {
  // Usar el sistema de Toast si está disponible
  if (window.Toast) {
    if (status === 'success') {
      Toast.success(message);
    } else if (status === 'warning') {
      Toast.warning(message);
    } else {
      Toast.error(message);
    }
  } else {
    // Fallback: crear elemento de respuesta si no existe
    let responseElement = document.getElementById('edit-profile-response');
    
    if (!responseElement) {
      responseElement = document.createElement('div');
      responseElement.id = 'edit-profile-response';
      const modalBody = document.querySelector('.modal-body');
      if (modalBody) {
        modalBody.insertBefore(responseElement, modalBody.firstChild);
      }
    }

    // Actualizar mensaje y clase
    responseElement.textContent = message;
    responseElement.className = status;
    responseElement.style.display = 'block';

    // Auto-ocultar mensaje después de 4 segundos si es error, 3 si es success
    const hideDelay = status === 'success' ? 3000 : 4000;
    setTimeout(() => {
      responseElement.style.display = 'none';
    }, hideDelay);
  }
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

/**
 * Configura los event listeners para la edición de perfil
 */
function setupEditProfileEventListeners() {
  // Botón para abrir modal
  const editProfileBtn = document.getElementById('edit-profile-btn');
  if (editProfileBtn) {
    editProfileBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openEditProfileModal();
    });
  }

  // Botón para cerrar modal
  const closeModalBtn = document.getElementById('close-edit-profile');
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeEditProfileModal);
  }

  // Overlay para cerrar modal al hacer clic fuera
  const overlay = document.getElementById('edit-profile-overlay');
  if (overlay) {
    overlay.addEventListener('click', closeEditProfileModal);
  }

  // Formulario de edición de perfil
  const profileForm = document.querySelector('.profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', handleEditProfile);
  }

  // Botón cancelar del formulario
  const cancelBtn = profileForm?.querySelector('.btn-secondary');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closeEditProfileModal();
    });
  }

  // Configurar listeners para la imagen en el modal
  setupModalImageUploadListeners();
}

/**
 * Configura los listeners para la edición de imagen en el modal
 */
function setupModalImageUploadListeners() {
  const avatarEditContainer = document.getElementById('modalAvatarContainer');
  const avatarInput = document.getElementById('modalAvatarInput');
  
  if (!avatarEditContainer || !avatarInput) {
    console.warn("⚠️ Avatar modal elements not found");
    return;
  }
  
  // Click en el contenedor de avatar abre el selector de archivo
  avatarEditContainer.addEventListener('click', (e) => {
    e.stopPropagation();
    avatarInput.click();
  });

  // Cambio de archivo muestra preview
  avatarInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de imagen
      const allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowed_types.includes(file.type)) {
        showEditProfileResponse('Tipo de imagen no permitido. Use JPEG, PNG, GIF o WEBP', 'error');
        avatarInput.value = '';
        return;
      }
      
      // Validar tamaño
      if (file.size > 5 * 1024 * 1024) {
        showEditProfileResponse('La imagen es muy grande. Máximo 5MB', 'error');
        avatarInput.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const modalAvatarImage = document.getElementById('modalAvatarImage');
        if (modalAvatarImage) {
          modalAvatarImage.src = event.target.result;
          modalAvatarImage.style.display = "block";
          
          // Ocultar placeholder SVG
          const modalPlaceholder = document.querySelector('.avatar-edit .avatar-placeholder');
          if (modalPlaceholder) modalPlaceholder.style.display = "none";
          
          console.log("✓ Preview de imagen cargado en modal");
          
          // Aplicar colores dinámicos al nuevo preview
          if (window.avatarColorExtractor) {
            modalAvatarImage.onload = () => {
              const modalAvatar = document.querySelector('.avatar-edit');
              if (modalAvatar) {
                window.avatarColorExtractor.applyToAvatar(modalAvatar, modalAvatarImage);
              }
            };
          }
        }
      };
      reader.onerror = () => {
        showEditProfileResponse('Error al leer la imagen', 'error');
      };
      reader.readAsDataURL(file);
    }
  });
}

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupEditProfileEventListeners);
} else {
  setupEditProfileEventListeners();
}
