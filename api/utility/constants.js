module.exports = {
    responseStatus: {
        success: 'success',
        failure: 'failure',
    },

    verificationLinkValidityHrs: 24,

    saltRounds: 10,

    userRole: {
        admin: 'admin',
        accountManager: 'account-manager',
    },

    allowedFailedLoginAttempts: 3,

    passwordExpiryInMonths: 6,

    jwtTokenExpiryHrs: '6h',

    snapchat: {
        auth: {
            grantType: {
                refreshToken: 'refresh_token',
                authCode: 'authorization_code',
            },
            scope: 'snapchat-marketing-api',
            tokenType: 'Bearer',
            responseType: 'code',
        },
        media: {
            maxUploadSizeInBytes: 33554432,
            validMimeTypes: [
                'image/png',
                'image/jpeg',
                'video/mp4',
                'video/quicktime',
                'video/H264',
            ],
            statusReady: 'READY',
        },
    },
};
