const serverlessExpress = require('@codegenie/serverless-express');
const app = require('./src/app');

// Wrap the Express app with serverlessExpress for AWS Lambda invocation
const serverlessExpressHandler = serverlessExpress({ app });

exports.handler = async (event, context) => {
  // Enables AWS Lambda to handle API Gateway HTTP and REST API Proxy events
  return await serverlessExpressHandler(event, context);
};
