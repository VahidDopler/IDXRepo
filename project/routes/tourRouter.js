const express = require("express");
// eslint-disable-next-line import/extensions
const tourController = require("../Controllers/tourControllers.js");
const tourRouter = express.Router();
const authController = require('../Controllers/authController');

tourRouter.route("/monthly-plan/:year").get(tourController.getMonthlyPlan);

tourRouter
  .route("/top-4-cheap")
  .get(tourController.getaliesTour, tourController.getAllTours);

tourRouter.route("/getTourStats")
  .get(tourController.getTourStats);
//id is symbol for the string of parameter inb url

tourRouter
  .route("/:id")
  //In here i add a middleware to check if id input is valid or not
  .delete(tourController.deleteTour)
  .patch(tourController.UpdateTour)
  .get(authController.protect,tourController.getSpecificTour);

tourRouter
  .route("/")
  .post(tourController.createNewTour)
  .get(authController.protect,tourController.getAllTours);

module.exports = tourRouter;
