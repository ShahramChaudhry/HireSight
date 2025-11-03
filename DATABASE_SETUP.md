# MongoDB Database Setup Guide

## 🎯 Overview

Your HireSight application is now connected to MongoDB! All data (jobs, candidates, criteria) persists in the database instead of being hardcoded.

---

## 📦 Option 1: MongoDB Atlas (Cloud - Recommended)

MongoDB Atlas is free and requires no local installation.

### Step 1: Create MongoDB Atlas Account

1. Go to [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account
3. Create a new cluster (free M0 tier)

### Step 2: Create Database User

1. In Atlas dashboard, go to **Database Access**
2. Click **Add New Database User**
3. Choose **Password** authentication
4. Set username and password (remember these!)
5. Set role to **Atlas Admin**
6. Click **Add User**

### Step 3: Whitelist IP Address

1. Go to **Network Access**
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** (for development)
4. Or add your specific IP address
5. Click **Confirm**

### Step 4: Get Connection String

1. Go to **Database** → **Connect**
2. Choose **Connect your application**
3. Copy the connection string (looks like: `mongodb+srv://username:password@cluster...`)
4. Replace `<password>` with your actual password
5. Replace `<dbname>` with `hiresight`

### Step 5: Configure Environment Variables

Create a file named `.env.local` in the project root:

```bash
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/hiresight?retryWrites=true&w=majority
NEXT_PUBLIC_APP_NAME=HireSight
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

---

## 💻 Option 2: Local MongoDB

Install MongoDB locally on your machine.

### macOS (using Homebrew)

```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community@7.0

# Start MongoDB
brew services start mongodb-community@7.0

# Check if running
brew services list
```

### Windows

1. Download MongoDB from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Install using the installer
3. MongoDB should start automatically
4. Or start manually: `mongod`

### Linux (Ubuntu/Debian)

```bash
# Import public key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Create list file
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update and install
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Configure for Local MongoDB

Create `.env.local`:

```bash
MONGODB_URI=mongodb://localhost:27017/hiresight
NEXT_PUBLIC_APP_NAME=HireSight
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

---

## 🚀 Setup Application

### 1. Install Dependencies

```bash
cd /Users/shahram/Documents/greenstone
npm install
```

This installs `mongoose` (MongoDB ODM library).

### 2. Seed Database with Sample Data

```bash
# Make a POST request to seed endpoint
curl -X POST http://localhost:3001/api/seed
```

Or visit in browser:
- Open http://localhost:3001/api/seed in your browser (will fail with GET)
- Use a tool like Postman or Thunder Client to make a POST request

Or use this simple Node script:

```javascript
// seed.js
fetch('http://localhost:3001/api/seed', { method: 'POST' })
  .then(res => res.json())
  .then(data => console.log(data));
```

Run with: `node seed.js`

### 3. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3001

---

## 📊 Database Schema

### Jobs Collection

```typescript
{
  _id: ObjectId,
  title: string,
  description: string (optional),
  candidateCount: number,
  postedDate: string,
  createdAt: Date,
  updatedAt: Date
}
```

### Candidates Collection

```typescript
{
  _id: ObjectId,
  name: string,
  email: string,
  phone: string (optional),
  score: number (0-10),
  jobId: string (reference to Job),
  scores: {
    technicalSkills: number,
    experience: number,
    education: number,
    projectRelevance: number,
    communication: number
  },
  summary: string,
  highlights: string[],
  cvUrl: string (optional),
  linkedinUrl: string (optional),
  createdAt: Date,
  updatedAt: Date
}
```

### Criteria Collection

```typescript
{
  _id: ObjectId,
  jobId: string (unique),
  jobDescription: string,
  criteria: [{
    id: string,
    name: string,
    weight: number
  }],
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔌 API Endpoints

### Jobs

- `GET /api/jobs` - Get all jobs
- `POST /api/jobs` - Create new job
- `GET /api/jobs/[id]` - Get single job
- `PUT /api/jobs/[id]` - Update job
- `DELETE /api/jobs/[id]` - Delete job (and all candidates)

### Candidates

- `GET /api/candidates` - Get all candidates
- `GET /api/candidates?jobId=XXX` - Get candidates for specific job
- `POST /api/candidates` - Create new candidate
- `GET /api/candidates/[id]` - Get single candidate
- `PUT /api/candidates/[id]` - Update candidate
- `DELETE /api/candidates/[id]` - Delete candidate

### Seed

- `POST /api/seed` - Seed database with sample data

---

## 🔍 View Database

### MongoDB Compass (GUI Tool)

1. Download from [mongodb.com/products/compass](https://www.mongodb.com/products/compass)
2. Connect using your connection string
3. Browse collections visually

### MongoDB Shell

```bash
# Connect to local MongoDB
mongosh

# Switch to hiresight database
use hiresight

# View collections
show collections

# View jobs
db.jobs.find().pretty()

# View candidates
db.candidates.find().pretty()

# Count documents
db.jobs.countDocuments()
db.candidates.countDocuments()
```

---

## 🧪 Testing the Connection

### Quick Test

1. Start your app: `npm run dev`
2. Open browser: http://localhost:3001
3. If you see the dashboard loading, connection is successful!
4. Check browser console for any errors

### Manual Test

Create a test file `test-db.js`:

```javascript
import mongoose from 'mongoose';

const MONGODB_URI = 'your_connection_string_here';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully!');
    mongoose.connection.close();
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });
```

---

## ❗ Troubleshooting

### Error: "MONGODB_URI is not defined"

**Solution**: Create `.env.local` file with your connection string

### Error: "MongoNetworkError: connection refused"

**Solution**: 
- Make sure MongoDB is running
- Check if connection string is correct
- For Atlas: Check if IP is whitelisted

### Error: "Authentication failed"

**Solution**: 
- Check username/password in connection string
- Make sure user has proper permissions

### Database is empty

**Solution**: 
- Run the seed endpoint: `POST /api/seed`
- Or create jobs manually through the UI

### Port 3001 already in use

**Solution**:
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or change port in package.json
# "dev": "next dev -p 3002"
```

---

## 🎉 You're All Set!

Your HireSight application now:
- ✅ Persists all data to MongoDB
- ✅ Survives server restarts
- ✅ Can be deployed to production
- ✅ Handles real user data
- ✅ Has full CRUD operations

### Next Steps

1. Create your first job post
2. Upload some candidate CVs
3. Evaluate candidates via LinkedIn
4. All data is automatically saved!

---

## 📝 Notes

- **Development**: Use MongoDB Atlas free tier or local MongoDB
- **Production**: Use MongoDB Atlas with proper security
- **Backups**: Atlas provides automatic backups
- **Scaling**: MongoDB scales horizontally with sharding

For more help, visit [MongoDB Documentation](https://docs.mongodb.com/)

