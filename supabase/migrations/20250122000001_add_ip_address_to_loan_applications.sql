ALTER TABLE loan_applications 
ADD COLUMN ip_address INET;

COMMENT ON COLUMN loan_applications.ip_address IS 'IP address of the user when submitting the loan application';