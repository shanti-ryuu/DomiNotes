import { NextResponse } from 'next/server';
import { db, notes, notesAndFolders } from '@/lib/db';
import { cookies } from 'next/headers';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// Schema for note update validation
const noteUpdateSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  content: z.string().optional(),
  folderIds: z.array(z.number()).optional()
});

// Get a specific note
export async function GET(
  request: Request,
  context: { params: Record<string, string> }
) {
  // Check authentication
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('authenticated');
  
  if (authCookie?.value !== 'true') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const id = parseInt(context.params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid note ID" },
        { status: 400 }
      );
    }

    const note = await db.query.notes.findFirst({
      where: eq(notes.id, id),
      with: {
        folders: {
          with: {
            folder: true
          }
        }
      }
    });
    
    if (!note) {
      return NextResponse.json(
        { error: "Note not found" },
        { status: 404 }
      );
    }
    
    // Transform the data for the frontend
    const formattedNote = {
      ...note,
      folders: note.folders.map(nf => nf.folder)
    };

    return NextResponse.json(formattedNote);
  } catch (error) {
    console.error("Error fetching note:", error);
    return NextResponse.json(
      { error: "Failed to fetch note" },
      { status: 500 }
    );
  }
}

// Update a note
export async function PUT(
  request: Request,
  context: { params: Record<string, string> }
) {
  // Check authentication
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('authenticated');
  
  if (authCookie?.value !== 'true') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const id = parseInt(context.params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid note ID" },
        { status: 400 }
      );
    }
    
    // Check if note exists
    const existingNote = await db.query.notes.findFirst({
      where: eq(notes.id, id)
    });
    
    if (!existingNote) {
      return NextResponse.json(
        { error: "Note not found" },
        { status: 404 }
      );
    }
    
    const body = await request.json();
    
    // Validate the request body
    const result = noteUpdateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid note data", issues: result.error.issues },
        { status: 400 }
      );
    }
    
    const { title, content, folderIds } = result.data;
    
    // Update the note
    if (title !== undefined || content !== undefined) {
      await db.update(notes)
        .set({ 
          ...(title !== undefined ? { title } : {}),
          ...(content !== undefined ? { content } : {}),
          updatedAt: new Date()
        })
        .where(eq(notes.id, id));
    }
    
    // If folder IDs are provided, update the relationships
    if (folderIds !== undefined) {
      // Remove existing relationships
      await db.delete(notesAndFolders)
        .where(eq(notesAndFolders.noteId, id));
      
      // Add new relationships
      if (folderIds.length > 0) {
        const relationships = folderIds.map(folderId => ({
          noteId: id,
          folderId
        }));
        
        await db.insert(notesAndFolders).values(relationships);
      }
    }
    
    // Fetch the updated note with its relationships
    const updatedNote = await db.query.notes.findFirst({
      where: eq(notes.id, id),
      with: {
        folders: {
          with: {
            folder: true
          }
        }
      }
    });
    
    // Transform the data for the frontend
    const formattedNote = {
      ...updatedNote,
      folders: updatedNote?.folders.map(nf => nf.folder) || []
    };
    
    return NextResponse.json(formattedNote);
  } catch (error) {
    console.error("Error updating note:", error);
    return NextResponse.json(
      { error: "Failed to update note" },
      { status: 500 }
    );
  }
}

// Delete a note
export async function DELETE(
  request: Request,
  context: { params: Record<string, string> }
) {
  // Check authentication
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('authenticated');
  
  if (authCookie?.value !== 'true') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const id = parseInt(context.params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid note ID" },
        { status: 400 }
      );
    }
    
    // Check if note exists
    const existingNote = await db.query.notes.findFirst({
      where: eq(notes.id, id)
    });
    
    if (!existingNote) {
      return NextResponse.json(
        { error: "Note not found" },
        { status: 404 }
      );
    }
    
    // Delete the note (relationships will be automatically deleted due to CASCADE)
    await db.delete(notes).where(eq(notes.id, id));
    
    return NextResponse.json(
      { message: "Note deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 }
    );
  }
}
