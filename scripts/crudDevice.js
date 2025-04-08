const deviceForm = document.getElementById('device-form');
const deviceList = document.getElementById('devices');
const deviceTypeSelect = document.getElementById('deviceType');
const addButton = document.getElementById('add-button');
const updateButton = document.getElementById('update-button');
const cancelButton = document.getElementById('cancel-button');
const searchInput = document.getElementById('search-input');
const resultsInfo = document.getElementById('results-info');

let devices = [];
let selectedDeviceIndex = null;
let searchTimeout;

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
    loadDevices();
    setupEventListeners();
    setupScrollToTop();
});

// Configurar event listeners
function setupEventListeners() {
    deviceTypeSelect.addEventListener('change', loadDevices);
    addButton.addEventListener('click', addDevice);
    updateButton.addEventListener('click', updateDevice);
    cancelButton.addEventListener('click', cancelEdit);
    deviceForm.addEventListener('reset', cancelEdit);
    
    // Buscador con debounce
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            filterDevices(searchInput.value);
        }, 300);
    });
}

// Cargar dispositivos
async function loadDevices() {
    try {
        const selectedType = deviceTypeSelect.value;
        const response = await fetch(selectedType);
        devices = await response.json();
        renderDevices();
        updateResultsInfo(devices.length);
    } catch (error) {
        console.error('Error al cargar los dispositivos:', error);

        renderDevices();
        updateResultsInfo(devices.length);
    }
}

// Actualizar información de resultados
function updateResultsInfo(count) {
    resultsInfo.textContent = count === devices.length ? 
        `Mostrando todos los dispositivos (${count})` :
        `Mostrando ${count} de ${devices.length} dispositivos`;
}

// Filtrar dispositivos
function filterDevices(searchTerm) {
    const normalizedSearch = searchTerm.toLowerCase().trim();
    
    if (!normalizedSearch) {
        renderDevices();
        updateResultsInfo(devices.length);
        return;
    }
    
    const filteredDevices = devices.filter(device => {
        return (
            (device.deviceName && device.deviceName.toLowerCase().includes(normalizedSearch)) ||
            (device.identifier && device.identifier.toLowerCase().includes(normalizedSearch)) ||
            (device.model && device.model.toLowerCase().includes(normalizedSearch)) ||
            (device.appleOrderNo && device.appleOrderNo.toLowerCase().includes(normalizedSearch)) ||
            (device.color && device.color.toLowerCase().includes(normalizedSearch))
        );
    });
    
    renderFilteredDevices(filteredDevices, normalizedSearch);
    updateResultsInfo(filteredDevices.length);
}

// Renderizar dispositivos
function renderDevices() {
    renderFilteredDevices(devices);
}

// Resaltar texto coincidente
function highlightText(text, searchTerm) {
    if (!text || !searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.toString().replace(regex, '<span class="highlight">$1</span>');
}

// Renderizar dispositivos filtrados
function renderFilteredDevices(filteredDevices, searchTerm = '') {
    deviceList.innerHTML = '';
    
    if (filteredDevices.length === 0) {
        deviceList.innerHTML = '<p class="no-results">No se encontraron dispositivos que coincidan con la búsqueda.</p>';
        return;
    }
    
    filteredDevices.forEach((device, index) => {
        const li = document.createElement('li');
        
        // Encabezado del dispositivo
        const header = document.createElement('div');
        header.className = 'device-header';
        
        const title = document.createElement('div');
        title.className = 'device-title';
        title.innerHTML = `
            ${highlightText(device.deviceName, searchTerm)} 
            <span class="device-identifier">${highlightText(device.identifier, searchTerm)}</span>
        `;
        
        const actions = document.createElement('div');
        actions.className = 'device-actions';
        
        const editButton = document.createElement('button');
        editButton.className = 'edit';
        editButton.innerHTML = '<i class="material-icons">edit</i> Editar';
        editButton.onclick = () => selectDevice(index);
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete';
        deleteButton.innerHTML = '<i class="material-icons">delete</i> Eliminar';
        deleteButton.onclick = () => deleteDevice(index);
        
        actions.appendChild(editButton);
        actions.appendChild(deleteButton);
        header.appendChild(title);
        header.appendChild(actions);
        
        // Información del dispositivo
        const info = document.createElement('div');
        info.className = 'device-info';
        
        const fields = [
            { name: 'Tipo', value: device.deviceType },
            { name: 'Modelo', value: device.model },
            { name: 'RAM', value: device.ram },
            { name: 'Almacenamiento', value: device.storage },
            { name: 'N° Orden', value: device.appleOrderNo },
            { name: 'Lanzamiento', value: formatDateDisplay(device.releaseDate) },
            { name: 'Color', value: device.color }
        ];
        
        fields.forEach(field => {
            if (field.value) {
                const span = document.createElement('span');
                span.innerHTML = `${field.name}: ${highlightText(field.value, searchTerm)}`;
                info.appendChild(span);
            }
        });
        
        li.appendChild(header);
        li.appendChild(info);
        deviceList.appendChild(li);
    });
}

// Formatear fecha para mostrar (October 30, 2009)
function formatDateDisplay(dateString) {
    if (!dateString) return 'No especificada';
    
    const date = new Date(dateString);
    if (isNaN(date)) return 'No especificada';
    
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Formatear fecha para almacenamiento (YYYY-MM-DD)
function formatDateToYYYYMMDD(dateString) {
    const date = new Date(dateString);
    if (isNaN(date)) return '';
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

// Validar formato del identificador
function validateIdentifier(identifier) {
    const regex = /^(iPhone|iPad|Mac|Watch)\d+,\d+$/i;
    return regex.test(identifier);
}

// Añadir nuevo dispositivo
function addDevice() {
    const formData = new FormData(deviceForm);
    const newDevice = Object.fromEntries(formData.entries());
    
    newDevice.id = devices.length > 0 ? Math.max(...devices.map(d => d.id)) + 1 : 1;
    newDevice.releaseDate = formatDateToYYYYMMDD(newDevice.releaseDate);
    
    devices.push(newDevice);
    renderDevices();
    saveDevices();
    deviceForm.reset();
    updateResultsInfo(devices.length);
}

// Seleccionar dispositivo para editar
function selectDevice(index) {
    const device = devices[index];
    selectedDeviceIndex = index;

    for (const key in device) {
        const input = deviceForm.elements[key];
        if (input) input.value = device[key];
    }

    addButton.style.display = 'none';
    updateButton.style.display = 'inline-block';
    cancelButton.style.display = 'inline-block';
}

// Actualizar dispositivo
function updateDevice() {
    if (selectedDeviceIndex === null) return;
    
    const formData = new FormData(deviceForm);
    const updatedDevice = Object.fromEntries(formData.entries());
    
    
    updatedDevice.id = devices[selectedDeviceIndex].id;
    updatedDevice.releaseDate = formatDateToYYYYMMDD(updatedDevice.releaseDate);
    
    devices[selectedDeviceIndex] = updatedDevice;
    renderDevices();
    saveDevices();
    cancelEdit();
}

// Cancelar edición
function cancelEdit() {
    selectedDeviceIndex = null;
    deviceForm.reset();
    addButton.style.display = 'inline-block';
    updateButton.style.display = 'none';
    cancelButton.style.display = 'none';
}

// Eliminar dispositivo
function deleteDevice(index) {
    if (confirm('¿Estás seguro de que quieres eliminar este dispositivo?')) {
        devices.splice(index, 1);
        renderDevices();
        saveDevices();
        updateResultsInfo(devices.length);
        
        if (selectedDeviceIndex === index) {
            cancelEdit();
        }
    }
}

// Guardar dispositivos
async function saveDevices() {
    try {
        const response = await fetch('/saveDevices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(devices),
        });
        
        if (!response.ok) {
            console.error('Error al guardar los dispositivos:', response.statusText);
        }
    } catch (error) {
        console.error('Error al guardar los dispositivos:', error);
    }
}

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

// Volver al inicio
document.getElementById('back-to-home').addEventListener('click', function(event) {
    event.preventDefault();
    window.history.back();
});