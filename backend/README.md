# Backend — Rescate Infantil Venezuela

API REST construida con NestJS, Prisma y PostgreSQL.

## Instalación

```bash
npm install
cp .env.example .env
# Edita .env con tus credenciales
npx prisma migrate dev
```

## Variables de entorno

Copia `.env.example` a `.env` y ajusta los valores:

```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/rescate"
JWT_SECRET="clave_secreta_muy_larga"
JWT_EXPIRES_IN="8h"
PORT=3000
FRONTEND_URL="http://localhost:5173"
```

## Comandos

```bash
npm run start:dev     # Desarrollo con hot-reload
npm run build         # Compilar a producción
npm run start:prod    # Iniciar compilado
npx prisma studio     # Explorador visual de la BD
npx prisma migrate dev   # Crear/aplicar migraciones
npx prisma migrate deploy  # Aplicar migraciones en producción
```

## Endpoints principales

| Método | Ruta                              | Auth     | Descripción                    |
|--------|-----------------------------------|----------|--------------------------------|
| POST   | /api/children/quick-register      | Público  | Registrar niño/niña            |
| GET    | /api/search                       | Público  | Buscar expedientes             |
| PATCH  | /api/children/:id/status          | Público  | Actualizar situación           |
| POST   | /api/children/:id/photos          | Público  | Subir foto                     |
| POST   | /api/auth/login                   | Público  | Login de personal              |
| GET    | /api/children                     | JWT      | Listar expedientes (panel)     |
| GET    | /api/dashboard/stats              | JWT      | Estadísticas                   |

Documentación Swagger disponible en `/api/docs` cuando el servidor está corriendo.

## Despliegue en Debian + Apache2

### 1. Instalar dependencias en el servidor

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs postgresql postgresql-contrib apache2
sudo npm install -g pm2
sudo a2enmod proxy proxy_http rewrite headers
```

### 2. Crear base de datos

```bash
sudo -u postgres psql -c "CREATE DATABASE rescate;"
sudo -u postgres psql -c "CREATE USER rescate_user WITH PASSWORD 'tu_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE rescate TO rescate_user;"
```

### 3. Subir y configurar

```bash
# En el servidor
cd /var/www/rescate/backend
cp .env.example .env
nano .env   # Edita con credenciales reales

npm install --omit=dev
npm run build
npx prisma migrate deploy
```

### 4. Iniciar con PM2

```bash
pm2 start dist/src/main.js --name rescate-backend
pm2 save
pm2 startup
```

### 5. Configurar Apache2

Crea `/etc/apache2/sites-available/rescate.conf`:

```apache
<VirtualHost *:80>
    ServerName tudominio.com

    DocumentRoot /var/www/rescate/frontend/dist
    <Directory /var/www/rescate/frontend/dist>
        Options -Indexes
        AllowOverride All
        Require all granted
        FallbackResource /index.html
    </Directory>

    ProxyPass /api http://localhost:3000/api
    ProxyPassReverse /api http://localhost:3000/api

    ProxyPass /uploads http://localhost:3000/uploads
    ProxyPassReverse /uploads http://localhost:3000/uploads
</VirtualHost>
```

```bash
sudo a2ensite rescate.conf
sudo systemctl restart apache2

# HTTPS gratis (recomendado)
sudo apt install -y certbot python3-certbot-apache
sudo certbot --apache -d tudominio.com
```
