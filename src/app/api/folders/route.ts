import { NextResponse } from 'next/server';
import { db, folders } from '@/lib/db';
import { cookies } from 'next/headers';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// Schema for folder validation
const folderSchema = z.object({
  name: z.string().min(1, "Folder name is required")
});

// Get all folders
export async function GET() {
  // Check authentication
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('authenticated');
  
  if (authCookie?.value !== 'true') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const allFolders = await db.query.folders.findMany({
      with: {
        notes: {
          with: {
            note: true
          }
        }
      },
      orderBy: (folders, { asc }) => [asc(folders.name)]
    });

    // Transform the data for the frontend
    const formattedFolders = allFolders.map(folder => ({
      ...folder,
      notes: folder.notes.map(fn => fn.note)
    }));

    return NextResponse.json(formattedFolders);
  } catch (error) {
    console.error("Error fetching folders:", error);
    return NextResponse.json(
      { error: "Failed to fetch folders" },
      { status: 500 }
    );
  }
}

// Create a new folder
export async function POST(request: Request) {
  // Check authentication
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('authenticated');
  
  if (authCookie?.value !== 'true') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    // Validate the request body
    const result = folderSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid folder data", issues: result.error.issues },
        { status: 400 }
      );
    }
    
    const { name } = result.data;
    
    // Check if folder with the same name already exists
    const existingFolder = await db.query.folders.findFirst({
      where: eq(folders.name, name)
    });
    
    if (existingFolder) {
      return NextResponse.json(
        { error: "A folder with this name already exists" },
        { status: 409 }
      );
    }
    
    // Create the folder
    const [newFolder] = await db.insert(folders)
      .values({ name })
      .returning();
    
    return NextResponse.json(newFolder, { status: 201 });
  } catch (error) {
    console.error("Error creating folder:", error);
    return NextResponse.json(
      { error: "Failed to create folder" },
      { status: 500 }
    );
  }
}
