import { Router } from 'express'
import { db } from '../db.js'
import { authenticate, requireRole } from '../middleware/auth.js'

const router = Router()

router.use(authenticate, requireRole('administrador'))

router.get('/', (_req, res) => {
  const users = db
    .prepare('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC')
    .all()
  res.json({ users })
})

router.patch('/:id/role', (req, res) => {
  const { role } = req.body || {}
  const validRoles = ['comprador', 'vendedor', 'administrador']
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: `Rol invalido. Usa uno de: ${validRoles.join(', ')}` })
  }

  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(req.params.id)
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado.' })

  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, user.id)
  const updated = db
    .prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?')
    .get(user.id)
  res.json({ user: updated })
})

router.delete('/:id', (req, res) => {
  if (Number(req.params.id) === req.user.id) {
    return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta desde aqui.' })
  }
  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(req.params.id)
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado.' })

  db.prepare('DELETE FROM users WHERE id = ?').run(user.id)
  res.status(204).send()
})

export default router
