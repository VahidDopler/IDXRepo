const appError = require('../utils/AppError');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const generateToken = async function (id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  const token = await generateToken(newUser._id);
  res.status(201).json({
    status: 'success',
    token,
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //1) Check if email field or password is not empty
  if (!email || !password) {
    return next(new appError('username or password field is empty', 401));
  }
  //2) check user exists && password is correct
  const user = await User.findOne({ email }).select('+password');
  //3) if everything is fine , send JWT to client
  //result of query
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new appError('Incorrect password or email', 401));
  } else if (await user.correctPassword(password, user.password)) {
    const token = await generateToken(user._id);
    res.status(200).json({
      status: ' success',
      message: 'You successfully login',
      token,
    });
  } else {
    res.status(401).json({
      status: 'failed',
      message: 'your infos are wrong',
    });
  }
});
