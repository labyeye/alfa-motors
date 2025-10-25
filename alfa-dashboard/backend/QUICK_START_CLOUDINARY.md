# Quick Start: Migrate Images to Cloudinary

## 🎯 Goal
Make your car images work on Vercel by moving them to Cloudinary cloud storage.

## 📋 Steps (5 minutes)

### 1. Get Cloudinary Account (FREE)
Visit: https://cloudinary.com/users/register/free
- Sign up for free account
- Copy your credentials from dashboard

### 2. Add Credentials to .env
```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NODE_ENV=production
```

### 3. Check Setup
```bash
npm run check-cloudinary
```

### 4. Migrate Images
```bash
npm run migrate-images
```

### 5. Add to Vercel
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add the same Cloudinary credentials
3. Redeploy

## ✅ Done!
Your images will now work on Vercel!

---

📖 For detailed instructions, see: [CLOUDINARY_MIGRATION.md](./CLOUDINARY_MIGRATION.md)
