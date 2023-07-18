//const fs = require('fs');
const Tour = require("../models/tourModel");
const deleteTourModel = require("../models/deleteTourLog");
const APIFeatures = require("../utils/APIFeatures");
const AppError = require("../utils/AppError");
const { limitFieldOfDocObject } = require("../utils/UpdateUtils");
//In here we're just turning try/catch block into a promising object to handle it 😂
const catchAsync = require("../utils/catchAsync");

//function to get prefill query field to process of best 5 cheap
exports.getaliesTour = (req, res, next) => {
  req.query.sort = "-ratingsAverage,price";
  req.query.limit = 4;
  req.query.fields = "name,summary,price,ratingsAverage,difficulty";
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
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
    status: "success",
    tour_counts: tours.length,
    data: {
      tours
    }
  });
});

exports.UpdateTour = catchAsync(async (req, res, next) => {
  const response = Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  const result = await limitFieldOfDocObject(response);

  if (!result) {
    return next(new AppError("No tour found with this ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      message: "Updated tour here",
      data: {
        result
      }
    }
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const saveModelBeforeDelete = await Tour.findById(req.params.id);
  if (saveModelBeforeDelete) {
    await deleteTourModel.create({
      createLog: new Date().toLocaleString(),
      deletedObject: saveModelBeforeDelete
    });
  }
  const resultForSaving = await Tour.findByIdAndDelete(req.params.id);
  if (!resultForSaving) {
    return next(new AppError("No tour found with this ID", 404));
  }
  res.status(204).json({
    status: "success"
  });
});

exports.getSpecificTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.id);
    if (!tour) {
      return next(new AppError("No tour found with this ID", 404));
    }

    res.status(200).send({
      status: "success",
      requestTime: req.requestTime,
      data: {
        tour
      }
    });
  }
);

exports.createNewTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: "success",
    data: newTour
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $group: {
        _id: { $toUpper: "$difficulty" },
        numTours: { $sum: 1 },
        numRatings: { $sum: "$ratingsQuantity" },
        avgRating: { $avg: "$ratingsAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" }
      }
    },
    {
      $sort: { tourPrice: -1 }
    }
  ]);

  if (!stats) {
    return next(new AppError("No tour found", 404));
  }

  res.status(200).send({
    status: "success",
    requestTime: req.requestTime,
    data: {
      stats
    }
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: "$startDates"
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        countOfToursPerMonth: { $sum: 1 },
        name: { $push: "$name" }
      }
    },
    {
      $addFields: { month: "$_id" }
    },

    {
      $project: {
        _id: 0
      }
    },
    {
      $addFields: {
        month: {
          $let: {
            vars: {
              monthsInString: [
                undefined,
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec"
              ]
            },
            in: {
              $arrayElemAt: ["$$monthsInString", "$month"]
            }
          }
        }
      }
    },
    {
      $sort: { monthNumber: -1 }
    }
    // {
    //   $limit: 12,
    // },
  ]);

  if (!plan) {
    return next(new AppError("No tour found", 404));
  }

  res.status(200).json({
    status: "success",
    size: plan.length,
    data: {
      plan
    }
  });
});
