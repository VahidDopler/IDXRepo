const express = require('express');

const app = express();
const morgan = require('morgan');
const bodyparser = require('body-parser');

//Module Routers
const userRouter = require('./routes/userRouter');
const tourRouter = require('./routes/tourRouter');
const { cl } = require("yarn/lib/cli");

/**
 * Middlewares
 */

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
if (process.env.NODE_ENV === 'developement') {
  app.use(morgan('dev'));
}
app.use(express.static(`${__dirname}/public/`));
app.use(function(res , req,  next){
  console.log("Hello from middleware");
  next();
})
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//Midlleware Routers

app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);

module.exports = app;
