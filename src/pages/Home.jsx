import { useEffect, useMemo, useState } from 'react'
import { api } from '../api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import ProductCard from '../components/ProductCard.jsx'
import SellerPanel from '../components/SellerPanel.jsx'
import AdminPanel from '../components/AdminPanel.jsx'
import ReviewForm from '../components/ReviewForm.jsx'
import Thumb from '../components/Thumb.jsx'

const CARD_COLORS = ['coral', 'sage', 'amber', 'plum']

export default function Home({ onOpenAuthModal }) {
  const { user } = useAuth()
  const { addItem } = useCart()

  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [reviews, setReviews] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('recientes')
  const [loadError, setLoadError] = useState('')
  const [statusMessage, setStatusMessage] = useState('')

  async function loadCategories() {
    const { categories } = await api.getCategories()
    setCategories(categories)
  }

  async function loadProducts() {
    const { products } = await api.getProducts()
    setProducts(products)
  }

  async function loadReviews() {
    const { reviews } = await api.getReviews()
    setReviews(reviews)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount inicial
    Promise.all([loadCategories(), loadProducts(), loadReviews()]).catch((err) =>
      setLoadError(err.message)
    )
  }, [])

  const ratingsByProduct = useMemo(() => {
    const totals = {}
    for (const review of reviews) {
      const entry = totals[review.product_id] || { sum: 0, count: 0 }
      entry.sum += review.rating
      entry.count += 1
      totals[review.product_id] = entry
    }
    const result = {}
    for (const [productId, { sum, count }] of Object.entries(totals)) {
      result[productId] = { avg: (sum / count).toFixed(1), count }
    }
    return result
  }, [reviews])

  const visibleProducts = useMemo(() => {
    let list = products
    if (selectedCategory) {
      list = list.filter((p) => p.category_slug === selectedCategory)
    }
    const term = searchTerm.trim().toLowerCase()
    if (term) {
      list = list.filter(
        (p) => p.name.toLowerCase().includes(term) || (p.description || '').toLowerCase().includes(term)
      )
    }
    if (sortBy === 'precio-asc') list = [...list].sort((a, b) => a.price - b.price)
    else if (sortBy === 'precio-desc') list = [...list].sort((a, b) => b.price - a.price)
    return list
  }, [products, selectedCategory, searchTerm, sortBy])

  const featuredProduct = products[0]
  const currentProduct = visibleProducts[0]
  const recommendedProducts = useMemo(() => {
    if (!currentProduct) return []
    return products
      .filter((p) => p.id !== currentProduct.id && p.category_id === currentProduct.category_id)
      .slice(0, 3)
  }, [products, currentProduct])

  function handleAdded(product) {
    setStatusMessage(`Agregaste "${product.name}" al carrito.`)
  }

  function handleSellHere() {
    if (!user) {
      onOpenAuthModal('register', 'vendedor')
      return
    }
    document.getElementById('vender')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      {loadError && <p className="banner banner-error">{loadError}</p>}
      {statusMessage && <p className="banner">{statusMessage}</p>}

      <section className="hero-section" id="inicio">
        <div className="hero-copy">
          <p className="eyebrow">Marketplace para vendedores</p>
          <h1>Compra productos unicos y ayuda a crecer negocios locales.</h1>
          <p className="hero-text">
            Un espacio donde vendedoras pueden mostrar sus productos, gestionar
            su catalogo y conectar con clientes que buscan algo especial.
          </p>

          <div className="hero-actions">
            <a href="#comprar" className="primary-button large">
              Explorar productos
            </a>
            <button type="button" className="secondary-button large" onClick={handleSellHere}>
              Vender producto
            </button>
          </div>

          <dl className="stats">
            <div>
              <dt>{new Set(products.map((p) => p.seller_id)).size}</dt>
              <dd>vendedores</dd>
            </div>
            <div>
              <dt>{products.length}</dt>
              <dd>productos</dd>
            </div>
            <div>
              <dt>{categories.length}</dt>
              <dd>categorias</dd>
            </div>
          </dl>
        </div>

        <aside className="market-preview" aria-label="Vista previa del marketplace">
          <div className="preview-header">
            <span>Destacados de hoy</span>
            <a href="#comprar">Ver todo</a>
          </div>
          {featuredProduct ? (
            <div className="featured-product">
              <Thumb src={featuredProduct.image_url} className="product-visual hero-product" />
              <div>
                <p>{featuredProduct.name}</p>
                <strong>${featuredProduct.price}</strong>
              </div>
            </div>
          ) : (
            <p className="empty">Aun no hay productos publicados.</p>
          )}
          <div className="seller-card">
            <div>
              <span className="avatar">M</span>
              <p>Vende tus productos y conecta con clientes reales.</p>
            </div>
            <button type="button" onClick={handleSellHere}>
              Vender
            </button>
          </div>
        </aside>
      </section>

      <section className="category-strip" id="categorias" aria-label="Categorias">
        <button
          type="button"
          className={selectedCategory === null ? 'active' : ''}
          onClick={() => setSelectedCategory(null)}
        >
          Todas
        </button>
        {categories.map((category) => (
          <button
            type="button"
            key={category.id}
            className={selectedCategory === category.slug ? 'active' : ''}
            onClick={() =>
              setSelectedCategory((current) => (current === category.slug ? null : category.slug))
            }
          >
            {category.name}
          </button>
        ))}
      </section>

      <section className="content-section" id="comprar">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Catalogo</p>
            <h2>
              Productos{' '}
              {selectedCategory
                ? `en ${categories.find((c) => c.slug === selectedCategory)?.name}`
                : 'populares'}
            </h2>
          </div>
          {selectedCategory && (
            <button type="button" className="ghost-button" onClick={() => setSelectedCategory(null)}>
              Ver todas las categorias
            </button>
          )}
        </div>

        <div className="catalog-controls">
          <input
            type="search"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Buscar productos"
          />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Ordenar por">
            <option value="recientes">Mas recientes</option>
            <option value="precio-asc">Precio: menor a mayor</option>
            <option value="precio-desc">Precio: mayor a menor</option>
          </select>
        </div>

        <div className="product-grid">
          {visibleProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              color={CARD_COLORS[index % CARD_COLORS.length]}
              onAdd={handleAdded}
              rating={ratingsByProduct[product.id]}
            />
          ))}
          {visibleProducts.length === 0 && (
            <p className="empty">No hay productos que coincidan con tu busqueda.</p>
          )}
        </div>
      </section>

      <section className="content-section soft-section" id="recomendados">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Compra relacionada</p>
            <h2>Productos recomendados</h2>
          </div>
        </div>

        {currentProduct ? (
          <div className="recommendation-layout">
            <article className="current-product">
              <Thumb src={currentProduct.image_url} className="product-visual" />
              <div>
                <p className="eyebrow">Producto destacado</p>
                <h3>{currentProduct.name}</h3>
                <p>{currentProduct.description || 'Sin descripcion disponible.'}</p>
              </div>
            </article>

            <div className="recommendation-list">
              {recommendedProducts.map((product) => (
                <article className="recommendation-card" key={product.id}>
                  <Thumb src={product.image_url} className="mini-image" />
                  <div>
                    <h3>{product.name}</h3>
                    <p>Misma categoria: {product.category_name}</p>
                    <strong>${product.price}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      addItem(product, 1)
                      handleAdded(product)
                    }}
                  >
                    Agregar
                  </button>
                </article>
              ))}
              {recommendedProducts.length === 0 && (
                <p className="empty">No hay mas productos similares por ahora.</p>
              )}
            </div>
          </div>
        ) : (
          <p className="empty">Publica productos para ver recomendaciones aqui.</p>
        )}
      </section>

      <section className="content-section" id="reseñas">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Confianza</p>
            <h2>Reseñas de la comunidad</h2>
          </div>
        </div>

        <div className="review-grid">
          {reviews.slice(0, 6).map((review) => (
            <article className="review-card" key={review.id}>
              <div className="review-top">
                <span>{review.rating}.0</span>
                <p>{review.product_name}</p>
              </div>
              <blockquote>{review.text || 'Sin comentario.'}</blockquote>
              <p className="review-author">{review.author_name}</p>
            </article>
          ))}
          {reviews.length === 0 && <p className="empty">Aun no hay reseñas publicadas.</p>}
        </div>

        {user?.role === 'comprador' && (
          <div className="panel-block review-form-block">
            <h3>Deja tu reseña</h3>
            <ReviewForm onSubmitted={loadReviews} />
          </div>
        )}
      </section>

      <section className="seller-section" id="vender">
        <div>
          <p className="eyebrow">Para todo público</p>
          <h2>Tu propia tienda dentro del marketplace.</h2>
          <p>
            Publica tus productos, gestiona tu catalogo por categoria y recibe
            pedidos de compradores reales, todo desde tu cuenta de vendedor.
          </p>
          {!user && (
            <div className="hero-actions">
              <button
                type="button"
                className="primary-button large"
                onClick={() => onOpenAuthModal('register', 'vendedor')}
              >
                Crear cuenta de vendedor
              </button>
            </div>
          )}
        </div>

        {!user && (
          <div className="seller-steps">
            <span>1. Crea tu perfil</span>
            <span>2. Sube tus productos</span>
            <span>3. Recibe pedidos</span>
          </div>
        )}
      </section>

      {user?.role === 'vendedor' && (
        <section className="content-section soft-section" id="panel-vendedor">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Tu tienda</p>
              <h2>Panel de vendedor</h2>
            </div>
          </div>
          <SellerPanel categories={categories} onProductsChanged={loadProducts} />
        </section>
      )}

      {user?.role === 'administrador' && (
        <section className="content-section soft-section" id="panel-admin">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Control total</p>
              <h2>Panel de administrador</h2>
            </div>
          </div>
          <AdminPanel
            categories={categories}
            onCategoriesChanged={loadCategories}
            onProductsChanged={loadProducts}
          />
        </section>
      )}
    </>
  )
}
