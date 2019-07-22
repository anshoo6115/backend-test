const aws = require('aws-sdk');

const logger = require('../logger');

const awsAccessKeyId = process.env.AWS_ACCESS_KEY;
const awsSecretAccessKey = process.env.AWS_SECRET_KEY;
const awsRegion = process.env.AWS_REGION;
const awsDynamoDBEndpoint = process.env.AWS_DYNAMODB_ENDPOINT;

const configureDynamodb = () => {
    try {
        aws.config.update({
            accessKeyId: awsAccessKeyId,
            secretAccessKey: awsSecretAccessKey,
            region: awsRegion,
            endpoint: awsDynamoDBEndpoint,
        });

        const dynamoDB = new aws.DynamoDB({
            endpoint: new aws.Endpoint(awsDynamoDBEndpoint),
        });

        const docClient = new aws.DynamoDB.DocumentClient();

        return {
            dynamoDB,
            docClient,
        };
    } catch (err) {
        logger.error(err.message);
        return false;
    }
};

module.exports = configureDynamodb();
