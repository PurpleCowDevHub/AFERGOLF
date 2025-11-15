/**
 * ===========================================================
 * AFERGOLF – Cargar información real del usuario
 * ===========================================================
 */

document.addEventListener("DOMContentLoaded", () => {
    const isLogged = localStorage.getItem("afergolf_logged");
    const userId = localStorage.getItem("afergolf_user_id");

    // Si NO está logueado → redirigir
    if (!isLogged || !userId) {
        alert("Debes iniciar sesión para ver tu perfil");
        window.location.href = "log_in.html";
        return;
    }

    // URL del endpoint
    const url = `http://localhost/AFERGOLF/back/modules/users/api/my_account.php?id=${userId}`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            if (data.status !== "success") {
                alert("Error cargando tu perfil");
                return;
            }

            const user = data.user;

            // PINTAR DATOS REALES EN LA PÁGINA
            document.querySelector(".user-name").textContent =
                `${user.nombres} ${user.apellidos}`;

            document.querySelector(".user-email").textContent = user.email;

            // Campos del formulario del modal
            document.getElementById("firstName").value = user.nombres;
            document.getElementById("lastName").value = user.apellidos;
            document.getElementById("email").value = user.email;

            if (user.telefono) document.getElementById("phone").value = user.telefono;
            if (user.ciudad) document.getElementById("city").value = user.ciudad;
        })
        .catch(err => {
            console.error("Error:", err);
            alert("Error de conexión al cargar tus datos");
        });
});
