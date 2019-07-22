const http = require('http');

if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line global-require, import/no-extraneous-dependencies
    require('dotenv').config();
}

const app = require('./app');
const logger = require('./api/lib/logger');

const port = process.env.PORT;

const server = http.Server(app);

server.listen(port, () => {
    logger.info(`Caleb api listening on port: ${port}`);
});
