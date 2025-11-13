// uploadService.js
// Sends file to backend /upload route. Uses env var REACT_APP_API_BASE or defaults to ''
const API_BASE = process.env.REACT_APP_API_BASE || process.env.NEXT_PUBLIC_API_BASE || '';

export async function uploadFile(file, extraFields = {}, onProgress) {
  const url = `${API_BASE}/upload`;
  const form = new FormData();
  form.append('file', file, file.name);
  Object.keys(extraFields || {}).forEach(k => form.append(k, extraFields[k]));

  // Use fetch with progress: not directly available; use XMLHttpRequest for progress
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.onload = () => {
      try {
        const resp = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) return resolve(resp);
        return reject(resp);
      } catch (e) { return reject({ success: false, error: 'Invalid JSON response' }); }
    };
    xhr.onerror = () => reject({ success: false, error: 'Network error' });
    if (xhr.upload && onProgress) xhr.upload.onprogress = (e) => onProgress(e.loaded / e.total);
    xhr.send(form);
  });
}
