const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
const router = express.Router();

router
  .post('/signup', authController.signup)
  .post('/login', authController.login);

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/id')
  .get(userController.getUsers)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
