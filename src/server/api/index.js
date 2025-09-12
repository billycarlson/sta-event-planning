const express = require('express')
const router = express.Router()

// Simple auth route
router.post('/login', (req, res) => {
  const { password } = req.body
  const pw = process.env.BASIC_PASSWORD || 'changeme'
  if (password === pw) {
    res.cookie('auth', pw, { httpOnly: true })
    return res.json({ ok: true })
  }
  return res.status(401).json({ ok: false })
})

// DB helper
const db = require('./db')

// Events
router.get('/events', async (req, res) => {
  const { q, status, start, end, category } = req.query
  try {
    let sql = 'SELECT * FROM events'
    const params = []
    const where = []
    if (status) { where.push(`status = $${params.length+1}`); params.push(status) }
    if (q) { where.push(`(title ILIKE $${params.length+1} OR description ILIKE $${params.length+1})`); params.push(`%${q}%`) }
    if (start) { where.push(`date >= $${params.length+1}`); params.push(start) }
    if (end) { where.push(`date <= $${params.length+1}`); params.push(end) }
    if (category) { where.push(`type = $${params.length+1}`); params.push(category) }
    if (where.length) sql += ' WHERE ' + where.join(' AND ')
    sql += ' ORDER BY date ASC'
    const { rows } = await db.query(sql, params)
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'db' })
  }
})

// Distinct event categories
router.get('/events/categories', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT DISTINCT type FROM events WHERE type IS NOT NULL ORDER BY type ASC')
    res.json(rows.map(r => r.type))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'db' })
  }
})

router.get('/events/:id', async (req, res) => {
  const { id } = req.params
  try {
    const { rows } = await db.query('SELECT * FROM events WHERE id=$1', [id])
    if (!rows.length) return res.status(404).json({ error: 'not found' })
    res.json(rows[0])
  } catch (err) { console.error(err); res.status(500).json({ error: 'db' }) }
})

router.post('/events', async (req, res) => {
  const e = req.body
  try {
    const { rows } = await db.query(
      `INSERT INTO events(title, description, date, time, location, type, status, speakers, sponsors, budget, created_at, updated_at)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW(),NOW()) RETURNING *`,
      [e.title,e.description,e.date,e.time,e.location,e.type,e.status,e.speakers,e.sponsors,e.budget]
    )
    res.json(rows[0])
  } catch (err) { console.error(err); res.status(500).json({ error: 'db' }) }
})

// Notes
router.get('/events/:id/notes', async (req, res) => {
  const { id } = req.params
  try {
    const { rows } = await db.query('SELECT notes.*, users.name FROM notes LEFT JOIN users ON users.id = notes.user_id WHERE event_id=$1 ORDER BY timestamp ASC', [id])
    res.json(rows)
  } catch (err) { console.error(err); res.status(500).json({ error: 'db' }) }
})

router.post('/events/:id/notes', async (req, res) => {
  const { id } = req.params
  const { user_id, content } = req.body
  try {
    const { rows } = await db.query('INSERT INTO notes(event_id,user_id,content,timestamp) VALUES($1,$2,$3,NOW()) RETURNING *', [id,user_id,content])
    res.json(rows[0])
  } catch (err) { console.error(err); res.status(500).json({ error: 'db' }) }
})

// Tasks
router.get('/events/:id/tasks', async (req, res) => {
  const { id } = req.params
  try { const { rows } = await db.query('SELECT * FROM tasks WHERE event_id=$1 ORDER BY due_date ASC', [id]); res.json(rows) }
  catch (err) { console.error(err); res.status(500).json({ error: 'db' }) }
})

router.post('/events/:id/tasks', async (req, res) => {
  const { id } = req.params
  const { description, assigned_to, due_date, status } = req.body
  try { const { rows } = await db.query('INSERT INTO tasks(event_id,description,assigned_to,due_date,status) VALUES($1,$2,$3,$4,$5) RETURNING *', [id,description,assigned_to,due_date,status]); res.json(rows[0]) }
  catch (err) { console.error(err); res.status(500).json({ error: 'db' }) }
})

// media list for event
router.get('/events/:id/media', async (req, res) => {
  const { id } = req.params
  try { const { rows } = await db.query('SELECT * FROM media WHERE event_id=$1 ORDER BY uploaded_at DESC', [id]); res.json(rows) }
  catch (err) { console.error(err); res.status(500).json({ error: 'db' }) }
})

// Local file upload for media
const multer = require('multer')
const path = require('path')
const fs = require('fs')

// ensure uploads dir exists
const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, uploadsDir) },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random()*1e9)
    const ext = path.extname(file.originalname)
    cb(null, `${unique}${ext}`)
  }
})
const upload = multer({ storage })

// POST /api/events/:id/media -> accept file upload and save local record
router.post('/events/:id/media', upload.single('file'), async (req, res) => {
  const { id } = req.params
  if (!req.file) return res.status(400).json({ error: 'no file' })
  const fileUrl = `/uploads/${req.file.filename}`
  try {
    const { rows } = await db.query(
      `INSERT INTO media(event_id, user_id, filename, url, uploaded_at) VALUES($1,$2,$3,$4,NOW()) RETURNING *`,
      [id, req.body.user_id || null, req.file.originalname, fileUrl]
    )
    res.json(rows[0])
  } catch (err) { console.error(err); res.status(500).json({ error: 'db' }) }
})

module.exports = router
