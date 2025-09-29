# Fix for 413 Content Too Large Error

## Problem
Getting "413 Content Too Large" error when updating car records via PUT request to Vercel-hosted API.

## Root Cause
Vercel has strict payload size limits (4-6MB for serverless functions). When uploading images with form data, the payload becomes too large.

## Solution Implemented

### Backend Changes (✅ Completed)

1. **Updated vercel.json** - Added function configuration for larger payloads:
```json
{
  "functions": {
    "server.js": {
      "maxDuration": 30,
      "memory": 1024
    }
  }
}
```

2. **Reduced Express body limits** - Changed from 20MB to 10MB in server.js:
```javascript
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
```

3. **Split car update endpoints**:
   - `PUT /api/cars/:id` - Text-only updates (JSON payload)
   - `PUT /api/cars/:id/photos` - Image uploads (multipart)
   - `POST /api/cars/:id/photo` - Single photo upload
   - `GET /api/cars/:id` - Get single car

### Frontend Changes Required

Update `EditCar.js` handleSubmit function to:

1. **For text-only updates**: Use JSON payload instead of FormData
```javascript
const textData = {
  brand: carData.make, // Note: API expects 'brand' 
  model: carData.model,
  // ... other fields
};

await axios.put(`/api/cars/${id}`, textData, {
  headers: {
    'Content-Type': 'application/json'
  }
});
```

2. **For image updates**: Use separate endpoint
```javascript
if (hasNewImages) {
  const formData = new FormData();
  carData.photos.forEach(file => formData.append('photos', file));
  
  await axios.put(`/api/cars/${id}/photos`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}
```

## Quick Fix
Replace line 197 in EditCar.js:

**From:**
```javascript
await axios.put(`http://localhost:2500/api/cars/${id}`, formData, {
```

**To:**
```javascript
// Check if uploading images
const hasImages = carData.photos && carData.photos.length > 0 && typeof carData.photos[0] !== 'string';
const endpoint = hasImages ? `/api/cars/${id}/photos` : `/api/cars/${id}`;

await axios.put(`http://localhost:2500${endpoint}`, formData, {
```

## Benefits
- ✅ Avoids 413 payload size errors  
- ✅ Faster text-only updates
- ✅ Better error handling
- ✅ Scalable for future features

## Testing
1. Try updating car text fields without uploading images
2. Try uploading only images 
3. Try uploading both text and images
4. Verify all updates work correctly

## Next Steps
1. Update frontend EditCar.js with proper conditional logic
2. Test all update scenarios
3. Update other components that update cars if needed
4. Consider implementing image compression for even larger files