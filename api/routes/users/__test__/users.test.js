/* eslint-disable no-undef */
/* eslint-disable max-len */

process.env.LOG_DIR = './logs';
process.env.JWT_KEY = 'Caleb Secret Key';

const users = require('../users');
const constants = require('../../../utility/constants');
const {
    getUserByEmail,
} = require('../model');

jest.mock('../model', () => ({
    getAllUsers: jest.fn(() => {
        const userList = {
            status: true,
            Items: [{
                name: 'testuser',
                email: 'testuser@fluentco.com',
                role: 'admin',
                isActive: true,
                isAccountLocked: false,
                verifiedOn: new Date().toISOString(),
            }],
        };
        return userList;
    }),

    createUser: jest.fn(() => true),

    getUserByEmail: jest.fn(() => {
        const testUserCount = {
            Count: 0,
        };
        return testUserCount;
    }),

    getUserResetPasswordTokenByToken: jest.fn(() => {
        const testToken = {
            Count: 1,
            Items: [{
                email: 'testuser@fluentco.com',
                resetPasswordTokenCreatedOn: new Date().toISOString(),
                resetPasswordToken: '$2b$10$6nTfMDs4X7mbh.AxvhgvruLhRJAVm1vrvaytQuSIUXkOKF7I3O/xK',
            }],
        };
        return testToken;
    }),

    updateUserDetails: jest.fn(() => true),

    deleteUserResetPasswordToken: jest.fn(() => true),
}));

jest.mock('../../../lib/mailer', () => ({
    sendMail: jest.fn(() => true),
}));

describe('User management', () => {
    const email = 'testuser@fluentco.com';
    const name = 'testuser';
    const role = 'admin';
    const wrongEmail = 'wrongemail';
    const password = 'test@1234';
    const wrongPassword = 'test';
    const incorrectRole = 'testRole';

    test('Should return user list', async () => {
        const response = await users.getUserList();
        expect(response.status).toEqual(constants.responseStatus.success);
        expect(response).toHaveProperty('data');
    });

    test('Should validate email', () => {
        const response = users.validateEmail(email);
        expect(response).toEqual(true);
    });

    test('Should not validate wrong email', () => {
        const response = users.validateEmail(wrongEmail);
        expect(response).not.toEqual(true);
    });

    test('Should validate password', () => {
        const response = users.validatePassword(password);
        expect(response).toEqual(true);
    });

    test('Should validate wrong password', () => {
        const response = users.validatePassword(wrongPassword);
        expect(response).toEqual(false);
    });

    test('Should validate user with correct role', () => {
        const response = users.validateRole(role);
        expect(response).toEqual(true);
    });

    test('Should validate user with incorrect role', () => {
        const response = users.validateRole(incorrectRole);
        expect(response).toEqual(false);
    });

    test('Should add new user', async () => {
        const response = await users.validateAndCreateUser(name, email, role);
        expect(response.message.toLowerCase()).toEqual('user created.');
        expect(response.status.toLowerCase()).toEqual(constants.responseStatus.success);
    });

    test('Should not add new user with wrong email', async () => {
        const response = await users.validateAndCreateUser(name, wrongEmail, role);
        expect(response.message.toLowerCase()).toEqual('invalid email or role.');
        expect(response.status.toLowerCase()).toEqual(constants.responseStatus.failure);
    });

    test('Should not add duplicate user', async () => {
        getUserByEmail.mockReturnValueOnce({
            Count: 1,
            Items: [{
                email: 'testuser@fluentco.com',
                role: 'admin',
                password: '$2b$10$6nTfMDs4X7mbh.AxvhgvruLhRJAVm1vrvaytQuSIUXkOKF7I3O/xK',
            }],
        });
        const response = await users.validateAndCreateUser(name, email, role);
        expect(response.message.toLowerCase()).toEqual('email already exist.');
        expect(response.status.toLowerCase()).toEqual(constants.responseStatus.failure);
    });
});

describe('User verification', () => {
    const email = 'testuser@fluentco.com';
    const name = 'testuser';
    const password = 'test@1234';
    const wrongPassword = 'test';
    const token = 'a851c10126ff5dc1f6d2ba46ec59b172d16c18dcbed6b975a3187346be4ece20';

    test('Should return user verification token', async () => {
        const response = await users.generateVerificationToken(name, email);
        expect(response).toHaveLength(64);
    });

    test('Should send account verification email', async () => {
        const response = await users.sendAccountVerificationEmail(name, email);
        expect(response).toEqual(true);
    });

    test('Should generate account verification link and send email', async () => {
        const response = await users.generateAccountVerificationLink(name, email);
        expect(response).toEqual(true);
    });

    test('Should return user email for token', async () => {
        const expected = /\S+@\S+\.\S+/;
        const response = await users.verifyTokenAndGetUserEmail(token);
        expect(response).toEqual(expect.stringMatching(expected));
    });

    test('Should verify and update user account status and return user email', async () => {
        const expected = /\S+@\S+\.\S+/;
        const response = await users.verifyUserAndUpdateAccount(token);
        expect(response).toEqual(expect.stringMatching(expected));
    });

    test('Should reset user password', async () => {
        const response = await users.verifyTokenAndResetPassword(token, password);
        expect(response.status).toEqual(constants.responseStatus.success);
    });

    test('Should not reset user password if password is wrong', async () => {
        const response = await users.verifyTokenAndResetPassword(token, wrongPassword);
        expect(response.status).toEqual(constants.responseStatus.failure);
    });
});

describe('User login', () => {
    const email = 'testuser@fluentco.com';
    const wrongEmail = 'wrongemail';
    const password = 'test@1234';
    const wrongPassword = 'test';

    test('Should login user if email and password both are correct', async () => {
        getUserByEmail.mockReturnValueOnce({
            Count: 1,
            Items: [{
                email: 'testuser@fluentco.com',
                role: 'admin',
                password: '$2b$10$6nTfMDs4X7mbh.AxvhgvruLhRJAVm1vrvaytQuSIUXkOKF7I3O/xK',
                isAccountLocked: false,
                isActive: true,
                passwordResetOn: new Date().toISOString(),
                failedLoginCount: 0,
            }],
        });
        const response = await users.processUserLogin(email, password);
        expect(response.status.toLowerCase()).toEqual(constants.responseStatus.success);
    });

    test('Should not login user if user does not exist', async () => {
        getUserByEmail.mockReturnValueOnce(false);
        const response = await users.processUserLogin(email, password);
        expect(response.status.toLowerCase()).toEqual(constants.responseStatus.failure);
    });

    test('Should not login user if password is incorrect', async () => {
        getUserByEmail.mockReturnValueOnce({
            Count: 1,
            Items: [{
                email: 'testuser@fluentco.com',
                role: 'admin',
                password: '$2b$10$6nTfMDs4X7mbh.AxvhgvruLhRJAVm1vrvaytQuSIUXkOKF7I3O/xK',
            }],
        });
        const response = await users.processUserLogin(email, wrongPassword);
        expect(response.status.toLowerCase()).toEqual(constants.responseStatus.failure);
    });

    test('Should not login user if email is incorrect', async () => {
        getUserByEmail.mockReturnValueOnce(false);
        const response = await users.processUserLogin(wrongEmail, password);
        expect(response.status.toLowerCase()).toEqual(constants.responseStatus.failure);
    });

    test('Should not login user if email and password both are incorrect', async () => {
        getUserByEmail.mockReturnValueOnce(false);
        const response = await users.processUserLogin(wrongEmail, password);
        expect(response.status.toLowerCase()).toEqual(constants.responseStatus.failure);
    });

    test('Should not login user if failed login attempts exceeded the limit', async () => {
        getUserByEmail.mockReturnValueOnce({
            Count: 1,
            Items: [{
                email: 'testuser@fluentco.com',
                role: 'admin',
                password: '$2b$10$6nTfMDs4X7mbh.AxvhgvruLhRJAVm1vrvaytQuSIUXkOKF7I3O/xK',
                isAccountLocked: false,
                isActive: true,
                passwordResetOn: new Date().toISOString(),
                failedLoginCount: constants.allowedFailedLoginAttempts,
            }],
        });
        const response = await users.processUserLogin(email, wrongPassword);
        expect(response.status.toLowerCase()).toEqual(constants.responseStatus.failure);
    });

    test('Should not login user if account is locked', async () => {
        getUserByEmail.mockReturnValueOnce({
            Count: 1,
            Items: [{
                email: 'testuser@fluentco.com',
                role: 'admin',
                password: '$2b$10$6nTfMDs4X7mbh.AxvhgvruLhRJAVm1vrvaytQuSIUXkOKF7I3O/xK',
                isAccountLocked: true,
                isActive: false,
                passwordResetOn: new Date().toISOString(),
                failedLoginCount: 0,
            }],
        });
        const response = await users.processUserLogin(email, password);
        expect(response.status.toLowerCase()).toEqual(constants.responseStatus.failure);
    });

    test('Should not login user if user is inactive', async () => {
        getUserByEmail.mockReturnValueOnce({
            Count: 1,
            Items: [{
                email: 'testuser@fluentco.com',
                role: 'admin',
                password: '$2b$10$6nTfMDs4X7mbh.AxvhgvruLhRJAVm1vrvaytQuSIUXkOKF7I3O/xK',
                isAccountLocked: false,
                isActive: false,
                passwordResetOn: new Date().toISOString(),
                failedLoginCount: 0,
            }],
        });
        const response = await users.processUserLogin(email, password);
        expect(response.status.toLowerCase()).toEqual(constants.responseStatus.failure);
    });

    test('Should not login user if password is expired', async () => {
        getUserByEmail.mockReturnValueOnce({
            Count: 1,
            Items: [{
                email: 'testuser@fluentco.com',
                role: 'admin',
                password: '$2b$10$6nTfMDs4X7mbh.AxvhgvruLhRJAVm1vrvaytQuSIUXkOKF7I3O/xK',
                isAccountLocked: false,
                isActive: true,
                passwordResetOn: '2018-01-01',
                failedLoginCount: 0,
            }],
        });
        const response = await users.processUserLogin(email, password);
        expect(response.status.toLowerCase()).toEqual(constants.responseStatus.failure);
    });

    test('Should validate jwt token', async () => {
        getUserByEmail.mockReturnValueOnce({
            Count: 1,
            Items: [{
                email: 'testuser@fluentco.com',
                jwtToken:['testToken'],
            }],
        });
        const response = await users.validateJwtToken('testuser@fluentco.com','testToken');
        expect(response).toEqual('testToken');
    });

    test('Should delete jwt token if user logout', async () => {
        getUserByEmail.mockReturnValueOnce({
            Count: 1,
            Items: [{
                email: 'testuser@fluentco.com',
                jwtToken:['testToken'],
            }],
        });
        const response = await users.removeJwtToken('testuser@fluentco.com','testToken');
        expect(response).toEqual(true);
    });
});

describe('User modification', () => {
    const email = 'testuser@fluentco.com';
    const wrongEmail = 'wrongemail';
    const wrongPassword = '1234';
    const oldPassword = 'test@1234';
    const newPassword = 'test1@1234';
    const confirmNewPassword = 'test1@1234';

    test('Should not change user password if user does not exist', async () => {
        const response = await users.validateUserCredentials(wrongEmail, newPassword);
        expect(response).toEqual(false);
    });

    test('Should not change user password if email is not valid', async () => {
        const response = await users.validateUserCredentials(wrongEmail, newPassword);
        expect(response).toEqual(false);
    });

    test('Should not change password if old password is not valid', async () => {
        const response = await users.validateUserCredentials(email, wrongPassword);
        expect(response).toEqual(false);
    });

    test('Should not change user password if old password and new password both are same', () => {
        const response = users.validateChangePasswordRequest(email, oldPassword,
            oldPassword, confirmNewPassword);
        expect(response).toEqual(false);
    });

    test('Should not change user password if new password is not valid', () => {
        const response = users.validateChangePasswordRequest(email, oldPassword,
            wrongPassword, wrongPassword);
        expect(response).toEqual(false);
    });

    test('Should not change user password if new password and confirm password both are not same', () => {
        const response = users.validateChangePasswordRequest(email, oldPassword, newPassword, oldPassword);
        expect(response).toEqual(false);
    });

    test('Should change user password if old password, new password and confirm password are valid', () => {
        const response = users.validateChangePasswordRequest(email, oldPassword, newPassword, confirmNewPassword);
        expect(response).toEqual(true);
    });
});
