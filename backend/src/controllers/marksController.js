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

// In-Memory Dynamic Marks Repository for Session / Seed Sync
let SAMPLE_MARKS = [
  // Akash Kumar (Student 1)
  { id: 1, student_id: 1, subject_id: 1, subject_name: 'Cloud Computing Architecture', subject_code: 'CS501', exam_type: 'INTERNAL_1', marks: 46.5, max_marks: 50, semester: 5, credits: 4 },
  { id: 2, student_id: 1, subject_id: 1, subject_name: 'Cloud Computing Architecture', subject_code: 'CS501', exam_type: 'INTERNAL_2', marks: 48.0, max_marks: 50, semester: 5, credits: 4 },
  { id: 3, student_id: 1, subject_id: 2, subject_name: 'Database Management Systems', subject_code: 'CS502', exam_type: 'INTERNAL_1', marks: 44.0, max_marks: 50, semester: 5, credits: 4 },
  { id: 4, student_id: 1, subject_id: 4, subject_name: 'Computer Networks', subject_code: 'CS503', exam_type: 'INTERNAL_1', marks: 42.0, max_marks: 50, semester: 5, credits: 3 },

  // Sneha Reddy (Student 2 - Top Performer)
  { id: 5, student_id: 2, subject_id: 1, subject_name: 'Cloud Computing Architecture', subject_code: 'CS501', exam_type: 'INTERNAL_1', marks: 49.0, max_marks: 50, semester: 5, credits: 4 },
  { id: 6, student_id: 2, subject_id: 2, subject_name: 'Database Management Systems', subject_code: 'CS502', exam_type: 'INTERNAL_1', marks: 47.0, max_marks: 50, semester: 5, credits: 4 },
  { id: 7, student_id: 2, subject_id: 5, subject_name: 'Machine Learning Techniques', subject_code: 'AI501', exam_type: 'INTERNAL_1', marks: 48.5, max_marks: 50, semester: 5, credits: 4 },

  // Rahul Sharma (Student 3)
  { id: 8, student_id: 3, subject_id: 1, subject_name: 'Cloud Computing Architecture', subject_code: 'CS501', exam_type: 'INTERNAL_1', marks: 38.0, max_marks: 50, semester: 5, credits: 4 },
  { id: 9, student_id: 3, subject_id: 2, subject_name: 'Database Management Systems', subject_code: 'CS502', exam_type: 'INTERNAL_1', marks: 36.5, max_marks: 50, semester: 5, credits: 4 },

  // Deepak Verma (Student 4)
  { id: 10, student_id: 4, subject_id: 1, subject_name: 'Cloud Computing Architecture', subject_code: 'CS501', exam_type: 'INTERNAL_1', marks: 26.0, max_marks: 50, semester: 5, credits: 4 },
  { id: 11, student_id: 4, subject_id: 2, subject_name: 'Database Management Systems', subject_code: 'CS502', exam_type: 'INTERNAL_1', marks: 28.0, max_marks: 50, semester: 5, credits: 4 },

  // Ananya Iyer (Student 5)
  { id: 12, student_id: 5, subject_id: 5, subject_name: 'Machine Learning Techniques', subject_code: 'AI501', exam_type: 'INTERNAL_1', marks: 45.0, max_marks: 50, semester: 5, credits: 4 },

  // Karthik Raja (Student 6)
  { id: 13, student_id: 6, subject_id: 6, subject_name: 'Digital Signal Processing', subject_code: 'EC501', exam_type: 'INTERNAL_1', marks: 43.0, max_marks: 50, semester: 5, credits: 4 },

  // Pooja Hegde (Student 7)
  { id: 14, student_id: 7, subject_id: 6, subject_name: 'Digital Signal Processing', subject_code: 'EC501', exam_type: 'INTERNAL_1', marks: 41.5, max_marks: 50, semester: 5, credits: 4 },

  // Vikas Gowda (Student 8)
  { id: 15, student_id: 8, subject_id: 8, subject_name: 'Power Electronics', subject_code: 'EE501', exam_type: 'INTERNAL_1', marks: 39.5, max_marks: 50, semester: 5, credits: 4 },

  // Siddharth Menon (Student 9)
  { id: 16, student_id: 9, subject_id: 9, subject_name: 'Thermodynamics & Heat Transfer', subject_code: 'ME501', exam_type: 'INTERNAL_1', marks: 42.0, max_marks: 50, semester: 5, credits: 4 },

  // Bhavana Patel (Student 10)
  { id: 17, student_id: 10, subject_id: 10, subject_name: 'Structural Analysis & Design', subject_code: 'CE501', exam_type: 'INTERNAL_1', marks: 44.0, max_marks: 50, semester: 5, credits: 4 },
];

/**
 * Get Marks & CGPA Summary for ALL Students
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

    try {
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
    } catch (dbErr) {
      // Calculate dynamic summary from SAMPLE_MARKS for fallback
      const studentMap = {
        1: { id: 1, roll_number: 'CS2024001', name: 'Akash Kumar', department_code: 'CSE', year: 3, semester: 5 },
        2: { id: 2, roll_number: 'CS2024002', name: 'Sneha Reddy', department_code: 'CSE', year: 3, semester: 5 },
        3: { id: 3, roll_number: 'CS2024003', name: 'Rahul Sharma', department_code: 'CSE', year: 3, semester: 5 },
        4: { id: 4, roll_number: 'CS2024004', name: 'Deepak Verma', department_code: 'CSE', year: 3, semester: 5 },
        5: { id: 5, roll_number: 'CS2024005', name: 'Ananya Iyer', department_code: 'CSE', year: 3, semester: 5 },
        6: { id: 6, roll_number: 'EC2024001', name: 'Karthik Raja', department_code: 'ECE', year: 3, semester: 5 },
        7: { id: 7, roll_number: 'EC2024002', name: 'Pooja Hegde', department_code: 'ECE', year: 3, semester: 5 },
        8: { id: 8, roll_number: 'EE2024001', name: 'Vikas Gowda', department_code: 'EEE', year: 3, semester: 5 },
        9: { id: 9, roll_number: 'ME2024001', name: 'Siddharth Menon', department_code: 'MECH', year: 3, semester: 5 },
        10: { id: 10, roll_number: 'CE2024001', name: 'Bhavana Patel', department_code: 'CIVIL', year: 3, semester: 5 },
      };

      const summaryList = Object.values(studentMap).map((st) => {
        const studentMarks = SAMPLE_MARKS.filter((m) => m.student_id === st.id);
        const totalExams = studentMarks.length;

        let totalEarned = 0;
        let totalMax = 0;
        studentMarks.forEach((m) => {
          totalEarned += m.marks;
          totalMax += m.max_marks;
        });

        const avgPct = totalMax > 0 ? (totalEarned / totalMax) * 100 : 0;
        const cgpa = (avgPct / 10).toFixed(2);
        const gradeInfo = calculateGrade(avgPct);

        return {
          ...st,
          total_exams: totalExams,
          average_percentage: parseFloat(avgPct.toFixed(1)),
          cgpa: parseFloat(cgpa),
          grade: gradeInfo.grade,
          status: totalExams === 0 ? 'PENDING' : gradeInfo.status,
        };
      });

      let filteredList = summaryList;
      if (search) {
        const q = search.toLowerCase();
        filteredList = filteredList.filter((s) => s.name.toLowerCase().includes(q) || s.roll_number.toLowerCase().includes(q));
      }

      return res.status(200).json({
        success: true,
        count: filteredList.length,
        students: filteredList,
      });
    }
  } catch (error) {
    console.error('Error fetching all students marks summary:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch marks summary.',
    });
  }
};

/**
 * Add or Update Marks for a Student
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

    try {
      const result = await query(sql, [sId, subId, examType.toUpperCase(), numMarks, numMax, parseInt(semester, 10)]);

      const percentage = (numMarks / numMax) * 100;
      const gradeInfo = calculateGrade(percentage);

      return res.status(200).json({
        success: true,
        message: 'Marks recorded successfully.',
        record: {
          ...result.rows[0],
          percentage: parseFloat(percentage.toFixed(2)),
          ...gradeInfo,
        },
      });
    } catch (dbErr) {
      const subjectNames = {
        1: 'Cloud Computing Architecture',
        2: 'Database Management Systems',
        3: 'Data Structures and Algorithms',
        4: 'Computer Networks',
        5: 'Machine Learning Techniques',
        6: 'Digital Signal Processing',
        7: 'Microcontrollers & Embedded Systems',
        8: 'Power Electronics',
        9: 'Thermodynamics & Heat Transfer',
        10: 'Structural Analysis & Design',
      };

      const subjectCodes = {
        1: 'CS501', 2: 'CS502', 3: 'CS301', 4: 'CS503', 5: 'AI501',
        6: 'EC501', 7: 'EC502', 8: 'EE501', 9: 'ME501', 10: 'CE501',
      };

      const newRecord = {
        id: Date.now(),
        student_id: sId,
        subject_id: subId,
        subject_name: subjectNames[subId] || 'Selected Subject',
        subject_code: subjectCodes[subId] || `SUB${subId}`,
        exam_type: examType.toUpperCase(),
        marks: numMarks,
        max_marks: numMax,
        semester: parseInt(semester, 10),
        credits: 4,
      };

      // Push or replace in in-memory repository
      const existingIdx = SAMPLE_MARKS.findIndex((m) => m.student_id === sId && m.subject_id === subId && m.exam_type === examType.toUpperCase());
      if (existingIdx !== -1) {
        SAMPLE_MARKS[existingIdx] = newRecord;
      } else {
        SAMPLE_MARKS.push(newRecord);
      }

      const percentage = (numMarks / numMax) * 100;
      return res.status(200).json({
        success: true,
        message: 'Marks recorded successfully.',
        record: {
          ...newRecord,
          percentage: parseFloat(percentage.toFixed(2)),
          ...calculateGrade(percentage),
        },
      });
    }
  } catch (error) {
    console.error('Add marks error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to record marks.',
    });
  }
};

/**
 * Edit an Existing Mark Entry by Mark ID
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

    try {
      const result = await query(sql, [numMarks, numMax, examType ? examType.toUpperCase() : null, semester ? parseInt(semester, 10) : null, markId]);
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Mark record not found.' });
      }

      const percentage = (numMarks / numMax) * 100;
      return res.status(200).json({
        success: true,
        message: 'Marks updated successfully.',
        record: {
          ...result.rows[0],
          percentage: parseFloat(percentage.toFixed(2)),
          ...calculateGrade(percentage),
        },
      });
    } catch (dbErr) {
      const idx = SAMPLE_MARKS.findIndex((m) => m.id === markId);
      if (idx !== -1) {
        SAMPLE_MARKS[idx].marks = numMarks;
        SAMPLE_MARKS[idx].max_marks = numMax;
        if (examType) SAMPLE_MARKS[idx].exam_type = examType.toUpperCase();
        if (semester) SAMPLE_MARKS[idx].semester = parseInt(semester, 10);
      }

      const percentage = (numMarks / numMax) * 100;
      return res.status(200).json({
        success: true,
        message: 'Marks updated successfully.',
        record: {
          id: markId,
          marks: numMarks,
          max_marks: numMax,
          percentage: parseFloat(percentage.toFixed(2)),
          ...calculateGrade(percentage),
        },
      });
    }
  } catch (error) {
    console.error('Update marks error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update mark record.',
    });
  }
};

/**
 * Get Detailed Marks & CGPA for a Single Student
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

    try {
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
    } catch (dbErr) {
      // Dynamic fallback computation per student
      const studentRecords = SAMPLE_MARKS.filter((m) => m.student_id === studentId);

      let totalEarned = 0;
      let totalMax = 0;
      let totalCredits = 0;
      let weightedPoints = 0;

      const recordsWithGrades = studentRecords.map((r) => {
        const pct = (r.marks / r.max_marks) * 100;
        const gradeInfo = calculateGrade(pct);
        const credits = r.credits || 4;

        totalEarned += r.marks;
        totalMax += r.max_marks;
        totalCredits += credits;
        weightedPoints += gradeInfo.point * credits;

        return {
          ...r,
          percentage: parseFloat(pct.toFixed(1)),
          ...gradeInfo,
        };
      });

      const overallPercentage = totalMax > 0 ? (totalEarned / totalMax) * 100 : 0;
      const gpa = totalCredits > 0 ? (weightedPoints / totalCredits) : (overallPercentage / 10);

      return res.status(200).json({
        success: true,
        summary: {
          totalExams: studentRecords.length,
          overallPercentage: parseFloat(overallPercentage.toFixed(1)),
          gpa: parseFloat(gpa.toFixed(2)),
          overallGrade: calculateGrade(overallPercentage).grade,
          isPassed: overallPercentage >= 40,
        },
        records: recordsWithGrades,
      });
    }
  } catch (error) {
    console.error('Get student marks error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve marks details.',
    });
  }
};

/**
 * Delete Mark Record
 */
const deleteMarks = async (req, res) => {
  try {
    const markId = parseInt(req.params.id, 10);
    try {
      await query('DELETE FROM marks WHERE id = $1', [markId]);
    } catch (dbErr) {
      const idx = SAMPLE_MARKS.findIndex((m) => m.id === markId);
      if (idx !== -1) {
        SAMPLE_MARKS.splice(idx, 1);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Mark record deleted successfully.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete mark record.',
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
