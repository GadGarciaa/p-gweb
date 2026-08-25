import { Router } from 'express'
import { db } from '../db.js'
import { authenticate, requireRole } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'

const router = Router()

// Multipart aparte del resto (que espera JSON): sube una imagen y devuelve su URL
// relativa para usarla como image_url al crear/editar un producto.
router.post('/upload-image', authenticate, requireRole('vendedor', 'administrador'), (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message })
    if (!req.file) return res.status(400).json({ error: 'No se recibio ninguna imagen.' })
    res.status(201).json({ url: `/uploads/${req.file.filename}` })
  })
})

const SELECT_PRODUCT = `
  SELECT
    p.*,
    c.name AS category_name,
    c.slug AS category_slug,
    u.name AS seller_name
  FROM products p
  JOIN categories c ON c.id = p.category_id
  JOIN users u ON u.id = p.seller_id
`

router.get('/', (req, res) => {
  const { category, search } = req.query
  const clauses = []
  const params = {}

  if (category) {
    clauses.push('(c.slug = @category OR c.id = @category)')
    params.category = category
  }
  if (search) {
    clauses.push('(p.name LIKE @search OR p.description LIKE @search)')
    params.search = `%${search}%`
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''
  const products = db
    .prepare(`${SELECT_PRODUCT} ${where} ORDER BY p.created_at DESC`)
    .all(params)

  res.json({ products })
})

router.get('/:id', (req, res) => {
  const product = db.prepare(`${SELECT_PRODUCT} WHERE p.id = ?`).get(req.params.id)
  if (!product) return res.status(404).json({ error: 'Producto no encontrado.' })
  res.json({ product })
})

router.post('/', authenticate, requireRole('vendedor', 'administrador'), (req, res) => {
  const { name, description, price, image_url, stock, category_id } = req.body || {}

  if (!name || !name.trim() || price === undefined || !category_id) {
    return res.status(400).json({ error: 'Nombre, precio y categoria son obligatorios.' })
  }
  const numericPrice = Number(price)
  if (Number.isNaN(numericPrice) || numericPrice <= 0) {
    return res.status(400).json({ error: 'El precio debe ser un numero mayor a 0.' })
  }

  const category = db.prepare('SELECT id FROM categories WHERE id = ?').get(category_id)
  if (!category) return res.status(400).json({ error: 'La categoria indicada no existe.' })

  const result = db
    .prepare(`
      INSERT INTO products (name, description, price, image_url, stock, category_id, seller_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      name.trim(),
      description || '',
      numericPrice,
      image_url || null,
      Number.isFinite(Number(stock)) ? Number(stock) : 0,
      category.id,
      req.user.id
    )

  const product = db.prepare(`${SELECT_PRODUCT} WHERE p.id = ?`).get(result.lastInsertRowid)
  res.status(201).json({ product })
})

router.put('/:id', authenticate, requireRole('vendedor', 'administrador'), (req, res) => {
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Producto no encontrado.' })

  const isOwner = existing.seller_id === req.user.id
  if (req.user.role !== 'administrador' && !isOwner) {
    return res.status(403).json({ error: 'Solo puedes editar tus propios productos.' })
  }

  const { name, description, price, image_url, stock, category_id } = req.body || {}

  if (category_id) {
    const category = db.prepare('SELECT id FROM categories WHERE id = ?').get(category_id)
    if (!category) return res.status(400).json({ error: 'La categoria indicada no existe.' })
  }

  db.prepare(`
    UPDATE products SET
      name = COALESCE(?, name),
      description = COALESCE(?, description),
      price = COALESCE(?, price),
      image_url = COALESCE(?, image_url),
      stock = COALESCE(?, stock),
      category_id = COALESCE(?, category_id)
    WHERE id = ?
  `).run(
    name?.trim() || null,
    description ?? null,
    price !== undefined ? Number(price) : null,
    image_url ?? null,
    stock !== undefined ? Number(stock) : null,
    category_id || null,
    existing.id
  )

  const product = db.prepare(`${SELECT_PRODUCT} WHERE p.id = ?`).get(existing.id)
  res.json({ product })
})

router.delete('/:id', authenticate, requireRole('vendedor', 'administrador'), (req, res) => {
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Producto no encontrado.' })

  const isOwner = existing.seller_id === req.user.id
  if (req.user.role !== 'administrador' && !isOwner) {
    return res.status(403).json({ error: 'Solo puedes borrar tus propios productos.' })
  }

  db.prepare('DELETE FROM products WHERE id = ?').run(existing.id)
  res.status(204).send()
})

export default router
