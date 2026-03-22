# Render Deployment Instructions

## ⚠️ CRITICAL: Environment Variables Required

The server will **crash on startup** if `MONGODB_URI` is not set. You MUST configure this in Render.

### Step 1: Set Environment Variables in Render Dashboard

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Select your service: **booking-system-backend**
3. Click **Environment** tab
4. Add these variables:

| Key | Value | Required? |
|-----|-------|-----------|
| `MONGODB_URI` | Your MongoDB connection string | **YES** |
| `ADMIN_PASSWORD` | Your admin password (default: admin123) | Yes |
| `NODE_ENV` | production | Optional (default in render.yaml) |
| `PORT` | 3000 | Optional (default in render.yaml) |

### Example MONGODB_URI Formats

**MongoDB Atlas (recommended for production):**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/qingyiu_clinic?retryWrites=true&w=majority
```

**Local MongoDB (development only):**
```
mongodb://localhost:27017/qingyiu_clinic
```

### Step 2: Deploy

1. After setting environment variables, click **Save Changes**
2. Go to **Manual Deploy** section
3. Click **Deploy latest commit**
4. Wait for build to complete (~2-3 minutes)

### Step 3: Verify Deployment

Check the logs in Render dashboard. You should see:

```
📋 Environment check:
   MONGODB_URI: ✓ configured
   PORT: 3000
   NODE_ENV: production
🔗 Connecting to MongoDB...
✅ Connected to MongoDB: qingyiu_clinic
╔═══════════════════════════════════════════════╗
║  青苗綜合醫療診所預約系統 v0.3.0                ║
║  Ching Yiu Clinic Booking System              ║
╠═══════════════════════════════════════════════╣
║  🚀 Server running on port 3000               ║
║  📍 http://localhost:3000                     ║
║  🔧 Admin API: /api/admin/*                    ║
║  🌐 Public API: /api/*                         ║
╚═══════════════════════════════════════════════╝
```

### Test Endpoints

```bash
# Health check (public)
curl https://booking-system-backend-2t8v.onrender.com/api/health

# Admin endpoints (require authentication)
curl https://booking-system-backend-2t8v.onrender.com/api/admin/clinics \
  -H "X-Admin-Token: admin123"
```

## Troubleshooting

### Server crashes with "MONGODB_URI environment variable is not set"

**Solution:** You haven't set the `MONGODB_URI` environment variable in Render. Follow Step 1 above.

### Server crashes with "MongoDB connection failed"

**Possible causes:**
1. MongoDB URI is incorrect
2. MongoDB is not accessible from Render (check IP whitelist if using Atlas)
3. Network connectivity issues

**Solution:** 
- Verify your MongoDB URI is correct
- For MongoDB Atlas: Add `0.0.0.0/0` to Network Access IP whitelist (or Render's IP range)
- Check Render logs for detailed error message

### All endpoints return 404

**Solution:** Check that Render is deploying from the correct directory. The `render.yaml` file should handle this automatically, but verify in Render dashboard:
- Settings → Root Directory should be empty (render.yaml handles it)

---

**Last Updated:** 2026-03-22  
**Commit:** 72c857d
