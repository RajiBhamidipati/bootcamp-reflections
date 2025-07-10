# Deployment Guide - Bootcamp Reflections

This guide explains how to deploy the Bootcamp Reflections application to production.

## Prerequisites

1. **Supabase Account**: Set up a Supabase project with the required database schema
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **Environment Variables**: Prepare your production environment variables

## Quick Deploy

### Option 1: One-Click Deploy (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/bootcamp-reflections)

### Option 2: CLI Deployment

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Run the deployment script:
   ```bash
   ./deploy.sh prod
   ```

## Manual Deployment Steps

### 1. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL schema from `admin-setup.sql` in the Supabase SQL editor
3. Configure authentication providers in Supabase dashboard
4. Note down your project URL and API keys

### 2. Configure Environment Variables

Set the following environment variables in your Vercel dashboard:

#### Required Variables:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your_random_secret_string
```

#### Optional Variables:
```bash
NEXT_PUBLIC_PWA_SW_PATH=/sw.js
NEXT_PUBLIC_PWA_SCOPE=/
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

### 3. Deploy to Vercel

1. **Connect Repository**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Project**:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. **Set Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add all required variables listed above

4. **Deploy**:
   - Click "Deploy"
   - Wait for build completion

### 4. Post-Deployment Configuration

1. **Custom Domain** (Optional):
   - Go to Project Settings → Domains
   - Add your custom domain

2. **Authentication Setup**:
   - Update Supabase Auth settings with your production URL
   - Add your domain to allowed origins

3. **Database Configuration**:
   - Verify RLS policies are enabled
   - Test admin user creation

## Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes | `https://abc123.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `NEXT_PUBLIC_APP_URL` | Production app URL | Yes | `https://reflections.vercel.app` |
| `NEXTAUTH_SECRET` | Random secret for auth | Yes | `random-32-character-string` |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | Enable analytics features | No | `true` |

## Troubleshooting

### Common Issues:

1. **Build Fails**:
   - Check environment variables are set correctly
   - Verify Supabase connection
   - Check for TypeScript/ESLint errors

2. **Authentication Not Working**:
   - Verify Supabase auth settings
   - Check redirect URLs in Supabase dashboard
   - Ensure environment variables are correct

3. **Database Connection Issues**:
   - Verify RLS policies are enabled
   - Check user permissions
   - Ensure service role key is correct

### Deployment Logs:

Check Vercel deployment logs for detailed error messages:
1. Go to Vercel Dashboard
2. Select your project
3. Click on "Functions" or "Deployments"
4. View logs for debugging

## Security Considerations

1. **Environment Variables**: Never commit secrets to version control
2. **HTTPS**: Always use HTTPS in production
3. **CSP Headers**: Content Security Policy headers are configured
4. **RLS**: Row Level Security is enabled in Supabase
5. **CORS**: Configure CORS settings in Supabase

## Performance Optimization

1. **Next.js Optimization**: 
   - Image optimization enabled
   - Automatic code splitting
   - Static site generation where possible

2. **Database**:
   - Enable connection pooling in Supabase
   - Add database indexes for frequently queried fields

3. **Monitoring**:
   - Set up Vercel Analytics
   - Monitor Core Web Vitals
   - Track error rates

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Vercel deployment logs
3. Check Supabase logs
4. Verify environment variables are set correctly

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)