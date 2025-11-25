export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USER || 'admin',
    password: process.env.DATABASE_PASSWORD || 'password123',
    database: process.env.DATABASE_NAME || 'futbol_app',
  },
  
  apis: {
    sports: {
      key: process.env.SPORTS_API_KEY || '3',
      baseUrl: 'https://www.thesportsdb.com/api/v1/json',
    },
    weather: {
      key: process.env.WEATHER_API_KEY || '',
      baseUrl: 'https://api.openweathermap.org/data/2.5',
    },
    ai: {
      key: process.env.AI_API_KEY || '',
      model: process.env.AI_MODEL || 'deepseek/deepseek-chat',
      baseUrl: process.env.AI_BASE_URL || 'https://openrouter.ai/api/v1',
    },
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRATION || '24h',
  },
  
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
});