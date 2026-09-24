# Mercado

Marketplace con React/Vite en el frontend y Node.js, Express y SQLite en el backend.

## Requisitos

- Node.js 22 (`nvm use` dentro de la carpeta del proyecto)

## Ejecutar localmente

En una terminal, inicia el backend:

```bash
cd server
nvm use
npm install
npm run dev
```

En otra terminal, inicia el frontend:

```bash
nvm use
npm install
npm run dev
```

Abre `http://localhost:5173`.

La configuracion local del backend vive en `server/.env`. No se sube a Git; toma `server/.env.example` como referencia.

## Cuentas de demostracion

| Rol | Correo | Contrasena |
| --- | --- | --- |
| Administrador | admin@marketplace.com | Admin123! |
| Vendedor | vendedor@marketplace.com | Demo1234! |
| Comprador | cliente@marketplace.com | Demo1234! |

El pago esta simulado: finalizar una compra crea el pedido y actualiza el inventario, pero no realiza un cobro real.
