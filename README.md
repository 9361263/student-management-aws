# Serverless Cloud-Based Student Management and Analytics System using AWS

[![AWS](https://img.shields.io/badge/AWS-Cloud%20Services-orange.svg)](https://aws.amazon.com/)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-blue.svg)](https://react.dev/)
[![NodeJS](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-Amazon%20RDS%20PostgreSQL-336791.svg)](https://aws.amazon.com/rds/postgresql/)
[![S3](https://img.shields.io/badge/Storage-Amazon%20S3-569A31.svg)](https://aws.amazon.com/s3/)

> **AWS Cloud Computing Mini Project** | Prepared for **Prime Vector**

---

## 📌 Project Overview

The **Serverless Cloud-Based Student Management and Analytics System** is an enterprise-grade cloud solution engineered using AWS managed and serverless services. It allows educational institutions to securely manage student profiles, monitor attendance, grade examinations, store documents, and track institutional performance through real-time interactive analytics.

---

## 🏛️ Cloud Architecture

```
                             ┌─────────────────────────────────┐
                             │       Admin / Faculty / User    │
                             └────────────────┬────────────────┘
                                              │ HTTPS
                                              ▼
                             ┌─────────────────────────────────┐
                             │   React Frontend (Dashboard)    │
                             │  Students • Marks • Attendance  │
                             │  Documents • Analytics Charts   │
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
                                               │ Hosted Analytics │
                                               │ & Nginx Server   │
                                               └──────────────────┘
```

---

## ⚙️ Configured AWS Infrastructure Overview

| Service | Architecture Component | Specs & Details |
| :--- | :--- | :--- |
| **Amazon RDS** | Relational Database | PostgreSQL 15/16 • `db.t4g.micro` • Multi-AZ Capable |
| **Amazon S3** | Object Storage Vault | SSE-S3 Encryption • Block Public Access • Presigned URLs |
| **Amazon EC2** | Application Host | Ubuntu 24.04 LTS • Nginx Reverse Proxy • PM2 Daemon |
| **AWS Lambda** | Serverless API Runtime | Node.js 20.x • Serverless Express Handler (`lambda.js`) |
| **IAM** | Identity & Access Control | Least-Privilege Policies for S3, RDS, Lambda, CloudWatch |

---

## 🚀 Getting Started Locally

### 1. Database Setup
Execute the PostgreSQL DDL and Seed scripts in your database instance:
```bash
psql -h <YOUR_RDS_ENDPOINT> -U postgres -d student_management -f database/schema.sql
psql -h <YOUR_RDS_ENDPOINT> -U postgres -d student_management -f database/seed.sql
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` in the `backend` directory and populate your credentials:
```bash
cd backend
cp .env.example .env
```

### 3. Run Backend Server
```bash
cd backend
npm install
npm start
# Server starts on http://localhost:5000
```

### 4. Run React Frontend
```bash
cd frontend
npm install
npm run dev
# Frontend starts on http://localhost:3000
```

---

## 📁 Repository Structure

```
.
├── backend/
│   ├── src/
│   │   ├── config/ (db.js, s3.js)
│   │   ├── controllers/ (auth, student, attendance, marks, document, analytics, academic)
│   │   ├── middleware/ (authMiddleware, roleMiddleware, errorMiddleware)
│   │   ├── routes/ (auth, student, attendance, marks, document, analytics, academic)
│   │   └── app.js
│   ├── lambda.js (AWS Lambda Handler)
│   ├── server.js (Local Server)
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/ (Navbar, Sidebar)
│   │   ├── context/ (AuthContext)
│   │   ├── pages/ (Login, Dashboard, Students, AddStudent, StudentDetails, Attendance, Marks, Documents, Analytics, CloudStatus)
│   │   ├── services/ (api.js)
│   │   └── styles/ (index.css)
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── database/
│   ├── schema.sql
│   └── seed.sql
├── infrastructure/
│   ├── ec2/ (deploy.sh, nginx.conf)
│   ├── cloudwatch/ (alarms-config.json)
│   └── iam/ (policies.json)
└── README.md
```

---

## 👥 Author & Submission
- **Project Name:** Serverless Cloud-Based Student Management and Analytics System using AWS
- **Submitted by:** Akash K
- **Organization:** Prime Vector AWS Training Program
