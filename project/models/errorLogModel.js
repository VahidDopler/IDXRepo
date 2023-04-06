const mongoose = require('mongoose');

const errorLogSchema = new mongoose.Schema({
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

const errorLogModel = mongoose.model('Errorlogs', errorLogSchema);

module.exports = errorLogModel;
