# 🦅 Granite Hills Scout App

A mobile-friendly baseball pitcher scouting app for Granite Hills.

## Features
- ⚾ Pitch-by-pitch tracking with count management
- 🏃 Pick move / steal call system (Chuck, Celo, Ace, Jeter, Bambino, Lou)
- 📊 Spray chart for hit locations
- 📈 Real-time stats and count tendencies
- 📱 Share reports via text or transfer codes
- 💾 Save and load scouting reports

---

## 🚀 Deploy to Vercel (Easiest - 2 minutes)

### Step 1: Get the code on GitHub

1. Go to [github.com](https://github.com) and sign in (or create free account)
2. Click the **+** button → **New repository**
3. Name it `granite-hills-scout`
4. Click **Create repository**
5. Upload all these files to the repository

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **Sign Up** → **Continue with GitHub**
3. Click **Add New...** → **Project**
4. Find `granite-hills-scout` and click **Import**
5. Click **Deploy**
6. Wait ~1 minute for it to build
7. Done! You'll get a URL like `granite-hills-scout.vercel.app`

---

## 📱 Add to iPhone Home Screen

Once deployed, on your iPhone:

1. Open Safari and go to your Vercel URL
2. Tap the **Share** button (square with arrow)
3. Scroll down and tap **Add to Home Screen**
4. Tap **Add**

Now it works like a real app!

---

## 🔄 Making Updates

1. Come back to the Claude conversation
2. Ask for changes ("add a pitch type", "change colors", etc.)
3. Download the updated files
4. Upload to GitHub (replace existing files)
5. Vercel auto-deploys the update in ~1 minute

---

## 📂 Project Structure

```
granite-hills-scout/
├── app/
│   ├── globals.css      # Tailwind styles
│   ├── layout.js        # App layout + meta tags
│   └── page.js          # Main app component
├── public/
│   ├── manifest.json    # PWA manifest
│   └── icon.svg         # App icon
├── package.json         # Dependencies
├── next.config.js       # Next.js config
├── tailwind.config.js   # Tailwind config
├── postcss.config.js    # PostCSS config
└── README.md            # This file
```

---

## 🛠 Local Development (Optional)

If you want to run it locally:

```bash
npm install
npm run dev
```

Then open http://localhost:3000

---

GO EAGLES! 🦅
