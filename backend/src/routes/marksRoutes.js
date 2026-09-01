const express = require('express');
const router = express.Router();
const {
  getAllStudentsMarksSummary,
  addOrUpdateMarks,
  updateMarksById,
  getStudentMarks,
  deleteMarks,
} = require('../controllers/marksController');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireFacultyOrAdmin, requireAdmin } = require('../middleware/roleMiddleware');

router.use(verifyToken);

router.get('/summary', requireFacultyOrAdmin, getAllStudentsMarksSummary);
router.post('/', requireFacultyOrAdmin, addOrUpdateMarks);
router.put('/:id', requireFacultyOrAdmin, updateMarksById);
router.get('/student/:studentId', requireFacultyOrAdmin, getStudentMarks);
router.delete('/:id', requireFacultyOrAdmin, deleteMarks);

module.exports = router;
