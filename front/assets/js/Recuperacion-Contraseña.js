document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("recoveryForm");
  const input = document.querySelector(".recovery-input");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const value = input.value.trim();

    if (!value) {
      alert("Por favor, ingrese su correo o número de teléfono.");
      input.focus();
      return;
    }

    // Simulación de envío de código
    console.log("Solicitud de recuperación enviada para:", value);
    alert(`Se ha enviado un código a ${value}.`);
    
    // Aquí puedes redirigir a la página del código:
    // window.location.href = "Codigo-Recuperacion.html";
  });
});