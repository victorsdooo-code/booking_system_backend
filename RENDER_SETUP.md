# Configure Render for Backend Deployment

## Prerequisites

- GitHub repo `booking_system_backend` must be created and code pushed ✅
- MongoDB Atlas connection string ready

## Steps

### 1. Go to Render Dashboard

**URL:** https://dashboard.render.com

### 2. Create New Web Service

- Click **"New +"** → **"Web Service"**
- Or update existing booking system service

### 3. Connect Repository

- **Repository:** Select `booking_system_backend`
- **Region:** Oregon (`oregon`)
- **Branch:** `main`

### 4. Configure Build & Start

| Setting | Value |
|---------|-------|
| **Root Directory** | (leave blank) |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |

### 5. Add Environment Variables

Click **"Environment"** tab and add:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | `mongodb+srv://victorsdooo_db_user:LPIf14ooF0ZwvGR1@cluster0.k1nsfh2.mongodb.net/qingyiu_clinic?retryWrites=true&w=majority` |
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `JWT_SECRET` | (generate a secure random string) |

### 6. Deploy

- Click **"Create Web Service"** (for new service)
- Or **"Manual Deploy"** → **"Deploy latest commit"** (for existing)

### 7. Verify Deployment

- Wait for build to complete (~2-5 minutes)
- Check logs for "Server running on port 3000"
- Test health endpoint: `https://your-service.onrender.com/api/health`

## Troubleshooting

### Build Fails

- Check logs for npm install errors
- Verify `package.json` is in repo root
- Ensure Node.js version >= 18

### Server Won't Start

- Check MongoDB connection string is correct
- Verify MONGODB_URI environment variable is set
- Check logs for connection errors

### CORS Issues

- Frontend must call the Render URL, not localhost
- Update frontend API base URL to Render service URL

## Post-Deployment

1. Update frontend `.env` or config with Render backend URL
2. Test all API endpoints
3. Run seed script if needed (via Render shell or locally)

## Security Notes

- ⚠️ Change JWT_SECRET to a secure random string in production
- ⚠️ Consider restricting MongoDB access to Render's IP range
- ⚠️ Enable HTTPS (Render does this automatically)
