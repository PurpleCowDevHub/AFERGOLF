document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.querySelector(".logout-card");

    if (!logoutBtn) return;

    logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();

        // BORRAR TODA LA SESIÓN
        localStorage.removeItem("afergolf_logged");
        localStorage.removeItem("afergolf_user_id");
        localStorage.removeItem("afergolf_user_name");
        localStorage.removeItem("afergolf_user_email");

        // SI TIENES MÁS CAMPOS, AGREGA AQUÍ
        // localStorage.removeItem("afergolf_user_phone");
        // ...

        // Redirigir al login
        window.location.href = "log_in.html";
    });
});
