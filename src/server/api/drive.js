const express = require('express')
const router = express.Router()
const multer = require('multer')
const upload = multer({ storage: multer.memoryStorage() })
const { google } = require('googleapis')
const db = require('./db')
require('dotenv').config()
const fs = require('fs')

// initialize auth using service account JSON file path (preferred) or GOOGLE_SERVICE_ACCOUNT_JSON env
function authClient() {
  let key = null
  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH) {
    const path = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH
    if (!fs.existsSync(path)) throw new Error(`Service account key file not found at ${path}`)
    key = JSON.parse(fs.readFileSync(path, 'utf8'))
  } else if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    key = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
  }
  if (key) {
    const jwt = new google.auth.JWT(key.client_email, null, key.private_key, ['https://www.googleapis.com/auth/drive'])
    return jwt
  }
  throw new Error('No service account configured: set GOOGLE_SERVICE_ACCOUNT_KEY_PATH or GOOGLE_SERVICE_ACCOUNT_JSON')
}

router.post('/upload/:eventId', upload.single('file'), async (req, res) => {
  try {
    const auth = authClient()
    await auth.authorize()
    const drive = google.drive({ version: 'v3', auth })
    const fileMetadata = {
      name: req.file.originalname,
      parents: process.env.GOOGLE_DRIVE_FOLDER_ID ? [process.env.GOOGLE_DRIVE_FOLDER_ID] : undefined
    }
    // Use buffer as stream for upload
    const stream = require('stream')
    const bufferStream = new stream.PassThrough()
    bufferStream.end(req.file.buffer)

    const resp = await drive.files.create({
      requestBody: fileMetadata,
      media: { mimeType: req.file.mimetype, body: bufferStream },
      fields: 'id,webViewLink'
    })
    const fileId = resp.data.id
    // Make file shareable (anyone with link)
    await drive.permissions.create({ fileId, requestBody: { role: 'reader', type: 'anyone' } })
    const file = await drive.files.get({ fileId, fields: 'webViewLink, id' })

    // store in DB
    const { rows } = await db.query(
      'INSERT INTO media(event_id,file_name,file_type,drive_file_id,drive_url,uploaded_by,uploaded_at) VALUES($1,$2,$3,$4,$5,$6,NOW()) RETURNING *',
      [req.params.eventId, req.file.originalname, req.file.mimetype, fileId, file.data.webViewLink, 1]
    )

    res.json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
