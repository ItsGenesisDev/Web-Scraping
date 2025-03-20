const deviceForm = document.getElementById('device-form');
const deviceList = document.getElementById('devices');

let devices = []; // Local array to store devices

// Fetch existing devices from JSON files
async function loadDevices() {
    try {
        const response = await fetch('/Iphone/jsons/allPhonesInfo.json');
        devices = await response.json();
        renderDevices();
    } catch (error) {
        console.error('Error al cargar los dispositivos:', error);
    }
}

const addButton = document.getElementById('add-button');
const updateButton = document.getElementById('update-button');
let selectedDeviceIndex = null; // Track the selected device for updating

// Add a new device
addButton.addEventListener('click', () => {
    const formData = new FormData(deviceForm);
    const newDevice = Object.fromEntries(formData.entries());

    devices.push(newDevice); // Add new device
    renderDevices();
    saveDevices();
    deviceForm.reset();

    addButton.style.display = 'inline-block'; // Ensure "Agregar" button is visible
    updateButton.style.display = 'none'; // Ensure "Actualizar" button is hidden
});

// Update an existing device
updateButton.addEventListener('click', () => {
    if (selectedDeviceIndex !== null) {
        const formData = new FormData(deviceForm);
        const updatedDevice = Object.fromEntries(formData.entries());

        devices[selectedDeviceIndex] = updatedDevice; // Update the selected device
        renderDevices();
        saveDevices();
        deviceForm.reset();
        updateButton.disabled = true; // Disable the update button
        selectedDeviceIndex = null;

        addButton.style.display = 'inline-block'; // Show the "Agregar" button
        updateButton.style.display = 'none'; // Hide the "Actualizar" button
    }
});

// Select a device for editing
function selectDevice(index) {
    const device = devices[index];
    selectedDeviceIndex = index;

    // Populate the form with the selected device's data
    for (const key in device) {
        const input = deviceForm.elements[key];
        if (input) input.value = device[key];
    }

    updateButton.disabled = false; // Enable the update button
    addButton.style.display = 'none'; // Hide the "Agregar" button
    updateButton.style.display = 'inline-block'; // Show the "Actualizar" button
}

// Render the list of devices
function renderDevices() {
    deviceList.innerHTML = '';
    devices.forEach((device, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${device.deviceName} (${device.model})
            <button onclick="selectDevice(${index})">Editar</button>
            <button onclick="deleteDevice(${index})">Eliminar</button>
        `;
        deviceList.appendChild(li);
    });
}

// Add or update a device
deviceForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(deviceForm);
    const newDevice = Object.fromEntries(formData.entries());

    const existingIndex = devices.findIndex(device => device.deviceName === newDevice.deviceName);
    if (existingIndex !== -1) {
        devices[existingIndex] = newDevice; // Update existing device
    } else {
        devices.push(newDevice); // Add new device
    }

    renderDevices();
    saveDevices();
    deviceForm.reset();
});

// Delete a device
function deleteDevice(index) {
    devices.splice(index, 1);
    renderDevices();
    saveDevices();
}

// Save devices to the JSON file
async function saveDevices() {
    try {
        const response = await fetch('/saveDevices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(devices),
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

// Initialize the app
loadDevices();
