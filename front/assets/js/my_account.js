/**
 * ============================================================================
 * AFERGOLF - Mi Cuenta (Funcionalidad)
 * ============================================================================
 * 
 * Este archivo contiene la funcionalidad interactiva de la página Mi Cuenta.
 * Gestiona la apertura/cierre del modal de editar perfil con overlay.
 * 
 * Funcionalidades:
 * - Abrir/cerrar modal de editar perfil
 * - Control de overlay y scroll del body
 * - Cierre con tecla ESC
 * - Validación básica de formulario
 * 
 * @author Afergolf Team
 * @version 1.0.0
 */

// ============================================================================
// ELEMENTOS DEL DOM
// ============================================================================

const editProfileOverlay = document.getElementById('edit-profile-overlay');
const editProfileModal = document.getElementById('edit-profile-modal');
const editProfileBtn = document.querySelector('.option-card:first-child'); // Botón "Editar Perfil"
const closeEditBtn = document.getElementById('close-edit-profile');
const cancelEditBtn = document.querySelector('.btn-secondary');

// ============================================================================
// FUNCIONES DEL MODAL
// ============================================================================

/**
 * Abre el modal de editar perfil y muestra el overlay.
 * Previene el scroll del body mientras el modal está abierto.
 */
function openEditProfile() {
  editProfileModal.classList.add('active');
  editProfileOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

/**
 * Cierra el modal de editar perfil y oculta el overlay.
 * Restaura el scroll del body.
 */
function closeEditProfile() {
  editProfileModal.classList.remove('active');
  editProfileOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

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
  if (e.key === 'Escape' && editProfileModal.classList.contains('active')) {
    closeEditProfile();
  }
});

// ============================================================================
// CARGA DE IMAGEN DE AVATAR
// ============================================================================

const avatarContainer = document.getElementById('avatarContainer');
const avatarInput = document.getElementById('avatarInput');
const avatarImage = document.getElementById('avatarImage');

// Permitir clic en el avatar para seleccionar imagen
if (avatarContainer && avatarInput) {
  avatarContainer.addEventListener('click', (e) => {
    e.stopPropagation();
    avatarInput.click();
  });

  // Procesar cambio de imagen
  avatarInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    
    if (file) {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (avatarImage) {
          avatarImage.src = event.target.result;
        }
      };
      
      reader.readAsDataURL(file);
    }
  });
}

// ============================================================================
// VALIDACIÓN DE FORMULARIO
// ============================================================================

const profileForm = document.querySelector('.profile-form');

if (profileForm) {
  profileForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Aquí puedes agregar lógica de validación y envío
    console.log('Formulario de perfil enviado');
    
    // Por ahora, solo cerramos el modal
    closeEditProfile();
  });
}
