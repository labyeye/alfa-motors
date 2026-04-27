const { upload } = require('../utils/multerMemory');
const { uploadBufferToXOZZ } = require('../utils/xozzUpload');
const { sequelize } = require('../db');


const singleUploadMiddleware = upload.single('file');


async function saveUrlToTable({ table, idColumn, idValue, urlColumn = 'image_url', url }) {
  
  const sql = `UPDATE \`${table}\` SET \`${urlColumn}\` = ? WHERE \`${idColumn}\` = ?`;
  const replacements = [url, idValue];
  return sequelize.query(sql, { replacements });
}

async function uploadHandler(req, res) {
  singleUploadMiddleware(req, res, async function (err) {
    try {
      if (err) {
        if (err.message === 'INVALID_FILE_TYPE') return res.status(400).json({ success: false, error: 'Invalid file type' });
        if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ success: false, error: 'File too large (max 5MB)' });
        return res.status(500).json({ success: false, error: 'Upload middleware error' });
      }

      if (!req.file || !req.file.buffer) {
        return res.status(400).json({ success: false, error: 'No file provided' });
      }

      const { originalname, mimetype, buffer } = req.file;

      
      const result = await uploadBufferToXOZZ(buffer, originalname, mimetype);
      const url = result.url;

      
      
      if (req.body && req.body.table && req.body.idColumn && req.body.idValue) {
        try {
          await saveUrlToTable({ table: req.body.table, idColumn: req.body.idColumn, idValue: req.body.idValue, urlColumn: req.body.urlColumn || 'image_url', url });
        } catch (saveErr) {
          console.error('[upload] SQL save failed', saveErr);
          
          return res.status(200).json({ success: true, url, warning: 'Uploaded but failed to save to DB' });
        }
      }

      return res.status(200).json({ success: true, url });
    } catch (e) {
      console.error('[upload] error', e);
      return res.status(500).json({ success: false, error: 'Server error during upload' });
    }
  });
}

module.exports = { uploadHandler };
