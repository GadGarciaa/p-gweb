const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
// Origen del backend sin el sufijo /api, para armar URLs de archivos servidos
// estaticamente (ej. imagenes subidas en /uploads/...).
export const API_ORIGIN = API_URL.replace(/\/api\/?$/, '')

export function resolveImageUrl(path) {
  if (!path) return null
  if (/^https?:\/\//.test(path)) return path
  return `${API_ORIGIN}${path}`
}

const TOKEN_KEY = 'marketplace_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (res.status === 204) return null

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || `Error ${res.status} al llamar a ${path}`)
  }
  return data
}

export const api = {
  // Auth
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  me: () => request('/auth/me', { auth: true }),

  // Categorias
  getCategories: () => request('/categories'),
  createCategory: (payload) => request('/categories', { method: 'POST', body: payload, auth: true }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: 'DELETE', auth: true }),

  // Productos
  getProducts: (params = {}) => {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v))
    ).toString()
    return request(`/products${query ? `?${query}` : ''}`)
  },
  getProduct: (id) => request(`/products/${id}`),
  createProduct: (payload) => request('/products', { method: 'POST', body: payload, auth: true }),
  updateProduct: (id, payload) => request(`/products/${id}`, { method: 'PUT', body: payload, auth: true }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE', auth: true }),
  uploadImage: async (file) => {
    const token = getToken()
    const formData = new FormData()
    formData.append('image', file)
    const res = await fetch(`${API_URL}/products/upload-image`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || 'No se pudo subir la imagen.')
    return data
  },

  // Pedidos
  createOrder: (payload) => request('/orders', { method: 'POST', body: payload, auth: true }),
  getMyOrders: () => request('/orders/mine', { auth: true }),
  getMySales: () => request('/orders/sales', { auth: true }),
  getAllOrders: () => request('/orders', { auth: true }),
  updateOrderStatus: (id, status) =>
    request(`/orders/${id}/status`, { method: 'PATCH', body: { status }, auth: true }),

  // Resenas
  getReviews: (productId) => request(`/reviews${productId ? `?productId=${productId}` : ''}`),
  createReview: (payload) => request('/reviews', { method: 'POST', body: payload, auth: true }),

  // Usuarios (admin)
  getUsers: () => request('/users', { auth: true }),
  updateUserRole: (id, role) => request(`/users/${id}/role`, { method: 'PATCH', body: { role }, auth: true }),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE', auth: true }),
}
