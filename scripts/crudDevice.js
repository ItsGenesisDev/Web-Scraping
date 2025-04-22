const deviceForm = document.getElementById('device-form');
const deviceList = document.getElementById('devices');
const deviceTypeSelect = document.getElementById('deviceType');

let devices = []; // Local array to store devices

// Fetch existing devices from the selected JSON file
async function loadDevices() {
    try {
        const selectedType = deviceTypeSelect.value;
        const response = await fetch(selectedType);
        devices = await response.json();
        renderDevices();
    } catch (error) {
        console.error('Error al cargar los dispositivos:', error);
    }
}

deviceTypeSelect.addEventListener('change', loadDevices);

const addButton = document.getElementById('add-button');
const updateButton = document.getElementById('update-button');
let selectedDeviceIndex = null;

// Agregar nuevo dispositivo
addButton.addEventListener('click', () => {
    const formData = new FormData(deviceForm);
    const newDevice = Object.fromEntries(formData.entries());
    delete newDevice.deviceType;

    // Format the releaseDate field to "Month Day, Year"
    if (newDevice.releaseDate) {
        newDevice.releaseDate = formatDateToReadable(newDevice.releaseDate);
    }

    devices.push(newDevice);
    renderDevices();
    saveDevices();
    deviceForm.reset();

    addButton.style.display = 'inline-block';
    updateButton.style.display = 'none';
});

// Actualizar dispositivo existente
updateButton.addEventListener('click', () => {
    if (selectedDeviceIndex !== null) {
        const formData = new FormData(deviceForm);
        const updatedDevice = Object.fromEntries(formData.entries());
        delete updatedDevice.deviceType;

        // Format the releaseDate field to "Month Day, Year"
        if (updatedDevice.releaseDate) {
            updatedDevice.releaseDate = formatDateToReadable(updatedDevice.releaseDate);
        }

        devices[selectedDeviceIndex] = updatedDevice;
        renderDevices();
        saveDevices();
        deviceForm.reset();

        updateButton.disabled = true;
        selectedDeviceIndex = null;

        addButton.style.display = 'inline-block';
        updateButton.style.display = 'none';
    }
});

// Seleccionar dispositivo para editar
function selectDevice(index) {
    const device = devices[index];
    selectedDeviceIndex = index;

    for (const key in device) {
        const input = deviceForm.elements[key];
        if (input) input.value = device[key];
    }

    updateButton.disabled = false;
    addButton.style.display = 'none';
    updateButton.style.display = 'inline-block';
}

// Renderizar lista de dispositivos
function renderDevices() {
    deviceList.innerHTML = '';
    devices.forEach((device, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${device.deviceName} (${device.model})</span>
            <div class="device-buttons">
                <button class="edit" onclick="selectDevice(${index})">Editar</button>
                <button class="delete" onclick="deleteDevice(${index})">Eliminar</button>
            </div>
            `;

        deviceList.appendChild(li);
    });
}

// Validar si el dispositivo ya existe
deviceForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(deviceForm);
    const newDevice = Object.fromEntries(formData.entries());

    if (newDevice.releaseDate) {
        newDevice.releaseDate = formatDateToYYYYMMDD(newDevice.releaseDate);
    }

    const existingIndex = devices.findIndex(device => device.deviceName === newDevice.deviceName);
    if (existingIndex !== -1) {
        devices[existingIndex] = newDevice;
    } else {
        devices.push(newDevice);
    }

    renderDevices();
    saveDevices();
    deviceForm.reset();
});

// Eliminar dispositivo
function deleteDevice(index) {
    devices.splice(index, 1);
    renderDevices();
    saveDevices();
}

// Guardar dispositivos
async function saveDevices() {
    try {
        const formattedDevices = devices.map(device => {
            if (device.releaseDate) {
                device.releaseDate = formatDateToReadable(device.releaseDate);
            }
            return device;
        });

        const response = await fetch('/saveDevices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formattedDevices),
        });

        if (response.ok) {
            console.log('Dispositivos guardados correctamente.');
        } else {
            console.error('Error al guardar los dispositivos:', response.statusText);
        }
    } catch (error) {
        console.error('Error al guardar los dispositivos:', error);
    }
}

// Formatear fecha
function formatDateToYYYYMMDD(dateString) {
    const date = new Date(dateString);
    if (isNaN(date)) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Function to format date to "Month Day, Year"
function formatDateToReadable(dateString) {
    const date = new Date(dateString);
    if (isNaN(date)) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
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

// Botón de volver
document.getElementById('back-to-home').addEventListener('click', function (event) {
    event.preventDefault();
    location.reload();
    window.history.back();
});

// Call the setupScrollToTop function after the DOM is loaded
document.addEventListener("DOMContentLoaded", setupScrollToTop);

loadDevices();
