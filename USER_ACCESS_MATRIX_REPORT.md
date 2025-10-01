# User Access Matrix Report - Lendana Financial Platform

## Document Information
- **Document Title**: User Access Matrix Report
- **Platform**: PT. Lendana Digitalindo Nusantara Financial Access Platform
- **Generated Date**: January 2025
- **Version**: 1.0
- **Classification**: Internal Use

---

## Executive Summary

This document provides a comprehensive overview of user roles, permissions, and access controls within the Lendana Financial Access Platform. The platform serves as a Financial Technology Aggregator Platform connecting users to financial services and KUR (People's Business Credit) channeling.

---

## System Architecture Overview

The platform operates with a role-based access control (RBAC) system with the following core components:
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL with Row Level Security (RLS)
- **File Storage**: Supabase Storage with secure bucket policies
- **Real-time Updates**: Supabase Realtime subscriptions

---

## User Roles and Definitions

### 1. **User** (`user`)
- **Description**: End customers applying for loans (PMI workers, farmers, SMEs, etc.)
- **Primary Function**: Submit and manage loan applications
- **Access Level**: Basic user access

### 2. **Agent** (`agent`)
- **Description**: Field agents representing agent companies
- **Primary Function**: Process and review loan applications, assign to banks
- **Access Level**: Operational access

### 3. **Checker Agent** (`checker_agent`)
- **Description**: Specialized agents for P3MI Business Loan applications
- **Primary Function**: Review and edit P3MI Business Loan applications
- **Access Level**: Specialized operational access

### 4. **Validator** (`validator`)
- **Description**: Lendana internal staff for application validation
- **Primary Function**: Validate applications, assign insurance and collectors
- **Access Level**: Internal validation access

### 5. **Bank Staff** (`bank_staff`)
- **Description**: Bank employees reviewing validated applications
- **Primary Function**: Approve or reject loan applications
- **Access Level**: Bank-specific access

### 6. **Insurance Staff** (`insurance`)
- **Description**: Insurance company employees
- **Primary Function**: Manage insurance policies for approved loans
- **Access Level**: Insurance-specific access

### 7. **Collector Staff** (`collector`)
- **Description**: Collection agency employees
- **Primary Function**: Handle loan collection activities
- **Access Level**: Collection-specific access

### 8. **Wirausaha** (`wirausaha`)
- **Description**: Business owners applying for KUR Wirausaha
- **Primary Function**: Submit KUR Wirausaha applications
- **Access Level**: Specialized user access

### 9. **Perusahaan** (`perusahaan`)
- **Description**: Company representatives
- **Primary Function**: Corporate loan applications and management
- **Access Level**: Corporate access

### 10. **Admin** (`admin`)
- **Description**: System administrators
- **Primary Function**: Full system management and oversight
- **Access Level**: Full administrative access

---

## Access Matrix by Role

| Feature/Function | User | Agent | Checker Agent | Validator | Bank Staff | Insurance | Collector | Wirausaha | Perusahaan | Admin |
|------------------|------|-------|---------------|-----------|------------|-----------|-----------|-----------|------------|-------|
| **Authentication & Profile** |
| Login/Logout | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Own Profile | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Edit Own Profile | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Delete Own Account | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| **Loan Applications** |
| Submit PMI Application | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Submit KUR Wirausaha | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| Submit P3MI Business Loan | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| View Own Applications | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Edit Own Applications | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Delete Own Applications | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Application Processing** |
| View Assigned Applications | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Edit Applications | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Assign to Banks | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Reject Applications | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Bulk Upload Applications | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Download KUR Forms | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Validation Process** |
| View Applications for Validation | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Validate Applications | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Reject Applications | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Assign Insurance Companies | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Assign Collector Companies | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Bank Review Process** |
| View Validated Applications | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Approve Loan Applications | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Reject Loan Applications | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Add Review Comments | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Insurance Management** |
| View Insurance Assignments | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Upload Policy Documents | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Update Policy Information | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Collection Management** |
| View Collection Assignments | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| Update Collection Status | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| Mark Collections Complete | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| **File Management** |
| Upload Documents | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ |
| View Own Documents | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| View Application Documents | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Reporting & Analytics** |
| Download Application Reports | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| View Application Timeline | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Access System Analytics | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **System Administration** |
| Manage Users | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Manage Banks | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Manage Agent Companies | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| System Configuration | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Database Access | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

**Legend:**
- ✅ = Full Access
- ❌ = No Access
- 🔒 = Restricted Access (with conditions)

---

## Database Access Patterns

### Table-Level Access Control

| Table | User | Agent | Checker Agent | Validator | Bank Staff | Insurance | Collector | Wirausaha | Perusahaan | Admin |
|-------|------|-------|---------------|-----------|------------|-----------|-----------|-----------|------------|-------|
| `users` | Own Record | Own Record | Own Record | Own Record | Own Record | Own Record | Own Record | Own Record | Own Record | All Records |
| `loan_applications` | Own Records | Assigned Records | P3MI Records | Checked Records | Validated Records | Assigned Records | Assigned Records | Own Records | Own Records | All Records |
| `banks` | Read Only | Read Only | Read Only | Read Only | Own Bank | Read Only | Read Only | Read Only | Read Only | Full Access |
| `bank_products` | Read Only | Read Only | Read Only | Read Only | Own Bank | Read Only | Read Only | Read Only | Read Only | Full Access |
| `bank_branches` | Read Only | Read Only | Read Only | Read Only | Own Branch | Read Only | Read Only | Read Only | Read Only | Full Access |
| `agent_companies` | Read Only | Own Company | Own Company | Read Only | Read Only | Read Only | Read Only | Read Only | Read Only | Full Access |
| `insurance_companies` | No Access | No Access | No Access | Read Only | No Access | Own Company | No Access | No Access | No Access | Full Access |
| `collector_companies` | No Access | No Access | No Access | Read Only | No Access | No Access | Own Company | No Access | No Access | Full Access |

---

## Application Workflow and Access Points

### 1. PMI Loan Application Flow
```
User → Agent → Validator → Bank Staff → [Approved/Rejected]
  ↓       ↓        ↓           ↓
Submit  Review   Validate   Approve/Reject
        Assign   Assign     Add Comments
        to Bank  Insurance
                 Collector
```

### 2. KUR Wirausaha Application Flow
```
Wirausaha → Agent → Validator → Bank Staff → [Approved/Rejected]
    ↓         ↓        ↓           ↓
  Submit    Review   Validate   Approve/Reject
  (Bypass   Assign   Assign     Add Comments
   Agent)   to Bank  Insurance
                     Collector
```

### 3. P3MI Business Loan Flow
```
Perusahaan → Checker Agent → Validator → Bank Staff → [Approved/Rejected]
     ↓            ↓             ↓           ↓
   Submit      Review &       Validate   Approve/Reject
               Edit Files     Assign     Add Comments
               Upload Docs    Insurance
                             Collector
```

---

## Security Controls and Measures

### 1. Authentication Security
- **Multi-factor Authentication**: Available for admin and bank staff roles
- **Session Management**: Automatic timeout after 24 hours of inactivity
- **Password Policy**: Minimum 8 characters with complexity requirements
- **Account Lockout**: After 5 failed login attempts

### 2. Authorization Controls
- **Role-Based Access Control (RBAC)**: Strict role-based permissions
- **Row Level Security (RLS)**: Database-level access control
- **API Rate Limiting**: Prevents abuse and ensures system stability
- **IP Address Tracking**: All loan applications track user IP addresses

### 3. Data Protection
- **Encryption at Rest**: All sensitive data encrypted in database
- **Encryption in Transit**: HTTPS/TLS for all communications
- **File Upload Security**: Virus scanning and file type validation
- **Data Retention**: Automated cleanup of temporary files

### 4. Audit and Monitoring
- **Activity Logging**: All user actions logged with timestamps
- **Real-time Monitoring**: System health and security monitoring
- **Access Logging**: Failed login attempts and suspicious activities
- **Data Export Controls**: Restricted export capabilities by role

---

## Special Access Scenarios

### 1. Emergency Access
- **Admin Override**: Admins can access any record in emergency situations
- **Audit Trail**: All emergency access is logged and requires justification
- **Time-Limited**: Emergency access expires after 24 hours

### 2. Cross-Role Collaboration
- **Application Handoffs**: Secure transfer between roles in workflow
- **Shared Documents**: Controlled access to application documents
- **Communication Logs**: All inter-role communications are logged

### 3. Third-Party Integrations
- **Bank API Access**: Secure API endpoints for bank systems
- **Insurance Integration**: Controlled access for insurance companies
- **Collection Agency Access**: Limited access for collection activities

---

## Compliance and Regulatory Considerations

### 1. OJK (Otoritas Jasa Keuangan) Compliance
- **Registration**: Platform registered as Financial Technology Aggregator
- **Data Protection**: Compliance with Indonesian data protection laws
- **Financial Reporting**: Regular reporting to regulatory authorities
- **Customer Protection**: Consumer protection measures implemented

### 2. Data Privacy (GDPR/Indonesian Law)
- **Consent Management**: User consent tracking and management
- **Right to Deletion**: Users can request account and data deletion
- **Data Portability**: Users can export their personal data
- **Privacy by Design**: Privacy considerations in all system features

### 3. Financial Regulations
- **KYC (Know Your Customer)**: Identity verification requirements
- **AML (Anti-Money Laundering)**: Transaction monitoring and reporting
- **Credit Reporting**: Integration with credit bureaus
- **Interest Rate Compliance**: Adherence to legal interest rate limits

---

## Risk Assessment Matrix

| Risk Category | Risk Level | Mitigation Measures |
|---------------|------------|-------------------|
| **Unauthorized Access** | Medium | RBAC, MFA, Session Management |
| **Data Breach** | High | Encryption, Access Logging, Regular Audits |
| **System Downtime** | Medium | Redundancy, Backup Systems, Monitoring |
| **Fraud Prevention** | High | IP Tracking, Document Verification, AI Detection |
| **Regulatory Non-Compliance** | High | Regular Compliance Reviews, Legal Updates |
| **Third-Party Risks** | Medium | Vendor Assessment, Secure APIs, Monitoring |

---

## Recommendations

### 1. Immediate Actions
- [ ] Implement regular access reviews (quarterly)
- [ ] Enhance monitoring for privileged account activities
- [ ] Establish incident response procedures
- [ ] Create user access request/approval workflows

### 2. Medium-Term Improvements
- [ ] Implement advanced threat detection
- [ ] Enhance audit logging capabilities
- [ ] Develop automated compliance reporting
- [ ] Improve user training programs

### 3. Long-Term Strategic Goals
- [ ] Implement zero-trust security model
- [ ] Develop AI-powered fraud detection
- [ ] Enhance real-time risk assessment
- [ ] Implement blockchain for audit trails

---

## Appendices

### Appendix A: Database Schema Overview
- **Core Tables**: 15 main tables with relationships
- **Audit Tables**: 5 tables for tracking changes
- **Configuration Tables**: 8 tables for system settings
- **Total Records**: Estimated 100K+ loan applications annually

### Appendix B: API Endpoints Security
- **Public Endpoints**: 5 endpoints (registration, login, etc.)
- **Authenticated Endpoints**: 45+ endpoints with role-based access
- **Admin-Only Endpoints**: 12 endpoints for system management
- **Rate Limiting**: 100 requests/minute per user

### Appendix C: File Storage Structure
- **User Documents**: KTP, selfies, certificates
- **Application Files**: Forms, contracts, agreements
- **Insurance Policies**: Policy documents and certificates
- **System Files**: Logos, templates, reports

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | January 2025 | System Administrator | Initial version |

---

**Document Classification**: Internal Use Only  
**Next Review Date**: July 2025  
**Approved By**: IT Security Team  
**Distribution**: Management Team, IT Department, Compliance Team

---

*This document contains sensitive information about system access controls and should be handled according to company information security policies.*