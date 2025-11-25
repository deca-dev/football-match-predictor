# ⚽ Soccer Match Predictor

Aplicación Full Stack para predicción de partidos de fútbol con análisis de clima e IA.

## 🚀 Stack Tecnológico

- **Backend:** NestJS + TypeScript + TypeORM + PostgreSQL
- **Frontend:** React + TypeScript + Shadcn UI + Zustand
- **IA:** OpenRouter ()
- **APIs:** TheSportsDB, OpenWeatherMap
- **DevOps:** Docker, GitHub Actions, DigitalOcean

## 🏃‍♂️ Quick Start

### Prerrequisitos
- Node.js
- Docker y Docker Compose
- Git

### Instalación

1. Clonar repositorio:
```bash
git clone <tu-repo>
cd futbol-predictor
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
# Edita .env con tus API keys
```

3. Levantar con Docker:
```bash
docker-compose up -d
```

4. Acceder a:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- PostgreSQL: localhost:5432

## 📝 TODO

- [ ] Backend API setup
- [ ] Database models
- [ ] External APIs integration
- [ ] Frontend components
- [ ] Docker configuration
- [ ] GitHub Actions
- [ ] Deploy to DigitalOcean