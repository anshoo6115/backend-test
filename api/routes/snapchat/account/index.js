const express = require('express');

const controller = require('./account');

const router = express.Router();

/**
 * @swagger
 * securityDefinitions:
 *   Bearer:
 *     type: apiKey
 *     name: Authorization
 *     in: header
 * /snapchat/account/code:
 *   get:
 *     security:
 *       - Bearer: []
 *     description: Redirect user to snapchat app
 *     tags:
 *       - snapchat/account
 *     produces:
 *       - application/json
 *     responses:
 *       301:
 *         description: Redirect user to snapchat app
 */
router.get('/code', controller.redirectToSnapchatAuth);

/**
 * @swagger
 * securityDefinitions:
 *   Bearer:
 *     type: apiKey
 *     name: Authorization
 *     in: header
 * /snapchat/account/:code:
 *   get:
 *     security:
 *       - Bearer: []
 *     description: get snapchat authorization code
 *     tags:
 *       - snapchat/account
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: code
 *         description: authorization code
 *         in: path
 *         required: true
 *     responses:
 *       200:
 *         description: Successfully updated token
 *       400:
 *         description: Unable to reset token
 */
router.get('/:code', controller.generateSnapchatToken);

module.exports = router;
