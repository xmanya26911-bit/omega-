# Ω OMEGA — AI Operating System Website

> **Live:** https://omega-nine-weld.vercel.app  
> **Stack:** Next.js 15 (App Router) + TypeScript + Tailwind CSS + Framer Motion  
> **Purpose:** Cinematic AI platform landing page with chat interface, Google Drive sync, OAuth, and multi-model AI provider support.

---

## 📁 Project Structure

```
omega-cloud/
├── src/
│   ├── app/                          # Next.js App Router pages & API
│   │   ├── page.tsx                  # Homepage (hero, neural, capabilities, console sections)
│   │   ├── layout.tsx                # Root layout (fonts, metadata, theme)
│   │   ├── chatinterface/page.tsx    # AI chat UI page
│   │   ├── globals.css               # Global styles, CSS variables, glass effects
│   │   ├── api/
│   │   │   ├── chat/route.ts         # POST — proxies chat to OpenCode API
│   │   │   ├── models/route.ts       # GET/POST — lists available AI models
│   │   │   ├── drive/                # Google Drive sync endpoints
│   │   │   │   ├── auth/route.ts     #   OAuth callback for Drive
│   │   │   │   ├── files/route.ts    #   CRUD files in Drive
│   │   │   │   ├── memories/route.ts #   Read/write memories to Drive
│   │   │   │   └── sessions/route.ts #   Read/write sessions to Drive
│   │   │   └── v1/                   # (removed — was OpenCode proxy)
│   │   └── v1/[...path]/route.ts     # (removed)
│   │
│   ├── components/
│   │   ├── omega/
│   │   │   ├── sections/
│   │   │   │   ├── OmegaHero.tsx     # Hero section with WebGL neural background
│   │   │   │   ├── OmegaNeural.tsx   # 3D neural network visualization (Three.js)
│   │   │   │   ├── OmegaCapabilities.tsx  # 42-feature showcase grid
│   │   │   │   ├── OmegaConsole.tsx  # Terminal-style demo section
│   │   │   │   ├── OmegaNav.tsx      # Floating glass header nav (Launch, CLI modal)
│   │   │   │   └── OmegaFooter.tsx   # Footer with links
│   │   │   └── ui/
│   │   │       ├── OmegaButton.tsx   # Reusable glass-button component
│   │   │       └── OmegaChat.tsx     # Chat interface (messages, input, model selector)
│   │   └── magicui/                  # Third-party UI components (dock, globe, etc.)
│   │
│   ├── hooks/
│   │   └── use-omega.ts             # Custom hooks (magnetic, Lenis scroll)
│   │
│   └── lib/
│       ├── utils.ts                  # cn() utility, helpers
│       └── drive-service.ts          # Google Drive API client (create, read, list, delete)
│
├── public/                           # Static assets
├── vercel.json                       # Vercel deployment config + env vars
├── next.config.ts                    # Next.js configuration
├── tailwind.config.ts                # Tailwind theme customization
├── tsconfig.json                     # TypeScript config
└── package.json                      # Dependencies & scripts
```

---

## 🧠 Key Architecture Decisions

### Frontend
- **Next.js 15 App Router** with React Server Components where possible
- **Framer Motion** for scroll animations, modals, and micro-interactions
- **Three.js** (via `@react-three/fiber`) for the 3D neural network visualization in `OmegaNeural.tsx`
- **Tailwind CSS** with custom CSS variables (`--omega-emerald`, `--omega-amber`, etc.) for the glass-morphism design system
- **Lenis** for smooth scroll behavior
- **`clsx` + `tailwind-merge`** for className composition

### Chat Interface (`/chatinterface`)
- Powered by **OpenCode** free models (no API key required)
- Chat endpoint at `/api/chat` proxies requests to `https://opencode.ai/zen/v1/chat/completions`
- Supports **streaming** (SSE) responses with real-time token display
- Model selector includes: DeepSeek V4 Flash, Mimo 2.5, Nemotron 3 Ultra, North Mini Code
- Image generation available through supported models

### Google Drive Sync
- OAuth 2.0 implicit grant flow (no backend needed)
- Redirect-based OAuth (not popup, not GIS library)
- Drive folder structure: `Omega_{email}/omegamemories/` + `omegasessions/`
- Files stored as `.json` blobs in Google Drive App Data folder
- Auth handled via `/api/drive/auth` with token exchange
- Default scope: `https://www.googleapis.com/auth/drive.file`

### Authentication
- **Google OAuth** client ID: `855819039877-5f4a8biid8hkf8j2hhd1jk3bj9ng2f5f.apps.googleusercontent.com`
- OAuth redirect URI: `https://omega-nine-weld.vercel.app/chatinterface`
- CSRF protection via `crypto.randomUUID()` state parameter stored in `sessionStorage`
- No server-side sessions — fully client- side auth with token in URL hash

### Model Provider
- Base provider: **OpenCode Zen** (`https://opencode.ai/zen/v1`)
- All models are **free** — no API key required
- Model names (as displayed to users): DeepSeek V4 Flash, Mimo 2.5, Hy3, Nemotron 3 Ultra, North Mini Code
- Internal model IDs used in API calls: `deepseek-v4-flash-free`, `mimo-v2.5-free`, `hy3-free`, `nemotron-3-ultra-free`, `north-mini-code-free`

---

## 🔐 Configuration & Secrets

### Environment Variables (in `vercel.json`)
```json
{
  "env": {
    "GOOGLE_CLIENT_ID": "xxxxxxxxxxxxxxxxxxxxxapps.googleusercontent.com",
    "NEXT_PUBLIC_APP_URL": "https://omega-nine-weld.vercel.app"
  }
}
```

### Vercel Deployment
- **Framework:** Next.js
- **Build command:** `npx next build`
- **Output:** `.next` directory
- **Git:** Force-push `master` → `main` branch triggers deployment
- **Custom headers:** X-Content-Type-Options, X-Frame-Options, Referrer-Policy, X-DNS-Prefetch-Control

### Google Cloud Console Setup
- **Project:** `omega-502413`
- **OAuth consent screen:** External user type
- **Authorized JavaScript origins:** `https://omega-nine-weld.vercel.app`
- **Authorized redirect URIs:** `https://omega-nine-weld.vercel.app/chatinterface`
- **Scopes:** `https://www.googleapis.com/auth/drive.file`

---

## 🚀 Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Local Setup
```bash
git clone <repo-url>
cd omega-cloud
npm install
npm run dev     # → http://localhost:3000
```

### Build
```bash
npm run build
npm start       # production preview
```

### Deploy
Automatic on Vercel when pushing to `main`:
```bash
git push origin master:main --force
```

---

## 🤖 AI Agent Guide

If you are an AI agent reading this to understand the project, here are the key entry points:

### To understand the UI flow:
1. `src/app/page.tsx` — main landing page sections
2. `src/app/chatinterface/page.tsx` — chat page with Drive sync
3. `src/components/omega/sections/OmegaNav.tsx` — header with modals
4. `src/components/omega/ui/OmegaChat.tsx` — chat message rendering

### To modify the API:
1. `src/app/api/chat/route.ts` — chat proxy to OpenCode
2. `src/app/api/models/route.ts` — model listing
3. `src/app/api/drive/` — Google Drive CRUD endpoints

### To change styles:
1. `src/app/globals.css` — CSS variables, glass effects, animations
2. `tailwind.config.ts` — theme colors, fonts, extensions

### To add a new section to the landing page:
1. Create component in `src/components/omega/sections/`
2. Import and add to `src/app/page.tsx`

### To add a new API route:
1. Create `src/app/api/<name>/route.ts`
2. Export `GET`, `POST`, etc. handler functions

### OAuth flow for Drive:
- User clicks "Connect Drive" → redirects to Google OAuth URL
- Google redirects back with `#access_token=...` in URL hash
- Frontend extracts token, stores in memory, calls Drive API
- Token is NOT persisted to localStorage (security)

---

## 📦 Archive Contents

This `.tar` archive contains the complete source code of the OMEGA website project including:
- All source files (TypeScript, CSS, config)
- `.git` directory with full commit history
- `vercel.json` with deployment config and secrets
- All assets in `public/`
- Configuration files (`next.config.ts`, `tailwind.config.ts`, `tsconfig.json`, `package.json`)
- `node_modules/` is NOT included (run `npm install` to restore)

---

*Built with Next.js, Three.js, and Framer Motion. Powered by OpenCode free models.*
