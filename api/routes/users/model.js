const {
    docClient,
} = require('../../lib/db');

/* Return all registered users detail. */
const getAllUsers = () => new Promise((resolve, reject) => {
    const params = {
        TableName: 'user',
        AttributesToGet: [
            'name',
            'email',
            'role',
            'isActive',
            'isAccountLocked',
            'createdOn',
            'verifiedOn',
        ],
    };
    docClient.scan(params, (err, data) => {
        if (!err) {
            resolve(data);
        } else {
            reject(err);
        }
    });
}).catch((err) => {
    throw err;
});

/* Return particular user details by email id. */
const getUserByEmail = email => new Promise((resolve, reject) => {
    const params = {
        TableName: 'user',
        KeyConditionExpression: '#mail = :emailid',
        ExpressionAttributeNames: {
            '#mail': 'email',
        },
        ExpressionAttributeValues: {
            ':emailid': email,
        },
    };

    docClient.query(params, (err, data) => {
        if (err) {
            reject(err);
        } else {
            resolve(data);
        }
    });
}).catch((err) => {
    throw err;
});

/* Create new user with name, email and role. */
const createUser = (name, email, role) => new Promise((resolve, reject) => {
    const params = {
        TableName: 'user',
        Item: {
            name,
            email,
            role,
            isAccountLocked: false,
            isActive: true,
            createdOn: new Date().toISOString(),
            verifiedOn: null,
            passwordResetOn: null,
            failedLoginCount: 0,
            jwtToken: [],
        },
    };

    docClient.put(params, (err, result) => {
        if (err) {
            reject(err);
        } else {
            resolve(result);
        }
    });
}).catch((err) => {
    throw err;
});

/* Return reset password token from database. */
const getUserResetPasswordTokenByToken = token => new Promise((resolve, reject) => {
    const params = {
        TableName: 'user',
        ProjectionExpression: '#token, email, resetPasswordTokenCreatedOn',
        FilterExpression: '#token =  :tokenValue',
        ExpressionAttributeNames: {
            '#token': 'resetPasswordToken',
        },
        ExpressionAttributeValues: {
            ':tokenValue': token,
        },
    };

    docClient.scan(params, (err, result) => {
        if (err) {
            reject(err);
        } else {
            resolve(result);
        }
    });
}).catch((err) => {
    throw err;
});

/* Update user details. */
const updateUserDetails = (email, userDetails) => new Promise((resolve, reject) => {
    if (!email) {
        throw new Error('Invalid request.');
    }

    const params = {
        TableName: 'user',
        Key: {
            email,
        },
        ConditionExpression: '#email = :email',
        UpdateExpression: '',
        ExpressionAttributeNames: { '#email': 'email' },
        ExpressionAttributeValues: { ':email': email },
    };

    if (Object.prototype.hasOwnProperty.call(userDetails, 'verifiedOn')) {
        params.UpdateExpression += params.UpdateExpression
            ? ', #verifiedOn = :v' : 'set #verifiedOn = :v';
        params.ExpressionAttributeNames['#verifiedOn'] = 'verifiedOn';
        params.ExpressionAttributeValues[':v'] = userDetails.verifiedOn;
    }

    if (Object.prototype.hasOwnProperty.call(userDetails, 'isAccountLocked')) {
        params.UpdateExpression += params.UpdateExpression
            ? ', #isAccountLocked = :l' : 'set #isAccountLocked = :l';
        params.ExpressionAttributeNames['#isAccountLocked'] = 'isAccountLocked';
        params.ExpressionAttributeValues[':l'] = userDetails.isAccountLocked;
    }

    if (Object.prototype.hasOwnProperty.call(userDetails, 'isActive')) {
        params.UpdateExpression += params.UpdateExpression
            ? ', #isActive = :a' : 'set #isActive = :a';
        params.ExpressionAttributeNames['#isActive'] = 'isActive';
        params.ExpressionAttributeValues[':a'] = userDetails.isActive;
    }

    if (Object.prototype.hasOwnProperty.call(userDetails, 'name')) {
        params.UpdateExpression += params.UpdateExpression
            ? ', #name = :n' : 'set #name = :n';
        params.ExpressionAttributeNames['#name'] = 'name';
        params.ExpressionAttributeValues[':n'] = userDetails.name;
    }

    if (Object.prototype.hasOwnProperty.call(userDetails, 'failedLoginCount')) {
        params.UpdateExpression += params.UpdateExpression
            ? ', #failedLoginCount = :f' : 'set #failedLoginCount = :f';
        params.ExpressionAttributeNames['#failedLoginCount'] = 'failedLoginCount';
        params.ExpressionAttributeValues[':f'] = userDetails.failedLoginCount;
    }

    if (Object.prototype.hasOwnProperty.call(userDetails, 'password')) {
        params.UpdateExpression += params.UpdateExpression
            ? ', #password = :p' : 'set #password = :p';
        params.ExpressionAttributeNames['#password'] = 'password';
        params.ExpressionAttributeValues[':p'] = userDetails.password;

        params.UpdateExpression += ', #passwordResetOn = :pr';
        params.ExpressionAttributeNames['#passwordResetOn'] = 'passwordResetOn';
        params.ExpressionAttributeValues[':pr'] = new Date().toISOString();
    }

    if (Object.prototype.hasOwnProperty.call(userDetails, 'role')) {
        params.UpdateExpression += params.UpdateExpression
            ? ', #role = :r' : 'set #role = :r';
        params.ExpressionAttributeNames['#role'] = 'role';
        params.ExpressionAttributeValues[':r'] = userDetails.role;
    }

    if (Object.prototype.hasOwnProperty.call(userDetails, 'resetPasswordToken')) {
        params.UpdateExpression += params.UpdateExpression
            ? ', #resetPasswordToken = :rpt' : 'set #resetPasswordToken = :rpt';
        params.ExpressionAttributeNames['#resetPasswordToken'] = 'resetPasswordToken';
        params.ExpressionAttributeValues[':rpt'] = userDetails.resetPasswordToken;

        params.UpdateExpression += ', #resetPasswordTokenCreatedOn = :rptc';
        params.ExpressionAttributeNames['#resetPasswordTokenCreatedOn'] = 'resetPasswordTokenCreatedOn';
        params.ExpressionAttributeValues[':rptc'] = new Date().toISOString();
    }

    if (Object.prototype.hasOwnProperty.call(userDetails, 'jwtToken')) {
        params.UpdateExpression += params.UpdateExpression
            ? ', #jwtToken = list_append(#jwtToken,:j)' : 'set #jwtToken = list_append(#jwtToken,:j)';
        params.ExpressionAttributeNames['#jwtToken'] = 'jwtToken';
        params.ExpressionAttributeValues[':j'] = [userDetails.jwtToken];
    }

    if (Object.prototype.hasOwnProperty.call(userDetails, 'jwtTokenList')) {
        params.UpdateExpression += params.UpdateExpression
            ? ', #jwtToken = :j' : 'set #jwtToken = :j';
        params.ExpressionAttributeNames['#jwtToken'] = 'jwtToken';
        params.ExpressionAttributeValues[':j'] = userDetails.jwtTokenList;
    }

    if (!params.UpdateExpression) {
        throw new Error('Invalid request.');
    }

    docClient.update(params, (err, result) => {
        if (err) {
            reject(err);
        } else {
            resolve(result);
        }
    });
}).catch((err) => {
    throw err;
});

// Delete token after password is reset.
const deleteUserResetPasswordToken = email => new Promise((resolve, reject) => {
    const params = {
        TableName: 'user',
        Key: {
            email,
        },
        UpdateExpression: 'REMOVE resetPasswordToken, resetPasswordTokenCreatedOn',
    };

    docClient.update(params, (err, result) => {
        if (err) {
            reject(err);
        } else {
            resolve(result);
        }
    });
}).catch((err) => {
    throw err;
});

module.exports = {
    getAllUsers,
    getUserByEmail,
    createUser,
    getUserResetPasswordTokenByToken,
    deleteUserResetPasswordToken,
    updateUserDetails,
};
