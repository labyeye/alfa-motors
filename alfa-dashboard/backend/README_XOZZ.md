# XOZZ Upload Integration (Backend)

This document explains the new XOZZ-based upload flow and migration tools.

Environment variables
- `XOZZ_UPLOAD_ENDPOINT` - XOZZ upload endpoint (default: `https://media.alfamotorworld.com/upload.php`)
- `XOZZ_BASE_URL` - base URL where files are served (default: `https://media.alfamotorworld.com/uploads/`)

Install dependencies

```bash
cd alfa-dashboard/backend
npm install axios form-data multer
```

Routes
- `POST /upload` — accepts `multipart/form-data` with field `file` (single). Optional body fields: `table`, `idColumn`, `idValue`, `urlColumn` to store the returned XOZZ URL into SQL.

Response (success):
```json
{ "success": true, "url": "https://media.alfamotorworld.com/uploads/<filename>" }
```

SQL examples

- Update column type to allow long URLs (if needed):

```sql
ALTER TABLE Cars MODIFY COLUMN image_url VARCHAR(2083);
```

- Convert existing Cloudinary URLs to XOZZ by keeping filename (example for `Cars.image_url`):

```sql
UPDATE Cars
SET image_url = CONCAT('https://media.alfamotorworld.com/uploads/', SUBSTRING_INDEX(image_url, '/', -1))
WHERE image_url LIKE '%cloudinary.com%';
```

The above assumes the Cloudinary URL ends with the original filename (e.g. `.../v123456/file.jpg`). If your files were stored as unique IDs or transformations, use the migration script instead.

Migration
- Node script: `backend/scripts/migrate_cloudinary_to_xozz.js` — will download Cloudinary images, upload to XOZZ and update DB rows. Provide a JSON config with table mapping if needed.

Usage example:

```bash
cd alfa-dashboard/backend
node scripts/migrate_cloudinary_to_xozz.js migration_config.json
```

Frontend
- Use `frontend/src/components/UploadForm.jsx` and `frontend/src/components/ImagePreview.jsx`.
- Set `REACT_APP_API_BASE` or `NEXT_PUBLIC_API_BASE` to point to your backend base URL.

Notes
- Allowed file types: jpg, jpeg, png, webp, pdf
- Max size: 5MB
- The server stores files on XOZZ (external) and only stores the XOZZ URL in SQL.
