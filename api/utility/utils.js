const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const constants = require('./constants');

const accountVerificationBaseUrl = process.env.ACCOUNT_VERIFICATION_BASE_URL;

/* Return user verification token */
const getVerificationToken = (name, email) => {
    try {
        const token = crypto.createHash('sha256').update(`${name}${email}${Date.now()}`).digest('hex');
        return token;
    } catch (err) {
        throw err;
    }
};

/* Return user verification link */
const getVerificationLink = (token) => {
    try {
        return `${accountVerificationBaseUrl}${token}`;
    } catch (err) {
        throw err;
    }
};

/* Check link validity */
const checkLinkValidity = (timeSent) => {
    try {
        const verifyLinkSentTime = new Date(timeSent).valueOf();
        const currentTime = new Date().valueOf();
        const verificationLinkValidityInSec = 3600000 * constants.verificationLinkValidityHrs;

        return (currentTime - verifyLinkSentTime) < (verificationLinkValidityInSec);
    } catch (err) {
        throw err;
    }
};

/* Create new directory */
const createDirectory = (dirPath) => {
    try {
        if (fs.existsSync(dirPath)) {
            return false;
        }
        fs.mkdirSync(dirPath);
        return true;
    } catch (err) {
        throw err;
    }
};

/* delete files from directory */
const deleteFilesFromDirectory = (dirPath, files) => {
    try {
        files.forEach((file) => {
            fs.unlink(path.join(dirPath, file.fileName), (err) => {
                if (err) throw err;
            });
        });
    } catch (err) {
        throw err;
    }
};


module.exports = {
    getVerificationToken,
    getVerificationLink,
    checkLinkValidity,
    createDirectory,
    deleteFilesFromDirectory,
};
