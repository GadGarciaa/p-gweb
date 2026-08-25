import { Router } from 'express'
import { db } from '../db.js'
import { authenticate, requireRole } from '../middleware/auth.js'

const router = Router()

const SELECT_REVIEW = `
  SELECT r.*, u.name AS author_name, p.name AS product_name
  FROM reviews r
  JOIN users u ON u.id = r.user_id
  JOIN products p ON p.id = r.product_id
`

router.get('/', (req, res) => {
  const { productId } = req.query
  const reviews = productId
    ? db.prepare(`${SELECT_REVIEW} WHERE r.product_id = ? ORDER BY r.created_at DESC`).all(productId)
    : db.prepare(`${SELECT_REVIEW} ORDER BY r.created_at DESC`).all()
  res.json({ reviews })
})

router.post('/', authenticate, requireRole('comprador'), (req, res) => {
  const { product_id, rating, text } = req.body || {}
  const numericRating = Number(rating)

  if (!product_id || !numericRating || numericRating < 1 || numericRating > 5) {
    return res.status(400).json({ error: 'Producto y calificacion (1-5) son obligatorios.' })
  }

  const product = db.prepare('SELECT id FROM products WHERE id = ?').get(product_id)
  if (!product) return res.status(404).json({ error: 'Producto no encontrado.' })

  const hasPurchased = db
    .prepare('SELECT id FROM orders WHERE buyer_id = ? AND product_id = ? LIMIT 1')
    .get(req.user.id, product.id)
  if (!hasPurchased) {
    return res.status(403).json({ error: 'Solo puedes reseñar productos que hayas comprado.' })
  }

  const result = db
    .prepare('INSERT INTO reviews (product_id, user_id, rating, text) VALUES (?, ?, ?, ?)')
    .run(product.id, req.user.id, numericRating, text || '')

  const review = db.prepare(`${SELECT_REVIEW} WHERE r.id = ?`).get(result.lastInsertRowid)
  res.status(201).json({ review })
})

export default router
