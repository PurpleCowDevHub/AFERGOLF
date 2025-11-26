/**
 * ======================================================
 *  Control de sesión para los botones del HEADER
 * ======================================================
 */

document.addEventListener("DOMContentLoaded", () => {

    const btns = document.querySelectorAll("a[href='/front/views/my_account.html']");

    btns.forEach(btn => {
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
                setTimeout(() => {
                    window.location.href = "/front/views/log_in.html";
                }, 1500);
            }
        });
    });

});
