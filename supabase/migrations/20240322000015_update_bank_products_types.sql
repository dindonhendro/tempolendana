-- Update bank_products table to ensure proper type values for filtering
-- This migration adds sample data and ensures type field has proper values

-- First, let's make sure we have some sample banks if they don't exist
INSERT INTO public.banks (id, name, code, logo_url) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'Bank BNI', 'BNI', 'https://example.com/bni-logo.png'),
('550e8400-e29b-41d4-a716-446655440002', 'Bank Mandiri', 'MANDIRI', 'https://example.com/mandiri-logo.png'),
('550e8400-e29b-41d4-a716-446655440003', 'Bank BRI', 'BRI', 'https://example.com/bri-logo.png'),
('550e8400-e29b-41d4-a716-446655440004', 'Bank BTN', 'BTN', 'https://example.com/btn-logo.png')
ON CONFLICT (id) DO NOTHING;

-- Add sample bank products with proper types for each application type
INSERT INTO public.bank_products (id, bank_id, name, type, interest_rate, min_amount, max_amount, min_tenor, max_tenor) VALUES 
-- BNI Products
('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'KUR PMI BNI', 'pmi placement', 6.0, 5000000, 100000000, 6, 36),
('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'KUR Perumahan PMI BNI', 'kur rumah', 5.5, 50000000, 500000000, 12, 240),
('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Rumah Subsidi PMI BNI', 'subsidi rumah', 5.0, 30000000, 200000000, 12, 180),
('650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'KUR Wirausaha PMI BNI', 'wirausaha', 6.5, 10000000, 200000000, 6, 60),
('650e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', 'KUR Peternak PMI BNI', 'peternak', 6.0, 15000000, 150000000, 12, 48),

-- Mandiri Products
('650e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', 'KUR PMI Mandiri', 'pmi placement', 6.2, 5000000, 120000000, 6, 36),
('650e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440002', 'KUR Perumahan PMI Mandiri', 'kur rumah', 5.8, 60000000, 600000000, 12, 240),
('650e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440002', 'Rumah Subsidi PMI Mandiri', 'subsidi rumah', 5.2, 35000000, 250000000, 12, 180),
('650e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440002', 'KUR Wirausaha PMI Mandiri', 'wirausaha', 6.8, 12000000, 250000000, 6, 60),
('650e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440002', 'KUR Peternak PMI Mandiri', 'peternak', 6.3, 18000000, 180000000, 12, 48),

-- BRI Products
('650e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440003', 'KUR PMI BRI', 'pmi placement', 5.8, 4000000, 90000000, 6, 36),
('650e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440003', 'KUR Perumahan PMI BRI', 'kur rumah', 5.3, 45000000, 450000000, 12, 240),
('650e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440003', 'Rumah Subsidi PMI BRI', 'subsidi rumah', 4.8, 25000000, 180000000, 12, 180),
('650e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440003', 'KUR Wirausaha PMI BRI', 'wirausaha', 6.3, 8000000, 180000000, 6, 60),
('650e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440003', 'KUR Peternak PMI BRI', 'peternak', 5.8, 12000000, 120000000, 12, 48),

-- BTN Products
('650e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440004', 'KUR PMI BTN', 'pmi placement', 6.1, 6000000, 110000000, 6, 36),
('650e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440004', 'KUR Perumahan PMI BTN', 'kur rumah', 5.6, 55000000, 550000000, 12, 240),
('650e8400-e29b-41d4-a716-446655440018', '550e8400-e29b-41d4-a716-446655440004', 'Rumah Subsidi PMI BTN', 'subsidi rumah', 5.1, 40000000, 300000000, 12, 180),
('650e8400-e29b-41d4-a716-446655440019', '550e8400-e29b-41d4-a716-446655440004', 'KUR Wirausaha PMI BTN', 'wirausaha', 6.6, 11000000, 220000000, 6, 60),
('650e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440004', 'KUR Peternak PMI BTN', 'peternak', 6.1, 16000000, 160000000, 12, 48)
ON CONFLICT (id) DO NOTHING;
