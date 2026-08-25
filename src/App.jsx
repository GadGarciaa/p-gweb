import { useState } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import './App.css'
import { useAuth } from './context/AuthContext.jsx'
import { useCart } from './context/CartContext.jsx'
import AuthModal from './components/AuthModal.jsx'
import CartDrawer from './components/CartDrawer.jsx'
import Home from './pages/Home.jsx'
import ProductDetail from './pages/ProductDetail.jsx'
import MyOrders from './pages/MyOrders.jsx'

function App() {
  const { user, loading: authLoading, logout } = useAuth()
  const { totalCount } = useCart()

  const [authModal, setAuthModal] = useState(null) // { mode, role } | null
  const [cartOpen, setCartOpen] = useState(false)

  function openAuthModal(mode, role = 'comprador') {
    setAuthModal({ mode, role })
  }

  function handleSellHere() {
    if (!user) {
      openAuthModal('register', 'vendedor')
      return
    }
    document.getElementById('vender')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <main>
      <header className="topbar">
        <Link className="brand" to="/" aria-label="Mercado inicio">
          <span className="brand-mark">M</span>
          <span>Mercado</span>
        </Link>

        <nav className="nav-links" aria-label="Navegacion principal">
          <a href="/#comprar">Comprar</a>
          <a href="/#recomendados">Recomendados</a>
          <a href="/#reseñas">Reseñas</a>
          <a href="/#vender">Vender</a>
          <a href="/#categorias">Categorias</a>
          {user?.role === 'comprador' && <Link to="/mis-pedidos">Mis pedidos</Link>}
        </nav>

        <div className="top-actions">
          {authLoading ? null : user ? (
            <>
              <span className="session-chip">
                {user.name} · {user.role}
              </span>
              <button type="button" className="ghost-button" onClick={logout}>
                Cerrar sesion
              </button>
            </>
          ) : (
            <button
              type="button"
              className="ghost-button"
              onClick={() => openAuthModal('login', 'comprador')}
            >
              Iniciar sesion
            </button>
          )}
          <button type="button" className="ghost-button cart-button" onClick={() => setCartOpen(true)}>
            Carrito
            {totalCount > 0 && <span className="cart-badge">{totalCount}</span>}
          </button>
          <button type="button" className="primary-button" onClick={handleSellHere}>
            Vender aqui
          </button>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<Home onOpenAuthModal={openAuthModal} />} />
        <Route
          path="/producto/:id"
          element={<ProductDetail onOpenCart={() => setCartOpen(true)} />}
        />
        <Route path="/mis-pedidos" element={<MyOrders />} />
      </Routes>

      {authModal && (
        <AuthModal
          initialMode={authModal.mode}
          initialRole={authModal.role}
          onClose={() => setAuthModal(null)}
        />
      )}

      {cartOpen && (
        <CartDrawer
          onClose={() => setCartOpen(false)}
          onRequireAuth={() => {
            setCartOpen(false)
            openAuthModal('login', 'comprador')
          }}
        />
      )}
    </main>
  )
}

export default App
