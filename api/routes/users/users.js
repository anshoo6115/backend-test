const bcrypt = require('bcrypt');

const model = require('./model');
const logger = require('../../lib/logger');
const mailer = require('../../lib/mailer');
const utility = require('../../utility/utils');
const constants = require('../../utility/constants');
const accountVerificationMailTemplate = require('../../lib/mailer/templates/accountVerification');
const jwt = require('../../lib/jwt');

/* Sort user list in desc order by created date */
const sortByCreatedOn = (userA, userB) => {
    try {
        const dateA = new Date(userA.createdOn).valueOf();
        const dateB = new Date(userB.createdOn).valueOf();

        if (dateA < dateB) return 1;
        if (dateA > dateB) return -1;
        return 0;
    } catch (err) {
        return err;
    }
};

/* Return all users list */
const getUserList = async () => {
    try {
        const usersData = await model.getAllUsers();
        if (usersData) {
            return {
                status: constants.responseStatus.success,
                data: usersData.Items.sort(sortByCreatedOn),
            };
        }

        return {
            status: constants.responseStatus.failure,
            message: 'Error occured while fetching user list.',
        };
    } catch (err) {
        return err;
    }
};

/* Handle user list request */
const listUsers = async (req, res) => {
    try {
        const response = await getUserList();
        if (response.status === constants.responseStatus.success) {
            return res.status(200).json(response);
        }
        logger.error(response.message);
        return res.sendStatus(500);
    } catch (err) {
        logger.error(err.message);
        return res.sendStatus(500);
    }
};

/* Validate email */
const validateEmail = (email) => {
    try {
        const emailRegex = /\S+@\S+\.\S+/;
        if (emailRegex.test(email)) {
            return true;
        }

        return false;
    } catch (err) {
        return err;
    }
};

/* Validate role */
const validateRole = (role) => {
    if ((role === constants.userRole.admin) || (role === constants.userRole.accountManager)) {
        return true;
    }
    return false;
};


/* Return user details by email if exist */
const getUserByEmail = async (email) => {
    try {
        const result = await model.getUserByEmail(email);
        if (result && result.Count > 0) {
            return result;
        }

        return false;
    } catch (err) {
        return err;
    }
};

/* Validate email and create new user */
const validateAndCreateUser = async (name, email, role) => {
    try {
        if (!validateEmail(email) || !validateRole(role)) {
            return {
                status: constants.responseStatus.failure,
                message: 'Invalid email or role.',
            };
        }

        const user = await getUserByEmail(email);
        if (user) {
            return {
                status: constants.responseStatus.failure,
                message: 'Email already exist.',
            };
        }

        const isUserCreated = await model.createUser(name, email, role);
        if (isUserCreated) {
            return {
                status: constants.responseStatus.success,
                message: 'User created.',
            };
        }

        return {
            status: constants.responseStatus.failure,
            message: 'Error occured while creating user.',
        };
    } catch (err) {
        return err;
    }
};

/* Generate account verification token */
const generateVerificationToken = async (name, email) => {
    try {
        const token = utility.getVerificationToken(name, email);
        const fieldsToUpdate = { resetPasswordToken: token };

        if (await model.updateUserDetails(email, fieldsToUpdate)) {
            return token;
        }

        return false;
    } catch (err) {
        return err;
    }
};

/* Return email template */
const getAccountVerificationMailTemplate = (name, to, url) => {
    try {
        return {
            to,
            subject: 'Caleb - Verify your account',
            text: accountVerificationMailTemplate.getTemplate(name, url),
            html: accountVerificationMailTemplate.getTemplate(name, url),
        };
    } catch (err) {
        return err;
    }
};

/* Send verification email */
const sendAccountVerificationEmail = async (name, email, verificationLink) => {
    try {
        const emailTemplate = getAccountVerificationMailTemplate(name, email, verificationLink);
        return await mailer.sendMail(emailTemplate);
    } catch (err) {
        return err;
    }
};

/* Genererate verification link and send email */
const generateAccountVerificationLink = async (name, email) => {
    try {
        const token = await generateVerificationToken(name, email);
        if (token) {
            const verificationLink = utility.getVerificationLink(token);
            const result = await sendAccountVerificationEmail(name, email, verificationLink);
            return result;
        }

        return false;
    } catch (err) {
        return err;
    }
};

/* Handle user creation request */
const createUser = async (req, res) => {
    try {
        const name = (req.body.name && req.body.name.trim()) || '';
        const email = req.body.email && req.body.email.trim().toLowerCase();
        const role = req.body.role && req.body.role.trim().toLowerCase();

        if (!email || !role) {
            return res.status(400).json({
                status: constants.responseStatus.failure,
                message: 'Email or role is missing.',
            });
        }

        const response = await validateAndCreateUser(name, email, role);
        if (response && response.status === constants.responseStatus.success) {
            const isVerificationLinkCreated = await generateAccountVerificationLink(name, email);
            if (isVerificationLinkCreated) {
                return res.status(200).json(response);
            }

            const message = 'Error occured while creating verification link.';

            logger.error(message);
            return res.status(500).json({
                status: constants.responseStatus.failure,
                message,
            });
        }

        return res.status(400).json(response);
    } catch (err) {
        logger.error(err.message);
        return res.sendStatus(500);
    }
};

/* Return user email by token */
const verifyTokenAndGetUserEmail = async (token) => {
    try {
        const tokenDetails = await model.getUserResetPasswordTokenByToken(token);
        if (tokenDetails && tokenDetails.Count > 0) {
            if (utility.checkLinkValidity(tokenDetails.Items[0].resetPasswordTokenCreatedOn)) {
                return tokenDetails.Items[0].email;
            }
        }

        return false;
    } catch (err) {
        return err;
    }
};

/* Update user account status */
const verifyUserAndUpdateAccount = async (token) => {
    try {
        const email = await verifyTokenAndGetUserEmail(token);
        if (email) {
            const fieldsToUpdate = {
                isActive: true,
                verifiedOn: new Date().toString(),
            };
            const isUnlockedAccount = await model.updateUserDetails(email, fieldsToUpdate);
            if (isUnlockedAccount) {
                return email;
            }
        }

        return false;
    } catch (err) {
        return err;
    }
};

/* Handle token verification request */
const verifyToken = async (req, res) => {
    try {
        const { token } = req.params;

        if (!token) {
            return res.status(400).json({
                status: constants.responseStatus.failure,
                message: 'Verification token missing.',
            });
        }

        const response = await verifyUserAndUpdateAccount(token);

        if (response) {
            return res.status(200).json({
                status: constants.responseStatus.success,
                message: 'Account verification successful.',
                data: {
                    email: response,
                },
            });
        }

        return res.status(400).json({
            status: constants.responseStatus.failure,
            message: 'Verification link is not valid.',
        });
    } catch (err) {
        logger.error(err.message);
        return res.sendStatus(500);
    }
};

/* Validate password */
const validatePassword = (password) => {
    try {
        const min8Char = /.{8,}/.test(password);
        const oneLetter = /[a-zA-Z]/.test(password);
        const oneNumber = /[0-9]/.test(password);
        const oneSpecial = /[^a-zA-Z0-9]/.test(password);

        if (min8Char && oneLetter && oneNumber && oneSpecial) {
            return true;
        }

        return false;
    } catch (err) {
        return err;
    }
};

/* Set new password for user */
const setPassword = async (email, password) => {
    try {
        if (email && password) {
            const hash = bcrypt.hashSync(password, constants.saltRounds);
            const fieldsToUpdate = { password: hash };

            return await model.updateUserDetails(email, fieldsToUpdate);
        }
        return false;
    } catch (err) {
        return err;
    }
};

/* Verify change password request and change user password */
const verifyTokenAndResetPassword = async (token, password) => {
    try {
        if (validatePassword(password)) {
            const email = await verifyTokenAndGetUserEmail(token);

            if (email) {
                if (await model.deleteUserResetPasswordToken(email)) {
                    if (await setPassword(email, password)) {
                        return {
                            status: constants.responseStatus.success,
                            message: 'Password changed successfully.',
                        };
                    }

                    return {
                        status: constants.responseStatus.failure,
                        message: 'Failed to set new password.',
                    };
                }

                return {
                    status: constants.responseStatus.failure,
                    message: 'Somthing went wrong with verification token.',
                };
            }

            return {
                status: constants.responseStatus.failure,
                message: 'Verification token is not valid.',
            };
        }

        return {
            status: constants.responseStatus.failure,
            message: 'Password is not valid.',
        };
    } catch (err) {
        return err;
    }
};

/* Handle change password request */
const resetPassword = async (req, res) => {
    try {
        const { token } = req.body;
        const { password } = req.body;
        const { confirmPassword } = req.body;

        if (!token || !password || !confirmPassword) {
            return res.status(400).json({
                status: constants.responseStatus.failure,
                message: 'Token or password is missing.',
            });
        }

        if (password === confirmPassword) {
            const response = await verifyTokenAndResetPassword(token, password);
            if (response && response.status === constants.responseStatus.success) {
                return res.status(200).json(response);
            }

            return res.status(400).json(response);
        }

        return res.status(400).json({
            status: constants.responseStatus.failure,
            message: 'Password and Confirm password do not match.',
        });
    } catch (err) {
        logger.error(err.message);
        return res.sendStatus(500);
    }
};

/* Check password expiry */
const checkPasswordExpiry = (passwordResetDate) => {
    try {
        const passwordResetTime = new Date(passwordResetDate).valueOf();
        const currentTime = new Date().valueOf();
        const passwordExpiryDuration = 3600000 * 24 * 30 * constants.passwordExpiryInMonths;

        return (currentTime - passwordResetTime) < (passwordExpiryDuration);
    } catch (err) {
        return err;
    }
};

/* Verify user email and password */
const processUserLogin = async (email, password) => {
    try {
        const user = await getUserByEmail(email);
        if (!user) {
            return {
                status: constants.responseStatus.failure,
                message: 'Invalid credentials.',
            };
        }

        if (bcrypt.compareSync(password, user.Items[0].password)) {
            if (user.Items[0].isAccountLocked || !user.Items[0].isActive) {
                return {
                    status: constants.responseStatus.failure,
                    message: 'Account locked. Please contact administrator.',
                };
            }

            if (!checkPasswordExpiry(user.Items[0].passwordResetOn)) {
                return {
                    status: constants.responseStatus.failure,
                    message: 'Password expired. Please change password.',
                };
            }

            const token = jwt.sign(email, user.Items[0].role);
            if (token) {
                const fieldsToUpdate = { jwtToken: token };
                if (user.Items[0].failedLoginCount > 0) {
                    fieldsToUpdate.failedLoginCount = 0;
                }

                await model.updateUserDetails(email, fieldsToUpdate);
                return {
                    status: constants.responseStatus.success,
                    data: {
                        token,
                        role: user.Items[0].role,
                        name: user.Items[0].name,
                    },
                };
            }

            return {
                status: constants.responseStatus.failure,
                message: 'Something wrong with token.',
            };
        }

        const fieldsToUpdate = { failedLoginCount: user.Items[0].failedLoginCount + 1 };
        const lock = user.Items[0].failedLoginCount >= constants.allowedFailedLoginAttempts;
        if (lock && !user.Items[0].isAccountLocked) {
            fieldsToUpdate.isAccountLocked = true;
        }

        await model.updateUserDetails(email, fieldsToUpdate);

        return {
            status: constants.responseStatus.failure,
            message: 'Invalid credentials.',
        };
    } catch (err) {
        return err;
    }
};

/* Process login request */
const login = async (req, res) => {
    try {
        const { email } = req.body;
        const { password } = req.body;

        if (email && password) {
            const response = await processUserLogin(email, password);
            if (response && response.status === constants.responseStatus.success) {
                return res.status(200).json(response);
            }
            return res.status(400).json(response);
        }
        return res.status(400).json({
            status: constants.responseStatus.failure,
            message: 'Invalid credentials.',
        });
    } catch (err) {
        logger.error(err.message);
        return res.sendStatus(500);
    }
};

/* Generate and send email to set new password. */
const requestPassword = async (req, res) => {
    try {
        const email = req.params.email && req.params.email.trim().toLowerCase();
        if (email) {
            const user = await getUserByEmail(email);
            if (user) {
                if (await generateAccountVerificationLink(user.Items[0].name, email)) {
                    return res.status(200).json({
                        status: constants.responseStatus.success,
                        message: 'Password reset link sent on email.',
                    });
                }

                const message = 'Error occured while creating verification link.';

                logger.error(message);
                return res.status(500).json({
                    status: constants.responseStatus.failure,
                    message,
                });
            }
        }
        return res.status(400).json({
            status: constants.responseStatus.failure,
            message: 'Unable to verify account.',
        });
    } catch (err) {
        logger.error(err.message);
        return res.sendStatus(500);
    }
};

/* Validate change password request parameter */
const validateChangePasswordRequest = (email, oldPassword, newPassword, confirmNewPassword) => {
    try {
        const isValidParams = (email && oldPassword && confirmNewPassword && newPassword);
        const isPasswordMatched = (newPassword === confirmNewPassword);
        const isValidPassword = (newPassword !== oldPassword) && validatePassword(newPassword);
        return (isValidParams && isPasswordMatched && isValidPassword);
    } catch (err) {
        return err;
    }
};

/* Validate user credentials */
const validateUserCredentials = async (email, password) => {
    try {
        const user = await getUserByEmail(email);
        if (user && user.Count > 0) {
            if (bcrypt.compareSync(password, user.Items[0].password)) {
                return true;
            }
        }
        return false;
    } catch (err) {
        return err;
    }
};

/* Validate and change user password by old password. */
const changePassword = async (req, res) => {
    try {
        const { email } = req.user;
        const { oldPassword } = req.body;
        const { newPassword } = req.body;
        const { confirmNewPassword } = req.body;

        if (validateChangePasswordRequest(email, oldPassword, newPassword, confirmNewPassword)) {
            if (await validateUserCredentials(email, oldPassword)) {
                if (await setPassword(email, newPassword)) {
                    return res.status(200).json({
                        status: constants.responseStatus.success,
                        message: 'Password changed successfully.',
                    });
                }
            }
        }

        return res.status(400).json({
            status: constants.responseStatus.failure,
            message: 'Invalid email or password.',
        });
    } catch (err) {
        logger.error(err.message);
        return res.sendStatus(500);
    }
};

/* Check read only parameters */
const checkReadOnlyParameters = (parameters) => {
    try {
        const isPassword = Object.prototype.hasOwnProperty.call(parameters, 'password');
        const isResetOn = Object.prototype.hasOwnProperty.call(parameters, 'passwordResetOn');
        const isVerifiedOn = Object.prototype.hasOwnProperty.call(parameters, 'verifiedOn');

        return (isPassword || isResetOn || isVerifiedOn);
    } catch (err) {
        return err;
    }
};


/* Check read only parameters and update user details */
const updateUser = async (req, res) => {
    try {
        const { email } = req.body;

        if (checkReadOnlyParameters(req.body)) {
            return res.status(400).json({
                status: constants.responseStatus.failure,
                message: 'Invalid request.',
            });
        }

        if (await model.updateUserDetails(email, req.body)) {
            return res.status(200).json({
                status: constants.responseStatus.success,
                message: 'Updated user details.',
            });
        }
        return res.status(400);
    } catch (err) {
        logger.error(err.message);
        return res.sendStatus(500);
    }
};

/* Validate jwt token with jwt token stored in database */
const validateJwtToken = async (email, jwtToken) => {
    try {
        const user = await getUserByEmail(email);
        if (user && user.Count > 0) {
            return user.Items[0].jwtToken.find(token => token.includes(jwtToken));
        }
        return false;
    } catch (err) {
        return err;
    }
};

/* remove current jwt token if token is expire or user logout */
const removeJwtToken = async (email, jwtToken) => {
    try {
        const user = await getUserByEmail(email);
        if (user && user.Count > 0) {
            const jwtTokenList = user.Items[0].jwtToken.filter(token => token !== jwtToken);
            const fieldsToUpdate = { jwtTokenList };
            return await model.updateUserDetails(email, fieldsToUpdate);
        }
        return false;
    } catch (err) {
        return err;
    }
};

/* logout user */
const logout = async (req, res) => {
    try {
        const { email } = req.user;
        const jwtToken = req.header('Authorization').split('Bearer ')[1];
        if (await removeJwtToken(email, jwtToken)) {
            return res.status(200).json({
                status: constants.responseStatus.success,
                message: 'User logout successfully.',
            });
        }

        return res.status(400).json({
            status: constants.responseStatus.failure,
            message: 'Invalid request.',
        });
    } catch (err) {
        logger.error(err.message);
        return res.sendStatus(500);
    }
};

module.exports = {
    listUsers,
    createUser,
    getUserList,
    validateEmail,
    validateAndCreateUser,
    generateVerificationToken,
    sendAccountVerificationEmail,
    generateAccountVerificationLink,
    verifyToken,
    resetPassword,
    validatePassword,
    verifyTokenAndGetUserEmail,
    verifyUserAndUpdateAccount,
    verifyTokenAndResetPassword,
    validateRole,
    login,
    processUserLogin,
    requestPassword,
    changePassword,
    updateUser,
    validateChangePasswordRequest,
    validateUserCredentials,
    logout,
    validateJwtToken,
    removeJwtToken,
};
