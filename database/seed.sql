-- ================================================================
-- Serverless Cloud-Based Student Management and Analytics System
-- AWS Cloud Computing Project - Initial Seed Data
-- ================================================================

-- Clean existing data
TRUNCATE documents, marks, attendance, subjects, students, courses, departments, users RESTART IDENTITY CASCADE;

-- 1. Insert Initial Users (Password for all is 'Password@123' hashed with bcrypt)
-- Hash: $2b$10$epRfZG9.wK8GqPz2e0n0n.WbT9yX8dG5d6f4R1c8v3w0q7a6z5e2y
INSERT INTO users (name, email, password_hash, role) VALUES
('System Administrator', 'admin@example.com', '$2b$10$epRfZG9.wK8GqPz2e0n0n.WbT9yX8dG5d6f4R1c8v3w0q7a6z5e2y', 'ADMIN'),
('Dr. Ramesh Kumar (CSE HOD)', 'ramesh.cse@example.com', '$2b$10$epRfZG9.wK8GqPz2e0n0n.WbT9yX8dG5d6f4R1c8v3w0q7a6z5e2y', 'FACULTY'),
('Prof. Priya Sharma (ECE)', 'priya.ece@example.com', '$2b$10$epRfZG9.wK8GqPz2e0n0n.WbT9yX8dG5d6f4R1c8v3w0q7a6z5e2y', 'FACULTY'),
('Prof. Suresh Patel (Mechanical)', 'suresh.mech@example.com', '$2b$10$epRfZG9.wK8GqPz2e0n0n.WbT9yX8dG5d6f4R1c8v3w0q7a6z5e2y', 'FACULTY');

-- 2. Insert Departments
INSERT INTO departments (name, code, description) VALUES
('Computer Science and Engineering', 'CSE', 'Department of Computer Science, Cloud Computing & AI'),
('Electronics and Communication Engineering', 'ECE', 'Department of Embedded Systems and Signal Processing'),
('Electrical and Electronics Engineering', 'EEE', 'Department of Power Systems and Renewable Energy'),
('Mechanical Engineering', 'MECH', 'Department of Thermal, Robotics and Design'),
('Civil Engineering', 'CIVIL', 'Department of Structural and Environmental Engineering');

-- 3. Insert Courses
INSERT INTO courses (name, code, department_id, duration_years, total_semesters) VALUES
('B.Tech in Computer Science & Engineering', 'BT-CSE', 1, 4, 8),
('B.Tech in Artificial Intelligence & Data Science', 'BT-AIDS', 1, 4, 8),
('B.Tech in Electronics & Communication', 'BT-ECE', 2, 4, 8),
('B.Tech in Electrical & Electronics', 'BT-EEE', 3, 4, 8),
('B.Tech in Mechanical Engineering', 'BT-MECH', 4, 4, 8),
('B.Tech in Civil Engineering', 'BT-CIVIL', 5, 4, 8);

-- 4. Insert Subjects
INSERT INTO subjects (name, code, course_id, semester, credits) VALUES
('Cloud Computing Architecture', 'CS501', 1, 5, 4),
('Database Management Systems', 'CS502', 1, 5, 4),
('Data Structures and Algorithms', 'CS301', 1, 3, 4),
('Computer Networks', 'CS503', 1, 5, 3),
('Machine Learning Techniques', 'AI501', 2, 5, 4),
('Digital Signal Processing', 'EC501', 3, 5, 4),
('Microcontrollers & Embedded Systems', 'EC502', 3, 5, 3),
('Power Electronics', 'EE501', 4, 5, 4),
('Thermodynamics & Heat Transfer', 'ME501', 5, 5, 4),
('Structural Analysis & Design', 'CE501', 6, 5, 4);

-- 5. Insert Sample Students
INSERT INTO students (roll_number, name, email, phone, date_of_birth, department_id, course_id, year, semester, address, admission_date) VALUES
('CS2024001', 'Akash Kumar', 'akash.k@example.com', '9876543210', '2003-05-14', 1, 1, 3, 5, 'Anna Nagar, Chennai, TN', '2022-08-10'),
('CS2024002', 'Sneha Reddy', 'sneha.r@example.com', '9876543211', '2003-08-22', 1, 1, 3, 5, 'Hitech City, Hyderabad, TS', '2022-08-10'),
('CS2024003', 'Rahul Sharma', 'rahul.s@example.com', '9876543212', '2004-01-11', 1, 1, 3, 5, 'Koramangala, Bangalore, KA', '2022-08-10'),
('CS2024004', 'Deepak Verma', 'deepak.v@example.com', '9876543213', '2003-11-30', 1, 1, 3, 5, 'Dwarka, New Delhi, DL', '2022-08-10'),
('CS2024005', 'Ananya Iyer', 'ananya.i@example.com', '9876543214', '2003-03-19', 1, 2, 3, 5, 'T Nagar, Chennai, TN', '2022-08-10'),
('EC2024001', 'Karthik Raja', 'karthik.r@example.com', '9876543215', '2003-07-04', 2, 3, 3, 5, 'RS Puram, Coimbatore, TN', '2022-08-12'),
('EC2024002', 'Pooja Hegde', 'pooja.h@example.com', '9876543216', '2003-09-15', 2, 3, 3, 5, 'Malleshwaram, Bangalore, KA', '2022-08-12'),
('EE2024001', 'Vikas Gowda', 'vikas.g@example.com', '9876543217', '2003-04-25', 3, 4, 3, 5, 'Jayanagar, Bangalore, KA', '2022-08-14'),
('ME2024001', 'Siddharth Menon', 'siddharth.m@example.com', '9876543218', '2003-12-05', 4, 5, 3, 5, 'Kaloor, Kochi, KL', '2022-08-15'),
('CE2024001', 'Bhavana Patel', 'bhavana.p@example.com', '9876543219', '2003-02-18', 5, 6, 3, 5, 'Navrangpura, Ahmedabad, GJ', '2022-08-15');

-- 6. Insert Attendance Records (Demonstrating varying attendance percentages)
-- Akash Kumar (High Attendance: 90%+)
INSERT INTO attendance (student_id, subject_id, attendance_date, status) VALUES
(1, 1, '2026-08-01', 'PRESENT'),
(1, 1, '2026-08-02', 'PRESENT'),
(1, 1, '2026-08-03', 'PRESENT'),
(1, 1, '2026-08-04', 'PRESENT'),
(1, 1, '2026-08-05', 'PRESENT'),
(1, 2, '2026-08-01', 'PRESENT'),
(1, 2, '2026-08-02', 'PRESENT'),
(1, 2, '2026-08-03', 'LATE'),
(1, 2, '2026-08-04', 'PRESENT'),
(1, 2, '2026-08-05', 'PRESENT');

-- Sneha Reddy (Top Performer: 100%)
INSERT INTO attendance (student_id, subject_id, attendance_date, status) VALUES
(2, 1, '2026-08-01', 'PRESENT'),
(2, 1, '2026-08-02', 'PRESENT'),
(2, 1, '2026-08-03', 'PRESENT'),
(2, 1, '2026-08-04', 'PRESENT'),
(2, 1, '2026-08-05', 'PRESENT'),
(2, 2, '2026-08-01', 'PRESENT'),
(2, 2, '2026-08-02', 'PRESENT'),
(2, 2, '2026-08-03', 'PRESENT'),
(2, 2, '2026-08-04', 'PRESENT'),
(2, 2, '2026-08-05', 'PRESENT');

-- Deepak Verma (Low Attendance: Below 75% Warning Demo)
INSERT INTO attendance (student_id, subject_id, attendance_date, status) VALUES
(4, 1, '2026-08-01', 'ABSENT'),
(4, 1, '2026-08-02', 'ABSENT'),
(4, 1, '2026-08-03', 'PRESENT'),
(4, 1, '2026-08-04', 'ABSENT'),
(4, 1, '2026-08-05', 'PRESENT'),
(4, 2, '2026-08-01', 'ABSENT'),
(4, 2, '2026-08-02', 'PRESENT'),
(4, 2, '2026-08-03', 'ABSENT'),
(4, 2, '2026-08-04', 'PRESENT'),
(4, 2, '2026-08-05', 'ABSENT');

-- Other Students Sample Attendance
INSERT INTO attendance (student_id, subject_id, attendance_date, status) VALUES
(3, 1, '2026-08-01', 'PRESENT'), (3, 1, '2026-08-02', 'PRESENT'), (3, 1, '2026-08-03', 'ABSENT'), (3, 1, '2026-08-04', 'PRESENT'), (3, 1, '2026-08-05', 'PRESENT'),
(5, 5, '2026-08-01', 'PRESENT'), (5, 5, '2026-08-02', 'PRESENT'), (5, 5, '2026-08-03', 'PRESENT'), (5, 5, '2026-08-04', 'PRESENT'), (5, 5, '2026-08-05', 'PRESENT'),
(6, 6, '2026-08-01', 'PRESENT'), (6, 6, '2026-08-02', 'PRESENT'), (6, 6, '2026-08-03', 'PRESENT'), (6, 6, '2026-08-04', 'PRESENT'), (6, 6, '2026-08-05', 'LATE'),
(7, 6, '2026-08-01', 'PRESENT'), (7, 6, '2026-08-02', 'ABSENT'), (7, 6, '2026-08-03', 'PRESENT'), (7, 6, '2026-08-04', 'PRESENT'), (7, 6, '2026-08-05', 'PRESENT'),
(8, 8, '2026-08-01', 'PRESENT'), (8, 8, '2026-08-02', 'PRESENT'), (8, 8, '2026-08-03', 'PRESENT'), (8, 8, '2026-08-04', 'PRESENT'), (8, 8, '2026-08-05', 'PRESENT'),
(9, 9, '2026-08-01', 'PRESENT'), (9, 9, '2026-08-02', 'PRESENT'), (9, 9, '2026-08-03', 'ABSENT'), (9, 9, '2026-08-04', 'PRESENT'), (9, 9, '2026-08-05', 'PRESENT'),
(10, 10, '2026-08-01', 'PRESENT'), (10, 10, '2026-08-02', 'PRESENT'), (10, 10, '2026-08-03', 'PRESENT'), (10, 10, '2026-08-04', 'PRESENT'), (10, 10, '2026-08-05', 'PRESENT');

-- 7. Insert Marks Records
INSERT INTO marks (student_id, subject_id, exam_type, marks, max_marks, semester) VALUES
-- Akash Kumar (High Grades)
(1, 1, 'INTERNAL_1', 46.50, 50.00, 5),
(1, 1, 'INTERNAL_2', 48.00, 50.00, 5),
(1, 1, 'SEMESTER_FINAL', 92.00, 100.00, 5),
(1, 2, 'INTERNAL_1', 44.00, 50.00, 5),
(1, 2, 'INTERNAL_2', 45.50, 50.00, 5),
(1, 2, 'SEMESTER_FINAL', 88.50, 100.00, 5),

-- Sneha Reddy (Top Performer: ~95%)
(2, 1, 'INTERNAL_1', 49.00, 50.00, 5),
(2, 1, 'INTERNAL_2', 49.50, 50.00, 5),
(2, 1, 'SEMESTER_FINAL', 96.00, 100.00, 5),
(2, 2, 'INTERNAL_1', 47.00, 50.00, 5),
(2, 2, 'INTERNAL_2', 48.50, 50.00, 5),
(2, 2, 'SEMESTER_FINAL', 94.00, 100.00, 5),

-- Rahul Sharma (Average: ~75%)
(3, 1, 'INTERNAL_1', 38.00, 50.00, 5),
(3, 1, 'INTERNAL_2', 36.50, 50.00, 5),
(3, 1, 'SEMESTER_FINAL', 74.00, 100.00, 5),

-- Deepak Verma (Low Marks: ~55%)
(4, 1, 'INTERNAL_1', 26.00, 50.00, 5),
(4, 1, 'INTERNAL_2', 28.00, 50.00, 5),
(4, 1, 'SEMESTER_FINAL', 56.00, 100.00, 5),

-- Ananya Iyer
(5, 5, 'INTERNAL_1', 45.00, 50.00, 5),
(5, 5, 'SEMESTER_FINAL', 90.00, 100.00, 5),

-- Other Departments
(6, 6, 'SEMESTER_FINAL', 86.00, 100.00, 5),
(7, 6, 'SEMESTER_FINAL', 82.50, 100.00, 5),
(8, 8, 'SEMESTER_FINAL', 79.00, 100.00, 5),
(9, 9, 'SEMESTER_FINAL', 84.00, 100.00, 5),
(10, 10, 'SEMESTER_FINAL', 88.00, 100.00, 5);

-- 8. Sample S3 Documents Metadata
INSERT INTO documents (student_id, file_name, s3_key, document_type, file_size, mime_type) VALUES
(1, 'akash_kumar_id_card.pdf', 'students/1/documents/akash_kumar_id_card.pdf', 'ID_PROOF', 245800, 'application/pdf'),
(1, 'aws_cloud_practitioner_cert.pdf', 'students/1/documents/aws_cloud_practitioner_cert.pdf', 'CERTIFICATE', 512000, 'application/pdf'),
(2, 'sneha_reddy_marksheet_sem4.pdf', 'students/2/documents/sneha_reddy_marksheet_sem4.pdf', 'MARKSHEET', 320400, 'application/pdf');
