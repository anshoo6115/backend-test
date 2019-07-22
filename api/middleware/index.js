const bodyParser = require('body-parser');
const morgan = require('morgan');

const authMiddleware = require('./authentication');
const logger = require('../lib/logger');

/* Added cors */
const configureCors = (req, res, next) => {
    try {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        res.header('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT');
        return next();
    } catch (err) {
        logger.error(err.message);
        return res.sendStatus(500);
    }
};

const configureMiddleware = (app) => {
    try {
        // Body parser to parse json data
        app.use(bodyParser.urlencoded({
            extended: false,
        }));

        app.use(bodyParser.json());

        // Logger
        app.use(morgan('combined', {
            stream: logger.stream,
        }));

        // JWT authentication and authorization
        app.use([
            configureCors,
            authMiddleware.authenticate,
            authMiddleware.authorize,
        ]);

        return app;
    } catch (err) {
        logger.error(err.message);
        return app;
    }
};

module.exports = { configureMiddleware };
