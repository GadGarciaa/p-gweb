import { Router } from 'express'
import { db } from '../db.js'
import { authenticate, requireRole } from '../middleware/auth.js'

const router = Router()

function slugify(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

router.get('/', (_req, res) => {
  const categories = db.prepare('SELECT * FROM categories ORDER BY name ASC').all()
  res.json({ categories })
})

router.post('/', authenticate, requireRole('administrador'), (req, res) => {
  const { name } = req.body || {}
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'El nombre de la categoria es obligatorio.' })
  }

  const slug = slugify(name)
  const existing = db.prepare('SELECT id FROM categories WHERE name = ? OR slug = ?').get(name, slug)
  if (existing) {
    return res.status(409).json({ error: 'Ya existe una categoria con ese nombre.' })
  }

  const result = db.prepare('INSERT INTO categories (name, slug) VALUES (?, ?)').run(name.trim(), slug)
  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json({ category })
})

router.put('/:id', authenticate, requireRole('administrador'), (req, res) => {
  const { name } = req.body || {}
  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id)
  if (!category) return res.status(404).json({ error: 'Categoria no encontrada.' })
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'El nombre de la categoria es obligatorio.' })
  }

  const slug = slugify(name)
  db.prepare('UPDATE categories SET name = ?, slug = ? WHERE id = ?').run(name.trim(), slug, category.id)
  const updated = db.prepare('SELECT * FROM categories WHERE id = ?').get(category.id)
  res.json({ category: updated })
})

router.delete('/:id', authenticate, requireRole('administrador'), (req, res) => {
  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id)
  if (!category) return res.status(404).json({ error: 'Categoria no encontrada.' })

  const productCount = db
    .prepare('SELECT COUNT(*) AS n FROM products WHERE category_id = ?')
    .get(category.id).n
  if (productCount > 0) {
    return res.status(409).json({ error: 'No puedes borrar una categoria con productos asociados.' })
  }

  db.prepare('DELETE FROM categories WHERE id = ?').run(category.id)
  res.status(204).send()
})

export default router
