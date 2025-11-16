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
            console.log("📥 Respuesta del servidor my_account.php:", data);
            
            if (data.status !== "success") {
                alert("Error cargando tu perfil");
                return;
            }

            const user = data.user;
            console.log("👤 Datos del usuario:", user);

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

            // Cargar imagen de perfil si existe
            if (user.foto_perfil && user.foto_perfil.trim() !== "") {
                const avatarImage = document.getElementById("avatarImage");
                // Construir la ruta correcta desde front/views/my_account.html
                // ../assets/img/profiles/profile_X_Y.jpg
                const imagePath = "../" + user.foto_perfil;
                
                console.log("🖼️  Ruta en BD:", user.foto_perfil);
                console.log("🖼️  Ruta relativa:", imagePath);
                
                avatarImage.onload = () => {
                    console.log("✅ Imagen cargada correctamente:", imagePath);
                };
                
                avatarImage.onerror = () => {
                    console.error("❌ Error al cargar imagen:", imagePath);
                };
                
                avatarImage.src = imagePath;
            } else {
                console.log("⚠️  No hay foto_perfil en BD o está vacía");
            }
        })
        .catch(err => {
            console.error("Error:", err);
            alert("Error de conexión al cargar tus datos");
        });
});
