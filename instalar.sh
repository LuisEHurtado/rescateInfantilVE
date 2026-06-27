#!/bin/bash
# Script de instalación - Sistema Rescate Venezuela
# Ubuntu 22.04+ con Node.js 18+ y PostgreSQL instalado

set -e
echo "=== INSTALACIÓN SISTEMA RESCATE VENEZUELA ==="

# 1. Backend
echo "[1/5] Instalando dependencias del backend..."
cd backend
npm install

# 2. Configurar .env si no existe
if [ ! -f .env ]; then
  cp .env.example .env
  echo "IMPORTANTE: Edite backend/.env con sus credenciales de PostgreSQL"
  echo "Presione Enter para continuar..."
  read
fi

# 3. Ejecutar migraciones Prisma
echo "[2/5] Ejecutando migraciones de base de datos..."
npx prisma migrate deploy
npx prisma generate

# 4. Seed inicial (usuarios por defecto)
echo "[3/5] Creando datos iniciales..."
npx ts-node prisma/seed.ts

# 5. Frontend
echo "[4/5] Instalando dependencias del frontend..."
cd ../frontend
npm install

# 6. Build de producción
echo "[5/5] Construyendo frontend para producción..."
npm run build

echo ""
echo "=== INSTALACIÓN COMPLETA ==="
echo ""
echo "Para iniciar el sistema:"
echo "  Terminal 1 (Backend):  cd backend && npm run start:prod"
echo "  Terminal 2 (Frontend): cd frontend && npm run preview"
echo ""
echo "Usuarios iniciales:"
echo "  admin       / Admin2024!      [Administrador]"
echo "  rescatista1 / Rescate2024!    [Rescatista]"
echo "  hospital1   / Hospital2024!   [Hospital]"
echo "  consulta    / Consulta2024!   [Solo lectura]"
echo ""
echo "API: http://localhost:3000/api"
echo "Documentación Swagger: http://localhost:3000/api/docs"
echo "Frontend: http://localhost:4173"
