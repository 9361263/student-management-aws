const express = require('express');
const router = express.Router();
const { getDepartments, getCourses, getSubjects } = require('../controllers/academicController');

// Public lookup for forms & filters
router.get('/departments', getDepartments);
router.get('/courses', getCourses);
router.get('/subjects', getSubjects);

module.exports = router;
