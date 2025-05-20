# DomiNotes

DomiNotes is a full-stack note-taking application built with Next.js, Drizzle ORM, and Neon PostgreSQL. It features a clean, responsive interface, offline support with automatic synchronization, and a simple 4-digit PIN authentication system.

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

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
