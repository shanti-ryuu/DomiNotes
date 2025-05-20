import { createClient } from '@supabase/supabase-js';

// Type definitions for our tables
export type NoteTable = {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
};

export type FolderTable = {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  user_id: string;
};

export type NoteFolderTable = {
  note_id: number;
  folder_id: number;
};

// Safely create Supabase client only when credentials are available
export const supabase = (function() {
  // Skip client creation during build process
  if (typeof window === 'undefined') {
    return null;
  }
  
  // During runtime, check for credentials
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Only create the client if both URL and key are available
  if (supabaseUrl && supabaseAnonKey) {
    try {
      return createClient(supabaseUrl, supabaseAnonKey);
    } catch (error) {
      console.error('Error initializing Supabase client:', error);
      return null;
    }
  }
  
  console.warn('Supabase credentials not found. Features requiring Supabase will not work.');
  return null;
})();

// Safe database function that checks if Supabase is available
export async function fetchNotesByUserId(userId: string): Promise<NoteTable[]> {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId);
      
    if (error) {
      console.error('Error fetching notes:', error);
      return [];
    }
    
    return data || [];
  } catch (e) {
    console.error('Exception fetching notes:', e);
    return [];
  }
}

export async function fetchFoldersByUserId(userId: string): Promise<FolderTable[]> {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', userId);
      
    if (error) {
      console.error('Error fetching folders:', error);
      return [];
    }
    
    return data || [];
  } catch (e) {
    console.error('Exception fetching folders:', e);
    return [];
  }
}

export async function fetchNotesByFolderId(folderId: number): Promise<NoteTable[]> {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return [];
  }
  
  try {
    const { data, error } = await supabase
      .from('note_folders')
      .select('note_id')
      .eq('folder_id', folderId);
      
    if (error) {
      console.error('Error fetching notes by folder:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    const noteIds = data.map(item => item.note_id);
    
    const { data: notes, error: notesError } = await supabase
      .from('notes')
      .select('*')
      .in('id', noteIds);
      
    if (notesError) {
      console.error('Error fetching notes by ids:', notesError);
      return [];
    }
    
    return notes || [];
  } catch (e) {
    console.error('Exception fetching notes by folder:', e);
    return [];
  }
}

export async function createNote(note: Omit<NoteTable, 'id' | 'created_at' | 'updated_at'>): Promise<NoteTable | null> {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return null;
  }
  
  try {
    const { data, error } = await supabase
      .from('notes')
      .insert([{
        ...note,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
      
    if (error) {
      console.error('Error creating note:', error);
      return null;
    }
    
    return data;
  } catch (e) {
    console.error('Exception creating note:', e);
    return null;
  }
}

export async function updateNote(id: number, note: Partial<Omit<NoteTable, 'id' | 'created_at' | 'updated_at'>>): Promise<NoteTable | null> {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return null;
  }
  
  try {
    const { data, error } = await supabase
      .from('notes')
      .update({
        ...note,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating note:', error);
      return null;
    }
    
    return data;
  } catch (e) {
    console.error('Exception updating note:', e);
    return null;
  }
}

export async function deleteNote(id: number): Promise<boolean> {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return false;
  }
  
  try {
    // First delete connections in note_folders
    const { error: relationError } = await supabase
      .from('note_folders')
      .delete()
      .eq('note_id', id);
      
    if (relationError) {
      console.error('Error deleting note relations:', relationError);
    }
    
    // Then delete the note
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting note:', error);
      return false;
    }
    
    return true;
  } catch (e) {
    console.error('Exception deleting note:', e);
    return false;
  }
}

export async function createFolder(folder: Omit<FolderTable, 'id' | 'created_at' | 'updated_at'>): Promise<FolderTable | null> {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return null;
  }
  
  try {
    const { data, error } = await supabase
      .from('folders')
      .insert([{
        ...folder,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
      
    if (error) {
      console.error('Error creating folder:', error);
      return null;
    }
    
    return data;
  } catch (e) {
    console.error('Exception creating folder:', e);
    return null;
  }
}

export async function updateFolder(id: number, folder: Partial<Omit<FolderTable, 'id' | 'created_at' | 'updated_at'>>): Promise<FolderTable | null> {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return null;
  }
  
  try {
    const { data, error } = await supabase
      .from('folders')
      .update({
        ...folder,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating folder:', error);
      return null;
    }
    
    return data;
  } catch (e) {
    console.error('Exception updating folder:', e);
    return null;
  }
}

export async function deleteFolder(id: number): Promise<boolean> {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return false;
  }
  
  try {
    // First delete connections in note_folders
    const { error: relationError } = await supabase
      .from('note_folders')
      .delete()
      .eq('folder_id', id);
      
    if (relationError) {
      console.error('Error deleting folder relations:', relationError);
    }
    
    // Then delete the folder
    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting folder:', error);
      return false;
    }
    
    return true;
  } catch (e) {
    console.error('Exception deleting folder:', e);
    return false;
  }
}

export async function addNoteToFolder(noteId: number, folderId: number): Promise<boolean> {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return false;
  }
  
  try {
    const { error } = await supabase
      .from('note_folders')
      .insert([{
        note_id: noteId,
        folder_id: folderId
      }]);
      
    if (error) {
      console.error('Error adding note to folder:', error);
      return false;
    }
    
    return true;
  } catch (e) {
    console.error('Exception adding note to folder:', e);
    return false;
  }
}

export async function removeNoteFromFolder(noteId: number, folderId: number): Promise<boolean> {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return false;
  }
  
  try {
    const { error } = await supabase
      .from('note_folders')
      .delete()
      .eq('note_id', noteId)
      .eq('folder_id', folderId);
      
    if (error) {
      console.error('Error removing note from folder:', error);
      return false;
    }
    
    return true;
  } catch (e) {
    console.error('Exception removing note from folder:', e);
    return false;
  }
}
