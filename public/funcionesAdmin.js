// Mostrar y ocultar contraseña
const showHiddenPassword = (inputPassword, inputIcon) => {
    const input = document.getElementById(inputPassword),
          iconEye = document.getElementById(inputIcon);
  
    iconEye.addEventListener('click', () => {
        if (input.type === 'password') {
            input.type = 'text';
            iconEye.classList.add('ri-eye-line');
            iconEye.classList.remove('ri-eye-off-line');
        } else {
            input.type = 'password';
            iconEye.classList.remove('ri-eye-line');
            iconEye.classList.add('ri-eye-off-line');
        }
    });
};

showHiddenPassword('password', 'input-icon');

// Evento para iniciar sesión (login)
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('name-admin').value.trim();
    const correo = document.getElementById('email').value.trim();
    const contraseña = document.getElementById('password').value.trim();

    if (!nombre || !correo || !contraseña) {
        alert('Por favor, completa todos los campos.');
        return;
    }

    const response = await fetch('/loginAdmin', {  
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, correo, contraseña })
    });

    const data = await response.json();
    if (data.success) {
        // Guardar el nombre del administrador en el almacenamiento local
        localStorage.setItem('adminName', nombre);
        // Mostrar mensaje de éxito
        showSuccessMessage(data.message || "💻 Inicio de Sesión como administrador exitoso.");
        // (El efecto del aro verde se aplicará en adminDashboard.html)
    } else {
        // Mostrar mensaje de error
        showErrorMessage(data.message || "⚠️ Credenciales incorrectas.");
    }
});

// Función para mostrar mensaje de éxito
function showSuccessMessage(message) {
    const successMessage = document.getElementById('successMessage');
    successMessage.firstChild.textContent = message;
    successMessage.style.display = 'flex';
}

// Función para cerrar mensaje de éxito y redirigir al panel de admin
function closeMessageAdmin() {
    document.getElementById('successMessage').style.display = 'none';
    window.location.href = '/adminDashboard.html'; // Redirigir al panel de admin
}

// Función para mostrar mensaje de error
function showErrorMessage(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.firstChild.textContent = message;
    errorMessage.style.display = 'flex';
}

// Función para cerrar mensaje de error y restaurar el formulario
function closeErrorMessage() {
    document.getElementById('errorMessage').style.display = 'none';
    restoreLoginForm();
}

// Función para restaurar el formulario inicial
function restoreLoginForm() {
    const loginForm = document.getElementById('loginForm');
    loginForm.innerHTML = `
              <center>
                  <h1 class="login__title"><span>MATRICIANO</span></h1>
                  <img src="./img/fondo_circulo_logo.png" alt="Logo" class="logo-polar">
                  <h1 class="login__title"><span>Login</span> de administrador</h1>
                  <p class="login__description">Inicia sesión como administrador.</p>
              </center><br>
              <div class="login__inputs"> 
                  <div>
                      <label for="name-admin" class="login__label">Nombres y Apellidos</label>
                      <input class="login__input" type="text" id="name-admin" placeholder="Ingresa tus nombres y apellidos" required />
                  </div>
                  <div>
                      <label for="email" class="login__label">Correo</label>
                      <input class="login__input" type="email" id="email" placeholder="Ingresa tu correo electrónico" required />
                  </div>
                  <div id="passwordContainer">
                    <label for="password" class="login__label">Contraseña</label>
                    <a class="login__forgot" id="forgotLink" href="reestablecerContra.html">¿Olvidaste tu contraseña?</a>
                    <div class="login__box">
                      <input class="login__input" type="password" id="password" placeholder="Ingresa tu contraseña" required />
                      <i class="ri-eye-off-line login__eye" id="input-icon"></i>
                    </div>
                  </div>                  
              </div>
              <div class="login__buttons">
                  <button type="submit" class="login__button">Iniciar Sesión</button>
              </div>
    `;
    // Vuelve a asignar el evento para mostrar/ocultar contraseña
    showHiddenPassword('password', 'input-icon');
}

