const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
require('dotenv').config();

const region = process.env.AWS_REGION || 'ap-south-1';
const bucketName = process.env.AWS_S3_BUCKET_NAME || 'student-management-docs-akash-2026';

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

/**
 * Generate a pre-signed URL for direct browser-to-S3 uploads
 * @param {string} fileName - Original file name
 * @param {string} mimeType - MIME type of the file
 * @param {number|string} studentId - Student ID
 * @param {string} documentType - ID_PROOF, CERTIFICATE, MARKSHEET, etc.
 * @returns {Promise<{ uploadUrl: string, s3Key: string }>}
 */
const generateUploadUrl = async (fileName, mimeType, studentId, documentType = 'DOC') => {
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const s3Key = `students/${studentId}/${documentType.toLowerCase()}_${timestamp}_${sanitizedFileName}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: s3Key,
    ContentType: mimeType,
    Metadata: {
      studentId: String(studentId),
      documentType,
      uploadedAt: new Date().toISOString(),
    },
  });

  // URL expires in 15 minutes (900 seconds)
  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });

  return {
    uploadUrl,
    s3Key,
    bucket: bucketName,
    region,
  };
};

/**
 * Generate a pre-signed URL for secure temporary download/viewing of S3 files
 * @param {string} s3Key - S3 Object Key
 * @returns {Promise<string>}
 */
const generateDownloadUrl = async (s3Key) => {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: s3Key,
  });

  // Download URL valid for 30 minutes
  return await getSignedUrl(s3Client, command, { expiresIn: 1800 });
};

/**
 * Delete an object from S3
 * @param {string} s3Key - S3 Object Key
 * @returns {Promise<any>}
 */
const deleteS3Object = async (s3Key) => {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: s3Key,
  });

  return await s3Client.send(command);
};

module.exports = {
  s3Client,
  bucketName,
  generateUploadUrl,
  generateDownloadUrl,
  deleteS3Object,
};
