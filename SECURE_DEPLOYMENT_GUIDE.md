# Secure Deployment Guide - GitHub Actions with Secrets

## 🎯 Overview

This guide shows you how to deploy your Habit Tracker to GitHub Pages **without exposing your Gemini API key** in the code repository.

---

## 📋 Prerequisites

- [ ] GitHub account
- [ ] Your repository pushed to GitHub
- [ ] Gemini API key from your `.env` file

---

## 🔧 Setup Steps

### Step 1: Add Your API Key to GitHub Secrets

1. **Go to your GitHub repository** on github.com
2. **Click** `Settings` (top menu)
3. **Sidebar**: Click `Secrets and variables` → `Actions`
4. **Click** the green `New repository secret` button
5. **Fill in**:
   - **Name**: `VITE_GEMINI_API_KEY`
   - **Secret**: Paste your actual Gemini API key (from `.env` file)
6. **Click** `Add secret`

![GitHub Secrets Location](https://docs.github.com/assets/cb-89640/mw-1440/images/help/settings/actions-secrets-new.webp)

---

### Step 2: Enable GitHub Pages (if not already enabled)

1. **Go to** `Settings` → `Pages` (sidebar)
2. **Source**: Select `GitHub Actions`
3. **Click** `Save`

That's it! GitHub Pages is now configured to deploy from Actions.

---

### Step 3: Push the Workflow File

The workflow file has been created at `.github/workflows/deploy.yml`.

**Commit and push it:**

```powershell
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Actions deployment workflow"
git push origin main
```

---

### Step 4: Trigger Deployment

#### Option A: Automatic (Push to main)
Every time you push to the `main` branch, deployment happens automatically.

```powershell
git add .
git commit -m "Your changes"
git push origin main
```

#### Option B: Manual Deployment
1. Go to your repo on GitHub
2. Click `Actions` tab
3. Click `Deploy to GitHub Pages` workflow
4. Click `Run workflow` button
5. Select branch `main`
6. Click green `Run workflow`

---

## 🎉 What Happens Now

### Workflow Process:

1. **Checkout**: Pulls your code from GitHub
2. **Setup Node**: Installs Node.js 20
3. **Install Dependencies**: Runs `npm ci`
4. **Build with Secret**: 
   - Injects `VITE_GEMINI_API_KEY` from GitHub Secrets
   - Runs `npm run build`
   - Creates production bundle
5. **Deploy**: Publishes `dist/` folder to GitHub Pages

### After Deploy:

- Your site is live at: `https://arvindk459895.github.io/habit_tracker/`
- API key is **baked into the bundle** (not in repo code)
- Anyone can see the key in browser DevTools (this is unavoidable for client-side apps)

---

## 🔒 Security Notes

### ✅ What's Protected:
- ✅ API key is **NOT in your code repository**
- ✅ API key is **NOT in version control**
- ✅ GitHub Secrets are encrypted at rest
- ✅ Only authorized users can see/edit secrets

### ⚠️ Important Limitations:

**The API key will still be visible in the browser!**

When users visit your site:
- They can open DevTools (F12)
- Inspect the JavaScript bundle
- Find the API key

**Why?** Client-side apps (React, Vite, etc.) bundle everything into JavaScript that runs in the browser. The browser MUST have the key to make API calls.

---

## 🛡️ Additional Security (Recommended)

### Restrict Your Gemini API Key

1. **Go to** [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **Click** your API key
3. **Add restrictions**:

#### Application Restrictions:
- **HTTP referrers**: Add your domain
  ```
  https://arvindk459895.github.io/*
  ```

#### API Restrictions:
- **Restrict key** to only "Generative Language API"

#### Quota Limits:
- Set **daily quotas** to prevent abuse
- Example: 1,000 requests/day

This won't hide the key, but it **limits damage** if someone copies it.

---

## 📁 File Structure

```
your-project/
├── .github/
│   └── workflows/
│       └── deploy.yml          ← GitHub Actions workflow
├── .env                        ← Local dev only (gitignored)
├── .gitignore                  ← Ensures .env is not committed
└── SECURE_DEPLOYMENT_GUIDE.md  ← This file
```

---

## 🚀 Deployment Commands

### View Deployment Status:
1. Go to your GitHub repo
2. Click `Actions` tab
3. See latest workflow run

### Check Deployed Site:
```
https://arvindk459895.github.io/habit_tracker/
```

### View Workflow Logs:
1. `Actions` tab
2. Click on a workflow run
3. Click on `build` or `deploy` job
4. View detailed logs

---

## ❌ Don't Do This (Old Method)

~~`npm run deploy`~~ - This builds locally and exposes your key!

**Instead**: Just push to `main` branch, GitHub Actions handles it.

---

## 🐛 Troubleshooting

### Deployment Failed?

**Check these:**

1. **Secret name is exact**: `VITE_GEMINI_API_KEY` (case-sensitive)
2. **Secret value has no quotes**: Just the raw key
3. **GitHub Pages enabled**: Settings → Pages → Source: `GitHub Actions`
4. **Workflow file pushed**: `.github/workflows/deploy.yml` in repo

### Site Not Updating?

- **Wait 2-5 minutes** after deployment completes
- **Hard refresh**: `Ctrl + Shift + R`
- **Check Actions tab** for any errors

### API Key Not Working?

- **Check secret value** in GitHub Settings → Secrets
- **Re-add secret** if you pasted it wrong
- **Re-run workflow** to rebuild with new secret

---

## 🔄 Updating the API Key

If you need to change your Gemini API key:

1. **GitHub Settings** → `Secrets and variables` → `Actions`
2. **Click** `VITE_GEMINI_API_KEY`
3. **Click** `Update secret`
4. **Paste** new key
5. **Save**
6. **Re-run deployment** (push to main or manual trigger)

---

## 📊 Comparison: Old vs New Process

### Old Process (Insecure):
```
Local Terminal:
npm run deploy
↓
Builds with your .env file
↓
Pushes to gh-pages branch
↓
API key visible in commit history
```

### New Process (Secure):
```
Push to main branch
↓
GitHub Actions triggered
↓
Builds with GitHub Secret
↓
Deploys to GitHub Pages
↓
API key NOT in repo code
```

---

## ✅ Checklist

- [ ] Created GitHub Secret: `VITE_GEMINI_API_KEY`
- [ ] Enabled GitHub Pages (Source: GitHub Actions)
- [ ] Pushed `.github/workflows/deploy.yml` to repo
- [ ] Tested deployment (push to main or manual trigger)
- [ ] Site is live and working
- [ ] Magic Add feature works (API key loaded)
- [ ] Restricted API key on Google AI Studio

---

## 🎓 Learn More

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [GitHub Pages Deployment](https://docs.github.com/en/pages)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Gemini API Security](https://ai.google.dev/gemini-api/docs/api-key)

---

## 🙋 Need Help?

If deployment fails or something isn't working:

1. Check the `Actions` tab for error messages
2. Review the workflow logs
3. Verify your secret is set correctly
4. Issues? Check my troubleshooting section above

Happy deploying! 🚀
