process.on('unhandledRejection', (err) => {
  console.warn(err.name, err.message);
  server.close(() => {
    console.warn('UnHANDLED REJECTION!! Server is shutting down 😴');
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  console.warn(err.name, err.message);
  console.warn('UNCAUGHT EXCEPTION!!  Server is shutting down 😴');
  process.exit(1);
});

(function (require, module, __dirname, __filename, exports) {})();
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({
  path: `${__dirname}/config.env`,
});

// const DB = process.env.DATABASE.replace(
//   '<PASSWORD>',
//   process.env.PASSWORD_FOR_DATABASE
// );
const DB = process.env.LOCAL_DATABASE;

mongoose.set('strictQuery', true);
mongoose
  .connect(DB)
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('DB connection success');
  })
  .catch((err) => {
    //eslint-disable-next-line no-console
    console.log(err.message);
  });
const app = require('./app');

const port = process.env.PORT;

//starting server
const server = app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log('server is running in port ', port);
});

//Comment

