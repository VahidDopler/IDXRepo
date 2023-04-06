const mongoose = require('mongoose');
const TourModel = require('./tourModel')
const deleteTourSchema = mongoose.Schema({
  createLog: {
    type: String,
  },
  deletedObject: {
    type: Object,
  },
});

const deleteTourModel = mongoose.model('deleteTourLog', deleteTourSchema);

module.exports = deleteTourModel;
