document.getElementById("passwordForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const newPass = document.getElementById("newPassword").value.trim();
  const confirmPass = document.getElementById("confirmPassword").value.trim();

  if (newPass === "" || confirmPass === "") {
    alert("Por favor, completa ambos campos.");
    return;
  }

  if (newPass !== confirmPass) {
    alert("Las contraseñas no coinciden.");
    return;
  }

  alert("¡Contraseña actualizada correctamente!");
  this.reset();

  // Efecto visual de confirmación
  const btn = document.querySelector(".btn-submit");
  btn.style.backgroundColor = "#008000";
  btn.textContent = "Hecho ✔";
  setTimeout(() => {
    btn.style.backgroundColor = "#c40000";
    btn.textContent = "Vamos";
  }, 1500);
});