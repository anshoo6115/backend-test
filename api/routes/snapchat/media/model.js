const {
    docClient,
} = require('../../../lib/db');

/* Create new media */
const newSnapachatMedia = (id, media, adAccount, mediaProperties) => new Promise((resolve,
    reject) => {
    const params = {
        TableName: 'snap-media',
        Item: {
            id,
            mediaCreatedOn: new Date().toISOString(),
            mediaCreatedAt: media.created_at,
            mediaDownloadLink: media.download_link,
            mediaLinkedAdAccounts: [{
                adAccountId: media.ad_account_id,
                adAccountName: adAccount.name,
            }],
            mediaName: media.name,
            mediaType: media.type,
            mediaStatus: media.media_status,
            mediaView: mediaProperties.mediaView,
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
const getSnapchatMedia = mediaId => new Promise((resolve, reject) => {
    const params = {
        TableName: 'snap-media',
        KeyConditionExpression: '#id = :value',
        ExpressionAttributeNames: {
            '#id': 'id',
        },
        ExpressionAttributeValues: {
            ':value': mediaId,
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

/* Update media linked accounts */
const updateSnapchatMedia = (id, mediaLinkedAdAccounts) => new Promise((resolve, reject) => {
    const params = {
        TableName: 'snap-media',
        Key: {
            id,
        },
        ConditionExpression: '#id = :id',
        UpdateExpression: 'SET #mediaLinkedAdAccounts = list_append(#mediaLinkedAdAccounts, :mediaLinkedAdAccounts)',
        ExpressionAttributeNames: {
            '#id': 'id',
            '#mediaLinkedAdAccounts': 'mediaLinkedAdAccounts',
        },
        ExpressionAttributeValues: { ':mediaLinkedAdAccounts': mediaLinkedAdAccounts, ':id': id },
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

/* Return all uploaded media */
const getAllSnapchatMedia = () => new Promise((resolve, reject) => {
    const params = {
        TableName: 'snap-media',
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

/* Save or update media data */
const saveSnapchatMedia = async (id, media, adAccount, mediaProperties) => {
    try {
        const mediaDetails = await getSnapchatMedia(id);
        if (mediaDetails && mediaDetails.Count === 1) {
            return await updateSnapchatMedia(id, [{
                adAccountId: media.ad_account_id,
                adAccountName: adAccount.name,
            }]);
        }
        return await newSnapachatMedia(id, media, adAccount, mediaProperties);
    } catch (err) {
        return err;
    }
};

module.exports = {
    saveSnapchatMedia,
    getAllSnapchatMedia,
};
