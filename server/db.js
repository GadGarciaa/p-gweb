import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import 'dotenv/config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, 'data.sqlite')

export const db = new Database(dbPath)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('comprador', 'vendedor', 'administrador')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    price REAL NOT NULL,
    image_url TEXT,
    stock INTEGER NOT NULL DEFAULT 0,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    seller_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    buyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    total REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'enviado', 'completado', 'cancelado')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    text TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`)

function seed() {
  const categoryCount = db.prepare('SELECT COUNT(*) AS n FROM categories').get().n
  if (categoryCount === 0) {
    const insertCategory = db.prepare('INSERT INTO categories (name, slug) VALUES (?, ?)')
    const categories = ['Belleza', 'Hogar', 'Moda', 'Artesanal', 'Bienestar']
    for (const name of categories) {
      const slug = name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      insertCategory.run(name, slug)
    }
    console.log('Categorias sembradas:', categories.join(', '))
  }

  const userCount = db.prepare('SELECT COUNT(*) AS n FROM users').get().n
  if (userCount === 0) {
    const insertUser = db.prepare(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)'
    )

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@marketplace.com'
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!'
    insertUser.run('Administrador', adminEmail, bcrypt.hashSync(adminPassword, 10), 'administrador')
    console.log(`Administrador creado -> ${adminEmail} / ${adminPassword}`)

    const demoPasswordHash = bcrypt.hashSync('Demo1234!', 10)
    const vendorId = insertUser.run('Vendedor Demo', 'vendedor@marketplace.com', demoPasswordHash, 'vendedor').lastInsertRowid
    insertUser.run('Cliente Demo', 'cliente@marketplace.com', demoPasswordHash, 'comprador')
    console.log('Usuarios demo -> vendedor@marketplace.com / cliente@marketplace.com (clave: Demo1234!)')

    const categoryRow = (name) => db.prepare('SELECT id FROM categories WHERE name = ?').get(name)
    const insertProduct = db.prepare(`
      INSERT INTO products (name, description, price, image_url, stock, category_id, seller_id)
      VALUES (@name, @description, @price, @image_url, @stock, @category_id, @seller_id)
    `)

    const demoProducts = [
      { name: 'Set cuidado personal', description: 'Kit de belleza con productos naturales.', price: 389, category: 'Belleza' },
      { name: 'Vestido artesanal', description: 'Diseño exclusivo hecho a mano.', price: 640, category: 'Moda' },
      { name: 'Set de cocina', description: 'Utensilios de cocina para el hogar.', price: 220, category: 'Hogar' },
      { name: 'Canasta tejida', description: 'Pieza artesanal tejida a mano.', price: 510, category: 'Artesanal' },
      { name: 'Aceites esenciales', description: 'Set de bienestar y relajación.', price: 300, category: 'Bienestar' },
    ]

    for (const p of demoProducts) {
      const category = categoryRow(p.category)
      insertProduct.run({
        name: p.name,
        description: p.description,
        price: p.price,
        image_url: null,
        stock: 25,
        category_id: category.id,
        seller_id: vendorId,
      })
    }
    console.log('Productos demo sembrados.')
  }
}

seed()

export default db
