require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { uploadBufferToXOZZ } = require('../utils/xozzUpload');
const { sequelize } = require('../db');

const DEFAULT_CONFIG = {
  // sensible defaults for this project
  tables: [
    { table: 'galleries', idColumn: 'id', urlColumn: 'filename' },
    { table: 'rcs', idColumn: 'id', urlColumn: 'pdfUrl' },
    { table: 'cars', idColumn: 'id', urlColumn: 'photos' }
  ],
  concurrency: 3,
  retries: 3
};

const MAPPING_CSV = path.join(__dirname, 'migration_mapping.csv');

function ensureMappingFile() {
  if (!fs.existsSync(MAPPING_CSV)) {
    fs.writeFileSync(MAPPING_CSV, 'table,id,oldUrl,newUrl,timestamp\n');
  }
}

function appendMapping(table, id, oldUrl, newUrl) {
  ensureMappingFile();
  const line = `${table},${id},"${oldUrl.replace(/"/g,'""')}","${newUrl.replace(/"/g,'""')}",${new Date().toISOString()}\n`;
  fs.appendFileSync(MAPPING_CSV, line);
}

function loadExistingMappings() {
  const seen = new Map();
  if (!fs.existsSync(MAPPING_CSV)) return seen;
  const data = fs.readFileSync(MAPPING_CSV, 'utf8').split('\n').slice(1);
  for (const line of data) {
    if (!line) continue;
    // simple CSV split (oldUrl is quoted)
    const parts = line.match(/^(.*?),(.*?),"(.*?)","(.*?)",(.*)$/);
    if (parts) seen.set(parts[3], parts[4]);
  }
  return seen;
}

// Load existing mapping file into memory so we can skip already-migrated URLs
const existingMappings = loadExistingMappings();

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchRowsWithCloudinary(table, urlColumn) {
  // Fetch rows and filter in JS to support JSON columns (arrays) and different column types.
  const sql = `SELECT * FROM \`${table}\``;
  const [results] = await sequelize.query(sql);
  return results.filter((row) => {
    const val = row[urlColumn];
    if (!val) return false;
    if (typeof val === 'string') {
      return val.includes('cloudinary.com') || val.includes('res.cloudinary.com');
    }
    // for JSON/array columns
    try {
      const asJson = typeof val === 'object' ? val : JSON.parse(val);
      if (Array.isArray(asJson)) return asJson.some(v => typeof v === 'string' && (v.includes('cloudinary.com') || v.includes('res.cloudinary.com')));
      // if object: check its values
      if (asJson && typeof asJson === 'object') return Object.values(asJson).some(v => typeof v === 'string' && (v.includes('cloudinary.com') || v.includes('res.cloudinary.com')));
    } catch (e) {
      // not JSON
    }
    return false;
  });
}

async function updateRowUrl(table, idColumn, idValue, urlColumn, newUrl) {
  // Some MySQL/MariaDB versions do not support CAST(... AS JSON). Use a parameterized
  // update and ensure JSON values are passed as strings. If the DB rejects the value
  // due to constraints, surface the error so caller can log it.
  const value = (typeof newUrl === 'string') ? newUrl : JSON.stringify(newUrl);
  const sql = `UPDATE \`${table}\` SET \`${urlColumn}\` = ? WHERE \`${idColumn}\` = ?`;
  try {
    return await sequelize.query(sql, { replacements: [value, idValue] });
  } catch (err) {
    // If the DB specifically rejects JSON input with syntax errors for CAST, try a
    // fallback that wraps the value with JSON_UNQUOTE(JSON_QUOTE(?)) for some engines.
    // This is a best-effort fallback; if it fails, rethrow the original error.
    try {
      const fallbackSql = `UPDATE \`${table}\` SET \`${urlColumn}\` = JSON_UNQUOTE(JSON_QUOTE(?)) WHERE \`${idColumn}\` = ?`;
      return await sequelize.query(fallbackSql, { replacements: [value, idValue] });
    } catch (err2) {
      // rethrow original for clearer debugging
      throw err;
    }
  }
}

function extractFilenameFromUrl(url) {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split('/'); 
    const candidate = parts.pop() || parts.pop();
    // remove query string
    return candidate.split('?')[0];
  } catch (e) {
    // fallback: last segment after slash
    const parts = url.split('/');
    return parts.pop().split('?')[0];
  }
}

function sanitizeUrlCandidate(raw) {
  if (!raw || typeof raw !== 'string') return raw;
  // remove common control characters (including newlines, CR, tabs)
  let s = raw.replace(/[[\u0000-\u001F\u007F]]/g, '');
  // remove zero-width and other invisible chars
  s = s.replace(/\p{C}/gu, '');
  // try to extract first http(s) URL-like substring
  const m = s.match(/https?:\/\/[^"'\s>]+/i);
  if (m && m[0]) return m[0].trim();
  // fallback: remove all whitespace and return
  s = s.replace(/\s+/g, '');
  return s.trim();
}

async function retryOperation(fn, attempts = 3, baseDelay = 500) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const delay = baseDelay * Math.pow(2, i);
      console.log(`    [retry] attempt=${i+1} failed: ${err.message || err}. retrying in ${delay}ms`);
      await sleep(delay);
    }
  }
  throw lastErr;
}

async function downloadToBuffer(url, timeout = 100000) {
  const resp = await axios.get(url, { responseType: 'arraybuffer', timeout });
  return Buffer.from(resp.data);
}

async function migrateTableRows(tableSpec, opts) {
  const { table, idColumn, urlColumn } = tableSpec;
  console.log(`Scanning table ${table} column ${urlColumn}...`);
  const rows = await fetchRowsWithCloudinary(table, urlColumn);
  console.log(`Found ${rows.length} rows in ${table}`);

  for (const row of rows) {
    const idValue = row[idColumn];
    let cell = row[urlColumn];
    console.log(`Migrating row ${table}.${idColumn}=${idValue} -> ${String(cell).slice(0,120)}`);
    try {
      // handle JSON arrays
      if (cell && typeof cell !== 'string') {
        // already parsed by driver
        const arr = Array.isArray(cell) ? cell : Object.values(cell || {});
        const out = [];
        for (const item of arr) {
            if (item && typeof item === 'string' && (item.includes('cloudinary.com') || item.includes('res.cloudinary.com'))) {
            const san = sanitizeUrlCandidate(item);
            if (san !== item) console.log(`    [sanitize] fixed broken URL substring -> ${san}`);
            // skip if we've already uploaded this exact old URL
            const mapped = existingMappings.get(san);
            if (mapped) {
              out.push(mapped);
              console.log(`  -> skipped already-mapped ${san} -> ${mapped}`);
            } else {
              const buf = await retryOperation(() => downloadToBuffer(san), opts.retries || 3, 500);
              const filename = extractFilenameFromUrl(san);
              const result = await retryOperation(() => uploadBufferToXOZZ(buf, filename, undefined, { retries: opts.retries }), opts.retries || 3, 500);
              out.push(result.url || san);
              appendMapping(table, idValue, san, result.url || '');
              existingMappings.set(san, result.url || '');
              console.log(`  -> migrated item ${san} -> ${result.url}`);
            }
          } else {
            out.push(item);
          }
        }
        // save as JSON
        await updateRowUrl(table, idColumn, idValue, urlColumn, JSON.stringify(out));
        await sleep(300);
        continue;
      }

      // string: may contain a single url or comma-separated list
      const asStr = String(cell || '');
      // if looks like JSON
      if (asStr.trim().startsWith('[') || asStr.trim().startsWith('{')) {
        try {
          const parsed = JSON.parse(asStr);
          if (Array.isArray(parsed)) {
            const out = [];
            for (const item of parsed) {
                if (item && typeof item === 'string' && (item.includes('cloudinary.com') || item.includes('res.cloudinary.com'))) {
                const san = sanitizeUrlCandidate(item);
                if (san !== item) console.log(`    [sanitize] fixed broken URL substring -> ${san}`);
                const mapped = existingMappings.get(san);
                if (mapped) {
                  out.push(mapped);
                  console.log(`  -> skipped already-mapped ${san} -> ${mapped}`);
                } else {
                  const buf = await retryOperation(() => downloadToBuffer(san), opts.retries || 3, 500);
                  const filename = extractFilenameFromUrl(san);
                  const result = await retryOperation(() => uploadBufferToXOZZ(buf, filename, undefined, { retries: opts.retries }), opts.retries || 3, 500);
                  out.push(result.url || san);
                  appendMapping(table, idValue, san, result.url || '');
                  existingMappings.set(san, result.url || '');
                  console.log(`  -> migrated item ${san} -> ${result.url}`);
                }
              } else out.push(item);
            }
            await updateRowUrl(table, idColumn, idValue, urlColumn, JSON.stringify(out));
            await sleep(300);
            continue;
          }
        } catch (e) {
          // fall through
        }
      }

      // handle simple string URL
      const candidate = asStr.split(',')[0];
      const oldUrl = sanitizeUrlCandidate(candidate);
      if (!oldUrl) continue;
      // skip if already mapped
      const mapped = existingMappings.get(oldUrl);
      if (mapped) {
        await updateRowUrl(table, idColumn, idValue, urlColumn, JSON.stringify([mapped]));
        console.log(`SKIP-UPDATE: ${oldUrl} already mapped -> ${mapped}`);
        continue;
      }
      const buf = await retryOperation(() => downloadToBuffer(oldUrl), opts.retries || 3, 500);
      const filename = extractFilenameFromUrl(oldUrl);
      const result = await retryOperation(() => uploadBufferToXOZZ(buf, filename, undefined, { retries: opts.retries }), opts.retries || 3, 500);
      const newUrl = result.url;
      appendMapping(table, idValue, oldUrl, newUrl);
      existingMappings.set(oldUrl, newUrl);
      await updateRowUrl(table, idColumn, idValue, urlColumn, newUrl);
      console.log(`SUCCESS: ${oldUrl} -> ${newUrl}`);
      await sleep(300); // gentle pacing
    } catch (err) {
      console.error(`FAILED to migrate ${table}.${idValue}:`, err.message || err);
      fs.appendFileSync(path.join(__dirname, 'migration_errors.log'), `${new Date().toISOString()}\t${table}\t${idValue}\t${String(cell)}\t${err.message || err}\n`);
    }
  }
}

async function main() {
  const cfgPath = process.argv[2];
  let cfg = DEFAULT_CONFIG;
  if (cfgPath) {
    cfg = Object.assign(cfg, JSON.parse(fs.readFileSync(cfgPath, 'utf8')));
  }

  for (const t of cfg.tables) {
    await migrateTableRows(t, { retries: cfg.retries || 3 });
  }
  console.log('Migration finished');
}

if (require.main === module) {
  main().catch(err => { console.error(err); process.exit(1); });
}
