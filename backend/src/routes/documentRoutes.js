const express = require('express');
const router = express.Router();
const {
  getUploadUrl,
  confirmUpload,
  getDownloadUrl,
  getStudentDocuments,
  deleteDocument,
} = require('../controllers/documentController');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireFacultyOrAdmin, requireAdmin } = require('../middleware/roleMiddleware');

router.use(verifyToken);

router.post('/upload-url', requireFacultyOrAdmin, getUploadUrl);
router.post('/confirm', requireFacultyOrAdmin, confirmUpload);
router.get('/download/:id', requireFacultyOrAdmin, getDownloadUrl);
router.get('/student/:studentId', requireFacultyOrAdmin, getStudentDocuments);
router.delete('/:id', requireAdmin, deleteDocument);

module.exports = router;
