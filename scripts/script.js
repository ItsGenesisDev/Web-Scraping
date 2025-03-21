// Importa la función scrapeAllDevices desde scripts/scrapeDevices.js
// const scrapeAllDevices = require('./scrapeDevices'); // Ruta relativa a scrapeDevices.js

//import scrapeAllDevices from './scrapeDevices.js';


// Definir los tipos de dispositivos y las rutas de sus archivos JSON
const deviceTypes = {
    iphones: '/Iphone/jsons/allPhonesInfo.json',
    ipads: '/Iphone/jsons/alliPadInfo.json',
    imacbook: '/Iphone/jsons/allMacbookAirInfo.json',
    applewatches: '/Iphone/jsons/allSmartwatchInfo.json',
    imacs: '/Iphone/jsons/allIMacInfo.json'
};

// Selección del contenedor donde se mostrarán los dispositivos
const phoneListDiv = document.getElementById('phone-list');

// Función para cargar los datos de los dispositivos desde los archivos JSON
function loadData(deviceType) {
    const jsonPath = deviceTypes[deviceType];

    fetch(jsonPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            phoneListDiv.innerHTML = '';

            if (!data || data.length === 0) {
                phoneListDiv.innerHTML = '<p class="error-message">No se encontraron datos.</p>';
                return;
            }

            // Ordenar los dispositivos por fecha de lanzamiento
            data.sort((a, b) => {
                const dateA = new Date(a.releaseDate);
                const dateB = new Date(b.releaseDate);
                return dateA - dateB;
            });

            // Crear y mostrar los elementos de la lista de dispositivos
            data.forEach(device => {
                const phoneDiv = document.createElement('div');
                phoneDiv.classList.add('phone-item');

                let deviceInfo = `<h3>${device.deviceName}</h3>`;
                if (deviceType === 'iphones') {
                    deviceInfo += `
                        <p><strong>Modelo:</strong> ${device.model}</p>
                        <p><strong>RAM:</strong> ${device.ram}</p>
                        <p><strong>Almacenamiento:</strong> ${device.storage}</p>
                        <p><strong>Orden de Apple:</strong> ${device.appleOrderNo}</p>
                        <p><strong>Fecha de Lanzamiento:</strong> ${device.releaseDate}</p>
                        <p><strong>Color:</strong> ${device.color}</p>
                    `;
                } else if (deviceType === 'ipads') {
                    deviceInfo += `
                        <p><strong>Modelo:</strong> ${device.model}</p>
                        <p><strong>RAM:</strong> ${device.ram}</p>
                        <p><strong>Almacenamiento:</strong> ${device.storage}</p>
                        <p><strong>Orden de Apple:</strong> ${device.appleOrderNo}</p>
                        <p><strong>Fecha de Lanzamiento:</strong> ${device.releaseDate}</p>
                        <p><strong>Color:</strong> ${device.color}</p>
                    `;
                } else if (deviceType === 'imacbook') {
                    deviceInfo += `
                        <p><strong>Modelo:</strong> ${device.model}</p>
                        <p><strong>RAM:</strong> ${device.ram}</p>
                        <p><strong>Almacenamiento:</strong> ${device.storage}</p>
                        <p><strong>Orden de Apple:</strong> ${device.appleOrderNo}</p>
                        <p><strong>Fecha de Lanzamiento:</strong> ${device.releaseDate}</p>
                    `;
                } else if (deviceType === 'applewatches') {
                    deviceInfo += `
                        <p><strong>Tamaño:</strong> ${device.size}</p>
                        <p><strong>Modelo:</strong> ${device.model}</p>
                        <p><strong>Orden de Apple:</strong> ${device.appleOrderNo}</p>
                        <p><strong>Fecha de Lanzamiento:</strong> ${device.releaseDate}</p>
                        <p><strong>Color:</strong> ${device.color}</p>
                    `;
                } else if (deviceType === 'imacs') {
                    deviceInfo += `
                        <p><strong>Modelo:</strong> ${device.model}</p>
                        <p><strong>Orden de Apple:</strong> ${device.appleOrderNo}</p>
                        <p><strong>Almacenamiento:</strong> ${device.storage}</p>
                        <p><strong>Fecha de Lanzamiento:</strong> ${device.releaseDate}</p>
                    `;
                }

                phoneDiv.innerHTML = deviceInfo;
                phoneListDiv.appendChild(phoneDiv);
            });
        })
        .catch(error => {
            console.error('Error al cargar el archivo JSON:', error);
            phoneListDiv.innerHTML = '<p class="error-message">Error al cargar los datos. Por favor, revisa la consola para más detalles.</p>';
        });
}

// Evento para el botón de refresco (reload) para recargar los datos y realizar el scraping
const refreshButton = document.getElementById('refreshButton');
refreshButton.addEventListener('click', async () => {
    // Realizamos el scraping antes de cargar los datos
    await scrapeAllDevices();

    // Luego cargamos los datos de los dispositivos
    loadData('iphones');
    loadData('ipads');
    loadData('imacbook');
    loadData('applewatches');
    loadData('imacs');
});

// Cargar los datos de los iPhones inicialmente
loadData('iphones');

// Filtros de dispositivo por tipo
const filterButtons = document.querySelectorAll('#filters button');
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        const deviceType = button.dataset.filter;
        loadData(deviceType);
    });
});

// Función de búsqueda para filtrar dispositivos por nombre
const buscador = document.getElementById('Buscador');
buscador.addEventListener('input', function(event) {
    const filtro = event.target.value.toLowerCase();
    const elementosTelefono = document.querySelectorAll('.phone-item');

    // Filtrar los dispositivos visibles según el texto del filtro
    elementosTelefono.forEach(elemento => {
        const textoElemento = elemento.textContent.toLowerCase();
        if (textoElemento.includes(filtro)) {
            elemento.style.display = 'block';
        } else {
            elemento.style.display = 'none';
        }
    });
});
