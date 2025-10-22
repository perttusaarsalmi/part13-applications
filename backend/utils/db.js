const { Sequelize } = require('sequelize');
const logger = require('./logger');
const sequelize = new Sequelize(process.env.DATABASE_URL);
const { Umzug, SequelizeStorage } = require('umzug');

const runMigrations = async () => {
  const migrator = new Umzug({
    migrations: {
      glob: 'migrations/*.js',
    },
    storage: new SequelizeStorage({ sequelize, tableName: 'migrations' }),
    context: sequelize.getQueryInterface(),
    logger: console,
  });

  const migrations = await migrator.up();
  console.log('Migrations up to date', {
    files: migrations.map((mig) => mig.name),
  });
};

const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    await runMigrations();
    logger.info('Connected to PostgreSQL database');
    logger.info('Database migrations completed');
  } catch (error) {
    logger.error('Failed to connect to the database:', error);
    return process.exit(1);
  }

  return null;
};

module.exports = { sequelize, connectToDatabase };
