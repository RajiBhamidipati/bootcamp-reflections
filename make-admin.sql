-- Make user admin
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'rajibhamidipati@gmail.com';

-- Verify admin user was created
SELECT id, email, role, created_at 
FROM public.users 
WHERE email = 'rajibhamidipati@gmail.com';

-- Show all users and their roles
SELECT email, role, created_at FROM public.users ORDER BY created_at;