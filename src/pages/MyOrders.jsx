import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'
import { useAuth } from '../context/AuthContext.jsx'

const STATUS_LABELS = {
  pendiente: 'Pendiente',
  enviado: 'Enviado',
  completado: 'Completado',
  cancelado: 'Cancelado',
}

export default function MyOrders() {
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!user || user.role !== 'comprador') {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount por rol
      setLoaded(true)
      return
    }
    api
      .getMyOrders()
      .then(({ orders }) => setOrders(orders))
      .catch((err) => setError(err.message))
      .finally(() => setLoaded(true))
  }, [user])

  if (authLoading || !loaded) {
    return (
      <section className="content-section">
        <p className="empty">Cargando...</p>
      </section>
    )
  }

  if (!user || user.role !== 'comprador') {
    return (
      <section className="content-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Mis pedidos</p>
            <h2>Solo disponible para cuentas de comprador</h2>
          </div>
        </div>
        <p className="empty">
          Inicia sesion con una cuenta de comprador para ver tu historial de pedidos.
        </p>
        <Link to="/" className="ghost-button back-link">
          ← Volver al catalogo
        </Link>
      </section>
    )
  }

  return (
    <section className="content-section">
      <Link to="/" className="ghost-button back-link">
        ← Volver al catalogo
      </Link>

      <div className="section-heading">
        <div>
          <p className="eyebrow">Tu cuenta</p>
          <h2>Mis pedidos</h2>
        </div>
      </div>

      {error && <p className="banner banner-error">{error}</p>}

      <ul className="panel-list">
        {orders.map((order) => (
          <li key={order.id}>
            <span>
              <Link to={`/producto/${order.product_id}`}>{order.product_name}</Link> x{order.quantity}
            </span>
            <span>${order.total}</span>
            <span>Vendedor: {order.seller_name}</span>
            <span className={`status-badge status-${order.status}`}>{STATUS_LABELS[order.status]}</span>
          </li>
        ))}
        {orders.length === 0 && <li className="empty">Aun no has hecho ninguna compra.</li>}
      </ul>
    </section>
  )
}
