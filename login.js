const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const scrapeAllDevices = require('./scrapeDevice');

// Configura la conexión a la base de datos MySQL
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345',
    database: 'nodelogin'
});

const app = express();

// Configura el middleware de sesión
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

// Configura middleware para analizar JSON y datos codificados en URL
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos
app.use(express.static('styles'));
app.use(express.static('assets'));
app.use(express.static('scripts'));
app.use(express.static('crudDevice'));
app.use(express.static('models'));

// Ruta principal
app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname, '/login.html'));
});

// Autenticación
app.post('/auth', function(request, response) {
    let username = request.body.username;
    let password = request.body.password;
    console.log('Intento de login:', username);

    if (username && password) {
        connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', 
        [username, password], 
        function(error, results) {
            if (error) {
                console.error('Database error:', error);
                return response.status(500).send('Error en el servidor');
            }
            
            if (results.length > 0) {
                request.session.loggedin = true;
                request.session.username = username;
                request.session.role = results[0].role;
                console.log('Login exitoso:', username);
                return response.redirect('/home');
            } else {
                console.log('Credenciales incorrectas para:', username);
                return response.send('Usuario o contraseña incorrectos');
            }
        });
    } else {
        console.log('Intento de login sin credenciales completas');
        response.send('Por favor ingrese usuario y contraseña');
    }
});

// Guardar dispositivos
app.post('/saveDevices', express.json(), (req, res) => {
    if (!req.session.loggedin) {
        console.warn('Intento de acceso no autorizado a /saveDevices');
        return res.status(403).send('Acceso no autorizado');
    }

    const { devices, deviceType } = req.body;
    console.log('Solicitud para guardar dispositivos de tipo:', deviceType);

    if (!deviceType || !devices) {
        console.error('Faltan parámetros requeridos');
        return res.status(400).send('Faltan parámetros requeridos');
    }

    if (!Array.isArray(devices)) {
        console.error('Formato de dispositivos inválido');
        return res.status(400).send('Formato de datos inválido');
    }

    // Mapeo de tipos a archivos
    const fileMap = {
        '/Iphone/jsons/allPhonesInfo.json': 'allPhonesInfo.json',
        '/Iphone/jsons/alliPadInfo.json': 'alliPadInfo.json',
        '/Iphone/jsons/allMacbookAirInfo.json': 'allMacbookAirInfo.json',
        '/Iphone/jsons/allSmartwatchInfo.json': 'allSmartwatchInfo.json',
        '/Iphone/jsons/allIMacInfo.json': 'allIMacInfo.json'
    };

    const fileName = fileMap[deviceType];
    if (!fileName) {
        console.error('Tipo de dispositivo no válido:', deviceType);
        return res.status(400).send('Tipo de dispositivo no válido');
    }

    const filePath = path.join(__dirname, 'models', 'Iphone', 'jsons', fileName);
    const backupPath = `${filePath}`;

    try {
        // Crear backup primero
        if (fs.existsSync(filePath)) {
            fs.copyFileSync(filePath, backupPath);
            console.log('Backup creado:', backupPath);
        }

        // Guardar nuevos datos
        fs.writeFileSync(filePath, JSON.stringify(devices, null, 2));
        console.log('Dispositivos guardados en:', fileName);
        res.send('Dispositivos guardados correctamente');
    } catch (err) {
        console.error('Error al guardar:', err.message);
        
        // Intentar restaurar backup si existe
        if (fs.existsSync(backupPath)) {
            try {
                fs.copyFileSync(backupPath, filePath);
                console.log('Backup restaurado después de error');
            } catch (restoreErr) {
                console.error('Error al restaurar backup:', restoreErr.message);
            }
        }
        
        res.status(500).send('Error al guardar los dispositivos');
    }
});

// Resto de rutas
app.get('/home', (req, res) => {
    if (req.session.loggedin) {
        res.sendFile(path.join(__dirname, '/home.html'));
    } else {
        res.status(403).send('Acceso denegado');
    }
});

app.get('/logout', (req, res) => {
    console.log('Usuario cerró sesión:', req.session.username);
    req.session.destroy();
    res.redirect('/');
});

app.get('/scrape', async (req, res) => {
    if (!req.session.loggedin) {
        return res.status(403).send('Acceso no autorizado');
    }

    try {
        console.log("Iniciando scraping...");
        await scrapeAllDevices();
        res.status(200).json({ message: "Scraping completo" });
    } catch (error) {
        console.error("Error en el scraping:", error);
        res.status(500).json({ error: "Error en el scraping" });
    }
});

app.get('/getUserType', (req, res) => {
    if (req.session.loggedin) {
        res.json({ role: req.session.role });
    } else {
        res.status(403).json({ error: 'Acceso denegado' });
    }
});

// Iniciar servidor
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`|-------------------------------------------------|`);
    console.log(`|🚀 Server started at http://localhost:${PORT} ✅|`);
    console.log(`|-------------------------------------------------|`);
});