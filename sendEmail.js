var nodemailer = require('nodemailer');

const emailCredentials = {
  user: process.env.EMAIL_USERNAME,
  pass: process.env.EMAIL_PASSWORD,
}
const emailRecipient = process.env.EMAIL_RECIPIENT;


var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: emailCredentials,
});

const sendEmail = (options) => {
  var mailOptions = {
    from: emailCredentials.user,
    to: emailRecipient,
    subject: 'Email from Node',
    text: 'That was easy!',
    ...options,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

module.exports = sendEmail
