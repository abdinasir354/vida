# Vida - Environment Setup Guide

## 🔐 Security Notice

This project uses environment variables to protect sensitive credentials. **Never commit the `.env` file to Git.**

## 📝 Setup Instructions

1. **Copy the example file:**
   ```bash
   cd server
   cp .env.example .env
   ```

2. **Edit `.env` and add your actual values:**
   - `MONGO_URI`: Your MongoDB connection string from MongoDB Atlas
   - `JWT_SECRET`: Generate a secure random string (see below for how)
   - `ADMIN_EMAIL`: Your preferred admin email
   - `ADMIN_PASSWORD`: Choose a strong, secure password
   - `PORT`: Server port (default: 5000)
   - `NODE_ENV`: development or production

   **To generate a secure JWT_SECRET, run:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

3. **For Vercel Deployment:**
   - Go to your Vercel project settings
   - Navigate to "Environment Variables"
   - Add all variables from `.env.example` with your production values
   - **Important:** Use a different, secure password for production!

## 🚀 Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/DATABASE_NAME` |
| `JWT_SECRET` | Secret key for JWT tokens | Generate a random 64+ character string |
| `ADMIN_EMAIL` | Admin account email | `your_email@example.com` |
| `ADMIN_PASSWORD` | Admin account password | `YourSecurePassword123!` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `production` or `development` |

## ⚠️ Security Best Practices

- ✅ `.env` is in `.gitignore` (never committed)
- ✅ `.env.example` shows required variables (safe to commit)
- ✅ Change default passwords before deployment
- ✅ Use strong, unique passwords in production
- ✅ Keep your MongoDB URI private
