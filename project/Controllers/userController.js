const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const bcrypt = require('bcryptjs')

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

exports.updateUser = catchAsync( async(req, res) => {
  console.log("updating user");
  const user = await User.findOneAndUpdate({_id : req.params.id} , {password :  await bcrypt.hash(req.body.password , 12)} , {new : true});
  res.status(200).json({
    status : 'success' ,
    user
  })
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
