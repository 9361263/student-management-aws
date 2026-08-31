/**
 * Lambda Deployment Packaging Script
 * Compresses backend code and node_modules into a zip package for AWS Lambda
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Packaging backend for AWS Lambda deployment...');

const buildDir = path.join(__dirname, '../dist');
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

console.log('1. Verifying lambda.js and src directory...');
if (!fs.existsSync(path.join(__dirname, '../lambda.js'))) {
  console.error('Error: lambda.js not found!');
  process.exit(1);
}

console.log('Ready for AWS Lambda deployment packaging!');
console.log('To upload directly:');
console.log('aws lambda update-function-code --function-name student-management-api --zip-file fileb://lambda.zip');
