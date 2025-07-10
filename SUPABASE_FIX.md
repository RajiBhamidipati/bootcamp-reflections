# 🔧 Supabase Setup Fix Guide

## 🚨 Issue Detected
**Infinite recursion in RLS policy for 'users' table**

This happens when RLS policies reference the same table they're protecting, creating a loop.

## 🛠️ Step-by-Step Fix

### Step 1: Access Supabase Dashboard
1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your `muzedjmymisbfbkdoyev` project

### Step 2: Open SQL Editor
1. In your Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New Query"**

### Step 3: Reset Database Schema
Copy and paste the entire contents of `database-schema.sql` into the SQL editor and run it.

This will:
- ✅ Create all required tables with proper structure
- ✅ Set up correct RLS policies (no infinite recursion)
- ✅ Add necessary indexes for performance
- ✅ Create triggers for auto-updating timestamps
- ✅ Set up user signup handling

### Step 4: Verify Tables Created
After running the schema, you should see:
- ✅ `users`
- ✅ `reflections` 
- ✅ `analytics`
- ✅ `notifications`
- ✅ `blog_posts`
- ✅ `admin_settings`

### Step 5: Set Up Authentication
1. Go to **Authentication → Settings** in Supabase dashboard
2. Add your app URL to **Site URL**: `https://bootcamp-reflections.vercel.app`
3. Add redirect URLs:
   - `https://bootcamp-reflections.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback` (for development)

### Step 6: Create Admin User
1. Sign up through your application once deployed
2. Find your user ID in the `users` table
3. Run this SQL to make yourself admin:

```sql
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

### Step 7: Test the Fix
Run our verification script again:
```bash
node simple-test.js
```

You should see: `Connection successful!`

## 🔍 What Was Wrong

The previous setup likely had RLS policies that looked like:

```sql
-- BAD: This causes infinite recursion
CREATE POLICY "user_policy" ON users
FOR SELECT USING (
  id = (SELECT id FROM users WHERE auth.uid() = id)  -- ❌ Recursion!
);
```

Our fixed version uses:
```sql
-- GOOD: Direct reference, no recursion
CREATE POLICY "Users can view own profile" ON users
FOR SELECT USING (auth.uid() = id);  -- ✅ No recursion
```

## 🎯 Next Steps After Fix

1. **Test Connection**: Run verification script
2. **Deploy App**: Proceed with deployment
3. **Create Admin**: Set up your admin account
4. **Test Features**: Verify all functionality works

## 📞 Need Help?

If you encounter issues:
1. Check Supabase logs in dashboard
2. Verify all environment variables match your project
3. Ensure RLS policies are not conflicting
4. Check that authentication is properly configured