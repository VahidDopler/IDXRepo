const express = require('express');
const app = express();
const globalErrorHandler = require('./Controllers/errorController');
const appError = require('./utils/AppError')
const morgan = require('morgan');
// const body_parser = require('body-parser');

//Module Routers
const userRouter = require('./routes/userRouter');
const tourRouter = require('./routes/tourRouter');

/**
 * Middlewares
 */

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.static(`${__dirname}/public/`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//Middleware Routers
//Routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);

app.all('*', (req, res, next) => {
  next(new appError(`The ${req.originalUrl} route not found in the server !` , 404));
});

app.use(globalErrorHandler);
module.exports = app;