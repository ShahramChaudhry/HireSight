# 🚀 MongoDB Quick Start (5 Minutes)

## Step 1: Create .env.local File

Create a new file `.env.local` in the project root:

```bash
# Option A: Use MongoDB Atlas (Cloud - No installation needed)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hiresight

# Option B: Use Local MongoDB (If you have it installed)
MONGODB_URI=mongodb://localhost:27017/hiresight

NEXT_PUBLIC_APP_NAME=HireSight
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

## Step 2: Get MongoDB Atlas Connection (Easiest)

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up (it's free!)
3. Create a free cluster
4. Create a database user
5. Whitelist your IP (or allow from anywhere for development)
6. Get your connection string
7. Replace in `.env.local`

## Step 3: Restart the Server

Stop the current server (Ctrl+C) and restart:

```bash
npm run dev
```

## Step 4: Seed Database (Optional)

Add sample data by making a POST request to the seed endpoint:

**Using curl:**
```bash
curl -X POST http://localhost:3001/api/seed
```

**Or create a simple seed script:**
```bash
# Create seed-db.js
echo "fetch('http://localhost:3001/api/seed', {method:'POST'}).then(r=>r.json()).then(console.log)" > seed-db.js

# Run it
node seed-db.js
```

## Step 5: Test It!

1. Open http://localhost:3001
2. Click "+" New Job Post
3. Create a job
4. Refresh the page - your job is still there! ✨

---

## ✅ That's It!

Your data now persists to MongoDB. No more hardcoded data!

For detailed setup instructions, see `DATABASE_SETUP.md`

