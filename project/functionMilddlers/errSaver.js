const errLogger = require('../models/errorLogModel');

module.exports = async function ErrorSaver(errObj) {
  await errLogger.create({
    errMessage: errObj.message,
    errName: errObj.name,
    errStack: errObj.stack,
  });
};
