const { query } = require('../config/db');

const getOverviewStats = async (req, res) => {
  try {
    // 1. Total Students
    const totalStudentsRes = await query('SELECT COUNT(*) AS total FROM students');
    const totalStudents = parseInt(totalStudentsRes.rows[0]?.total || '0', 10);

    // 2. Average Attendance
    const attRes = await query(`
      SELECT 
        COALESCE(
          ROUND(
            (COUNT(CASE WHEN status = 'PRESENT' OR status = 'LATE' THEN 1 END)::numeric / 
             NULLIF(COUNT(id), 0)::numeric) * 100, 1
          ), 0
        ) AS avg_attendance
      FROM attendance
    `);
    const averageAttendance = parseFloat(attRes.rows[0]?.avg_attendance || 0);

    // 3. Average Marks & Pass Percentage
    const marksRes = await query(`
      SELECT 
        COALESCE(ROUND(AVG((marks / NULLIF(max_marks, 0)) * 100), 1), 0) AS avg_marks,
        COALESCE(ROUND((COUNT(CASE WHEN (marks / NULLIF(max_marks, 0)) >= 0.40 THEN 1 END)::numeric / NULLIF(COUNT(id), 0)::numeric) * 100, 1), 0) AS pass_pct
      FROM marks
    `);
    const averageMarks = parseFloat(marksRes.rows[0]?.avg_marks || 0);
    const passPercentage = parseFloat(marksRes.rows[0]?.pass_pct || 0);

    // 4. Low Attendance Students Count (< 75%)
    const lowAttRes = await query(`
      SELECT COUNT(*) AS low_count FROM (
        SELECT student_id 
        FROM attendance 
        GROUP BY student_id 
        HAVING (COUNT(CASE WHEN status = 'PRESENT' OR status = 'LATE' THEN 1 END)::numeric / NULLIF(COUNT(id), 0)::numeric) * 100 < 75.0
      ) sub
    `);
    const lowAttendanceCount = parseInt(lowAttRes.rows[0]?.low_count || '0', 10);

    // 5. Total Faculty Users
    const facultyRes = await query(`SELECT COUNT(*) AS total FROM users WHERE role = 'FACULTY'`);
    const totalFaculty = parseInt(facultyRes.rows[0]?.total || '0', 10);

    // 6. Total Uploaded S3 Documents
    const docsRes = await query('SELECT COUNT(*) AS total FROM documents');
    const totalDocuments = parseInt(docsRes.rows[0]?.total || '0', 10);

    return res.status(200).json({
      success: true,
      data: {
        totalStudents,
        averageAttendance,
        averageMarks,
        passPercentage,
        lowAttendanceCount,
        totalFaculty,
        totalDocuments,
      },
    });
  } catch (error) {
    console.error('Analytics overview error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to compute analytics overview from database.',
    });
  }
};

const getDepartmentDistribution = async (req, res) => {
  try {
    const sql = `
      SELECT 
        d.name, d.code, 
        COUNT(s.id) AS student_count
      FROM departments d
      LEFT JOIN students s ON d.id = s.department_id
      GROUP BY d.id, d.name, d.code
      ORDER BY student_count DESC
    `;

    const result = await query(sql);
    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Department distribution error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch department stats from database.' });
  }
};

const getYearDistribution = async (req, res) => {
  try {
    const sql = `
      SELECT 
        year, 
        COUNT(id) AS count
      FROM students
      GROUP BY year
      ORDER BY year ASC
    `;

    const result = await query(sql);
    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Year distribution error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch year distribution from database.' });
  }
};

const getAttendanceBreakdown = async (req, res) => {
  try {
    const sql = `
      WITH StudentAtt AS (
        SELECT 
          student_id,
          (COUNT(CASE WHEN status = 'PRESENT' OR status = 'LATE' THEN 1 END)::numeric / NULLIF(COUNT(id), 0)::numeric) * 100 AS pct
        FROM attendance
        GROUP BY student_id
      )
      SELECT 
        COUNT(CASE WHEN pct >= 90.0 THEN 1 END) AS above_90,
        COUNT(CASE WHEN pct >= 75.0 AND pct < 90.0 THEN 1 END) AS between_75_and_90,
        COUNT(CASE WHEN pct < 75.0 THEN 1 END) AS below_75
      FROM StudentAtt
    `;

    const result = await query(sql);
    return res.status(200).json({
      success: true,
      data: [
        { category: 'Above 90% (Excellent)', count: parseInt(result.rows[0]?.above_90 || '0', 10), fill: '#10b981' },
        { category: '75% - 90% (Good)', count: parseInt(result.rows[0]?.between_75_and_90 || '0', 10), fill: '#3b82f6' },
        { category: 'Below 75% (Critical)', count: parseInt(result.rows[0]?.below_75 || '0', 10), fill: '#ef4444' },
      ],
    });
  } catch (error) {
    console.error('Attendance breakdown error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch attendance analytics from database.' });
  }
};

const getSubjectPerformance = async (req, res) => {
  try {
    const sql = `
      SELECT 
        sub.name AS subject_name, sub.code AS subject_code,
        ROUND(AVG((m.marks / NULLIF(m.max_marks, 0)) * 100), 1) AS average_score,
        COUNT(m.id) AS total_submissions
      FROM subjects sub
      JOIN marks m ON sub.id = m.subject_id
      GROUP BY sub.id, sub.name, sub.code
      ORDER BY average_score DESC
    `;

    const result = await query(sql);
    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Subject performance error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch subject analytics from database.' });
  }
};

const getTopStudents = async (req, res) => {
  try {
    const sql = `
      SELECT 
        s.id, s.roll_number, s.name, s.email, d.code AS department_code,
        ROUND(AVG((m.marks / NULLIF(m.max_marks, 0)) * 100), 1) AS avg_marks,
        COALESCE(
          ROUND(
            (COUNT(CASE WHEN a.status = 'PRESENT' OR a.status = 'LATE' THEN 1 END)::numeric / 
             NULLIF(COUNT(a.id), 0)::numeric) * 100, 1
          ), 100
        ) AS attendance_pct
      FROM students s
      LEFT JOIN departments d ON s.department_id = d.id
      JOIN marks m ON s.id = m.student_id
      LEFT JOIN attendance a ON s.id = a.student_id
      GROUP BY s.id, s.roll_number, s.name, s.email, d.code
      ORDER BY avg_marks DESC
      LIMIT 5
    `;

    const result = await query(sql);
    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Top students error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch top students from database.' });
  }
};

module.exports = {
  getOverviewStats,
  getDepartmentDistribution,
  getYearDistribution,
  getAttendanceBreakdown,
  getSubjectPerformance,
  getTopStudents,
};
