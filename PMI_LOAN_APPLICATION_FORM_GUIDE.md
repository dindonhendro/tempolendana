# PMI Loan Application Form - Complete Guide

## Overview
The PMI (Pekerja Migran Indonesia) Loan Application Form is a comprehensive multi-step form designed to facilitate loan applications for Indonesian migrant workers. The system supports two types of applications:

1. **PMI Standard** - Full application with agent selection
2. **KUR Wirausaha PMI** - Simplified 3-step application for entrepreneurship credit

---

## Application Steps

### Standard PMI Application (10 Steps)

#### Step 1: Personal Information
**Purpose**: Collect basic personal data of the applicant

**Required Fields**:
- Full Name *
- Gender *
- Age *
- Place of Birth *
- Date of Birth *
- Phone Number *
- Email *
- NIK KTP (National ID Number) *
- Last Education *
- ID PMI (Nomor Sisko) *
- Address (KTP)
- Current Address (Domicile)
- Mother's Name
- Spouse Information (if applicable):
  - Spouse Name
  - Spouse KTP
  - Spouse Phone
  - Spouse Address

**Validation**: All fields marked with * must be filled before proceeding to next step.

---

#### Step 2: Agent Selection
**Purpose**: Select P3MI (Penempatan Pekerja Migran Indonesia) agent/company

**Fields**:
- Select Agent Company from dropdown list
- Option: "Belum ada agent" (No agent yet)

**Note**: If "Belum ada agent" is selected, the form skips several steps and goes directly to summary.

**Special Case**: For KUR Wirausaha, agent is automatically assigned (ID: e558e9a3-0438-4e8c-b09f-bad255f5d715)

---

#### Step 3: Bank Selection & Loan Details
**Purpose**: Choose bank and specify loan amount

**Fields**:
- **Select Bank**: Choose from available partner banks
- **Select Bank Product**: Products filtered based on submission type (PMI/KUR_WIRAUSAHA_PMI)
- **Product Type**: Auto-filled based on selected product
- **Product Description**: Detailed information about selected product
- **Loan Amount (Rp)** *: Amount requested
- **Tenor (Months)** *: Loan duration (e.g., 12, 24, 36 months)
- **Interest Rate**: Bank interest rate (default: 6% per year)
- **Grace Period (Months)** *: Number of months with no principal payment (typically 0-6 months)

**Validation**: Loan amount, tenor, and grace period are mandatory.

---

#### Step 4: Required Documents
**Purpose**: Upload essential documents

**Required Documents**:
- **KTP (ID Card)**: Photo/scan of national ID
- **Selfie KTP**: Selfie photo holding ID card
- **Dokumen Persetujuan Data & Privacy**: Data privacy consent form

**Upload Process**:
1. Click "Choose File" button
2. Select document from device
3. File uploads automatically to Supabase Storage
4. Status shows: idle → uploading → success/error
5. Green checkmark (✓) appears on successful upload

**File Storage Path**: `loan-documents/{userId}/{documentType}/{filename}`

---

#### Step 5: Additional Documents
**Purpose**: Upload supporting documents

**Documents**:
- Surat Permohonan Kredit (Credit Application Letter)
- Dokumen Kartu Keluarga (Family Card)
- Dokumen Paspor (Passport)
- Dokumen Surat Nikah (Marriage Certificate) - if applicable
- Pas Foto 3x4 (3x4 ID Photo)
- Dokumen KTP Keluarga/Penjamin (Guarantor's ID)
- Surat Pernyataan Orang Tua/Wali (Parental Statement)
- Surat Izin Orang Tua/Wali (Parental Consent)

**Optional**: Not all documents may be required depending on applicant's status.

---

#### Step 6: Other Documents
**Purpose**: Upload employment and banking documents

**Documents**:
- **Dokumen Perjanjian Penempatan PMI**: PMI placement agreement
- **Dokumen Perjanjian Kerja**: Work contract
- **Surat Keterangan P3MI**: P3MI certificate letter
- **Info SLIK Bank**: Banking credit history (SLIK report)
- **Dokumen Standing Instruction**: Standing instruction document
- **Dokumen Lain 1 & 2**: Additional supporting documents

---

#### Step 7: Work Information
**Purpose**: Collect employment details abroad

**Fields**:
- **Education Institution**: Training institution name
- **Major/Specialization**: Field of expertise
- **Work Experience**: Previous work experience
- **Work Location**: Destination country/region
- **Negara Penempatan**: Placement country
- **Tanggal Keberangkatan**: Departure date
- **Employer Information**:
  - Nama Pemberi Kerja (Employer name)
  - Telp Pemberi Kerja (Employer phone)
  - Alamat Pemberi Kerja (Employer address)

---

#### Step 8: Cost Components (Komponen Biaya)
**Purpose**: Detail all costs related to PMI placement

**A. Biaya Persiapan Penempatan (Placement Preparation Costs)**:
- Biaya Pelatihan (Training fee)
- Biaya Sertifikasi (Certification fee)
- Biaya Jasa Perusahaan (Company service fee)
- Biaya Transportasi Lokal (Local transportation)
- Biaya Visa Kerja (Work visa fee)
- Biaya Tiket Keberangkatan (Departure ticket)
- Biaya Tiket Pulang (Return ticket)
- Biaya Akomodasi (Accommodation)

**B. Biaya Berkaitan dengan Penempatan (Placement-Related Costs)**:
- Biaya Pemeriksaan Kesehatan (Health examination)
- Biaya Jaminan Sosial (Social security)
- Biaya Apostille (Apostille certification)

**C. Biaya Lain-Lain (Other Costs)**:
- Biaya Lain-Lain 1 & 2
- Keterangan Biaya Lain (Description of other costs)

**Display**: Shows breakdown and total of all cost categories.

---

#### Step 9: Installment Plan (Tabel Angsuran)
**Purpose**: Calculate and display loan repayment schedule

**Calculation Method**: Effective Installment (Angsuran Efektif)
- Uses declining balance method
- Interest calculated on remaining principal
- Fixed monthly payment (except grace period)

**Formula**:
```
Monthly Rate = Annual Rate / 12 / 100
Monthly Payment = (Principal × Monthly Rate) / (1 - (1 + Monthly Rate)^-Tenor)

During Grace Period: Interest only (or free, depending on bank)
Regular Period: Principal + Interest
```

**Installment Table Shows**:
- Month number
- Payment date
- Payment type (Grace Period/Regular)
- Principal amount
- Interest amount
- Total payment
- Remaining balance

**Features**:
- **Print**: Generate printable installment schedule
- **Download**: Download as document
- **Upload Signed Table**: Upload signed installment agreement

**Important**: The signed installment table must be uploaded before final submission.

---

#### Step 10: Summary & Submission
**Purpose**: Review all information and submit application

**Consent Checkboxes** (All required):
1. ☐ I consent to the loan application and understand the terms
2. ☐ I consent to sharing my data with the bank and relevant parties
3. ☐ I consent to credit checks and verification processes

**Summary Sections**:
- Personal Information
- Agent Company
- Loan Details
- Uploaded Documents Status
- Work Information
- Cost Components Summary
- Installment Summary

**Validation Before Submission**:
- All required documents must be uploaded
- All three consent checkboxes must be checked
- Signed installment table must be uploaded

**Submit Button**: Becomes active only when all requirements are met.

---

### KUR Wirausaha PMI Application (Simplified 3 Steps)

For entrepreneurship credit applications, the process is streamlined:

**Step 1: Personal Information**
- Same as standard application Step 1
- Agent automatically assigned

**Step 2: Loan Details**
- Same as standard application Step 3
- Bank and product selection
- Loan amount and terms

**Step 3: Summary**
- Review and consent
- Direct submission without full documentation

---

## Technical Features

### File Upload System
**Storage**: Supabase Storage
**Bucket**: `loan-documents`
**Path Structure**: `{userId}/{documentType}/{filename}`

**Supported Status**:
- `idle`: No file selected
- `uploading`: File being uploaded
- `success`: Upload completed
- `error`: Upload failed

**Security**: RLS (Row Level Security) policies enforce access control

---

### Data Persistence
**Tables**:
- `loan_applications`: Main application data
- `komponen_biaya`: Cost components
- `banks`: Partner banks
- `bank_products`: Available loan products
- `agent_companies`: P3MI agents

**Features**:
- Auto-save capability
- Edit existing applications
- Transaction tracking
- Immutability hash for OJK compliance

---

### Session Management
**Keep-Alive Mechanism**: 
- Refreshes session every 5 minutes
- Prevents timeout during long form filling
- Ensures data isn't lost

---

## User Flow Diagram

```
START
  ↓
[Step 1: Personal Info] → Validate required fields
  ↓
[Step 2: Agent Selection] → Choose agent or "No agent yet"
  ↓                             ↓ (if no agent)
[Step 3: Bank & Loan]          Skip to Step 10
  ↓
[Step 4: Required Docs] → Upload KTP, Selfie, Privacy
  ↓
[Step 5: Additional Docs] → Upload supporting documents
  ↓
[Step 6: Other Docs] → Upload employment docs
  ↓
[Step 7: Work Info] → Enter employment details
  ↓
[Step 8: Cost Components] → Enter cost breakdown
  ↓
[Step 9: Installment Plan] → Review & upload signed table
  ↓
[Step 10: Summary] → Review all → Check consents → SUBMIT
  ↓
COMPLETED
```

---

## Validation Rules

### Field Validation:
- Email: Valid email format
- Phone: Valid phone number format
- NIK KTP: 16 digits
- Age: Must be 18+ years old
- Loan Amount: Must be > 0
- Tenor: Must be > 0

### Document Validation:
- File size limits (enforced by storage)
- Supported formats: PDF, JPG, PNG
- Required documents must be uploaded

### Consent Validation:
- All 3 consent checkboxes must be checked
- Signed installment table required

---

## Status Workflow

**Application Status Flow**:
1. `Submitted` - Initial submission
2. `Under Review` - Being reviewed by agent/bank
3. `Approved` - Approved by bank
4. `Rejected` - Application rejected
5. `Disbursed` - Loan disbursed

---

## Special Notes

### Grace Period:
- Allows PMI to delay principal payments
- Typically 0-6 months
- During grace period: Interest-only or free (bank-dependent)
- After grace period: Regular installments begin

### Agent Assignment:
- Standard: User selects from agent companies
- KUR Wirausaha: Auto-assigned to default agent
- "Belum ada agent": Option for users without agent

### Cost Components:
- Required for transparency (OJK regulation)
- Stored in separate `komponen_biaya` table
- Shows total cost of PMI placement

### OJK Compliance:
- Transaction ID tracking
- IP address logging
- Data immutability hash
- Consent logging
- Complete audit trail

---

## Error Handling

**Common Errors**:
- Session timeout → Auto-refresh every 5 min
- Upload failure → Retry upload
- Missing required fields → Validation alerts
- Network issues → Error messages with retry option

---

## API Integration

### Supabase Functions:
- `loan_applications.insert()`: Create new application
- `loan_applications.update()`: Update existing
- `komponen_biaya.insert()`: Save cost data
- `storage.upload()`: Upload documents

### Transaction Tracking:
- Every submission gets unique transaction ID
- IP address captured for security
- Timestamp recorded (OJK requirement)

---

## Best Practices for Users

1. **Prepare Documents**: Gather all required documents before starting
2. **Stable Connection**: Ensure stable internet during upload
3. **Review Carefully**: Check all information in summary step
4. **Save Transaction ID**: Keep transaction ID for tracking
5. **Read Terms**: Understand installment obligations before signing

---

## Support & Troubleshooting

**If upload fails**:
- Check file format (PDF/JPG/PNG)
- Check file size
- Check internet connection
- Retry upload

**If validation fails**:
- Review error messages
- Fill in missing required fields
- Correct invalid data formats

**If session expires**:
- Application auto-refreshes every 5 minutes
- If logged out, log back in
- Data may be preserved if auto-save enabled

---

*Last Updated: 2025*
*Version: 1.0*
