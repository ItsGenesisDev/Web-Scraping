const deviceForm = document.getElementById('device-form');
const deviceList = document.getElementById('devices');
const deviceTypeSelect = document.getElementById('deviceType');

let devices = []; // Local array to store devices

// Fetch existing devices from the selected JSON file
async function loadDevices() {
    try {
        const selectedType = deviceTypeSelect.value; // Get selected device type
        const response = await fetch(selectedType);
        devices = await response.json();
        renderDevices();
    } catch (error) {
        console.error('Error al cargar los dispositivos:', error);
    }
}

// Reload devices when the device type changes
deviceTypeSelect.addEventListener('change', loadDevices);

const addButton = document.getElementById('add-button');
const updateButton = document.getElementById('update-button');
let selectedDeviceIndex = null; // Track the selected device for updating

// Add a new device
addButton.addEventListener('click', () => {
    const formData = new FormData(deviceForm);
    const newDevice = Object.fromEntries(formData.entries());

    // Format the releaseDate field if it's a valid date
    if (newDevice.releaseDate) {
        newDevice.releaseDate = formatDateToYYYYMMDD(newDevice.releaseDate);
    }

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

        // Format the releaseDate field if it's a valid date
        if (updatedDevice.releaseDate) {
            updatedDevice.releaseDate = formatDateToYYYYMMDD(updatedDevice.releaseDate);
        }

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

// Render the list of devices with the new structure
function renderDevices() {
    deviceList.innerHTML = '';
    devices.forEach((device, index) => {
        const li = document.createElement('li');
        
        // Create device header with title and actions
        const header = document.createElement('div');
        header.className = 'device-header';
        
        const title = document.createElement('div');
        title.className = 'device-title';
        title.textContent = device.deviceName;
        
        const actions = document.createElement('div');
        actions.className = 'device-actions';
        
        const editButton = document.createElement('button');
        editButton.className = 'edit';
        editButton.innerHTML = '<i class="material-icons" style="vertical-align: middle;">edit</i> Editar';
        editButton.onclick = () => selectDevice(index);
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete';
        deleteButton.innerHTML = '<i class="material-icons" style="vertical-align: middle;">delete</i> Eliminar';
        deleteButton.onclick = () => deleteDevice(index);
        
        actions.appendChild(editButton);
        actions.appendChild(deleteButton);
        
        header.appendChild(title);
        header.appendChild(actions);
        
        // Create device info section
        const info = document.createElement('div');
        info.className = 'device-info';
        
        // Add all device fields
        const fields = ['model', 'ram', 'storage', 'appleOrderNo', 'releaseDate', 'color'];
        fields.forEach(field => {
            if (device[field]) {
                const span = document.createElement('span');
                span.textContent = `${field.charAt(0).toUpperCase() + field.slice(1)}: ${device[field]}`;
                info.appendChild(span);
            }
        });
        
        li.appendChild(header);
        li.appendChild(info);
        deviceList.appendChild(li);
    });
}

// Delete a device
function deleteDevice(index) {
    if (confirm('¿Estás seguro de que quieres eliminar este dispositivo?')) {
        devices.splice(index, 1);
        renderDevices();
        saveDevices();
        
        // Reset form if the deleted device was being edited
        if (selectedDeviceIndex === index) {
            deviceForm.reset();
            updateButton.disabled = true;
            selectedDeviceIndex = null;
            addButton.style.display = 'inline-block';
            updateButton.style.display = 'none';
        }
    }
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

// Function to format date to yyyy-MM-dd
function formatDateToYYYYMMDD(dateString) {
    const date = new Date(dateString);

    // Check if the date is valid
    if (isNaN(date)) {
        return ''; // Return empty string if the date is invalid
    }

    // Get year, month (0-indexed), and day
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Ensure month has 2 digits
    const day = String(date.getDate()).padStart(2, '0'); // Ensure day has 2 digits

    // Return the date in yyyy-MM-dd format
    return `${year}-${month}-${day}`;
}

document.getElementById('back-to-home').addEventListener('click', function (event) {
    event.preventDefault(); // Evita el comportamiento predeterminado del enlace
    location.reload();
    window.history.back(); // Regresa a la página anterior
});

// Initialize the app
loadDevices();