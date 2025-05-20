import { createClient } from '@supabase/supabase-js';

// Supabase client initialization
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a single supabase client for the entire app
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

// Database helper functions
export async function fetchNotesByUserId(userId: string) {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId);
    
  if (error) {
    console.error('Error fetching notes:', error);
    return [];
  }
  
  return data || [];
}

export async function fetchFoldersByUserId(userId: string) {
  const { data, error } = await supabase
    .from('folders')
    .select('*')
    .eq('user_id', userId);
    
  if (error) {
    console.error('Error fetching folders:', error);
    return [];
  }
  
  return data || [];
}

export async function fetchNotesByFolderId(folderId: number) {
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
}

export async function createNote(note: Omit<NoteTable, 'id' | 'created_at' | 'updated_at'>) {
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
    throw error;
  }
  
  return data;
}

export async function updateNote(id: number, note: Partial<Omit<NoteTable, 'id' | 'created_at' | 'updated_at'>>) {
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
    throw error;
  }
  
  return data;
}

export async function deleteNote(id: number) {
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
    throw error;
  }
  
  return true;
}

export async function createFolder(folder: Omit<FolderTable, 'id' | 'created_at' | 'updated_at'>) {
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
    throw error;
  }
  
  return data;
}

export async function updateFolder(id: number, folder: Partial<Omit<FolderTable, 'id' | 'created_at' | 'updated_at'>>) {
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
    throw error;
  }
  
  return data;
}

export async function deleteFolder(id: number) {
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
    throw error;
  }
  
  return true;
}

export async function addNoteToFolder(noteId: number, folderId: number) {
  const { error } = await supabase
    .from('note_folders')
    .insert([{
      note_id: noteId,
      folder_id: folderId
    }]);
    
  if (error) {
    console.error('Error adding note to folder:', error);
    throw error;
  }
  
  return true;
}

export async function removeNoteFromFolder(noteId: number, folderId: number) {
  const { error } = await supabase
    .from('note_folders')
    .delete()
    .eq('note_id', noteId)
    .eq('folder_id', folderId);
    
  if (error) {
    console.error('Error removing note from folder:', error);
    throw error;
  }
  
  return true;
}
