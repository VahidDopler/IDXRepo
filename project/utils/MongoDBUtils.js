const { ObjectId } = require('mongodb');

exports.isValidObjectId = (req, res, next) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) {
    const err = new Error('This route does not defined');
    err.sttaus = 'failed';
    err.statusCode = 404;
    next(err);
  }
  next()
};

