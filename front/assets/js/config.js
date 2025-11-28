/**
 * ============================================================================
 * AFERGOLF - Configuración Global (Auto-detecta entorno)
 * ============================================================================
 */

const AFERGOLF_CONFIG = (function() {
  
  // Auto-detectar entorno
  const hostname = window.location.hostname;
  const isLocal = (hostname === 'localhost' || hostname === '127.0.0.1');
  
  // Configuración para LOCAL (XAMPP) - con prefijo /AFERGOLF
  const LOCAL_CONFIG = {
    BASE_URL: '/AFERGOLF',
    API_BASE: '/AFERGOLF/back/modules',
    UPLOADS_PATH: '/AFERGOLF/uploads',
    BASE_PREFIX: '/AFERGOLF/'
  };
  
  // Configuración para PRODUCCIÓN - rutas relativas sin dominio
  const PROD_CONFIG = {
    BASE_URL: '',
    API_BASE: '/back/modules',
    UPLOADS_PATH: '/uploads',
    BASE_PREFIX: '/'
  };
  
  // Seleccionar configuración según el entorno detectado
  const config = isLocal ? LOCAL_CONFIG : PROD_CONFIG;
  
  // URLs de las APIs
  const API_URLS = {
    LOGIN: `${config.API_BASE}/users/api/log_in.php`,
    REGISTER: `${config.API_BASE}/users/api/register.php`,
    PROFILE: `${config.API_BASE}/users/api/my_account.php`,
    EDIT_PROFILE: `${config.API_BASE}/users/api/edit_profile.php`,
    CHANGE_PASSWORD: `${config.API_BASE}/users/api/change_password.php`,
    RECOVER_PASSWORD: `${config.API_BASE}/users/api/recover_password.php`,
    CREATE_PRODUCT: `${config.API_BASE}/products/api/admin/create_product.php`,
    READ_PRODUCTS: `${config.API_BASE}/products/api/admin/read_products.php`,
    UPDATE_PRODUCT: `${config.API_BASE}/products/api/admin/update_product.php`,
    DELETE_PRODUCT: `${config.API_BASE}/products/api/admin/delete_product.php`,
    CATALOG: `${config.API_BASE}/products/api/catalog.php`
  };
  
  return {
    ...config,
    API: API_URLS,
    isLocal: isLocal,
    isProd: !isLocal
  };
  
})();

window.AFERGOLF_CONFIG = AFERGOLF_CONFIG;

function getApiUrl(apiName) {
  return AFERGOLF_CONFIG.API[apiName] || '';
}

function normalizeImagePath(imagePath) {
  if (!imagePath) return '';
  
  // Si ya es una URL completa, devolverla tal cual
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // En producción, quitar el prefijo /AFERGOLF/ si existe
  if (AFERGOLF_CONFIG.isProd && imagePath.includes('/AFERGOLF/')) {
    imagePath = imagePath.replace('/AFERGOLF/', '/');
  }
  
  // Asegurar que empiece con /
  if (!imagePath.startsWith('/')) {
    imagePath = '/' + imagePath;
  }
  
  // Construir URL completa con BASE_URL
  return AFERGOLF_CONFIG.BASE_URL + imagePath.replace(AFERGOLF_CONFIG.BASE_PREFIX.slice(0, -1), '');
}

window.getApiUrl = getApiUrl;
window.normalizeImagePath = normalizeImagePath;

console.log('AFERGOLF:', AFERGOLF_CONFIG.isLocal ? 'LOCAL' : 'PROD', '| Base:', AFERGOLF_CONFIG.BASE_PREFIX);
