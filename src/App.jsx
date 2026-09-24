import { useState } from 'react'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import './App.css'
import AuthModal from './components/AuthModal.jsx'
import CartDrawer from './components/CartDrawer.jsx'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { CartProvider, useCart } from './context/CartContext.jsx'
import Home from './pages/Home.jsx'
import MyOrders from './pages/MyOrders.jsx'
import ProductDetailRoute from './pages/ProductDetail.jsx'

function AppContent() {
  const { user, logout } = useAuth()
  const { totalCount } = useCart()
  const [authModal, setAuthModal] = useState(null)
  const [cartOpen, setCartOpen] = useState(false)

  function openAuthModal(mode = 'login', role = 'comprador') {
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
          <Link to="/">Comprar</Link>
          <a href="/#recomendados">Recomendados</a>
          <a href="/#reseñas">Reseñas</a>
          <button type="button" onClick={handleSellHere}>
            Vender
          </button>
          {user?.role === 'comprador' && <Link to="/mis-pedidos">Mis pedidos</Link>}
        </nav>

        <div className="top-actions">
          {user ? (
            <>
              <span className="user-pill">
                {user.name} · {user.role}
              </span>
              <button type="button" className="ghost-button" onClick={logout}>
                Salir
              </button>
            </>
          ) : (
            <button type="button" className="ghost-button" onClick={() => openAuthModal('login')}>
              Iniciar sesion
            </button>
          )}

          <button type="button" className="secondary-button" onClick={() => setCartOpen(true)}>
            Carrito ({totalCount})
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
          element={<ProductDetailRoute onOpenCart={() => setCartOpen(true)} />}
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
          onRequireAuth={() => openAuthModal('login')}
        />
      )}
    </main>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
