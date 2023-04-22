//const fs = require('fs');
const Tour = require('../models/tourModel');
const deleteTourModel = require('../models/deleteTourLog');
const errLogger = require('../functionMilddlers/errSaver');
const APIFeatures = require('../utils/APIFeatures');



//function to get prefill query field to process of best 5 cheap
exports.getaliesTour = (req, res, next) => {
  req.query.sort = '-ratingsAverage,price';
  req.query.limit = 4;
  req.query.fields = 'name,summary,price,ratingsAverage,difficulty';
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    //The new shape of codes
    //we save query detail of query in object then save mongodb obj into object of class
    //then process the object in filter method
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .pagination()
      .sort()
      .limitFields();
    const tours = await features.queryOfMongoDB;

    //sending RESPONSE
    res.status(200).send({
      status: 'success',
      tour_counts: tours.length,
      data: {
        tours,
      },
    });
  } catch (error) {
    await errLogger(error);
    res.status(404).json({
      status: 'fail',
      message: error.message,
    });
  }
};

exports.UpdateTour = async (req, res) => {
  try {
    const result = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        message: 'Updated tour here',
        data: {
          result,
        },
      },
    });
  } catch (error) {
    await errLogger(error);
    res.status(404).json({
      status: 'fail',
      message: error.message,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    const resultForSaving = await Tour.findById(req.params.id);
    await deleteTourModel.create({
      createLog: new Date().toDateString(),
      deletedObject: resultForSaving,
    });
    await Tour.findByIdAndDelete(req.params.id);
    if (resultForSaving.deletedCount === 0) {
      throw new Error('There is no argument with this information');
    }
    res.status(204).json({
      status: 'success',
    });
  } catch (error) {
    await errLogger(error);
    res.status(404).json({
      status: 'fail',
      message: error.message,
    });
  }
};

exports.getSpecificTour = async (req, res) => {
  try {
    console.log(req.params);
    const tour = await Tour.findById(req.params.id);
    res.status(200).send({
      status: 'success',
      requestTime: req.requestTime,
      data: {
        tour,
      },
    });
  } catch (error) {
    await errLogger(error);
    res.status(404).json({
      status: 'fail',
      message: error.message,
    });
  }
};

exports.createNewTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: newTour,
    });
  } catch (error) {
    await errLogger(error);
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: {
          price: {
            $gt: 1000,
          },
        },
      },
      {
        $group: {
          _id: '$_id',
          numOfTour: { $sum: 1 },
          ratingQuantity: { $sum: '$ratingsQuantity' },
          average_price: { $avg: '$price' },
          max_price: { $max: '$price' },
          min_price: { $min: '$price' },
          name_of_Tour: { $first: '$name' },
          tourName: { $first: '$name' },
          tourPrice: { $first: '$price' },
        },
      },
      {
        $sort: { tourPrice: -1 },
      },
      {
        $match: {
          tourPrice: { $ne: 1997 },
        },
      },
    ]);

    res.status(200).send({
      status: 'success',
      requestTime: req.requestTime,
      data: {
        stats,
      },
    });
  } catch (error) {
    await errLogger(error);
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $lte: new Date(`${year}-12-31`),
            $gte: new Date(`${year}-01-01`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          countOfToursPerMonth: { $sum: 1 },
          name: { $push: '$name' },
        },
      },
      {
        $addFields: { month: '$_id', monthNumber: '$_id' },
      },

      {
        $project: {
          name: 1,
          month: 1,
          _id: 0,
          countOfToursPerMonth: 1,
          monthNumber: 1,
        },
      },
      {
        $addFields: {
          month: {
            $let: {
              vars: {
                monthsInString: [
                  undefined,
                  'Jan',
                  'Feb',
                  'Mar',
                  'Apr',
                  'May',
                  'Jun',
                  'Jul',
                  'Aug',
                  'Sep',
                  'Oct',
                  'Nov',
                  'Dec',
                ],
              },
              in: {
                $arrayElemAt: ['$$monthsInString', '$month'],
              },
            },
          },
        },
      },
      {
        $sort: { countOfToursPerMonth: -1 },
      },
      // {
        //   $limit: 12,
        // },
      ]);
      
      res.status(200).json({
        status: 'success',
      size: plan.length,
      data: {
        plan,
      },
    });
  } catch (error) {
    await errLogger(error);
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};
