/**
 * ============================================================================
 * AFERGOLF - Utilities & Helpers Module
 * ============================================================================
 * 
 * Funciones auxiliares reutilizables: validaciones, formateo y utilidades.
 * 
 * @author Afergolf Team
 * @version 1.0.0
 * ============================================================================
 */

// ============================================================================
// FORMATEO DE DATOS
// ============================================================================

/**
 * Formatea un precio en pesos colombianos.
 * @param {number} price - Precio a formatear
 * @returns {string} Precio formateado
 */
function formatPrice(price) {
  return `$${price.toLocaleString('es-CO')} COP`;
}

/**
 * Capitaliza la primera letra de un string.
 * @param {string} str - String a capitalizar
 * @returns {string} String capitalizado
 */
function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Formatea una fecha a formato local.
 * @param {Date|string} date - Fecha a formatear
 * @returns {string} Fecha formateada
 */
function formatDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Formatea un número de teléfono.
 * @param {string} phone - Número de teléfono
 * @returns {string} Teléfono formateado
 */
function formatPhone(phone) {
  // Eliminar caracteres no numéricos
  const cleaned = phone.replace(/\D/g, '');
  // Formatear (XXX) XXX-XXXX
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

// ============================================================================
// VALIDACIONES
// ============================================================================

/**
 * Valida un email.
 * @param {string} email - Email a validar
 * @returns {boolean} True si es válido
 */
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Valida un número de teléfono colombiano.
 * @param {string} phone - Teléfono a validar
 * @returns {boolean} True si es válido
 */
function isValidPhone(phone) {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10;
}

/**
 * Valida una contraseña (mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número).
 * @param {string} password - Contraseña a validar
 * @returns {boolean} True si es válida
 */
function isValidPassword(password) {
  if (password.length < 8) return false;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return hasUpperCase && hasLowerCase && hasNumber;
}

/**
 * Valida que un string no esté vacío.
 * @param {string} str - String a validar
 * @returns {boolean} True si no está vacío
 */
function isNotEmpty(str) {
  return str && str.trim().length > 0;
}

/**
 * Valida un número positivo.
 * @param {number} num - Número a validar
 * @returns {boolean} True si es positivo
 */
function isPositiveNumber(num) {
  return !isNaN(num) && num > 0;
}

// ============================================================================
// UTILIDADES DE TEXTO
// ============================================================================

/**
 * Trunca un texto a una longitud específica.
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @returns {string} Texto truncado
 */
function truncateText(text, maxLength = 100) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Elimina espacios extra de un texto.
 * @param {string} text - Texto a limpiar
 * @returns {string} Texto limpio
 */
function cleanText(text) {
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Convierte un string a slug (URL-friendly).
 * @param {string} text - Texto a convertir
 * @returns {string} Slug
 */
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// ============================================================================
// UTILIDADES DE ARRAYS
// ============================================================================

/**
 * Elimina elementos duplicados de un array.
 * @param {Array} array - Array con duplicados
 * @returns {Array} Array sin duplicados
 */
function removeDuplicates(array) {
  return [...new Set(array)];
}

/**
 * Ordena un array de objetos por una propiedad.
 * @param {Array} array - Array a ordenar
 * @param {string} property - Propiedad por la que ordenar
 * @param {string} order - 'asc' o 'desc'
 * @returns {Array} Array ordenado
 */
function sortByProperty(array, property, order = 'asc') {
  return array.sort((a, b) => {
    if (order === 'asc') {
      return a[property] > b[property] ? 1 : -1;
    } else {
      return a[property] < b[property] ? 1 : -1;
    }
  });
}

/**
 * Agrupa un array de objetos por una propiedad.
 * @param {Array} array - Array a agrupar
 * @param {string} property - Propiedad por la que agrupar
 * @returns {Object} Objeto con arrays agrupados
 */
function groupBy(array, property) {
  return array.reduce((groups, item) => {
    const key = item[property];
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {});
}

// ============================================================================
// UTILIDADES DE OBJETOS
// ============================================================================

/**
 * Clona profundamente un objeto.
 * @param {Object} obj - Objeto a clonar
 * @returns {Object} Objeto clonado
 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Verifica si un objeto está vacío.
 * @param {Object} obj - Objeto a verificar
 * @returns {boolean} True si está vacío
 */
function isEmptyObject(obj) {
  return Object.keys(obj).length === 0;
}

// ============================================================================
// UTILIDADES DE ALMACENAMIENTO LOCAL
// ============================================================================

/**
 * Guarda un valor en localStorage.
 * @param {string} key - Clave
 * @param {any} value - Valor a guardar
 */
function setLocalStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error al guardar en localStorage:', error);
  }
}

/**
 * Obtiene un valor de localStorage.
 * @param {string} key - Clave
 * @returns {any} Valor almacenado o null
 */
function getLocalStorage(key) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Error al obtener de localStorage:', error);
    return null;
  }
}

/**
 * Elimina un valor de localStorage.
 * @param {string} key - Clave
 */
function removeLocalStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error al eliminar de localStorage:', error);
  }
}

/**
 * Limpia todo el localStorage.
 */
function clearLocalStorage() {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Error al limpiar localStorage:', error);
  }
}

// ============================================================================
// UTILIDADES DE RUTAS
// ============================================================================

/**
 * Obtiene el prefijo base del proyecto (e.g. '/AFERGOLF/' en XAMPP o '/' en Live Server).
 * @returns {string} Prefijo base
 */
function getBasePrefix() {
  const parts = (window.location.pathname || '/').split('/').filter(Boolean);
  return parts.length ? `/${parts[0]}/` : '/';
}

/**
 * Calcula la ruta relativa correcta a un archivo partial.
 * @param {string} filename - Nombre del archivo
 * @returns {string} Ruta relativa
 */
function getRelativePath(filename) {
  const path = window.location.pathname;
  // Si estamos en /front/views/, subir un nivel
  if (path.includes('/front/views/')) {
    return `../partials/${filename}`;
  }
  // Si estamos en la raíz o en /front/
  return `front/partials/${filename}`;
}

/**
 * Reescribe URLs absolutas que empiezan por "/" a la base del proyecto.
 * @param {string} html - HTML con URLs a reescribir
 * @returns {string} HTML con URLs reescritas
 */
function rewriteAbsoluteUrls(html) {
  const base = getBasePrefix();
  return html
    .replace(/(href\s*=\s*")\/(?!\/)/g, `$1${base}`)
    .replace(/(src\s*=\s*")\/(?!\/)/g, `$1${base}`);
}

// ============================================================================
// UTILIDADES DE TIEMPO
// ============================================================================

/**
 * Espera un tiempo determinado (delay).
 * @param {number} ms - Milisegundos a esperar
 * @returns {Promise} Promise que se resuelve después del delay
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Debounce: ejecuta una función después de un tiempo de inactividad.
 * @param {Function} func - Función a ejecutar
 * @param {number} wait - Tiempo de espera en ms
 * @returns {Function} Función debounced
 */
function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle: limita la ejecución de una función a una vez cada X tiempo.
 * @param {Function} func - Función a ejecutar
 * @param {number} limit - Tiempo mínimo entre ejecuciones en ms
 * @returns {Function} Función throttled
 */
function throttle(func, limit = 300) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// ============================================================================
// UTILIDADES DEL DOM
// ============================================================================

/**
 * Selecciona un elemento del DOM de forma segura.
 * @param {string} selector - Selector CSS
 * @returns {Element|null} Elemento o null
 */
function $(selector) {
  return document.querySelector(selector);
}

/**
 * Selecciona múltiples elementos del DOM de forma segura.
 * @param {string} selector - Selector CSS
 * @returns {NodeList} Lista de elementos
 */
function $$(selector) {
  return document.querySelectorAll(selector);
}

/**
 * Crea un elemento HTML.
 * @param {string} tag - Tag del elemento
 * @param {Object} attributes - Atributos del elemento
 * @param {string} content - Contenido del elemento
 * @returns {Element} Elemento creado
 */
function createElement(tag, attributes = {}, content = '') {
  const element = document.createElement(tag);
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'class') {
      element.className = value;
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(element.style, value);
    } else {
      element.setAttribute(key, value);
    }
  });
  if (content) {
    element.innerHTML = content;
  }
  return element;
}

// ============================================================================
// EXPORTACIÓN GLOBAL
// ============================================================================

// Hacer las funciones disponibles globalmente
if (typeof window !== 'undefined') {
  // Exponer funciones individuales más usadas
  window.formatPrice = formatPrice;
  window.capitalizeFirst = capitalizeFirst;
  window.formatDate = formatDate;
  window.formatPhone = formatPhone;
  window.isValidEmail = isValidEmail;
  window.isValidPhone = isValidPhone;
  window.isValidPassword = isValidPassword;
  window.isNotEmpty = isNotEmpty;
  window.isPositiveNumber = isPositiveNumber;
  
  // Exponer colección completa de helpers
  window.AfergolfHelpers = {
    formatPrice,
    capitalizeFirst,
    formatDate,
    formatPhone,
    isValidEmail,
    isValidPhone,
    isValidPassword,
    isNotEmpty,
    isPositiveNumber,
    truncateText,
    cleanText,
    slugify,
    removeDuplicates,
    sortByProperty,
    groupBy,
    deepClone,
    isEmptyObject,
    setLocalStorage,
    getLocalStorage,
    removeLocalStorage,
    clearLocalStorage,
    getBasePrefix,
    getRelativePath,
    rewriteAbsoluteUrls,
    delay,
    debounce,
    throttle,
    $,
    $$,
    createElement
  };
}
