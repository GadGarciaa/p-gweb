import { Router } from 'express'
import { db } from '../db.js'
import { authenticate, requireRole } from '../middleware/auth.js'

const router = Router()

const SELECT_ORDER = `
  SELECT
    o.*,
    p.name AS product_name,
    p.image_url AS product_image_url,
    p.seller_id AS product_seller_id,
    b.name AS buyer_name,
    s.name AS seller_name
  FROM orders o
  JOIN products p ON p.id = o.product_id
  JOIN users b ON b.id = o.buyer_id
  JOIN users s ON s.id = p.seller_id
`

router.post('/', authenticate, requireRole('comprador'), (req, res) => {
  const { product_id, quantity } = req.body || {}
  if (!product_id) {
    return res.status(400).json({ error: 'El producto es obligatorio.' })
  }
  const qty = Number(quantity) > 0 ? Math.floor(Number(quantity)) : 1

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(product_id)
  if (!product) return res.status(404).json({ error: 'Producto no encontrado.' })
  if (product.stock < qty) {
    return res.status(409).json({ error: 'No hay suficiente stock disponible.' })
  }

  const total = product.price * qty

  const result = db.transaction(() => {
    const insert = db
      .prepare('INSERT INTO orders (buyer_id, product_id, quantity, total) VALUES (?, ?, ?, ?)')
      .run(req.user.id, product.id, qty, total)
    db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').run(qty, product.id)
    return insert
  })()

  const order = db.prepare(`${SELECT_ORDER} WHERE o.id = ?`).get(result.lastInsertRowid)
  res.status(201).json({ order })
})

router.get('/mine', authenticate, requireRole('comprador'), (req, res) => {
  const orders = db
    .prepare(`${SELECT_ORDER} WHERE o.buyer_id = ? ORDER BY o.created_at DESC`)
    .all(req.user.id)
  res.json({ orders })
})

router.get('/sales', authenticate, requireRole('vendedor'), (req, res) => {
  const orders = db
    .prepare(`${SELECT_ORDER} WHERE p.seller_id = ? ORDER BY o.created_at DESC`)
    .all(req.user.id)
  res.json({ orders })
})

router.get('/', authenticate, requireRole('administrador'), (_req, res) => {
  const orders = db.prepare(`${SELECT_ORDER} ORDER BY o.created_at DESC`).all()
  res.json({ orders })
})

router.patch('/:id/status', authenticate, requireRole('vendedor', 'administrador'), (req, res) => {
  const { status } = req.body || {}
  const validStatuses = ['pendiente', 'enviado', 'completado', 'cancelado']
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Estado invalido. Usa uno de: ${validStatuses.join(', ')}` })
  }

  const order = db.prepare(`${SELECT_ORDER} WHERE o.id = ?`).get(req.params.id)
  if (!order) return res.status(404).json({ error: 'Pedido no encontrado.' })

  if (req.user.role !== 'administrador' && order.product_seller_id !== req.user.id) {
    return res.status(403).json({ error: 'Solo puedes actualizar pedidos de tus propios productos.' })
  }

  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, order.id)
  const updated = db.prepare(`${SELECT_ORDER} WHERE o.id = ?`).get(order.id)
  res.json({ order: updated })
})

export default router
