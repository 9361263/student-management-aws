# REST API Specification & Endpoint Reference

## Base URL
- **Local Server:** `http://localhost:5000/api`
- **AWS API Gateway:** `https://<api-id>.execute-api.ap-south-1.amazonaws.com/api`

---

## 1. Authentication APIs

### Login
- **Endpoint:** `POST /auth/login`
- **Body:**
```json
{
  "email": "admin@example.com",
  "password": "Password@123"
}
```
- **Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "System Administrator",
    "email": "admin@example.com",
    "role": "ADMIN"
  }
}
```

---

## 2. Student APIs

### List Students
- **Endpoint:** `GET /students?search=Akash&departmentId=1&year=3`
- **Headers:** `Authorization: Bearer <TOKEN>`

### Create Student (Admin Only)
- **Endpoint:** `POST /students`
- **Headers:** `Authorization: Bearer <TOKEN>`
- **Body:**
```json
{
  "rollNumber": "CS2024011",
  "name": "Arjun Das",
  "email": "arjun.d@example.com",
  "phone": "9876543220",
  "departmentId": 1,
  "courseId": 1,
  "year": 3,
  "semester": 5,
  "address": "Chennai, TN"
}
```

---

## 3. Attendance APIs

### Record Attendance
- **Endpoint:** `POST /attendance`
- **Body:**
```json
{
  "studentId": 1,
  "subjectId": 1,
  "attendanceDate": "2026-08-30",
  "status": "PRESENT"
}
```

---

## 4. Marks & Grading APIs

### Record Marks
- **Endpoint:** `POST /marks`
- **Body:**
```json
{
  "studentId": 1,
  "subjectId": 1,
  "examType": "INTERNAL_1",
  "marks": 47.5,
  "maxMarks": 50,
  "semester": 5
}
```

---

## 5. Amazon S3 Document APIs

### Generate Presigned S3 Upload URL
- **Endpoint:** `POST /documents/upload-url`
- **Body:**
```json
{
  "fileName": "academic_transcript.pdf",
  "mimeType": "application/pdf",
  "studentId": 1,
  "documentType": "MARKSHEET"
}
```

### Confirm S3 Upload
- **Endpoint:** `POST /documents/confirm`
- **Body:**
```json
{
  "studentId": 1,
  "fileName": "academic_transcript.pdf",
  "s3Key": "students/1/marksheet_1725000000_transcript.pdf",
  "documentType": "MARKSHEET",
  "fileSize": 254800,
  "mimeType": "application/pdf"
}
```

---

## 6. Cloud Analytics APIs

- `GET /analytics/overview` - Summary KPIs (Total Students, Avg Attendance %, Avg Marks, Pass %)
- `GET /analytics/departments` - Department enrollment distribution
- `GET /analytics/attendance` - Students categorized by attendance (>90%, 75-90%, <75%)
- `GET /analytics/top-students` - Honor roll students list
