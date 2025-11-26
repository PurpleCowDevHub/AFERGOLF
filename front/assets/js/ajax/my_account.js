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

            // Mostrar teléfono si existe
            const phoneElement = document.querySelector("#user-phone .detail-text");
            if (phoneElement) {
                phoneElement.textContent = user.telefono && user.telefono.trim() !== "" 
                    ? user.telefono 
                    : "Sin teléfono";
            }

            // Mostrar ciudad si existe
            const cityElement = document.querySelector("#user-city .detail-text");
            if (cityElement) {
                cityElement.textContent = user.ciudad && user.ciudad.trim() !== "" 
                    ? user.ciudad 
                    : "Sin ciudad";
            }

            // Campos del formulario del modal
            document.getElementById("firstName").value = user.nombres;
            document.getElementById("lastName").value = user.apellidos;
            document.getElementById("email").value = user.email;

            if (user.telefono) document.getElementById("phone").value = user.telefono;
            if (user.ciudad) document.getElementById("city").value = user.ciudad;

            // Cargar imagen de perfil si existe
            if (user.foto_perfil && user.foto_perfil.trim() !== "") {
                const avatarImage = document.getElementById("avatarImage");
                const modalAvatarImage = document.getElementById("modalAvatarImage");
                const imagePath = "../" + user.foto_perfil;
                
                // Cargar en el header de la página
                if (avatarImage) {
                    avatarImage.src = imagePath;
                    avatarImage.style.display = "block";
                    
                    // Ocultar el placeholder SVG
                    const mainPlaceholder = document.querySelector('.avatar .avatar-placeholder');
                    if (mainPlaceholder) mainPlaceholder.style.display = "none";
                    
                    // Aplicar colores dinámicos al avatar cuando cargue la imagen
                    avatarImage.addEventListener('load', () => {
                        if (window.avatarColorExtractor) {
                            const mainAvatar = document.querySelector('.avatar');
                            if (mainAvatar) {
                                window.avatarColorExtractor.applyToAvatar(mainAvatar, avatarImage);
                            }
                        }
                    });
                }
                
                // Cargar en el modal también
                if (modalAvatarImage) {
                    modalAvatarImage.src = imagePath;
                    modalAvatarImage.style.display = "block";
                    
                    // Ocultar el placeholder SVG del modal
                    const modalPlaceholder = document.querySelector('.avatar-edit .avatar-placeholder');
                    if (modalPlaceholder) modalPlaceholder.style.display = "none";
                    
                    // Aplicar colores dinámicos al avatar del modal
                    modalAvatarImage.addEventListener('load', () => {
                        if (window.avatarColorExtractor) {
                            const modalAvatar = document.querySelector('.avatar-edit');
                            if (modalAvatar) {
                                window.avatarColorExtractor.applyToAvatar(modalAvatar, modalAvatarImage);
                            }
                        }
                    });
                }
                
                console.log("✓ Imagen de perfil cargada:", imagePath);
            }
        })
        .catch(err => {
            console.error("Error:", err);
            alert("Error de conexión al cargar tus datos");
        });
});
