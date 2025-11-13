const axios = require('axios');
(async function(){
  try {
    const url = 'https://res.cloudinary.com/djfqzcbib/image/upload/v1761419427/alfa-motors/cars/zhf5yhfrynxyoan1tsuq.jpg';
    console.log('Attempting download:', url);
    const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 });
    console.log('Downloaded bytes:', res.data.byteLength || res.data.length);
  } catch (e) {
    console.error('Download failed:', e.message || e);
  }
})();
