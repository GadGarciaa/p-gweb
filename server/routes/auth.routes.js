import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { db } from '../db.js'
import { signToken } from '../utils/token.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

const PUBLIC_ROLES = ['comprador', 'vendedor']

function publicUser(user) {
  // eslint-disable-next-line no-unused-vars -- se descarta el hash a proposito
  const { password_hash, ...rest } = user
  return rest
}

router.post('/register', (req, res) => {
  const { name, email, password, role } = req.body || {}

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nombre, email y contrasena son obligatorios.' })
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'La contrasena debe tener al menos 6 caracteres.' })
  }

  const finalRole = PUBLIC_ROLES.includes(role) ? role : 'comprador'

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase())
  if (existing) {
    return res.status(409).json({ error: 'Ya existe una cuenta con ese email.' })
  }

  const passwordHash = bcrypt.hashSync(password, 10)
  const result = db
    .prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)')
    .run(name, email.toLowerCase(), passwordHash, finalRole)

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid)
  const token = signToken(user)
  res.status(201).json({ token, user: publicUser(user) })
})

router.post('/login', (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contrasena son obligatorios.' })
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase())
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Credenciales invalidas.' })
  }

  const token = signToken(user)
  res.json({ token, user: publicUser(user) })
})

router.get('/me', authenticate, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado.' })
  res.json({ user: publicUser(user) })
})

export default router
