import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import './db.js'
import { uploadsDir } from './middleware/upload.js'

import authRoutes from './routes/auth.routes.js'
import categoriesRoutes from './routes/categories.routes.js'
import productsRoutes from './routes/products.routes.js'
import ordersRoutes from './routes/orders.routes.js'
import reviewsRoutes from './routes/reviews.routes.js'
import usersRoutes from './routes/users.routes.js'

const app = express()
const PORT = process.env.PORT || 4000
const CORS_ORIGINS = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

if (!process.env.JWT_SECRET) {
  throw new Error('Falta JWT_SECRET. Crea server/.env usando server/.env.example como guia.')
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || CORS_ORIGINS.includes(origin)) return callback(null, true)
      return callback(new Error('Origen no permitido por CORS.'))
    },
  })
)
app.use(express.json())
app.use('/uploads', express.static(uploadsDir))

app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.use('/api/auth', authRoutes)
app.use('/api/categories', categoriesRoutes)
app.use('/api/products', productsRoutes)
app.use('/api/orders', ordersRoutes)
app.use('/api/reviews', reviewsRoutes)
app.use('/api/users', usersRoutes)

app.use((req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` })
})

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor.' })
})

app.listen(PORT, () => {
  console.log(`API del marketplace corriendo en http://localhost:${PORT}`)
})
