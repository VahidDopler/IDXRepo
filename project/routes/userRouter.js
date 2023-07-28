const express = require('express');
const userControllers = require('../Controllers/userController');
const authControllers = require('../Controllers/authController');
const authController = require("../Controllers/authController");

const router = express.Router();

router.post(`/signup`, authControllers.signup);
router.post('/login', authControllers.login);

router.post('/forgotpassword', authControllers.forgotPassword);
router.patch('/resetpassword/:token', authControllers.resetPassword);
router.patch('/changpassword' ,authControllers.protect, authControllers.updatePassword)
router.delete('/deleteme' ,authController.protect, userControllers.deleteMe)
router.patch('/updateme' , authController.protect , userControllers.updateMe)
router
  .route('/')
  .get(userControllers.getUsers)
  .post(userControllers.createUser);

router
  .route('/:id')
  .patch(userControllers.updateUser)
  .delete(authControllers.protect , authController.restrictTo('admin'),userControllers.deleteUser)
  .get(userControllers.getUser);

module.exports = router;
