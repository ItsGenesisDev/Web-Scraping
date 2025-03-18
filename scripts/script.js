const deviceTypes = {
    iphones: '/models/Iphone/jsons/allPhonesInfo.json',
    ipads: '/models/Iphone/jsons/alliPadInfo.json',
    imacbook: '/models/Iphone/jsons/allMacbookAirInfo.json',
    applewatches: '/models/Iphone/jsons/allSmartwatchInfo.json',
    imacs: '/models/Iphone/jsons/alliMacInfo.json'
}

const phoneListDiv = document.getElementById('phone-list');

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

            // Ordenar por fecha de lanzamiento
            data.sort((a, b) => {
                const dateA = new Date(a.releaseDate);
                const dateB = new Date(b.releaseDate);
                return dateA - dateB;
            });

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
                        <p><strong>Modelo:</strong> ${device.size}</p>
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

const refreshButton = document.getElementById('refreshButton');
refreshButton.addEventListener('click', () => {
    loadData('iphones');
    loadData('ipads');
    loadData('imacbook');
    loadData('applewatches');
    loadData('imacs');

    scrapeAllDevices();
});
loadData('iphones');

const filterButtons = document.querySelectorAll('#filters button');
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        const deviceType = button.dataset.filter;
        loadData(deviceType);
    });
});

const buscador = document.getElementById('Buscador');
buscador.addEventListener('input', function(event) {
    const filtro = event.target.value.toLowerCase();
    const elementosTelefono = document.querySelectorAll('.phone-item');

    elementosTelefono.forEach(elemento => {
        const textoElemento = elemento.textContent.toLowerCase();
        if (textoElemento.includes(filtro)) {
            elemento.style.display = 'block';
        } else {
            elemento.style.display = 'none';
        }
    });
});