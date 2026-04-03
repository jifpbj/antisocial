# Antisocial

Post to social media without opening social media.

---

## The problem

You want to stay present on the platforms — for work, for reach, for keeping in touch. But every time you open one to post, you're ambushed by a feed engineered to keep you scrolling. You came to say something. You leave forty minutes later having said nothing and consumed everything.

The apps aren't designed for output. They're designed to maximize your time in the feed. Posting is the tax you pay to justify opening them; the feed is what they actually want you doing.

**Antisocial** flips that. It's a local tool that lets you write something once and send it everywhere — without opening a single platform in your browser.

---

## What it does

- **Write once, post everywhere.** One text box. One button. Your post goes to every connected platform simultaneously.
- **No feeds.** No timelines, no notifications, no algorithmic rabbit holes. You write, you post, you close the tab.
- **Verify delivery.** After posting, you see a per-platform confirmation — sent, failed, or queued for manual paste — so you know it actually went out.
- **Runs locally.** Nothing leaves your machine except the posts themselves. Credentials are encrypted and stored in a local SQLite database.

---

## Supported platforms

| Platform | Method | Char limit |
|----------|--------|-----------|
| Bluesky | AT Protocol API | 300 |
| Twitter / X | API v2 | 280 |
| Threads | Meta API | 500 |
| LinkedIn | ugcPosts API | 3,000 |
| Facebook | Graph API | 63,206 |
| GitHub | Public Gist | — |
| Instagram | Manual (clipboard + open) | — |
| YouTube | Manual (clipboard + open) | — |
| Substack | Manual (clipboard + open) | — |

Instagram, YouTube Community Posts, and Substack don't have public text-posting APIs. For those, the app copies your text to the clipboard and opens the platform's compose URL — you paste and hit send. Still faster than opening the app and getting ambushed by a feed.

---

## Setup

**Requirements:** Node.js 18+, pnpm

```bash
git clone https://github.com/jifpbj/antisocial.git
cd antisocial
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

On first run, an `ENCRYPTION_KEY` is auto-generated and written to `.env`. Keep that file private — it's what protects your stored credentials.

---

## Connecting platforms

Go to **Platforms** in the nav. Each card tells you what credentials you need and links to where you get them.

| Platform | What you need |
|----------|--------------|
| Bluesky | Handle + App Password (Settings → App Passwords) |
| Twitter / X | API Key, API Secret, Access Token, Access Token Secret (developer.x.com) |
| Threads | User ID + Access Token (Meta for Developers) |
| LinkedIn | OAuth access token with `w_member_social` scope |
| Facebook | Page ID + long-lived Page Access Token (Graph API Explorer) |
| GitHub | Personal Access Token with `gist` scope |

Credentials are encrypted with AES-256-GCM before being written to disk. API calls are made server-side — your keys never touch the browser.

---

## Usage

1. Open [http://localhost:3000](http://localhost:3000)
2. Type your post
3. Click **Post to X platforms** (or press `⌘ + Enter`)
4. Check the per-platform result panel to confirm delivery

The character counter shows the limit of your most-restrictive connected platform. If you're over the limit, the post button is disabled.

---

## Why local?

There are hosted tools that do something similar (Buffer, Ayrshare, etc.). They're good products. But they require accounts, they store your credentials on their servers, and they're another service to pay for and another interface to open.

This runs on your laptop. It has no user accounts, no subscriptions, no analytics, no external dependencies at runtime. The data stays on your machine.

---

## Tech

- Next.js 16 (App Router) · TypeScript · Tailwind CSS
- shadcn/ui components · next-themes (dark / light / system)
- SQLite via better-sqlite3 + Drizzle ORM
- AES-256-GCM credential encryption
- oauth-1.0a for Twitter request signing
