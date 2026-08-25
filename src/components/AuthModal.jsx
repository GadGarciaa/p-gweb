import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

export default function AuthModal({ onClose, initialMode = 'login', initialRole = 'comprador' }) {
  const { login, register } = useAuth()
  const [mode, setMode] = useState(initialMode) // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '', role: initialRole })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function updateField(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      if (mode === 'login') {
        await login(form.email, form.password)
      } else {
        await register(form.name, form.email, form.password, form.role)
      }
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-tabs">
          <button
            type="button"
            className={mode === 'login' ? 'active' : ''}
            onClick={() => setMode('login')}
          >
            Iniciar sesion
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'active' : ''}
            onClick={() => setMode('register')}
          >
            Crear cuenta
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <label>
              Nombre
              <input type="text" required value={form.name} onChange={updateField('name')} />
            </label>
          )}

          <label>
            Email
            <input type="email" required value={form.email} onChange={updateField('email')} />
          </label>

          <label>
            Contrasena
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={updateField('password')}
            />
          </label>

          {mode === 'register' && (
            <label>
              Quiero registrarme como
              <select value={form.role} onChange={updateField('role')}>
                <option value="comprador">Comprador</option>
                <option value="vendedor">Vendedor</option>
              </select>
            </label>
          )}

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="primary-button" disabled={submitting}>
            {submitting ? 'Enviando...' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
          </button>
        </form>

        <button type="button" className="ghost-button modal-close" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  )
}
