-- Add 'wirausaha' role to the users table role constraint
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'agent', 'validator', 'bank_staff', 'insurance', 'collector', 'admin', 'wirausaha'));
