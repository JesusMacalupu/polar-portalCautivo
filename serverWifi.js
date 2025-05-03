const express = require('express');
const path = require('path');
const sql = require('mssql');
const cors = require('cors');

const app = express();
const PORT = 3000;

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

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para servir el login.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Ruta para registrar usuarios
app.post('/registro', async (req, res) => {
    const { nombre, fecha_nacimiento, correo, telefono } = req.body;

    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('nombre', sql.NVarChar(100), nombre)
            .input('fecha_nacimiento', sql.Date, fecha_nacimiento)
            .input('correo', sql.NVarChar(100), correo)
            .input('telefono', sql.NVarChar(20), telefono)
            .query("INSERT INTO Usuarios (nombre, fecha_nacimiento, correo, telefono) VALUES (@nombre, @fecha_nacimiento, @correo, @telefono)");

        res.json({ success: true, message: '📡 Conexión WI-FI Establecida.' });
    } catch (error) {
        console.error('❌ Error en el registro:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

// Ruta para iniciar sesión (y registrar automáticamente si el usuario no existe)
app.post('/login', async (req, res) => {
    const { nombre, fecha_nacimiento, correo, telefono } = req.body;

    try {
        const pool = await sql.connect(dbConfig);
        // Buscar usuario por teléfono (asumiendo que es único)
        const result = await pool.request()
            .input('telefono', sql.NVarChar(20), telefono)
            .query("SELECT * FROM Usuarios WHERE telefono = @telefono");

        if (result.recordset.length > 0) {
            // Existe un usuario registrado con ese teléfono, comparar los campos
            const usuario = result.recordset[0];
            if (usuario.nombre === nombre && 
                new Date(usuario.fecha_nacimiento).toISOString().split('T')[0] === fecha_nacimiento && 
                usuario.correo === correo && 
                usuario.telefono === telefono) {
                res.json({ success: true, message: '📡 Conexión WI-FI Establecida.' });
            } else {
                res.json({ success: false, message: '⚠️ Credenciales incorrectas.' });
            }
        } else {
            // Usuario no existe, registrar y responder con éxito
            await pool.request()
                .input('nombre', sql.NVarChar(100), nombre)
                .input('fecha_nacimiento', sql.Date, fecha_nacimiento)
                .input('correo', sql.NVarChar(100), correo)
                .input('telefono', sql.NVarChar(20), telefono)
                .query("INSERT INTO Usuarios (nombre, fecha_nacimiento, correo, telefono) VALUES (@nombre, @fecha_nacimiento, @correo, @telefono)");
            res.json({ success: true, message: '📡 Conexión WI-FI Establecida.' });
        }
    } catch (error) {
        console.error('❌ Error en el inicio de sesión:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    } 
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
    console.log('📌 Presiona Ctrl + C para detener el servidor.');
});