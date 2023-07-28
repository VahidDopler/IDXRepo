const nodemailer = require('nodemailer');
// const dotenv = require("dotenv");
// const fs = require('fs');
// const emil_temp = fs.readFileSync(`${__dirname}/../email_template.html`)
// console.log(__dirname);
// dotenv.config({
//   path: `${__dirname}/../config.env`,
// });
// const sendingEmail = async (transporter ,mailOption) =>  {
//   try {
//     const result = await transporter.sendMail(mailOption);
//     console.log("Email sent " + result.response);
//   }catch (err) {
//     console.log(err);
//   }
// }
//
// const transporter = nodemailer.createTransport({
//   host : process.env.MAIL_DOMAIN,
//   port : process.env.MAIL_PORT,
//   auth : {
//     user : process.env.MAIL_USER,
//     pass : process.env.MAIL_PASSWORD
//   }
// })
//
// const mailOption = {
//   from : process.env.MAIL_USER,
//   to : 'marbaghee.2525@gmail.com',
//   subject : 'testing api nodemailer 😂',
//   html : emil_temp
// }
//
// sendingEmail(transporter ,mailOption);

const sendEmail = async function  (option) {
  //Define mailSender transporter
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_DOMAIN,
    port: process.env.MAIL_PORT,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
  });
  //Define mail option
  const mailOption = {
    from: 'VahidDopler <vahidnodejs@gmail.com>',
    to: option.email,
    subject: option.subject,
    text: option.message,
  };

  //sending mail
  await transporter.sendMail(mailOption);
};

module.exports = sendEmail;