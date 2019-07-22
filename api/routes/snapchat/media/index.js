const express = require('express');

const controller = require('./media');

const router = express.Router();

/**
 * @swagger
 * securityDefinitions:
 *   Bearer:
 *     type: apiKey
 *     name: Authorization
 *     in: header
 * /snapchat/media/upload:
 *   post:
 *     security:
 *       - Bearer: []
 *     description: Upload media file
 *     tags:
 *       - snapchat/media
 *     consumes:
 *       - multipart/form-data
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: upfile[]
 *         description: Upload media files
 *         in: formData
 *         type: file
 *         required: true
 *       - name: adAccount
 *         description: List of ad accounts with id and name
 *         in: formData
 *         type: array
 *         items:
 *           - $ref: '#/definitions/adAccount'
 *         required: true
 *       - name: mediaView
 *         description: Media display view
 *         in: formData
 *         type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Media uploaded successfully
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * definition:
 *   adAccount:
 *     properties:
 *       id:
 *         type: string
 *       name:
 *         type: string
 */
router.post('/upload', controller.uploadMedia);

module.exports = router;
