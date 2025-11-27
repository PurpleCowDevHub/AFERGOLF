/**
 * ============================================================================
 * AFERGOLF - Página Mi Cuenta
 * ============================================================================
 * 
 * @description   Carga y visualización de datos del usuario autenticado.
 *                Muestra información del perfil y opciones de cuenta.
 * 
 * @file          front/assets/js/pages/my_account.js
 * @author        Afergolf Team
 * @version       1.0.0
 * @since         2025-01-01
 * 
 * ============================================================================
 * ÍNDICE DE CONTENIDO
 * ============================================================================
 * 
 * 1. CONSTANTES
 *    - PROFILE_API_URL: URL del endpoint de perfil
 * 
 * 2. FUNCIONES DE CARGA
 *    - loadUserProfile(): Carga datos del usuario desde el backend
 *    - renderUserData(): Renderiza los datos en la UI
 * 
 * 3. FUNCIONES DE AVATAR
 *    - loadUserAvatar(): Carga y muestra la imagen de perfil
 *    - setDefaultAvatar(): Establece avatar por defecto
 * 
 * 4. INICIALIZACIÓN
 *    - Verificación de sesión
 *    - Carga de datos al iniciar
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
 * URL del endpoint para obtener datos del perfil.
 * @constant {string}
 */
const PROFILE_API_URL = 'http://localhost/AFERGOLF/back/modules/users/api/my_account.php';

// ============================================================================
// 2. FUNCIONES DE CARGA
// ============================================================================

/**
 * Carga los datos del usuario desde el backend.
 */
async function loadUserProfile() {
  const userId = localStorage.getItem('afergolf_user_id');
  
  if (!userId) {
    return;
  }
  
  try {
    const response = await fetch(`${PROFILE_API_URL}?id=${userId}`);
    const data = await response.json();
    
    if (data.status === 'success' && data.user) {
      renderUserData(data.user);
      loadUserAvatar(data.user);
    } else {
      if (window.Toast) {
        Toast.error('Error al cargar los datos del perfil');
      }
    }
  } catch (error) {
    console.error('Error loading profile:', error);
    if (window.Toast) {
      Toast.error('Error de conexión al cargar el perfil');
    }
  }
}

/**
 * Renderiza los datos del usuario en la interfaz.
 * @param {Object} user - Datos del usuario
 */
function renderUserData(user) {
  // Nombre completo
  const userName = document.querySelector('.user-name');
  if (userName) {
    userName.textContent = `${user.nombres} ${user.apellidos}`;
  }
  
  // Email
  const userEmail = document.querySelector('.user-email');
  if (userEmail) {
    userEmail.textContent = user.email;
  }
  
  // Teléfono
  const userPhone = document.querySelector('#user-phone .detail-text');
  if (userPhone) {
    userPhone.textContent = user.telefono && user.telefono.trim() !== '' 
      ? user.telefono 
      : 'Sin teléfono';
  }
  
  // Ciudad
  const userCity = document.querySelector('#user-city .detail-text');
  if (userCity) {
    userCity.textContent = user.ciudad && user.ciudad.trim() !== '' 
      ? user.ciudad 
      : 'Sin ciudad';
  }
  
  // Fecha de registro (si existe)
  const userDate = document.querySelector('#user-date .detail-text');
  if (userDate && user.fecha_registro) {
    userDate.textContent = formatDate(user.fecha_registro);
  }
  
  // Llenar campos del modal de edición si existen
  populateEditForm(user);
}

/**
 * Llena los campos del formulario de edición con los datos actuales.
 * @param {Object} user - Datos del usuario
 */
function populateEditForm(user) {
  const fields = {
    'firstName': user.nombres,
    'lastName': user.apellidos,
    'email': user.email,
    'phone': user.telefono || '',
    'city': user.ciudad || ''
  };
  
  Object.entries(fields).forEach(([id, value]) => {
    const input = document.getElementById(id);
    if (input) {
      input.value = value;
    }
  });
}

// ============================================================================
// 3. FUNCIONES DE AVATAR
// ============================================================================

/**
 * Carga y muestra la imagen de perfil del usuario.
 * @param {Object} user - Datos del usuario
 */
function loadUserAvatar(user) {
  const avatarImage = document.getElementById('avatarImage');
  const avatarPlaceholder = document.querySelector('.avatar .avatar-placeholder');
  const avatarContainer = document.querySelector('.avatar');
  const modalAvatarImage = document.getElementById('modalAvatarImage');
  const modalAvatarPlaceholder = document.querySelector('.avatar-edit .avatar-placeholder');
  const modalAvatarContainer = document.querySelector('.avatar-edit');
  
  if (user.foto_perfil && user.foto_perfil.trim() !== '') {
    const imagePath = '../' + user.foto_perfil;
    
    // Avatar principal
    if (avatarImage) {
      avatarImage.src = imagePath;
      avatarImage.style.display = 'block';
      avatarImage.onerror = () => setDefaultAvatar();
      
      // Aplicar colores dinámicos cuando la imagen cargue
      avatarImage.onload = () => {
        if (avatarPlaceholder) avatarPlaceholder.style.display = 'none';
        if (window.avatarColorExtractor && avatarContainer) {
          window.avatarColorExtractor.applyToAvatar(avatarContainer, avatarImage);
        }
      };
    }
    
    // Avatar del modal
    if (modalAvatarImage) {
      modalAvatarImage.src = imagePath;
      modalAvatarImage.style.display = 'block';
      
      // Aplicar colores dinámicos al modal cuando la imagen cargue
      modalAvatarImage.onload = () => {
        if (modalAvatarPlaceholder) modalAvatarPlaceholder.style.display = 'none';
        if (window.avatarColorExtractor && modalAvatarContainer) {
          window.avatarColorExtractor.applyToAvatar(modalAvatarContainer, modalAvatarImage);
        }
      };
    }
    
  } else {
    setDefaultAvatar();
  }
}

/**
 * Establece el avatar por defecto (placeholder).
 */
function setDefaultAvatar() {
  const avatarImage = document.getElementById('avatarImage');
  const avatarPlaceholder = document.querySelector('.avatar .avatar-placeholder');
  const modalAvatarImage = document.getElementById('modalAvatarImage');
  const modalAvatarPlaceholder = document.querySelector('.avatar-edit .avatar-placeholder');
  
  if (avatarImage) {
    avatarImage.style.display = 'none';
  }
  if (avatarPlaceholder) {
    avatarPlaceholder.style.display = 'flex';
  }
  
  if (modalAvatarImage) {
    modalAvatarImage.style.display = 'none';
  }
  if (modalAvatarPlaceholder) {
    modalAvatarPlaceholder.style.display = 'flex';
  }
}

/**
 * Aplica colores dinámicos al avatar basados en la imagen.
 * Función de utilidad para aplicar desde otros contextos.
 * @param {HTMLImageElement} img - Elemento de imagen del avatar
 * @param {HTMLElement} container - Contenedor del avatar
 */
function applyAvatarColors(img, container) {
  if (!img || !container || !window.avatarColorExtractor) return;
  
  if (img.complete && img.naturalHeight !== 0) {
    window.avatarColorExtractor.applyToAvatar(container, img);
  } else {
    img.onload = () => {
      window.avatarColorExtractor.applyToAvatar(container, img);
    };
  }
}

// ============================================================================
// 4. UTILIDADES
// ============================================================================

/**
 * Formatea una fecha ISO a formato legible.
 * @param {string} isoDate - Fecha en formato ISO
 * @returns {string} Fecha formateada
 */
function formatDate(isoDate) {
  try {
    const date = new Date(isoDate);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return isoDate;
  }
}

// ============================================================================
// 5. INICIALIZACIÓN
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Verificar sesión
  const isLogged = localStorage.getItem('afergolf_logged');
  const userId = localStorage.getItem('afergolf_user_id');
  
  if (!isLogged || !userId) {
    if (window.Toast) {
      Toast.warning('Debes iniciar sesión para ver tu cuenta');
    }
    setTimeout(() => {
      window.location.href = 'log_in.html';
    }, 1000);
    return;
  }
  
  // Cargar datos del usuario
  loadUserProfile();
  
  // Configurar eventos de las option-cards
  setupOptionCards();
});

/**
 * Configura los eventos de las tarjetas de opciones.
 */
function setupOptionCards() {
  // Card de editar perfil
  const editCard = document.getElementById('edit-profile-btn');
  if (editCard) {
    editCard.addEventListener('click', (e) => {
      e.preventDefault();
      // El modal se abre desde components.js o edit_profile.js
      if (typeof openEditProfile === 'function') {
        openEditProfile();
      }
    });
  }
  
  // Card de cambiar contraseña
  const passwordCard = document.querySelector('[href="change_password.html"]');
  if (passwordCard) {
    passwordCard.addEventListener('click', (e) => {
      // Navegación normal, no prevenir default
    });
  }
  
  // Card de historial de compras
  const historyCard = document.querySelector('[href="Purchase_History.html"]');
  if (historyCard) {
    historyCard.addEventListener('click', (e) => {
      // Navegación normal
    });
  }
  
  // NOTA: El logout card se maneja en auth/auth.js para evitar duplicación
}

// ============================================================================
// EXPORTACIÓN
// ============================================================================

if (typeof window !== 'undefined') {
  window.loadUserProfile = loadUserProfile;
  window.renderUserData = renderUserData;
}
