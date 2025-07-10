#!/bin/bash

# Bootcamp Reflections Deployment Script
# This script handles deployment to Vercel

set -e

echo "🚀 Starting deployment process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found. Please run this script from the project root."
  exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
  echo "📦 Installing Vercel CLI..."
  npm install -g vercel
fi

# Run pre-deployment checks
echo "🔍 Running pre-deployment checks..."

# Check if environment file exists
if [ ! -f ".env.local" ]; then
  echo "⚠️  Warning: .env.local not found. Make sure environment variables are set in Vercel dashboard."
fi

# Run linting (non-blocking)
echo "🧹 Running linter..."
npm run lint || echo "⚠️  Linting warnings found, continuing deployment..."

# Run build test
echo "🏗️  Testing build..."
npm run build

if [ $? -eq 0 ]; then
  echo "✅ Build successful!"
else
  echo "❌ Build failed. Please fix errors before deploying."
  exit 1
fi

# Deploy based on argument
if [ "$1" = "preview" ]; then
  echo "🔍 Deploying to preview..."
  npm run deploy:preview
elif [ "$1" = "prod" ] || [ "$1" = "production" ]; then
  echo "🌟 Deploying to production..."
  npm run deploy
else
  echo "📋 Available deployment options:"
  echo "  ./deploy.sh preview    - Deploy to preview environment"
  echo "  ./deploy.sh prod       - Deploy to production"
  echo ""
  read -p "Choose deployment type (preview/prod): " choice
  case $choice in
    preview)
      echo "🔍 Deploying to preview..."
      npm run deploy:preview
      ;;
    prod|production)
      echo "🌟 Deploying to production..."
      npm run deploy
      ;;
    *)
      echo "❌ Invalid choice. Exiting."
      exit 1
      ;;
  esac
fi

echo "🎉 Deployment completed!"
echo "📋 Next steps:"
echo "   1. Set up environment variables in Vercel dashboard"
echo "   2. Configure custom domain (optional)"
echo "   3. Set up monitoring and analytics"