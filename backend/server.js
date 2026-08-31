const app = require('./src/app');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` Student Management & Analytics Backend Server Active!`);
  console.log(` Local Server:   http://localhost:${PORT}`);
  console.log(` Health Check:   http://localhost:${PORT}/health`);
  console.log(` AWS Region:     ${process.env.AWS_REGION || 'ap-south-1'}`);
  console.log(` S3 Bucket:      ${process.env.AWS_S3_BUCKET_NAME || 'student-management-docs-akash-2026'}`);
  console.log(` RDS Host:       ${process.env.DB_HOST || 'localhost'}`);
  console.log(`=======================================================`);
});

module.exports = server;
