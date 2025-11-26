/**
 * ============================================================================
 * AFERGOLF - Página de Carrito de Compras
 * ============================================================================
 * 
 * @description   Gestión del carrito de compras: agregar, eliminar y modificar
 *                productos. Usa localStorage para persistencia y Toast para
 *                notificaciones.
 * 
 * @file          front/assets/js/pages/cart.js
 * @author        Afergolf Team
 * @version       1.0.0
 * @since         2025-01-01
 * 
 * ============================================================================
 * ÍNDICE DE CONTENIDO
 * ============================================================================
 * 
 * 1. CONSTANTES
 *    - STORAGE_KEY: Clave de localStorage para el carrito
 * 
 * 2. FUNCIONES DEL CARRITO
 *    - getCart(): Obtiene el carrito actual
 *    - saveCart(): Guarda el carrito en localStorage
 *    - addToCart(): Agrega un producto al carrito
 *    - removeFromCart(): Elimina un producto del carrito
 *    - updateCartQuantity(): Actualiza cantidad de un producto
 *    - clearCart(): Vacía el carrito completo
 * 
 * 3. FUNCIONES DE UI
 *    - updateCartCounter(): Actualiza el contador en el header
 *    - renderCartItems(): Renderiza los productos en la página
 *    - updateCartTotals(): Actualiza los totales del resumen
 *    - formatPrice(): Formatea precios en COP
 * 
 * 4. EVENT LISTENERS
 *    - Botones de eliminar producto
 *    - Botones de cantidad (+/-)
 *    - Botón de agregar al carrito (product_details)
 * 
 * ============================================================================
 * USO
 * ============================================================================
 * 
 * // Agregar producto al carrito
 * addToCart({
 *   id: 'AFG-P001',
 *   name: 'Driver TaylorMade',
 *   price: 1500000,
 *   image: 'uploads/products/AFG-P001/main.jpg'
 * });
 * 
 * // Obtener carrito
 * const cart = getCart();
 * 
 * // Actualizar contador
 * updateCartCounter();
 * 
 * ============================================================================
 */

// ============================================================================
// 1. CONSTANTES
// ============================================================================

/**
 * Clave de localStorage para almacenar el carrito
 * @constant {string}
 */
const CART_STORAGE_KEY = 'afergolf_cart';

// ============================================================================
// 2. FUNCIONES DEL CARRITO
// ============================================================================

/**
 * Obtiene el carrito actual desde localStorage.
 * @returns {Array} Array de productos en el carrito
 */
function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
  } catch (error) {
    console.error('Error parsing cart:', error);
    return [];
  }
}

/**
 * Guarda el carrito en localStorage.
 * @param {Array} cart - Array de productos a guardar
 */
function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

/**
 * Agrega un producto al carrito.
 * Si el producto ya existe, incrementa la cantidad.
 * @param {Object} product - Datos del producto a agregar
 * @param {string} product.id - ID único del producto
 * @param {string} product.name - Nombre del producto
 * @param {number} product.price - Precio del producto
 * @param {string} [product.image] - URL de la imagen
 */
function addToCart(product) {
  let cart = getCart();
  
  // Verificar si el producto ya está en el carrito
  const existingIndex = cart.findIndex(item => item.id === product.id);
  
  if (existingIndex !== -1) {
    // Incrementar cantidad
    cart[existingIndex].quantity += 1;
    if (window.Toast) {
      Toast.success(`Se agregó otra unidad de "${product.name}" al carrito`);
    }
  } else {
    // Agregar nuevo producto
    cart.push({
      ...product,
      quantity: 1
    });
    if (window.Toast) {
      Toast.success(`"${product.name}" agregado al carrito`);
    }
  }
  
  saveCart(cart);
  updateCartCounter();
}

/**
 * Elimina un producto del carrito.
 * @param {string|number} productId - ID del producto a eliminar
 */
function removeFromCart(productId) {
  let cart = getCart();
  
  const product = cart.find(item => item.id === productId);
  cart = cart.filter(item => item.id !== productId);
  
  saveCart(cart);
  
  if (window.Toast && product) {
    Toast.info(`"${product.name}" eliminado del carrito`);
  }
  
  updateCartCounter();
  
  // Recargar la página si estamos en el carrito
  if (window.location.pathname.includes('cart.html')) {
    renderCartItems();
  }
}

/**
 * Actualiza la cantidad de un producto en el carrito.
 * @param {string|number} productId - ID del producto
 * @param {number} delta - Cambio en la cantidad (+1 o -1)
 */
function updateCartQuantity(productId, delta) {
  let cart = getCart();
  
  const index = cart.findIndex(item => item.id === productId);
  
  if (index !== -1) {
    cart[index].quantity += delta;
    
    if (cart[index].quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    saveCart(cart);
    updateCartCounter();
    
    if (window.location.pathname.includes('cart.html')) {
      renderCartItems();
    }
  }
}

/**
 * Vacía completamente el carrito.
 */
function clearCart() {
  localStorage.removeItem(CART_STORAGE_KEY);
  updateCartCounter();
  
  if (window.Toast) {
    Toast.info('Carrito vaciado');
  }
  
  if (window.location.pathname.includes('cart.html')) {
    renderCartItems();
  }
}

/**
 * Calcula el total del carrito.
 * @returns {number} Total en pesos
 */
function getCartTotal() {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

/**
 * Obtiene el número total de items en el carrito.
 * @returns {number} Cantidad total de productos
 */
function getCartItemCount() {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

// ============================================================================
// 3. FUNCIONES DE UI
// ============================================================================

/**
 * Actualiza el contador del carrito en el header.
 */
function updateCartCounter() {
  const totalItems = getCartItemCount();
  
  // Buscar elementos del contador del carrito
  const cartCounters = document.querySelectorAll('.cart-counter, .cart-badge, #cart-count');
  
  cartCounters.forEach(counter => {
    counter.textContent = totalItems;
    counter.style.display = totalItems > 0 ? 'flex' : 'none';
  });
}

/**
 * Renderiza los items del carrito en la página del carrito.
 */
function renderCartItems() {
  const cartContainer = document.querySelector('.products');
  if (!cartContainer) return;
  
  const cart = getCart();
  
  if (cart.length === 0) {
    // Ocultar el resumen y términos cuando el carrito está vacío
    const summary = document.querySelector('.summary');
    const terms = document.querySelector('.terms');
    if (summary) summary.style.display = 'none';
    if (terms) terms.style.display = 'none';
    
    // Agregar clase para centrar el estado vacío
    const cartingSection = document.querySelector('.carting');
    if (cartingSection) cartingSection.classList.add('cart-is-empty');
    
    // Reemplazar el contenedor de productos con el estado vacío directamente
    cartContainer.outerHTML = `
      <div class="cart-empty-state">
        <div class="cart-empty-state-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <div class="cart-empty-state-badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
        </div>
        <h3 class="cart-empty-state-title">Tu carrito está vacío</h3>
        <p class="cart-empty-state-description">Parece que aún no has agregado productos. ¡Explora nuestro catálogo y encuentra lo que necesitas!</p>
        <div class="cart-empty-state-actions">
          <a href="catalog.html" class="btn-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            Ver catálogo
          </a>
        </div>
      </div>
    `;
    return;
  }
  
  // Mostrar el resumen y términos cuando hay productos
  const summary = document.querySelector('.summary');
  const terms = document.querySelector('.terms');
  if (summary) summary.style.display = 'block';
  if (terms) terms.style.display = 'block';
  
  // Generar header + productos con la estructura original
  const headerHTML = `
    <div class="product-top">
      <input type="checkbox" id="select-all" checked>
      <span>Productos de Afergolf</span>
    </div>
  `;
  
  // Renderizar cada producto con la estructura original completa
  const productsHTML = cart.map(item => `
    <div class="product-row" data-product-id="${item.id}">
      <input type="checkbox" checked>

      <img
        src="${item.image || '../assets/img/placeholder-product.jpg'}"
        alt="${item.name}"
        class="pimg"
        loading="lazy"
      >

      <div class="product-info">
        <h4>${item.name}</h4>
        <button class="remove" type="button" onclick="removeFromCart('${item.id}')">Eliminar</button>

        <div class="qty" aria-label="Cantidad">
          <button type="button" class="btn-qty minus" aria-label="Disminuir" onclick="updateCartQuantity('${item.id}', -1)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
          <span class="qval" aria-live="polite">${item.quantity}</span>
          <button type="button" class="btn-qty plus" aria-label="Aumentar" onclick="updateCartQuantity('${item.id}', 1)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>

      <div class="product-price">${formatPrice(item.price)}</div>
    </div>
  `).join('');
  
  cartContainer.innerHTML = headerHTML + productsHTML;
  
  updateCartTotals();
}

/**
 * Actualiza los totales del carrito en el resumen.
 */
function updateCartTotals() {
  const cart = getCart();
  let subtotal = 0;
  let productCount = 0;
  
  cart.forEach(item => {
    subtotal += item.price * item.quantity;
    productCount += item.quantity;
  });
  
  // Actualizar UI del resumen
  const summaryTable = document.querySelector('.summary table');
  if (summaryTable) {
    const rows = summaryTable.querySelectorAll('tr');
    if (rows[0]) {
      const productText = rows[0].querySelector('td');
      const priceText = rows[0].querySelector('.right');
      if (productText) productText.textContent = `Productos (${productCount})`;
      if (priceText) priceText.textContent = formatPrice(subtotal);
    }
    
    const shipping = 20000; // Costo fijo de envío
    const total = subtotal + shipping;
    
    if (rows[2]) {
      const totalText = rows[2].querySelector('.right');
      if (totalText) totalText.textContent = formatPrice(total);
    }
  }
}

/**
 * Formatea un número como precio en COP.
 * @param {number} amount - Monto a formatear
 * @returns {string} Precio formateado
 */
function formatPrice(amount) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(amount);
}

// ============================================================================
// 4. EVENT LISTENERS
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Actualizar contador al cargar
  updateCartCounter();
  
  // Si estamos en la página del carrito, renderizar items
  if (window.location.pathname.includes('cart.html')) {
    renderCartItems();
  }
  
  // Botones de eliminar en el carrito (para HTML estático)
  const removeButtons = document.querySelectorAll('.remove');
  removeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const productRow = e.target.closest('.product-row');
      if (productRow) {
        const productId = productRow.dataset.productId;
        if (productId) {
          removeFromCart(productId);
        } else {
          // Animación de eliminación para HTML estático
          const productName = productRow.querySelector('h4')?.textContent || 'Producto';
          
          productRow.style.opacity = '0';
          productRow.style.transform = 'translateX(-20px)';
          productRow.style.transition = 'all 0.3s ease';
          
          setTimeout(() => {
            productRow.remove();
            if (window.Toast) {
              Toast.info(`"${productName}" eliminado del carrito`);
            }
            updateCartTotals();
          }, 300);
        }
      }
    });
  });
  
  // Botones de cantidad (para HTML estático)
  const minusButtons = document.querySelectorAll('.btn-qty.minus');
  const plusButtons = document.querySelectorAll('.btn-qty.plus');
  
  minusButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const productRow = e.target.closest('.product-row');
      const productId = productRow?.dataset.productId;
      
      if (productId) {
        updateCartQuantity(productId, -1);
      } else {
        // Para HTML estático
        const qtySpan = e.target.closest('.qty').querySelector('.qval');
        let qty = parseInt(qtySpan.textContent);
        if (qty > 1) {
          qtySpan.textContent = qty - 1;
          updateCartTotals();
        }
      }
    });
  });
  
  plusButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const productRow = e.target.closest('.product-row');
      const productId = productRow?.dataset.productId;
      
      if (productId) {
        updateCartQuantity(productId, 1);
      } else {
        // Para HTML estático
        const qtySpan = e.target.closest('.qty').querySelector('.qval');
        let qty = parseInt(qtySpan.textContent);
        qtySpan.textContent = qty + 1;
        updateCartTotals();
        if (window.Toast) {
          Toast.success('Cantidad actualizada', { duration: 2000 });
        }
      }
    });
  });
  
  // Botón de agregar al carrito en detalles de producto
  const addToCartBtn = document.querySelector('.btn-cart');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      const productName = document.querySelector('.product-title')?.textContent || 'Producto';
      const priceText = document.querySelector('.product-price')?.textContent || '$0';
      const productImage = document.querySelector('.product-gallery img')?.src;
      const productId = window.currentProductId || 'temp-' + Date.now();
      
      const price = parseInt(priceText.replace(/[^\d]/g, ''));
      
      addToCart({
        id: productId,
        name: productName,
        price: price,
        image: productImage
      });
    });
  }
});

// ============================================================================
// EXPORTACIÓN
// ============================================================================

// Exponer funciones globalmente
if (typeof window !== 'undefined') {
  window.addToCart = addToCart;
  window.removeFromCart = removeFromCart;
  window.updateCartQuantity = updateCartQuantity;
  window.clearCart = clearCart;
  window.getCart = getCart;
  window.getCartTotal = getCartTotal;
  window.getCartItemCount = getCartItemCount;
  window.updateCartCounter = updateCartCounter;
}
