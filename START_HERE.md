# 🎯 START HERE - MongoDB Setup Required!

## ⚠️ Important: Database Configuration Needed

Your application now uses MongoDB instead of hardcoded data. You need to set up the database connection **before the app will work**.

---

## 🚀 Quick Setup (Choose One Option)

### Option A: MongoDB Atlas (Cloud - Recommended, 5 minutes)

**No installation needed! Free forever!**

1. **Create Account**
   - Go to https://www.mongodb.com/cloud/atlas/register
   - Sign up for free

2. **Create Cluster**
   - Click "Build a Database"
   - Choose "FREE" (M0)
   - Click "Create"

3. **Create User**
   - Database Access → Add New Database User
   - Username: `hiresight_user`
   - Password: (create a strong password)
   - Database User Privileges: "Atlas admin"
   - Add User

4. **Allow Access**
   - Network Access → Add IP Address
   - Click "Allow Access from Anywhere" (for development)
   - Confirm

5. **Get Connection String**
   - Database → Connect → Connect your application
   - Copy the connection string
   - Replace `<password>` with your actual password

6. **Create .env.local File**
   
   In your project root (`/Users/shahram/Documents/greenstone`), create a file named `.env.local`:

```bash
MONGODB_URI=mongodb+srv://hiresight_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/hiresight?retryWrites=true&w=majority
NEXT_PUBLIC_APP_NAME=HireSight
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

7. **Restart Server**
```bash
# Stop current server (Ctrl+C)
npm run dev
```

8. **Seed Database (Optional)**
```bash
curl -X POST http://localhost:3001/api/seed
```

Done! ✨

---

### Option B: Local MongoDB (If Already Installed)

**If you have MongoDB installed locally:**

1. **Make sure MongoDB is running**
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
# MongoDB should start automatically
```

2. **Create .env.local File**

In your project root, create `.env.local`:

```bash
MONGODB_URI=mongodb://localhost:27017/hiresight
NEXT_PUBLIC_APP_NAME=HireSight
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

3. **Restart Server**
```bash
npm run dev
```

4. **Seed Database (Optional)**
```bash
curl -X POST http://localhost:3001/api/seed
```

---

## ✅ Verify It's Working

1. **Check Terminal** - Should say "Ready in X.Xs" with no errors
2. **Open Browser** - Go to http://localhost:3001
3. **Dashboard loads** - If you see the dashboard, it's working!
4. **Create a Job** - Click "+ New Job Post" and create one
5. **Refresh Page** - Your job should still be there! 🎉

---

## ❌ Troubleshooting

### Error: "MONGODB_URI is not defined"
→ You didn't create `.env.local` file. See step 6 above.

### Error: "MongoNetworkError"
→ MongoDB is not running or connection string is wrong

**For Atlas:** Check if:
- IP address is whitelisted
- Password is correct (no special characters that need encoding)
- Connection string is complete

**For Local:** Check if:
- MongoDB service is running
- Port 27017 is available

### Database is empty
→ Run the seed command:
```bash
curl -X POST http://localhost:3001/api/seed
```

### Still having issues?
See detailed guides:
- `MONGODB_QUICKSTART.md` - Quick setup
- `DATABASE_SETUP.md` - Detailed instructions

---

## 📄 What Files Were Added?

- `lib/mongodb.ts` - Database connection
- `lib/models/` - Data models (Job, Candidate, Criteria)
- `app/api/` - API routes for CRUD operations
- `.env.example` - Template for your `.env.local`
- Multiple setup guides

## 📝 What Changed?

- ✅ Dashboard now fetches real jobs from database
- ✅ Creating jobs saves to database
- ✅ Deleting jobs removes from database
- ✅ Rankings page fetches real candidates
- ✅ Details page fetches candidate data
- ✅ All data persists across server restarts

---

## 🎉 That's It!

Once you create the `.env.local` file and restart, everything will work perfectly!

**Quick Commands:**
```bash
# Create .env.local (use your actual MongoDB URI)
echo 'MONGODB_URI=your_connection_string_here' > .env.local
echo 'NEXT_PUBLIC_APP_NAME=HireSight' >> .env.local
echo 'NEXT_PUBLIC_APP_URL=http://localhost:3001' >> .env.local

# Restart
npm run dev

# Seed (optional)
curl -X POST http://localhost:3001/api/seed
```

**Need more help?** See:
- `MONGODB_QUICKSTART.md` - 5-minute guide
- `DATABASE_SETUP.md` - Complete guide
- `MONGODB_INTEGRATION_SUMMARY.md` - Technical details

