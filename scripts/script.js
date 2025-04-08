// Cache para almacenar los datos ya cargados
const jsonCache = {};

// Configuración de dispositivos
const deviceTypes = {
    iphones: '/Iphone/jsons/allPhonesInfo.json',
    ipads: '/Iphone/jsons/alliPadInfo.json',
    imacbook: '/Iphone/jsons/allMacbookAirInfo.json',
    applewatches: '/Iphone/jsons/allSmartwatchInfo.json',
    imacs: '/Iphone/jsons/allIMacInfo.json'
};

// Elementos del DOM
const phoneListDiv = document.getElementById('phone-list');
const refreshButton = document.getElementById('refreshButton');
const filterButtons = document.querySelectorAll('#filters button');
const buscador = document.getElementById('Buscador');

// Cargar datos iniciales
document.addEventListener('DOMContentLoaded', () => {
    loadData('iphones');
});

// Función optimizada para cargar datos
async function loadData(deviceType) {
    // Mostrar spinner
    document.getElementById('loadingSpinner').classList.add('show');
    
    try {
        // Cargar solo si no está en caché
        if (!jsonCache[deviceType]) {
            const response = await fetch(deviceTypes[deviceType]);
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
            jsonCache[deviceType] = await response.json();
        }
        
        renderDevices(jsonCache[deviceType], deviceType);
        
    } catch (error) {
        console.error('Error al cargar datos:', error);
        phoneListDiv.innerHTML = `<p class="error-message">Error: ${error.message}</p>`;
    } finally {
        document.getElementById('loadingSpinner').classList.remove('show');
    }
}

// Función optimizada para renderizar dispositivos
function renderDevices(data, deviceType) {
    // Usar DocumentFragment para mejor rendimiento
    const fragment = document.createDocumentFragment();
    
    // Ordenar por fecha (más reciente primero)
    const sortedData = [...data].sort((a, b) => 
        new Date(b.releaseDate) - new Date(a.releaseDate));
    
    sortedData.forEach(device => {
        const phoneDiv = document.createElement('div');
        phoneDiv.className = 'phone-item';
        
        // Limpieza del nombre optimizada
        const cleanName = device.deviceName.replace(
            /\s*\([^)]*\)|\s*\d+(?:,\d+)*\s*(?:GB|TB)\b.*$/gi, 
            ''
        ).trim();
        
        // Plantilla genérica adaptable
        phoneDiv.innerHTML = `
            <h3>${cleanName}</h3>
            <p><strong>ID:</strong> ${device.identifier}</p>
            <p><strong>Modelo:</strong> ${device.model}</p>
            ${device.appleOrderNo ? `<p><strong>Orden Apple:</strong> ${device.appleOrderNo}</p>` : ''}
            ${device.ram ? `<p><strong>RAM:</strong> ${device.ram}</p>` : ''}
            ${device.storage ? `<p><strong>Almacenamiento:</strong> ${device.storage}</p>` : ''}
            <p><strong>Lanzamiento:</strong> ${device.releaseDate}</p>
            ${device.color ? `<p><strong>Color:</strong> ${device.color}</p>` : ''}
            ${device.size ? `<p><strong>Tamaño:</strong> ${device.size}</p>` : ''}
        `;
        
        fragment.appendChild(phoneDiv);
    });
    
    // Limpiar y renderizar de una sola vez
    phoneListDiv.innerHTML = '';
    phoneListDiv.appendChild(fragment);
}

// Evento para actualizar datos
refreshButton.addEventListener('click', async () => {
    try {
        // Mostrar spinner
        document.getElementById('loadingSpinner').classList.add('show');
        refreshButton.disabled = true;
        
        // Obtener categoría activa
        const activeFilter = document.querySelector('#filters button.active')?.dataset.filter || 'iphones';
        
        // Forzar recarga eliminando del caché
        delete jsonCache[activeFilter];
        
        // Hacer scraping solo para la categoría visible
        const scrapeResponse = await fetch(`http://localhost:3001/scrape?type=${activeFilter}`);
        if (!scrapeResponse.ok) throw new Error(`Error en scraping: ${scrapeResponse.status}`);
        
        // Recargar datos
        await loadData(activeFilter);
        
    } catch (error) {
        console.error('Error al actualizar:', error);
        alert('Error al actualizar. Consulte la consola para más detalles.');
    } finally {
        document.getElementById('loadingSpinner').classList.remove('show');
        refreshButton.disabled = false;
    }
});

// Filtros de dispositivos
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Actualizar botón activo
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Cargar datos
        loadData(button.dataset.filter);
    });
});

// Búsqueda en tiempo real
buscador.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const devices = document.querySelectorAll('.phone-item');
    
    devices.forEach(device => {
        const text = device.textContent.toLowerCase();
        device.style.display = text.includes(searchTerm) ? 'block' : 'none';
    });
});

// Configurar botón para subir al inicio
function setupScrollToTop() {
    const toTopButton = document.getElementById("toTop");
    
    window.onscroll = () => {
        toTopButton.classList[
            (document.documentElement.scrollTop > 200) ? "add" : "remove"
        ]("is-visible");
    };
    
    toTopButton.onclick = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };
}