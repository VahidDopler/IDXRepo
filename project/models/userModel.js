const mongoose = require('mongoose');
const myValidator = require('validator');
require('moment-timezone');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: [true, 'A user must have a name'],
    maxLength: [30, 'Username should be less than or equal than 30 charters'],
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'A user must have an email'],
    lowercase: true,
    validate: [myValidator.isEmail, 'Please input a valid email address'],
  },
  photo: {
    type: String,
    lowercase: true,
  },

  password: {
    type: String,
    select: false,
    required: [true, 'A user must have a password'],
    minLength: [8, 'provide more than 8 characters'],
  },
  rolePlayer: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  passwordConfirm: {
    //select does not work in CREATE and SAVE
    //Only in query finding in database
    select: false,
    type: String,
    required: [true, 'A user must have a confirm password'],
    validate: {
      //This only works for CREATE and SAVE in db !!!
      validator: function (el) {
        return this.password === el;
      },
      message: 'The passwords are not match with each other',
    },
  },
  signUpDate: {
    type: String,
    // default: new Intl.DateTimeFormat('en-US', {
    //   timeZone: 'Asia/Tehran',
    //   year: 'numeric',
    //   month: 'numeric',
    //   day: 'numeric',
    //   hour: 'numeric',
    //   minute: 'numeric',
    //   second: 'numeric',
    // }).format(),
    default: new Date().toLocaleString('en-US', { timeZone: 'Asia/Tehran' }),
  },
  passwordChangeAt: {
    type: Date,
  },
  passwordResetToken: {
    type: String,
  },
  passwordResetExpires: {
    type: Date,
  },
  active : {
    type: Boolean,
    default : true,
    select : false
  }
});

userSchema.pre('save', async function (next) {
  // Only runs this function if password was actually modified
  if (!this.isModified('password')) return next();
  //Hash the password 12 salt
  this.password = await bcrypt.hash(this.password, 12);
  //delete the confirmation password
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save' , function (next){
  if (!this.isModified('password') || this.isNew) return next();
  //saving bit slower than making JWT token
  this.passwordChangeAt = Date.now() - 1000;
  next();
})

//We add candidate password because in document we do not have access to password , because
// this field does not exist in document
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.pre(/^find/ , function(next) {
  //This point to the current query
  this.find({active: { $ne : false }})
  next();
})

userSchema.methods.changePasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangeAt) {
    const changeTimeStamp = parseInt(
      this.passwordChangeAt.getTime() / 1000,
      10
    );

    return JWTTimeStamp < changeTimeStamp;
  }

  //Default for the user has not changed the password after the token was issued
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  //Token expires in 10 minutes
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000 ;
  return resetToken;
};


const User = mongoose.model("User", userSchema);

module.exports = User;