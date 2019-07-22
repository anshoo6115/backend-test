/* eslint-disable no-undef */
/* eslint-disable max-len */

process.env.LOG_DIR = './logs';

const account = require('../account');

const constants = require('../../../../utility/constants');

jest.mock('../model', () => ({
    saveSnapchatToken: jest.fn(() => true),

    getSnapchatToken: jest.fn(() => {
        const response = {
            Count: 1,
            Items: [{
                accessToken: 'testToken',
                refreshToken: 'testRefreshToken',
            }],
        };
        return response;
    }),
}));

jest.mock('../../../../lib/snapchat/index', () => ({
    getToken: jest.fn(() => {
        const response = {
            access_token: 'testToken',
            refresh_token: 'testRefreshToken',
            expires_in: Date.now() + 18000,
        };
        return response;
    }),
}));

describe('Snapchat account', () => {
    test('Should generate snapchat access token with auth code if token is expired', async () => {
        const response = await account.getSnapchatToken('testAuthCode', constants.snapchat.auth.grantType.authCode);
        expect(response).toEqual('testToken');
    });

    test('Should generate snapchat access token with refresh token if token is expired', async () => {
        const response = await account.getSnapchatToken('testRefreshToken', constants.snapchat.auth.grantType.refreshToken);
        expect(response).toEqual('testToken');
    });

    test('Should return snapchat access token if token is not expired', async () => {
        const response = await account.getSnapchatAccessToken();
        expect(response).toEqual('testToken');
    });
});
