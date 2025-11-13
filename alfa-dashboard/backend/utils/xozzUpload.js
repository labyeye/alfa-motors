const axios = require('axios');
const FormData = require('form-data');

const XOZZ_ENDPOINT = process.env.XOZZ_UPLOAD_ENDPOINT || 'https://media.alfamotorworld.com/upload.php';
const XOZZ_BASE = process.env.XOZZ_BASE_URL || 'https://media.alfamotorworld.com/uploads/';

async function uploadBufferToXOZZ(buffer, filename, mimeType, { retries = 3, timeout = 20000 } = {}) {
  let lastErr = null;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const form = new FormData();
      // XOZZ upload.php expects file field; using "file" commonly
      form.append('file', buffer, { filename, contentType: mimeType });

      const headers = form.getHeaders();
      const resp = await axios.post(XOZZ_ENDPOINT, form, { headers, timeout });

      // Acceptable responses:
      // - JSON { success: true, url: '...' }
      // - Plain text returning filename
      // - 200 with Location header
      const data = resp.data;
      if (data && typeof data === 'object') {
        if (data.url) return { url: data.url, raw: data };
        if (data.filename) return { url: XOZZ_BASE + data.filename, raw: data };
      }

      if (typeof data === 'string') {
        // If echoing filename only
        const trimmed = data.trim();
        if (trimmed.startsWith('http')) return { url: trimmed, raw: data };
        // assume filename
        return { url: XOZZ_BASE + encodeURIComponent(trimmed), raw: data };
      }

      // Fallback: Location header
      const loc = resp.headers && (resp.headers.location || resp.headers.Location);
      if (loc) return { url: loc, raw: resp.data };

      // If nothing returned, construct URL from filename
      return { url: XOZZ_BASE + encodeURIComponent(filename), raw: resp.data };
    } catch (err) {
      lastErr = err;
      // simple exponential backoff
      await new Promise(r => setTimeout(r, 500 * attempt));
    }
  }
  throw lastErr;
}

module.exports = { uploadBufferToXOZZ };
