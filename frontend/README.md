# Frontend — Rescate Infantil Venezuela

Interfaz web construida con React 18, Vite y TailwindCSS v4.

## Instalación

```bash
npm install
npm run dev     # Puerto 5173
```

El frontend se conecta al backend en `http://localhost:3000` via proxy de Vite (configurado en `vite.config.ts`).

## Comandos

```bash
npm run dev       # Desarrollo con hot-reload
npm run build     # Compilar para producción → genera dist/
npm run preview   # Vista previa del build
```

## Despliegue

```bash
npm run build
# Sube la carpeta dist/ al servidor
# Apache2 sirve dist/ como archivos estáticos
```

## Estructura

```
src/
├── api/           # Cliente Axios + endpoints
├── data/          # Estados y municipios de Venezuela
├── features/
│   ├── public/    # Página pública (búsqueda + registro)
│   ├── auth/      # Login
│   └── dashboard/ # Panel de gestión (requiere JWT)
└── main.tsx
```
