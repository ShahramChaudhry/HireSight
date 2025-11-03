# MongoDB Atlas Setup - Step by Step

## 📝 What You'll Do
1. Create free MongoDB Atlas account (2 min)
2. Create a cluster (1 min)
3. Create a database user (1 min)
4. Whitelist your IP (30 sec)
5. Get connection string (30 sec)
6. Configure your app (1 min)
7. Start using! (instant)

---

## Step 1: Create Account

1. **Go to MongoDB Atlas**
   - Open: https://www.mongodb.com/cloud/atlas/register
   
2. **Sign Up**
   - Use Google/GitHub for quick signup, or
   - Enter email, first name, last name, password
   - Click "Create your Atlas account"
   
3. **Verify Email**
   - Check your email inbox
   - Click verification link

---

## Step 2: Create Free Cluster

1. **Choose Deployment Option**
   - Click **"+ Create"** or **"Build a Database"**
   
2. **Select Free Tier**
   - Choose **"M0 FREE"** (on the left)
   - This is completely free forever!
   
3. **Choose Provider & Region**
   - Provider: **AWS** (recommended) or Google Cloud or Azure
   - Region: Choose one closest to you (e.g., **us-east-1** for US East Coast)
   
4. **Name Your Cluster** (optional)
   - Cluster Name: Leave as "Cluster0" or change to "HireSight"
   
5. **Create Cluster**
   - Click **"Create Cluster"** button at bottom right
   - Wait 1-3 minutes while cluster is created (you'll see a progress indicator)

---

## Step 3: Create Database User

1. **Security Quickstart** (appears automatically after cluster creation)
   - Or go to: **Security → Database Access → Add New Database User**

2. **Authentication Method**
   - Choose **Password** (default)

3. **Set Credentials**
   - Username: `hiresight_admin`
   - Password: Click **"Autogenerate Secure Password"** 
   - **IMPORTANT:** Copy and save this password somewhere safe! You'll need it later.
   - Or create your own strong password (at least 8 characters)

4. **Database User Privileges**
   - Choose **"Atlas Admin"** from the dropdown
   - This gives full access to your database

5. **Create User**
   - Click **"Add User"** button
   - Wait for user to be created

---

## Step 4: Whitelist IP Address

1. **Network Access**
   - In Security Quickstart, or
   - Go to: **Security → Network Access → Add IP Address**

2. **Add IP Address**
   - Click **"Allow Access from Anywhere"** button
   - This adds `0.0.0.0/0` (allows all IPs)
   - **Note:** For development this is fine. For production, use specific IPs.
   
3. **Confirm**
   - Add an optional comment: "Development Access"
   - Click **"Confirm"** button
   - Wait for status to show "Active" (green)

---

## Step 5: Get Connection String

1. **Connect to Cluster**
   - Go to **Database** (left sidebar)
   - Find your cluster (Cluster0 or HireSight)
   - Click **"Connect"** button

2. **Choose Connection Method**
   - Select **"Drivers"** (previously "Connect your application")
   
3. **Select Your Driver**
   - Driver: **Node.js**
   - Version: **5.5 or later** (default)

4. **Copy Connection String**
   - You'll see something like:
   ```
   mongodb+srv://hiresight_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   - Click the **Copy** button
   
5. **Modify Connection String**
   - Replace `<password>` with your actual password (from Step 3)
   - Add database name: Change `/?retry` to `/hiresight?retry`
   
   **Final format should look like:**
   ```
   mongodb+srv://hiresight_admin:YourActualPassword123@cluster0.abc123.mongodb.net/hiresight?retryWrites=true&w=majority
   ```

---

## Step 6: Configure Your Application

1. **Create .env.local File**
   
   In your project root (`/Users/shahram/Documents/greenstone`), create a file named `.env.local`:

   ```bash
   # Open terminal in project directory
   cd /Users/shahram/Documents/greenstone
   
   # Create the file
   touch .env.local
   
   # Open in text editor
   open -e .env.local
   ```

2. **Add Configuration**
   
   Paste this into `.env.local` (replace with YOUR connection string):

   ```bash
   MONGODB_URI=mongodb+srv://hiresight_admin:YourActualPassword123@cluster0.abc123.mongodb.net/hiresight?retryWrites=true&w=majority
   NEXT_PUBLIC_APP_NAME=HireSight
   NEXT_PUBLIC_APP_URL=http://localhost:3001
   ```

   **IMPORTANT:** 
   - Replace `YourActualPassword123` with your actual password
   - Replace `cluster0.abc123` with your actual cluster address
   - Make sure password has NO angle brackets < >

3. **Save the File**
   - Save and close `.env.local`

---

## Step 7: Restart Your Application

1. **Stop Current Server**
   - Go to terminal where server is running
   - Press `Ctrl+C` to stop

2. **Restart Server**
   ```bash
   npm run dev
   ```

3. **Check for Errors**
   - Look for "Ready in X.Xs" message
   - Should NOT see MongoDB connection errors
   - If you see errors, check your connection string in `.env.local`

---

## Step 8: Seed Database (Optional but Recommended)

Add sample data to test everything:

**Option A: Using curl (Terminal)**
```bash
curl -X POST http://localhost:3001/api/seed
```

**Option B: Using browser**
1. Install a browser extension like "Thunder Client" or use Postman
2. Make a POST request to: `http://localhost:3001/api/seed`

**Option C: Create a quick script**
```bash
# Create seed script
cat > seed-now.js << 'EOF'
fetch('http://localhost:3001/api/seed', {
  method: 'POST'
}).then(res => res.json())
  .then(data => console.log('✅ Seeded:', data))
  .catch(err => console.error('❌ Error:', err));
EOF

# Run it
node seed-now.js
```

You should see:
```json
{
  "success": true,
  "message": "Database seeded successfully with sample data"
}
```

---

## Step 9: Test Your Application

1. **Open Browser**
   - Go to http://localhost:3001

2. **Check Dashboard**
   - You should see 4 job posts (if you seeded)
   - Or an empty dashboard (if you didn't seed)

3. **Create a New Job**
   - Click **"+ New Job Post"**
   - Fill in: "Test Job Post"
   - Description: "Testing MongoDB Atlas connection"
   - Click **"Create Job Post"**

4. **Refresh Page**
   - Press F5 or reload browser
   - Your job should STILL BE THERE! ✨
   - This means it's saved to MongoDB Atlas!

5. **Check Rankings**
   - Click "Rankings" in navigation
   - You should see candidates (if you seeded)

---

## ✅ Success Checklist

- [ ] MongoDB Atlas account created
- [ ] Cluster created and running (green status)
- [ ] Database user created with password saved
- [ ] IP address whitelisted (0.0.0.0/0)
- [ ] Connection string copied and modified
- [ ] `.env.local` file created with connection string
- [ ] Server restarted with no errors
- [ ] Database seeded (optional)
- [ ] Created a test job post
- [ ] Job persists after page refresh

---

## 🎉 You're Done!

Your HireSight application is now connected to MongoDB Atlas in the cloud!

### What You Have Now:
- ✅ Free cloud database
- ✅ No local MongoDB installation needed
- ✅ Data persists forever
- ✅ Automatic backups by Atlas
- ✅ Can access from anywhere
- ✅ Ready for production deployment

---

## 🔍 View Your Data in MongoDB Atlas

1. **Go to Database**
   - Click "Database" in left sidebar
   
2. **Browse Collections**
   - Click "Browse Collections" button
   - You'll see your `hiresight` database
   - Collections: `jobs`, `candidates`, `criterias`
   
3. **View Documents**
   - Click on any collection to see your data
   - You can view, edit, or delete documents here

---

## 🆘 Troubleshooting

### Error: "MONGODB_URI is not defined"
**Fix:** Check that `.env.local` exists in project root and has the MONGODB_URI line

### Error: "MongoNetworkError: connection refused"
**Fix:** 
1. Check if IP is whitelisted (0.0.0.0/0)
2. Check if cluster is running (should show "Active")

### Error: "Authentication failed"
**Fix:**
1. Check password in connection string is correct
2. Password should NOT have < > brackets
3. Special characters might need URL encoding (use autogenerated password to avoid this)

### Dashboard is empty
**Fix:** Run the seed command to add sample data:
```bash
curl -X POST http://localhost:3001/api/seed
```

### Can't create .env.local file
**Fix:**
```bash
# Manual creation
cd /Users/shahram/Documents/greenstone
echo "MONGODB_URI=your_connection_string_here" > .env.local
echo "NEXT_PUBLIC_APP_NAME=HireSight" >> .env.local
echo "NEXT_PUBLIC_APP_URL=http://localhost:3001" >> .env.local
```

---

## 📱 MongoDB Atlas App (Optional)

Download the mobile app to monitor your database:
- iOS: Search "MongoDB Atlas" in App Store
- Android: Search "MongoDB Atlas" in Play Store

---

## 💡 Pro Tips

1. **Save Your Password:** Store it in a password manager
2. **Bookmark Atlas:** You'll visit it to view data
3. **Free Tier Limits:** 512 MB storage (plenty for development)
4. **Automatic Backups:** Atlas backs up your data automatically
5. **Monitoring:** View metrics in Atlas dashboard

---

## 🚀 Next Steps

Now that your database is set up:
1. Create more job posts
2. Upload CVs (they'll be saved!)
3. Evaluate candidates
4. All data persists in the cloud!

**Ready to deploy?** Your app is production-ready with MongoDB Atlas!

