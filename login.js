// Importa el módulo de MySQL para interactuar con la base de datos
const mysql = require('mysql');

// Importa el módulo de Express para crear el servidor web
const express = require('express');

// Importa el módulo de express-session para manejar sesiones de usuario
const session = require('express-session');

// Importa el módulo path para trabajar con rutas de archivos
const path = require('path');

// Importa el modulo fs para leer archivos
const fs = require('fs');

// Configura la conexión a la base de datos MySQL
const connection = mysql.createConnection({
	host     : 'localhost', // Dirección del servidor de base de datos
	user     : 'root',      // Usuario de la base de datos
	password : '12345',     // Contraseña del usuario
	database : 'nodelogin'  // Nombre de la base de datos
});

// Crea una instancia de la aplicación Express
const app = express();

// Configura el middleware de sesión
app.use(session({
	secret: 'secret',            // Clave secreta para firmar la sesión
	resave: true,                // Fuerza la sesión a guardarse incluso si no hay cambios
	saveUninitialized: true      // Guarda sesiones no inicializadas
}));

// Configura middleware para analizar JSON y datos codificados en URL
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// styles//
app.use(express.static('styles'));
// imágenes assets/
app.use(express.static('assets'));
// scripts//
app.use(express.static('scripts'));
// crudDevice//
app.use(express.static('crudDevice'));
// models//
app.use(express.static('models'));





// Ruta principal (GET) para mostrar la página de inicio de sesión
app.get('/', function(request, response) {
	// Envía el archivo HTML de inicio de sesión al cliente
	response.sendFile(path.join(__dirname + '/login.html'));
});

// Ruta para manejar la autenticación de usuarios (POST)
app.post('/auth', function(request, response) {
	// Captura los campos de entrada del formulario
	let username = request.body.username;
	let password = request.body.password;
	console.log('Attempting login with:', { username, password }); // Muestra los datos ingresados en la consola

	// Verifica que los campos no estén vacíos
	if (username && password) {
		// Consulta SQL para verificar las credenciales del usuario
		connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (error) {
				console.error('Database error:', error); // Muestra errores de la base de datos en la consola
				throw error;
			}
			// Si se encuentra un usuario con las credenciales proporcionadas
			if (results.length > 0) {
				console.log('Login successful for user:', username); // Muestra un mensaje de éxito en la consola
				request.session.loggedin = true; // Marca la sesión como iniciada
				request.session.username = username; // Guarda el nombre de usuario en la sesión
				response.redirect('/home'); // Redirige al usuario a la página de inicio
			} else {
				// Si las credenciales son incorrectas
				console.log('Login failed: Incorrect Username and/or Password'); // Muestra un mensaje de error en la consola
				response.send('Incorrect Username and/or Password!'); // Envía un mensaje de error al cliente
			}
			response.end(); // Finaliza la respuesta
		});
	} else {
		// Si faltan campos en el formulario
		console.log('Login failed: Missing Username or Password'); // Muestra un mensaje de error en la consola
		response.send('Please enter Username and Password!'); // Envía un mensaje de error al cliente
		response.end(); // Finaliza la respuesta
	}
});

app.post('/saveDevices', express.json(), (req, res) => {
    const devices = req.body;
    const filePath = path.join(__dirname, 'models', 'Iphone', 'jsons', 'allPhonesInfo.json');

    fs.writeFile(filePath, JSON.stringify(devices, null, 2), (err) => {
        if (err) {
            console.error('Error al guardar los dispositivos:', err);
            return res.status(500).send('Error al guardar los dispositivos.');
        }
        console.log('Dispositivos guardados correctamente en el servidor.');
        res.send('Dispositivos guardados correctamente.');
    });
});

// Ruta para la página de inicio (GET)
app.get('/home', (req, res) => {
    // Verifica si el usuario ha iniciado sesión
    if (req.session.loggedin) {
        res.sendFile(__dirname + '/home.html'); // Envía la página de inicio al cliente
    } else {
        res.status(403).send('Access denied'); // Envía un mensaje de acceso denegado si no está autenticado
    }
});

// Ruta para manejar el logout (GET)
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err); // Muestra errores al destruir la sesión
            return res.status(500).send('Error logging out');
        }
        res.redirect('/'); // Redirige al usuario a la página de inicio de sesión
    });
});

// Configura el puerto en el que se ejecutará el servidor
const PORT = 3001; // Cambiado a 3001 para evitar conflictos
app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`); // Muestra un mensaje indicando que el servidor está en ejecución
});
