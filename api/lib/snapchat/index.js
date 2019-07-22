const request = require('request-promise');
const fs = require('fs');

const constants = require('../../utility/constants');

const snapchatClientId = process.env.SNAPCHAT_CLIENT_ID;
const snapchatClientSecret = process.env.SNAPCHAT_CLIENT_SECRET;

const snapchatRedirectUrl = process.env.SNAPCHAT_REDIRECT_URL;
const snapchatAccountBaseUrl = process.env.SNAPCHAT_ACCOUNT_BASE_URL;
const snapchatMarketingApiBaseUrl = process.env.SNAPCHAT_MARKETING_API_BASE_URL;

const snapchatOrganizationId = process.env.SNAPCHAT_ORGANIZATION_ID;

/* Return redirect url to snapchat app */
const getRedirectUrl = () => {
    try {
        const clientId = `client_id=${snapchatClientId}`;
        const redirectUri = `redirect_uri=${snapchatRedirectUrl}`;
        const responseType = `response_type=${constants.snapchat.auth.responseType}`;
        const scope = `scope=${constants.snapchat.auth.scope}`;
        return `${snapchatAccountBaseUrl}accounts/oauth2/auth?${clientId}&${redirectUri}&${responseType}&${scope}`;
    } catch (err) {
        throw err;
    }
};

/* Return snapchat access token and refresh token */
const getToken = async (code, grantType) => {
    try {
        const options = {
            method: 'POST',
            url: `${snapchatAccountBaseUrl}login/oauth2/access_token`,
            form: {
                client_id: `${snapchatClientId}`,
                client_secret: `${snapchatClientSecret}`,
                code,
                grant_type: grantType,
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        };
        return JSON.parse(await request(options));
    } catch (err) {
        throw err;
    }
};

/* Create media object in snapchat */
const createMedia = async (uploadData, accessToken) => {
    try {
        const options = {
            method: 'POST',
            url: `${snapchatMarketingApiBaseUrl}adaccounts/${uploadData[0].ad_account_id}/media`,
            body: {
                media: uploadData,
            },
            json: true,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${constants.snapchat.auth.tokenType} ${accessToken}`,
            },
        };
        return await request(options);
    } catch (err) {
        throw err;
    }
};

/* Upload media into snapchat media object */
const uploadMedia = async (mediaId, mediaName, mediaPath, accessToken) => {
    try {
        const options = {
            url: `${snapchatMarketingApiBaseUrl}media/${mediaId}/upload`,
            method: 'POST',
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `${constants.snapchat.auth.tokenType} ${accessToken}`,
            },
            formData: {
                file: {
                    value: fs.createReadStream(mediaPath),
                    options: {
                        filename: mediaName,
                        contentType: null,
                    },
                },
            },
        };
        return JSON.parse(await request(options));
    } catch (err) {
        throw err;
    }
};

/* List Ad accounts from snapchat */
const getAdAccounts = async (accessToken) => {
    try {
        const options = {
            method: 'GET',
            url: `${snapchatMarketingApiBaseUrl}organizations/${snapchatOrganizationId}/adaccounts`,
            headers: {
                Authorization: `${constants.snapchat.auth.tokenType} ${accessToken}`,
            },
        };
        return JSON.parse(await request(options));
    } catch (err) {
        throw err;
    }
};

/* Return uploaded media */
const getMedia = async (mediaId, accessToken) => {
    try {
        const options = {
            method: 'GET',
            url: `${snapchatMarketingApiBaseUrl}media/${mediaId}`,
            headers: {
                Authorization: `${constants.snapchat.auth.tokenType} ${accessToken}`,
            },
        };
        return JSON.parse(await request(options));
    } catch (err) {
        throw err;
    }
};


module.exports = {
    getRedirectUrl,
    getToken,
    createMedia,
    uploadMedia,
    getAdAccounts,
    getMedia,
};
