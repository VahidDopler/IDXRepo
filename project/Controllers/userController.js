const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

exports.createUser = catchAsync((req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
});

exports.deleteUser = catchAsync((req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
});

exports.updateUser = catchAsync((req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
});
exports.getUsers = catchAsync(async (req, res) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    users
  });
});
exports.getUser = catchAsync((req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
});
