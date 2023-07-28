const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const bcrypt = require('bcryptjs');
const moment = require('moment');
const appError = require('../utils/AppError');

const filterObject = (obj, ...allowedFields) => {
  const newObject = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObject[el] = obj[el];
  });
  return newObject;
};

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

exports.updateUser = catchAsync(async (req, res) => {
  console.log('updating user');
  const user = await User.findOneAndUpdate(
    { _id: req.params.id },
    { password: await bcrypt.hash(req.body.password, 12) },
    { new: true }
  );
  res.status(200).json({
    status: 'success',
    user,
  });
});
exports.getUsers = catchAsync(async (req, res) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    users,
  });
});
exports.getUser = catchAsync(async (req, res) => {
  const userNeeded = await User.findById(req.params.id);
  // userNeeded.signUpDate = moment(userNeeded.signUpDate).toLocaleString('en')
  res.status(500).json({
    status: 'error',
    userNeeded,
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  console.log(req.user._id);
  await User.findOneAndUpdate(req.user._id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) send error is user trying to update password
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new appError('You can not change the password in this route', 400)
    );


  //2) Filtered fields which we not want them
  const filteredBody = filterObject(req.body, 'name', 'email');
  //3) update user document
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    filteredBody,
    { new: true, runValidators: true }
  );
  console.log(updatedUser);
  res.status(200).json({
    status: 'success',
    updatedUser,
  });
});