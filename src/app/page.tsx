import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { db, notes, folders } from '@/lib/db';
import { desc } from 'drizzle-orm';
import DashboardComponent from '@/components/dashboard/Dashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DomiNotes - Your Notes',
  description: 'Manage your notes and folders with DomiNotes',
};

async function getData() {
  // Fetch notes with their associated folders
  const allNotes = await db.query.notes.findMany({
    with: {
      folders: {
        with: {
          folder: true
        }
      }
    },
    orderBy: [desc(notes.updatedAt)]
  });

  // Fetch folders with their associated notes
  const allFolders = await db.query.folders.findMany({
    with: {
      notes: {
        with: {
          note: true
        }
      }
    },
    orderBy: folders.name
  });

  // Format the data for the frontend
  const formattedNotes = allNotes.map(note => ({
    ...note,
    folders: note.folders.map(nf => nf.folder)
  }));

  const formattedFolders = allFolders.map(folder => ({
    ...folder,
    notes: folder.notes.map(fn => fn.note)
  }));

  return {
    notes: formattedNotes,
    folders: formattedFolders
  };
}

export default async function Home() {
  try {
    // Check if user is authenticated by directly checking the cookie
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('authenticated');
    
    // Check authentication status
    if (authCookie?.value !== 'true') {
      // Redirect to login page if not authenticated
      redirect('/login');
    }
  } catch (error) {
    console.error('Authentication error:', error);
    redirect('/login');
  }
  
  // Fetch data
  const { notes, folders } = await getData();
  
  return (
    <div className="min-h-screen flex flex-col">
      <DashboardComponent initialNotes={notes} initialFolders={folders} />
    </div>
  );
}
