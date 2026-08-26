import './App.css'

const categories = ['Belleza', 'Hogar', 'Moda', 'Artesanal', 'Bienestar']

const products = [
  {
    name: 'Producto1',
    seller: 'Vendedor (persona)',
    price: '$389',
    tag: 'Belleza',
    color: 'coral',
  },
  {
    name: 'Producto2',
    seller: 'Vendedor (empresa)',
    price: '$640',
    tag: 'Moda',
    color: 'sage',
  },
  {
    name: 'Producto3',
    seller: 'Vendedor (empresa)',
    price: '$220',
    tag: 'Hogar',
    color: 'amber',
  },
  {
    name: 'Producto4',
    seller: 'Vendedor (persona)',
    price: '$510',
    tag: 'Artesanal',
    color: 'plum',
  },
]

const recommendedProducts = [
  {
    name: 'Producto similar 1',
    reason: 'Relacionado con Producto1',
    price: '$299',
  },
  {
    name: 'Producto similar 2',
    reason: 'Misma categoria',
    price: '$350',
  },
  {
    name: 'Producto recomendado',
    reason: 'Comprado frecuentemente',
    price: '$420',
  },
]

const reviews = [
  {
    product: 'Producto mas vendido 1',
    rating: '5.0',
    text: 'Muy buena calidad y entrega rapida.',
    author: 'Cliente 1',
  },
  {
    product: 'Producto mas vendido 2',
    rating: '4.8',
    text: 'Se parece mucho a la descripcion.',
    author: 'Cliente 2',
  },
  {
    product: 'Producto mas vendido 3',
    rating: '4.9',
    text: 'Lo volveria a comprar.',
    author: 'Cliente 3',
  },
]

function App() {
  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#inicio" aria-label="Mercado inicio">
          <span className="brand-mark">M</span>
          <span>Mercado</span>
        </a>

        <nav className="nav-links" aria-label="Navegacion principal">
          <a href="#comprar">Comprar</a>
          <a href="#recomendados">Recomendados</a>
          <a href="#reseñas">Reseñas</a>
          <a href="#vender">Vender</a>
          <a href="#categorias">Categorias</a>
        </nav>

        <div className="top-actions">
          <button type="button" className="ghost-button">
            Iniciar sesion
          </button>
          <button type="button" className="primary-button">
            Vender aqui
          </button>
        </div>
      </header>

      <section className="hero-section" id="inicio">
        <div className="hero-copy">
          <p className="eyebrow">Marketplace para vendedores</p>
          <h1>Compra productos unicos y ayuda a crecer negocios locales.</h1>
          <p className="hero-text">
            Un espacio donde vendedoras pueden mostrar sus productos, gestionar
            su catalogo y conectar con clientes que buscan algo especial.
          </p>

          <div className="hero-actions">
            <button type="button" className="primary-button large">
              Explorar productos
            </button>
            <button type="button" className="secondary-button large">
              Vender producto
            </button>
          </div>

          <dl className="stats">
            <div>
              <dt>240+</dt>
              <dd>vendedores</dd>
            </div>
            <div>
              <dt>1.8k</dt>
              <dd>productos</dd>
            </div>
            <div>
              <dt>4.9</dt>
              <dd>calificacion</dd>
            </div>
          </dl>
        </div>

        <aside className="market-preview" aria-label="Vista previa del marketplace">
          <div className="preview-header">
            <span>Destacados de hoy</span>
            <button type="button">Ver todo</button>
          </div>
          <div className="featured-product">
            <div className="product-visual hero-product">
              <span>Imagen</span>
            </div>
            <div>
              <p>Set cuidado personal</p>
              <strong>$489</strong>
            </div>
          </div>
          <div className="seller-card">
            <div>
              <span className="avatar">U</span>
              <p>Usuario acaba de publicar 6 productos nuevos.</p>
            </div>
            <button type="button">Seguir</button>
          </div>
        </aside>
      </section>

      <section className="category-strip" id="categorias" aria-label="Categorias">
        {categories.map((category) => (
          <button type="button" key={category}>
            {category}
          </button>
        ))}
      </section>

      <section className="content-section" id="comprar">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Catalogo</p>
            <h2>Productos populares</h2>
          </div>
          <button type="button" className="ghost-button">
            Ver mas
          </button>
        </div>

        <div className="product-grid">
          {products.map((product) => (
            <article className="product-card" key={product.name}>
              <div className={`product-visual ${product.color}`}>
                <span>Imagen</span>
              </div>
              <div className="product-info">
                <span>{product.tag}</span>
                <h3>{product.name}</h3>
                <p>Por {product.seller}</p>
                <div>
                  <strong>{product.price}</strong>
                  <button type="button">Agregar</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-section soft-section" id="recomendados">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Compra relacionada</p>
            <h2>Productos recomendados</h2>
          </div>
          <button type="button" className="ghost-button">
            Ver similares
          </button>
        </div>

        <div className="recommendation-layout">
          <article className="current-product">
            <div className="product-visual">
              <span>Imagen</span>
            </div>
            <div>
              <p className="eyebrow">Producto seleccionado</p>
              <h3>Producto que estas viendo</h3>
              <p>
                Aqui se mostraria el producto principal. A un lado aparecen
                articulos similares, relacionados o recomendados.
              </p>
            </div>
          </article>

          <div className="recommendation-list">
            {recommendedProducts.map((product) => (
              <article className="recommendation-card" key={product.name}>
                <div className="mini-image">Imagen</div>
                <div>
                  <h3>{product.name}</h3>
                  <p>{product.reason}</p>
                  <strong>{product.price}</strong>
                </div>
                <button type="button">Ver</button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="content-section" id="reseñas">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Confianza</p>
            <h2>Reseñas de productos mas vendidos</h2>
          </div>
          <button type="button" className="ghost-button">
            Ver todas
          </button>
        </div>

        <div className="review-grid">
          {reviews.map((review) => (
            <article className="review-card" key={review.product}>
              <div className="review-top">
                <span>{review.rating}</span>
                <p>{review.product}</p>
              </div>
              <blockquote>{review.text}</blockquote>
              <p className="review-author">{review.author}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="seller-section" id="vender">
        <div>
          <p className="eyebrow">Para todo público</p>
          <h2>Tu propia tienda dentro del marketplace.</h2>
          <p>
            Lorem Ipsum es simplemente el texto de relleno de las imprentas y archivos de texto. 
            Lorem Ipsum ha sido el texto de relleno estándar de las industrias desde el año 1500, cuando un impresor 
            (N. del T. persona que se dedica a la imprenta) desconocido usó una galería de textos
            y los mezcló de tal manera que logró hacer un libro de textos especimen.
          </p>
        </div>
        <div className="seller-steps">
          <span>1. Crea tu perfil</span>
          <span>2. Sube tus productos</span>
          <span>3. Recibe pedidos</span>
        </div>
      </section>
    </main>
  )
}

export default App
