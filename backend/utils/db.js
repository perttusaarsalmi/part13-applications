const { Sequelize } = require('sequelize');
const logger = require('./logger');

const sequelize = new Sequelize(process.env.DATABASE_URL);

const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Connected to PostgreSQL database');
    await sequelize.sync();
    logger.info('Database synced');
  } catch (error) {
    logger.error('Failed to connect to the database:', error);
    return process.exit(1);
  }

  return null;
};

module.exports = { sequelize, connectToDatabase };
