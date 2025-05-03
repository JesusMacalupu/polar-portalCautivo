require('dotenv').config();
const express = require('express');
const path = require('path');
const sql = require('mssql');
const cors = require('cors');
const nodemailer = require('nodemailer');
const { exec } = require('child_process');
const ping = require('ping');
const wifi = require('node-wifi');
const twilio = require('twilio');

const app = express();
const PORT = 3000;

// Inicializa el módulo wifi
wifi.init({
    iface: null 
});

// Configuración de la base de datos
const dbConfig = {
    user: 'sa',
    password: 'conexionWifi123',
    server: '10.0.0.1',
    port: 55555,
    database: 'usuariosWifi',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

// Conectar a la base de datos
async function connectDB() {
    try {
        await sql.connect(dbConfig);
        console.log('✅ Conexión exitosa a la base de datos usuariosWifi');
    } catch (err) {
        console.error('❌ Error conectando a la base de datos:', err);
    }
}
connectDB();

// Configuración de Twilio para WhatsApp
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new twilio(accountSid, authToken);

// Función para generar token de verificación
function generateVerificationToken() {
    let token = '';
    const chars = '0123456789abcdef';
    for (let i = 0; i < 6; i++) {
        token += chars[Math.floor(Math.random() * chars.length)];
    }
    return token;
}

// Configuración de nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    },
    secure: false,
    tls: {
        rejectUnauthorized: false
    }
});

const verificationTokens = {};

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para servir el loginAdmin.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'loginAdmin.html'));
});

// Ruta para inicio de sesión de administradores
app.post('/loginAdmin', async (req, res) => {
    const { nombre, correo, contraseña } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('nombre', sql.NVarChar(100), nombre)
            .input('correo', sql.NVarChar(100), correo)
            .input('contraseña', sql.NVarChar(20), contraseña)
            .query("SELECT * FROM usuariosAdmin WHERE nombre = @nombre AND correo = @correo AND contraseña = @contraseña");

        if (result.recordset.length > 0) {
            res.json({ success: true, message: '💻 Inicio de Sesión como administrador exitoso.', adminName: nombre });
        } else {
            res.json({ success: false, message: '⚠️ Credenciales incorrectas.' });
        }
    } catch (error) {
        console.error('❌ Error en el inicio de sesión de administrador:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

// Ruta para crear un nuevo usuario
app.post('/crearUsuario', async (req, res) => {
    const { nombre, fecha_nacimiento, correo, telefono } = req.body;
    if (!nombre || !fecha_nacimiento || !correo || !telefono) {
        return res.status(400).json({ success: false, message: "Todos los campos son requeridos." });
    }
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('nombre', sql.NVarChar(100), nombre)
            .input('fecha_nacimiento', sql.Date, fecha_nacimiento)
            .input('correo', sql.NVarChar(100), correo)
            .input('telefono', sql.NVarChar(20), telefono)
            .query("INSERT INTO usuarios (nombre, fecha_nacimiento, correo, telefono) VALUES (@nombre, @fecha_nacimiento, @correo, @telefono)");

        res.json({ success: true, message: "Usuario creado correctamente." });
    } catch (error) {
        console.error("❌ Error al crear usuario:", error);
        res.status(500).json({ success: false, message: "Error al crear usuario." });
    }
});

// Ruta para crear un nuevo administrador
app.post('/crearAdmin', async (req, res) => {
    const { nombre, correo, contraseña } = req.body;
    if (!nombre || !correo || !contraseña) {
        return res.status(400).json({ success: false, message: "Todos los campos son requeridos." });
    }
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('nombre', sql.NVarChar(100), nombre)
            .input('correo', sql.NVarChar(100), correo)
            .input('contraseña', sql.NVarChar(20), contraseña)
            .query("INSERT INTO usuariosAdmin (nombre, correo, contraseña) VALUES (@nombre, @correo, @contraseña)");

        res.json({ success: true, message: "Administrador creado correctamente." });
    } catch (error) {
        console.error("❌ Error al crear administrador:", error);
        res.status(500).json({ success: false, message: "Error al crear administrador." });
    }
});

// Ruta para obtener todos los usuarios
app.get('/usuarios', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query("SELECT * FROM usuarios");
        res.json({ success: true, usuarios: result.recordset });
    } catch (error) {
        console.error("❌ Error al obtener usuarios:", error);
        res.status(500).json({ success: false, message: "Error al obtener usuarios." });
    }
});

// Ruta para obtener todos los administradores
app.get('/administradores', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query("SELECT * FROM usuariosAdmin");
        res.json({ success: true, administradores: result.recordset });
    } catch (error) {
        console.error("❌ Error al obtener administradores:", error);
        res.status(500).json({ success: false, message: "Error al obtener administradores." });
    }
});

// Ruta para obtener datos de un usuario por ID
app.get('/usuario/:id', async (req, res) => {
  const { id } = req.params;
  try {
      const pool = await sql.connect(dbConfig);
      const result = await pool.request()
          .input('id', sql.Int, id)
          .query("SELECT nombre, fecha_nacimiento, correo, telefono FROM usuarios WHERE id = @id");

      if (result.recordset.length > 0) {
          // Formatear la fecha para el frontend
          const usuario = result.recordset[0];
          usuario.fecha_nacimiento = new Date(usuario.fecha_nacimiento).toISOString();
          res.json({ success: true, usuario: usuario });
      } else {
          res.json({ success: false, message: '⚠️ Usuario no encontrado.' });
      }
  } catch (error) {
      console.error('❌ Error al obtener datos del usuario:', error);
      res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

// Ruta para actualizar datos de un usuario por ID
app.put('/usuario/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, fecha_nacimiento, correo, telefono } = req.body;
  
  if (!nombre || !fecha_nacimiento || !correo || !telefono) {
      return res.status(400).json({ success: false, message: "Todos los campos son requeridos." });
  }

  try {
      const pool = await sql.connect(dbConfig);
      await pool.request()
          .input('id', sql.Int, id)
          .input('nombre', sql.NVarChar(100), nombre)
          .input('fecha_nacimiento', sql.Date, fecha_nacimiento)
          .input('correo', sql.NVarChar(100), correo)
          .input('telefono', sql.NVarChar(20), telefono)
          .query("UPDATE usuarios SET nombre = @nombre, fecha_nacimiento = @fecha_nacimiento, correo = @correo, telefono = @telefono WHERE id = @id");

      res.json({ success: true, message: '✅ Usuario actualizado correctamente.' });
  } catch (error) {
      console.error('❌ Error al actualizar datos del usuario:', error);
      res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

// Ruta para eliminar un usuario por ID
app.delete('/usuario/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('id', sql.Int, id)
            .query("DELETE FROM usuarios WHERE id = @id");

        res.json({ success: true, message: '✅ Usuario eliminado correctamente.' });
    } catch (error) {
        console.error('❌ Error al eliminar usuario:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

// Ruta para obtener datos de un administrador por ID
app.get('/admin/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query("SELECT nombre, correo, contraseña AS contrasena FROM usuariosAdmin WHERE id = @id");

        if (result.recordset.length > 0) {
            res.json({ success: true, admin: result.recordset[0] });
        } else {
            res.json({ success: false, message: '⚠️ Administrador no encontrado.' });
        }
    } catch (error) {
        console.error('❌ Error al obtener datos del administrador:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

// Ruta para actualizar datos de un administrador por ID
app.put('/admin/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, correo, contrasena } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('id', sql.Int, id)
            .input('nombre', sql.NVarChar(100), nombre)
            .input('correo', sql.NVarChar(100), correo)
            .input('contraseña', sql.NVarChar(100), contrasena)
            .query("UPDATE usuariosAdmin SET nombre = @nombre, correo = @correo, contraseña = @contraseña WHERE id = @id");

        res.json({ success: true, message: '✅ Administrador actualizado correctamente.' });
    } catch (error) {
        console.error('❌ Error al actualizar datos del administrador:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

// Ruta para eliminar un administrador por ID
app.delete('/admin/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('id', sql.Int, id)
            .query("DELETE FROM usuariosAdmin WHERE id = @id");

        res.json({ success: true, message: '✅ Administrador eliminado correctamente.' });
    } catch (error) {
        console.error('❌ Error al eliminar administrador:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

/**************** CAMBIO DE CONTRASEÑA ADMINISTRADOR *************************/

app.post('/send_verification_code', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'El correo es requerido.' });
  
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('correo', sql.NVarChar, email)
            .query('SELECT * FROM usuariosAdmin WHERE correo = @correo');

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'El correo no existe en nuestros registros.' });
        }

        const token = generateVerificationToken();
        const expires = Date.now() + 5 * 60 * 1000;
        verificationTokens[email] = { token, expires };

        const mailOptions = {
            from: `"Soporte MATRICIANO" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: 'Código de verificación para cambio de contraseña',
            html: `
                <div style="text-align: center;">
                    <img src="cid:headerImage" alt="Logo" style="width:80px; height:80px;">
                    <p>Se ha solicitado un cambio de contraseña. Tu código de verificación es: <strong>${token}</strong>.</p>
                    <p>Este código expira en 5 minutos.</p>
                </div>
            `,
            attachments: [
                {
                    filename: './img/fondo_circulo_logo.png',
                    path: path.join(__dirname, 'public', './img/fondo_circulo_logo.png'),
                    cid: 'headerImage'
                }
            ]
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error al enviar el correo:', error);
                return res.status(500).json({ error: 'Error al enviar el correo de verificación.' });
            }
            res.json({ message: 'Código de verificación enviado al correo.' });
        });
    } catch (err) {
        console.error('Error en /send_verification_code:', err);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

app.post('/check_verification_code', (req, res) => {
    const { email, verificationCode } = req.body;
    if (!email || !verificationCode) {
        return res.status(400).json({ error: 'El correo y el código son requeridos.' });
    }
    const record = verificationTokens[email];
    if (!record) {
        return res.status(400).json({ error: 'No se encontró un código de verificación para este correo.' });
    }
    if (Date.now() > record.expires) {
        delete verificationTokens[email];
        return res.status(400).json({ error: 'El código de verificación ha expirado. Solicita uno nuevo.' });
    }
    if (record.token !== verificationCode) {
        return res.status(400).json({ error: 'El código de verificación es incorrecto.' });
    }
    res.json({ message: 'El código que ingresaste es correcto.' });
});

app.post('/update_password', async (req, res) => {
    const { email, newPassword, confirmPassword } = req.body;
    if (!email || !newPassword || !confirmPassword) {
        return res.status(400).json({ error: 'Todos los campos son requeridos.' });
    }
    if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: 'Las contraseñas no coinciden.' });
    }
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('correo', sql.NVarChar, email)
            .input('newPassword', sql.NVarChar, newPassword)
            .query('UPDATE usuariosAdmin SET contraseña = @newPassword WHERE correo = @correo');

        delete verificationTokens[email];

        const confirmationMailOptions = {
            from: `"Soporte MATRICIANO" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: 'Contraseña reestablecida exitosamente',
            html: `
                <div style="text-align: center;">
                    <img src="cid:headerImage" alt="Logo" style="width:80px; height:80px;">
                    <p style="font-size:18px; color:#007BFF;">Contraseña reestablecida como administrador exitosa 👍</p>
                </div>
            `,
            attachments: [
                {
                    filename: './img/fondo_circulo_logo.png',
                    path: path.join(__dirname, 'public', './img/fondo_circulo_logo.png'),
                    cid: 'headerImage'
                }
            ]
        };

        transporter.sendMail(confirmationMailOptions, (error, info) => {
            if (error) {
                console.error('Error al enviar el correo de confirmación:', error);
                return res.json({ message: 'Contraseña reestablecida como administrador exitosa 👍 (Pero no se pudo enviar el correo de confirmación)' });
            }
            res.json({ message: 'Contraseña reestablecida como administrador exitosa 👍' });
        });
    } catch (err) {
        console.error('Error al actualizar la contraseña:', err);
        res.status(500).json({ error: 'Ocurrió un error al actualizar la contraseña.' });
    }
});

/*************** API de Notificaciones Mejorada ******************/
const notificationsStore = {};

function formatNotificationTime(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Ahora mismo';
    if (minutes < 60) return `Hace ${minutes} minuto${minutes !== 1 ? 's' : ''}`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Hace ${hours} hora${hours !== 1 ? 's' : ''}`;
    
    return new Date(date).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short'
    });
}

async function initializeAdminNotifications(adminName) {
    if (!notificationsStore[adminName]) {
        notificationsStore[adminName] = [];
        
        const birthdayNotifications = await getBirthdayNotifications();
        const now = new Date().toISOString();
        
        notificationsStore[adminName].push(
            {
                id: `welcome-${Date.now()}`,
                type: 'welcome',
                title: '¡Bienvenido al Dashboard! 👋',
                message: `Hola ${adminName}, has iniciado sesión correctamente.`,
                time: formatNotificationTime(now),
                icon: '✅',
                read: false,
                date: now
            },
            {
                id: `system-${Date.now()}`,
                type: 'system',
                title: 'Recordatorio del Sistema ⚙️',
                message: 'Recuerda revisar regularmente el estado de la red.',
                time: formatNotificationTime(now),
                icon: '⚙️',
                read: false,
                date: now
            },
            ...birthdayNotifications
        );
    }
}

app.get('/api/notifications', async (req, res) => {
    try {
        const adminName = req.query.adminName || 'Administrador';
        
        await initializeAdminNotifications(adminName);
        
        res.json(notificationsStore[adminName].filter(n => !n.read)
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5));
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al obtener notificaciones' });
    }
});

app.get('/api/all-notifications', async (req, res) => {
    try {
        const adminName = req.query.adminName || 'Administrador';
        
        await initializeAdminNotifications(adminName);
        
        res.json([...notificationsStore[adminName]]
            .sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al obtener notificaciones' });
    }
});

app.post('/api/notifications/mark-all-read', (req, res) => {
    try {
        const adminName = req.query.adminName || 'Administrador';
        
        if (notificationsStore[adminName]) {
            notificationsStore[adminName].forEach(n => n.read = true);
        }
        res.json({ success: true });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al marcar como leídas' });
    }
});

app.delete('/api/notifications/:id', (req, res) => {
    try {
        const adminName = req.query.adminName || 'Administrador';
        const { id } = req.params;
        
        if (notificationsStore[adminName]) {
            const index = notificationsStore[adminName].findIndex(n => n.id === id);
            if (index !== -1) {
                notificationsStore[adminName].splice(index, 1);
            }
        }
        res.json({ success: true });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al eliminar notificación' });
    }
});

async function getBirthdayNotifications() {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();
    try {
        const result = await sql.query`
            SELECT id, nombre FROM usuarios 
            WHERE MONTH(fecha_nacimiento) = ${currentMonth}
            AND DAY(fecha_nacimiento) = ${currentDay}
        `;
        return result.recordset.map(user => ({
            id: `birthday-${user.id}-${Date.now()}`,
            type: 'birthday',
            title: '¡Feliz cumpleaños! 🎉',
            message: `Hoy es el cumpleaños de ${user.nombre}`,
            time: formatNotificationTime(today),
            icon: '🎂',
            read: false,
            date: today.toISOString()
        }));
    } catch (err) {
        console.error('Error:', err);
        return [];
    }
}

/****************** METRICAS DE RED WIFI MEDIDAS **********************/

// Endpoint para obtener el conteo de dispositivos
app.get('/api/devices', (req, res) => {
    exec('python scanner.py', (error, stdout, stderr) => {        
        if (error) {
            console.error('Error ejecutando Python:', error);
            return res.status(500).json({ error: 'Error al escanear la red' });
        }
        if (!stdout.trim()) {
            return res.json({ count: 0 });
        }
        const count = parseInt(stdout.trim(), 10);
        if (isNaN(count)) {
            console.error('La salida no es un número:', stdout);
            return res.json({ count: 0 });
        }
        res.json({ count });
    });
});

// Función para medir el ancho de banda
function medirVelocidad(callback) {
    exec('speedtest --json', (error, stdout) => {
        if (error) {
            // Solo muestra el error en 10% de los casos para evitar spam
            if (Math.random() < 0.1) {
                console.warn('⚠️ Error ejecutando speedtest, pero seguimos funcionando...');
            }
            return callback(null);
        }
        try {
            const data = JSON.parse(stdout);
            callback({
                download: (data.download / 1_000_000).toFixed(2), // Mbps
                upload: (data.upload / 1_000_000).toFixed(2), // Mbps
                ping: data.ping
            });
        } catch (err) {
            if (Math.random() < 0.1) {
                console.warn('⚠️ Error procesando datos de speedtest.');
            }
            callback(null);
        }
    });
}

// Ruta para obtener la velocidad
app.get('/speed', (req, res) => {
    medirVelocidad((result) => {
        if (!result) return res.status(500).json({ error: 'Error midiendo velocidad' });
        res.json(result);
    });
});

// Ruta para obtener la estabilidad de la conexión
app.get('/api/stability', (req, res) => {
    exec('speedtest --json', (error, stdout) => {
        if (error) {
            if (Math.random() < 0.1) {
                console.warn('⚠️ Error ejecutando speedtest en estabilidad.');
            }
            return res.status(500).json({ error: 'No se pudo obtener la estabilidad de la red' });
        }
        try {
            const result = JSON.parse(stdout);
            res.json({
                latency: result.ping,
                download: result.download / 1_000_000, // Convertir a Mbps
                upload: result.upload / 1_000_000
            });
        } catch (err) {
            if (Math.random() < 0.1) {
                console.warn('⚠️ Error procesando datos en estabilidad.');
            }
            res.status(500).json({ error: 'Error procesando los datos' });
        }
    });
});

// Perdida de paquetes
app.get("/api/packetloss", (req, res) => {
    exec("ping -n 10 8.8.8.8", (error, stdout) => {
        if (error) {
            console.error("❌ Error ejecutando ping:", error);
            return res.status(500).json({ error: "Error obteniendo pérdida de paquetes" });
        }
        const match = stdout.match(/perdidos\s*=\s*(\d+)/i);
        if (match) {
            const packetLoss = parseInt(match[1], 10);
            return res.json({ loss: packetLoss });
        } else {
            console.error("❌ No se pudo analizar la salida del ping:", stdout);
            return res.status(500).json({ error: "No se pudo determinar la pérdida de paquetes" });
        }
    });
});

// Info card de estado de red
async function evaluateConnection(host, attempts) {
    const results = await Promise.all(Array.from({ length: attempts }, () => ping.promise.probe(host)));
    const responseTimes = results.map(result => result.time).filter(time => time !== null);
    if (responseTimes.length === 0) {
        return { status: 'Desconectado' };
    }
    const averageTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    const packetLoss = results.filter(result => !result.alive).length / attempts;
    if (packetLoss > 0.5) {
        return { status: 'Desconectado' };
    } else if (averageTime < 100) {
        return { status: 'Conectado' };
    } else {
        return { status: 'Inestable' };
    }
}

app.get('/check-connection', async (req, res) => {
    try {
        const host = '8.8.8.8'; 
        const status = await evaluateConnection(host, 5); // Realizar 5 pings
        res.json(status);
    } catch (error) {
        console.error('Error al verificar la conexión:', error);
        res.json({ status: 'Desconectado' });
    }
});

// Info card de seguridad de red
app.get('/network-info', async (req, res) => {
    try {
        const currentNetwork = await wifi.getCurrentConnections();
        if (currentNetwork.length > 0) {
            const { ssid, security } = currentNetwork[0]; 
            res.json({
                ssid: ssid,
                security: security || 'Desconocido',
                secure: security ? true : false
            });
        } else {
            res.json({ ssid: 'Ninguna red', security: 'Desconocido', secure: false });
        }
    } catch (error) {
        console.error('Error al obtener información de la red:', error);
        res.json({ ssid: 'Error', security: 'Desconocido', secure: false });
    }
});

// Info card para recomendar un canal
app.get('/channel-recommendation', async (req, res) => {
    try {
        const networks = await wifi.scan(); // Escanea redes WiFi cercanas
        const channels = networks.map(network => network.channel);
        // Contar cuántas redes hay en cada canal
        const channelCounts = {};
        channels.forEach(channel => {
            channelCounts[channel] = (channelCounts[channel] || 0) + 1;
        });
        const congestedChannel = Object.keys(channelCounts).reduce((a, b) => channelCounts[a] > channelCounts[b] ? a : b);
        let recommendedChannel = parseInt(congestedChannel);
        recommendedChannel = recommendedChannel + 1 <= 36 ? recommendedChannel + 1 : 36; 
        res.json({
            recommendedChannel: recommendedChannel
        });
    } catch (error) {
        console.error('Error al obtener la recomendación de canal:', error);
        res.json({ recommendedChannel: 'Desconocido' });
    }
});

// Endpoint para obtener dispositivos
app.get('/api/dispositivosEncontrados', (req, res) => {
    exec('python network_scanner.py', (error, stdout, stderr) => {
        if (error) {
            console.error('Error al escanear la red:', error);
            return res.status(500).json({
                error: 'Error al detectar dispositivos',
                detalles: stderr
            });
        }
        try {
            const dispositivos = JSON.parse(stdout);
            res.json({
                success: true,
                dispositivos: dispositivos,
                timestamp: new Date().toLocaleString()
            });
        } catch (e) {
            console.error('Error al procesar datos:', e);
            res.status(500).json({
                error: 'Error en formato de datos',
                rawData: stdout
            });
        }
    });
});

/***** Envio de notificaciones por via API de Twilio ******/

app.post('/api/send-birthday-notification', async (req, res) => {
    try {
        const { userName } = req.body;
        
        if (!userName) {
            return res.status(400).json({ error: 'Nombre de usuario no proporcionado' });
        }

        // 1. Buscar al usuario en la base de datos
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('nombre', sql.NVarChar, userName)
            .query('SELECT telefono FROM usuarios WHERE nombre = @nombre');
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const user = result.recordset[0];
        
        // 2. Formatear número (agregar +51 si no lo tiene)
        let phoneNumber = user.telefono.trim();
        phoneNumber = phoneNumber.replace(/\D/g, '');
        
        // Validar que sea un número peruano válido (9 dígitos)
        if (phoneNumber.length !== 9 || !phoneNumber.startsWith('9')) {
            return res.status(400).json({ error: 'Número de teléfono inválido. Debe tener 9 dígitos y comenzar con 9' });
        }
        
        const formattedNumber = `+51${phoneNumber}`;
        
        // 3. Enviar mensaje por WhatsApp
        const message = await client.messages.create({
            body: `🎉 ¡Feliz cumpleaños ${userName}! 🎂\n\nQue tengas un día maravilloso lleno de alegría y bendiciones. ¡Disfruta tu día especial! 🥳`,
            from: 'whatsapp:+14155238886', // Número de Twilio
            to: `whatsapp:${formattedNumber}`
        });

        res.status(200).json({ 
            success: true,
            message: `Mensaje enviado a ${userName}`,
            phone: formattedNumber,
            twilioSid: message.sid
        });

    } catch (err) {
        console.error('Error al enviar notificación:', err);
        
        let errorMessage = 'Error al enviar notificación';
        if (err.message.includes('Invalid phone number')) {
            errorMessage = 'Número de teléfono inválido. Verifique el formato.';
        }

        res.status(500).json({ 
            error: errorMessage,
            details: err.message
        });
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`✅ Servidor de Administrador corriendo en http://localhost:${PORT}`);
});
    