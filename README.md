# Marketplace — Front + Back

Front en React + Vite, conectado a un backend propio en `server/` (Node.js + Express + SQLite) con 3 roles: comprador, vendedor y administrador.

## Correr el proyecto (dos procesos)

```bash
# 1. Backend (puerto 4000)
cd server
npm install
npm run dev

# 2. Frontend (puerto 5173), en otra terminal
npm install
npm run dev
```

Abre `http://localhost:5173`. El front lee la URL de la API desde `.env` (`VITE_API_URL`).

Credenciales de prueba y detalle de la API en [`server/README.md`](./server/README.md).

---

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
