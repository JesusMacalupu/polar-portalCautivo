document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.querySelector(".login__form");

    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        const fullName = document.getElementById("full-name").value.trim();
        const birthdate = document.getElementById("birthdate").value;
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();

        if (fullName === "" || birthdate === "" || email === "" || phone === "") {
            showErrorMessage("Por favor, completa todos los campos.");
            return;
        }

        if (!isValidEmail(email)) {
            showErrorMessage("Por favor ingresa un correo válido (se permiten letras, números, ñ y caracteres especiales básicos).");
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    nombre: fullName, 
                    fecha_nacimiento: birthdate,
                    correo: email, 
                    telefono: phone 
                }),
            });

            const result = await response.json();
            if (result.success) {
                showSuccessMessage("📡 Conexión WI-FI Establecida.");
            } else {
                showErrorMessage(result.message || "⚠️ Credenciales incorrectas.");
            }
        } catch (error) {
            showErrorMessage("❌ Error en la conexión con el servidor");
        }
    });

    function isValidEmail(email) {
        const re = /^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ._%+-]+@[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ.-]+\.[a-zA-Z]{2,}$/;
        return re.test(String(email).toLowerCase());
    }
});

function showSuccessMessage(message) {
    const successMessage = document.getElementById("successMessage");
    // Limpiar contenido previo
    successMessage.innerHTML = '';
    // Crear elemento de texto
    const textNode = document.createTextNode(message);
    // Crear botón de cierre
    const closeBtn = document.createElement('img');
    closeBtn.src = "./img/cancelar.png";
    closeBtn.className = "close-btn";
    closeBtn.onclick = closeSuccessMessage;
    closeBtn.alt = "Cerrar";
    // Agregar elementos al contenedor
    successMessage.appendChild(textNode);
    successMessage.appendChild(closeBtn);
    // Mostrar mensaje
    successMessage.style.display = "flex";
}

function closeSuccessMessage() {
    document.getElementById("successMessage").style.display = "none";
    window.location.href = "https://www.google.com"; 
}

function showErrorMessage(message) {
    const errorMessage = document.getElementById("errorMessage");
    // Limpiar contenido previo
    errorMessage.innerHTML = '';
    // Crear elemento de texto
    const textNode = document.createTextNode(message);
    // Crear botón de cierre
    const closeBtn = document.createElement('img');
    closeBtn.src = "./img/cancelar.png";
    closeBtn.className = "close-btn";
    closeBtn.onclick = closeErrorMessage;
    closeBtn.alt = "Cerrar";
    // Agregar elementos al contenedor
    errorMessage.appendChild(textNode);
    errorMessage.appendChild(closeBtn);
    errorMessage.style.display = "flex";
}

function closeErrorMessage() {
    document.getElementById("errorMessage").style.display = "none";
    restoreLoginForm();
}

function restoreLoginForm() {
    const loginForm = document.querySelector(".login__form");
    loginForm.innerHTML = `
        <form class="login__form" id="loginForm">
            <center>
                <h1 class="login__title"><span>MATRICIANO</span></h1>
                <img src="./img/fondo_circulo_logo.png" alt="Logo" class="logo-polar">
                <h1 class="login__title"><span>Bienvenido</span> de nuevo</h1>
                <p class="login__description">Por favor, inicia sesión para continuar.</p>
            </center><br>
            <div class="login__inputs">
                <div>
                    <label for="full-name" class="login__label">Nombres y Apellidos</label>
                    <input class="login__input" type="text" id="full-name" placeholder="Ingresa tus nombres y apellidos" required />
                </div>
                <div>
                    <label for="birthdate" class="login__label">Fecha de Nacimiento</label>
                    <input class="login__input" type="date" id="birthdate" required />
                </div>
                <div>
                    <label for="email" class="login__label">Correo</label>
                    <input class="login__input" type="text" id="email" placeholder="Ingresa tu correo electrónico" required pattern="[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ@._-]+" title="Por favor ingresa un correo válido (se permiten letras, números, ñ y caracteres especiales básicos)"/>
                </div>
                <div>
                    <label for="phone" class="login__label">Teléfono</label>
                    <input class="login__input" type="tel" id="phone" placeholder="Ingresa tu número de teléfono" required maxlength="9" />
                </div>
            </div>
            <div class="login__buttons">
                <button type="submit" class="login__button">Iniciar Sesión</button>
            </div>
        </form>
    `;
}