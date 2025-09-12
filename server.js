const express = require('express')
const next = require('next')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
require('dotenv').config()

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const port = process.env.PORT || 3000

app.prepare().then(() => {
  const server = express()
  server.use(bodyParser.json())
  server.use(cookieParser())

  // Simple password middleware for demo (replace with real auth in prod)
  server.use((req, res, nextMiddleware) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/_next') || req.path === '/login' || req.path.startsWith('/public')) {
      return nextMiddleware()
    }
    const pw = process.env.BASIC_PASSWORD || 'changeme'
    const token = req.cookies['auth']
    if (token === pw) return nextMiddleware()
    // redirect to login
    return res.redirect('/login')
  })

  // Mount API routes
  const api = require('./src/server/api')
  server.use('/api', api)

  // All other requests handled by Next
  server.all('*', (req, res) => handle(req, res))

  server.listen(port, err => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })
})
