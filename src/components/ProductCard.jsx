import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import Thumb from './Thumb.jsx'

export default function ProductCard({ product, color, onAdd, rating }) {
  const { addItem } = useCart()

  function handleAdd() {
    addItem(product, 1)
    onAdd?.(product)
  }

  const outOfStock = product.stock <= 0

  return (
    <article className="product-card">
      <Link to={`/producto/${product.id}`} className="product-visual-link">
        <Thumb src={product.image_url} className={`product-visual ${color || ''}`} />
      </Link>
      <div className="product-info">
        <span>{product.category_name}</span>
        <h3>
          <Link to={`/producto/${product.id}`}>{product.name}</Link>
        </h3>
        <p>Por {product.seller_name}</p>
        {rating && (
          <p className="product-rating">
            ⭐ {rating.avg} · {rating.count} {rating.count === 1 ? 'reseña' : 'reseñas'}
          </p>
        )}
        <div>
          <strong>${product.price}</strong>
          <button type="button" onClick={handleAdd} disabled={outOfStock}>
            {outOfStock ? 'Sin stock' : 'Agregar'}
          </button>
        </div>
      </div>
    </article>
  )
}
