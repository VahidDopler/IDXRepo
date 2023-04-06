const express = require('express');
// eslint-disable-next-line import/extensions
const tourController = require('../Controllers/tourControllers.js');

const tourRouter = express.Router();

//Best 5 tour inchip field

tourRouter.route('/myTour').post((req, res ,next) => {
  try {
    console.log(req.body);
  } catch (error) {
    console.log(`Error message : ${error.message}`);
  }
  next()
});

tourRouter.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

tourRouter
  .route('/top-4-cheap')
  .get(tourController.getaliesTour, tourController.getAllTours);

tourRouter.route('/getTourStats').get(tourController.getTourStats);
//id is symbol for the string of paramter inb url
tourRouter
  .route('/:id')
  .delete(tourController.deleteTour)
  .patch(tourController.UpdateTour)
  .get(tourController.getSpecificTour);

tourRouter
  .route('/')
  .post(tourController.createNewTour)
  .get(tourController.getAllTours);

module.exports = tourRouter;
