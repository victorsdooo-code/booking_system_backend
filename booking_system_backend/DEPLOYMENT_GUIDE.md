# 🚀 Deployment Guide - 青苗綜合醫療診所預約系統 Backend

**Version:** 1.0.0  
**Last Updated:** 2026-03-22  
**Status:** Ready for Deployment

---

## 📋 Pre-Deployment Checklist

### ✅ Completed
- [x] All 6 database models updated with required fields
- [x] All 24+ CRUD API endpoints implemented
- [x] Seed data configured (2 clinics, 4 services, 10 doctors)
- [x] Syntax validation passed
- [x] render.yaml configured

### ⚠️ Required Before Deployment
- [ ] MongoDB Atlas cluster created
- [ ] GitHub repository accessible
- [ ] Render account connected to GitHub

---

## 🔧 Step-by-Step Deployment

### Step 1: MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for free tier (M0)

2. **Create Cluster**
   - Choose free tier (M0)
   - Select region close to your users (e.g., Oregon for US/West Coast)
   - Cluster Name: `qingyiu-clinic`

3. **Configure Database Access**
   - Click "Database Access" in left sidebar
   - Add new database user
   - Username: `booking_admin`
   - Password: (generate secure password, save it!)
   - Role: "Read and write to any database"

4. **Configure Network Access**
   - Click "Network Access"
   - Add IP Address: "Allow Access from Anywhere" (0.0.0.0/0)
   - ⚠️ For production, restrict to Render's IP ranges

5. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `qingyiu_clinic`
   
   Example:
   ```
   mongodb+srv://booking_admin:YourPassword@cluster0.xxxxx.mongodb.net/qingyiu_clinic?retryWrites=true&w=majority
   ```

---

### Step 2: GitHub Repository

**Option A: Use Existing Repository**
```bash
cd /home/victor/.openclaw/workspace-developer2
git remote set-url origin https://github.com/victorsdooo-code/booking_system.git
git add .
git commit -m "Sprint 1: Complete backend implementation"
git push -u origin main
```

**Option B: Create New Repository**
```bash
# Create new repo on GitHub first, then:
cd /home/victor/.openclaw/workspace-developer2
git remote set-url origin https://github.com/victorsdooo-code/your-repo-name.git
git push -u origin main
```

**⚠️ Important:** Update `render.yaml` branch if not using `main`:
```yaml
branch: main  # or master
```

---

### Step 3: Render Deployment

1. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub account

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Choose repository: `booking_system` (or your repo name)

3. **Configure Service**
   - **Name:** `booking-system-backend`
   - **Region:** Oregon (matches MongoDB)
   - **Branch:** `main` (or `master`)
   - **Root Directory:** Leave blank (or `booking_system_backend` if monorepo)
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Instance Type:** Free

4. **Set Environment Variables**
   Click "Advanced" and add:

   | Key | Value | Notes |
   |-----|-------|-------|
   | `NODE_ENV` | `production` | Required |
   | `PORT` | `3000` | Auto-set by Render |
   | `MONGODB_URI` | `mongodb+srv://...` | From Step 1 |
   | `ADMIN_PASSWORD` | (secure password) | Change from default! |
   | `CORS_ORIGIN` | `https://your-frontend.com` | Or `*` for testing |

5. **Deploy**
   - Click "Create Web Service"
   - Wait for build and deployment (~2-5 minutes)
   - Check logs for any errors

6. **Verify Deployment**
   - Visit your Render URL: `https://booking-system-backend.onrender.com`
   - Test health endpoint: `https://your-url.onrender.com/api/health`
   - Expected response:
     ```json
     {
       "status": "ok",
       "timestamp": "2026-03-22T...",
       "version": "0.3.0"
     }
     ```

---

### Step 4: Seed Database

After deployment, seed the initial data:

**Option A: Via Render Shell**
1. In Render dashboard, go to your service
2. Click "Shell" tab
3. Run: `npm run seed`

**Option B: Via API (if endpoint exists)**
```bash
curl -X POST https://your-url.onrender.com/api/admin/seed \
  -H "X-Admin-Token: your-admin-password"
```

**Option C: Manual (Recommended for First Time)**
1. Use MongoDB Compass or Atlas UI
2. Connect to your cluster
3. Import data or run seed script locally with production URI

---

## 🧪 Testing Endpoints

### Health Check
```bash
curl https://your-url.onrender.com/api/health
```

### Admin Authentication
All `/api/admin/*` endpoints require header:
```
X-Admin-Token: your-admin-password
```

### Test Clinic Endpoints
```bash
# List clinics
curl https://your-url.onrender.com/api/admin/clinics \
  -H "X-Admin-Token: admin123"

# Create clinic
curl -X POST https://your-url.onrender.com/api/admin/clinics \
  -H "X-Admin-Token: admin123" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Clinic",
    "description": "Test",
    "phone": "12345678",
    "address": "Test Address"
  }'
```

### Test Doctor Endpoints
```bash
# List doctors
curl https://your-url.onrender.com/api/admin/doctors \
  -H "X-Admin-Token: admin123"
```

### Test Service Endpoints
```bash
# List services
curl https://your-url.onrender.com/api/admin/services \
  -H "X-Admin-Token: admin123"
```

---

## 🔒 Security Best Practices

### Production Checklist
- [ ] Change `ADMIN_PASSWORD` from default
- [ ] Set specific `CORS_ORIGIN` (not `*`)
- [ ] Restrict MongoDB network access to Render IPs
- [ ] Enable MongoDB authentication
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS (automatic on Render)
- [ ] Set up monitoring and alerts

### Render IPs for MongoDB Whitelist
```
3.21.238.0/24
3.22.236.0/24
3.23.232.0/24
```
Check latest at: https://render.com/docs/ip-addresses

---

## 🐛 Troubleshooting

### Build Fails
- Check Node version (should be 18+)
- Verify `package.json` dependencies
- Check build logs in Render dashboard

### Server Won't Start
- Verify `MONGODB_URI` is correct
- Check MongoDB network access (IP whitelist)
- Review server logs in Render dashboard

### CORS Errors
- Set `CORS_ORIGIN` to your frontend URL
- Or use `*` temporarily for testing

### Database Connection Errors
- Verify MongoDB URI format
- Check database user permissions
- Ensure IP whitelist includes Render

---

## 📊 Post-Deployment

### Monitor
- Set up Render notifications
- Monitor MongoDB usage (free tier: 512MB)
- Track API response times

### Backup
- Enable MongoDB automated backups
- Export data regularly

### Next Steps
1. Deploy frontend (React/Vue/Next.js)
2. Configure frontend API URL
3. Test end-to-end booking flow
4. Set up custom domain (optional)

---

## 📞 Support

**Documentation:**
- Render Docs: https://render.com/docs
- MongoDB Atlas: https://www.mongodb.com/docs/atlas/
- Express.js: https://expressjs.com/

**Project Repo:** https://github.com/victorsdooo-code/booking_system

---

**Deployed by:** Developer2  
**Date:** 2026-03-22  
**Version:** 1.0.0 Sprint 1
