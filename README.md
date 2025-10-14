# 🔹 NewTube – (YouTube Clone)

## 🧠 Overview

**NewTube** is a modern, high-performance video sharing platform built using the **Next.js 15 + tRPC + Drizzle** full-stack architecture.  
It provides end-to-end type safety, modular architecture, and real-time interaction for an immersive and scalable video-sharing experience.

## 💡 Project Idea / Inspiration

This project was built following the **Code with Antonio** tutorial to learn how to create a full-stack video-sharing platform using **Next.js, tRPC, Drizzle, Clerk, and Mux**.

## 🎯 Why I Built This

I built this project to **learn how to work on larger projects** and understand **video management** and **tRPC**, including how tRPC works in a full-stack application.

## 🧰 Tech Stack

**Frontend**

- Next.js 15 (App Router + Server Components)
- React 19
- TypeScript 5
- Tailwind CSS 3
- ShadCn
- Lucide React

**Backend**

- tRPC 11
- Drizzle ORM 0.40
- Neon PostgreSQL
- Upstash Redis
- Zod 3.24

**Third-Party Integrations**

- Clerk – Authentication & Access Control
- Mux – Video Processing & Streaming
- UploadThing – File Uploads & CDN
- Upstash Workflow – Background Tasks

## ⚙️ Environment Variables

Create a `.env.local` file and configure the following:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/newtube"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_xxx"
CLERK_SECRET_KEY="sk_test_xxx"
CLERK_WEBHOOK_SECRET="whsec_xxx"

# Mux Video Service
MUX_TOKEN_ID="your_mux_token_id"
MUX_TOKEN_SECRET="your_mux_token_secret"
MUX_WEBHOOK_SECRET="your_mux_webhook_secret"

# UploadThing File Upload
UPLOADTHING_TOKEN="your_uploadthing_token_secret"

# Upstash Redis
UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your_redis_token"

# Upstash Workflow
QSTASH_TOKEN="your_workflow_token"
UPSTASH_WORKFLOW_URL="https://xxx.ngrok-free.app"
QSTASH_CURRENT_SIGNING_KEY="sig_xxx"
QSTASH_NEXT_SIGNING_KEY="sig_xxx"



# App Config
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 🚀 Setup Instructions

```bash
# Clone the repo
git clone https://github.com/lucas-ellwanger/newtube.git
cd newtube

# Install dependencies (bun recommended)
bun install
# or
npm install

# Setup the database
bun db:push
bun db:migrate
bun db:seed   # optional

# Start the dev server
bun dev
```

Access:

- Frontend: [http://localhost:3000](http://localhost:3000)
- Drizzle Studio: [http://localhost:4983](http://localhost:4983)

For production:

```bash
bun build
bun start
# or deploy to Vercel
npx vercel --prod
```

## 🌐 Live Demo

🔗 [View Deployed App](https://youtube-clone-kohl-rho.vercel.app/)

## 🖼️ Screenshots

Due to Mux limitations, only a few videos are available in this demo.  
This project is essentially a YouTube clone, so not all content is needed to be shown here.  
You can explore the app yourself — for best performance, use videos around **5 MB or smaller**.

### Home Page

![Home](./screenshots/home.png)

### Video Page

![Video](./screenshots/video.png)

### Creator Studio

![Studio](./screenshots/studio.png)

### Liked Videos

![Liked Videos](./screenshots/liked.png)

### Upload Video

![Upload Video](./screenshots/upload_video.png)

## 🔮 Key Features

- 🎥 Advanced video player with quality controls
- 🎬 Real-time video processing with Mux
- 📝 Automatic video transcription
- 🖼️ Smart thumbnail generation
- 📊 Creator Studio with metrics
- 🗂️ Custom playlist management
- 📱 Responsive design across devices
- 🔄 Multiple content feeds
- 💬 Interactive comment system
- 👍 Like and subscription system
- 🎯 Watch history tracking
- 🔐 Authentication system
- 📦 Module-based architecture
- 🗄️ PostgreSQL with DrizzleORM
- 🚀 Next.js 15 & React 19
- 🔄 tRPC for type-safe APIs
- 💅 TailwindCSS & ShadcnUI styling

## 🔧 Folder Structure

```
src/
├── app/             # Next.js App Router
│   ├── (auth)/      # Auth routes
│   ├── (home)/      # Main feed, search, playlists
│   ├── (studio)/    # Creator studio
│   └── api/         # tRPC, upload, webhooks
├── modules/         # Domain modules (videos, users, comments, etc.)
├── db/              # Drizzle schema + connection
├── lib/             # Mux, UploadThing, Redis configs
└── trpc/            # tRPC routers & clients
```

## 🧑‍💻 Author

**Ruturaj Bhandari**
🌐 [GitHub](https://github.com/Ruturaj2003)
• [Project Page](https://github.com/Ruturaj2003/youtube-clone)

## 🪪 License

This project is licensed under the **MIT License**.(maybe if i remember)
