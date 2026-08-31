const express = require('express');
const router = express.Router();
const {
  recordAttendance,
  getStudentAttendance,
  getLowAttendanceStudents,
} = require('../controllers/attendanceController');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireFacultyOrAdmin } = require('../middleware/roleMiddleware');

router.use(verifyToken);

router.post('/', requireFacultyOrAdmin, recordAttendance);
router.get('/student/:studentId', requireFacultyOrAdmin, getStudentAttendance);
router.get('/low-attendance', requireFacultyOrAdmin, getLowAttendanceStudents);

module.exports = router;
