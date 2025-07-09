-- Run this in Supabase SQL Editor after your first user signs up
-- Replace 'your-email@example.com' with your actual email

UPDATE public.users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- Verify admin user was created
SELECT id, email, role, created_at 
FROM public.users 
WHERE role = 'admin';