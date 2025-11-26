/**
 * ============================================================================
 * AFERGOLF - Cart Module
 * ============================================================================
 * 
 * Gestión del carrito de compras: agregar, eliminar y modificar productos.
 * Usa el sistema de Toast para notificaciones.
 * 
 * @author Afergolf Team
 * @version 1.0.0
 * ============================================================================
 */

// ============================================================================
// FUNCIONES DEL CARRITO
// ============================================================================

/**
 * Agrega un producto al carrito
 * @param {Object} product - Datos del producto
 */
function addToCart(product) {
  // Obtener carrito actual del localStorage
  let cart = JSON.parse(localStorage.getItem('afergolf_cart') || '[]');
  
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
  
  // Guardar en localStorage
  localStorage.setItem('afergolf_cart', JSON.stringify(cart));
  
  // Actualizar contador del carrito si existe
  updateCartCounter();
}

/**
 * Elimina un producto del carrito
 * @param {string|number} productId - ID del producto a eliminar
 */
function removeFromCart(productId) {
  let cart = JSON.parse(localStorage.getItem('afergolf_cart') || '[]');
  
  const product = cart.find(item => item.id === productId);
  cart = cart.filter(item => item.id !== productId);
  
  localStorage.setItem('afergolf_cart', JSON.stringify(cart));
  
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
 * Actualiza la cantidad de un producto en el carrito
 * @param {string|number} productId - ID del producto
 * @param {number} delta - Cambio en la cantidad (+1 o -1)
 */
function updateCartQuantity(productId, delta) {
  let cart = JSON.parse(localStorage.getItem('afergolf_cart') || '[]');
  
  const index = cart.findIndex(item => item.id === productId);
  
  if (index !== -1) {
    cart[index].quantity += delta;
    
    if (cart[index].quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    localStorage.setItem('afergolf_cart', JSON.stringify(cart));
    updateCartCounter();
    
    if (window.location.pathname.includes('cart.html')) {
      renderCartItems();
    }
  }
}

/**
 * Actualiza el contador del carrito en el header
 */
function updateCartCounter() {
  const cart = JSON.parse(localStorage.getItem('afergolf_cart') || '[]');
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  // Buscar elementos del contador del carrito
  const cartCounters = document.querySelectorAll('.cart-counter, .cart-badge, #cart-count');
  
  cartCounters.forEach(counter => {
    counter.textContent = totalItems;
    counter.style.display = totalItems > 0 ? 'flex' : 'none';
  });
}

/**
 * Renderiza los items del carrito en la página del carrito
 */
function renderCartItems() {
  const cartContainer = document.querySelector('.products');
  if (!cartContainer) return;
  
  const cart = JSON.parse(localStorage.getItem('afergolf_cart') || '[]');
  
  if (cart.length === 0) {
    cartContainer.innerHTML = `
      <div class="empty-cart">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        <h3>Tu carrito está vacío</h3>
        <p>Agrega productos desde nuestro catálogo</p>
        <a href="catalog.html" class="btn">Ver catálogo</a>
      </div>
    `;
    return;
  }
  
  // Aquí iría la lógica para renderizar los productos del carrito
  // Por ahora mantenemos el HTML estático
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Actualizar contador al cargar
  updateCartCounter();
  
  // Botones de eliminar en el carrito
  const removeButtons = document.querySelectorAll('.remove');
  removeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const productRow = e.target.closest('.product-row');
      if (productRow) {
        // Obtener nombre del producto para el mensaje
        const productName = productRow.querySelector('h4')?.textContent || 'Producto';
        
        // Animación de eliminación
        productRow.style.opacity = '0';
        productRow.style.transform = 'translateX(-20px)';
        productRow.style.transition = 'all 0.3s ease';
        
        setTimeout(() => {
          productRow.remove();
          if (window.Toast) {
            Toast.info(`"${productName}" eliminado del carrito`);
          }
          // Actualizar totales
          updateCartTotals();
        }, 300);
      }
    });
  });
  
  // Botones de cantidad
  const minusButtons = document.querySelectorAll('.btn-qty.minus');
  const plusButtons = document.querySelectorAll('.btn-qty.plus');
  
  minusButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const qtySpan = e.target.closest('.qty').querySelector('.qval');
      let qty = parseInt(qtySpan.textContent);
      if (qty > 1) {
        qtySpan.textContent = qty - 1;
        updateCartTotals();
      }
    });
  });
  
  plusButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const qtySpan = e.target.closest('.qty').querySelector('.qval');
      let qty = parseInt(qtySpan.textContent);
      qtySpan.textContent = qty + 1;
      updateCartTotals();
      if (window.Toast) {
        Toast.success('Cantidad actualizada', { duration: 2000 });
      }
    });
  });
  
  // Botón de agregar al carrito en detalles de producto
  const addToCartBtn = document.querySelector('.btn-cart');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      const productName = document.querySelector('.product-title')?.textContent || 'Producto';
      const productPrice = document.querySelector('.product-price')?.textContent || '$0';
      
      if (window.Toast) {
        Toast.success(`"${productName}" agregado al carrito`);
      }
      
      // Aquí iría la lógica real de agregar al carrito
    });
  }
});

/**
 * Actualiza los totales del carrito
 */
function updateCartTotals() {
  // Calcular subtotal de productos
  const productRows = document.querySelectorAll('.product-row');
  let subtotal = 0;
  let productCount = 0;
  
  productRows.forEach(row => {
    const checkbox = row.querySelector('input[type="checkbox"]');
    if (checkbox && checkbox.checked) {
      const priceText = row.querySelector('.product-price')?.textContent || '$0';
      const qty = parseInt(row.querySelector('.qval')?.textContent || '1');
      const price = parseInt(priceText.replace(/[^\d]/g, ''));
      subtotal += price * qty;
      productCount += qty;
    }
  });
  
  // Actualizar UI del resumen
  const summaryTable = document.querySelector('.summary table');
  if (summaryTable) {
    const rows = summaryTable.querySelectorAll('tr');
    if (rows[0]) {
      rows[0].querySelector('td').textContent = `Productos (${productCount})`;
      rows[0].querySelector('.right').textContent = formatPrice(subtotal);
    }
    
    const shipping = 20000; // Costo fijo de envío
    const total = subtotal + shipping;
    
    if (rows[2]) {
      rows[2].querySelector('.right').textContent = formatPrice(total);
    }
  }
}

/**
 * Formatea un número como precio en COP
 * @param {number} amount - Monto a formatear
 * @returns {string} Precio formateado
 */
function formatPrice(amount) {
  return '$' + amount.toLocaleString('es-CO');
}
