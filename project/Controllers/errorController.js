const errSaver = require('../functionMilddlers/errSaver');
const { string } = require('i/lib/util');
const winston = require('winston');
const color = require('colors')
const logLevels = {
  colors: {
    error: "red",
    warn: "darkred",
    info: "black",
    http: "green",
    sql: "blue",
    debug: "gray"
  }
};
const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.simple(),
    winston.format.colorize(),
  ),
  transports: [new winston.transports.Console()],
});

const sendErrorDev = async (err, res) => {
  await errSaver(err);
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
    ErrorTime: new Date().toLocaleString(),
  });
};

const sendErrorProd = (err, res) => {
  //Operational , trusted error : send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      ErrorTime: new Date().toLocaleString(),
    });
  } else {
    //logging into console to inform the developers
    logger.warn(`${err}`.red);
    //An unknown error happened and log it to console
    res.status(500).json({
      status: 'failed',
      message: 'Something went wrong!!',
    });
  }
};
//With defining 4 parameters , express automatically knows , it is error handling method 😀
module.exports = async (err, req, res, next) => {
  err.status = err.status || 'failed';
  err.statusCode = err.statusCode || 500;
  if (String(process.env.NODE_ENV) === 'production') {
    sendErrorProd(err, res);
  } else if (String(process.env.NODE_ENV) === 'development') {
    await sendErrorDev(err, res);
  }
};