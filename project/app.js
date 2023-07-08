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


//After all passing middleware , if a route can not found , simply it get here , no matter what is the (get , delete or ..._) it just simply
//get here
app.all('*', (req, res, next) => {
  next(new appError(`The ${req.originalUrl} route not found in the server !` , 404));
});

//A global error handler util for handling all errors of app from any route
app.use(globalErrorHandler);
module.exports = app;