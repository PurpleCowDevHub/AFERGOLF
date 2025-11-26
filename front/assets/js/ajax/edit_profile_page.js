/**
 * ===========================================================
 * AFERGOLF – Edit Profile Page (Edición de imagen + datos)
 * ===========================================================
 */

document.addEventListener("DOMContentLoaded", () => {
    const isLogged = localStorage.getItem("afergolf_logged");
    const userId = localStorage.getItem("afergolf_user_id");

    // Si NO está logueado → redirigir
    if (!isLogged || !userId) {
        alert("Debes iniciar sesión para editar tu perfil");
        window.location.href = "log_in.html";
        return;
    }

    // Cargar datos del usuario
    const url = `http://localhost/AFERGOLF/back/modules/users/api/my_account.php?id=${userId}`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            if (data.status !== "success") {
                alert("Error cargando tu perfil");
                return;
            }

            const user = data.user;

            // Cargar datos en los campos
            document.querySelector(".user-name").textContent = `${user.nombres} ${user.apellidos}`;
            document.querySelector(".user-email").textContent = user.email;

            document.getElementById("firstName").value = user.nombres;
            document.getElementById("lastName").value = user.apellidos;
            document.getElementById("email").value = user.email;
            if (user.telefono) document.getElementById("phone").value = user.telefono;
            if (user.ciudad) document.getElementById("city").value = user.ciudad;

            // Cargar imagen de perfil si existe
            if (user.foto_perfil && user.foto_perfil.trim() !== "") {
                const avatarImage = document.getElementById("avatarImage");
                const imagePath = "../" + user.foto_perfil;
                avatarImage.src = imagePath;
            }
        })
        .catch(err => {
            console.error("Error:", err);
            alert("Error de conexión al cargar tus datos");
        });

    // Manejo del formulario de edición
    const form = document.getElementById("editProfileForm");
    if (form) {
        form.addEventListener("submit", handleEditProfilePage);
    }

    // Manejar edición de imagen
    setupImageUploadListeners();
});

/**
 * Configura los listeners para la edición de imagen
 */
function setupImageUploadListeners() {
    const avatarContainer = document.getElementById('avatarContainer');
    const avatarInput = document.getElementById('avatarInput');
    
    if (!avatarContainer || !avatarInput) {
        console.warn("⚠️ Avatar elements not found");
        return;
    }
    
    // Click en el contenedor de avatar abre el selector de archivo
    avatarContainer.addEventListener('click', (e) => {
        e.stopPropagation();
        avatarInput.click();
    });

    // Cambio de archivo muestra preview
    avatarInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validar tipo de imagen
            const allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowed_types.includes(file.type)) {
                showResponse('Tipo de imagen no permitido. Use JPEG, PNG, GIF o WEBP', 'error');
                avatarInput.value = '';
                return;
            }
            
            // Validar tamaño
            if (file.size > 5 * 1024 * 1024) {
                showResponse('La imagen es muy grande. Máximo 5MB', 'error');
                avatarInput.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const avatarImage = document.getElementById('avatarImage');
                if (avatarImage) {
                    avatarImage.src = event.target.result;
                    console.log("✓ Preview de imagen cargado");
                }
            };
            reader.onerror = () => {
                showResponse('Error al leer la imagen', 'error');
            };
            reader.readAsDataURL(file);
        }
    });
}

/**
 * Maneja el envío del formulario de edición de perfil
 */
function handleEditProfilePage(e) {
    e.preventDefault();

    // Capturar datos del formulario
    const nombres = document.getElementById("firstName").value.trim();
    const apellidos = document.getElementById("lastName").value.trim();
    const email = document.getElementById("email").value.trim();
    const telefono = document.getElementById("phone").value.trim();
    const ciudad = document.getElementById("city").value.trim();

    // Validar campos requeridos
    if (!nombres || !apellidos || !email) {
        showResponse("Por favor completa los campos requeridos (Nombre, Apellidos, Correo)", "error");
        return;
    }

    // Validar formato de email
    if (!isValidEmail(email)) {
        showResponse("Por favor ingresa un correo válido", "error");
        return;
    }

    // Obtener ID del usuario desde localStorage
    const userId = localStorage.getItem("afergolf_user_id");
    if (!userId) {
        showResponse("Error: No se encontró el ID del usuario", "error");
        return;
    }

    // Crear FormData CON DATOS DE TEXTO Y POSIBLE IMAGEN
    const formData = new FormData();
    formData.append("id", userId);
    formData.append("nombres", nombres);
    formData.append("apellidos", apellidos);
    formData.append("email", email);
    formData.append("telefono", telefono);
    formData.append("ciudad", ciudad);

    // Agregar imagen si existe
    const avatarInput = document.getElementById("avatarInput");
    if (avatarInput && avatarInput.files.length > 0) {
        const file = avatarInput.files[0];
        
        // Validar tipo de archivo
        const allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowed_types.includes(file.type)) {
            showResponse('Tipo de imagen no permitido. Use JPEG, PNG, GIF o WEBP', 'error');
            return;
        }
        
        // Validar tamaño (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showResponse('La imagen es muy grande. Máximo 5MB', 'error');
            return;
        }
        
        formData.append('profileImage', file);
        console.log("✓ Imagen incluida en formulario:", file.name);
    } else {
        console.log("ℹ️ Sin imagen nueva en este envío");
    }

    // Enviar al servidor
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost/AFERGOLF/back/modules/users/api/edit_profile.php", true);

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            try {
                if (xhr.status < 200 || xhr.status >= 300) {
                    showResponse(`Error del servidor (${xhr.status}): ${xhr.statusText}`, "error");
                    console.error("❌ Server error:", xhr.status, xhr.statusText);
                    return;
                }

                if (!xhr.responseText) {
                    showResponse("El servidor no devolvió una respuesta válida", "error");
                    console.error("❌ Empty response");
                    return;
                }

                const data = JSON.parse(xhr.responseText);
                console.log("✓ Respuesta del servidor:", data);

                showResponse(data.message, data.status);

                if (data.status === "success") {
                    // Actualizar datos en la página
                    if (data.user) {
                        document.querySelector(".user-name").textContent = 
                            `${data.user.nombres} ${data.user.apellidos}`;
                        document.querySelector(".user-email").textContent = data.user.email;

                        // Actualizar imagen si fue subida
                        if (data.user.foto_perfil && data.user.foto_perfil.trim() !== "") {
                            const imagePath = "../" + data.user.foto_perfil;
                            document.getElementById('avatarImage').src = imagePath;
                            console.log("✓ Imagen actualizada en la página:", imagePath);
                        }

                        // Limpiar input de archivo
                        if (avatarInput) {
                            avatarInput.value = '';
                        }
                    }

                    // Redirigir después de 1.5 segundos
                    setTimeout(() => {
                        console.log("→ Redirigiendo a my_account.html");
                        window.location.href = "my_account.html";
                    }, 1500);
                }
            } catch (error) {
                showResponse("Error al procesar la respuesta: " + error.message, "error");
                console.error("❌ Parse error:", error);
            }
        }
    };

    xhr.onerror = function() {
        showResponse("Error de conexión con el servidor", "error");
        console.error("❌ Connection error");
    };

    xhr.send(formData);
}

/**
 * Valida el formato del email
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Muestra mensajes de respuesta
 */
function showResponse(message, status) {
    const responseElement = document.getElementById("edit-profile-response");
    
    if (!responseElement) {
        console.warn("⚠️ Response element not found");
        return;
    }

    responseElement.textContent = message;
    responseElement.className = status;
    responseElement.style.display = "block";
    
    console.log(`[${status.toUpperCase()}] ${message}`);

    // Auto-ocultar
    const hideDelay = status === "success" ? 3000 : 4000;
    setTimeout(() => {
        responseElement.style.display = "none";
    }, hideDelay);
}

