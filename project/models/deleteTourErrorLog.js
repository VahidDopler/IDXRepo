const mongoose = require('mongoose');

const postTourErrSchema = new mongoose.Schema({
  errName: {
    type: String,
  },
  errStack: {
    type: String,
  },
  errMessage: {
    type: String,
  },
});

const postTourErr = mongoose.model('DeleteTourErrorLog', postTourErrSchema);

module.exports = postTourErr;
