/**
 * ============================================================================
 * AFERGOLF - Configuración para PRODUCCIÓN (InfinityFree)
 * ============================================================================
 * 
 * ⚠️ IMPORTANTE: Sube este archivo al servidor como "config.js"
 *    (renómbralo de config_produccion.js a config.js)
 * ============================================================================
 */

// Configuración fija para PRODUCCIÓN
const IS_PRODUCTION = true;

const AFERGOLF_CONFIG = (function() {
  
  // Configuración para PRODUCCIÓN (InfinityFree)
  const config = {
    BASE_URL: 'http://afergolf.rf.gd',
    API_BASE: 'http://afergolf.rf.gd/back/modules',
    UPLOADS_PATH: '/uploads',
    BASE_PREFIX: '/'
  };
  
  // URLs de las APIs
  const API_URLS = {
    // Usuarios
    LOGIN: `${config.API_BASE}/users/api/log_in.php`,
    REGISTER: `${config.API_BASE}/users/api/register.php`,
    PROFILE: `${config.API_BASE}/users/api/my_account.php`,
    EDIT_PROFILE: `${config.API_BASE}/users/api/edit_profile.php`,
    CHANGE_PASSWORD: `${config.API_BASE}/users/api/change_password.php`,
    RECOVER_PASSWORD: `${config.API_BASE}/users/api/recover_password.php`,
    
    // Productos (Admin)
    CREATE_PRODUCT: `${config.API_BASE}/products/api/admin/create_product.php`,
    READ_PRODUCTS: `${config.API_BASE}/products/api/admin/read_products.php`,
    UPDATE_PRODUCT: `${config.API_BASE}/products/api/admin/update_product.php`,
    DELETE_PRODUCT: `${config.API_BASE}/products/api/admin/delete_product.php`,
    
    // Catálogo público
    CATALOG: `${config.API_BASE}/products/api/catalog.php`
  };
  
  return {
    ...config,
    API: API_URLS,
    isLocal: false,
    isProd: true
  };
  
})();

window.AFERGOLF_CONFIG = AFERGOLF_CONFIG;

function getApiUrl(apiName) {
  return AFERGOLF_CONFIG.API[apiName] || '';
}

function normalizeImagePath(imagePath) {
  if (!imagePath) return '';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  // Limpiar prefijo /AFERGOLF/ que viene de la BD
  if (imagePath.includes('/AFERGOLF/')) {
    imagePath = imagePath.replace('/AFERGOLF/', '/');
  }
  if (!imagePath.startsWith('/')) {
    imagePath = '/' + imagePath;
  }
  return imagePath;
}

window.getApiUrl = getApiUrl;
window.normalizeImagePath = normalizeImagePath;

console.log('AFERGOLF Config: PRODUCCION');
