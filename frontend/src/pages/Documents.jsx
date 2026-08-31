import React, { useState, useEffect } from 'react';
import { studentApi, documentApi } from '../services/api';
import {
  FileText,
  UploadCloud,
  Download,
  Trash2,
  CheckCircle,
  ExternalLink,
  Shield,
  HardDrive,
} from 'lucide-react';

export const Documents = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('1');
  const [documentType, setDocumentType] = useState('CERTIFICATE');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [documents, setDocuments] = useState([]);
  const [successMsg, setSuccessMsg] = useState('');

  const loadDocuments = async (sId) => {
    try {
      const res = await documentApi.getStudentDocuments(sId || selectedStudent);
      if (res?.documents) {
        setDocuments(res.documents);
      }
    } catch (err) {
      console.warn('Failed to load docs:', err);
    }
  };

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const res = await studentApi.getAll();
        if (res?.students && res.students.length > 0) {
          setStudents(res.students);
          setSelectedStudent(String(res.students[0].id));
          loadDocuments(res.students[0].id);
        }
      } catch (err) {}
    };
    loadStudents();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a file to upload.');
      return;
    }

    setUploading(true);
    setUploadProgress(20);
    setSuccessMsg('');

    try {
      // Step 1: Request Presigned URL from Backend Lambda
      const urlRes = await documentApi.getUploadUrl({
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        studentId: selectedStudent,
        documentType,
      });

      setUploadProgress(60);

      // Step 2: Upload file directly to Amazon S3
      if (urlRes?.uploadUrl) {
        await documentApi.uploadDirectToS3(urlRes.uploadUrl, file);
      }

      setUploadProgress(85);

      // Step 3: Record metadata in RDS PostgreSQL
      await documentApi.confirmUpload({
        studentId: selectedStudent,
        fileName: file.name,
        s3Key: urlRes?.s3Key || `students/${selectedStudent}/${file.name}`,
        documentType,
        fileSize: file.size,
        mimeType: file.type,
      });

      setUploadProgress(100);
      setSuccessMsg(`File "${file.name}" securely uploaded to Amazon S3!`);
      setFile(null);
      loadDocuments(selectedStudent);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDownload = async (docId) => {
    try {
      const res = await documentApi.getDownloadUrl(docId);
      if (res?.downloadUrl) {
        window.open(res.downloadUrl, '_blank');
      }
    } catch (err) {
      alert('Failed to get download URL: ' + err.message);
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Delete this document from S3 and database?')) return;
    try {
      await documentApi.delete(docId);
      loadDocuments(selectedStudent);
    } catch (err) {
      alert('Failed to delete document: ' + err.message);
    }
  };

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.6rem' }}>Amazon S3 Document Vault</h1>
        <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
          Secure, serverless direct browser-to-S3 document upload with Presigned URLs.
        </p>
      </div>

      {/* S3 Bucket Info Card */}
      <div
        className="glass-card"
        style={{
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          border: '1px solid rgba(255, 153, 0, 0.3)',
          background: 'rgba(255, 153, 0, 0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <HardDrive size={22} color="#ff9900" />
          <div>
            <div style={{ fontWeight: 600, color: '#ff9900' }}>Active S3 Bucket: student-management-docs-akash-2026</div>
            <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
              Region: ap-south-1 • SSE-S3 Encryption • Block Public Access Enabled
            </div>
          </div>
        </div>

        <div className="badge badge-success">
          <Shield size={12} /> AWS IAM Protected
        </div>
      </div>

      {successMsg && (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#10b981',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <CheckCircle size={18} /> {successMsg}
        </div>
      )}

      {/* Upload Section + Documents List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Upload Form */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UploadCloud size={20} color="#3b82f6" /> Upload Student Document to S3
          </h3>

          <form onSubmit={handleUpload}>
            <div className="form-group">
              <label className="form-label">Student *</label>
              <select
                className="form-select"
                value={selectedStudent}
                onChange={(e) => {
                  setSelectedStudent(e.target.value);
                  loadDocuments(e.target.value);
                }}
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.roll_number} - {s.name} ({s.department_code || 'CSE'})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Document Category *</label>
              <select
                className="form-select"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
              >
                <option value="CERTIFICATE">Academic / Course Certificate</option>
                <option value="ID_PROOF">Government / College ID Proof</option>
                <option value="MARKSHEET">Previous Marksheet / Transcript</option>
                <option value="RESUME">Resume / CV</option>
                <option value="OTHER">Other Official Document</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Select File (PDF, PNG, JPG) *</label>
              <input
                type="file"
                className="form-input"
                onChange={handleFileChange}
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                required
              />
            </div>

            {uploading && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                  <span>Uploading to Amazon S3...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${uploadProgress}%`,
                      background: 'var(--accent-gradient)',
                      borderRadius: '3px',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-gradient" style={{ width: '100%' }} disabled={uploading}>
              <UploadCloud size={16} />
              {uploading ? 'Processing Direct S3 Upload...' : 'Upload Directly to Amazon S3'}
            </button>
          </form>
        </div>

        {/* Existing S3 Documents List */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3>Uploaded S3 Documents</h3>
            <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{documents.length} Files</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '420px', overflowY: 'auto' }}>
            {documents.length === 0 ? (
              <p style={{ color: '#9ca3af', textAlign: 'center', padding: '2.5rem' }}>
                No documents found for this student.
              </p>
            ) : (
              documents.map((doc) => (
                <div
                  key={doc.id}
                  style={{
                    padding: '0.85rem 1rem',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <FileText size={16} color="#3b82f6" />
                      <strong style={{ fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {doc.file_name}
                      </strong>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '2px' }}>
                      <span className="badge badge-info">{doc.document_type}</span> • {doc.file_size ? `${(doc.file_size / 1024).toFixed(0)} KB` : 'PDF'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleDownload(doc.id)}
                      title="Download Presigned URL"
                    >
                      <Download size={14} />
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(doc.id)}
                      title="Delete from S3"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
