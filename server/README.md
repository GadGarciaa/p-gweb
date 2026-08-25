# Backend — Marketplace

API en Node.js + Express + SQLite (better-sqlite3) para el marketplace con 3 roles: `comprador`, `vendedor`, `administrador`.

## Uso

```bash
npm install
npm run dev     # con recarga automática (node --watch)
# o
npm start
```

El servidor levanta en `http://localhost:4000`. La base de datos (`data.sqlite`) se crea sola en el primer arranque, con categorías y usuarios de ejemplo.

## Usuarios sembrados (para probar)

| Rol            | Email                     | Contraseña   |
|----------------|---------------------------|--------------|
| Administrador  | admin@marketplace.com     | Admin123!    |
| Vendedor       | vendedor@marketplace.com  | Demo1234!    |
| Comprador      | cliente@marketplace.com   | Demo1234!    |

(Definidos/editables en `.env` para el admin; los de vendedor/comprador están fijos en `db.js`.)

## Endpoints principales

- `POST /api/auth/register` `{ name, email, password, role? }` — role solo puede ser `comprador` o `vendedor` (el admin se crea por seed).
- `POST /api/auth/login` `{ email, password }`
- `GET /api/auth/me` (requiere token)
- `GET /api/categories` · `POST/PUT/DELETE /api/categories` (solo admin)
- `GET /api/products?category=slug&search=texto` · `GET /api/products/:id`
- `POST/PUT/DELETE /api/products/:id` (vendedor dueño o admin)
- `POST /api/orders` (comprador compra un producto) · `GET /api/orders/mine` · `GET /api/orders/sales` (vendedor) · `GET /api/orders` (admin) · `PATCH /api/orders/:id/status`
- `GET /api/reviews?productId=` · `POST /api/reviews` (comprador)
- `GET/PATCH/DELETE /api/users` (solo admin)

Todas las rutas protegidas usan `Authorization: Bearer <token>` (JWT, expira en 7 días).
