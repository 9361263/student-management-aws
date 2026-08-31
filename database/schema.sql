-- ================================================================
-- Serverless Cloud-Based Student Management and Analytics System
-- AWS Cloud Computing Project - PostgreSQL Database Schema
-- ================================================================

-- Drop tables if they exist (clean slate)
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS marks CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users Table (Admin and Faculty Authentication)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'FACULTY' CHECK (role IN ('ADMIN', 'FACULTY')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Departments Table
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Courses Table
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    duration_years INTEGER DEFAULT 4,
    total_semesters INTEGER DEFAULT 8,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Students Table
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    roll_number VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
    course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL,
    year INTEGER NOT NULL CHECK (year BETWEEN 1 AND 5),
    semester INTEGER NOT NULL CHECK (semester BETWEEN 1 AND 10),
    address TEXT,
    admission_date DATE DEFAULT CURRENT_DATE,
    profile_image_url TEXT,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'GRADUATED', 'SUSPENDED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Subjects Table
CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    semester INTEGER NOT NULL CHECK (semester BETWEEN 1 AND 10),
    credits INTEGER DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Attendance Table
CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('PRESENT', 'ABSENT', 'LATE')),
    remarks VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_student_subject_date UNIQUE (student_id, subject_id, attendance_date)
);

-- 7. Marks Table
CREATE TABLE marks (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    exam_type VARCHAR(50) NOT NULL CHECK (exam_type IN ('INTERNAL_1', 'INTERNAL_2', 'SEMESTER_FINAL', 'ASSIGNMENT', 'LAB')),
    marks DECIMAL(5,2) NOT NULL CHECK (marks >= 0),
    max_marks DECIMAL(5,2) NOT NULL DEFAULT 100 CHECK (max_marks > 0),
    semester INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_student_subject_exam UNIQUE (student_id, subject_id, exam_type, semester)
);

-- 8. Documents Table (Metadata stored in DB, actual file stored in Amazon S3)
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    s3_key TEXT NOT NULL UNIQUE,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('ID_PROOF', 'CERTIFICATE', 'MARKSHEET', 'RESUME', 'OTHER')),
    file_size INTEGER,
    mime_type VARCHAR(100),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indices for high-speed queries & analytics
CREATE INDEX idx_students_department ON students(department_id);
CREATE INDEX idx_students_year ON students(year);
CREATE INDEX idx_students_roll ON students(roll_number);
CREATE INDEX idx_attendance_student ON attendance(student_id);
CREATE INDEX idx_attendance_date ON attendance(attendance_date);
CREATE INDEX idx_marks_student ON marks(student_id);
CREATE INDEX idx_marks_subject ON marks(subject_id);
CREATE INDEX idx_documents_student ON documents(student_id);
