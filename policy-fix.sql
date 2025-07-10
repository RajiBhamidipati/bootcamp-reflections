-- =====================================================
-- TARGETED POLICY FIX - Remove Recursion
-- =====================================================

-- Check current policies causing issues
SELECT 'Current problematic policies:' as info;
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'users';

-- =====================================================
-- NUCLEAR OPTION: COMPLETELY RESET USERS TABLE RLS
-- =====================================================

-- Step 1: Drop ALL policies on users table
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Service role can manage users" ON public.users;
DROP POLICY IF EXISTS "enable_read_own_profile" ON public.users;
DROP POLICY IF EXISTS "enable_update_own_profile" ON public.users;
DROP POLICY IF EXISTS "enable_admin_read_all_users" ON public.users;
DROP POLICY IF EXISTS "Users can view own reflections" ON public.users;
DROP POLICY IF EXISTS "enable_read_own_reflections" ON public.users;

-- Drop any other policies that might exist
DO $$ 
DECLARE 
    pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'users' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.users';
    END LOOP;
END $$;

-- Step 2: Disable RLS completely on users table
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Step 3: Wait a moment and re-enable with SIMPLE policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Step 4: Create VERY SIMPLE policies with no subqueries
CREATE POLICY "simple_user_select" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "simple_user_update" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Step 5: Add service role policy for admin operations
CREATE POLICY "service_role_all_access" ON public.users
    FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- TEST THE FIX
-- =====================================================

-- Test if we can now query users table without recursion
SELECT 'Testing users table access...' as test;
SELECT count(*) as user_count FROM public.users;

SELECT 'Policy fix completed!' as status;
SELECT 'Current policies on users table:' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'users' AND schemaname = 'public';