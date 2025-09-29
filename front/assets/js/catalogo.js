// Selección de tallas
document.querySelectorAll('.tallas button').forEach(btn => {
  btn.addEventListener('click', () => {
    // desactivar todas las tallas en este producto
    const grupo = btn.closest('.tallas').querySelectorAll('button');
    grupo.forEach(b => b.classList.remove('active'));

    // activar la talla seleccionada
    btn.classList.add('active');
  });
});