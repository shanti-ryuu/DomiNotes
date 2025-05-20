import { NextRequest, NextResponse } from 'next/server';
import { db, folders, notesAndFolders } from '@/lib/db';
import { cookies } from 'next/headers';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// Schema for folder update validation
const folderUpdateSchema = z.object({
  name: z.string().min(1, "Folder name is required").optional(),
  noteIds: z.array(z.number()).optional()
});

// Get a specific folder
export async function GET(
  request: Request,
  context: { params: { id: string } }
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
        { error: "Invalid folder ID" },
        { status: 400 }
      );
    }

    const folder = await db.query.folders.findFirst({
      where: eq(folders.id, id),
      with: {
        notes: {
          with: {
            note: true
          }
        }
      }
    });
    
    if (!folder) {
      return NextResponse.json(
        { error: "Folder not found" },
        { status: 404 }
      );
    }
    
    // Transform the data for the frontend
    const formattedFolder = {
      ...folder,
      notes: folder.notes.map(fn => fn.note)
    };

    return NextResponse.json(formattedFolder);
  } catch (error) {
    console.error("Error fetching folder:", error);
    return NextResponse.json(
      { error: "Failed to fetch folder" },
      { status: 500 }
    );
  }
}

// Update a folder
export async function PUT(
  request: Request,
  context: { params: { id: string } }
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
        { error: "Invalid folder ID" },
        { status: 400 }
      );
    }
    
    // Check if folder exists
    const existingFolder = await db.query.folders.findFirst({
      where: eq(folders.id, id)
    });
    
    if (!existingFolder) {
      return NextResponse.json(
        { error: "Folder not found" },
        { status: 404 }
      );
    }
    
    const body = await request.json();
    
    // Validate the request body
    const result = folderUpdateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid folder data", issues: result.error.issues },
        { status: 400 }
      );
    }
    
    const { name, noteIds } = result.data;
    
    // Update the folder name if provided
    if (name !== undefined) {
      // Check if another folder with this name already exists
      const duplicateFolder = await db.query.folders.findFirst({
        where: eq(folders.name, name),
      });
      
      if (duplicateFolder && duplicateFolder.id !== id) {
        return NextResponse.json(
          { error: "A folder with this name already exists" },
          { status: 409 }
        );
      }
      
      await db.update(folders)
        .set({ 
          name,
          updatedAt: new Date()
        })
        .where(eq(folders.id, id));
    }
    
    // If note IDs are provided, update the relationships
    if (noteIds !== undefined) {
      // Remove existing relationships
      await db.delete(notesAndFolders)
        .where(eq(notesAndFolders.folderId, id));
      
      // Add new relationships
      if (noteIds.length > 0) {
        const relationships = noteIds.map(noteId => ({
          noteId,
          folderId: id
        }));
        
        await db.insert(notesAndFolders).values(relationships);
      }
    }
    
    // Fetch the updated folder with its relationships
    const updatedFolder = await db.query.folders.findFirst({
      where: eq(folders.id, id),
      with: {
        notes: {
          with: {
            note: true
          }
        }
      }
    });
    
    // Transform the data for the frontend
    const formattedFolder = {
      ...updatedFolder,
      notes: updatedFolder?.notes.map(fn => fn.note) || []
    };
    
    return NextResponse.json(formattedFolder);
  } catch (error) {
    console.error("Error updating folder:", error);
    return NextResponse.json(
      { error: "Failed to update folder" },
      { status: 500 }
    );
  }
}

// Delete a folder
export async function DELETE(
  request: Request,
  context: { params: { id: string } }
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
        { error: "Invalid folder ID" },
        { status: 400 }
      );
    }
    
    // Check if folder exists
    const existingFolder = await db.query.folders.findFirst({
      where: eq(folders.id, id)
    });
    
    if (!existingFolder) {
      return NextResponse.json(
        { error: "Folder not found" },
        { status: 404 }
      );
    }
    
    // Delete the folder (relationships will be automatically deleted due to CASCADE)
    await db.delete(folders).where(eq(folders.id, id));
    
    return NextResponse.json(
      { message: "Folder deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting folder:", error);
    return NextResponse.json(
      { error: "Failed to delete folder" },
      { status: 500 }
    );
  }
}
