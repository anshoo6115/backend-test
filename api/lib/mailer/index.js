const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');


const logger = require('../logger');

if (process.env.NODE_ENV !== 'production') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const mailConfig = {
	service : process.env.MAIL_SERVICE,
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
    },
};

const transporter = nodemailer.createTransport(smtpTransport(mailConfig));

const sendMail = (message) => {
    const email = message;

    if (!email.from) {
        email.from = process.env.MAIL_FROM;
    }

    return new Promise((resolve, reject) => {
        transporter.sendMail(email)
            .then(() => {
                resolve(true);
            }).catch(() => {
                reject();
            });
    }).catch((err) => {
        logger.error(err.message);
        return err;
    });
};

module.exports = {
    sendMail,
};
