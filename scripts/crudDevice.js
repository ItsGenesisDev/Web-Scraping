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

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    checkSession();
    loadDevices();
    setupEventListeners();
    setupScrollToTop();
});

// Verificar sesión
async function checkSession() {
    try {
        const response = await fetch('/getUserType');
        if (!response.ok) {
            window.location.href = '/';
        }
    } catch (error) {
        console.error('Error verificando sesión:', error);
        window.location.href = '/';
    }
}

// Configurar eventos
function setupEventListeners() {
    deviceTypeSelect.addEventListener('change', loadDevices);
    addButton.addEventListener('click', addDevice);
    updateButton.addEventListener('click', updateDevice);
    cancelButton.addEventListener('click', cancelEdit);
    deviceForm.addEventListener('reset', cancelEdit);
    
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
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        devices = await response.json();
        renderDevices();
        updateResultsInfo(devices.length);
    } catch (error) {
        console.error('Error cargando dispositivos:', error);
        devices = [];
        renderDevices();
        updateResultsInfo(0);
        showNotification('Error al cargar dispositivos', 'error');
    }
}

// Actualizar info de resultados
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
        return Object.values(device).some(
            value => value && value.toString().toLowerCase().includes(normalizedSearch)
        );
    });
    
    renderFilteredDevices(filteredDevices, normalizedSearch);
    updateResultsInfo(filteredDevices.length);
}

// Renderizar dispositivos
function renderDevices() {
    renderFilteredDevices(devices);
}

// Resaltar texto
function highlightText(text, searchTerm) {
    if (!text || !searchTerm) return text;
    const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
    return text.toString().replace(regex, '<span class="highlight">$1</span>');
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Renderizar dispositivos filtrados
function renderFilteredDevices(filteredDevices, searchTerm = '') {
    deviceList.innerHTML = '';
    
    if (filteredDevices.length === 0) {
        deviceList.innerHTML = '<p class="no-results">No se encontraron dispositivos</p>';
        return;
    }
    
    filteredDevices.forEach((device, index) => {
        const li = document.createElement('li');
        li.className = 'device-item';
        
        // Header
        const header = document.createElement('div');
        header.className = 'device-header';
        
        const title = document.createElement('h3');
        title.innerHTML = `
            ${highlightText(device.deviceName, searchTerm)} 
            <span class="device-identifier">${highlightText(device.identifier, searchTerm)}</span>
        `;
        
        const actions = document.createElement('div');
        actions.className = 'device-actions';
        
        const editBtn = document.createElement('button');
        editBtn.className = 'btn-edit';
        editBtn.innerHTML = '<i class="material-icons">edit</i> Editar';
        editBtn.onclick = () => selectDevice(index);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-delete';
        deleteBtn.innerHTML = '<i class="material-icons">delete</i> Eliminar';
        deleteBtn.onclick = () => deleteDevice(index);
        
        actions.append(editBtn, deleteBtn);
        header.append(title, actions);
        
        // Info
        const info = document.createElement('div');
        info.className = 'device-info';
        
        const fields = [
            { label: 'Modelo', value: device.model },
            { label: 'RAM', value: device.ram },
            { label: 'Almacenamiento', value: device.storage },
            { label: 'N° Orden', value: device.appleOrderNo },
            { label: 'Lanzamiento', value: formatDateDisplay(device.releaseDate) },
            { label: 'Color', value: device.color }
        ];
        
        fields.forEach(field => {
            if (field.value) {
                const fieldEl = document.createElement('div');
                fieldEl.className = 'device-field';
                fieldEl.innerHTML = `
                    <strong>${field.label}:</strong> 
                    ${highlightText(field.value, searchTerm)}
                `;
                info.appendChild(fieldEl);
            }
        });
        
        li.append(header, info);
        deviceList.appendChild(li);
    });
}

// Formatear fecha
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
    
    if (!validateDevice(newDevice)) {
        showNotification('Complete los campos requeridos', 'error');
        return;
    }
    
    newDevice.id = devices.length > 0 ? Math.max(...devices.map(d => d.id)) + 1 : 1;
    newDevice.releaseDate = formatDateForStorage(newDevice.releaseDate);
    
    devices.push(newDevice);
    // await saveDevices();
    deviceForm.reset();
    showNotification('Dispositivo añadido', 'success');
}

// Validar dispositivo
function validateDevice(device) {
    return device.deviceName && device.identifier && device.model;
}

// Formatear fecha para almacenamiento
function formatDateForStorage(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return isNaN(date) ? '' : date.toISOString().split('T')[0];
}

// Seleccionar dispositivo para editar
function selectDevice(index) {
    const device = devices[index];
    selectedDeviceIndex = index;
    
    // Actualizar formulario
    for (const [key, value] of Object.entries(device)) {
        const input = deviceForm.elements[key];
        if (input) input.value = value;
    }
    
    // Cambiar botones
    addButton.style.display = 'none';
    updateButton.style.display = 'inline-block';
    cancelButton.style.display = 'inline-block';
    
    // Scroll al formulario
    deviceForm.scrollIntoView({ behavior: 'smooth' });
}

// Actualizar dispositivo
async function updateDevice() {
    if (selectedDeviceIndex === null) return;
    
    const formData = new FormData(deviceForm);
    const updatedDevice = Object.fromEntries(formData.entries());
    
    if (!validateDevice(updatedDevice)) {
        showNotification('Complete los campos requeridos', 'error');
        return;
    }
    
    updatedDevice.id = devices[selectedDeviceIndex].id;
    updatedDevice.releaseDate = formatDateForStorage(updatedDevice.releaseDate);
    
    devices[selectedDeviceIndex] = updatedDevice;
    await saveDevices();
    cancelEdit();
    showNotification('Dispositivo actualizado', 'success');
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
async function deleteDevice(index) {
    if (!confirm('¿Está seguro de eliminar este dispositivo?')) return;
    
    devices.splice(index, 1);
    await saveDevices();
    
    if (selectedDeviceIndex === index) {
        cancelEdit();
    }
    
    showNotification('Dispositivo eliminado', 'success');
}

// Guardar dispositivos - VERSIÓN CORREGIDA
async function saveDevices() {
    try {
        const selectedType = deviceTypeSelect.value;
        
        const response = await fetch('/saveDevices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                devices: devices,
                deviceType: selectedType
            })
        });
        
        if (!response.ok) {
            const error = await response.text();
            throw new Error(error);
        }
        
        renderDevices();
    } catch (error) {
        console.error('Error al guardar:', error);
        showNotification('Error al guardar los dispositivos', 'error');
    }
}

// Mostrar notificación
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// Scroll to top
function setupScrollToTop() {
    const toTopButton = document.getElementById("toTop");
    
    window.onscroll = () => {
        toTopButton.classList.toggle("is-visible", window.scrollY > 200);
    };
    
    toTopButton.onclick = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };
}

// Volver al inicio
document.getElementById('back-to-home').addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = '/home';
});