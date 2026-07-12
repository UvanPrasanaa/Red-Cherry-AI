# Red Cherry AI

A modern chatbot web app powered by Groq's **Llama 3.3 70B Versatile** model, with Google Sign-In and Guest access via Firebase Auth.

**Developer:** Uvan Prasanaa V
**Co-developer:** Sukesh D

---

## How it's built

- **`/client`** — React + Vite frontend. Handles login (Google / Guest) and the chat UI.
- **`/server`** — Node + Express backend. The *only* thing that talks to Groq — your API key lives here and is never sent to the browser.

The frontend never calls Groq directly. It calls your backend at `/api/chat`, and the backend forwards that to Groq using your server-side key. This is the safer of the two options and is why there are two folders instead of one.

---

## 1. Get your API keys (free)

### Groq API key
1. Go to [console.groq.com/keys](https://console.groq.com/keys)
2. Sign up / log in, then click **Create API Key**
3. Copy it — you'll paste it into `server/.env` in step 3

### Firebase project
1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project** → name it (e.g. `red-cherry-ai`) → follow the prompts
2. Once created, click the **web icon (`</>`)** to register a web app → give it a nickname → **Register app**
3. Firebase will show you a config object like this — copy the values, you'll need them in step 3:
   ```js
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "red-cherry-ai-xxxx.firebaseapp.com",
     projectId: "red-cherry-ai-xxxx",
     appId: "1:xxxx:web:xxxx",
   };
   ```
4. In the left sidebar, go to **Build → Authentication → Get started**
5. Under the **Sign-in method** tab, enable:
   - **Google** (toggle on, pick a support email, save)
   - **Anonymous** (toggle on, save) — this is what powers "Continue as Guest"

That's it — no billing required, both are free at this scale.

---

## 2. Install dependencies

```bash
# From the project root

cd server
npm install

cd ../client
npm install
```

---

## 3. Configure your environment variables

### Backend (`server/.env`)
```bash
cd server
cp .env.example .env
```
Open `server/.env` and paste in your Groq key:
```
GROQ_API_KEY=gsk_your_real_key_here
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
```

### Frontend (`client/.env`)
```bash
cd ../client
cp .env.example .env
```
Open `client/.env` and paste in your Firebase values from step 1:
```
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=red-cherry-ai-xxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=red-cherry-ai-xxxx
VITE_FIREBASE_APP_ID=1:xxxx:web:xxxx
VITE_API_URL=http://localhost:5000
```
Firebase's setup snippet also gives you `storageBucket` and `messagingSenderId` values. They're optional — the app doesn't use Storage or Cloud Messaging, only Auth — but `.env.example` has a place for them (`VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`) if you want to keep them on hand for later.

If Firebase also gave you a `measurementId` (Analytics), you can leave it out — this app doesn't wire up Analytics.

**Neither `.env` file is committed to git** (they're in `.gitignore`) — only the `.env.example` templates are, so your real keys stay private.

---

## 4. Run it locally

Open two terminals:

```bash
# Terminal 1 — backend
cd server
npm run dev
```

```bash
# Terminal 2 — frontend
cd client
npm run dev
```

Visit **http://localhost:5173** — you should see the login screen. Sign in with Google or continue as guest, and start chatting.

---

## 5. Deploying — GitHub + Cloudflare + custom domain

A quick note before you start: this app has two parts — a **static frontend** (`/client`) and a **backend server** (`/server`) that keeps your Groq key private. Cloudflare has a product for each, but they're not interchangeable:

- **Cloudflare Pages** hosts static frontends like `/client` perfectly, no changes needed.
- **Cloudflare Workers** runs serverless functions — but it does **not** run an Express app as-is. The `/server` folder as currently written needs Node's standard server APIs, which Workers doesn't support. Your two real options for the backend are below; pick whichever you're more comfortable with.

### Step 1 — Push to GitHub
```bash
cd red-cherry-ai
git init
git add .
git commit -m "Initial commit — Red Cherry AI"
```
Create a new repo at [github.com/new](https://github.com/new) (don't initialize it with a README), then:
```bash
git remote add origin https://github.com/YOUR_USERNAME/red-cherry-ai.git
git branch -M main
git push -u origin main
```

### Step 2 — Deploy the frontend to Cloudflare Pages
1. Go to the [Cloudflare dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. Select your `red-cherry-ai` repo
3. Set the build configuration:
   | Setting | Value |
   |---|---|
   | Framework preset | Vite |
   | Root directory | `client` |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
4. Under **Environment variables**, add everything from your `client/.env`:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID` — optional, only if you set them locally
   - `VITE_API_URL` — set this to your backend's deployed URL from Step 3 below (you can update it after)
5. Click **Save and Deploy**. You'll get a URL like `red-cherry-ai.pages.dev`.

### Step 3 — Deploy the backend
Pick one:

**Option A — Keep it simple (recommended): Render or Railway**
Deploy `/server` there exactly as described in the original setup — create a Web Service pointed at the `server` folder, add your `GROQ_API_KEY` and `CLIENT_ORIGIN` (your `.pages.dev` URL) as environment variables, deploy. This needs no code changes.

**Option B — Full Cloudflare stack: rewrite the backend for Workers**
If you want *everything* on Cloudflare, the `/server` app needs to be rewritten using a Workers-compatible framework like [Hono](https://hono.dev) instead of Express, and deployed with `wrangler` instead of `npm start`. This is a real rewrite of `server/index.js` and `server/routes/chat.js`, not a config change — happy to do that conversion if you want to go this route, just ask.

Once your backend is live, go back to Cloudflare Pages → your project → **Settings → Environment variables** and update `VITE_API_URL` to the real backend URL, then redeploy.

### Step 4 — Connect your custom domain
1. In Cloudflare Pages → your project → **Custom domains** → **Set up a custom domain**
2. Enter your domain (e.g. `redcherry.ai`) or a subdomain (e.g. `chat.redcherry.ai`)
3. If your domain's nameservers are already on Cloudflare, it connects automatically. If not, Cloudflare will show you a CNAME record to add at your registrar.
4. DNS changes can take a few minutes up to 24 hours to propagate.

### Step 5 — Update Firebase with your live domain
Go to **Firebase Console → Authentication → Settings → Authorized domains** and add:
- Your `.pages.dev` URL (e.g. `red-cherry-ai.pages.dev`)
- Your custom domain (e.g. `redcherry.ai` or `chat.redcherry.ai`)

Skip this and Google Sign-In will fail silently on the live site.

---

## Troubleshooting

| Problem | Likely cause |
|---|---|
| "Could not reach the server" in chat | Backend isn't running, or `VITE_API_URL` doesn't match where it's running |
| Google Sign-In popup closes immediately / errors | Google provider not enabled in Firebase Console, or domain not in Authorized domains |
| "Continue as Guest" fails | Anonymous sign-in not enabled in Firebase Console |
| Chat replies with a 500 error | Check `server/.env` has a valid, non-expired `GROQ_API_KEY` |
| Chat replies with 429 | You've hit Groq's free-tier rate limit — wait a minute and retry |

---

## Project structure

```
red-cherry-ai/
├── client/                  React frontend
│   ├── src/
│   │   ├── components/      LoginPage, ChatApp
│   │   ├── context/         AuthContext (Firebase auth state)
│   │   ├── config/          Firebase initialization
│   │   └── styles/          Design tokens + component CSS
│   └── .env.example
└── server/                  Express backend
    ├── routes/chat.js       Groq proxy endpoint
    ├── index.js             Server entry, CORS, rate limiting
    └── .env.example
```
