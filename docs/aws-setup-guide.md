# AWS Cloud Setup & Verification Guide

## Target AWS Resources Checklist

### 1. Amazon RDS PostgreSQL (`database-1`)
- **Instance Identifier:** `database-1`
- **Class:** `db.t4g.micro`
- **Master User:** `postgres`
- **Master Password:** `cloudakash`
- **Port:** `5432`
- **Schema Initialization Command:**
```bash
PGPASSWORD='cloudakash' psql -h <RDS_ENDPOINT> -U postgres -d postgres -f database/schema.sql
PGPASSWORD='cloudakash' psql -h <RDS_ENDPOINT> -U postgres -d postgres -f database/seed.sql
```

### 2. Amazon S3 Bucket (`student-management-docs-akash-2026`)
- **Bucket Name:** `student-management-docs-akash-2026`
- **Region:** `ap-south-1`
- **CORS Configuration:**
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

### 3. Amazon EC2 Server (`13.232.248.71`)
- **SSH Connection Command:**
```bash
ssh -i akashec2key.pem ubuntu@13.232.248.71
```
- **Run Automated Deployment Script:**
```bash
bash infrastructure/ec2/deploy.sh
```

### 4. AWS Lambda Serverless Function (`student-management-api`)
- **Runtime:** Node.js 20.x
- **Handler:** `lambda.handler`
- **Deploy via AWS CLI:**
```bash
cd backend
zip -r lambda.zip . -x "node_modules/*"
aws lambda update-function-code --function-name student-management-api --zip-file fileb://lambda.zip --region ap-south-1
```
