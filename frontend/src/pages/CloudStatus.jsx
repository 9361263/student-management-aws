import React from 'react';
import {
  Cloud,
  Server,
  Database,
  HardDrive,
  Cpu,
  ShieldCheck,
  Activity,
  CheckCircle,
  ExternalLink,
  Zap,
} from 'lucide-react';

export const CloudStatus = () => {
  const cloudResources = [
    {
      name: 'Amazon RDS PostgreSQL',
      type: 'Database Layer',
      status: 'AVAILABLE',
      id: 'database-1',
      details: 'PostgreSQL 15 • db.t4g.micro • ap-south-1c',
      vpc: 'vpc-005661fce1def36c8',
      icon: Database,
      color: '#3b82f6',
    },
    {
      name: 'Amazon S3 Bucket',
      type: 'Object Storage Layer',
      status: 'ACTIVE',
      id: 'student-management-docs-akash-2026',
      details: 'SSE-S3 Encryption • Block Public Access • Presigned URLs',
      vpc: 'Global S3 Fabric (ap-south-1)',
      icon: HardDrive,
      color: '#ff9900',
    },
    {
      name: 'Amazon EC2 Instance',
      type: 'Analytics & Nginx Host',
      status: 'RUNNING',
      id: '13.232.248.71',
      details: 'Ubuntu 24.04 LTS • Private IP: 172.31.12.116 • SSH Key Configured',
      vpc: 'vpc-005661fce1def36c8',
      icon: Server,
      color: '#10b981',
    },
    {
      name: 'AWS Lambda Backend',
      type: 'Serverless API Runtime',
      status: 'CONFIGURED',
      id: 'student-management-api',
      details: 'Node.js 20.x • Serverless Express • Sub-second Cold Starts',
      vpc: 'AWS Lambda VPC Integrated',
      icon: Zap,
      color: '#a855f7',
    },
    {
      name: 'AWS IAM & Security',
      type: 'Identity & Access Management',
      status: 'ACTIVE',
      id: 'AKIA3U4O7ZNV2CBHF3VC',
      details: 'S3FullAccess • RDSFullAccess • LambdaExecutionRole',
      vpc: 'IAM Global Policy Engine',
      icon: ShieldCheck,
      color: '#06b6d4',
    },
  ];

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.6rem' }}>AWS Cloud Infrastructure & Topology</h1>
        <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
          Real-time status and configuration parameters for all allocated AWS Cloud services.
        </p>
      </div>

      {/* Cloud Architecture Diagram Box */}
      <div
        className="glass-card"
        style={{
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(255, 153, 0, 0.08) 0%, rgba(59, 130, 246, 0.06) 100%)',
          border: '1px solid rgba(255, 153, 0, 0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <Activity size={20} color="#ff9900" />
          <h3 style={{ color: '#ff9900' }}>Architecture Flow Diagram</h3>
        </div>

        <div
          style={{
            background: '#0d1322',
            padding: '1.5rem',
            borderRadius: '10px',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            lineHeight: 1.6,
            color: '#cbd5e1',
            overflowX: 'auto',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {`[Client / Browser (React)] ──── HTTPS ───> [Amazon API Gateway]
           │                                          │
           │ (Presigned S3 URL)                       ▼
           ▼                                   [AWS Lambda Function]
[Amazon S3 Storage]                            (Express Serverless)
(student-management-docs-akash-2026)                  │
                                                      ▼
[Amazon EC2 Instance] ─── (VPC 5432) ───────> [Amazon RDS PostgreSQL]
(13.232.248.71 Host)                           (database-1 Instance)`}
        </div>
      </div>

      {/* Cloud Resources Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {cloudResources.map((res, i) => {
          const Icon = res.icon;
          return (
            <div
              key={i}
              className="glass-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                borderLeft: `4px solid ${res.color}`,
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: 'rgba(255,255,255,0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: res.color,
                      }}
                    >
                      <Icon size={22} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1rem' }}>{res.name}</h3>
                      <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{res.type}</span>
                    </div>
                  </div>

                  <span className="badge badge-success">
                    <CheckCircle size={12} /> {res.status}
                  </span>
                </div>

                <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#9ca3af' }}>Identifier:</span>
                    <strong style={{ color: '#f3f4f6', wordBreak: 'break-all' }}>{res.id}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#9ca3af' }}>Specs:</span>
                    <span style={{ color: '#cbd5e1' }}>{res.details}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#9ca3af' }}>VPC / Network:</span>
                    <span style={{ color: '#cbd5e1' }}>{res.vpc}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
