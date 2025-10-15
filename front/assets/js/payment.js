document.addEventListener('DOMContentLoaded', () => {
  const tarjetaInput = document.getElementById('tarjeta');
  const expInput = document.getElementById('exp');
  const cvvInput = document.getElementById('cvv');

  // Formatear número de tarjeta
  tarjetaInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    e.target.value = value;
  });

  // Formatear fecha de expiración
  expInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    e.target.value = value;
  });

  // Validar CVV
  cvvInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 3);
  });
});