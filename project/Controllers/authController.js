const user = require('../models/userModel')

const catchAsync = require('../utils/catchAsync')

exports.signup = catchAsync(async (req , res , next) => {
  const newUser = await user.create(req.body);
  res.status(201).json({
    status : 'success',
    message : newUser
  })
})

