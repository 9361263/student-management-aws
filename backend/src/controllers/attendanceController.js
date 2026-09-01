const { query } = require('../config/db');

/**
 * Record attendance for a single student or batch of students
 */
const recordAttendance = async (req, res) => {
  try {
    const { records, studentId, subjectId, attendanceDate, status, remarks } = req.body;

    // Batch insertion support
    if (records && Array.isArray(records) && records.length > 0) {
      const results = [];
      for (const rec of records) {
        const sql = `
          INSERT INTO attendance (student_id, subject_id, attendance_date, status, remarks)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (student_id, subject_id, attendance_date)
          DO UPDATE SET status = EXCLUDED.status, remarks = EXCLUDED.remarks, created_at = CURRENT_TIMESTAMP
          RETURNING *
        `;
        const r = await query(sql, [
          rec.studentId,
          rec.subjectId,
          rec.attendanceDate,
          rec.status.toUpperCase(),
          rec.remarks || null,
        ]);
        results.push(r.rows[0]);
      }

      return res.status(200).json({
        success: true,
        message: `Batch attendance processed: ${results.length} records updated in AWS RDS.`,
        records: results,
      });
    }

    // Single record insertion
    if (!studentId || !subjectId || !attendanceDate || !status) {
      return res.status(400).json({
        success: false,
        message: 'studentId, subjectId, attendanceDate, and status are required.',
      });
    }

    const singleSql = `
      INSERT INTO attendance (student_id, subject_id, attendance_date, status, remarks)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (student_id, subject_id, attendance_date)
      DO UPDATE SET status = EXCLUDED.status, remarks = EXCLUDED.remarks, created_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const result = await query(singleSql, [
      parseInt(studentId, 10),
      parseInt(subjectId, 10),
      attendanceDate,
      status.toUpperCase(),
      remarks || null,
    ]);

    return res.status(200).json({
      success: true,
      message: 'Attendance recorded successfully in database.',
      record: result.rows[0],
    });
  } catch (error) {
    console.error('Attendance recording error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to record attendance in database.',
    });
  }
};

/**
 * Get attendance statistics and records for a student
 */
const getStudentAttendance = async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId, 10);

    const sql = `
      SELECT 
        a.id, a.attendance_date, a.status, a.remarks,
        sub.id AS subject_id, sub.name AS subject_name, sub.code AS subject_code
      FROM attendance a
      JOIN subjects sub ON a.subject_id = sub.id
      WHERE a.student_id = $1
      ORDER BY a.attendance_date DESC
    `;

    const result = await query(sql, [studentId]);
    const rows = result.rows;

    const totalClasses = rows.length;
    const presentClasses = rows.filter((r) => r.status === 'PRESENT' || r.status === 'LATE').length;
    const absentClasses = rows.filter((r) => r.status === 'ABSENT').length;
    const attendancePercentage = totalClasses > 0 ? ((presentClasses / totalClasses) * 100).toFixed(1) : '100.0';

    return res.status(200).json({
      success: true,
      summary: {
        totalClasses,
        presentClasses,
        absentClasses,
        attendancePercentage: parseFloat(attendancePercentage),
        isLowAttendance: parseFloat(attendancePercentage) < 75.0,
      },
      records: rows,
    });
  } catch (error) {
    console.error('Get student attendance error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance details from database.',
    });
  }
};

/**
 * Get summary of students with attendance below 75% threshold
 */
const getLowAttendanceStudents = async (req, res) => {
  try {
    const sql = `
      SELECT 
        s.id, s.roll_number, s.name, s.email, d.name AS department_name,
        COUNT(a.id) AS total_classes,
        COUNT(CASE WHEN a.status = 'PRESENT' OR a.status = 'LATE' THEN 1 END) AS attended_classes,
        ROUND(
          (COUNT(CASE WHEN a.status = 'PRESENT' OR a.status = 'LATE' THEN 1 END)::numeric / 
           NULLIF(COUNT(a.id), 0)::numeric) * 100, 1
        ) AS attendance_percentage
      FROM students s
      LEFT JOIN departments d ON s.department_id = d.id
      JOIN attendance a ON s.id = a.student_id
      GROUP BY s.id, d.name
      HAVING (
        COUNT(CASE WHEN a.status = 'PRESENT' OR a.status = 'LATE' THEN 1 END)::numeric / 
        NULLIF(COUNT(a.id), 0)::numeric
      ) * 100 < 75.0
      ORDER BY attendance_percentage ASC
    `;

    const result = await query(sql);
    return res.status(200).json({
      success: true,
      threshold: 75.0,
      count: result.rows.length,
      students: result.rows,
    });
  } catch (error) {
    console.error('Low attendance report error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate low attendance report from database.',
    });
  }
};

module.exports = {
  recordAttendance,
  getStudentAttendance,
  getLowAttendanceStudents,
};
