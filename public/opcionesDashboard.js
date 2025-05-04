// Alterna sidebar en móviles
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('open');
}

// Resalta sección activa
function setActive(element) {
  const links = document.querySelectorAll('.sidebar a');
  links.forEach(link => link.classList.remove('active'));
  element.classList.add('active');
  const targetId = element.getAttribute('href');
  const targetSection = document.querySelector(targetId);
  document.querySelectorAll('.card, .card-perfiles').forEach(card => card.classList.remove('highlight'));
  targetSection.classList.add('highlight');
  targetSection.scrollIntoView({ behavior: 'smooth' });
  document.getElementById('sidebar').classList.remove('open');
}

// Cerrar sesión
function logout() {
  alert("Acabas de cerrar sesión como administrador");
  window.location.href = 'loginAdmin.html'; 
}

// Muestra formulario según tipo
function mostrarFormulario(tipo) {
  var formContainer = document.getElementById("formularioUsuario");
  if (tipo === 'admin') {
      formContainer.innerHTML = `
          <h2 class="form-title">Crear un nuevo Administrador</h2>
          <div class="campos">
              <div class="campo">
                  <label>Nombres y Apellidos</label>
                  <input type="text" id="adminNombre" placeholder="Ingresa información" required>
              </div>
              <div class="campo">
                  <label>Correo</label>
                  <input type="email" id="adminCorreo" placeholder="Ingresa información" required>
              </div>
              <div class="campo">
                  <label>Contraseña</label>
                  <input type="text" id="adminContraseña" placeholder="Ingresa la contraseña" required>
              </div>
          </div>
          <div class="botones">
              <button class="btn-crear" onclick="crearAdministrador()">Crear Administrador</button>
              <button class="btn-regresar" onclick="ocultarFormulario()">Regresar</button>
          </div>
      `;
  } else {
      formContainer.innerHTML = `
          <h2 class="form-title">Crear un nuevo Usuario</h2>
          <div class="campos">
              <div class="campo">
                  <label>Nombres y Apellidos</label>
                  <input type="text" id="nombre" placeholder="Ingresa información" required>
              </div>
              <div class="campo">
                  <label>Fecha de Nacimiento</label>
                  <input type="date" id="fechaNacimiento" placeholder="Ingresa fecha de nacimiento" required>
              </div>
              <div class="campo">
                  <label>Correo</label>
                  <input type="email" id="correo" placeholder="Ingresa información" required>
              </div>
              <div class="campo">
                  <label>Teléfono</label>
                  <input type="tel" id="telefono" placeholder="Ingresa información" required maxlength="9">
              </div>
          </div>
          <div class="botones">
              <button class="btn-crear" onclick="crearUsuario()">Crear Usuario</button>
              <button class="btn-regresar" onclick="ocultarFormulario()">Regresar</button>
          </div>
      `;
  }
  formContainer.style.display = "block";
}

// Oculta formulario y limpia contenido
function ocultarFormulario() {
  const formContainer = document.getElementById("formularioUsuario");
  formContainer.style.display = "none";
  formContainer.innerHTML = "";
}

// Crea usuario (se envía a /crearUsuario)
function crearUsuario() {
  const nombre = document.getElementById("nombre").value.trim();
  const fechaNacimiento = document.getElementById("fechaNacimiento").value;
  const correo = document.getElementById("correo").value.trim();
  const telefono = document.getElementById("telefono").value.trim();
  
  if (!nombre || !fechaNacimiento || !correo || !telefono) {
      alert("Por favor, rellene todos los campos.");
      return;
  }
  
  fetch("http://localhost:3000/crearUsuario", {
      method: "POST",
      headers: {
          "Content-Type": "application/json"
      },
      body: JSON.stringify({ nombre, fecha_nacimiento: fechaNacimiento, correo, telefono })
  })
  .then(response => response.json())
  .then(data => {
      alert(data.success ? data.message : "Error: " + data.message);
      ocultarFormulario();
  })
  .catch(error => {
      console.error("Error en la creación del usuario:", error);
      alert("Error al conectar con el servidor.");
  });
}

// Crea administrador (se envía a /crearAdmin)
function crearAdministrador() {
  const nombre = document.getElementById("adminNombre").value.trim();
  const correo = document.getElementById("adminCorreo").value.trim();
  const contraseña = document.getElementById("adminContraseña").value.trim();
  
  if (!nombre || !correo || !contraseña) {
      alert("Por favor, rellene todos los campos.");
      return;
  }
  
  fetch("http://localhost:3000/crearAdmin", {
      method: "POST",
      headers: {
          "Content-Type": "application/json"
      },
      body: JSON.stringify({ nombre, correo, contraseña })
  })
  .then(response => response.json())
  .then(data => {
      alert(data.success ? data.message : "Error: " + data.message);
      ocultarFormulario();
  })
  .catch(error => {
      console.error("Error en la creación del administrador:", error);
      alert("Error al conectar con el servidor.");
  });
}

// Función para ver la tabla de usuarios de la base de datos
function verTablaUsuarios() {
  fetch("http://localhost:3000/usuarios")
      .then(response => response.json())
      .then(data => {
          if (data.success) {
              let html = '<table>';
              html += '<thead><tr>';
              if (data.usuarios.length > 0) {
                  Object.keys(data.usuarios[0]).forEach(columna => {
                      html += `<th>${columna}</th>`;
                  });
                  html += '</tr></thead>';
                  html += '<tbody>';
                  data.usuarios.forEach(usuario => {
                      html += '<tr>';
                      Object.values(usuario).forEach(valor => {
                          if (valor instanceof Date || (typeof valor === 'string' && valor.match(/^\d{4}-\d{2}-\d{2}/))) {
                              html += `<td>${new Date(valor).toISOString().split('T')[0]}</td>`;
                          } else {
                              html += `<td>${valor}</td>`;
                          }
                      });
                      html += '</tr>';
                  });
                  html += '</tbody></table>';
              } else {
                  html = "<p>No hay usuarios registrados.</p>";
              }
              document.getElementById("tablaUsuarios").innerHTML = html;
              document.getElementById("tablaUsuarios").style.display = "block";
              document.getElementById("tablaAdministradores").style.display = "none";
          } else {
              document.getElementById("tablaUsuarios").innerHTML = `<p>Error: ${data.message}</p>`;
          }
      })
      .catch(error => {
          console.error("Error al obtener la tabla de usuarios:", error);
          document.getElementById("tablaUsuarios").innerHTML = `<p>Error al conectar con el servidor.</p>`;
      });
}

// Función para ver la tabla de administradores
function verTablaAdmin() {
  fetch("http://localhost:3000/administradores")
      .then(response => response.json())
      .then(data => {
          if (data.success) {
              let html = '<table>';
              html += '<thead><tr>';
              if (data.administradores.length > 0) {
                  Object.keys(data.administradores[0]).forEach(columna => {
                      html += `<th>${columna}</th>`;
                  });
                  html += '</tr></thead>';
                  html += '<tbody>';
                  data.administradores.forEach(admin => {
                      html += '<tr>';
                      Object.values(admin).forEach(valor => {
                          html += `<td>${valor}</td>`;
                      });
                      html += '</tr>';
                  });
                  html += '</tbody></table>';
              } else {
                  html = "<p>No hay administradores registrados.</p>";
              }
              document.getElementById("tablaAdministradores").innerHTML = html;
              document.getElementById("tablaAdministradores").style.display = "block";
              document.getElementById("tablaUsuarios").style.display = "none";
          } else {
              document.getElementById("tablaAdministradores").innerHTML = `<p>Error: ${data.message}</p>`;
          }
      })
      .catch(error => {
          console.error("Error al obtener la tabla de administradores:", error);
          document.getElementById("tablaAdministradores").innerHTML = `<p>Error al conectar con el servidor.</p>`;
      });
}

/******************** CAMBIO DE CREDENCIALES EN USUARIO DASHBOARD ************************/

function cambioUsuarios() {
  document.getElementById("divUsuario").style.display = "block";
  document.getElementById("divAdmin").style.display = "none";
}

function cerrarDivUsuario() {
  document.getElementById("divUsuario").style.display = "none";
}

// Función para buscar usuario
async function buscarUsuario() {
  const userId = document.getElementById("userId").value;
  try {
      const response = await fetch(`/usuario/${userId}`);
      const data = await response.json();
      if (data.success) {
          document.getElementById("nombreUsuario").value = data.usuario.nombre;
          document.getElementById("fechaNacimientoUsuario").value = data.usuario.fecha_nacimiento.split('T')[0];
          document.getElementById("correoUsuario").value = data.usuario.correo;
          document.getElementById("telefonoUsuario").value = data.usuario.telefono;
      } else {
          alert(data.message);
      }
  } catch (error) {
      console.error('❌ Error al buscar usuario:', error);
      alert('Error al buscar usuario.');
  }
}

// Función para editar usuario
function editarUsuario() {
  document.getElementById("nombreUsuario").removeAttribute("readonly");
  document.getElementById("fechaNacimientoUsuario").removeAttribute("readonly");
  document.getElementById("correoUsuario").removeAttribute("readonly");
  document.getElementById("telefonoUsuario").removeAttribute("readonly");
}

// Función para actualizar usuario
async function actualizarUsuario() {
  const userId = document.getElementById("userId").value;
  const nombre = document.getElementById("nombreUsuario").value;
  const fechaNacimiento = document.getElementById("fechaNacimientoUsuario").value;
  const correo = document.getElementById("correoUsuario").value;
  const telefono = document.getElementById("telefonoUsuario").value;

  try {
      const response = await fetch(`/usuario/${userId}`, {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
              nombre, 
              fecha_nacimiento: fechaNacimiento,
              correo, 
              telefono 
          })
      });
      const data = await response.json();
      if (data.success) {
          alert(data.message);
          document.getElementById("nombreUsuario").setAttribute("readonly", "readonly");
          document.getElementById("fechaNacimientoUsuario").setAttribute("readonly", "readonly");
          document.getElementById("correoUsuario").setAttribute("readonly", "readonly");
          document.getElementById("telefonoUsuario").setAttribute("readonly", "readonly");
      } else {
          alert(data.message);
      }
  } catch (error) {
      console.error('❌ Error al actualizar usuario:', error);
      alert('Error al actualizar usuario.');
  }
}

async function borrarUsuario() {
  const userId = document.getElementById("userId").value;

  try {
      const response = await fetch(`/usuario/${userId}`, {
          method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
          alert(data.message);
          document.getElementById("nombreUsuario").value = '';
          document.getElementById("correoUsuario").value = '';
          document.getElementById("telefonoUsuario").value = '';
          document.getElementById("userId").value = '';
      } else {
          alert(data.message);
      }
  } catch (error) {
      console.error('❌ Error al borrar usuario:', error);
      alert('Error al borrar usuario.');
  }
}

/***************** CAMBIO DE CREDENCIALES EN ADMINISTRADOR DASHBOARD ************************/

function cambioAdmin() {
  document.getElementById("divUsuario").style.display = "none";
  document.getElementById("divAdmin").style.display = "block";
}

// Función para buscar un administrador por ID
async function buscarAdmin() {
  const adminId = document.getElementById("adminId").value;
  try {
      const response = await fetch(`/admin/${adminId}`);
      const data = await response.json();
      if (data.success) {
          document.getElementById("nombreAdmin").value = data.admin.nombre;
          document.getElementById("correoAdmin").value = data.admin.correo;
          document.getElementById("contrasenaAdmin").value = data.admin.contrasena;
      } else {
          alert(data.message);
      }
  } catch (error) {
      console.error('❌ Error al buscar administrador:', error);
      alert('Error al buscar administrador.');
  }
}

function editarAdmin() {
  document.getElementById("nombreAdmin").removeAttribute("readonly");
  document.getElementById("correoAdmin").removeAttribute("readonly");
  document.getElementById("contrasenaAdmin").removeAttribute("readonly");
}

async function actualizarAdmin() {
  const adminId = document.getElementById("adminId").value;
  const nombre = document.getElementById("nombreAdmin").value;
  const correo = document.getElementById("correoAdmin").value;
  const contrasena = document.getElementById("contrasenaAdmin").value;

  try {
      const response = await fetch(`/admin/${adminId}`, {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ nombre, correo, contrasena })
      });
      const data = await response.json();
      if (data.success) {
          alert(data.message);
          document.getElementById("nombreAdmin").setAttribute("readonly", "readonly");
          document.getElementById("correoAdmin").setAttribute("readonly", "readonly");
          document.getElementById("contrasenaAdmin").setAttribute("readonly", "readonly");
      } else {
          alert(data.message);
      }
  } catch (error) {
      console.error('❌ Error al actualizar administrador:', error);
      alert('Error al actualizar administrador.');
  }
}

async function borrarAdmin() {
  const adminId = document.getElementById("adminId").value;

  try {
      const response = await fetch(`/admin/${adminId}`, {
          method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
          alert(data.message);
          document.getElementById("nombreAdmin").value = '';
          document.getElementById("correoAdmin").value = '';
          document.getElementById("contrasenaAdmin").value = '';
          document.getElementById("adminId").value = '';
      } else {
          alert(data.message);
      }
  } catch (error) {
      console.error('❌ Error al borrar administrador:', error);
      alert('Error al borrar administrador.');
  }
}

function cerrarDivAdmin() {
  document.getElementById("divAdmin").style.display = "none";
}

/******** FUNCION DE NOTIFICACIONES DE CAMPANITA ********/ 

document.addEventListener('DOMContentLoaded', function() {
    const bell = document.getElementById('notificationBell');
    const dropdown = document.getElementById('notificationDropdown');
    const notificationCounter = document.querySelector('.notification-counter');
    const notificationScroll = document.querySelector('.notification-scroll');
    
    let notifications = [];
    let unreadCount = 0;
    
    async function loadNotifications() {
        try {
            const adminName = localStorage.getItem('adminName') || 'Administrador';
            const response = await fetch(`/api/notifications?adminName=${encodeURIComponent(adminName)}`);
            
            if (!response.ok) throw new Error('Error al cargar notificaciones');
            
            notifications = await response.json();
            unreadCount = notifications.filter(n => !n.read).length;  // Cambiado para contar solo no leídas
            
            renderNotifications();
            updateCounter();
        } catch (error) {
            console.error('Error:', error);
            loadSampleNotifications();
        }
    }
    
    function renderNotifications() {
        notificationScroll.innerHTML = '';
        
        if (notifications.length === 0) {
            notificationScroll.innerHTML = `
                <div class="no-notifications">
                    No hay notificaciones nuevas
                </div>
            `;
            return;
        }
        
        notifications.forEach(notification => {
            const notificationItem = document.createElement('div');
            notificationItem.className = `notification-item ${notification.type}-notification`;
            notificationItem.dataset.id = notification.id;
            
            notificationItem.innerHTML = `
                <div class="notification-icon">${notification.icon}</div>
                <div class="notification-content">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-time">${notification.time}</div>
                    <div class="notification-preview">${notification.message}</div>
                </div>
                <button class="delete-notification">
                    <img src="./img/cancelar.png" alt="Eliminar">
                </button>
            `;
            
            notificationScroll.appendChild(notificationItem);
        });
        
        document.querySelectorAll('.delete-notification').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                deleteNotification(this.closest('.notification-item'));
            });
        });
    }
    
    function updateCounter() {
        notificationCounter.textContent = unreadCount;
        notificationCounter.style.display = unreadCount > 0 ? 'block' : 'none';
    }
    
    async function deleteNotification(element) {
        const id = element.dataset.id;
        try {
            const adminName = localStorage.getItem('adminName') || 'Administrador';
            await fetch(`/api/notifications/${id}?adminName=${encodeURIComponent(adminName)}`, { 
                method: 'DELETE' 
            });
            element.remove();
            unreadCount--;
            updateCounter();
        } catch (error) {
            console.error('Error:', error);
        }
    }
    
    async function markAllAsRead() {
        try {
            const adminName = localStorage.getItem('adminName') || 'Administrador';
            await fetch(`/api/notifications/mark-all-read?adminName=${encodeURIComponent(adminName)}`, { 
                method: 'POST' 
            });
            unreadCount = 0;
            updateCounter();
            loadNotifications();
        } catch (error) {
            console.error('Error:', error);
        }
    }
    
    function loadSampleNotifications() {
        notifications = [];
        unreadCount = 0;
        renderNotifications();
        updateCounter();
    }
    
    bell.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdown.classList.toggle('show');
    });
    
    document.addEventListener('click', function() {
        dropdown.classList.remove('show');
    });
    
    document.querySelector('.mark-all-read')?.addEventListener('click', function(e) {
        e.preventDefault();
        markAllAsRead();
    });
    
    loadNotifications();
    setInterval(loadNotifications, 300000); // Actualizar cada 5 minutos
}); 

/********************* METRICAS DE RED WIFI ******************************/

// Función para mostrar el div de métricas
function visualizarMetricas() {
    document.getElementById("metricsDiv").style.display = "block";
}

// Función para ocultar el div de métricas y volver al estado original
function regresarMetricas() {
    document.getElementById("metricsDiv").style.display = "none";
}

// Para analizar si es 3G, 4G o 5G
function updateConnectionType() {
    const connectionTypeElement = document.getElementById('connectionType');
    if ('connection' in navigator) {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        const effectiveType = connection.effectiveType.toLowerCase();
        let formattedType;
        if (effectiveType === '3g') {
            formattedType = '3G';
        } else if (effectiveType === '4g') {
            formattedType = '4G';
        } else if (effectiveType === '5g') {
            formattedType = '5G';
        } else {
            formattedType = effectiveType.charAt(0).toUpperCase() + effectiveType.slice(1);
        }
        connectionTypeElement.textContent = formattedType;
        connection.addEventListener('change', () => {
            const newEffectiveType = connection.effectiveType.toLowerCase();
            if (newEffectiveType === '3g') {
                connectionTypeElement.textContent = '3G';
            } else if (newEffectiveType === '4g') {
                connectionTypeElement.textContent = '4G';
            } else if (newEffectiveType === '5g') {
                connectionTypeElement.textContent = '5G';
            } else {
                connectionTypeElement.textContent = newEffectiveType.charAt(0).toUpperCase() + newEffectiveType.slice(1);
            }
        });
    } else {
        connectionTypeElement.textContent = 'No disponible';
    }
}
updateConnectionType();

// Velocidad de descarga del WIFI
function calculateDownloadSpeed() {
    const imageUrl = 'http://localhost:3000/img/admin-wifi.png'; // URL de tu imagen
    const xhr = new XMLHttpRequest();
    const startTime = new Date().getTime();

    xhr.open('GET', imageUrl, true);
    xhr.responseType = 'blob';

    xhr.onload = function() {
        const endTime = new Date().getTime();
        const duration = (endTime - startTime) / 1000; // tiempo en segundos
        const bitsLoaded = xhr.response.size * 8; // tamaño en bits
        const speedBps = bitsLoaded / duration; // velocidad en bits por segundo
        const speedMbps = speedBps / (1024 * 1024); // convertir a megabits por segundo

        document.getElementById('downloadSpeed').textContent = speedMbps.toFixed(2) + ' Mbps';
        document.getElementById('progressBar').style.width = '100%'; // Completar la barra de progreso
    };
    xhr.onerror = function() {
        console.error('Error al medir la velocidad de descarga');
        document.getElementById('downloadSpeed').textContent = 'Error al calcular';
    };
    xhr.onprogress = function(event) {
        if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            document.getElementById('progressBar').style.width = percentComplete + '%'; // Actualizar la barra de progreso
        }
    };
    xhr.send();
}
calculateDownloadSpeed();

// Medir la latencia de la Red WIFI
function measureLatency() {
    const url = 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png'; 
    const startTime = new Date().getTime();

    fetch(url, { method: 'GET', mode: 'no-cors' }) 
        .then(response => {
            const endTime = new Date().getTime();
            const latency = endTime - startTime; // Latencia en milisegundos
            document.getElementById('latency').textContent = latency + ' ms';
            document.querySelector('.progress-bar').style.width = '100%'; // Completar la barra de progreso
        })
        .catch(error => {
            console.error('Error al medir la latencia:', error);
            document.getElementById('latency').textContent = 'Error';
        });
}

setInterval(measureLatency, 5000);
measureLatency();

// Obtener todos los dispositivos conectados en la Red WIFI
async function updateDeviceCount() {
    try {
      const response = await fetch('/api/devices');
      const data = await response.json();
      document.getElementById('devices').innerHTML = data.count + ' <span>conectados</span>';
    } catch (error) {
      console.error('Error al obtener el conteo:', error);
    }
  }
updateDeviceCount();
setInterval(updateDeviceCount, 5000);

// Función para medir el ancho de banda
const ctx = document.getElementById('bandwidthChart').getContext('2d');
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Descarga (Mbps)',
                        borderColor: 'blue',
                        backgroundColor: 'rgba(0, 0, 255, 0.2)',
                        data: []
                    },
                    {
                        label: 'Subida (Mbps)',
                        borderColor: 'red',
                        backgroundColor: 'rgba(255, 0, 0, 0.2)',
                        data: []
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });

        function actualizarGraficos() {
            fetch('/speed')
                .then(response => response.json())
                .then(data => {
                    const now = new Date().toLocaleTimeString();
                    chart.data.labels.push(now);
                    chart.data.datasets[0].data.push(data.download);
                    chart.data.datasets[1].data.push(data.upload);

                    if (chart.data.labels.length > 10) {
                        chart.data.labels.shift();
                        chart.data.datasets[0].data.shift();
                        chart.data.datasets[1].data.shift();
                    }

                    chart.update();
                })
                .catch(error => console.error('Error:', error));
        }

        setInterval(actualizarGraficos, 3000);

// Para visualizar la estabilidad de la conexion

const ctxStability = document.getElementById('stabilityChart').getContext('2d');
const stabilityChart = new Chart(ctxStability, {
    type: 'radar',
    data: {
        labels: ['Latencia (ms)', 'Descarga (Mbps)', 'Subida (Mbps)'],
        datasets: [{
            label: 'Estabilidad de Red',
            data: [0, 0, 0], 
            backgroundColor: 'rgba(0, 128, 255, 0.2)',
            borderColor: 'blue',
            borderWidth: 2
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,  
        scales: {
            r: {
                min: 0,
                suggestedMax: 100, 
                ticks: { 
                    stepSize: 20,   
                    font: { size: 14 } 
                },
                angleLines: { display: true },  
                grid: { circular: true } 
            }
        },
        plugins: {
            legend: { display: true, position: 'top' }  
        }
    }
});

function actualizarDatos() {
    fetch('http://localhost:3000/api/stability')
        .then(response => response.json())
        .then(data => {
            stabilityChart.data.datasets[0].data = [data.latency, data.download, data.upload];
            stabilityChart.update();
        })
        .catch(error => console.error('❌ Error obteniendo datos:', error));
}

setInterval(actualizarDatos, 3000); 

// Grafico de perdida de paquetes

document.addEventListener("DOMContentLoaded", function () {
    const canvas = document.querySelector("#networkChart");
    if (canvas instanceof HTMLCanvasElement) {
        const chartContext = canvas.getContext("2d");

        const packetLossChart = new Chart(chartContext, {
            type: "line",
            data: {
                labels: [], // Tiempo
                datasets: [
                    {
                        label: "Pérdida de Paquetes (%)",
                        data: [],
                        borderColor: "red",
                        backgroundColor: "rgba(255, 0, 0, 0.2)",
                        borderWidth: 2,
                        fill: true,
                    },
                ],
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        min: 0,
                        max: 100,
                        title: { display: true, text: "Pérdida (%)" },
                    },
                    x: {
                        title: { display: true, text: "Tiempo" },
                    },
                },
            },
        });

        function actualizarPacketLoss() {
            fetch("http://localhost:3000/api/packetloss")
                .then((response) => response.json())
                .then((data) => {
                    const now = new Date().toLocaleTimeString();
                    if (packetLossChart.data.labels.length > 10) {
                        packetLossChart.data.labels.shift();
                        packetLossChart.data.datasets[0].data.shift();
                    }
                    packetLossChart.data.labels.push(now);
                    packetLossChart.data.datasets[0].data.push(data.loss);
                    packetLossChart.update();
                })
                .catch((error) => console.error("❌ Error obteniendo datos:", error));
        }

        setInterval(actualizarPacketLoss, 3000);
    } else {
        console.error('❌ No se encontró el elemento <canvas> con id "networkChart"');
    }
});

// Info card de estado de Red
async function loadNetworkInfo() {
    try {
        const networkResponse = await fetch('http://localhost:3000/network-info');
        const networkData = await networkResponse.json();
        const securityLevel = document.getElementById('securityLevel');
        const securityText = document.getElementById('securityText');
        const securityMessage = document.getElementById('securityMessage');

        securityText.textContent = `SSID: ${networkData.ssid}, Seguridad: ${networkData.security}`;

        if (networkData.secure) {
            securityLevel.className = 'security-level high';
            securityMessage.textContent = 'Conexión segura';
        } else {
            securityLevel.className = 'security-level low';
            securityMessage.textContent = 'Conexión insegura';
        }
    } catch (error) {
        console.error('Error al cargar la información de la red:', error);
    }
}

// Info card de seguridad de red

async function checkConnection() {
    try {
        const response = await fetch('http://localhost:3000/check-connection');
        const data = await response.json();
        const statusIndicator = document.getElementById('statusIndicator');
        const statusText = document.getElementById('statusText');
        const statusMessage = document.getElementById('statusMessage');
        if (data.status === 'Conectado') {
            statusIndicator.className = 'status-indicator online';
            statusText.textContent = 'Óptimo';
            statusMessage.textContent = 'La conexión es estable';
        } else if (data.status === 'Desconectado') {
            statusIndicator.className = 'status-indicator offline';
            statusText.textContent = 'Desconectado';
            statusMessage.textContent = 'Sin conexión a Internet';
        } else if (data.status === 'Inestable') {
            statusIndicator.className = 'status-indicator unstable';
            statusText.textContent = 'Internet Inestable';
            statusMessage.textContent = 'Conexión intermitente';
        }
    } catch (error) {
        console.error('Error al verificar la conexión:', error);
    }
}

// Info card para recomendar un canal
async function loadChannelRecommendation() {
    try {
        const response = await fetch('http://localhost:3000/channel-recommendation');
        const data = await response.json();
        const recommendation = document.getElementById('recommendation');
        recommendation.innerHTML = `Canal ${data.recommendedChannel} (5GHz)`;
    } catch (error) {
        console.error('Error al cargar la recomendación de canal:', error);
        document.getElementById('recommendation').innerHTML = 'Error al obtener recomendación';
    }
}

// Cargar la información al cargar la página
window.onload = async () => {
    await Promise.all([
        checkConnection(),
        loadNetworkInfo(),
        loadChannelRecommendation()
    ]);
}; 

/**************** FUNCION DE BUSCAR DISPOSITIVOS DE LOS USUARIOS **************/

// Variables globales
let dispositivosActuales = [];

// Control de la UI
function toggleVista() {
    const listaPerfiles = document.querySelector('.perfil-lista');
    const contenedorDispositivos = document.querySelector('.contenedor-dispositivos');
    
    if (contenedorDispositivos.style.display === 'block') {
        contenedorDispositivos.style.display = 'none';
        listaPerfiles.style.display = 'block';
    } else {
        listaPerfiles.style.display = 'none';
        contenedorDispositivos.style.display = 'block';
        cargarDispositivos();
    }
}

// Carga de datos
async function cargarDispositivos() {
    try {
        const respuesta = await fetch('/api/dispositivosEncontrados');
        const { success, dispositivos, error } = await respuesta.json();
        
        if (!success) throw new Error(error || 'Error desconocido');
        
        dispositivosActuales = dispositivos;
        renderizarTabla(dispositivos);
        configurarBusqueda();
        
    } catch (error) {
        console.error('Error:', error);
        mostrarError(`Error al cargar dispositivos: ${error.message}`);
    }
}

// Renderizado de tabla
function renderizarTabla(dispositivos) {
    const tbody = document.getElementById('device-list');
    tbody.innerHTML = dispositivos.map(dispositivo => `
        <tr>
            <td>${dispositivo.nombre}</td>
            <td>${dispositivo.ip}</td>
            <td>${dispositivo.mac}</td>
            <td>
                <span class="estado ${dispositivo.estado}">
                    ${dispositivo.estado}
                    <i class="fas fa-${dispositivo.estado === 'conectado' ? 'check' : 'times'}"></i>
                </span>
            </td>
        </tr>
    `).join('');
}

// Búsqueda en tiempo real
function configurarBusqueda() {
    const buscar = () => {
        const texto = document.getElementById('search-bar').value.toLowerCase();
        const filas = document.querySelectorAll('#device-list tr');
        
        filas.forEach(fila => {
            const coincide = fila.textContent.toLowerCase().includes(texto);
            fila.style.display = coincide ? '' : 'none';
        });
    };
    
    document.getElementById('search-button').addEventListener('click', buscar);
    document.getElementById('search-bar').addEventListener('input', buscar);
}

// Manejo de errores
function mostrarError(mensaje) {
    document.getElementById('device-list').innerHTML = `
        <tr>
            <td colspan="5" class="error">
                <i class="fas fa-exclamation-triangle"></i> ${mensaje}
            </td>
        </tr>
    `;
}

// Actualización automática
function iniciarActualizacionAutomatica() {
    setInterval(() => {
        if (document.querySelector('.contenedor-dispositivos').style.display === 'block') {
            cargarDispositivos();
        }
    }, 10000);
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.metric-btn').onclick = toggleVista;
    document.querySelector('.btn-regresar').onclick = toggleVista;
    
    document.querySelector('.contenedor-dispositivos').style.display = 'none';
    iniciarActualizacionAutomatica();
});

/***** LIMITE MAXIMO DE USUARIOS ******/ 

// Variables globales (valores iniciales en cero)
let currentUsers = 0;
let maxUsers = 100;
let updateInterval;

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    updateUserStats();
    loadHistory();
    
    // Eliminamos la simulación de actualizaciones en tiempo real
    if (updateInterval) {
        clearInterval(updateInterval);
    }
    
    // Mostrar/ocultar opciones de notificación
    document.getElementById('notificar').addEventListener('change', function() {
        document.getElementById('notifOptions').style.display = this.checked ? 'flex' : 'none';
    });
    
    // Inicializar valores del formulario
    document.getElementById('maxUsuarios').value = maxUsers;
    document.getElementById('maxRange').value = maxUsers;
});

// Funciones principales
function aplicarLimite() {
    const limiteDiv = document.getElementById('limiteMaximoContainer');
    limiteDiv.style.display = 'block';
    updateUserStats();
}

function ocultarLimite() {
    const limiteDiv = document.getElementById('limiteMaximoContainer');
    limiteDiv.style.display = 'none';
    document.getElementById('limiteForm').reset();
    document.getElementById('maxUsuarios').value = maxUsers;
    document.getElementById('maxRange').value = maxUsers;
}

function openTab(tabId) {
    // Ocultar todos los contenidos de pestañas
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Desactivar todos los botones de pestañas
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Mostrar la pestaña seleccionada
    document.getElementById(tabId).classList.add('active');
    
    // Activar el botón de la pestaña seleccionada
    event.currentTarget.classList.add('active');
}

function updateMaxInput() {
    const slider = document.getElementById('maxRange');
    const input = document.getElementById('maxUsuarios');
    input.value = slider.value;
}

function suggestOptimal() {
    // Lógica para sugerir un límite óptimo (ahora siempre sugiere 100)
    const optimal = 100;
    document.getElementById('maxUsuarios').value = optimal;
    document.getElementById('maxRange').value = optimal;
    
    // Mostrar feedback
    alert(`Se ha sugerido un límite de ${optimal} usuarios (valor fijo).`);
}

function updateUserStats() {
    // Actualizar estadísticas con valores fijos
    document.getElementById('currentUsers').textContent = currentUsers;
    document.getElementById('maxAllowed').textContent = maxUsers;
    document.getElementById('liveUserCount').textContent = currentUsers;
    
    // Actualizar barra de uso (siempre 0% porque currentUsers es 0)
    const usagePercent = 0;
    document.getElementById('usageBar').style.width = `${usagePercent}%`;
    document.getElementById('usageText').textContent = `${usagePercent}% de capacidad`;
    
    // Actualizar indicador de estado (siempre verde)
    const indicator = document.getElementById('statusIndicator');
    indicator.className = 'status-dot active';
    
    // Estadísticas fijas en cero
    document.getElementById('peakToday').textContent = 0;
    document.getElementById('avgUsage').textContent = 0;
    
    // Actualizar timestamp
    const now = new Date();
    document.getElementById('lastUpdateTime').textContent = `Actualizado: ${now.toLocaleTimeString()}`;
}

// Eliminamos completamente la función simulateRealTimeUpdates()

function loadHistory() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';
    
    // Historial vacío o con un solo mensaje inicial
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.innerHTML = `
        <div class="history-details">
            <div class="history-action">Sistema inicializado</div>
            <div class="history-user">Por Sistema • <span class="history-time">Justo ahora</span></div>
        </div>
        <div class="history-value">Todos los valores en cero</div>
    `;
    historyList.appendChild(historyItem);
}

function testSettings() {
    // Simular prueba de configuración con valores fijos
    const newLimit = document.getElementById('maxUsuarios').value;
    const priorityMode = document.getElementById('priorityMode').value;
    
    // Mostrar resultados de prueba en modal
    document.getElementById('modalTitle').textContent = 'Resultados de la Prueba';
    document.getElementById('modalMessage').innerHTML = `
        <p>La configuración se ha probado exitosamente:</p>
        <ul>
            <li>Nuevo límite: <strong>${newLimit} usuarios</strong></li>
            <li>Modo de prioridad: <strong>${getPriorityModeName(priorityMode)}</strong></li>
        </ul>
        <p>Se recomienda guardar los cambios para aplicarlos al sistema.</p>
    `;
    
    document.getElementById('confirmModal').style.display = 'flex';
}

function getPriorityModeName(value) {
    const modes = {
        'fifo': 'Primero en entrar, primero en salir',
        'priority': 'Por prioridad de usuario'
    };
    return modes[value] || value;
}

function confirmChanges() {
    // Guardar los cambios (solo el límite máximo)
    maxUsers = parseInt(document.getElementById('maxUsuarios').value);
    currentUsers = 0; // Mantenemos usuarios en cero
    
    // Actualizar la interfaz
    updateUserStats();
    
    // Cerrar modal y mostrar feedback
    closeModal();
    alert('Los cambios se han aplicado exitosamente. Usuarios activos: 0');
    
    // Añadir al historial
    addHistoryItem('Límite cambiado', maxUsers);
}

function addHistoryItem(action, value) {
    const historyList = document.getElementById('historyList');
    const now = new Date();
    
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.innerHTML = `
        <div class="history-details">
            <div class="history-action">${action}</div>
            <div class="history-user">Por Admin • <span class="history-time">Ahora mismo</span></div>
        </div>
        <div class="history-value">${value}</div>
    `;
    
    historyList.insertBefore(historyItem, historyList.firstChild);
}

function closeModal() {
    document.getElementById('confirmModal').style.display = 'none';
}

// Manejar el envío del formulario
document.getElementById('limiteForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const newLimit = parseInt(document.getElementById('maxUsuarios').value);
    
    if(newLimit < 1 || newLimit > 1000) {
        alert('Por favor ingrese un valor válido entre 1 y 1000');
        return;
    }
    
    // Mostrar modal de confirmación
    document.getElementById('modalTitle').textContent = 'Confirmar Cambios';
    document.getElementById('modalMessage').textContent = `¿Está seguro que desea cambiar el límite máximo a ${newLimit} usuarios?`;
    document.getElementById('confirmModal').style.display = 'flex';
});

