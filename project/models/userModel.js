const mongoose = require('mongoose');
const myValidator = require('validator');
const moment = require('moment');
require('moment-timezone');
const bcrypt = require('bcryptjs');
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
    default: new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Tehran',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    }).format(),
  },
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

//We add candidate password because in document we does not have access to password , because
// this field does not exists in document
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
const User = mongoose.model("User", userSchema);

module.exports = User;