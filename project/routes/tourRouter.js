const express = require("express");
// eslint-disable-next-line import/extensions
const tourController = require("../Controllers/tourControllers.js");
const checkID = require('../utils/MongoDBUtils')
const tourRouter = express.Router();

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
  .all(checkID.isValidObjectId)
  .delete(tourController.deleteTour)
  .patch(tourController.UpdateTour)
  .get(tourController.getSpecificTour);

tourRouter
  .route("/")
  .post(tourController.createNewTour)
  .get(tourController.getAllTours);

// tourRouter.all('*', (req, res, next) => {
//   const err = new Error(
//     `The ${req.originalUrl} route not found in the server !`
//   );
//   err.statusCode = 404;
//   err.status = 'failed';
//   next(err);
// });

module.exports = tourRouter;
