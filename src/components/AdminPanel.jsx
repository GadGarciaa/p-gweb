import { useEffect, useState } from 'react'
import { api } from '../api.js'
import { useAuth } from '../context/AuthContext.jsx'

const ROLE_LABELS = {
  comprador: 'Comprador',
  vendedor: 'Vendedor',
  administrador: 'Administrador',
}

export default function AdminPanel({ categories, onCategoriesChanged, onProductsChanged }) {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [users, setUsers] = useState([])
  const [orders, setOrders] = useState([])
  const [newCategory, setNewCategory] = useState('')
  const [error, setError] = useState('')

  async function loadData() {
    const [productsRes, usersRes, ordersRes] = await Promise.all([
      api.getProducts(),
      api.getUsers(),
      api.getAllOrders(),
    ])
    setProducts(productsRes.products)
    setUsers(usersRes.users)
    setOrders(ordersRes.orders)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount inicial
    loadData().catch((err) => setError(err.message))
  }, [])

  async function handleAddCategory(e) {
    e.preventDefault()
    setError('')
    try {
      await api.createCategory({ name: newCategory })
      setNewCategory('')
      onCategoriesChanged?.()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDeleteCategory(id) {
    try {
      await api.deleteCategory(id)
      onCategoriesChanged?.()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDeleteProduct(id) {
    await api.deleteProduct(id)
    await loadData()
    onProductsChanged?.()
  }

  async function handleRoleChange(id, role) {
    await api.updateUserRole(id, role)
    await loadData()
  }

  async function handleDeleteUser(id) {
    await api.deleteUser(id)
    await loadData()
  }

  return (
    <div className="panel">
      {error && <p className="form-error">{error}</p>}

      <div className="panel-block">
        <h3>Categorias</h3>
        <form className="panel-form-inline" onSubmit={handleAddCategory}>
          <input
            type="text"
            placeholder="Nueva categoria"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            required
          />
          <button type="submit" className="secondary-button">
            Agregar
          </button>
        </form>
        <ul className="panel-list">
          {categories.map((c) => (
            <li key={c.id}>
              <span>{c.name}</span>
              <button type="button" className="ghost-button" onClick={() => handleDeleteCategory(c.id)}>
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="panel-block">
        <h3>Todos los productos ({products.length})</h3>
        <ul className="panel-list">
          {products.map((p) => (
            <li key={p.id}>
              <span>{p.name}</span>
              <span>{p.category_name}</span>
              <span>Vende: {p.seller_name}</span>
              <span>${p.price}</span>
              <button type="button" className="ghost-button" onClick={() => handleDeleteProduct(p.id)}>
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="panel-block">
        <h3>Usuarios ({users.length})</h3>
        <ul className="panel-list">
          {users.map((u) => (
            <li key={u.id}>
              <span>{u.name}</span>
              <span>{u.email}</span>
              <select
                value={u.role}
                disabled={u.id === user.id}
                onChange={(e) => handleRoleChange(u.id, e.target.value)}
              >
                {Object.entries(ROLE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="ghost-button"
                disabled={u.id === user.id}
                onClick={() => handleDeleteUser(u.id)}
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="panel-block">
        <h3>Pedidos ({orders.length})</h3>
        <ul className="panel-list">
          {orders.map((o) => (
            <li key={o.id}>
              <span>{o.product_name}</span>
              <span>{o.buyer_name} → {o.seller_name}</span>
              <span>${o.total}</span>
              <span>{o.status}</span>
            </li>
          ))}
          {orders.length === 0 && <li className="empty">No hay pedidos todavia.</li>}
        </ul>
      </div>
    </div>
  )
}
