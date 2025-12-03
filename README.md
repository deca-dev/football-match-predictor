# ⚽ Soccer Match Predictor

Full Stack application for predicting soccer matches with weather analysis and AI.

## 🚀 Tech Stack

- **Backend:** NestJS + TypeScript + TypeORM + PostgreSQL
- **Frontend:** React + TypeScript + Shadcn UI + Zustand
- **AI:** Google Gemini
- **APIs:** TheSportsDB, OpenWeatherMap
- **DevOps:** Docker, GitHub Actions, DigitalOcean

## 🌐 Live Demo

- **Frontend:** http://18.220.67.144
- **API:** http://18.220.67.144:3000/api

---

## 🏃‍♂️ Quick Start

### Prerequisites

- Node.js  
- Docker and Docker Compose  
- Git  

---

## Installation

### 1. Clone repository

```bash
git clone https://github.com/YOUR_USERNAME/football-match-predictor.git
cd football-match-predictor
```

### 2. Configure environment variables

**Backend:**

```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your API keys
```

**Frontend:**

```bash
cp frontend/.env.example frontend/.env
```

### 3. Start database

```bash
docker-compose up -d postgres
```

### 4. Start backend

```bash
cd backend
npm install
npm run start:dev
```

### 5. Start frontend

```bash
cd frontend
npm install
npm run dev
```

### 6. Open in browser

- Frontend: http://localhost:5173  
- Backend API: http://localhost:3000/api  
- Swagger Docs: http://localhost:3000/docs  

---

## 🐳 Docker (Local Production)

```bash
# Create .env at the root
cp .env.example .env
# Edit .env with real values

# Build and run
docker-compose up --build
```

- Frontend: http://localhost  
- Backend: http://localhost:3000/api  

---

## ☁️ Deployment on AWS EC2

### 1. Create EC2 Instance

- Ubuntu 24.04 LTS  
- t3.micro (Free Tier)  
- Security Groups: SSH (22), HTTP (80), HTTPS (443), Custom TCP (3000)  

### 2. Configure server

```bash
# SSH into the server
ssh -i ~/.ssh/football-key.pem ubuntu@YOUR_EC2_IP

# Download and run setup script
curl -fsSL https://raw.githubusercontent.com/deca-dev/football-match-predictor/main/scripts/server-setup.sh | bash
```

### 3. Configure variables

```bash
cd /opt/football-predictor
nano .env
# Add your real values
```

### 4. Configure GitHub Secrets

In your GitHub repository, go to:  
**Settings > Secrets > Actions**

Add:

| Secret        | Description            |
|---------------|------------------------|
| `DO_HOST`     | IP                     |
| `DO_USERNAME` | `root`                 |
| `DO_SSH_KEY`  | Your private SSH key   |

### 5. Deploy

Every push to `main` will automatically deploy via GitHub Actions.

---

## 📡 API Endpoints

### Auth

- `POST /api/auth/register` – User registration  
- `POST /api/auth/login` – Login  

### Matches

- `GET /api/matches?league=spanish` – Get matches  
- `GET /api/matches/:id` – Match detail  
- `GET /api/matches/:id/details` – Full statistics  

### Weather

- `GET /api/weather?city=Madrid` – Weather by city  

### AI Analysis

- `POST /api/ai-analysis` – Generate analysis  
- `GET /api/ai-analysis/:matchId` – Get analysis  

### Favorites (Auth required)

- `GET /api/favorites` – My favorites  
- `POST /api/favorites` – Add favorite  
- `DELETE /api/favorites/:teamName` – Remove favorite  
- `GET /api/favorites/:teamId/next-match` – Next match  
- `GET /api/favorites/:teamId/last-matches` – Last matches  

---

## 🔑 Environment Variables

| Variable            | Description                 | Required |
|---------------------|-----------------------------|----------|
| `DATABASE_USER`     | PostgreSQL user             | ✅       |
| `DATABASE_PASSWORD` | PostgreSQL password         | ✅       |
| `DATABASE_NAME`     | Database name               | ✅       |
| `SPORTS_API_KEY`    | TheSportsDB API key (use "3") | ✅     |
| `WEATHER_API_KEY`   | OpenWeatherMap API key      | ✅       |
| `AI_API_KEY`        | Google Gemini API key       | ✅       |
| `JWT_SECRET`        | JWT secret (32+ characters) | ✅       |
| `FRONTEND_URL`      | Frontend URL for CORS       | ✅       |

---

## 📁 Project Structure

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

---

## 👨‍💻 Author

David – [GitHub](https://github.com/deca-dev)
