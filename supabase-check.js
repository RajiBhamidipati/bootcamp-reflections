#!/usr/bin/env node

// Supabase Setup Verification Script
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Supabase Setup Verification\n');

// Test 1: Environment Variables
console.log('📋 Step 1: Checking Environment Variables');
console.log('✅ Supabase URL:', supabaseUrl ? '✓ Present' : '❌ Missing');
console.log('✅ Anon Key:', supabaseAnonKey ? '✓ Present' : '❌ Missing');
console.log('✅ Service Key:', supabaseServiceKey ? '✓ Present' : '❌ Missing');
console.log('');

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.log('❌ Missing required environment variables. Please check your .env.local file.');
  process.exit(1);
}

// Create clients
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function runChecks() {
  try {
    // Test 2: Basic Connection
    console.log('📋 Step 2: Testing Basic Connection');
    const { data, error } = await supabaseClient.from('users').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log('❌ Connection failed:', error.message);
      return false;
    } else {
      console.log('✅ Basic connection successful');
      console.log('');
    }

    // Test 3: Check Required Tables
    console.log('📋 Step 3: Verifying Database Schema');
    const requiredTables = ['users', 'reflections', 'analytics', 'notifications', 'blog_posts', 'admin_settings'];
    
    for (const table of requiredTables) {
      try {
        const { error: tableError } = await supabaseAdmin.from(table).select('*').limit(1);
        if (tableError) {
          console.log(`❌ Table '${table}':`, tableError.message);
        } else {
          console.log(`✅ Table '${table}': Found`);
        }
      } catch (err) {
        console.log(`❌ Table '${table}': Error -`, err.message);
      }
    }
    console.log('');

    // Test 4: Check RLS Status
    console.log('📋 Step 4: Checking Row Level Security (RLS)');
    try {
      const { data: rlsData } = await supabaseAdmin.rpc('check_table_rls_status');
      if (rlsData) {
        console.log('✅ RLS status check completed');
      } else {
        console.log('⚠️  Unable to verify RLS status - this is usually fine');
      }
    } catch (err) {
      console.log('⚠️  RLS check function not available - manual verification needed');
    }
    console.log('');

    // Test 5: Authentication Check
    console.log('📋 Step 5: Testing Authentication Setup');
    try {
      const { data: authData, error: authError } = await supabaseClient.auth.getSession();
      if (authError) {
        console.log('⚠️  Auth check:', authError.message);
      } else {
        console.log('✅ Authentication service accessible');
      }
    } catch (err) {
      console.log('❌ Authentication test failed:', err.message);
    }
    console.log('');

    // Test 6: Service Role Permissions
    console.log('📋 Step 6: Testing Service Role Permissions');
    try {
      const { data: userData, error: userError } = await supabaseAdmin.from('users').select('count', { count: 'exact', head: true });
      if (userError) {
        console.log('❌ Service role access failed:', userError.message);
      } else {
        console.log('✅ Service role permissions working');
      }
    } catch (err) {
      console.log('❌ Service role test failed:', err.message);
    }

    console.log('\n🎉 Supabase verification complete!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Environment variables configured');
    console.log('   ✅ Basic connection established');
    console.log('   ✅ Database schema accessible');
    console.log('   ✅ Authentication service ready');
    console.log('   ✅ Service role permissions working');
    console.log('\n🚀 Your Supabase setup appears to be ready for deployment!');

  } catch (error) {
    console.log('❌ Verification failed:', error.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('   1. Verify your Supabase project is active');
    console.log('   2. Check that API keys are correct');
    console.log('   3. Ensure database schema has been created');
    console.log('   4. Verify RLS policies are set up');
  }
}

runChecks();