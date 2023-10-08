const appError = require('../utils/AppError');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const { promisify } = require('util');
const mailSender = require('../utils/email');
const crypto = require('crypto');
const generateToken = async function (id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const user_new_token = async (message, status_situation, user_id, res) => {
  const token = await generateToken(user_id);
  const cookieOption = {
    expires: new Date(
      Date.now() + process.env.JWT_TOKEN_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    secure: true,
    //cookie will not modify by browser
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production')
    cookieOption.secure = true;
  res.cookie('jwt', token , cookieOption);
  res.status(200).json({
    status: status_situation,
    message: message,
    token: token,
    role: 'user',
  });
};

exports.signup = catchAsync(async (req, res) => {
  // const newUser = await User.create({
  //   name: req.body.name,
  //   email: req.body.email,
  //   password: req.body.password,
  //   passwordConfirm: req.body.passwordConfirm,
  //   passwordChangeAt: req.body.passwordChangeAt,
  //   rolePlayer : req.body.role
  // });
  const newUser = await User.create(req.body);
  newUser.password = undefined;
  const token = await generateToken(newUser._id);
  res.status(201).json({
    status: 'success',
    token,
    newUser
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
    console.log(user.id);
    await user_new_token('successfully login', 'success', user.id, res);
  } else {
    res.status(401).json({
      status: 'failed',
      message: 'your infos are wrong',
    });
  }
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) get the token from req.body and check if it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      new appError('You are not logged in! Please log in to get access.', 401)
    );
  }
  // 2) verification the token
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // 3) check if users still exists
  console.log(decode);
  const currentUser = await User.findById(decode.id);
  if (!currentUser) {
    return next(new appError('This user does not exists ', 401));
  }
  // 4) check if user changed the password after the token was issued
  if (currentUser.changePasswordAfter(decode.iat)) {
    return next(
      new appError(
        'User recently changed the password , please login again',
        401
      )
    );
  }

  //GRANT ACCESS to protected area
  req.user = currentUser;
  next();
});

exports.restrictTo = function (...roles) {
  return (req, res, next) => {
    //roles [admin , lead-guide]
    //role = 'user'
    if (!roles.includes(req.user.rolePlayer))
      return next(
        new appError('You do not have permission in this route ', 403)
      );
    next();
  };
};

exports.forgotPassword = catchAsync(async function (req, res, next) {
  //1) get user based of Posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new appError('This email does not exist', 404));
  }

  //2) generate a random token for reset-password
  const resetToken = user.createPasswordResetToken();
  //It will disable all required field we specified in model
  await user.save({ validateBeforeSave: false });
  //3) send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetpassword/${resetToken}`;

  const message = `Forget the password? submit a PATCH request with your new password and passwordConfirm to: ${resetURL}\nif you did not forget your password , then ignore it.`;
  try {
    await mailSender({
      email: user.email,
      subject: 'Your password reset Token',
      message: message,
    });
    await user_new_token('Token sent to email', 'success', user._id, res);
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new appError(`There was something wrong in sending mail`, 500));
  }
});

exports.resetPassword = catchAsync(async function (req, res, next) {
  //1) get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: {
      $gt: Date.now(),
    },
  });
  //2) if token hast expired , and there is a user , set the password
  if (!user) return next(new appError('Token is invalid or expired', 400));
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  //3) Update ChangePasswordAt property for the user

  //4) log the user in , send JWT
  await user_new_token('success', 'success', user._id, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1) get user from collection
  console.log(req.user);
  if (!req.body.newPassword)
    return next(new appError('please enter new password'), 401);
  if (!req.body.password)
    return next(new appError('Your password field is empty'), 401);
  if (!req.body.passwordConfirm)
    return next(new appError('Your password confirm field is empty'), 401);
  const currentUser = await User.findById(req.user._id).select('+password');
  if (!currentUser) return next(new appError('No user found'), 404);
  //2) check if posted current password is correct
  //In using correct password , we should use client password and then password we get from DB
  const check = await currentUser.correctPassword(
    req.body.password,
    currentUser.password
  );
  if (!check) return next(new appError('invalid password'), 401);
  if (
    await currentUser.correctPassword(
      req.body.newPassword,
      currentUser.password
    )
  )
    return next(
      new appError('You input same password , please input another value'),
      402
    );
  //3)If so , update password
  currentUser.password = req.body.newPassword;
  currentUser.passwordConfirm = req.body.newPassword;
  await currentUser.save({ validateBeforeSave: true });
  req.body.newPassword = undefined;
  req.body.passwordConfirm = undefined;
  currentUser.password = undefined;
  await user_new_token(
    'Your password changed successfully',
    'success',
    currentUser._id,
    res
  );
  //4) login user and send jwt
});