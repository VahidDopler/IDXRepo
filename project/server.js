const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({
  path: './config.env',
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

const test = 45;
console.log(test)

const port = process.env.PORT;

//starting server
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log('server is running in port ', port);
});
