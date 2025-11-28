# ⚽ Soccer Match Predictor

Aplicación Full Stack para predicción de partidos de fútbol con análisis de clima e IA.

## 🚀 Stack Tecnológico

- **Backend:** NestJS + TypeScript + TypeORM + PostgreSQL
- **Frontend:** React + TypeScript + Shadcn UI + Zustand
- **IA:** Google Gemini
- **APIs:** TheSportsDB, OpenWeatherMap
- **DevOps:** Docker, GitHub Actions, DigitalOcean


## 🏃‍♂️ Quick Start

### Prerrequisitos
- Node.js
- Docker y Docker Compose
- Git

### Instalación

### 1. Clonar repositorio
```bash
git clone https://github.com/YOUR_USERNAME/football-match-predictor.git
cd football-match-predictor
```

### 2. Configurar variables de entorno

**Backend:**
```bash
cp backend/.env.example backend/.env
# Editar backend/.env con tus API keys
```

**Frontend:**
```bash
cp frontend/.env.example frontend/.env
```

### 3. Iniciar base de datos
```bash
docker-compose up -d postgres
```

### 4. Iniciar backend
```bash
cd backend
npm install
npm run start:dev
```

### 5. Iniciar frontend
```bash
cd frontend
npm install
npm run dev
```

### 6. Abrir en navegador
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api
- Swagger Docs: http://localhost:3000/docs

## 🐳 Docker (Producción Local)
```bash
# Crear .env en la raíz
cp .env.example .env
# Editar .env con valores reales

# Construir y ejecutar
docker-compose up --build
```

- Frontend: http://localhost
- Backend: http://localhost:3000/api

## ☁️ Despliegue en DigitalOcean

### 1. Crear Droplet
- Ubuntu 22.04/24.04
- Mínimo 1GB RAM / 1 CPU
- Habilitar IPv4

### 2. Configurar servidor
```bash
# SSH al servidor
ssh root@YOUR_DROPLET_IP

# Descargar y ejecutar script de setup
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/football-match-predictor/main/scripts/server-setup.sh | bash
```

### 3. Configurar variables
```bash
cd /opt/football-predictor
nano .env
# Agregar tus valores reales
```

### 4. Configurar GitHub Secrets
En tu repositorio GitHub, ir a Settings > Secrets > Actions y agregar:

| Secret | Descripción |
|--------|-------------|
| `DO_HOST` | IP de tu Droplet |
| `DO_USERNAME` | `root` |
| `DO_SSH_KEY` | Tu llave SSH privada |

### 5. Deploy
Cada push a `main` desplegará automáticamente via GitHub Actions.

## 📡 API Endpoints

### Auth
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión

### Matches
- `GET /api/matches?league=spanish` - Obtener partidos
- `GET /api/matches/:id` - Detalle de partido
- `GET /api/matches/:id/details` - Estadísticas completas

### Weather
- `GET /api/weather?city=Madrid` - Clima por ciudad

### AI Analysis
- `POST /api/ai-analysis` - Generar análisis
- `GET /api/ai-analysis/:matchId` - Obtener análisis

### Favorites (Auth required)
- `GET /api/favorites` - Mis favoritos
- `POST /api/favorites` - Agregar favorito
- `DELETE /api/favorites/:teamName` - Eliminar favorito
- `GET /api/favorites/:teamId/next-match` - Próximo partido
- `GET /api/favorites/:teamId/last-matches` - Últimos partidos

## 🔑 Variables de Entorno

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `DATABASE_USER` | Usuario PostgreSQL | ✅ |
| `DATABASE_PASSWORD` | Contraseña PostgreSQL | ✅ |
| `DATABASE_NAME` | Nombre de la base de datos | ✅ |
| `SPORTS_API_KEY` | TheSportsDB API key (usar "3") | ✅ |
| `WEATHER_API_KEY` | OpenWeatherMap API key | ✅ |
| `AI_API_KEY` | Google Gemini API key | ✅ |
| `JWT_SECRET` | Secreto para JWT (32+ caracteres) | ✅ |
| `FRONTEND_URL` | URL del frontend para CORS | ✅ |

## 📁 Estructura del Proyecto
```
football-match-predictor/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── matches/
│   │   │   ├── weather/
│   │   │   ├── ai-analysis/
│   │   │   ├── favorites/
│   │   │   └── database/
│   │   ├── config/
│   │   └── main.ts
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   └── services/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── scripts/
│   └── server-setup.sh
├── .github/
│   └── workflows/
│       └── deploy.yml
├── docker-compose.yml
├── .env.example
└── README.md
```

## 👨‍💻 Autor

David - [GitHub](https://github.com/deca-dev)