# User Access Matrix Report - PT. Lendana Digitalindo Nusantara

## Executive Summary

This document provides a comprehensive overview of user roles and their access permissions within the Lendana Financial Access Platform. The system implements a role-based access control (RBAC) model with 10 distinct user roles, each with specific permissions and responsibilities.

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Classification:** Internal Use Only

---

## System Overview

The Lendana platform serves as a Financial Technology Aggregator Platform registered with OJK (Otoritas Jasa Keuangan), facilitating access to KUR (Kredit Usaha Rakyat) and other financial services for various user segments including PMI (Indonesian Migrant Workers), farmers, livestock farmers, SMEs, and housing credit applicants.

---

## User Roles & Definitions

| Role ID | Role Name | Description | Primary Function |
|---------|-----------|-------------|------------------|
| 1 | `user` | End-user/Loan Applicant | Submit and track loan applications |
| 2 | `admin` | System Administrator | Full system access and management |
| 3 | `agent` | Agent Company Staff | Process and validate loan applications |
| 4 | `validator` | Lendana Validator | Internal validation and approval |
| 5 | `bank_staff` | Bank Personnel | Review and approve bank applications |
| 6 | `insurance` | Insurance Staff | Manage insurance assignments |
| 7 | `collector` | Collection Agency Staff | Handle loan collection activities |
| 8 | `wirausaha` | Entrepreneur/Business Owner | Apply for business loans (KUR Wirausaha) |
| 9 | `perusahaan` | Company Representative | Corporate loan applications |
| 10 | `checker_agent` | Quality Assurance Agent | Secondary validation and quality checks |

---

## Access Matrix by Module

### 🏠 **Core Application Access**

| Module/Feature | user | admin | agent | validator | bank_staff | insurance | collector | wirausaha | perusahaan | checker_agent |
|----------------|------|-------|-------|-----------|------------|-----------|-----------|-----------|------------|---------------|
| **Dashboard Access** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Profile Management** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Authentication** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### 💰 **Loan Application Management**

| Feature | user | admin | agent | validator | bank_staff | insurance | collector | wirausaha | perusahaan | checker_agent |
|---------|------|-------|-------|-----------|------------|-----------|-----------|-----------|------------|---------------|
| **Create Loan Application** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| **View Own Applications** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| **View All Applications** | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Edit Applications** | ✅* | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅* | ✅* | ❌ |
| **Delete Applications** | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Assign to Agent** | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Validate Applications** | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **KUR Wirausaha Applications** | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ |

*Only own applications and within specific timeframes

### 🏦 **Bank Integration & Reviews**

| Feature | user | admin | agent | validator | bank_staff | insurance | collector | wirausaha | perusahaan | checker_agent |
|---------|------|-------|-------|-----------|------------|-----------|-----------|-----------|------------|---------------|
| **View Bank Products** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Manage Bank Products** | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Create Bank Reviews** | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **View Bank Reviews** | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Branch Applications** | ❌ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Bank Staff Management** | ❌ | ✅ | ❌ | ❌ | ✅* | ❌ | ❌ | ❌ | ❌ | ❌ |

*Limited to own bank only

### 🛡️ **Insurance Management**

| Feature | user | admin | agent | validator | bank_staff | insurance | collector | wirausaha | perusahaan | checker_agent |
|---------|------|-------|-------|-----------|------------|-----------|-----------|-----------|------------|---------------|
| **View Insurance Assignments** | ✅* | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅* | ✅* | ✅ |
| **Create Insurance Assignments** | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Manage Insurance Companies** | ❌ | ✅ | ❌ | ❌ | ❌ | ✅* | ❌ | ❌ | ❌ | ❌ |
| **Update Policy Information** | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Insurance Staff Management** | ❌ | ✅ | ❌ | ❌ | ❌ | ✅* | ❌ | ❌ | ❌ | ❌ |

*Limited to own records/company only

### 💸 **Collection Management**

| Feature | user | admin | agent | validator | bank_staff | insurance | collector | wirausaha | perusahaan | checker_agent |
|---------|------|-------|-------|-----------|------------|-----------|-----------|-----------|------------|---------------|
| **View Collection Assignments** | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| **Create Collection Assignments** | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Update Collection Status** | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Collection Company Management** | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅* | ❌ | ❌ | ❌ |
| **Collection Reports** | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |

*Limited to own company only

### 🏢 **Agent & Company Management**

| Feature | user | admin | agent | validator | bank_staff | insurance | collector | wirausaha | perusahaan | checker_agent |
|---------|------|-------|-------|-----------|------------|-----------|-----------|-----------|------------|---------------|
| **View Agent Companies** | ❌ | ✅ | ✅* | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Manage Agent Companies** | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Agent Staff Management** | ❌ | ✅ | ✅* | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Agent Performance Reports** | ❌ | ✅ | ✅* | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

*Limited to own company only

### 💰 **Cost Components (Komponen Biaya)**

| Feature | user | admin | agent | validator | bank_staff | insurance | collector | wirausaha | perusahaan | checker_agent |
|---------|------|-------|-------|-----------|------------|-----------|-----------|-----------|------------|---------------|
| **View Cost Components** | ✅* | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅* | ✅* | ✅ |
| **Create Cost Components** | ✅* | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅* | ✅* | ❌ |
| **Edit Cost Components** | ✅* | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅* | ✅* | ❌ |
| **Delete Cost Components** | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

*Limited to own applications only

### 📊 **Reporting & Analytics**

| Feature | user | admin | agent | validator | bank_staff | insurance | collector | wirausaha | perusahaan | checker_agent |
|---------|------|-------|-------|-----------|------------|-----------|-----------|-----------|------------|---------------|
| **Application Reports** | ✅* | ✅ | ✅* | ✅ | ✅* | ❌ | ❌ | ✅* | ✅* | ✅ |
| **Financial Reports** | ❌ | ✅ | ❌ | ✅ | ✅* | ❌ | ❌ | ❌ | ❌ | ❌ |
| **User Activity Reports** | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **System Analytics** | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Export Data** | ❌ | ✅ | ✅* | ✅ | ✅* | ✅* | ✅* | ❌ | ❌ | ✅ |

*Limited scope based on role

### ⚙️ **System Administration**

| Feature | user | admin | agent | validator | bank_staff | insurance | collector | wirausaha | perusahaan | checker_agent |
|---------|------|-------|-------|-----------|------------|-----------|-----------|-----------|------------|---------------|
| **User Management** | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Role Assignment** | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **System Configuration** | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Database Management** | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Audit Logs** | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Backup & Recovery** | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## Role-Specific Workflows

### 👤 **User (End Customer)**
**Primary Functions:**
- Submit loan applications for PMI, farming, livestock, SME, or housing
- Upload required documents
- Track application status
- View loan terms and conditions
- Manage personal profile

**Typical User Journey:**
1. Register and verify account
2. Complete loan application form
3. Upload required documents
4. Submit application
5. Track progress through dashboard
6. Receive approval/rejection notification

### 👨‍💼 **Agent (Agent Company Staff)**
**Primary Functions:**
- Process incoming loan applications
- Validate customer information and documents
- Communicate with customers for additional requirements
- Submit applications to banks
- Track application progress

**Key Responsibilities:**
- First-level application review
- Customer relationship management
- Document verification
- Application forwarding to appropriate banks

### ✅ **Validator (Lendana Internal)**
**Primary Functions:**
- Secondary validation of applications
- Quality assurance checks
- Final approval before bank submission
- Risk assessment
- Compliance verification

**Authority Level:**
- Can approve/reject applications
- Assign applications to agents
- Override agent decisions
- Access to all application data

### 🏦 **Bank Staff**
**Primary Functions:**
- Review bank-assigned applications
- Make final lending decisions
- Manage bank products and terms
- Generate bank reviews and reports

**Scope of Access:**
- Limited to applications assigned to their bank
- Full access to bank-specific data
- Cannot access other banks' information

### 🛡️ **Insurance Staff**
**Primary Functions:**
- Manage insurance assignments for approved loans
- Process insurance policies
- Handle claims and coverage
- Maintain insurance company data

**Operational Scope:**
- Insurance-related data only
- Limited to assigned loan applications
- Company-specific access restrictions

### 💸 **Collector**
**Primary Functions:**
- Handle collection activities for defaulted loans
- Update collection status
- Generate collection reports
- Manage debtor communications

**Access Limitations:**
- Only collection-related data
- Cannot modify loan terms
- Limited to assigned accounts

### 🏢 **Wirausaha (Entrepreneur)**
**Primary Functions:**
- Apply for KUR Wirausaha (business loans)
- Simplified application process
- Business-specific documentation
- Track business loan applications

**Special Features:**
- Streamlined 3-step application process
- Business-focused form fields
- Different validation requirements

### 🏭 **Perusahaan (Company Representative)**
**Primary Functions:**
- Corporate loan applications
- Bulk application processing
- Company-level reporting
- Multi-user account management

### 🔍 **Checker Agent (QA)**
**Primary Functions:**
- Quality assurance and secondary checks
- Application audit and review
- Process improvement recommendations
- Compliance monitoring

**Quality Control Role:**
- Read-only access to most data
- Can flag issues for review
- Generate quality reports
- Monitor system integrity

### 👑 **Admin (System Administrator)**
**Primary Functions:**
- Complete system access and control
- User and role management
- System configuration
- Database administration
- Security management

**Full Authority:**
- All system functions
- User creation and role assignment
- System maintenance
- Data backup and recovery

---

## Security & Compliance

### 🔐 **Authentication & Authorization**
- **Multi-factor Authentication (MFA):** Required for admin and validator roles
- **Session Management:** 8-hour timeout for regular users, 4-hour for privileged roles
- **Password Policy:** Minimum 12 characters with complexity requirements
- **Role-based Access Control (RBAC):** Strict enforcement of role permissions

### 📋 **Audit & Compliance**
- **Activity Logging:** All user actions are logged with timestamps
- **Data Privacy:** GDPR and Indonesian data protection compliance
- **OJK Compliance:** Adherence to Indonesian financial regulations
- **Regular Audits:** Quarterly access reviews and annual security assessments

### 🛡️ **Data Protection**
- **Encryption:** All sensitive data encrypted at rest and in transit
- **Data Retention:** Automated data lifecycle management
- **Backup Strategy:** Daily backups with 7-year retention
- **Disaster Recovery:** RTO: 4 hours, RPO: 1 hour

---

## Risk Assessment Matrix

| Risk Level | Roles | Mitigation Measures |
|------------|-------|-------------------|
| **Critical** | admin | MFA, IP restrictions, session monitoring, approval workflows |
| **High** | validator, bank_staff | MFA, regular access reviews, activity monitoring |
| **Medium** | agent, checker_agent, insurance, collector | Strong passwords, session timeouts, role-based restrictions |
| **Low** | user, wirausaha, perusahaan | Standard authentication, self-service limitations |

---

## Change Management

### 📝 **Access Request Process**
1. **Request Submission:** Via internal ticketing system
2. **Manager Approval:** Direct supervisor approval required
3. **Security Review:** IT security team assessment
4. **Implementation:** Access granted within 24 hours
5. **Verification:** Access testing and confirmation

### 🔄 **Regular Reviews**
- **Monthly:** User access verification
- **Quarterly:** Role permission audits
- **Annually:** Complete access matrix review
- **Ad-hoc:** Incident-driven reviews

### 📊 **Metrics & KPIs**
- **Access Request Processing Time:** Target < 24 hours
- **Failed Login Attempts:** Monitor and alert on anomalies
- **Privilege Escalation Requests:** Track and analyze trends
- **Compliance Score:** Maintain > 95% compliance rating

---

## Technical Implementation

### 🗄️ **Database Schema**
- **Users Table:** Central user management with role field
- **Role Constraints:** Database-level role validation
- **Relationship Tables:** Agent, bank, insurance, collector staff mappings
- **Audit Tables:** Comprehensive activity logging

### 🔧 **Application Layer**
- **Middleware Authentication:** JWT-based session management
- **Route Protection:** Role-based route access control
- **Component-level Security:** UI element visibility based on permissions
- **API Security:** Endpoint-level authorization checks

---

## Appendices

### 📋 **Appendix A: Role Hierarchy**
```
Admin (Level 10)
├── Validator (Level 8)
├── Checker Agent (Level 7)
├── Bank Staff (Level 6)
├── Agent (Level 5)
├── Insurance (Level 4)
├── Collector (Level 4)
├── Perusahaan (Level 3)
├── Wirausaha (Level 2)
└── User (Level 1)
```

### 📋 **Appendix B: Database Tables by Role Access**

| Table | admin | validator | agent | bank_staff | insurance | collector | others |
|-------|-------|-----------|-------|------------|-----------|-----------|---------|
| users | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| loan_applications | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅* |
| agent_companies | ✅ | ✅ | ✅* | ❌ | ❌ | ❌ | ❌ |
| banks | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| bank_products | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| insurance_assignments | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| collector_assignments | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| komponen_biaya | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅* |

*Limited access based on ownership/assignment

### 📋 **Appendix C: Emergency Access Procedures**
In case of system emergencies or critical business needs:
1. **Emergency Admin Access:** CTO approval required
2. **Temporary Privilege Escalation:** 24-hour maximum duration
3. **Incident Documentation:** All emergency access logged
4. **Post-incident Review:** Mandatory within 48 hours

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | January 2025 | System Administrator | Initial version |

**Next Review Date:** April 2025  
**Document Owner:** IT Security Team  
**Approved By:** Chief Technology Officer

---

*This document contains confidential information. Distribution is restricted to authorized personnel only.*