export const config = {
  port: process.env.PORT || '5000',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/skill-exchange',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
};
