const fs = require('fs');

const {
    createLogger,
    format,
    transports,
} = require('winston');
require('winston-daily-rotate-file');

const env = process.env.NODE_ENV || 'development';
const logDir = process.env.LOG_DIR;

// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

const dailyRotateFileTransport = new transports.DailyRotateFile({
    filename: `${logDir}/caleb_log_%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
});

const consoleTransport = new transports.Console({
    format: format.combine(
        format.colorize(),
        format.printf(
            info => `${info.timestamp} ${info.level}: ${info.message}`,
        ),
    ),
});

const logger = createLogger({
    // change log level depending on the environment
    level: (env === 'development') ? 'debug' : 'info',
    format: format.combine(
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss',
        }),
        format.json(),
    ),
    transports: [
        consoleTransport,
        dailyRotateFileTransport,
    ],
});

logger.stream = {
    write(message) {
        logger.info(message);
    },
};

module.exports = logger;
