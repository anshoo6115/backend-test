const express = require('express');

// eslint-disable-next-line import/no-extraneous-dependencies
const swaggerJSDoc = require('swagger-jsdoc');

// eslint-disable-next-line import/no-extraneous-dependencies
const swaggerUi = require('swagger-ui-express');

const router = express.Router();

const options = {
    swaggerDefinition: {
        info: {
            title: 'CALEB',
            version: '1.0.0',
            description: 'CALEB- API Docs',
        },
        tags: [{
            name: 'CALEB',
            description: 'Caleb API',
        }],
        schemes: ['http', 'https'],
        basePath: '/',
    },
    apis: [
        './api/routes/users/index.js',
        './api/routes/snapchat/account/index.js',
        './api/routes/snapchat/adAccounts/index.js',
        './api/routes/snapchat/media/index.js',
    ],
};

const swaggerSpec = swaggerJSDoc(options);

router.get('/json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

module.exports = router;
