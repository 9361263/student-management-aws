# System Architecture Document

## Serverless Cloud-Based Student Management and Analytics System using AWS

### 1. Architectural Overview

The application follows a modern cloud-native decoupled architecture combining serverless microservices and managed cloud infrastructure:

```
                            ┌─────────────────────────────────┐
                            │    Users (Admin / Faculty)      │
                            └────────────────┬────────────────┘
                                             │ HTTPS
                                             ▼
                            ┌─────────────────────────────────┐
                            │   React.js Single Page App      │
                            │ Dashboard • Students • Analytics│
                            └────────┬───────────────┬────────┘
                                     │               │
                    Presigned S3 URLs│               │ REST API
                                     ▼               ▼
                       ┌──────────────────┐   ┌──────────────────┐
                       │    Amazon S3     │   │   API Gateway    │
                       │ Document Storage │   │    HTTP Proxy    │
                       └──────────────────┘   └────────┬─────────┘
                                                       │
                                                       ▼
                                              ┌──────────────────┐
                                              │    AWS Lambda    │
                                              │ (Node.js Express)│
                                              └────────┬─────────┘
                                                       │
                                                       ▼
                                              ┌──────────────────┐
                                              │    Amazon RDS    │
                                              │ (PostgreSQL DB)  │
                                              └──────────────────┘
                                                       ▲
                                                       │
                                              ┌────────┴─────────┐
                                              │    Amazon EC2    │
                                              │ Analytics & Host │
                                              └──────────────────┘
```

### 2. Core Cloud Components

1. **Amazon S3 (`student-management-docs-akash-2026`)**:
   - Stores student ID cards, marksheets, and certificates.
   - Enforces Block Public Access with secure Pre-Signed URL time-limited access.

2. **Amazon RDS (`database-1`, PostgreSQL 15/16)**:
   - Stores normalized relational data across Users, Departments, Courses, Students, Subjects, Attendance, Marks, and Document Metadata.

3. **AWS Lambda (`student-management-api`)**:
   - Serverless Node.js runtime executing business logic on-demand with zero idle cost.

4. **Amazon API Gateway**:
   - Manages SSL termination, CORS handling, rate limiting, and HTTP routing to Lambda.

5. **Amazon EC2 (`13.232.248.71`)**:
   - Ubuntu host running the Nginx web server and analytics dashboard.

6. **Amazon CloudWatch**:
   - Centralized logging, invocation metrics, and automated alarm triggers for performance anomalies.
