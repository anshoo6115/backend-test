const jwt = require('jsonwebtoken');

const constants = require('../../utility/constants');

const jwtKey = process.env.JWT_KEY;

/* Sign jwt token with email and role. */
const sign = (email, role) => {
    try {
        const token = jwt.sign(
            {
                email,
                role,
            },
            jwtKey,
            {
                expiresIn: constants.jwtTokenExpiryHrs,
            },
        );
        return token;
    } catch (err) {
        throw err;
    }
};

/* Verifies jwt token. */
const verify = (token, callback) => {
    try {
        return jwt.verify(token, jwtKey, (err, decoded) => {
            if (err) {
                return callback(err, null);
            }
            if (decoded && (decoded.exp > Math.ceil(Date.now() / 1000))) {
                return callback(null, { role: decoded.role, email: decoded.email });
            }
            return callback({});
        });
    } catch (err) {
        throw err;
    }
};

module.exports = {
    sign,
    verify,
};
