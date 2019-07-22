const express = require('express');

const controller = require('./adAccounts');

const router = express.Router();

/**
 * @swagger
 * securityDefinitions:
 *   Bearer:
 *     type: apiKey
 *     name: Authorization
 *     in: header
 * /snapchat/adAccounts/:
 *   get:
 *     security:
 *       - Bearer: []
 *     description: List ad accounts
 *     tags:
 *       - snapchat/adAccounts
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: List ad accounts
 *       500:
 *         description: Internal server error
 */
router.get('/', controller.listAdAccounts);

module.exports = router;
