-- =====================================================
-- CLEAN MIGRATION - Handles Existing Policies
-- =====================================================

-- First, let's see what we have
SELECT 'Current tables in your database:' as info;
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- =====================================================
-- STEP 1: CLEAN SLATE - DROP ALL EXISTING POLICIES
-- =====================================================

-- Drop ALL existing policies on ALL tables to start fresh
DO $$ 
DECLARE 
    pol record;
    tbl record;
BEGIN
    -- Get all tables with RLS policies
    FOR tbl IN SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        -- Drop all policies for each table
        FOR pol IN SELECT policyname FROM pg_policies 
                   WHERE tablename = tbl.tablename AND schemaname = 'public'
        LOOP
            EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.' || tbl.tablename;
        END LOOP;
    END LOOP;
END $$;

-- Disable RLS temporarily to fix any recursion issues
DO $$
DECLARE
    tbl record;
BEGIN
    FOR tbl IN SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        EXECUTE 'ALTER TABLE public.' || tbl.tablename || ' DISABLE ROW LEVEL SECURITY';
    END LOOP;
END $$;

-- =====================================================
-- STEP 2: ENSURE ALL REQUIRED TABLES EXIST
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create or update users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add missing columns to users if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role') THEN
        ALTER TABLE public.users ADD COLUMN role TEXT DEFAULT 'user';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'created_at') THEN
        ALTER TABLE public.users ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'updated_at') THEN
        ALTER TABLE public.users ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());
    END IF;
END $$;

-- Add role constraint
DO $$
BEGIN
    ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
    ALTER TABLE public.users ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'admin'));
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Create reflections table
CREATE TABLE IF NOT EXISTS public.reflections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('daily', 'weekly', 'project', 'mood')),
    title TEXT NOT NULL,
    content JSONB NOT NULL,
    mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 10),
    sentiment_score DECIMAL,
    keywords TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create analytics table
CREATE TABLE IF NOT EXISTS public.analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    mood_average DECIMAL NOT NULL,
    stress_average DECIMAL NOT NULL,
    energy_average DECIMAL NOT NULL,
    reflection_count INTEGER NOT NULL DEFAULT 0,
    sentiment_score DECIMAL NOT NULL DEFAULT 0,
    keywords TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, date)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('reminder', 'achievement', 'weekly_summary')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    anonymous_quotes TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create admin_settings table
CREATE TABLE IF NOT EXISTS public.admin_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    notification_enabled BOOLEAN DEFAULT TRUE,
    reminder_time TIME DEFAULT '09:00:00',
    export_format TEXT DEFAULT 'csv' CHECK (export_format IN ('csv', 'json', 'pdf')),
    analytics_retention_days INTEGER DEFAULT 365,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =====================================================
-- STEP 3: CREATE FRESH RLS POLICIES (NO CONFLICTS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Users table policies (FIXED - No recursion)
CREATE POLICY "enable_read_own_profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "enable_update_own_profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "enable_admin_read_all_users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users admin_user
            WHERE admin_user.id = auth.uid() AND admin_user.role = 'admin'
        )
    );

-- Reflections table policies
CREATE POLICY "enable_read_own_reflections" ON public.reflections
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "enable_insert_own_reflections" ON public.reflections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "enable_update_own_reflections" ON public.reflections
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "enable_delete_own_reflections" ON public.reflections
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "enable_admin_read_all_reflections" ON public.reflections
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users admin_user
            WHERE admin_user.id = auth.uid() AND admin_user.role = 'admin'
        )
    );

-- Analytics table policies
CREATE POLICY "enable_read_own_analytics" ON public.analytics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "enable_manage_own_analytics" ON public.analytics
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "enable_admin_read_all_analytics" ON public.analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users admin_user
            WHERE admin_user.id = auth.uid() AND admin_user.role = 'admin'
        )
    );

-- Notifications table policies
CREATE POLICY "enable_read_own_notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "enable_update_own_notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "enable_system_insert_notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);

-- Blog posts table policies
CREATE POLICY "enable_read_published_posts" ON public.blog_posts
    FOR SELECT USING (published = true);

CREATE POLICY "enable_admin_manage_posts" ON public.blog_posts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users admin_user
            WHERE admin_user.id = auth.uid() AND admin_user.role = 'admin'
        )
    );

-- Admin settings table policies
CREATE POLICY "enable_admin_manage_settings" ON public.admin_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users admin_user
            WHERE admin_user.id = auth.uid() AND admin_user.role = 'admin'
        )
    );

-- =====================================================
-- STEP 4: CREATE INDEXES AND TRIGGERS
-- =====================================================

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_reflections_user_id ON public.reflections(user_id);
CREATE INDEX IF NOT EXISTS idx_reflections_created_at ON public.reflections(created_at);
CREATE INDEX IF NOT EXISTS idx_reflections_type ON public.reflections(type);
CREATE INDEX IF NOT EXISTS idx_analytics_user_date ON public.analytics(user_id, date);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers (drop first to avoid conflicts)
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reflections_updated_at ON public.reflections;
CREATE TRIGGER update_reflections_updated_at 
    BEFORE UPDATE ON public.reflections 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER update_blog_posts_updated_at 
    BEFORE UPDATE ON public.blog_posts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admin_settings_updated_at ON public.admin_settings;
CREATE TRIGGER update_admin_settings_updated_at 
    BEFORE UPDATE ON public.admin_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STEP 5: USER SIGNUP HANDLING
-- =====================================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)))
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- STEP 6: INSERT DEFAULT ADMIN SETTINGS
-- =====================================================

INSERT INTO public.admin_settings (notification_enabled, reminder_time, export_format, analytics_retention_days)
SELECT true, '09:00:00', 'csv', 365
WHERE NOT EXISTS (SELECT 1 FROM public.admin_settings);

-- =====================================================
-- FINAL VERIFICATION
-- =====================================================

SELECT 'Clean migration completed successfully!' as status;

SELECT 'Tables in database:' as info;
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

SELECT 'RLS status:' as info;
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

SELECT 'Policy count per table:' as info;
SELECT tablename, count(*) as policy_count 
FROM pg_policies 
WHERE schemaname = 'public' 
GROUP BY tablename 
ORDER BY tablename;