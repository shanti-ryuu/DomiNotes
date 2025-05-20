# DomiNotes

DomiNotes is a full-stack note-taking application built with Next.js, Drizzle ORM, and Neon PostgreSQL. It features a clean, responsive interface, offline support with automatic synchronization, and a simple 4-digit PIN authentication system. As a Progressive Web App (PWA), it can be installed on mobile devices and accessed offline.

## Features

- **PIN Authentication**: Simple 4-digit PIN to access your notes
- **Notes and Folders Management**: Create, edit, and delete notes and folders
- **Many-to-Many Relationships**: Assign notes to multiple folders
- **Responsive UI**: Works on desktop, tablet, and mobile devices
- **Offline Support**: Continue working even without internet connection
- **PWA Enabled**: Install on your home screen for app-like experience
- **Dark Mode Support**: Automatically adapts to your device preferences

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Neon PostgreSQL (serverless) with Drizzle ORM
- **Authentication**: Custom PIN-based authentication
- **State Management**: Zustand
- **Form Validation**: Zod
- **PWA**: next-pwa for offline capabilities

## Getting Started

### Prerequisites

- Node.js 18 or higher
- A Neon PostgreSQL database (or any PostgreSQL database)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/dominotes.git
cd dominotes
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file in the root directory (use `env.example` as a template):

```
DATABASE_URL=postgres://your-connection-string
```

4. Run the database migrations:

```bash
npm run db:generate
npm run db:push
```

5. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

### Initial Setup

When you first visit the application, you'll be prompted to create a 4-digit PIN. This PIN will be used for authentication in future sessions.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel and Install as PWA

### Deployment to Vercel

1. Push your code to a GitHub repository

2. Sign in to [Vercel](https://vercel.com/) and create a new project by importing your GitHub repository

3. Set up the required environment variables:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string

4. Click on "Deploy" and wait for the build to complete

5. Once deployed, you can access your application at the provided Vercel URL

### PWA Installation on Mobile Devices

DomiNotes is configured as a Progressive Web App, which means users can install it on their devices for an app-like experience:

#### Before Deployment

1. Generate app icons for the PWA:
   - Create icon files for all sizes specified in the `manifest.json` file (72×72 to 512×512)
   - Place these icons in the `/public/icons/` directory
   - You can use tools like [PWA Builder](https://www.pwabuilder.com/) or [Real Favicon Generator](https://realfavicongenerator.net/) to create these icons

#### Installing on Mobile

1. **iOS (Safari)**:
   - Visit the deployed app in Safari
   - Tap the share button (box with arrow)
   - Select "Add to Home Screen"
   - Confirm the app name and tap "Add"

2. **Android (Chrome)**:
   - Visit the deployed app in Chrome
   - A prompt may appear automatically to install the app
   - If not, tap the three-dot menu
   - Select "Install app" or "Add to Home Screen"

Once installed, DomiNotes will appear as an app icon on your device and can be used offline with automatic synchronization when back online.
