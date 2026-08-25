import { verifyToken } from '../utils/token.js'

export function authenticate(req, res, next) {
  const header = req.headers.authorization || ''
  const [scheme, token] = header.split(' ')

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'No autenticado. Falta el token.' })
  }

  try {
    req.user = verifyToken(token)
    next()
  } catch {
    return res.status(401).json({ error: 'Token invalido o expirado.' })
  }
}

// Deja pasar la request con o sin token; si hay token valido, adjunta req.user.
export function optionalAuth(req, _res, next) {
  const header = req.headers.authorization || ''
  const [scheme, token] = header.split(' ')

  if (scheme === 'Bearer' && token) {
    try {
      req.user = verifyToken(token)
    } catch {
      // token invalido: seguimos como anonimo
    }
  }
  next()
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado.' })
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'No tienes permiso para esta accion.' })
    }
    next()
  }
}
