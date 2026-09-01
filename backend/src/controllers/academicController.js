const { query } = require('../config/db');

const getDepartments = async (req, res) => {
  try {
    const result = await query('SELECT * FROM departments ORDER BY id ASC');
    return res.status(200).json({ success: true, departments: result.rows });
  } catch (error) {
    console.error('Error fetching departments:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch departments from database.' });
  }
};

const getCourses = async (req, res) => {
  try {
    const { departmentId } = req.query;
    let sql = 'SELECT c.*, d.name AS department_name FROM courses c JOIN departments d ON c.department_id = d.id';
    const params = [];

    if (departmentId) {
      sql += ' WHERE c.department_id = $1';
      params.push(parseInt(departmentId, 10));
    }
    sql += ' ORDER BY c.id ASC';

    const result = await query(sql, params);
    return res.status(200).json({ success: true, courses: result.rows });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch courses from database.' });
  }
};

const getSubjects = async (req, res) => {
  try {
    const { courseId, semester } = req.query;
    let sql = 'SELECT s.*, c.name AS course_name FROM subjects s JOIN courses c ON s.course_id = c.id WHERE 1=1';
    const params = [];
    let idx = 1;

    if (courseId) {
      sql += ` AND s.course_id = $${idx}`;
      params.push(parseInt(courseId, 10));
      idx++;
    }

    if (semester) {
      sql += ` AND s.semester = $${idx}`;
      params.push(parseInt(semester, 10));
      idx++;
    }

    sql += ' ORDER BY s.semester ASC, s.name ASC';

    const result = await query(sql, params);
    return res.status(200).json({ success: true, subjects: result.rows });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch subjects from database.' });
  }
};

module.exports = {
  getDepartments,
  getCourses,
  getSubjects,
};
