const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');

async function scrapeAllDevices() {
  // Función centralizada para obtener la información de un dispositivo
  async function getDeviceInfo(url, selectors) {
    try {
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);

      const deviceInfo = {};

      // Iteramos sobre los selectores para obtener la información de cada propiedad del dispositivo
      for (const [key, selector] of Object.entries(selectors)) {
        deviceInfo[key] = $(selector).eq(0).text().trim() || 'No encontrado';
      }

      return deviceInfo;
    } catch (error) {
      console.error(`Error al obtener los datos de ${url}:`, error);
      return { deviceName: 'No encontrado' };
    }
  }

  // Función genérica para hacer scraping
  async function scrapeDevice(baseUrl, linkSelector, selectors, outputFilename) {
    try {
      const response = await axios.get(baseUrl);
      const $ = cheerio.load(response.data);

      const deviceLinks = [];
      $(linkSelector).each((i, element) => {
        const link = $(element).attr('href');
        if (link) {
          deviceLinks.push(`https://everymac.com${link}`);
        }
      });

      const allDevicesInfo = [];
      let contador = 0;

      await Promise.all(deviceLinks.map(async (link) => {
        const deviceInfo = await getDeviceInfo(link, selectors);
        if (deviceInfo.deviceName !== 'No encontrado') {
          allDevicesInfo.push(deviceInfo);
          contador++;
        }
      }));

      const jsonsFolderPath = path.join(__dirname, 'jsons');
      await fs.mkdir(jsonsFolderPath, { recursive: true });

      const filePath = path.join(jsonsFolderPath, outputFilename);
      await fs.writeFile(filePath, JSON.stringify(allDevicesInfo, null, 2), 'utf-8');
      console.log(`Datos guardados en ${filePath}`);
      console.log(`Total de dispositivos almacenados: ${contador}`);
    } catch (error) {
      console.error('Error al obtener los datos de los dispositivos:', error);
    }
  }

  // Scraping para iPhone
  const iphoneSelectors = {
    deviceName: '#contentcenter h3',
    model: '#content20-title tbody tr td:eq(1)',
    ram: '#content8-title tbody tr td:eq(1)',
    storage: '#content8-title tbody tr td:eq(3)',
    appleOrderNo: '#content19-title tbody tr td:eq(1)',
    releaseDate: '#content1-title tbody tr td:eq(1)',
    color: '#content13-title tbody tr td:eq(1)',
  };
  await scrapeDevice('https://everymac.com/systems/apple/iphone/index-iphone-specs.html', '#contentcenter_specs_externalnav_wrapper #contentcenter_specs_externalnav_2 a', iphoneSelectors, 'allPhonesInfo.json');

  // Scraping para iMac
  const imacSelectors = {
    deviceName: '#contentcenter h3',
    processor: '#specs8-title tbody tr td:eq(3)',
    model: '#specs31-title tbody tr td:eq(1)',
    appleOrderNo: '#specs30-title tbody tr td:eq(1)',
    ram: '#specs15-title tbody tr td:eq(1)',
    storage: '#specs21-title tbody tr td:eq(1)',
    releaseDate: '#specs1-title tbody tr td:eq(1)',
  };
  await scrapeDevice('https://everymac.com/systems/apple/imac/index-imac.html', '#contentcenter_specs_externalnav_wrapper #contentcenter_specs_externalnav_2 a', imacSelectors, 'allIMacInfo.json');

  // Scraping para Macbook Air
  const macbookSelectors = {
    deviceName: '#contentcenter h3',
    processor: '#specs8-title tbody tr td:eq(3)',
    model: '#specs31-title tbody tr td:eq(1)',
    ram: '#specs16-title tbody tr td:eq(1)',
    storage: '#specs21-title tbody tr td:eq(1)',
    appleOrderNo: '#specs30-title tbody tr td:eq(1)',
    releaseDate: '#specs1-title tbody tr td:eq(1)',
  };
  await scrapeDevice('https://everymac.com/systems/apple/macbook-air/index-macbook-air.html', '#contentcenter_specs_externalnav_wrapper #contentcenter_specs_externalnav_2 a', macbookSelectors, 'allMacbookAirInfo.json');

  // Scraping para iPad
  const ipadSelectors = {
    deviceName: '#contentcenter h3',
    processor: '#content7-title tbody tr td:eq(3)',
    model: '#content20-title tbody tr td:eq(1)',
    ram: '#content8-title tbody tr td:eq(1)',
    storage: '#content8-title tbody tr td:eq(3)',
    appleOrderNo: '#content19-title tbody tr td:eq(1)',
    releaseDate: '#content1-title tbody tr td:eq(1)',
    color: '#content13-title tbody tr td:eq(1)',
  };
  await scrapeDevice('https://everymac.com/systems/apple/ipad/index-ipad-specs.html', '#contentcenter_specs_externalnav_wrapper #contentcenter_specs_externalnav_2 a', ipadSelectors, 'allIPadInfo.json');

  // Scraping para Apple Watch
  const appleWatchSelectors = {
    deviceName: '#contentcenter h3',
    model: '#content11-title tbody tr td:eq(1)',
    appleOrderNo: '#content10-title tbody tr td:eq(1)',
    releaseDate: '#content1-title tbody tr td:eq(1)',
    size: '#content5-title tbody tr td:eq(3)',
    color: '#content6-title tbody tr td:eq(1)',
  };
  await scrapeDevice('https://everymac.com/systems/apple/apple-watch/index-apple-watch-specs.html', '#contentcenter_specs_externalnav_wrapper #contentcenter_specs_externalnav_2 a', appleWatchSelectors, 'allSmartwatchInfo.json');
}
scrapeAllDevices();
module.exports = { scrapeAllDevices };
