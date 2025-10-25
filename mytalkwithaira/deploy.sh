#!/bin/bash

# Aira Deployment Script
# This script helps you deploy Aira to Vercel

set -e

echo "🚀 Aira Deployment Script"
echo "=========================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "❌ Git repository not found. Please initialize git first:"
    echo "   git init"
    exit 1
fi

# Check if there are uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  You have uncommitted changes. Committing them now..."
    git add .
    git commit -m "Deployment: $(date '+%Y-%m-%d %H:%M:%S')"
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo ""
echo "📋 Pre-deployment Checklist:"
echo "============================"
echo ""
echo "Before deploying, make sure you have:"
echo "  ✓ Vercel account (https://vercel.com)"
echo "  ✓ GitHub account connected to Vercel"
echo "  ✓ All environment variables ready"
echo "  ✓ Lemonsqueezy webhook secret"
echo ""

read -p "Have you completed the checklist? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please complete the checklist before deploying."
    exit 1
fi

echo ""
echo "🔍 Running build check..."
npm run build

echo ""
echo "✅ Build successful!"
echo ""

echo "🚀 Deploying to Vercel..."
echo ""
echo "Choose deployment type:"
echo "  1) Preview (staging)"
echo "  2) Production"
echo ""
read -p "Enter choice (1 or 2): " choice

if [ "$choice" = "1" ]; then
    echo "Deploying to preview..."
    vercel
elif [ "$choice" = "2" ]; then
    echo "Deploying to production..."
    vercel --prod
else
    echo "Invalid choice"
    exit 1
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "  1. Visit your Vercel dashboard to verify deployment"
echo "  2. Update Lemonsqueezy webhook URL"
echo "  3. Test the payment flow"
echo "  4. Monitor logs for any errors"
echo ""
echo "For more information, see DEPLOYMENT_GUIDE.md"

