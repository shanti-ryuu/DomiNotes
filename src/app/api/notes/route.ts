import { NextResponse } from 'next/server';
import { db, Note, notes } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';

export const runtime = 'edge';

// Function to safely parse JSON
async function safeParseJSON(response: Response) {
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return { error: 'Failed to parse response' };
    }
  } else {
    const text = await response.text();
    console.error('Unexpected content type:', contentType, 'Content:', text);
    return { error: 'Unexpected response format' };
  }
}

// Helper to get user ID from cookies
function getUserId() {
  // For this example, we'll use a simple user ID from cookies
  // In a real app, you would use proper authentication
  return cookies().get('userId')?.value || 'anonymous-user';
}

// Schema for note validation
const noteSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string(),
  folderIds: z.array(z.number()).optional()
});

// Get all notes
export async function GET() {
  try {
    // Check authentication directly from cookies
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('authenticated');
    
    if (authCookie?.value !== 'true') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const allNotes = await db.query.notes.findMany({
      with: {
        folders: {
          with: {
            folder: true
          }
        }
      },
      orderBy: (notes, { desc }) => [desc(notes.updatedAt)]
    });

    // Transform the data to a more convenient format for the frontend
    const formattedNotes = allNotes.map(note => ({
      ...note,
      folders: note.folders.map(nf => nf.folder)
    }));

    return NextResponse.json(formattedNotes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

// Create a new note
export async function POST(request: Request) {
  try {
    // Check authentication directly from cookies
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('authenticated');
    
    if (authCookie?.value !== 'true') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    // Validate the request body
    const result = noteSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid note data", issues: result.error.issues },
        { status: 400 }
      );
    }
    
    const { title, content, folderIds } = result.data;
    
    // Create the note
    const [newNote] = await db.insert(notes)
      .values({ title, content })
      .returning();
    
    // If folder IDs are provided, create the relationships
    if (folderIds && folderIds.length > 0) {
      const relationships = folderIds.map(folderId => ({
        noteId: newNote.id,
        folderId
      }));
      
      await db.insert(notesAndFolders).values(relationships);
    }
    
    return NextResponse.json(newNote, { status: 201 });
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }
}
