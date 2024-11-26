const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Fetch meta title and description from a given URL
 * @param {string} url - The URL of the webpage
 * @returns {Promise<object>} - An object containing the title and description
 */
async function getMetaInfo(url) {
  try {
    // Fetch the HTML content of the page
    const { data: html } = await axios.get(url);

    // Load the HTML into cheerio for parsing
    const $ = cheerio.load(html);

    // Extract the title and meta description
    const title = $('title').text() || 'No title found';
    const description = $('meta[name="description"]').attr('content') || 'No description found';

    return { title, description };
  } catch (error) {
    console.error('Error fetching meta info:', error.message);
    return { title: null, description: null, error: error.message };
  }
}

// Example usage
(async () => {
  const url = 'https://www.pornhub.com/view_video.php?viewkey=655473640ba2b';
  const metaInfo = await getMetaInfo(url);
  console.log(metaInfo);
})();