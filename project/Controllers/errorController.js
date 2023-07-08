//With defining 4 parameters , express automatically knows , it is error handling method 😀
module.exports = (err, req, res, next) => {
  err.status = err.status || 'failed';
  err.statusCode = err.statusCode || 500;
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    ErrorTime: new Date().toLocaleString(),
  });
};