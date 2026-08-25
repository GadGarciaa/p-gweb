import { useEffect, useMemo, useState } from 'react'
import { api } from '../api.js'
import { useAuth } from '../context/AuthContext.jsx'
import Thumb from './Thumb.jsx'

const STATUS_LABELS = {
  pendiente: 'Pendiente',
  enviado: 'Enviado',
  completado: 'Completado',
  cancelado: 'Cancelado',
}

export default function SellerPanel({ categories, onProductsChanged }) {
  const { user } = useAuth()
  const [myProducts, setMyProducts] = useState([])
  const [sales, setSales] = useState([])
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '', category_id: '' })
  const [imageFile, setImageFile] = useState(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Vista previa local del archivo elegido; solo se sube al backend al enviar el formulario.
  const imagePreview = useMemo(() => (imageFile ? URL.createObjectURL(imageFile) : null), [imageFile])
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview)
    }
  }, [imagePreview])

  async function loadData() {
    const [productsRes, salesRes] = await Promise.all([api.getProducts(), api.getMySales()])
    setMyProducts(productsRes.products.filter((p) => p.seller_id === user.id))
    setSales(salesRes.orders)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount inicial
    loadData().catch((err) => setError(err.message))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function updateField(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleCreate(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      let image_url = null
      if (imageFile) {
        const uploaded = await api.uploadImage(imageFile)
        image_url = uploaded.url
      }
      await api.createProduct({
        name: form.name,
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock) || 0,
        category_id: Number(form.category_id),
        image_url,
      })
      setForm({ name: '', description: '', price: '', stock: '', category_id: '' })
      setImageFile(null)
      await loadData()
      onProductsChanged?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id) {
    await api.deleteProduct(id)
    await loadData()
    onProductsChanged?.()
  }

  async function handleStatusChange(orderId, status) {
    await api.updateOrderStatus(orderId, status)
    await loadData()
  }

  return (
    <div className="panel">
      <div className="panel-block">
        <h3>Publicar un producto nuevo</h3>
        <form className="panel-form" onSubmit={handleCreate}>
          <label>
            Nombre
            <input type="text" required value={form.name} onChange={updateField('name')} />
          </label>
          <label>
            Descripcion
            <input type="text" value={form.description} onChange={updateField('description')} />
          </label>
          <div className="panel-form-row">
            <label>
              Precio
              <input type="number" min="0.01" step="0.01" required value={form.price} onChange={updateField('price')} />
            </label>
            <label>
              Stock
              <input type="number" min="0" step="1" value={form.stock} onChange={updateField('stock')} />
            </label>
            <label>
              Categoria
              <select required value={form.category_id} onChange={updateField('category_id')}>
                <option value="" disabled>
                  Elige...
                </option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Foto del producto
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            />
          </label>
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Vista previa" />
            </div>
          )}
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="primary-button" disabled={submitting}>
            {submitting ? 'Publicando...' : 'Publicar producto'}
          </button>
        </form>
      </div>

      <div className="panel-block">
        <h3>Mis productos ({myProducts.length})</h3>
        <ul className="panel-list">
          {myProducts.map((p) => (
            <li key={p.id}>
              <Thumb src={p.image_url} className="list-thumb" />
              <span>
                {p.name} <em>({p.category_name})</em>
              </span>
              <span>${p.price}</span>
              <span>Stock: {p.stock}</span>
              <button type="button" className="ghost-button" onClick={() => handleDelete(p.id)}>
                Eliminar
              </button>
            </li>
          ))}
          {myProducts.length === 0 && <li className="empty">Aun no tienes productos publicados.</li>}
        </ul>
      </div>

      <div className="panel-block">
        <h3>Pedidos recibidos ({sales.length})</h3>
        <ul className="panel-list">
          {sales.map((o) => (
            <li key={o.id}>
              <span>
                {o.product_name} x{o.quantity}
              </span>
              <span>${o.total}</span>
              <span>Comprador: {o.buyer_name}</span>
              <select value={o.status} onChange={(e) => handleStatusChange(o.id, e.target.value)}>
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </li>
          ))}
          {sales.length === 0 && <li className="empty">Todavia no tienes pedidos.</li>}
        </ul>
      </div>
    </div>
  )
}
