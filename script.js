const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// Ruta para el almacenamiento de los datos
const jsonFilePath = path.join(__dirname, 'products.json');
const csvFilePath = path.join(__dirname, 'products.csv');

// Cache para páginas traídas
const cache = {};

// Función para traer HTML con caching
async function fetchHTML(url) {
  if (cache[url]) {
    console.log(`Fetching from cache: ${url}`);
    return cache[url];
  }

  try {
    const { data } = await axios.get(url);
    cache[url] = data;
    console.log(`Fetched from network: ${url}`);
    return data;
  } catch (error) {
    console.error('Error fetching the HTML:', error);
    throw error;
  }
}

// Función para extraer las fechas (Introduction)
function extractDates(html) {
  const $ = cheerio.load(html);
  let Date = '';

  $('#contentcenter_specs_internalnav_2 table tbody tr').each((index, element) => {
    const cells = $(element).find('td').map((i, td) => $(td).text().trim()).get();
    if (cells[0] === 'Intro.') {
      Date = cells[1];
    }
  });

  return { Date };
}
// Función para extraer la información del procesador
function extractProcessor(html) {
  const $ = cheerio.load(html);
  let Processor = '';
  $('#contentcenter_specs_table contentcenter_specs_table_pairs table tbody tr').each((index, element) => {
    const cells = $(element).find('td').map((i, td) => $(td).text().trim()).get();
    if (cells[0] === 'Intro.') {
      Processor = cells[1];
    }
  });

  return { Processor };
}


// Función para extraer cada producto de la data
function extractProducts(html) {
  const $ = cheerio.load(html);
  const products = [];

  const { Date } = extractDates(html);
  
  $('#contentcenter_specs_externalnav_wrapper').each((index, element) => {
    const iphoneName = $(element).find('#contentcenter_specs_externalnav_2 a').text().trim();
    const iphoneStorage = $(element).find('#contentcenter_specs_externalnav_3').text().trim();

    if (iphoneName && iphoneStorage) {
      products.push({
        name: iphoneName,
        Storage: iphoneStorage,
        Date: Date,
      });
    }
  });

  return products;
}

// Función para guardar los archivos en JSON
function saveToJSON(data) {
  fs.writeFileSync(jsonFilePath, JSON.stringify(data, null, 2));
  console.log(`Data saved to products.json`);
}

// Función para guardar los archivos en CSV
function saveToCSV(data) {
  const csvHeader = 'Name,Storage,Date,Model\n'; // Incluye la columna Model
  const csvRows = data.map(product =>
    `${product.name.replace(/,/g, '')},${product.Storage.replace(/,/g, '')},${product.aModel.replace(/,/g, '')}`).join('\n'); // Agrega el modelo al CSV
  fs.writeFileSync(csvFilePath, csvHeader + csvRows);
  console.log(`Data saved to products.csv`);
}

// Función para scrapear productos desde múltiples páginas
async function scrapeProducts(url, allProducts = []) {
  try {
    const html = await fetchHTML(url);
    const products = extractProducts(html);
    allProducts = allProducts.concat(products);

    saveToJSON(allProducts);
    saveToCSV(allProducts);

    const $ = cheerio.load(html);
    const nextPage = $('.next > a').attr('href');
    if (nextPage && nextPage.indexOf("#") == -1) {
      const nextUrl = new URL(nextPage, url).href;
      await scrapeProducts(nextUrl, allProducts);
    }

  } catch (error) {
    console.error('Failed to scrape the website:', error);
  }
}

(async () => {
  const baseURL = 'https://everymac.com/systems/apple/iphone/index-iphone-specs.html';
  await scrapeProducts(baseURL);
})();