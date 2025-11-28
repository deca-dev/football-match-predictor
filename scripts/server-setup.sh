#!/bin/bash

# Football Match Predictor - Server Setup Script
# Run this on a fresh Ubuntu 22.04/24.04 DigitalOcean Droplet

set -e

echo "🚀 Setting up Football Match Predictor server..."

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install Docker
echo "🐳 Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

# Install Docker Compose
echo "🐳 Installing Docker Compose..."
apt install docker-compose-plugin -y

# Create app directory
echo "📁 Creating app directory..."
mkdir -p /opt/football-predictor
cd /opt/football-predictor

# Create docker-compose.prod.yml
echo "📝 Creating production docker-compose..."
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: football_postgres
    environment:
      POSTGRES_USER: ${DATABASE_USER}
      POSTGRES_PASSWORD: ${DATABASE_PASSWORD}
      POSTGRES_DB: ${DATABASE_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - football_network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DATABASE_USER} -d ${DATABASE_NAME}"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    image: ghcr.io/YOUR_GITHUB_USERNAME/football-match-predictor-backend:latest
    container_name: football_backend
    environment:
      DATABASE_HOST: postgres
      DATABASE_PORT: 5432
      DATABASE_USER: ${DATABASE_USER}
      DATABASE_PASSWORD: ${DATABASE_PASSWORD}
      DATABASE_NAME: ${DATABASE_NAME}
      SPORTS_API_KEY: ${SPORTS_API_KEY}
      WEATHER_API_KEY: ${WEATHER_API_KEY}
      AI_API_KEY: ${AI_API_KEY}
      JWT_SECRET: ${JWT_SECRET}
      NODE_ENV: production
      PORT: 3000
      FRONTEND_URL: ${FRONTEND_URL}
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - football_network
    restart: unless-stopped

  frontend:
    image: ghcr.io/YOUR_GITHUB_USERNAME/football-match-predictor-frontend:latest
    container_name: football_frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - football_network
    restart: unless-stopped

networks:
  football_network:
    driver: bridge

volumes:
  postgres_data:
EOF

# Create .env template
echo "📝 Creating .env template..."
cat > .env << 'EOF'
# Database
DATABASE_USER=admin
DATABASE_PASSWORD=password
DATABASE_NAME=football_app

# APIs
SPORTS_API_KEY=3
WEATHER_API_KEY=OPENWEATHERMAP_KEY
AI_API_KEY=GEMINI_KEY

# Security
JWT_SECRET=32_CHAR_SECRET_KEY

# Frontend URL
FRONTEND_URL=http://DROPLET_IP
EOF

echo ""
echo "✅ Server setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit /opt/football-predictor/.env with your real values"
echo "2. Update docker-compose.yml with your GitHub username"
echo "3. Log in to GitHub Container Registry:"
echo "   echo YOUR_GITHUB_TOKEN | docker login ghcr.io -u YOUR_USERNAME --password-stdin"
echo "4. Run: docker compose pull && docker compose up -d"
echo ""