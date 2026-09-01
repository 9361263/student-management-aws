// ================================================================
// Frontend API Client with JWT Auth & AWS S3 Upload Helpers
// ================================================================

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Generic fetch wrapper with error handling
const request = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'API request failed');
    }
    return data;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
};

// Authentication APIs
export const authApi = {
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  getMe: () => request('/auth/me'),
  getUsers: () => request('/auth/users'),
  registerUser: (userData) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
};

// Student APIs
export const studentApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/students?${query}`);
  },
  getById: (id) => request(`/students/${id}`),
  create: (studentData) =>
    request('/students', {
      method: 'POST',
      body: JSON.stringify(studentData),
    }),
  update: (id, studentData) =>
    request(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(studentData),
    }),
  delete: (id) =>
    request(`/students/${id}`, {
      method: 'DELETE',
    }),
};

// Attendance APIs
export const attendanceApi = {
  record: (data) =>
    request('/attendance', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getStudentAttendance: (studentId) => request(`/attendance/student/${studentId}`),
  getLowAttendance: () => request('/attendance/low-attendance'),
};

// Marks & CGPA APIs
export const marksApi = {
  getAllSummary: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/marks/summary?${query}`);
  },
  addOrUpdate: (data) =>
    request('/marks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    request(`/marks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getStudentMarks: (studentId) => request(`/marks/student/${studentId}`),
  delete: (id) =>
    request(`/marks/${id}`, {
      method: 'DELETE',
    }),
};

// Documents & AWS S3 APIs
export const documentApi = {
  getUploadUrl: (data) =>
    request('/documents/upload-url', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  confirmUpload: (data) =>
    request('/documents/confirm', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getDownloadUrl: (id) => request(`/documents/download/${id}`),
  getStudentDocuments: (studentId) => request(`/documents/student/${studentId}`),
  delete: (id) =>
    request(`/documents/${id}`, {
      method: 'DELETE',
    }),
  
  // Direct Browser-to-S3 Upload via Presigned URL
  uploadDirectToS3: async (uploadUrl, file) => {
    const res = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });
    if (!res.ok) {
      throw new Error(`S3 upload failed with status ${res.status}`);
    }
    return res;
  },
};

// Analytics APIs
export const analyticsApi = {
  getOverview: () => request('/analytics/overview'),
  getDepartments: () => request('/analytics/departments'),
  getYears: () => request('/analytics/years'),
  getAttendance: () => request('/analytics/attendance'),
  getSubjects: () => request('/analytics/subjects'),
  getTopStudents: () => request('/analytics/top-students'),
};

// Academic Reference APIs
export const academicApi = {
  getDepartments: () => request('/academic/departments'),
  getCourses: (departmentId) => request(`/academic/courses${departmentId ? `?departmentId=${departmentId}` : ''}`),
  getSubjects: (courseId, semester) => {
    const p = new URLSearchParams();
    if (courseId) p.append('courseId', courseId);
    if (semester) p.append('semester', semester);
    return request(`/academic/subjects?${p.toString()}`);
  },
};
