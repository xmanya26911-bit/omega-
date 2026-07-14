# OMEGA Cloud ☁️

ChatGPT-style web UI for OMEGA, powered by OpenCode AI.  
Zero local resources — everything runs on Vercel's free tier.

## ✨ Features

- 🔒 **Password-protected** — only you can access (key: `unc.xo.anyaa`)
- 💬 **ChatGPT-style interface** — clean, responsive, mobile-friendly
- ⚡ **Streaming responses** — see text appear in real-time
- 🎨 **Dark/Light theme** — toggle at the top
- 📱 **Mobile responsive** — works perfectly on phones
- 💻 **Code syntax highlighting** — powered by highlight.js
- 📝 **Full markdown** — bold, lists, tables, code blocks
- 💾 **Conversation history** — saved in browser localStorage
- 🔑 **Custom API key** — bring your own or use the default
- 🎯 **Model selector** — switch between models on the fly

## 🚀 Deploy (1-Click)

### Option A: Deploy to Vercel (Recommended)

1. Push to GitHub (already done):
   ```
   git push origin master
   ```

2. Go to **[vercel.com/new](https://vercel.com/new)**
3. Import your GitHub repo: `xmanya26911-bit/omega-`
4. Vercel auto-detects:
   - Static assets → `/public`
   - Serverless function → `/api/chat.js` (Edge Runtime)
5. Click **Deploy** — that's it!

### Option B: Deploy via CLI

Run `deploy.bat`:
```
cd D:\TERMINALCLI\omega-cloud
deploy.bat
```

## 🔧 Configuration

### Environment Variables (optional)

Set these in Vercel dashboard → Project Settings → Environment Variables:

| Variable | Description |
|---|---|
| `OPENCODE_API_KEY` | Default API key (fallback if user doesn't provide one) |
| `OPENCODE_BASE_URL` | API base URL (default: `https://api.opencode.ai/v1`) |

### Password

The default access key is `unc.xo.anyaa`.  
To change it, edit `api/chat.js` and find:
```js
const CORRECT_PASSWORD = 'unc.xo.anyaa';
```

## 📁 Structure

```
omega-cloud/
├── api/
│   └── chat.js          ← Vercel Edge Function (API backend)
├── public/
│   ├── index.html        ← Chat UI (entry point)
│   ├── style.css         ← Styling (dark/light theme)
│   └── script.js         ← Frontend logic
├── vercel.json           ← Vercel config (Edge Runtime)
├── package.json          ← Dependencies
└── deploy.bat            ← Deploy script
```

## 🔐 Tech Stack

- **Frontend**: Vanilla HTML/CSS/JS + marked.js + highlight.js
- **Backend**: Vercel Edge Function (Cloudflare Workers-like)
- **AI API**: OpenCode AI (same backend OMEGA uses locally)
- **Hosting**: Vercel Free Tier (100k req/month, 100GB bandwidth)
