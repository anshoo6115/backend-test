const snapchat = require('../../../lib/snapchat');
const logger = require('../../../lib/logger');
const constants = require('../../../utility/constants');

const model = require('./model');

/* Redirect user to snapchat account */
const redirectToSnapchatAuth = (req, res) => {
    try {
        return res.status(301).redirect(snapchat.getRedirectUrl());
    } catch (err) {
        logger.error(err.message);
        return res.sendStatus(500);
    }
};

/* Get snapchat token */
const getSnapchatToken = async (code, codeType) => {
    try {
        const data = await snapchat.getToken(code, codeType);
        const createdTimestamp = Date.now();
        const accessToken = data.access_token;
        const refreshToken = data.refresh_token;
        const createdAt = Math.floor(createdTimestamp / 1000);
        const expiresAt = Math.floor(createdTimestamp / 1000) + data.expires_in;

        if (await model.saveSnapchatToken(accessToken, refreshToken, createdAt, expiresAt)) {
            return accessToken;
        }
        return false;
    } catch (err) {
        return err;
    }
};

/* Get snapchat token and update into database */
const generateSnapchatToken = async (req, res) => {
    try {
        const { code } = req.params;
        if (await getSnapchatToken(code, constants.snapchat.auth.grantType.authCode)) {
            return res.status(200).json({
                status: constants.responseStatus.success,
                message: 'Succesfully updated token.',
            });
        }
        logger.error('Error occur while fetching snapchat credentials');
        return res.sendStatus(500);
    } catch (err) {
        logger.error(err.message);
        return res.sendStatus(500);
    }
};

/* Refresh snapchat token if expire */
const getSnapchatAccessToken = async () => {
    try {
        const tokenDetails = await model.getSnapchatToken();
        if (tokenDetails && tokenDetails.Count === 1) {
            if ((Date.now() / 1000) > tokenDetails.Items[0].expiresAt) {
                return await getSnapchatToken(tokenDetails.Items[0].refreshToken,
                    constants.snapchat.auth.grantType.refreshToken);
            }
            return tokenDetails.Items[0].accessToken;
        }
        return false;
    } catch (err) {
        return err;
    }
};

module.exports = {
    redirectToSnapchatAuth,
    generateSnapchatToken,
    getSnapchatAccessToken,
    getSnapchatToken,
};
