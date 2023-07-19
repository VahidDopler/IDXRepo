const mongoose = require('mongoose');
const myValidator = require('validator')
const momnet = require('moment')
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    require: [true, 'A user must have a name'],
    maxLength: [30, 'Username should be less than or equal than 30 charters'],
  },
  email: {
    type: String,
    unique: true,
    require: [true, 'A user must have an email'],
    lowercase : true,
    validate : [myValidator.isEmail , "Please input a valid email address"]
  },
  photo: {
    type: String,
    lowercase: true
  },password: {
    type: String,
    require: [true , 'A user must have a password'],
    minLength : [8 , 'provide more than 8 characters']
  },passwordConfirm: {
    type: String,
    require: [true , 'A user must have a confirm password'],
  },
  signUpDate: {
    type : Date,
    default : Date.now()
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;