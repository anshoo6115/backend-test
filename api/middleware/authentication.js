const jwt = require('../lib/jwt');
const constants = require('../utility/constants');
const logger = require('../lib/logger');
const userController = require('../routes/users/users');

const whitelistedApi = [
    '/api-docs/',
    '/api-docs/swagger-ui.css',
    '/api-docs/swagger-ui-bundle.js',
    '/api-docs/swagger-ui-standalone-preset.js',
    '/api-docs/swagger-ui-init.js',

    '/users/login',
    '/users/verifyToken',
    '/users/requestPassword',
    '/users/resetPassword',
];

const whitelistedMethods = [
    'OPTIONS',
];

const userSpecificApi = [
    '/users/changePassword',
    '/users/logout',

    '/snapchat/account',
    '/snapchat/account/code',
    '/snapchat/adAccounts',
    '/snapchat/media/upload',
];

/* Authenticate user with jwt token */
const authenticate = (req, res, next) => {
    try {
        const token = req.header('Authorization') && req.header('Authorization').split('Bearer ')[0] === ''
            ? req.header('Authorization').split('Bearer ')[1] : null;

        if (token) {
            return jwt.verify(token, async (err, decoded) => {
                if (err) {
                    return res.sendStatus(401);
                }
                if (decoded) {
                    if (await userController.validateJwtToken(decoded.email, token)) {
                        req.user = decoded;
                        return next();
                    }
                    return res.sendStatus(401);
                }
                return next();
            });
        }
        return next();
    } catch (err) {
        logger.error(err.message);
        return res.sendStatus(500);
    }
};

/* Authorize user to access api */
const authorize = (req, res, next) => {
    try {
        if (req.method && whitelistedMethods.find(method => method.includes(req.method))) {
            return next();
        }

        if (whitelistedApi.find(url => req.originalUrl.includes(url))) {
            return next();
        }

        if (req.user && req.user.email && req.user.role) {
            if (req.user.role === constants.userRole.admin) {
                return next();
            }
            if (userSpecificApi.find(url => req.originalUrl.includes(url))) {
                return next();
            }
            return res.sendStatus(401);
        }

        return res.sendStatus(401);
    } catch (err) {
        logger.error(err.message);
        return res.sendStatus(500);
    }
};

module.exports = {
    authenticate,
    authorize,
};
