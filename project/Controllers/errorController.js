module.exports = (err, req, res, next) => {
  console.log('Here in error middleware');
  console.log(err.statusCode);
  err.status = err.status || 'failed';
  err.statusCode = err.statusCode || 500;
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    ErrorTime: new Date().toLocaleString(),
  });
};