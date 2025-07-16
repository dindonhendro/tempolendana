-- First, drop the existing check constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Add the new check constraint that includes the insurance role
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'admin', 'agent', 'bank_staff', 'validator', 'insurance'));

-- Update any existing rows that might have invalid roles to 'user' as default
-- But preserve admin roles
UPDATE users 
SET role = CASE 
  WHEN role = 'admin' THEN 'admin'
  WHEN role IN ('user', 'agent', 'bank_staff', 'validator', 'insurance') THEN role
  ELSE 'user'
END
WHERE role IS NOT NULL;

-- Ensure temposuperx@lendana.id remains admin
UPDATE users 
SET role = 'admin' 
WHERE email = 'temposuperx@lendana.id';
