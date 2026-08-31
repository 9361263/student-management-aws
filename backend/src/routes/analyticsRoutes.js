const express = require('express');
const router = express.Router();
const {
  getOverviewStats,
  getDepartmentDistribution,
  getYearDistribution,
  getAttendanceBreakdown,
  getSubjectPerformance,
  getTopStudents,
} = require('../controllers/analyticsController');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireFacultyOrAdmin } = require('../middleware/roleMiddleware');

router.use(verifyToken);
router.use(requireFacultyOrAdmin);

router.get('/overview', getOverviewStats);
router.get('/departments', getDepartmentDistribution);
router.get('/years', getYearDistribution);
router.get('/attendance', getAttendanceBreakdown);
router.get('/subjects', getSubjectPerformance);
router.get('/top-students', getTopStudents);

module.exports = router;
