import { useEffect, useState } from 'react'
import { api } from '../api.js'

// Si se pasa `productId`, el formulario queda fijo a ese producto (usado en la
// pagina de detalle). Sin `productId`, el usuario elige entre lo que compro.
export default function ReviewForm({ productId, onSubmitted }) {
  const [myOrders, setMyOrders] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState(productId ? String(productId) : '')
  const [rating, setRating] = useState('5')
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    api
      .getMyOrders()
      .then(({ orders }) => setMyOrders(orders))
      .catch(() => setMyOrders([]))
      .finally(() => setLoaded(true))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      await api.createReview({ product_id: Number(selectedProductId), rating: Number(rating), text })
      setText('')
      setSuccess('Gracias por tu resena.')
      onSubmitted?.()
    } catch (err) {
      setError(err.message)
    }
  }

  if (!loaded) return null

  const uniqueProducts = [...new Map(myOrders.map((o) => [o.product_id, o])).values()]
  const purchasedThisProduct = productId
    ? uniqueProducts.some((o) => o.product_id === productId)
    : uniqueProducts.length > 0

  if (!purchasedThisProduct) {
    return (
      <p className="empty">
        {productId
          ? 'Compra este producto para poder dejar una resena.'
          : 'Compra un producto para poder dejar una resena.'}
      </p>
    )
  }

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      {!productId && (
        <label>
          Producto
          <select required value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)}>
            <option value="" disabled>
              Elige un producto que hayas comprado...
            </option>
            {uniqueProducts.map((o) => (
              <option key={o.product_id} value={o.product_id}>
                {o.product_name}
              </option>
            ))}
          </select>
        </label>
      )}
      <label>
        Calificacion
        <select value={rating} onChange={(e) => setRating(e.target.value)}>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} estrellas
            </option>
          ))}
        </select>
      </label>
      <label>
        Comentario
        <input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="Que te parecio?" />
      </label>
      {error && <p className="form-error">{error}</p>}
      {success && <p className="form-success">{success}</p>}
      <button type="submit" className="secondary-button">
        Publicar resena
      </button>
    </form>
  )
}
