/**
 * session_control.js
 * Control de sesión para el header - Manejo de logout y acceso al perfil
 * Extraído de header.html para mantener el código organizado
 */

document.addEventListener("DOMContentLoaded", () => {

  // Botón de cerrar sesión
  const logoutBtn = document.querySelector(".logout-link");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();

      // Limpia toda la sesión
      localStorage.removeItem("afergolf_logged");
      localStorage.removeItem("afergolf_user_id");
      localStorage.removeItem("afergolf_user_email");

      // Redirigir al login
      window.location.href = "/front/views/log_in.html";
    });
  }

  // Control de acceso a perfil - requiere sesión
  const profileBtns = document.querySelectorAll("a[href*='my_account.html']");

  profileBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      const isLogged = localStorage.getItem("afergolf_logged");
      const userId = localStorage.getItem("afergolf_user_id");

      if (!isLogged || !userId) {
        e.preventDefault();
        if (window.Toast) {
          Toast.warning("Debes iniciar sesión primero");
        } else {
          alert("Debes iniciar sesión primero");
        }
      }
    });
  });

});
