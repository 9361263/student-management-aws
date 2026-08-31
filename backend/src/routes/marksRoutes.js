const express = require('express');
const router = express.Router();
const {
  addOrUpdateMarks,
  getStudentMarks,
  deleteMarks,
} = require('../controllers/marksController');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireFacultyOrAdmin, requireAdmin } = require('../middleware/roleMiddleware');

router.use(verifyToken);

router.post('/', requireFacultyOrAdmin, addOrUpdateMarks);
router.get('/student/:studentId', requireFacultyOrAdmin, getStudentMarks);
router.delete('/:id', requireAdmin, deleteMarks);

module.exports = router;
