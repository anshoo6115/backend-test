const express = require('express');

const controller = require('./users');

const router = express.Router();

/**
 * @swagger
 * securityDefinitions:
 *   Bearer:
 *     type: apiKey
 *     name: Authorization
 *     in: header
 * /users/:
 *   get:
 *     security:
 *       - Bearer: []
 *     tags:
 *       - users
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Data fetched successfully
 *       400:
 *         description: Error occured while fetching user list
 */
router.get('/', controller.listUsers);

/**
 * @swagger
 * securityDefinitions:
 *   Bearer:
 *     type: apiKey
 *     name: Authorization
 *     in: header
 * /users/:
 *   post:
 *     security:
 *       - Bearer: []
 *     tags:
 *       - users
 *     description: Create a new user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         description: Create user in database
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/createUser'
 *     responses:
 *       200:
 *         description: User created
 *       400:
 *         description: Invalid email or Email already exists
 */

/**
 * @swagger
 * definition:
 *   createUser:
 *     properties:
 *       name:
 *         type: string
 *       email:
 *         type: string
 *       role:
 *         type: string
 */
router.post('/', controller.createUser);

/**
 * @swagger
 * /users/verifyToken/{token}:
 *   get:
 *     description: Verifies user with token
 *     tags:
 *       - users
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token
 *         description: Token to validate user
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Successfully verified link
 *       400:
 *         description: Verification link is not valid
 */
router.get('/verifyToken/:token', controller.verifyToken);

/**
 * @swagger
 * /users/resetPassword:
 *   put:
 *     description: Set password for a user
 *     tags:
 *       - users
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         description: Reset user password
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/resetPassword'
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Verification token is not valid
 */

/**
 * @swagger
 * definition:
 *   resetPassword:
 *     properties:
 *       token:
 *         type: string
 *       password:
 *         type: string
 *       confirmPassword:
 *         type: string
 */
router.put('/resetPassword', controller.resetPassword);

/**
 * @swagger
 * /users/login:
 *   post:
 *     description: Login user
 *     tags:
 *       - users
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         description: Login user
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/login'
 *     responses:
 *       200:
 *         description: User login successful
 *       400:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * definition:
 *   login:
 *     properties:
 *       email:
 *         type: string
 *       password:
 *         type: string
 */
router.post('/login', controller.login);

/**
 * @swagger
 * /users/requestPassword/{email}:
 *   get:
 *     description: Generate link to set password
 *     tags:
 *       - users
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: email
 *         description: User email
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Password reset link sent on email
 *       400:
 *         description: Unable to verify account
 */
router.get('/requestPassword/:email', controller.requestPassword);

/**
 * @swagger
 * securityDefinitions:
 *   Bearer:
 *     type: apiKey
 *     name: Authorization
 *     in: header
 * /users/changePassword:
 *   put:
 *     security:
 *       - Bearer: []
 *     description: Change user password by old password
 *     tags:
 *       - users
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         description: Change user password
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/changePassword'
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Verification token is not valid
 */

/**
 * @swagger
 * definition:
 *   changePassword:
 *     properties:
 *       oldPassword:
 *         type: string
 *       newPassword:
 *         type: string
 *       confirmNewPassword:
 *         type: string
 */
router.put('/changePassword', controller.changePassword);

/**
 * @swagger
 * securityDefinitions:
 *   Bearer:
 *     type: apiKey
 *     name: Authorization
 *     in: header
 * /users/:
 *   put:
 *     security:
 *       - Bearer: []
 *     description: Update user details
 *     tags:
 *       - users
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         description: Update user details
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/updateUser'
 *     responses:
 *       200:
 *         description: Updated user details
 *       400:
 *         description: Unauthorized user
 */

/**
 * @swagger
 * definition:
 *   updateUser:
 *     properties:
 *       email:
 *         type: string
 *       name:
 *         type: string
 *       role:
 *         type: string
 *       isActive:
 *         type: boolean
 *       isAccountLocked:
 *         type: boolean
 */
router.put('/', controller.updateUser);

/**
 * @swagger
 * securityDefinitions:
 *   Bearer:
 *     type: apiKey
 *     name: Authorization
 *     in: header
 * /users/logout:
 *   post:
 *     security:
 *       - Bearer: []
 *     description: Logout user
 *     tags:
 *       - users
 *     produces:
 *       - application/json
 *     parameters:
 *     responses:
 *       200:
 *         description: User logout successfully
 *       400:
 *         description: Invalid request
 */
router.post('/logout', controller.logout);

module.exports = router;
