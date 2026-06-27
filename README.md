# 🇻🇪 Rescate Infantil Venezuela

Sistema de registro, búsqueda y seguimiento de niños y niñas rescatados durante la emergencia nacional de Venezuela.

## Estructura del proyecto

```
rescate/
├── backend/    # API REST — NestJS + Prisma + PostgreSQL
└── frontend/   # Interfaz web — React + Vite + TailwindCSS
```

## Requisitos

- Node.js 20+
- PostgreSQL 14+
- npm 9+

## Instalación rápida (desarrollo)

```bash
# 1. Instalar dependencias
cd backend && npm install
cd ../frontend && npm install

# 2. Configurar base de datos
cd ../backend
cp .env.example .env
# Edita .env con tus credenciales de PostgreSQL

# 3. Crear tablas
npx prisma migrate dev

# 4. Levantar backend (puerto 3000)
npm run start:dev

# 5. En otra terminal — levantar frontend (puerto 5173)
cd ../frontend
npm run dev
```

Abre `http://localhost:5173` en tu navegador.

## Despliegue en producción (Debian + Apache2)

Ver guía completa en [backend/README.md](backend/README.md).

## Stack tecnológico

| Capa       | Tecnología                              |
|------------|------------------------------------------|
| Backend    | NestJS, Prisma ORM, JWT, Multer, Sharp  |
| Base datos | PostgreSQL                               |
| Frontend   | React 18, Vite, TailwindCSS v4, Zod     |
| Servidor   | Apache2 (reverse proxy + static files)  |
| Proceso    | PM2                                      |

## Licencia

Uso humanitario — Emergencia Nacional Venezuela.
