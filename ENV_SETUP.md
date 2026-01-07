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
   - `MONGO_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure random string (already generated in the example)
   - `ADMIN_EMAIL`: Admin account email
   - `ADMIN_PASSWORD`: Admin account password (change from default!)
   - `PORT`: Server port (default: 5000)
   - `NODE_ENV`: development or production

3. **For Vercel Deployment:**
   - Go to your Vercel project settings
   - Navigate to "Environment Variables"
   - Add all variables from `.env.example` with your production values
   - **Important:** Use a different, secure password for production!

## 🚀 Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/vida` |
| `JWT_SECRET` | Secret key for JWT tokens | (use the generated one in .env.example) |
| `ADMIN_EMAIL` | Admin account email | `admin@vida.com` |
| `ADMIN_PASSWORD` | Admin account password | `your_secure_password` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `production` or `development` |

## ⚠️ Security Best Practices

- ✅ `.env` is in `.gitignore` (never committed)
- ✅ `.env.example` shows required variables (safe to commit)
- ✅ Change default passwords before deployment
- ✅ Use strong, unique passwords in production
- ✅ Keep your MongoDB URI private
