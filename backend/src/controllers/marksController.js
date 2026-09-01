const { query } = require('../config/db');

// Helper to convert percentage to letter grade & Grade Point
const calculateGrade = (percentage) => {
  if (percentage >= 90) return { grade: 'O', point: 10, status: 'PASS' };
  if (percentage >= 80) return { grade: 'A+', point: 9, status: 'PASS' };
  if (percentage >= 70) return { grade: 'A', point: 8, status: 'PASS' };
  if (percentage >= 60) return { grade: 'B+', point: 7, status: 'PASS' };
  if (percentage >= 50) return { grade: 'B', point: 6, status: 'PASS' };
  if (percentage >= 40) return { grade: 'C', point: 5, status: 'PASS' };
  return { grade: 'F', point: 0, status: 'FAIL' };
};

/**
 * Get Marks & CGPA Summary for ALL Students directly from RDS PostgreSQL
 */
const getAllStudentsMarksSummary = async (req, res) => {
  try {
    const { departmentId, search } = req.query;

    let sql = `
      SELECT 
        s.id, s.roll_number, s.name, s.email, s.year, s.semester,
        d.id AS department_id, d.name AS department_name, d.code AS department_code,
        COUNT(m.id) AS total_exams,
        COALESCE(SUM(m.marks), 0) AS total_earned,
        COALESCE(SUM(m.max_marks), 0) AS total_max,
        COALESCE(ROUND(AVG((m.marks / NULLIF(m.max_marks, 0)) * 100), 1), 0) AS average_percentage
      FROM students s
      LEFT JOIN departments d ON s.department_id = d.id
      LEFT JOIN marks m ON s.id = m.student_id
      WHERE 1=1
    `;

    const params = [];
    let idx = 1;

    if (search) {
      sql += ` AND (s.name ILIKE $${idx} OR s.roll_number ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }

    if (departmentId) {
      sql += ` AND s.department_id = $${idx}`;
      params.push(parseInt(departmentId, 10));
      idx++;
    }

    sql += `
      GROUP BY s.id, d.id, d.name, d.code
      ORDER BY s.id ASC
    `;

    const result = await query(sql, params);
    const studentsSummary = result.rows.map((row) => {
      const avgPct = parseFloat(row.average_percentage || 0);
      const cgpa = (avgPct / 10).toFixed(2);
      const gradeInfo = calculateGrade(avgPct);

      return {
        ...row,
        total_exams: parseInt(row.total_exams, 10),
        average_percentage: avgPct,
        cgpa: parseFloat(cgpa),
        grade: gradeInfo.grade,
        status: row.total_exams === 0 ? 'PENDING' : gradeInfo.status,
      };
    });

    return res.status(200).json({
      success: true,
      count: studentsSummary.length,
      students: studentsSummary,
    });
  } catch (error) {
    console.error('Error fetching all students marks summary:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch marks summary from database.',
    });
  }
};

/**
 * Add or Update Marks for a Student in RDS PostgreSQL
 */
const addOrUpdateMarks = async (req, res) => {
  try {
    const { studentId, subjectId, examType, marks, maxMarks = 100, semester } = req.body;

    if (!studentId || !subjectId || !examType || marks === undefined || !semester) {
      return res.status(400).json({
        success: false,
        message: 'studentId, subjectId, examType, marks, and semester are required.',
      });
    }

    const numMarks = parseFloat(marks);
    const numMax = parseFloat(maxMarks);
    const sId = parseInt(studentId, 10);
    const subId = parseInt(subjectId, 10);

    if (numMarks < 0 || numMarks > numMax) {
      return res.status(400).json({
        success: false,
        message: `Marks (${numMarks}) cannot exceed max marks (${numMax}).`,
      });
    }

    const sql = `
      INSERT INTO marks (student_id, subject_id, exam_type, marks, max_marks, semester)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (student_id, subject_id, exam_type, semester)
      DO UPDATE SET marks = EXCLUDED.marks, max_marks = EXCLUDED.max_marks, created_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const result = await query(sql, [sId, subId, examType.toUpperCase(), numMarks, numMax, parseInt(semester, 10)]);
    const percentage = (numMarks / numMax) * 100;
    const gradeInfo = calculateGrade(percentage);

    return res.status(200).json({
      success: true,
      message: 'Marks recorded successfully in AWS RDS PostgreSQL.',
      record: {
        ...result.rows[0],
        percentage: parseFloat(percentage.toFixed(2)),
        ...gradeInfo,
      },
    });
  } catch (error) {
    console.error('Add marks error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to record marks in database.',
    });
  }
};

/**
 * Edit an Existing Mark Entry by Mark ID in RDS PostgreSQL
 */
const updateMarksById = async (req, res) => {
  try {
    const markId = parseInt(req.params.id, 10);
    const { marks, maxMarks = 100, examType, semester } = req.body;

    const numMarks = parseFloat(marks);
    const numMax = parseFloat(maxMarks);

    if (numMarks < 0 || numMarks > numMax) {
      return res.status(400).json({
        success: false,
        message: `Marks (${numMarks}) cannot exceed max marks (${numMax}).`,
      });
    }

    const sql = `
      UPDATE marks 
      SET 
        marks = $1,
        max_marks = $2,
        exam_type = COALESCE($3, exam_type),
        semester = COALESCE($4, semester),
        created_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `;

    const result = await query(sql, [numMarks, numMax, examType ? examType.toUpperCase() : null, semester ? parseInt(semester, 10) : null, markId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Mark record not found in database.' });
    }

    const percentage = (numMarks / numMax) * 100;
    return res.status(200).json({
      success: true,
      message: 'Marks updated successfully in AWS RDS.',
      record: {
        ...result.rows[0],
        percentage: parseFloat(percentage.toFixed(2)),
        ...calculateGrade(percentage),
      },
    });
  } catch (error) {
    console.error('Update marks error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update mark record in database.',
    });
  }
};

/**
 * Get Detailed Marks & CGPA for a Single Student from RDS PostgreSQL
 */
const getStudentMarks = async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId, 10);

    const sql = `
      SELECT 
        m.id, m.exam_type, m.marks, m.max_marks, m.semester, m.created_at,
        sub.id AS subject_id, sub.name AS subject_name, sub.code AS subject_code, sub.credits
      FROM marks m
      JOIN subjects sub ON m.subject_id = sub.id
      WHERE m.student_id = $1
      ORDER BY m.semester DESC, sub.name ASC
    `;

    const result = await query(sql, [studentId]);
    const rows = result.rows;

    let totalEarned = 0;
    let totalMax = 0;
    let totalCredits = 0;
    let weightedPoints = 0;

    const recordsWithGrades = rows.map((r) => {
      const pct = (parseFloat(r.marks) / parseFloat(r.max_marks)) * 100;
      const gradeInfo = calculateGrade(pct);
      const credits = r.credits || 3;

      totalEarned += parseFloat(r.marks);
      totalMax += parseFloat(r.max_marks);
      totalCredits += credits;
      weightedPoints += gradeInfo.point * credits;

      return {
        ...r,
        percentage: parseFloat(pct.toFixed(1)),
        ...gradeInfo,
      };
    });

    const overallPercentage = totalMax > 0 ? (totalEarned / totalMax) * 100 : 0;
    const gpa = totalCredits > 0 ? weightedPoints / totalCredits : (overallPercentage / 10);

    return res.status(200).json({
      success: true,
      summary: {
        totalExams: rows.length,
        overallPercentage: parseFloat(overallPercentage.toFixed(1)),
        gpa: parseFloat(gpa.toFixed(2)),
        overallGrade: calculateGrade(overallPercentage).grade,
        isPassed: overallPercentage >= 40,
      },
      records: recordsWithGrades,
    });
  } catch (error) {
    console.error('Get student marks error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve marks details from database.',
    });
  }
};

/**
 * Delete Mark Record from RDS PostgreSQL
 */
const deleteMarks = async (req, res) => {
  try {
    const markId = parseInt(req.params.id, 10);
    const result = await query('DELETE FROM marks WHERE id = $1 RETURNING id', [markId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Mark record not found in database.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Mark record deleted successfully from database.',
    });
  } catch (error) {
    console.error('Delete mark error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete mark record from database.',
    });
  }
};

module.exports = {
  getAllStudentsMarksSummary,
  addOrUpdateMarks,
  updateMarksById,
  getStudentMarks,
  deleteMarks,
};
