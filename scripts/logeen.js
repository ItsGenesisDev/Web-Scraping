document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Llamar a la función de autenticación con el servidor Express
    authenticateWithServer(username, password);
});

function authenticateWithServer(username, password) {
    fetch('/auth', { // La URL ahora es /auth para el servidor Express
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    })
    .then(response => response.text()) // Cambié esto a `text` porque el servidor responde con texto, no JSON
    .then(data => {
        if (data === 'Welcome back!') {
            alert('Autenticación exitosa');
            window.location.href = '/home'; // Redirigir a la página principal
        } else {
            alert('Usuario o contraseña incorrectos');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error en la autenticación');
    });
}
