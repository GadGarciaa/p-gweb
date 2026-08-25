import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)
const STORAGE_KEY = 'marketplace_cart'

function readStoredCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => readStoredCart())

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = useCallback((product, quantity = 1) => {
    setItems((current) => {
      const maxQty = product.stock ?? Infinity
      const existing = current.find((i) => i.product_id === product.id)
      if (existing) {
        const nextQty = Math.min(existing.quantity + quantity, maxQty)
        return current.map((i) => (i.product_id === product.id ? { ...i, quantity: nextQty } : i))
      }
      return [
        ...current,
        {
          product_id: product.id,
          name: product.name,
          price: product.price,
          stock: product.stock,
          category_name: product.category_name,
          seller_name: product.seller_name,
          quantity: Math.max(1, Math.min(quantity, maxQty)),
        },
      ]
    })
  }, [])

  const updateQuantity = useCallback((productId, quantity) => {
    setItems((current) =>
      current
        .map((i) => (i.product_id === productId ? { ...i, quantity: Math.min(quantity, i.stock ?? Infinity) } : i))
        .filter((i) => i.quantity > 0)
    )
  }, [])

  const removeItem = useCallback((productId) => {
    setItems((current) => current.filter((i) => i.product_id !== productId))
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const totalCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items])
  const totalPrice = useMemo(() => items.reduce((sum, i) => sum + i.quantity * i.price, 0), [items])

  return (
    <CartContext.Provider
      value={{ items, addItem, updateQuantity, removeItem, clearCart, totalCount, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- hook companero del provider
export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>')
  return ctx
}
