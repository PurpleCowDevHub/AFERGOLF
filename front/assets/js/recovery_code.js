document.addEventListener("DOMContentLoaded", () => {
  const inputs = document.querySelectorAll(".code-box");
  const form = document.getElementById("codeForm");

  inputs.forEach((input, index) => {
    input.addEventListener("input", (e) => {
      const value = e.target.value.replace(/\D/g, ""); // Solo números
      e.target.value = value;

      if (value && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }

      // Si se completan los 6, resalta el botón
      if ([...inputs].every(i => i.value.trim() !== "")) {
        form.querySelector(".btn-primary").classList.add("active");
      } else {
        form.querySelector(".btn-primary").classList.remove("active");
      }
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !input.value && index > 0) {
        inputs[index - 1].focus();
      }
    });
  });

  // Enviar formulario
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const code = [...inputs].map(i => i.value).join("");
    console.log("Código ingresado:", code);
    alert(`Código ingresado: ${code || "incompleto"}`);
  });
});