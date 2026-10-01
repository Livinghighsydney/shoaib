const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db/database');
const auth = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|svg/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase()) &&
                allowed.test(file.mimetype);
    ok ? cb(null, true) : cb(new Error('Only image files allowed'));
  },
});

// GET all content
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT key, value FROM content').all();
  const content = {};
  rows.forEach(({ key, value }) => {
    try { content[key] = JSON.parse(value); } catch { content[key] = value; }
  });
  res.json(content);
});

// GET single section
router.get('/:key', (req, res) => {
  const row = db.prepare('SELECT value FROM content WHERE key = ?').get(req.params.key);
  if (!row) return res.status(404).json({ error: 'Section not found' });
  try { res.json(JSON.parse(row.value)); } catch { res.json(row.value); }
});

// PUT update section (admin only)
router.put('/:key', auth, (req, res) => {
  const value = JSON.stringify(req.body);
  db.prepare(
    'INSERT OR REPLACE INTO content (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)'
  ).run(req.params.key, value);
  res.json({ success: true });
});

// POST upload image (admin only)
router.post('/upload/image', auth, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ url: `/uploads/${req.file.filename}` });
});

module.exports = router;
