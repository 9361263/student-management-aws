const { query } = require('../config/db');

const getAllStudents = async (req, res) => {
  try {
    const { search, departmentId, courseId, year, semester } = req.query;

    let sql = `
      SELECT 
        s.id, s.roll_number, s.name, s.email, s.phone, s.date_of_birth,
        s.year, s.semester, s.address, s.admission_date, s.profile_image_url, s.status,
        s.department_id, d.name AS department_name, d.code AS department_code,
        s.course_id, c.name AS course_name, c.code AS course_code,
        COALESCE(
          ROUND(
            (COUNT(CASE WHEN a.status = 'PRESENT' OR a.status = 'LATE' THEN 1 END)::numeric / 
             NULLIF(COUNT(a.id), 0)::numeric) * 100, 1
          ), 0
        ) AS attendance_pct,
        COALESCE(
          ROUND(AVG((m.marks / NULLIF(m.max_marks, 0)) * 100), 1), 0
        ) AS average_marks
      FROM students s
      LEFT JOIN departments d ON s.department_id = d.id
      LEFT JOIN courses c ON s.course_id = c.id
      LEFT JOIN attendance a ON s.id = a.student_id
      LEFT JOIN marks m ON s.id = m.student_id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    if (search) {
      sql += ` AND (s.name ILIKE $${paramIndex} OR s.roll_number ILIKE $${paramIndex} OR s.email ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (departmentId) {
      sql += ` AND s.department_id = $${paramIndex}`;
      params.push(parseInt(departmentId, 10));
      paramIndex++;
    }

    if (courseId) {
      sql += ` AND s.course_id = $${paramIndex}`;
      params.push(parseInt(courseId, 10));
      paramIndex++;
    }

    if (year) {
      sql += ` AND s.year = $${paramIndex}`;
      params.push(parseInt(year, 10));
      paramIndex++;
    }

    if (semester) {
      sql += ` AND s.semester = $${paramIndex}`;
      params.push(parseInt(semester, 10));
      paramIndex++;
    }

    sql += `
      GROUP BY s.id, d.name, d.code, c.name, c.code
      ORDER BY s.id ASC
    `;

    const result = await query(sql, params);
    return res.status(200).json({
      success: true,
      count: result.rows.length,
      students: result.rows,
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch students list from database.',
    });
  }
};

const getStudentById = async (req, res) => {
  try {
    const studentId = parseInt(req.params.id, 10);

    const studentSql = `
      SELECT 
        s.*,
        d.name AS department_name, d.code AS department_code,
        c.name AS course_name, c.code AS course_code
      FROM students s
      LEFT JOIN departments d ON s.department_id = d.id
      LEFT JOIN courses c ON s.course_id = c.id
      WHERE s.id = $1
    `;

    const studentResult = await query(studentSql, [studentId]);
    if (studentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.',
      });
    }

    const student = studentResult.rows[0];

    // Fetch attendance records
    const attResult = await query(
      `SELECT a.*, sub.name AS subject_name, sub.code AS subject_code 
       FROM attendance a 
       JOIN subjects sub ON a.subject_id = sub.id 
       WHERE a.student_id = $1 
       ORDER BY a.attendance_date DESC LIMIT 30`,
      [studentId]
    );

    // Fetch marks records
    const marksResult = await query(
      `SELECT m.*, sub.name AS subject_name, sub.code AS subject_code 
       FROM marks m 
       JOIN subjects sub ON m.subject_id = sub.id 
       WHERE m.student_id = $1 
       ORDER BY m.semester DESC, m.created_at DESC`,
      [studentId]
    );

    // Fetch documents metadata
    const docsResult = await query(
      `SELECT * FROM documents WHERE student_id = $1 ORDER BY uploaded_at DESC`,
      [studentId]
    );

    return res.status(200).json({
      success: true,
      student: {
        ...student,
        attendance: attResult.rows,
        marks: marksResult.rows,
        documents: docsResult.rows,
      },
    });
  } catch (error) {
    console.error('Error fetching student details:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve student details from database.',
    });
  }
};

const createStudent = async (req, res) => {
  try {
    const {
      rollNumber,
      name,
      email,
      phone,
      dateOfBirth,
      departmentId,
      courseId,
      year,
      semester,
      address,
    } = req.body;

    if (!rollNumber || !name || !email || !departmentId || !year || !semester) {
      return res.status(400).json({
        success: false,
        message: 'Roll Number, Name, Email, Department, Year, and Semester are required.',
      });
    }

    const sql = `
      INSERT INTO students (
        roll_number, name, email, phone, date_of_birth, 
        department_id, course_id, year, semester, address
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const result = await query(sql, [
      rollNumber.trim().toUpperCase(),
      name.trim(),
      email.trim().toLowerCase(),
      phone || null,
      dateOfBirth || null,
      parseInt(departmentId, 10),
      courseId ? parseInt(courseId, 10) : null,
      parseInt(year, 10),
      parseInt(semester, 10),
      address || null,
    ]);

    return res.status(201).json({
      success: true,
      message: 'Student registered successfully in AWS RDS PostgreSQL.',
      student: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating student:', error);
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Student with this Roll Number or Email already exists.',
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to create student in database.',
    });
  }
};

const updateStudent = async (req, res) => {
  try {
    const studentId = parseInt(req.params.id, 10);
    const {
      name,
      email,
      phone,
      dateOfBirth,
      departmentId,
      courseId,
      year,
      semester,
      address,
      status,
    } = req.body;

    const sql = `
      UPDATE students 
      SET 
        name = COALESCE($1, name),
        email = COALESCE($2, email),
        phone = COALESCE($3, phone),
        date_of_birth = COALESCE($4, date_of_birth),
        department_id = COALESCE($5, department_id),
        course_id = COALESCE($6, course_id),
        year = COALESCE($7, year),
        semester = COALESCE($8, semester),
        address = COALESCE($9, address),
        status = COALESCE($10, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
      RETURNING *
    `;

    const result = await query(sql, [
      name,
      email,
      phone,
      dateOfBirth,
      departmentId ? parseInt(departmentId, 10) : null,
      courseId ? parseInt(courseId, 10) : null,
      year ? parseInt(year, 10) : null,
      semester ? parseInt(semester, 10) : null,
      address,
      status,
      studentId,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Student updated successfully.',
      student: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating student:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update student details.',
    });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const studentId = parseInt(req.params.id, 10);

    const result = await query('DELETE FROM students WHERE id = $1 RETURNING id', [studentId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }
    return res.status(200).json({
      success: true,
      message: 'Student record deleted successfully from database.',
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete student record.',
    });
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
};
