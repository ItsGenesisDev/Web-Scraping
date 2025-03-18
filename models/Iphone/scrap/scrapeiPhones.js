const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;  // Usamos fs.promises para evitar bloqueo
const path = require('path');

const baseUrl = 'https://everymac.com/systems/apple/iphone/index-iphone-specs.html';

async function scrapeiPhones() {
  try {
    const response = await axios.get(baseUrl);
    const $ = cheerio.load(response.data);

    // Extraer todos los enlaces a los modelos de iPhone
    const iphoneLinks = [];
    $('#contentcenter_specs_externalnav_wrapper #contentcenter_specs_externalnav_2 a').each((i, element) => {
      const link = $(element).attr('href');
      if (link) {
        iphoneLinks.push(`https://everymac.com${link}`);
      }
    });

    const allDevicesInfo = [];
    let contador = 0;  // Inicializamos el contador de dispositivos

    await Promise.all(iphoneLinks.map(async (link) => {
      const deviceInfo = await getDeviceInfo(link);
      if (deviceInfo.deviceName !== 'No encontrado') {
        allDevicesInfo.push(deviceInfo);
        contador++;
      }
    }));

      // Creamos la carpeta 'jsons' si no existe
      const jsonsFolderPath = path.join(__dirname, 'jsons'); // Usamos path.join para mayor compatibilidad
      await fs.mkdir(jsonsFolderPath, { recursive: true }); // recursive: true crea la carpeta y las subcarpetas necesarias

      // Guardamos todos los datos en un archivo JSON dentro de la carpeta 'jsons'
      const filePath = path.join(jsonsFolderPath, 'allPhonesInfo.json'); // Usamos path.join para crear la ruta completa
      await fs.writeFile(filePath, JSON.stringify(allDevicesInfo, null, 2), 'utf-8');
    console.log(`Datos guardados en ${filePath}`);
    console.log(`Total de dispositivos almacenados: ${contador}`);
  } catch (error) {
    console.error('Error al obtener los datos de los dispositivos:', error);
  }
}

// Función para extraer los datos de un dispositivo en una página de modelo
async function getDeviceInfo(url) {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // Obtener el nombre del dispositivo
    const nameDevice = $('#contentcenter h3').eq(0).text().trim();
    const modelDevice = $('#content20-title tbody tr td').eq(1).text().trim();
    const ramDevice = $('#content8-title tbody tr td').eq(1).text().trim();
    const storageDevice = $('#content8-title tbody tr td').eq(3).text().trim();
    const orderDevice = $('#content19-title tbody tr td').eq(1).text().trim();
    const dateDevice = $('#content1-title tbody tr td').eq(1).text().trim();
    const colorDevice = $('#content13-title tbody tr td').eq(1).text().trim();

    // Crear un objeto con los resultados
    return {
      deviceName: nameDevice || 'No encontrado',
      model: modelDevice || 'No encontrado',
      ram: ramDevice || 'No encontrado',
      storage: storageDevice || 'No encontrado',
      appleOrderNo: orderDevice || 'No encontrado',
      releaseDate: dateDevice || 'No encontrado',
      color: colorDevice || 'No encontrado',
    };
  } catch (error) {
    console.error(`Error al obtener los datos de ${url}:`, error);
    return { deviceName: 'No encontrado', error: error.message }; // En caso de error
  }
}

module.exports = { scrapeiPhones };
scrapeiPhones();
