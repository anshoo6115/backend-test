/* eslint-disable no-undef */
/* eslint-disable max-len */

process.env.LOG_DIR = './logs';
process.env.SNAPCHAT_MEDIA_UPLOAD_DIR = './upload';

const media = require('../media');

const constants = require('../../../../utility/constants');

jest.setTimeout(12000);

jest.mock('../../../../lib/db/index', () => true);

jest.mock('../model', () => ({
    saveSnapchatMedia: jest.fn(() => true),
}));

jest.mock('../../../../lib/snapchat/index', () => ({
    getToken: jest.fn(() => {
        const response = {
            access_token: 'testToken',
            refresh_token: 'newTestToken',
            expires_in: Date.now() + 18000,
        };
        return response;
    }),

    getMedia: jest.fn(() => {
        const response = {
            media: [{
                media: {
                    id: 'testMediaId',
                    media_status: 'READY',
                    name: 'testMedia',
                },
            }],
        };
        return response;
    }),

    uploadMedia: jest.fn(() => {
        const response = { request_status: 'success' };
        return response;
    }),

    createMedia: jest.fn(() => {
        const response = {
            media: [{
                media: {
                    id: 'testMediaId',
                    media_status: 'READY',
                    name: 'testMedia',
                },
            }],
            request_status: 'success',
        };
        return response;
    }),
}));


describe('Snapchat media', () => {
    test('Should validate media file type image/png', () => {
        const response = media.validateFileFormat('test.png', 'image/png');
        expect(response).toEqual(true);
    });

    test('Should validate media file type image/jpeg', () => {
        const response = media.validateFileFormat('test.jpeg', 'image/jpeg');
        expect(response).toEqual(true);
    });

    test('Should validate media file type video/mp4', () => {
        const response = media.validateFileFormat('test.mp4', 'video/mp4');
        expect(response).toEqual(true);
    });

    test('Should validate media file type video/quicktime', () => {
        const response = media.validateFileFormat('test.quicktime', 'video/quicktime');
        expect(response).toEqual(true);
    });

    test('Should validate media file type video/H264', () => {
        const response = media.validateFileFormat('test.h264', 'video/H264');
        expect(response).toEqual(true);
    });

    test('Should validate media file type video/H264', () => {
        const response = media.validateFileFormat('test.h264', 'video/H264');
        expect(response).toEqual(true);
    });

    test('Should invalidate media file type text/pdf', () => {
        const response = media.validateFileFormat('test.pdf', 'text/pdf');
        expect(response).toEqual(false);
    });

    test('Should check media upload status', async () => {
        const response = await media.checkUploadProgress('testmedia');
        expect(response.status).toEqual(constants.responseStatus.success);
    });

    test('Should upload media to snapchat', async () => {
        const uploadMedia = [{
            media: {
                id: 'testMediaId',
                name: 'testMedia',
            },
        }];
        const mediaData = {
            filePath: 'testFilePath',
            id: 'testMediaId',
        };
        const response = await media.uploadMediaToSnapchat(mediaData, uploadMedia);
        expect(response.id).toEqual('testMediaId');
    });

    test('Should create media and upload to snapchat', async () => {
        const adAccount = { id: 'testAdAccountId' };
        const mediaData = [{
            filePath: 'testFilePath',
            fileName: 'testMedia',
            mimeType: 'image/png',
        }];
        const response = await media.createMediaAndUploadToSnapchat(mediaData, adAccount);
        expect(response.mediaInfo[0].id).toEqual('testMediaId');
    });
});
