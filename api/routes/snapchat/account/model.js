const {
    docClient,
} = require('../../../lib/db');

const constants = require('../../../utility/constants');

const snapchatTokenId = 'snapTokenItem';

/* Create new snapchat token in database */
const newSnapachatToken = (accessToken, refreshToken, createdAt,
    expiresAt) => new Promise((resolve, reject) => {
    const params = {
        TableName: 'snap-credentials',
        Item: {
            id: snapchatTokenId,
            accessToken,
            createdOn: new Date().toISOString(),
            createdAt,
            expiresAt,
            refreshToken,
            scope: constants.snapchat.auth.scope,
            tokenType: constants.snapchat.auth.tokenType,
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

/* Get snapchat token */
const getSnapchatToken = () => new Promise((resolve, reject) => {
    const params = {
        TableName: 'snap-credentials',
        KeyConditionExpression: '#id = :value',
        ExpressionAttributeNames: {
            '#id': 'id',
        },
        ExpressionAttributeValues: {
            ':value': snapchatTokenId,
        },
    };
    docClient.query(params, (err, result) => {
        if (err) {
            reject(err);
        } else {
            resolve(result);
        }
    });
}).catch((err) => {
    throw err;
});

/* Update snapchat token */
const updateSnapchatToken = (accessToken, refreshToken, createdAt,
    expiresAt) => new Promise((resolve, reject) => {
    const params = {
        TableName: 'snap-credentials',
        Key: {
            id: snapchatTokenId,
        },
        ConditionExpression: '#id = :id',
        UpdateExpression: 'set #accessToken = :at, #createdAt = :ca, #expiresAt = :ea ,#refreshToken = :rt',
        ExpressionAttributeNames: {
            '#accessToken': 'accessToken',
            '#createdAt': 'createdAt',
            '#expiresAt': 'expiresAt',
            '#refreshToken': 'refreshToken',
            '#id': 'id',
        },
        ExpressionAttributeValues: {
            ':at': accessToken,
            ':ca': createdAt,
            ':ea': expiresAt,
            ':rt': refreshToken,
            ':id': snapchatTokenId,
        },
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

/* Create or update snapchat token in database */
const saveSnapchatToken = async (accessToken, refreshToken, createdAt, expiresAt) => {
    try {
        const tokenDetails = await getSnapchatToken();
        if (tokenDetails && tokenDetails.Count === 1) {
            return await updateSnapchatToken(accessToken, refreshToken, createdAt, expiresAt);
        }
        return await newSnapachatToken(accessToken, refreshToken, createdAt, expiresAt);
    } catch (err) {
        return err;
    }
};

module.exports = {
    getSnapchatToken,
    saveSnapchatToken,
};
