const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');

const baseUrl = 'https://everymac.com/systems/apple/ipad/index-ipad-specs.html';

async function scrapeiPads() {
  try {
    const response = await axios.get(baseUrl);
    const $ = cheerio.load(response.data);

    const iphoneLinks = [];
    $('#contentcenter_specs_externalnav_wrapper #contentcenter_specs_externalnav_2 a').each((i, element) => {
      const link = $(element).attr('href');
      if (link) {
        iphoneLinks.push(`https://everymac.com${link}`);
      }
    });

    const allDevicesInfo = [];
    let contador = 0;

    await Promise.all(iphoneLinks.map(async (link) => {
      const deviceInfo = await getDeviceInfo(link);
      if (deviceInfo.deviceName !== 'No encontrado') {
        allDevicesInfo.push(deviceInfo);
        contador++;
      }
    }));

    const jsonsFolderPath = path.join(__dirname, 'jsons');
    await fs.mkdir(jsonsFolderPath, { recursive: true });

    const filePath = path.join(jsonsFolderPath, 'alliPadInfo.json');
    await fs.writeFile(filePath, JSON.stringify(allDevicesInfo, null, 2), 'utf-8');
    console.log(`Datos guardados en ${filePath}`);
    console.log(`Total de dispositivos almacenados: ${contador}`);
  } catch (error) {
    console.error('Error al obtener los datos de los dispositivos:', error);
  }
}

async function getDeviceInfo(url) {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const nameDevice = $('#contentcenter h3').eq(0).text().trim();
    const processorDevice = $('#content7-title tbody tr td').eq(3).text().trim();
    const modelDevice = $('#content20-title tbody tr td').eq(1).text().trim();
    const ramDevice = $('#content8-title tbody tr td').eq(1).text().trim();
    const storageDevice = $('#content8-title tbody tr td').eq(3).text().trim();
    const orderDevice = $('#content19-title tbody tr td').eq(1).text().trim();
    const dateDevice = $('#content1-title tbody tr td').eq(1).text().trim();
    const colorDevice = $('#content13-title tbody tr td').eq(1).text().trim();

    return {
      deviceName: nameDevice || 'No encontrado',
      processor: processorDevice || 'No encontrado',
      model: modelDevice || 'No encontrado',
      ram: ramDevice || 'No encontrado',
      storage: storageDevice || 'No encontrado',
      appleOrderNo: orderDevice || 'No encontrado',
      releaseDate: dateDevice || 'No encontrado',
      color: colorDevice || 'No encontrado',
    };
  } catch (error) {
    console.error(`Error al obtener los datos de ${url}:`, error);
    return { deviceName: 'No encontrado' };
  }
}

scrapeiPads();

module.exports = { scrapeiPads };
