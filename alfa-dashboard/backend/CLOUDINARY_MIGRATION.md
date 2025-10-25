# Cloudinary Migration Guide for Alfa Motors

This guide will help you migrate your existing car images from local storage to Cloudinary, enabling your images to work on Vercel.

## Step 1: Create a Cloudinary Account

1. Go to https://cloudinary.com
2. Sign up for a **FREE account** (includes 25GB storage and 25GB bandwidth per month)
3. After signup, you'll be taken to your dashboard

## Step 2: Get Your Cloudinary Credentials

On your Cloudinary dashboard, you'll see:
- **Cloud Name**: (e.g., `dxxxxxxxx`)
- **API Key**: (e.g., `123456789012345`)
- **API Secret**: (Click "Show" to reveal it)

## Step 3: Add Credentials to Your .env File

Open your `.env` file in the backend folder and add:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
NODE_ENV=production
```

Replace the values with your actual Cloudinary credentials.

## Step 4: Run the Migration Script

Open your terminal in the backend folder and run:

```bash
cd /Users/labh/Desktop/Projects/alfa-motors/alfa-dashboard/backend
node scripts/migrateImagesToCloudinary.js
```

This will:
- Find all cars in your database
- Upload local images to Cloudinary
- Update the database with new Cloudinary URLs
- Show you a summary of the migration

**Note:** The script is safe to run multiple times - it will skip images that are already migrated.

## Step 5: Add Environment Variables to Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add these variables:
   - `CLOUDINARY_CLOUD_NAME` = your_cloud_name
   - `CLOUDINARY_API_KEY` = your_api_key
   - `CLOUDINARY_API_SECRET` = your_api_secret
   - `NODE_ENV` = production
   - `MONGO_URI` = your_mongodb_connection_string
   - `JWT_SECRET` = your_jwt_secret

5. Click "Save"

## Step 6: Deploy to Vercel

```bash
# If using Vercel CLI
vercel --prod

# Or push to your connected Git repository
git add .
git commit -m "Add Cloudinary support for image storage"
git push
```

## How It Works

### Development (Local)
- Images are stored in `utils/carimages/` folder
- Works as before with local file storage

### Production (Vercel)
- Images are uploaded to Cloudinary cloud storage
- Database stores Cloudinary URLs instead of filenames
- Images are accessible from anywhere

## Testing

After migration:

1. **Test locally**: Start your server and verify images still load
2. **Test on Vercel**: Deploy and check if images appear correctly
3. **Upload new image**: Try adding a new car with photos
4. **Delete image**: Try deleting a photo to ensure cleanup works

## Troubleshooting

### Images not showing after migration?
- Check if Cloudinary credentials are correct in .env
- Verify the migration script completed successfully
- Check browser console for CORS errors

### Upload failing?
- Ensure your Cloudinary account is active
- Check if you've exceeded free tier limits
- Verify API credentials in environment variables

### Mixed local and cloud images?
- The system supports both! You can have some local and some on Cloudinary
- Run the migration script again to upload remaining local images

## Cost Considerations

**Cloudinary Free Tier:**
- 25 GB storage
- 25 GB bandwidth/month
- 25,000 transformations/month

This should be sufficient for a car dealership website. If you exceed limits, consider:
1. Upgrading to a paid plan
2. Optimizing image sizes before upload
3. Using Cloudinary's automatic format and quality optimization

## Reverting (If Needed)

If you want to go back to local storage only:

1. In `routes/carRoutes.js`, change the import back:
   ```javascript
   const upload = require("../utils/fileUpload");
   ```

2. Remove Cloudinary environment variables

3. Restart your server

## Need Help?

- Cloudinary Documentation: https://cloudinary.com/documentation
- Check the migration script output for detailed error messages
- Ensure all environment variables are set correctly
