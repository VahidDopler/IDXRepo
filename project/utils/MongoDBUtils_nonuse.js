const { ObjectId } = require('mongodb');

exports.isValidObjectId = (req, res, next) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) {
    const err = new Error('This ID is not defined');
    err.sttaus = 'failed';
    err.statusCode = 404;
    next(err);
  }
  next()
};

