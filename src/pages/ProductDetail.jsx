import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api.js'
import { useCart } from '../context/CartContext.jsx'
import ReviewForm from '../components/ReviewForm.jsx'
import Thumb from '../components/Thumb.jsx'

// Wrapper que lee el :id de la ruta y usa ese id como `key`: al navegar de un
// producto a otro (ej. desde "similares"), React remonta el componente entero
// en vez de reciclar el estado del producto anterior.
export default function ProductDetailRoute({ onOpenCart }) {
  const { id } = useParams()
  return <ProductDetail key={id} id={id} onOpenCart={onOpenCart} />
}

function ProductDetail({ id, onOpenCart }) {
  const { addItem } = useCart()

  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [reviews, setReviews] = useState([])
  const [quantity, setQuantity] = useState(1)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function loadReviews() {
    const { reviews } = await api.getReviews(id)
    setReviews(reviews)
  }

  useEffect(() => {
    api
      .getProduct(id)
      .then(({ product }) => {
        setProduct(product)
        return api.getProducts({ category: product.category_slug })
      })
      .then(({ products }) => setRelated(products.filter((p) => String(p.id) !== id).slice(0, 3)))
      .catch((err) => setError(err.message))

    api
      .getReviews(id)
      .then(({ reviews }) => setReviews(reviews))
      .catch(() => setReviews([]))
  }, [id])

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return null
    return (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
  }, [reviews])

  function handleAddToCart() {
    addItem(product, quantity)
    setMessage(`Agregaste ${quantity} x "${product.name}" al carrito.`)
  }

  function handleBuyNow() {
    addItem(product, quantity)
    onOpenCart?.()
  }

  if (error) {
    return (
      <section className="content-section">
        <p className="banner banner-error">{error}</p>
        <Link to="/" className="ghost-button back-link">
          ← Volver al catalogo
        </Link>
      </section>
    )
  }

  if (!product) {
    return (
      <section className="content-section">
        <p className="empty">Cargando producto...</p>
      </section>
    )
  }

  return (
    <>
      <section className="content-section product-detail">
        <Link to="/" className="ghost-button back-link">
          ← Volver al catalogo
        </Link>

        <div className="detail-layout">
          <Thumb src={product.image_url} className="product-visual detail-visual" />

          <div className="detail-info">
            <p className="eyebrow">{product.category_name}</p>
            <h1>{product.name}</h1>
            <p className="detail-seller">Por {product.seller_name}</p>
            {averageRating && (
              <p className="detail-rating">
                ⭐ {averageRating} ({reviews.length} reseñas)
              </p>
            )}
            <p className="detail-description">{product.description || 'Sin descripcion disponible.'}</p>
            <strong className="detail-price">${product.price}</strong>
            <p className="detail-stock">
              {product.stock > 0 ? `${product.stock} disponibles` : 'Sin stock'}
            </p>

            <div className="qty-stepper">
              <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                −
              </button>
              <span>{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                disabled={quantity >= product.stock}
              >
                +
              </button>
            </div>

            <div className="hero-actions">
              <button
                type="button"
                className="secondary-button large"
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
              >
                Agregar al carrito
              </button>
              <button
                type="button"
                className="primary-button large"
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
              >
                Comprar ahora
              </button>
            </div>

            {message && <p className="banner">{message}</p>}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="content-section soft-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Tambien te puede interesar</p>
              <h2>Productos similares</h2>
            </div>
          </div>
          <div className="recommendation-list">
            {related.map((p) => (
              <article className="recommendation-card" key={p.id}>
                <Link to={`/producto/${p.id}`} className="mini-image-link">
                  <Thumb src={p.image_url} className="mini-image" />
                </Link>
                <div>
                  <h3>
                    <Link to={`/producto/${p.id}`}>{p.name}</Link>
                  </h3>
                  <p>{p.category_name}</p>
                  <strong>${p.price}</strong>
                </div>
                <button type="button" onClick={() => addItem(p, 1)}>
                  Agregar
                </button>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="content-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Confianza</p>
            <h2>Reseñas de este producto</h2>
          </div>
        </div>
        <div className="review-grid">
          {reviews.map((review) => (
            <article className="review-card" key={review.id}>
              <div className="review-top">
                <span>{review.rating}.0</span>
                <p>{review.author_name}</p>
              </div>
              <blockquote>{review.text || 'Sin comentario.'}</blockquote>
            </article>
          ))}
          {reviews.length === 0 && <p className="empty">Aun no hay reseñas para este producto.</p>}
        </div>

        <div className="panel-block review-form-block">
          <h3>Deja tu reseña</h3>
          <ReviewForm productId={product.id} onSubmitted={loadReviews} />
        </div>
      </section>
    </>
  )
}
