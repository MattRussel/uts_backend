const express = require('express');

const authenticationMiddleware = require('../../middlewares/authentication-middleware');
const celebrate = require('../../../core/celebrate-wrappers');
const usersControllers = require('./users-controller');
const usersValidator = require('./users-validator');

const route = express.Router();

module.exports = (app) => {
  app.use('/users', route);

  // Get list of users
  route.get('/', authenticationMiddleware, usersControllers.getUsers);

  // Create user
  route.post(
    '/',
    authenticationMiddleware,
    celebrate(usersValidator.createUser),
    usersControllers.createUser
  );

  // Get user detail
  route.get('/:id', authenticationMiddleware, usersControllers.getUser);

  // Update user
  route.put(
    '/:id',
    authenticationMiddleware,
    celebrate(usersValidator.updateUser),
    usersControllers.updateUser
  );

  // Delete user
  route.delete('/:id', authenticationMiddleware, usersControllers.deleteUser);

  // Change password
  route.post(
    '/:id/change-password',
    authenticationMiddleware,
    celebrate(usersValidator.changePassword),
    usersControllers.changePassword
  );


  // Fungsi Create: Membuat akun user
  route.post(
    '/eonlinebankings',
    authenticationMiddleware,
    celebrate(usersValidator.createEonlinebanking),
    usersControllers.createEonlinebanking
  );

  // Fungsi Read: Cek saldo
  route.get(
    '/eonlinebankings/balance',
    authenticationMiddleware,
    celebrate(usersValidator.getUserBalance),
    usersControllers.getUserBalance
  );

  // Fungsi Update: Menabung dan penarikan
  route.put(
    '/eonlinebankings/update-balance/:id',
    authenticationMiddleware,
    celebrate(usersValidator.updateBalance),
    usersControllers.updateBalance
  );

  // Fungsi Delete: Menutup akun bank
  route.delete(
    '/eonlinebankings/delete-account/:id',
    authenticationMiddleware,
    celebrate(usersValidator.deleteEonlinebanking),
    usersControllers.deleteEonlinebanking
    );
};