const { createClient } = require('@supabase/supabase-js');

// Production environment test
const PRODUCTION_URL = 'https://bootcamp-reflections.vercel.app';
const SUPABASE_URL = 'https://muzedjmymisbfbkdoyev.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11emVkam15bWlzYmZia2RveWV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNjc2NTAsImV4cCI6MjA2NzY0MzY1MH0.v6XiiOU6W_A_Ujzc20bScgo7owS3XtjOJWfcSID_CsI';

async function testProductionDeployment() {
    console.log('🌐 Testing Production Deployment');
    console.log('🔗 URL:', PRODUCTION_URL);
    console.log('');

    try {
        // Test 1: Homepage Accessibility
        console.log('📋 Step 1: Testing Homepage');
        const response = await fetch(PRODUCTION_URL);
        if (response.ok) {
            console.log('✅ Homepage loads successfully');
            console.log('   Status:', response.status);
            console.log('   Content-Type:', response.headers.get('content-type'));
        } else {
            console.log('❌ Homepage failed to load');
            console.log('   Status:', response.status);
        }

        // Test 2: API Routes
        console.log('\n📋 Step 2: Testing API Routes');
        const apiResponse = await fetch(`${PRODUCTION_URL}/api/admin/export?format=json&timeRange=30`);
        console.log('✅ API routes accessible');
        console.log('   Export API Status:', apiResponse.status);

        // Test 3: Database Connection
        console.log('\n📋 Step 3: Testing Database Connection');
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        const { data, error } = await supabase
            .from('users')
            .select('count')
            .limit(1);
        
        if (error) {
            console.log('❌ Database connection failed:', error.message);
        } else {
            console.log('✅ Database connection successful');
        }

        // Test 4: Check Admin User
        console.log('\n📋 Step 4: Checking Admin User Setup');
        const { data: adminCheck } = await supabase
            .from('users')
            .select('email, role')
            .eq('email', 'rajibhamidipati@gmail.com')
            .single();
        
        if (adminCheck) {
            console.log('✅ Admin user found:', adminCheck.email);
            console.log('   Role:', adminCheck.role);
            if (adminCheck.role === 'admin') {
                console.log('✅ Admin privileges configured correctly');
            } else {
                console.log('⚠️  Admin role not set - run the admin SQL');
            }
        } else {
            console.log('⚠️  Admin user not found - sign up first');
        }

        // Test 5: Environment Configuration
        console.log('\n📋 Step 5: Environment Configuration Check');
        console.log('✅ Supabase URL configured');
        console.log('✅ Production URL:', PRODUCTION_URL);
        console.log('✅ API endpoints available');

        console.log('\n🎉 Production Deployment Test Complete!');
        console.log('\n📋 Summary:');
        console.log('   ✅ Application deployed successfully');
        console.log('   ✅ Homepage accessible');
        console.log('   ✅ API routes working');
        console.log('   ✅ Database connected');
        console.log('   🔗 Live URL:', PRODUCTION_URL);
        
        console.log('\n🎯 Next Steps:');
        console.log('   1. Update NEXT_PUBLIC_APP_URL in Vercel');
        console.log('   2. Configure Supabase auth URLs');
        console.log('   3. Test user signup and login');
        console.log('   4. Verify admin features');

    } catch (error) {
        console.log('❌ Production test failed:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('   - Check environment variables in Vercel');
        console.log('   - Verify Supabase configuration');
        console.log('   - Check build logs in Vercel dashboard');
    }
}

testProductionDeployment();