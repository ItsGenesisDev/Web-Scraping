const mysql = require('mysql'); // Importa el módulo de MySQL para interactuar con la base de datos
const express = require('express'); // Importa el módulo de Express para crear el servidor web
const session = require('express-session'); // Importa el módulo de express-session para manejar sesiones de usuario
const path = require('path'); // Importa el módulo path para trabajar con rutas de archivos
const fs = require('fs'); // Importa el modulo fs para leer archivo
const scrapeAllDevices = require('./scrapeDevice'); // Importa la función de scraping

// Configura la conexión a la base de datos MySQL
const connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '12345',
	database : 'nodelogin'
});

// Crea una instancia de la aplicación Express
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
	response.sendFile(path.join(__dirname + '/login.html'));
});

// Ruta para manejar la autenticación de usuarios (POST)
app.post('/auth', function(request, response) {
	let username = request.body.username;
	let password = request.body.password;
	console.log('Attempting login with:', { username, password }); // Muestra los datos ingresados en la consola

	if (username && password) {
		connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results) {
			if (error) {
				console.error('Database error:', error);
				throw error;
			}
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/home');
			} else {
				response.send('Incorrect Username and/or Password!');
			}
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
	if (req.session.loggedin) {
		res.sendFile(__dirname + '/home.html');
	} else {
		res.status(403).send('Access denied');
	}
});

// Ruta para manejar el logout (GET)
app.get('/logout', (req, res) => {
	req.session.destroy((err) => {
		if (err) {
			console.error('Error destroying session:', err);
			return res.status(500).send('Error logging out');
		}
		res.redirect('/');
	});
});

// Ruta de scraping para ejecutar el proceso cuando se hace clic en el botón
app.get('/scrape', async (req, res) => {
    try {
        console.log("Iniciando scraping...");
        
        await scrapeAllDevices();

        res.status(200).json({ message: "Scraping completo" });
    } catch (error) {
        console.error("Error en el scraping:", error);
        res.status(500).json({ error: "Error en el scraping" });
    }
});

// Nueva ruta para obtener el userType
app.get('/getUserType', (req, res) => {
    console.log("Sesión actual:", req.session); // Debug
    if (req.session.loggedin) {
        console.log("Enviando userType:", req.session); // Debug
        res.json({ userType: req.session.userType });
    } else {
        console.log("Acceso denegado a /getUserType"); // Debug
        res.status(403).json({ error: 'Access denied' });
    }
});

// Configura el puerto en el que se ejecutará el servidor
const PORT = 3001; // Cambiado a 3001 para evitar conflictos
app.listen(PORT, () => {
	console.log(`|-------------------------------------------------|`);
    console.log(`|🚀 Server started at http://localhost:${PORT} ✅|`);
	console.log(`|-------------------------------------------------|`); 
});
