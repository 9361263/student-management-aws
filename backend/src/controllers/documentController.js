const { query } = require('../config/db');
const { generateUploadUrl, generateDownloadUrl, deleteS3Object } = require('../config/s3');

/**
 * Step 1: Request a Presigned S3 Upload URL from Amazon S3
 */
const getUploadUrl = async (req, res) => {
  try {
    const { fileName, mimeType, studentId, documentType = 'OTHER' } = req.body;
    const finalMimeType = mimeType || 'application/pdf';

    if (!fileName || !studentId) {
      return res.status(400).json({
        success: false,
        message: 'fileName and studentId are required.',
      });
    }

    const { uploadUrl, s3Key, bucket, region } = await generateUploadUrl(
      fileName,
      finalMimeType,
      studentId,
      documentType
    );

    return res.status(200).json({
      success: true,
      message: 'Presigned S3 Upload URL generated successfully.',
      uploadUrl,
      s3Key,
      bucket,
      region,
      instructions: 'Use an HTTP PUT request directly to Amazon S3 with matching Content-Type header.',
    });
  } catch (error) {
    console.error('Error generating upload URL:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate S3 upload URL.',
    });
  }
};

/**
 * Step 2: Confirm Upload & Save Metadata in RDS Database
 */
const confirmUpload = async (req, res) => {
  try {
    const { studentId, fileName, s3Key, documentType, fileSize, mimeType } = req.body;

    if (!studentId || !fileName || !s3Key || !documentType) {
      return res.status(400).json({
        success: false,
        message: 'studentId, fileName, s3Key, and documentType are required.',
      });
    }

    const sql = `
      INSERT INTO documents (student_id, file_name, s3_key, document_type, file_size, mime_type)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const result = await query(sql, [
      parseInt(studentId, 10),
      fileName,
      s3Key,
      documentType.toUpperCase(),
      fileSize ? parseInt(fileSize, 10) : null,
      mimeType || 'application/octet-stream',
    ]);

    return res.status(201).json({
      success: true,
      message: 'Document metadata recorded in RDS PostgreSQL successfully.',
      document: result.rows[0],
    });
  } catch (error) {
    console.error('Error confirming upload:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to record document metadata in database.',
    });
  }
};

/**
 * Step 3: Get Presigned Download URL for viewing or downloading a file from Amazon S3
 */
const getDownloadUrl = async (req, res) => {
  try {
    const documentId = parseInt(req.params.id, 10);

    const result = await query('SELECT * FROM documents WHERE id = $1', [documentId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Document record not found in database.' });
    }

    const s3Key = result.rows[0].s3_key;
    const fileName = result.rows[0].file_name;
    const downloadUrl = await generateDownloadUrl(s3Key);

    return res.status(200).json({
      success: true,
      fileName,
      downloadUrl,
    });
  } catch (error) {
    console.error('Error generating download URL:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate S3 download URL.',
    });
  }
};

/**
 * Get all documents belonging to a student from RDS PostgreSQL
 */
const getStudentDocuments = async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId, 10);

    const result = await query(
      'SELECT * FROM documents WHERE student_id = $1 ORDER BY uploaded_at DESC',
      [studentId]
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      documents: result.rows,
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch student documents from database.',
    });
  }
};

/**
 * Delete a document from S3 and RDS
 */
const deleteDocument = async (req, res) => {
  try {
    const documentId = parseInt(req.params.id, 10);

    const result = await query('DELETE FROM documents WHERE id = $1 RETURNING s3_key', [documentId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Document not found in database.' });
    }

    const s3Key = result.rows[0].s3_key;
    if (s3Key) {
      await deleteS3Object(s3Key);
    }

    return res.status(200).json({
      success: true,
      message: 'Document deleted from Amazon S3 and RDS PostgreSQL successfully.',
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete document.',
    });
  }
};

module.exports = {
  getUploadUrl,
  confirmUpload,
  getDownloadUrl,
  getStudentDocuments,
  deleteDocument,
};
