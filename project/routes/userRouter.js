const express = require('express');
const userControllers = require('../Controllers/userController');
const authControllers = require('../Controllers/authController');

const router = express.Router();

router.post(`/signup`, authControllers.signup);

router
  .route('/')
  .get(userControllers.getUsers)
  .post(userControllers.createUser);

router
  .route('/:id')
  .patch(userControllers.updateUser)
  .delete(userControllers.deleteUser)
  .get(userControllers.getUser);

module.exports = router;
