import React, { useState } from 'react';
import { uploadFile } from '../services/uploadService';

export default function UploadForm({ table, idColumn, idValue, onSuccess }) {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleFile(e) {
    setFile(e.target.files[0]);
    setError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) return setError('Please select a file');
    setLoading(true);
    setError(null);
    try {
      const extra = {};
      if (table && idColumn && idValue) { extra.table = table; extra.idColumn = idColumn; extra.idValue = idValue; }
      const resp = await uploadFile(file, extra, (p) => setProgress(Math.round(p * 100)));
      if (resp && resp.success) {
        setFile(null);
        setProgress(0);
        if (onSuccess) onSuccess(resp.url);
      } else {
        setError((resp && resp.error) || 'Upload failed');
      }
    } catch (err) {
      setError(err && err.error ? err.error : 'Upload failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input type="file" accept="image/*,.pdf" onChange={handleFile} />
      </div>
      {file && <div>{file.name}</div>}
      {progress > 0 && <div>Uploading: {progress}%</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <button type="submit" disabled={loading}>{loading ? 'Uploading...' : 'Upload'}</button>
    </form>
  );
}
