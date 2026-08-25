import { useState } from 'react'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../api.js'

export default function CartDrawer({ onClose, onRequireAuth, onCheckoutComplete }) {
  const { items, updateQuantity, removeItem, clearCart, totalPrice } = useCart()
  const { user } = useAuth()
  const [checkingOut, setCheckingOut] = useState(false)
  const [error, setError] = useState('')
  const [summary, setSummary] = useState(null)

  async function handleCheckout() {
    setError('')
    setSummary(null)

    if (!user) {
      onRequireAuth()
      return
    }
    if (user.role !== 'comprador') {
      setError('Solo las cuentas de comprador pueden finalizar una compra.')
      return
    }

    setCheckingOut(true)
    const succeeded = []
    const failed = []
    for (const item of items) {
      try {
        await api.createOrder({ product_id: item.product_id, quantity: item.quantity })
        succeeded.push(item)
      } catch (err) {
        failed.push({ item, message: err.message })
      }
    }
    setCheckingOut(false)
    succeeded.forEach((item) => removeItem(item.product_id))
    setSummary({ succeededCount: succeeded.length, failed })
    if (failed.length === 0) onCheckoutComplete?.()
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal-card cart-card" onClick={(e) => e.stopPropagation()}>
        <h3>Tu carrito</h3>

        {items.length === 0 ? (
          <p className="empty">Tu carrito esta vacio.</p>
        ) : (
          <ul className="cart-list">
            {items.map((item) => (
              <li key={item.product_id}>
                <div>
                  <strong>{item.name}</strong>
                  <span>${item.price} c/u</span>
                </div>
                <div className="qty-stepper">
                  <button type="button" onClick={() => updateQuantity(item.product_id, item.quantity - 1)}>
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(item.product_id, Math.min(item.quantity + 1, item.stock ?? Infinity))
                    }
                  >
                    +
                  </button>
                </div>
                <button type="button" className="ghost-button" onClick={() => removeItem(item.product_id)}>
                  Quitar
                </button>
              </li>
            ))}
          </ul>
        )}

        {items.length > 0 && (
          <div className="cart-total">
            <span>Total</span>
            <strong>${totalPrice}</strong>
          </div>
        )}

        {error && <p className="form-error">{error}</p>}
        {summary && (
          <p className={summary.failed.length ? 'form-error' : 'form-success'}>
            {summary.succeededCount > 0 && `Compraste ${summary.succeededCount} producto(s). `}
            {summary.failed.length > 0 &&
              `No se pudo comprar: ${summary.failed.map((f) => `${f.item.name} (${f.message})`).join(', ')}`}
          </p>
        )}

        <div className="cart-actions">
          {items.length > 0 && (
            <button type="button" className="ghost-button" onClick={clearCart}>
              Vaciar carrito
            </button>
          )}
          <button
            type="button"
            className="primary-button"
            disabled={items.length === 0 || checkingOut}
            onClick={handleCheckout}
          >
            {checkingOut ? 'Procesando...' : 'Finalizar compra'}
          </button>
        </div>

        <button type="button" className="ghost-button modal-close" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  )
}
