const express = require('express');
const router = express.Router();
const {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} = require('../controllers/studentController');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireAdmin, requireFacultyOrAdmin } = require('../middleware/roleMiddleware');

router.use(verifyToken);

router.get('/', requireFacultyOrAdmin, getAllStudents);
router.get('/:id', requireFacultyOrAdmin, getStudentById);
router.post('/', requireAdmin, createStudent);
router.put('/:id', requireAdmin, updateStudent);
router.delete('/:id', requireAdmin, deleteStudent);

module.exports = router;
