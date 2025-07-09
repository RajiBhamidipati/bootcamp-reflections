-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create reflections table
CREATE TABLE IF NOT EXISTS public.reflections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('daily', 'weekly', 'project', 'mood')),
    title TEXT NOT NULL,
    content JSONB NOT NULL,
    mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 10),
    sentiment_score DECIMAL(3,2) CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
    keywords TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create analytics table
CREATE TABLE IF NOT EXISTS public.analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    mood_average DECIMAL(3,2) NOT NULL,
    stress_average DECIMAL(3,2) NOT NULL,
    energy_average DECIMAL(3,2) NOT NULL,
    reflection_count INTEGER DEFAULT 0,
    sentiment_score DECIMAL(3,2) DEFAULT 0,
    keywords TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, date)
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

-- Create admin_settings table
CREATE TABLE IF NOT EXISTS public.admin_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    notification_enabled BOOLEAN DEFAULT TRUE,
    reminder_time TEXT DEFAULT '18:00',
    export_format TEXT DEFAULT 'csv' CHECK (export_format IN ('csv', 'json', 'pdf')),
    analytics_retention_days INTEGER DEFAULT 365,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reflections_user_id ON public.reflections(user_id);
CREATE INDEX IF NOT EXISTS idx_reflections_created_at ON public.reflections(created_at);
CREATE INDEX IF NOT EXISTS idx_reflections_type ON public.reflections(type);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON public.analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON public.analytics(date);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);

-- Create GIN index for full-text search on reflection content
CREATE INDEX IF NOT EXISTS idx_reflections_content_gin ON public.reflections USING GIN (content);
CREATE INDEX IF NOT EXISTS idx_reflections_keywords_gin ON public.reflections USING GIN (keywords);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Users can only see and update their own profile
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Users can only see their own reflections
CREATE POLICY "Users can view own reflections" ON public.reflections
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reflections" ON public.reflections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reflections" ON public.reflections
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reflections" ON public.reflections
    FOR DELETE USING (auth.uid() = user_id);

-- Users can only see their own analytics
CREATE POLICY "Users can view own analytics" ON public.analytics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics" ON public.analytics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analytics" ON public.analytics
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Admin policies
CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can view all reflections" ON public.reflections
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can view all analytics" ON public.analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Blog posts are publicly readable
CREATE POLICY "Blog posts are publicly readable" ON public.blog_posts
    FOR SELECT USING (published = TRUE);

-- Admins can manage blog posts
CREATE POLICY "Admins can manage blog posts" ON public.blog_posts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admins can manage settings
CREATE POLICY "Admins can manage settings" ON public.admin_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create functions for automatic updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER handle_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_reflections_updated_at
    BEFORE UPDATE ON public.reflections
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_blog_posts_updated_at
    BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_admin_settings_updated_at
    BEFORE UPDATE ON public.admin_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Create function to calculate daily analytics
CREATE OR REPLACE FUNCTION public.calculate_daily_analytics(user_uuid UUID, target_date DATE)
RETURNS VOID AS $$
DECLARE
    mood_avg DECIMAL(3,2);
    stress_avg DECIMAL(3,2);
    energy_avg DECIMAL(3,2);
    reflection_cnt INTEGER;
    sentiment_avg DECIMAL(3,2);
    keyword_array TEXT[];
BEGIN
    -- Calculate averages from reflections on target date
    SELECT 
        COALESCE(AVG((content->>'overall_mood')::INTEGER), 0),
        COALESCE(AVG((content->>'stress_level')::INTEGER), 0),
        COALESCE(AVG((content->>'energy_level')::INTEGER), 0),
        COUNT(*),
        COALESCE(AVG(sentiment_score), 0),
        ARRAY_AGG(DISTINCT keyword ORDER BY keyword)
    INTO mood_avg, stress_avg, energy_avg, reflection_cnt, sentiment_avg, keyword_array
    FROM public.reflections
    WHERE user_id = user_uuid 
    AND DATE(created_at) = target_date
    AND keywords IS NOT NULL
    AND array_length(keywords, 1) > 0;

    -- Insert or update analytics record
    INSERT INTO public.analytics (
        user_id, date, mood_average, stress_average, 
        energy_average, reflection_count, sentiment_score, keywords
    )
    VALUES (
        user_uuid, target_date, mood_avg, stress_avg, 
        energy_avg, reflection_cnt, sentiment_avg, 
        COALESCE(keyword_array, '{}')
    )
    ON CONFLICT (user_id, date)
    DO UPDATE SET
        mood_average = EXCLUDED.mood_average,
        stress_average = EXCLUDED.stress_average,
        energy_average = EXCLUDED.energy_average,
        reflection_count = EXCLUDED.reflection_count,
        sentiment_score = EXCLUDED.sentiment_score,
        keywords = EXCLUDED.keywords;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert initial admin settings
INSERT INTO public.admin_settings (id) 
VALUES (uuid_generate_v4()) 
ON CONFLICT DO NOTHING;