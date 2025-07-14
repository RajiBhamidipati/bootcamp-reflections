# Bootcamp Reflections - Production-Ready PWA (LIVE)

A comprehensive Next.js 14 application for bootcamp reflections with advanced features including sentiment analysis, real-time synchronization, and progressive web app capabilities.

## 🚀 Features

### Core Features
- **User Authentication**: Secure email/password authentication with Supabase Auth
- **Private Reflection System**: Users can only see their own reflection data
- **Context-Aware Forms**: Dynamic reflection forms that adapt to bootcamp phases
- **Admin Dashboard**: Complete analytics and management interface
- **Data Export**: CSV, JSON, and PDF export capabilities
- **Real-time Synchronization**: Live updates across all connected devices
- **Mobile-Responsive Design**: Optimized for all screen sizes

### Advanced Features
- **Sentiment Analysis**: AI-powered analysis of reflection text
- **Mood Tracking**: Visual mood trends and analytics over time
- **Keyword Extraction**: Automatic identification of trending topics
- **Weekly/Daily Reports**: Automated summary generation
- **Blog Content Generation**: AI-powered blog posts from anonymous reflections
- **Progressive Web App**: Offline functionality and installable app
- **Push Notifications**: Configurable reflection reminders
- **Data Visualizations**: Interactive charts and graphs

## 🛠 Technical Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL database, Authentication, Real-time)
- **UI Components**: Radix UI, Headless UI, Lucide Icons
- **Charts**: Chart.js, React-Chartjs-2
- **Sentiment Analysis**: Natural language processing with Sentiment.js
- **PWA**: Next-PWA for offline functionality
- **Export**: jsPDF, Papa Parse for data export

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### 1. Clone the Repository
```bash
git clone <repository-url>
cd bootcamp-reflections
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_key

# PWA Configuration
NEXT_PUBLIC_PWA_SW_PATH=/sw.js
NEXT_PUBLIC_PWA_SCOPE=/

# Analytics Configuration
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

### 4. Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Copy and paste the contents of `src/lib/database.sql`
4. Execute the SQL to create tables, indexes, and policies

### 5. Authentication Setup

1. In Supabase Dashboard, go to Authentication > Settings
2. Configure the following:
   - **Site URL**: `http://localhost:3000` (development) or your production URL
   - **Redirect URLs**: Add your domain/callback URLs
   - **Email Templates**: Customize as needed

### 6. Run the Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🗄️ Database Schema

The application uses the following main tables:

### Users
- Extends Supabase auth.users with additional profile information
- Stores user roles (user/admin)

### Reflections
- Stores all reflection data with JSONB content
- Includes mood scores, sentiment analysis, and keywords
- Row-level security ensures privacy

### Analytics
- Daily aggregated data for each user
- Mood, stress, energy averages
- Keyword frequency and trends

### Blog Posts
- AI-generated blog content from anonymous reflections
- Admin-managed publication system

### Notifications
- System notifications and reminders
- Real-time delivery support

## 🔐 Security Features

- **Row Level Security (RLS)**: Users can only access their own data
- **Role-Based Access Control**: Admin vs. user permissions
- **Secure API Routes**: Server-side authentication checks
- **Environment Variables**: Sensitive data properly secured
- **Input Validation**: All forms include validation and sanitization

## 📱 PWA Features

### Installation
- **Add to Home Screen**: Installable on mobile and desktop
- **Offline Functionality**: Core features work without internet
- **Background Sync**: Data syncs when connection is restored

### Notifications
- **Push Notifications**: Reflection reminders and updates
- **Badge Updates**: Unread notification counts
- **Customizable Timing**: User-configurable reminder schedules

## 🎯 Admin Features

### Dashboard
- **User Management**: View and manage all users
- **Reflection Analytics**: Platform-wide insights and trends
- **Data Export**: Bulk export in multiple formats
- **Content Moderation**: Review and manage blog posts

### Analytics
- **User Engagement**: Activity tracking and patterns
- **Mood Trends**: Platform-wide sentiment analysis
- **Keyword Tracking**: Popular topics and themes
- **Usage Statistics**: Comprehensive usage reports

## 📊 Data Export

### Available Formats
- **CSV**: Spreadsheet-compatible data export
- **JSON**: Machine-readable structured data
- **PDF**: Formatted reports with visualizations

### Export Options
- **Date Range Filtering**: Export specific time periods
- **User Filtering**: Admin can export individual user data
- **Bulk Export**: Complete platform data export

## 🔄 Real-time Features

### Live Updates
- **Instant Reflection Updates**: Changes appear immediately
- **Notification Delivery**: Real-time push notifications
- **Analytics Refresh**: Live dashboard updates

### Synchronization
- **Multi-device Sync**: Data syncs across all user devices
- **Offline Support**: Changes sync when connectivity returns
- **Conflict Resolution**: Automatic handling of concurrent edits

## 🌐 Deployment

### Vercel Deployment (Recommended)

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Deploy to Vercel
   vercel --prod
   ```

2. **Environment Variables**
   Add all environment variables in Vercel Dashboard:
   - Go to Project Settings > Environment Variables
   - Add all variables from `.env.local`

3. **Domain Configuration**
   - Configure custom domain in Vercel Dashboard
   - Update Supabase redirect URLs with production domain

### Alternative Deployment Options

#### Netlify
1. Connect GitHub repository
2. Build command: `npm run build`
3. Publish directory: `out`
4. Add environment variables in Netlify Dashboard

#### Docker
```dockerfile
# Dockerfile included in project root
docker build -t bootcamp-reflections .
docker run -p 3000:3000 bootcamp-reflections
```

## 🔧 Configuration

### Supabase Configuration

1. **Database Policies**
   - Policies are automatically created by the SQL script
   - Users can only access their own data
   - Admins have read access to all data

2. **Real-time Setup**
   - Enable real-time for all tables in Supabase Dashboard
   - Configure row-level security for real-time

3. **Storage (Optional)**
   - Configure Supabase Storage for file uploads
   - Set up policies for user avatar images

### PWA Configuration

1. **Manifest File**
   - Located at `public/manifest.json`
   - Customize app name, icons, and theme colors

2. **Service Worker**
   - Automatically generated by Next-PWA
   - Handles caching and offline functionality

3. **Icons**
   - Add app icons to `public/` directory
   - Required sizes: 192x192, 512x512

## 🧪 Testing

### Development Testing
```bash
# Run linting
npm run lint

# Type checking
npm run type-check

# Build test
npm run build
```

### Production Testing
```bash
# Test production build locally
npm run build
npm run start
```

## 📈 Analytics & Monitoring

### Built-in Analytics
- **User Engagement**: Reflection frequency and patterns
- **Mood Trends**: Sentiment analysis over time
- **Feature Usage**: Most-used features and forms
- **Performance Metrics**: Response times and errors

### External Integration
- **Google Analytics**: Add GA4 tracking code
- **Sentry**: Error tracking and monitoring
- **Vercel Analytics**: Built-in performance monitoring

## 🔄 Maintenance

### Database Maintenance
- **Regular Backups**: Automated Supabase backups
- **Data Cleanup**: Archive old reflections if needed
- **Performance Monitoring**: Query optimization

### Application Updates
- **Dependency Updates**: Regular security updates
- **Feature Additions**: Modular architecture for easy expansion
- **Performance Optimization**: Continuous improvement

## 🐛 Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Check Supabase URL and keys
   - Verify redirect URLs in Supabase Dashboard

2. **Database Connection**
   - Ensure RLS policies are properly configured
   - Check service role key permissions

3. **PWA Installation**
   - Verify HTTPS in production
   - Check manifest.json configuration

4. **Real-time Updates**
   - Ensure real-time is enabled in Supabase
   - Check websocket connection

## 📚 API Reference

### Authentication
- `POST /api/auth/signin` - User sign in
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signout` - User sign out

### Reflections
- `GET /api/reflections` - Get user reflections
- `POST /api/reflections` - Create new reflection
- `PUT /api/reflections/[id]` - Update reflection
- `DELETE /api/reflections/[id]` - Delete reflection

### Analytics
- `GET /api/analytics` - Get user analytics
- `POST /api/analytics/generate` - Generate daily analytics

### Admin
- `GET /api/admin/users` - Get all users (admin only)
- `GET /api/admin/reflections` - Get all reflections (admin only)
- `GET /api/admin/export` - Export data (admin only)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section
- Review Supabase documentation for backend issues

---

## 🚀 Quick Start Commands

```bash
# Clone and setup
git clone <repository-url>
cd bootcamp-reflections
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run database migrations
# (Copy SQL from src/lib/database.sql to Supabase SQL Editor)

# Start development server
npm run dev

# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

---

**Built with ❤️ for the bootcamp community**# Environment variables updated
Wed  9 Jul 2025 15:30:21 BST: Force deployment with env vars
# Deployment trigger Thu 10 Jul 2025 14:52:02 BST
Deployment trigger Thu 10 Jul 2025 15:22:35 BST
# Cache bust - Mon 14 Jul 2025 14:05:25 BST
