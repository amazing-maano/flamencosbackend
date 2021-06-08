const nodemailer = require('nodemailer');
const {
  smtp_host, smtp_port, smtp_username, smtp_password,
} = require('../config/environment');

const transport = nodemailer.createTransport({
  host: smtp_host,
  port: smtp_port,
  auth: { user: smtp_username, pass: smtp_password },
});

exports.sendMail = (to, subject, url) => {
  transport.sendMail({
    from: 'support@flamencosonline.com',
    to,
    subject,
    text: url,
  }, (err, info) => {
    if (err) {
      return err;
    }
    return info;
  });
};
