const mongoose = require('mongoose');
const config = require('../core/config');
const logger = require('../core/logger')('app');

const usersSchema = require('./users-schema');

const eonlinebankingsSchema = require('./eonlinebankings-schema')

mongoose.connect(`${config.database.connection}/${config.database.name}`, {
  useNewUrlParser: true,
});

const db = mongoose.connection;
db.once('open', () => {
  logger.info('Successfully connected to MongoDB');
});

const User = mongoose.model('users', mongoose.Schema(usersSchema));

const Eonlinebanking = mongoose.model('eonlinebankings', mongoose.Schema(eonlinebankingsSchema))

module.exports = {
  mongoose,
  User,
  Eonlinebanking,
};
